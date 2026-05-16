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
    <div className="space-y-12">
      {/* Prochains Rendez-vous */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="dashboard-section-title-lg">Prochaines Séances</h3>
            <p className="dashboard-eyebrow mt-1">Planification active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="dashboard-empty-state col-span-full flex flex-col items-center justify-center rounded-2xl py-16 group">
              <Calendar size={32} strokeWidth={1.5} className="mb-4 group-hover:scale-110 transition-transform duration-700 text-muted-foreground/40" />
              <p className="dashboard-table-header-cell text-muted-foreground/60">Aucune planification en cours</p>
            </div>
          )}
        </div>
      </section>

      {/* Historique Chronologique */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="dashboard-section-title-lg">Historique Complet</h3>
            <p className="dashboard-eyebrow mt-1">Chronologie des soins</p>
          </div>
        </div>
        <div className="space-y-3">
          {completedAppts.length > 0 ? (
            completedAppts.map((appt) => (
              <AppointmentHistoryRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} />
            ))
          ) : (
            <div className="dashboard-empty-state rounded-2xl px-8 py-12">
              <p className="dashboard-body-strong text-foreground/70">Nouveau patient sans historique enregistré.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
