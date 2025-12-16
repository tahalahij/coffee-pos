import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './models/customer.model';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
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
      phone: data.phone,
    });

    if (existingCustomer) {
      throw new ConflictException('Phone number already exists');
    }

    // Check for duplicate email if provided
    if (data.email) {
      const existingEmail = await this.customerModel.findOne({
        email: data.email,
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const customer = new this.customerModel({
      name: data.name,
      phone: data.phone,
      email: data.email,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      loyaltyPoints: 0,
      totalSpent: 0,
      isActive: true,
    });
    
    return customer.save();
  }

  async findAll() {
    return this.customerModel.find().sort({ name: 1 }).lean().exec().then(customers => 
      customers.map(c => ({ ...c, id: c._id }))
    );
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customer = await this.customerModel.findById(id).lean();

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return { ...customer, id: customer._id };
  }

  async update(id: string, updateData: UpdateCustomerDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check for duplicate phone if phone is being updated
    if (updateData.phone && updateData.phone !== customer.phone) {
      const existingPhone = await this.customerModel.findOne({
        phone: updateData.phone,
        _id: { $ne: id }
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== customer.email) {
      const existingEmail = await this.customerModel.findOne({
        email: updateData.email,
        _id: { $ne: id }
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

    Object.assign(customer, transformedData);
    return customer.save();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.customerModel.findByIdAndDelete(id);
    return { message: 'Customer deleted successfully' };
  }

  async search(query: string) {
    const searchRegex = new RegExp(query, 'i');
    const customers = await this.customerModel.find({
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ],
    }).sort({ name: 1 }).limit(10).lean();
    
    return customers.map(c => ({ ...c, id: c._id }));
  }

  async addLoyaltyPoints(id: string, points: number) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    customer.loyaltyPoints += points;
    return customer.save();
  }

  async updateTotalSpent(id: string, amount: number) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    customer.totalSpent += amount;
    return customer.save();
  }
}
