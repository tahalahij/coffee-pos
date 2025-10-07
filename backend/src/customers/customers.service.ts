import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from './models/customer.model';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Op } from 'sequelize';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer)
    private customerModel: typeof Customer,
  ) {}

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
    const existingCustomer = await this.customerModel.findOne({
      where: { phone: data.phone },
    });

    if (existingCustomer) {
      throw new ConflictException('Phone number already exists');
    }

    // Check for duplicate email if provided
    if (data.email) {
      const existingEmail = await this.customerModel.findOne({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.customerModel.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      loyaltyPoints: 0,
      totalSpent: 0,
      isActive: true,
    });
  }

  async findAll() {
    return this.customerModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number) {
    const customer = await this.customerModel.findByPk(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, updateData: UpdateCustomerDto) {
    const customer = await this.customerModel.findByPk(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check for duplicate phone if phone is being updated
    if (updateData.phone && updateData.phone !== customer.phone) {
      const existingPhone = await this.customerModel.findOne({
        where: {
          phone: updateData.phone,
          id: { [Op.ne]: id }
        },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== customer.email) {
      const existingEmail = await this.customerModel.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: id }
        },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Transform updateData to handle dateOfBirth conversion
    const transformedData = {
      ...updateData,
      ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) })
    };

    await customer.update(transformedData);
    return customer;
  }

  async remove(id: number) {
    const customer = await this.customerModel.findByPk(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await customer.destroy();
    return { message: 'Customer deleted successfully' };
  }

  async search(query: string) {
    return this.customerModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
      order: [['name', 'ASC']],
      limit: 10,
    });
  }

  async addLoyaltyPoints(id: number, points: number) {
    const customer = await this.customerModel.findByPk(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await customer.increment('loyaltyPoints', { by: points });
    return customer.reload();
  }

  async updateTotalSpent(id: number, amount: number) {
    const customer = await this.customerModel.findByPk(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await customer.increment('totalSpent', { by: amount });
    return customer.reload();
  }
}
