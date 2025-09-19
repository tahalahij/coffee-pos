import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto, UpdateSaleDto, SalesSummaryDto } from './dto/sale.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    // Validate products exist and have sufficient stock
    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId);
      if (!product.isAvailable) {
        throw new BadRequestException(`Product ${product.name} is not available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
    }

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Create sale with items in a transaction
    const sale = await this.prisma.$transaction(async (prisma) => {
      // Create the sale
      const newSale = await prisma.sale.create({
        data: {
          receiptNumber,
          customerId: createSaleDto.customerId,
          subtotal: createSaleDto.subtotal,
          taxAmount: createSaleDto.taxAmount || 0,
          discountAmount: createSaleDto.discountAmount || 0,
          totalAmount: createSaleDto.totalAmount,
          paymentMethod: createSaleDto.paymentMethod,
          cashReceived: createSaleDto.cashReceived,
          changeGiven: createSaleDto.changeGiven,
          notes: createSaleDto.notes,
          status: 'COMPLETED',
        },
      });

      // Create sale items and update stock
      for (const item of createSaleDto.items) {
        const totalAmount = item.unitPrice * item.quantity - (item.discountAmount || 0);

        await prisma.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            totalAmount,
          },
        });

        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newSale;
    });

    // Return sale with items
    return this.findOne(sale.id);
  }

  async findAll(summaryDto?: SalesSummaryDto) {
    const where: any = {};

    if (summaryDto?.startDate && summaryDto?.endDate) {
      where.createdAt = {
        gte: new Date(summaryDto.startDate),
        lte: new Date(summaryDto.endDate),
      };
    }

    if (summaryDto?.paymentMethod) {
      where.paymentMethod = summaryDto.paymentMethod;
    }

    if (summaryDto?.status) {
      where.status = summaryDto.status;
    }

    return this.prisma.sale.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
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

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async refund(id: string, reason?: string) {
    const sale = await this.findOne(id);

    if (sale.status === 'REFUNDED') {
      throw new BadRequestException('Sale is already refunded');
    }

    if (sale.status === 'CANCELLED') {
      throw new BadRequestException('Cannot refund a cancelled sale');
    }

    // Refund stock and update sale status in transaction
    return this.prisma.$transaction(async (prisma) => {
      // Restore stock for each item
      for (const item of sale.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update sale status
      return prisma.sale.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          notes: reason ? `${sale.notes || ''}\nRefund reason: ${reason}` : sale.notes,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async getDailySummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const summary = {
      totalSales: sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
      totalOrders: sales.length,
      averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0) / sales.length : 0,
      paymentMethods: {
        cash: sales.filter(s => s.paymentMethod === 'CASH').length,
        card: sales.filter(s => s.paymentMethod === 'CARD').length,
        digital: sales.filter(s => s.paymentMethod === 'DIGITAL').length,
      },
      topProducts: this.getTopProducts(sales),
      hourlySales: this.getHourlySales(sales),
    };

    return summary;
  }

  private async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastSale = await this.prisma.sale.findFirst({
      where: {
        receiptNumber: {
          startsWith: `RCP-${dateStr}`,
        },
      },
      orderBy: {
        receiptNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.receiptNumber.split('-')[2]) || 0;
      sequence = lastSequence + 1;
    }

    return `RCP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  private getTopProducts(sales: any[]) {
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

  private getHourlySales(sales: any[]) {
    const hourlySales = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sales: 0,
      orders: 0,
    }));

    sales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      hourlySales[hour].sales += Number(sale.totalAmount);
      hourlySales[hour].orders += 1;
    });

    return hourlySales;
  }
}
