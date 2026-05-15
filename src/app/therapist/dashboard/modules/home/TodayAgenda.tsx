import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Appointment } from '../../types';
import { AgendaAppointmentRow } from './HomeComponents';

interface TodayAgendaProps {
  todayAppts: Appointment[];
  todayStr: string;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  normalizedSearch: string;
}

export function TodayAgenda({
  todayAppts,
  todayStr,
  onSelectAppt,
  onNavigate,
  normalizedSearch,
}: TodayAgendaProps) {
  return (
    <div className="space-y-4 lg:col-span-2">
      <div className="flex items-end justify-between pb-3 border-b border-border">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            Programmation du jour
          </p>
          <h4 className="text-lg font-semibold tracking-tight leading-none text-foreground">Agenda</h4>
        </div>
        <button
          onClick={() => onNavigate('scheduler')}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          Voir tout <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-2">
        {todayAppts.length > 0 ? (
          todayAppts.slice(0, 5).map((appt) => (
            <AgendaAppointmentRow 
              key={appt.id} 
              appt={appt} 
              todayStr={todayStr} 
              onClick={() => onSelectAppt(appt)} 
            />
          ))
        ) : (
          <div className="py-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border">
            <Clock size={32} strokeWidth={1.2} className="mb-3 text-muted-foreground/50" />
            <p className="text-xs font-medium text-muted-foreground">
              {normalizedSearch ? 'Aucun résultat' : "Aucune séance aujourd'hui"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
