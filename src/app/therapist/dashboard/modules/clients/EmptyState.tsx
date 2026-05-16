import React from 'react';
import { Search } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 border-border">
       <Search size={36} strokeWidth={1.2} className="mb-4 text-muted-foreground/40" />
       <p className="dashboard-body">
         Aucun résultat correspondant
       </p>
    </div>
  );
}
