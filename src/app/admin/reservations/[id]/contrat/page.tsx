import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ContratClientView } from './ContratClientView';

export const dynamic = 'force-dynamic';

interface ContratPageProps {
  params: { id: string };
}

export default async function ContratPage({ params }: ContratPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
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
