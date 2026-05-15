import React from 'react';
import { Clock, ArrowRight, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

export function ClientSidebarRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-inner bg-secondary text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="dashboard-eyebrow mb-0.5">{label}</p>
        <div className="text-sm font-bold tracking-tight leading-none text-foreground truncate">{value}</div>
      </div>
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
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-3 text-[10px] font-bold tracking-[0.05em] ${
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
      
      <h4 className="text-xl font-bold tracking-tight leading-none mb-4">
        {cleanServiceLabel(appt.serviceName) || 'Soin Holistique'}
      </h4>
      
      <div className="flex items-center gap-4">
        <span className={`text-[8px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-md ${
          isDark ? "bg-white text-primary" : "bg-primary text-primary-foreground"
        }`}>
          Confirmé
        </span>
        <span className={`font-bold text-[10px] tracking-[0.05em] ${
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
      <div className="flex flex-col items-center justify-center w-12 border-r border-border pr-6 transition-colors">
        <span className="text-xl font-bold leading-none tracking-tight text-foreground">{day}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{month}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <h4 className="text-sm font-bold tracking-tight leading-none transition-all truncate">
          {cleanServiceLabel(appt.serviceName) || 'Soin Signature'}
        </h4>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
             <Clock size={12} strokeWidth={2.5} className="text-muted-foreground" />
             <p className="text-[10px] font-bold tracking-tight text-muted-foreground">
               {appt.time || '09:00'} - {appt.endTime || '10:00'}
             </p>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <p className="text-[10px] font-bold tracking-tight text-muted-foreground">
             {appt.duration || '45 min'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all border ${
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
