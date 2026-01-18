import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Category } from '@/types';

type Params = { params: Promise<{ shopId: string }> };

// POST /api/shops/[shopId]/menu/categories - Add a category
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const body: Omit<Category, 'id'> = await request.json();

    const menu = await menuService.addCategory(shopId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
