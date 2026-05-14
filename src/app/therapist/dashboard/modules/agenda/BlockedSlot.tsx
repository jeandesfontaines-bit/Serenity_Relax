import React from 'react';
import { Lock } from 'lucide-react';
import { getTop, getHeight, DEFAULT_DURATION } from './constants';

interface BlockedSlotProps {
  time: string;
  onClick: () => void;
}

export default function BlockedSlot({ time, onClick }: BlockedSlotProps) {
  return (
    <div
      onClick={onClick}
      className="absolute left-4 right-4 z-[2] rounded-3xl border border-border/50 flex items-center justify-center cursor-pointer transition-all duration-700 shadow-sm bg-secondary/10 backdrop-blur-sm hover:bg-secondary/20 hover:scale-[0.98]"
      style={{ top: getTop(time) + 4, height: getHeight(DEFAULT_DURATION) - 8 }}
    >
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/20 shadow-inner">
        <Lock size={12} strokeWidth={1.5} className="text-muted-foreground/40" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Bloqué</span>
      </div>
    </div>
  );
}
