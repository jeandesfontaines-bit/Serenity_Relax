import React from 'react';
import { X, UserPlus, Lock, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SlotManagementProps {
  date: string;
  time: string;
  isBlocked: boolean;
  onClose: () => void;
  onBook: () => void;
  onToggleBlock: () => void;
}

export default function SlotManagement({
  date, time, isBlocked, onClose, onBook, onToggleBlock,
}: SlotManagementProps) {
  const d = new Date(date);

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-m">
      <div className="absolute inset-0 bg-sapphire/30 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full sm:max-w-xs bg-white rounded-t-card sm:rounded-card shadow-2xl overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-s pb-xs">
          <div className="w-l h-xxs bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-m py-m border-b border-border">
          <div>
            <h2 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Gestion du créneau</h2>
            <p className="font-heading text-[10px] font-bold text-samaritan mt-xxs uppercase tracking-widest">
              {format(d, 'EEEE d MMMM', { locale: fr })} · {time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-l h-l flex items-center justify-center rounded-md hover:bg-bg-soft text-samaritan hover:text-sapphire transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-m space-y-xs">
          {/* Book slot */}
          {!isBlocked ? (
            <button
              onClick={onBook}
              className="w-full flex items-center gap-m p-m bg-azraq hover:bg-azraq/90 rounded-md transition-all text-left shadow-lg shadow-azraq/10"
            >
              <div className="w-xl h-xl bg-white/10 rounded-md flex items-center justify-center shrink-0">
                <UserPlus size={17} className="text-white" />
              </div>
              <div>
                <p className="font-heading text-small font-black text-white uppercase tracking-widest leading-tight">Réserver</p>
                <p className="font-heading text-[9px] font-bold text-white/50 uppercase tracking-widest mt-xxs">Nouveau ou existant</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-m p-m bg-bg-soft border border-border rounded-md">
              <div className="w-xl h-xl bg-white border border-border rounded-md flex items-center justify-center shrink-0">
                <Lock size={16} className="text-samaritan/30" />
              </div>
              <div>
                <p className="font-heading text-small font-black text-samaritan/50 uppercase tracking-widest leading-tight">Créneau bloqué</p>
                <p className="font-heading text-[9px] font-bold text-samaritan/30 uppercase tracking-widest mt-xxs">Indisponible</p>
              </div>
            </div>
          )}

          {/* Block / unblock */}
          <button
            onClick={onToggleBlock}
            className={`w-full flex items-center gap-m p-m rounded-md border transition-all text-left ${
              isBlocked
                ? 'bg-aurora/10 border-aurora/10 text-aurora shadow-lg shadow-aurora/5'
                : 'bg-white border-border hover:bg-bg-soft text-sapphire'
            }`}
          >
            <div className={`w-xl h-xl rounded-md flex items-center justify-center shrink-0 ${
              isBlocked ? 'bg-white border border-aurora/10' : 'bg-bg-soft'
            }`}>
              {isBlocked
                ? <CheckCircle2 size={16} className="text-aurora" />
                : <Lock size={16} className="text-samaritan" />}
            </div>
            <div>
              <p className="font-heading text-small font-black uppercase tracking-widest leading-tight">
                {isBlocked ? 'Libérer' : 'Indisponible'}
              </p>
              <p className={`font-heading text-[9px] font-bold uppercase tracking-widest mt-xxs ${isBlocked ? 'text-aurora/60' : 'text-samaritan'}`}>
                {isBlocked ? 'Rendre à nouveau disponible' : 'Empêcher la réservation'}
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-m pb-m">
          <div className="flex items-center gap-xs font-heading text-[9px] font-black text-samaritan uppercase tracking-widest bg-bg-soft border border-border rounded-md px-m py-xs">
            <Clock size={12} />
            Durée : 60 min
          </div>
        </div>
      </div>
    </div>
  );
}
