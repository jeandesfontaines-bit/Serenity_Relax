import React from 'react';
import { HOURS, START_HOUR, HOUR_H } from './constants';

export default function TimeLabels() {
  return (
    <div className="border-r border-border relative">
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute right-3 text-[10px] font-medium tracking-[0.05em] -translate-y-1/2 text-muted-foreground/40 tabular-nums"
          style={{ top: (h - START_HOUR) * HOUR_H }}
        >
          {String(h).padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
}
