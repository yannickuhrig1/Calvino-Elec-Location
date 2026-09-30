import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  buildReservationConfirmedEmail,
  buildReturnReminderEmail,
  buildReservationCompletedEmail,
  buildAdminNewBookingAlert,
  sendReservationConfirmedEmail,
  sendReturnReminderEmail,
  sendReservationCompletedEmail,
  sendAdminNewBookingAlert,
  sendEmail,
  getEmailTransporter,
} from '@/lib/emailService';

interface Params {
  params: { id: string };
}

// GET : Obtenir les aperçus HTML des 4 types d'emails pour cette réservation
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
        unit: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const { isConfigured } = getEmailTransporter();

    const confirmationPreview = buildReservationConfirmedEmail(reservation);
    const reminderPreview = buildReturnReminderEmail(reservation);
    const completionPreview = buildReservationCompletedEmail(reservation);
    const adminAlertPreview = buildAdminNewBookingAlert(reservation);

    return NextResponse.json({
      smtpConfigured: isConfigured,
      customerEmail: reservation.customerEmail,
      previews: {
        CONFIRMATION: {
          title: 'Confirmation de réservation',
          recipient: reservation.customerEmail,
          subject: confirmationPreview.subject,
          html: confirmationPreview.html,
        },
        REMINDER_RETURN: {
          title: 'Rappel de restitution (24h avant)',
          recipient: reservation.customerEmail,
          subject: reminderPreview.subject,
          html: reminderPreview.html,
        },
        COMPLETION: {
          title: 'Facture acquittée & Clôture',
          recipient: reservation.customerEmail,
          subject: completionPreview.subject,
          html: completionPreview.html,
        },
        ADMIN_ALERT: {
          title: 'Alerte nouvelle réservation (Admin)',
          recipient: process.env.ADMIN_NOTIFICATION_EMAIL || 'calvinoelec@gmail.com',
          subject: adminAlertPreview.subject,
          html: adminAlertPreview.html,
        },
      },
    });
  } catch (err: any) {
    console.error('Erreur GET email previews:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Déclencher l'envoi d'un email spécifique
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
        unit: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const { emailType, customRecipient, customSubject, customMessage } = body;

    let result;
    let actionLabel = '';

    switch (emailType) {
      case 'CONFIRMATION':
        result = await sendReservationConfirmedEmail(reservation);
        actionLabel = `Email de confirmation envoyé à ${reservation.customerEmail}`;
        break;

      case 'REMINDER_RETURN':
        result = await sendReturnReminderEmail(reservation);
        actionLabel = `Rappel de restitution envoyé à ${reservation.customerEmail}`;
        break;

      case 'COMPLETION':
        result = await sendReservationCompletedEmail(reservation);
        actionLabel = `Facture & décharge caution envoyées à ${reservation.customerEmail}`;
        break;

      case 'ADMIN_ALERT':
        result = await sendAdminNewBookingAlert(reservation);
        actionLabel = `Alerte réservation renvoyée à l'administrateur`;
        break;

      case 'CUSTOM':
        if (!customSubject || !customMessage) {
          return NextResponse.json({ error: 'Sujet et message requis' }, { status: 400 });
        }
        result = await sendEmail({
          to: customRecipient || reservation.customerEmail,
          subject: customSubject,
          text: customMessage,
          html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #334155;"><p>${customMessage.replace(/\n/g, '<br>')}</p></div>`,
        });
        actionLabel = `Message personnalisé envoyé à ${customRecipient || reservation.customerEmail} : « ${customSubject} »`;
        break;

      default:
        return NextResponse.json({ error: 'Type d’email non reconnu' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Erreur lors de l’envoi' }, { status: 500 });
    }

    // Enregistrer l'événement dans le journal d'audit de la réservation
    const history = JSON.parse(reservation.statusHistoryJson || '[]');
    history.push({
      status: 'EMAIL_SENT',
      date: new Date().toISOString(),
      author: `Admin (${user.firstName || 'Gestionnaire'})`,
      note: `${actionLabel} ${result.simulated ? '(Mode simulation - SMTP non renseigné)' : ''}`,
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        statusHistoryJson: JSON.stringify(history),
      },
    });

    return NextResponse.json({
      success: true,
      result,
      message: result.simulated
        ? `Email préparé avec succès (Mode simulation local/démo). Pour l'envoi réel, configurez vos identifiants SMTP.`
        : `Email transmis avec succès à ${result.recipient}.`,
    });
  } catch (err: any) {
    console.error('Erreur POST send email:', err);
    return NextResponse.json({ error: err.message || 'Erreur lors du traitement de l’email' }, { status: 500 });
  }
}
