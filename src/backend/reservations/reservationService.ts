import prisma from '@/backend/db/prisma';
import { calculateRentalPricing } from '@/backend/pricing/pricingEngine';
import { validateUnitAvailabilityForDates } from '@/backend/availability/availabilityService';
import { 
  sendAdminNewBookingAlert, 
  sendReservationConfirmedEmail, 
  sendReservationCompletedEmail 
} from '@/backend/email/emailService';
import { parseISO, isValid } from 'date-fns';
import { randomBytes } from 'crypto';

export interface CreateReservationDto {
  equipmentId: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  deliveryMode: 'PICKUP_DEPOT' | 'DELIVERY_ON_SITE';
  deliveryAddress?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  customerAddress: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerNotes?: string;
  promoCode?: string;
  selectedAccessories?: Array<{ name: string; price: number }>;
  userId?: string;
}

export class ReservationService {
  /**
   * Création d'une nouvelle réservation avec calcul de prix figé et notification admin
   */
  static async createReservation(data: CreateReservationDto) {
    const startDate = parseISO(data.startDate);
    const endDate = parseISO(data.endDate);

    if (!isValid(startDate) || !isValid(endDate)) {
      throw new Error('Dates de réservation invalides.');
    }

    if (startDate > endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin.');
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
      include: {
        units: { where: { status: { not: 'OUT_OF_SERVICE' } } },
      },
    });

    if (!equipment || !equipment.published || equipment.archived) {
      throw new Error('Matériel indisponible ou introuvable.');
    }

    // Gestion du code promo éventuel
    let validatedPromo = null;
    if (data.promoCode) {
      const cleanCode = data.promoCode.trim().toUpperCase();
      const promo = await prisma.promoCode.findUnique({
        where: { code: cleanCode },
      });

      if (promo && promo.active) {
        const now = new Date();
        const isNotExpired = !promo.validUntil || promo.validUntil >= now;
        const isUnderLimit = !promo.maxUses || promo.usedCount < promo.maxUses;
        if (isNotExpired && isUnderLimit) {
          validatedPromo = promo;
        }
      }
    }

    // Calcul du devis contractuel figé
    const pricing = calculateRentalPricing({
      equipment,
      startDate,
      endDate,
      deliveryMode: data.deliveryMode,
      deliveryAddress: data.deliveryAddress,
      selectedAccessories: data.selectedAccessories || [],
      promoCode: validatedPromo,
    });

    const reservationCount = await prisma.reservation.count();
    const currentYear = new Date().getFullYear();
    const reservationNumber = `CALV-${currentYear}-${String(reservationCount + 1).padStart(4, '0')}`;
    const secretAccessCode = randomBytes(4).toString('hex').toUpperCase();

    const initialHistory = [
      {
        status: 'PENDING',
        date: new Date().toISOString(),
        author: 'Client (Web)',
        note: 'Création initiale du dossier de réservation en ligne.',
      },
    ];

    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber,
        userId: data.userId || undefined,
        equipmentId: equipment.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail.toLowerCase().trim(),
        customerPhone: data.customerPhone,
        customerCompany: data.customerCompany || null,
        customerAddress: data.customerAddress,
        customerCity: data.customerCity || null,
        customerPostalCode: data.customerPostalCode || null,
        startDate,
        endDate,
        pickupTime: data.pickupTime || '08:30',
        returnTime: data.returnTime || '17:30',
        deliveryMode: data.deliveryMode === 'DELIVERY_ON_SITE' ? 'DELIVERY_ON_SITE' : 'PICKUP_DEPOT',
        deliveryAddress: data.deliveryMode === 'DELIVERY_ON_SITE' ? data.deliveryAddress : null,
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
        status: 'PENDING',
        customerNotes: data.customerNotes || null,
        statusHistoryJson: JSON.stringify(initialHistory),
        secretAccessCode,
      },
      include: {
        equipment: true,
      },
    });

    // Incrémenter utilisation du promo code
    if (validatedPromo && pricing.promoDiscountHt > 0) {
      await prisma.promoCode.update({
        where: { id: validatedPromo.id },
        data: { usedCount: { increment: 1 } },
      }).catch((e) => console.error('Failed to increment promo usage:', e));
    }

    // Déclencher alerte email admin
    try {
      await sendAdminNewBookingAlert(reservation);
    } catch (e) {
      console.error('Erreur non bloquante alerte admin:', e);
    }

    return reservation;
  }

  /**
   * Transition de statut atomique (CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
   */
  static async transitionStatus({
    reservationId,
    newStatus,
    unitId,
    reason,
    adminNotes,
    authorName,
  }: {
    reservationId: string;
    newStatus: string;
    unitId?: string | null;
    reason?: string;
    adminNotes?: string;
    authorName: string;
  }) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { equipment: true, unit: true },
    });

    if (!reservation) {
      throw new Error('Réservation introuvable.');
    }

    const history = JSON.parse(reservation.statusHistoryJson || '[]');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Passage à CONFIRMED
      if (newStatus === 'CONFIRMED') {
        const assignedUnitId = unitId || reservation.unitId;
        if (!assignedUnitId) {
          throw new Error('Veuillez assigner une unité physique spécifique pour confirmer la réservation.');
        }

        const isFree = await validateUnitAvailabilityForDates(
          assignedUnitId,
          reservation.startDate,
          reservation.endDate,
          reservation.id,
          tx
        );

        if (!isFree) {
          throw new Error('Conflit détecté : cette unité physique est déjà louée sur cette même période !');
        }

        history.push({
          status: 'CONFIRMED',
          date: new Date().toISOString(),
          author: authorName,
          note: reason || 'Réservation confirmée avec assignation de l’unité physique.',
        });

        return await tx.reservation.update({
          where: { id: reservationId },
          data: {
            status: 'CONFIRMED',
            unitId: assignedUnitId,
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      // 2. Passage à IN_PROGRESS
      if (newStatus === 'IN_PROGRESS') {
        const effectiveUnitId = unitId || reservation.unitId;
        if (!effectiveUnitId) {
          throw new Error('Impossible de marquer comme remis : aucune unité physique assignée.');
        }

        await tx.equipmentUnit.update({
          where: { id: effectiveUnitId },
          data: { status: 'RENTED' },
        });

        history.push({
          status: 'IN_PROGRESS',
          date: new Date().toISOString(),
          author: authorName,
          note: reason || 'Matériel remis au client. Prise en charge effectuée.',
        });

        return await tx.reservation.update({
          where: { id: reservationId },
          data: {
            status: 'IN_PROGRESS',
            unitId: effectiveUnitId,
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      // 3. Passage à COMPLETED
      if (newStatus === 'COMPLETED') {
        if (reservation.unitId) {
          await tx.equipmentUnit.update({
            where: { id: reservation.unitId },
            data: { status: 'AVAILABLE' },
          });
        }

        history.push({
          status: 'COMPLETED',
          date: new Date().toISOString(),
          author: authorName,
          note: reason || 'Matériel retourné en agence. État des lieux de retour conforme et caution libérée.',
        });

        return await tx.reservation.update({
          where: { id: reservationId },
          data: {
            status: 'COMPLETED',
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      // 4. Passage à REJECTED ou CANCELLED
      if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
        if (reservation.unitId && reservation.status === 'IN_PROGRESS') {
          await tx.equipmentUnit.update({
            where: { id: reservation.unitId },
            data: { status: 'AVAILABLE' },
          });
        }

        history.push({
          status: newStatus,
          date: new Date().toISOString(),
          author: authorName,
          note: reason || `Réservation passée au statut ${newStatus}. Motif : ${reason || 'Non précisé'}.`,
        });

        return await tx.reservation.update({
          where: { id: reservationId },
          data: {
            status: newStatus,
            cancellationReason: reason || null,
            adminNotes: adminNotes !== undefined ? adminNotes : reservation.adminNotes,
            statusHistoryJson: JSON.stringify(history),
          },
          include: { unit: true, equipment: true },
        });
      }

      throw new Error(`Statut demandé non pris en charge : ${newStatus}`);
    });

    // Déclencheurs emails automatiques
    try {
      if (newStatus === 'CONFIRMED') {
        await sendReservationConfirmedEmail(result);
      } else if (newStatus === 'COMPLETED') {
        await sendReservationCompletedEmail(result);
      }
    } catch (e) {
      console.error('Erreur email automatique:', e);
    }

    return result;
  }

  /**
   * Sauvegarde de la signature électronique du contrat
   */
  static async signContract(reservationId: string, signatureDataUrl: string, author: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new Error('Réservation introuvable.');
    }

    const history = JSON.parse(reservation.statusHistoryJson || '[]');
    history.push({
      status: 'CONTRACT_SIGNED',
      date: new Date().toISOString(),
      author,
      note: 'Contrat de location signé électroniquement par le client.',
    });

    return await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        contractSignedAt: new Date(),
        clientSignatureDataUrl: signatureDataUrl,
        statusHistoryJson: JSON.stringify(history),
      },
    });
  }

  /**
   * Enregistrement de l'état des lieux (CHECKIN ou CHECKOUT)
   */
  static async recordInspection({
    reservationId,
    type,
    data,
    author,
  }: {
    reservationId: string;
    type: 'CHECKIN' | 'CHECKOUT';
    data: any;
    author: string;
  }) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { unit: true },
    });

    if (!reservation) {
      throw new Error('Réservation introuvable.');
    }

    const history = JSON.parse(reservation.statusHistoryJson || '[]');

    if (type === 'CHECKIN') {
      history.push({
        status: 'INSPECTION_CHECKIN',
        date: new Date().toISOString(),
        author,
        note: `État des lieux de départ validé. Compteur : ${data.meterHours || 'N/A'} h. Carburant/Batterie : ${data.fuelLevel || '100%'}.`,
      });

      if (reservation.unitId && data.meterHours !== undefined) {
        await prisma.equipmentUnit.update({
          where: { id: reservation.unitId },
          data: { meterHours: parseFloat(data.meterHours) || undefined },
        }).catch((e) => console.error(e));
      }

      return await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          checkinDataJson: JSON.stringify(data),
          statusHistoryJson: JSON.stringify(history),
        },
      });
    } else {
      history.push({
        status: 'INSPECTION_CHECKOUT',
        date: new Date().toISOString(),
        author,
        note: `État des lieux de retour validé. Décision caution : ${data.depositDecision === 'RELEASED' ? 'Restituée intégralement' : 'Retenue appliquée'}.`,
      });

      if (reservation.unitId && data.meterHours !== undefined) {
        await prisma.equipmentUnit.update({
          where: { id: reservation.unitId },
          data: { 
            meterHours: parseFloat(data.meterHours) || undefined,
            status: 'AVAILABLE',
          },
        }).catch((e) => console.error(e));
      }

      return await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          checkoutDataJson: JSON.stringify(data),
          status: 'COMPLETED',
          statusHistoryJson: JSON.stringify(history),
        },
      });
    }
  }
}
