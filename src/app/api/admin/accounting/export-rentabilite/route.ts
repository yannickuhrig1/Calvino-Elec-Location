import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import {
  computeEquipmentFinancials,
  computeGlobalParcFinancials,
  generateParcRentabiliteCsv,
} from '@/backend/accounting/accountingService';

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

    const csvContent = generateParcRentabiliteCsv(equipmentsStats, globalStats);
    const filename = `rentabilite-parc-calvino-elec-${referenceDate.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur export rentabilité:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du CSV rentabilité' }, { status: 500 });
  }
}
