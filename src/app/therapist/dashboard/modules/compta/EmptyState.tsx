import React from 'react';
import { Search } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="py-24 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed" style={{ borderColor: 'hsl(var(--border))' }}>
      <Search size={40} strokeWidth={1.2} className="mb-5" style={{ color: 'hsl(var(--muted-foreground))' }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'hsl(var(--muted-foreground))' }}>AUCUNE TRANSACTION TROUVÉE</p>
    </div>
  );
}
