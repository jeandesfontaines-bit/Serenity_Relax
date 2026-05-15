import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Client } from '../../types';
import { ClientSummary } from './constants';
import Checkbox from './Checkbox';

interface ClientCardProps {
  client: Client;
  summary: ClientSummary;
  isSelected: boolean;
  onSelect: (c: Client) => void;
  onToggle: () => void;
}

export default function ClientCard({ client, summary, isSelected, onSelect, onToggle }: ClientCardProps) {
  return (
    <div
      onClick={() => onSelect(client)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(client);
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex flex-col rounded-xl border p-6 text-left transition-all duration-200 bg-card hover:shadow-md cursor-pointer ${
        isSelected ? 'border-primary shadow-sm' : 'border-border'
      }`}
    >
      <div className="mb-5 flex items-start justify-end">
        <Checkbox checked={isSelected} onChange={onToggle} />
      </div>

      <div className="space-y-1 mb-5">
        <p className="text-xs font-medium text-muted-foreground tracking-[0.05em]">Patient</p>
        <h3 className="text-xl font-bold tracking-tight leading-tight truncate text-foreground">
          {summary.fullName}
        </h3>
        <p className="text-sm truncate text-muted-foreground">{client.email || 'Aucun email'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground tracking-[0.05em]">Séances</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{summary.sessionsCount}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground tracking-[0.05em]">Dernier soin</p>
          <p className="text-sm font-semibold tracking-tight text-foreground">{summary.lastVisitLabel}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>
    </div>
  );
}
