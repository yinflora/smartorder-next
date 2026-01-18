import { orderRepository } from '@/lib/repositories';
import type { Order, CreateOrderInput, OrderStatus, OrderAdjustment } from '@/types';

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
    // 計算 subtotal (items 總和)
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 計算 totalPrice (subtotal + adjustments)
    let totalPrice = subtotal;
    if (input.adjustments && input.adjustments.length > 0) {
      const adjustmentsTotal = input.adjustments.reduce(
        (sum, adj) => sum + adj.amount,
        0
      );
      totalPrice = subtotal + adjustmentsTotal;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      shopId: input.shopId,
      tableNo: input.tableNo,
      items: input.items,
      adjustments: input.adjustments,
      subtotal,
      totalPrice,
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

  // OrderAdjustment Management (加扣項管理)
  async addAdjustment(orderId: string, adjustment: Omit<OrderAdjustment, 'id'>): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const newAdjustment: OrderAdjustment = {
      ...adjustment,
      id: crypto.randomUUID(),
    };

    const updatedAdjustments = [...(order.adjustments || []), newAdjustment];

    // 重新計算 totalPrice
    const adjustmentsTotal = updatedAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const totalPrice = order.subtotal + adjustmentsTotal;

    return orderRepository.update(orderId, {
      adjustments: updatedAdjustments,
      totalPrice,
    });
  },

  async updateAdjustment(orderId: string, adjustmentId: string, updates: Partial<OrderAdjustment>): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const updatedAdjustments = (order.adjustments || []).map((adj) =>
      adj.id === adjustmentId ? { ...adj, ...updates } : adj
    );

    // 重新計算 totalPrice
    const adjustmentsTotal = updatedAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const totalPrice = order.subtotal + adjustmentsTotal;

    return orderRepository.update(orderId, {
      adjustments: updatedAdjustments,
      totalPrice,
    });
  },

  async removeAdjustment(orderId: string, adjustmentId: string): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const updatedAdjustments = (order.adjustments || []).filter((adj) => adj.id !== adjustmentId);

    // 重新計算 totalPrice
    const adjustmentsTotal = updatedAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const totalPrice = order.subtotal + adjustmentsTotal;

    return orderRepository.update(orderId, {
      adjustments: updatedAdjustments,
      totalPrice,
    });
  },

  // Utility: 計算 adjustment 的 amount (根據 type 和 valueType)
  calculateAdjustmentAmount(subtotal: number, adjustment: Omit<OrderAdjustment, 'id' | 'amount'>): number {
    let amount = 0;

    if (adjustment.valueType === 'fixed') {
      amount = adjustment.value;
    } else if (adjustment.valueType === 'percentage') {
      amount = (subtotal * adjustment.value) / 100;
    }

    // discount 為負數, surcharge 為正數
    return adjustment.type === 'discount' ? -amount : amount;
  },
};
