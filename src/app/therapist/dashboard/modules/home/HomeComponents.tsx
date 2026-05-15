import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

export function getAppointmentStatus(appt: Appointment, todayStr: string) {
  if (appt.status === 'cancelled') {
    return {
      label: 'Annulé',
      className: 'bg-red-50 text-red-600 border-red-200',
      muted: true,
    };
  }
  if (appt.paid) {
    return {
      label: 'Réglé',
      className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      muted: false,
    };
  }
  if (appt.date && appt.date < todayStr) {
    return {
      label: 'En retard',
      className: 'bg-amber-50 text-amber-600 border-amber-200',
      muted: false,
    };
  }
  return {
    label: 'À venir',
    className: 'bg-blue-50 text-blue-600 border-blue-200',
    muted: false,
  };
}

export function displayTime(time?: string) {
  if (!time) return { hour: '--:--', period: '' };
  const [hStr, mStr] = time.split(':');
  const hours = Number(hStr);
  const minutes = mStr || '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = ((hours + 11) % 12) + 1;
  return { hour: `${String(displayHour).padStart(2, '0')}:${minutes}`, period };
}

export function formatDayLabel(dateStr?: string) {
  if (!dateStr) return 'Récemment';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Récemment';
  return format(date, 'd MMM');
}

export function MetricCard({
  icon, label, value, variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'teal' | 'blueSoft' | 'default';
}) {
  const iconStyles: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    teal: "bg-emerald-100 text-emerald-600",
    yellow: "bg-amber-100 text-amber-600",
    orange: "bg-orange-100 text-orange-600",
    pink: "bg-pink-100 text-pink-600",
    blueSoft: "bg-sky-100 text-sky-600",
    default: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="group rounded-3xl border border-[#e2e9f3] bg-white p-6 shadow-[0_10px_30px_rgba(23,43,77,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(23,43,77,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconStyles[variant]}`}>
          {icon}
        </div>
        <ChevronRight size={14} className="text-slate-300 opacity-0 transition-opacity group-hover:opacity-70" />
      </div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <h3 className="text-[2rem] font-bold tracking-tight leading-none tabular-nums text-slate-900">{value}</h3>
    </div>
  );
}

export function AgendaAppointmentRow({ appt, todayStr, onClick }: { appt: Appointment, todayStr: string, onClick: () => void }) {
  const status = getAppointmentStatus(appt, todayStr);
  const { hour, period } = displayTime(appt.time);
  
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-6 rounded-2xl border border-[#e2e9f3] bg-white p-5 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.995] ${status.muted ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      {/* Time */}
      <div className="min-w-[60px] border-r border-[#edf2f7] pr-6 text-center">
        <p className="text-lg font-bold tracking-tight leading-none tabular-nums text-slate-900">{hour}</p>
        <p className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-slate-400">{period}</p>
      </div>
      {/* Details */}
      <div className="min-w-0 flex-1">
        <h5 className="truncate text-sm font-semibold tracking-tight leading-none text-slate-900">
          {appt.clientNameSnapshot || appt.title || 'Client'}
        </h5>
        <p className="mt-1.5 truncate text-xs tracking-[0.04em] text-slate-500">
          {cleanServiceLabel(appt.serviceName) || 'Consultation'} · {appt.duration || '60 min'}
        </p>
      </div>
      {/* Badge */}
      <div className="flex items-center gap-3">
        <span 
          className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium tracking-[0.05em] border ${status.className}`}
        >
          {status.label}
        </span>
        <ChevronRight size={16} strokeWidth={1.5} className="text-slate-300 opacity-0 transition-opacity group-hover:opacity-60" />
      </div>
    </button>
  );
}

export function NoteCard({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-2xl border border-[#e2e9f3] bg-white p-5 text-left transition-all duration-200 hover:shadow-sm group active:scale-[0.99]"
    >
      <p className="mb-1.5 text-[11px] font-semibold tracking-[0.05em] text-primary">{formatDayLabel(appt.date)}</p>
      <h6 className="truncate text-sm font-semibold tracking-tight text-slate-900">{appt.clientNameSnapshot || appt.title || 'Client'}</h6>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed tracking-[0.03em] text-slate-500 italic">
        &ldquo;{appt.notes?.trim()}&rdquo;
      </p>
    </button>
  );
}
