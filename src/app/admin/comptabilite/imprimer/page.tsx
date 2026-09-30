import React from 'react';
import prisma from '@/lib/prisma';
import {
  computeEquipmentFinancials,
  computeGlobalParcFinancials,
  buildAccountingTransactions,
  computeAccountingSummary,
} from '@/lib/accounting';
import { PrintClientView } from './PrintClientView';

export const dynamic = 'force-dynamic';

export default async function PrintFinancialPage() {
  const [equipments, reservations, maintenanceLogs] = await Promise.all([
    prisma.equipment.findMany({
      where: { archived: false },
      include: { category: true },
      orderBy: { purchasePriceHt: 'desc' },
    }),
    prisma.reservation.findMany({
      where: { status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
      include: { equipment: true, unit: true, promoCode: true },
    }),
    prisma.maintenanceLog.findMany({
      include: { unit: true },
    }),
  ]);

  const referenceDate = new Date();
  const generationDate = referenceDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const equipmentsStats = equipments.map((eq) =>
    computeEquipmentFinancials(eq, reservations, maintenanceLogs, referenceDate)
  );

  const parcFinancials = computeGlobalParcFinancials(equipmentsStats);
  const transactions = buildAccountingTransactions(reservations);
  const accountingSummary = computeAccountingSummary(transactions);

  return (
    <PrintClientView
      equipments={equipmentsStats}
      parcFinancials={parcFinancials}
      accountingSummary={accountingSummary}
      generationDate={generationDate}
    />
  );
}
