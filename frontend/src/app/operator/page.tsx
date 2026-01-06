'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/hooks/use-cart-store';
import { useProductStore } from '@/hooks/use-product-store';
import { useSalesStore } from '@/hooks/use-sales-store';
import { useDisplaySync } from '@/hooks/use-display-sync';
import { POSInterface } from '@/components/pos/POSInterface';
import { Monitor, TrendingUp, Package, Users } from 'lucide-react';

export default function OperatorPage() {
  const cart = useCartStore();
  const products = useProductStore();
  const sales = useSalesStore();
  const { connected: wsConnected, sendCartUpdate, sendSaleComplete } = useDisplaySync();

  // Sync cart changes to display
  useEffect(() => {
    if (wsConnected) {
      sendCartUpdate(cart.items, cart.total);
    }
  }, [cart.items, cart.total, wsConnected, sendCartUpdate]);

  const handleCompleteSale = async () => {
    const cartItems = cart.items;
    const total = cart.total;

    // Process sale through backend
    try {
      // Your existing sale logic here
      await sales.addSale({
        items: cartItems,
        total,
        timestamp: new Date(),
      });

      // Notify display of sale completion
      sendSaleComplete(total);

      // Clear cart after successful sale
      cart.clearCart();
    } catch (error) {
      console.error('Sale failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Operator Terminal</h1>
            <p className="text-gray-600">Point of Sale System</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <Monitor className="w-4 h-4" />
              <span className="text-sm font-medium">
                Display {wsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pos" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            POS
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-4">
          <POSInterface onCompleteSale={handleCompleteSale} />
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>View and manage sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Your existing sales components */}
              <p className="text-gray-500">Sales history component here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Your existing product components */}
              <p className="text-gray-500">Product management component here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Manage customer information and loyalty</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Your existing customer components */}
              <p className="text-gray-500">Customer management component here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
