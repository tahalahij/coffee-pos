import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { Product } from '../products/models/product.model';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate required fields
    if (!createCategoryDto.name || createCategoryDto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    // Check for duplicate category name
    const existingCategory = await this.categoryModel.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    return this.categoryModel.create(createCategoryDto);
  }

  async findAll() {
    return this.categoryModel.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'isAvailable'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number) {
    const category = await this.categoryModel.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'isAvailable', 'stock'],
        },
      ],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check for duplicate name if name is being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryModel.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    await category.update(updateCategoryDto);
    return category;
  }

  async remove(id: number) {
    const category = await this.categoryModel.findByPk(id, {
      include: [{ model: Product, as: 'products' }],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new BadRequestException('Cannot delete category with existing products');
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
  }

  async getActiveCategories() {
    return this.categoryModel.findAll({
      where: { isActive: true },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'isAvailable'],
          where: { isAvailable: true },
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
  }
}
