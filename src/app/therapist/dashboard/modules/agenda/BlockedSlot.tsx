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
      className="absolute left-2 right-2 z-[2] rounded-lg border border-border flex items-center justify-center cursor-pointer transition-all duration-200 bg-muted/30 hover:bg-muted/50"
      style={{ top: getTop(time) + 2, height: getHeight(DEFAULT_DURATION) - 4 }}
    >
      <div className="flex items-center gap-1.5">
        <Lock size={11} strokeWidth={1.5} className="text-muted-foreground/50" />
        <span className="text-[10px] font-medium text-muted-foreground/50">Bloqué</span>
      </div>
    </div>
  );
}
