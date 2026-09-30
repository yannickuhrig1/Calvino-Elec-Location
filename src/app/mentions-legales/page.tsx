import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Mentions Légales | Calvino Location',
};

export default function MentionsLegalesPage() {
  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--brand-navy)', marginBottom: '1.5rem' }}>
          Mentions Légales
        </h1>

        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, fontSize: '0.925rem', color: 'var(--brand-slate)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              1. Éditeur de l'application
            </h2>
            <p>
              Le site <strong>Calvino Location</strong> est édité par l'entreprise <strong>CALVINO ELEC</strong>, dirigée par Monsieur Gaëtan CALVINO.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Siège social & Dépôt :</strong> 71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY, France.<br />
              <strong>Directeur de la publication :</strong> Gaëtan CALVINO.<br />
              <strong>Contact :</strong> calvinoelec@gmail.com • Téléphone : 06 63 44 74 89.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              2. Hébergement
            </h2>
            <p>
              L'application et la base de données sont hébergées sur infrastructure cloud sécurisée conforme aux normes européennes de protection des données (RGPD).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              3. Nature du service & Données de démonstration
            </h2>
            <p>
              Ce site web constitue la plateforme numérique de réservation et de gestion de flotte de matériels de travaux et chantier de Calvino Location. En environnement de démonstration, les informations de tarifs et de contacts techniques restent configurables depuis l'interface d'administration.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
