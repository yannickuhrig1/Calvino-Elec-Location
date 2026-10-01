import React from 'react';
import prisma from '@/backend/db/prisma';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact & Dépôt | Calvino Location / CALVINO ELEC',
  description: 'Coordonnées de CALVINO ELEC / Calvino Location à Coin-lès-Cuvry (Moselle), horaires d’ouverture du dépôt et formulaire de contact technique.',
};

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  const openingHours = settings?.openingHoursJson
    ? JSON.parse(settings.openingHoursJson)
    : {
        lundi: '07h30 - 12h00 / 13h30 - 18h30',
        mardi: '07h30 - 12h00 / 13h30 - 18h30',
        mercredi: '07h30 - 12h00 / 13h30 - 18h30',
        jeudi: '07h30 - 12h00 / 13h30 - 18h30',
        vendredi: '07h30 - 12h00 / 13h30 - 18h30',
        samedi: 'Fermé (forfait week-end)',
        dimanche: 'Fermé (forfait week-end)',
      };

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            À votre service
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-navy)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            Contact & Dépôt CALVINO ELEC
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Une question technique sur un matériel, les forfaits week-end ou une demande spécifique ? Gaëtan CALVINO et l'équipe CALVINO ELEC vous répondent rapidement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'start' }}>
          {/* Colonne Gauche : Coordonnées et Horaires */}
          <div>
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-navy)', marginBottom: '1.5rem' }}>
                Coordonnées du dépôt
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--brand-navy)' }}>Adresse du dépôt :</strong>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {settings?.address || '71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Secteur Sud de Metz (Moselle) • Dépôt facile d'accès avec stationnement
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--brand-navy)' }}>Téléphone direct :</strong>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                      <a href={`tel:${settings?.phone || '0663447489'}`}>{settings?.phone || '06 63 44 74 89'}</a>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Gaëtan CALVINO • Joignable dès 07h30
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--brand-navy)' }}>Courriel commercial :</strong>
                    <div style={{ fontSize: '0.95rem', color: 'var(--brand-blue-accent)', fontWeight: 600, marginTop: '0.2rem' }}>
                      <a href={`mailto:${settings?.email || 'calvinoelec@gmail.com'}`}>{settings?.email || 'calvinoelec@gmail.com'}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires d'ouverture */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: 'var(--brand-amber)' }} />
                <span>Horaires d'ouverture de l'agence</span>
              </h2>

              <div className="table-responsive">
                <table className="table-modern">
                  <tbody>
                    {Object.entries(openingHours).map(([jour, horaire]: any) => (
                      <tr key={jour}>
                        <td style={{ textTransform: 'capitalize', fontWeight: 600, width: '35%' }}>{jour}</td>
                        <td style={{ color: jour === 'dimanche' ? 'var(--text-muted)' : 'var(--brand-navy)', fontWeight: jour === 'samedi' ? 600 : 400 }}>
                          {horaire}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Formulaire de contact fonctionnel */}
          <div>
            <div className="card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Envoyez-nous un message
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                Pour les demandes de devis sur mesure ou questions techniques sur un équipement.
              </p>

              <form action="#" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nom et Prénom *</label>
                    <input type="text" className="form-input" placeholder="Ex : Thomas Dubois" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Société (facultatif)</label>
                    <input type="text" className="form-input" placeholder="Ex : Dubois Bâtiment" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Adresse email *</label>
                    <input type="email" className="form-input" placeholder="thomas@dubois.fr" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Téléphone *</label>
                    <input type="tel" className="form-input" placeholder="06 12 34 56 78" required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Objet de votre demande</label>
                  <select className="form-select">
                    <option>Demande d'information technique sur un équipement</option>
                    <option>Demande de devis longue durée (&gt; 1 mois)</option>
                    <option>Organisation de livraison sur chantier spécifique</option>
                    <option>Question relative à une réservation existante</option>
                    <option>Autre question</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Votre message *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Précisez le type de chantier, le matériel envisagé ou vos contraintes de calendrier..."
                    rows={4}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
                  <Send size={18} />
                  <span>Envoyer mon message</span>
                </button>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                  Réponse assurée par un technicien Calvino sous 24h ouvrées.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
