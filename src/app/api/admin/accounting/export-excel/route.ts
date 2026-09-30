import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buildAccountingTransactions, computeAccountingSummary } from '@/lib/accounting';
import { generateStyledAccountingExcel } from '@/lib/excelGenerator';

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

    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    } else {
      where.status = { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    let periodLabel = 'Exercice 2026';

    if (fromParam && toParam) {
      where.createdAt = {
        gte: new Date(fromParam),
        lte: new Date(`${toParam}T23:59:59.999Z`),
      };
      periodLabel = `Du ${new Date(fromParam).toLocaleDateString('fr-FR')} au ${new Date(toParam).toLocaleDateString('fr-FR')}`;
    } else if (period === 'CURRENT_MONTH') {
      const startOfMonth = new Date(currentYear, now.getMonth(), 1);
      const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);
      where.createdAt = { gte: startOfMonth, lte: endOfMonth };
      periodLabel = `Mois de ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    } else if (period === 'T1') {
      where.createdAt = {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 2, 31, 23, 59, 59),
      };
      periodLabel = `1er Trimestre (T1) ${currentYear}`;
    } else if (period === 'T2') {
      where.createdAt = {
        gte: new Date(currentYear, 3, 1),
        lte: new Date(currentYear, 5, 30, 23, 59, 59),
      };
      periodLabel = `2ème Trimestre (T2) ${currentYear}`;
    } else if (period === 'T3') {
      where.createdAt = {
        gte: new Date(currentYear, 6, 1),
        lte: new Date(currentYear, 8, 30, 23, 59, 59),
      };
      periodLabel = `3ème Trimestre (T3) ${currentYear}`;
    } else if (period === 'T4') {
      where.createdAt = {
        gte: new Date(currentYear, 9, 1),
        lte: new Date(currentYear, 11, 31, 23, 59, 59),
      };
      periodLabel = `4ème Trimestre (T4) ${currentYear}`;
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
    const summary = computeAccountingSummary(transactions);

    const excelBuffer = await generateStyledAccountingExcel(transactions, summary, periodLabel);

    const filename = `journal-ventes-calvino-elec-${period.toLowerCase()}-${now.toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur export Excel comptable:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du classeur Excel' }, { status: 500 });
  }
}
