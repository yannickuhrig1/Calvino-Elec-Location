import { differenceInDays, differenceInMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export interface EquipmentFinancialStats {
  equipmentId: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  imageUrl: string;
  categoryName: string;
  purchasePriceHt: number;
  amortizationYears: number;
  purchaseDate: Date;
  dotationAnnuelleHt: number;
  dotationMensuelleHt: number;
  amortissementCumuleHt: number;
  vncRestanteHt: number;
  priceDay: number;
  seuilRentabiliteJours: number;
  totalJoursLoues: number;
  nbLocations: number;
  caTotalHt: number;
  maintenanceCostsHt: number;
  margeNetteHt: number;
  pourcentageRemboursement: number; // CA / Prix d'achat * 100
  joursRestantsPourRentabiliser: number;
  isRentabilise: boolean;
  beneficeNetApresAmortissement: number;
  tauxOccupation30j: number; // % sur 30 jours
  statutRentabilite: 'STAR' | 'RENTABLE' | 'EN_COURS' | 'SOUS_EXPLOITE';
}

export interface GlobalParcFinancials {
  totalInvestissementHt: number;
  totalAmortissementCumuleHt: number;
  totalVncRestanteHt: number;
  totalCaGenereHt: number;
  totalMaintenanceHt: number;
  margeNetteGlobaleHt: number;
  tauxAmortissementGlobal: number; // % amorti à date
  tauxCouvertureGlobal: number; // CA total / Investissement total en %
  nbEquipementsTotal: number;
  nbEquipementsRentabilises: number;
}

export interface AccountingJournalRow {
  journalCode: string; // "VTE"
  datePiece: Date;
  pieceNumber: string;
  compteNum: string;
  compteLibelle: string;
  libelleEcriture: string;
  debit: number;
  credit: number;
  nomClient: string;
  societeClient?: string | null;
  cautionMemo: number;
}

export interface AccountingTransaction {
  id: string;
  reservationNumber: string;
  date: Date;
  customerName: string;
  customerCompany: string | null;
  equipmentName: string;
  status: string;
  rentalDays: number;
  basePriceHt: number; // 706000
  deliveryFeeHt: number; // 708500
  promoDiscountHt: number; // 709000
  netHt: number; // (base + delivery - promo)
  tvaAmount: number; // 445710 (20%)
  totalTtc: number; // 411000
  depositAmount: number; // 165000 (caution hors bilan)
  rows: AccountingJournalRow[];
}

export interface AccountingSummary {
  totalVentesHt: number; // 706000
  totalLivraisonHt: number; // 708500
  totalRemisesHt: number; // 709000
  totalNetHt: number;
  totalTvaCollectee: number; // 445710
  totalTtcExigible: number; // 411000
  totalCautionsHorsBilan: number; // 165000
  transactionsCount: number;
}

/**
 * Calcule l'amortissement linéaire prorata temporis d'une immobilisation
 * Selon les règles fiscales françaises :
 * - Dotation annuelle = Valeur brute HT / Durée
 * - Prorata temporis en jours ou mois depuis la mise en service jusqu'à la date d'arrêté
 */
export function calculateAmortization(
  purchasePriceHt: number,
  amortizationYears: number,
  purchaseDate: Date,
  referenceDate: Date = new Date()
) {
  if (purchasePriceHt <= 0 || amortizationYears <= 0) {
    return {
      dotationAnnuelleHt: 0,
      dotationMensuelleHt: 0,
      amortissementCumuleHt: 0,
      vncRestanteHt: 0,
    };
  }

  const dotationAnnuelleHt = purchasePriceHt / amortizationYears;
  const dotationMensuelleHt = dotationAnnuelleHt / 12;

  // Calcul du temps écoulé depuis la mise en service
  const diffDays = Math.max(0, differenceInDays(referenceDate, purchaseDate));
  const totalDays = amortizationYears * 365;

  const prorataRatio = Math.min(1, diffDays / totalDays);
  const amortissementCumuleHt = Math.min(purchasePriceHt, Number((purchasePriceHt * prorataRatio).toFixed(2)));
  const vncRestanteHt = Math.max(0, Number((purchasePriceHt - amortissementCumuleHt).toFixed(2)));

  return {
    dotationAnnuelleHt: Number(dotationAnnuelleHt.toFixed(2)),
    dotationMensuelleHt: Number(dotationMensuelleHt.toFixed(2)),
    amortissementCumuleHt,
    vncRestanteHt,
  };
}

/**
 * Calcule les indicateurs financiers par équipement
 */
export function computeEquipmentFinancials(
  equipment: any,
  reservations: any[] = [],
  maintenanceLogs: any[] = [],
  referenceDate: Date = new Date()
): EquipmentFinancialStats {
  const purchasePriceHt = equipment.purchasePriceHt || 0;
  const amortizationYears = equipment.amortizationYears || 3;
  const purchaseDate = equipment.purchaseDate ? new Date(equipment.purchaseDate) : new Date('2026-09-01');
  const priceDay = equipment.priceDay || 1;

  // 1. Amortissement
  const { dotationAnnuelleHt, dotationMensuelleHt, amortissementCumuleHt, vncRestanteHt } =
    calculateAmortization(purchasePriceHt, amortizationYears, purchaseDate, referenceDate);

  // 2. Seuil de rentabilité en jours
  const seuilRentabiliteJours = priceDay > 0 ? Math.ceil(purchasePriceHt / priceDay) : 0;

  // 3. Chiffre d'affaires et jours loués réels (réservations actives ou terminées)
  const validReservations = reservations.filter(
    (r) =>
      r.equipmentId === equipment.id &&
      ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status)
  );

  const totalJoursLoues = validReservations.reduce((sum, r) => sum + (r.rentalDays || 0), 0);
  const caTotalHt = validReservations.reduce((sum, r) => sum + (r.basePrice || 0), 0);

  // 4. Frais de maintenance associés
  const maintenanceCostsHt = maintenanceLogs
    .filter((m) => m.unit?.equipmentId === equipment.id)
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  // 5. Marge nette (CA - Amortissement cumulé - Maintenance)
  const margeNetteHt = Number((caTotalHt - amortissementCumuleHt - maintenanceCostsHt).toFixed(2));
  const beneficeNetApresAmortissement = Number((caTotalHt - purchasePriceHt).toFixed(2));

  // 6. Pourcentage de remboursement de l'investissement
  const pourcentageRemboursement =
    purchasePriceHt > 0 ? Number(((caTotalHt / purchasePriceHt) * 100).toFixed(1)) : 0;

  const isRentabilise = caTotalHt >= purchasePriceHt && purchasePriceHt > 0;
  const joursRestantsPourRentabiliser = Math.max(0, seuilRentabiliteJours - Math.floor(totalJoursLoues));

  // 7. Taux d'occupation sur les 30 derniers jours
  const thirtyDaysAgo = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentReservations = validReservations.filter(
    (r) => new Date(r.startDate) >= thirtyDaysAgo || new Date(r.endDate) >= thirtyDaysAgo
  );
  const recentDays = recentReservations.reduce((sum, r) => sum + (r.rentalDays || 0), 0);
  const tauxOccupation30j = Math.min(100, Math.round((recentDays / 22) * 100)); // 22 jours ouvrés par mois

  // 8. Classification de rentabilité
  let statutRentabilite: 'STAR' | 'RENTABLE' | 'EN_COURS' | 'SOUS_EXPLOITE' = 'EN_COURS';
  if (isRentabilise || pourcentageRemboursement >= 90) {
    statutRentabilite = 'STAR';
  } else if (pourcentageRemboursement >= 40) {
    statutRentabilite = 'RENTABLE';
  } else if (totalJoursLoues === 0 && differenceInDays(referenceDate, purchaseDate) > 20) {
    statutRentabilite = 'SOUS_EXPLOITE';
  } else {
    statutRentabilite = 'EN_COURS';
  }

  return {
    equipmentId: equipment.id,
    name: equipment.name,
    slug: equipment.slug,
    brand: equipment.brand,
    model: equipment.model,
    imageUrl: equipment.imageUrl,
    categoryName: equipment.category?.name || 'Général',
    purchasePriceHt,
    amortizationYears,
    purchaseDate,
    dotationAnnuelleHt,
    dotationMensuelleHt,
    amortissementCumuleHt,
    vncRestanteHt,
    priceDay,
    seuilRentabiliteJours,
    totalJoursLoues,
    nbLocations: validReservations.length,
    caTotalHt: Number(caTotalHt.toFixed(2)),
    maintenanceCostsHt: Number(maintenanceCostsHt.toFixed(2)),
    margeNetteHt,
    pourcentageRemboursement,
    joursRestantsPourRentabiliser,
    isRentabilise,
    beneficeNetApresAmortissement,
    tauxOccupation30j,
    statutRentabilite,
  };
}

/**
 * Calcule les indicateurs globaux du parc
 */
export function computeGlobalParcFinancials(
  equipmentsStats: EquipmentFinancialStats[]
): GlobalParcFinancials {
  const totalInvestissementHt = equipmentsStats.reduce((sum, eq) => sum + eq.purchasePriceHt, 0);
  const totalAmortissementCumuleHt = equipmentsStats.reduce((sum, eq) => sum + eq.amortissementCumuleHt, 0);
  const totalVncRestanteHt = equipmentsStats.reduce((sum, eq) => sum + eq.vncRestanteHt, 0);
  const totalCaGenereHt = equipmentsStats.reduce((sum, eq) => sum + eq.caTotalHt, 0);
  const totalMaintenanceHt = equipmentsStats.reduce((sum, eq) => sum + eq.maintenanceCostsHt, 0);
  const margeNetteGlobaleHt = Number((totalCaGenereHt - totalAmortissementCumuleHt - totalMaintenanceHt).toFixed(2));

  const tauxAmortissementGlobal =
    totalInvestissementHt > 0
      ? Number(((totalAmortissementCumuleHt / totalInvestissementHt) * 100).toFixed(1))
      : 0;

  const tauxCouvertureGlobal =
    totalInvestissementHt > 0
      ? Number(((totalCaGenereHt / totalInvestissementHt) * 100).toFixed(1))
      : 0;

  const nbEquipementsTotal = equipmentsStats.length;
  const nbEquipementsRentabilises = equipmentsStats.filter((e) => e.isRentabilise).length;

  return {
    totalInvestissementHt: Number(totalInvestissementHt.toFixed(2)),
    totalAmortissementCumuleHt: Number(totalAmortissementCumuleHt.toFixed(2)),
    totalVncRestanteHt: Number(totalVncRestanteHt.toFixed(2)),
    totalCaGenereHt: Number(totalCaGenereHt.toFixed(2)),
    totalMaintenanceHt: Number(totalMaintenanceHt.toFixed(2)),
    margeNetteGlobaleHt,
    tauxAmortissementGlobal,
    tauxCouvertureGlobal,
    nbEquipementsTotal,
    nbEquipementsRentabilises,
  };
}

/**
 * Génère le Journal des Ventes conforme au Plan Comptable Général (PCG)
 * 
 * Écritures comptables type :
 * Débit 411000 (Clients) : Total TTC
 * Crédit 706000 (Prestations de services - Location) : Base HT
 * Crédit 708500 (Ports et frais accessoires - Livraison) : Frais de transport HT
 * Débit 709000 (Rabais, remises et ristournes) : Montant promo HT
 * Crédit 445710 (TVA collectée à 20%) : Montant TVA
 * Hors Bilan 165000 (Dépôts et cautionnements reçus) : Caution prise en garantie
 */
export function buildAccountingTransactions(reservations: any[]): AccountingTransaction[] {
  return reservations
    .filter((r) => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status))
    .map((res) => {
      const basePriceHt = Number((res.basePrice || 0).toFixed(2));
      const deliveryFeeHt = Number((res.deliveryFee || 0).toFixed(2));
      const promoDiscountHt = Number((res.promoDiscountAmount || 0).toFixed(2));
      const netHt = Number((basePriceHt + deliveryFeeHt - promoDiscountHt).toFixed(2));
      const tvaAmount = Number((res.taxAmount || 0).toFixed(2));
      const totalTtc = Number((res.totalAmount || 0).toFixed(2));
      const depositAmount = Number((res.depositAmount || 0).toFixed(2));
      const datePiece = new Date(res.createdAt || res.startDate);

      const clientLabel = res.customerCompany
        ? `${res.customerCompany} (${res.customerName})`
        : res.customerName;

      const rows: AccountingJournalRow[] = [];

      // 1. Débit Client 411000
      rows.push({
        journalCode: 'VTE',
        datePiece,
        pieceNumber: res.reservationNumber,
        compteNum: '411000',
        compteLibelle: 'Clients',
        libelleEcriture: `Location ${res.equipment?.name || 'Matériel'} - ${clientLabel}`,
        debit: totalTtc,
        credit: 0,
        nomClient: res.customerName,
        societeClient: res.customerCompany,
        cautionMemo: depositAmount,
      });

      // 2. Crédit Prestations 706000
      if (basePriceHt > 0) {
        rows.push({
          journalCode: 'VTE',
          datePiece,
          pieceNumber: res.reservationNumber,
          compteNum: '706000',
          compteLibelle: 'Prestations de services - Location matériel',
          libelleEcriture: `Base HT ${res.equipment?.name || 'Équipement'} (${res.rentalDays} j)`,
          debit: 0,
          credit: basePriceHt,
          nomClient: res.customerName,
          societeClient: res.customerCompany,
          cautionMemo: depositAmount,
        });
      }

      // 3. Crédit Frais de livraison 708500
      if (deliveryFeeHt > 0) {
        rows.push({
          journalCode: 'VTE',
          datePiece,
          pieceNumber: res.reservationNumber,
          compteNum: '708500',
          compteLibelle: 'Ports et frais accessoires facturés',
          libelleEcriture: `Livraison sur chantier Moselle`,
          debit: 0,
          credit: deliveryFeeHt,
          nomClient: res.customerName,
          societeClient: res.customerCompany,
          cautionMemo: depositAmount,
        });
      }

      // 4. Débit Remises 709000 (si promo)
      if (promoDiscountHt > 0) {
        rows.push({
          journalCode: 'VTE',
          datePiece,
          pieceNumber: res.reservationNumber,
          compteNum: '709000',
          compteLibelle: 'Rabais, remises et ristournes accordés',
          libelleEcriture: `Remise commerciale promo ${res.promoCodeApplied || ''}`,
          debit: promoDiscountHt,
          credit: 0,
          nomClient: res.customerName,
          societeClient: res.customerCompany,
          cautionMemo: depositAmount,
        });
      }

      // 5. Crédit TVA collectée 445710 (20%)
      if (tvaAmount > 0) {
        rows.push({
          journalCode: 'VTE',
          datePiece,
          pieceNumber: res.reservationNumber,
          compteNum: '445710',
          compteLibelle: 'TVA collectée 20%',
          libelleEcriture: `TVA 20% sur pièce ${res.reservationNumber}`,
          debit: 0,
          credit: tvaAmount,
          nomClient: res.customerName,
          societeClient: res.customerCompany,
          cautionMemo: depositAmount,
        });
      }

      return {
        id: res.id,
        reservationNumber: res.reservationNumber,
        date: datePiece,
        customerName: res.customerName,
        customerCompany: res.customerCompany,
        equipmentName: res.equipment?.name || 'Équipement',
        status: res.status,
        rentalDays: res.rentalDays,
        basePriceHt,
        deliveryFeeHt,
        promoDiscountHt,
        netHt,
        tvaAmount,
        totalTtc,
        depositAmount,
        rows,
      };
    });
}

/**
 * Calcule la synthèse comptable d'un ensemble de transactions
 */
export function computeAccountingSummary(transactions: AccountingTransaction[]): AccountingSummary {
  const totalVentesHt = transactions.reduce((sum, t) => sum + t.basePriceHt, 0);
  const totalLivraisonHt = transactions.reduce((sum, t) => sum + t.deliveryFeeHt, 0);
  const totalRemisesHt = transactions.reduce((sum, t) => sum + t.promoDiscountHt, 0);
  const totalNetHt = Number((totalVentesHt + totalLivraisonHt - totalRemisesHt).toFixed(2));
  const totalTvaCollectee = Number(transactions.reduce((sum, t) => sum + t.tvaAmount, 0).toFixed(2));
  const totalTtcExigible = Number(transactions.reduce((sum, t) => sum + t.totalTtc, 0).toFixed(2));
  const totalCautionsHorsBilan = Number(transactions.reduce((sum, t) => sum + t.depositAmount, 0).toFixed(2));

  return {
    totalVentesHt: Number(totalVentesHt.toFixed(2)),
    totalLivraisonHt: Number(totalLivraisonHt.toFixed(2)),
    totalRemisesHt: Number(totalRemisesHt.toFixed(2)),
    totalNetHt,
    totalTvaCollectee,
    totalTtcExigible,
    totalCautionsHorsBilan,
    transactionsCount: transactions.length,
  };
}

/**
 * Export CSV Journal des Ventes conforme Sage, EBP, Pennylane, QuickBooks & Excel
 * Format point-virgule avec UTF-8 BOM pour ouverture directe sous Windows/Mac Excel sans altération.
 */
export function generateAccountingCsv(transactions: AccountingTransaction[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'Journal',
    'Date Écriture',
    'N° Pièce',
    'N° Compte',
    'Libellé Compte',
    'Libellé Écriture',
    'Débit (€)',
    'Crédit (€)',
    'Client / Entreprise',
    'Statut',
    'Caution Hors Bilan (€)',
  ];

  const lines: string[] = [headers.join(';')];

  transactions.forEach((tx) => {
    tx.rows.forEach((row) => {
      const dateStr = row.datePiece.toLocaleDateString('fr-FR');
      const debitStr = row.debit > 0 ? row.debit.toFixed(2).replace('.', ',') : '';
      const creditStr = row.credit > 0 ? row.credit.toFixed(2).replace('.', ',') : '';
      const cautionStr = row.cautionMemo > 0 ? row.cautionMemo.toFixed(2).replace('.', ',') : '';
      const clientLabel = (row.societeClient ? `${row.societeClient} - ` : '') + row.nomClient;

      const line = [
        `"${row.journalCode}"`,
        `"${dateStr}"`,
        `"${row.pieceNumber}"`,
        `"${row.compteNum}"`,
        `"${row.compteLibelle.replace(/"/g, '""')}"`,
        `"${row.libelleEcriture.replace(/"/g, '""')}"`,
        `"${debitStr}"`,
        `"${creditStr}"`,
        `"${clientLabel.replace(/"/g, '""')}"`,
        `"${tx.status}"`,
        `"${cautionStr}"`,
      ].join(';');

      lines.push(line);
    });
  });

  return BOM + lines.join('\r\n');
}

/**
 * Export CSV Rentabilité du Parc & Amortissements pour la banque ou l'expert-comptable
 */
export function generateParcRentabiliteCsv(
  equipmentsStats: EquipmentFinancialStats[],
  globalStats: GlobalParcFinancials
): string {
  const BOM = '\uFEFF';
  const headers = [
    'Matériel',
    'Catégorie',
    'Prix Achat HT (€)',
    'Date Mise en Service',
    'Durée Amort. (Ans)',
    'Dotation Mensuelle HT (€)',
    'Amortissement Cumulé HT (€)',
    'VNC Restante HT (€)',
    'Tarif Journalier HT (€)',
    'Seuil Rentabilité (Jours)',
    'Jours Loués Réels',
    'Jours Restants Seuil',
    'CA Encaissé HT (€)',
    'Maintenance HT (€)',
    'Marge Nette (€)',
    'Taux Remboursement (%)',
    'Statut Rentabilité',
  ];

  const lines: string[] = [headers.join(';')];

  equipmentsStats.forEach((eq) => {
    const line = [
      `"${eq.name.replace(/"/g, '""')}"`,
      `"${eq.categoryName.replace(/"/g, '""')}"`,
      `"${eq.purchasePriceHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.purchaseDate.toLocaleDateString('fr-FR')}"`,
      `"${eq.amortizationYears}"`,
      `"${eq.dotationMensuelleHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.amortissementCumuleHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.vncRestanteHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.priceDay.toFixed(2).replace('.', ',')}"`,
      `"${eq.seuilRentabiliteJours}"`,
      `"${eq.totalJoursLoues}"`,
      `"${eq.joursRestantsPourRentabiliser}"`,
      `"${eq.caTotalHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.maintenanceCostsHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.margeNetteHt.toFixed(2).replace('.', ',')}"`,
      `"${eq.pourcentageRemboursement.toFixed(1).replace('.', ',')}%"`,
      `"${eq.statutRentabilite}"`,
    ].join(';');

    lines.push(line);
  });

  // Ligne de totalisation
  lines.push('');
  const totalLine = [
    '"TOTAL PARC MATÉRIEL"',
    '""',
    `"${globalStats.totalInvestissementHt.toFixed(2).replace('.', ',')}"`,
    '""',
    '""',
    '""',
    `"${globalStats.totalAmortissementCumuleHt.toFixed(2).replace('.', ',')}"`,
    `"${globalStats.totalVncRestanteHt.toFixed(2).replace('.', ',')}"`,
    '""',
    '""',
    '""',
    '""',
    `"${globalStats.totalCaGenereHt.toFixed(2).replace('.', ',')}"`,
    `"${globalStats.totalMaintenanceHt.toFixed(2).replace('.', ',')}"`,
    `"${globalStats.margeNetteGlobaleHt.toFixed(2).replace('.', ',')}"`,
    `"${globalStats.tauxCouvertureGlobal.toFixed(1).replace('.', ',')}%"`,
    '""',
  ].join(';');
  lines.push(totalLine);

  return BOM + lines.join('\r\n');
}
