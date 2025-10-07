import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './models/product.model';
import { Category } from '../categories/models/category.model';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Op } from 'sequelize';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Validate required fields
    if (!createProductDto.categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    // Check if category exists
    const category = await this.categoryModel.findByPk(createProductDto.categoryId);

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Check if product name is unique
    const existingProduct = await this.productModel.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new BadRequestException('Product name already exists');
    }

    // Check if SKU is unique (if provided)
    if (createProductDto.sku) {
      const existingSku = await this.productModel.findOne({
        where: { sku: createProductDto.sku },
      });

      if (existingSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    const product = await this.productModel.create(createProductDto);
    return this.productModel.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }],
    });
  }

  async findAll(categoryId?: number, isAvailable?: boolean) {
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (typeof isAvailable === 'boolean') {
      where.isAvailable = isAvailable;
    }

    return this.productModel.findAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number) {
    const product = await this.productModel.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if category exists (if categoryId is being updated)
    if (updateProductDto.categoryId) {
      const category = await this.categoryModel.findByPk(updateProductDto.categoryId);
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check if product name is unique (if name is being updated)
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.productModel.findOne({
        where: {
          name: updateProductDto.name,
          id: { [Op.ne]: id }
        },
      });

      if (existingProduct) {
        throw new BadRequestException('Product name already exists');
      }
    }

    // Check if SKU is unique (if SKU is being updated)
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productModel.findOne({
        where: {
          sku: updateProductDto.sku,
          id: { [Op.ne]: id }
        },
      });

      if (existingSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    await product.update(updateProductDto);
    return this.productModel.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });
  }

  async remove(id: number) {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await product.destroy();
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id: number, quantity: number) {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    await product.update({ stock: newStock });
    return product;
  }

  async getLowStockProducts() {
    return this.productModel.findAll({
      where: {
        stock: { [Op.lte]: this.productModel.sequelize.col('min_stock_level') },
        isAvailable: true,
      },
      include: [{ model: Category, as: 'category' }],
      order: [['stock', 'ASC']],
    });
  }
}
