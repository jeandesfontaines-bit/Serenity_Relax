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
      className={`group flex cursor-pointer flex-col rounded-[28px] border bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(23,43,77,0.08)] ${
        isSelected ? 'border-primary shadow-[0_10px_30px_rgba(37,99,235,0.12)]' : 'border-[#e2e9f3] shadow-[0_10px_30px_rgba(23,43,77,0.04)]'
      }`}
    >
      <div className="mb-6 flex items-start justify-end">
        <Checkbox checked={isSelected} onChange={onToggle} />
      </div>

      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f0ff] text-2xl font-bold text-primary">
          {(client.firstName?.[0] || summary.fullName?.[0] || '?').toUpperCase()}
          {(client.lastName?.[0] || '').toUpperCase()}
        </div>
        <h3 className="max-w-full truncate text-[1.15rem] font-semibold tracking-tight text-slate-900">
          {summary.fullName}
        </h3>
        <p className="mt-1 truncate text-sm text-slate-500">{client.email || 'Aucun email'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-[#edf2f7] pt-4">
        <div className="space-y-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Dernier soin</p>
          <p className="text-sm font-medium text-slate-900">{summary.lastVisitLabel}</p>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Séances</p>
          <p className="text-sm font-medium text-slate-900">{summary.sessionsCount}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <ChevronRight size={16} strokeWidth={1.5} className="text-slate-300 opacity-0 transition-opacity group-hover:opacity-70" />
      </div>
    </div>
  );
}
