import React from 'react';
import { CreditCard, Filter, Wallet } from 'lucide-react';
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
      className="absolute right-0 top-0 z-20 w-[300px] rounded-xl border p-5 shadow-lg bg-card border-border"
    >
      <div className="space-y-6">
        {/* Status Section */}
        <section>
          <p className="dashboard-table-header-cell flex items-center gap-2 pb-3">
            <CreditCard size={14} strokeWidth={1.5} /> Statut transaction
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(['all', 'completed', 'pending', 'late', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onFiltersChange({ ...filters, status: s })}
                className={`dashboard-meta-strong rounded-lg border px-3 py-2 transition-all ${
                  filters.status === s 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'Toutes' : STATUS_META[s as TransactionStatus].label}
              </button>
            ))}
          </div>
        </section>

        {/* Payment Method Section */}
        <section>
          <p className="dashboard-table-header-cell flex items-center gap-2 pb-3">
            <Wallet size={14} strokeWidth={1.5} /> Mode de paiement
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(['all', 'Twint', 'Card', 'Cash'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onFiltersChange({ ...filters, paymentMethod: m })}
                className={`dashboard-meta-strong rounded-lg border px-3 py-2 transition-all ${
                  filters.paymentMethod === m 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                {m === 'all' ? 'Tous' : m}
              </button>
            ))}
          </div>
        </section>

        {/* Min Amount Section */}
        <section>
          <p className="dashboard-table-header-cell flex items-center gap-2 pb-3">
            <Filter size={14} strokeWidth={1.5} /> Montant minimum
          </p>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max="1000" 
              step="50"
              value={filters.minAmount || 0}
              onChange={(e) => onFiltersChange({ ...filters, minAmount: parseInt(e.target.value) || null })}
              className="flex-1 accent-primary"
            />
            <span className="dashboard-body-strong w-14 text-right tabular-nums">{filters.minAmount || 0} CHF</span>
          </div>
        </section>

        <div className="border-t border-border pt-3">
          <button 
            onClick={() => onFiltersChange({ status: 'all', paymentMethod: 'all', minAmount: null })}
            className="dashboard-body w-full rounded-lg py-2 transition-colors hover:bg-accent hover:text-foreground"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
};
