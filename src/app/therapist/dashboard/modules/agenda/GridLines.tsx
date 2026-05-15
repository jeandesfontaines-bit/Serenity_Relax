import React from 'react';
import { HOURS, START_HOUR, HOUR_H } from './constants';

export default function GridLines() {
  return (
    <>
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-border/50"
          style={{ top: (h - START_HOUR) * HOUR_H }}
        />
      ))}
    </>
  );
}
