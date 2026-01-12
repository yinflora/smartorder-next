import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services';
import type { OrderStatus } from '@/types';

type Params = { params: Promise<{ orderId: string }> };

// GET /api/orders/[orderId] - Get a single order
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { orderId } = await params;
    const order = await orderService.getById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[orderId] - Update order status
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses: OrderStatus[] = ['new', 'served', 'paid'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, served, or paid' },
        { status: 400 }
      );
    }

    const order = await orderService.updateStatus(orderId, body.status);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
