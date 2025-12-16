import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DiscountCode, DiscountCodeDocument, DiscountType } from './models/discount-code.model';
import { Customer, CustomerDocument } from '../customers/models/customer.model';
import { Product, ProductDocument } from '../products/models/product.model';

export interface CreateDiscountCodeDto {
  code?: string;
  name?: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  customerId?: string;
  startsAt?: string;
  expiresAt?: string;
  productIds?: string[];
}

export interface ValidateDiscountForProductsDto {
  code: string;
  productIds: string[];
  subtotal: number;
  customerId?: string;
}

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(DiscountCode.name)
    private discountCodeModel: Model<DiscountCodeDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createDiscountDto: CreateDiscountCodeDto) {
    // Generate unique code if not provided
    const code = createDiscountDto.code || this.generateDiscountCode();

    // Check if code already exists
    const existingCode = await this.discountCodeModel.findOne({ code });

    if (existingCode) {
      throw new BadRequestException('Discount code already exists');
    }

    // Validate percentage discount
    if (createDiscountDto.type === 'PERCENTAGE' && createDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Validate date range
    if (createDiscountDto.startsAt && createDiscountDto.expiresAt) {
      const startsAt = new Date(createDiscountDto.startsAt);
      const expiresAt = new Date(createDiscountDto.expiresAt);
      if (startsAt >= expiresAt) {
        throw new BadRequestException('Start date must be before expiration date');
      }
    }

    const hasProductRestrictions = createDiscountDto.productIds && createDiscountDto.productIds.length > 0;

    const discountCode = new this.discountCodeModel({
      code,
      name: createDiscountDto.name,
      description: createDiscountDto.description,
      type: createDiscountDto.type,
      value: createDiscountDto.value,
      minPurchase: createDiscountDto.minPurchase,
      maxDiscount: createDiscountDto.maxDiscount,
      usageLimit: createDiscountDto.usageLimit,
      customerId: createDiscountDto.customerId ? new Types.ObjectId(createDiscountDto.customerId) : null,
      startsAt: createDiscountDto.startsAt ? new Date(createDiscountDto.startsAt) : null,
      expiresAt: createDiscountDto.expiresAt ? new Date(createDiscountDto.expiresAt) : null,
      productRestricted: hasProductRestrictions,
      productIds: hasProductRestrictions 
        ? createDiscountDto.productIds.map(id => new Types.ObjectId(id))
        : [],
    });

    await discountCode.save();
    return this.findOne(discountCode._id.toString());
  }

  async findAll() {
    const discounts = await this.discountCodeModel.find().sort({ createdAt: -1 }).lean();
    
    return Promise.all(discounts.map(async (discount) => {
      const customer = discount.customerId 
        ? await this.customerModel.findById(discount.customerId).select('_id name phone').lean()
        : null;
      
      const products = discount.productIds?.length > 0
        ? await this.productModel.find({ _id: { $in: discount.productIds } }).select('_id name price').lean()
        : [];

      return {
        ...discount,
        id: discount._id,
        customer: customer ? { ...customer, id: customer._id } : null,
        products: products.map(p => ({ ...p, id: p._id })),
      };
    }));
  }

  async findActive() {
    const now = new Date();

    const discounts = await this.discountCodeModel.find({
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] },
      ],
    }).sort({ value: -1 }).lean();

    return Promise.all(discounts.map(async (discount) => {
      const customer = discount.customerId 
        ? await this.customerModel.findById(discount.customerId).select('_id name phone').lean()
        : null;
      
      const products = discount.productIds?.length > 0
        ? await this.productModel.find({ _id: { $in: discount.productIds } }).select('_id name price').lean()
        : [];

      return {
        ...discount,
        id: discount._id,
        customer: customer ? { ...customer, id: customer._id } : null,
        products: products.map(p => ({ ...p, id: p._id })),
      };
    }));
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const discount = await this.discountCodeModel.findById(id).lean();

    if (!discount) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const customer = discount.customerId 
      ? await this.customerModel.findById(discount.customerId).select('_id name phone').lean()
      : null;
    
    const products = discount.productIds?.length > 0
      ? await this.productModel.find({ _id: { $in: discount.productIds } }).select('_id name price').lean()
      : [];

    return {
      ...discount,
      id: discount._id,
      customer: customer ? { ...customer, id: customer._id } : null,
      products: products.map(p => ({ ...p, id: p._id })),
    };
  }

  async findByCode(code: string) {
    const discount = await this.discountCodeModel.findOne({ code }).lean();

    if (!discount) {
      throw new NotFoundException(`Discount code "${code}" not found`);
    }

    const customer = discount.customerId 
      ? await this.customerModel.findById(discount.customerId).select('_id name phone').lean()
      : null;
    
    const products = discount.productIds?.length > 0
      ? await this.productModel.find({ _id: { $in: discount.productIds } }).select('_id name price').lean()
      : [];

    return {
      ...discount,
      id: discount._id,
      customer: customer ? { ...customer, id: customer._id } : null,
      products: products.map(p => ({ ...p, id: p._id })),
    };
  }

  async update(id: string, updateDiscountDto: CreateDiscountCodeDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const discountCode = await this.discountCodeModel.findById(id);

    if (!discountCode) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    // Validate percentage discount
    if (updateDiscountDto.type === 'PERCENTAGE' && updateDiscountDto.value && updateDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Validate date range
    if (updateDiscountDto.startsAt && updateDiscountDto.expiresAt) {
      const startsAt = new Date(updateDiscountDto.startsAt);
      const expiresAt = new Date(updateDiscountDto.expiresAt);
      if (startsAt >= expiresAt) {
        throw new BadRequestException('Start date must be before expiration date');
      }
    }

    const hasProductRestrictions = updateDiscountDto.productIds && updateDiscountDto.productIds.length > 0;

    Object.assign(discountCode, {
      name: updateDiscountDto.name,
      description: updateDiscountDto.description,
      type: updateDiscountDto.type,
      value: updateDiscountDto.value,
      minPurchase: updateDiscountDto.minPurchase,
      maxDiscount: updateDiscountDto.maxDiscount,
      usageLimit: updateDiscountDto.usageLimit,
      customerId: updateDiscountDto.customerId ? new Types.ObjectId(updateDiscountDto.customerId) : null,
      startsAt: updateDiscountDto.startsAt ? new Date(updateDiscountDto.startsAt) : null,
      expiresAt: updateDiscountDto.expiresAt ? new Date(updateDiscountDto.expiresAt) : null,
      productRestricted: hasProductRestrictions,
      productIds: hasProductRestrictions 
        ? updateDiscountDto.productIds.map(id => new Types.ObjectId(id))
        : [],
    });

    await discountCode.save();
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const discount = await this.discountCodeModel.findById(id);

    if (!discount) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    await this.discountCodeModel.findByIdAndDelete(id);
    return { message: 'Discount code deleted successfully' };
  }

  async calculateDiscount(amount: number, discountCodeId?: string) {
    if (!discountCodeId) {
      return { discountAmount: 0, finalAmount: amount };
    }

    const discountCode = await this.findOne(discountCodeId);

    if (!this.isDiscountCodeValid(discountCode)) {
      throw new BadRequestException('Discount code is not valid or expired');
    }

    // Check minimum purchase requirement
    if (discountCode.minPurchase && amount < Number(discountCode.minPurchase)) {
      throw new BadRequestException(`Minimum purchase of $${discountCode.minPurchase} required for this discount`);
    }

    let discountAmount: number;

    if (discountCode.type === 'PERCENTAGE') {
      discountAmount = (amount * Number(discountCode.value)) / 100;
    } else {
      discountAmount = Math.min(Number(discountCode.value), amount);
    }

    // Apply maximum discount limit if specified
    if (discountCode.maxDiscount && discountAmount > Number(discountCode.maxDiscount)) {
      discountAmount = Number(discountCode.maxDiscount);
    }

    return {
      discountAmount,
      finalAmount: amount - discountAmount,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        name: discountCode.name,
        type: discountCode.type,
        value: Number(discountCode.value),
      },
    };
  }

  private isDiscountCodeValid(discountCode: any): boolean {
    if (!discountCode.isActive) {
      return false;
    }

    const now = new Date();

    // Check start date
    if (discountCode.startsAt && now < new Date(discountCode.startsAt)) {
      return false;
    }

    // Check expiration
    if (discountCode.expiresAt && now > new Date(discountCode.expiresAt)) {
      return false;
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return false;
    }

    return true;
  }

  private isDiscountValidForProducts(discountCode: any, productIds: string[]): boolean {
    // If no product restrictions, the discount is valid for all products
    if (!discountCode.productRestricted || !discountCode.productIds?.length) {
      return true;
    }

    const allowedProductIds = discountCode.productIds.map((id: any) => id.toString());

    // Check if at least one of the cart products is allowed
    return productIds.some(id => allowedProductIds.includes(id));
  }

  async toggleActive(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const discountCode = await this.discountCodeModel.findById(id);

    if (!discountCode) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    discountCode.isActive = !discountCode.isActive;
    await discountCode.save();

    return this.findOne(id);
  }

  async incrementUsage(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    await this.discountCodeModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
  }

  async validateDiscountForProducts(dto: ValidateDiscountForProductsDto) {
    return this.validateAndApplyCode(dto.code, dto.subtotal, dto.productIds, dto.customerId);
  }

  async validateAndApplyCode(code: string, subtotal: number, productIds?: string[], customerId?: string) {
    const discount = await this.findByCode(code);

    // Check if discount is valid
    if (!this.isDiscountCodeValid(discount)) {
      throw new BadRequestException('کد تخفیف نامعتبر یا منقضی شده است');
    }

    // Check minimum purchase
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      throw new BadRequestException(`حداقل مبلغ خرید ${discount.minPurchase} تومان است`);
    }

    // Check customer restriction
    if (discount.customerId && customerId !== discount.customerId.toString()) {
      throw new BadRequestException('این کد تخفیف برای شما قابل استفاده نیست');
    }

    // Check product restriction
    if (productIds && productIds.length > 0 && !this.isDiscountValidForProducts(discount, productIds)) {
      throw new BadRequestException('این کد تخفیف برای محصولات انتخابی معتبر نیست');
    }

    // Calculate discount amount
    let discountAmount: number;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, subtotal);
    }

    // Apply max discount limit
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }

    return {
      valid: true,
      discountCode: discount,
      discountAmount,
      finalAmount: subtotal - discountAmount,
    };
  }

  async getStats() {
    const total = await this.discountCodeModel.countDocuments();
    const active = await this.discountCodeModel.countDocuments({ isActive: true });
    
    const now = new Date();
    const expired = await this.discountCodeModel.countDocuments({
      expiresAt: { $lt: now }
    });

    const usageStats = await this.discountCodeModel.aggregate([
      { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }
    ]);

    return {
      total,
      active,
      expired,
      totalUsage: usageStats[0]?.totalUsage || 0,
    };
  }

  // Alias for controller compatibility
  async getDiscountStats() {
    return this.getStats();
  }

  // Alias for controller compatibility  
  async createDiscountCode(createDiscountCodeDto: CreateDiscountCodeDto) {
    return this.create(createDiscountCodeDto);
  }

  // Alias for controller compatibility
  async getDiscountCodes(customerId?: number) {
    if (customerId) {
      const customerIdStr = customerId.toString();
      return this.discountCodeModel.find({ 
        $or: [
          { customerId: null },
          { customerId: new Types.ObjectId(customerIdStr) }
        ]
      }).sort({ createdAt: -1 }).lean();
    }
    return this.findAll();
  }

  // Alias for controller compatibility
  async validateDiscountCode(code: string, customerId?: number, subtotal?: number) {
    const discount = await this.findByCode(code);
    
    if (!this.isDiscountCodeValid(discount)) {
      throw new BadRequestException('کد تخفیف نامعتبر یا منقضی شده است');
    }

    if (subtotal && discount.minPurchase && subtotal < discount.minPurchase) {
      throw new BadRequestException(`حداقل مبلغ خرید ${discount.minPurchase} تومان است`);
    }

    if (customerId && discount.customerId && customerId.toString() !== discount.customerId.toString()) {
      throw new BadRequestException('این کد تخفیف برای شما قابل استفاده نیست');
    }

    return { valid: true, discount };
  }

  async getDiscountCodeByCode(code: string) {
    return this.findByCode(code);
  }

  async useDiscountCode(id: string) {
    await this.incrementUsage(id);
    return this.findOne(id);
  }

  async applyDiscountCode(code: string, subtotal: number, customerId?: number, productIds?: number[]) {
    const productIdStrings = productIds?.map(id => id.toString());
    const customerIdStr = customerId?.toString();
    return this.validateAndApplyCode(code, subtotal, productIdStrings, customerIdStr);
  }

  async generatePersonalizedCodes(customerId: string, count: number = 1) {
    const customer = await this.customerModel.findById(customerId);
    
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = await this.create({
        code: `CUST${customerId.slice(-6)}-${this.generateDiscountCode()}`,
        name: `Personal code for ${customer.name}`,
        type: DiscountType.PERCENTAGE,
        value: 10,
        customerId: customerId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      codes.push(code);
    }

    return codes;
  }

  async createBulkDiscountCodes(options: {
    prefix: string;
    count: number;
    type: DiscountType;
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    expiresAt?: string;
  }) {
    const codes = [];
    for (let i = 0; i < options.count; i++) {
      const code = await this.create({
        code: `${options.prefix}-${this.generateDiscountCode()}`,
        type: options.type,
        value: options.value,
        minPurchase: options.minPurchase,
        maxDiscount: options.maxDiscount,
        usageLimit: options.usageLimit,
        expiresAt: options.expiresAt,
      });
      codes.push(code);
    }
    return codes;
  }

  async getCustomerDiscountHistory(customerId: string) {
    return this.discountCodeModel.find({ 
      customerId: new Types.ObjectId(customerId),
      usageCount: { $gt: 0 }
    }).sort({ updatedAt: -1 }).lean();
  }

  async deactivateExpiredCodes() {
    const now = new Date();
    const result = await this.discountCodeModel.updateMany(
      { expiresAt: { $lt: now }, isActive: true },
      { isActive: false }
    );
    return { deactivated: result.modifiedCount };
  }

  async getDiscountProducts(id: string) {
    const discount = await this.findOne(id);
    return discount.products || [];
  }

  async setDiscountProducts(id: string, productIds: number[]) {
    const discount = await this.discountCodeModel.findById(id);
    if (!discount) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    discount.productIds = productIds.map(pid => new Types.ObjectId(pid.toString()));
    discount.productRestricted = productIds.length > 0;
    await discount.save();
  }

  async addProductToDiscount(id: string, productId: number) {
    const discount = await this.discountCodeModel.findById(id);
    if (!discount) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const productOid = new Types.ObjectId(productId.toString());
    if (!discount.productIds.some(pid => pid.equals(productOid))) {
      discount.productIds.push(productOid);
      discount.productRestricted = true;
      await discount.save();
    }
  }

  async removeProductFromDiscount(id: string, productId: number) {
    const discount = await this.discountCodeModel.findById(id);
    if (!discount) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    const productOid = new Types.ObjectId(productId.toString());
    discount.productIds = discount.productIds.filter(pid => !pid.equals(productOid));
    discount.productRestricted = discount.productIds.length > 0;
    await discount.save();
  }

  private generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
