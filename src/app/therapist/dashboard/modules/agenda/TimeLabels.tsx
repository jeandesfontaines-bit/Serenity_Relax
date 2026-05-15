import React from 'react';
import { HOURS, START_HOUR, HOUR_H } from './constants';

export default function TimeLabels() {
  return (
    <div className="relative border-r border-[#edf2f7] bg-[#fbfdff]">
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute right-4 -translate-y-1/2 text-[11px] font-medium tracking-[0.02em] text-slate-400 tabular-nums"
          style={{ top: (h - START_HOUR) * HOUR_H }}
        >
          {String(h).padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
}
