import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Conditions Générales de Location (CGL) | Calvino Location',
};

export default function ConditionsLocationPage() {
  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Conditions Générales de Location (CGL)
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Applicables à toute mise à disposition de matériel par Calvino Location SAS.
        </p>

        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, fontSize: '0.925rem', color: 'var(--brand-slate)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Article 1 – Formation du contrat & Statut de la demande
            </h2>
            <p>
              Toute demande initiée sur le site internet reçoit obligatoirement et dans un premier temps le statut <strong>EN ATTENTE</strong>. Elle ne vaut en aucun cas confirmation automatique de réservation. Le contrat n'est valablement formé qu'après acceptation et vérification de la disponibilité du parc physique par notre agence (statut <strong>CONFIRMÉE</strong>), puis signature conjointe de la fiche contradictoire d'état des lieux lors de la mise à disposition.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Article 2 – Dépôt de garantie (Caution)
            </h2>
            <p>
              Le locataire verse au moment de la prise en charge du matériel une caution dont le montant est fixé selon le barème de la fiche équipement. Ce dépôt de garantie n'est pas productif d'intérêts et ne constitue pas un loyer d'avance. Il est déposé sous forme de pré-autorisation bancaire (empreinte TPE non débitée) ou de chèque d’entreprise. La caution est débloquée ou restituée intégralement lors du retour de l'équipement dans le même état d'entretien et de fonctionnement qu'au départ.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Article 3 – Utilisation, Consignes de sécurité et EPI
            </h2>
            <p>
              Le locataire reconnaît avoir reçu la notice d'utilisation, les consignes de sécurité propres à l'appareil et avoir pris connaissance du port obligatoire des Équipements de Protection Individuelle (EPI). Le locataire s'interdit d'utiliser le matériel à des fins non conformes à sa destination ou de le sous-louer sans autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Article 4 – Restitution, Nettoyage & Carburant
            </h2>
            <p>
              Le matériel doit être rapporté à la date et heure convenues. Les appareils thermiques fournis avec le plein doivent être restitués avec le réservoir plein. Les équipements souillés par du béton, de la colle, des résines ou des hydrocarbures feront l'objet d'un forfait nettoyage déduit de la caution ou facturé en sus au tarif atelier.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Article 5 – Droit applicable et litiges
            </h2>
            <p>
              Les présentes conditions sont soumises au droit français. À défaut d'accord amiable, les tribunaux compétents du ressort du siège social de Calvino Location seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
