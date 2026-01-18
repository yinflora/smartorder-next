import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Sku } from '@/types';

type Params = { params: Promise<{ shopId: string; itemId: string; skuId: string }> };

// PATCH /api/shops/[shopId]/menu/items/[itemId]/skus/[skuId] - Update a SKU
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId, skuId } = await params;
    const body: Partial<Sku> = await request.json();

    const menu = await menuService.updateSku(shopId, itemId, skuId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating SKU:', error);
    return NextResponse.json({ error: 'Failed to update SKU' }, { status: 500 });
  }
}

// DELETE /api/shops/[shopId]/menu/items/[itemId]/skus/[skuId] - Remove a SKU
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId, skuId } = await params;

    const menu = await menuService.removeSku(shopId, itemId, skuId);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error removing SKU:', error);
    return NextResponse.json({ error: 'Failed to remove SKU' }, { status: 500 });
  }
}
