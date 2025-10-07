import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { SalesService } from './sales.service';
import { Sale } from './models/sale.model';
import { SaleItem } from './models/sale-item.model';
import { Product } from '../products/models/product.model';
import { ProductsService } from '../products/products.service';
import { CreateSaleDto, PaymentMethod } from './dto/sale.dto';

describe('SalesService', () => {
  let service: SalesService;
  let saleModel: typeof Sale;
  let saleItemModel: typeof SaleItem;

  const mockSaleModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    sequelize: {
      transaction: jest.fn(),
    },
  };

  const mockSaleItemModel = {
    create: jest.fn(),
  };

  const mockProductModel = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    decrement: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(Sale),
          useValue: mockSaleModel,
        },
        {
          provide: getModelToken(SaleItem),
          useValue: mockSaleItemModel,
        },
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleModel = module.get<typeof Sale>(getModelToken(Sale));
    saleItemModel = module.get<typeof SaleItem>(getModelToken(SaleItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of sales', async () => {
      const mockSales = [
        {
          id: 1,
          receiptNumber: 'REC-001',
          subtotal: 21.00,
          totalAmount: 21.00,
        },
      ];

      mockSaleModel.findAll.mockResolvedValue(mockSales);

      const result = await service.findAll({});

      expect(mockSaleModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSales);
    });
  });
});
