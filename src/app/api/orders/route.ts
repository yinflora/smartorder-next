import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services';

// GET /api/orders - Get orders (with optional shopId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || undefined;
    const guestId = searchParams.get('guestId') || undefined;

    const orders = await orderService.getAll({ shopId, guestId });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.shopId || !body.tableNo || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'shopId, tableNo, and items are required' },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const order = await orderService.create({
      shopId: body.shopId,
      tableNo: body.tableNo,
      guestId: body.guestId,
      guestName: body.guestName,
      items: body.items,
      adjustments: body.adjustments,
      subtotal,
      totalPrice: subtotal, // Service 會重新計算
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
