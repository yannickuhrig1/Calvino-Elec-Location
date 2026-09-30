import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const {
      companyName,
      phone,
      email,
      address,
      openingHoursJson,
      depositPolicy,
      deliveryPolicy,
      siret,
      tvaIntra,
      rcsCity,
      assuranceRcp,
    } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        companyName,
        phone,
        email,
        address,
        openingHoursJson,
        depositPolicy,
        deliveryPolicy,
        siret,
        tvaIntra,
        rcsCity,
        assuranceRcp,
      },
      create: {
        id: 'default',
        companyName: companyName || 'CALVINO ELEC',
        phone: phone || '06 63 44 74 89',
        email: email || 'calvinoelec@gmail.com',
        address: address || '71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY',
        openingHoursJson: openingHoursJson || '{}',
        depositPolicy: depositPolicy || '',
        deliveryPolicy: deliveryPolicy || '',
        siret: siret || '918 642 984 00018',
        tvaIntra: tvaIntra || 'FR84918642984',
        rcsCity: rcsCity || 'Metz',
        assuranceRcp: assuranceRcp || '',
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('Erreur PATCH settings:', err);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
