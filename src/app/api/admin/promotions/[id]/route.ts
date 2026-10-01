import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.showInBanner !== undefined) updateData.showInBanner = Boolean(body.showInBanner);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discountValue !== undefined) updateData.discountValue = parseFloat(body.discountValue);
    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.bannerHighlight !== undefined) updateData.bannerHighlight = body.bannerHighlight;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses ? parseInt(body.maxUses, 10) : null;
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null;

    const promo = await prisma.promoCode.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, promoCode: promo });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du code promo.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    await prisma.promoCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du code promo.' }, { status: 500 });
  }
}
