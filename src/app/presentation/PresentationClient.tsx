'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Wrench,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Users,
  Settings,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  BadgePercent,
  Play,
  RotateCcw,
  Zap,
  Building,
  Check,
  Eye,
  Sliders,
  ChevronLeft
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  model?: string | null;
  priceDay: number;
  depositAmount: number;
  imageUrl: string;
  category: {
    name: string;
    slug: string;
  };
  units: {
    id: string;
    serialNumber?: string | null;
    status: string;
  }[];
}

interface PresentationClientProps {
  stats: {
    equipmentCount: number;
    unitCount: number;
    reservationCount: number;
    promoCount: number;
  };
  equipments: EquipmentItem[];
}

export function PresentationClient({ stats, equipments }: PresentationClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'admin' | 'workflow' | 'gallery' | 'access'>('admin');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle: string; tag: string } | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  // Simulation interactive d'actions admin
  const [simulationState, setSimulationState] = useState<{
    reservationStatus: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED';
    assignedUnit: string | null;
    promoCodeCreated: boolean;
    unitMaintenance: boolean;
    logs: string[];
  }>({
    reservationStatus: 'PENDING',
    assignedUnit: null,
    promoCodeCreated: false,
    unitMaintenance: false,
    logs: ['Système initialisé : 1 réservation en attente reçue du client'],
  });

  // Liste des captures d'écran réelles du projet
  const galleryScreenshots = [
    {
      src: '/screenshots/05_admin_dashboard_wide.png',
      title: 'Tableau de Bord Administrateur Plein Écran',
      subtitle: 'Vision panoramique des indicateurs clés (KPIs), chiffre d\'affaires prévisionnel HT, alertes en temps réel et jauge du parc.',
      category: 'admin',
      tag: 'Console Admin'
    },
    {
      src: '/screenshots/06_admin_reservations.png',
      title: 'Gestion des Réservations & Affectation',
      subtitle: 'Contrôle des demandes entrantes, validation en 1 clic sous 2h et affectation sécurisée au numéro de série d\'usine.',
      category: 'admin',
      tag: 'Flux Réservations'
    },
    {
      src: '/screenshots/07_admin_unites.png',
      title: 'Gestion du Parc Matériel au Numéro de Série',
      subtitle: 'Inventaire de chaque machine physique avec son N° de série, son état opérationnel (Disponible, Loué, En maintenance, Hors service).',
      category: 'admin',
      tag: 'Parc & Séries'
    },
    {
      src: '/screenshots/09_admin_promotions.png',
      title: 'Console de Gestion des Promotions & Codes Réduction',
      subtitle: 'Création de codes promotionnels en % ou en € HT, définition des quotas, seuils d\'activation et mise en vedette sur le bandeau public.',
      category: 'admin',
      tag: 'Moteur Promotions'
    },
    {
      src: '/screenshots/10_fiche_avec_promo_banner.png',
      title: 'Fiche Matériel & Bandeau Promotionnel Public',
      subtitle: 'Présentation de l\'équipement avec ses spécifications et bandeau promotionnel interactif copiable en 1 clic.',
      category: 'public',
      tag: 'Interface Publique'
    },
    {
      src: '/screenshots/11_widget_promo_applique.png',
      title: 'Calculateur Tarifaire & Déduction Promo en Direct',
      subtitle: 'Moteur de calcul transparent : remise déduite du loyer HT, TVA 20% recalculée automatiquement et caution préservée.',
      category: 'public',
      tag: 'Moteur Tarifaire'
    },
    {
      src: '/screenshots/01_accueil.png',
      title: 'Page d\'Accueil Calvino Location',
      subtitle: 'Hero industriel premium, mise en avant des équipements phares, réassurance de caution et témoignages clients.',
      category: 'public',
      tag: 'Vitrine Web'
    },
    {
      src: '/screenshots/02_catalogue.png',
      title: 'Catalogue Matériels & Filtres Métiers',
      subtitle: 'Filtrage par familles de métiers (Air comprimé, Nettoyage, Béton, Compactage, Énergie, Sciage) et tarifs dégressifs.',
      category: 'public',
      tag: 'Catalogue'
    },
    {
      src: '/screenshots/03_fiche_compresseur.png',
      title: 'Fiche Technique Détaillée Compresseur 4500L',
      subtitle: 'Spécifications techniques complètes, débit d\'air, moteur Kubota, conditions de retrait et calendrier de réservation.',
      category: 'public',
      tag: 'Fiche Produit'
    },
    {
      src: '/screenshots/08_espace_client.png',
      title: 'Espace Client & Historique des Locations',
      subtitle: 'Portail client sécurisé permettant de suivre ses réservations, télécharger ses devis et retrouver les codes de retrait.',
      category: 'client',
      tag: 'Portail Client'
    },
    {
      src: '/screenshots/04_connexion.png',
      title: 'Portail d\'Authentification & Accès Rapides',
      subtitle: 'Connexion sécurisée avec boutons de test pré-remplis pour compte Administrateur et compte Client.',
      category: 'securite',
      tag: 'Sécurité & Auth'
    },
  ];

  // Gestion de la navigation dans la Lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxImage(galleryScreenshots[index]);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const nextLightbox = () => {
    const nextIdx = (lightboxIndex + 1) % galleryScreenshots.length;
    setLightboxIndex(nextIdx);
    setLightboxImage(galleryScreenshots[nextIdx]);
  };

  const prevLightbox = () => {
    const prevIdx = (lightboxIndex - 1 + galleryScreenshots.length) % galleryScreenshots.length;
    setLightboxIndex(prevIdx);
    setLightboxImage(galleryScreenshots[prevIdx]);
  };

  // Clavier pour la lightbox (Échap, flèches)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxImage, lightboxIndex]);

  // Connexion rapide 1-clic en tant qu'Admin Kenny
  const handleDirectAdminLogin = async (email: string, pass: string) => {
    setIsLoggingIn(true);
    setLoginMessage('Connexion sécurisée en cours...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginMessage('Authentification réussie ! Redirection vers la console d\'administration...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 600);
      } else {
        setLoginMessage(data.error || 'Erreur lors de la connexion.');
        setIsLoggingIn(false);
      }
    } catch (err) {
      setLoginMessage('Erreur réseau.');
      setIsLoggingIn(false);
    }
  };

  // Handlers pour le simulateur d'actions admin
  const handleSimulateValidation = () => {
    setSimulationState(prev => ({
      ...prev,
      reservationStatus: 'CONFIRMED',
      assignedUnit: 'CP-4500-01 (Compresseur Atlas Copco)',
      logs: [
        `[${new Date().toLocaleTimeString()}] Réservation validée : statut passé à CONFIRMED`,
        `[${new Date().toLocaleTimeString()}] Machine CP-4500-01 affectée avec succès (conflits vérifiés : OK)`,
        ...prev.logs,
      ],
    }));
  };

  const handleSimulateActive = () => {
    setSimulationState(prev => ({
      ...prev,
      reservationStatus: 'ACTIVE',
      logs: [
        `[${new Date().toLocaleTimeString()}] Retrait matériel validé au comptoir : statut passé à ACTIVE`,
        `[${new Date().toLocaleTimeString()}] Dépôt de garantie vérifié par empreinte bancaire (caution 1 200 €)`,
        ...prev.logs,
      ],
    }));
  };

  const handleSimulateComplete = () => {
    setSimulationState(prev => ({
      ...prev,
      reservationStatus: 'COMPLETED',
      logs: [
        `[${new Date().toLocaleTimeString()}] Matériel restitué et inspecté : statut passé à COMPLETED`,
        `[${new Date().toLocaleTimeString()}] Caution libérée, machine remise à l'état DISPONIBLE dans le parc`,
        ...prev.logs,
      ],
    }));
  };

  const handleSimulatePromo = () => {
    setSimulationState(prev => ({
      ...prev,
      promoCodeCreated: true,
      logs: [
        `[${new Date().toLocaleTimeString()}] Nouveau code promo créé : FLASH20 (-20% sur tout le catalogue)`,
        `[${new Date().toLocaleTimeString()}] Switch "En Vedette" activé : le bandeau public affiche la promo en direct`,
        ...prev.logs,
      ],
    }));
  };

  const handleSimulateMaintenance = () => {
    setSimulationState(prev => ({
      ...prev,
      unitMaintenance: !prev.unitMaintenance,
      logs: [
        `[${new Date().toLocaleTimeString()}] Unité BET-350-02 basculée en état : ${!prev.unitMaintenance ? 'MAINTENANCE (Indisponible à la réservation)' : 'OPÉRATIONNEL (Remise en location)'}`,
        ...prev.logs,
      ],
    }));
  };

  const handleResetSimulation = () => {
    setSimulationState({
      reservationStatus: 'PENDING',
      assignedUnit: null,
      promoCodeCreated: false,
      unitMaintenance: false,
      logs: ['Simulation réinitialisée : prêt pour un nouveau test'],
    });
  };

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* 1. HERO BANNER DE PRÉSENTATION */}
      <section style={{
        position: 'relative',
        padding: '4.5rem 1.5rem 3.5rem',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 13, 22, 1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Glow ambient décoratif */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 2 }}>
          {/* Badge interactif haut */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '9999px', marginBottom: '1.25rem' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fcd34d', letterSpacing: '0.02em' }}>
              Visite Guidée & Présentation de la Solution Calvino Location
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            maxWidth: '1000px'
          }}>
            La plateforme complète de <span style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Location de Matériel</span> & Console d'Administration Métier
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.3vw, 1.2rem)',
            lineHeight: 1.6,
            color: '#94a3b8',
            maxWidth: '880px',
            marginBottom: '2.25rem'
          }}>
            Conçue pour les professionnels du BTP et les particuliers exigeants, Calvino Location allie une <strong>expérience de réservation client instantanée</strong> avec une <strong>console de gestion administrateur</strong> capable de piloter le parc au numéro de série, les validations de commandes, les remises et la traçabilité complète.
          </p>

          {/* 4 Compteurs métriques réels connectés à la base de données */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Catalogue Référencé</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{stats.equipmentCount}</span>
                <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 500 }}>Équipements</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fiches techniques & tarifs dégressifs</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Parc Physique Traçable</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{stats.unitCount}</span>
                <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 500 }}>Unités physiques</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Suivi strict au numéro de série</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Moteur de Remises</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{stats.promoCount}</span>
                <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 500 }}>Codes Promo actifs</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Calcul automatique HT et bandeau live</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Sécurité & Contrôle</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>&lt; 2h</span>
                <span style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 500 }}>Validation humaine</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Caution non débitée en ligne</div>
            </div>
          </div>

          {/* Boutons d'accès rapides Hero */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                backgroundColor: activeTab === 'admin' ? '#f59e0b' : '#d97706',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
              }}
            >
              <ShieldCheck size={18} />
              <span>Explorer les Capacités Administrateur</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.85rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Wrench size={18} style={{ color: '#f59e0b' }} />
              <span>Catalogue & Expérience Client</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.85rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Eye size={18} style={{ color: '#38bdf8' }} />
              <span>Galerie Visuelle HD (11 Écrans)</span>
            </button>

            <button
              onClick={() => setActiveTab('access')}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.85rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={18} />
              <span>Connexion Directe Admin Kenny</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. BARRE D'ONGLETS INTERACTIVE FLUIDE */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(9, 13, 22, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container" style={{ maxWidth: '1280px', display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.75rem 1rem' }}>
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === 'admin' ? '#f59e0b' : 'transparent',
              color: activeTab === 'admin' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={18} />
            <span>Capacités Administrateur (7 Modules)</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === 'overview' ? '#f59e0b' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <Wrench size={18} />
            <span>Matériels & Expérience Client</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === 'workflow' ? '#f59e0b' : 'transparent',
              color: activeTab === 'workflow' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={18} />
            <span>Cycle d'une Réservation</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === 'gallery' ? '#f59e0b' : 'transparent',
              color: activeTab === 'gallery' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <Eye size={18} />
            <span>Visite Visuelle HD (Zoom)</span>
          </button>

          <button
            onClick={() => setActiveTab('access')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === 'access' ? '#10b981' : 'transparent',
              color: activeTab === 'access' ? '#ffffff' : '#34d399',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={18} />
            <span>Simulateur & Accès Rapides</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENU DES ONGLETS */}
      <main className="container" style={{ maxWidth: '1280px', marginTop: '2.5rem' }}>

        {/* ========================================================================= */}
        {/* ONGLET 1 : TOUT CE QUE L'ON PEUT FAIRE EN TANT QU'ADMIN                  */}
        {/* ========================================================================= */}
        {activeTab === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Introduction Administrateur */}
            <div style={{
              backgroundColor: '#131b2e',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={18} />
                  <span>Espace de Gestion Sécurisé</span>
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', lineHeight: 1.2 }}>
                  Ce que vous pouvez faire en tant qu'Administrateur
                </h2>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '1rem', marginBottom: '1.5rem' }}>
                  L'administration de Calvino Location n'est pas un simple formulaire : c'est un véritable <strong>ERP métier allégé</strong> taillé sur mesure pour la location de matériel. Vous contrôlez à 100% le cycle commercial, les flux financiers HT/TTC, les stocks physiques au numéro de série et le marketing promotionnel.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    href="/admin"
                    className="btn btn-primary btn-md"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                  >
                    <span>Ouvrir la Console Admin</span>
                    <ExternalLink size={16} />
                  </Link>
                  <button
                    onClick={() => setActiveTab('access')}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '0.65rem 1.2rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Voir mes identifiants (Kenny)
                  </button>
                </div>
              </div>

              {/* Aperçu interactif du dashboard admin */}
              <div 
                onClick={() => openLightbox(0)}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer'
                }}
              >
                <img
                  src="/screenshots/05_admin_dashboard_wide.png"
                  alt="Dashboard Admin Calvino Location"
                  style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.3s ease' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Maximize2 size={16} /> Agrandir en haute définition
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tableau de bord panoramique sans rétrécissement</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Cliquer pour zoomer</span>
                </div>
              </div>
            </div>

            {/* GRILLE DES 7 SUPER-POUVOIRS ADMINISTRATEUR */}
            <div>
              <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Les 7 Piliers de Gestion Métier
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                  Chaque écran d'administration a été pensé pour répondre aux contraintes réelles des chantiers et des retraits en agence.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                
                {/* 1. Tableau de bord & KPIs */}
                <div style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', color: '#94a3b8' }}>Module 01</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      1. Tableau de Bord & Pilotage en Temps Réel
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      Suivez en direct le chiffre d'affaires prévisionnel HT, le nombre de locations actives sur le terrain, les demandes en attente et la jauge de disponibilité globale de votre parc machine.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> CA HT calculé automatiquement sans la caution</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Alertes visuelles pour les réservations à valider</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Jauge proportionnelle (En location / Stock / Révision)</li>
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/admin" style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      Voir le Dashboard <ChevronRight size={14} />
                    </Link>
                    <button onClick={() => openLightbox(0)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Capture HD</button>
                  </div>
                </div>

                {/* 2. Gestion des réservations */}
                <div style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', color: '#94a3b8' }}>Module 02</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      2. Cycle & Validation des Réservations
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      Validez ou refusez les demandes en attente en 1 clic. Le système vérifie les disponibilités et permet d'affecter immédiatement la machine physique par son numéro de série.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Validation en 1 clic (Statut <code>PENDING</code> → <code>CONFIRMED</code>)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Prise en charge au comptoir (Statut <code>ACTIVE</code>)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Clôture retour matériel et libération caution (<code>COMPLETED</code>)</li>
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/admin/reservations" style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      Gérer les réservations <ChevronRight size={14} />
                    </Link>
                    <button onClick={() => openLightbox(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Capture HD</button>
                  </div>
                </div>

                {/* 3. Traçabilité au numéro de série */}
                <div style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wrench size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', color: '#94a3b8' }}>Module 03</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      3. Gestion du Parc au Numéro de Série
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      Chaque équipement est décliné en unités réelles identifiées par leur numéro de série fabricant. Suivez les heures de travail, l'état opérationnel et l'historique d'entretien.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> 4 États : Disponible, Loué, En maintenance, Hors service</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Prévention absolue des doubles réservations</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Traçabilité de chaque machine physique</li>
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/admin/unites" style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      Inventaire des unités <ChevronRight size={14} />
                    </Link>
                    <button onClick={() => openLightbox(2)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Capture HD</button>
                  </div>
                </div>

                {/* 4. Centre de Promotions & Codes Réduction */}
                <div style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BadgePercent size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', color: '#94a3b8' }}>Module 04</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      4. Moteur de Promotions & Codes Avantages
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      Créez des remises en pourcentage (%) ou en montant fixe (€ HT). Définissez des dates limites, des quotas d'utilisations et activez l'affichage en 1 clic sur le bandeau du site.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Déduction sur le loyer HT (la caution n'est jamais réduite)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Option "En Vedette" pour bandeau public animé</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Validation anti-fraude côté serveur</li>
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/admin/promotions" style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      Gérer les promotions <ChevronRight size={14} />
                    </Link>
                    <button onClick={() => openLightbox(3)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Capture HD</button>
                  </div>
                </div>

                {/* 5. Gestion du Catalogue & Fiches Matériels */}
                <div style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(234, 88, 12, 0.15)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', color: '#94a3b8' }}>Module 05</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      5. Catalogue & Grilles Tarifaires
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      Éditez les caractéristiques techniques des machines (débit, puissance, carburant), les photos officielles, les consignes de sécurité et les paliers de remises selon la durée.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Tarifs dégressifs (1j, 2-3j, 4-6j, semaine complète)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Forfait week-end avantageux (1 seul jour facturé)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Fixation du montant de caution obligatoire</li>
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/materiels" style={{ color: '#fb923c', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      Voir le catalogue public <ChevronRight size={14} />
                    </Link>
                    <button onClick={() => openLightbox(8)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Capture HD</button>
                  </div>
                </div>

                {/* 6. Gestion des Clients & Sécurité */}
                <div style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', color: '#94a3b8' }}>Module 06</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      6. Gestion des Utilisateurs & Rôles
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      Contrôle strict des accès avec séparation des rôles <code>ADMIN</code> et <code>CLIENT</code>. Consultation des fiches clients avec nom, téléphone, email et SIRET pour les artisans.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Mots de passe hashés avec Bcrypt (sécurité maximale)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Sessions sécurisées HttpOnly via JWT</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Compte Kenny opérationnel (<code>darklaice@gmail.com</code>)</li>
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/connexion" style={{ color: '#c084fc', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      Portail d'authentification <ChevronRight size={14} />
                    </Link>
                    <button onClick={() => openLightbox(10)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Capture HD</button>
                  </div>
                </div>

              </div>
            </div>

            {/* 7. Paramètres d'agence & règles d'exploitation */}
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b' }}>
                <Settings size={22} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  7. Paramètres de l'Agence & Engagements de Service
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px' }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.3rem' }}>Coordonnées & Dépôt</strong>
                  71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY (Moselle). Téléphone et contact agence modifiables en base.
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px' }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.3rem' }}>Horaires de Retrait</strong>
                  Du lundi au vendredi 07h30-12h & 13h30-18h30. Samedi matin 08h00-12h30. Dimanche fermé.
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px' }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.3rem' }}>Politique de Dépôt de Garantie</strong>
                  Caution non encaissée lors de la réservation en ligne. Empreinte TPE ou chèque exigé au départ physique.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 2 : MATÉRIELS RÉFÉRENCÉS & EXPÉRIENCE CLIENT                       */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                <Wrench size={16} />
                <span>Flotte de Chantier Haute Performance</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                Nos Équipements Professionnels en Démonstration
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
                Chaque matériel dispose d'une fiche technique complète, d'un calendrier de réservation temps réel, de tarifs dégressifs et d'un suivi physique strict.
              </p>
            </div>

            {/* Grille des matériels avec photos réelles et badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
              {equipments.map((eq) => {
                const availableUnits = eq.units.filter(u => u.status === 'AVAILABLE').length;
                return (
                  <div
                    key={eq.id}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    {/* Photo de l'équipement */}
                    <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden', backgroundColor: '#0f172a' }}>
                      <img
                        src={eq.imageUrl}
                        alt={eq.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#f59e0b',
                        border: '1px solid rgba(217, 119, 6, 0.3)'
                      }}>
                        {eq.category.name}
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: availableUnits > 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                        color: '#ffffff',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                        {availableUnits > 0 ? `${availableUnits} en stock` : 'Indisponible'}
                      </div>
                    </div>

                    {/* Informations équipement */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {eq.brand} • {eq.model}
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                          {eq.name}
                        </h4>
                      </div>

                      {/* Unités physiques réelles tracées */}
                      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                          Unités physiques sérialisées :
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {eq.units.map(u => (
                            <span
                              key={u.id}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: u.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: u.status === 'AVAILABLE' ? '#34d399' : '#fbbf24',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              N° {u.serialNumber}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tarifs */}
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>À partir de</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                            {eq.priceDay} € <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>HT / jour</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                            Caution : {eq.depositAmount} €
                          </div>
                        </div>

                        <Link
                          href={`/materiels/${eq.slug}`}
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontSize: '0.8rem' }}
                        >
                          Fiche & Réserver →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Réassurance client */}
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '16px',
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>Caution Non Encaissée</h5>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Dépôt de garantie par pré-autorisation bancaire ou chèque lors du retrait. Aucun débit anticipé en ligne.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>Validation sous 2h Ouvrées</h5>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Chaque demande est vérifiée par notre chef de parc avant confirmation définitive par email et SMS.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BadgePercent size={22} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>Forfait Week-end Éco</h5>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Emportez le matériel du samedi 08h00 au lundi 08h00 pour le prix d'un seul jour ouvré.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 3 : CYCLE DE VIE D'UNE RÉSERVATION & FLUX COMPLET                  */}
        {/* ========================================================================= */}
        {activeTab === 'workflow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                <Layers size={16} />
                <span>Traçabilité & Flux de Travail</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                Le Parcours d'une Location de A à Z
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
                Découvrez comment les actions du client et les validations de l'administrateur s'articulent étape par étape dans la base de données.
              </p>
            </div>

            {/* Timeline interactive des 5 étapes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
              
              {/* Étape 1 */}
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f59e0b', color: '#000000', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Demande de Réservation par le Client</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderRadius: '4px', fontWeight: 700 }}>Statut : PENDING</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    Le client sélectionne l'équipement (ex: Compresseur 4500L), renseigne ses dates de début et fin, applique un éventuel code promo (ex: <code>BIENVENUE10</code>) et valide son panier.
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <strong>Action Système :</strong> Le moteur calcule le total HT, la TVA 20%, la remise promotionnelle, prépare la ligne de caution et génère un code secret de suivi (ex: <code>CALV-493810</code>).
                  </div>
                </div>
              </div>

              {/* Étape 2 */}
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Contrôle & Validation par l'Administrateur</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '4px', fontWeight: 700 }}>Statut : CONFIRMED</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    L'administrateur reçoit la notification sur son dashboard. Il clique sur « Valider » et sélectionne le numéro de série d'usine physique à allouer au client (ex: <code>CP-4500-01</code>).
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <strong>Action Admin :</strong> Confirmation en 1 clic dans <Link href="/admin/reservations" style={{ color: '#f59e0b', textDecoration: 'underline' }}>Réservations Admin</Link>. Le matériel est verrouillé pour ces dates afin d'empêcher tout conflit.
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#38bdf8', color: '#000000', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Mise à Disposition au Comptoir & Dépôt de Caution</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '4px', fontWeight: 700 }}>Statut : ACTIVE</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    Le client se présente au dépôt (71 RUE DE LA FONTENELLE, Coin-lès-Cuvry). L'agent d'accueil procède à l'état des lieux de départ, enregistre l'empreinte de caution sur le TPE et passe la réservation à l'état <code>ACTIVE</code>.
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <strong>Action Comptoir :</strong> La machine physique passe au statut <code>RENTED</code> dans l'inventaire. Le compteur d'heures est relevé.
                  </div>
                </div>
              </div>

              {/* Étape 4 */}
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#64748b', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  4
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Restitution du Matériel, Contrôle & Clôture</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', borderRadius: '4px', fontWeight: 700 }}>Statut : COMPLETED</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    Au retour, inspection du matériel : propreté, niveau de carburant, état mécanique. Si conforme, la pré-autorisation bancaire de caution est annulée sans frais.
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <strong>Action Admin :</strong> La machine redevient instantanément <code>AVAILABLE</code> dans le parc pour les clients suivants.
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 4 : GALERIE VISUELLE HAUTE DÉFINITION (ZOOM LIGHTBOX)              */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                <Eye size={16} />
                <span>Captures Réelles du Site</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                Visite Guidée en Images Haute Définition
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
                Cliquez sur n'importe quel écran pour l'ouvrir en plein écran avec zoom et explications détaillées.
              </p>
            </div>

            {/* Filtres de catégorie de la galerie */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Toutes les captures (11)' },
                { id: 'admin', label: 'Console Administrateur (4)' },
                { id: 'public', label: 'Site Public & Fiches (4)' },
                { id: 'client', label: 'Espace Client (1)' },
                { id: 'securite', label: 'Authentification (1)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedCategory(f.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === f.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.06)',
                    color: selectedCategory === f.id ? '#ffffff' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grille de vignettes interactives */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
              {galleryScreenshots
                .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                .map((item, idx) => {
                  const globalIndex = galleryScreenshots.findIndex(s => s.src === item.src);
                  return (
                    <div
                      key={item.src}
                      onClick={() => openLightbox(globalIndex)}
                      style={{
                        backgroundColor: '#111827',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#f59e0b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden', backgroundColor: '#0f172a' }}>
                        <img
                          src={item.src}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(4px)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#f59e0b',
                          border: '1px solid rgba(217, 119, 6, 0.3)'
                        }}>
                          {item.tag}
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          color: '#ffffff',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <Maximize2 size={14} /> Zoomer
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 5 : BANQUE DE TEST DIRECTE & SIMULATEUR D'ACTIONS ADMIN            */}
        {/* ========================================================================= */}
        {activeTab === 'access' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                <Zap size={16} />
                <span>Prise en Main Immédiate</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                Testez l'Administration en Direct
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
                Connectez-vous automatiquement avec le compte administrateur créé pour Kenny, ou essayez le simulateur d'actions temps réel ci-dessous.
              </p>
            </div>

            {/* Carte de Connexion 1-Clic pour Kenny */}
            <div style={{
              backgroundColor: '#111827',
              border: '2px solid #10b981',
              borderRadius: '20px',
              padding: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
              boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.15)'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <ShieldCheck size={18} />
                  <span>Compte Administrateur Configuré & Actif</span>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
                  Accès Dédié Kenny (Super Admin)
                </h3>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Email Administrateur : </span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem' }}>darklaice@gmail.com</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Mot de passe : </span>
                    <strong style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '1rem' }}>Kenny1181</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.4rem' }}>
                    Privilèges : Rôle <code>ADMIN</code> complet (Accès dashboard, réservations, unités, codes promo, catalogue).
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => handleDirectAdminLogin('darklaice@gmail.com', 'Kenny1181')}
                    disabled={isLoggingIn}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem 1.6rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <Zap size={18} />
                    <span>{isLoggingIn ? 'Connexion en cours...' : '⚡ Se connecter en 1-Clic en tant que Kenny'}</span>
                  </button>

                  <Link
                    href="/connexion"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    Aller sur la page de connexion standard
                  </Link>
                </div>

                {loginMessage && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                    {loginMessage}
                  </div>
                )}
              </div>

              {/* Liens directs vers chaque page d'administration */}
              <div style={{ backgroundColor: '#090d16', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ExternalLink size={16} style={{ color: '#f59e0b' }} />
                  Accès Directs aux Pages Admin (après connexion) :
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <Link href="/admin" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📊 <strong>/admin</strong> — Dashboard Général</span>
                    <ChevronRight size={14} style={{ color: '#f59e0b' }} />
                  </Link>
                  <Link href="/admin/reservations" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📅 <strong>/admin/reservations</strong> — Suivi des Réservations</span>
                    <ChevronRight size={14} style={{ color: '#f59e0b' }} />
                  </Link>
                  <Link href="/admin/unites" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🔧 <strong>/admin/unites</strong> — Parc & N° de Série</span>
                    <ChevronRight size={14} style={{ color: '#f59e0b' }} />
                  </Link>
                  <Link href="/admin/promotions" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🏷️ <strong>/admin/promotions</strong> — Console Codes Promo</span>
                    <ChevronRight size={14} style={{ color: '#f59e0b' }} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Simulateur d'Actions Admin en Temps Réel */}
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                    Simulateur Interactif des Actions Administrateur
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Cliquez sur les boutons ci-dessous pour tester virtuellement les flux d'administration en temps réel.
                  </p>
                </div>
                <button
                  onClick={handleResetSimulation}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <RotateCcw size={14} /> Réinitialiser
                </button>
              </div>

              {/* Boutons d'actions du simulateur */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <button
                  onClick={handleSimulateValidation}
                  disabled={simulationState.reservationStatus !== 'PENDING'}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: simulationState.reservationStatus === 'PENDING' ? 'pointer' : 'not-allowed',
                    backgroundColor: simulationState.reservationStatus === 'PENDING' ? '#10b981' : '#1e293b',
                    color: simulationState.reservationStatus === 'PENDING' ? '#ffffff' : '#64748b',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <CheckCircle size={16} />
                  <span>1. Valider la réservation & affecter l'unité CP-4500-01</span>
                </button>

                <button
                  onClick={handleSimulateActive}
                  disabled={simulationState.reservationStatus !== 'CONFIRMED'}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: simulationState.reservationStatus === 'CONFIRMED' ? 'pointer' : 'not-allowed',
                    backgroundColor: simulationState.reservationStatus === 'CONFIRMED' ? '#38bdf8' : '#1e293b',
                    color: simulationState.reservationStatus === 'CONFIRMED' ? '#000000' : '#64748b',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Clock size={16} />
                  <span>2. Valider le retrait comptoir (ACTIVE)</span>
                </button>

                <button
                  onClick={handleSimulateComplete}
                  disabled={simulationState.reservationStatus !== 'ACTIVE'}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: simulationState.reservationStatus === 'ACTIVE' ? 'pointer' : 'not-allowed',
                    backgroundColor: simulationState.reservationStatus === 'ACTIVE' ? '#f59e0b' : '#1e293b',
                    color: simulationState.reservationStatus === 'ACTIVE' ? '#ffffff' : '#64748b',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>3. Restituer le matériel & libérer la caution (COMPLETED)</span>
                </button>

                <button
                  onClick={handleSimulatePromo}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: simulationState.promoCodeCreated ? '#831843' : '#db2777',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <BadgePercent size={16} />
                  <span>{simulationState.promoCodeCreated ? 'Code FLASH20 créé ✓' : 'Créer un code promo FLASH20 (-20%)'}</span>
                </button>

                <button
                  onClick={handleSimulateMaintenance}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: simulationState.unitMaintenance ? '#78350f' : '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Wrench size={16} />
                  <span>{simulationState.unitMaintenance ? 'Bétonnière en Maintenance (Cliquer pour réparer)' : 'Basculer Bétonnière BET-350-02 en Maintenance'}</span>
                </button>
              </div>

              {/* État actuel de la simulation & Journal des logs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#090d16', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>État Actuel de la Réservation de Test</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Statut :</span>
                    <span style={{
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor:
                        simulationState.reservationStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' :
                        simulationState.reservationStatus === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.2)' :
                        simulationState.reservationStatus === 'ACTIVE' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                      color:
                        simulationState.reservationStatus === 'PENDING' ? '#fbbf24' :
                        simulationState.reservationStatus === 'CONFIRMED' ? '#34d399' :
                        simulationState.reservationStatus === 'ACTIVE' ? '#38bdf8' : '#cbd5e1',
                    }}>
                      {simulationState.reservationStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Unité allouée : <strong style={{ color: '#ffffff' }}>{simulationState.assignedUnit || 'Aucune (En attente d\'affectation)'}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                    Bandeau promo public : <strong style={{ color: simulationState.promoCodeCreated ? '#34d399' : '#64748b' }}>{simulationState.promoCodeCreated ? 'FLASH20 actif en vedette' : 'Inactif'}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#090d16', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', maxHeight: '160px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Journal d'Exécution Admin (Logs)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {simulationState.logs.map((log, i) => (
                      <div key={i} style={{ color: i === 0 ? '#f59e0b' : '#94a3b8' }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 4. MODAL LIGHTBOX INTERACTIVE PLEIN ÉCRAN POUR LES CAPTURES HD           */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 8, 15, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1rem'
          }}
        >
          {/* Header Lightbox */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ backgroundColor: '#f59e0b', color: '#000000', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                {lightboxImage.tag}
              </span>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
                {lightboxImage.title}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                ({lightboxIndex + 1} / {galleryScreenshots.length})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#ffffff', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                title="Image précédente (Flèche gauche)"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#ffffff', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                title="Image suivante (Flèche droite)"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', marginLeft: '0.5rem' }}
                title="Fermer (Touche Échap)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Corps Image Lightbox */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              style={{
                maxWidth: '95vw',
                maxHeight: '78vh',
                objectFit: 'contain',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            />
          </div>

          {/* Footer descriptif Lightbox */}
          <div
            style={{
              textAlign: 'center',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              maxWidth: '900px',
              margin: '0 auto',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {lightboxImage.subtitle}
            </p>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem' }}>
              Utilisez les flèches du clavier ◀ ▶ pour faire défiler, ou Échap pour fermer
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
