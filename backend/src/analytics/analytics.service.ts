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
        [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('totalAmount')), 'totalAmount'],
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
        [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('totalAmount')), 'totalAmount'],
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
          this.productModel.sequelize.col('lowStockAlert')
        ),
      },
    });

    // Recent sales
    const recentSales = await this.saleModel.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'receiptNumber', 'totalAmount', 'createdAt'],
    });

    const todaysData = todaysSalesResult[0] as any;
    const monthData = monthSalesResult[0] as any;

    return {
      todaySales: Number(todaysData?.totalAmount) || 0,
      todayOrders: Number(todaysData?.count) || 0,
      monthSales: Number(monthData?.totalAmount) || 0,
      monthOrders: Number(monthData?.count) || 0,
      totalProducts,
      lowStockProducts,
      recentSales,
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

    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalOrders = sales.length;

    // Create breakdown based on period
    let breakdown = [];
    if (period === 'today') {
      // Hourly breakdown
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

        const hourlySales = sales.filter(
          sale => sale.createdAt >= hourStart && sale.createdAt < hourEnd
        );

        breakdown.push({
          period: hour,
          sales: hourlySales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
          orders: hourlySales.length,
        });
      }
    } else {
      // Daily breakdown for week/month
      const days = period === 'week' ? 7 : 30;
      for (let day = 0; day < days; day++) {
        const dayStart = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dailySales = sales.filter(
          sale => sale.createdAt >= dayStart && sale.createdAt < dayEnd
        );

        breakdown.push({
          date: dayStart.toISOString().split('T')[0],
          sales: dailySales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
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
        [this.saleItemModel.sequelize.fn('SUM', this.saleItemModel.sequelize.col('totalAmount')), 'totalRevenue'],
      ],
      group: ['productId'],
      order: [[this.saleItemModel.sequelize.col('totalQuantity'), 'DESC']],
      limit,
      raw: true,
    });

    return await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await this.productModel.findOne({
          where: { id: item.productId },
          attributes: ['name', 'price'],
          raw: true,
        });

        return {
          product,
          totalQuantity: Number(item.totalQuantity),
          totalRevenue: Number(item.totalRevenue),
        };
      })
    );
  }

  async getTopCustomers(limit: number = 10) {
    const topCustomers = await this.saleModel.findAll({
      where: { customerId: { [Op.ne]: null } },
      attributes: [
        'customerId',
        [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('totalAmount')), 'totalSpent'],
        [this.saleModel.sequelize.fn('COUNT', '*'), 'totalOrders'],
      ],
      group: ['customerId'],
      order: [[this.saleModel.sequelize.col('totalSpent'), 'DESC']],
      limit,
      raw: true,
    });

    return await Promise.all(
      topCustomers.map(async (item: any) => {
        const customer = await this.customerModel.findOne({
          where: { id: item.customerId },
          attributes: ['name', 'phone'],
          raw: true,
        });

        return {
          customer,
          totalSpent: Number(item.totalSpent),
          totalOrders: Number(item.totalOrders),
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
          [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('totalAmount')), 'totalAmount'],
        ],
        raw: true,
      });

      dailyTrends.push({
        date: startOfDay.toISOString().split('T')[0],
        revenue: Number(dailySales[0]?.totalAmount) || 0,
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
          [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('totalAmount')), 'totalAmount'],
        ],
        raw: true,
      });

      weeklyTrends.push({
        week: `Week of ${weekStart.toISOString().split('T')[0]}`,
        revenue: Number(weeklySales[0]?.totalAmount) || 0,
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
          [this.saleModel.sequelize.fn('SUM', this.saleModel.sequelize.col('totalAmount')), 'totalAmount'],
        ],
        raw: true,
      });

      monthlyTrends.push({
        month: monthStart.toISOString().substring(0, 7),
        revenue: Number(monthlySales[0]?.totalAmount) || 0,
      });
    }

    return {
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends,
    };
  }
}
