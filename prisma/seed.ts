import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Amorçage de la base de données Calvino Location / CALVINO ELEC...');

  // Nettoyage préalable si ré-exécution
  await prisma.maintenanceLog.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.equipmentUnit.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSettings.deleteMany();

  // 1. Paramètres généraux de CALVINO ELEC / Calvino Location
  await prisma.siteSettings.create({
    data: {
      id: 'default',
      companyName: 'CALVINO ELEC',
      phone: '06 63 44 74 89',
      email: 'calvinoelec@gmail.com',
      address: '71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY',
      openingHoursJson: JSON.stringify({
        lundi: '07h30 - 12h00 / 13h30 - 18h30',
        mardi: '07h30 - 12h00 / 13h30 - 18h30',
        mercredi: '07h30 - 12h00 / 13h30 - 18h30',
        jeudi: '07h30 - 12h00 / 13h30 - 18h30',
        vendredi: '07h30 - 12h00 / 13h30 - 18h30 (Départ forfait week-end avant 18h15)',
        samedi: 'Fermé au public (pas de retrait ni retour le week-end)',
        dimanche: 'Fermé au public (pas de retrait ni retour le week-end)',
      }),
      depositPolicy:
        'Une caution (dépôt de garantie) est obligatoire pour toute mise à disposition. Elle est déposée par empreinte bancaire non débitée ou par chèque d\'entreprise avec pièce d\'identité au moment de la remise du matériel. Elle n\'est en aucun cas débitée lors de la réservation en ligne et est immédiatement libérée lors de la restitution après contrôle.',
      deliveryPolicy:
        'Livraison et reprise possibles directement sur vos chantiers en Moselle (secteur de Metz, Coin-lès-Cuvry et communes environnantes) sous 24h ouvrées. Créneau fixé lors de la confirmation.',
      isDemoMode: true,
    },
  });

  // 2. Utilisateurs : Admin Gaëtan CALVINO, Kenny & Client Démo
  const adminPasswordHash = await bcrypt.hash('AdminPassword2026!', 10);
  const kennyPasswordHash = await bcrypt.hash('Kenny1181', 10);

  const gaetanUser = await prisma.user.create({
    data: {
      email: 'calvinoelec@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Gaëtan',
      lastName: 'CALVINO',
      phone: '06 63 44 74 89',
      company: 'CALVINO ELEC',
      address: '71 RUE DE LA FONTENELLE',
      city: 'COIN-LES-CUVRY',
      postalCode: '57420',
    },
  });

  await prisma.user.create({
    data: {
      email: 'darklaice@gmail.com',
      passwordHash: kennyPasswordHash,
      role: 'ADMIN',
      firstName: 'Kenny',
      lastName: 'CALVINO',
      phone: '06 63 44 74 89',
      company: 'CALVINO ELEC',
      address: '71 RUE DE LA FONTENELLE',
      city: 'COIN-LES-CUVRY',
      postalCode: '57420',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@calvino-location.fr',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Gaëtan',
      lastName: 'CALVINO',
      phone: '06 63 44 74 89',
      company: 'CALVINO ELEC',
      address: '71 RUE DE LA FONTENELLE',
      city: 'COIN-LES-CUVRY',
      postalCode: '57420',
    },
  });

  const clientPasswordHash = await bcrypt.hash('ClientPassword2026!', 10);
  const clientUser = await prisma.user.create({
    data: {
      email: 'client.demo@calvino-location.fr',
      passwordHash: clientPasswordHash,
      role: 'CLIENT',
      firstName: 'Nicolas',
      lastName: 'Muller',
      phone: '06 12 34 56 78',
      company: 'Muller Bâtiment Moselle',
      address: '15 Rue Serpenoise',
      city: 'Metz',
      postalCode: '57000',
    },
  });

  // 3. Catégories
  const catNettoyage = await prisma.category.create({
    data: {
      name: 'Nettoyage & Entretien',
      slug: 'nettoyage-entretien',
      description: 'Nettoyeurs haute pression professionnels et injecteurs-extracteurs pour sols, textiles, véhicules et terrasses.',
      icon: 'Droplets',
      displayOrder: 1,
    },
  });

  const catRenovation = await prisma.category.create({
    data: {
      name: 'Rénovation, Ponçage & Peinture',
      slug: 'renovation-poncage-peinture',
      description: 'Ponceuses girafes télescopiques à moteur sans charbon, décolleuses à vapeur et équipements de finition murale.',
      icon: 'Sparkles',
      displayOrder: 2,
    },
  });

  const catAspiration = await prisma.category.create({
    data: {
      name: 'Aspiration & Dépoussiérage',
      slug: 'aspiration-depoussierage',
      description: 'Aspirateurs industriels certifiés classe M avec décolmatage automatique pour plâtre, silice et gros chantiers.',
      icon: 'Wind',
      displayOrder: 3,
    },
  });

  const catSciage = await prisma.category.create({
    data: {
      name: 'Sciage & Découpe de précision',
      slug: 'sciage-decoupe',
      description: 'Scies à onglet radiales à double ligne laser pour découpe d\'agencement, parquets, terrasses et menuiserie.',
      icon: 'Disc',
      displayOrder: 4,
    },
  });

  const catBeton = await prisma.category.create({
    data: {
      name: 'Béton & Maçonnerie',
      slug: 'beton-maconnerie',
      description: 'Aiguilles vibrantes sans fil 18V pour vibration du béton, malaxeurs électriques 1800W et outillage gros œuvre.',
      icon: 'Hammer',
      displayOrder: 5,
    },
  });

  const catAir = await prisma.category.create({
    data: {
      name: 'Air comprimé & Gonflage',
      slug: 'air-comprime',
      description: 'Compresseurs d\'atelier verticaux 100L 10 bar, soufflage, peinture et outillage pneumatique professionnel.',
      icon: 'Gauge',
      displayOrder: 6,
    },
  });

  // 4. Équipements du catalogue (9 équipements du devis MaxOutil)
  // 1. Kärcher Puzzi 10/1
  const eqPuzzi = await prisma.equipment.create({
    data: {
      name: 'Nettoyeur Injecteur-Extracteur Kärcher Puzzi 10/1',
      slug: 'karcher-puzzi-10-1',
      summary: 'Injecteur-extracteur professionnel puissant (1 bar, dépression 254 mbar) pour rénovation en profondeur des moquettes, canapés et sièges auto.',
      description: `L'injecteur-extracteur professionnel Kärcher Puzzi 10/1 avec suceur pour fentes et suceur sol est idéal pour le nettoyage hygiénique et efficace des surfaces textiles de petite à moyenne taille.
Grâce à une pression d'injection de 1 bar et une turbine d'aspiration performante de 1250 W, la solution de nettoyage est injectée au cœur des fibres puis aspirée simultanément.
Le temps de séchage est considérablement réduit par rapport aux méthodes classiques. Cuve amovible 2 en 1 pour l'eau propre et la récupération de l'eau sale.`,
      categoryId: catNettoyage.id,
      brand: 'Kärcher Professional',
      model: 'Puzzi 10/1 (Réf. 1.100-130.0)',
      imageUrl: '/images/karcher-puzzi-10-1.jpg',
      specsJson: JSON.stringify({
        'Rendement surfacique': '20 à 25 m²/h',
        'Débit d’air': '74 L/s',
        'Dépression': '254 mbar (25,4 kPa)',
        'Débit d’injection': '1,0 L/min',
        'Pression d’injection': '1,0 bar',
        'Réservoir eau propre / sale': '10 L / 9 L',
        'Puissance de la turbine': '1 250 W',
        'Poids sans accessoires': '10,7 kg',
        'Longueur du câble': '7,5 m',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Flexible d’injection/extraction armé 2,5 m',
        'Suceur pour fentes, coussins et sièges auto',
        'Grand suceur sol articulé avec raclette à moquette',
        'Poignée ergonomique avec gâchette de pulvérisation',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Détergent spécifique textiles / moquettes RM 760 (disponible à l\'achat en agence)',
      ]),
      safetyGuidelines: `• Ne jamais faire fonctionner la pompe sans eau dans le réservoir d’eau propre.
• Utiliser exclusivement des détergents moussants contrôlés ou le produit officiel Kärcher.
• Vider et rincer le bac d’eau sale après chaque utilisation avant restitution.`,
      usageGuidelines: `1. Remplir le réservoir d'eau propre avec de l'eau tiède (max 50°C) et la pastille/dose de nettoyant.
2. Pulvériser en tirant le suceur vers soi d'un mouvement régulier.
3. Pour les taches incrustées, laisser agir 5 à 10 minutes avant aspiration.
4. Effectuer un dernier passage d'aspiration seule pour accélérer le séchage.`,
      pricingType: 'STANDARD',
      priceHalfDay: 30,
      priceDay: 45,
      priceWeekend: 70,
      priceWeek: 160,
      depositAmount: 400,
      purchasePriceHt: 672.90,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 25,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 2. Kärcher HD 5/15 CX+
  const eqHd5 = await prisma.equipment.create({
    data: {
      name: 'Nettoyeur haute pression Kärcher HD 5/15 CX+',
      slug: 'karcher-hd-5-15-cx-plus',
      summary: 'Nettoyeur haute pression professionnel eau froide compact 150 bar (200 bar max), débit 500 L/h, enrouleur de flexible 15 m et buse rotative Rotabuse.',
      description: `Le nettoyeur haute pression à eau froide HD 5/15 CX+ est compact, maniable et polyvalent.
Équipé d'une culasse en laiton haute qualité et d'un système de décharge automatique de la pression qui protège les composants internes et prolonge sa durée de vie.
La poignée-pistolet EASY!Force annule totalement la force de maintien pour un confort de travail exceptionnel.
Son enrouleur intégré avec flexible haute pression de 15 mètres offre un rayon d'action considérable sur chantier et façade.`,
      categoryId: catNettoyage.id,
      brand: 'Kärcher Professional',
      model: 'HD 5/15 CX+ (Réf. 1.520-932.0)',
      imageUrl: '/images/karcher-hd-5-15.jpg',
      specsJson: JSON.stringify({
        'Pression de travail': '150 bar (15 MPa)',
        'Pression max': '200 bar (20 MPa)',
        'Débit d’eau': '500 L/h',
        'Puissance raccordée': '2,8 kW (230 V monophasé)',
        'Type de pompe': 'Axiale à 3 pistons inox avec culasse laiton',
        'Longueur flexible HP': '15 m sur enrouleur intégré',
        'Poids': '28,3 kg',
        'Dimensions': '380 x 370 x 930 mm',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Poignée-pistolet EASY!Force ergonomique',
        'Flexible haute pression 15 m armé sur enrouleur',
        'Lance inox rotative 840 mm',
        'Buse rotative spéciale décapage intensif (Rotabuse)',
        'Buse triple à sélection manuelle (0° / 25° / 40°)',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Tuyau d’arrosage pour alimentation d’eau du réseau',
        'Rallonge électrique chantier 230V',
      ]),
      safetyGuidelines: `• Ne jamais diriger le jet vers des personnes, animaux ou équipements électriques sous tension.
• Port de lunettes de protection et bottes ou chaussures de sécurité obligatoire.
• Toujours purger l'air du circuit avant de mettre l'interrupteur sous tension.`,
      usageGuidelines: `1. Raccorder l'alimentation en eau et ouvrir le robinet au maximum.
2. Purger l'appareil en appuyant sur la gâchette jusqu'à l'obtention d'un jet continu sans bulles d'air.
3. Enclencher l'interrupteur électrique.
4. Pour changer de jet ou de buse, relâcher la gâchette et verrouiller la poignée.`,
      pricingType: 'STANDARD',
      priceHalfDay: 35,
      priceDay: 55,
      priceWeekend: 85,
      priceWeek: 190,
      depositAmount: 600,
      purchasePriceHt: 829.21,
      amortizationYears: 5,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 30,
      cleaningFee: 25,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 3. Aspirateur de chantier Kärcher NT 30/1 Tact Te M
  const eqNt30 = await prisma.equipment.create({
    data: {
      name: 'Aspirateur de chantier classe M Kärcher NT 30/1 Tact Te M',
      slug: 'aspirateur-karcher-nt-30-1-tact-te-m',
      summary: 'Aspirateur de sécurité certifié poussières de classe M avec décolmatage automatique du filtre Tact et prise asservie pour outil électroportatif.',
      description: `L'aspirateur eau et poussières NT 30/1 Tact Te M garantit un degré de filtration de 99,9% des poussières minérales fines (béton, plâtre, bois, silice cristalline).
Son système de décolmatage automatique breveté Tact nettoie le filtre plissé plat par impulsions d'air sans interruption de l'aspiration, assurant une puissance d'aspiration maximale constante.
La prise d'asservissement intégrée met automatiquement l'aspirateur en marche dès le démarrage de votre outil électroportatif raccordé (ponceuse, rainureuse, scie circulaire).`,
      categoryId: catAspiration.id,
      brand: 'Kärcher Professional',
      model: 'NT 30/1 Tact Te M (Réf. 1.148-238.0)',
      imageUrl: '/images/karcher-nt30-aspirateur.jpg',
      specsJson: JSON.stringify({
        'Catégorie de filtration': 'Classe M certifiée (perméabilité < 0,1%)',
        'Débit d’air': '74 L/s',
        'Dépression': '254 mbar (25,4 kPa)',
        'Capacité de la cuve': '30 L',
        'Puissance absorbée': '1 380 W',
        'Prise d’asservissement': 'Jusqu’à 2 200 W d’outil raccordé',
        'Filtre': 'Filtre plissé plat PES résistant à l’humidité',
        'Poids': '14,2 kg',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Flexible d’aspiration antistatique 4 m avec coude',
        'Tubes d’aspiration inox 2 x 0,55 m',
        'Suceur sol eau et poussières combiné 360 mm',
        'Manchon universel d’adaptation pour électroportatif',
        'Filtre plissé plat PES classe M installé',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Sacs filtrants intissés ou sacs de sécurité jetables classe M',
      ]),
      safetyGuidelines: `• Obligatoire sur chantier de ponçage de bandes à joint ou sciage béton pour respecter la réglementation sur la silice cristalline.
• Toujours utiliser avec un sac adapté en mode poussières sèches de plâtre.`,
      usageGuidelines: `1. En cas de ponçage plâtre ou mortier, brancher la prise de la ponceuse directement sur la prise de l'aspirateur.
2. Basculer l'interrupteur sur la position "AUTO" (déclenchement automatique).
3. Le décolmatage s'enclenche automatiquement toutes les 15 secondes pour libérer le filtre.`,
      pricingType: 'STANDARD',
      priceHalfDay: 30,
      priceDay: 45,
      priceWeekend: 70,
      priceWeek: 160,
      depositAmount: 450,
      purchasePriceHt: 634.80,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 25,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 4. Ponceuse girafe FLEX GE 6 X-EC Ø225 mm
  const eqFlex = await prisma.equipment.create({
    data: {
      name: 'Ponceuse girafe FLEX GE 6 X-EC Ø225 mm',
      slug: 'ponceuse-girafe-flex-ge-6-x-ec',
      summary: 'Ponceuse télescopique mur et plafond ultra-légère (3,4 kg) à moteur sans balais (brushless) EC pour ponçage de bandes de plâtre et enduits sans fatigue.',
      description: `La toute nouvelle ponceuse girafe FLEX GE 6 X-EC est la référence absolue des peintres et plaquistes.
Son moteur sans charbon (brushless) déporté sur le manche offre un équilibrage parfait et un poids record de seulement 3,4 kg, ce qui divise par deux la fatigue lors des travaux prolongés au plafond.
Tête de ponçage articulée à cardan pour une adaptation immédiate aux angles et surfaces.
Variateur de vitesse électronique avec maintien du régime sous charge et raccord d'aspiration étanche clipsable.`,
      categoryId: catRenovation.id,
      brand: 'FLEX',
      model: 'GE 6 X-EC 230/CEE (Réf. 534652)',
      imageUrl: '/images/flex-ge6-girafe.jpg',
      specsJson: JSON.stringify({
        'Diamètre du plateau de ponçage': 'Ø 225 mm',
        'Technologie moteur': 'EC Brushless sans charbon haut rendement',
        'Vitesse de rotation à vide': '1 100 - 1 680 tr/min',
        'Longueur totale': '1 520 mm',
        'Poids': '3,4 kg (maniabilité exceptionnelle)',
        'Puissance absorbée': '500 W',
        'Raccord d’aspiration': 'Ø 32 mm avec bague de clipsage sécurisée',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Plateau de ponçage auto-agrippant (Velcro) ultra-souple Ø225 mm',
        'Housse de transport renforcée et matelassée originale FLEX',
        'Bague d’adaptation pour tuyau d’aspirateur professionnel',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Disques abrasifs perforés ou treillis maillés Ø225 mm (grain 80 à 240 vendus en supplément)',
      ]),
      safetyGuidelines: `• Ne jamais poncer sans raccordement à un aspirateur certifié (recommandé : Aspirateur Kärcher NT 30/1 Classe M).
• Porter lunettes de protection et masque antipoussière.`,
      usageGuidelines: `1. Appliquer le disque abrasif velcro centré sur le plateau souple.
2. Régler la vitesse au variateur (vitesse moyenne pour enduit fin).
3. Poser la tête à plat sur le mur avant d'enclencher la gâchette.
4. Effectuer des mouvements amples et circulaires sans exercer de forte pression.`,
      pricingType: 'STANDARD',
      priceHalfDay: 35,
      priceDay: 50,
      priceWeekend: 80,
      priceWeek: 180,
      depositAmount: 600,
      purchasePriceHt: 853.61,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 25,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 5. Scie à onglet radiale Bosch Professional GCM 8 SJL
  const eqBosch = await prisma.equipment.create({
    data: {
      name: 'Scie à onglet radiale Bosch Professional GCM 8 SJL Ø216 mm',
      slug: 'scie-onglet-radiale-bosch-gcm-8-sjl',
      summary: 'Scie radiale de précision avec capacité de coupe horizontale de 312 mm, double faisceau laser et gestion optimisée des copeaux.',
      description: `La scie à onglet radiale Bosch Professional GCM 8 SJL est l'outil indispensable pour la découpe nette et ultra-précise de plinthes, parquets, lames de terrasse, tasseaux et poutres.
Sa conception radiale offre une impressionnante largeur de coupe jusqu'à 312 mm à 90°.
Double faisceau laser délimitant exactement le trait de coupe des deux côtés de la lame.
Collecteur de poussières à 2 points d'aspiration pour un poste de travail propre même en intérieur.`,
      categoryId: catSciage.id,
      brand: 'Bosch Professional',
      model: 'GCM 8 SJL (Réf. 0 601 B19 100)',
      imageUrl: '/images/bosch-gcm-8-sjl.jpg',
      specsJson: JSON.stringify({
        'Diamètre de lame': '216 mm (alésage standard 30 mm)',
        'Capacité de coupe 0°': '70 x 312 mm',
        'Capacité de coupe onglet 45°': '70 x 214 mm',
        'Capacité de coupe biseau 45°': '48 x 312 mm',
        'Réglage d’onglet': '52° Gauche / 60° Droite',
        'Réglage d’inclinaison': '47° Gauche / 2° Droite',
        'Puissance nominale': '1 600 W (230 V)',
        'Régime à vide': '5 500 tr/min',
        'Poids': '17,3 kg',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Lame carbure multi-matériaux 216 mm montée',
        'Pince de serrage rapide pour maintien de la pièce',
        'Sac collecteur de copeaux et adaptateur d’aspiration',
        'Rallonges latérales de table intégrées escamotables',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Usure anormale de lame en cas de découpe de métaux ferreux ou présence de clous',
      ]),
      safetyGuidelines: `• Ne jamais approcher les mains à moins de 15 cm de la lame en rotation.
• Toujours utiliser le presseur vertical pour immobiliser les pièces courtes.
• Casque antibruit et lunettes de sécurité obligatoires.`,
      usageGuidelines: `1. Ajuster l'angle d'onglet et verrouiller la poignée crantée.
2. Démarrer le moteur en laissant la tête en position haute jusqu'à atteindre la vitesse maximale.
3. Abaisser la tête puis pousser le chariot radial vers l'avant de manière fluide.`,
      pricingType: 'STANDARD',
      priceHalfDay: 25,
      priceDay: 40,
      priceWeekend: 65,
      priceWeek: 150,
      depositAmount: 350,
      purchasePriceHt: 385.25,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 25,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 6. Malaxeur professionnel 1800W
  const eqMalaxeur = await prisma.equipment.create({
    data: {
      name: 'Malaxeur professionnel bi-vitesse 1800W',
      slug: 'malaxeur-melangeur-electrique-1800w',
      summary: 'Mélangeur malaxeur électrique robuste 1800 W à régulateur électronique pour colles à carrelage, ragréages, mortiers et résines jusqu\'à 80 kg.',
      description: `Malaxeur professionnel bi-vitesse haute puissance de 1 800 W conçu pour le gâchage intensif de tous les matériaux de construction (ragréage de sol, mortier colle, crépis, plâtre, peintures et résines bicomposantes).
Double poignée enveloppante ergonomique protégeant le bloc moteur en cas de basculement.
Deux rapports mécaniques associés à un variateur électronique pour adapter la vitesse de rotation à la viscosité exacte du produit sans éclaboussure au démarrage.`,
      categoryId: catBeton.id,
      brand: 'Makita / Pro Series',
      model: 'UT1600 / Pro 1800W (Réf. PFA12016)',
      imageUrl: '/images/malaxeur-1800w.jpg',
      specsJson: JSON.stringify({
        'Puissance absorbée': '1 800 W (230 V monophasé)',
        'Vitesse 1 (matériaux visqueux)': '0 - 450 tr/min',
        'Vitesse 2 (peintures et résines)': '0 - 790 tr/min',
        'Filetage de broche': 'M14 universel',
        'Diamètre de pale maximal': 'Ø 160 mm',
        'Volume maximal de malaxage': '80 kg / 60 litres par gâchée',
        'Poids': '6,8 kg',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Pale hélicoïdale M14 Ø140 mm en acier renforcé',
        'Deux clés plates de montage/démontage de turbine',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Seau ou auge de malaxage',
        'Matériaux prêts à l\'emploi (mortier, colle, ragréage)',
      ]),
      safetyGuidelines: `• Nettoyer immédiatement la pale à l'eau claire dans un seau avant la prise du ciment ou de la colle.
• Tenir fermement les deux poignées lors de la mise en marche pour encaisser le couple de démarrage.`,
      usageGuidelines: `1. Insérer la turbine au fond de la cuve avant de démarrer.
2. Commencer à vitesse lente puis augmenter progressivement le régime une fois la poudre humidifiée.
3. Déplacer l'hélice de haut en bas et le long des parois pour obtenir un mélange parfaitement homogène sans grumeaux.`,
      pricingType: 'STANDARD',
      priceHalfDay: 20,
      priceDay: 30,
      priceWeekend: 50,
      priceWeek: 110,
      depositAmount: 250,
      purchasePriceHt: 309.69,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 20,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 7. Décolleuse à papier peint Wagner SteamForce Speed Pro
  const eqWagner = await prisma.equipment.create({
    data: {
      name: 'Décolleuse à papier peint Wagner SteamForce Speed Pro',
      slug: 'decolleuse-papier-peint-wagner-steamforce',
      summary: 'Décolleuse thermique à vapeur haute puissance 2750 W avec cuve grande contenance 7,5 L (90 min d\'autonomie) pour retrait rapide sans produit chimique.',
      description: `La décolleuse à vapeur Wagner SteamForce Speed Pro est la solution la plus rapide et la plus saine pour retirer tous types de revêtements muraux (papiers peints classiques, vinyles expansés, toiles de verre et papiers peints peints) sans aucun solvant chimique.
Son réservoir de 7,5 litres permet jusqu'à 90 minutes de travail continu sans appoint d'eau.
Flexible de 5 mètres anti-écrasement avec isolation thermique de sécurité.
Grand plateau à vapeur équipé d'une poignée isolante pour une couverture rapide des grands pans de mur.`,
      categoryId: catRenovation.id,
      brand: 'Wagner Professional',
      model: 'SteamForce Speed Pro (Réf. 2418213)',
      imageUrl: '/images/wagner-steamforce-decolleuse.jpg',
      specsJson: JSON.stringify({
        'Puissance de chauffe': '2 750 W (230 V)',
        'Capacité de la cuve': '7,5 L',
        'Autonomie vapeur continue': 'Jusqu’à 90 minutes par plein',
        'Longueur du flexible vapeur': '5 m anti-torsion avec gaine thermique',
        'Temps de mise en chauffe': 'Environ 12 minutes',
        'Poids à vide': '4,5 kg',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Grand plateau vapeur professionnel 280 x 200 mm',
        'Petit plateau pour contours d’huisseries et angles difficiles',
        'Grattoir à papier peint biseauté multi-usages',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Eau du robinet',
      ]),
      safetyGuidelines: `• Ne jamais ouvrir le bouchon de remplissage lorsque l'appareil est sous pression ou chaud (risque de brûlure grave par vapeur).
• Porter des gants de protection thermique adaptés.`,
      usageGuidelines: `1. Remplir le réservoir d'eau propre avec la quantité recommandée.
2. Brancher sur une prise 230V 16A avec terre et attendre la vaporisation continue (12 min).
3. Appliquer le plateau fermement contre le mur pendant 10 à 15 secondes.
4. Décoller la bande ramollie avec le grattoir en descendant.`,
      pricingType: 'STANDARD',
      priceHalfDay: 18,
      priceDay: 25,
      priceWeekend: 40,
      priceWeek: 90,
      depositAmount: 150,
      purchasePriceHt: 47.38,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 20,
      cleaningFee: 15,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 8. Aiguille vibrante béton Milwaukee M18 FCV
  const eqMilw = await prisma.equipment.create({
    data: {
      name: 'Aiguille vibrante béton sans fil Milwaukee M18 FCV',
      slug: 'aiguille-vibrante-beton-milwaukee-m18',
      summary: 'Vibrateur à béton autonome 18V sans fil avec flexible 2,4 m et tête Ø25 mm, 12 500 VPM pour une consolidation parfaite du béton sans groupe ni câble au sol.',
      description: `L'aiguille vibrante à béton sur batterie Milwaukee M18 FUEL™ FCV N24 élimine tous les risques de trébuchement liés aux câbles sur les armatures métalliques et planchers béton.
Avec ses 12 500 vibrations par minute (VPM), elle expulse efficacement l'air piégé dans le béton pour obtenir une résistance maximale et un parement lisse sans bullage.
Flexible robuste de 2,4 mètres permettant de vibrer des fondations, longrines, dalles et voiles sans effort.
Gâchette à vitesse variable pour un contrôle précis selon la plasticité du béton.`,
      categoryId: catBeton.id,
      brand: 'Milwaukee Heavy Duty',
      model: 'M18 FCV N24-0 Fuel (Réf. 4933479599)',
      imageUrl: '/images/milwaukee-aiguille-vibrante.jpg',
      specsJson: JSON.stringify({
        'Fréquence de vibration': '12 500 VPM (vibrations par minute)',
        'Longueur du flexible': '2,4 m renforcé',
        'Diamètre de la tête': 'Ø 25 mm carrée haute transmission',
        'Alimentation': 'Batterie Milwaukee M18 REDLITHIUM High Output',
        'Capacité par charge': 'Jusqu’à 8 m³ de béton vibré avec une batterie 5,5 Ah',
        'Poids avec batterie': '5,0 kg',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Flexible 2,4 m avec tête Ø25 mm montée',
        '2 x Batteries Milwaukee M18 REDLITHIUM High Output',
        'Chargeur rapide Milwaukee M12-M18',
        'Bandoulière de portage confort pour chantier',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Aucun consommable',
      ]),
      safetyGuidelines: `• Ne jamais laisser la tête vibrer à l'air libre plus de 30 secondes (risque de surchauffe interne par absence d'échange thermique avec le béton).
• Rincer immédiatement le flexible et la tête à l'eau claire après coulage.`,
      usageGuidelines: `1. Enfoncer l'aiguille verticalement dans le béton frais en plongeant de 10 à 15 cm dans la couche précédente.
2. Maintenir 5 à 15 secondes jusqu'à ce que la surface brille et que les bulles cessent de monter.
3. Retirer l'aiguille lentement pour permettre au béton de refermer la cavité.`,
      pricingType: 'STANDARD',
      priceHalfDay: 30,
      priceDay: 45,
      priceWeekend: 70,
      priceWeek: 160,
      depositAmount: 450,
      purchasePriceHt: 489.32,
      amortizationYears: 3,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 25,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 9. Compresseur vertical Lacmé Primair VVM 21/100 100L
  const eqComp = await prisma.equipment.create({
    data: {
      name: 'Compresseur vertical Lacmé Primair VVM 21/100 100L',
      slug: 'compresseur-vertical-lacme-100l',
      summary: 'Compresseur d\'atelier vertical 100 L monophasé 230V, 10 bar, débit aspiré 350 L/min (21 m³/h), moteur 2,5 CV. Encombrement compact, idéal soufflage, peinture et outillage pneumatique.',
      description: `Le compresseur vertical Lacmé Primair VVM 21/100 (100 litres) est conçu pour les professionnels exigeant une pression élevée de 10 bar et un gain de place optimal au sol.
Équipé d'un groupe de compression bicylindre en fonte lubrifié longue durée et d'un moteur 2,5 CV (1,8 kW) monophasé 230 V.
Idéal pour le nettoyage et soufflage du matériel, le gonflage régulé, le pistolet à peinture et l'utilisation ponctuelle d'outillage pneumatique (cloueuse, agrafeuse, clé à chocs).
Ses grandes roues et sa poignée haute facilitent les déplacements sur le lieu de travail.`,
      categoryId: catAir.id,
      brand: 'Lacmé / Primair',
      model: 'Primair VVM 21/100 (Réf. OBA20222)',
      imageUrl: '/images/compresseur-lacme-100l.jpg',
      specsJson: JSON.stringify({
        'Capacité de la cuve': '100 L cuve verticale compacte',
        'Pression maximale': '10 bar',
        'Débit d’air aspiré': '350 L/min (21 m³/h)',
        'Débit d’air restitué': '240 L/min à 7 bar',
        'Puissance moteur': '2,5 CV (1,8 kW)',
        'Tension d’alimentation': '230 V monophasé 50 Hz',
        'Type de groupe': 'Bicylindre fonte lubrifié',
        'Poids': '65 kg',
      }),
      includedAccessoriesJson: JSON.stringify([
        'Tuyau d’air comprimé armé 10 m avec raccords rapides normalisés',
        'Soufflette progressive de nettoyage dépoussiérage',
        'Filtre détendeur manomètre pour réglage précis de la pression',
      ]),
      excludedConsumablesJson: JSON.stringify([
        'Outillage pneumatique spécialisé (cloueuse, agrafeuse disponibles en sus)',
      ]),
      safetyGuidelines: `• Ne jamais diriger le jet d’air comprimé vers le visage ou le corps.
• Purger l'eau de condensation de la cuve sous la valve après chaque fin de journée.
• Transporter impérativement debout pour éviter l'écoulement d'huile moteur.`,
      usageGuidelines: `1. Vérifier le voyant de niveau d'huile avant branchement.
2. Brancher sur une prise 230V protégée par disjoncteur 16A sans rallonge fine.
3. Laisser monter la pression à 10 bar jusqu'à la coupure automatique du pressostat.
4. Régler la molette du détendeur à la pression requise pour votre outil (généralement 6 bar).`,
      pricingType: 'STANDARD',
      priceHalfDay: 25,
      priceDay: 40,
      priceWeekend: 65,
      priceWeek: 140,
      depositAmount: 400,
      purchasePriceHt: 555.33,
      amortizationYears: 5,
      purchaseDate: new Date('2026-09-01'),
      minDurationHours: 24,
      deliveryAvailable: true,
      deliveryFlatFee: 30,
      cleaningFee: 20,
      bufferHoursBetweenRentals: 2,
    },
  });

  // 5. Unités physiques (EquipmentUnit) du parc CALVINO ELEC
  console.log('📦 Enregistrement des unités physiques au parc...');
  const unitPuzzi1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqPuzzi.id,
      internalCode: 'CALV-PUZZI-01',
      serialNumber: 'SN-KAR-PUZ-8491',
      status: 'AVAILABLE',
      notes: 'Injecteur Kärcher neuf, accessoires vérifiés.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitHd5_1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqHd5.id,
      internalCode: 'CALV-HD5-01',
      serialNumber: 'SN-KAR-HD5-1920',
      status: 'AVAILABLE',
      notes: 'Nettoyeur HP 150 bar avec rotabuse et enrouleur 15m.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitNt30_1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqNt30.id,
      internalCode: 'CALV-NT30-01',
      serialNumber: 'SN-KAR-NT30-7731',
      status: 'AVAILABLE',
      notes: 'Aspirateur classe M avec filtre PES neuf.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitFlex1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqFlex.id,
      internalCode: 'CALV-GE6-01',
      serialNumber: 'SN-FLX-GE6-5532',
      status: 'AVAILABLE',
      notes: 'Girafe FLEX GE6 brushless avec housse de transport.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitBosch1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqBosch.id,
      internalCode: 'CALV-GCM8-01',
      serialNumber: 'SN-BOS-GCM8-4412',
      status: 'AVAILABLE',
      notes: 'Scie radiale Bosch avec lame 216mm et double laser calibré.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitMalax1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqMalaxeur.id,
      internalCode: 'CALV-MALAX-01',
      serialNumber: 'SN-MAK-UT16-3391',
      status: 'AVAILABLE',
      notes: 'Malaxeur 1800W bi-vitesse avec turbine M14 neuve.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitWagner1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqWagner.id,
      internalCode: 'CALV-WAGN-01',
      serialNumber: 'SN-WAG-STF-2210',
      status: 'AVAILABLE',
      notes: 'Décolleuse vapeur Wagner cuve 7.5L.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitMilw1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqMilw.id,
      internalCode: 'CALV-MILW-01',
      serialNumber: 'SN-MIL-FCV-9912',
      status: 'AVAILABLE',
      notes: 'Aiguille vibrante M18 avec 2 batteries et chargeur.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  const unitComp1 = await prisma.equipmentUnit.create({
    data: {
      equipmentId: eqComp.id,
      internalCode: 'CALV-COMP-01',
      serialNumber: 'SN-LAC-VVM-6623',
      status: 'AVAILABLE',
      notes: 'Compresseur vertical 100L 10 bar, niveau d\'huile vérifié.',
      purchaseDate: new Date('2026-09-01'),
    },
  });

  // 6. Création de réservations réalistes de démonstration
  console.log('📋 Création de réservations de test avec gestion du calendrier et du forfait week-end...');
  const today = new Date();

  // Réservation 1 : Forfait Week-end sur le Kärcher HD 5/15
  const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
  const nextFriday = addDays(today, daysUntilFriday);
  const nextMonday = addDays(nextFriday, 3);

  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0001',
      userId: clientUser.id,
      equipmentId: eqHd5.id,
      unitId: unitHd5_1.id,
      customerName: 'Nicolas Muller',
      customerEmail: 'client.demo@calvino-location.fr',
      customerPhone: '06 12 34 56 78',
      customerCompany: 'Muller Bâtiment Moselle',
      customerAddress: '15 Rue Serpenoise',
      customerCity: 'Metz',
      customerPostalCode: '57000',
      startDate: nextFriday,
      endDate: nextMonday,
      pickupTime: '18:00',
      returnTime: '08:30',
      deliveryMode: 'PICKUP_DEPOT',
      rentalDays: 3,
      basePrice: 85.0,
      deliveryFee: 0,
      optionsFee: 0,
      subtotalHt: 85.0,
      taxRate: 20.0,
      taxAmount: 17.0,
      totalAmount: 102.0,
      depositAmount: 600.0,
      calculationJson: JSON.stringify({
        rentalDays: 3,
        rateAppliedDescription: 'Forfait Week-end Spécial (Départ vendredi 18h15 max, retour lundi 08h30 min) à 85.00 € HT',
        baseRentalHt: 85.0,
        subtotalHt: 85.0,
        taxAmount: 17.0,
        totalTtc: 102.0,
        depositAmount: 600.0,
      }),
      status: 'CONFIRMED',
      customerNotes: 'Réservation forfait week-end pour décapage terrasse et murets.',
      adminNotes: 'Réservation validée par Gaëtan CALVINO. Unité CALV-HD5-01 prête.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'PENDING',
          date: subDays(today, 1).toISOString(),
          author: 'Client Nicolas Muller',
          note: 'Réservation forfait week-end enregistrée.',
        },
        {
          status: 'CONFIRMED',
          date: new Date().toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Réservation validée et machine assignée.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-W8F2',
    },
  });

  // Réservation 2 : Girafe FLEX réservée en milieu de semaine
  const midWeekStart = addDays(today, 1);
  const midWeekEnd = addDays(today, 3);
  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0002',
      equipmentId: eqFlex.id,
      unitId: unitFlex1.id,
      customerName: 'Stéphane Becker',
      customerEmail: 's.becker@becker-renovation.fr',
      customerPhone: '06 88 77 66 55',
      customerCompany: 'Becker Peinture & Rénovation',
      customerAddress: '42 Avenue Foch',
      customerCity: 'Metz',
      customerPostalCode: '57000',
      startDate: midWeekStart,
      endDate: midWeekEnd,
      pickupTime: '08:00',
      returnTime: '18:00',
      deliveryMode: 'DELIVERY_ON_SITE',
      deliveryAddress: 'Chantier Rue de la Gare, 57420 Coin-lès-Cuvry',
      rentalDays: 2,
      basePrice: 100.0,
      deliveryFee: 25.0,
      optionsFee: 0,
      subtotalHt: 125.0,
      taxRate: 20.0,
      taxAmount: 25.0,
      totalAmount: 150.0,
      depositAmount: 600.0,
      calculationJson: JSON.stringify({
        rentalDays: 2,
        rateAppliedDescription: '2 jour(s) à 50.00 € HT/jour',
        baseRentalHt: 100.0,
        deliveryFeeHt: 25.0,
        subtotalHt: 125.0,
        taxAmount: 25.0,
        totalTtc: 150.0,
        depositAmount: 600.0,
      }),
      status: 'CONFIRMED',
      adminNotes: 'Livraison sur chantier à Coin-lès-Cuvry programmée.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'CONFIRMED',
          date: new Date().toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Confirmé.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-F3K9',
    },
  });

  // 7. Code Promo Découverte
  const promoBienvenue = await prisma.promoCode.create({
    data: {
      code: 'BIENVENUE10',
      description: '-10% sur toute votre location de matériel professionnel',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minAmountHt: 50,
      maxUses: 100,
      usedCount: 1,
      validFrom: subDays(today, 30),
      active: true,
      showInBanner: true,
      bannerHighlight: 'Offre Spéciale Découverte Chantier',
    },
  });

  // Réservation 3 : Décolleuse Wagner (3 jours, terminée -> Rentabilisée !)
  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0003',
      equipmentId: eqWagner.id,
      unitId: unitWagner1.id,
      customerName: 'Julien Robert',
      customerEmail: 'j.robert@gmail.com',
      customerPhone: '06 14 25 36 47',
      customerAddress: '8 Rue des Jardins',
      customerCity: 'Marly',
      customerPostalCode: '57155',
      startDate: subDays(today, 12),
      endDate: subDays(today, 9),
      pickupTime: '08:30',
      returnTime: '18:00',
      deliveryMode: 'PICKUP_DEPOT',
      rentalDays: 3,
      basePrice: 75.0,
      deliveryFee: 0,
      optionsFee: 0,
      subtotalHt: 75.0,
      taxRate: 20.0,
      taxAmount: 15.0,
      totalAmount: 90.0,
      depositAmount: 150.0,
      calculationJson: JSON.stringify({
        rentalDays: 3,
        rateAppliedDescription: '3 jour(s) à 25.00 € HT/jour',
        baseRentalHt: 75.0,
        subtotalHt: 75.0,
        taxAmount: 15.0,
        totalTtc: 90.0,
        depositAmount: 150.0,
      }),
      status: 'COMPLETED',
      customerNotes: 'Rénovation maison individuelle à Marly.',
      adminNotes: 'Matériel restitué nettoyé et vérifié.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'COMPLETED',
          date: subDays(today, 9).toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Location terminée et caution restituée.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-WAG1',
    },
  });

  // Réservation 4 : Puzzi 10/1 (Nettoyage moquettes & sièges)
  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0004',
      equipmentId: eqPuzzi.id,
      unitId: unitPuzzi1.id,
      customerName: 'Thomas Klein',
      customerEmail: 'contact@klein-services.fr',
      customerPhone: '06 99 88 77 11',
      customerCompany: 'Klein Services & Nettoyage',
      customerAddress: '22 Rue Pasteur',
      customerCity: 'Woippy',
      customerPostalCode: '57140',
      startDate: subDays(today, 8),
      endDate: subDays(today, 6),
      pickupTime: '08:00',
      returnTime: '18:00',
      deliveryMode: 'DELIVERY_ON_SITE',
      deliveryAddress: 'Bureaux ZA Woippy',
      rentalDays: 2,
      basePrice: 90.0,
      deliveryFee: 25.0,
      optionsFee: 0,
      subtotalHt: 115.0,
      taxRate: 20.0,
      taxAmount: 23.0,
      totalAmount: 138.0,
      depositAmount: 400.0,
      calculationJson: JSON.stringify({
        rentalDays: 2,
        rateAppliedDescription: '2 jour(s) à 45.00 € HT/jour',
        baseRentalHt: 90.0,
        deliveryFeeHt: 25.0,
        subtotalHt: 115.0,
        taxAmount: 23.0,
        totalTtc: 138.0,
        depositAmount: 400.0,
      }),
      status: 'COMPLETED',
      adminNotes: 'Restitution OK. Injecteur rincé.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'COMPLETED',
          date: subDays(today, 6).toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Terminé.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-PUZ9',
    },
  });

  // Réservation 5 : Aspirateur NT 30/1 avec code promo BIENVENUE10
  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0005',
      equipmentId: eqNt30.id,
      unitId: unitNt30_1.id,
      customerName: 'Nicolas Muller',
      customerEmail: 'client.demo@calvino-location.fr',
      customerPhone: '06 12 34 56 78',
      customerCompany: 'Muller Bâtiment Moselle',
      customerAddress: '15 Rue Serpenoise',
      customerCity: 'Metz',
      customerPostalCode: '57000',
      startDate: subDays(today, 5),
      endDate: subDays(today, 2),
      pickupTime: '08:30',
      returnTime: '18:00',
      deliveryMode: 'PICKUP_DEPOT',
      rentalDays: 3,
      basePrice: 135.0,
      deliveryFee: 0,
      optionsFee: 0,
      promoCodeId: promoBienvenue.id,
      promoCodeApplied: 'BIENVENUE10',
      promoDiscountAmount: 13.5,
      subtotalHt: 121.5,
      taxRate: 20.0,
      taxAmount: 24.3,
      totalAmount: 145.8,
      depositAmount: 450.0,
      calculationJson: JSON.stringify({
        rentalDays: 3,
        rateAppliedDescription: '3 jour(s) à 45.00 € HT/jour',
        baseRentalHt: 135.0,
        discountPromoHt: 13.5,
        subtotalHt: 121.5,
        taxAmount: 24.3,
        totalTtc: 145.8,
        depositAmount: 450.0,
      }),
      status: 'COMPLETED',
      adminNotes: 'Code promo BIENVENUE10 appliqué (-10%). Filtre PES nettoyé.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'COMPLETED',
          date: subDays(today, 2).toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Retour machine effectué.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-NT30',
    },
  });

  // Réservation 6 : Scie radiale Bosch (4 jours)
  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0006',
      equipmentId: eqBosch.id,
      unitId: unitBosch1.id,
      customerName: 'Marc Henry',
      customerEmail: 'm.henry@menuiserie-henry.fr',
      customerPhone: '06 71 82 93 04',
      customerCompany: 'Menuiserie d\'Agencement Henry',
      customerAddress: '14 Rue Principale',
      customerCity: 'Montigny-lès-Metz',
      customerPostalCode: '57950',
      startDate: subDays(today, 4),
      endDate: today,
      pickupTime: '08:00',
      returnTime: '17:30',
      deliveryMode: 'DELIVERY_ON_SITE',
      deliveryAddress: 'Chantier Résidence Foch, Metz',
      rentalDays: 4,
      basePrice: 160.0,
      deliveryFee: 25.0,
      optionsFee: 0,
      subtotalHt: 185.0,
      taxRate: 20.0,
      taxAmount: 37.0,
      totalAmount: 222.0,
      depositAmount: 350.0,
      calculationJson: JSON.stringify({
        rentalDays: 4,
        rateAppliedDescription: '4 jour(s) à 40.00 € HT/jour',
        baseRentalHt: 160.0,
        deliveryFeeHt: 25.0,
        subtotalHt: 185.0,
        taxAmount: 37.0,
        totalTtc: 222.0,
        depositAmount: 350.0,
      }),
      status: 'IN_PROGRESS',
      adminNotes: 'Sur chantier jusqu\'à ce soir. Machine en parfait état.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'IN_PROGRESS',
          date: subDays(today, 4).toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Livré sur chantier.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-BOS8',
    },
  });

  // Réservation 7 : Forfait Semaine Ponceuse FLEX GE 6
  await prisma.reservation.create({
    data: {
      reservationNumber: 'CALV-2026-0007',
      equipmentId: eqFlex.id,
      unitId: unitFlex1.id,
      customerName: 'Stéphane Becker',
      customerEmail: 's.becker@becker-renovation.fr',
      customerPhone: '06 88 77 66 55',
      customerCompany: 'Becker Peinture & Rénovation',
      customerAddress: '42 Avenue Foch',
      customerCity: 'Metz',
      customerPostalCode: '57000',
      startDate: subDays(today, 20),
      endDate: subDays(today, 13),
      pickupTime: '08:00',
      returnTime: '18:00',
      deliveryMode: 'PICKUP_DEPOT',
      rentalDays: 7,
      basePrice: 180.0,
      deliveryFee: 0,
      optionsFee: 0,
      subtotalHt: 180.0,
      taxRate: 20.0,
      taxAmount: 36.0,
      totalAmount: 216.0,
      depositAmount: 600.0,
      calculationJson: JSON.stringify({
        rentalDays: 7,
        rateAppliedDescription: 'Forfait Semaine 7 jours à 180.00 € HT',
        baseRentalHt: 180.0,
        subtotalHt: 180.0,
        taxAmount: 36.0,
        totalTtc: 216.0,
        depositAmount: 600.0,
      }),
      status: 'COMPLETED',
      adminNotes: 'Semaine complète de ponçage plaquisterie. Tout OK.',
      statusHistoryJson: JSON.stringify([
        {
          status: 'COMPLETED',
          date: subDays(today, 13).toISOString(),
          author: 'Admin Gaëtan CALVINO',
          note: 'Retour conforme.',
        },
      ]),
      secretAccessCode: 'CALV-TRACK-FLX7',
    },
  });

  // 8. Enregistrement d'entretiens et maintenance
  await prisma.maintenanceLog.create({
    data: {
      unitId: unitHd5_1.id,
      type: 'REVISION',
      description: 'Contrôle des clapets et vidange pompe haute pression',
      cost: 35.0,
      performedBy: 'Atelier Kärcher Metz',
      performedAt: subDays(today, 5),
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      unitId: unitFlex1.id,
      type: 'CONTROLE_SECURITE',
      description: 'Remplacement plateau velcro souple et contrôle roulement',
      cost: 25.0,
      performedBy: 'Gaëtan CALVINO',
      performedAt: subDays(today, 3),
    },
  });

  console.log('✅ Base de données réinitialisée avec succès avec le parc CALVINO ELEC !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
