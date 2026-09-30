import React from 'react';
import prisma from '@/lib/prisma';
import {
  computeEquipmentFinancials,
  computeGlobalParcFinancials,
} from '@/lib/accounting';
import { RentabiliteClient } from './RentabiliteClient';

export const dynamic = 'force-dynamic';

export default async function AdminRentabilitePage() {
  const [equipments, reservations, maintenanceLogs] = await Promise.all([
    prisma.equipment.findMany({
      where: { archived: false },
      include: {
        category: true,
      },
      orderBy: { purchasePriceHt: 'desc' },
    }),
    prisma.reservation.findMany({
      where: {
        status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
      },
      include: {
        equipment: true,
      },
    }),
    prisma.maintenanceLog.findMany({
      include: {
        unit: true,
      },
    }),
  ]);

  const referenceDate = new Date();

  // Calcul des statistiques financières pour chaque équipement
  const equipmentsStats = equipments.map((eq) =>
    computeEquipmentFinancials(eq, reservations, maintenanceLogs, referenceDate)
  );

  // Calcul des totaux et KPIs globaux du parc
  const parcFinancials = computeGlobalParcFinancials(equipmentsStats);

  return (
    <RentabiliteClient
      equipments={equipmentsStats}
      parcFinancials={parcFinancials}
    />
  );
}
