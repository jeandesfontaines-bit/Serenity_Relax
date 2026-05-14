import React from 'react';
import { Calendar } from 'lucide-react';
import { Appointment } from '../../types';
import { ConfirmedAppointmentCard, AppointmentHistoryRow } from './ClientComponents';

interface ClientAppointmentsProps {
  confirmedAppts: Appointment[];
  completedAppts: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
}

export function ClientAppointments({
  confirmedAppts,
  completedAppts,
  onSelectAppt,
}: ClientAppointmentsProps) {
  return (
    <div className="space-y-32">
      {/* Prochains Rendez-vous */}
      <section className="space-y-12">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div>
            <h3 className="text-5xl font-bold tracking-tighter leading-none text-foreground">Prochaines Séances</h3>
            <p className="dashboard-eyebrow mt-4">PLANIFICATION ACTIVE</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {confirmedAppts.length > 0 ? (
            confirmedAppts.map((appt, i) => (
              <ConfirmedAppointmentCard 
                key={appt.id} 
                appt={appt} 
                variant={i === 0 ? 'dark' : 'light'} 
                onClick={() => onSelectAppt(appt)} 
              />
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center rounded-[4rem] border-2 border-dashed border-border group bg-secondary">
              <Calendar size={64} strokeWidth={1.25} className="mb-8 group-hover:scale-110 transition-transform duration-700 text-muted-foreground" />
              <p className="font-bold text-[12px] uppercase tracking-[0.32em] text-muted-foreground">Aucune planification en cours</p>
            </div>
          )}
        </div>
      </section>

      {/* Historique Chronologique */}
      <section className="space-y-12">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div>
            <h3 className="text-5xl font-bold tracking-tighter leading-none text-foreground">Historique Complet</h3>
            <p className="dashboard-eyebrow mt-4">CHRONOLOGIE DES SOINS</p>
          </div>
        </div>
        <div className="space-y-6">
          {completedAppts.length > 0 ? (
            completedAppts.map((appt) => (
              <AppointmentHistoryRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} />
            ))
          ) : (
            <div className="py-20 px-12 rounded-[3rem] border border-border bg-secondary">
              <p className="font-bold text-xl tracking-tighter text-foreground">Nouveau patient sans historique enregistré.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
