import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  computeEquipmentFinancials,
  computeGlobalParcFinancials,
} from '@/lib/accounting';
import { generateStyledRentabiliteExcel } from '@/lib/excelGenerator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const [equipments, reservations, maintenanceLogs] = await Promise.all([
      prisma.equipment.findMany({
        where: { archived: false },
        include: { category: true },
        orderBy: { purchasePriceHt: 'desc' },
      }),
      prisma.reservation.findMany({
        where: { status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
        include: { equipment: true },
      }),
      prisma.maintenanceLog.findMany({
        include: { unit: true },
      }),
    ]);

    const referenceDate = new Date();
    const equipmentsStats = equipments.map((eq) =>
      computeEquipmentFinancials(eq, reservations, maintenanceLogs, referenceDate)
    );
    const globalStats = computeGlobalParcFinancials(equipmentsStats);

    const excelBuffer = await generateStyledRentabiliteExcel(equipmentsStats, globalStats);
    const filename = `rentabilite-parc-calvino-elec-${referenceDate.toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur export Excel rentabilité:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du classeur Excel rentabilité' }, { status: 500 });
  }
}
