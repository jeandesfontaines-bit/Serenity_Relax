import React from 'react';
import { Check, Filter, List } from 'lucide-react';
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
      className="absolute right-0 top-0 z-20 w-[300px] rounded-xl border p-5 shadow-lg bg-card border-border"
    >
      <div className="space-y-6">
        <section>
          <p className="dashboard-table-header-cell flex items-center gap-2 pb-3">
            <Filter size={14} strokeWidth={1.5} /> Minimum de séances
          </p>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max="20" 
              value={filters.minSessions || 0}
              onChange={(e) => onFiltersChange({ ...filters, minSessions: parseInt(e.target.value) || null })}
              className="flex-1 accent-primary"
            />
            <span className="dashboard-body-strong w-6 tabular-nums text-foreground">{filters.minSessions || 0}+</span>
          </div>
        </section>

        {/* Columns Section */}
        <section>
          <p className="dashboard-table-header-cell flex items-center gap-2 pb-3">
            <List size={14} strokeWidth={1.5} /> Colonnes affichées
          </p>
          <div className="max-h-[200px] overflow-y-auto space-y-0.5">
            {ALL_COLUMNS.map((column) => {
              const active = visibleColumnIds.has(column.id);
              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => onToggleColumn(column.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent group"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      active ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-transparent group-hover:border-muted-foreground'
                    }`}
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className={`dashboard-meta-strong ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {column.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-border pt-3">
          <button 
            onClick={() => onFiltersChange({ minSessions: null, lastVisitWithinDays: null })}
            className="dashboard-body w-full rounded-lg py-2 transition-colors hover:bg-accent hover:text-foreground"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
