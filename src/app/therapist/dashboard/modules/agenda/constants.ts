import { format } from 'date-fns';
import { Appointment } from '../../types';

/* ── CONSTANTS ── */
export const HOUR_H = 80;          // pixels per hour row
export const START_HOUR = 8;
export const END_HOUR = 20;
export const DEFAULT_DURATION = 90; // minutes

export const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

export const isoDay = (d: Date) => { 
  const x = d.getDay(); 
  return x === 0 ? 6 : x - 1; 
};

export const wkStart = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(x.setDate(diff));
};

export const DAYS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function getTop(time: string): number {
  return ((timeToMinutes(time) - START_HOUR * 60) / 60) * HOUR_H;
}

export function getHeight(mins: number): number {
  return (mins / 60) * HOUR_H;
}

export function parseDuration(d?: string): number {
  if (!d) return DEFAULT_DURATION;
  const n = parseInt(d);
  return isNaN(n) ? DEFAULT_DURATION : n;
}

export type AppointmentTone = {
  surface: string;
  bg: string;
  text: string;
  border: string;
  title: string;
  meta: string;
  dot: string;
};

export const APPOINTMENT_TONES: Record<'default' | 'paid' | 'cancelled' | 'pending' | 'confirmed', AppointmentTone> = {
  default: {
    surface: 'bg-slate-50',
    bg: 'bg-slate-500',
    text: 'text-slate-700',
    border: 'border-slate-200',
    title: 'text-slate-900',
    meta: 'text-slate-500',
    dot: 'bg-slate-400',
  },
  confirmed: {
    surface: 'bg-blue-50',
    bg: 'bg-blue-600',
    text: 'text-blue-700',
    border: 'border-blue-200',
    title: 'text-blue-900',
    meta: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  paid: {
    surface: 'bg-emerald-50',
    bg: 'bg-emerald-600',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    title: 'text-emerald-900',
    meta: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    surface: 'bg-red-50',
    bg: 'bg-red-600',
    text: 'text-red-700',
    border: 'border-red-200',
    title: 'text-red-900',
    meta: 'text-red-600',
    dot: 'bg-red-500',
  },
  pending: {
    surface: 'bg-amber-50',
    bg: 'bg-amber-600',
    text: 'text-amber-700',
    border: 'border-amber-200',
    title: 'text-amber-900',
    meta: 'text-amber-600',
    dot: 'bg-amber-500',
  },
};

export function getAppointmentTone(appt: Appointment): AppointmentTone {
  const status = String(appt.status || '').toLowerCase();
  if (status.includes('cancel')) return APPOINTMENT_TONES.cancelled;
  if (appt.paid || status === 'paid' || status === 'done' || status === 'réglé' || status === 'regle') {
    return APPOINTMENT_TONES.paid;
  }
  if (status === 'pending' || status === 'late') return APPOINTMENT_TONES.pending;
  if (status === 'confirmed') return APPOINTMENT_TONES.confirmed;
  return APPOINTMENT_TONES.default;
}
