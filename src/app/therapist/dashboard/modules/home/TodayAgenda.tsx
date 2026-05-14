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
    <div className="space-y-5 lg:col-span-2">
      <div
        className="flex items-end justify-between pb-4 border-b"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            PROGRAMMATION DU JOUR
          </p>
          <h4 className="text-xl font-bold tracking-tight leading-none" style={{ color: 'hsl(var(--foreground))' }}>Agenda</h4>
        </div>
        <button
          onClick={() => onNavigate('scheduler')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] transition-all group hover:text-foreground"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          VOIR TOUT <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
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
          <div
            className="py-24 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <Clock size={40} strokeWidth={1.2} className="mb-4 text-muted-foreground" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              {normalizedSearch ? 'AUCUN RÉSULTAT' : "AUCUNE SÉANCE AUJOURD'HUI"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
