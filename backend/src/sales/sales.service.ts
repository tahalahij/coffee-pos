import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Sale, SaleDocument, SaleStatus } from './models/sale.model';
import { Product, ProductDocument } from '../products/models/product.model';
import { Customer, CustomerDocument } from '../customers/models/customer.model';
import { Category, CategoryDocument } from '../categories/models/category.model';
import { CreateSaleDto, UpdateSaleDto, SalesSummaryDto } from './dto/sale.dto';
import { ProductsService } from '../products/products.service';
import { PostPaymentGiftHandler } from '../gift/post-payment-gift.handler';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name)
    private saleModel: Model<SaleDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    private productsService: ProductsService,
    private postPaymentGiftHandler: PostPaymentGiftHandler,
  ) {}

  // Helper to validate and convert to ObjectId
  private toObjectId(id: string | undefined, fieldName: string): Types.ObjectId | null {
    if (!id) return null;
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ${fieldName}: ${id}. Must be a valid MongoDB ObjectId.`);
    }
    return new Types.ObjectId(id);
  }

  async create(createSaleDto: CreateSaleDto) {
    console.log('Creating sale with items:', JSON.stringify(createSaleDto.items, null, 2));

    // Validate customerId if provided
    if (createSaleDto.customerId && !isValidObjectId(createSaleDto.customerId)) {
      throw new BadRequestException(`Invalid customerId: ${createSaleDto.customerId}. Must be a valid MongoDB ObjectId.`);
    }

    // Validate discountCodeId if provided
    if (createSaleDto.discountCodeId && !isValidObjectId(createSaleDto.discountCodeId)) {
      throw new BadRequestException(`Invalid discountCodeId: ${createSaleDto.discountCodeId}. Must be a valid MongoDB ObjectId.`);
    }

    // Validate products exist and have sufficient stock
    for (const item of createSaleDto.items) {
      console.log(`Processing item: ${JSON.stringify(item)}`);
      console.log(`Looking for productId: ${item.productId}`);

      // Find product by ID
      let product = null;
      try {
        product = await this.productsService.findOne(String(item.productId));
        console.log(`Found product by ID: ${product.name} (ID: ${product.id})`);
      } catch (error) {
        console.log(`Product not found by ID ${item.productId}: ${error.message}`);
        
        const availableProducts = await this.productModel.find({ isAvailable: true })
          .select('_id name price')
          .sort({ name: 1 })
          .lean();

        throw new BadRequestException(
          `Product with ID ${item.productId} not found. Available products: ${availableProducts.map(p => `${p.name} (ID: ${p._id})`).join(', ')}`
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

    // Prepare sale items
    const saleItems = createSaleDto.items.map(item => {
      const itemTotalAmount = item.unitPrice * item.quantity - (item.discountAmount || 0);
      return {
        productId: new Types.ObjectId(String(item.productId)),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount || 0,
        totalAmount: itemTotalAmount,
      };
    });

    // Create the sale
    const newSale = new this.saleModel({
      receiptNumber,
      customerId: createSaleDto.customerId ? new Types.ObjectId(String(createSaleDto.customerId)) : null,
      discountCodeId: createSaleDto.discountCodeId ? new Types.ObjectId(String(createSaleDto.discountCodeId)) : null,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod: createSaleDto.paymentMethod,
      cashReceived: createSaleDto.cashReceived,
      changeGiven,
      notes: createSaleDto.notes,
      status: SaleStatus.COMPLETED,
      items: saleItems,
    });

    await newSale.save();

    // Update product stock
    for (const item of createSaleDto.items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Process gifts after payment (non-blocking)
    if (createSaleDto.giftMetadata) {
      const items = await Promise.all(
        createSaleDto.items.map(async (item) => {
          const product = await this.productModel.findById(item.productId).lean();
          return {
            productId: String(item.productId),
            productName: product?.name || 'Unknown',
            productType: product?.categoryId ? String(product.categoryId) : undefined,
            quantity: item.quantity,
            price: item.unitPrice,
          };
        })
      );

      // Execute gift processing asynchronously (don't block sale response)
      this.postPaymentGiftHandler.processPostPaymentGifts({
        orderId: newSale._id.toString(),
        customerId: createSaleDto.customerId,
        items,
        giftMetadata: createSaleDto.giftMetadata,
      }).catch(error => {
        console.error('Gift processing error:', error);
      });
    }

    // Return sale with populated data
    return this.findOne(newSale._id.toString());
  }

  async findAll(summaryDto?: SalesSummaryDto) {
    const filter: any = {};

    if (summaryDto?.startDate && summaryDto?.endDate) {
      filter.createdAt = {
        $gte: new Date(summaryDto.startDate),
        $lte: new Date(summaryDto.endDate),
      };
    }

    if (summaryDto?.paymentMethod) {
      filter.paymentMethod = summaryDto.paymentMethod;
    }

    if (summaryDto?.status) {
      filter.status = summaryDto.status;
    }

    const sales = await this.saleModel.find(filter).sort({ createdAt: -1 }).lean();

    // Populate customer and product info for each sale
    const populatedSales = await Promise.all(
      sales.map(async (sale) => {
        const customer = sale.customerId 
          ? await this.customerModel.findById(sale.customerId).select('_id name phone').lean()
          : null;

        const itemsWithProducts = await Promise.all(
          (sale.items || []).map(async (item) => {
            const product = await this.productModel.findById(item.productId).select('_id name categoryId').lean();
            let category = null;
            if (product?.categoryId) {
              category = await this.categoryModel.findById(product.categoryId).select('name').lean();
            }
            return {
              ...item,
              id: item._id,
              product: product ? { ...product, id: product._id, category } : null,
            };
          })
        );

        return {
          ...sale,
          id: sale._id,
          customer: customer ? { ...customer, id: customer._id } : null,
          items: itemsWithProducts,
        };
      })
    );

    return populatedSales;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const sale = await this.saleModel.findById(id).lean();

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // Populate customer
    const customer = sale.customerId 
      ? await this.customerModel.findById(sale.customerId).select('_id name phone').lean()
      : null;

    // Populate items with products and categories
    const itemsWithProducts = await Promise.all(
      (sale.items || []).map(async (item) => {
        const product = await this.productModel.findById(item.productId).select('_id name categoryId').lean();
        let category = null;
        if (product?.categoryId) {
          category = await this.categoryModel.findById(product.categoryId).select('name').lean();
        }
        return {
          ...item,
          id: item._id,
          product: product ? { ...product, id: product._id, category } : null,
        };
      })
    );

    return {
      ...sale,
      id: sale._id,
      customer: customer ? { ...customer, id: customer._id } : null,
      items: itemsWithProducts,
    };
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const sale = await this.saleModel.findById(id);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    Object.assign(sale, updateSaleDto);
    await sale.save();
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const sale = await this.saleModel.findById(id);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    await this.saleModel.findByIdAndDelete(id);
    return { message: 'Sale deleted successfully' };
  }

  async getDailySummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleModel.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: 'COMPLETED',
    }).lean();

    // Handle case when no sales exist
    const totalSales = sales && sales.length > 0 
      ? sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount?.toString() || '0'), 0)
      : 0;
    const totalOrders = sales ? sales.length : 0;

    // Populate items with product info
    const populatedSales = await Promise.all(
      sales.map(async (sale) => {
        const itemsWithProducts = await Promise.all(
          (sale.items || []).map(async (item) => {
            const product = await this.productModel.findById(item.productId).select('name').lean();
            return { ...item, product };
          })
        );
        return { ...sale, items: itemsWithProducts };
      })
    );

    return {
      date: targetDate,
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      sales: populatedSales.map(sale => ({
        id: sale._id,
        receiptNumber: sale.receiptNumber,
        totalAmount: sale.totalAmount || 0,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
        itemCount: sale.items ? sale.items.length : 0,
      })),
    };
  }

  private async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastSale = await this.saleModel.findOne({
      receiptNumber: { $regex: `^RCP-${dateStr}` }
    }).sort({ createdAt: -1 });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.receiptNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `RCP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}
