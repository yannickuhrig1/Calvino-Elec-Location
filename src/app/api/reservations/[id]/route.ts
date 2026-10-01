import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { ReservationService } from '@/backend/reservations/reservationService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        equipment: {
          include: { category: true },
        },
        unit: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const isOwner = user && user.id === reservation.userId;
    const isAdmin = user && user.role === 'ADMIN';
    const hasValidSecret = secret && reservation.secretAccessCode === secret;

    if (!isAdmin && !isOwner && !hasValidSecret) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette réservation' },
        { status: 403 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (err: any) {
    console.error('Erreur GET reservation/[id]:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { newStatus, unitId, adminNotes, reason } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { equipment: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const isOwner = user && user.id === reservation.userId;
    const isAdmin = user && user.role === 'ADMIN';

    if (!isAdmin) {
      if (isOwner && newStatus === 'CANCELLED' && reservation.status === 'PENDING') {
        const history = JSON.parse(reservation.statusHistoryJson || '[]');
        history.push({
          status: 'CANCELLED',
          date: new Date().toISOString(),
          author: `Client (${user.firstName} ${user.lastName})`,
          note: reason || 'Annulation demandée par le client avant confirmation.',
        });

        const updated = await prisma.reservation.update({
          where: { id: params.id },
          data: {
            status: 'CANCELLED',
            cancellationReason: reason || 'Annulée par le client',
            statusHistoryJson: JSON.stringify(history),
          },
        });

        return NextResponse.json({ success: true, reservation: updated });
      }

      return NextResponse.json(
        { error: 'Seul un administrateur peut modifier le cycle de cette réservation.' },
        { status: 403 }
      );
    }

    const authorName = `Admin (${user?.firstName || 'Gestionnaire'} ${user?.lastName || 'Calvino'})`;

    const result = await ReservationService.transitionStatus({
      reservationId: params.id,
      newStatus,
      unitId,
      reason,
      adminNotes,
      authorName,
    });

    return NextResponse.json({ success: true, reservation: result });
  } catch (err: any) {
    console.error('Erreur PATCH reservation:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour' },
      { status: 400 }
    );
  }
}
