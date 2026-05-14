import React from 'react';
import { TransactionStatus } from './types';
import { Appointment } from '../../types';

export const STATUS_META: Record<TransactionStatus, { label: string; className: string }> = {
  completed: {
    label: 'RÉGLÉ',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  pending: {
    label: 'EN ATTENTE',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  cancelled: {
    label: 'ANNULÉ',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  late: {
    label: 'RETARD',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
};

export function toComparableDate(date?: string): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getTransactionStatus(appt: Appointment, todayStr: string): TransactionStatus {
  if (appt.status === 'cancelled') return 'cancelled';
  if (appt.paid) return 'completed';
  if (appt.date && appt.date < todayStr) return 'late';
  return 'pending';
}

export function getClientDisplayName(appt: Appointment): string {
  return appt.clientNameSnapshot || appt.title || 'Client inconnu';
}

export function getClientNameParts(appt: Appointment): { firstName: string; lastName: string } {
  const fullName = getClientDisplayName(appt).trim();
  if (!fullName) return { firstName: '—', lastName: '—' };
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: '—' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function formatCurrency(value: number): string {
  return `${value.toLocaleString('fr-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} CHF`;
}

export const GRID_TEMPLATE = `56px minmax(140px,0.95fr) minmax(160px,1fr) minmax(180px,1.1fr) minmax(220px,1.2fr) minmax(260px,1.5fr) minmax(150px,0.95fr) 88px minmax(150px,1fr)`;
