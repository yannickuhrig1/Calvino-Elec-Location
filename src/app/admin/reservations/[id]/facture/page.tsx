import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { FactureClientView } from './FactureClientView';

export const dynamic = 'force-dynamic';

interface FacturePageProps {
  params: { id: string };
}

export default async function FacturePage({ params }: FacturePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/connexion');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: {
      equipment: {
        include: {
          category: true,
        },
      },
      unit: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  // Vérifier propriétaire ou admin
  const isAuthorized =
    user.role === 'ADMIN' ||
    reservation.userId === user.id ||
    reservation.customerEmail.toLowerCase() === user.email.toLowerCase();

  if (!isAuthorized) {
    redirect('/compte');
  }

  // Si pas encore de numéro de facture, en générer un officiel automatiquement
  let invoiceNumber = reservation.invoiceNumber;
  let invoiceIssuedAt = reservation.invoiceIssuedAt;

  if (!invoiceNumber) {
    invoiceNumber = `FAC-${reservation.reservationNumber.replace('CALV-', '')}`;
    invoiceIssuedAt = new Date();
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        invoiceNumber,
        invoiceIssuedAt,
      },
    });
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  return (
    <FactureClientView
      reservation={JSON.parse(JSON.stringify({ ...reservation, invoiceNumber, invoiceIssuedAt }))}
      settings={JSON.parse(JSON.stringify(settings || {}))}
    />
  );
}
