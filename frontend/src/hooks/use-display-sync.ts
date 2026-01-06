import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DisplayState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface DisplayMessage {
  type: 'CART_UPDATE' | 'SALE_COMPLETE';
  payload: any;
}

export function useDisplaySync() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [displayState, setDisplayState] = useState<DisplayState>({
    items: [],
    total: 0,
    itemCount: 0,
  });

  useEffect(() => {
    const backendUrl = `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 3001}`;
    
    const socketInstance = io(backendUrl, {
      path: '/display',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      console.log('Display socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Display socket disconnected');
      setConnected(false);
    });

    socketInstance.on('message', (data: DisplayMessage) => {
      console.log('Received message:', data);
      
      if (data.type === 'CART_UPDATE') {
        setDisplayState(data.payload);
      } else if (data.type === 'SALE_COMPLETE') {
        // Show thank you message briefly, then clear
        setTimeout(() => {
          setDisplayState({
            items: [],
            total: 0,
            itemCount: 0,
          });
        }, 3000);
      }
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendCartUpdate = useCallback((items: CartItem[], total: number) => {
    if (socket && connected) {
      socket.emit('message', {
        type: 'CART_UPDATE',
        payload: {
          items,
          total,
          itemCount: items.length,
        },
      });
    }
  }, [socket, connected]);

  const sendSaleComplete = useCallback((total: number) => {
    if (socket && connected) {
      socket.emit('message', {
        type: 'SALE_COMPLETE',
        payload: {
          total,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [socket, connected]);

  return {
    connected,
    displayState,
    sendCartUpdate,
    sendSaleComplete,
  };
}
