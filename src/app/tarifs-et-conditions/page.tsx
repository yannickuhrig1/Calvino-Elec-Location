import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Percent, 
  FileText, 
  AlertCircle, 
  HelpCircle,
  Truck,
  Droplet
} from 'lucide-react';

export const metadata = {
  title: 'Tarifs, Forfaits et Conditions de Location | Calvino Location',
  description: 'Règles tarifaires transparentes, forfait week-end, politique de caution non débitée, retards, carburants et justificatifs obligatoires.',
};

export default function TarifsEtConditionsPage() {
  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Transparence Contractuelle
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-navy)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            Tarifs, Caution & Conditions de Location
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
            Chez Calvino Location, tous nos prix et modalités sont définis à l'avance. Pas de frais cachés au moment de la restitution.
          </p>
        </div>

        {/* 1. Barème et formules de durée */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} style={{ color: 'var(--brand-amber)' }} />
            <span>Formules de location & Dégressivité</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                1 Jour (24 heures)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-slate)', lineHeight: 1.5 }}>
                Base standard du catalogue. Le matériel retiré par exemple le mardi à 08h30 doit être restitué le mercredi avant 08h30.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--brand-amber)' }}>
              <div className="badge badge-pending" style={{ marginBottom: '0.5rem' }}>Formule Populaire</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Forfait Week-end Pro & Particuliers
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-slate)', lineHeight: 1.5 }}>
                Départ le <strong>vendredi dès 16h00</strong> ou le samedi matin, et retour le <strong>lundi matin avant 08h30</strong>. Facturé seulement 1,6 fois le tarif d’un seul jour !
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Forfait Semaine (7 jours)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-slate)', lineHeight: 1.5 }}>
                7 jours consécutifs de mise à disposition facturés l’équivalent de 4 jours seulement, idéal pour les phases de gros œuvre.
              </p>
            </div>
          </div>

          <div className="alert alert-info">
            <Percent size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Remises automatiques longue durée :</strong> Notre moteur de devis applique automatiquement <strong>-10%</strong> sur le montant de location dès 14 jours de location consécutifs, et <strong>-20%</strong> dès 30 jours.
            </div>
          </div>
        </section>

        {/* 2. Tout savoir sur la caution */}
        <section id="caution" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} style={{ color: 'var(--brand-amber)' }} />
            <span>Politique et modalités de la caution (Dépôt de garantie)</span>
          </h2>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                  Ce qu'est la caution chez nous :
                </h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--brand-slate)' }}>
                  <li>Une garantie temporaire contre la dégradation, la non-restitution ou la perte du matériel.</li>
                  <li><strong>Non débitée lors de votre demande en ligne :</strong> aucun paiement n'est exécuté sur le site web.</li>
                  <li>Libérée immédiatement lors de la restitution après état des lieux conforme.</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                  Comment déposer la caution au départ :
                </h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--brand-slate)' }}>
                  <li><strong>Par carte bancaire (recommandé) :</strong> simple pré-autorisation (empreinte) sur notre TPE en agence, sans débit sur votre compte.</li>
                  <li><strong>Par chèque d'entreprise :</strong> pour les professionnels avec extrait Kbis de moins de 3 mois et pièce d'identité du gérant.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Carburant, consommables et propreté */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={22} style={{ color: 'var(--brand-amber)' }} />
            <span>Carburant, nettoyage & consommables</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Niveau de carburant
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--brand-slate)', lineHeight: 1.5 }}>
                Les matériels thermiques (compresseurs, bétonnières, scies) sont livrés avec le plein de carburant (Diesel, Essence SP95). Ils doivent être restitués avec le plein. À défaut, le carburant manquant est facturé au tarif atelier affiché en agence.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                État de propreté
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--brand-slate)', lineHeight: 1.5 }}>
                Le matériel doit être rendu nettoyé (notamment les cuves de bétonnières et carters de découpeuses). Un forfait nettoyage de 20 € à 50 € HT sera appliqué si le matériel nécessite une intervention de décapage par notre atelier.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Disques & Outils diamantés
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--brand-slate)', lineHeight: 1.5 }}>
                Pour les scies à sol et carotteuses, l'usure des segments diamantés est mesurée au palmer avant le départ et au retour. Elle est facturée au dixième de millimètre consommé selon le barème de la fiche, sauf si le client fournit son propre disque.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Pièces justificatives obligatoires */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} style={{ color: 'var(--brand-amber)' }} />
            <span>Documents nécessaires pour la mise à disposition</span>
          </h2>

          <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--brand-navy)', display: 'block', marginBottom: '0.5rem' }}>
                  Pour les professionnels & entreprises :
                </strong>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <li>Extrait Kbis de moins de 3 mois</li>
                  <li>Pièce d'identité originale du gérant ou bon de commande signé par le représentant légal avec délégation de pouvoir</li>
                  <li>Chèque de caution ou carte bancaire société</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'var(--brand-navy)', display: 'block', marginBottom: '0.5rem' }}>
                  Pour les particuliers :
                </strong>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <li>Pièce d'identité en cours de validité (CNI ou passeport)</li>
                  <li>Justificatif de domicile de moins de 3 mois (quittance EDF, box internet, eau)</li>
                  <li>Carte bancaire au nom et prénom identiques à la pièce d'identité pour l'empreinte de caution</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div style={{ textAlign: 'center' }}>
          <Link href="/materiels" className="btn btn-primary btn-lg">
            Consulter les tarifs des matériels
          </Link>
        </div>
      </div>
    </div>
  );
}
