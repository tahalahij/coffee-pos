import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountType } from '@prisma/client';

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
  expiresAt?: string;
}

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(createDiscountDto: CreateDiscountCodeDto) {
    // Generate unique code if not provided
    const code = createDiscountDto.code || this.generateDiscountCode();

    // Check if code already exists
    const existingCode = await this.prisma.discountCode.findUnique({
      where: { code },
    });

    if (existingCode) {
      throw new BadRequestException('Discount code already exists');
    }

    // Validate percentage discount
    if (createDiscountDto.type === 'PERCENTAGE' && createDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.prisma.discountCode.create({
      data: {
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
      },
    });
  }

  async findAll() {
    return this.prisma.discountCode.findMany({
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActive() {
    const now = new Date();

    return this.prisma.discountCode.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: {
        value: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const discountCode = await this.prisma.discountCode.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!discountCode) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    return discountCode;
  }

  async update(id: string, updateDiscountDto: CreateDiscountCodeDto) {
    await this.findOne(id); // Check if exists

    // Validate percentage discount
    if (updateDiscountDto.type === 'PERCENTAGE' && updateDiscountDto.value && updateDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.prisma.discountCode.update({
      where: { id },
      data: {
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
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.discountCode.delete({
      where: { id },
    });
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

  async toggleActive(id: string) {
    const discountCode = await this.findOne(id);

    return this.prisma.discountCode.update({
      where: { id },
      data: {
        isActive: !discountCode.isActive,
      },
    });
  }

  async getDiscountCodes(customerId?: string) {
    return await this.prisma.discountCode.findMany({
      where: customerId ? { customerId } : {},
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDiscountCodeByCode(code: string) {
    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!discountCode) {
      throw new NotFoundException('Discount code not found');
    }

    return discountCode;
  }

  async validateDiscountCode(code: string, customerId?: string, subtotal?: number) {
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

  async applyDiscountCode(code: string, subtotal: number, customerId?: string) {
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

  async useDiscountCode(discountCodeId: string) {
    const discountCode = await this.findOne(discountCodeId);

    // Increment usage count
    await this.prisma.discountCode.update({
      where: { id: discountCodeId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return {
      success: true,
      message: 'Discount code used successfully',
      usageCount: discountCode.usageCount + 1,
    };
  }

  async generatePersonalizedCodes(customerId: string, count: number = 1) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

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
    const totalCodes = await this.prisma.discountCode.count();
    const activeCodes = await this.prisma.discountCode.count({
      where: { isActive: true },
    });

    // Count codes that have been used (have usage count > 0)
    const usedCodes = await this.prisma.discountCode.count({
      where: { usageCount: { gt: 0 } },
    });

    // Count expired codes
    const now = new Date();
    const expiredCodes = await this.prisma.discountCode.count({
      where: {
        expiresAt: { lt: now },
      },
    });

    // For fully used codes, we need to use raw SQL or find them separately
    // since Prisma doesn't support field-to-field comparisons directly
    const allCodes = await this.prisma.discountCode.findMany({
      select: { usageCount: true, usageLimit: true },
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

    const result = await this.prisma.discountCode.updateMany({
      where: {
        expiresAt: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });

    return { deactivatedCount: result.count };
  }

  async getCustomerDiscountHistory(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const discountCodes = await this.prisma.discountCode.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    // Get sales where discount codes were used by this customer
    const salesWithDiscounts = await this.prisma.sale.findMany({
      where: {
        customerId,
        discountCodeId: { not: null },
      },
      include: {
        discountCode: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total savings
    const totalSavings = salesWithDiscounts.reduce((sum, sale) =>
      sum + Number(sale.discountAmount || 0), 0
    );

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      personalCodes: discountCodes,
      usageHistory: salesWithDiscounts.map(sale => ({
        id: sale.id,
        date: sale.createdAt,
        discountCode: sale.discountCode?.code,
        discountAmount: Number(sale.discountAmount),
        totalAmount: Number(sale.totalAmount),
      })),
      totalSavings,
    };
  }
}
