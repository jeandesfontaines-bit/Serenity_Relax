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
    <div className="flex items-center justify-between px-8 py-6 border-b border-border">
      <div className="flex items-center gap-10">
        <button 
          onClick={onClose} 
          className="dashboard-icon-button group h-10 w-10 rounded-xl"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <p className="dashboard-eyebrow mb-1">
            {eyebrow}
          </p>
          <h2 className="dashboard-title-lg leading-none">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={onCancel}
          className="dashboard-action-button-danger gap-3 px-6"
        >
          <Trash2 size={14} strokeWidth={2.5} />
          Annuler le rdv
        </button>
        <button 
          onClick={onClose} 
          className="dashboard-action-button-primary h-10 w-10 rounded-xl px-0 hover:scale-105"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
