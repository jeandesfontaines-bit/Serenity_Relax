import React from 'react';
import { ShieldCheck, CreditCard, Filter, List, Wallet } from 'lucide-react';
import { TransactionFilters, PaymentMethod, TransactionStatus } from './types';
import { STATUS_META } from './constants';

interface FilterPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const FilterPanel = ({ 
  filters,
  onFiltersChange,
  dropdownRef 
}: FilterPanelProps) => {
  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-0 z-20 w-[320px] rounded-[2rem] border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-[hsl(var(--background))] border-[hsl(var(--border))]"
    >
      <div className="space-y-8">
        {/* Status Section */}
        <section>
          <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] flex items-center gap-2">
            <ShieldCheck size={12} /> Statut transaction
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'completed', 'pending', 'late', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onFiltersChange({ ...filters, status: s })}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  filters.status === s 
                    ? 'bg-[hsl(var(--primary))] text-white border-transparent shadow-lg' 
                    : 'bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'
                }`}
              >
                {s === 'all' ? 'Toutes' : STATUS_META[s as TransactionStatus].label}
              </button>
            ))}
          </div>
        </section>

        {/* Payment Method Section */}
        <section>
          <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] flex items-center gap-2">
            <Wallet size={12} /> Mode de paiement
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'Twint', 'Card', 'Cash'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onFiltersChange({ ...filters, paymentMethod: m })}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  filters.paymentMethod === m 
                    ? 'bg-[hsl(var(--primary))] text-white border-transparent shadow-lg' 
                    : 'bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'
                }`}
              >
                {m === 'all' ? 'Tous' : m}
              </button>
            ))}
          </div>
        </section>

        {/* Min Amount Section */}
        <section>
          <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] flex items-center gap-2">
            <Filter size={12} /> Montant minimum
          </p>
          <div className="flex items-center gap-3 px-2">
            <input 
              type="range" 
              min="0" 
              max="1000" 
              step="50"
              value={filters.minAmount || 0}
              onChange={(e) => onFiltersChange({ ...filters, minAmount: parseInt(e.target.value) || null })}
              className="flex-1 accent-[hsl(var(--primary))]"
            />
            <span className="text-xs font-bold w-12 text-right">{filters.minAmount || 0} CHF</span>
          </div>
        </section>

        <div className="pt-2 border-t border-[hsl(var(--border))]">
          <button 
            onClick={() => onFiltersChange({ status: 'all', paymentMethod: 'all', minAmount: null })}
            className="w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
};
