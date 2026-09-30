import React from 'react';

export const metadata = {
  title: 'Politique de Confidentialité & RGPD | Calvino Location',
};

export default function ConfidentialitePage() {
  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--brand-navy)', marginBottom: '1.5rem' }}>
          Politique de Confidentialité (RGPD)
        </h1>

        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, fontSize: '0.925rem', color: 'var(--brand-slate)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Collecte et finalité des données
            </h2>
            <p>
              Les données personnelles collectées lors d'une réservation (nom, prénom, adresse postale, téléphone, email, société) sont strictement nécessaires à l'établissement du contrat de location, à la gestion du parc d'engins et à la communication technique relative à vos chantiers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Conservation & Sécurité
            </h2>
            <p>
              Ces données sont conservées pendant la durée de la relation commerciale et archivées selon les obligations comptables et légales en vigueur. Elles ne sont en aucun cas cédées ou commercialisées à des tiers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Vos droits
            </h2>
            <p>
              Conformément à la réglementation RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données personnelles sur simple demande par email à contact@calvino-location.fr.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
