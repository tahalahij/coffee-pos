import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './models/category.model';
import { Product, ProductDocument } from '../products/models/product.model';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate required fields
    if (!createCategoryDto.name || createCategoryDto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    // Check for duplicate category name
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });

    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAll() {
    const categories = await this.categoryModel.find().sort({ name: 1 }).lean();
    
    // Get products for each category
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await this.productModel
          .find({ categoryId: category._id })
          .select('_id name price isAvailable')
          .lean();
        return { ...category, id: category._id, products };
      })
    );
    
    return categoriesWithProducts;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category = await this.categoryModel.findById(id).lean();

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const products = await this.productModel
      .find({ categoryId: category._id })
      .select('_id name price isAvailable stock')
      .lean();

    return { ...category, id: category._id, products };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check for duplicate name if name is being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
      });

      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return category.save();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has products
    const productCount = await this.productModel.countDocuments({ categoryId: category._id });
    if (productCount > 0) {
      throw new BadRequestException('Cannot delete category with existing products');
    }

    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted successfully' };
  }

  async getActiveCategories() {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await this.productModel
          .find({ categoryId: category._id, isAvailable: true })
          .select('_id name price isAvailable')
          .lean();
        return { ...category, id: category._id, products };
      })
    );
    
    return categoriesWithProducts;
  }
}

