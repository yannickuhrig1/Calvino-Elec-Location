import ExcelJS from 'exceljs';
import {
  AccountingTransaction,
  AccountingSummary,
  EquipmentFinancialStats,
  GlobalParcFinancials,
} from './accounting';

// Palette de couleurs premium CALVINO ELEC
const COLORS = {
  navyDark: '0F172A',      // Slate 900 - Entêtes principales
  navyMedium: '1E293B',    // Slate 800 - Sous-titres
  navyLight: '334155',     // Slate 700 - Bordures fortes
  amberGold: 'D97706',     // Amber 600 - Accents & Titres financiers
  amberLight: 'FEF3C7',    // Amber 100 - Fond KPI Amortissement
  amberDark: '92400E',     // Amber 800 - Texte KPI Amortissement
  blueAccent: '2563EB',    // Blue 600 - Liens, refs, investissement
  blueLight: 'EFF6FF',     // Blue 50 - Fond KPI Investissement
  blueDark: '1E40AF',      // Blue 800 - Texte KPI Investissement
  greenSuccess: '059669',  // Emerald 600 - Rentable, positif, encaissement
  greenLight: 'ECFDF5',    // Emerald 50 - Fond KPI CA
  greenDark: '065F46',     // Emerald 800 - Texte KPI CA
  emeraldDark: '065F46',   // Emerald 800 alias
  purpleAccent: '7C3AED',  // Purple 600 - Marge nette
  purpleLight: 'F5F3FF',   // Purple 50 - Fond KPI Marge
  purpleDark: '5B21B6',    // Purple 800 - Texte KPI Marge
  redAlert: 'DC2626',      // Red 600 - Remises / alertes
  redLight: 'FEF2F2',      // Red 50 - Fond remises
  redDark: '991B1B',       // Red 800 - Texte remises
  grayZebra: 'F8FAFC',     // Slate 50 - Alternance lignes
  grayCard: 'F1F5F9',      // Slate 100 - Cartes & totaux
  grayBorder: 'E2E8F0',    // Slate 200 - Bordures fines
  grayBorderStrong: '94A3B8', // Slate 400
  textPrimary: '0F172A',
  textMuted: '64748B',
  white: 'FFFFFF',
};

// Formats de nombres standard Excel
const FMT = {
  currency: '#,##0.00 "€"',
  currencyInt: '#,##0 "€"',
  percent: '0.0%',
  days: '#,##0.0 "j"',
  daysInt: '#,##0 "j"',
  number: '#,##0',
  date: 'dd/mm/yyyy',
};

// Helper pour appliquer des bordures fines
function applyBorders(cell: ExcelJS.Cell, style: ExcelJS.BorderStyle = 'thin', color = COLORS.grayBorder) {
  cell.border = {
    top: { style, color: { argb: color } },
    bottom: { style, color: { argb: color } },
    left: { style, color: { argb: color } },
    right: { style, color: { argb: color } },
  };
}

// Helper pour créer une carte KPI spacieuse
function createKpiCard(
  ws: ExcelJS.Worksheet,
  startCol: string,
  endCol: string,
  startRow: number,
  label: string,
  value: number | string,
  numFmt: string,
  bgColor: string,
  textColor: string,
  subtitle?: string
) {
  const topRange = `${startCol}${startRow}:${endCol}${startRow}`;
  const midRange = `${startCol}${startRow + 1}:${endCol}${startRow + 2}`;
  
  ws.mergeCells(topRange);
  const topCell = ws.getCell(`${startCol}${startRow}`);
  topCell.value = label.toUpperCase();
  topCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: textColor } };
  topCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
  topCell.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(midRange);
  const valCell = ws.getCell(`${startCol}${startRow + 1}`);
  valCell.value = value;
  if (typeof value === 'number') {
    valCell.numFmt = numFmt;
  }
  valCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: textColor } };
  valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
  valCell.alignment = { horizontal: 'center', vertical: 'middle' };

  if (subtitle) {
    const subRange = `${startCol}${startRow + 3}:${endCol}${startRow + 3}`;
    ws.mergeCells(subRange);
    const subCell = ws.getCell(`${startCol}${startRow + 3}`);
    subCell.value = subtitle;
    subCell.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: textColor } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // Bordures extérieures de la carte
  const startColIdx = Number(ws.getCell(`${startCol}1`).col);
  const endColIdx = Number(ws.getCell(`${endCol}1`).col);
  const endRowIdx = subtitle ? startRow + 3 : startRow + 2;

  for (let r = startRow; r <= endRowIdx; r++) {
    for (let c = startColIdx; c <= endColIdx; c++) {
      const cell = ws.getRow(r).getCell(c);
      cell.border = {
        top: r === startRow ? { style: 'medium', color: { argb: textColor } } : undefined,
        bottom: r === endRowIdx ? { style: 'medium', color: { argb: textColor } } : undefined,
        left: c === startColIdx ? { style: 'medium', color: { argb: textColor } } : undefined,
        right: c === endColIdx ? { style: 'medium', color: { argb: textColor } } : undefined,
      };
    }
  }
}

/**
 * ============================================================================
 * EXPORT 1 : RENTABILITÉ DU PARC & AMORTISSEMENTS (Suite Financière Complète)
 * ============================================================================
 */
export async function generateStyledRentabiliteExcel(
  equipments: EquipmentFinancialStats[],
  parcFinancials: GlobalParcFinancials
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CALVINO ELEC';
  workbook.lastModifiedBy = 'CALVINO ELEC - Direction & Comptabilité';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------------------------
  // ONGLET 1 : TABLEAU DE BORD EXÉCUTIF & KPI
  // ---------------------------------------------------------------------------
  const wsDash = workbook.addWorksheet('Synthèse & Pilotage', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // 1. Grande Bannière Entreprise
  wsDash.mergeCells('A1:L1');
  const dTitle = wsDash.getCell('A1');
  dTitle.value = 'CALVINO ELEC — PILOTAGE FINANCIER & PERFORMANCE DU PARC MATÉRIEL';
  dTitle.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: COLORS.white } };
  dTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsDash.getRow(1).height = 40;

  wsDash.mergeCells('A2:L2');
  const dSub = wsDash.getCell('A2');
  dSub.value = `Division Matériel BTP & Chantier • 71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry • Devis MaxOutil : 4 777,49 € HT • Export officiel du ${new Date().toLocaleDateString('fr-FR')}`;
  dSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'CBD5E1' } };
  dSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  dSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsDash.getRow(2).height = 24;

  wsDash.getRow(3).height = 14;

  // 2. 6 Grandes Cartes KPI (Lignes 4 à 7)
  createKpiCard(wsDash, 'A', 'B', 4, "Investissement Total HT", parcFinancials.totalInvestissementHt, FMT.currency, COLORS.blueLight, COLORS.blueDark, "Devis réel MaxOutil (9 matériels)");
  createKpiCard(wsDash, 'C', 'D', 4, "Amortissement Cumulé HT", parcFinancials.totalAmortissementCumuleHt, FMT.currency, COLORS.amberLight, COLORS.amberDark, `${parcFinancials.tauxAmortissementGlobal.toFixed(1)}% amorti à ce jour`);
  createKpiCard(wsDash, 'E', 'F', 4, "Valeur Nette Comptable (VNC)", parcFinancials.totalVncRestanteHt, FMT.currency, 'F1F5F9', COLORS.navyDark, "Actif résiduel du parc au bilan");
  createKpiCard(wsDash, 'G', 'H', 4, "CA Locations Réalisé HT", parcFinancials.totalCaGenereHt, FMT.currency, COLORS.greenLight, COLORS.greenDark, `${parcFinancials.nbEquipementsRentabilises} / ${parcFinancials.nbEquipementsTotal} matériels rentabilisés`);
  createKpiCard(wsDash, 'I', 'J', 4, "Marge Nette Déduite HT", parcFinancials.margeNetteGlobaleHt, FMT.currency, COLORS.purpleLight, COLORS.purpleDark, "CA net d'amortissement & entretien");
  createKpiCard(wsDash, 'K', 'L', 4, "Taux de Couverture du Parc", parcFinancials.tauxCouvertureGlobal / 100, FMT.percent, COLORS.greenLight, COLORS.emeraldDark, "CA Réalisé / Investissement Initial");

  wsDash.getRow(4).height = 20;
  wsDash.getRow(5).height = 20;
  wsDash.getRow(6).height = 20;
  wsDash.getRow(7).height = 18;

  wsDash.getRow(8).height = 16;

  // 3. Récapitulatif par Catégorie de Matériel
  wsDash.mergeCells('A9:L9');
  const catTitle = wsDash.getCell('A9');
  catTitle.value = 'RÉPARTITION DE LA RENTABILITÉ PAR PÔLE D\'ACTIVITÉ';
  catTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.navyDark } };
  catTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsDash.getRow(9).height = 28;

  const catHeaders = [
    { title: 'Pôle d\'Activité / Catégorie', width: 34 },
    { title: 'Nb Équipements', width: 18 },
    { title: 'Investissement HT', width: 22 },
    { title: 'Amortissement HT', width: 22 },
    { title: 'VNC Restante HT', width: 22 },
    { title: 'CA Réalisé HT', width: 22 },
    { title: 'Marge Nette HT', width: 22 },
    { title: 'Taux de Couverture', width: 20 },
  ];

  const catHRow = wsDash.getRow(10);
  catHRow.height = 28;
  catHeaders.forEach((h, i) => {
    const c = catHRow.getCell(i + 1);
    c.value = h.title;
    c.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.white } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
    c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'right', indent: i === 0 ? 1 : 0 };
    c.border = { bottom: { style: 'medium', color: { argb: COLORS.amberGold } } };
    wsDash.getColumn(i + 1).width = h.width;
  });

  // Groupement des équipements par catégorie
  const categoriesMap = new Map<string, EquipmentFinancialStats[]>();
  equipments.forEach((eq) => {
    const cat = eq.categoryName || 'Autre';
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
    categoriesMap.get(cat)!.push(eq);
  });

  let catRowIdx = 11;
  categoriesMap.forEach((eqList, catName) => {
    const row = wsDash.getRow(catRowIdx);
    row.height = 24;
    const isEven = (catRowIdx - 11) % 2 === 0;
    const bg = isEven ? COLORS.white : COLORS.grayZebra;

    const count = eqList.length;
    const invest = eqList.reduce((s, e) => s + e.purchasePriceHt, 0);
    const amort = eqList.reduce((s, e) => s + e.amortissementCumuleHt, 0);
    const vnc = eqList.reduce((s, e) => s + e.vncRestanteHt, 0);
    const ca = eqList.reduce((s, e) => s + e.caTotalHt, 0);
    const marge = eqList.reduce((s, e) => s + e.margeNetteHt, 0);
    const couv = invest > 0 ? ca / invest : 0;

    row.getCell(1).value = catName;
    row.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true };

    row.getCell(2).value = count;
    row.getCell(2).numFmt = FMT.number;

    row.getCell(3).value = invest;
    row.getCell(3).numFmt = FMT.currency;

    row.getCell(4).value = amort;
    row.getCell(4).numFmt = FMT.currency;

    row.getCell(5).value = vnc;
    row.getCell(5).numFmt = FMT.currency;

    row.getCell(6).value = ca;
    row.getCell(6).numFmt = FMT.currency;
    row.getCell(6).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.greenDark } };

    row.getCell(7).value = marge;
    row.getCell(7).numFmt = FMT.currency;
    row.getCell(7).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: marge >= 0 ? COLORS.greenDark : COLORS.amberDark } };

    row.getCell(8).value = couv;
    row.getCell(8).numFmt = FMT.percent;
    row.getCell(8).font = { name: 'Segoe UI', size: 10, bold: true };

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      applyBorders(cell);
      cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'right', indent: c === 1 ? 1 : 0 };
    }

    catRowIdx++;
  });

  // Total Catégories
  const catTotRow = wsDash.getRow(catRowIdx);
  catTotRow.height = 26;
  catTotRow.getCell(1).value = 'TOTAL GÉNÉRAL DU PARC';
  catTotRow.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.navyDark } };

  catTotRow.getCell(2).value = { formula: `SUM(B11:B${catRowIdx - 1})` };
  catTotRow.getCell(2).numFmt = FMT.number;

  catTotRow.getCell(3).value = { formula: `SUM(C11:C${catRowIdx - 1})` };
  catTotRow.getCell(3).numFmt = FMT.currency;

  catTotRow.getCell(4).value = { formula: `SUM(D11:D${catRowIdx - 1})` };
  catTotRow.getCell(4).numFmt = FMT.currency;

  catTotRow.getCell(5).value = { formula: `SUM(E11:E${catRowIdx - 1})` };
  catTotRow.getCell(5).numFmt = FMT.currency;

  catTotRow.getCell(6).value = { formula: `SUM(F11:F${catRowIdx - 1})` };
  catTotRow.getCell(6).numFmt = FMT.currency;

  catTotRow.getCell(7).value = { formula: `SUM(G11:G${catRowIdx - 1})` };
  catTotRow.getCell(7).numFmt = FMT.currency;

  catTotRow.getCell(8).value = { formula: `IF(C${catRowIdx}>0, F${catRowIdx}/C${catRowIdx}, 0)` };
  catTotRow.getCell(8).numFmt = FMT.percent;

  for (let c = 1; c <= 8; c++) {
    const cell = catTotRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayCard } };
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
    cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'right', indent: c === 1 ? 1 : 0 };
  }


  // ---------------------------------------------------------------------------
  // ONGLET 2 : ANALYSE DÉTAILLÉE PAR MATÉRIEL (Grand Tableau avec Formules)
  // ---------------------------------------------------------------------------
  const wsDetail = workbook.addWorksheet('Rentabilité par Matériel', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 8 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // Titre & Sous-titre
  wsDetail.mergeCells('A1:R1');
  const dTitle2 = wsDetail.getCell('A1');
  dTitle2.value = 'CALVINO ELEC — ÉTAT DÉTAILLÉ DE L\'AMORTISSEMENT ET DU SEUIL DE RENTABILITÉ';
  dTitle2.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: COLORS.white } };
  dTitle2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  dTitle2.alignment = { vertical: 'middle', indent: 1 };
  wsDetail.getRow(1).height = 38;

  wsDetail.mergeCells('A2:R2');
  const dSub2 = wsDetail.getCell('A2');
  dSub2.value = 'Calculs d\'amortissement linéaire prorata temporis selon le Code Général des Impôts • Formules dynamiques intégrées';
  dSub2.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'CBD5E1' } };
  dSub2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  dSub2.alignment = { vertical: 'middle', indent: 1 };
  wsDetail.getRow(2).height = 22;

  // Lignes de séparation
  wsDetail.getRow(3).height = 10;

  // Note explicative
  wsDetail.mergeCells('A4:R4');
  const noteCell = wsDetail.getCell('A4');
  noteCell.value = '💡 ASTUCE EXCEL : Ce classeur contient des formules de calcul actives. Toute modification du Prix d\'achat ou des Jours loués recalcule automatiquement la VNC et le ROI.';
  noteCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.blueDark } };
  noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blueLight } };
  noteCell.alignment = { vertical: 'middle', indent: 1 };
  wsDetail.getRow(4).height = 22;

  wsDetail.getRow(5).height = 8;
  wsDetail.getRow(6).height = 8;
  wsDetail.getRow(7).height = 8;

  // Colonnes du grand tableau
  const cols = [
    { key: 'ref', header: 'Réf.', width: 10 },
    { key: 'name', header: 'Désignation du Matériel', width: 34 },
    { key: 'cat', header: 'Catégorie', width: 22 },
    { key: 'purchase', header: 'Prix Achat HT', width: 17 },
    { key: 'years', header: 'Amort. (ans)', width: 13 },
    { key: 'dotAn', header: 'Dotation Annuelle', width: 18 },
    { key: 'dotMois', header: 'Dotation Mensuelle', width: 18 },
    { key: 'cumul', header: 'Amorti à Date HT', width: 18 },
    { key: 'vnc', header: 'VNC Restante HT', width: 18 },
    { key: 'priceDay', header: 'Tarif Jour HT', width: 15 },
    { key: 'seuil', header: 'Seuil (Jours)', width: 15 },
    { key: 'loues', header: 'Jours Loués', width: 14 },
    { key: 'restants', header: 'Jours Restants', width: 15 },
    { key: 'ca', header: 'CA Total HT', width: 18 },
    { key: 'maint', header: 'Entretien HT', width: 15 },
    { key: 'marge', header: 'Marge Nette HT', width: 18 },
    { key: 'roi', header: 'Taux ROI', width: 15 },
    { key: 'statut', header: 'Statut Métier', width: 20 },
  ];

  const headerRow = wsDetail.getRow(8);
  headerRow.height = 32;
  cols.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: idx >= 3 && idx < 17 ? 'right' : idx === 17 ? 'center' : 'left',
      indent: idx < 3 ? 1 : 0,
    };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'medium', color: { argb: COLORS.amberGold } },
    };
    wsDetail.getColumn(idx + 1).width = col.width;
  });

  let currRow = 9;
  equipments.forEach((eq, idx) => {
    const r = wsDetail.getRow(currRow);
    r.height = 26;
    const isEven = idx % 2 === 0;
    const bg = isEven ? COLORS.white : COLORS.grayZebra;

    // Réf
    r.getCell(1).value = `MAT-${(idx + 1).toString().padStart(2, '0')}`;
    r.getCell(1).font = { name: 'Consolas', size: 9, bold: true, color: { argb: COLORS.textMuted } };

    // Nom & Catégorie
    r.getCell(2).value = eq.name;
    r.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true };
    r.getCell(3).value = eq.categoryName;

    // Prix Achat
    r.getCell(4).value = eq.purchasePriceHt;
    r.getCell(4).numFmt = FMT.currency;

    // Durée ans
    r.getCell(5).value = eq.amortizationYears;
    r.getCell(5).numFmt = '#,##0';
    r.getCell(5).alignment = { horizontal: 'center' };

    // Formule Dotation Annuelle : =PrixAchat / Duree
    r.getCell(6).value = { formula: `D${currRow}/E${currRow}`, result: eq.dotationAnnuelleHt };
    r.getCell(6).numFmt = FMT.currency;

    // Formule Dotation Mensuelle : =DotationAnnuelle / 12
    r.getCell(7).value = { formula: `F${currRow}/12`, result: eq.dotationMensuelleHt };
    r.getCell(7).numFmt = FMT.currency;

    // Amortissement cumulé
    r.getCell(8).value = eq.amortissementCumuleHt;
    r.getCell(8).numFmt = FMT.currency;

    // Formule VNC : =PrixAchat - AmortissementCumule
    r.getCell(9).value = { formula: `D${currRow}-H${currRow}`, result: eq.vncRestanteHt };
    r.getCell(9).numFmt = FMT.currency;

    // Tarif Jour
    r.getCell(10).value = eq.priceDay;
    r.getCell(10).numFmt = FMT.currency;

    // Formule Seuil Rentabilité en Jours : =ROUNDUP(PrixAchat / TarifJour, 0)
    r.getCell(11).value = { formula: `ROUNDUP(D${currRow}/J${currRow}, 0)`, result: eq.seuilRentabiliteJours };
    r.getCell(11).numFmt = FMT.number;
    r.getCell(11).font = { name: 'Segoe UI', size: 10, bold: true };

    // Jours loués réels
    r.getCell(12).value = eq.totalJoursLoues;
    r.getCell(12).numFmt = FMT.days;

    // Formule Jours Restants : =MAX(0, Seuil - JoursLoues)
    r.getCell(13).value = { formula: `MAX(0, K${currRow}-L${currRow})`, result: eq.joursRestantsPourRentabiliser };
    r.getCell(13).numFmt = FMT.number;

    // CA Réalisé
    r.getCell(14).value = eq.caTotalHt;
    r.getCell(14).numFmt = FMT.currency;
    r.getCell(14).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.greenDark } };

    // Entretien
    r.getCell(15).value = eq.maintenanceCostsHt > 0 ? eq.maintenanceCostsHt : null;
    r.getCell(15).numFmt = FMT.currency;

    // Formule Marge Nette : =CA - AmortissementCumule - Entretien
    r.getCell(16).value = { formula: `N${currRow}-H${currRow}-O${currRow}`, result: eq.margeNetteHt };
    r.getCell(16).numFmt = FMT.currency;
    r.getCell(16).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: eq.margeNetteHt >= 0 ? COLORS.greenDark : COLORS.amberDark },
    };

    // Formule Taux ROI : =MargeNette / PrixAchat
    r.getCell(17).value = { formula: `P${currRow}/D${currRow}`, result: eq.purchasePriceHt > 0 ? eq.margeNetteHt / eq.purchasePriceHt : 0 };
    r.getCell(17).numFmt = FMT.percent;
    r.getCell(17).font = { name: 'Segoe UI', size: 10, bold: true };

    // Formule Statut Métier : =IF(P{r}>0, "★ RENTABLE", IF(N{r}>0, "EN AMORTISSEMENT", "À DÉPLOYER"))
    r.getCell(18).value = {
      formula: `IF(P${currRow}>0, "★ RENTABLE", IF(N${currRow}>0, "EN AMORTISSEMENT", "À DÉPLOYER"))`,
      result: eq.margeNetteHt > 0 ? '★ RENTABLE' : eq.caTotalHt > 0 ? 'EN AMORTISSEMENT' : 'À DÉPLOYER',
    };
    r.getCell(18).font = {
      name: 'Segoe UI',
      size: 9,
      bold: true,
      color: { argb: eq.margeNetteHt > 0 ? COLORS.greenDark : COLORS.amberDark },
    };
    r.getCell(18).alignment = { horizontal: 'center', vertical: 'middle' };

    for (let c = 1; c <= 18; c++) {
      const cell = r.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      applyBorders(cell);
      if (c >= 4 && c <= 17 && c !== 5) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else if (c <= 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }
    }

    currRow++;
  });

  // Ligne de Totaux & Moyennes
  const totRow = wsDetail.getRow(currRow);
  totRow.height = 30;
  wsDetail.mergeCells(`A${currRow}:C${currRow}`);
  totRow.getCell(1).value = 'TOTAL GÉNÉRAL DU PARC MATÉRIEL';
  totRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };

  const startR = 9;
  const endR = currRow - 1;

  // Somme Prix Achat
  totRow.getCell(4).value = { formula: `SUM(D${startR}:D${endR})` };
  totRow.getCell(4).numFmt = FMT.currency;

  // Moyenne Durée
  totRow.getCell(5).value = { formula: `AVERAGE(E${startR}:E${endR})` };
  totRow.getCell(5).numFmt = '0.0 "ans"';
  totRow.getCell(5).alignment = { horizontal: 'center' };

  // Somme Dotation Annuelle
  totRow.getCell(6).value = { formula: `SUM(F${startR}:F${endR})` };
  totRow.getCell(6).numFmt = FMT.currency;

  // Somme Dotation Mensuelle
  totRow.getCell(7).value = { formula: `SUM(G${startR}:G${endR})` };
  totRow.getCell(7).numFmt = FMT.currency;

  // Somme Amorti
  totRow.getCell(8).value = { formula: `SUM(H${startR}:H${endR})` };
  totRow.getCell(8).numFmt = FMT.currency;

  // Somme VNC
  totRow.getCell(9).value = { formula: `SUM(I${startR}:I${endR})` };
  totRow.getCell(9).numFmt = FMT.currency;

  // Moyenne Tarif Jour
  totRow.getCell(10).value = { formula: `AVERAGE(J${startR}:J${endR})` };
  totRow.getCell(10).numFmt = FMT.currency;

  // Moyenne Seuil
  totRow.getCell(11).value = { formula: `AVERAGE(K${startR}:K${endR})` };
  totRow.getCell(11).numFmt = FMT.number;

  // Somme Jours Loués
  totRow.getCell(12).value = { formula: `SUM(L${startR}:L${endR})` };
  totRow.getCell(12).numFmt = FMT.days;

  // Somme Jours Restants
  totRow.getCell(13).value = { formula: `SUM(M${startR}:M${endR})` };
  totRow.getCell(13).numFmt = FMT.number;

  // Somme CA
  totRow.getCell(14).value = { formula: `SUM(N${startR}:N${endR})` };
  totRow.getCell(14).numFmt = FMT.currency;

  // Somme Maintenance
  totRow.getCell(15).value = { formula: `SUM(O${startR}:O${endR})` };
  totRow.getCell(15).numFmt = FMT.currency;

  // Somme Marge Nette
  totRow.getCell(16).value = { formula: `SUM(P${startR}:P${endR})` };
  totRow.getCell(16).numFmt = FMT.currency;

  // ROI Global : =P{tot} / D{tot}
  totRow.getCell(17).value = { formula: `P${currRow}/D${currRow}` };
  totRow.getCell(17).numFmt = FMT.percent;

  // Statut Global
  totRow.getCell(18).value = 'PARC ACTIF';
  totRow.getCell(18).alignment = { horizontal: 'center' };

  for (let c = 1; c <= 18; c++) {
    const cell = totRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayCard } };
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
    if (c >= 4 && c <= 17 && c !== 5) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }
  }

  // Activer le filtre automatique
  wsDetail.autoFilter = `A8:R${currRow - 1}`;


  // ---------------------------------------------------------------------------
  // ONGLET 3 : SIMULATEUR D'INVESTISSEMENT & NOUVEL ACHAT (Anticipation Pro !)
  // ---------------------------------------------------------------------------
  const wsSim = workbook.addWorksheet('Simulateur Investissement', {
    views: [{ showGridLines: true }],
  });

  // Titre
  wsSim.mergeCells('A1:H1');
  const simTitle = wsSim.getCell('A1');
  simTitle.value = 'CALVINO ELEC — SIMULATEUR PRÉVISIONNEL DE RENTABILITÉ POUR FUTUR ACHAT';
  simTitle.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: COLORS.white } };
  simTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  simTitle.alignment = { vertical: 'middle', indent: 1 };
  wsSim.getRow(1).height = 38;

  wsSim.mergeCells('A2:H2');
  const simSub = wsSim.getCell('A2');
  simSub.value = 'Modifiez les cellules bleues ci-dessous pour tester immédiatement la viabilité et le temps de retour sur investissement d\'un futur matériel.';
  simSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'CBD5E1' } };
  simSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  simSub.alignment = { vertical: 'middle', indent: 1 };
  wsSim.getRow(2).height = 22;

  // 1. Paramètres du Simulateur
  wsSim.mergeCells('A4:D4');
  const pHeader = wsSim.getCell('A4');
  pHeader.value = '1. PARAMÈTRES DU NOUVEL INVESTISSEMENT PROJETÉ (À MODIFIER)';
  pHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.white } };
  pHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blueDark } };
  pHeader.alignment = { vertical: 'middle', indent: 1 };
  wsSim.getRow(4).height = 28;

  const simParams = [
    { label: 'Nom / Désignation du matériel envisagé', defaultVal: 'Exemple : Mini-Pelle 1.5 Tonnes', fmt: '@' },
    { label: 'Prix d\'achat HT envisagé (€)', defaultVal: 18500, fmt: FMT.currency },
    { label: 'Durée d\'amortissement fiscal (années)', defaultVal: 5, fmt: '#,##0 "ans"' },
    { label: 'Tarif journalier proposé aux clients (€ HT / jour)', defaultVal: 160, fmt: FMT.currency },
    { label: 'Estimation de location mensuelle (jours loués / mois)', defaultVal: 8, fmt: FMT.daysInt },
    { label: 'Provision entretien & assurance annuelle (% du prix)', defaultVal: 0.05, fmt: FMT.percent },
  ];

  simParams.forEach((param, idx) => {
    const rowIdx = 5 + idx;
    const row = wsSim.getRow(rowIdx);
    row.height = 24;

    wsSim.mergeCells(`A${rowIdx}:C${rowIdx}`);
    const lbl = row.getCell(1);
    lbl.value = param.label;
    lbl.font = { name: 'Segoe UI', size: 10, bold: true };
    lbl.alignment = { vertical: 'middle', indent: 1 };

    const val = row.getCell(4);
    val.value = param.defaultVal;
    val.numFmt = param.fmt;
    val.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.blueDark } };
    val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blueLight } };
    val.alignment = { vertical: 'middle', horizontal: 'right' };
    applyBorders(val, 'medium', COLORS.blueAccent);
  });

  // 2. Résultats Automatiques
  wsSim.mergeCells('E4:H4');
  const rHeader = wsSim.getCell('E4');
  rHeader.value = '2. RÉSULTATS FINANCIERS & SEUILS CALCULÉS AUTOMATIQUEMENT';
  rHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.white } };
  rHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldDark } };
  rHeader.alignment = { vertical: 'middle', indent: 1 };

  const simOutputs = [
    { label: 'Chiffre d\'Affaires Mensuel Estimé', formula: '=D8*D7', fmt: FMT.currency },
    { label: 'Chiffre d\'Affaires Annuel Estimé', formula: '=H5*12', fmt: FMT.currency },
    { label: 'Dotation Amortissement Annuelle', formula: '=D6/D7', fmt: FMT.currency },
    { label: 'Seuil de Rentabilité (Break-even en Jours)', formula: '=ROUNDUP(D6/D8, 0)', fmt: FMT.daysInt },
    { label: 'Délai pour Rentabiliser (Mois)', formula: '=ROUNDUP(D6/H5, 1)', fmt: '#,##0.0 "mois"' },
    { label: 'Marge Nette Annuelle Projetée', formula: '=H6-H7-(D6*D10)', fmt: FMT.currency },
  ];

  simOutputs.forEach((output, idx) => {
    const rowIdx = 5 + idx;
    const row = wsSim.getRow(rowIdx);

    wsSim.mergeCells(`E${rowIdx}:G${rowIdx}`);
    const lbl = row.getCell(5);
    lbl.value = output.label;
    lbl.font = { name: 'Segoe UI', size: 10, bold: true };
    lbl.alignment = { vertical: 'middle', indent: 1 };

    const val = row.getCell(8);
    val.value = { formula: output.formula };
    val.numFmt = output.fmt;
    val.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.emeraldDark } };
    val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenLight } };
    val.alignment = { vertical: 'middle', horizontal: 'right' };
    applyBorders(val, 'medium', COLORS.greenSuccess);
  });

  // Ligne de conclusion automatique
  wsSim.mergeCells('A12:H12');
  const verdictCell = wsSim.getCell('A12');
  verdictCell.value = {
    formula: '="VERDICT PROJET : Rentabilisé en " & TEXT(H9,"0.0") & " mois. Résultat net estimé : " & TEXT(H10,"#,##0 €/an") & " | " & IF(H9<=12, "★ EXCELLENT INVESTISSEMENT (Retour en moins d\'un an)", IF(H9<=24, "TRÈS BON PROJET (Retour en moins de 2 ans)", "PROJET STANDARD À SUIVRE"))',
  };
  verdictCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };
  verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberLight } };
  verdictCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSim.getRow(12).height = 32;

  // Définir largeurs de colonnes
  wsSim.getColumn(1).width = 18;
  wsSim.getColumn(2).width = 18;
  wsSim.getColumn(3).width = 18;
  wsSim.getColumn(4).width = 24;
  wsSim.getColumn(5).width = 18;
  wsSim.getColumn(6).width = 18;
  wsSim.getColumn(7).width = 18;
  wsSim.getColumn(8).width = 24;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * ============================================================================
 * EXPORT 2 : JOURNAL COMPTABLE DES VENTES & FISCALITÉ (PCG + TVA)
 * ============================================================================
 */
export async function generateStyledAccountingExcel(
  transactions: AccountingTransaction[],
  summary: AccountingSummary,
  periodLabel: string = 'Exercice 2026'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CALVINO ELEC';
  workbook.lastModifiedBy = 'CALVINO ELEC - Administration & Comptabilité';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------------------------
  // ONGLET 1 : SYNTHÈSE DES VENTES & FACTURATION CLIENTS
  // ---------------------------------------------------------------------------
  const wsSales = workbook.addWorksheet('Synthèse & Facturation', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 9 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // Titre & En-tête
  wsSales.mergeCells('A1:L1');
  const sTitle = wsSales.getCell('A1');
  sTitle.value = 'CALVINO ELEC — JOURNAL DE FACTURATION & VENTES DE LOCATION';
  sTitle.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: COLORS.white } };
  sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  sTitle.alignment = { vertical: 'middle', indent: 1 };
  wsSales.getRow(1).height = 40;

  wsSales.mergeCells('A2:L2');
  const sSub = wsSales.getCell('A2');
  sSub.value = `Division Location BTP • 71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry • Période : ${periodLabel} • Date d'export : ${new Date().toLocaleDateString('fr-FR')}`;
  sSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'CBD5E1' } };
  sSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  sSub.alignment = { vertical: 'middle', indent: 1 };
  wsSales.getRow(2).height = 24;

  wsSales.getRow(3).height = 12;

  // 6 Cartes KPI
  createKpiCard(wsSales, 'A', 'B', 4, "Prestations Location HT (706000)", summary.totalVentesHt, FMT.currency, COLORS.blueLight, COLORS.blueDark);
  createKpiCard(wsSales, 'C', 'D', 4, "Frais de Port & Livraison HT (708500)", summary.totalLivraisonHt, FMT.currency, 'ECFEFF', '0E7490');
  createKpiCard(wsSales, 'E', 'F', 4, "Remises Commerciales HT (709000)", summary.totalRemisesHt > 0 ? -summary.totalRemisesHt : 0, FMT.currency, COLORS.redLight, COLORS.redDark);
  createKpiCard(wsSales, 'G', 'H', 4, "Chiffre d'Affaires Net HT", summary.totalNetHt, FMT.currency, COLORS.greenLight, COLORS.greenDark);
  createKpiCard(wsSales, 'I', 'J', 4, "TVA 20% Collectée (445710)", summary.totalTvaCollectee, FMT.currency, COLORS.amberLight, COLORS.amberDark);
  createKpiCard(wsSales, 'K', 'L', 4, "Total TTC Créances Clients (411000)", summary.totalTtcExigible, FMT.currency, COLORS.purpleLight, COLORS.purpleDark);

  wsSales.getRow(4).height = 20;
  wsSales.getRow(5).height = 20;
  wsSales.getRow(6).height = 20;

  wsSales.getRow(7).height = 12;

  // Entêtes de colonnes
  const sCols = [
    { header: 'N° Facture / Pièce', width: 18 },
    { header: 'Date', width: 14 },
    { header: 'Client / Entreprise', width: 32 },
    { header: 'Matériel Loué', width: 34 },
    { header: 'Durée (j)', width: 12 },
    { header: 'Base HT (706000)', width: 18 },
    { header: 'Port HT (708500)', width: 18 },
    { header: 'Remise HT (709000)', width: 18 },
    { header: 'Net Facturé HT', width: 18 },
    { header: 'TVA 20% (445710)', width: 18 },
    { header: 'Total TTC (411000)', width: 20 },
    { header: 'Caution Non Encaissée', width: 22 },
  ];

  const sHeaderRow = wsSales.getRow(8);
  sHeaderRow.height = 32;
  sCols.forEach((col, idx) => {
    const cell = sHeaderRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: idx >= 4 ? 'right' : 'left',
      indent: idx < 4 ? 1 : 0,
    };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'medium', color: { argb: COLORS.amberGold } },
    };
    wsSales.getColumn(idx + 1).width = col.width;
  });

  let sCurrRow = 9;
  transactions.forEach((tx, idx) => {
    const row = wsSales.getRow(sCurrRow);
    row.height = 24;
    const isEven = idx % 2 === 0;
    const bg = isEven ? COLORS.white : COLORS.grayZebra;

    row.getCell(1).value = tx.reservationNumber;
    row.getCell(1).font = { name: 'Consolas', size: 10, bold: true, color: { argb: COLORS.blueAccent } };

    row.getCell(2).value = new Date(tx.date);
    row.getCell(2).numFmt = FMT.date;

    row.getCell(3).value = tx.customerCompany ? `${tx.customerCompany} (${tx.customerName})` : tx.customerName;
    row.getCell(3).font = { name: 'Segoe UI', size: 10 };

    row.getCell(4).value = tx.equipmentName;

    row.getCell(5).value = tx.rentalDays;
    row.getCell(5).numFmt = FMT.days;

    row.getCell(6).value = tx.basePriceHt;
    row.getCell(6).numFmt = FMT.currency;

    row.getCell(7).value = tx.deliveryFeeHt > 0 ? tx.deliveryFeeHt : null;
    row.getCell(7).numFmt = FMT.currency;

    row.getCell(8).value = tx.promoDiscountHt > 0 ? -tx.promoDiscountHt : null;
    row.getCell(8).numFmt = FMT.currency;
    if (tx.promoDiscountHt > 0) {
      row.getCell(8).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.redDark } };
    }

    // Formule Net HT : =Base + Port + Remise(déjà négative)
    row.getCell(9).value = { formula: `F${sCurrRow}+G${sCurrRow}+H${sCurrRow}`, result: tx.netHt };
    row.getCell(9).numFmt = FMT.currency;
    row.getCell(9).font = { name: 'Segoe UI', size: 10, bold: true };

    // Formule TVA 20% : =NetHT * 0.20
    row.getCell(10).value = { formula: `ROUND(I${sCurrRow}*0.2, 2)`, result: tx.tvaAmount };
    row.getCell(10).numFmt = FMT.currency;
    row.getCell(10).font = { name: 'Segoe UI', size: 10, color: { argb: COLORS.amberDark } };

    // Formule Total TTC : =NetHT + TVA
    row.getCell(11).value = { formula: `I${sCurrRow}+J${sCurrRow}`, result: tx.totalTtc };
    row.getCell(11).numFmt = FMT.currency;
    row.getCell(11).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.greenDark } };

    row.getCell(12).value = tx.depositAmount;
    row.getCell(12).numFmt = FMT.currencyInt;
    row.getCell(12).font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: COLORS.textMuted } };

    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      applyBorders(cell);
      if (c >= 5) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }
    }

    sCurrRow++;
  });

  // Ligne de Total Général
  const sTotRow = wsSales.getRow(sCurrRow);
  sTotRow.height = 30;
  wsSales.mergeCells(`A${sCurrRow}:D${sCurrRow}`);
  sTotRow.getCell(1).value = 'TOTAL GÉNÉRAL DU JOURNAL DES VENTES';
  sTotRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };

  const sStartR = 9;
  const sEndR = sCurrRow - 1;

  if (transactions.length > 0) {
    sTotRow.getCell(5).value = { formula: `SUM(E${sStartR}:E${sEndR})` };
    sTotRow.getCell(5).numFmt = FMT.days;

    sTotRow.getCell(6).value = { formula: `SUM(F${sStartR}:F${sEndR})` };
    sTotRow.getCell(6).numFmt = FMT.currency;

    sTotRow.getCell(7).value = { formula: `SUM(G${sStartR}:G${sEndR})` };
    sTotRow.getCell(7).numFmt = FMT.currency;

    sTotRow.getCell(8).value = { formula: `SUM(H${sStartR}:H${sEndR})` };
    sTotRow.getCell(8).numFmt = FMT.currency;

    sTotRow.getCell(9).value = { formula: `SUM(I${sStartR}:I${sEndR})` };
    sTotRow.getCell(9).numFmt = FMT.currency;

    sTotRow.getCell(10).value = { formula: `SUM(J${sStartR}:J${sEndR})` };
    sTotRow.getCell(10).numFmt = FMT.currency;

    sTotRow.getCell(11).value = { formula: `SUM(K${sStartR}:K${sEndR})` };
    sTotRow.getCell(11).numFmt = FMT.currency;

    sTotRow.getCell(12).value = { formula: `SUM(L${sStartR}:L${sEndR})` };
    sTotRow.getCell(12).numFmt = FMT.currencyInt;
  }

  for (let c = 1; c <= 12; c++) {
    const cell = sTotRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayCard } };
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
    if (c >= 5) cell.alignment = { horizontal: 'right', vertical: 'middle' };
  }

  wsSales.autoFilter = `A8:L${sCurrRow - 1}`;


  // ---------------------------------------------------------------------------
  // ONGLET 2 : GRAND LIVRE COMPTABLE (ÉCRITURES PCG DÉBIT / CRÉDIT)
  // ---------------------------------------------------------------------------
  const wsJournal = workbook.addWorksheet('Journal Comptable PCG', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }],
  });

  // Titre
  wsJournal.mergeCells('A1:I1');
  const jTitle = wsJournal.getCell('A1');
  jTitle.value = 'CALVINO ELEC — GRAND LIVRE ET ÉCRITURES COMPTABLES DU JOURNAL DES VENTES';
  jTitle.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: COLORS.white } };
  jTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  jTitle.alignment = { vertical: 'middle', indent: 1 };
  wsJournal.getRow(1).height = 36;

  wsJournal.mergeCells('A2:I2');
  const jSub = wsJournal.getCell('A2');
  jSub.value = 'Conforme Plan Comptable Général (PCG) • Format compatible Sage, EBP, Pennylane, Cegid & QuickBooks';
  jSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'CBD5E1' } };
  jSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  jSub.alignment = { vertical: 'middle', indent: 1 };
  wsJournal.getRow(2).height = 22;

  wsJournal.getRow(3).height = 10;

  const jCols = [
    { header: 'Journal', width: 12 },
    { header: 'Date Pièce', width: 14 },
    { header: 'N° Pièce', width: 16 },
    { header: 'Compte PCG', width: 14 },
    { header: 'Intitulé du Compte', width: 30 },
    { header: 'Libellé de l\'Écriture', width: 38 },
    { header: 'Tiers / Client', width: 28 },
    { header: 'Débit (€)', width: 18 },
    { header: 'Crédit (€)', width: 18 },
  ];

  const jHeaderRow = wsJournal.getRow(4);
  jHeaderRow.height = 30;
  jCols.forEach((col, idx) => {
    const cell = jHeaderRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.white } };
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
    tx.rows.forEach((r) => {
      const row = wsJournal.getRow(jRowIdx);
      row.height = 22;
      const isZebra = Math.floor(jRowIdx / 2) % 2 === 0;

      row.getCell(1).value = r.journalCode;
      row.getCell(2).value = new Date(r.datePiece);
      row.getCell(2).numFmt = FMT.date;

      row.getCell(3).value = r.pieceNumber;
      row.getCell(3).font = { name: 'Consolas', size: 9, bold: true };

      row.getCell(4).value = r.compteNum;
      row.getCell(4).font = { name: 'Consolas', size: 10, bold: true, color: { argb: COLORS.navyDark } };

      row.getCell(5).value = r.compteLibelle;
      row.getCell(6).value = r.libelleEcriture;
      row.getCell(7).value = r.societeClient ? `${r.societeClient} - ${r.nomClient}` : r.nomClient;

      row.getCell(8).value = r.debit > 0 ? r.debit : null;
      row.getCell(8).numFmt = FMT.currency;
      if (r.debit > 0) row.getCell(8).font = { name: 'Segoe UI', size: 10, bold: true };

      row.getCell(9).value = r.credit > 0 ? r.credit : null;
      row.getCell(9).numFmt = FMT.currency;
      if (r.credit > 0) row.getCell(9).font = { name: 'Segoe UI', size: 10, bold: true };

      for (let c = 1; c <= 9; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isZebra ? COLORS.white : COLORS.grayZebra } };
        applyBorders(cell);
        if (c >= 8) cell.alignment = { horizontal: 'right', vertical: 'middle' };
        else cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }

      jRowIdx++;
    });
  });

  // Ligne de Total Débit / Crédit
  const jTotalRow = wsJournal.getRow(jRowIdx);
  jTotalRow.height = 28;
  wsJournal.mergeCells(`A${jRowIdx}:G${jRowIdx}`);
  jTotalRow.getCell(1).value = 'TOTAL DES ÉCRITURES COMPTABLES :';
  jTotalRow.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.navyDark } };

  if (jRowIdx > 5) {
    jTotalRow.getCell(8).value = { formula: `SUM(H5:H${jRowIdx - 1})` };
    jTotalRow.getCell(8).numFmt = FMT.currency;

    jTotalRow.getCell(9).value = { formula: `SUM(I5:I${jRowIdx - 1})` };
    jTotalRow.getCell(9).numFmt = FMT.currency;
  }

  for (let c = 1; c <= 9; c++) {
    const cell = jTotalRow.getCell(c);
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayCard } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.navyDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  }

  // Contrôle d'équilibre comptable
  const checkRowIdx = jRowIdx + 1;
  const checkRow = wsJournal.getRow(checkRowIdx);
  checkRow.height = 28;
  wsJournal.mergeCells(`A${checkRowIdx}:I${checkRowIdx}`);
  const checkCell = checkRow.getCell(1);
  checkCell.value = {
    formula: `IF(ROUND(H${jRowIdx}-I${jRowIdx}, 2)=0, "✓ CONTRÔLE COMPTABLE VALIDE : La balance est parfaitement équilibrée (Débit = Crédit)", "⚠ ALERTE : Écart détecté entre débit et crédit de " & TEXT(H${jRowIdx}-I${jRowIdx}, "#,##0.00 €"))`,
  };
  checkCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
  checkCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenLight } };
  checkCell.alignment = { horizontal: 'center', vertical: 'middle' };

  wsJournal.autoFilter = `A4:I${jRowIdx - 1}`;


  // ---------------------------------------------------------------------------
  // ONGLET 3 : RÉCAPITULATIF DÉCLARATION DE TVA (CA3)
  // ---------------------------------------------------------------------------
  const wsTva = workbook.addWorksheet('Synthèse Déclaration TVA', {
    views: [{ showGridLines: true }],
  });

  // Titre
  wsTva.mergeCells('A1:F1');
  const tvaTitle = wsTva.getCell('A1');
  tvaTitle.value = 'CALVINO ELEC — BORDEREAU DE SYNTHÈSE TVA COLLECTÉE (CADRE DÉCLARATION CA3)';
  tvaTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: COLORS.white } };
  tvaTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  tvaTitle.alignment = { vertical: 'middle', indent: 1 };
  wsTva.getRow(1).height = 36;

  wsTva.mergeCells('A2:F2');
  const tvaSub = wsTva.getCell('A2');
  tvaSub.value = 'Aide à la déclaration mensuelle ou trimestrielle de TVA • Taux normal en vigueur 20,00%';
  tvaSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'CBD5E1' } };
  tvaSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  tvaSub.alignment = { vertical: 'middle', indent: 1 };
  wsTva.getRow(2).height = 22;

  wsTva.getRow(3).height = 12;

  const tvaLines = [
    { code: '01', libelle: 'Ventes de prestations de services de location (Compte 706000)', base: summary.totalVentesHt, taux: 0.20 },
    { code: '02', libelle: 'Ports et frais accessoires de transport facturés (Compte 708500)', base: summary.totalLivraisonHt, taux: 0.20 },
    { code: '03', libelle: 'Moins : Rabais, remises et ristournes accordés (Compte 709000)', base: -summary.totalRemisesHt, taux: 0.20 },
    { code: '08', libelle: 'TOTAL CHIFFRE D\'AFFAIRES NET IMPOSABLE HT', base: summary.totalNetHt, taux: 0.20, isTotal: true },
  ];

  // Entêtes
  const tvaHeader = wsTva.getRow(4);
  tvaHeader.height = 28;
  const tvaCols = [
    { title: 'Ligne CA3', width: 14 },
    { title: 'Nature de l\'Opération', width: 44 },
    { title: 'Base Hors Taxes (€)', width: 22 },
    { title: 'Taux Applicable', width: 18 },
    { title: 'TVA Exigible (€)', width: 22 },
  ];

  tvaCols.forEach((col, idx) => {
    const c = tvaHeader.getCell(idx + 1);
    c.value = col.title;
    c.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.white } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
    c.alignment = { vertical: 'middle', horizontal: idx >= 2 ? 'right' : 'left', indent: idx === 1 ? 1 : 0 };
    wsTva.getColumn(idx + 1).width = col.width;
  });

  tvaLines.forEach((tl, idx) => {
    const rIdx = 5 + idx;
    const r = wsTva.getRow(rIdx);
    r.height = 26;

    r.getCell(1).value = `Ligne ${tl.code}`;
    r.getCell(1).font = { name: 'Consolas', size: 10, bold: true };
    r.getCell(1).alignment = { horizontal: 'center' };

    r.getCell(2).value = tl.libelle;
    r.getCell(2).font = { name: 'Segoe UI', size: 10, bold: tl.isTotal };

    r.getCell(3).value = tl.base;
    r.getCell(3).numFmt = FMT.currency;
    r.getCell(3).font = { name: 'Segoe UI', size: 10, bold: tl.isTotal };

    r.getCell(4).value = tl.taux;
    r.getCell(4).numFmt = FMT.percent;
    r.getCell(4).alignment = { horizontal: 'center' };

    // Formule TVA : =Base * Taux
    r.getCell(5).value = { formula: `ROUND(C${rIdx}*D${rIdx}, 2)`, result: Number((tl.base * tl.taux).toFixed(2)) };
    r.getCell(5).numFmt = FMT.currency;
    r.getCell(5).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.amberDark } };

    const bg = tl.isTotal ? COLORS.grayCard : (idx % 2 === 0 ? COLORS.white : COLORS.grayZebra);
    for (let c = 1; c <= 5; c++) {
      const cell = r.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      applyBorders(cell);
      if (c >= 3 && c !== 4) cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }
  });

  // Ligne de synthèse finale
  const finalTvaRow = wsTva.getRow(9);
  finalTvaRow.height = 32;
  wsTva.mergeCells('A9:D9');
  finalTvaRow.getCell(1).value = 'TOTAL NET DE LA TVA DUE À REVERSER À L\'ÉTAT :';
  finalTvaRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.navyDark } };
  finalTvaRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

  finalTvaRow.getCell(5).value = { formula: 'E8', result: summary.totalTvaCollectee };
  finalTvaRow.getCell(5).numFmt = FMT.currency;
  finalTvaRow.getCell(5).font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: COLORS.greenDark } };

  for (let c = 1; c <= 5; c++) {
    const cell = finalTvaRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenLight } };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.greenSuccess } },
      bottom: { style: 'double', color: { argb: COLORS.greenSuccess } },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
