import React from 'react';
import { Check, ArrowUpDown } from 'lucide-react';
import { SortField } from './types';

export function TableCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`h-5 w-5 flex items-center justify-center rounded border transition-all ${
        checked ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-transparent hover:border-muted-foreground'
      }`}
    >
      <Check size={12} strokeWidth={3} className={checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} />
    </button>
  );
}

interface HeaderBtnProps {
  label: string;
  field: SortField;
  current: SortField;
  onSort: (f: SortField) => void;
  align?: 'left' | 'right';
}

export function HeaderBtn({ label, field, current, onSort, align = 'left' }: HeaderBtnProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSort(field); }}
      className={`text-xs font-medium tracking-[0.05em] transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground ${align === 'right' ? 'justify-end w-full' : ''}`}
    >
      {label}
      {current === field && <ArrowUpDown size={10} strokeWidth={2} />}
    </button>
  );
}
