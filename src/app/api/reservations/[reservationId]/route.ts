import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services';
import type { ReservationStatus } from '@/types';

type Params = { params: Promise<{ reservationId: string }> };

// GET /api/reservations/[reservationId] - Get a single reservation
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { reservationId } = await params;
    const reservation = await reservationService.getById(reservationId);

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

// PATCH /api/reservations/[reservationId] - Update reservation
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { reservationId } = await params;
    const body = await request.json();

    if (body.status) {
      const validStatuses: ReservationStatus[] = ['待入座', '已入座', '已取消'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: 待入座, 已入座, or 已取消' },
          { status: 400 }
        );
      }

      const reservation = await reservationService.updateStatus(reservationId, body.status);
      return NextResponse.json(reservation);
    }

    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}
