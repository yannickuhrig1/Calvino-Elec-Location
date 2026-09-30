import React from 'react';
import Link from 'next/link';
import { Wrench, Phone, Mail, MapPin, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import prisma from '@/lib/prisma';

export async function SiteFooter() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 : Identité Calvino */}
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="brand-mark" style={{ width: '38px', height: '38px' }}>
                <Wrench size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  CALVINO <span style={{ color: 'var(--brand-amber)' }}>LOCATION</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Matériel & Outillage professionnel
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              Spécialiste de la location de matériel de chantier, démolition, maçonnerie, nettoyage et bricolage pour professionnels et particuliers. Matériel testé, révisé et conforme avant chaque mise à disposition.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <MapPin size={16} style={{ color: 'var(--brand-amber)', flexShrink: 0 }} />
                <span>{settings?.address || '71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <Phone size={16} style={{ color: 'var(--brand-amber)', flexShrink: 0 }} />
                <span>{settings?.phone || '06 63 44 74 89'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <Mail size={16} style={{ color: 'var(--brand-amber)', flexShrink: 0 }} />
                <span>{settings?.email || 'calvinoelec@gmail.com'}</span>
              </div>
            </div>
          </div>

          {/* Col 2 : Catalogue */}
          <div className="footer-col">
            <h4>Équipements</h4>
            <ul className="footer-links">
              <li><Link href="/materiels?cat=nettoyage-entretien">Nettoyage & Entretien</Link></li>
              <li><Link href="/materiels?cat=renovation-poncage-peinture">Rénovation & Ponçage</Link></li>
              <li><Link href="/materiels?cat=aspiration-depoussierage">Aspiration de chantier</Link></li>
              <li><Link href="/materiels?cat=sciage-decoupe">Sciage & Coupe radiale</Link></li>
              <li><Link href="/materiels?cat=beton-maconnerie">Béton & Malaxage</Link></li>
              <li><Link href="/materiels?cat=air-comprime">Compresseurs d'atelier</Link></li>
              <li><Link href="/materiels" style={{ color: 'var(--brand-amber)', fontWeight: 600 }}>Tout le catalogue (9 équipements) →</Link></li>
            </ul>
          </div>

          {/* Col 3 : Informations pratiques */}
          <div className="footer-col">
            <h4>Infos Pratiques</h4>
            <ul className="footer-links">
              <li><Link href="/comment-ca-marche">Comment ça marche</Link></li>
              <li><Link href="/presentation" style={{ color: 'var(--brand-amber)', fontWeight: 600 }}>Présentation & Guide Admin</Link></li>
              <li><Link href="/tarifs-et-conditions">Tarifs & Forfaits week-end</Link></li>
              <li><Link href="/tarifs-et-conditions#caution">Modalités de caution</Link></li>
              <li><Link href="/faq">Foire aux questions</Link></li>
              <li><Link href="/suivi">Suivre ma réservation</Link></li>
              <li><Link href="/contact">Horaires de l'agence</Link></li>
            </ul>
          </div>

          {/* Col 4 : Horaires & Engagements */}
          <div className="footer-col">
            <h4>Horaires d'ouverture</h4>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              <p><strong>Du lundi au vendredi :</strong><br />07h30 - 12h00 & 13h30 - 18h30</p>
              <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}><strong>Samedi & Dimanche :</strong><br />Fermé (aucun retrait ni retour - forfait week-end actif)</p>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.25rem' }}>
                <ShieldCheck size={16} />
                <span>Caution non encaissée</span>
              </div>
              <p style={{ color: '#94a3b8' }}>
                Dépôt de garantie par empreinte TPE ou chèque lors du retrait. Aucun prélèvement anticipé.
              </p>
            </div>
          </div>
        </div>

        {/* Bas de page légal */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} CALVINO ELEC / Calvino Location. Tous droits réservés.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/conditions-location">Conditions Générales de Location</Link>
            <Link href="/confidentialite">Politique de confidentialité</Link>
            <Link href="/admin" style={{ color: 'var(--brand-amber)' }}>Accès Administration</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
