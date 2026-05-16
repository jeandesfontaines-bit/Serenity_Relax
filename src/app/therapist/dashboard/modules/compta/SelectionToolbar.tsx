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
      animate={{ height: 56, opacity: 1, marginBottom: 16 }}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      className="shrink-0 overflow-hidden rounded-xl px-5 flex items-center justify-between shadow-md bg-primary text-primary-foreground"
    >
      <div className="flex items-center gap-4">
        <span className="dashboard-table-header-cell text-primary-foreground/70">Actions groupées</span>
        <p className="dashboard-body-strong text-primary-foreground">
          {selectedCount} Transaction{selectedCount > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDelete}
          className="dashboard-meta-strong flex h-8 items-center gap-2 rounded-lg bg-destructive px-4 text-destructive-foreground transition-all hover:brightness-110 active:scale-95"
        >
          <Trash2 size={14} strokeWidth={1.5} /> Supprimer
        </button>
        <button
          onClick={onClear}
          className="dashboard-meta-strong flex h-8 items-center gap-2 rounded-lg bg-white/10 px-4 text-primary-foreground transition-all hover:bg-white/20 active:scale-95"
        >
          <X size={14} strokeWidth={1.5} /> Annuler
        </button>
      </div>
    </motion.div>
  );
}
