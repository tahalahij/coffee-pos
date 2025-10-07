import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ProductsService } from './products.service';
import { Product } from './models/product.model';
import { Category } from '../categories/models/category.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;
  let categoryModel: typeof Category;

  const mockProductModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCategoryModel = {
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Category),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<typeof Product>(getModelToken(Product));
    categoryModel = module.get<typeof Category>(getModelToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Coffee',
          price: 5.99,
          category: { name: 'Beverages' },
        },
      ];

      mockProductModel.findAll.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(mockProductModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});
