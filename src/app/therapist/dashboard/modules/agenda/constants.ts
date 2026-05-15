import { format } from 'date-fns';
import { Appointment } from '../../types';

/* ── CONSTANTS ── */
export const HOUR_H = 72;          // pixels per hour row
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
    surface: 'bg-[#eef2ff]',
    bg: 'bg-[#7c86f8]',
    text: 'text-[#4952c6]',
    border: 'border-[#d8defc]',
    title: 'text-[#1f2454]',
    meta: 'text-[#5861bf]',
    dot: 'bg-[#7c86f8]',
  },
  confirmed: {
    surface: 'bg-[#edf4ff]',
    bg: 'bg-[#4c7ff7]',
    text: 'text-[#2551c9]',
    border: 'border-[#d4e2ff]',
    title: 'text-[#1e3f97]',
    meta: 'text-[#4670d8]',
    dot: 'bg-[#4c7ff7]',
  },
  paid: {
    surface: 'bg-[#ecfbf3]',
    bg: 'bg-[#2fb67a]',
    text: 'text-[#15724a]',
    border: 'border-[#c9efd9]',
    title: 'text-[#115c3d]',
    meta: 'text-[#23835a]',
    dot: 'bg-[#2fb67a]',
  },
  cancelled: {
    surface: 'bg-[#fff1f1]',
    bg: 'bg-[#ef6b6b]',
    text: 'text-[#bb4747]',
    border: 'border-[#ffd7d7]',
    title: 'text-[#993434]',
    meta: 'text-[#cf5858]',
    dot: 'bg-[#ef6b6b]',
  },
  pending: {
    surface: 'bg-[#fff7eb]',
    bg: 'bg-[#f4ae4e]',
    text: 'text-[#b87312]',
    border: 'border-[#f9ddae]',
    title: 'text-[#935d10]',
    meta: 'text-[#c18323]',
    dot: 'bg-[#f4ae4e]',
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
