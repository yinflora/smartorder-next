import { createJsonRepository } from './json-storage';
import type { Order, CreateOrderInput, UpdateOrderInput } from '@/types';

const baseRepository = createJsonRepository<Order, CreateOrderInput, UpdateOrderInput>(
  'orders.json'
);

export const orderRepository = {
  ...baseRepository,

  async findByShopId(shopId: string): Promise<Order[]> {
    return baseRepository.findByField('shopId', shopId);
  },

  async findByStatus(status: Order['status']): Promise<Order[]> {
    return baseRepository.findByField('status', status);
  },
};
