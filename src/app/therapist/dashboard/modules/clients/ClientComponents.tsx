import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

export function ClientSidebarRow({ value }: { value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="dashboard-body-strong leading-none">{value}</div>
    </div>
  );
}

export function ConfirmedAppointmentCard({ appt, variant, onClick }: { appt: Appointment, variant: 'dark' | 'light', onClick: () => void }) {
  const isDark = variant === 'dark';
  
  return (
    <button 
      onClick={onClick}
      className={`rounded-2xl p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] group relative overflow-hidden border ${
        isDark 
          ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
          : "bg-background text-foreground border-border"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className={`dashboard-meta-strong flex items-center gap-3 ${
          isDark ? 'text-white/60' : 'text-muted-foreground'
        }`}>
          <Clock size={14} strokeWidth={2.5} />
          <span>{appt.time || '10:00'} — {appt.endTime || '11:00'}</span>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all group-hover:scale-110 ${
          isDark ? 'bg-white/10 text-white' : 'bg-secondary text-muted-foreground'
        }`}>
          <ArrowRight size={16} strokeWidth={3} />
        </div>
      </div>
      
      <h4 className={`dashboard-section-title-lg mb-4 leading-none ${isDark ? 'text-white' : 'text-foreground'}`}>
        {cleanServiceLabel(appt.serviceName) || 'Soin Holistique'}
      </h4>
      
      <div className="flex items-center gap-4">
        <span className={`dashboard-status-chip rounded-md px-3 py-1 ${
          isDark ? "bg-white text-primary" : "bg-primary text-primary-foreground"
        }`}>
          Confirmé
        </span>
        <span className={`dashboard-meta-strong ${
          isDark ? 'text-white/40' : 'text-muted-foreground'
        }`}>
           {appt.duration || '60 min'}
        </span>
      </div>
    </button>
  );
}

export function AppointmentHistoryRow({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  const dateObj = appt.date ? parseISO(appt.date) : new Date();
  const day = format(dateObj, 'd');
  const month = format(dateObj, 'MMM', { locale: fr });

  return (
    <button 
      onClick={onClick}
      className="w-full rounded-2xl p-4 flex items-center gap-6 transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden border bg-background border-border"
    >
      <div className="flex w-12 flex-col items-center justify-center border-r border-border pr-6 transition-colors">
        <span className="dashboard-section-title-lg leading-none text-foreground">{day}</span>
        <span className="dashboard-calendar-label mt-1">{month}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <h4 className="dashboard-body-strong truncate leading-none transition-all">
          {cleanServiceLabel(appt.serviceName) || 'Soin Signature'}
        </h4>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
             <Clock size={12} strokeWidth={2.5} className="text-muted-foreground" />
             <p className="dashboard-meta">
               {appt.time || '09:00'} - {appt.endTime || '10:00'}
             </p>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <p className="dashboard-meta">
             {appt.duration || '45 min'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={`dashboard-status-chip rounded-md shadow-sm transition-all ${
          appt.paid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-secondary border-border text-muted-foreground'
        }`}>
          {appt.paid ? 'Payé' : 'En attente'}
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:scale-110 transition-all text-muted-foreground">
          <ArrowRight size={18} strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}

export function InlineEditableField({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  return editing ? (
    <input
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKey}
      placeholder={label}
      className={`dashboard-edit-value w-full border-b border-primary bg-transparent pb-1 outline-none placeholder:font-normal placeholder:text-muted-foreground/60 ${className}`}
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`dashboard-edit-value cursor-text ${className}`}
    >
      {value || <span className="font-normal text-muted-foreground/60">{label}</span>}
    </div>
  );
}
