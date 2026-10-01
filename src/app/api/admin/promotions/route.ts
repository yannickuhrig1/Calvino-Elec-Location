import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    // Calculer les statistiques globales
    const totalDiscounts = await prisma.reservation.aggregate({
      _sum: {
        promoDiscountAmount: true,
      },
    });

    return NextResponse.json({
      promoCodes,
      stats: {
        totalCodes: promoCodes.length,
        activeCodes: promoCodes.filter((p) => p.active).length,
        totalUses: promoCodes.reduce((sum, p) => sum + p.usedCount, 0),
        totalDiscountGiven: totalDiscounts._sum.promoDiscountAmount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching admin promo codes:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des codes promo.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    const body = await request.json();
    const code = (body.code || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Le code est obligatoire.' }, { status: 400 });
    }

    const existing = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: 'Ce code promo existe déjà.' }, { status: 400 });
    }

    const discountValue = parseFloat(body.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: 'La valeur de la réduction doit être supérieure à 0.' }, { status: 400 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code,
        description: body.description || null,
        discountType: body.discountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
        discountValue,
        minAmountHt: body.minAmountHt ? parseFloat(body.minAmountHt) : null,
        minRentalDays: body.minRentalDays ? parseInt(body.minRentalDays, 10) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses, 10) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        active: body.active !== undefined ? Boolean(body.active) : true,
        showInBanner: Boolean(body.showInBanner),
        bannerHighlight: body.bannerHighlight || null,
      },
    });

    return NextResponse.json({ success: true, promoCode: promo }, { status: 201 });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du code promo.' }, { status: 500 });
  }
}
