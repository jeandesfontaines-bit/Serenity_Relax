import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

interface SelectionToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
}

export function SelectionToolbar({ selectedCount, onDelete, onClear }: SelectionToolbarProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
      animate={{ height: 80, opacity: 1, marginBottom: 32 }}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      className="shrink-0 overflow-hidden rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl" 
      style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
    >
      <div className="flex items-center gap-8 ml-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">ACTIONS GROUPÉES</span>
        <p className="text-xl font-bold tracking-tight">
          {selectedCount} Transaction{selectedCount > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onDelete}
          className="h-12 px-8 flex items-center gap-3 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg"
          style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          <Trash2 size={14} strokeWidth={2.5} /> SUPPRIMER
        </button>
        <button
          onClick={onClear}
          className="h-12 px-8 flex items-center gap-3 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
        >
          <X size={14} strokeWidth={2.5} /> ANNULER
        </button>
      </div>
    </motion.div>
  );
}
