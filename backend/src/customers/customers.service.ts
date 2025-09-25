import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCustomerDto) {
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException('Customer name is required');
    }

    if (!data.phone || data.phone.trim() === '') {
      throw new BadRequestException('Phone number is required');
    }

    // Validate phone number format
    if (!/^\+?\d{10,15}$/.test(data.phone.replace(/\s/g, ''))) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Check for duplicate phone number
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { phone: data.phone },
    });

    if (existingCustomer) {
      throw new ConflictException('Phone number already exists');
    }

    // Check for duplicate email if provided
    if (data.email) {
      const existingEmail = await this.prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        loyaltyTier: 'BRONZE',
        loyaltyPoints: 0,
        totalSpent: 0,
        visitCount: 0,
      }
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        discountCodes: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, data: UpdateCustomerDto) {
    // Check if customer exists
    await this.findOne(id);

    // Check for duplicate phone number (excluding current customer)
    if (data.phone) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          phone: data.phone,
          NOT: { id },
        },
      });

      if (existingCustomer) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Check for duplicate email (excluding current customer)
    if (data.email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });
  }

  async remove(id: string) {
    // Check if customer exists
    await this.findOne(id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findUnique({ where: { phone } });
  }

  async search(query: string) {
    if (!query || query.trim() === '') {
      return [];
    }

    try {
      return await this.prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
        take: 10,
      });
    } catch (error) {
      throw new BadRequestException('Failed to search customers');
    }
  }

  async getDiscountCodes(customerId: string) {
    // Check if customer exists
    await this.findOne(customerId);

    return this.prisma.discountCode.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateDiscountCode(customerId: string, data: { type: string; value: number; expiresAt?: string }) {
    // Check if customer exists
    await this.findOne(customerId);

    // Generate unique code
    const code = this.generateUniqueCode();

    return this.prisma.discountCode.create({
      data: {
        code,
        name: 'Customer Discount',
        description: 'Generated discount code for customer',
        type: data.type as any,
        value: data.value,
        customerId,
        usageLimit: 1,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  private generateUniqueCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
