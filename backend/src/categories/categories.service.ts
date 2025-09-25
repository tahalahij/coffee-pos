import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate required fields
    if (!createCategoryDto.name || createCategoryDto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    // Check for duplicate category name
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Check if exists

    // Check for duplicate category name (excluding current category)
    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async getActiveCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
