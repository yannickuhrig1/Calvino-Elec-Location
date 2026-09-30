import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateUnitAvailabilityForDates } from '@/lib/availability';
import { sendReservationConfirmedEmail, sendReservationCompletedEmail } from '@/lib/emailService';

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

    // Contrôle d'accès : Admin, ou propriétaire du compte, ou détenteur du secret d'accès invité
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

    // Récupérer la réservation courante
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { equipment: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // Le client peut annuler UNIQUEMENT si la réservation est encore PENDING
    const isOwner = user && user.id === reservation.userId;
    const isAdmin = user && user.role === 'ADMIN';

    if (!isAdmin) {
      if (isOwner && newStatus === 'CANCELLED' && reservation.status === 'PENDING') {
        // Annulation par le client
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

    // LOGIQUE ADMINISTRATEUR SÉCURISÉE PAR TRANSACTION ATOMIQUE
    const authorName = `Admin (${user?.firstName || 'Gestionnaire'} ${user?.lastName || 'Calvino'})`;
    const history = JSON.parse(reservation.statusHistoryJson || '[]');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Passage à CONFIRMED
      if (newStatus === 'CONFIRMED') {
        const assignedUnitId = unitId || reservation.unitId;

        if (!assignedUnitId) {
          throw new Error('Veuillez assigner une unité physique spécifique (numéro de série) pour confirmer la réservation.');
        }

        // Vérifier l'absence de conflit (double réservation) dans la transaction
        const isFree = await validateUnitAvailabilityForDates(
          assignedUnitId,
          reservation.startDate,
          reservation.endDate,
          reservation.id,
          tx
        );

        if (!isFree) {
          throw new Error('Conflit détecté : Cette unité physique est déjà louée sur cette même période de dates !');
        }

        history.push({
          status: 'CONFIRMED',
          date: new Date().toISOString(),
          author: authorName,
          note: reason || `Réservation confirmée avec assignation de l’unité physique.`,
        });

        return await tx.reservation.update({
          where: { id: params.id },
          data: {
            status: 'CONFIRMED',
            unitId: assignedUnitId,
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      // 2. Passage à IN_PROGRESS (Matériel remis au client)
      if (newStatus === 'IN_PROGRESS') {
        if (!reservation.unitId && !unitId) {
          throw new Error('Impossible de marquer comme remis : aucune unité physique n’est assignée.');
        }

        const effectiveUnitId = unitId || reservation.unitId!;

        // Mettre à jour le statut de l'unité physique à RENTED
        await tx.equipmentUnit.update({
          where: { id: effectiveUnitId },
          data: { status: 'RENTED' },
        });

        history.push({
          status: 'IN_PROGRESS',
          date: new Date().toISOString(),
          author: authorName,
          note: reason || 'Matériel remis au client. État des lieux de départ validé et caution consignée.',
        });

        return await tx.reservation.update({
          where: { id: params.id },
          data: {
            status: 'IN_PROGRESS',
            unitId: effectiveUnitId,
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      // 3. Passage à COMPLETED (Matériel restitué et caution libérée)
      if (newStatus === 'COMPLETED') {
        if (reservation.unitId) {
          // Remettre l'unité physique en statut AVAILABLE
          await tx.equipmentUnit.update({
            where: { id: reservation.unitId },
            data: { status: 'AVAILABLE' },
          });
        }

        history.push({
          status: 'COMPLETED',
          date: new Date().toISOString(),
          author: authorName,
          note: reason || 'Matériel retourné en agence. État des lieux de retour conforme et caution libérée sans retenue.',
        });

        return await tx.reservation.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      // 4. Passage à REJECTED ou CANCELLED
      if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
        if (reservation.unitId && reservation.status === 'IN_PROGRESS') {
          await tx.equipmentUnit.update({
            where: { id: reservation.unitId },
            data: { status: 'AVAILABLE' },
          });
        }

        history.push({
          status: newStatus,
          date: new Date().toISOString(),
          author: authorName,
          note: reason || `Réservation passée au statut ${newStatus}. Motif : ${reason || 'Non précisé'}.`,
        });

        return await tx.reservation.update({
          where: { id: params.id },
          data: {
            status: newStatus,
            cancellationReason: reason || null,
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      throw new Error(`Statut demandé non pris en charge : ${newStatus}`);
    });

    // Déclencheurs automatiques d'emails (non-bloquants)
    try {
      if (newStatus === 'CONFIRMED') {
        await sendReservationConfirmedEmail(result);
      } else if (newStatus === 'COMPLETED') {
        await sendReservationCompletedEmail(result);
      }
    } catch (emailErr) {
      console.error('Erreur non bloquante lors de l’envoi de l’email automatique:', emailErr);
    }

    return NextResponse.json({ success: true, reservation: result });
  } catch (err: any) {
    console.error('Erreur PATCH reservation:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour' },
      { status: 400 }
    );
  }
}
