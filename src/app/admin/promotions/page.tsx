import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { PromoManagerClient } from '@/frontend/features/admin/PromoManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/connexion');
  }

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  const totalDiscounts = await prisma.reservation.aggregate({
    _sum: {
      promoDiscountAmount: true,
    },
  });

  const serializedPromos = promoCodes.map((p) => ({
    id: p.id,
    code: p.code,
    description: p.description,
    discountType: p.discountType,
    discountValue: p.discountValue,
    minAmountHt: p.minAmountHt,
    minRentalDays: p.minRentalDays,
    maxUses: p.maxUses,
    usedCount: p.usedCount,
    validFrom: p.validFrom.toISOString(),
    validUntil: p.validUntil ? p.validUntil.toISOString() : null,
    active: p.active,
    showInBanner: p.showInBanner,
    bannerHighlight: p.bannerHighlight,
    createdAt: p.createdAt.toISOString(),
    _count: p._count,
  }));

  const stats = {
    totalCodes: promoCodes.length,
    activeCodes: promoCodes.filter((p) => p.active).length,
    totalUses: promoCodes.reduce((sum, p) => sum + p.usedCount, 0),
    totalDiscountGiven: totalDiscounts._sum.promoDiscountAmount || 0,
  };

  return <PromoManagerClient initialPromoCodes={serializedPromos} stats={stats} />;
}
