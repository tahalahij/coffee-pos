import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(createDiscountDto: CreateDiscountDto) {
    const startDate = createDiscountDto.startDate ? new Date(createDiscountDto.startDate) : null;
    const endDate = createDiscountDto.endDate ? new Date(createDiscountDto.endDate) : null;

    // Validate date range
    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate percentage discount
    if (createDiscountDto.type === 'PERCENTAGE' && createDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.prisma.discount.create({
      data: {
        ...createDiscountDto,
        startDate,
        endDate,
      },
    });
  }

  async findAll() {
    return this.prisma.discount.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActive() {
    const now = new Date();

    return this.prisma.discount.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } },
            ],
          },
          {
            AND: [
              { startDate: null },
              { endDate: null },
            ],
          },
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: null },
            ],
          },
          {
            AND: [
              { startDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: {
        value: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }

    return discount;
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    await this.findOne(id); // Check if exists

    const startDate = updateDiscountDto.startDate ? new Date(updateDiscountDto.startDate) : undefined;
    const endDate = updateDiscountDto.endDate ? new Date(updateDiscountDto.endDate) : undefined;

    // Validate date range
    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate percentage discount
    if (updateDiscountDto.type === 'PERCENTAGE' && updateDiscountDto.value && updateDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.prisma.discount.update({
      where: { id },
      data: {
        ...updateDiscountDto,
        startDate,
        endDate,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.discount.delete({
      where: { id },
    });
  }

  async calculateDiscount(amount: number, discountId?: string) {
    if (!discountId) {
      return { discountAmount: 0, finalAmount: amount };
    }

    const discount = await this.findOne(discountId);

    if (!this.isDiscountValid(discount)) {
      throw new BadRequestException('Discount is not valid or expired');
    }

    // Check minimum amount requirement
    if (discount.minAmount && amount < Number(discount.minAmount)) {
      throw new BadRequestException(`Minimum amount of ${discount.minAmount} required for this discount`);
    }

    let discountAmount = 0;

    if (discount.type === 'PERCENTAGE') {
      discountAmount = (amount * Number(discount.value)) / 100;
    } else {
      discountAmount = Math.min(Number(discount.value), amount);
    }

    return {
      discountAmount,
      finalAmount: amount - discountAmount,
      discount: {
        id: discount.id,
        name: discount.name,
        type: discount.type,
        value: Number(discount.value),
      },
    };
  }

  private isDiscountValid(discount: any): boolean {
    if (!discount.isActive) {
      return false;
    }

    const now = new Date();

    if (discount.startDate && now < discount.startDate) {
      return false;
    }

    if (discount.endDate && now > discount.endDate) {
      return false;
    }

    return true;
  }

  async toggleActive(id: string) {
    const discount = await this.findOne(id);

    return this.prisma.discount.update({
      where: { id },
      data: {
        isActive: !discount.isActive,
      },
    });
  }

  async generateCodeForCustomer(customerId: string, discountId: string, expiresAt: string) {
    const code = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 36).toString(36).toUpperCase()
    ).join('');
    const expires = new Date(expiresAt);
    return this.prisma.discountCode.create({
      data: {
        code,
        customerId,
        discountId,
        expiresAt: expires,
        isUsed: false,
      },
    });
  }
}
