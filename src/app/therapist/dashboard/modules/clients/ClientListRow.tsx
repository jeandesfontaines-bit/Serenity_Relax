import React from 'react';
import { MoreHorizontal } from 'lucide-react';
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

      {visibleColumnIds.has('firstName') && (
        <div className="dashboard-table-cell-strong min-w-0 truncate pr-4">
          {client.firstName || '—'}
        </div>
      )}

      {visibleColumnIds.has('lastName') && (
        <div className="dashboard-table-cell-strong min-w-0 truncate pr-4">
          {client.lastName || '—'}
        </div>
      )}

      {visibleColumnIds.has('lastVisit') && (
        <div className="dashboard-table-cell">
          {summary.lastVisitLabel}
        </div>
      )}

      {visibleColumnIds.has('sessions') && (
        <div className="dashboard-table-cell-strong flex justify-center tabular-nums">
          {summary.sessionsCount}
        </div>
      )}

      {visibleColumnIds.has('email') && (
        <div className="dashboard-table-cell min-w-0 truncate pr-4">
          {client.email || '—'}
        </div>
      )}

      {visibleColumnIds.has('phone') && (
        <div className="dashboard-table-cell min-w-0 pr-4">
          {client.phone || '—'}
        </div>
      )}

      {visibleColumnIds.has('addressStreet') && (
        <div className="dashboard-table-cell min-w-0 truncate pr-4">
          {summary.addressStreet || '—'}
        </div>
      )}

      {visibleColumnIds.has('addressPostalCode') && (
        <div className="dashboard-table-cell min-w-0 pr-4">
          {summary.addressPostalCode || '—'}
        </div>
      )}

      {visibleColumnIds.has('addressCity') && (
        <div className="dashboard-table-cell min-w-0 truncate pr-4">
          {summary.addressCity || '—'}
        </div>
      )}

      <div className="flex justify-end pr-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground">
        <MoreHorizontal size={16} />
      </div>
    </div>
  );
}
