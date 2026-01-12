'use client';

import { useState } from 'react';
import { Bell, Check, CreditCard, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useOrders } from '@/hooks/useOrders';
import { getErrorMessage } from '@/lib/errors';
import type { Order, OrderStatus } from '@/types';

interface OrderListProps {
  shopId: string;
  initialOrders: Order[];
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: '新訂單', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  served: { label: '已出餐', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  paid: { label: '已結帳', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
};

export function OrderList({ shopId, initialOrders }: OrderListProps) {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  // Use SWR hook with auto-refresh (replaces manual polling)
  const { orders: swrOrders, error, updateOrderStatus } = useOrders(shopId);

  // Use SWR data if available, fallback to initial data
  const orders = swrOrders.length > 0 ? swrOrders : initialOrders;

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error('更新訂單失敗:', getErrorMessage(err));
    }
  };

  // Show error state
  if (error) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <CardContent>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">{getErrorMessage(error)}</p>
          <p className="text-slate-500 text-sm mt-2">系統將自動重試</p>
        </CardContent>
      </Card>
    );
  }

  const filteredOrders = orders
    .filter((order) => filter === 'all' || order.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt);

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          size="sm"
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          全部 ({orders.length})
        </Button>
        <Button
          size="sm"
          variant={filter === 'new' ? 'primary' : 'outline'}
          onClick={() => setFilter('new')}
          className="relative"
        >
          新訂單 ({orders.filter((o) => o.status === 'new').length})
          {newOrdersCount > 0 && (
            <Bell className="w-4 h-4 ml-1 text-red-500 animate-pulse" />
          )}
        </Button>
        <Button
          size="sm"
          variant={filter === 'served' ? 'primary' : 'outline'}
          onClick={() => setFilter('served')}
        >
          已出餐 ({orders.filter((o) => o.status === 'served').length})
        </Button>
        <Button
          size="sm"
          variant={filter === 'paid' ? 'primary' : 'outline'}
          onClick={() => setFilter('paid')}
        >
          已結帳 ({orders.filter((o) => o.status === 'paid').length})
        </Button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <p className="text-slate-500">沒有訂單</p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            return (
              <Card
                key={order.id}
                variant="outlined"
                className={`${config.bgColor} border-2 ${order.status === 'new' ? 'animate-pulse' : ''}`}
              >
                <CardContent>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-slate-900">桌號 {order.tableNo}</span>
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-700">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-slate-600">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total & Time */}
                  <div className="flex justify-between items-center mb-4 pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-lg font-bold text-blue-600">${order.totalPrice}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === 'new' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUpdateStatus(order.id, 'served')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        出餐
                      </Button>
                    )}
                    {order.status === 'served' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUpdateStatus(order.id, 'paid')}
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        結帳
                      </Button>
                    )}
                    {order.status === 'paid' && (
                      <span className="text-sm text-green-600 text-center w-full">已完成</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
