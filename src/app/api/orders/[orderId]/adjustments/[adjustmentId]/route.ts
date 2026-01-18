import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services';
import type { OrderAdjustment } from '@/types';

type Params = { params: Promise<{ orderId: string; adjustmentId: string }> };

// PATCH /api/orders/[orderId]/adjustments/[adjustmentId] - Update adjustment
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { orderId, adjustmentId } = await params;
    const body: Partial<OrderAdjustment> = await request.json();

    const order = await orderService.updateAdjustment(orderId, adjustmentId, body);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating adjustment:', error);
    return NextResponse.json({ error: 'Failed to update adjustment' }, { status: 500 });
  }
}

// DELETE /api/orders/[orderId]/adjustments/[adjustmentId] - Remove adjustment
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { orderId, adjustmentId } = await params;

    const order = await orderService.removeAdjustment(orderId, adjustmentId);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error removing adjustment:', error);
    return NextResponse.json({ error: 'Failed to remove adjustment' }, { status: 500 });
  }
}
