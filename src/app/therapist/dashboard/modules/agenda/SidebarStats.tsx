import React from 'react';

interface SidebarStatsProps {
  count: number;
}

export default function SidebarStats({ count }: SidebarStatsProps) {
  return (
    <div className="p-5 border-b border-border">
      <p className="text-xs font-medium tracking-[0.05em] text-muted-foreground mb-2">
        Aujourd&apos;hui
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-bold tracking-tight text-foreground tabular-nums leading-none">
          {count}
        </p>
        <p className="text-xs font-medium tracking-[0.05em] text-primary/70">
          séances
        </p>
      </div>
    </div>
  );
}
