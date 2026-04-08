'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CalendarRange, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2,
  X, Trash2, Clock, Plus, Cog, Power, Mail, FileText, History, User, CreditCard, Download, MessageCircle, MessageSquare, Edit3, ArrowUpRight
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, startOfDay, addDays, getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirestore, useAuth, useUser } from '@/firebase';
import {
  collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc, setDoc, serverTimestamp
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
const fmtFR  = (d: Date) => format(d, 'd MMMM yyyy', { locale: fr });
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
  const [tab,  setTab]  = useState<'dashboard' | 'scheduler' | 'clients' | 'settings' | 'accounting'>('scheduler');
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
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCur(d);
  };

  const openModal = (date: string, time: string) => {
    setEvModal({ date, time }); setEvStep('choice'); setEvName(''); setEvEmail(''); setEvPhone('');
  };

  const saveBook = async () => {
    if (!evName.trim() || !firestore || !evModal) return;
    
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
      const appointmentData = {
        date: evModal.date,
        time: evModal.time,
        startTime: `${evModal.date}T${evModal.time}:00`,
        clientId: clientId,
        clientNameSnapshot: evName.trim(),
        clientEmail: evEmail.trim(), // Added email
        phone: evPhone.trim(), // Added phone
        title: evName.trim(),
        price: 150, // Default price
        status: 'confirmed',
        magicToken: magicToken,
        createdAt: serverTimestamp(),
      };

      // 3. Create Invoice
      const invoiceId = `INV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const invoiceData = {
        id: invoiceId,
        invoiceNumber: invoiceId,
        clientId: clientId,
        clientNameSnapshot: evName.trim(),
        issueDate: evModal.date,
        dueDate: evModal.date,
        totalAmount: 150,
        status: 'Pending',
        appointmentId: apptId,
        items: [
          {
            description: 'Soin Serenity (Manuel)',
            amount: 150,
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
                onClick={() => { if (!blockMode && inMonth) { setCur(day); setView('day'); } }}
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
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {free > 0 ? `${free} Libre` : 'Plein'}
                         </span>
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

  const DayView = () => {
    const dStr   = fmt(cur);
    const isOpen = isDayOpen(dStr);
    const dSlots  = [...(configSlots[isoDay(cur)] || [])].sort();
    const dayName = format(cur, 'EEEE', { locale: fr });
    const dayName2 = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Détail du planning</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">
                <span className="font-medium">{dayName2}</span>{' '}
                <span className="text-blue-600">{cur.getDate()}</span>
              </h3>
           </div>
           <div className="flex items-center gap-3">
              {isOpen && (
                <button
                  onClick={() => openModal(dStr, (configSlots[isoDay(cur)] || [])[0] || '09:00')}
                  className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <Plus size={18}/>
                </button>
              )}
              <button 
                onClick={() => toggleDay(dStr)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
                  ${isOpen ? 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
              >
                {isOpen ? <Power size={13}/> : <Plus size={13}/>}
                {isOpen ? 'Fermer la journée' : 'Ouvrir les réservations'}
              </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-12 bg-white">
           <div className="max-w-4xl mx-auto space-y-8">
              {isOpen ? (
                dSlots.map(t => {
                  const ev = appointments.find(e => e.date === dStr && e.time === t);
                  const blocked = isSlotBlocked(dStr, t);
                  return (
                    <div key={t} 
                      onClick={() => { ev ? setSelectedAppt(ev) : blocked ? toggleSlot(dStr, t) : openModal(dStr, t); }}
                      className={`group flex items-center gap-10 p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer
                      ${ev ? 'bg-blue-600 border-transparent text-white shadow-2xl shadow-blue-200 scale-[1.02]' 
                        : blocked ? 'bg-slate-900 border-transparent text-white shadow-xl'
                        : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-500 hover:shadow-2xl hover:scale-[1.01]'}`}
                    >
                      <div className="w-24 shrink-0 flex flex-col justify-center items-center gap-1 border-r border-current border-opacity-10 pr-10">
                         <p className="text-2xl tracking-tight leading-none">{t}</p>
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Début</p>
                      </div>
                      <div className="flex-1 min-w-0">
                         {ev ? (
                           <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Rendez-vous Client</p>
                                 <p className="text-2xl font-black truncate">{ev.clientNameSnapshot || ev.title}</p>
                                 <div className="flex gap-4 opacity-70">
                                    <div className="flex items-center gap-2"><Clock size={12}/> <span className="text-[10px] uppercase font-black tracking-widest">60 MIN</span></div>
                                    <div className="flex items-center gap-2"><CreditCard size={12}/> <span className="text-[10px] uppercase font-black tracking-widest">{ev.paid ? 'Confirmé' : 'À régler'}</span></div>
                                 </div>
                              </div>

                           </div>
                         ) : blocked ? (
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 rounded-2xl bg-white/10"><Lock size={18}/></div>
                                 <p className="text-sm font-black uppercase tracking-widest opacity-80">Ce créneau est actuellement indisponible</p>
                              </div>
                           </div>
                         ) : (
                           <div className="flex items-center justify-between">
                              <p className="text-sm font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-100 group-hover:text-blue-600 transition-all">Disponible —</p>
                              <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                                 <Plus size={20} className="text-blue-600"/>
                              </div>
                           </div>
                         )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100">
                   <div className="p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 mb-8 text-slate-200">
                      <Clock size={64} strokeWidth={1}/>
                   </div>
                   <h3 className="text-2xl font-medium text-slate-900 mb-2">Le cabinet est fermé</h3>
                   <button onClick={() => toggleDay(dStr)} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-200 transition-all duration-500 active:scale-95">
                      Activer la journée
                   </button>
                </div>
              )}
           </div>
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
        <div className="max-w-[1400px] mx-auto space-y-12">
          
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-44">
              <div className="w-12 h-12 rounded-2xl kpi-accent-1 flex items-center justify-center shadow-inner"><CalendarRange size={24}/></div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rendez-vous Aujourd'hui</p>
                <p className="text-3xl font-black text-slate-900">{todayAppts.length}</p>
              </div>
            </div>
            <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-44">
              <div className="w-12 h-12 rounded-2xl kpi-accent-2 flex items-center justify-center shadow-inner"><Activity size={24}/></div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Revenu Prévu</p>
                <p className="text-3xl font-black text-slate-900">{todayAppts.reduce((s, a) => s + (a.price || 150), 0)} <span className="text-lg font-bold opacity-30">CHF</span></p>
              </div>
            </div>
            <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-44">
              <div className="w-12 h-12 rounded-2xl kpi-accent-3 flex items-center justify-center shadow-inner"><Target size={24}/></div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Impayés</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900">{pendingPaymentsCount}</p>
                  {pendingPaymentsCount > 0 && <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase animate-pulse">Action requise</span>}
                </div>
              </div>
            </div>
            <div className="premium-card p-8 rounded-[2.5rem] flex flex-col justify-between h-44">
              <div className="w-12 h-12 rounded-2xl kpi-accent-4 flex items-center justify-center shadow-inner"><Users size={24}/></div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Clients</p>
                <p className="text-3xl font-black text-slate-900">{clients.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Today List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium tracking-tight">Today's Timeline</h3>
                <button onClick={() => { setTab('scheduler'); setView('day'); }} className="text-[10px] font-black font-sans text-blue-600 uppercase tracking-[0.2em] hover:opacity-70 transition">Tout voir</button>
              </div>

              <div className="space-y-4">
                {todayAppts.length > 0 ? todayAppts.map((appt, idx) => {
                  const colors = ['border-blue-500', 'border-emerald-500', 'border-amber-500', 'border-purple-500', 'border-pink-500'];
                  const bgColors = ['bg-blue-50/50', 'bg-emerald-50/50', 'bg-amber-50/50', 'bg-purple-50/50', 'bg-pink-50/50'];
                  const colorIdx = idx % colors.length;
                  
                  return (
                    <div key={appt.id} onClick={() => setSelectedAppt(appt)} className={`group premium-card p-6 flex items-center gap-8 rounded-[2rem] border-l-8 ${colors[colorIdx]} cursor-pointer`}>
                      <div className="w-20 text-center flex flex-col items-center">
                        <p className="text-xl font-black text-slate-900 leading-tight">{appt.time}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">60 MIN</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-lg font-medium tracking-tight">{appt.title}</h4>
                           {!appt.paid && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>}
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${bgColors[colorIdx]}`}>
                                <Leaf size={12} className={colors[colorIdx].replace('border-', 'text-')}/>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{appt.serviceName || 'Soin Signature'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              {appt.phone && <span className="text-[10px] font-bold text-slate-400">{appt.phone}</span>}
                           </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <ChevronRight size={20}/>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Clock size={32}/>
                    </div>
                    <p className="text-slate-400 font-bold italic">Aucun rendez-vous aujourd'hui</p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Widgets */}
            <div className="space-y-10">
              <div className="premium-card p-10 rounded-[3rem] space-y-10">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-medium tracking-tight">Quick Actions</h3>
                   <Cog size={16} className="text-slate-300"/>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => setClModal(true)} className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm"><Users size={24}/></div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Patient</span>
                  </button>
                  <button onClick={() => { setTab('scheduler'); setView('week'); }} className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm"><Plus size={24}/></div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Booking</span>
                  </button>
                </div>
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

    const togglePayment = async (id: string, current: boolean) => {
      try {
        await updateDoc(doc(firestore, 'appointments', id), { paid: !current });
      } catch (e) {
        console.error("Error updating payment", e);
      }
    };

    const exportToCSV = () => {
      const headers = ['Client', 'Date', 'Heure', 'Service', 'Montant', 'Statut'];
      const rows = filteredAppts.map(a => [
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
        <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end bg-white border-b border-neutral-50 gap-4">
          <div>
            <h3 className="text-2xl font-medium text-neutral-900 tracking-tighter">Comptabilité</h3>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">Gestion des factures et paiements</p>
          </div>
          <button onClick={exportToCSV} className="text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition active:scale-95" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>
            <Download size={16}/> Exporter CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 pb-4 shrink-0">
          <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100">
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Total Sélection</p>
            <div className="text-2xl font-black text-neutral-900">{totalRevenue} CHF</div>
            <p className="text-[10px] font-bold text-neutral-400 mt-1">{filteredAppts.length} Transactions</p>
          </div>
          <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">Réglé</p>
            <div className="text-2xl font-black text-neutral-900">{paidRevenue} CHF</div>
            <p className="text-[10px] font-bold text-neutral-400 mt-1">{filteredAppts.filter(a => a.paid).length} Paiements</p>
          </div>
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
            <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">En attente</p>
            <div className="text-2xl font-black text-red-700">{pendingRevenue} CHF</div>
            <p className="text-[10px] font-bold text-red-500 mt-1">{filteredAppts.filter(a => !a.paid).length} Impayés</p>
          </div>
        </div>

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
                  <th className="px-5 pb-2">Patient</th>
                  <th className="px-5 pb-2">Date & Heure</th>
                  <th className="px-5 pb-2">Soin effecteur</th>
                  <th className="px-5 pb-2 text-right">Montant</th>
                  <th className="px-5 pb-2 text-center">Statut</th>
                  <th className="px-5 pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppts.map(a => (
                  <tr key={a.id} className="group transition-transform hover:scale-[1.01]">
                    <td className="p-4 bg-white border-y border-l border-neutral-100 rounded-l-[2rem] shadow-sm">
                      <div className="font-extrabold text-sm text-neutral-900 tracking-tight">{a.title}</div>
                      {invoices.find(inv => inv.appointmentId === a.id) ? (
                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                          #{invoices.find(inv => inv.appointmentId === a.id).invoiceNumber}
                        </div>
                      ) : (
                        <div className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-1">Sans Facture</div>
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
                      <button 
                        onClick={() => togglePayment(a.id, !!a.paid)}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          a.paid ? 'bg-neutral-100 text-neutral-600' : 'bg-red-50 text-red-500 animate-pulse'
                        }`}
                      >
                        {a.paid ? 'Confirmé' : 'Non Réglé'}
                      </button>
                    </td>
                    <td className="p-4 bg-white border-y border-r border-neutral-100 rounded-r-[2rem] shadow-sm text-right">
                      <button 
                        onClick={() => setSelectedAppt(a)}
                        className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-[#54A0FF] hover:text-white text-neutral-400 transition-all flex items-center justify-center mx-auto"
                      >
                        <FileText size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
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
        <div className="p-8 pb-4 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-medium text-neutral-900 tracking-tighter">Base Patients</h3>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">{filtered.length} Patients enregistrés</p>
          </div>
          <button onClick={() => setClModal(true)} className="text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition active:scale-95" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>
            <Plus size={16}/> Nouveau Patient
          </button>
        </div>

        <div className="px-8 py-4">
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-4 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all">
            <Search size={18} className="text-neutral-300"/>
            <input 
              type="text" value={clSearch} onChange={e => setClSearch(e.target.value)}
              placeholder="Rechercher par nom, email..." 
              className="bg-transparent border-none text-sm font-bold w-full outline-none text-neutral-600 placeholder:text-neutral-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <div key={c.id} className="p-6 rounded-[2.5rem] bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:border-neutral-200 transition-all group">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center font-black text-[#222F3E] text-lg group-hover:bg-[#54A0FF] group-hover:text-white transition-all duration-500">
                    {(c.firstName?.[0] || '') + (c.lastName?.[0] || '')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-neutral-900 truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-[9px] font-bold text-neutral-400 tracking-[0.2em] uppercase truncate">{c.insurance || 'Sans Assurance'}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Bell size={12} className="opacity-40" />
                    <span className="text-[11px] font-bold truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Activity size={12} className="opacity-40" />
                    <span className="text-[11px] font-bold">{c.phone}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-neutral-50 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">RDV</span>
                    <span className="text-sm font-bold text-neutral-900">
                      {appointments.filter(a => a.title === `${c.firstName} ${c.lastName}`).length}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Dernier</span>
                    <span className="text-xs font-bold text-neutral-600">Aucun</span>
                  </div>
                </div>
                <button 
                  onClick={() => openClientFolder(c)}
                  className="w-full py-4 rounded-[1.5rem] border border-neutral-100 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-900 group-hover:border-neutral-200 group-hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                >
                  Voir Dossier <ChevronRight size={12}/>
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-200"><Users size={32}/></div>
                <p className="text-neutral-400 font-bold italic">Aucun patient trouvé.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Hydration guard & Loading state
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

      <aside className="w-28 bg-white border-r border-slate-100 flex flex-col items-center py-12 gap-1 shrink-0 z-10">

        
        {([
          { id: 'dashboard',  Icon: LayoutDashboard, label: 'Stats' },
          { id: 'scheduler',  Icon: CalendarRange,   label: 'Agenda' },
          { id: 'clients',    Icon: Users,           label: 'Patients' },
          { id: 'accounting', Icon: CreditCard,      label: 'Compta' },
        ] as const).map(n => (
          <button key={n.id} onClick={() => setTab(n.id as any)} className={`nav-pill ${tab === n.id ? 'active' : ''}`}>
            <n.Icon size={22} strokeWidth={tab === n.id ? 2.5 : 2}/>
            <span className="text-[9px] font-black uppercase tracking-wider">{n.label}</span>
          </button>
        ))}

        <div className="mt-auto space-y-4">
          <button onClick={() => setCfgOpen(true)} className="p-4 hover:bg-slate-50 rounded-2xl transition text-slate-400 hover:text-slate-800"><Cog size={22}/></button>
          <button onClick={() => auth?.signOut()} className="w-10 h-10 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-sm mx-auto"><Power size={18}/></button>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">

        <nav className="h-20 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-medium tracking-tight text-slate-900 leading-none">{format(new Date(), 'd MMMM yyyy', { locale: fr })}</h1>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em] mt-1">{tab === 'scheduler' ? (view === 'month' ? 'Vue mensuelle' : view === 'week' ? 'Vue hebdomadaire' : 'Vue quotidienne') : ''}</p>
            </div>

            {tab === 'scheduler' && (
              <button 
                onClick={() => {
                  const nextMode = !blockMode;
                  setBlockMode(nextMode);
                  if (nextMode) setView('month');
                }}
                className={`ml-4 py-2.5 px-6 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
              >
                {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                {blockMode ? "Confirmer Changements" : 'Mode Édition Agenda'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {tab === 'scheduler' && (
              <>
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  {(['month', 'week', 'day'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} className={`view-btn ${view === v ? 'active' : ''}`}>
                      {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => period(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                    <ChevronLeft size={16}/>
                  </button>
                  <button onClick={() => setCur(new Date())} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                    Aujourd'hui
                  </button>
                  <button onClick={() => period(1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                    <ChevronRight size={16}/>
                  </button>
                </div>
              </>
            )}
            
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {tab === 'scheduler' ? (
            view === 'month' ? <MonthView/> : view === 'week' ? <WeekView/> : <DayView/>
          ) : tab === 'clients' ? <PatientsView/> : tab === 'accounting' ? <AccountingView/> : <Dashboard/>}
        </div>
      </main>



      {/* ══ EVENT MODAL ══════════════════════════════════════════════════════ */}
      {evModal && (
        <div className="fixed inset-0 bg-[#222F3E]/40 overflow-y-auto flex items-center justify-center z-50 p-6 backdrop-blur-xl transition-all duration-500" onClick={() => setEvModal(null)}>
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
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-50 p-4 backdrop-blur-md" onClick={() => setSelectedAppt(null)}>
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
      {clModal && (
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md" onClick={() => setClModal(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 relative overflow-hidden border-2 border-[#1DD1A1]/10" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1DD1A1] to-[#10AC84]"/>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-medium text-[#222F3E] tracking-tighter">Nouveau Patient</h2>
                <p className="text-xs font-bold text-[#576574] uppercase tracking-[0.2em] mt-1">Création de dossier</p>
              </div>
              <button onClick={() => setClModal(false)} className="bg-[#1DD1A1]/10 p-3 rounded-2xl text-[#1DD1A1] hover:bg-[#1DD1A1] hover:text-white transition-all"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Prénom</label>
                <input value={clForm.firstName} onChange={e => setClForm({...clForm, firstName: e.target.value})} className="w-full px-5 py-3.5 bg-[#1DD1A1]/5 border border-[#1DD1A1]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#1DD1A1]/20 transition-all placeholder:text-[#576574]/30" placeholder="Prénom"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Nom</label>
                <input value={clForm.lastName} onChange={e => setClForm({...clForm, lastName: e.target.value})} className="w-full px-5 py-3.5 bg-[#1DD1A1]/5 border border-[#1DD1A1]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#1DD1A1]/20 transition-all placeholder:text-[#576574]/30" placeholder="Nom de famille"/>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Email</label>
                <input type="email" value={clForm.email} onChange={e => setClForm({...clForm, email: e.target.value})} className="w-full px-5 py-3.5 bg-[#1DD1A1]/5 border border-[#1DD1A1]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#1DD1A1]/20 transition-all placeholder:text-[#576574]/30" placeholder="email@exemple.com"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Téléphone</label>
                <input value={clForm.phone} onChange={e => setClForm({...clForm, phone: e.target.value})} className="w-full px-5 py-3.5 bg-[#1DD1A1]/5 border border-[#1DD1A1]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#1DD1A1]/20 transition-all placeholder:text-[#576574]/30" placeholder="+41 7x xxx xx xx"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Adresse Complète</label>
                <input value={clForm.address} onChange={e => setClForm({...clForm, address: e.target.value})} className="w-full px-5 py-3.5 bg-[#1DD1A1]/5 border border-[#1DD1A1]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#1DD1A1]/20 transition-all placeholder:text-[#576574]/30" placeholder="Rue, ville, NPA..."/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">N° Assurance / Groupe</label>
                <input value={clForm.insurance} onChange={e => setClForm({...clForm, insurance: e.target.value})} className="w-full px-5 py-3.5 bg-[#1DD1A1]/5 border border-[#1DD1A1]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#1DD1A1]/20 transition-all placeholder:text-[#576574]/30" placeholder="Ex: Groupe Mutuel, Helsana..."/>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setClModal(false)} className="flex-1 py-4 text-xs font-black text-[#576574] uppercase tracking-[0.2em] hover:text-[#222F3E] transition-colors">Annuler</button>
              <button 
                onClick={saveClient} 
                disabled={clScaling}
                className="flex-1 py-4 bg-gradient-to-r from-[#1DD1A1] to-[#10AC84] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#1DD1A1]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {clScaling ? 'Création...' : 'Créer le Dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ CLIENT FOLDER MODAL ══════════════════════════════════════════════ */}
      {selectedClient && (
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-[70] p-4 backdrop-blur-md" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-[#5F27CD]/10" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#341F97] to-[#5F27CD] p-8 text-white relative">
               <button onClick={() => setSelectedClient(null)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-all transform hover:rotate-90"><X size={24}/></button>
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black shadow-inner">
                   {(selectedClient.firstName?.[0] || '') + (selectedClient.lastName?.[0] || '')}
                 </div>
                 <div>
                   <h2 className="text-3xl font-medium tracking-tighter">{selectedClient.firstName} {selectedClient.lastName}</h2>
                   <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Dossier Patient #{selectedClient.id?.slice(0, 8)}</p>
                 </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* Info Column */}
               <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-[#222F3E] tracking-tighter">Informations</h3>
                      <button onClick={() => setIsEditingClient(!isEditingClient)} className="text-xs font-black text-[#5F27CD] uppercase tracking-[0.2em] hover:underline">
                        {isEditingClient ? 'Annuler' : 'Modifier'}
                      </button>
                    </div>
                    
                    {!isEditingClient ? (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Email', val: selectedClient.email, icon: <Mail size={14}/>, color: 'text-[#54A0FF]', bg: 'bg-[#54A0FF]/5', border: 'border-[#54A0FF]/10' },
                          { label: 'Téléphone', val: selectedClient.phone, icon: <Activity size={14}/>, color: 'text-[#1DD1A1]', bg: 'bg-[#1DD1A1]/5', border: 'border-[#1DD1A1]/10' },
                          { label: 'Adresse', val: selectedClient.address, icon: <Target size={14}/>, color: 'text-[#FF9F43]', bg: 'bg-[#FF9F43]/5', border: 'border-[#FF9F43]/10' },
                          { label: 'Assurance', val: selectedClient.insurance, icon: <CheckCircle2 size={14}/>, color: 'text-[#5F27CD]', bg: 'bg-[#5F27CD]/5', border: 'border-[#5F27CD]/10' },
                        ].map((it, i) => (
                          <div key={i} className={`p-4 ${it.bg} rounded-2xl border ${it.border} flex flex-col justify-center min-h-[80px] shadow-sm`}>
                             <div className={`flex items-center gap-2 text-[9px] font-black ${it.color} uppercase tracking-[0.2em] mb-1.5`}>
                                {it.icon} {it.label}
                             </div>
                             <p className="text-[11px] font-bold text-[#222F3E] truncate" title={it.val}>{it.val || '—'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <input value={clEditForm.firstName} onChange={e => setClEditForm({...clEditForm, firstName: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Prénom"/>
                        <input value={clEditForm.lastName} onChange={e => setClEditForm({...clEditForm, lastName: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Nom"/>
                        <input value={clEditForm.email} onChange={e => setClEditForm({...clEditForm, email: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Email"/>
                        <input value={clEditForm.phone} onChange={e => setClEditForm({...clEditForm, phone: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Téléphone"/>
                        <input value={clEditForm.address} onChange={e => setClEditForm({...clEditForm, address: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Adresse"/>
                        <input value={clEditForm.insurance} onChange={e => setClEditForm({...clEditForm, insurance: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Assurance"/>
                        <button onClick={saveClientEdit} disabled={clScaling} className="w-full py-4 bg-gradient-to-r from-[#341F97] to-[#5F27CD] text-white rounded-xl font-bold text-sm shadow-xl shadow-[#5F27CD]/20 hover:scale-[1.02] transition-all">
                          {clScaling ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
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

               {/* Appointments Columns */}
               <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <h3 className="text-lg font-medium text-[#222F3E] tracking-tighter mb-6 flex items-center gap-3"><Clock size={20} className="text-[#54A0FF]"/> Futur</h3>
                    <div className="space-y-4">
                      {appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` && new Date(a.date) >= startOfDay(new Date())).length > 0 ? (
                        appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` && new Date(a.date) >= startOfDay(new Date())).map(a => (
                          <div key={a.id} className="p-4 bg-white border border-[#54A0FF]/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-sm text-[#222F3E]">{a.time}</p>
                                <p className="text-[10px] font-bold text-[#576574] uppercase tracking-[0.2em] mt-0.5">{a.date}</p>
                              </div>
                              <span className="px-3 py-1 bg-[#1DD1A1]/10 text-[#1DD1A1] text-[8px] font-black uppercase tracking-widest rounded-full">Confirmé</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#576574] italic">Aucun rendez-vous futur</p>
                      )}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-lg font-medium text-[#222F3E] tracking-tighter mb-6 flex items-center gap-3"><History size={20} className="text-[#5F27CD]"/> Historique</h3>
                    <div className="space-y-4">
                      {appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` && new Date(a.date) < startOfDay(new Date())).length > 0 ? (
                        appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` && new Date(a.date) < startOfDay(new Date())).map(a => (
                          <div key={a.id} className="p-4 bg-[#F8F9FA] border border-[#5F27CD]/10 rounded-2xl">
                             <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-sm text-[#576574]">{a.time}</p>
                                <p className="text-[10px] font-bold text-[#576574]/60 uppercase tracking-[0.2em] mt-0.5">{a.date}</p>
                              </div>
                              <FileText size={14} className="text-[#5F27CD] cursor-pointer hover:scale-125 transition-all"/>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#576574] italic">Aucun historique</p>
                      )}
                    </div>
                    <div className="space-y-4">
                      {appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` && new Date(a.date) < startOfDay(new Date())).length > 0 ? (
                        appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` && new Date(a.date) < startOfDay(new Date())).map(a => (
                          <div key={a.id} className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl">
                             <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-sm text-neutral-700">{a.time}</p>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-0.5">{a.date}</p>
                              </div>
                              <FileText size={14} className="text-neutral-300 cursor-pointer hover:text-neutral-600 transition" onClick={() => alert('Facturing details...')}/>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-300 italic">Aucun historique</p>
                      )}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}