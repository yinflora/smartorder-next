import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Availability } from '@/types';

type Params = { params: Promise<{ shopId: string; itemId: string }> };

// PUT /api/shops/[shopId]/menu/items/[itemId]/availability - Update menu item availability
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId } = await params;
    const body: Availability = await request.json();

    const menu = await menuService.updateMenuItemAvailability(shopId, itemId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
