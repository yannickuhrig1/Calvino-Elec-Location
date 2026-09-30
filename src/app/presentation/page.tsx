import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { PresentationClient } from './PresentationClient';

export const metadata: Metadata = {
  title: "Présentation de la Plateforme & Console Administrateur | Calvino Location",
  description: "Découvrez l'ensemble des fonctionnalités de Calvino Location : catalogue matériel BTP, réservation instantanée, et visite guidée complète des capacités d'administration métier.",
};

export const dynamic = 'force-dynamic';

export default async function PresentationPage() {
  // Récupération des statistiques réelles et matériels
  const [equipmentCount, unitCount, reservationCount, promoCount, equipments] = await Promise.all([
    prisma.equipment.count(),
    prisma.equipmentUnit.count(),
    prisma.reservation.count(),
    prisma.promoCode.count(),
    prisma.equipment.findMany({
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        units: {
          select: {
            id: true,
            serialNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        priceDay: 'desc',
      },
    }),
  ]);

  const stats = {
    equipmentCount,
    unitCount,
    reservationCount,
    promoCount,
  };

  return (
    <PresentationClient
      stats={stats}
      equipments={equipments}
    />
  );
}
