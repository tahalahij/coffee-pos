import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Validate required fields
    if (!createProductDto.categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Check if SKU is unique (if provided)
    if (createProductDto.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: createProductDto.sku },
      });

      if (existingSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  async findAll(categoryId?: string, isAvailable?: boolean) {
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (typeof isAvailable === 'boolean') {
      where.isAvailable = isAvailable;
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Check if exists

    // Check if new category exists (if provided)
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check if new SKU is unique (if provided)
    if (updateProductDto.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          NOT: { id },
        },
      });

      if (existingSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' = 'add') {
    const product = await this.findOne(id);

    // Ensure product.stock is a valid number
    const currentStock = typeof product.stock === 'number' ? product.stock : 0;

    const newStock = operation === 'add'
      ? currentStock + quantity
      : currentStock - quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    // Ensure newStock is a valid integer
    const stockToUpdate = Math.floor(newStock);

    return this.prisma.product.update({
      where: { id },
      data: { stock: stockToUpdate },
      include: {
        category: true,
      },
    });
  }

  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: {
        AND: [
          { lowStockAlert: { not: null } },
          { stock: { lte: 10 } }, // Use a fixed threshold for now
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });
  }

  async getProductsByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        isAvailable: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
