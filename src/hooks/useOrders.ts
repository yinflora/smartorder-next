import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import type { Order, CreateOrderInput, UpdateOrderInput, OrderStatus } from '@/types';

const ORDERS_KEY = '/api/orders';

export function useOrders(shopId: string | null) {
  const key = shopId ? `${ORDERS_KEY}?shopId=${shopId}` : null;

  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    key,
    () => apiClient.get<Order[]>(ORDERS_KEY, { params: { shopId: shopId! } }),
    {
      // Enable auto-refresh every 5 seconds for order list
      refreshInterval: 5000,
      // Revalidate on mount to get fresh data
      revalidateOnMount: true,
    }
  );

  const createOrder = async (input: CreateOrderInput) => {
    const newOrder = await apiClient.post<Order>(ORDERS_KEY, input);
    mutate();
    return newOrder;
  };

  // Optimistic update for status changes
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const optimisticData = data?.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );

    await mutate(
      async () => {
        await apiClient.patch<Order>(`${ORDERS_KEY}/${orderId}`, { status });
        return optimisticData;
      },
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  // Backward compatible update method
  const updateOrder = async (orderId: string, input: UpdateOrderInput) => {
    if (input.status) {
      return updateOrderStatus(orderId, input.status);
    }
    const updated = await apiClient.patch<Order>(`${ORDERS_KEY}/${orderId}`, input);
    mutate();
    return updated;
  };

  return {
    orders: data ?? [],
    isLoading,
    error,
    mutate,
    createOrder,
    updateOrder,
    updateOrderStatus,
  };
}
