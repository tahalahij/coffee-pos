import { Controller, Get, Post, Body } from '@nestjs/common';
import { DisplayGateway } from './display.gateway';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

@Controller('display')
export class DisplayController {
  constructor(private readonly displayGateway: DisplayGateway) {}

  @Get('status')
  getStatus() {
    return this.displayGateway.getConnectionStatus();
  }

  @Post('cart')
  updateCart(@Body() body: { items: CartItem[]; total: number }) {
    this.displayGateway.broadcastCartUpdate(body.items, body.total);
    return { success: true };
  }

  @Post('sale-complete')
  completeSale(@Body() body: { total: number }) {
    this.displayGateway.broadcastSaleComplete(body.total);
    return { success: true };
  }
}
