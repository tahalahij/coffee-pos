import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sale, SaleStatus } from './models/sale.model';
import { SaleItem } from './models/sale-item.model';
import { Product } from '../products/models/product.model';
import { Category } from '../categories/models/category.model';
import { Customer } from '../customers/models/customer.model';
import { CreateSaleDto, UpdateSaleDto, SalesSummaryDto } from './dto/sale.dto';
import { ProductsService } from '../products/products.service';
import { Op } from 'sequelize';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale)
    private saleModel: typeof Sale,
    @InjectModel(SaleItem)
    private saleItemModel: typeof SaleItem,
    @InjectModel(Product)
    private productModel: typeof Product,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    console.log('Creating sale with items:', JSON.stringify(createSaleDto.items, null, 2));

    // Validate products exist and have sufficient stock
    for (const item of createSaleDto.items) {
      console.log(`Processing item: ${JSON.stringify(item)}`);
      console.log(`Looking for productId: ${item.productId}`);

      // Find product by ID
      let product = null;
      try {
        product = await this.productsService.findOne(item.productId);
        console.log(`Found product by ID: ${product.name} (ID: ${product.id})`);
      } catch (error) {
        console.log(`Product not found by ID ${item.productId}: ${error.message}`);
        
        const availableProducts = await this.productModel.findAll({
          attributes: ['id', 'name', 'price'],
          where: { isAvailable: true },
          order: [['name', 'ASC']]
        });

        throw new BadRequestException(
          `Product with ID ${item.productId} not found. Available products: ${availableProducts.map(p => `${p.name} (ID: ${p.id})`).join(', ')}`
        );
      }

      // Validate availability and stock
      if (!product.isAvailable) {
        throw new BadRequestException(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      console.log(`Validated product: ${product.name} (ID: ${product.id})`);
    }

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Calculate totals from items
    let subtotal = 0;
    for (const item of createSaleDto.items) {
      subtotal += item.unitPrice * item.quantity - (item.discountAmount || 0);
    }

    const taxAmount = createSaleDto.taxAmount || 0;
    const discountAmount = createSaleDto.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Calculate change for cash payments
    let changeGiven = 0;
    if (createSaleDto.paymentMethod === 'CASH' && createSaleDto.cashReceived) {
      changeGiven = Math.max(0, createSaleDto.cashReceived - totalAmount);
    }

    // Create sale with items in a transaction
    const sale = await this.saleModel.sequelize.transaction(async (transaction) => {
      // Create the sale
      const newSale = await this.saleModel.create({
        receiptNumber,
        customerId: createSaleDto.customerId,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentMethod: createSaleDto.paymentMethod,
        cashReceived: createSaleDto.cashReceived,
        changeGiven,
        notes: createSaleDto.notes,
        status: SaleStatus.COMPLETED,
      }, { transaction });

      // Create sale items and update stock
      for (const item of createSaleDto.items) {
        const itemTotalAmount = item.unitPrice * item.quantity - (item.discountAmount || 0);

        await this.saleItemModel.create({
          saleId: newSale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount || 0,
          totalAmount: itemTotalAmount,
        }, { transaction });

        // Update product stock
        await this.productModel.decrement('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction
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
        [Op.between]: [new Date(summaryDto.startDate), new Date(summaryDto.endDate)],
      };
    }

    if (summaryDto?.paymentMethod) {
      where.paymentMethod = summaryDto.paymentMethod;
    }

    if (summaryDto?.status) {
      where.status = summaryDto.status;
    }

    return this.saleModel.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: SaleItem,
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
    const sale = await this.saleModel.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: SaleItem,
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

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const sale = await this.saleModel.findByPk(id);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    await sale.update(updateSaleDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const sale = await this.saleModel.findByPk(id);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    await sale.destroy();
    return { message: 'Sale deleted successfully' };
  }

  async getDailySummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleModel.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
        status: 'COMPLETED',
      },
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.toString()), 0);
    const totalOrders = sales.length;

    return {
      date: targetDate,
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      sales: sales.map(sale => ({
        id: sale.id,
        receiptNumber: sale.receiptNumber,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
        itemCount: sale.items.length,
      })),
    };
  }

  private async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastSale = await this.saleModel.findOne({
      where: {
        receiptNumber: {
          [Op.startsWith]: `RCP-${dateStr}`,
        },
      },
      order: [['createdAt', 'DESC']],
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.receiptNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `RCP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}
