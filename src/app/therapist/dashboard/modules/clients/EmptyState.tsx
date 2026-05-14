import React from 'react';
import { Search } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed py-48 group border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.1)] transition-all duration-700">
       <Search size={48} strokeWidth={1} className="mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 text-[hsl(var(--muted-foreground)/0.5)]" />
       <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground)/0.7)]">
         Aucun résultat correspondant
       </p>
    </div>
  );
}
