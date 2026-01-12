import { NextRequest, NextResponse } from 'next/server';
import { shopService } from '@/services';

// GET /api/shops - Get all shops
export async function GET() {
  try {
    const shops = await shopService.getAll();
    return NextResponse.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}

// POST /api/shops - Create a new shop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
    }

    const shop = await shopService.create({
      name: body.name,
      ownerId: body.ownerId || 'anonymous',
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
  }
}
