import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, SearchCustomerDto } from './dto/customer.dto';

@Controller('customers')
export class CustomersController {

  constructor(private readonly customersService: CustomersService) {
    console.log('CustomersController initialized');
  }

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
  @Get('search')
  search(@Query('q') query: string) {
    return this.customersService.search(query);
  }

  @Get(':id/discount-codes')
  getDiscountCodes(@Param('id') id: string) {
    return this.customersService.getDiscountCodes(id);
  }

  @Get(':phone')
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

}

