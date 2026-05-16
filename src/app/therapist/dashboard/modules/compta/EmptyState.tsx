import React from 'react';
import { Search } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="py-20 flex flex-col items-center justify-center rounded-xl border border-dashed border-border">
      <Search size={32} strokeWidth={1.2} className="mb-3 text-muted-foreground/40" />
      <p className="dashboard-body">Aucune transaction trouvée</p>
    </div>
  );
}
