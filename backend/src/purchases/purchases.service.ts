import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dto/purchase.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    // Validate products exist
    for (const item of createPurchaseDto.items) {
      await this.productsService.findOne(item.productId);
    }

    // Create purchase with items in a transaction
    const purchase = await this.prisma.$transaction(async (prisma) => {
      const newPurchase = await prisma.purchase.create({
        data: {
          supplierName: createPurchaseDto.supplierName,
          supplierContact: createPurchaseDto.supplierContact,
          totalAmount: createPurchaseDto.totalAmount,
          notes: createPurchaseDto.notes,
          status: 'PENDING',
        },
      });

      // Create purchase items
      for (const item of createPurchaseDto.items) {
        const totalCost = item.unitCost * item.quantity;

        await prisma.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost,
          },
        });
      }

      return newPurchase;
    });

    return this.findOne(purchase.id);
  }

  async findAll() {
    return this.prisma.purchase.findMany({
      include: {
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
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
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

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.purchase.update({
      where: { id },
      data: updatePurchaseDto,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async markAsReceived(id: string) {
    const purchase = await this.findOne(id);

    if (purchase.status === 'RECEIVED') {
      throw new BadRequestException('Purchase is already marked as received');
    }

    if (purchase.status === 'CANCELLED') {
      throw new BadRequestException('Cannot receive a cancelled purchase');
    }

    // Update stock and mark as received in transaction
    return this.prisma.$transaction(async (prisma) => {
      // Update stock for each item
      for (const item of purchase.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
            cost: item.unitCost, // Update product cost with latest purchase cost
          },
        });
      }

      // Update purchase status
      return prisma.purchase.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
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

  async cancel(id: string, reason?: string) {
    const purchase = await this.findOne(id);

    if (purchase.status === 'RECEIVED') {
      throw new BadRequestException('Cannot cancel a received purchase');
    }

    if (purchase.status === 'CANCELLED') {
      throw new BadRequestException('Purchase is already cancelled');
    }

    return this.prisma.purchase.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${purchase.notes || ''}\nCancellation reason: ${reason}` : purchase.notes,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const purchase = await this.findOne(id);

    if (purchase.status === 'RECEIVED') {
      throw new BadRequestException('Cannot delete a received purchase');
    }

    return this.prisma.purchase.delete({
      where: { id },
    });
  }

  async getPurchasesSummary() {
    const purchases = await this.prisma.purchase.findMany({
      include: {
        items: true,
      },
    });

    const summary = {
      totalPurchases: purchases.length,
      totalAmount: purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount), 0),
      pendingPurchases: purchases.filter(p => p.status === 'PENDING').length,
      receivedPurchases: purchases.filter(p => p.status === 'RECEIVED').length,
      cancelledPurchases: purchases.filter(p => p.status === 'CANCELLED').length,
      topSuppliers: this.getTopSuppliers(purchases),
    };

    return summary;
  }

  private getTopSuppliers(purchases: any[]) {
    const supplierStats = new Map();

    purchases.forEach(purchase => {
      const supplier = purchase.supplierName;
      const existing = supplierStats.get(supplier) || {
        name: supplier,
        totalOrders: 0,
        totalAmount: 0,
      };

      existing.totalOrders += 1;
      existing.totalAmount += Number(purchase.totalAmount);
      supplierStats.set(supplier, existing);
    });

    return Array.from(supplierStats.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }
}
