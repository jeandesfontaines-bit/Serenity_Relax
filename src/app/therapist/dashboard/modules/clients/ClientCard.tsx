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
      className="group flex flex-col rounded-[3rem] border p-10 text-left transition-all duration-700 hover:shadow-xl bg-background"
      style={{
        borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        boxShadow: isSelected ? '0 20px 40px -10px hsl(var(--primary) / 0.15)' : ''
      }}
    >
      <div className="mb-10 flex items-start justify-end">
        <Checkbox checked={isSelected} onChange={onToggle} />
      </div>

      <div className="space-y-2 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/60">PATIENT</p>
        <h3 className="text-3xl font-black tracking-tight leading-none truncate transition-all text-foreground">
          {summary.fullName}
        </h3>
        <p className="text-sm font-medium truncate text-muted-foreground">{client.email || 'Aucun email'}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 border-t border-border/30 pt-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">SÉANCES</p>
          <p className="text-3xl font-black tracking-tight text-foreground">{summary.sessionsCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">DERNIER SOIN</p>
          <p className="text-sm font-bold tracking-tight text-foreground">{summary.lastVisitLabel}</p>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <div className="flex h-10 w-10 items-center justify-center transition-colors text-muted-foreground/50 group-hover:text-foreground">
          <ChevronRight size={20} strokeWidth={1.25} />
        </div>
      </div>
    </div>
  );
}
