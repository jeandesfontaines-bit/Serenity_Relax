'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CalendarRange, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2,
  X, Trash2, Clock, Plus, Cog, Power, Mail, FileText, History, User, CreditCard, Download, MessageCircle, MessageSquare, Edit3, ArrowUpRight, Smartphone, Banknote
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, startOfDay, addDays, getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirestore, useAuth, useUser } from '@/firebase';
import {
  collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc, setDoc, serverTimestamp, deleteField
} from 'firebase/firestore';
import { SERVICES } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRICE = 150;
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_S = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
const DAYS_F = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

// iso weekday: Mon=0 … Sun=6
const isoDay = (d: Date) => { const v = d.getDay(); return v === 0 ? 6 : v - 1; };
const fmt    = (d: Date) => format(d, 'yyyy-MM-dd');
const fmtFR  = (d: Date) => {
  if (isNaN(d.getTime())) return 'Date invalide';
  return format(d, 'd MMMM yyyy', { locale: fr });
};
const wkStart = (d: Date) => { const c = new Date(d); c.setDate(c.getDate() - isoDay(c)); return c; };

// ─── Circular progress ────────────────────────────────────────────────────────
const CircProgress = ({ pct, cls }: { pct: number; cls: string }) => {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} stroke="#C8D6E5" strokeWidth="3" fill="transparent"/>
        <circle cx="24" cy="24" r={r} stroke="currentColor" strokeWidth="3" fill="transparent"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" className={cls}/>
      </svg>
      <span className="absolute text-[9px] font-black">{pct}%</span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function TherapistDashboard() {
  const firestore = useFirestore();
  const auth      = useAuth();
  const { user, isUserLoading } = useUser();

  // Navigation
  const [tab,  setTab]  = useState<'dashboard' | 'scheduler' | 'clients' | 'settings' | 'accounting' | 'client-detail'>('scheduler');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [cur,  setCur]  = useState(new Date());

  // Drag-select mode
  const [blockMode, setBlockMode] = useState(false);
  const [isDrag,    setIsDrag]    = useState(false);
  const [dragAct,   setDragAct]   = useState<'open' | 'close'>('open');

  // Firestore data
  const [availability, setAvailability] = useState<any[]>([]);
  const [appointments,  setAppointments]  = useState<any[]>([]);
  const [configSlots,   setConfigSlots]   = useState<Record<number, string[]>>({
    0: [], 1: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    2: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    3: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    4: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    5: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    6: ['10:00','11:30','14:00'],
  });

  // Modal state
  const [evModal, setEvModal] = useState<{ date: string; time: string } | null>(null);
  const [evStep,  setEvStep]  = useState<'choice' | 'book'>('choice');
  const [evName,  setEvName]  = useState('');
  const [evEmail, setEvEmail] = useState('');
  const [evPhone, setEvPhone] = useState('');
  const [evService, setEvService] = useState('');

  // Config modal
  const [cfgOpen,  setCfgOpen]  = useState(false);
  const [cfgDay,   setCfgDay]   = useState(0);
  const [newTime,  setNewTime]  = useState('');
  const [savingCfg, setSavingCfg] = useState(false);

  // New Detail/Edit states
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editService, setEditService] = useState('');
  const [editPrice, setEditPrice] = useState(150);
  const [isSending, setIsSending] = useState(false);
  
  // Invoice state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);

  // Clients state
  const [clients,    setClients]    = useState<any[]>([]);
  const [clModal,    setClModal]    = useState(false);
  const [clForm,     setClForm]     = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '' });
  const [clScaling,  setClScaling]  = useState(false); // For animation
  const [clSearch,   setClSearch]   = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clEditForm, setClEditForm] = useState<any>({});
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Hydration guard
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // ── Firestore subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    if (!firestore) return;

    const unsubAvail = onSnapshot(collection(firestore, 'availability'), snap =>
      setAvailability(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubAppts = onSnapshot(collection(firestore, 'appointments'), snap =>
      setAppointments(snap.docs.map(d => {
        const data = d.data();
        const [dateStr, timeStr] = (data.startTime || '').split('T');
        return {
          id: d.id, ...data,
          date: dateStr,
          time: timeStr?.substring(0, 5) || '',
          title: data.clientNameSnapshot || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        };
      }).filter(a => a.date)));

    const unsubCfg = onSnapshot(doc(firestore, 'config', 'slots'), snap => {
      if (snap.exists()) setConfigSlots(snap.data() as any);
    });

    const unsubClients = onSnapshot(collection(firestore, 'clients'), snap =>
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubInvoices = onSnapshot(collection(firestore, 'invoices'), snap =>
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubAvail(); unsubAppts(); unsubCfg(); unsubClients(); unsubInvoices(); };
  }, [firestore]);

  // Release drag on mouseup
  useEffect(() => {
    const up = () => isDrag && setIsDrag(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [isDrag]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isDayOpen = useCallback((dStr: string) =>
    availability.some(s => s.date === dStr && s.type === 'day_opened'), [availability]);

  const isSlotBlocked = useCallback((dStr: string, t: string) =>
    availability.some(s => s.date === dStr && s.time === t && s.type === 'blocked'), [availability]);

  const toggleDay = useCallback(async (dStr: string) => {
    if (!firestore) return;
    const existing = availability.find(s => s.date === dStr && s.type === 'day_opened');
    if (existing) await deleteDoc(doc(firestore, 'availability', existing.id));
    else await addDoc(collection(firestore, 'availability'), { date: dStr, type: 'day_opened' });
  }, [firestore, availability]);

  const toggleSlot = useCallback(async (dStr: string, t: string) => {
    if (!firestore) return;
    const existing = availability.find(s => s.date === dStr && s.time === t && s.type === 'blocked');
    if (existing) await deleteDoc(doc(firestore, 'availability', existing.id));
    else await addDoc(collection(firestore, 'availability'), { date: dStr, time: t, type: 'blocked' });
  }, [firestore, availability]);

  const period = (dir: number) => {
    const d = new Date(cur);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCur(d);
  };

  const openModal = (date: string, time: string) => {
    setEvModal({ date, time }); setEvStep('choice'); setEvName(''); setEvEmail(''); setEvPhone(''); setEvService('');
  };

  const saveBook = async () => {
    if (!evName.trim() || !firestore || !evModal || !evModal.date || !evModal.time) {
      alert("Veuillez remplir le nom du client.");
      return;
    }
    
    try {
      // 1. Check/Create Client
      let clientId = '';
      const existingClient = clients.find(c => 
        (c.firstName + ' ' + c.lastName).toLowerCase().trim() === evName.trim().toLowerCase()
      );

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const parts = evName.trim().split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        const clientRef = await addDoc(collection(firestore, 'clients'), {
          firstName: firstName,
          lastName: lastName || '',
          email: evEmail.trim(),
          phone: evPhone.trim(),
          createdAt: serverTimestamp(),
        });
        clientId = clientRef.id;
      }

      // 2. Create Appointment
      const apptId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const magicToken = Math.random().toString(36).substring(2, 15);
      const selectedSvc = SERVICES.find(s => s.id === evService);
      const appointmentData = {
        date: evModal.date,
        time: evModal.time,
        startTime: `${evModal.date}T${evModal.time}:00`,
        clientId: clientId,
        clientNameSnapshot: evName.trim(),
        clientEmail: evEmail.trim(),
        phone: evPhone.trim(),
        title: evName.trim(),
        serviceName: selectedSvc ? selectedSvc.name : '',
        serviceId: evService,
        price: selectedSvc ? selectedSvc.price : 150,
        status: 'confirmed',
        magicToken: magicToken,
        createdAt: serverTimestamp(),
      };

      // 3. Create Invoice
      const invoiceId = `INV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const svcPrice = selectedSvc ? selectedSvc.price : 150;
      const svcName  = selectedSvc ? selectedSvc.name : 'Soin Serenity (Manuel)';
      const invoiceData = {
        id: invoiceId,
        invoiceNumber: invoiceId,
        clientId: clientId,
        clientNameSnapshot: evName.trim(),
        issueDate: evModal.date,
        dueDate: evModal.date,
        totalAmount: svcPrice,
        status: 'Pending',
        appointmentId: apptId,
        items: [
          {
            description: svcName,
            amount: svcPrice,
            quantity: 1
          }
        ],
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', apptId), appointmentData),
        setDoc(doc(firestore, 'invoices', invoiceId), invoiceData)
      ]);

      setEvModal(null);
      setEvName('');
      setEvStep('choice');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réservation.");
    }
  };

  const saveBlock = async () => {
    if (!firestore || !evModal) return;
    await toggleSlot(evModal.date, evModal.time);
    setEvModal(null);
  };

  const deleteEvent = async () => {
    if (!firestore || !selectedAppt) return;
    if (!window.confirm('Voulez-vous vraiment supprimer ce rendez-vous ? Cette action est irréversible.')) return;
    try {
      await deleteDoc(doc(firestore, 'appointments', selectedAppt.id));
      setSelectedAppt(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const saveEdit = async () => {
    if (!selectedAppt || !editName.trim() || !firestore) return;
    try {
      await updateDoc(doc(firestore, 'appointments', selectedAppt.id), {
        clientNameSnapshot: editName.trim(),
        serviceName: editService.trim(),
        price: editPrice
      });

      // Update associated invoice
      const linkedInv = invoices.find(inv => inv.appointmentId === selectedAppt.id);
      if (linkedInv) {
        await updateDoc(doc(firestore, 'invoices', linkedInv.id), {
          totalAmount: editPrice,
          items: [{ description: editService.trim(), amount: editPrice }]
        });
      }

      setIsEditing(false);
      setSelectedAppt(null); // Close modal on success
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const resendEmail = async () => {
    if (!selectedAppt) return;
    setIsSending(true);
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          clientName: selectedAppt.clientNameSnapshot || selectedAppt.title,
          clientEmail: selectedAppt.clientEmail,
          clientPhone: selectedAppt.phone,
          serviceName: selectedAppt.serviceName,
          startTime: selectedAppt.startTime,
          magicToken: selectedAppt.magicToken,
          clientId: selectedAppt.clientId
        })
      });
      if (resp.ok) {
        alert("Confirmation renvoyée avec succès !");
      } else {
        alert("Erreur lors de l'envoi de l'email.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    } finally {
      setIsSending(false);
    }
  };

  const addSlot = () => {
    if (!newTime) return;
    setConfigSlots(p => {
      const a = p[cfgDay] || [];
      if (a.includes(newTime)) return p;
      return { ...p, [cfgDay]: [...a, newTime] };
    });
    setNewTime('');
  };

  const removeSlot = (t: string) =>
    setConfigSlots(p => ({ ...p, [cfgDay]: (p[cfgDay] || []).filter(s => s !== t) }));

  const applyToWeek = () => {
    const src = [...(configSlots[cfgDay] || [])];
    const n: Record<number, string[]> = {};
    for (let i = 0; i < 7; i++) n[i] = [...src];
    setConfigSlots(n);
  };

  const saveConfig = async () => {
    if (!firestore) return;
    setSavingCfg(true);
    await setDoc(doc(firestore, 'config', 'slots'), configSlots);
    setSavingCfg(false);
    setCfgOpen(false);
  };

  const saveClient = async () => {
    if (!firestore || !clForm.firstName || !clForm.lastName) return;
    setClScaling(true);
    await addDoc(collection(firestore, 'clients'), {
      ...clForm,
      createdAt: serverTimestamp(),
    });
    setClModal(false);
    setClForm({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '' });
    setClScaling(false);
  };

  const openClientFolder = (c: any) => {
    setSelectedClient(c);
    setClEditForm(c);
    setIsEditingClient(false);
    setTab('client-detail');
  };

  const saveClientEdit = async () => {
    if (!firestore || !selectedClient) return;
    setClScaling(true);
    await updateDoc(doc(firestore, 'clients', selectedClient.id), clEditForm);
    setSelectedClient({ ...selectedClient, ...clEditForm });
    setIsEditingClient(false);
    setClScaling(false);
  };

  // ── KPI calculations ─────────────────────────────────────────────────────
  const openDates = availability.filter(s => s.type === 'day_opened').map(s => s.date);
  const totalSlots = openDates.reduce((acc, ds) => acc + (configSlots[isoDay(new Date(ds))] || []).length, 0);
  const bookedCount = appointments.filter(e => openDates.includes(e.date)).length;

  const mKey = cur.toISOString().slice(0, 7);
  const monthRevenue = appointments.filter(e => (e.date || '').startsWith(mKey)).length * PRICE;

  const ws0   = wkStart(new Date());
  const wkDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(ws0); d.setDate(ws0.getDate() + i); return fmt(d); });
  const weekAppts = appointments.filter(e => wkDates.includes(e.date)).length;

  const upcoming = appointments
    .filter(e => e.date && new Date(e.date) >= startOfDay(new Date()))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 4);

  // Mini-calendar cells
  const mY = cur.getFullYear(), mM = cur.getMonth();
  const miniStart = startOfWeek(startOfMonth(cur), { weekStartsOn: 1 });
  const miniEnd   = endOfWeek(endOfMonth(cur), { weekStartsOn: 1 });
  const miniDays  = eachDayOfInterval({ start: miniStart, end: miniEnd });

  // Navigation header label
  let hdr = '';
  if (view === 'month') hdr = `${MONTHS_FR[cur.getMonth()]} ${cur.getFullYear()}`;
  else if (view === 'week') {
    const s = wkStart(new Date(cur)), e = new Date(s);
    e.setDate(s.getDate() + 6);
    hdr = `${s.getDate()} – ${e.getDate()} ${MONTHS_FR[e.getMonth()]} ${e.getFullYear()}`;
  } else hdr = fmtFR(cur);

  if (!isClient) return null;

  // ── VIEWS ─────────────────────────────────────────────────────────────────
  const MonthView = () => {
    const start = startOfWeek(startOfMonth(cur), { weekStartsOn: 1 });
    const end   = endOfWeek(endOfMonth(cur), { weekStartsOn: 1 });
    const days  = eachDayOfInterval({ start, end });

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 bg-white/50 border-b border-slate-100 shrink-0">
          {DAYS_S.map(l => <div key={l} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-[0.2em]">{l}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ gridAutoRows: 'minmax(105px, 1fr)' }}>
          {days.map((day, i) => {
            const dStr    = fmt(day);
            const isOpen  = isDayOpen(dStr);
            const isToday = isSameDay(new Date(), day);
            const inMonth = isSameMonth(day, cur);
            const daySlots = configSlots[isoDay(day)] || [];
            const booked   = appointments.filter(e => e.date === dStr).length;
            const free     = daySlots.length - booked;

            return (
              <div key={i}
                className={`day-cell-m p-5 border-r border-b border-slate-100 flex flex-col items-end gap-1 transition-all duration-300 relative cursor-pointer
                  ${!inMonth ? 'bg-slate-50/50 opacity-20 cursor-default' : 'hover:bg-blue-50/30'}
                  ${inMonth && isToday ? 'bg-blue-50/50' : ''}
                  ${inMonth && !isOpen ? 'day-closed-stripes' : ''}
                `}
                onMouseDown={e => {
                  if (!inMonth) return;
                  if (blockMode) {
                    setIsDrag(true);
                    setDragAct(isOpen ? 'close' : 'open');
                    toggleDay(dStr);
                    e.preventDefault();
                  }
                }}
                onMouseEnter={() => { if (isDrag && inMonth) toggleDay(dStr); }}
                onClick={() => { if (!blockMode && inMonth) { setCur(day); setView('week'); } }}
              >
                <span className={`text-[12px] font-black tracking-tighter ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-lg' : inMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                  {day.getDate()}
                </span>
                
                {inMonth && (
                  <div className="mt-auto w-full flex flex-col gap-1.5">
                    {isOpen ? (
                      <div className="flex items-center justify-between w-full">
                         <div className="flex flex-wrap gap-1">
                            {Array.from({ length: Math.min(booked, 3) }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"/>
                            ))}
                         </div>
                      </div>
                    ) : (
                      <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] text-right italic opacity-50">Fermé</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const s    = wkStart(new Date(cur));
    const days = Array.from({ length: 7 }, (_, i) => addDays(s, i));
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        <div className="grid grid-cols-7 border-b border-slate-100 shrink-0 bg-white">
          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            return (
              <div key={i} className={`py-6 text-center border-r border-slate-50 relative group transition-all`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{DAYS_S[i]}</p>
                <div className="flex flex-col items-center mt-2">
                   <p className={`text-2xl leading-none ${isToday ? 'text-blue-600' : 'text-slate-900 opacity-80'}`}>{d.getDate()}</p>
                   {isToday && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shadow-lg shadow-blue-200"/>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto bg-slate-50/30">
          {days.map((d, i) => {
            const dStr    = fmt(d);
            const isOpen  = isDayOpen(dStr);
            const slots   = [...(configSlots[isoDay(d)] || [])].sort();
            return (
              <div key={i}
                className={`border-r border-slate-100 p-4 flex flex-col gap-3 min-h-[600px] transition-all
                  ${!isOpen ? 'day-closed-stripes' : ''}
                `}
              >
                {isOpen ? slots.map(t => {
                  const ev       = appointments.find(e => e.date === dStr && e.time === t);
                  const blocked  = isSlotBlocked(dStr, t);
                  return (
                    <div key={t}
                      onClick={(e) => {
                        if (blockMode) return;
                        ev ? setSelectedAppt(ev) : blocked ? toggleSlot(dStr, t) : openModal(dStr, t);
                      }}
                      className={`week-slot p-4 rounded-2xl text-[11px] font-black border transition-all cursor-pointer shadow-sm
                        ${ev ? 'bg-blue-600 border-transparent text-white shadow-blue-200/50'
                          : blocked ? 'bg-slate-900 border-transparent text-white'
                            : 'bg-white border-slate-100 text-slate-900 hover:border-blue-400 hover:text-blue-600'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="opacity-80 tracking-tight">{t}</span>
                        {ev && <CheckCircle2 size={10}/>}
                        {blocked && <Lock size={10}/>}
                      </div>
                      {ev && <div className="mt-2 text-[9px] font-bold uppercase tracking-tight truncate opacity-90">{ev.clientNameSnapshot || ev.title}</div>}
                    </div>
                  );
                }) : (
                  <div className="flex-1 flex items-center justify-center opacity-10">
                    <Lock size={40} className="text-slate-900"/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };



  const Dashboard = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayAppts = appointments.filter(a => a.date === todayStr).sort((a,b) => (a.time || '').localeCompare(b.time || ''));
    const pendingPaymentsCount = appointments.filter(a => !a.paid).length;

    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-10 lg:p-14">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-medium tracking-tighter text-slate-900 leading-tight">Bonjour, <span className="font-black text-[#5F27CD]">Jean-Christophe</span></h2>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1">Plateforme Holistique Serenity & Relax</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-48 group">
                <div className="w-12 h-12 rounded-2xl kpi-accent-1 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><CalendarRange size={24}/></div>
                <div>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Aujourd'hui</p>
                   <p className="text-4xl font-black text-slate-900 leading-none">{todayAppts.length}</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-2">6 Heures de soins</p>
                </div>
              </div>
              <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-48 group">
                <div className="w-12 h-12 rounded-2xl kpi-accent-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Activity size={24}/></div>
                <div>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaire</p>
                   <p className="text-4xl font-black text-slate-900 leading-none">{todayAppts.reduce((s, a) => s + (a.price || PRICE), 0)}<span className="text-lg opacity-30 ml-1">CHF</span></p>
                   <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-2">+12% vs hier</p>
                </div>
              </div>
              <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-48 group">
                <div className="w-12 h-12 rounded-2xl kpi-accent-3 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Target size={24}/></div>
                <div>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Alertes Paiement</p>
                   <p className="text-4xl font-black text-slate-900 leading-none">{pendingPaymentsCount}</p>
                   <p className="text-[9px] font-bold text-rose-500 uppercase tracking-[0.2em] mt-2 animate-pulse">Action requise</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium tracking-tight">Timeline du Jour</h3>
                <button onClick={() => { setTab('scheduler'); setView('week'); }} className="text-[9px] font-black text-[#5F27CD] uppercase tracking-[0.3em] hover:opacity-70 transition">Accéder au planning complet</button>
              </div>

              <div className="space-y-4">
                {todayAppts.length > 0 ? todayAppts.map((appt, idx) => (
                  <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="group premium-card p-6 flex items-center gap-8 rounded-[2.5rem] transition-all duration-500 hover:border-[#5F27CD]/20 cursor-pointer overflow-hidden border-2 border-transparent">
                     <div className="w-20 shrink-0 text-center border-r border-slate-100 pr-8">
                        <p className="text-2xl font-black text-slate-900 leading-none">{appt.time}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">60 MIN</p>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                           <h4 className="text-xl font-medium text-slate-900 truncate tracking-tighter">{appt.title}</h4>
                           {!appt.paid && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-50"/>}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{appt.serviceName || 'Soin Signature'}</p>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#5F27CD] group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                        <ChevronRight size={20}/>
                     </div>
                  </div>
                )) : (
                  <div className="py-24 bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-100/50 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm"><Clock size={32} strokeWidth={1.5}/></div>
                    <p className="text-slate-400 font-bold italic tracking-tight text-sm">Aucune activité programmée pour aujourd'hui.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="premium-card p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"/>
               <h3 className="text-xl font-medium tracking-tighter mb-8 relative">Performance Hebdo</h3>
               <div className="space-y-8 relative">
                 <div className="flex items-center gap-6">
                    <CircProgress pct={78} cls="text-emerald-400"/>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupation</p>
                       <p className="text-xl font-black">78% de la capacité</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <CircProgress pct={92} cls="text-orange-400"/>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Satisfaction</p>
                       <p className="text-xl font-black">9.2 / 10 score</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="premium-card p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20">
               <h3 className="text-lg font-medium tracking-tight mb-8">Quick Actions</h3>
               <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => setClModal(true)} className="flex flex-col items-center gap-4 group">
                   <div className="w-16 h-16 rounded-[1.75rem] bg-[#54A0FF]/10 text-[#54A0FF] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#54A0FF] group-hover:text-white transition-all duration-500 shadow-inner shadow-[#54A0FF]/5"><Users size={24}/></div>
                   <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Patient</span>
                 </button>
                 <button onClick={() => { setTab('scheduler'); setView('week'); }} className="flex flex-col items-center gap-4 group">
                   <div className="w-16 h-16 rounded-[1.75rem] bg-[#5F27CD]/10 text-[#5F27CD] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#5F27CD] group-hover:text-white transition-all duration-500 shadow-inner shadow-[#5F27CD]/5"><CalendarRange size={24}/></div>
                   <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Agenda</span>
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AccountingView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = a.paid ? 'paid' : 'pending';
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      return matchSearch && matchStatus;
    }).sort((a,b) => (b.date || '').localeCompare(a.date || ''));

    const totalRevenue = filteredAppts.reduce((sum, a) => sum + (a.price || 150), 0);
    const paidRevenue = filteredAppts.filter(a => a.paid).reduce((sum, a) => sum + (a.price || 150), 0);
    const pendingRevenue = filteredAppts.filter(a => !a.paid).reduce((sum, a) => sum + (a.price || 150), 0);

    const [payingId, setPayingId] = useState<string | null>(null);

    const togglePayment = async (id: string, current: boolean, method?: string) => {
      try {
        const updateData: any = { paid: !current };
        if (!current) {
          updateData.paymentMethod = method || 'Inconnu';
        } else {
          updateData.paymentMethod = deleteField();
        }
        await updateDoc(doc(firestore, 'appointments', id), updateData);
        setPayingId(null);
      } catch (e) {
        console.error("Error updating payment", e);
      }
    };

    const exportToCSV = () => {
      const filtered = appointments.filter(a => {
        const status = a.paid ? 'paid' : 'pending';
        return filterStatus === 'all' || status === filterStatus;
      });
      const headers = ['Client', 'Date', 'Heure', 'Service', 'Montant', 'Statut'];
      const rows = filtered.map(a => [
        `"${a.title}"`,
        a.date,
        a.time,
        `"${a.serviceName || 'Soin Signature'}"`,
        (a.price || 150) + ' CHF',
        a.paid ? 'Réglé' : 'En attente'
      ]);
      const content = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `comptabilite_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">


        <div className="px-8 py-4 flex flex-col md:flex-row gap-4 shrink-0">
          <div className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-4 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all">
            <Search size={18} className="text-neutral-300"/>
            <input 
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un client..." 
              className="bg-transparent border-none text-sm font-bold w-full outline-none text-neutral-600 placeholder:text-neutral-300"
            />
          </div>
          <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
            {(['all', 'paid', 'pending'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`view-btn ${filterStatus === s ? 'active' : ''}`}>
                {s === 'all' ? 'Tous' : s === 'paid' ? 'Réglé' : 'Attente'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 py-2 pb-20">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  <th className="px-5 pb-2 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-neutral-300 transition-all cursor-pointer"
                      checked={selectedInvoices.length === filteredAppts.length && filteredAppts.length > 0}
                      onChange={e => setSelectedInvoices(e.target.checked ? filteredAppts.map(a => a.id) : [])}
                    />
                  </th>
                  <th className="px-5 pb-2">Patient</th>
                  <th className="px-5 pb-2">N° Facture</th>
                  <th className="px-5 pb-2">Date & Heure</th>
                  <th className="px-5 pb-2">Soin effecteur</th>
                  <th className="px-5 pb-2 text-right">Montant</th>
                  <th className="px-5 pb-2 text-center">Statut</th>
                  <th className="px-5 pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppts.map(a => {
                  const inv = invoices.find(inv => inv.appointmentId === a.id);
                  const isSel = selectedInvoices.includes(a.id);
                  return (
                    <tr 
                      key={a.id} 
                      className={`group transition-transform hover:scale-[1.01] cursor-pointer ${isSel ? 'bg-blue-50/30' : ''}`}
                      onClick={() => {
                        if (inv) window.open("/therapist/invoice/" + inv.id, "_blank");
                        else setSelectedAppt(a);
                      }}
                    >
                      <td className="p-4 bg-white border-y border-l border-neutral-100 rounded-l-[2rem] shadow-sm w-10" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-neutral-200 transition-all cursor-pointer"
                          checked={isSel}
                          onChange={() => {
                            if (isSel) setSelectedInvoices(p => p.filter(x => x !== a.id));
                            else setSelectedInvoices(p => [...p, a.id]);
                          }}
                        />
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        <div className="font-extrabold text-sm text-neutral-900 tracking-tight uppercase">{a.title}</div>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        {inv ? (
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">
                            #{inv.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest italic">N/A</span>
                        )}
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500">
                        {a.date} <span className="text-[10px] opacity-40 ml-2">{a.time}</span>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{a.serviceName || 'Soin Signature'}</div>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-right font-black text-neutral-900">
                        {a.price || 150} CHF
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-center">
                        {a.paid ? (
                          <div className="flex flex-col items-center gap-1 group/btn relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); togglePayment(a.id, true); }}
                              className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600"
                            >
                              Réglé via {a.paymentMethod || 'Inconnu'}
                            </button>
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-white text-[8px] font-bold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Cliquer pour annuler</span>
                          </div>
                        ) : payingId === a.id ? (
                          <div className="flex items-center justify-center gap-1 animate-in zoom-in-95 duration-200">
                            {(['Twint', 'Card', 'Cash'] as const).map(m => (
                              <button
                                key={m}
                                onClick={(e) => { e.stopPropagation(); togglePayment(a.id, false, m); }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  m === 'Twint' ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' :
                                  m === 'Card' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' :
                                  'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                } shadow-sm hover:scale-110 active:scale-90`}
                                title={m}
                              >
                                {m === 'Twint' ? <Smartphone size={14}/> : m === 'Card' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                              </button>
                            ))}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPayingId(null); }}
                              className="w-8 h-8 rounded-lg bg-neutral-50 text-neutral-400 flex items-center justify-center hover:bg-neutral-100"
                            >
                              <X size={14}/>
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPayingId(a.id); }}
                            className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-rose-50 text-rose-500 animate-pulse hover:bg-rose-500 hover:text-white"
                          >
                            Non Réglé
                          </button>
                        )}
                      </td>
                      <td className="p-4 bg-white border-y border-r border-neutral-100 rounded-r-[2rem] shadow-sm text-right">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 group-hover:bg-[#54A0FF] group-hover:text-white text-neutral-400 transition-all flex items-center justify-center mx-auto shadow-sm">
                          <FileText size={16}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredAppts.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-neutral-200">
                <CreditCard size={32}/>
              </div>
              <p className="text-neutral-400 font-bold italic">Aucune donnée correspondant aux critères.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PatientsView = () => {
    const filtered = clients.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(clSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(clSearch.toLowerCase())
    );

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">


        <div className="flex-1 overflow-auto px-8 py-2 pb-20">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  <th className="px-5 pb-2">Patient</th>
                  <th className="px-5 pb-2">Contact Email</th>
                  <th className="px-5 pb-2">Téléphone</th>
                  <th className="px-5 pb-2">Assurance</th>
                  <th className="px-5 pb-2 text-center">Séances</th>
                  <th className="px-5 pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sessions = appointments.filter(a => a.clientId === c.id || a.title === `${c.firstName} ${c.lastName}`).length;
                  return (
                    <tr 
                      key={c.id} 
                      className="group transition-transform hover:scale-[1.01] cursor-pointer"
                      onClick={() => openClientFolder(c)}
                    >
                      <td className="p-4 bg-white border-y border-l border-neutral-100 rounded-l-[2rem] shadow-sm">
                           <div className="font-extrabold text-sm text-neutral-900 tracking-tight uppercase">{c.firstName} {c.lastName}</div>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500">
                        {c.email}
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500">
                        {c.phone}
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        <span className="px-3 py-1 bg-neutral-50 text-neutral-400 rounded-lg text-[10px] font-black border border-neutral-100 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                          {c.insurance || '—'}
                        </span>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-center font-black text-neutral-900">
                        {sessions}
                      </td>
                      <td className="p-4 bg-white border-y border-r border-neutral-100 rounded-r-[2rem] shadow-sm text-right">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 group-hover:bg-indigo-600 group-hover:text-white text-neutral-400 transition-all flex items-center justify-center mx-auto shadow-sm">
                          <ChevronRight size={16}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-neutral-200">
                <Users size={32}/>
              </div>
              <p className="text-neutral-400 font-bold italic">Aucun patient trouvé.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hydration guard & Loading state
  const ClientFolderView = () => {
    if (!selectedClient) return null;
    return (
      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Info Column */}
           <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-[#222F3E] tracking-tighter uppercase font-black tracking-widest text-[10px]">Informations</h3>
                </div>
                
                {!isEditingClient ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'email', label: 'Email', val: selectedClient.email, icon: <Mail size={14}/>, color: 'text-[#54A0FF]', bg: 'bg-[#54A0FF]/5', border: 'border-[#54A0FF]/10' },
                      { key: 'phone', label: 'Téléphone', val: selectedClient.phone, icon: <Activity size={14}/>, color: 'text-[#1DD1A1]', bg: 'bg-[#1DD1A1]/5', border: 'border-[#1DD1A1]/10' },
                      { key: 'address', label: 'Adresse', val: selectedClient.address, icon: <Target size={14}/>, color: 'text-[#FF9F43]', bg: 'bg-[#FF9F43]/5', border: 'border-[#FF9F43]/10' },
                      { key: 'insurance', label: 'Assurance', val: selectedClient.insurance, icon: <CheckCircle2 size={14}/>, color: 'text-[#5F27CD]', bg: 'bg-[#5F27CD]/5', border: 'border-[#5F27CD]/10' },
                    ].map((it, i) => (
                      <div 
                        key={i} 
                        onDoubleClick={() => { setClEditForm(selectedClient); setIsEditingClient(true); }}
                        className={`p-4 ${it.bg} rounded-2xl border ${it.border} flex flex-col justify-center min-h-[80px] shadow-sm cursor-text hover:border-neutral-300 transition-all`}
                      >
                         <div className={`flex items-center gap-2 text-[9px] font-black ${it.color} uppercase tracking-[0.2em] mb-1.5`}>
                            {it.icon} {it.label}
                         </div>
                         <p className="text-[11px] font-bold text-[#222F3E] truncate" title={it.val}>{it.val || '—'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <input value={clEditForm.firstName} onChange={e => setClEditForm({...clEditForm, firstName: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Prénom"/>
                    <input value={clEditForm.lastName} onChange={e => setClEditForm({...clEditForm, lastName: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Nom"/>
                    <input value={clEditForm.email} onChange={e => setClEditForm({...clEditForm, email: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Email"/>
                    <input value={clEditForm.phone} onChange={e => setClEditForm({...clEditForm, phone: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Téléphone"/>
                    <input value={clEditForm.address} onChange={e => setClEditForm({...clEditForm, address: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Adresse"/>
                    <input value={clEditForm.insurance} onChange={e => setClEditForm({...clEditForm, insurance: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Assurance"/>
                    <div className="flex gap-4">
                      <button onClick={() => setIsEditingClient(false)} className="flex-1 py-4 bg-neutral-100 text-neutral-400 rounded-xl font-bold text-xs uppercase">Annuler</button>
                      <button onClick={saveClientEdit} disabled={clScaling} className="flex-2 py-4 bg-gradient-to-r from-[#341F97] to-[#5F27CD] text-white rounded-xl font-bold text-sm shadow-xl shadow-[#5F27CD]/20">
                        {clScaling ? '...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-[#5F27CD]/10 grid grid-cols-2 gap-4">
                <button onClick={() => alert('Confirmation envoyée')} className="py-4 bg-[#54A0FF] text-white rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-[#54A0FF]/20 hover:scale-[1.05] transition-all flex items-center justify-center gap-2 px-2">
                  <Mail size={12}/> Confirm.
                </button>
                <button onClick={() => alert('Facture générée')} className="py-4 bg-[#5F27CD] text-white rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-[#5F27CD]/20 hover:scale-[1.05] transition-all flex items-center justify-center gap-2 px-2">
                  <FileText size={12}/> Factures
                </button>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between border-b border-[#5F27CD]/5 pb-4">
                 <h3 className="text-xl font-medium text-[#222F3E] tracking-tighter flex items-center gap-3"><Clock size={20} className="text-[#5F27CD]"/> Parcours Patient</h3>
                 <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">Chronologie des séances</p>
              </div>
              <div className="space-y-4">
                {appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` || a.clientId === selectedClient.id).length > 0 ? (
                  appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` || a.clientId === selectedClient.id)
                    .sort((a,b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
                    .map(a => {
                      const isFut = new Date(a.date) >= startOfDay(new Date());
                      return (
                        <div 
                          key={a.id} 
                          className={`group p-6 bg-white border ${isFut ? 'border-blue-100 shadow-md' : 'border-neutral-100'} rounded-[2rem] hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between gap-6`}
                          onClick={() => { setSelectedAppt(a); setIsEditing(false); }}
                        >
                           <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${isFut ? 'bg-blue-50 text-blue-600' : 'bg-neutral-50 text-neutral-400'}`}>
                                 {a.time?.split(':')[0]}
                              </div>
                              <div>
                                 <p className="font-black text-lg text-neutral-900 tracking-tight leading-none mb-2">{a.date}</p>
                                 <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{a.serviceName || 'Soin Signature'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              {a.paid && <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[8px] font-black uppercase tracking-widest">Payé</span>}
                              <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isFut ? 'bg-blue-600 text-white border-blue-600' : 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}>
                                 {isFut ? 'À Venir' : 'Honoré'}
                              </span>
                           </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-20 text-center bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
                    <p className="text-xs text-[#576574] italic font-bold uppercase tracking-widest opacity-40">Aucune activité enregistrée</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  };

  if (!isClient || isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neutral-300/30 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen overflow-hidden text-[#222F3E]" style={{ background: '#F8F9FA', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        
        .premium-card { 
          background: white; 
          border: 1px solid rgba(0,0,0,0.03); 
          box-shadow: 0 10px 40px rgba(0,0,0,0.02); 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08); }
        
        .sidebar-r { 
          background: linear-gradient(165deg, #448AFF, #2979FF, #1565C0); 
          box-shadow: -20px 0 80px rgba(68,138,255,0.1); 
        }
        
        .glass-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .glass-btn:hover { background: rgba(255,255,255,0.25); }
        
        .nav-pill { 
          border-radius: 1.25rem; 
          padding: 12px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 6px; 
          transition: all 0.3s; 
          width: 72px; 
          color: #94A3B8;
        }
        .nav-pill.active { background: #F1F5F9; color: #2563EB; }
        .nav-pill.active svg { color: #2563EB !important; }
        
        .kpi-accent-1 { background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); color: #0369A1; }
        .kpi-accent-2 { background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); color: #15803D; }
        .kpi-accent-3 { background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); color: #B91C1C; }
        .kpi-accent-4 { background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%); color: #7E22CE; }

        .mini-d { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin: auto; }
        .mini-d:hover:not(.today) { background: rgba(255,255,255,0.15); }
        .mini-d.today { background: white; color: #2563EB !important; font-weight: 900; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .view-btn { padding: 8px 20px; border-radius: 14px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s; color: #64748B; background: transparent; }
        .view-btn.active { background: white; color: #2563EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .day-closed-stripes {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            rgba(203,213,225,0.35) 8px,
            rgba(203,213,225,0.35) 16px
          );
        }
      `}</style>

      <aside className="w-24 bg-white border-r border-slate-100 flex flex-col items-center py-10 gap-2 shrink-0 z-20 shadow-[20px_0_60px_rgba(0,0,0,0.02)]">
        <div className="w-12 h-12 bg-gradient-to-br from-[#341F97] to-[#5F27CD] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#5F27CD]/20 mb-8">
          <Leaf size={24} strokeWidth={2.5}/>
        </div>
        
        {([
          { id: 'dashboard',  Icon: LayoutDashboard, label: 'Tableau' },
          { id: 'scheduler',  Icon: CalendarRange,   label: 'Agenda' },
          { id: 'clients',    Icon: Users,           label: 'Patients' },
          { id: 'accounting', Icon: CreditCard,      label: 'Compta' },
        ] as const).map(n => (
          <button key={n.id} onClick={() => setTab(n.id as any)} className={`
            nav-pill w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300
            ${tab === n.id ? 'bg-[#5F27CD]/5 text-[#5F27CD] shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
          `}>
             <n.Icon size={22} strokeWidth={tab === n.id ? 2.5 : 2}/>
             <span className="text-[8px] font-black uppercase tracking-widest">{n.label}</span>
          </button>
        ))}

        <div className="mt-auto space-y-4">
          <button onClick={() => setCfgOpen(true)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"><Settings size={22}/></button>
          <button onClick={() => auth?.signOut()} className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition shadow-sm"><Power size={20}/></button>
        </div>
      </aside>

      {/* ══ CONTENT & SIDE PANEL ══════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${selectedAppt ? 'mr-[450px]' : ''}`}>
           <nav className="h-24 border-b border-slate-100 px-10 flex items-center justify-between bg-white shrink-0 relative shadow-sm">
             <div className="flex items-center gap-10 flex-1">
               <div className="flex items-center gap-6">
                  {tab === 'client-detail' && (
                    <button onClick={() => setTab('clients')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#5F27CD] hover:text-white transition-all flex items-center justify-center shadow-sm">
                      <ChevronRight size={20} className="rotate-180"/>
                    </button>
                  )}
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase">
                    {tab === 'scheduler' ? format(cur, 'MMMM yyyy', { locale: fr }) : tab === 'clients' ? 'PATIENTS' : tab === 'accounting' ? 'COMPTABILITÉ' : tab === 'client-detail' ? `${selectedClient?.firstName} ${selectedClient?.lastName}` : 'DASHBOARD'}
                  </h1>
               </div>

               {tab === 'clients' && (
                 <div className="flex-1 max-w-2xl mx-auto animate-in slide-in-from-top-2 duration-500">
                   <div className="bg-neutral-50 rounded-2xl px-5 py-2.5 border border-neutral-100 flex items-center gap-4 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all shadow-inner">
                     <Search size={16} className="text-neutral-300"/>
                     <input 
                       type="text" value={clSearch} onChange={e => setClSearch(e.target.value)}
                       placeholder="RECHERCHER UN PATIENT..." 
                       className="bg-transparent border-none text-[10px] font-black w-full outline-none text-neutral-600 placeholder:text-neutral-300 tracking-widest"
                     />
                   </div>
                 </div>
               )}
                 
                 {tab === 'accounting' && (
                   <div className="flex items-center gap-2">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                       <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">{appointments.filter(a => !a.paid).length} Factures en retard</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appointments.filter(a => a.paid).length} En règlements</span>
                     </div>
                   </div>
                 )}
               {tab === 'scheduler' && (
                 <button 
                   onClick={() => { setBlockMode(!blockMode); if (!blockMode) setView('month'); }}
                   className={`py-3 px-6 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.15em] transition-all border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600 ring-4 ring-emerald-50' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-indigo-600'}`}
                 >
                   {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                   {blockMode ? "Confirmer" : 'Éditer Planning'}
                 </button>
               )}
             </div>

             <div className="flex items-center gap-4">
              {tab === 'clients' && (
                <button 
                  onClick={() => setClModal(true)} 
                  className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-95 transition-all"
                >
                  <Plus size={16}/> Nouveau Patient
                </button>
              )}
              {tab === 'accounting' && selectedInvoices.length > 0 && (
                <button 
                  onClick={() => {
                    const filtered = appointments.filter(a => selectedInvoices.includes(a.id));
                    const headers = ['Client', 'Date', 'Heure', 'Service', 'Montant', 'Statut'];
                    const rows = filtered.map(a => [`"${a.title}"`, a.date, a.time, `"${a.serviceName || 'Soin'}"`, (a.price || 150), a.paid ? 'Réglé' : 'Attente']);
                    const content = [headers, ...rows].map(e => e.join(',')).join('\n');
                    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a'); link.href = url; link.download = `compta_${format(new Date(),'yyyy-MM-dd')}.csv`; link.click();
                  }}
                  className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:scale-[1.05] active:scale-95 transition-all animate-in slide-in-from-right"
                >
                  <Download size={16}/> Exporter ({selectedInvoices.length})
                </button>
              )}

               {tab === 'scheduler' && (
                 <div className="flex items-center gap-1">
                   <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mr-4">
                     {(['month', 'week'] as const).map(v => (
                       <button key={v} onClick={() => setView(v)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                         {v === 'month' ? 'Mois' : 'Semaine'}
                       </button>
                     ))}
                   </div>
                   <button onClick={() => period(-1)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 border border-transparent hover:border-slate-100 transition-all"><ChevronLeft size={20}/></button>
                   <button onClick={() => setCur(new Date())} className="px-5 py-2.5 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all tracking-widest mx-2">Aujourd'hui</button>
                   <button onClick={() => period(1)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 border border-transparent hover:border-slate-100 transition-all"><ChevronRight size={20}/></button>




                 </div>
               )}
             </div>
           </nav>

           <div className="flex-1 overflow-hidden flex flex-col">
             {tab === 'scheduler' ? (view === 'month' ? <MonthView/> : <WeekView/>) : 
              tab === 'clients' ? <PatientsView/> : 
              tab === 'accounting' ? <AccountingView/> : 
              tab === 'client-detail' ? <ClientFolderView /> : 
              <Dashboard/>}
           </div>
        </main>

        {/* ══ SLIDE-OVER DETAIL PANEL ══════════════════════════════════════════ */}
        <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-40 transform transition-transform duration-500 ease-in-out border-l border-slate-100 flex flex-col ${selectedAppt ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedAppt && (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
                 <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-[#5F27CD] uppercase tracking-[0.3em]">Détail Réservation</p>
                    <button onClick={() => setSelectedAppt(null)} className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition text-slate-300"><X size={20}/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-10 space-y-10">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-[#5F27CD]/5 flex items-center justify-center text-[#5F27CD] text-2xl font-black">
                          {selectedAppt.time?.split(':')[0]}
                       </div>
                       <div>
                          <h2 className="text-2xl font-medium tracking-tighter text-slate-900">{selectedAppt.clientNameSnapshot || selectedAppt.title}</h2>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{fmtFR(new Date(selectedAppt.date))}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Soin', val: selectedAppt.serviceName || 'Soin Signature', icon: <Leaf size={14}/> },
                         { label: 'Prix', val: `${selectedAppt.price || 150} CHF`, icon: <CreditCard size={14}/> },
                         { label: 'Contact', val: selectedAppt.phone || 'Non renseigné', icon: <Activity size={14}/> },
                         { label: 'Statut', val: selectedAppt.paid ? 'Réglé' : 'À régler', icon: <CheckCircle2 size={14}/>, color: selectedAppt.paid ? 'text-emerald-500' : 'text-orange-500' }
                       ].map((it, i) => (
                         <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{it.icon} {it.label}</div>
                            <p className={`text-xs font-bold ${it.color || 'text-slate-900'}`}>{it.val}</p>
                         </div>
                       ))}
                    </div>

                    <div className="pt-10 border-t border-slate-100 space-y-4">
                       <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all">Modifier le Contact</button>
                       <button onClick={deleteEvent} className="w-full py-4 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition">Annuler le Rendez-vous</button>
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>
      {/* ══ EVENT MODAL ══════════════════════════════════════════════════════ */}
      {evModal && (
        <div className="fixed inset-0 bg-[#222F3E]/40 overflow-y-auto flex items-center justify-center z-[90] p-6 backdrop-blur-xl transition-all duration-500" onClick={() => setEvModal(null)}>
          <div className="bg-white/95 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-full max-w-xl p-14 relative overflow-hidden border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-medium text-slate-900 tracking-tighter">Gestion Créneau</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">{fmtFR(new Date(evModal.date))} à {evModal.time}</p>
              </div>
              <button onClick={() => setEvModal(null)} className="bg-slate-50 p-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-sm"><X size={24}/></button>
            </div>
            {evStep === 'choice' ? (
              <div className="grid grid-cols-2 gap-8">
                <button onClick={() => setEvStep('book')} className="premium-card p-10 rounded-[2.5rem] flex flex-col items-center gap-6 group">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.75rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner shadow-blue-100/50"><Users size={32}/></div>
                  <div className="text-center">
                    <div className="font-black text-sm uppercase tracking-[0.1em] text-slate-900 group-hover:text-blue-600 transition-colors">Réserver Client</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Nouveau ou existant</div>
                  </div>
                </button>
                <button onClick={saveBlock} className="premium-card p-10 rounded-[2.5rem] flex flex-col items-center gap-6 group">
                  <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-[1.75rem] flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner shadow-slate-200/50"><Lock size={32}/></div>
                  <div className="text-center">
                    <div className="font-black text-sm uppercase tracking-[0.1em] text-slate-900 group-hover:text-slate-900 transition-colors">Bloquer</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Temps personnel</div>
                  </div>
                </button>
              </div>
            ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Nom du client</label>
                    <input
                      autoFocus value={evName}
                      onChange={e => setEvName(e.target.value)}
                      className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all placeholder:text-[#576574]/40"
                      placeholder="Nom Complet"
                    />
                    {evName && clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-neutral-100 rounded-2xl bg-white shadow-sm mt-2 p-1">
                        {clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).map(c => (
                          <button key={c.id} onClick={() => { setEvName(`${c.firstName} ${c.lastName}`); setEvEmail(c.email || ''); setEvPhone(c.phone || ''); }} className="w-full p-3 text-left hover:bg-[#54A0FF]/10 rounded-xl flex items-center justify-between group transition-colors">
                            <div>
                              <p className="text-[11px] font-black text-[#222F3E]">{c.firstName} {c.lastName}</p>
                              <p className="text-[9px] font-bold text-[#576574] uppercase tracking-[0.2em]">{c.phone || c.email}</p>
                            </div>
                            <ChevronRight size={14} className="text-[#54A0FF] opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all"/>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Email (Optionnel)</label>
                      <input
                        value={evEmail}
                        onChange={e => setEvEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Tél (Optionnel)</label>
                      <input
                        value={evPhone}
                        onChange={e => setEvPhone(e.target.value)}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Prestation</label>
                    <select
                      value={evService}
                      onChange={e => setEvService(e.target.value)}
                      className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Choisir une prestation</option>
                      {SERVICES.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name.split(' - ')[0]} — {s.price} CHF
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Date</label>
                    <div className="px-4 py-3 bg-[#54A0FF]/5 rounded-xl text-xs font-bold text-[#54A0FF]">{evModal.date}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Heure</label>
                    <div className="px-4 py-3 bg-[#54A0FF]/5 rounded-xl text-xs font-bold text-[#54A0FF]">{evModal.time}</div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setEvStep('choice')} className="flex-1 py-4 text-xs font-black text-[#576574] uppercase tracking-[0.2em] hover:text-[#222F3E] transition-colors">Retour</button>
                  <button onClick={saveBook} className="flex-1 py-4 bg-gradient-to-r from-[#54A0FF] to-[#5F27CD] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#54A0FF]/25 hover:scale-[1.02] active:scale-95 transition-all">Confirmer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ APPOINTMENT DETAIL/EDIT MODAL ═══════════════════════════════════ */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-[95] p-4 backdrop-blur-md" onClick={() => setSelectedAppt(null)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border-2 border-[#54A0FF]/10" onClick={e => e.stopPropagation()}>
            <div className="h-32 bg-gradient-to-r from-[#54A0FF] to-[#5F27CD] p-8 flex flex-col justify-end relative">
               <button onClick={() => { setSelectedAppt(null); setIsEditing(false); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition"><X size={20}/></button>
               <h2 className="text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Détails du RDV</h2>
               <p className="text-2xl font-black text-white truncate">{selectedAppt.title}</p>
            </div>
            
            <div className="p-8 space-y-6">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#54A0FF]/5 rounded-2xl border border-[#54A0FF]/10">
                      <p className="text-[9px] font-black text-[#576574] uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-bold text-[#222F3E]">{selectedAppt.date}</p>
                    </div>
                    <div className="p-4 bg-[#54A0FF]/5 rounded-2xl border border-[#54A0FF]/10">
                      <p className="text-[9px] font-black text-[#576574] uppercase tracking-wider mb-1">Heure</p>
                      <p className="text-sm font-bold text-[#222F3E]">{selectedAppt.time}</p>
                    </div>

                    {(selectedAppt.serviceName || selectedAppt.price) && (
                      <div className="col-span-2 p-4 bg-[#54A0FF]/5 rounded-2xl border border-[#54A0FF]/10">
                        <p className="text-[9px] font-black text-[#576574] uppercase tracking-wider mb-1">Prestation</p>
                        <p className="text-sm font-bold text-[#222F3E] flex justify-between items-center">
                          <span>{selectedAppt.serviceName || 'Soin Signature'}</span>
                          <span className="text-[#54A0FF]">{selectedAppt.price || 150} CHF</span>
                        </p>
                      </div>
                    )}

                    {selectedAppt.phone && (
                      <div className="col-span-2 p-4 bg-[#54A0FF]/5 rounded-2xl border border-[#54A0FF]/10 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] font-black text-[#576574] uppercase tracking-wider mb-1">Contact</p>
                          <p className="text-sm font-bold text-[#222F3E]">{selectedAppt.phone}</p>
                        </div>
                        <a 
                          href={`https://wa.me/${selectedAppt.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-[#1DD1A1] text-white flex items-center justify-center hover:scale-110 transition shadow-lg shadow-[#1DD1A1]/20"
                        >
                          <MessageCircle size={18}/>
                        </a>
                      </div>
                    )}

                    <div className="col-span-2 p-4 bg-[#54A0FF]/5 rounded-2xl border border-[#54A0FF]/10 flex justify-between items-center transition-all">
                      <div>
                        <p className="text-[9px] font-black text-[#576574] uppercase tracking-wider mb-1">État du Paiement</p>
                        <p className={`text-sm font-black uppercase tracking-[0.05em] flex items-center gap-2 ${selectedAppt.paid ? 'text-[#1DD1A1]' : 'text-[#FECA57]'}`}>
                          <span className={`w-2 h-2 rounded-full ${selectedAppt.paid ? 'bg-[#1DD1A1]' : 'bg-[#FECA57]'}`}/>
                          {selectedAppt.paid ? 'Réglé' : 'En attente'}
                        </p>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            await updateDoc(doc(firestore, 'appointments', selectedAppt.id), { paid: !selectedAppt.paid });
                            setSelectedAppt({ ...selectedAppt, paid: !selectedAppt.paid });
                          } catch (e) { console.error(e); }
                        }}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedAppt.paid ? 'bg-[#576574]/10 text-[#576574] hover:bg-[#576574]/20' : 'bg-[#1DD1A1] text-white shadow-lg shadow-[#1DD1A1]/20 hover:scale-[1.05]'
                        }`}
                      >
                        {selectedAppt.paid ? 'Marquer Attente' : 'Marquer Réglé'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <button 
                      onClick={() => { 
                        setIsEditing(true); 
                        setEditName(selectedAppt.clientNameSnapshot || selectedAppt.title); 
                        setEditService(selectedAppt.serviceName || 'Soin Signature');
                        setEditPrice(selectedAppt.price || 150);
                      }} 
                      className="w-full py-4 bg-gradient-to-r from-[#54A0FF] to-[#0ABDE3] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#54A0FF]/25 hover:scale-[1.02] transition-all"
                    >
                      Modifier le rendez-vous
                    </button>
                    <button 
                      onClick={resendEmail} 
                      disabled={isSending || !selectedAppt.clientEmail}
                      className="w-full py-4 bg-white border border-neutral-100 text-neutral-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-3"
                    >
                      {isSending ? 'Envoi...' : 'Renvoyer Confirmation'}
                    </button>
                    <button onClick={deleteEvent} className="w-full py-4 text-xs font-black text-[#FF6B6B] uppercase tracking-widest hover:bg-[#FF6B6B]/10 rounded-2xl transition">
                      Supprimer le rendez-vous
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Nom du client</label>
                      <input 
                        autoFocus value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Prestation</label>
                      <select 
                        value={editService}
                        onChange={e => {
                          const svc = SERVICES.find(s => s.name === e.target.value);
                          setEditService(e.target.value);
                          if(svc && svc.price) setEditPrice(svc.price);
                        }}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all appearance-none"
                      >
                         <option value="" disabled>Choisir une prestation</option>
                         {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name.split(' - ')[0]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Prix (CHF)</label>
                      <input 
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] hover:text-[#222F3E] transition">Annuler</button>
                      <button onClick={saveEdit} className="flex-1 py-4 bg-[#222F3E] text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-[#341F97] transition-all">Enregistrer</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ CONFIG MODAL ═════════════════════════════════════════════════════ */}
      {cfgOpen && (
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-50 p-4 backdrop-blur-md" onClick={() => setCfgOpen(false)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden border-2 border-[#FECA57]/10" onClick={e => setCfgOpen(false)}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FECA57] to-[#FF9F43]"/>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-medium text-[#222F3E] tracking-tighter">Horaires Types</h2>
                <p className="text-[10px] font-bold text-[#576574] uppercase tracking-[0.2em] mt-1">Configuration des créneaux</p>
              </div>
              <button onClick={() => setCfgOpen(false)} className="bg-[#FECA57]/10 p-3 rounded-2xl text-[#FF9F43] hover:bg-[#FECA57] hover:text-white transition-all"><X size={20}/></button>
            </div>
            <div className="flex border-b border-[#54A0FF]/10 mb-6 gap-1 overflow-x-auto">
              {DAYS_S.map((d, i) => (
                <button key={i} onClick={() => setCfgDay(i)}
                  className={`pb-3 px-3 text-[10px] font-black tracking-[0.2em] uppercase border-b-2 transition whitespace-nowrap ${cfgDay === i ? 'border-[#54A0FF] text-[#54A0FF]' : 'border-transparent text-[#576574] hover:text-[#222F3E]'}`}
                >{d}</button>
              ))}
            </div>
            <div className="space-y-2 mb-6 max-h-52 overflow-y-auto pr-1">
              {[...(configSlots[cfgDay] || [])].sort().map(s => (
                <div key={s} className="flex justify-between items-center p-3 bg-[#54A0FF]/5 rounded-xl border border-[#54A0FF]/10">
                  <span className="text-sm font-bold text-[#222F3E]">{s}</span>
                  <button onClick={() => removeSlot(s)} className="text-[#FF6B6B] hover:scale-125 transition-transform"><X size={16}/></button>
                </div>
              ))}
              {(configSlots[cfgDay] || []).length === 0 && (
                <p className="text-center py-4 text-xs text-[#576574] italic font-bold">Aucun créneau configuré</p>
              )}
            </div>
            <div className="flex gap-2 mb-8">
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"/>
              <button onClick={addSlot} className="bg-[#54A0FF] text-white px-6 rounded-xl font-bold text-sm hover:bg-[#222F3E] transition-all">Ajouter</button>
            </div>
            <div className="flex flex-col gap-3 pt-5 border-t border-[#54A0FF]/10">
              <button onClick={applyToWeek} className="text-xs text-[#576574] font-bold hover:text-[#54A0FF] py-2 rounded-lg transition-colors uppercase tracking-[0.2em]">
                Appliquer à toute la semaine
              </button>
              <button onClick={saveConfig} disabled={savingCfg}
                className="w-full py-4 bg-gradient-to-r from-[#54A0FF] to-[#5F27CD] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#54A0FF]/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
                {savingCfg ? 'Enregistrement…' : 'Enregistrer & Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ ADD CLIENT MODAL ═════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-12 relative overflow-hidden border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-medium text-[#222F3E] tracking-tighter">Nouveau Patient</h2>
                <p className="text-[10px] font-bold text-[#576574] uppercase tracking-[0.2em] mt-2">Création d'une fiche signalétique</p>
              </div>
              <button onClick={() => setClModal(false)} className="bg-neutral-50 p-4 rounded-2xl text-neutral-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Prénom</label>
                <input value={clForm.firstName} onChange={e => setClForm({...clForm, firstName: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Prénom"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Nom</label>
                <input value={clForm.lastName} onChange={e => setClForm({...clForm, lastName: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Nom"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Email</label>
                <input value={clForm.email} onChange={e => setClForm({...clForm, email: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="email@exemple.com"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Téléphone</label>
                <input value={clForm.phone} onChange={e => setClForm({...clForm, phone: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="+41..."/>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Adresse</label>
                <input value={clForm.address} onChange={e => setClForm({...clForm, address: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Adresse complète"/>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Assurance / Groupe</label>
                <input value={clForm.insurance} onChange={e => setClForm({...clForm, insurance: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Ex: Groupe Mutuel, Helsana..."/>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setClModal(false)} className="flex-1 py-4 text-xs font-black text-[#576574] uppercase tracking-[0.2em] hover:text-[#222F3E] transition-colors">Annuler</button>
              <button onClick={saveClient} disabled={clScaling} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">
                {clScaling ? 'Création...' : 'Créer le Dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
