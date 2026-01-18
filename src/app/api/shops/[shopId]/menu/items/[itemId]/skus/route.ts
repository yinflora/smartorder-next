import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Sku } from '@/types';

type Params = { params: Promise<{ shopId: string; itemId: string }> };

// POST /api/shops/[shopId]/menu/items/[itemId]/skus - Add a SKU to menu item
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { shopId, itemId } = await params;
    const body: Omit<Sku, 'id'> = await request.json();

    const menu = await menuService.addSku(shopId, itemId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error adding SKU:', error);
    return NextResponse.json({ error: 'Failed to add SKU' }, { status: 500 });
  }
}
