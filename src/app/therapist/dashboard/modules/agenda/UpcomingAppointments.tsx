import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
      <p className="text-xs font-medium tracking-[0.05em] text-muted-foreground">
        Prochains patients
      </p>
      
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.slice(0, 10).map(a => (
            <div key={a.id} className="group cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium tracking-[0.05em] w-10 shrink-0 text-muted-foreground/60 pt-0.5 tabular-nums">
                  {a.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                    {a.clientNameSnapshot || a.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cleanServiceLabel(a.serviceName) || cleanServiceLabel(a.title) || 'Séance'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Clock size={18} className="text-muted-foreground/40" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-medium tracking-[0.05em] text-muted-foreground">
            Calendrier vide
          </p>
        </div>
      )}
    </div>
  );
}
