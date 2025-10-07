import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Purchase } from './models/purchase.model';
import { PurchaseItem } from './models/purchase-item.model';
import { Product } from '../products/models/product.model';
import { Category } from '../categories/models/category.model';
import { CreatePurchaseDto, UpdatePurchaseDto, PurchaseStatus } from './dto/purchase.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase)
    private purchaseModel: typeof Purchase,
    @InjectModel(PurchaseItem)
    private purchaseItemModel: typeof PurchaseItem,
    @InjectModel(Product)
    private productModel: typeof Product,
    private productsService: ProductsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    // Validate required fields
    if (!createPurchaseDto.supplierName || createPurchaseDto.supplierName.trim() === '') {
      throw new BadRequestException('Supplier name is required');
    }

    if (!createPurchaseDto.items || createPurchaseDto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    // Validate all products exist
    for (const item of createPurchaseDto.items) {
      await this.productsService.findOne(parseInt(item.productId));
    }

    // Calculate total amount from items
    const calculatedTotal = createPurchaseDto.items.reduce((sum, item) => {
      return sum + (item.unitCost * item.quantity);
    }, 0);

    // Create purchase with items in a transaction
    const purchase = await this.purchaseModel.sequelize.transaction(async (transaction) => {
      // Create the purchase
      const newPurchase = await this.purchaseModel.create({
        supplierName: createPurchaseDto.supplierName,
        supplierContact: createPurchaseDto.supplierContact,
        totalAmount: calculatedTotal,
        status: createPurchaseDto.status || PurchaseStatus.PENDING,
        notes: createPurchaseDto.notes,
      }, { transaction });

      // Create purchase items
      for (const item of createPurchaseDto.items) {
        const totalCost = item.unitCost * item.quantity;

        await this.purchaseItemModel.create({
          purchaseId: newPurchase.id,
          productId: parseInt(item.productId),
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost,
        }, { transaction });
      }

      return newPurchase;
    });

    // Return purchase with items
    return this.findOne(purchase.id);
  }

  async findAll() {
    return this.purchaseModel.findAll({
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['name'],
                },
              ],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number) {
    const purchase = await this.purchaseModel.findByPk(id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['name'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    const purchase = await this.purchaseModel.findByPk(id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    await purchase.update(updatePurchaseDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const purchase = await this.purchaseModel.findByPk(id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    await purchase.destroy();
    return { message: 'Purchase deleted successfully' };
  }

  async receive(id: number) {
    const purchase = await this.purchaseModel.findByPk(id, {
      include: [{ model: PurchaseItem, as: 'items' }],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException('Only pending purchases can be marked as received');
    }

    // Update purchase status and stock in transaction
    await this.purchaseModel.sequelize.transaction(async (transaction) => {
      // Update purchase status
      await purchase.update({
        status: 'RECEIVED' as any,
        receivedAt: new Date() as any,
      }, { transaction });

      // Update product stock
      for (const item of purchase.items) {
        await this.productModel.increment('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction,
        });
      }
    });

    return this.findOne(id);
  }

  async markAsReceived(id: string) {
    return this.receive(parseInt(id));
  }

  async cancel(id: string, reason?: string) {
    const purchase = await this.purchaseModel.findByPk(parseInt(id));

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException('Only pending purchases can be cancelled');
    }

    await purchase.update({
      status: 'CANCELLED' as any,
      notes: reason ? `${purchase.notes || ''}\nCancellation reason: ${reason}`.trim() : purchase.notes,
    });

    return this.findOne(parseInt(id));
  }
}
