import React from 'react';
import prisma from '@/backend/db/prisma';
import { buildAccountingTransactions } from '@/backend/accounting/accountingService';
import { ComptabiliteClient } from '@/frontend/features/admin/ComptabiliteClient';

export const dynamic = 'force-dynamic';

export default async function AdminComptabilitePage() {
  const reservations = await prisma.reservation.findMany({
    where: {
      status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      equipment: true,
      unit: true,
      promoCode: true,
    },
  });

  const transactions = buildAccountingTransactions(reservations);

  return <ComptabiliteClient initialTransactions={transactions} />;
}
