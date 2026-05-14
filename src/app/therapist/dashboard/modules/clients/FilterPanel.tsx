import React from 'react';
import { ShieldCheck, UserCheck, UserMinus, Filter, List } from 'lucide-react';
import { ALL_COLUMNS, ClientFilters } from './constants';

interface FilterPanelProps {
  visibleColumnIds: Set<string>;
  onToggleColumn: (id: string) => void;
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function FilterPanel({ 
  visibleColumnIds, 
  onToggleColumn, 
  filters,
  onFiltersChange,
  dropdownRef 
}: FilterPanelProps) {
  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-0 z-20 w-[320px] rounded-[3rem] border p-8 shadow-2xl bg-background border-border/50"
    >
      <div className="space-y-10">
        {/* Status Section */}
        <section>
          <p className="px-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
            <UserCheck size={12} strokeWidth={2} /> Statut patient
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onFiltersChange({ ...filters, status: s })}
                className={`px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                  filters.status === s 
                    ? 'bg-primary text-primary-foreground border-transparent shadow-[0_8px_16px_-6px_hsl(var(--primary)/0.4)] scale-105' 
                    : 'bg-transparent text-muted-foreground/80 border-border/50 hover:bg-slate-50/80 hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Inactifs'}
              </button>
            ))}
          </div>
        </section>

        {/* Sessions Section */}
        <section>
          <p className="px-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
            <Filter size={12} strokeWidth={2} /> Minimum de séances
          </p>
          <div className="flex items-center gap-4 px-2">
            <input 
              type="range" 
              min="0" 
              max="20" 
              value={filters.minSessions || 0}
              onChange={(e) => onFiltersChange({ ...filters, minSessions: parseInt(e.target.value) || null })}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-black text-foreground w-6 tabular-nums">{filters.minSessions || 0}+</span>
          </div>
        </section>

        {/* Columns Section */}
        <section>
          <p className="px-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
            <List size={12} strokeWidth={2} /> Colonnes affichées
          </p>
          <div className="max-h-[240px] overflow-y-auto scrollbar-hide space-y-1 pr-2">
            {ALL_COLUMNS.map((column) => {
              const active = visibleColumnIds.has(column.id);
              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => onToggleColumn(column.id)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-300 hover:bg-slate-50/80 group"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-all duration-300 ${
                      active ? 'bg-primary border-transparent text-primary-foreground' : 'border-border/50 text-transparent group-hover:border-border'
                    }`}
                  >
                    <ShieldCheck size={11} strokeWidth={3} />
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-transform duration-300 group-hover:translate-x-1 ${active ? 'text-foreground' : 'text-muted-foreground/80'}`}>
                    {column.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="pt-2">
          <button 
            onClick={() => onFiltersChange({ status: 'all', minSessions: null, lastVisitWithinDays: null })}
            className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground hover:bg-slate-50/50 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
