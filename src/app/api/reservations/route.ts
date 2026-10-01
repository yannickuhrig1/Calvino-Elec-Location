import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/backend/auth/authService';
import { ReservationService } from '@/backend/reservations/reservationService';
import { checkRateLimit, getClientIp } from '@/backend/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const limit = checkRateLimit(`booking:${clientIp}`, 10, 10 * 60);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Nombre maximum de réservations atteint pour cette période. Réessayez dans ${Math.ceil(limit.resetInSeconds / 60)} minutes.` },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.resetInSeconds) },
        }
      );
    }

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
