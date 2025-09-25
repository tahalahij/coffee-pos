import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, SearchCustomerDto } from './dto/customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Phone number or email already exists' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query('q') query: string) {
    return this.customersService.search(query);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Find customer by phone number' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Phone number or email already exists' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Get(':id/discount-codes')
  @ApiOperation({ summary: 'Get customer discount codes' })
  @ApiResponse({ status: 200, description: 'Discount codes retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getDiscountCodes(@Param('id') id: string) {
    return this.customersService.getDiscountCodes(id);
  }

  @Post(':id/discount-codes')
  @ApiOperation({ summary: 'Generate discount code for customer' })
  @ApiResponse({ status: 201, description: 'Discount code generated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  generateDiscountCode(
    @Param('id') id: string,
    @Body() data: { type: string; value: number; expiresAt?: string }
  ) {
    return this.customersService.generateDiscountCode(id, data);
  }
}
