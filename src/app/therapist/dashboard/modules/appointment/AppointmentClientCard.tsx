import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentClientCardProps {
  current: Appointment;
  dayNum: string;
  monthStr: string;
  fullDateLabel: string;
}

export default function AppointmentClientCard({
  current,
  dayNum,
  monthStr,
  fullDateLabel,
}: AppointmentClientCardProps) {
  return (
    <div className="relative flex items-center gap-8 overflow-hidden rounded-[1.75rem] border border-primary/10 bg-primary p-8 text-primary-foreground shadow-xl">
      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl bg-background text-foreground shadow-xl transition-all duration-300 group-hover:scale-105">
        <span className="dashboard-metric-value text-foreground">{dayNum}</span>
        <span className="dashboard-calendar-label mt-2">{monthStr}</span>
      </div>
      <div className="flex-1">
        <h3 className="dashboard-title-lg mb-3 leading-none text-primary-foreground">
          {current.clientNameSnapshot || 'Client'}
        </h3>
        <div className="flex items-center gap-6">
          <div className="rounded-full border border-white/10 bg-white/10 px-6 py-2.5 backdrop-blur-md">
            <p className="dashboard-meta-strong text-primary-foreground">
              {fullDateLabel}
            </p>
          </div>
          <div className="flex items-center gap-3 opacity-40">
            <Clock size={16} strokeWidth={2.5} />
            <p className="dashboard-meta-strong text-primary-foreground">
              {current.time || '--:--'} — {current.endTime || '--:--'}
            </p>
          </div>
        </div>
      </div>
      {!current.paid && (
        <div className="absolute right-12 top-12 rounded-full bg-orange-100 px-8 py-3 text-orange-800 shadow-2xl">
          <span className="dashboard-meta-strong text-orange-800">À régler</span>
        </div>
      )}
    </div>
  );
}
