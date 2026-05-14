import React from 'react';
import { Store } from 'lucide-react';

interface SidebarRevenueProps {
  revenue: number;
}

export default function SidebarRevenue({ revenue }: SidebarRevenueProps) {
  return (
    <div className="p-8 border-t border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)] rounded-tr-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
        <Store size={40} className="text-white" strokeWidth={1} />
      </div>
      <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.5em] mb-4 relative z-10">
        REVENUS ESTIMÉS
      </h3>
      <p className="text-4xl font-black tracking-tighter text-white relative z-10 flex items-baseline gap-2">
        {revenue.toLocaleString()} <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">CHF</span>
      </p>
    </div>
  );
}
