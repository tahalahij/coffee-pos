import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todaySales, monthSales, totalProducts, lowStockProducts, recentSales] = await Promise.all([
      // Today's sales
      this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // This month's sales
      this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Total products
      this.prisma.product.count({
        where: { isAvailable: true },
      }),

      // Low stock products - Fixed query
      this.prisma.product.count({
        where: {
          AND: [
            { lowStockAlert: { not: null } },
            {
              OR: [
                { stock: { lte: 10 } }, // Default low stock threshold
              ]
            }
          ],
        },
      }),

      // Recent sales
      this.prisma.sale.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      todaySales: Number(todaySales._sum.totalAmount || 0),
      todayOrders: todaySales._count,
      monthSales: Number(monthSales._sum.totalAmount || 0),
      monthOrders: monthSales._count,
      totalProducts,
      lowStockProducts,
      recentSales,
    };
  }

  async getSalesAnalytics(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const dailySales = this.groupSalesByDate(sales);
    const topProducts = this.getTopSellingProducts(sales);
    const categoryBreakdown = this.getCategoryBreakdown(sales);
    const paymentMethodBreakdown = this.getPaymentMethodBreakdown(sales);

    return {
      dailySales,
      topProducts,
      categoryBreakdown,
      paymentMethodBreakdown,
      totalRevenue: sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
      totalOrders: sales.length,
      averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0) / sales.length : 0,
    };
  }

  async getProductPerformance() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        saleItems: {
          where: {
            sale: {
              status: 'COMPLETED'
            }
          }
        },
      },
    });

    return products.map(product => {
      const totalSold = product.saleItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = product.saleItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: Number(product.price),
        stock: product.stock,
        totalSold,
        totalRevenue,
        profitMargin: product.cost ? ((Number(product.price) - Number(product.cost)) / Number(product.price)) * 100 : null,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async getInventoryReport() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
      },
    });

    const totalInventoryValue = products.reduce((sum, product) => {
      const cost = Number(product.cost || 0);
      return sum + (cost * product.stock);
    }, 0);

    const lowStockProducts = products.filter(product =>
      product.lowStockAlert && product.stock <= product.lowStockAlert
    );

    const outOfStockProducts = products.filter(product => product.stock === 0);

    return {
      totalProducts: products.length,
      totalInventoryValue,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category.name,
        stock: product.stock,
        cost: Number(product.cost || 0),
        inventoryValue: (Number(product.cost || 0)) * product.stock,
        lowStockAlert: product.lowStockAlert,
        isLowStock: product.lowStockAlert ? product.stock <= product.lowStockAlert : false,
      })),
    };
  }

  private groupSalesByDate(sales: any[]) {
    const dailySales = new Map();

    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      const existing = dailySales.get(date) || { date, sales: 0, orders: 0 };

      existing.sales += Number(sale.totalAmount);
      existing.orders += 1;
      dailySales.set(date, existing);
    });

    return Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private getTopSellingProducts(sales: any[]) {
    const productStats = new Map();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.id;
        const existing = productStats.get(productId) || {
          product: item.product,
          quantity: 0,
          revenue: 0,
        };

        existing.quantity += item.quantity;
        existing.revenue += Number(item.totalAmount);
        productStats.set(productId, existing);
      });
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private getCategoryBreakdown(sales: any[]) {
    const categoryStats = new Map();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const categoryName = item.product.category.name;
        const existing = categoryStats.get(categoryName) || {
          category: categoryName,
          revenue: 0,
          quantity: 0,
        };

        existing.revenue += Number(item.totalAmount);
        existing.quantity += item.quantity;
        categoryStats.set(categoryName, existing);
      });
    });

    return Array.from(categoryStats.values())
      .sort((a, b) => b.revenue - a.revenue);
  }

  private getPaymentMethodBreakdown(sales: any[]) {
    const paymentStats = {
      CASH: { count: 0, amount: 0 },
      CARD: { count: 0, amount: 0 },
      DIGITAL: { count: 0, amount: 0 },
    };

    sales.forEach(sale => {
      paymentStats[sale.paymentMethod].count += 1;
      paymentStats[sale.paymentMethod].amount += Number(sale.totalAmount);
    });

    return paymentStats;
  }
}
