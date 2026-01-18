import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Stock } from '@/types';

type Params = { params: Promise<{ shopId: string; itemId: string; skuId: string }> };

// PUT /api/shops/[shopId]/menu/items/[itemId]/skus/[skuId]/stock - Update SKU stock
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId, skuId } = await params;
    const body: Stock = await request.json();

    const menu = await menuService.updateSkuStock(shopId, itemId, skuId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating SKU stock:', error);
    return NextResponse.json({ error: 'Failed to update SKU stock' }, { status: 500 });
  }
}
