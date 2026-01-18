import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Availability } from '@/types';

type Params = { params: Promise<{ shopId: string; itemId: string; skuId: string }> };

// PUT /api/shops/[shopId]/menu/items/[itemId]/skus/[skuId]/availability - Update SKU availability
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId, skuId } = await params;
    const body: Availability = await request.json();

    const menu = await menuService.updateSkuAvailability(shopId, itemId, skuId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating SKU availability:', error);
    return NextResponse.json({ error: 'Failed to update SKU availability' }, { status: 500 });
  }
}
