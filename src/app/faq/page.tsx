import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight, ShieldCheck, PhoneCall } from 'lucide-react';

export const metadata = {
  title: 'Foire Aux Questions (FAQ) | Calvino Location',
  description: 'Toutes les réponses à vos questions sur les permis de remorquage, la caution, le carburant, les pannes et les prolongations de location.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'Faut-il un permis spécial pour tracter un compresseur ou une bétonnière ?',
      a: 'Pour la plupart de nos matériels tractables (bétonnière 350L de 225 kg, compresseur diesel de 680 kg), le simple permis B suffit, car le PTAC de la remorque reste inférieur à 750 kg et l’ensemble ne dépasse pas 3 500 kg. N’oubliez pas de vous munir d’une plaque d’immatriculation amovible au numéro de votre véhicule tracteur.',
    },
    {
      q: 'Comment fonctionne le dépôt de garantie (caution) ?',
      a: 'La caution n’est JAMAIS encaissée lors de votre réservation sur le site. Lors de la remise du matériel en agence ou sur votre chantier, nous effectuons une simple pré-autorisation (empreinte bancaire) sur terminal de paiement ou demandons un chèque d’entreprise. Dès la restitution du matériel propre et contrôlé, l’empreinte est immédiatement annulée.',
    },
    {
      q: 'Le carburant est-il compris dans le montant de la location ?',
      a: 'Non, les consommables ne sont pas inclus. Nos engins thermiques vous sont remis avec le plein fait (Essence SP95 ou Gasoil/GNR). Vous devez les restituer avec le plein. Si vous n’avez pas eu le temps de passer à la pompe, nous faisons le complément au tarif atelier affiché en agence.',
    },
    {
      q: 'Puis-je prolonger ma location si mon chantier prend du retard ?',
      a: 'Oui, sous réserve que l’engin n’ait pas déjà été réservé par un autre client pour la période suivante. Vous devez impérativement nous prévenir par téléphone au moins 4 heures avant l’heure prévue de restitution. Un avenant est créé et le tarif journalier dégressif continue de s’appliquer.',
    },
    {
      q: 'Que se passe-t-il en cas de panne ou d’incident technique sur mon chantier ?',
      a: 'Nos matériels sont systématiquement testés avant chaque départ. Si un dysfonctionnement survenait malgré tout, contactez immédiatement notre permanence technique au 06 63 44 74 89. Si le problème ne peut être résolu par nos consignes à distance, nous procédons à l’échange prioritaire de l’engin sous réserve des stocks disponibles, et le temps d’immobilisation n’est pas facturé.',
    },
    {
      q: 'Quels sont les délais et zones de livraison sur chantier ?',
      a: 'Nous livrons dans toute la Moselle (Metz, Coin-lès-Cuvry et communes environnantes) sous 24h ouvrées. Un créneau précis (début de matinée ou après-midi) est convenu lors de la confirmation par notre équipe. Le lieu de livraison doit permettre l’accès d’un véhicule utilitaire.',
    },
    {
      q: 'Un particulier peut-il louer du matériel professionnel ?',
      a: 'Absolument ! Particuliers et professionnels bénéficient des mêmes matériels de haute qualité. Pour les particuliers, une pièce d’identité, un justificatif de domicile de moins de 3 mois et une carte bancaire au même nom pour la caution sont requis.',
    },
  ];

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Aide & Réponses Pratiques
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-navy)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            Foire Aux Questions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto' }}>
            Retrouvez les réponses aux interrogations les plus courantes sur le fonctionnement de nos locations.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3.5rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', marginBottom: '0.65rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ color: 'var(--brand-amber)', fontWeight: 800 }}>Q.</span>
                <span>{faq.q}</span>
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--brand-slate)', lineHeight: 1.6, paddingLeft: '1.85rem' }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Bannière contact si question non résolue */}
        <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--brand-navy)', color: '#ffffff' }}>
          <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Vous avez une question spécifique pour votre chantier ?
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
            Nos techniciens sont joignables du lundi au vendredi pour vous guider dans le choix de la machine et des accessoires adaptés.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary">
              Formulaire de contact
            </Link>
            <a href="tel:0663447489" className="btn btn-outline" style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}>
              <PhoneCall size={16} />
              <span>06 63 44 74 89</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
