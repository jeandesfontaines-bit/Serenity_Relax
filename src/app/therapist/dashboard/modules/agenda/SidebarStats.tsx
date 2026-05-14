import React from 'react';

interface SidebarStatsProps {
  count: number;
}

export default function SidebarStats({ count }: SidebarStatsProps) {
  return (
    <div className="p-8 border-b border-border/40 bg-secondary/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-110" />
      
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6 relative">
        Aujourd'hui
      </h3>
      
      <div className="flex items-baseline gap-3 relative">
        <p className="text-6xl font-black tracking-tighter text-foreground tabular-nums leading-none">
          {count}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-1">
          Séances
        </p>
      </div>
    </div>
  );
}
