import ExcelJS from 'exceljs';
import {
  AccountingTransaction,
  AccountingSummary,
  EquipmentFinancialStats,
  GlobalParcFinancials,
} from './accounting';

// Couleurs de la charte CALVINO ELEC
const COLORS = {
  navyDark: '0F172A',     // Entête principale
  navyLight: '1E293B',
  amberGold: 'D97706',    // Accents & Titres
  amberLight: 'FEF3C7',
  blueAccent: '2563EB',
  blueLight: 'EFF6FF',
  greenSuccess: '059669',
  greenLight: 'ECFDF5',
  grayBorder: 'CBD5E1',
  grayZebra: 'F8FAFC',
  white: 'FFFFFF',
  textMuted: '64748B',
};

/**
 * Génère un classeur Excel (.xlsx) stylisé pour le Journal des Ventes & la Comptabilité
 */
export async function generateStyledAccountingExcel(
  transactions: AccountingTransaction[],
  summary: AccountingSummary,
  periodLabel: string = 'Exercice 2026'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CALVINO ELEC';
  workbook.lastModifiedBy = 'CALVINO ELEC - Administration';
  workbook.created = new Date();
  workbook.modified = new Date();

  // =========================================================================
  // ONGLET 1 : SYNTHÈSE & FACTURES DE VENTE
  // =========================================================================
  const wsSales = workbook.addWorksheet('Synthèse des Ventes', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 9 }], // Fige l'entête
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // 1. Titre & Entête Entreprise
  wsSales.mergeCells('A1:K1');
  const titleCell = wsSales.getCell('A1');
  titleCell.value = 'CALVINO ELEC — JOURNAL DES VENTES & FACTURATION';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.white } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.navyDark },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsSales.getRow(1).height = 36;

  // 2. Coordonnées & Période
  wsSales.mergeCells('A2:K2');
  const subCell = wsSales.getCell('A2');
  subCell.value = `Division Location de Matériel BTP • 71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry • Tél : 06 63 44 74 89 • Période : ${periodLabel} • Date d'export : ${new Date().toLocaleDateString('fr-FR')}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'E2E8F0' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.navyLight },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsSales.getRow(2).height = 22;

  // Ligne vide
  wsSales.getRow(3).height = 10;

  // 3. Mini Tableau de Bord / KPI en tête
  const kpiHeaders = [
    { cell: 'A4', label: 'PRESTATIONS HT (706000)', val: summary.totalVentesHt, bg: COLORS.blueLight, fg: '1E40AF' },
    { cell: 'C4', label: 'FRAIS PORT HT (708500)', val: summary.totalLivraisonHt, bg: 'ECFEFF', fg: '0E7490' },
    { cell: 'E4', label: 'REMISES HT (709000)', val: summary.totalRemisesHt > 0 ? -summary.totalRemisesHt : 0, bg: 'FEF2F2', fg: 'B91C1C' },
    { cell: 'G4', label: 'TVA 20% (445710)', val: summary.totalTvaCollectee, bg: COLORS.amberLight, fg: 'B45309' },
    { cell: 'I4', label: 'TOTAL TTC CLIENTS (411000)', val: summary.totalTtcExigible, bg: COLORS.greenLight, fg: '047857' },
    { cell: 'K4', label: 'CAUTIONS HORS-BILAN', val: summary.totalCautionsHorsBilan, bg: 'F1F5F9', fg: '334155' },
  ];

  kpiHeaders.forEach((kpi) => {
    wsSales.getCell(kpi.cell).value = kpi.label;
    wsSales.getCell(kpi.cell).font = { name: 'Calibri', size: 8, bold: true, color: { argb: kpi.fg } };
    wsSales.getCell(kpi.cell).alignment = { horizontal: 'center', vertical: 'middle' };
    wsSales.getCell(kpi.cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.bg } };

    // Ligne 5 valeur
    const row5Cell = wsSales.getCell(kpi.cell.replace('4', '5'));
    row5Cell.value = kpi.val;
    row5Cell.numFmt = '#,##0.00 "€"';
    row5Cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: kpi.fg } };
    row5Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    row5Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.bg } };
  });

  // Merge A4:B4, C4:D4, etc.
  wsSales.mergeCells('A4:B4');
  wsSales.mergeCells('A5:B5');
  wsSales.mergeCells('C4:D4');
  wsSales.mergeCells('C5:D5');
  wsSales.mergeCells('E4:F4');
  wsSales.mergeCells('E5:F5');
  wsSales.mergeCells('G4:H4');
  wsSales.mergeCells('G5:H5');
  wsSales.mergeCells('I4:J4');
  wsSales.mergeCells('I5:J5');

  wsSales.getRow(4).height = 18;
  wsSales.getRow(5).height = 24;

  // Lignes vides de séparation
  wsSales.getRow(6).height = 8;
  wsSales.getRow(7).height = 8;

  // 4. Entêtes du Tableau de Données (Ligne 8)
  const columns = [
    { key: 'piece', header: 'N° Pièce', width: 16 },
    { key: 'date', header: 'Date', width: 13 },
    { key: 'client', header: 'Client / Société', width: 30 },
    { key: 'equipment', header: 'Matériel Loué', width: 32 },
    { key: 'duration', header: 'Durée (j)', width: 11 },
    { key: 'baseHt', header: 'Base HT (706000)', width: 18 },
    { key: 'deliveryHt', header: 'Port HT (708500)', width: 18 },
    { key: 'promoHt', header: 'Remise (709000)', width: 16 },
    { key: 'tva', header: 'TVA 20% (445710)', width: 18 },
    { key: 'totalTtc', header: 'Total TTC (411000)', width: 20 },
    { key: 'caution', header: 'Caution (165000)', width: 18 },
  ];

  const headerRow = wsSales.getRow(8);
  headerRow.height = 28;
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.navyDark },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: index >= 4 ? 'right' : 'left',
      indent: index < 4 ? 1 : 0,
    };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'medium', color: { argb: COLORS.amberGold } },
      left: { style: 'thin', color: { argb: '334155' } },
      right: { style: 'thin', color: { argb: '334155' } },
    };
    wsSales.getColumn(index + 1).width = col.width;
  });

  // 5. Données des transactions
  let currentRow = 9;
  transactions.forEach((tx, idx) => {
    const row = wsSales.getRow(currentRow);
    row.height = 22;
    const isEven = idx % 2 === 0;
    const bg = isEven ? COLORS.white : COLORS.grayZebra;

    row.getCell(1).value = tx.reservationNumber;
    row.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.blueAccent } };

    row.getCell(2).value = new Date(tx.date);
    row.getCell(2).numFmt = 'dd/mm/yyyy';

    row.getCell(3).value = tx.customerCompany ? `${tx.customerCompany} (${tx.customerName})` : tx.customerName;
    row.getCell(4).value = tx.equipmentName;

    row.getCell(5).value = tx.rentalDays;
    row.getCell(5).numFmt = '#,##0.0';

    row.getCell(6).value = tx.basePriceHt;
    row.getCell(6).numFmt = '#,##0.00 "€"';

    row.getCell(7).value = tx.deliveryFeeHt > 0 ? tx.deliveryFeeHt : null;
    row.getCell(7).numFmt = '#,##0.00 "€"';

    row.getCell(8).value = tx.promoDiscountHt > 0 ? -tx.promoDiscountHt : null;
    row.getCell(8).numFmt = '#,##0.00 "€"';
    if (tx.promoDiscountHt > 0) {
      row.getCell(8).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'B91C1C' } };
    }

    row.getCell(9).value = tx.tvaAmount;
    row.getCell(9).numFmt = '#,##0.00 "€"';
    row.getCell(9).font = { name: 'Calibri', size: 10, color: { argb: 'B45309' } };

    row.getCell(10).value = tx.totalTtc;
    row.getCell(10).numFmt = '#,##0.00 "€"';
    row.getCell(10).font = { name: 'Calibri', size: 10, bold: true, color: { argb: '047857' } };

    row.getCell(11).value = tx.depositAmount;
    row.getCell(11).numFmt = '#,##0 "€"';
    row.getCell(11).font = { name: 'Calibri', size: 9, italic: true, color: { argb: COLORS.textMuted } };

    // Appliquer bordures et fond
    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c);
      if (!cell.font) cell.font = { name: 'Calibri', size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.grayBorder } },
        bottom: { style: 'thin', color: { argb: COLORS.grayBorder } },
        left: { style: 'thin', color: { argb: COLORS.grayBorder } },
        right: { style: 'thin', color: { argb: COLORS.grayBorder } },
      };
      if (c >= 5) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }
    }

    currentRow++;
  });

  // 6. Ligne de Totalisation Dynamique avec Formules Excel =SOMME(...)
  const totalRow = wsSales.getRow(currentRow);
  totalRow.height = 26;

  totalRow.getCell(1).value = 'TOTAL GÉNÉRAL';
  totalRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.navyDark } };

  wsSales.mergeCells(`A${currentRow}:D${currentRow}`);

  const startRow = 9;
  const endRow = currentRow - 1;

  if (transactions.length > 0) {
    totalRow.getCell(5).value = { formula: `SUM(E${startRow}:E${endRow})` };
    totalRow.getCell(5).numFmt = '#,##0.0';

    totalRow.getCell(6).value = { formula: `SUM(F${startRow}:F${endRow})` };
    totalRow.getCell(6).numFmt = '#,##0.00 "€"';

    totalRow.getCell(7).value = { formula: `SUM(G${startRow}:G${endRow})` };
    totalRow.getCell(7).numFmt = '#,##0.00 "€"';

    totalRow.getCell(8).value = { formula: `SUM(H${startRow}:H${endRow})` };
    totalRow.getCell(8).numFmt = '#,##0.00 "€"';

    totalRow.getCell(9).value = { formula: `SUM(I${startRow}:I${endRow})` };
    totalRow.getCell(9).numFmt = '#,##0.00 "€"';

    totalRow.getCell(10).value = { formula: `SUM(J${startRow}:J${endRow})` };
    totalRow.getCell(10).numFmt = '#,##0.00 "€"';

    totalRow.getCell(11).value = { formula: `SUM(K${startRow}:K${endRow})` };
    totalRow.getCell(11).numFmt = '#,##0 "€"';
  }

  for (let c = 1; c <= 11; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.navyDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } }, // Double trait comptable
      left: { style: 'thin', color: { argb: COLORS.grayBorder } },
      right: { style: 'thin', color: { argb: COLORS.grayBorder } },
    };
    if (c >= 5) cell.alignment = { horizontal: 'right', vertical: 'middle' };
  }

  // Activer les filtres automatiques natifs Excel sur les colonnes
  wsSales.autoFilter = `A8:K${currentRow - 1}`;


  // =========================================================================
  // ONGLET 2 : GRAND LIVRE COMPTABLE (ÉCRITURES PCG DÉBIT / CRÉDIT)
  // =========================================================================
  const wsJournal = workbook.addWorksheet('Journal Comptable PCG', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }],
  });

  // Titre
  wsJournal.mergeCells('A1:I1');
  const jTitle = wsJournal.getCell('A1');
  jTitle.value = 'CALVINO ELEC — ÉCRITURES COMPTABLES DU JOURNAL DES VENTES (PCG)';
  jTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: COLORS.white } };
  jTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  jTitle.alignment = { vertical: 'middle', indent: 1 };
  wsJournal.getRow(1).height = 32;

  wsJournal.mergeCells('A2:I2');
  const jSub = wsJournal.getCell('A2');
  jSub.value = 'Conforme Plan Comptable Général Français • Export direct vers logiciels Sage, EBP, Pennylane, QuickBooks & Cegid';
  jSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'E2E8F0' } };
  jSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyLight } };
  jSub.alignment = { vertical: 'middle', indent: 1 };
  wsJournal.getRow(2).height = 20;

  wsJournal.getRow(3).height = 10;

  // Entêtes Grand Livre
  const jCols = [
    { header: 'Journal', width: 12 },
    { header: 'Date Écriture', width: 14 },
    { header: 'N° Pièce', width: 16 },
    { header: 'Compte PCG', width: 14 },
    { header: 'Libellé Compte', width: 28 },
    { header: 'Libellé de l\'Écriture', width: 36 },
    { header: 'Tiers / Client', width: 28 },
    { header: 'Débit (€)', width: 18 },
    { header: 'Crédit (€)', width: 18 },
  ];

  const jHeaderRow = wsJournal.getRow(4);
  jHeaderRow.height = 26;
  jCols.forEach((col, idx) => {
    const cell = jHeaderRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'medium', color: { argb: COLORS.amberGold } },
    };
    cell.alignment = { vertical: 'middle', horizontal: idx >= 7 ? 'right' : 'left', indent: idx < 7 ? 1 : 0 };
    wsJournal.getColumn(idx + 1).width = col.width;
  });

  let jRowIdx = 5;
  transactions.forEach((tx) => {
    tx.rows.forEach((r, rowSubIdx) => {
      const row = wsJournal.getRow(jRowIdx);
      row.height = 20;
      const isZebra = Math.floor(jRowIdx / 2) % 2 === 0;

      row.getCell(1).value = r.journalCode;
      row.getCell(2).value = new Date(r.datePiece);
      row.getCell(2).numFmt = 'dd/mm/yyyy';

      row.getCell(3).value = r.pieceNumber;
      row.getCell(3).font = { name: 'Calibri', size: 9, bold: true };

      row.getCell(4).value = r.compteNum;
      row.getCell(4).font = { name: 'Consolas', size: 10, bold: true, color: { argb: COLORS.navyDark } };

      row.getCell(5).value = r.compteLibelle;
      row.getCell(6).value = r.libelleEcriture;
      row.getCell(7).value = r.societeClient ? `${r.societeClient} - ${r.nomClient}` : r.nomClient;

      row.getCell(8).value = r.debit > 0 ? r.debit : null;
      row.getCell(8).numFmt = '#,##0.00 "€"';
      if (r.debit > 0) row.getCell(8).font = { name: 'Calibri', size: 10, bold: true };

      row.getCell(9).value = r.credit > 0 ? r.credit : null;
      row.getCell(9).numFmt = '#,##0.00 "€"';
      if (r.credit > 0) row.getCell(9).font = { name: 'Calibri', size: 10, bold: true };

      for (let c = 1; c <= 9; c++) {
        const cell = row.getCell(c);
        if (!cell.font) cell.font = { name: 'Calibri', size: 9 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isZebra ? COLORS.white : COLORS.grayZebra } };
        cell.border = {
          bottom: { style: 'thin', color: { argb: COLORS.grayBorder } },
          right: { style: 'thin', color: { argb: COLORS.grayBorder } },
        };
        if (c >= 8) cell.alignment = { horizontal: 'right', vertical: 'middle' };
        else cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }

      jRowIdx++;
    });
  });

  // Total Débit = Crédit
  const jTotalRow = wsJournal.getRow(jRowIdx);
  jTotalRow.height = 24;
  wsJournal.mergeCells(`A${jRowIdx}:G${jRowIdx}`);
  jTotalRow.getCell(1).value = 'TOTAL DES ÉCRITURES COMPTABLES ÉQUILIBRÉES :';
  jTotalRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.navyDark } };

  if (jRowIdx > 5) {
    jTotalRow.getCell(8).value = { formula: `SUM(H5:H${jRowIdx - 1})` };
    jTotalRow.getCell(8).numFmt = '#,##0.00 "€"';

    jTotalRow.getCell(9).value = { formula: `SUM(I5:I${jRowIdx - 1})` };
    jTotalRow.getCell(9).numFmt = '#,##0.00 "€"';
  }

  for (let c = 1; c <= 9; c++) {
    const cell = jTotalRow.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.navyDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  }

  wsJournal.autoFilter = `A4:I${jRowIdx - 1}`;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Génère un classeur Excel (.xlsx) stylisé pour la Rentabilité du Parc & les Amortissements
 */
export async function generateStyledRentabiliteExcel(
  equipments: EquipmentFinancialStats[],
  parcFinancials: GlobalParcFinancials
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CALVINO ELEC';
  workbook.lastModifiedBy = 'CALVINO ELEC - Administration';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Rentabilité & Amortissements', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 9 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // Titre & Entête
  ws.mergeCells('A1:L1');
  const t = ws.getCell('A1');
  t.value = 'CALVINO ELEC — BILAN FINANCIER DU PARC MATÉRIEL & SEUILS DE RENTABILITÉ';
  t.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.white } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  t.alignment = { vertical: 'middle', indent: 1 };
  ws.getRow(1).height = 36;

  ws.mergeCells('A2:L2');
  const sub = ws.getCell('A2');
  sub.value = `Investissement réel Devis MaxOutil : 4 777,49 € HT • Calcul linéaire sur 3 et 5 ans • Date d'arrêté : ${new Date().toLocaleDateString('fr-FR')}`;
  sub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'E2E8F0' } };
  sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyLight } };
  sub.alignment = { vertical: 'middle', indent: 1 };
  ws.getRow(2).height = 22;

  ws.getRow(3).height = 10;

  // 4 Cartes KPI en tête
  const kpis = [
    { cell: 'A4', label: 'INVESTISSEMENT BRUT HT', val: parcFinancials.totalInvestissementHt, bg: COLORS.blueLight, fg: '1E40AF' },
    { cell: 'D4', label: 'AMORTISSEMENT À DATE HT', val: parcFinancials.totalAmortissementCumuleHt, bg: COLORS.amberLight, fg: 'B45309' },
    { cell: 'G4', label: 'CA LOCATIONS ENCAISSÉ HT', val: parcFinancials.totalCaGenereHt, bg: COLORS.greenLight, fg: '047857' },
    { cell: 'J4', label: 'MARGE NETTE DÉDUITE HT', val: parcFinancials.margeNetteGlobaleHt, bg: 'EEF2FF', fg: '4338CA' },
  ];

  kpis.forEach((k) => {
    ws.getCell(k.cell).value = k.label;
    ws.getCell(k.cell).font = { name: 'Calibri', size: 8, bold: true, color: { argb: k.fg } };
    ws.getCell(k.cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.bg } };
    ws.getCell(k.cell).alignment = { horizontal: 'center', vertical: 'middle' };

    const valCell = ws.getCell(k.cell.replace('4', '5'));
    valCell.value = k.val;
    valCell.numFmt = '#,##0.00 "€"';
    valCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: k.fg } };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.bg } };
    valCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  ws.mergeCells('A4:C4');
  ws.mergeCells('A5:C5');
  ws.mergeCells('D4:F4');
  ws.mergeCells('D5:F5');
  ws.mergeCells('G4:I4');
  ws.mergeCells('G5:I5');
  ws.mergeCells('J4:L4');
  ws.mergeCells('J5:L5');

  ws.getRow(4).height = 18;
  ws.getRow(5).height = 24;
  ws.getRow(6).height = 8;
  ws.getRow(7).height = 8;

  // Entêtes du Tableau
  const headers = [
    { title: 'Matériel', width: 34 },
    { title: 'Catégorie', width: 22 },
    { title: 'Prix Achat HT', width: 17 },
    { title: 'Durée', width: 10 },
    { title: 'Dot. Mensuelle', width: 16 },
    { title: 'Amorti à Date', width: 17 },
    { title: 'VNC Restante', width: 17 },
    { title: 'Tarif / J', width: 12 },
    { title: 'Seuil (Jours)', width: 14 },
    { title: 'Jours Loués', width: 13 },
    { title: 'CA Total HT', width: 18 },
    { title: 'Marge Nette', width: 18 },
  ];

  const hRow = ws.getRow(8);
  hRow.height = 28;
  headers.forEach((h, idx) => {
    const c = hRow.getCell(idx + 1);
    c.value = h.title;
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
    c.alignment = { vertical: 'middle', horizontal: idx >= 2 ? 'right' : 'left', indent: idx < 2 ? 1 : 0 };
    c.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'medium', color: { argb: COLORS.amberGold } },
    };
    ws.getColumn(idx + 1).width = h.width;
  });

  let rIdx = 9;
  equipments.forEach((eq, i) => {
    const row = ws.getRow(rIdx);
    row.height = 22;
    const isEven = i % 2 === 0;
    const bg = isEven ? COLORS.white : COLORS.grayZebra;

    row.getCell(1).value = eq.name;
    row.getCell(1).font = { name: 'Calibri', size: 10, bold: true };

    row.getCell(2).value = eq.categoryName;
    row.getCell(3).value = eq.purchasePriceHt;
    row.getCell(3).numFmt = '#,##0.00 "€"';

    row.getCell(4).value = `${eq.amortizationYears} ans`;
    row.getCell(4).alignment = { horizontal: 'center' };

    row.getCell(5).value = eq.dotationMensuelleHt;
    row.getCell(5).numFmt = '#,##0.00 "€"';

    row.getCell(6).value = eq.amortissementCumuleHt;
    row.getCell(6).numFmt = '#,##0.00 "€"';

    row.getCell(7).value = eq.vncRestanteHt;
    row.getCell(7).numFmt = '#,##0.00 "€"';

    row.getCell(8).value = eq.priceDay;
    row.getCell(8).numFmt = '#,##0 "€"';

    row.getCell(9).value = eq.seuilRentabiliteJours;
    row.getCell(9).numFmt = '#,##0';
    row.getCell(9).font = { name: 'Calibri', size: 10, bold: true };

    row.getCell(10).value = eq.totalJoursLoues;
    row.getCell(10).numFmt = '#,##0';

    row.getCell(11).value = eq.caTotalHt;
    row.getCell(11).numFmt = '#,##0.00 "€"';
    row.getCell(11).font = { name: 'Calibri', size: 10, bold: true, color: { argb: '047857' } };

    row.getCell(12).value = eq.margeNetteHt;
    row.getCell(12).numFmt = '#,##0.00 "€"';
    row.getCell(12).font = {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: eq.margeNetteHt >= 0 ? '047857' : 'B45309' },
    };

    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      if (!cell.font) cell.font = { name: 'Calibri', size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        bottom: { style: 'thin', color: { argb: COLORS.grayBorder } },
        right: { style: 'thin', color: { argb: COLORS.grayBorder } },
      };
      if (c >= 3 && c !== 4) cell.alignment = { horizontal: 'right', vertical: 'middle' };
      else if (c < 3) cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    }

    rIdx++;
  });

  // Ligne de Totaux avec Formules Excel =SOMME(...)
  const totRow = ws.getRow(rIdx);
  totRow.height = 26;
  ws.mergeCells(`A${rIdx}:B${rIdx}`);
  totRow.getCell(1).value = 'TOTAL DU PARC MATÉRIEL';
  totRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.navyDark } };

  totRow.getCell(3).value = { formula: `SUM(C9:C${rIdx - 1})` };
  totRow.getCell(3).numFmt = '#,##0.00 "€"';

  totRow.getCell(5).value = { formula: `SUM(E9:E${rIdx - 1})` };
  totRow.getCell(5).numFmt = '#,##0.00 "€"';

  totRow.getCell(6).value = { formula: `SUM(F9:F${rIdx - 1})` };
  totRow.getCell(6).numFmt = '#,##0.00 "€"';

  totRow.getCell(7).value = { formula: `SUM(G9:G${rIdx - 1})` };
  totRow.getCell(7).numFmt = '#,##0.00 "€"';

  totRow.getCell(10).value = { formula: `SUM(J9:J${rIdx - 1})` };
  totRow.getCell(10).numFmt = '#,##0';

  totRow.getCell(11).value = { formula: `SUM(K9:K${rIdx - 1})` };
  totRow.getCell(11).numFmt = '#,##0.00 "€"';

  totRow.getCell(12).value = { formula: `SUM(L9:L${rIdx - 1})` };
  totRow.getCell(12).numFmt = '#,##0.00 "€"';

  for (let c = 1; c <= 12; c++) {
    const cell = totRow.getCell(c);
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.navyDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
    if (c >= 3) cell.alignment = { horizontal: 'right', vertical: 'middle' };
  }

  ws.autoFilter = `A8:L${rIdx - 1}`;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
