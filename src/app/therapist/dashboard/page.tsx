'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays, addMonths, addWeeks, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc, setDoc,
  getDoc, getDocs, query, where, serverTimestamp
} from 'firebase/firestore';
import { SERVICES } from '@/lib/types';

// --- Modules ---
import AppLayout from './modules/AppLayout';
import HomePage from './modules/HomePage';
import AgendaPage from './modules/AgendaPage';
import ClientsPage from './modules/ClientsPage';
import ComptaPage from './modules/ComptaPage';
import ClientDetail from './modules/ClientDetail';
import SettingsPage from './modules/SettingsPage';
import AppointmentRecordPage from './modules/AppointmentRecordPage';
import BookingModal from './modules/BookingModal';
import WeeklySettingsModal from './modules/WeeklySettingsModal';

// --- Types ---
import { Appointment, Client, Invoice } from './types';

// Legacy CSS removed — all modules now use Tailwind

// --- Helpers ---
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
const DEFAULT_REMINDER = "Bonjour {firstName}, petit rappel concernant le paiement de votre séance {service} du {date}. Montant restant: {price} CHF. Merci beaucoup.";
const DEFAULT_CONFIRMATION = "Bonjour {firstName}, votre rendez-vous pour {service} est confirmé le {date} à {time}. Au plaisir de vous accueillir.";
const DEFAULT_FOLLOWUP = "Bonjour {firstName}, j'espère que vous vous sentez bien après votre séance. Pensez à bien vous hydrater aujourd'hui.";

const normalizeAppointment = (id: string, data: any): Appointment => {
  const start = data.startTime ? new Date(data.startTime) : null;
  const validStart = start && !Number.isNaN(start.getTime());

  return {
    id,
    ...data,
    date: data.date || (validStart ? format(start, 'yyyy-MM-dd') : ''),
    time: data.time || (validStart ? format(start, 'HH:mm') : ''),
    title: data.title || data.clientNameSnapshot || data.serviceName || 'Séance',
    price: data.price ?? data.totalAmount,
  } as Appointment;
};

export default function TherapistDashboard() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();

  // Navigation
  const [tab, setTab] = useState<string>('dashboard');
  const [view, setView] = useState<'month' | 'week'>('week');
  const [clientsViewMode, setClientsViewMode] = useState<'list' | 'grid'>('list');
  const [cur, setCur] = useState(new Date());
  const [globalSearch, setGlobalSearch] = useState('');

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({
    0: [], 1: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    2: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    3: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    4: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    5: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    6: ['10:00', '11:30', '14:00'],
  });
  const [availability, setAvailability] = useState<any[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(12000);
  const [reminderTemplate, setReminderTemplate] = useState<string>(DEFAULT_REMINDER);
  const [confirmationTemplate, setConfirmationTemplate] = useState<string>(DEFAULT_CONFIRMATION);
  const [followupTemplate, setFollowupTemplate] = useState<string>(DEFAULT_FOLLOWUP);
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [cabinetName, setCabinetName] = useState<string>("Serenity Relax Therapy");
  const [cabinetEmail, setCabinetEmail] = useState<string>("");
  const [cabinetAddress, setCabinetAddress] = useState<string>("");
  const [fullName, setFullName] = useState<string>('João Silva');
  const [profileEmail, setProfileEmail] = useState<string>('joao.silva@sereneholistic.com');
  const [phone, setPhone] = useState<string>('+351 912 345 678');
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [notifyPush, setNotifyPush] = useState<boolean>(true);
  const [notifySms, setNotifySms] = useState<boolean>(false);

  // Interaction State
  const [absenceMode, setAbsenceMode] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lastMainTab, setLastMainTab] = useState<string>('dashboard');
  const [bookingData, setBookingData] = useState<{ date: string; time: string; initialSearch?: string } | null>(null);
  const [weeklySettingsOpen, setWeeklySettingsOpen] = useState(false);
  const [pendingAbsenceDates, setPendingAbsenceDates] = useState<Set<string>>(new Set());
  const [showClientFilters, setShowClientFilters] = useState(false);
  const [clientsVisibleCount, setClientsVisibleCount] = useState(0);

  const [accountingDateRange, setAccountingDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [showAccountingDateRange, setShowAccountingDateRange] = useState(false);
  const [accountingSelectedCount, setAccountingSelectedCount] = useState(0);
  const [showAccountingFilters, setShowAccountingFilters] = useState(false);
  const [accountingQuickFilter, setAccountingQuickFilter] = useState<{ clientId?: string; unpaidOnly?: boolean } | null>(null);

  // Some client-side libraries can emit empty rejected promises in dev.
  // Ignore only `undefined` reasons to prevent false runtime overlays.
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason === undefined) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  const todayStr = fmt(new Date());
  const todaySessionsCount = appointments.filter(
    (appt) => appt.date === todayStr && appt.status !== 'cancelled',
  ).length;
  const dashboardSummary = {
    title: 'Tableau de bord',
    subtitle: `Bienvenue dans votre espace de gestion Serenity.`,
  };
  const schedulerTitle = useMemo(() => {
    if (view === 'week') {
      const start = new Date(cur);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(start.setDate(diff));
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'd')} – ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(cur, 'MMMM yyyy', { locale: fr });
  }, [cur, view]);

  // --- Data Loading ---
  useEffect(() => {
    if (!firestore || !user) return;
    const unsubAppts = onSnapshot(collection(firestore, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(d => normalizeAppointment(d.id, d.data())));
    }, (err) => console.error("Appts snapshot error:", err));

    const unsubInvoices = onSnapshot(collection(firestore, 'invoices'), (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
    }, (err) => console.error("Invoices snapshot error:", err));

    const unsubClients = onSnapshot(collection(firestore, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    }, (err) => console.error("Clients snapshot error:", err));

    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap) => {
      setAvailability(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Avail snapshot error:", err));

    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (doc) => {
      if (doc.exists()) setConfigSlots(doc.data().days || {});
    }, (err) => console.error("Config slots snapshot error:", err));

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
        if (d.fullName) setFullName(d.fullName);
        if (d.profileEmail) setProfileEmail(d.profileEmail);
        if (d.phone) setPhone(d.phone);
        if (d.notifyEmail !== undefined) setNotifyEmail(d.notifyEmail);
        if (d.notifyPush !== undefined) setNotifyPush(d.notifyPush);
        if (d.notifySms !== undefined) setNotifySms(d.notifySms);
      }
    }, (err) => console.error("Config meta snapshot error:", err));

    return () => { unsubAppts(); unsubInvoices(); unsubClients(); unsubAvail(); unsubConfig(); unsubMeta(); };
  }, [firestore, user]);

  // --- Handlers ---
  const isDayOpen = (d: string) => !availability.find(a => a.id === d)?.closed;
  const isSlotBlocked = (d: string, t: string) => !!availability.find(a => a.id === d)?.blockedSlots?.includes(t);
  const togglePendingAbsence = useCallback((dStr: string) => {
    setPendingAbsenceDates((prev) => {
      const next = new Set(prev);
      next.has(dStr) ? next.delete(dStr) : next.add(dStr);
      return next;
    });
  }, []);

  const clearAbsenceMode = useCallback(() => {
    setPendingAbsenceDates(new Set());
    setAbsenceMode(false);
  }, []);

  const saveAbsences = useCallback(() => {
    pendingAbsenceDates.forEach((date) => {
      handleToggleDay(date);
    });
    setPendingAbsenceDates(new Set());
    setAbsenceMode(false);
  }, [pendingAbsenceDates]);

  const toggleAbsenceModeFromHeader = useCallback(() => {
    if (absenceMode) {
      saveAbsences();
      return;
    }
    setAbsenceMode(true);
  }, [absenceMode, saveAbsences]);

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

    const qInvs = query(collection(firestore, 'invoices'), where('appointmentId', '==', id));
    const invSnap = await getDocs(qInvs);
    await Promise.all(
      invSnap.docs.map((invoiceDoc) =>
        updateDoc(invoiceDoc.ref, {
          status: !current ? 'Paid' : 'Pending',
          paymentMethod: !current ? (method || 'Twint') : null,
          paidAt: !current ? serverTimestamp() : null,
        }),
      ),
    );
  };

  const handleSendWhatsApp = (appt: Appointment, type: 'reminder' | 'confirmation' | 'followup') => {
    const client = clients.find(c => c.id === appt.clientId);
    const phone = (client?.phone || appt.phone || '').replace(/\D/g, '');
    const firstName = client?.firstName || appt.clientNameSnapshot?.split(' ')[0] || 'Client';
    const template =
      type === 'confirmation' ? confirmationTemplate :
        type === 'followup' ? followupTemplate :
          reminderTemplate;

    const message = (template || DEFAULT_REMINDER)
      .replace(/{firstName}/g, firstName)
      .replace(/{date}/g, appt.date || '')
      .replace(/{time}/g, appt.time || '')
      .replace(/{service}/g, appt.serviceName || 'Soin')
      .replace(/{price}/g, String(appt.price || 150));

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
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

  const openAppointmentRecord = useCallback((appt: Appointment) => {
    setLastMainTab((prev) => (tab === 'appointment-detail' ? prev : tab));
    setSelectedAppt(appt);
    setTab('appointment-detail');
  }, [tab]);

  const closeAppointmentRecord = useCallback(() => {
    setSelectedAppt(null);
    setTab(lastMainTab || 'dashboard');
  }, [lastMainTab]);

  // --- Render ---
  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <HomePage
            appointments={appointments}
            monthlyGoal={monthlyGoal}
            clientsCount={clients.length}
            onSelectAppt={openAppointmentRecord}
            onNavigate={setTab}
            onEditGoal={handleUpdateGoal}
            searchQuery={globalSearch}
          />
        );
      case 'scheduler':
        return (
          <AgendaPage
            view={view}
            cur={cur}
            onToggleView={setView}
            onSelectAppt={openAppointmentRecord}
            onSelectApptFromMonth={openAppointmentRecord}
            onOpenSlot={(date, time) => setBookingData({ date, time })}
            appointments={appointments}
            configSlots={configSlots}
            isDayOpen={isDayOpen}
            isSlotBlocked={isSlotBlocked}
            toggleSlot={toggleSlot}
            absenceMode={absenceMode}
            onMoveAppt={handleMoveAppt}
            onSelectDate={setCur}
            searchQuery={globalSearch}
            pendingDates={pendingAbsenceDates}
            togglePending={togglePendingAbsence}
            onClearAbsenceMode={clearAbsenceMode}
          />
        );
      case 'clients':
        return selectedClient ? (
          <ClientDetail
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            appointments={appointments}
            onSelectAppt={openAppointmentRecord}
            onUpdateClient={handleUpdateClient}
            onScheduleClient={(selected) => setBookingData({
              date: fmt(new Date()),
              time: '09:00',
              initialSearch: `${selected.firstName || ''} ${selected.lastName || ''}`.trim() || undefined,
            })}
            onOpenAccountingForClient={(selected) => {
              setGlobalSearch(`${selected.firstName || ''} ${selected.lastName || ''}`.trim());
              setAccountingQuickFilter({ clientId: selected.id, unpaidOnly: true });
              setSelectedClient(null);
              setTab('accounting');
            }}
          />
        ) : (
          <ClientsPage
            clients={clients}
            appointments={appointments}
            onSelectClient={setSelectedClient}
            onMergeClients={handleMergeClients}
            onDeleteClients={handleDeleteClients}
            searchQuery={globalSearch}
            onSearchQueryChange={setGlobalSearch}
            showFilterPanel={showClientFilters}
            onShowFilterPanelChange={setShowClientFilters}
            onVisibleCountChange={setClientsVisibleCount}
            viewMode={clientsViewMode}
          />
        );
      case 'accounting':
        return (
          <ComptaPage
            appointments={appointments}
            invoices={invoices}
            onTogglePayment={handleTogglePayment}
            onDeleteInvoices={handleDeleteAppointments}
            searchQuery={globalSearch}
            onSearchQueryChange={setGlobalSearch}
            dateRange={accountingDateRange}
            onSelectedCountChange={setAccountingSelectedCount}
            showFilterPanel={showAccountingFilters}
            onShowFilterPanelChange={setShowAccountingFilters}
            quickFilter={accountingQuickFilter}
          />
        );
      case 'appointment-detail':
        return selectedAppt ? (
          <AppointmentRecordPage
            appt={selectedAppt}
            appointments={appointments}
            invoices={invoices}
            onBack={closeAppointmentRecord}
            onSendWhatsApp={handleSendWhatsApp}
            onTogglePayment={handleTogglePayment}
          />
        ) : null;
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
            fullName={fullName}
            profileEmail={profileEmail}
            phone={phone}
            notifyEmail={notifyEmail}
            notifyPush={notifyPush}
            notifySms={notifySms}
            onUpdateMetadata={(data) => {
              if (firestore) setDoc(doc(firestore, 'config', 'metadata'), data, { merge: true });
            }}
            searchQuery={globalSearch}
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

  const handleMoveAppt = async (id: string, date: string, time: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', id), { date, time, startTime: `${date}T${time}:00` });
    
    // Update availability
    try {
      await updateDoc(doc(firestore, 'availability', id), { date, time });
    } catch (e) {
      console.error('Availability doc might not exist for this appointment', e);
    }

    // Update invoice dates
    try {
      const qInvs = query(collection(firestore, 'invoices'), where('appointmentId', '==', id));
      const snapInvs = await getDocs(qInvs);
      for (const d of snapInvs.docs) {
        await updateDoc(d.ref, { date, dueDate: date });
      }
    } catch (e) {
      console.error('Failed to update invoice dates', e);
    }
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

  const handleDeleteClients = async (ids: string[]) => {
    if (!firestore) return;

    for (const id of ids) {
      // 1. Delete client document
      await deleteDoc(doc(firestore, 'clients', id));

      // 2. Delete associated appointments
      const qAppts = query(collection(firestore, 'appointments'), where('clientId', '==', id));
      const snapAppts = await getDocs(qAppts);
      for (const d of snapAppts.docs) {
        await deleteDoc(d.ref);
      }

      // 3. Delete associated invoices
      const qInvs = query(collection(firestore, 'invoices'), where('clientId', '==', id));
      const snapInvs = await getDocs(qInvs);
      for (const d of snapInvs.docs) {
        await deleteDoc(d.ref);
      }
    }
  };

  const handleDeleteAppointments = async (ids: string[]) => {
    if (!firestore) return;

    for (const id of ids) {
      // 1. Delete appointment
      await deleteDoc(doc(firestore, 'appointments', id));

      // 2. Delete associated invoice
      const qInvs = query(collection(firestore, 'invoices'), where('appointmentId', '==', id));
      const snapInvs = await getDocs(qInvs);
      for (const d of snapInvs.docs) {
        await deleteDoc(d.ref);
      }

      // 3. Delete associated availability (if any)
      await deleteDoc(doc(firestore, 'availability', id));
    }
  };

  const handleBook = async (clientId: string, service: string, isNew?: boolean) => {
    if (!firestore || !bookingData) return;

    let finalClientId = clientId;
    let finalClientName = "";
    const selectedService = SERVICES.find(s => s.name === service || s.name.split(' - ')[0] === service);
    const price = selectedService?.price || 150;
    const magicToken = `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();

    if (isNew) {
      const parts = clientId.split(' ');
      const lastName = parts.pop() || "";
      const firstName = parts.join(' ') || lastName;
      const docRef = await addDoc(collection(firestore, 'clients'), {
        firstName,
        lastName,
        email: '',
        phone: '',
        magicToken,
        notes: 'Créé via réservation rapide',
        color: 'bg-indigo-100 text-indigo-700'
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
      startTime: `${bookingData.date}T${bookingData.time}:00`,
      serviceName: service,
      serviceId: selectedService?.id,
      price,
      magicToken,
      paid: false,
      status: 'confirmed',
      notes: '',
      createdAt: serverTimestamp()
    });

    const invoiceRef = await addDoc(collection(firestore, 'invoices'), {
      appointmentId: apptRef.id,
      clientId: finalClientId,
      clientNameSnapshot: finalClientName,
      invoiceNumber: `INV-${format(new Date(), 'yyyyMMdd')}-${apptRef.id.slice(-4).toUpperCase()}`,
      date: bookingData.date,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: bookingData.date,
      amount: price,
      totalAmount: price,
      status: 'Pending',
      serviceName: service,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(firestore, 'availability', apptRef.id), {
      type: 'booked',
      date: bookingData.date,
      time: bookingData.time,
      appointmentId: apptRef.id,
      invoiceId: invoiceRef.id
    });

    // Send confirmation email if the client has an email address
    const clientEmail = isNew ? '' : clients.find(c => c.id === clientId)?.email;
    const clientPhone = isNew ? '' : clients.find(c => c.id === clientId)?.phone;

    if (clientEmail) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: apptRef.id,
            clientName: finalClientName,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            serviceName: service,
            startTime: `${bookingData.date}T${bookingData.time}:00`,
            duration: selectedService?.duration || '60 min',
            magicToken,
            clientId: finalClientId,
          }),
        });
      } catch (err) {
        console.error('Failed to notify client on manual booking:', err);
      }
    }

    setBookingData(null);
  };

  const handleSaveWeeklySlots = async (slots: Record<number, string[]>) => {
    if (!firestore) return;
    await setDoc(doc(firestore, 'config', 'slots'), { days: slots }, { merge: true });
    setWeeklySettingsOpen(false);
  };

  const handleNavigate = useCallback((page: string) => {
    setTab(page);
    setSelectedClient(null);
    if (page !== 'appointment-detail') {
      setSelectedAppt(null);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [auth, router]);

  return (
      <AppLayout
        activePage={tab === 'clients' && selectedClient ? 'client-detail' : tab}
        onNavigate={handleNavigate}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        dashboardSummary={dashboardSummary}
        dashboardToolbar={tab === 'dashboard' ? {
          dateLabel: format(new Date(), 'EEEE d MMM', { locale: fr }),
          goalLabel: `Objectif: ${monthlyGoal.toLocaleString('fr-CH')} CHF`,
          onGoalClick: handleUpdateGoal,
        } : undefined}
        schedulerToolbar={tab === 'scheduler' ? {
          eyebrow: '',
          title: schedulerTitle,
          view,
          onPrev: () => setCur((prev) => (view === 'month' ? addMonths(prev, -1) : addWeeks(prev, -1))),
          onNext: () => setCur((prev) => (view === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1))),
          onToday: () => setCur(new Date()),
          onToggleView: setView,
          absenceMode,
          absencePendingCount: pendingAbsenceDates.size,
          onToggleAbsenceMode: toggleAbsenceModeFromHeader,
          onOpenSettings: () => setWeeklySettingsOpen(true),
        } : undefined}
        clientsToolbar={tab === 'clients' && !selectedClient ? {
          title: 'Répertoire clients',
          subtitle: `${clients.length} profil${clients.length > 1 ? 's' : ''}, ${clientsVisibleCount} visible${clientsVisibleCount > 1 ? 's' : ''}`,
          onToggleFilters: () => setShowClientFilters((prev) => !prev),
          viewMode: clientsViewMode,
          onViewModeChange: setClientsViewMode,
        } : undefined}
        clientDetailToolbar={tab === 'clients' && selectedClient ? {
          eyebrow: 'Dossier client',
          title: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim() || 'Client',
          onBack: () => setSelectedClient(null),
          onSchedule: () => setBookingData({
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '09:00',
            initialSearch: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim() || undefined,
          }),
        } : undefined}
        appointmentDetailToolbar={tab === 'appointment-detail' && selectedAppt ? {
          eyebrow: 'Dossier de séance',
          title: selectedAppt.clientNameSnapshot || 'Séance',
          onBack: closeAppointmentRecord,
        } : undefined}
        financeToolbar={tab === 'accounting' ? {
          title: 'Finances',
          subtitle: 'Aperçu des revenus',
          showDateRange: showAccountingDateRange,
          dateRange: accountingDateRange,
          onDateRangeChange: setAccountingDateRange,
          onToggleDateFilter: () => setShowAccountingDateRange(p => !p),
          onToggleFilters: () => setShowAccountingFilters(p => !p),
          onExport: () => window.dispatchEvent(new CustomEvent('trigger-finance-export')),
          selectedCount: accountingSelectedCount,
        } : undefined}
        settingsToolbar={tab === 'settings' ? {
          title: 'Paramètres du compte',
          subtitle: '',
        } : undefined}
        onLogout={handleLogout}
      >
      {renderContent()}
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
