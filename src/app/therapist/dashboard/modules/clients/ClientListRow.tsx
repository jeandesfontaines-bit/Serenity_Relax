import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Client } from '../../types';
import { ClientSummary } from './constants';
import Checkbox from './Checkbox';

interface ClientListRowProps {
  client: Client;
  summary: ClientSummary;
  isSelected: boolean;
  visibleColumnIds: Set<string>;
  gridTemplate: string;
  onSelect: (client: Client) => void;
  onToggleSelection: (id: string) => void;
}

export default function ClientListRow({
  client,
  summary,
  isSelected,
  visibleColumnIds,
  gridTemplate,
  onSelect,
  onToggleSelection,
}: ClientListRowProps) {
  return (
    <div
      onClick={() => onSelect(client)}
      className={`grid w-full items-center border-b px-4 py-3 text-left transition-all duration-200 group last:border-b-0 cursor-pointer border-border hover:bg-accent/50 active:scale-[0.998] ${
        isSelected ? 'bg-primary/5' : ''
      }`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onChange={() => onToggleSelection(client.id)} 
        />
      </div>

      {visibleColumnIds.has('patient') && (
        <div className="flex min-w-0 items-center gap-3 pr-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {(client.firstName?.[0] || '') + (client.lastName?.[0] || '')}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-semibold text-foreground">
              {client.firstName} {client.lastName}
            </span>
            <span className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">
              {client.city || '—'}
            </span>
          </div>
        </div>
      )}

      {visibleColumnIds.has('status') && (
        <div className="flex items-center">
          {summary.sessionsCount < 2 ? (
            <div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
              Nouveau
            </div>
          ) : (
            <div className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary/60">
              Actif
            </div>
          )}
        </div>
      )}

      {visibleColumnIds.has('lastVisit') && (
        <div className="text-sm font-medium text-muted-foreground">
          {summary.lastVisitLabel}
        </div>
      )}

      {visibleColumnIds.has('sessions') && (
        <div className="flex justify-center text-sm font-bold text-foreground tabular-nums">
          {summary.sessionsCount}
        </div>
      )}

      {visibleColumnIds.has('email') && (
        <div className="min-w-0 pr-4 text-sm text-muted-foreground truncate">
          {client.email || '—'}
        </div>
      )}

      {visibleColumnIds.has('phone') && (
        <div className="min-w-0 pr-4 text-sm text-muted-foreground">
          {client.phone || '—'}
        </div>
      )}

      <div className="flex justify-end pr-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground">
        <MoreHorizontal size={16} />
      </div>
    </div>
  );
}
