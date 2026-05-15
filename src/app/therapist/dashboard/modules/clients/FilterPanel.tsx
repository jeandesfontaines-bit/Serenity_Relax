import React from 'react';
import { Check, UserCheck, Filter, List } from 'lucide-react';
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
        {/* Status Section */}
        <section>
          <p className="pb-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
            <UserCheck size={14} strokeWidth={1.5} /> Statut patient
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onFiltersChange({ ...filters, status: s })}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  filters.status === s 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Inactifs'}
              </button>
            ))}
          </div>
        </section>

        {/* Sessions Section */}
        <section>
          <p className="pb-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
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
            <span className="text-sm font-bold text-foreground w-6 tabular-nums">{filters.minSessions || 0}+</span>
          </div>
        </section>

        {/* Columns Section */}
        <section>
          <p className="pb-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
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
                  <span className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {column.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-border pt-3">
          <button 
            onClick={() => onFiltersChange({ status: 'all', minSessions: null, lastVisitWithinDays: null })}
            className="w-full py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
