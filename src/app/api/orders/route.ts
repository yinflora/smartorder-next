import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services';

// GET /api/orders - Get orders (with optional shopId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (shopId) {
      const orders = await orderService.getByShopId(shopId);
      return NextResponse.json(orders);
    }

    const orders = await orderService.getAll();
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

    // Calculate total price
    const totalPrice = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const order = await orderService.create({
      shopId: body.shopId,
      tableNo: body.tableNo,
      items: body.items,
      totalPrice,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
