'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import { useFirestore, useUser } from '@/firebase';
import {
  collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc, setDoc, 
  getDoc, getDocs, query, where, serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Modules ---
import AppLayout from './modules/AppLayout';
import HomePage from './modules/HomePage';
import AgendaPage from './modules/AgendaPage';
import ClientsPage from './modules/ClientsPage';
import ComptaPage from './modules/ComptaPage';
import ClientDetail from './modules/ClientDetail';
import SettingsPage from './modules/SettingsPage';
import AppointmentDetail from './modules/AppointmentDetail';
import BookingModal from './modules/BookingModal';
import WeeklySettingsModal from './modules/WeeklySettingsModal';

// --- Types ---
import { Appointment, Client, Invoice } from './types';

// --- Helpers ---
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

export default function TherapistDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Navigation
  const [tab, setTab] = useState<string>('dashboard');
  const [view, setView] = useState<'month' | 'week'>('week');
  const [cur, setCur] = useState(new Date());

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({});
  const [availability, setAvailability] = useState<any[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(12000);
  const [reminderTemplate, setReminderTemplate] = useState<string>("");
  const [confirmationTemplate, setConfirmationTemplate] = useState<string>("");
  const [followupTemplate, setFollowupTemplate] = useState<string>("");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [cabinetName, setCabinetName] = useState<string>("Mon Cabinet");
  const [cabinetEmail, setCabinetEmail] = useState<string>("");
  const [cabinetAddress, setCabinetAddress] = useState<string>("");

  const [comptaFilter, setComptaFilter] = useState<'all' | 'unpaid' | 'late'>('all');

  // Interaction State
  const [blockMode, setBlockMode] = useState(false);
  const [absenceMode, setAbsenceMode] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [bookingData, setBookingData] = useState<{ date: string; time: string; initialSearch?: string } | null>(null);
  const [weeklySettingsOpen, setWeeklySettingsOpen] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    if (!firestore) return;
    const unsubAppts = onSnapshot(collection(firestore, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });
    const unsubClients = onSnapshot(collection(firestore, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    });
    const unsubInvs = onSnapshot(collection(firestore, 'invoices'), (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
    });
    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap) => {
      setAvailability(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (doc) => {
      if (doc.exists()) setConfigSlots(doc.data().days || {});
    });
    const unsubMeta = onSnapshot(doc(firestore, 'config', 'metadata'), (doc) => {
      if (doc.exists()) {
        const d = doc.data();
        if (d.monthlyGoal) setMonthlyGoal(d.monthlyGoal);
        if (d.reminderTemplate) setReminderTemplate(d.reminderTemplate);
        if (d.confirmationTemplate) setConfirmationTemplate(d.confirmationTemplate);
        if (d.followupTemplate) setFollowupTemplate(d.followupTemplate);
        if (d.emailTemplate) setEmailTemplate(d.emailTemplate);
        if (d.emailEnabled !== undefined) setEmailEnabled(d.emailEnabled);
        if (d.cabinetName) setCabinetName(d.cabinetName);
        if (d.cabinetEmail) setCabinetEmail(d.cabinetEmail);
        if (d.cabinetAddress) setCabinetAddress(d.cabinetAddress);
      }
    });

    return () => { unsubAppts(); unsubClients(); unsubInvs(); unsubAvail(); unsubConfig(); unsubMeta(); };
  }, [firestore]);

  // --- Handlers ---
  const handleUpdateClient = async (id: string, data: Partial<Client>) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'clients', id), data);
  };

  const handleMoveAppt = async (id: string, date: string, time: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', id), { date, time });
  };

  const handleTogglePayment = async (id: string, current: boolean, method?: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', id), { 
      paid: !current,
      paymentMethod: !current ? (method || 'Twint') : null 
    });
  };

  const handleSendWhatsApp = (appt: Appointment, type: 'reminder' | 'confirmation' | 'followup') => {
    const client = clients.find(c => c.id === appt.clientId);
    const phone = client?.phone?.replace(/\D/g, '') || '';
    const firstName = appt.clientNameSnapshot?.split(' ')[0] || 'Client';

    let template = reminderTemplate;
    if (type === 'confirmation') template = confirmationTemplate;
    if (type === 'followup') template = followupTemplate;

    const message = template
      .replace(/{firstName}/g, firstName)
      .replace(/{date}/g, appt.date || '')
      .replace(/{time}/g, appt.time || '')
      .replace(/{service}/g, appt.serviceName || 'Soin')
      .replace(/{price}/g, (appt.price || 150).toString());

    const url = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  const handleBook = async (clientId: string, service: string, isNew?: boolean) => {
    if (!firestore || !bookingData) return;
    let finalClientId = clientId;
    let finalClientName = "";

    if (isNew) {
      const parts = clientId.split(' ');
      const lastName = parts.pop() || "";
      const firstName = parts.join(' ') || lastName;
      const docRef = await addDoc(collection(firestore, 'clients'), {
        firstName, lastName, email: '', phone: '', notes: 'Nouveau client', color: 'bg-indigo-100'
      });
      finalClientId = docRef.id;
      finalClientName = `${firstName} ${lastName}`;
    } else {
      const client = clients.find(c => c.id === clientId);
      finalClientName = `${client?.firstName} ${client?.lastName}`;
    }

    const apptRef = await addDoc(collection(firestore, 'appointments'), {
      clientId: finalClientId,
      clientNameSnapshot: finalClientName,
      date: bookingData.date,
      time: bookingData.time,
      serviceName: service,
      price: 150,
      paid: false,
      createdAt: serverTimestamp()
    });

    await addDoc(collection(firestore, 'invoices'), {
      appointmentId: apptRef.id,
      clientId: finalClientId,
      date: serverTimestamp(),
      amount: 150,
      status: 'pending',
      clientNameSnapshot: finalClientName,
      serviceName: service
    });
    
    setBookingData(null);
  };

  const handleCancelAppt = async (id: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', id), { status: 'cancelled', updatedAt: serverTimestamp() });
  };

  const handleResendConfirmation = (appt: Appointment) => {
    handleSendWhatsApp(appt, 'confirmation');
  };

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedClient ? `client-${selectedClient.id}` : tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {(() => {
            if (selectedClient) {
              return (
                <ClientDetail 
                  client={selectedClient} 
                  onClose={() => setSelectedClient(null)} 
                  appointments={appointments}
                  onSelectAppt={setSelectedAppt}
                  onUpdateClient={handleUpdateClient}
                  onCancelAppt={handleCancelAppt}
                  onResendConfirmation={handleResendConfirmation}
                />
              );
            }

            switch (tab) {
              case 'dashboard':
                return (
                  <HomePage 
                    appointments={appointments} 
                    monthlyGoal={monthlyGoal} 
                    onSelectAppt={setSelectedAppt}
                    onNavigate={setTab}
                    onFilterCompta={(f: any) => {
                      setTab('accounting');
                      setComptaFilter(f);
                    }}
                    onEditGoal={() => setTab('settings')}
                  />
                );
              case 'scheduler':
                return (
                  <AgendaPage 
                    view={view as any} 
                    onToggleView={setView} 
                    cur={cur} 
                    onPeriod={(d: number) => setCur(addDays(cur, d * (view === 'week' ? 7 : 30)))}
                    onToday={() => setCur(new Date())}
                    appointments={appointments}
                    configSlots={configSlots}
                    isDayOpen={(d: string) => availability.find(a => a.id === d && !a.closed)}
                    isSlotBlocked={(d: string, t: string) => !!availability.find(a => a.id === d)?.blockedSlots?.includes(t)}
                    toggleSlot={async (dStr: string, t: string) => {
                         if (!firestore) return;
                         const docRef = doc(firestore, 'availability', dStr);
                         const dayData = availability.find(a => a.id === dStr) || { blockedSlots: [] };
                         const blocked = dayData.blockedSlots || [];
                         const next = blocked.includes(t) ? blocked.filter((x: string) => x !== t) : [...blocked, t];
                         await setDoc(docRef, { ...dayData, blockedSlots: next }, { merge: true });
                    }}
                    onToggleDay={async (dStr: string) => {
                        if (!firestore) return;
                        const docRef = doc(firestore, 'availability', dStr);
                        const dayData = availability.find(a => a.id === dStr);
                        await setDoc(docRef, { ...dayData, closed: !dayData?.closed }, { merge: true });
                    }}
                    blockMode={blockMode}
                    setBlockMode={setBlockMode}
                    absenceMode={absenceMode}
                    setAbsenceMode={setAbsenceMode}
                    onSelectAppt={setSelectedAppt}
                    onOpenSlot={(d: string, t: string) => setBookingData({ date: d, time: t })}
                    onOpenWeeklySettings={() => setWeeklySettingsOpen(true)}
                    onMoveAppt={handleMoveAppt}
                  />
                );
              case 'clients':
                return (
                  <ClientsPage 
                    clients={clients} 
                    appointments={appointments}
                    onSelectClient={setSelectedClient}
                    onNewClient={(name) => setBookingData({ date: fmt(new Date()), time: '09:00', initialSearch: name })}
                    onMergeClients={async () => {}}
                  />
                );
              case 'accounting':
                return (
                  <ComptaPage 
                    appointments={appointments}
                    clients={clients}
                    invoices={invoices}
                    reminderTemplate={reminderTemplate}
                    initialFilter={comptaFilter}
                    onUpdateReminder={(val) => {
                      setReminderTemplate(val);
                      if (firestore) setDoc(doc(firestore, 'config', 'metadata'), { reminderTemplate: val }, { merge: true });
                    }}
                    onTogglePayment={handleTogglePayment}
                    onSelectAppt={setSelectedAppt}
                  />
                );
              case 'settings':
                return (
                  <SettingsPage 
                    monthlyGoal={monthlyGoal}
                    reminderTemplate={reminderTemplate}
                    confirmationTemplate={confirmationTemplate}
                    followupTemplate={followupTemplate}
                    emailTemplate={emailTemplate}
                    emailEnabled={emailEnabled}
                    cabinetName={cabinetName}
                    cabinetEmail={cabinetEmail}
                    cabinetAddress={cabinetAddress}
                    onUpdateMetadata={(data: any) => {
                      if (firestore) setDoc(doc(firestore, 'config', 'metadata'), data, { merge: true });
                    }}
                  />
                );
              default:
                return <div>Sélectionnez un onglet</div>;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <AppLayout activePage={tab} onNavigate={(page) => {
      setTab(page);
      setSelectedClient(null);
      setSelectedAppt(null);
    }}>
      {renderContent()}
      {selectedAppt && (
        <AppointmentDetail 
          appt={selectedAppt} 
          onClose={() => setSelectedAppt(null)} 
          appointments={appointments}
          onSendWhatsApp={handleSendWhatsApp}
          onGoToClient={(clientId) => {
            const c = clients.find(c => c.id === clientId);
            if (c) {
              setSelectedClient(c);
              setTab('clients');
              setSelectedAppt(null);
            }
          }}
        />
      )}
      {bookingData && (
        <BookingModal 
          date={bookingData.date} 
          time={bookingData.time}
          clients={clients}
          initialSearch={bookingData.initialSearch}
          onClose={() => setBookingData(null)}
          onBook={handleBook}
        />
      )}
      {weeklySettingsOpen && (
        <WeeklySettingsModal 
          initialSlots={configSlots}
          onClose={() => setWeeklySettingsOpen(false)}
          onSave={async (slots) => {
            if (firestore) await setDoc(doc(firestore, 'config', 'slots'), { days: slots }, { merge: true });
            setWeeklySettingsOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}
