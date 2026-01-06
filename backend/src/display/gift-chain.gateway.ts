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

interface GiftUnit {
  id: string;
  giftedByName: string;
  productName: string;
  productType?: string;
  createdAt: string;
  claimedAt?: string;
  continuedAt?: string;
  chainPosition: number;
}

interface GiftUnitCreated {
  type: 'GIFT_UNIT_CREATED';
  payload: GiftUnit;
}

interface GiftUnitClaimed {
  type: 'GIFT_UNIT_CLAIMED';
  payload: {
    giftUnitId: string;
    claimedAt: string;
  };
}

interface GiftChainContinued {
  type: 'GIFT_CHAIN_CONTINUED';
  payload: {
    giftUnitId: string;
    continuedAt: string;
    newGiftUnit: GiftUnit;
  };
}

interface GiftStateUpdate {
  type: 'GIFT_STATE_UPDATE';
  payload: {
    activeChains: GiftUnit[][];
    recentGifts: GiftUnit[];
  };
}

type GiftChainMessage = GiftUnitCreated | GiftUnitClaimed | GiftChainContinued | GiftStateUpdate;

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
  },
  path: '/gift-chain',
  namespace: 'gift-chain',
  transports: ['websocket', 'polling'],
})
export class GiftChainGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(GiftChainGateway.name);
  private connectedClients = new Set<string>();
  private giftChainState: GiftStateUpdate['payload'] = {
    activeChains: [],
    recentGifts: [],
  };

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(`Gift Chain client connected: ${client.id} (Total: ${this.connectedClients.size})`);

    // Send current gift chain state to newly connected client
    client.emit('gift-chain-message', {
      type: 'GIFT_STATE_UPDATE',
      payload: this.giftChainState,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Gift Chain client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('gift-chain-message')
  handleMessage(
    @MessageBody() data: GiftChainMessage,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.debug(`Received gift chain message from ${client.id}: ${data.type}`);

    // Update internal state based on message type
    this.updateInternalState(data);

    // Broadcast to all connected clients
    this.server.emit('gift-chain-message', data);
  }

  @SubscribeMessage('request-gift-state')
  handleRequestGiftState(@ConnectedSocket() client: Socket): void {
    this.logger.debug(`Client ${client.id} requested gift state`);
    
    client.emit('gift-chain-message', {
      type: 'GIFT_STATE_UPDATE',
      payload: this.giftChainState,
    });
  }

  /**
   * Broadcast gift unit created event
   * This can be called from other services when a gift is created
   */
  broadcastGiftCreated(giftUnit: GiftUnit): void {
    const message: GiftUnitCreated = {
      type: 'GIFT_UNIT_CREATED',
      payload: giftUnit,
    };

    this.updateInternalState(message);
    this.server.emit('gift-chain-message', message);
    this.logger.log(`Broadcasted GIFT_UNIT_CREATED: ${giftUnit.id}`);
  }

  /**
   * Broadcast gift unit claimed event
   */
  broadcastGiftClaimed(giftUnitId: string, claimedAt: string): void {
    const message: GiftUnitClaimed = {
      type: 'GIFT_UNIT_CLAIMED',
      payload: { giftUnitId, claimedAt },
    };

    this.updateInternalState(message);
    this.server.emit('gift-chain-message', message);
    this.logger.log(`Broadcasted GIFT_UNIT_CLAIMED: ${giftUnitId}`);
  }

  /**
   * Broadcast gift chain continued event
   */
  broadcastGiftChainContinued(giftUnitId: string, continuedAt: string, newGiftUnit: GiftUnit): void {
    const message: GiftChainContinued = {
      type: 'GIFT_CHAIN_CONTINUED',
      payload: { giftUnitId, continuedAt, newGiftUnit },
    };

    this.updateInternalState(message);
    this.server.emit('gift-chain-message', message);
    this.logger.log(`Broadcasted GIFT_CHAIN_CONTINUED: ${giftUnitId} -> ${newGiftUnit.id}`);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.connectedClients.size,
      hasDisplay: this.connectedClients.size > 0,
      activeChains: this.giftChainState.activeChains.length,
      recentGifts: this.giftChainState.recentGifts.length,
    };
  }

  /**
   * Update internal state based on received message
   */
  private updateInternalState(message: GiftChainMessage): void {
    switch (message.type) {
      case 'GIFT_UNIT_CREATED': {
        const giftUnit = message.payload;
        
        // Add to recent gifts
        this.giftChainState.recentGifts = [
          giftUnit,
          ...this.giftChainState.recentGifts,
        ].slice(0, 10); // Keep only last 10

        // Update active chains
        if (giftUnit.chainPosition > 1) {
          // Find the chain this belongs to
          const chainIndex = this.giftChainState.activeChains.findIndex((chain) =>
            chain.some((unit) => unit.chainPosition === giftUnit.chainPosition - 1)
          );

          if (chainIndex !== -1) {
            this.giftChainState.activeChains[chainIndex] = [
              ...this.giftChainState.activeChains[chainIndex],
              giftUnit,
            ];
          } else {
            // Start new chain if not found
            this.giftChainState.activeChains.push([giftUnit]);
          }
        } else {
          // New chain
          this.giftChainState.activeChains.push([giftUnit]);
        }
        break;
      }

      case 'GIFT_UNIT_CLAIMED': {
        const { giftUnitId, claimedAt } = message.payload;

        // Update recent gifts
        this.giftChainState.recentGifts = this.giftChainState.recentGifts.map((gift) =>
          gift.id === giftUnitId ? { ...gift, claimedAt } : gift
        );

        // Update active chains
        this.giftChainState.activeChains = this.giftChainState.activeChains.map((chain) =>
          chain.map((gift) =>
            gift.id === giftUnitId ? { ...gift, claimedAt } : gift
          )
        );
        break;
      }

      case 'GIFT_CHAIN_CONTINUED': {
        const { giftUnitId, continuedAt, newGiftUnit } = message.payload;

        // Mark original gift as continued
        this.giftChainState.recentGifts = this.giftChainState.recentGifts.map((gift) =>
          gift.id === giftUnitId ? { ...gift, continuedAt } : gift
        );

        // Add new gift to recent gifts
        this.giftChainState.recentGifts = [
          newGiftUnit,
          ...this.giftChainState.recentGifts,
        ].slice(0, 10);

        // Update active chains
        this.giftChainState.activeChains = this.giftChainState.activeChains.map((chain) => {
          const giftIndex = chain.findIndex((gift) => gift.id === giftUnitId);
          if (giftIndex !== -1) {
            const updatedChain = chain.map((gift) =>
              gift.id === giftUnitId ? { ...gift, continuedAt } : gift
            );
            return [...updatedChain, newGiftUnit];
          }
          return chain;
        });
        break;
      }

      case 'GIFT_STATE_UPDATE': {
        this.giftChainState = message.payload;
        break;
      }
    }
  }
}
