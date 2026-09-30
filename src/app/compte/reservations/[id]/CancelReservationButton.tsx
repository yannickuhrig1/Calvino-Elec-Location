'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';

interface CancelProps {
  reservationId: string;
}

export function CancelReservationButton({ reservationId }: CancelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande de réservation ?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: 'CANCELLED',
          reason: 'Annulation demandée par le client depuis son espace personnel.',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l’annulation');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Impossible d’annuler');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="btn btn-danger btn-sm"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="spin" />
          <span>Annulation...</span>
        </>
      ) : (
        <>
          <XCircle size={14} />
          <span>Annuler ma demande</span>
        </>
      )}
    </button>
  );
}
