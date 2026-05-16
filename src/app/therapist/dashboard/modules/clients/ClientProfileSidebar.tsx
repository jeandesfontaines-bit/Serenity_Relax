import React from 'react';
import { FileText } from 'lucide-react';
import { Client, Appointment } from '../../types';
import { ClientSidebarRow, InlineEditableField } from './ClientComponents';

interface ClientProfileSidebarProps {
  client: Client;
  editData: Partial<Client>;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
  clientAppts: Appointment[];
  unpaidCount: number;
  onOpenUnpaidInvoices: () => void;
}

function splitStreetAndNumber(address: string): { street: string; number: string } {
  const value = address.trim();
  if (!value) return { street: '', number: '' };

  const startsWithNumber = value.match(/^(\d+[A-Za-z\-\/]*)\s+(.+)$/);
  if (startsWithNumber) {
    return {
      number: startsWithNumber[1].trim(),
      street: startsWithNumber[2].trim(),
    };
  }

  const endsWithNumber = value.match(/^(.+?)\s+(\d+[A-Za-z\-\/]*)$/);
  if (endsWithNumber) {
    return {
      street: endsWithNumber[1].trim(),
      number: endsWithNumber[2].trim(),
    };
  }

  return { street: value, number: '' };
}

export function ClientProfileSidebar({
  client,
  editData,
  onUpdateClient,
  clientAppts,
  unpaidCount,
  onOpenUnpaidInvoices,
}: ClientProfileSidebarProps) {
  const rawAddressStreet = editData.addressStreet || editData.street || '';
  const addressPostalCode = editData.addressPostalCode || editData.zip || '';
  const addressCanton = editData.addressCanton || editData.canton || '';
  const notes = editData.therapistNotes || editData.notes || '';
  const { street, number } = splitStreetAndNumber(rawAddressStreet);

  const updateStreetParts = (next: { street?: string; number?: string }) => {
    const nextStreet = next.street ?? street;
    const nextNumber = next.number ?? number;
    const combined = [nextStreet.trim(), nextNumber.trim()].filter(Boolean).join(' ').trim();
    onUpdateClient(client.id, { addressStreet: combined, street: combined });
  };

  return (
    <aside className="sticky top-24 space-y-4">
      <div className="dashboard-panel space-y-6 rounded-2xl p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InlineEditableField
            label="Prénom"
            value={editData.firstName || ''}
            onChange={(val) => onUpdateClient(client.id, { firstName: val })}
          />
          <InlineEditableField
            label="Nom"
            value={editData.lastName || ''}
            onChange={(val) => onUpdateClient(client.id, { lastName: val })}
          />
          <div className="md:col-span-2">
            <InlineEditableField
              label="Adresse e-mail"
              value={editData.email || ''}
              onChange={(val) => onUpdateClient(client.id, { email: val })}
              type="email"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border/60 pt-6">
          <ClientSidebarRow 
            value={
              <InlineEditableField 
                label="Téléphone" 
                value={editData.phone || ''} 
                onChange={(val) => onUpdateClient(client.id, { phone: val })} 
              />
            } 
          />
          <ClientSidebarRow 
            value={
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.7fr_0.7fr]">
                  <InlineEditableField 
                    label="Rue" 
                    value={street} 
                    onChange={(val) => updateStreetParts({ street: val })} 
                  />
                  <InlineEditableField 
                    label="Numéro" 
                    value={number} 
                    onChange={(val) => updateStreetParts({ number: val })} 
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InlineEditableField 
                    label="Code postal" 
                    value={addressPostalCode} 
                    onChange={(val) => onUpdateClient(client.id, { addressPostalCode: val, zip: val })} 
                  />
                  <InlineEditableField 
                    label="Canton" 
                    value={addressCanton} 
                    onChange={(val) => onUpdateClient(client.id, { addressCanton: val, canton: val })} 
                  />
                </div>
              </div>
            } 
          />
          <ClientSidebarRow 
            value={
              <InlineEditableField 
                label="Assurance" 
                value={editData.insurance || ''} 
                onChange={(val) => onUpdateClient(client.id, { insurance: val })} 
              />
            } 
          />
          <ClientSidebarRow
            value={
              <InlineEditableField
                label="Notes thérapeute"
                value={notes}
                onChange={(val) => onUpdateClient(client.id, { therapistNotes: val, notes: val })}
              />
            } 
          />
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={onOpenUnpaidInvoices}
            className="dashboard-secondary-button group h-12 w-full justify-center gap-3 rounded-2xl"
          >
            <FileText size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" /> Factures ouvertes
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-3">
         <div className="rounded-2xl p-4 shadow-sm space-y-1 group hover:-translate-y-1 transition-transform bg-primary text-primary-foreground">
            <p className="dashboard-metric-label opacity-40">Total</p>
            <p className="dashboard-metric-value origin-left text-primary-foreground transition-transform group-hover:scale-110">{clientAppts.length}</p>
            <p className="dashboard-metric-label opacity-45">Séances</p>
         </div>
         <button
            type="button"
            onClick={onOpenUnpaidInvoices}
            className={`rounded-2xl p-4 shadow-sm space-y-1 group hover:-translate-y-1 transition-transform text-left ${unpaidCount > 0 ? "bg-destructive text-destructive-foreground" : "bg-background border border-border text-foreground"}`}
         >
            <p className={`dashboard-metric-label ${unpaidCount > 0 ? 'opacity-45' : 'text-muted-foreground/70'}`}>Ouvertes</p>
            <p className="dashboard-metric-value origin-left transition-transform group-hover:scale-110">{unpaidCount}</p>
            <p className={`dashboard-metric-label ${unpaidCount > 0 ? 'opacity-45' : 'text-muted-foreground/70'}`}>Factures</p>
         </button>
      </div>
    </aside>
  );
}
