'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Plus, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, Client } from '../types';
import { ClientProfileSidebar } from './clients/ClientProfileSidebar';
import { ClientAppointments } from './clients/ClientAppointments';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
  onScheduleClient: (client: Client) => void;
}

export default function ClientDetail({
  client,
  onClose,
  appointments,
  onSelectAppt,
  onUpdateClient,
  onScheduleClient,
}: ClientDetailProps) {
  const [editData, setEditData] = useState<Partial<Client>>({ ...client });

  useEffect(() => {
    setEditData({ ...client });
  }, [client]);

  const clientAppts = useMemo(() =>
    [...appointments]
      .filter((appt) => appt.clientId === client.id || (client.firstName && appt.clientNameSnapshot === `${client.firstName} ${client.lastName}`))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [appointments, client],
  );

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const completedAppts = clientAppts.filter((appt) => appt.date && appt.time && (appt.date < todayStr));
  const confirmedAppts = clientAppts.filter((appt) => appt.date && appt.time && (appt.date >= todayStr)).slice(0, 2);
  
  const unpaidCount = clientAppts.filter((appt) => !appt.paid && appt.price).length;
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';

  return (
    <div className="flex-1 bg-transparent text-foreground">
      <main className="mx-auto space-y-16">
        
        {/* ── Page Header ── */}
        <div className="flex items-end justify-between border-b border-border pb-12">
          <div className="flex items-center gap-10">
            <button 
              onClick={onClose} 
              className="w-16 h-16 flex items-center justify-center rounded-full border border-border shadow-sm hover:scale-110 transition-all group bg-background"
            >
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform text-muted-foreground" size={24} strokeWidth={2.5} />
            </button>
            <div>
              <p className="dashboard-eyebrow mb-2">DOSSIER PATIENT</p>
              <h1 className="text-7xl font-bold tracking-tighter leading-none">
                {fullName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
              <button 
                onClick={() => onScheduleClient(client)}
                className="h-16 px-10 rounded-full text-[11px] font-bold uppercase tracking-[0.28em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 bg-primary text-primary-foreground"
              >
                <Plus size={18} strokeWidth={3} /> NOUVELLE SÉANCE
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-24 items-start">
          <ClientProfileSidebar 
            client={client}
            editData={editData}
            onUpdateClient={onUpdateClient}
            clientAppts={clientAppts}
            unpaidCount={unpaidCount}
          />

          <ClientAppointments 
            confirmedAppts={confirmedAppts}
            completedAppts={completedAppts}
            onSelectAppt={onSelectAppt}
          />
        </div>
      </main>
    </div>
  );
}
