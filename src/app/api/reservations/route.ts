import { NextRequest, NextResponse } from 'next/server';
import { parseISO, isValid } from 'date-fns';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateRentalPricing } from '@/lib/pricing';
import { sendAdminNewBookingAlert } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      equipmentId,
      startDate: startDateStr,
      endDate: endDateStr,
      pickupTime,
      returnTime,
      deliveryMode,
      deliveryAddress,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerAddress,
      customerCity,
      customerPostalCode,
      customerNotes,
    } = body;

    if (!equipmentId || !startDateStr || !endDateStr || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Veuillez renseigner tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);

    if (!isValid(startDate) || !isValid(endDate) || startDate > endDate) {
      return NextResponse.json(
        { error: 'Les dates de réservation sélectionnées sont invalides.' },
        { status: 400 }
      );
    }

    // Si la demande cible un week-end (samedi ou dimanche), convertir automatiquement en Forfait Week-end (Vendredi soir -> Lundi matin)
    if (startDate.getDay() === 6) {
      startDate.setDate(startDate.getDate() - 1); // Samedi -> Vendredi
    } else if (startDate.getDay() === 0) {
      startDate.setDate(startDate.getDate() - 2); // Dimanche -> Vendredi
    }

    if (endDate.getDay() === 6) {
      endDate.setDate(endDate.getDate() + 2); // Samedi -> Lundi
    } else if (endDate.getDay() === 0) {
      endDate.setDate(endDate.getDate() + 1); // Dimanche -> Lundi
    }


    // Récupérer l'équipement concerné
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { category: true },
    });

    if (!equipment || !equipment.published || equipment.archived) {
      return NextResponse.json(
        { error: 'Équipement non disponible à la location.' },
        { status: 404 }
      );
    }

    // Vérification éventuelle d'un code promotionnel
    const promoCodeInput = (body.promoCode || '').trim().toUpperCase();
    let validatedPromo: any = null;
    if (promoCodeInput) {
      const foundPromo = await prisma.promoCode.findUnique({
        where: { code: promoCodeInput },
      });
      if (foundPromo && foundPromo.active) {
        const now = new Date();
        const notExpired = !foundPromo.validUntil || foundPromo.validUntil >= now;
        const underLimit = !foundPromo.maxUses || foundPromo.usedCount < foundPromo.maxUses;
        if (notExpired && underLimit) {
          validatedPromo = foundPromo;
        }
      }
    }

    // Calcul officiel et figé des tarifs côté serveur
    const pricing = calculateRentalPricing({
      equipment,
      startDate,
      endDate,
      deliveryMode: deliveryMode === 'DELIVERY_ON_SITE' ? 'DELIVERY_ON_SITE' : 'PICKUP_DEPOT',
      deliveryAddress,
      promoCode: validatedPromo,
    });

    // Génération du numéro de réservation unique
    const count = await prisma.reservation.count();
    const reservationNumber = `CALV-2026-${String(count + 1).padStart(4, '0')}`;
    const secretAccessCode = `CALV-TRACK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Historique d'audit initial
    const initialHistory = [
      {
        status: 'PENDING',
        date: new Date().toISOString(),
        author: user ? `Client ${user.firstName} ${user.lastName}` : `Client Invité (${customerName})`,
        note: `Création initiale de la demande de réservation via le site web.${pricing.promoDiscountHt > 0 ? ` Code promo appliqué : ${validatedPromo?.code} (-${pricing.promoDiscountHt} € HT).` : ''} En attente de confirmation par l’équipe Calvino Location.`,
      },
    ];

    // Création en base de données
    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber,
        userId: user ? user.id : undefined,
        equipmentId: equipment.id,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone,
        customerCompany: customerCompany || null,
        customerAddress,
        customerCity: customerCity || null,
        customerPostalCode: customerPostalCode || null,
        startDate,
        endDate,
        pickupTime: pickupTime || '08:30',
        returnTime: returnTime || '17:30',
        deliveryMode: deliveryMode === 'DELIVERY_ON_SITE' ? 'DELIVERY_ON_SITE' : 'PICKUP_DEPOT',
        deliveryAddress: deliveryMode === 'DELIVERY_ON_SITE' ? deliveryAddress : null,
        rentalDays: pricing.rentalDays,
        basePrice: pricing.baseRentalHt,
        deliveryFee: pricing.deliveryFeeHt,
        optionsFee: pricing.accessoriesFeeHt,
        subtotalHt: pricing.subtotalHt,
        taxRate: pricing.taxRate,
        taxAmount: pricing.taxAmount,
        totalAmount: pricing.totalTtc,
        depositAmount: pricing.depositAmount,
        promoCodeId: validatedPromo ? validatedPromo.id : null,
        promoCodeApplied: validatedPromo && pricing.promoDiscountHt > 0 ? validatedPromo.code : null,
        promoDiscountAmount: pricing.promoDiscountHt,
        calculationJson: JSON.stringify(pricing),
        status: 'PENDING', // STRICTEMENT EN ATTENTE EN V1
        customerNotes: customerNotes || null,
        statusHistoryJson: JSON.stringify(initialHistory),
        secretAccessCode,
      },
      include: {
        equipment: true,
      },
    });

    // Si un code promo valide a généré une réduction, incrémenter son compteur d'utilisation
    if (validatedPromo && pricing.promoDiscountHt > 0) {
      await prisma.promoCode.update({
        where: { id: validatedPromo.id },
        data: { usedCount: { increment: 1 } },
      }).catch((e) => console.error('Failed to increment promo usage:', e));
    }

    // Déclencher l'alerte email pour l'administrateur (non bloquant)
    try {
      await sendAdminNewBookingAlert(reservation);
    } catch (emailErr) {
      console.error('Erreur non bloquante lors de l’envoi de l’alerte email admin:', emailErr);
    }

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Demande enregistrée avec succès. Statut initial : EN ATTENTE.',
    });
  } catch (err: any) {
    console.error('Erreur création réservation:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur interne lors de la réservation' },
      { status: 500 }
    );
  }
}
