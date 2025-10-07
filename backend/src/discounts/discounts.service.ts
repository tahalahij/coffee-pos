import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiscountCode, DiscountType } from './models/discount-code.model';
import { Customer } from '../customers/models/customer.model';
import { Sale } from '../sales/models/sale.model';
import { Op } from 'sequelize';

export interface CreateDiscountCodeDto {
  code?: string;
  name?: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  customerId?: number;
  expiresAt?: string;
}

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(DiscountCode)
    private discountCodeModel: typeof DiscountCode,
    @InjectModel(Customer)
    private customerModel: typeof Customer,
  ) {}

  async create(createDiscountDto: CreateDiscountCodeDto) {
    // Generate unique code if not provided
    const code = createDiscountDto.code || this.generateDiscountCode();

    // Check if code already exists
    const existingCode = await this.discountCodeModel.findOne({
      where: { code },
    });

    if (existingCode) {
      throw new BadRequestException('Discount code already exists');
    }

    // Validate percentage discount
    if (createDiscountDto.type === 'PERCENTAGE' && createDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.discountCodeModel.create({
      code,
      name: createDiscountDto.name,
      description: createDiscountDto.description,
      type: createDiscountDto.type,
      value: createDiscountDto.value,
      minPurchase: createDiscountDto.minPurchase,
      maxDiscount: createDiscountDto.maxDiscount,
      usageLimit: createDiscountDto.usageLimit,
      customerId: createDiscountDto.customerId,
      expiresAt: createDiscountDto.expiresAt ? new Date(createDiscountDto.expiresAt) : null,
    });
  }

  async findAll() {
    return this.discountCodeModel.findAll({
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findActive() {
    const now = new Date();

    return this.discountCodeModel.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gte]: now } },
        ],
      },
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['value', 'DESC']],
    });
  }

  async findOne(id: number) {
    const discountCode = await this.discountCodeModel.findByPk(id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'phone'],
        },
      ],
    });

    if (!discountCode) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    return discountCode;
  }

  async update(id: number, updateDiscountDto: CreateDiscountCodeDto) {
    await this.findOne(id); // Check if exists

    // Validate percentage discount
    if (updateDiscountDto.type === 'PERCENTAGE' && updateDiscountDto.value && updateDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const [affectedCount, updatedRows] = await this.discountCodeModel.update(
      {
        name: updateDiscountDto.name,
        description: updateDiscountDto.description,
        type: updateDiscountDto.type,
        value: updateDiscountDto.value,
        minPurchase: updateDiscountDto.minPurchase,
        maxDiscount: updateDiscountDto.maxDiscount,
        usageLimit: updateDiscountDto.usageLimit,
        customerId: updateDiscountDto.customerId,
        expiresAt: updateDiscountDto.expiresAt ? new Date(updateDiscountDto.expiresAt) : null,
      },
      {
        where: { id },
        returning: true,
      }
    );

    return updatedRows[0];
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    await this.discountCodeModel.destroy({
      where: { id },
    });

    return { message: 'Discount code deleted successfully' };
  }

  async calculateDiscount(amount: number, discountCodeId?: number) {
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

  private isDiscountCodeValid(discountCode: DiscountCode): boolean {
    if (!discountCode.isActive) {
      return false;
    }

    const now = new Date();

    // Check expiration
    if (discountCode.expiresAt && now > discountCode.expiresAt) {
      return false;
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return false;
    }

    return true;
  }

  async toggleActive(id: number) {
    const discountCode = await this.findOne(id);

    const [affectedCount, updatedRows] = await this.discountCodeModel.update(
      {
        isActive: !discountCode.isActive,
      },
      {
        where: { id },
        returning: true,
      }
    );

    return updatedRows[0];
  }

  async getDiscountCodes(customerId?: number) {
    const whereCondition = customerId ? { customerId } : {};

    return this.discountCodeModel.findAll({
      where: whereCondition,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getDiscountCodeByCode(code: string) {
    const discountCode = await this.discountCodeModel.findOne({
      where: { code },
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'phone'],
        },
      ],
    });

    if (!discountCode) {
      throw new NotFoundException('Discount code not found');
    }

    return discountCode;
  }

  async validateDiscountCode(code: string, customerId?: number, subtotal?: number) {
    const discountCode = await this.getDiscountCodeByCode(code);

    // Check if code is valid
    if (!this.isDiscountCodeValid(discountCode)) {
      throw new BadRequestException('Discount code is not valid, expired, or has reached usage limit');
    }

    // Check customer restriction
    if (discountCode.customerId && discountCode.customerId !== customerId) {
      throw new BadRequestException('Discount code is not valid for this customer');
    }

    // Check minimum purchase requirement
    if (discountCode.minPurchase && subtotal && subtotal < Number(discountCode.minPurchase)) {
      throw new BadRequestException(`Minimum purchase of $${discountCode.minPurchase} required`);
    }

    return discountCode;
  }

  async applyDiscountCode(code: string, subtotal: number, customerId?: number) {
    const discountCode = await this.validateDiscountCode(code, customerId, subtotal);

    let discountAmount = 0;
    if (discountCode.type === 'PERCENTAGE') {
      discountAmount = (subtotal * Number(discountCode.value)) / 100;
    } else {
      discountAmount = Math.min(Number(discountCode.value), subtotal);
    }

    // Apply maximum discount limit if specified
    if (discountCode.maxDiscount && discountAmount > Number(discountCode.maxDiscount)) {
      discountAmount = Number(discountCode.maxDiscount);
    }

    return {
      id: discountCode.id,
      code: discountCode.code,
      name: discountCode.name,
      discountCodeId: discountCode.id,
      discountAmount,
      finalAmount: subtotal - discountAmount,
      type: discountCode.type,
      value: Number(discountCode.value),
    };
  }

  async createDiscountCode(createDiscountCodeDto: CreateDiscountCodeDto) {
    return this.create(createDiscountCodeDto);
  }

  async useDiscountCode(discountCodeId: number) {
    const discountCode = await this.findOne(discountCodeId);

    // Increment usage count
    const [affectedCount, updatedRows] = await this.discountCodeModel.update(
      {
        usageCount: discountCode.usageCount + 1,
      },
      {
        where: { id: discountCodeId },
        returning: true,
      }
    );

    return {
      success: true,
      message: 'Discount code used successfully',
      usageCount: updatedRows[0].usageCount,
    };
  }

  async generatePersonalizedCodes(customerId: number, count: number = 1) {
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = await this.create({
        type: DiscountType.PERCENTAGE,
        value: 10, // Default 10% discount
        customerId,
        name: `Personal discount for ${customer.name}`,
        description: `Personalized discount code for ${customer.name}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });
      codes.push(code);
    }

    return codes;
  }

  async createBulkDiscountCodes(options: {
    count: number;
    type: DiscountType;
    value: number;
    prefix?: string;
    expiresAt?: string;
    minPurchase?: number;
  }) {
    const codes = [];

    for (let i = 0; i < options.count; i++) {
      const code = await this.create({
        code: options.prefix ? `${options.prefix}${String(i + 1).padStart(3, '0')}` : undefined,
        type: options.type,
        value: options.value,
        minPurchase: options.minPurchase,
        expiresAt: options.expiresAt,
        name: `Bulk discount code ${i + 1}`,
        description: `Bulk generated discount code`,
      });
      codes.push(code);
    }

    return codes;
  }

  async getDiscountStats() {
    const totalCodes = await this.discountCodeModel.count();
    const activeCodes = await this.discountCodeModel.count({
      where: { isActive: true },
    });

    // Count codes that have been used (have usage count > 0)
    const usedCodes = await this.discountCodeModel.count({
      where: { usageCount: { [Op.gt]: 0 } },
    });

    // Count expired codes
    const now = new Date();
    const expiredCodes = await this.discountCodeModel.count({
      where: {
        expiresAt: { [Op.lt]: now },
      },
    });

    // Get all codes for calculating fully used codes and total usage
    const allCodes = await this.discountCodeModel.findAll({
      attributes: ['usageCount', 'usageLimit'],
    });

    const fullyUsedCodes = allCodes.filter(code =>
      code.usageLimit !== null && code.usageCount >= code.usageLimit
    ).length;

    // Calculate total usage (sum of all usage counts)
    const totalUsage = allCodes.reduce((sum, code) => sum + code.usageCount, 0);

    return {
      totalCodes,
      activeCodes,
      usedCodes,
      expiredCodes,
      fullyUsedCodes,
      totalUsage,
      redemptionRate: totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0,
    };
  }

  private generateDiscountCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async deactivateExpiredCodes() {
    const now = new Date();

    const [affectedCount] = await this.discountCodeModel.update(
      { isActive: false },
      {
        where: {
          expiresAt: { [Op.lt]: now },
          isActive: true,
        },
      }
    );

    return { deactivatedCount: affectedCount };
  }

  async getCustomerDiscountHistory(customerId: number) {
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const discountCodes = await this.discountCodeModel.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']],
    });

    // Get sales where discount codes were used by this customer
    const salesWithDiscounts = await this.customerModel.findByPk(customerId, {
      include: [
        {
          model: Sale,
          where: {
            discountCodeId: { [Op.not]: null },
          },
          include: [
            {
              model: DiscountCode,
              as: 'discountCode',
            },
          ],
          required: false,
        },
      ],
    });

    const sales = salesWithDiscounts?.sales || [];

    // Calculate total savings
    const totalSavings = sales.reduce((sum, sale) =>
      sum + Number(sale.discountAmount || 0), 0
    );

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      personalCodes: discountCodes,
      usageHistory: sales.map(sale => ({
        id: sale.id,
        date: sale.createdAt,
        discountCode: (sale as any).discountCode?.code,
        discountAmount: Number(sale.discountAmount),
        totalAmount: Number(sale.totalAmount),
      })),
      totalSavings,
    };
  }
}
