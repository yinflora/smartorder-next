import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services';
import type { OrderAdjustment } from '@/types';

type Params = { params: Promise<{ orderId: string }> };

// POST /api/orders/[orderId]/adjustments - Add adjustment to order
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { orderId } = await params;
    const body: Omit<OrderAdjustment, 'id'> = await request.json();

    const order = await orderService.addAdjustment(orderId, body);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error adding adjustment:', error);
    return NextResponse.json({ error: 'Failed to add adjustment' }, { status: 500 });
  }
}
