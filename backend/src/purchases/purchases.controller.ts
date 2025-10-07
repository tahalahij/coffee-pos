import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dto/purchase.dto';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases' })
  @ApiResponse({ status: 200, description: 'Purchases retrieved successfully' })
  findAll() {
    return this.purchasesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiResponse({ status: 200, description: 'Purchase retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update purchase' })
  @ApiResponse({ status: 200, description: 'Purchase updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchasesService.update(parseInt(id), updatePurchaseDto);
  }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark purchase as received and update inventory' })
  @ApiResponse({ status: 200, description: 'Purchase marked as received successfully' })
  @ApiResponse({ status: 400, description: 'Cannot receive this purchase' })
  markAsReceived(@Param('id') id: string) {
    return this.purchasesService.markAsReceived(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this purchase' })
  cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.purchasesService.cancel(id, body.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete purchase order' })
  @ApiResponse({ status: 204, description: 'Purchase deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete received purchase' })
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(parseInt(id));
  }
}
