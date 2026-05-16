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
      className={`dashboard-checkbox ${
        checked 
          ? 'dashboard-checkbox-checked' 
          : 'text-transparent'
      }`}
    >
      <Check size={12} strokeWidth={3} className={`transition-all ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
    </button>
  );
}
