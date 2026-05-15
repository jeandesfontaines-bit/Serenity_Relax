import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SidebarRevenueProps {
  revenue: number;
}

export default function SidebarRevenue({ revenue }: SidebarRevenueProps) {
  return (
    <div className="p-5 border-t border-border bg-primary text-primary-foreground">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium tracking-[0.05em] text-primary-foreground/60">
          Revenus estimés
        </p>
        <TrendingUp size={14} className="text-primary-foreground/40" strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold tracking-tight flex items-baseline gap-1.5">
        {revenue.toLocaleString()} <span className="text-xs font-medium tracking-[0.05em] text-primary-foreground/50">CHF</span>
      </p>
    </div>
  );
}
