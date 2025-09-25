import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's sales
    const todaysSales = await this.prisma.sale.aggregate({
      where: {
        createdAt: { gte: startOfDay },
        status: 'COMPLETED',
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    // Month's sales
    const monthSales = await this.prisma.sale.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED',
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    // Total products
    const totalProducts = await this.prisma.product.count();

    // Low stock products - Use a simpler approach that works reliably
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        stock: true,
        lowStockAlert: true,
      },
    });

    const lowStockProducts = products.filter(product =>
      product.lowStockAlert !== null &&
      product.stock <= product.lowStockAlert
    ).length;

    // Recent sales
    const recentSales = await this.prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        receiptNumber: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    return {
      todaySales: Number(todaysSales._sum.totalAmount) || 0,
      todayOrders: todaysSales._count || 0,
      monthSales: Number(monthSales._sum.totalAmount) || 0,
      monthOrders: monthSales._count || 0,
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

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
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
    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalAmount: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });

        return {
          product,
          totalQuantity: item._sum.quantity,
          totalRevenue: Number(item._sum.totalAmount),
        };
      })
    );

    return productsWithDetails;
  }

  async getTopCustomers(limit: number = 10) {
    const topCustomers = await this.prisma.sale.groupBy({
      by: ['customerId'],
      where: { customerId: { not: null } },
      _sum: { totalAmount: true },
      _count: true,
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    const customersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const customer = await this.prisma.customer.findUnique({
          where: { id: item.customerId! },
          select: { name: true, phone: true },
        });

        return {
          customer,
          totalSpent: Number(item._sum.totalAmount),
          totalOrders: item._count,
        };
      })
    );

    return customersWithDetails;
  }

  async getRevenueTrends() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Daily trends (last 30 days)
    const dailyTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dailySales = await this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      });

      dailyTrends.push({
        date: startOfDay.toISOString().split('T')[0],
        revenue: Number(dailySales._sum.totalAmount) || 0,
      });
    }

    // Weekly trends (last 12 weeks)
    const weeklyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weeklySales = await this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: weekStart, lt: weekEnd },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      });

      weeklyTrends.push({
        week: `Week of ${weekStart.toISOString().split('T')[0]}`,
        revenue: Number(weeklySales._sum.totalAmount) || 0,
      });
    }

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlySales = await this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      });

      monthlyTrends.push({
        month: monthStart.toISOString().substring(0, 7),
        revenue: Number(monthlySales._sum.totalAmount) || 0,
      });
    }

    return {
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends,
    };
  }
}
