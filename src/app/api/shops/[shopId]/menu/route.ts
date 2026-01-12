import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';

type Params = { params: Promise<{ shopId: string }> };

// GET /api/shops/[shopId]/menu - Get menu for a shop
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const menu = await menuService.getByShopId(shopId);

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

// PUT /api/shops/[shopId]/menu - Update menu for a shop
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const body = await request.json();

    const menu = await menuService.update(shopId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}
