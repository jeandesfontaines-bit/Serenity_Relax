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
      animate={{ height: 56, opacity: 1, marginBottom: 16 }}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      className="flex items-center justify-between overflow-hidden rounded-xl px-5 text-white shadow-md shrink-0 bg-primary"
    >
      <div className="flex items-center gap-4">
        <span className="dashboard-table-header-cell text-white/70">Sélection</span>
        <p className="dashboard-body-strong text-white">
          {selectedCount} Patient{selectedCount > 1 ? 's' : ''}
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
          onClick={onCancel}
          className="dashboard-meta-strong flex h-8 items-center gap-2 rounded-lg bg-white/10 px-4 text-white transition-all hover:bg-white/20 active:scale-95"
        >
          <X size={14} strokeWidth={1.5} /> Annuler
        </button>
      </div>
    </motion.div>
  );
}
