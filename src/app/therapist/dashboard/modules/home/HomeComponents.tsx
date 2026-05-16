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
    default: "bg-secondary text-muted-foreground",
  };

  return (
    <div className="dashboard-panel-lg group rounded-[1.35rem] p-5 hover:-translate-y-0.5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-[1rem] ${iconStyles[variant]}`}>
          {icon}
        </div>
        <ChevronRight size={14} className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-70" />
      </div>
      <p className="dashboard-label mb-2.5">{label}</p>
      <h3 className="dashboard-metric-value">{value}</h3>
    </div>
  );
}

export function AgendaAppointmentRow({ appt, todayStr, onClick }: { appt: Appointment, todayStr: string, onClick: () => void }) {
  const status = getAppointmentStatus(appt, todayStr);
  const { hour, period } = displayTime(appt.time);
  
  return (
    <button
      onClick={onClick}
      className={`dashboard-panel group flex w-full items-center gap-6 rounded-xl p-5 text-left active:scale-[0.995] ${status.muted ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      {/* Time */}
      <div className="min-w-[60px] border-r border-border/60 pr-6 text-center">
        <p className="dashboard-body-strong tabular-nums">{hour}</p>
        <p className="dashboard-meta mt-1">{period}</p>
      </div>
      {/* Details */}
      <div className="min-w-0 flex-1">
        <h5 className="dashboard-body-strong truncate leading-none">
          {appt.clientNameSnapshot || appt.title || 'Client'}
        </h5>
        <p className="dashboard-meta mt-1.5 truncate">
          {cleanServiceLabel(appt.serviceName) || 'Consultation'} · {appt.duration || '60 min'}
        </p>
      </div>
      {/* Badge */}
      <div className="flex items-center gap-3">
        <span 
          className={`dashboard-status-chip shrink-0 rounded-md border ${status.className}`}
        >
          {status.label}
        </span>
        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-60" />
      </div>
    </button>
  );
}

export function NoteCard({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="dashboard-panel block w-full rounded-xl p-5 text-left group active:scale-[0.99]"
    >
      <p className="dashboard-meta-strong mb-1.5 text-primary">{formatDayLabel(appt.date)}</p>
      <h6 className="dashboard-body-strong truncate">{appt.clientNameSnapshot || appt.title || 'Client'}</h6>
      <p className="dashboard-meta mt-1.5 line-clamp-2 italic leading-relaxed">
        &ldquo;{appt.notes?.trim()}&rdquo;
      </p>
    </button>
  );
}
