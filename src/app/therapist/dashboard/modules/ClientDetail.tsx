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
      <main className="mx-auto space-y-10">
        
        {/* Header removed — handled by AppLayout global header */}

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start pt-4">
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
