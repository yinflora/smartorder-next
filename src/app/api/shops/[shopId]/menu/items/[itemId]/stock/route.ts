import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Stock } from '@/types';

type Params = { params: Promise<{ shopId: string; itemId: string }> };

// PUT /api/shops/[shopId]/menu/items/[itemId]/stock - Update menu item stock
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId } = await params;
    const body: Stock = await request.json();

    const menu = await menuService.updateMenuItemStock(shopId, itemId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating menu item stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
