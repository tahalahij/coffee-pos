import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartUpdate {
  type: 'CART_UPDATE';
  payload: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
}

interface SaleComplete {
  type: 'SALE_COMPLETE';
  payload: {
    total: number;
    timestamp: string;
  };
}

type DisplayMessage = CartUpdate | SaleComplete;

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
  },
  path: '/display',
  transports: ['websocket', 'polling'],
})
export class DisplayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(DisplayGateway.name);
  private connectedClients = new Set<string>();
  private currentCartState: CartUpdate['payload'] | null = null;

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);

    // Send current cart state to newly connected client
    if (this.currentCartState) {
      client.emit('message', {
        type: 'CART_UPDATE',
        payload: this.currentCartState,
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: DisplayMessage,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.debug(`Received message from ${client.id}: ${data.type}`);

    // Update cart state cache
    if (data.type === 'CART_UPDATE') {
      this.currentCartState = data.payload;
    } else if (data.type === 'SALE_COMPLETE') {
      // Clear cart state after sale
      this.currentCartState = {
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    // Broadcast to all connected clients (including display windows)
    this.server.emit('message', data);
  }

  /**
   * Broadcast cart update to all display clients
   * This can be called from other services/controllers
   */
  broadcastCartUpdate(items: CartItem[], total: number): void {
    const message: CartUpdate = {
      type: 'CART_UPDATE',
      payload: {
        items,
        total,
        itemCount: items.length,
      },
    };

    this.currentCartState = message.payload;
    this.server.emit('message', message);
    this.logger.debug(`Broadcasting cart update: ${items.length} items, $${total}`);
  }

  /**
   * Broadcast sale completion to all display clients
   */
  broadcastSaleComplete(total: number): void {
    const message: SaleComplete = {
      type: 'SALE_COMPLETE',
      payload: {
        total,
        timestamp: new Date().toISOString(),
      },
    };

    this.server.emit('message', message);
    this.logger.debug(`Broadcasting sale complete: $${total}`);

    // Clear cart state
    this.currentCartState = {
      items: [],
      total: 0,
      itemCount: 0,
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: number; hasDisplay: boolean } {
    return {
      connected: this.connectedClients.size,
      hasDisplay: this.connectedClients.size > 0,
    };
  }
}
