import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

interface SelectionToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
}

export default function SelectionToolbar({ selectedCount, onDelete, onCancel }: SelectionToolbarProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
      animate={{ height: 80, opacity: 1, marginBottom: 32 }}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      className="flex items-center justify-between overflow-hidden rounded-[2.5rem] p-6 text-white shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.3)] shrink-0 bg-primary"
    >
      <div className="flex items-center gap-8 ml-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">SÉLECTION</span>
        <p className="text-xl font-black tracking-tight">
          {selectedCount} Patient{selectedCount > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onDelete}
          className="flex h-11 items-center gap-3 rounded-full px-6 text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_8px_16px_-6px_hsl(var(--destructive)/0.5)] bg-destructive text-destructive-foreground hover:brightness-110 active:scale-95"
        >
          <Trash2 size={14} strokeWidth={2} /> SUPPRIMER
        </button>
        <button
          onClick={onCancel}
          className="flex h-11 items-center gap-3 rounded-full bg-white/10 px-6 text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/20 active:scale-95"
        >
          <X size={14} strokeWidth={2} /> ANNULER
        </button>

      </div>
    </motion.div>
  );
}
