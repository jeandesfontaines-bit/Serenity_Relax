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
    <div className="dashboard-panel-lg p-6 xl:min-h-[380px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="dashboard-title">Agenda du jour</h4>
          <p className="dashboard-muted-text mt-1">
            {todayAppts.length > 0
              ? `${todayAppts.length} rendez-vous aujourd'hui.`
              : "Vous n'avez aucun rendez-vous aujourd'hui."}
          </p>
        </div>
        <button
          onClick={() => onNavigate('scheduler')}
          className="dashboard-body group flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          Voir tout <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="mt-6 space-y-3">
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
          <div className="dashboard-empty-state flex min-h-[250px] flex-col items-center justify-center">
            <Clock size={34} strokeWidth={1.2} className="mb-3 text-muted-foreground/35" />
            <p className="dashboard-body">
              {normalizedSearch ? 'Aucun résultat' : "Aucune séance aujourd'hui"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
