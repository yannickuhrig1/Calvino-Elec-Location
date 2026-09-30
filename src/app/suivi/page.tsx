import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  FileText, 
  Calendar, 
  Truck, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface SuiviPageProps {
  searchParams: {
    code?: string;
    secret?: string;
  };
}

export default async function SuiviPage({ searchParams }: SuiviPageProps) {
  const code = searchParams.code?.trim().toUpperCase();
  const secret = searchParams.secret?.trim().toUpperCase();

  let reservation: any = null;
  let error = '';

  if (code && secret) {
    reservation = await prisma.reservation.findFirst({
      where: {
        reservationNumber: code,
        secretAccessCode: secret,
      },
      include: {
        equipment: {
          include: { category: true },
        },
        unit: true,
      },
    });

    if (!reservation) {
      error = 'Aucune réservation trouvée correspondant à ce numéro et ce code secret.';
    }
  }

  const history = reservation ? JSON.parse(reservation.statusHistoryJson || '[]') : [];

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Suivi en direct de votre réservation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Consultez le statut d'avancement de votre dossier sans avoir besoin de mot de passe.
          </p>
        </div>

        {/* Formulaire de recherche si pas encore renseigné ou erreur */}
        {(!reservation || error) && (
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            <form method="GET" action="/suivi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Numéro de réservation</label>
                <input
                  type="text"
                  name="code"
                  defaultValue={code}
                  placeholder="Ex : CALV-2026-0001"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Code secret de suivi</label>
                <input
                  type="text"
                  name="secret"
                  defaultValue={secret}
                  placeholder="Ex : CALV-TRACK-A8F4"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                <Search size={16} />
                <span>Rechercher</span>
              </button>
            </form>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              Ces identifiants vous ont été communiqués lors de la confirmation de votre demande.
            </div>
          </div>
        )}

        {/* Détail de la réservation trouvée */}
        {reservation && (
          <div>
            {/* Carte de statut principale */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Réservation n° {reservation.reservationNumber}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', margin: '0.25rem 0' }}>
                    {reservation.equipment.name}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Client : <strong>{reservation.customerName}</strong> {reservation.customerCompany ? `(${reservation.customerCompany})` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={reservation.status} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Dernière mise à jour : {format(reservation.updatedAt, 'dd/MM/yyyy à HH:mm')}
                  </div>
                </div>
              </div>

              {/* Message contextuel selon le statut */}
              {reservation.status === 'PENDING' && (
                <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                  <Clock size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Demande en cours d'examen :</strong> Votre demande a été reçue par notre agence. Un gestionnaire vérifie la disponibilité physique et valide les conditions sous 2h ouvrées.
                  </div>
                </div>
              )}

              {reservation.status === 'CONFIRMED' && (
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Réservation confirmée !</strong> Le matériel est réservé à votre nom.
                    {reservation.unit && (
                      <span style={{ display: 'block', marginTop: '0.25rem' }}>
                        Unité assignée : <strong>{reservation.unit.internalCode}</strong> {reservation.unit.serialNumber ? `(S/N: ${reservation.unit.serialNumber})` : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {reservation.status === 'IN_PROGRESS' && (
                <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                  <Truck size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Matériel actuellement en cours d'utilisation :</strong> Remis le {format(reservation.startDate, 'dd/MM/yyyy')}. Restitution attendue le <strong>{format(reservation.endDate, 'dd/MM/yyyy')} à {reservation.returnTime}</strong>.
                  </div>
                </div>
              )}

              {reservation.status === 'COMPLETED' && (
                <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Location terminée & Caution libérée :</strong> Matériel retourné en bon état. Votre caution a été intégralement débloquée.
                  </div>
                </div>
              )}

              {/* Grille résumé dates & lieu */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Période</div>
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                    Du {format(reservation.startDate, 'dd/MM/yyyy')} à {reservation.pickupTime}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                    Au {format(reservation.endDate, 'dd/MM/yyyy')} à {reservation.returnTime}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mode</div>
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                    {reservation.deliveryMode === 'DELIVERY_ON_SITE' ? 'Livraison sur chantier' : 'Retrait en agence'}
                  </div>
                  {reservation.deliveryAddress && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {reservation.deliveryAddress}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Montant & Caution</div>
                  <div style={{ fontWeight: 700, color: 'var(--brand-blue-accent)', marginTop: '0.2rem' }}>
                    Total : {reservation.totalAmount.toFixed(2)} € TTC
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Caution : <strong>{reservation.depositAmount.toFixed(0)} €</strong> (non débitée)
                  </div>
                </div>
              </div>

              {/* Journal chronologique d'audit */}
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                  Historique chronologique des événements
                </h3>
                <div className="timeline">
                  {history.map((event: any, idx: number) => (
                    <div key={idx} className="timeline-item">
                      <div className={`timeline-dot ${idx === history.length - 1 ? 'active' : ''}`} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <StatusBadge status={event.status} showIcon={false} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {format(new Date(event.date), 'dd/MM/yyyy à HH:mm')} • Par {event.author}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--brand-slate)' }}>
                        {event.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/materiels" className="btn btn-outline">
                ← Retour au catalogue
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
