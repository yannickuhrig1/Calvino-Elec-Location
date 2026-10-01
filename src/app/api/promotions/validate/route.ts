import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawCode = (body.code || '').trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json({ valid: false, error: 'Veuillez saisir un code promotionnel.' }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: rawCode },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({ valid: false, error: 'Ce code promo est invalide ou expiré.' }, { status: 404 });
    }

    const now = new Date();
    if (promo.validUntil && promo.validUntil < now) {
      return NextResponse.json({ valid: false, error: 'Ce code promotionnel a expiré.' }, { status: 400 });
    }

    if (promo.validFrom && promo.validFrom > now) {
      return NextResponse.json({ valid: false, error: 'Ce code promotionnel n’est pas encore actif.' }, { status: 400 });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: 'Ce code promotionnel a atteint sa limite d’utilisations.' }, { status: 400 });
    }

    // Si des dates et un équipement sont fournis, vérifier les seuils
    if (body.startDate && body.endDate) {
      const start = typeof body.startDate === 'string' ? parseISO(body.startDate) : new Date(body.startDate);
      const end = typeof body.endDate === 'string' ? parseISO(body.endDate) : new Date(body.endDate);
      const rentalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);

      if (promo.minRentalDays && rentalDays < promo.minRentalDays) {
        return NextResponse.json({
          valid: false,
          error: `Ce code nécessite une location d'au moins ${promo.minRentalDays} jours (${rentalDays} j sélectionné).`,
        }, { status: 400 });
      }
    }

    if (body.estimatedAmountHt && promo.minAmountHt) {
      if (body.estimatedAmountHt < promo.minAmountHt) {
        return NextResponse.json({
          valid: false,
          error: `Ce code s'applique à partir de ${promo.minAmountHt.toFixed(2)} € HT d'achat (${body.estimatedAmountHt.toFixed(2)} € actuellement).`,
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minAmountHt: promo.minAmountHt,
        minRentalDays: promo.minRentalDays,
      },
      message: promo.discountType === 'PERCENTAGE'
        ? `Remise de ${promo.discountValue}% appliquée !`
        : `Remise de ${promo.discountValue.toFixed(2)} € HT appliquée !`,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ valid: false, error: 'Erreur lors de la validation du code promo.' }, { status: 500 });
  }
}
