import { orderRepository } from '@/lib/repositories';
import type { Order, CreateOrderInput, OrderStatus } from '@/types';

export const orderService = {
  async getAll(): Promise<Order[]> {
    return orderRepository.findAll();
  },

  async getById(id: string): Promise<Order | null> {
    return orderRepository.findById(id);
  },

  async getByShopId(shopId: string): Promise<Order[]> {
    return orderRepository.findByShopId(shopId);
  },

  async create(input: CreateOrderInput): Promise<Order> {
    const order: Order = {
      id: crypto.randomUUID(),
      shopId: input.shopId,
      tableNo: input.tableNo,
      items: input.items,
      totalPrice: input.totalPrice,
      status: 'new',
      createdAt: Date.now(),
    };
    return orderRepository.create(order as CreateOrderInput & { id: string });
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return orderRepository.update(id, { status });
  },

  async markAsServed(id: string): Promise<Order> {
    return orderRepository.update(id, { status: 'served' });
  },

  async markAsPaid(id: string): Promise<Order> {
    return orderRepository.update(id, { status: 'paid' });
  },
};
