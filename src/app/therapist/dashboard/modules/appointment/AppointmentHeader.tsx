import React from 'react';
import { ArrowLeft, Trash2, X } from 'lucide-react';

interface AppointmentHeaderProps {
  onClose: () => void;
  onCancel: () => void;
  title: string;
  eyebrow: string;
}

export default function AppointmentHeader({
  onClose,
  onCancel,
  title,
  eyebrow,
}: AppointmentHeaderProps) {
  return (
    <div className="flex items-center justify-between px-16 py-12 border-b border-border">
      <div className="flex items-center gap-10">
        <button 
          onClick={onClose} 
          className="w-16 h-16 flex items-center justify-center rounded-full transition-all shadow-sm border border-border group bg-background text-muted-foreground"
        >
          <ArrowLeft size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <p className="dashboard-eyebrow mb-2">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold tracking-tight leading-none text-foreground">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={onCancel}
          className="h-14 px-10 rounded-full transition-all text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-sm border bg-destructive/10 text-destructive border-destructive/20"
        >
          <Trash2 size={16} strokeWidth={2.5} />
          ANNULER LE RDV
        </button>
        <button 
          onClick={onClose} 
          className="w-14 h-14 flex items-center justify-center rounded-full hover:scale-105 transition-transform shadow-xl bg-primary text-primary-foreground"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
