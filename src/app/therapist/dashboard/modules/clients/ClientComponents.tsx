import React from 'react';
import { Clock, ArrowRight, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

export function ClientSidebarRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-8 group">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl transition-all shadow-inner bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <p className="dashboard-eyebrow mb-2">{label}</p>
        <div className="text-lg font-bold tracking-tighter leading-none text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function ConfirmedAppointmentCard({ appt, variant, onClick }: { appt: Appointment, variant: 'dark' | 'light', onClick: () => void }) {
  const isDark = variant === 'dark';
  
  return (
    <button 
      onClick={onClick}
      className={`rounded-[4rem] p-12 text-left transition-all hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] group relative overflow-hidden border ${
        isDark 
          ? "bg-primary text-white border-transparent shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]" 
          : "bg-background text-foreground border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-20">
        <div className={`flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.24em] ${
          isDark ? 'text-white/50' : 'text-muted-foreground'
        }`}>
          <Clock size={18} strokeWidth={2.5} />
          <span>{appt.time || '10:00'} — {appt.endTime || '11:00'}</span>
        </div>
        <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-all group-hover:scale-110 ${
          isDark ? 'bg-white/10 text-white' : 'bg-secondary text-muted-foreground'
        }`}>
          <ArrowRight size={24} strokeWidth={3} />
        </div>
      </div>
      
      <h4 className="text-4xl font-bold tracking-tighter leading-none mb-10">
        {cleanServiceLabel(appt.serviceName) || 'Soin Holistique'}
      </h4>
      
      <div className="flex items-center gap-6">
        <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-8 py-3 rounded-full ${
          isDark ? "bg-white text-primary" : "bg-primary text-primary-foreground"
        }`}>
          CONFIRMÉ
        </span>
        <span className={`font-bold text-[12px] tracking-widest ${
          isDark ? 'text-white/40' : 'text-muted-foreground'
        }`}>
           {appt.duration || '60 MIN'}
        </span>
      </div>
    </button>
  );
}

export function AppointmentHistoryRow({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  const dateObj = appt.date ? parseISO(appt.date) : new Date();
  const day = format(dateObj, 'd');
  const month = format(dateObj, 'MMM', { locale: fr }).toUpperCase();

  return (
    <button 
      onClick={onClick}
      className="w-full rounded-[3rem] p-10 flex items-center gap-12 transition-all group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-1 relative overflow-hidden border bg-background border-border"
    >
      <div className="flex flex-col items-center justify-center w-24 h-24 border-r border-border pr-12 transition-colors">
        <span className="text-4xl font-bold leading-none tracking-tighter text-foreground">{day}</span>
        <span className="dashboard-eyebrow mt-3">{month}</span>
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-3xl font-bold tracking-tighter leading-none transition-all">
          {cleanServiceLabel(appt.serviceName) || 'Soin Signature'}
        </h4>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-3">
             <Clock size={14} strokeWidth={2.5} className="text-muted-foreground" />
             <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
               {appt.time || '09:00'} - {appt.endTime || '10:00'}
             </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
             {appt.duration || '45 MIN'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm transition-all border ${
          appt.paid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-secondary border-border text-muted-foreground'
        }`}>
          {appt.paid ? 'PAYÉ' : 'EN ATTENTE'}
        </div>
        <div className="w-14 h-14 flex items-center justify-center rounded-full group-hover:scale-110 transition-all text-muted-foreground">
          <ArrowRight size={28} strokeWidth={3} />
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
      ref={inputRef}
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKey}
      placeholder={label}
      className="w-full bg-transparent outline-none border-b-4 border-primary transition-all py-1 font-bold text-foreground"
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className="cursor-text rounded-xl px-2 -mx-2 transition-all flex items-center group/edit hover:bg-secondary bg-transparent"
    >
      <span className="truncate">{value || <span className="font-normal text-muted-foreground">{label}</span>}</span>
      <Edit3 size={14} className="ml-3 opacity-0 group-hover/edit:opacity-100 transition-opacity text-muted-foreground" />
    </div>
  );
}
