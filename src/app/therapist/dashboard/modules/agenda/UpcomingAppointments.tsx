import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--muted-foreground)/0.6)]">
        Prochains Patients
      </h3>
      
      {appointments.length > 0 ? (
        <div className="space-y-8">
          {appointments.slice(0, 10).map(a => (
            <div key={a.id} className="group cursor-pointer">
              <div className="flex items-start gap-5">
                <span className="text-[10px] font-bold w-12 shrink-0 text-[hsl(var(--muted-foreground)/0.4)] pt-1 tabular-nums">
                  {a.time}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold truncate tracking-tight text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-all duration-300">
                    {a.clientNameSnapshot || a.title}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground)/0.4)] mt-1.5 transition-all duration-300 group-hover:text-[hsl(var(--muted-foreground)/0.7)]">
                    {cleanServiceLabel(a.serviceName) || cleanServiceLabel(a.title) || 'SÉANCE'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--muted)/0.5)] flex items-center justify-center mx-auto mb-6">
            <Clock size={20} className="text-[hsl(var(--muted-foreground)/0.3)]" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground)/0.4)]">
            Calendrier Vide
          </p>
        </div>
      )}
    </div>
  );
}
