import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { ReservationService } from '@/backend/reservations/reservationService';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const isAuthorized =
      user.role === 'ADMIN' ||
      reservation.userId === user.id ||
      reservation.customerEmail.toLowerCase() === user.email.toLowerCase();

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { signatureDataUrl, signerName } = await req.json();

    if (!signatureDataUrl) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    const author = `${user.firstName} ${user.lastName} (${user.role === 'ADMIN' ? 'Admin' : 'Client'})`;
    const updated = await ReservationService.signContract(params.id, signatureDataUrl, author);

    return NextResponse.json({
      success: true,
      contractSignedAt: updated.contractSignedAt,
    });
  } catch (error) {
    console.error('Error saving contract signature:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement de la signature' }, { status: 500 });
  }
}
