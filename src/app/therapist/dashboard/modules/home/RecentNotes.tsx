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
    <div className="space-y-6">
      <div
        className="rounded-3xl border p-8 shadow-sm space-y-8 bg-background border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5 text-muted-foreground">ARCHIVES</p>
            <h4 className="text-2xl font-bold tracking-tight text-foreground">Notes</h4>
          </div>
          <button
            onClick={onEditGoal}
            className="w-11 h-11 flex items-center justify-center rounded-full border transition-all bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary"
          >
            <BarChart3 size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-3">
          {progressNotes.length > 0 ? (
            progressNotes.map((appt) => (
              <NoteCard 
                key={appt.id} 
                appt={appt} 
                onClick={() => onSelectAppt(appt)} 
              />
            ))
          ) : (
            <div className="py-16 text-center border-2 border-dashed rounded-2xl border-border">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted-foreground">AUCUNE NOTE RÉCENTE</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('clients')}
          className="w-full h-12 flex items-center justify-center rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
        >
          RÉPERTOIRE PATIENTS
        </button>
      </div>
    </div>
  );
}
