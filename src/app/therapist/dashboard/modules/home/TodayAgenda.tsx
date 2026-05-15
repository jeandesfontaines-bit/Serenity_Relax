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
    <div className="rounded-[28px] border border-[#e2e9f3] bg-white p-6 shadow-[0_10px_30px_rgba(23,43,77,0.04)] xl:min-h-[380px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[1.05rem] font-semibold tracking-tight text-slate-900">Agenda du jour</h4>
          <p className="mt-1 text-sm text-slate-500">
            {todayAppts.length > 0
              ? `${todayAppts.length} rendez-vous aujourd'hui.`
              : "Vous n'avez aucun rendez-vous aujourd'hui."}
          </p>
        </div>
        <button
          onClick={() => onNavigate('scheduler')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 group"
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
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dbe4f0] bg-[#f8fbff]">
            <Clock size={34} strokeWidth={1.2} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              {normalizedSearch ? 'Aucun résultat' : "Aucune séance aujourd'hui"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
