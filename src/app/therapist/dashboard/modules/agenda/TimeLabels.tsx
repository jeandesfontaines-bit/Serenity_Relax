import React from 'react';
import { HOURS, START_HOUR, HOUR_H } from './constants';

export default function TimeLabels() {
  return (
    <div className="border-r border-[hsl(var(--border))] relative bg-[hsl(var(--secondary)/0.05)]">
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute right-6 text-[9px] font-bold -translate-y-1/2 uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground)/0.4)] tabular-nums"
          style={{ top: (h - START_HOUR) * HOUR_H }}
        >
          {String(h).padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
}
