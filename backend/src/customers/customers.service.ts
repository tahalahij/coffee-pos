import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCustomerDto) {
    return this.prisma.customer.create({ data });
  }

  async findAll() {
    return this.prisma.customer.findMany();
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
          ],
        },
      });
    } catch (error) {
      // Optionally log error here
      throw new Error('Failed to search customers');
    }
  }

  async getDiscountCodes(customerId: string) {
    return this.prisma.discountCode.findMany({
      where: { customerId },
      orderBy: { expiresAt: 'desc' },
    });
  }
}
