import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { ContratClientView } from '@/frontend/features/contracts/ContratClientView';

export const dynamic = 'force-dynamic';

interface ContratPageProps {
  params: { id: string };
}

export default async function ContratPage({ params }: ContratPageProps) {
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

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  return (
    <ContratClientView
      reservation={JSON.parse(JSON.stringify(reservation))}
      settings={JSON.parse(JSON.stringify(settings || {}))}
    />
  );
}
