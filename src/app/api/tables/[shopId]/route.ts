import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/services';

type Params = { params: Promise<{ shopId: string }> };

// GET /api/tables/[shopId] - Get tables for a shop
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const tables = await menuService.getTablesByShopId(shopId);
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

// PUT /api/tables/[shopId] - Update tables for a shop
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { shopId } = await params;
    const body = await request.json();

    if (!Array.isArray(body.tables)) {
      return NextResponse.json(
        { error: 'tables must be an array of table numbers' },
        { status: 400 }
      );
    }

    const tables = await menuService.updateTables(shopId, body.tables);
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error updating tables:', error);
    return NextResponse.json({ error: 'Failed to update tables' }, { status: 500 });
  }
}
