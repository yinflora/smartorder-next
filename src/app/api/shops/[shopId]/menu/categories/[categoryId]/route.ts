import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';
import type { Category } from '@/types';

type Params = { params: Promise<{ shopId: string; categoryId: string }> };

// PATCH /api/shops/[shopId]/menu/categories/[categoryId] - Update a category
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { shopId, categoryId } = await params;
    const body: Partial<Category> = await request.json();

    const menu = await menuService.updateCategory(shopId, categoryId, body);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/shops/[shopId]/menu/categories/[categoryId] - Remove a category
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { shopId, categoryId } = await params;

    const menu = await menuService.removeCategory(shopId, categoryId);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error removing category:', error);
    return NextResponse.json({ error: 'Failed to remove category' }, { status: 500 });
  }
}
