import { NextRequest, NextResponse } from 'next/server';
import { shopService } from '@/services';

type Params = { params: Promise<{ shopId: string }> };

// GET /api/shops/[shopId] - Get a single shop
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const shop = await shopService.getById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 });
  }
}

// PUT /api/shops/[shopId] - Update a shop
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const body = await request.json();

    const shop = await shopService.update(shopId, body);
    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
  }
}

// DELETE /api/shops/[shopId] - Delete a shop
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    await shopService.delete(shopId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ error: 'Failed to delete shop' }, { status: 500 });
  }
}
