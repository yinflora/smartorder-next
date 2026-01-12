import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services';
import type { ReservationSource, ReservationStatus } from '@/types';

// GET /api/reservations - Get reservations (with optional shopId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (shopId) {
      const reservations = await reservationService.getByShopId(shopId);
      return NextResponse.json(reservations);
    }

    const reservations = await reservationService.getAll();
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.shopId || !body.tableNo || !body.time) {
      return NextResponse.json(
        { error: 'shopId, tableNo, and time are required' },
        { status: 400 }
      );
    }

    const validSources: ReservationSource[] = ['預訂', '現場'];
    const validStatuses: ReservationStatus[] = ['待入座', '已入座', '已取消'];

    const source = validSources.includes(body.source) ? body.source : '現場';
    const status = validStatuses.includes(body.status) ? body.status : '待入座';

    const reservation = await reservationService.create({
      shopId: body.shopId,
      tableNo: body.tableNo,
      time: body.time,
      phone: body.phone || '',
      source,
      status,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
