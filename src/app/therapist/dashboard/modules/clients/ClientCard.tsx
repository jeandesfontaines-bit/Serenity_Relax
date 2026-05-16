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
      className={`dashboard-panel-lg group flex cursor-pointer flex-col rounded-[1.25rem] p-5 text-left hover:-translate-y-0.5 ${
        isSelected ? 'border-primary shadow-sm shadow-primary/15' : ''
      }`}
    >
      <div className="mb-4 flex items-start justify-end">
        <Checkbox checked={isSelected} onChange={onToggle} />
      </div>

      <div className="mb-4 border-b border-border/60 pb-4">
        <h3 className="dashboard-section-title truncate">
          {summary.fullName || 'Client'}
        </h3>
        <p className="dashboard-body mt-1 truncate">
          {client.email || client.phone || 'Aucune coordonnée'}
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="dashboard-label">Prénom</p>
            <p className={`dashboard-body-strong mt-1 ${client.firstName ? 'text-foreground' : 'text-muted-foreground/65'}`}>{client.firstName || '—'}</p>
          </div>
          <div>
            <p className="dashboard-label">Nom</p>
            <p className={`dashboard-body-strong mt-1 ${client.lastName ? 'text-foreground' : 'text-muted-foreground/65'}`}>{client.lastName || '—'}</p>
          </div>
        </div>
        <div>
          <p className="dashboard-label">Email</p>
          <p className={`dashboard-body-strong mt-1 truncate ${client.email ? 'text-foreground' : 'text-muted-foreground/65'}`}>{client.email || '—'}</p>
        </div>
        <div>
          <p className="dashboard-label">Téléphone</p>
          <p className={`dashboard-body-strong mt-1 ${client.phone ? 'text-foreground' : 'text-muted-foreground/65'}`}>{client.phone || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
        <div className="dashboard-surface-soft rounded-[1rem] px-4 py-3">
          <p className="dashboard-label">Dernier soin</p>
          <p className="dashboard-body-strong mt-1 text-foreground">{summary.lastVisitLabel || '—'}</p>
        </div>
        <div className="dashboard-surface-soft rounded-[1rem] px-4 py-3">
          <p className="dashboard-label">Séances</p>
          <p className="dashboard-body-strong mt-1 text-foreground">{summary.sessionsCount}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-4">
        <div className="col-span-2">
          <p className="dashboard-label">Rue</p>
          <p className={`dashboard-body-strong mt-1 truncate ${summary.addressStreet ? 'text-foreground' : 'text-muted-foreground/65'}`}>{summary.addressStreet || '—'}</p>
        </div>
        <div>
          <p className="dashboard-label">Code postal</p>
          <p className={`dashboard-body-strong mt-1 ${summary.addressPostalCode ? 'text-foreground' : 'text-muted-foreground/65'}`}>{summary.addressPostalCode || '—'}</p>
        </div>
        <div>
          <p className="dashboard-label">Ville</p>
          <p className={`dashboard-body-strong mt-1 ${summary.addressCity ? 'text-foreground' : 'text-muted-foreground/65'}`}>{summary.addressCity || '—'}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-70" />
      </div>
    </div>
  );
}
