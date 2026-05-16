import React from 'react';
import { HOURS, START_HOUR, HOUR_H } from './constants';

export default function TimeLabels() {
  return (
    <div className="relative border-r border-border/60 bg-secondary/20">
      {HOURS.map(h => (
        <div
          key={h}
          className="dashboard-meta absolute right-4 -translate-y-1/2 tabular-nums text-muted-foreground/70"
          style={{ top: (h - START_HOUR) * HOUR_H }}
        >
          {String(h).padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
}
