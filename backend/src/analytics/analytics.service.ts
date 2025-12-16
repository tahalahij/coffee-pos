import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from '../sales/models/sale.model';
import { Product, ProductDocument } from '../products/models/product.model';
import { Customer, CustomerDocument } from '../customers/models/customer.model';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's sales aggregation
    const todaysSalesResult = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Month's sales aggregation
    const monthSalesResult = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total products
    const totalProducts = await this.productModel.countDocuments();

    // Low stock products
    const lowStockProducts = await this.productModel.countDocuments({
      lowStockAlert: { $ne: null },
      $expr: { $lte: ['$stock', '$lowStockAlert'] },
    });

    // Recent sales
    const recentSales = await this.saleModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('receiptNumber totalAmount createdAt')
      .lean();

    const todaysData = todaysSalesResult[0] || {};
    const monthData = monthSalesResult[0] || {};

    return {
      todaySales: Number(todaysData.totalAmount) || 0,
      todayOrders: Number(todaysData.count) || 0,
      monthSales: Number(monthData.totalAmount) || 0,
      monthOrders: Number(monthData.count) || 0,
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

    const sales = await this.saleModel
      .find({
        createdAt: { $gte: startDate },
        status: 'COMPLETED',
      })
      .select('totalAmount createdAt')
      .lean();

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
          sale => new Date(sale.createdAt) >= hourStart && new Date(sale.createdAt) < hourEnd
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
          sale => new Date(sale.createdAt) >= dayStart && new Date(sale.createdAt) < dayEnd
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
    // Use aggregation to get top products from embedded sale items
    const topProducts = await this.saleModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalAmount' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    if (!topProducts || topProducts.length === 0) {
      return [];
    }

    return await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await this.productModel
          .findById(item._id)
          .select('name price')
          .lean();

        return {
          product: product || { name: 'Unknown Product', price: 0 },
          totalQuantity: Number(item.totalQuantity) || 0,
          totalRevenue: Number(item.totalRevenue) || 0,
        };
      })
    );
  }

  async getTopCustomers(limit: number = 10) {
    const topCustomers = await this.saleModel.aggregate([
      { $match: { customerId: { $ne: null } } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
    ]);

    if (!topCustomers || topCustomers.length === 0) {
      return [];
    }

    return await Promise.all(
      topCustomers.map(async (item: any) => {
        const customer = await this.customerModel
          .findById(item._id)
          .select('name phone')
          .lean();

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

    // Daily trends (last 30 days) - use aggregation for efficiency
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyAggregation = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create daily trends with all 30 days (fill missing days with 0)
    const dailyTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyAggregation.find(d => d._id === dateStr);
      dailyTrends.push({
        date: dateStr,
        revenue: found ? Number(found.revenue) : 0,
      });
    }

    // Weekly trends (last 12 weeks)
    const weeklyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weeklySales = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: { $gte: weekStart, $lt: weekEnd },
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]);

      weeklyTrends.push({
        week: `Week of ${weekStart.toISOString().split('T')[0]}`,
        revenue: weeklySales.length > 0 ? Number(weeklySales[0].totalAmount) : 0,
      });
    }

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlySales = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lt: monthEnd },
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]);

      monthlyTrends.push({
        month: monthStart.toISOString().substring(0, 7),
        revenue: monthlySales.length > 0 ? Number(monthlySales[0].totalAmount) : 0,
      });
    }

    return {
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends,
    };
  }
}
