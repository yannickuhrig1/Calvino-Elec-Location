import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { buildAccountingTransactions, generateAccountingCsv } from '@/backend/accounting/accountingService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'ALL';
    const statusParam = searchParams.get('status') || 'ALL';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const where: any = {};

    // Filtre statut
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    } else {
      where.status = { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] };
    }

    // Filtre dates
    const now = new Date();
    const currentYear = now.getFullYear();

    if (fromParam && toParam) {
      where.createdAt = {
        gte: new Date(fromParam),
        lte: new Date(`${toParam}T23:59:59.999Z`),
      };
    } else if (period === 'CURRENT_MONTH') {
      const startOfMonth = new Date(currentYear, now.getMonth(), 1);
      const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);
      where.createdAt = { gte: startOfMonth, lte: endOfMonth };
    } else if (period === 'T1') {
      where.createdAt = {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 2, 31, 23, 59, 59),
      };
    } else if (period === 'T2') {
      where.createdAt = {
        gte: new Date(currentYear, 3, 1),
        lte: new Date(currentYear, 5, 30, 23, 59, 59),
      };
    } else if (period === 'T3') {
      where.createdAt = {
        gte: new Date(currentYear, 6, 1),
        lte: new Date(currentYear, 8, 30, 23, 59, 59),
      };
    } else if (period === 'T4') {
      where.createdAt = {
        gte: new Date(currentYear, 9, 1),
        lte: new Date(currentYear, 11, 31, 23, 59, 59),
      };
    } else if (period === 'YEAR') {
      where.createdAt = {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31, 23, 59, 59),
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        equipment: true,
        unit: true,
      },
    });

    const transactions = buildAccountingTransactions(reservations);
    const csvContent = generateAccountingCsv(transactions);

    const filename = `journal-ventes-calvino-elec-${period.toLowerCase()}-${now.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur export comptable:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du CSV comptable' }, { status: 500 });
  }
}
