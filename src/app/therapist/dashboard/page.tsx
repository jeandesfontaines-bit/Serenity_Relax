'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import { useFirestore, useAuth, useUser } from '@/firebase';
import {
  collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc, setDoc, 
  getDoc, getDocs, query, where, serverTimestamp
} from 'firebase/firestore';

// --- Modules ---
import AppLayout from './modules/AppLayout';
import HomePage from './modules/HomePage';
import AgendaPage from './modules/AgendaPage';
import PatientsPage from './modules/PatientsPage';
import ComptaPage from './modules/ComptaPage';
import PatientDetail from './modules/PatientDetail';
import AppointmentDetail from './modules/AppointmentDetail';
import BookingModal from './modules/BookingModal';
import SlotManagement from './modules/SlotManagement';
import WeeklySettingsModal from './modules/WeeklySettingsModal';

// --- Types ---
import { Appointment, Client, Invoice } from './types';

// --- Legacy CSS ---
import './appointment-view.css';
import './patient-profile.css';

// --- Helpers ---
const isoDay = (d: Date) => { const v = d.getDay(); return v === 0 ? 6 : v - 1; };
const fmt    = (d: Date) => format(d, 'yyyy-MM-dd');

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
  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({
    0: [], 1: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    2: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    3: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    4: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    5: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    6: ['10:00','11:30','14:00'],
  });
  const [availability, setAvailability] = useState<any[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(12000);

  // Interaction State
  const [blockMode, setBlockMode] = useState(false);
  const [absenceMode, setAbsenceMode] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [bookingData, setBookingData] = useState<{ date: string; time: string; initialSearch?: string } | null>(null);
  const [managingSlot, setManagingSlot] = useState<{ date: string; time: string; isBlocked: boolean } | null>(null);
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
      }
    });

    return () => { unsubAppts(); unsubClients(); unsubAvail(); unsubConfig(); unsubMeta(); };
  }, [firestore]);

  // --- Handlers ---
  const isDayOpen = (d: string) => !availability.find(a => a.id === d)?.closed;
  const isSlotBlocked = (d: string, t: string) => !!availability.find(a => a.id === d)?.blockedSlots?.includes(t);
  
  const toggleSlot = async (dStr: string, t: string) => {
     if (!firestore) return;
     const docRef = doc(firestore, 'availability', dStr);
     const dayData = availability.find(a => a.id === dStr) || { closed: false, blockedSlots: [] };
     const blocked = dayData.blockedSlots || [];
     const next = blocked.includes(t) ? blocked.filter((x: string) => x !== t) : [...blocked, t];
     await setDoc(docRef, { ...dayData, blockedSlots: next }, { merge: true });
  };

  const handleToggleDay = async (dStr: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'availability', dStr);
    const dayData = availability.find(a => a.id === dStr) || { closed: false, blockedSlots: [] };
    await setDoc(docRef, { ...dayData, closed: !dayData.closed }, { merge: true });
  };

  const handleTogglePayment = async (id: string, current: boolean, method?: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', id), { 
      paid: !current,
      paymentMethod: !current ? (method || 'Twint') : null 
    });
  };

  const handleUpdateGoal = async () => {
    if (!firestore) return;
    const val = prompt("Nouvel objectif mensuel (CHF) :", monthlyGoal.toString());
    if (val) {
      const num = parseInt(val);
      if (!isNaN(num)) {
        await setDoc(doc(firestore, 'config', 'metadata'), { monthlyGoal: num }, { merge: true });
      }
    }
  };

  // --- Render ---
  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <HomePage 
            appointments={appointments} 
            monthlyGoal={monthlyGoal} 
            onSelectAppt={setSelectedAppt}
            onNavigate={setTab}
            onEditGoal={handleUpdateGoal}
          />
        );
      case 'scheduler':
        return (
          <AgendaPage 
            view={view}
            cur={cur}
            onPeriod={(dir) => setCur(addDays(cur, dir * (view === 'month' ? 30 : 7)))}
            onToday={() => setCur(new Date())}
            onToggleView={setView}
            onSelectAppt={setSelectedAppt}
            onOpenSlot={(date, time) => setBookingData({ date, time })}
            appointments={appointments}
            configSlots={configSlots}
            isDayOpen={isDayOpen}
            isSlotBlocked={isSlotBlocked}
            toggleSlot={toggleSlot}
            onToggleDay={handleToggleDay}
            blockMode={blockMode}
            setBlockMode={setBlockMode}
            absenceMode={absenceMode}
            setAbsenceMode={setAbsenceMode}
            onOpenWeeklySettings={() => setWeeklySettingsOpen(true)}
          />
        );
      case 'clients':
        return selectedClient ? (
          <PatientDetail 
            client={selectedClient} 
            onClose={() => setSelectedClient(null)} 
            appointments={appointments}
            onSelectAppt={setSelectedAppt}
            onUpdateClient={handleUpdateClient}
          />
        ) : (
          <PatientsPage 
            clients={clients} 
            appointments={appointments}
            onSelectClient={setSelectedClient}
            onNewClient={(name: string | undefined) => setBookingData({ date: fmt(new Date()), time: '09:00', initialSearch: name })}
            onMergeClients={handleMergeClients}
          />
        );
      case 'accounting':
        return (
          <ComptaPage 
            appointments={appointments}
            invoices={invoices}
            onTogglePayment={handleTogglePayment}
            onSelectAppt={setSelectedAppt}
          />
        );
      default:
        return <div>Sélectionnez un onglet</div>;
    }
  };

  const handleUpdateClient = async (id: string, data: Partial<Client>) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'clients', id), data);
  };

  const handleMergeClients = async (primaryId: string, secondaryIds: string[]) => {
    if (!firestore) return;

    const primaryRef = doc(firestore, 'clients', primaryId);
    const primarySnap = await getDoc(primaryRef);
    if (!primarySnap.exists()) return;

    let mergedData = primarySnap.data() as Client;
    let combinedNotes = mergedData.notes || '';

    for (const sid of secondaryIds) {
      const secondaryRef = doc(firestore, 'clients', sid);
      const secondarySnap = await getDoc(secondaryRef);
      if (!secondarySnap.exists()) continue;

      const secondaryData = secondarySnap.data() as Client;

      // Merge missing fields
      const fields: (keyof Client)[] = ['phone', 'email', 'street', 'zip', 'city', 'insurance', 'birthDate'];
      fields.forEach(f => {
        if (!mergedData[f] && secondaryData[f]) {
          (mergedData as any)[f] = secondaryData[f];
        }
      });

      // Combine notes
      if (secondaryData.notes) {
        combinedNotes += `\n\n--- Note fusionnée (${secondaryData.firstName} ${secondaryData.lastName}) ---\n${secondaryData.notes}`;
      }

      // Update appointments
      const qAppts = query(collection(firestore, 'appointments'), where('clientId', '==', sid));
      const snapAppts = await getDocs(qAppts);
      for (const d of snapAppts.docs) {
        await updateDoc(d.ref, { 
          clientId: primaryId,
          clientNameSnapshot: `${mergedData.firstName} ${mergedData.lastName}`
        });
      }

      // Update invoices (if they exist in a collection)
      const qInvs = query(collection(firestore, 'invoices'), where('clientId', '==', sid));
      const snapInvs = await getDocs(qInvs);
      for (const d of snapInvs.docs) {
        await updateDoc(d.ref, { clientId: primaryId });
      }

      // Delete secondary client
      await deleteDoc(secondaryRef);
    }

    // Save final merged primary client
    await updateDoc(primaryRef, { ...mergedData, notes: combinedNotes });
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
        firstName,
        lastName,
        email: '',
        phone: '',
        notes: 'Créé via réservation rapide',
        color: 'bg-indigo-100 text-indigo-700'
      });
      finalClientId = docRef.id;
      finalClientName = `${firstName} ${lastName}`;
    } else {
      const client = clients.find(c => c.id === clientId);
      finalClientName = `${client?.firstName} ${client?.lastName}`;
    }

    await addDoc(collection(firestore, 'appointments'), {
      clientId: finalClientId,
      clientNameSnapshot: finalClientName,
      date: bookingData.date,
      time: bookingData.time,
      serviceName: service,
      price: 150,
      paid: false,
      status: 'upcoming',
      notes: ''
    });
    setBookingData(null);
  };

  const handleSaveWeeklySlots = async (slots: Record<number, string[]>) => {
    if (!firestore) return;
    await setDoc(doc(firestore, 'config', 'slots'), { days: slots }, { merge: true });
    setWeeklySettingsOpen(false);
  };

  return (
    <AppLayout 
      activePage={tab} 
      onNavigate={setTab}
    >
      {renderContent()}

      {/* Legacy Modals Integration (Pending Full Modularization) */}
      {selectedAppt && (
        <AppointmentDetail 
          appt={selectedAppt} 
          onClose={() => setSelectedAppt(null)} 
          appointments={appointments}
          onGoToClient={(clientId) => {
            const c = clients.find(c => c.id === clientId);
            if (c) {
              setSelectedClient(c);
              setTab('clients');
              setSelectedAppt(null); // Close the detail modal
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

      {/* SlotManagement removed as it is now handled inline in AgendaPage icons reveal */}

      {weeklySettingsOpen && (
        <WeeklySettingsModal 
          initialSlots={configSlots}
          onClose={() => setWeeklySettingsOpen(false)}
          onSave={handleSaveWeeklySlots}
        />
      )}
    </AppLayout>
  );
}
