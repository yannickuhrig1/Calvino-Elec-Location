import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { EtatDesLieuxClientView } from '@/frontend/features/inspection/EtatDesLieuxClientView';

export const dynamic = 'force-dynamic';

interface InspectionPageProps {
  params: { id: string };
}

export default async function InspectionPage({ params }: InspectionPageProps) {
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
          units: true,
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

  return (
    <EtatDesLieuxClientView
      reservation={JSON.parse(JSON.stringify(reservation))}
    />
  );
}
