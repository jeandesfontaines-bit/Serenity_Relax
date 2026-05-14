import React from 'react';
import { ChevronRight } from 'lucide-react';
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
      className="grid w-full items-center border-b px-8 py-8 text-left transition-all duration-700 group last:border-b-0 cursor-pointer border-border/30 hover:bg-slate-50/80 active:scale-[0.995]"
      style={{
        gridTemplateColumns: gridTemplate,
        background: isSelected ? 'hsl(var(--primary)/0.05)' : 'transparent'
      }}
    >
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onChange={() => onToggleSelection(client.id)} 
        />
      </div>
      {visibleColumnIds.has('firstName') && (
        <div className="min-w-0 pr-8 text-sm font-black tracking-tight text-foreground">
          {client.firstName || '—'}
        </div>
      )}
      {visibleColumnIds.has('lastName') && (
        <div className="min-w-0 pr-8 text-sm font-black tracking-tight text-foreground">
          {client.lastName || '—'}
        </div>
      )}
      {visibleColumnIds.has('email') && (
        <div className="min-w-0 pr-8 text-[13px] font-medium text-muted-foreground/80">
          {client.email || '—'}
        </div>
      )}
      {visibleColumnIds.has('phone') && (
        <div className="min-w-0 pr-8 text-[13px] font-medium text-muted-foreground/80">
          {client.phone || '—'}
        </div>
      )}
      {visibleColumnIds.has('zip') && (
        <div className="text-[13px] font-medium text-muted-foreground/80">
          {client.zip || '—'}
        </div>
      )}
      {visibleColumnIds.has('city') && (
        <div className="min-w-0 pr-8 text-[13px] font-medium text-muted-foreground/80">
          {client.city || '—'}
        </div>
      )}
      {visibleColumnIds.has('lastVisit') && (
        <div className="text-[13px] font-bold tracking-tight text-muted-foreground">
          {summary.lastVisitLabel}
        </div>
      )}
      {visibleColumnIds.has('preferredRitual') && (
        <div className="pr-8 text-[13px] font-medium text-muted-foreground/80">
          {summary.preferredRitual}
        </div>
      )}
      {visibleColumnIds.has('sessions') && (
        <div className="flex justify-center text-lg font-black tracking-tight text-foreground tabular-nums">
          {summary.sessionsCount}
        </div>
      )}
      <div className="flex justify-end text-muted-foreground opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1">
        <ChevronRight size={18} strokeWidth={1.25} />
      </div>
    </div>
  );
}
