import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { purchasePriceHt, amortizationYears, purchaseDate } = await req.json();

    const dataToUpdate: any = {};

    if (purchasePriceHt !== undefined) {
      dataToUpdate.purchasePriceHt = Math.max(0, parseFloat(purchasePriceHt) || 0);
    }

    if (amortizationYears !== undefined) {
      dataToUpdate.amortizationYears = Math.max(1, parseInt(amortizationYears, 10) || 3);
    }

    if (purchaseDate) {
      dataToUpdate.purchaseDate = new Date(purchaseDate);
    }

    const updated = await prisma.equipment.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, equipment: updated });
  } catch (err: any) {
    console.error('Erreur PATCH equipment financials:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres financiers' },
      { status: 500 }
    );
  }
}
