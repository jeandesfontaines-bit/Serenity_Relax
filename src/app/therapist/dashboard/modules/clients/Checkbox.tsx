import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
        checked 
          ? 'bg-primary border-primary text-primary-foreground' 
          : 'bg-background border-border text-transparent hover:border-muted-foreground'
      }`}
    >
      <Check size={12} strokeWidth={3} className={`transition-all ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
    </button>
  );
}
