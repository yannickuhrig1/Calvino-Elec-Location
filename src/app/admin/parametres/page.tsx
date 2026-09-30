import React from 'react';
import prisma from '@/lib/prisma';
import { AdminSettingsClient } from './AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminParametresPage() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = {
      id: 'default',
      companyName: 'CALVINO ELEC',
      phone: '06 63 44 74 89',
      email: 'calvinoelec@gmail.com',
      address: '71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY',
      openingHoursJson: '{}',
      depositPolicy: '',
      deliveryPolicy: '',
      isDemoMode: true,
      updatedAt: new Date(),
    };
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)' }}>
          Paramètres généraux & Identité d'agence
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configurez les coordonnées, horaires d'ouverture et mentions de caution appliquées sur tout le site.
        </p>
      </div>

      <AdminSettingsClient
        initialSettings={{
          companyName: settings.companyName,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          openingHoursJson: settings.openingHoursJson,
          depositPolicy: settings.depositPolicy,
          deliveryPolicy: settings.deliveryPolicy,
        }}
      />
    </div>
  );
}
