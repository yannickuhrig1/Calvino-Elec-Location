import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Truck, 
  FileText, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const metadata = {
  title: 'Comment ça marche ? | Calvino Location',
  description: 'Guide complet du parcours de location : demande en ligne, validation humaine sous 2h, retrait, utilisation et restitution sans mauvaise surprise.',
};

export default function HowItWorksPage() {
  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Processus & Transparence
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-navy)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            Comment louer chez Calvino Location ?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
            Nous avons conçu un parcours rigoureux et professionnel, évitant tout blocage ou double réservation sur votre chantier.
          </p>
        </div>

        {/* Étape 1 */}
        <div className="card" style={{ padding: '2.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
              1
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Sélection du matériel & Devis transparent
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Parcourez notre catalogue et vérifiez la fiche technique. En renseignant vos dates de début et de fin ainsi que le mode de mise à disposition (retrait en agence ou livraison sur chantier), le système calcule immédiatement le loyer hors taxes, la TVA et le montant du dépôt de garantie (caution).
              </p>
              <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                💡 <strong>Important :</strong> Aucun paiement bancaire n'est requis à cette étape. Votre demande est enregistrée avec le statut initial <strong>EN ATTENTE</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Étape 2 */}
        <div className="card" style={{ padding: '2.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--brand-amber)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-amber)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
              2
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Contrôle physique & Confirmation sous 2h ouvrées
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Contrairement à un site de vente en ligne automatisé sans stock physique, chez Calvino Location chaque demande est examinée par un responsable de parc. Nous vérifions que le matériel sélectionné a bien subi ses contrôles d'entretien périodiques, qu'aucun délai tampon d'atelier ne fait obstacle, et nous lui assignons un numéro de série unique.
              </p>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6 }}>
                Dès validation, votre statut passe à <strong>CONFIRMÉE</strong> et vous recevez un récapitulatif complet des pièces à présenter.
              </p>
            </div>
          </div>
        </div>

        {/* Étape 3 */}
        <div className="card" style={{ padding: '2.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
              3
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Mise à disposition contradictoire & Empreinte de caution
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                À l'agence ou lors de la dépose sur votre chantier, un technicien procède avec vous à :
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--brand-slate)', marginBottom: '1rem' }}>
                <li>L'état des lieux contradictoire de l'appareil (propreté, carrosserie, niveau de carburant, compteur d'heures)</li>
                <li>L'essai de démarrage et la démonstration des dispositifs de sécurité (bouton d'arrêt d'urgence, lubrification)</li>
                <li>La remise des accessoires inclus (lances, flexibles, adaptateurs)</li>
                <li>La consignation de la caution (par empreinte bancaire non prélevée ou chèque certifié avec CNI)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Étape 4 */}
        <div className="card" style={{ padding: '2.25rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
              4
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Restitution du matériel & Libération de caution
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Le matériel doit être rapporté avant l'heure limite convenue, propre et avec le plein de carburant correspondant (si remis avec le plein).
              </p>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6 }}>
                Après vérification par notre atelier, le bon de retour est signé conjointement, le statut passe à <strong>TERMINÉE</strong> et la caution est immédiatement débloquée.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/materiels" className="btn btn-primary btn-lg">
            <span>Découvrir les matériels disponibles</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
