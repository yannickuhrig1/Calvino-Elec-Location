import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/backend/auth/authService';
import { ReservationService } from '@/backend/reservations/reservationService';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { type, data } = await req.json(); // type: 'CHECKIN' | 'CHECKOUT'

    if (type !== 'CHECKIN' && type !== 'CHECKOUT') {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    const author = `${user.firstName} ${user.lastName} (Admin)`;
    const updatedReservation = await ReservationService.recordInspection({
      reservationId: params.id,
      type,
      data,
      author,
    });

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    });
  } catch (error: any) {
    console.error('Error saving inspection data:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'enregistrement de l\'état des lieux' },
      { status: 500 }
    );
  }
}
