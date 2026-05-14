import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

export function getAppointmentStatus(appt: Appointment, todayStr: string) {
  if (appt.status === 'cancelled') {
    return {
      label: 'ANNULÉ',
      className: 'bg-pink-500/15 text-pink-500 border-pink-500/30',
      muted: true,
    };
  }
  if (appt.paid) {
    return {
      label: 'RÉGLÉ',
      className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      muted: false,
    };
  }
  if (appt.date && appt.date < todayStr) {
    return {
      label: 'EN RETARD',
      className: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      muted: false,
    };
  }
  return {
    label: 'À VENIR',
    className: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
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
  return format(date, 'd MMM').toUpperCase();
}

export function MetricCard({
  icon, label, value, variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'teal' | 'default';
}) {
  const iconCircleStyles: Record<string, string> = {
    blue: "bg-blue-500 text-white",
    teal: "bg-emerald-500 text-white",
    yellow: "bg-amber-500 text-white",
    orange: "bg-orange-500 text-white",
    pink: "bg-pink-500 text-white",
    default: "bg-secondary text-muted-foreground",
  };

  return (
    <div
      className="group rounded-3xl border border-border/30 p-8 transition-all duration-700 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 bg-background"
    >
      <div className="mb-8 flex items-center justify-between">
        <div 
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-700 shadow-sm ${iconCircleStyles[variant]}`}
        >
          {icon}
        </div>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-[-4px] group-hover:translate-x-0 text-muted-foreground" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <h3 className="mt-3 text-3xl font-black tracking-tight leading-none tabular-nums text-foreground">{value}</h3>
    </div>
  );
}

export function AgendaAppointmentRow({ appt, todayStr, onClick }: { appt: Appointment, todayStr: string, onClick: () => void }) {
  const status = getAppointmentStatus(appt, todayStr);
  const { hour, period } = displayTime(appt.time);
  
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-10 rounded-3xl border border-border/30 p-8 text-left transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 bg-background active:scale-[0.99] ${status.muted ? 'opacity-50 hover:opacity-100' : ''}`}
    >
      {/* Time */}
      <div className="min-w-[80px] text-center border-r border-border/30 pr-10">
        <p className="text-2xl font-black tracking-tight leading-none tabular-nums text-foreground">{hour}</p>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{period}</p>
      </div>
      {/* Details */}
      <div className="min-w-0 flex-1">
        <h5 className="truncate text-lg font-black tracking-tight leading-none transition-colors text-foreground">
          {appt.clientNameSnapshot || appt.title || 'Client'}
        </h5>
        <p className="mt-2 truncate text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {cleanServiceLabel(appt.serviceName) || 'Consultation'} · {appt.duration || '60 MIN'}
        </p>
      </div>
      {/* Badge */}
      <div className="flex items-center gap-6">
        <span 
          className={`shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${status.className}`}
        >
          {status.label}
        </span>
        <ChevronRight size={20} strokeWidth={2} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-[-8px] group-hover:translate-x-0" />
      </div>
    </button>
  );
}

export function NoteCard({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-3xl border border-border/30 p-6 text-left transition-all duration-700 hover:shadow-lg hover:-translate-y-1 group active:scale-[0.98] bg-secondary/50"
    >
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">{formatDayLabel(appt.date)}</p>
      <h6 className="truncate text-[15px] font-black tracking-tight text-foreground" >{appt.clientNameSnapshot || appt.title || 'Client'}</h6>
      <p className="mt-2 line-clamp-3 text-[13px] font-bold leading-relaxed text-muted-foreground italic" >
        &ldquo;{appt.notes?.trim()}&rdquo;
      </p>
    </button>
  );
}
