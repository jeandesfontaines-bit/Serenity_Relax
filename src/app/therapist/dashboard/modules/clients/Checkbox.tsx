import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="flex h-7 w-7 items-center justify-center rounded-md border-2 transition-all"
      style={checked
        ? { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
        : { background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'transparent' }
      }
    >
      <ShieldCheck size={14} strokeWidth={3} className={checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} />
    </button>
  );
}
