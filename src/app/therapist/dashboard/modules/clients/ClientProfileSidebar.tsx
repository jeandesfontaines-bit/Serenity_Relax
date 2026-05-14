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
    <aside className="space-y-12 sticky top-24">
      <div className="rounded-[4rem] p-12 border border-border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-12 bg-background">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="relative group">
            <div className="w-48 h-48 rounded-[3.5rem] flex items-center justify-center text-6xl font-bold text-white shadow-2xl transform group-hover:rotate-3 transition-all duration-700 bg-primary">
              {clientInitials}
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border border-border bg-background text-muted-foreground">
              <User size={24} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-x-2 text-4xl font-bold tracking-tighter leading-none text-foreground">
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
            <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              <InlineEditableField 
                label="Email" 
                value={editData.email || ''} 
                onChange={(val) => onUpdateClient(client.id, { email: val })} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-10 pt-12 border-t border-border">
          <ClientSidebarRow 
            icon={<Phone size={20} strokeWidth={2.5} />} 
            label="CONTACT"
            value={
              <InlineEditableField 
                label="Téléphone" 
                value={editData.phone || ''} 
                onChange={(val) => onUpdateClient(client.id, { phone: val })} 
              />
            } 
          />
          <ClientSidebarRow 
            icon={<MapPin size={20} strokeWidth={2.5} />} 
            label="ADRESSE"
            value={
              <div className="space-y-2">
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
            icon={<ShieldCheck size={20} strokeWidth={2.5} />} 
            label="ASSURANCE"
            value={
              <InlineEditableField 
                label="Assurance" 
                value={editData.insurance || ''} 
                onChange={(val) => onUpdateClient(client.id, { insurance: val })} 
              />
            } 
          />
        </div>

        <div className="pt-10">
          <button className="w-full flex items-center justify-center gap-4 h-16 rounded-full border-2 border-border text-[10px] font-bold uppercase tracking-[0.28em] transition-all group text-foreground">
            <FileText size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" /> ARCHIVES FINANCIÈRES
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-6">
         <div className="rounded-[3rem] p-10 shadow-2xl space-y-2 group hover:-translate-y-1 transition-transform bg-primary text-primary-foreground">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">TOTAL</p>
            <p className="text-5xl font-bold tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left">{clientAppts.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-45">SÉANCES</p>
         </div>
         <div className={`rounded-[3rem] p-10 shadow-xl space-y-2 group hover:-translate-y-1 transition-transform ${unpaidCount > 0 ? "bg-destructive text-destructive-foreground" : "bg-background border border-border text-foreground"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${unpaidCount > 0 ? 'opacity-45' : 'text-muted-foreground'}`}>OUVERTES</p>
            <p className="text-5xl font-bold tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left">{unpaidCount}</p>
            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${unpaidCount > 0 ? 'opacity-45' : 'text-muted-foreground'}`}>FACTURES</p>
         </div>
      </div>
    </aside>
  );
}
