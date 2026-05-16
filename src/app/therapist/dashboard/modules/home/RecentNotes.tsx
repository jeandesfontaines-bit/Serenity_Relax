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
      <div className="dashboard-panel-lg space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="dashboard-title">Notes récentes</h4>
          </div>
          <button
            onClick={onEditGoal}
            className="dashboard-icon-button h-9 w-9 rounded-xl"
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
            <div className="dashboard-empty-state py-12">
              <p className="dashboard-body">Aucune note récente.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('clients')}
          className="dashboard-secondary-button h-9 w-full rounded-xl px-4"
        >
          Répertoire patients
        </button>
      </div>

      <div className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground shadow-[0_18px_40px_rgba(37,99,235,0.26)]">
        <h4 className="dashboard-title text-primary-foreground">Objectif mensuel</h4>
        <p className="dashboard-body mt-2 text-primary-foreground/80">
          {paidThisMonth.toLocaleString('fr-CH')} CHF sur {monthlyGoal.toLocaleString('fr-CH')} CHF.
        </p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${monthlyProgress}%` }} />
        </div>
        <button
          onClick={onEditGoal}
          className="dashboard-secondary-button mt-5 h-10 w-full rounded-2xl border-white bg-white px-4 text-primary hover:bg-white/90"
        >
          Ajuster l'objectif
        </button>
      </div>
    </div>
  );
}
