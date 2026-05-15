import React from 'react';
import { User, Phone, MapPin, ShieldCheck, FileText } from 'lucide-react';
import { Client, Appointment } from '../../types';
import { ClientSidebarRow, InlineEditableField } from './ClientComponents';

interface ClientProfileSidebarProps {
  client: Client;
  editData: Partial<Client>;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
  clientAppts: Appointment[];
  unpaidCount: number;
}

export function ClientProfileSidebar({
  client,
  editData,
  onUpdateClient,
  clientAppts,
  unpaidCount,
}: ClientProfileSidebarProps) {
  const clientInitials = (client.initials || `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}` || 'CL').slice(0, 2).toUpperCase();

  return (
    <aside className="space-y-4 sticky top-24">
      <div className="rounded-2xl p-5 border border-border shadow-sm space-y-6 bg-background">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg transform group-hover:rotate-3 transition-all duration-700 bg-primary">
              {clientInitials}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-border bg-background text-muted-foreground">
              <User size={14} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex flex-wrap justify-center gap-x-2 text-xl font-bold tracking-tighter leading-none text-foreground">
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
            </div>
            <div className="text-[11px] font-medium tracking-[0.05em] text-muted-foreground">
              <InlineEditableField 
                label="Email" 
                value={editData.email || ''} 
                onChange={(val) => onUpdateClient(client.id, { email: val })} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-border">
          <ClientSidebarRow 
            icon={<Phone size={14} strokeWidth={2.5} />} 
            label="Contact"
            value={
              <InlineEditableField 
                label="Téléphone" 
                value={editData.phone || ''} 
                onChange={(val) => onUpdateClient(client.id, { phone: val })} 
              />
            } 
          />
          <ClientSidebarRow 
            icon={<MapPin size={14} strokeWidth={2.5} />} 
            label="Adresse"
            value={
              <div className="space-y-1">
                <InlineEditableField 
                  label="Rue" 
                  value={editData.street || ''} 
                  onChange={(val) => onUpdateClient(client.id, { street: val })} 
                />
                <InlineEditableField 
                  label="Ville" 
                  value={editData.city || ''} 
                  onChange={(val) => onUpdateClient(client.id, { city: val })} 
                />
              </div>
            } 
          />
          <ClientSidebarRow 
            icon={<ShieldCheck size={14} strokeWidth={2.5} />} 
            label="Assurance"
            value={
              <InlineEditableField 
                label="Assurance" 
                value={editData.insurance || ''} 
                onChange={(val) => onUpdateClient(client.id, { insurance: val })} 
              />
            } 
          />
        </div>

        <div className="pt-4">
          <button className="w-full flex items-center justify-center gap-3 h-10 rounded-full border border-border text-[10px] font-bold tracking-[0.05em] transition-all group text-foreground hover:bg-secondary">
            <FileText size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" /> Archives financières
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-3">
         <div className="rounded-2xl p-4 shadow-sm space-y-1 group hover:-translate-y-1 transition-transform bg-primary text-primary-foreground">
            <p className="text-[9px] font-bold tracking-[0.05em] opacity-40 uppercase">Total</p>
            <p className="text-2xl font-bold tracking-tight leading-none group-hover:scale-110 transition-transform origin-left">{clientAppts.length}</p>
            <p className="text-[9px] font-bold tracking-[0.05em] opacity-45">Séances</p>
         </div>
         <div className={`rounded-2xl p-4 shadow-sm space-y-1 group hover:-translate-y-1 transition-transform ${unpaidCount > 0 ? "bg-destructive text-destructive-foreground" : "bg-background border border-border text-foreground"}`}>
            <p className={`text-[9px] font-bold tracking-[0.05em] uppercase ${unpaidCount > 0 ? 'opacity-45' : 'text-muted-foreground'}`}>Ouvertes</p>
            <p className="text-2xl font-bold tracking-tight leading-none group-hover:scale-110 transition-transform origin-left">{unpaidCount}</p>
            <p className={`text-[9px] font-bold tracking-[0.05em] ${unpaidCount > 0 ? 'opacity-45' : 'text-muted-foreground'}`}>Factures</p>
         </div>
      </div>
    </aside>
  );
}
