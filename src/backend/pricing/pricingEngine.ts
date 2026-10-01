import { differenceInCalendarDays, parseISO, isFriday, isSaturday, isMonday, isSunday } from 'date-fns';

export interface PricingInput {
  equipment: {
    id: string;
    name: string;
    pricingType: string; // 'STANDARD' | 'QUOTE_ONLY'
    priceHalfDay?: number | null;
    priceDay: number;
    priceWeekend?: number | null;
    priceWeek?: number | null;
    depositAmount: number;
    deliveryAvailable: boolean;
    deliveryFlatFee: number;
    minDurationHours: number;
  };
  startDate: Date | string;
  endDate: Date | string;
  deliveryMode: 'PICKUP_DEPOT' | 'DELIVERY_ON_SITE';
  deliveryAddress?: string;
  selectedAccessories?: Array<{ name: string; price: number }>;
  promoCode?: {
    id: string;
    code: string;
    discountType: string; // 'PERCENTAGE' | 'FIXED_AMOUNT'
    discountValue: number;
    minAmountHt?: number | null;
    minRentalDays?: number | null;
  } | null;
}

export interface PricingCalculationResult {
  isQuoteOnly: boolean;
  rentalDays: number;
  rateAppliedDescription: string;
  baseRentalHt: number;
  discountPercentage: number;
  discountAmountHt: number;
  promoCodeApplied?: string | null;
  promoDiscountHt: number;
  netRentalHt: number;
  deliveryFeeHt: number;
  accessoriesFeeHt: number;
  subtotalHt: number;
  taxRate: number; // e.g. 20 for 20%
  taxAmount: number;
  totalTtc: number;
  depositAmount: number; // Caution non encaissée
  details: {
    label: string;
    amount: number;
    taxable: boolean;
    notes?: string;
  }[];
}

export function calculateRentalPricing(input: PricingInput): PricingCalculationResult {
  const { equipment, deliveryMode, selectedAccessories = [] } = input;

  // Si l'équipement est configuré uniquement sur devis
  if (equipment.pricingType === 'QUOTE_ONLY') {
    return {
      isQuoteOnly: true,
      rentalDays: 0,
      rateAppliedDescription: 'Sur devis personnalisé',
      baseRentalHt: 0,
      discountPercentage: 0,
      discountAmountHt: 0,
      promoCodeApplied: null,
      promoDiscountHt: 0,
      netRentalHt: 0,
      deliveryFeeHt: 0,
      accessoriesFeeHt: 0,
      subtotalHt: 0,
      taxRate: 20.0,
      taxAmount: 0,
      totalTtc: 0,
      depositAmount: equipment.depositAmount,
      details: [],
    };
  }

  const start = typeof input.startDate === 'string' ? parseISO(input.startDate) : input.startDate;
  const end = typeof input.endDate === 'string' ? parseISO(input.endDate) : input.endDate;

  // Calcul du nombre de jours calendaires de location
  // Une journée prise et rendue le même jour compte pour 1 jour.
  const rawDayDiff = differenceInCalendarDays(end, start);
  const rentalDays = Math.max(1, rawDayDiff + 1);

  let baseRentalHt = 0;
  let rateAppliedDescription = '';

  // Vérifier forfait week-end : départ vendredi soir, retour lundi matin (jusqu'à 4 jours calendaires)
  const isWeekendRental =
    rentalDays <= 4 &&
    (isFriday(start) || isSaturday(start)) &&
    (isMonday(end) || isSunday(end));

  if (isWeekendRental && equipment.priceWeekend && equipment.priceWeekend > 0) {
    baseRentalHt = equipment.priceWeekend;
    rateAppliedDescription = 'Forfait Week-end (retrait ven. soir, retour lun. matin)';
  } else if (rentalDays >= 7 && equipment.priceWeek && equipment.priceWeek > 0) {
    // Tarif hebdomadaire
    const weeks = Math.floor(rentalDays / 7);
    const extraDays = rentalDays % 7;
    const weekRate = equipment.priceWeek;
    const extraDayRate = weekRate / 7;
    baseRentalHt = Math.round((weeks * weekRate + extraDays * extraDayRate) * 100) / 100;
    rateAppliedDescription = `Tarif dégressif Semaine (${rentalDays} jours)`;
  } else {
    // Tarif journalier standard
    baseRentalHt = Math.round(rentalDays * equipment.priceDay * 100) / 100;
    rateAppliedDescription = `${rentalDays} jour(s) à ${equipment.priceDay.toFixed(2)} € HT/jour`;
  }

  // Remise longue durée
  let discountPercentage = 0;
  if (rentalDays >= 30) {
    discountPercentage = 20; // 20% de remise à partir d'un mois
  } else if (rentalDays >= 14) {
    discountPercentage = 10; // 10% de remise à partir de deux semaines
  }

  const discountAmountHt = Math.round((baseRentalHt * (discountPercentage / 100)) * 100) / 100;
  const netRentalBeforePromoHt = Math.round((baseRentalHt - discountAmountHt) * 100) / 100;

  // Remise Code Promo
  let promoDiscountHt = 0;
  let promoAppliedMessage = '';
  if (input.promoCode) {
    const pc = input.promoCode;
    let eligible = true;
    if (pc.minRentalDays && rentalDays < pc.minRentalDays) {
      eligible = false;
    }
    if (pc.minAmountHt && netRentalBeforePromoHt < pc.minAmountHt) {
      eligible = false;
    }

    if (eligible) {
      if (pc.discountType === 'PERCENTAGE') {
        promoDiscountHt = Math.round((netRentalBeforePromoHt * (pc.discountValue / 100)) * 100) / 100;
        promoAppliedMessage = `Code ${pc.code} : -${pc.discountValue}% appliqué sur le loyer`;
      } else {
        promoDiscountHt = Math.min(netRentalBeforePromoHt, Math.round(pc.discountValue * 100) / 100);
        promoAppliedMessage = `Code ${pc.code} : -${pc.discountValue.toFixed(2)} € HT déduits`;
      }
    }
  }

  const netRentalHt = Math.max(0, Math.round((netRentalBeforePromoHt - promoDiscountHt) * 100) / 100);

  // Frais de livraison (si demandée et disponible)
  let deliveryFeeHt = 0;
  if (deliveryMode === 'DELIVERY_ON_SITE' && equipment.deliveryAvailable) {
    deliveryFeeHt = equipment.deliveryFlatFee || 45.0; // Par défaut forfait livraison chantier
  }

  // Frais des accessoires optionnels
  const accessoriesFeeHt = selectedAccessories.reduce((sum, item) => sum + (item.price || 0), 0);

  // Sous-total HT
  const subtotalHt = Math.round((netRentalHt + deliveryFeeHt + accessoriesFeeHt) * 100) / 100;

  // TVA (20%)
  const taxRate = 20.0;
  const taxAmount = Math.round((subtotalHt * (taxRate / 100)) * 100) / 100;

  // Total TTC à régler pour la location
  const totalTtc = Math.round((subtotalHt + taxAmount) * 100) / 100;

  // Caution (dépôt de garantie, distinct et non soumis à TVA)
  const depositAmount = equipment.depositAmount || 0;

  const details: Array<{
    label: string;
    amount: number;
    taxable: boolean;
    notes?: string;
  }> = [
    {
      label: `Location ${equipment.name} (${rentalDays} j)`,
      amount: baseRentalHt,
      taxable: true,
      notes: rateAppliedDescription,
    },
  ];

  if (discountPercentage > 0) {
    details.push({
      label: `Remise fidélité longue durée (${discountPercentage}%)`,
      amount: -discountAmountHt,
      taxable: true,
      notes: `Remise automatique dès ${rentalDays >= 30 ? '30' : '14'} jours de location`,
    });
  }

  if (promoDiscountHt > 0) {
    details.push({
      label: `Code promo (${input.promoCode?.code})`,
      amount: -promoDiscountHt,
      taxable: true,
      notes: promoAppliedMessage,
    });
  }

  if (deliveryFeeHt > 0) {
    details.push({
      label: 'Livraison et reprise sur chantier (A/R)',
      amount: deliveryFeeHt,
      taxable: true,
      notes: 'Dépose sur créneau convenu',
    });
  }

  if (selectedAccessories.length > 0) {
    for (const acc of selectedAccessories) {
      details.push({
        label: `Option : ${acc.name}`,
        amount: acc.price,
        taxable: true,
      });
    }
  }

  return {
    isQuoteOnly: false,
    rentalDays,
    rateAppliedDescription,
    baseRentalHt,
    discountPercentage,
    discountAmountHt,
    promoCodeApplied: promoDiscountHt > 0 ? (input.promoCode?.code || null) : null,
    promoDiscountHt,
    netRentalHt,
    deliveryFeeHt,
    accessoriesFeeHt,
    subtotalHt,
    taxRate,
    taxAmount,
    totalTtc,
    depositAmount,
    details,
  };
}
