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
  border: string;
  title: string;
  meta: string;
  dot: string;
};

export const APPOINTMENT_TONES: Record<'default' | 'paid' | 'cancelled' | 'pending' | 'confirmed', AppointmentTone> = {
  default: {
    surface: '',
    border: 'border-[hsl(var(--border))]',
    title: '',
    meta: '',
    dot: '',
  },
  confirmed: {
    surface: 'bg-blue-500/10',
    border: 'border-blue-200/50',
    title: 'text-blue-950',
    meta: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  paid: {
    surface: 'bg-emerald-500/10',
    border: 'border-emerald-200/50',
    title: 'text-emerald-950',
    meta: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    surface: 'bg-red-500/10',
    border: 'border-red-100',
    title: 'text-red-950',
    meta: 'text-red-600',
    dot: 'bg-red-500',
  },
  pending: {
    surface: 'bg-amber-500/10',
    border: 'border-amber-200/50',
    title: 'text-amber-950',
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
