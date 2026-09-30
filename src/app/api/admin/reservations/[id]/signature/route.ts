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

    const { signatureDataUrl, signerName } = await req.json();

    if (!signatureDataUrl) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const now = new Date();
    const history = JSON.parse(reservation.statusHistoryJson || '[]');
    history.push({
      status: reservation.status,
      date: now.toISOString(),
      author: `${user.firstName} ${user.lastName} (Admin)`,
      note: `Contrat de location signé électroniquement par ${signerName || reservation.customerName}.`,
    });

    const updated = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        contractSignedAt: now,
        clientSignatureDataUrl: signatureDataUrl,
        statusHistoryJson: JSON.stringify(history),
      },
    });

    return NextResponse.json({
      success: true,
      contractSignedAt: updated.contractSignedAt,
    });
  } catch (error) {
    console.error('Error saving contract signature:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement de la signature' }, { status: 500 });
  }
}
