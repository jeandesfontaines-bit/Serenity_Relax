import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { SortField } from './types';

export function TableCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`h-6 w-6 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
        checked ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent border-border/50 text-transparent'
      }`}
    >
      <ShieldCheck size={12} strokeWidth={2.5} className={checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} />
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
      className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground ${align === 'right' ? 'justify-end w-full' : ''}`}
    >
      {label}
      {current === field && <ArrowRight size={10} strokeWidth={2.5} className="rotate-90" />}
    </button>

  );
}
