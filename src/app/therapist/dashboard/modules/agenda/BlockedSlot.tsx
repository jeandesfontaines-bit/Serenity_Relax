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
      className="absolute left-2 right-2 z-[2] flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#d8e1ee] bg-[#f8fbff] transition-all duration-200 hover:bg-[#f1f6fc]"
      style={{ top: getTop(time) + 4, height: getHeight(DEFAULT_DURATION) - 8 }}
    >
      <div className="flex items-center gap-1.5">
        <Lock size={11} strokeWidth={1.5} className="text-slate-400" />
        <span className="text-[10px] font-medium text-slate-400">Bloqué</span>
      </div>
    </div>
  );
}
