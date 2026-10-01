import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  recipient?: string;
  subject?: string;
}

// Configuration du transporteur d'emails
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      }),
      isConfigured: true,
      sender: process.env.EMAIL_FROM || `"CALVINO Location" <${user}>`,
    };
  }

  // Mode de démonstration / simulation sans échec si pas de SMTP configuré
  return {
    transporter: null,
    isConfigured: false,
    sender: process.env.EMAIL_FROM || `"CALVINO Location" <calvinoelec@gmail.com>`,
  };
}

const BRAND_NAVY = '#0f172a';
const BRAND_AMBER = '#d97706';
const BRAND_SLATE = '#334155';
const BRAND_BG = '#f8fafc';
const BRAND_BORDER = '#e2e8f0';

/**
 * Assainit les données textuelles pour prévenir toute injection HTML dans les emails
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getEmailWrapper(title: string, contentHtml: string): string {
  const currentYear = new Date().getFullYear();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND_SLATE}; }
    table { border-collapse: collapse; }
    .btn-action { display: inline-block; background-color: ${BRAND_AMBER}; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 15px; margin: 15px 0; text-align: center; }
    .btn-action:hover { background-color: #b45309; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_BG}; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container principal -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid ${BRAND_BORDER}; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- En-tête de marque -->
          <tr>
            <td style="background-color: ${BRAND_NAVY}; padding: 26px 30px; text-align: left; border-bottom: 3px solid ${BRAND_AMBER};">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                      CALVINO <span style="color: ${BRAND_AMBER};">LOCATION</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 3px; font-weight: 500;">
                      Location de matériel BTP, Jardin & Travaux • Coin-lès-Cuvry (Moselle 57)
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.1); color: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                      Pro & Particuliers
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenu du message -->
          <tr>
            <td style="padding: 30px 30px 25px 30px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Bloc Coordonnées de l'agence -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; border-top: 1px solid ${BRAND_BORDER}; font-size: 13px; color: #475569;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top; width: 50%;">
                    <strong style="color: ${BRAND_NAVY}; display: block; margin-bottom: 4px;">📍 Dépôt & Retrait :</strong>
                    CALVINO ELEC<br>
                    71 Rue de la Fontenelle<br>
                    57420 Coin-lès-Cuvry
                  </td>
                  <td style="vertical-align: top; width: 50%; padding-left: 15px;">
                    <strong style="color: ${BRAND_NAVY}; display: block; margin-bottom: 4px;">📞 Contact Direct :</strong>
                    Téléphone : <a href="tel:0663447489" style="color: ${BRAND_AMBER}; text-decoration: none; font-weight: 600;">06 63 44 74 89</a><br>
                    Email : <a href="mailto:calvinoelec@gmail.com" style="color: ${BRAND_AMBER}; text-decoration: none;">calvinoelec@gmail.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pied de page légal -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 30px; text-align: center; color: #64748b; font-size: 11px; line-height: 1.5;">
              CALVINO ELEC SASU • SIRET : 918 642 984 00018 • RCS Metz • Assurance Décennale & RCP BTP<br>
              © ${currentYear} Calvino Location. Tous droits réservés.
              <br><br>
              <a href="${siteUrl}" style="color: #94a3b8; text-decoration: underline;">Consulter notre catalogue en ligne</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// 1. Template : Confirmation de Réservation (Client)
export function buildReservationConfirmedEmail(reservation: any): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';
  const accessUrl = `${appUrl}/suivi?ref=${reservation.reservationNumber}&code=${reservation.secretAccessCode}`;
  const startDateStr = format(new Date(reservation.startDate), 'dd MMMM yyyy', { locale: fr });
  const endDateStr = format(new Date(reservation.endDate), 'dd MMMM yyyy', { locale: fr });

  const subject = `✅ [Calvino Location] Réservation confirmée n° ${reservation.reservationNumber} - ${reservation.equipment?.name || 'Matériel'}`;

  const htmlContent = `
    <div style="font-size: 16px; color: ${BRAND_NAVY}; font-weight: 700; margin-bottom: 12px;">
      Bonjour ${escapeHtml(reservation.customerName)},
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      Nous avons le plaisir de vous confirmer la réservation de votre matériel <strong>${reservation.equipment?.name || 'professionnel'}</strong>. Votre dossier a été validé par notre équipe.
    </p>

    <!-- Carte récapitulatif -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid ${BRAND_BORDER}; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="background-color: #e2e8f0; padding: 10px 16px; font-weight: 700; font-size: 13px; color: ${BRAND_NAVY};">
          📋 RÉCAPITULATIF DE VOTRE LOCATION
        </td>
      </tr>
      <tr>
        <td style="padding: 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
            <tr>
              <td width="35%" style="color: #64748b;">N° de Dossier :</td>
              <td style="font-weight: 700; color: ${BRAND_NAVY};">${reservation.reservationNumber}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Matériel :</td>
              <td style="font-weight: 600; color: ${BRAND_NAVY};">${reservation.equipment?.name || 'Matériel'}</td>
            </tr>
            ${reservation.unit ? `
            <tr>
              <td style="color: #64748b;">Unité assignée :</td>
              <td style="font-weight: 600; color: ${BRAND_AMBER};">${reservation.unit.internalCode}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="color: #64748b;">Période :</td>
              <td style="font-weight: 600;">Du <strong>${startDateStr} à ${reservation.pickupTime}</strong><br>au <strong>${endDateStr} à ${reservation.returnTime}</strong> (${reservation.rentalDays} jours)</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Mode de mise à disposition :</td>
              <td>${reservation.deliveryMode === 'DELIVERY_ON_SITE' ? `🚚 Livraison sur chantier : <strong>${escapeHtml(reservation.deliveryAddress)}</strong>` : '🏢 Retrait au dépôt (Coin-lès-Cuvry)'}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Montant Total Location :</td>
              <td style="font-weight: 800; font-size: 15px; color: ${BRAND_NAVY};">${reservation.totalAmount.toFixed(2)} € TTC</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Caution exigée :</td>
              <td style="font-weight: 700; color: #b45309;">${reservation.depositAmount.toFixed(0)} € (empreinte bancaire non débitée)</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Pièces à fournir -->
    <div style="background-color: #fffbeb; border-left: 4px solid ${BRAND_AMBER}; padding: 12px 16px; border-radius: 4px; margin-bottom: 22px; font-size: 13px; color: #92400e;">
      <strong>⚠️ Pièces justificatives à présenter lors de la mise à disposition :</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 18px;">
        <li>Une pièce d'identité en cours de validité (CNI ou Passeport)</li>
        <li>Un justificatif de domicile de moins de 3 mois (ou extrait KBIS pour les entreprises)</li>
        <li>Une carte bancaire pour le dépôt de garantie (${reservation.depositAmount.toFixed(0)} € non débités)</li>
      </ul>
    </div>

    <!-- Bouton CTA -->
    <div style="text-align: center; margin: 25px 0 15px 0;">
      <a href="${accessUrl}" class="btn-action">
        Consulter mon dossier & Signer le contrat en ligne →
      </a>
    </div>
    <div style="text-align: center; font-size: 11px; color: #94a3b8;">
      Code d'accès sécurisé : <strong>${reservation.secretAccessCode}</strong>
    </div>
  `;

  const textContent = `
Bonjour ${reservation.customerName},

Votre réservation n° ${reservation.reservationNumber} pour le matériel "${reservation.equipment?.name}" a bien été confirmée.

Période : Du ${startDateStr} à ${reservation.pickupTime} au ${endDateStr} à ${reservation.returnTime} (${reservation.rentalDays} jours).
Total : ${reservation.totalAmount.toFixed(2)} € TTC
Caution (non débitée) : ${reservation.depositAmount.toFixed(0)} €

Dépôt Calvino Elec : 71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry
Téléphone : 06 63 44 74 89

Consultez et signez votre contrat en ligne : ${accessUrl}
Code d'accès : ${reservation.secretAccessCode}

Cordialement,
L'équipe CALVINO Location
  `.trim();

  return {
    subject,
    html: getEmailWrapper(subject, htmlContent),
    text: textContent,
  };
}

// 2. Template : Rappel de restitution 24h avant (Client)
export function buildReturnReminderEmail(reservation: any): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';
  const accessUrl = `${appUrl}/suivi?ref=${reservation.reservationNumber}&code=${reservation.secretAccessCode}`;
  const endDateStr = format(new Date(reservation.endDate), 'dd MMMM yyyy', { locale: fr });

  const subject = `⏰ [Calvino Location] Rappel de restitution demain - Dossier n° ${reservation.reservationNumber}`;

  const htmlContent = `
    <div style="font-size: 16px; color: ${BRAND_NAVY}; font-weight: 700; margin-bottom: 12px;">
      Bonjour ${escapeHtml(reservation.customerName)},
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      Nous vous rappelons que votre contrat de location pour le matériel <strong>${reservation.equipment?.name}</strong> arrive à échéance le <strong>${endDateStr} à ${reservation.returnTime}</strong>.
    </p>

    <!-- Checklist retour -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid ${BRAND_BORDER}; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="background-color: #e2e8f0; padding: 10px 16px; font-weight: 700; font-size: 13px; color: ${BRAND_NAVY};">
          🔍 CHECKLIST POUR UNE RESTITUTION CONFORME & RAPIDE
        </td>
      </tr>
      <tr>
        <td style="padding: 16px; font-size: 13px; line-height: 1.7;">
          <table width="100%" border="0" cellspacing="0" cellpadding="6">
            <tr>
              <td width="24" style="vertical-align: top; color: ${BRAND_AMBER}; font-size: 16px;">✓</td>
              <td><strong>Nettoyage :</strong> Le matériel doit être rendu propre (dépoussiéré, sans résidus de terre ou de béton collé).</td>
            </tr>
            <tr>
              <td width="24" style="vertical-align: top; color: ${BRAND_AMBER}; font-size: 16px;">✓</td>
              <td><strong>Carburant / Batteries :</strong> Rendre avec le niveau de carburant initial (ou batteries chargées).</td>
            </tr>
            <tr>
              <td width="24" style="vertical-align: top; color: ${BRAND_AMBER}; font-size: 16px;">✓</td>
              <td><strong>Accessoires complets :</strong> Vérifiez la présence de l'ensemble des câbles, mallettes, adaptateurs et clés fournis au départ.</td>
            </tr>
            <tr>
              <td width="24" style="vertical-align: top; color: ${BRAND_AMBER}; font-size: 16px;">✓</td>
              <td><strong>État des lieux de retour :</strong> Un contrôle technique contradictoire sera réalisé ensemble pour libérer immédiatement votre caution de <strong>${reservation.depositAmount.toFixed(0)} €</strong>.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 6px; font-size: 13px; color: ${BRAND_SLATE}; margin-bottom: 20px;">
      <strong>${reservation.deliveryMode === 'DELIVERY_ON_SITE' ? '🚚 Modalité reprise sur chantier :' : '🏢 Modalité restitution au dépôt :'}</strong><br>
      ${reservation.deliveryMode === 'DELIVERY_ON_SITE' 
        ? `Notre chauffeur interviendra à l'adresse du chantier : <strong>${escapeHtml(reservation.deliveryAddress)}</strong> à l'horaire convenu (${reservation.returnTime}). Merci de veiller à ce que le matériel soit accessible.`
        : `Rendez-vous à notre dépôt : <strong>71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry</strong>.`
      }
    </div>

    <p style="font-size: 13px; color: #64748b;">
      Un imprévu sur votre chantier ? Besoin de prolonger votre location ? Contactez-nous sans attendre au <strong style="color: ${BRAND_NAVY};">06 63 44 74 89</strong> afin de vérifier la disponibilité du planning.
    </p>

    <div style="text-align: center; margin: 25px 0 10px 0;">
      <a href="${accessUrl}" class="btn-action">
        Consulter mon dossier de location →
      </a>
    </div>
  `;

  const textContent = `
Bonjour ${reservation.customerName},

Rappel de restitution pour votre location n° ${reservation.reservationNumber} (${reservation.equipment?.name}).
Échéance : Demain ${endDateStr} à ${reservation.returnTime}.

Checklist avant restitution :
- Matériel nettoyé
- Plein de carburant ou batteries chargées
- Tous les accessoires et câbles rassemblés
- L'état des lieux contradictoire permettra de libérer votre caution de ${reservation.depositAmount.toFixed(0)} €.

Besoin de prolonger ? Appelez-nous au 06 63 44 74 89.

L'équipe CALVINO Location
  `.trim();

  return {
    subject,
    html: getEmailWrapper(subject, htmlContent),
    text: textContent,
  };
}

// 3. Template : Fin de location, Facture & Restitution de caution (Client)
export function buildReservationCompletedEmail(reservation: any): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';
  const accessUrl = `${appUrl}/suivi?ref=${reservation.reservationNumber}&code=${reservation.secretAccessCode}`;
  const invoiceNumber = reservation.invoiceNumber || `FAC-2026-${reservation.reservationNumber.replace('CALV-2026-', '')}`;

  const subject = `🧾 [Calvino Location] Clôture de location n° ${reservation.reservationNumber} - Facture & Restitution de Caution`;

  const htmlContent = `
    <div style="font-size: 16px; color: ${BRAND_NAVY}; font-weight: 700; margin-bottom: 12px;">
      Bonjour ${escapeHtml(reservation.customerName)},
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      Votre location pour le matériel <strong>${reservation.equipment?.name}</strong> est désormais clôturée avec succès. L'état des lieux de retour contradictoire a été validé.
    </p>

    <!-- Notification Caution libérée -->
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="30" style="vertical-align: top; font-size: 20px; color: #059669;">🛡️</td>
          <td>
            <strong style="color: #065f46; font-size: 14px;">Dépôt de garantie libéré :</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #047857;">
              L'empreinte bancaire de caution d'un montant de <strong>${reservation.depositAmount.toFixed(0)} €</strong> a été automatiquement annulée suite à l'état des lieux conforme.
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Facture officielle -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid ${BRAND_BORDER}; border-radius: 8px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
            <tr>
              <td width="40%" style="color: #64748b;">Facture officielle n° :</td>
              <td style="font-weight: 700; color: ${BRAND_NAVY};">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Statut règlement :</td>
              <td style="font-weight: 700; color: #059669;">Acquittée</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Montant Total TTC :</td>
              <td style="font-weight: 800; font-size: 15px; color: ${BRAND_NAVY};">${reservation.totalAmount.toFixed(2)} € TTC</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Dont TVA (20%) :</td>
              <td>${reservation.taxAmount.toFixed(2)} €</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 25px 0 20px 0;">
      <a href="${accessUrl}" class="btn-action">
        Consulter & Télécharger ma Facture PDF →
      </a>
    </div>

    <!-- Avis client -->
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 13px; color: #475569;">
      ⭐ <strong>Votre avis compte pour nous !</strong><br>
      Vous avez apprécié la qualité du matériel et de notre service ? Laissez-nous quelques étoiles pour soutenir une entreprise locale de Moselle.
    </div>
  `;

  const textContent = `
Bonjour ${reservation.customerName},

Votre location n° ${reservation.reservationNumber} (${reservation.equipment?.name}) est clôturée.
L'état des lieux est validé et votre caution de ${reservation.depositAmount.toFixed(0)} € a été libérée.

Votre facture officielle ${invoiceNumber} est disponible en ligne.
Montant TTC acquitté : ${reservation.totalAmount.toFixed(2)} € TTC.

Téléchargez votre facture ici : ${accessUrl}

Merci de votre confiance,
L'équipe CALVINO Location
  `.trim();

  return {
    subject,
    html: getEmailWrapper(subject, htmlContent),
    text: textContent,
  };
}

// 4. Template : Alerte Admin Nouvelle Réservation (Pour Yannick)
export function buildAdminNewBookingAlert(reservation: any): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';
  const adminUrl = `${appUrl}/admin/reservations/${reservation.id}`;
  const startDateStr = format(new Date(reservation.startDate), 'dd/MM/yyyy');
  const endDateStr = format(new Date(reservation.endDate), 'dd/MM/yyyy');

  const subject = `🚨 [Calvino Location] Nouvelle réservation reçue - ${reservation.reservationNumber} (${reservation.customerName})`;

  const htmlContent = `
    <div style="font-size: 16px; color: ${BRAND_NAVY}; font-weight: 800; margin-bottom: 12px;">
      🚨 NOUVELLE DEMANDE DE RÉSERVATION REÇUE EN LIGNE
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      Un client vient d'enregistrer une réservation sur la plateforme. Voici le récapitulatif opérationnel pour confirmation et attribution de l'unité physique :
    </p>

    <!-- Fiche Client & Matériel -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid ${BRAND_BORDER}; border-radius: 8px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
            <tr>
              <td width="35%" style="color: #64748b;">N° Réservation :</td>
              <td style="font-weight: 700; color: ${BRAND_NAVY};">${reservation.reservationNumber}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Client :</td>
              <td style="font-weight: 700; color: ${BRAND_NAVY};">
                ${escapeHtml(reservation.customerName)}
                ${reservation.customerCompany ? ` (${escapeHtml(reservation.customerCompany)})` : ''}
              </td>
            </tr>
            <tr>
              <td style="color: #64748b;">Téléphone :</td>
              <td><a href="tel:${escapeHtml(reservation.customerPhone)}" style="color: ${BRAND_AMBER}; font-weight: 700;">${escapeHtml(reservation.customerPhone)}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b;">Email :</td>
              <td><a href="mailto:${escapeHtml(reservation.customerEmail)}" style="color: ${BRAND_SLATE};">${escapeHtml(reservation.customerEmail)}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b;">Matériel demandé :</td>
              <td style="font-weight: 700; color: ${BRAND_AMBER}; font-size: 14px;">${reservation.equipment?.name || 'Matériel'}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Dates :</td>
              <td style="font-weight: 600;">Du ${startDateStr} (${reservation.pickupTime}) au ${endDateStr} (${reservation.returnTime}) • <strong>${reservation.rentalDays} jours</strong></td>
            </tr>
            <tr>
              <td style="color: #64748b;">Mode logistique :</td>
              <td>${reservation.deliveryMode === 'DELIVERY_ON_SITE' ? `🚚 Livraison sur chantier : ${escapeHtml(reservation.deliveryAddress)}` : '🏢 Retrait direct au dépôt'}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Montant Facturable :</td>
              <td style="font-weight: 800; font-size: 15px; color: ${BRAND_NAVY};">${reservation.totalAmount.toFixed(2)} € TTC (Caution : ${reservation.depositAmount.toFixed(0)} €)</td>
            </tr>
            ${reservation.customerNotes ? `
            <tr>
              <td style="color: #64748b; vertical-align: top;">Remarque client :</td>
              <td style="font-style: italic; color: #475569;">« ${escapeHtml(reservation.customerNotes)} »</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 25px 0 10px 0;">
      <a href="${adminUrl}" class="btn-action">
        Traiter la réservation & Assigner une unité dans l'Admin →
      </a>
    </div>
  `;

  const textContent = `
🚨 NOUVELLE DEMANDE DE RÉSERVATION
Dossier : ${reservation.reservationNumber}
Client : ${reservation.customerName} (${reservation.customerPhone} - ${reservation.customerEmail})
Matériel : ${reservation.equipment?.name}
Dates : Du ${startDateStr} au ${endDateStr} (${reservation.rentalDays} jours)
Mode : ${reservation.deliveryMode === 'DELIVERY_ON_SITE' ? `Livraison : ${reservation.deliveryAddress}` : 'Retrait dépôt'}
Total TTC : ${reservation.totalAmount.toFixed(2)} € TTC

Gérer dans l'administration : ${adminUrl}
  `.trim();

  return {
    subject,
    html: getEmailWrapper(subject, htmlContent),
    text: textContent,
  };
}

// Fonction générique d'envoi
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResult> {
  const { transporter, isConfigured, sender } = getEmailTransporter();

  if (!isConfigured || !transporter) {
    console.log(`\n================== [EMAIL SIMULÉ - CONFIG SMTP ABSENTE] ==================`);
    console.log(`À : ${to}`);
    console.log(`De : ${sender}`);
    console.log(`Objet : ${subject}`);
    console.log(`Texte : \n${text.substring(0, 300)}...`);
    console.log(`========================================================================\n`);

    return {
      success: true,
      simulated: true,
      recipient: to,
      subject,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
      text,
    });

    console.log(`[Email Envoyé] Message ID: ${info.messageId} à ${to}`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      recipient: to,
      subject,
    };
  } catch (err: any) {
    console.error(`[Erreur Envoi Email] Vers ${to}:`, err);
    return {
      success: false,
      error: err.message || 'Erreur lors de la connexion au serveur SMTP',
      recipient: to,
      subject,
    };
  }
}

// Méthodes métier prêtes à l'emploi
export async function sendReservationConfirmedEmail(reservation: any): Promise<EmailResult> {
  const emailData = buildReservationConfirmedEmail(reservation);
  return await sendEmail({
    to: reservation.customerEmail,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  });
}

export async function sendReturnReminderEmail(reservation: any): Promise<EmailResult> {
  const emailData = buildReturnReminderEmail(reservation);
  return await sendEmail({
    to: reservation.customerEmail,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  });
}

export async function sendReservationCompletedEmail(reservation: any): Promise<EmailResult> {
  const emailData = buildReservationCompletedEmail(reservation);
  return await sendEmail({
    to: reservation.customerEmail,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  });
}

export async function sendAdminNewBookingAlert(reservation: any): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'calvinoelec@gmail.com';
  const emailData = buildAdminNewBookingAlert(reservation);
  return await sendEmail({
    to: adminEmail,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  });
}
