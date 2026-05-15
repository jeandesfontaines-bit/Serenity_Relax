import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Appointment } from '../../types';
import { NoteCard } from './HomeComponents';

interface RecentNotesProps {
  progressNotes: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
  monthlyGoal: number;
  paidThisMonth: number;
  monthlyProgress: number;
}

export function RecentNotes({
  progressNotes,
  onSelectAppt,
  onNavigate,
  onEditGoal,
  monthlyGoal,
  paidThisMonth,
  monthlyProgress,
}: RecentNotesProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#e2e9f3] bg-white p-6 shadow-[0_10px_30px_rgba(23,43,77,0.04)] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[1.05rem] font-semibold tracking-tight text-slate-900">Notes récentes</h4>
          </div>
          <button
            onClick={onEditGoal}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <BarChart3 size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-2">
          {progressNotes.length > 0 ? (
            progressNotes.map((appt) => (
              <NoteCard 
                key={appt.id} 
                appt={appt} 
                onClick={() => onSelectAppt(appt)} 
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dbe4f0] bg-[#f8fbff] py-12 text-center">
              <p className="text-sm font-medium text-slate-500">Aucune note récente.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('clients')}
          className="flex h-9 w-full items-center justify-center rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100"
        >
          Répertoire patients
        </button>
      </div>

      <div className="rounded-[28px] bg-primary p-6 text-primary-foreground shadow-[0_18px_40px_rgba(37,99,235,0.26)]">
        <h4 className="text-[1.05rem] font-semibold tracking-tight">Objectif mensuel</h4>
        <p className="mt-2 text-sm text-primary-foreground/80">
          {paidThisMonth.toLocaleString('fr-CH')} CHF sur {monthlyGoal.toLocaleString('fr-CH')} CHF.
        </p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${monthlyProgress}%` }} />
        </div>
        <button
          onClick={onEditGoal}
          className="mt-5 flex h-10 w-full items-center justify-center rounded-2xl bg-white text-sm font-medium text-primary transition-colors hover:bg-white/90"
        >
          Ajuster l'objectif
        </button>
      </div>
    </div>
  );
}
