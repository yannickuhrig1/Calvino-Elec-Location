'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Props {
  unitId: string;
  currentStatus: string;
}

export function UnitStatusChanger({ unitId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/units/${unitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors du changement de statut');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className="form-select"
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: 'var(--radius-sm)',
          width: 'auto',
          backgroundColor:
            currentStatus === 'AVAILABLE'
              ? '#ecfdf5'
              : currentStatus === 'RENTED'
              ? '#eff6ff'
              : currentStatus === 'MAINTENANCE'
              ? '#fef2f2'
              : '#f8fafc',
          color:
            currentStatus === 'AVAILABLE'
              ? '#047857'
              : currentStatus === 'RENTED'
              ? '#1d4ed8'
              : currentStatus === 'MAINTENANCE'
              ? '#b91c1c'
              : '#64748b',
        }}
      >
        <option value="AVAILABLE">Disponible au parc</option>
        <option value="RENTED">Loué (Sur chantier)</option>
        <option value="MAINTENANCE">En maintenance</option>
        <option value="OUT_OF_SERVICE">Mis hors service</option>
      </select>
      {loading && <Loader2 size={12} className="spin" />}
    </div>
  );
}
