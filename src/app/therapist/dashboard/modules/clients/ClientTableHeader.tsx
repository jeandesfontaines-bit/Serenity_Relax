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
      className="grid items-center border-b px-4 pb-3 border-border"
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
          className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center gap-1.5 text-muted-foreground/80 hover:text-foreground ${col.align === 'center' ? 'justify-center' : ''}`}
        >
          {col.label}
          {sortField === col.id && <ArrowUpDown size={10} strokeWidth={2} className="text-primary" />}
        </button>
      ))}
      <div className="flex justify-end pr-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
        Actions
      </div>
    </div>
  );
}
