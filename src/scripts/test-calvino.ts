/**
 * Suite de tests end-to-end programmatique pour Calvino Location
 * Vérifie toutes les pages, APIs, calculs tarifaires, moteur de disponibilité et transactions.
 */
import { addDays, format } from 'date-fns';

const BASE_URL = 'http://127.0.0.1:3000';

async function runTests() {
  console.log('🚀 Démarrage des tests automatisés complets pour Calvino Location...\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`⏳ Test: ${name}... `);
      await fn();
      console.log('✅ OK');
      passed++;
    } catch (e: any) {
      console.log(`❌ ÉCHEC: ${e.message}`);
      failed++;
    }
  }

  // 1. Tests des pages publiques
  const publicPages = [
    '/',
    '/materiels',
    '/materiels/compresseur-chantier-2500l',
    '/comment-ca-marche',
    '/tarifs-et-conditions',
    '/contact',
    '/faq',
    '/suivi',
    '/connexion',
    '/inscription',
    '/mentions-legales',
    '/conditions-location',
    '/confidentialite',
  ];

  for (const page of publicPages) {
    await test(`Page HTTP GET ${page}`, async () => {
      const res = await fetch(`${BASE_URL}${page}`);
      if (res.status !== 200) {
        throw new Error(`Statut HTTP inattendu : ${res.status}`);
      }
      const html = await res.text();
      if (!html.includes('Calvino') && !html.includes('CALVINO')) {
        throw new Error('Le nom Calvino est absent de la page');
      }
    });
  }

  // 2. Test Disponibilité API
  let compressorId = '';
  await test('API GET /api/availability', async () => {
    // Récupérer l'ID du compresseur depuis la page
    const pageRes = await fetch(`${BASE_URL}/materiels/compresseur-chantier-2500l`);
    const html = await pageRes.text();
    const match = html.match(/equipmentId=([^&"]+)/);
    if (!match) {
      // Trouver l'équipement directement via import
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const comp = await prisma.equipment.findUnique({ where: { slug: 'compresseur-chantier-2500l' } });
      compressorId = comp!.id;
      await prisma.$disconnect();
    } else {
      compressorId = match[1];
    }

    const today = new Date();
    const startStr = format(addDays(today, 10), 'yyyy-MM-dd');
    const endStr = format(addDays(today, 12), 'yyyy-MM-dd');

    const res = await fetch(`${BASE_URL}/api/availability?equipmentId=${compressorId}&startDate=${startStr}&endDate=${endStr}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.isAvailable || data.availableUnitsCount < 1) {
      throw new Error(`Disponibilité attendue > 0, reçue : ${data.availableUnitsCount}`);
    }
  });

  // 3. Test de Connexion Client & Admin
  let adminCookie = '';
  let clientCookie = '';

  await test('API Auth: Connexion Client démo', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'client.demo@calvino-location.fr',
        password: 'ClientPassword2026!',
      }),
    });
    if (!res.ok) throw new Error(`Échec login client: ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) throw new Error('Cookie de session absent');
    clientCookie = setCookie.split(';')[0];
  });

  await test('API Auth: Connexion Administrateur', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@calvino-location.fr',
        password: 'AdminPassword2026!',
      }),
    });
    if (!res.ok) throw new Error(`Échec login admin: ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) throw new Error('Cookie de session absent');
    adminCookie = setCookie.split(';')[0];
  });

  // 4. Test Accès pages protégées
  await test('Sécurité: Espace Client avec cookie', async () => {
    const res = await fetch(`${BASE_URL}/compte`, {
      headers: { Cookie: clientCookie },
    });
    if (res.status !== 200) throw new Error(`Attendu 200, reçu ${res.status}`);
  });

  await test('Sécurité: Espace Admin avec cookie administrateur', async () => {
    const res = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: adminCookie },
    });
    if (res.status !== 200) throw new Error(`Attendu 200, reçu ${res.status}`);
  });

  await test('Sécurité: Refus accès /admin avec compte CLIENT', async () => {
    const res = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: clientCookie },
      redirect: 'manual',
    });
    if (res.status === 200) throw new Error('Un client ne doit pas pouvoir accéder directement à /admin');
  });

  // 5. Création d'une nouvelle réservation réelle (Cycle complet)
  let createdReservationId = '';
  let createdReservationNumber = '';
  let createdSecret = '';

  await test('Cycle Métier: Création de réservation en ligne (statut EN ATTENTE obligatoire)', async () => {
    const today = new Date();
    const startStr = format(addDays(today, 15), 'yyyy-MM-dd');
    const endStr = format(addDays(today, 17), 'yyyy-MM-dd');

    const res = await fetch(`${BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: clientCookie,
      },
      body: JSON.stringify({
        equipmentId: compressorId,
        startDate: startStr,
        endDate: endStr,
        pickupTime: '08:30',
        returnTime: '17:30',
        deliveryMode: 'PICKUP_DEPOT',
        customerName: 'Thomas Dubois Testeur',
        customerEmail: 'client.demo@calvino-location.fr',
        customerPhone: '06 12 34 56 78',
        customerCompany: 'Dubois Travaux',
        customerAddress: '15 Boulevard BTP',
        customerCity: 'Metz',
        customerPostalCode: '93200',
        customerNotes: 'Test automatisé du cycle complet de location Calvino Location.',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Erreur POST /api/reservations: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    if (data.reservation.status !== 'PENDING') {
      throw new Error(`Le statut initial DOIT être PENDING, reçu : ${data.reservation.status}`);
    }

    if (data.reservation.rentalDays !== 3) {
      throw new Error(`Attendu 3 jours de location, reçu : ${data.reservation.rentalDays}`);
    }

    if (data.reservation.depositAmount !== 1200) {
      throw new Error(`Caution attendue 1200 €, reçue : ${data.reservation.depositAmount}`);
    }

    createdReservationId = data.reservation.id;
    createdReservationNumber = data.reservation.reservationNumber;
    createdSecret = data.reservation.secretAccessCode;
  });

  // 6. Test Suivi invité sans mot de passe
  await test('Cycle Métier: Suivi invité avec code secret', async () => {
    const res = await fetch(`${BASE_URL}/suivi?code=${createdReservationNumber}&secret=${createdSecret}`);
    if (res.status !== 200) throw new Error(`Statut HTTP inattendu : ${res.status}`);
    const html = await res.text();
    if (!html.includes(createdReservationNumber)) {
      throw new Error('La référence de réservation n’apparaît pas sur la page de suivi');
    }
  });

  // 7. Cycle Administrateur : Confirmation avec assignation d'unité physique
  await test('Cycle Métier (Admin): Confirmation avec assignation d’unité physique', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const units = await prisma.equipmentUnit.findMany({ where: { equipmentId: compressorId } });
    const unitToAssign = units[0];

    const res = await fetch(`${BASE_URL}/api/reservations/${createdReservationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        newStatus: 'CONFIRMED',
        unitId: unitToAssign.id,
        reason: 'Réservation validée par Gaëtan Calvino. Unité vérifiée.',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Échec confirmation: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    if (data.reservation.status !== 'CONFIRMED') {
      throw new Error(`Statut attendu CONFIRMED, reçu : ${data.reservation.status}`);
    }
    if (data.reservation.unitId !== unitToAssign.id) {
      throw new Error(`Unité assignée attendue ${unitToAssign.id}, reçue : ${data.reservation.unitId}`);
    }
    await prisma.$disconnect();
  });

  // 8. Cycle Administrateur : Remise du matériel (IN_PROGRESS)
  await test('Cycle Métier (Admin): Remise du matériel au départ (IN_PROGRESS)', async () => {
    const res = await fetch(`${BASE_URL}/api/reservations/${createdReservationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        newStatus: 'IN_PROGRESS',
        reason: 'Matériel remis au client, fiche état des lieux signée et caution TPE enregistrée.',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Échec passage IN_PROGRESS: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    if (data.reservation.status !== 'IN_PROGRESS') {
      throw new Error(`Statut attendu IN_PROGRESS, reçu : ${data.reservation.status}`);
    }
  });

  // 9. Cycle Administrateur : Restitution & Libération de caution (COMPLETED)
  await test('Cycle Métier (Admin): Restitution matériel et libération caution (COMPLETED)', async () => {
    const res = await fetch(`${BASE_URL}/api/reservations/${createdReservationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        newStatus: 'COMPLETED',
        reason: 'Retour conforme, propreté cuve et niveau carburant vérifiés. Caution débloquée.',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Échec clôture COMPLETED: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    if (data.reservation.status !== 'COMPLETED') {
      throw new Error(`Statut attendu COMPLETED, reçu : ${data.reservation.status}`);
    }
  });

  // 10. Test anti-double réservation dans une transaction
  await test('Sécurité Métier: Détection stricte et refus de double réservation sur la même unité', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const units = await prisma.equipmentUnit.findMany({ where: { equipmentId: compressorId } });
    const unit = units[0];

    const today = new Date();
    const startStr = format(addDays(today, 25), 'yyyy-MM-dd');
    const endStr = format(addDays(today, 28), 'yyyy-MM-dd');

    // Réservation 1 : confirmée sur cette unité
    const res1 = await prisma.reservation.create({
      data: {
        reservationNumber: 'CALV-TEST-CONFLIT-1',
        equipmentId: compressorId,
        unitId: unit.id,
        customerName: 'Client Conflit 1',
        customerEmail: 'test1@calvino.fr',
        customerPhone: '0600000001',
        customerAddress: 'Rue 1',
        startDate: addDays(today, 25),
        endDate: addDays(today, 28),
        rentalDays: 4,
        basePrice: 340,
        subtotalHt: 340,
        taxRate: 20,
        taxAmount: 68,
        totalAmount: 408,
        depositAmount: 1200,
        calculationJson: '{}',
        status: 'CONFIRMED',
        statusHistoryJson: '[]',
        secretAccessCode: 'SECRET-TEST-1',
      },
    });

    // Réservation 2 : demande en attente qui chevauche
    const res2 = await prisma.reservation.create({
      data: {
        reservationNumber: 'CALV-TEST-CONFLIT-2',
        equipmentId: compressorId,
        customerName: 'Client Conflit 2',
        customerEmail: 'test2@calvino.fr',
        customerPhone: '0600000002',
        customerAddress: 'Rue 2',
        startDate: addDays(today, 26),
        endDate: addDays(today, 27),
        rentalDays: 2,
        basePrice: 170,
        subtotalHt: 170,
        taxRate: 20,
        taxAmount: 34,
        totalAmount: 204,
        depositAmount: 1200,
        calculationJson: '{}',
        status: 'PENDING',
        statusHistoryJson: '[]',
        secretAccessCode: 'SECRET-TEST-2',
      },
    });

    // Tentative de confirmation de la réservation 2 sur la MÊME unité
    const patchRes = await fetch(`${BASE_URL}/api/reservations/${res2.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        newStatus: 'CONFIRMED',
        unitId: unit.id,
      }),
    });

    // Nettoyage des tests de conflit
    await prisma.reservation.deleteMany({
      where: { reservationNumber: { in: ['CALV-TEST-CONFLIT-1', 'CALV-TEST-CONFLIT-2'] } },
    });
    await prisma.$disconnect();

    if (patchRes.ok) {
      throw new Error('La double réservation aurait dû être strictement bloquée par la transaction !');
    }

  });

  // 7. Tests Système Promotions & Codes Promo
  await test('Promotions: Récupération des offres publiques actives', async () => {
    const res = await fetch(`${BASE_URL}/api/promotions`);
    if (!res.ok) throw new Error(`Attendu 200, reçu ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.promotions) || data.promotions.length === 0) {
      throw new Error('Aucune promotion retournée.');
    }
  });

  await test('Promotions: Validation en direct d’un code valide (BIENVENUE10)', async () => {
    const res = await fetch(`${BASE_URL}/api/promotions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'BIENVENUE10',
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        estimatedAmountHt: 200,
      }),
    });
    if (!res.ok) throw new Error(`Validation échouée : ${res.status}`);
    const data = await res.json();
    if (!data.valid || data.promoCode.discountValue !== 10) {
      throw new Error(`Résultat inattendu : ${JSON.stringify(data)}`);
    }
  });

  await test('Promotions: Rejet d’un code inexistant ou non valide', async () => {
    const res = await fetch(`${BASE_URL}/api/promotions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'CODE_INVENTE_999' }),
    });
    const data = await res.json();
    if (data.valid === true) {
      throw new Error('Un code inexistant ne doit jamais être validé !');
    }
  });

  await test('Admin: Supervision des codes promo et calcul du ROI', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/promotions`, {
      headers: { Cookie: adminCookie },
    });
    if (!res.ok) throw new Error(`Attendu 200, reçu ${res.status}`);
    const data = await res.json();
    if (!data.stats || data.stats.totalCodes === 0) {
      throw new Error(`Statistiques invalides : ${JSON.stringify(data.stats)}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`📊 RÉSULTAT FINAL DU BANC D'ESSAI :`);
  console.log(`✅ Tests réussis : ${passed}`);
  console.log(`❌ Tests échoués : ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Erreur fatale banc d’essai :', e);
  process.exit(1);
});
