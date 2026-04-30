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
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-xl shadow-xl overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Gestion du créneau</h2>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">
              {format(d, 'EEEE d MMMM', { locale: fr })} · {time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3">
          {/* Book slot */}
          {!isBlocked ? (
            <button
              onClick={onBook}
              className="w-full flex items-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <UserPlus size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Réserver une session</p>
                <p className="text-xs text-emerald-200">Nouveau ou ancien client</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-100 border border-slate-200 rounded-xl">
              <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                <Lock size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Créneau bloqué</p>
                <p className="text-xs text-slate-500">Non disponible à la réservation</p>
              </div>
            </div>
          )}

          {/* Block / unblock */}
          <button
            onClick={onToggleBlock}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
              isBlocked
                ? 'bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isBlocked ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              {isBlocked
                ? <CheckCircle2 size={16} className="text-emerald-600" />
                : <Lock size={16} className="text-slate-500" />}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isBlocked ? 'Libérer le créneau' : 'Bloquer le créneau'}
              </p>
              <p className="text-xs text-slate-500">
                {isBlocked ? 'Rendre à nouveau disponible' : 'Empêcher toute réservation'}
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
            <Clock size={12} />
            Durée standard : 60 min
          </div>
        </div>
      </div>
    </div>
  );
}
