import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './models/product.model';
import { Category, CategoryDocument } from '../categories/models/category.model';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Validate required fields
    if (!createProductDto.categoryId) {
      throw new BadRequestException('شناسه دسته‌بندی الزامی است');
    }

    // Check if category exists
    const category = await this.categoryModel.findById(createProductDto.categoryId);

    if (!category) {
      throw new BadRequestException('دسته‌بندی یافت نشد');
    }

    // Check if product name is unique
    const existingProduct = await this.productModel.findOne({
      name: createProductDto.name,
    });

    if (existingProduct) {
      throw new BadRequestException('نام محصول قبلاً وجود دارد');
    }

    // Check if SKU is unique (if provided)
    if (createProductDto.sku) {
      const existingSku = await this.productModel.findOne({
        sku: createProductDto.sku,
      });

      if (existingSku) {
        throw new BadRequestException('کد SKU قبلاً وجود دارد');
      }
    }

    const product = new this.productModel({
      ...createProductDto,
      categoryId: new Types.ObjectId(createProductDto.categoryId),
    });
    await product.save();
    
    const savedProduct = await this.productModel.findById(product._id).lean();
    const productCategory = await this.categoryModel.findById(savedProduct.categoryId).lean();
    return { ...savedProduct, id: savedProduct._id, category: productCategory };
  }

  async findAll(categoryId?: string, isAvailable?: boolean) {
    const filter: any = {};

    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (typeof isAvailable === 'boolean') {
      filter.isAvailable = isAvailable;
    }

    const products = await this.productModel.find(filter).sort({ name: 1 }).lean();
    
    // Get categories for products
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        const category = await this.categoryModel.findById(product.categoryId).lean();
        return { ...product, id: product._id, category };
      })
    );
    
    return productsWithCategory;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    const product = await this.productModel.findById(id).lean();

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    const category = await this.categoryModel.findById(product.categoryId).lean();
    return { ...product, id: product._id, category };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    // Check if category exists (if categoryId is being updated)
    if (updateProductDto.categoryId) {
      const category = await this.categoryModel.findById(updateProductDto.categoryId);
      if (!category) {
        throw new BadRequestException('دسته‌بندی یافت نشد');
      }
    }

    // Check if product name is unique (if name is being updated)
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.productModel.findOne({
        name: updateProductDto.name,
        _id: { $ne: id }
      });

      if (existingProduct) {
        throw new BadRequestException('نام محصول قبلاً وجود دارد');
      }
    }

    // Check if SKU is unique (if SKU is being updated)
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productModel.findOne({
        sku: updateProductDto.sku,
        _id: { $ne: id }
      });

      if (existingSku) {
        throw new BadRequestException('کد SKU قبلاً وجود دارد');
      }
    }

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.categoryId) {
      updateData.categoryId = new Types.ObjectId(updateProductDto.categoryId);
    }
    
    Object.assign(product, updateData);
    await product.save();
    
    const updatedProduct = await this.productModel.findById(id).lean();
    const category = await this.categoryModel.findById(updatedProduct.categoryId).lean();
    return { ...updatedProduct, id: updatedProduct._id, category };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    await this.productModel.findByIdAndDelete(id);
    return { message: 'محصول با موفقیت حذف شد' };
  }

  async updateStock(id: string, quantity: number) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('موجودی کافی نیست');
    }

    product.stock = newStock;
    return product.save();
  }

  async getLowStockProducts() {
    const products = await this.productModel.find({
      isAvailable: true,
      $expr: { $lte: ['$stock', '$minStockLevel'] }
    }).sort({ stock: 1 }).lean();
    
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        const category = await this.categoryModel.findById(product.categoryId).lean();
        return { ...product, id: product._id, category };
      })
    );
    
    return productsWithCategory;
  }
}

