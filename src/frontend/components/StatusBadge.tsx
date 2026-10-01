import React from 'react';
import { Clock, CheckCircle2, Truck, CheckCheck, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case 'PENDING':
      return (
        <span className={`badge badge-pending ${className}`} title="En attente de vérification par Calvino Location">
          {showIcon && <Clock size={13} />}
          En attente de confirmation
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className={`badge badge-confirmed ${className}`} title="Réservation validée par l'administrateur">
          {showIcon && <CheckCircle2 size={13} />}
          Confirmée
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`badge badge-in-progress ${className}`} title="Matériel actuellement mis à disposition">
          {showIcon && <Truck size={13} />}
          En cours d'utilisation
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`badge badge-completed ${className}`} title="Location terminée, matériel restitué et caution libérée">
          {showIcon && <CheckCheck size={13} />}
          Terminée & Caution libérée
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`badge badge-danger ${className}`} title="Demande ou réservation annulée">
          {showIcon && <XCircle size={13} />}
          Annulée
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`badge badge-danger ${className}`} title="Demande refusée par l'administrateur">
          {showIcon && <AlertTriangle size={13} />}
          Refusée
        </span>
      );
    default:
      return (
        <span className={`badge badge-neutral ${className}`}>
          {status}
        </span>
      );
  }
}
