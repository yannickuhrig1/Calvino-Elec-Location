import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { status, notes, meterHours } = await req.json();

    const updated = await prisma.equipmentUnit.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        meterHours: meterHours !== undefined ? parseFloat(meterHours) : undefined,
        lastMaintenanceDate: status === 'AVAILABLE' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, unit: updated });
  } catch (err: any) {
    console.error('Erreur PATCH unit:', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l’unité' }, { status: 500 });
  }
}
