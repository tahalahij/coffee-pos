import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from '../sales/models/sale.model';
import { Product } from '../products/models/product.model';
import { SaleItem } from '../sales/models/sale-item.model';
import { Customer } from '../customers/models/customer.model';
import { Op } from 'sequelize';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sale) private saleModel: typeof Sale,
    @InjectModel(Product) private productModel: typeof Product,
    @InjectModel(SaleItem) private saleItemModel: typeof SaleItem,
    @InjectModel(Customer) private customerModel: typeof Customer,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's sales aggregation
    const todaysSalesResult = await this.saleModel.findAll({
      where: {
        createdAt: { [Op.gte]: startOfDay },
        status: 'COMPLETED',
      },
      attributes: [
        [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('total_amount')), 'totalAmount'],
        [this.saleModel.sequelize.fn('COUNT', '*'), 'count'],
      ],
      raw: true,
    });

    // Month's sales aggregation
    const monthSalesResult = await this.saleModel.findAll({
      where: {
        createdAt: { [Op.gte]: startOfMonth },
        status: 'COMPLETED',
      },
      attributes: [
        [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('total_amount')), 'totalAmount'],
        [this.saleModel.sequelize.fn('COUNT', '*'), 'count'],
      ],
      raw: true,
    });

    // Total products
    const totalProducts = await this.productModel.count();

    // Low stock products
    const lowStockProducts = await this.productModel.count({
      where: {
        lowStockAlert: { [Op.ne]: null },
        [Op.and]: this.productModel.sequelize.where(
          this.productModel.sequelize.col('stock'),
          Op.lte,
          this.productModel.sequelize.col('low_stock_alert')
        ),
      },
    });

    // Recent sales - handle empty results
    const recentSales = await this.saleModel.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'receiptNumber', 'totalAmount', 'createdAt'],
    });

    // Handle null/undefined aggregation results when no sales exist
    const todaysData = (todaysSalesResult && todaysSalesResult.length > 0) ? todaysSalesResult[0] as any : {};
    const monthData = (monthSalesResult && monthSalesResult.length > 0) ? monthSalesResult[0] as any : {};

    return {
      todaySales: Number(todaysData?.totalAmount) || 0,
      todayOrders: Number(todaysData?.count) || 0,
      monthSales: Number(monthData?.totalAmount) || 0,
      monthOrders: Number(monthData?.count) || 0,
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProducts || 0,
      recentSales: recentSales || [],
    };
  }

  async getSalesAnalytics(period: 'today' | 'week' | 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        throw new NotFoundException('Invalid period specified');
    }

    const sales = await this.saleModel.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
        status: 'COMPLETED',
      },
      attributes: ['totalAmount', 'createdAt'],
    });

    // Handle empty sales array
    const safeSales = sales || [];
    const totalSales = safeSales.length > 0 
      ? safeSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0)
      : 0;
    const totalOrders = safeSales.length;

    // Create breakdown based on period
    let breakdown = [];
    if (period === 'today') {
      // Hourly breakdown
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

        const hourlySales = safeSales.filter(
          sale => sale.createdAt >= hourStart && sale.createdAt < hourEnd
        );

        breakdown.push({
          period: hour,
          sales: hourlySales.length > 0 
            ? hourlySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0)
            : 0,
          orders: hourlySales.length,
        });
      }
    } else {
      // Daily breakdown for week/month
      const days = period === 'week' ? 7 : 30;
      for (let day = 0; day < days; day++) {
        const dayStart = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dailySales = safeSales.filter(
          sale => sale.createdAt >= dayStart && sale.createdAt < dayEnd
        );

        breakdown.push({
          date: dayStart.toISOString().split('T')[0],
          sales: dailySales.length > 0 
            ? dailySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0)
            : 0,
          orders: dailySales.length,
        });
      }
    }

    return {
      totalSales,
      totalOrders,
      [period === 'today' ? 'hourlyBreakdown' : 'dailyBreakdown']: breakdown,
    };
  }

  async getTopProducts(limit: number = 10) {
    const topProducts = await this.saleItemModel.findAll({
      attributes: [
        'productId',
        [this.saleItemModel.sequelize.fn('SUM', this.saleItemModel.sequelize.col('quantity')), 'totalQuantity'],
        [this.saleItemModel.sequelize.fn('SUM', this.saleItemModel.sequelize.col('total_amount')), 'totalRevenue'],
      ],
      group: ['productId'],
      order: [[this.saleItemModel.sequelize.col('totalQuantity'), 'DESC']],
      limit,
      raw: true,
    });

    // Handle case where no sale items exist
    if (!topProducts || topProducts.length === 0) {
      return [];
    }

    return await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await this.productModel.findOne({
          where: { id: item.productId },
          attributes: ['name', 'price'],
          raw: true,
        });

        return {
          product: product || { name: 'Unknown Product', price: 0 },
          totalQuantity: Number(item.totalQuantity) || 0,
          totalRevenue: Number(item.totalRevenue) || 0,
        };
      })
    );
  }

  async getTopCustomers(limit: number = 10) {
    const topCustomers = await this.saleModel.findAll({
      where: { customerId: { [Op.ne]: null } },
      attributes: [
        'customerId',
        [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('total_amount')), 'totalSpent'],
        [this.saleModel.sequelize.fn('COUNT', '*'), 'totalOrders'],
      ],
      group: ['customerId'],
      order: [[this.saleModel.sequelize.col('totalSpent'), 'DESC']],
      limit,
      raw: true,
    });

    // Handle case where no customer sales exist
    if (!topCustomers || topCustomers.length === 0) {
      return [];
    }

    return await Promise.all(
      topCustomers.map(async (item: any) => {
        const customer = await this.customerModel.findOne({
          where: { id: item.customerId },
          attributes: ['name', 'phone'],
          raw: true,
        });

        return {
          customer: customer || { name: 'Unknown Customer', phone: null },
          totalSpent: Number(item.totalSpent) || 0,
          totalOrders: Number(item.totalOrders) || 0,
        };
      })
    );
  }

  async getRevenueTrends() {
    const now = new Date();

    // Daily trends (last 30 days)
    const dailyTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dailySales = await this.saleModel.findAll({
        where: {
          createdAt: { [Op.gte]: startOfDay, [Op.lt]: endOfDay },
          status: 'COMPLETED',
        },
        attributes: [
          [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('total_amount')), 'totalAmount'],
        ],
        raw: true,
      });

      dailyTrends.push({
        date: startOfDay.toISOString().split('T')[0],
        revenue: (dailySales && dailySales.length > 0) ? (Number(dailySales[0]?.totalAmount) || 0) : 0,
      });
    }

    // Weekly trends (last 12 weeks)
    const weeklyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weeklySales = await this.saleModel.findAll({
        where: {
          createdAt: { [Op.gte]: weekStart, [Op.lt]: weekEnd },
          status: 'COMPLETED',
        },
        attributes: [
          [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('total_amount')), 'totalAmount'],
        ],
        raw: true,
      });

      weeklyTrends.push({
        week: `Week of ${weekStart.toISOString().split('T')[0]}`,
        revenue: (weeklySales && weeklySales.length > 0) ? (Number(weeklySales[0]?.totalAmount) || 0) : 0,
      });
    }

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlySales = await this.saleModel.findAll({
        where: {
          createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
          status: 'COMPLETED',
        },
        attributes: [
          [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('total_amount')), 'totalAmount'],
        ],
        raw: true,
      });

      monthlyTrends.push({
        month: monthStart.toISOString().substring(0, 7),
        revenue: (monthlySales && monthlySales.length > 0) ? (Number(monthlySales[0]?.totalAmount) || 0) : 0,
      });
    }

    return {
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends,
    };
  }
}
