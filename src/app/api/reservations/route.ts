import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/backend/auth/authService';
import { ReservationService } from '@/backend/reservations/reservationService';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const reservation = await ReservationService.createReservation({
      ...body,
      userId: user?.id,
    });

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Demande enregistrée avec succès. Statut initial : EN ATTENTE.',
    });
  } catch (err: any) {
    console.error('Erreur API création réservation:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la réservation' },
      { status: 400 }
    );
  }
}
