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
    <div className="rounded-[2rem] p-8 flex items-center gap-8 relative overflow-hidden shadow-xl group border border-white/5 bg-primary text-primary-foreground">
      <div className="rounded-2xl w-28 h-28 flex flex-col items-center justify-center shadow-xl group-hover:rotate-3 group-hover:scale-105 transition-all duration-700 bg-background text-foreground">
        <span className="text-4xl font-bold tracking-tight leading-none">{dayNum}</span>
        <span className="text-[10px] font-bold tracking-[0.05em] mt-2 text-muted-foreground">{monthStr}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-3xl font-bold tracking-tight leading-none mb-3">
          {current.clientNameSnapshot || 'Client'}
        </h3>
        <div className="flex items-center gap-6">
          <div className="px-6 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
            <p className="text-[11px] font-bold tracking-[0.05em]">
              {fullDateLabel}
            </p>
          </div>
          <div className="flex items-center gap-3 opacity-40">
            <Clock size={16} strokeWidth={2.5} />
            <p className="text-[11px] font-bold tracking-[0.05em]">
              {current.time || '--:--'} — {current.endTime || '--:--'}
            </p>
          </div>
        </div>
      </div>
      {!current.paid && (
        <div className="absolute top-12 right-12 bg-orange-100 text-orange-800 px-8 py-3 rounded-full shadow-2xl">
          <span className="text-[10px] font-bold tracking-[0.05em]">À régler</span>
        </div>
      )}
    </div>
  );
}
