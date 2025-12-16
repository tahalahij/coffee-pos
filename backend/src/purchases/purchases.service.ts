import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument, PurchaseStatus } from './models/purchase.model';
import { Product, ProductDocument } from '../products/models/product.model';
import { Category, CategoryDocument } from '../categories/models/category.model';
import { CreatePurchaseDto, UpdatePurchaseDto, PurchaseStatus as DtoPurchaseStatus } from './dto/purchase.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name)
    private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
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
      await this.productsService.findOne(String(item.productId));
    }

    // Calculate total amount from items
    const calculatedTotal = createPurchaseDto.items.reduce((sum, item) => {
      return sum + (item.unitCost * item.quantity);
    }, 0);

    // Prepare purchase items
    const purchaseItems = createPurchaseDto.items.map(item => {
      const totalCost = item.unitCost * item.quantity;
      return {
        productId: new Types.ObjectId(String(item.productId)),
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost,
      };
    });

    // Create the purchase
    const newPurchase = new this.purchaseModel({
      supplierName: createPurchaseDto.supplierName,
      supplierContact: createPurchaseDto.supplierContact,
      totalAmount: calculatedTotal,
      status: createPurchaseDto.status || DtoPurchaseStatus.PENDING,
      notes: createPurchaseDto.notes,
      items: purchaseItems,
    });

    await newPurchase.save();

    // Return purchase with items
    return this.findOne(newPurchase._id.toString());
  }

  async findAll() {
    const purchases = await this.purchaseModel.find().sort({ createdAt: -1 }).lean();

    // Populate items with product info
    const populatedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const itemsWithProducts = await Promise.all(
          (purchase.items || []).map(async (item) => {
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
          ...purchase,
          id: purchase._id,
          items: itemsWithProducts,
        };
      })
    );

    return populatedPurchases;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    const purchase = await this.purchaseModel.findById(id).lean();

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    // Populate items with product info
    const itemsWithProducts = await Promise.all(
      (purchase.items || []).map(async (item) => {
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
      ...purchase,
      id: purchase._id,
      items: itemsWithProducts,
    };
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    const purchase = await this.purchaseModel.findById(id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    Object.assign(purchase, updatePurchaseDto);
    await purchase.save();
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    const purchase = await this.purchaseModel.findById(id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    await this.purchaseModel.findByIdAndDelete(id);
    return { message: 'Purchase deleted successfully' };
  }

  async receive(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    const purchase = await this.purchaseModel.findById(id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException('Only pending purchases can be marked as received');
    }

    // Update purchase status
    purchase.status = PurchaseStatus.RECEIVED;
    purchase.receivedAt = new Date();
    await purchase.save();

    // Update product stock
    for (const item of purchase.items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    return this.findOne(id);
  }

  async markAsReceived(id: string) {
    return this.receive(id);
  }

  async cancel(id: string, reason?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    const purchase = await this.purchaseModel.findById(id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException('Only pending purchases can be cancelled');
    }

    purchase.status = PurchaseStatus.CANCELLED;
    if (reason) {
      purchase.notes = `${purchase.notes || ''}\nCancellation reason: ${reason}`.trim();
    }
    await purchase.save();

    return this.findOne(id);
  }
}
