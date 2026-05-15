import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Appointment } from '../../types';
import { NoteCard } from './HomeComponents';

interface RecentNotesProps {
  progressNotes: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
}

export function RecentNotes({
  progressNotes,
  onSelectAppt,
  onNavigate,
  onEditGoal,
}: RecentNotesProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.05em] text-muted-foreground mb-0.5">Archives</p>
            <h4 className="text-lg font-semibold tracking-tight text-foreground">Notes</h4>
          </div>
          <button
            onClick={onEditGoal}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border transition-colors bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
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
            <div className="py-12 text-center border border-dashed rounded-lg border-border">
              <p className="text-xs font-medium tracking-[0.05em] text-muted-foreground">Aucune note récente</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('clients')}
          className="w-full h-9 flex items-center justify-center rounded-lg border border-border text-xs font-medium tracking-[0.05em] transition-all duration-200 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
        >
          Répertoire patients
        </button>
      </div>
    </div>
  );
}
