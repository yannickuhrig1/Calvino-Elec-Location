import { NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const promotions = await prisma.promoCode.findMany({
      where: {
        active: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: [
        { showInBanner: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minAmountHt: true,
        minRentalDays: true,
        showInBanner: true,
        bannerHighlight: true,
        validUntil: true,
      },
    });

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error('Error fetching public promotions:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des promotions.' }, { status: 500 });
  }
}
