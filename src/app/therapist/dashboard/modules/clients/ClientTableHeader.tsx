import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { ALL_COLUMNS, SortDir } from './constants';
import Checkbox from './Checkbox';

interface ClientTableHeaderProps {
  visibleColumns: typeof ALL_COLUMNS;
  sortField: string;
  sortDir: SortDir;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSort: (id: string) => void;
  gridTemplate: string;
}

export default function ClientTableHeader({
  visibleColumns,
  sortField,
  sortDir,
  allSelected,
  onToggleSelectAll,
  onToggleSort,
  gridTemplate,
}: ClientTableHeaderProps) {
  return (
    <div 
      className="grid items-center border-b px-8 pb-8 border-border/30"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex justify-center">
        <Checkbox
          checked={allSelected}
          onChange={onToggleSelectAll}
        />
      </div>
      {visibleColumns.map(col => (
        <button
          key={col.id}
          onClick={() => onToggleSort(col.id)}
          className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-2 text-muted-foreground/60 hover:text-foreground ${col.align === 'center' ? 'justify-center' : ''}`}
        >
          {col.label}
          {sortField === col.id && <ArrowUpDown size={10} strokeWidth={3} />}
        </button>
      ))}
      <div className="text-right text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">DÉTAILS</div>
    </div>
  );
}
