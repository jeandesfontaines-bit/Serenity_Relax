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
  variant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'teal' | 'default';
}) {
  const iconStyles: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    teal: "bg-emerald-100 text-emerald-600",
    yellow: "bg-amber-100 text-amber-600",
    orange: "bg-orange-100 text-orange-600",
    pink: "bg-pink-100 text-pink-600",
    default: "bg-muted text-muted-foreground",
  };

  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconStyles[variant]}`}>
          {icon}
        </div>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
      </div>
      <p className="text-xs font-medium tracking-[0.05em] text-muted-foreground mb-1">{label}</p>
      <h3 className="text-2xl font-bold tracking-tight leading-none tabular-nums text-foreground">{value}</h3>
    </div>
  );
}

export function AgendaAppointmentRow({ appt, todayStr, onClick }: { appt: Appointment, todayStr: string, onClick: () => void }) {
  const status = getAppointmentStatus(appt, todayStr);
  const { hour, period } = displayTime(appt.time);
  
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-6 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:shadow-md active:scale-[0.995] ${status.muted ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      {/* Time */}
      <div className="min-w-[60px] text-center border-r border-border pr-6">
        <p className="text-lg font-bold tracking-tight leading-none tabular-nums text-foreground">{hour}</p>
        <p className="mt-1 text-[10px] font-medium tracking-[0.05em] text-muted-foreground">{period}</p>
      </div>
      {/* Details */}
      <div className="min-w-0 flex-1">
        <h5 className="truncate text-sm font-semibold tracking-tight leading-none text-foreground">
          {appt.clientNameSnapshot || appt.title || 'Client'}
        </h5>
        <p className="mt-1.5 truncate text-xs tracking-[0.05em] text-muted-foreground">
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
        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>
    </button>
  );
}

export function NoteCard({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-xl border border-border p-5 text-left transition-all duration-200 hover:shadow-md group active:scale-[0.99] bg-muted/30"
    >
      <p className="mb-1.5 text-[11px] font-medium tracking-[0.05em] text-primary">{formatDayLabel(appt.date)}</p>
      <h6 className="truncate text-sm font-semibold tracking-tight text-foreground">{appt.clientNameSnapshot || appt.title || 'Client'}</h6>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed tracking-[0.05em] text-muted-foreground italic">
        &ldquo;{appt.notes?.trim()}&rdquo;
      </p>
    </button>
  );
}
