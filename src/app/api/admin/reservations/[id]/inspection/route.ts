import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { unit: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const now = new Date();
    const history = JSON.parse(reservation.statusHistoryJson || '[]');

    let updatedReservation;

    if (type === 'CHECKIN') {
      history.push({
        status: 'IN_PROGRESS',
        date: now.toISOString(),
        author: `${user.firstName} ${user.lastName} (Admin)`,
        note: `État des lieux de DÉPART validé et signé. Carburant : ${data.fuelLevel}%, Compteur : ${data.meterHours || 'N/A'}.`,
      });

      // Mettre à jour l'unité physique si compteur d'heures renseigné
      if (reservation.unitId && data.meterHours) {
        await prisma.equipmentUnit.update({
          where: { id: reservation.unitId },
          data: {
            meterHours: parseFloat(data.meterHours) || undefined,
            status: 'RENTED',
          },
        });
      }

      updatedReservation = await prisma.reservation.update({
        where: { id: params.id },
        data: {
          status: 'IN_PROGRESS',
          checkinDataJson: JSON.stringify({ ...data, completedAt: now.toISOString(), inspector: `${user.firstName} ${user.lastName}` }),
          statusHistoryJson: JSON.stringify(history),
        },
      });
    } else if (type === 'CHECKOUT') {
      history.push({
        status: 'COMPLETED',
        date: now.toISOString(),
        author: `${user.firstName} ${user.lastName} (Admin)`,
        note: `État des lieux de RETOUR validé. Caution : ${data.depositDecision === 'FULL_REFUND' ? 'Restituée intégralement' : 'Retenue partielle : ' + data.penaltyAmount + ' €'}.`,
      });

      // Remettre l'unité physique en disponible
      if (reservation.unitId) {
        await prisma.equipmentUnit.update({
          where: { id: reservation.unitId },
          data: {
            status: 'AVAILABLE',
            meterHours: data.meterHours ? parseFloat(data.meterHours) : undefined,
            lastMaintenanceDate: now,
          },
        });
      }

      updatedReservation = await prisma.reservation.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          checkoutDataJson: JSON.stringify({ ...data, completedAt: now.toISOString(), inspector: `${user.firstName} ${user.lastName}` }),
          statusHistoryJson: JSON.stringify(history),
        },
      });
    } else {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Error saving inspection data:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement de l\'état des lieux' }, { status: 500 });
  }
}
