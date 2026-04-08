'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CalendarRange, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2,
  X, Trash2, Clock, Plus, Cog, Power, Mail, FileText, History, User, CreditCard, Download, MessageCircle, MessageSquare
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

    return () => { unsubAvail(); unsubAppts(); unsubCfg(); unsubClients(); };
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
    setEvModal({ date, time }); setEvStep('choice'); setEvName('');
  };

  const saveBook = async () => {
    if (!evName.trim() || !firestore || !evModal) return;
    const id = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await setDoc(doc(firestore, 'appointments', id), {
      date: evModal.date,
      time: evModal.time,
      startTime: `${evModal.date}T${evModal.time}:00`,
      clientNameSnapshot: evName.trim(),
      title: evName.trim(),
      status: 'confirmed',
      createdAt: serverTimestamp(),
    });
    setEvModal(null);
    setEvName('');
    setEvStep('choice');
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
      setIsEditing(false);
      setSelectedAppt(null); // Close modal on success
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
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
  const saturation = totalSlots === 0 ? 0 : Math.round((bookedCount / totalSlots) * 100);

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
        <div className="grid grid-cols-7 bg-neutral-50/50 border-b border-neutral-100 shrink-0">
          {DAYS_S.map(l => <div key={l} className="py-4 text-center text-[10px] font-black text-neutral-400 tracking-[0.2em]">{l}</div>)}
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
                className={`day-cell-m p-3 border-r border-b border-neutral-100 flex flex-col gap-1 transition-colors relative cursor-pointer
                  ${!inMonth ? 'inactive-m opacity-40' : ''}
                  ${inMonth && isToday ? 'bg-neutral-50' : ''}
                  ${inMonth && !isOpen ? 'bg-neutral-100' : ''}
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
                onMouseEnter={() => {
                  if (isDrag && inMonth) {
                    if ((dragAct === 'open' && !isOpen) || (dragAct === 'close' && isOpen))
                      toggleDay(dStr);
                  }
                }}
                onClick={() => {
                  if (!inMonth || blockMode) return;
                  if (isOpen) { setCur(day); setView('day'); }
                }}
              >
                {isToday && inMonth && <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t" style={{ background: 'linear-gradient(90deg, #54A0FF, #5F27CD)' }}/>}
                <div className="flex justify-between items-center">
                  <span className={
                    isToday && inMonth
                      ? 'w-7 h-7 text-white flex items-center justify-center rounded-lg font-black text-[10px]' + ' bg-[#54A0FF]'
                      : !inMonth ? 'text-xs font-black text-neutral-300'
                      : 'text-xs font-black text-neutral-600'
                  }>{day.getDate()}</span>
                  {inMonth && !isOpen && <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-100 px-1.5 py-0.5 rounded">Off</span>}
                </div>
                {inMonth && isOpen && daySlots.length > 0 && (
                  <div className="mt-auto">
                    <div className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: free > 0 ? '#222F3E' : '#94a3b8' }}>
                      {free > 0 ? `${free} libres` : 'Complet'}
                    </div>
                    <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full transition-all rounded-full" style={{ background: 'linear-gradient(90deg, #54A0FF, #5F27CD)', width: `${daySlots.length ? (booked / daySlots.length) * 100 : 0}%` }}/>
                    </div>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-neutral-100 shrink-0">
          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            return (
              <div key={i} className={`py-3 text-center border-r border-neutral-100`} style={isToday ? { background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' } : {}}>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-neutral-400' : 'text-neutral-400'}`}>{DAYS_S[i]}</p>
                <p className={`text-xl font-black mt-0.5 ${isToday ? 'text-white' : 'text-neutral-700'}`}>{d.getDate()}</p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {days.map((d, i) => {
            const dStr    = fmt(d);
            const isOpen  = isDayOpen(dStr);
            const slots   = [...(configSlots[isoDay(d)] || [])].sort();
            return (
              <div key={i}
                className={`border-r border-neutral-100 p-2 flex flex-col gap-1.5 min-h-[520px] transition-colors relative cursor-pointer
                  ${!isOpen ? 'bg-neutral-100/50' : ''}
                  ${blockMode ? 'hover:bg-neutral-50/50' : ''}
                `}
                onMouseDown={e => {
                  if (blockMode) {
                    setIsDrag(true);
                    setDragAct(isOpen ? 'close' : 'open');
                    toggleDay(dStr);
                    e.preventDefault();
                  }
                }}
                onMouseEnter={() => {
                  if (isDrag && blockMode) {
                    if ((dragAct === 'open' && !isOpen) || (dragAct === 'close' && isOpen))
                      toggleDay(dStr);
                  }
                }}
                onClick={() => {
                  if (blockMode) return;
                }}
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
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer
                        ${ev ? 'border-transparent text-white shadow-md'
                          : isOpen ? 'border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100'
                            : 'bg-white border-neutral-100 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'}`}
                    >
                      <div className="flex justify-between items-center gap-1">
                        <span>{t}</span>
                        {ev && <CheckCircle2 size={8}/>}
                        {blocked && !ev && <Lock size={8}/>}
                      </div>
                      {ev && <div className="mt-0.5 text-[8px] opacity-80 truncate">{ev.title}</div>}
                    </div>
                  );
                }) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[9px] font-black text-neutral-300 uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}>Fermé</p>
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
    const slots  = [...(configSlots[isoDay(cur)] || [])].sort();
    return (
      <div className="max-w-2xl mx-auto py-10 px-6 w-full overflow-y-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em] mb-1 font-sans">Détail du planning</p>
            <h2 className="text-2xl font-serif font-medium text-neutral-900 tracking-tighter">
              {DAYS_F[isoDay(cur)]} <span className="text-neutral-500 italic font-light">{cur.getDate()}</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setCfgDay(isoDay(cur)); setCfgOpen(true); }} className="bg-white border border-neutral-100 p-3 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition shadow-sm" title="Ajouter un créneau">
              <Plus size={20}/>
            </button>
            <button onClick={() => toggleDay(dStr)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isOpen ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'text-white shadow-lg'}`} style={!isOpen ? { background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' } : {}}>
              {isOpen ? 'Fermer la journée' : 'Ouvrir les réservations'}
            </button>
          </div>
        </div>
        {isOpen ? (
          <div className="space-y-3">
            {slots.length > 0 ? slots.map(t => {
              const ev      = appointments.find(e => e.date === dStr && e.time === t);
              const blocked = isSlotBlocked(dStr, t);
              return (
                <div key={t}
                  className={`flex items-center gap-6 p-5 rounded-2xl border transition-all
                    ${ev ? 'bg-neutral-50 border-neutral-100'
                        : blocked ? 'bg-neutral-50 border-neutral-100 grayscale'
                        : 'bg-white border-neutral-100 hover:border-neutral-900 group cursor-pointer'}`}
                  onClick={() => !ev && !blocked && openModal(dStr, t)}
                >
                  <div className={`text-lg font-black w-16 shrink-0 transition-colors ${ev || blocked ? 'text-neutral-900' : 'text-neutral-300 group-hover:text-neutral-600'}`}>{t}</div>
                  <div className="flex-1">
                    {ev ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-sm text-neutral-900">{ev.title}</p>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Rendez-vous</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setSelectedAppt(ev); }} className="w-9 h-9 rounded-xl hover:bg-neutral-50 text-neutral-400 flex items-center justify-center transition"><ChevronRight size={16}/></button>
                      </div>
                    ) : blocked ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-sm text-neutral-500">Bloqué</p>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Indisponible</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleSlot(dStr, t); }} className="w-9 h-9 rounded-xl hover:bg-neutral-50 text-neutral-900 flex items-center justify-center transition"><Unlock size={16}/></button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-neutral-300 group-hover:text-neutral-500 transition uppercase tracking-widest">Créneau disponible</span>
                        <div className="w-9 h-9 rounded-xl bg-neutral-50 text-neutral-400 flex items-center justify-center group-hover:bg-[#54A0FF] group-hover:text-white transition"><Plus size={16}/></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16 bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200">
                <p className="text-neutral-400 font-bold italic">Aucun créneau configuré pour ce jour.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-300 shadow-sm"><Clock size={32}/></div>
            <h3 className="text-xl font-serif font-medium text-neutral-900 mb-2">Journée fermée</h3>
            <p className="text-sm font-medium text-neutral-400 mb-8">Aucun créneau n&apos;est disponible pour cette date.</p>
            <button onClick={() => toggleDay(dStr)} className="text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition active:scale-95 uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>Ouvrir les réservations</button>
          </div>
        )}
      </div>
    );
  };

  const Dashboard = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayAppts = appointments.filter(a => a.date === todayStr).sort((a,b) => (a.time || '').localeCompare(b.time || ''));
    const nextAppts = appointments
      .filter(a => (a.date || '') > todayStr)
      .sort((a,b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 6);
    const pendingPayments = appointments.filter(a => !a.paid).length;
    
    return (
      <div className="flex-1 overflow-y-auto bg-[#F9F8F6] p-8">
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
          
          {/* Header Greeting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-medium text-neutral-900 tracking-tighter">Bonjour Joao.</h2>
              <p className="text-neutral-500 font-black uppercase text-[0.7rem] tracking-[0.2em]">
                Aperçu du {format(new Date(), 'EEEE d MMMM', { locale: fr })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 shrink-0"><CalendarRange size={20}/></div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">RDV Aujourd'hui</p>
                    <p className="text-xl font-black text-neutral-900">{todayAppts.length}</p>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 shrink-0"><Activity size={20}/></div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Revenu Prévu</p>
                    <p className="text-xl font-black text-neutral-900">{todayAppts.reduce((s, a) => s + (a.price || 150), 0)} CHF</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Main Column: Timeline */}
            <div className="lg:col-span-8 space-y-14">
              
              {/* Today Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-serif font-medium text-neutral-800 tracking-tighter flex items-center gap-3">
                  <Clock size={20} className="text-neutral-400"/> Aujourd'hui
                </h3>

                <div className="space-y-4">
                  {todayAppts.length > 0 ? todayAppts.map((appt) => (
                    <div 
                      key={appt.id} 
                      onClick={() => setSelectedAppt(appt)}
                      className="group bg-white rounded-[2.5rem] p-7 border border-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-neutral-900 transition-all flex items-center gap-8 relative overflow-hidden cursor-pointer"
                    >
                      <div className="w-24 shrink-0 border-r border-neutral-100 pr-8">
                        <p className="text-2xl font-black text-neutral-900 leading-none mb-1">{appt.time}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">60 min</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="text-lg font-serif font-medium text-neutral-800 truncate tracking-tight">{appt.title}</h4>
                          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${appt.paid ? 'bg-neutral-100 text-neutral-600' : 'bg-red-50 text-red-500 animate-pulse'}`}>
                            {appt.paid ? 'Réglé' : 'À encaisser'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Leaf size={12}/> {appt.serviceName || 'Soin Signature'}
                          </p>
                          <div className="w-1 h-1 rounded-full bg-neutral-300"/>
                          <p className="text-[10px] font-bold text-neutral-400 flex items-center gap-2">
                            <Plus size={10}/> {appt.price || 150} CHF
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => setSelectedAppt(appt)} className="w-12 h-12 rounded-2xl text-white shadow-xl flex items-center justify-center hover:scale-110 transition active:scale-95" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>
                          <User size={18}/>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-neutral-100 py-16 text-center">
                      <p className="text-sm font-bold text-neutral-300 italic">Aucun rendez-vous aujourd'hui</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-serif font-medium text-neutral-800 tracking-tighter flex items-center gap-3">
                  <CalendarRange size={20} className="text-neutral-400"/> Agenda à venir
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nextAppts.length > 0 ? nextAppts.map((appt) => (
                    <div key={appt.id} className="bg-white p-5 rounded-[2rem] border border-neutral-100 flex items-center justify-between hover:bg-neutral-50 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-14 bg-neutral-50 text-neutral-900 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-neutral-100">
                           <span className="text-[10px] font-black uppercase leading-none opacity-30">
                             {format(new Date(appt.date), 'MMM', { locale: fr })}
                           </span>
                           <span className="text-base font-black leading-none mt-1">
                             {format(new Date(appt.date), 'd')}
                           </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-neutral-900 truncate uppercase tracking-tight">{appt.title}</p>
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                            {appt.time} • {appt.serviceName || 'Soin'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-neutral-200 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all"/>
                    </div>
                  )) : (
                    <div className="col-span-2 py-10 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                      <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">Fin de liste</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-white rounded-[3rem] p-10 border border-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Cog size={12}/> Liens Rapides
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { e: '👥', l: 'Nouveau Patient', c: 'bg-neutral-50 text-neutral-900', fn: () => setClModal(true) },
                    { e: '📅', l: 'Nouv. Réservation', c: 'bg-neutral-100 text-neutral-900', fn: () => { setTab('scheduler'); setView('week'); } },
                  ].map((a, i) => (
                    <button key={i} onClick={a.fn} className="p-6 rounded-3xl border border-transparent hover:border-neutral-100 hover:bg-neutral-50 transition-all text-center group">
                      <div className={`w-14 h-14 rounded-2xl ${a.c} flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition duration-300`}>{a.e}</div>
                      <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.2em]">{a.l}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {pendingPayments > 0 && (
                  <div className="text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group border border-white/5 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #FF6B6B, #EE5A53)', boxShadow: '0 10px 30px rgba(255,107,107,0.2)' }}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"/>
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                        <CreditCard size={12}/> Alerte
                      </h4>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black text-white">{pendingPayments}</span>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Impayés</span>
                      </div>
                    </div>
                    <button onClick={() => setTab('accounting')} className="w-full py-3 bg-white text-[#EE5A53] rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-neutral-50 transition active:scale-95">Régler</button>
                  </div>
                )}

                <div className="bg-white rounded-[3rem] p-8 border border-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col items-center justify-center">
                  <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-6 w-full text-left">Occupation</h4>
                  <div className="relative flex items-center justify-center mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-50"/>
                      <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={264} 
                        strokeDashoffset={264 - (264 * saturation) / 100}
                        className={`${saturation > 80 ? 'text-red-500' : 'text-neutral-900'} transition-all duration-1000 ease-out`}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-lg font-black text-neutral-900">{saturation}%</span>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Capacité</p>
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
            <h3 className="text-2xl font-serif font-medium text-neutral-900 tracking-tighter">Comptabilité</h3>
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
                      <button className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-[#54A0FF] hover:text-white text-neutral-400 transition-all flex items-center justify-center mx-auto">
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
            <h3 className="text-2xl font-serif font-medium text-neutral-900 tracking-tighter">Base Patients</h3>
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
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0F4F8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .sidebar-r { background: linear-gradient(180deg, #222F3E, #1a2535); border-radius: 3rem 0 0 3rem; box-shadow: -20px 0 60px rgba(0,0,0,0.15); }
        .kpi-glass { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.5rem; padding: 1rem; }
        .day-cell-m { background: #fff; transition: background 0.15s; }
        .day-cell-m:hover:not(.inactive-m):not(.blocked-m) { background: #f5f5f4; }
        .inactive-m { background: #fafaf9 !important; cursor: default; }
        .today-m { background: #fafaf9 !important; }
        .blocked-m { background-image: repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4 8px,#e5e5e5 8px,#e5e5e5 16px) !important; opacity: 0.7; }
        .nav-pill { border-radius: 1rem; padding: 10px 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; border: none; cursor: pointer; background: transparent; transition: all 0.2s; width: 60px; }
        .nav-pill:hover:not(.active) { background: #f5f5f4; }
        .nav-pill.active { background: #f5f5f4; }
        .view-btn { padding: 8px 18px; border-radius: 12px; border: none; cursor: pointer; font-family: inherit; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; transition: all 0.2s; color: #a3a3a3; background: transparent; }
        .view-btn.active { background: linear-gradient(135deg, #54A0FF, #5F27CD); color: #fff; box-shadow: 0 4px 14px rgba(84,160,255,0.3); }
        .mini-d { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 9px; font-weight: 700; cursor: pointer; transition: all 0.15s; margin: auto; }
        .mini-d:hover { background: rgba(255,255,255,0.15); }
        .mini-d.today { background: #54A0FF; color: #fff; font-weight: 900; }
        button, input { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* ══ LEFT SIDEBAR ═════════════════════════════════════════════════════ */}
      <aside className="w-24 bg-white border-r border-neutral-100 flex flex-col items-center py-10 gap-2 shrink-0 z-10">
        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl mb-10" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)', boxShadow: '0 8px 25px rgba(84,160,255,0.3)' }}>
          <Leaf size={22} className="text-white"/>
        </div>
        {([
          { id: 'dashboard',  Icon: LayoutDashboard, label: 'Stats' },
          { id: 'scheduler',  Icon: CalendarRange,   label: 'Agenda' },
          { id: 'clients',    Icon: Users,           label: 'Patients' },
          { id: 'accounting', Icon: CreditCard,      label: 'Compta' },
          { id: 'settings',   Icon: Settings,        label: 'Créneaux' },
        ] as const).map(n => (
          <button key={n.id} onClick={() => {
            if (n.id === 'settings') {
              setCfgOpen(true);
            } else {
              setTab(n.id as any);
            }
          }} className={`nav-pill ${tab === n.id ? 'active' : ''}`}>
            <n.Icon size={20} strokeWidth={tab === n.id ? 2.5 : 1.8} style={{ color: tab === n.id ? '#54A0FF' : '#a3a3a3' }}/>
            <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: tab === n.id ? '#54A0FF' : '#a3a3a3' }}>{n.label}</span>
          </button>
        ))}
        <div className="mt-auto">
          <button onClick={() => auth?.signOut()} title="Déconnexion" className="w-9 h-9 rounded-xl bg-neutral-50 hover:bg-red-50 text-neutral-400 hover:text-red-500 flex items-center justify-center transition">
            <Power size={14}/>
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">

        {/* Top nav */}
        <nav className="h-14 border-b border-neutral-100 px-8 flex items-center justify-between bg-white shrink-0">
          <div>
            <h1 className="text-xl font-serif font-medium tracking-tighter text-neutral-900 leading-none">{tab === 'scheduler' ? hdr : 'Performance'}</h1>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-0.5">
              {tab === 'scheduler' ? (view === 'month' ? 'Vue Mensuelle' : view === 'week' ? 'Vue Hebdomadaire' : 'Vue Quotidienne') : 'Tableau de bord'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-100">
              <Search size={14} className="text-neutral-300"/>
              <input type="text" placeholder="Rechercher..." className="bg-transparent border-none text-[11px] font-bold w-36 outline-none text-neutral-600 placeholder:text-neutral-300"/>
            </div>
            {tab === 'scheduler' && (
              <>
                <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
                  {(['month', 'week', 'day'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} className={`view-btn ${view === v ? 'active' : ''}`}>
                      {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 border-l border-neutral-100 pl-3">
                  <button onClick={() => period(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral-400 hover:text-neutral-800"><ChevronLeft size={15}/></button>
                  <button onClick={() => setCur(new Date())} className="px-3 py-1.5 text-[9px] font-black text-neutral-400 hover:text-neutral-900 transition uppercase tracking-wider">Aujourd&apos;hui</button>
                  <button onClick={() => period(1)} className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral-400 hover:text-neutral-800"><ChevronRight size={15}/></button>
                </div>
              </>
            )}
            <button onClick={() => setCfgOpen(true)} className="p-2 hover:bg-neutral-100 rounded-xl transition text-neutral-400 hover:text-neutral-700"><Cog size={17}/></button>
            <div className="relative cursor-pointer ml-1">
              <Bell size={17} className="text-neutral-400"/>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border border-white rounded-full"/>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {tab === 'scheduler' ? (
            view === 'month' ? <MonthView/> : view === 'week' ? <WeekView/> : <DayView/>
          ) : tab === 'clients' ? <PatientsView/> : tab === 'accounting' ? <AccountingView/> : <Dashboard/>}
        </div>
      </main>

      {/* ══ RIGHT SIDEBAR ════════════════════════════════════════════════════ */}
      <aside className="sidebar-r w-[360px] p-7 flex flex-col gap-5 text-white overflow-y-auto shrink-0">

        {/* Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 border-2 border-white/20 flex items-center justify-center font-black text-sm shadow-xl">SR</div>
            <div>
              <h2 className="text-sm font-extrabold leading-none">Admin Serenity</h2>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Praticien</p>
            </div>
          </div>
          <button onClick={() => setCfgOpen(true)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Cog size={14}/></button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="kpi-glass">
            <p className="text-[9px] font-black opacity-50 uppercase tracking-wider mb-1">Revenus Est.</p>
            <div className="text-lg font-black">{monthRevenue} CHF</div>
            <div className="text-[8px] text-green-400 font-bold mt-1">+12% vs mois d-1</div>
          </div>
          <div className="kpi-glass">
            <p className="text-[9px] font-black opacity-50 uppercase tracking-wider mb-1">RDV Confirmés</p>
            <div className="text-lg font-black">{weekAppts}</div>
            <div className="text-[8px] text-neutral-400 font-bold mt-1">Cette semaine</div>
          </div>
        </div>

        {/* Block mode toggle */}
        <button onClick={() => {
            const nextMode = !blockMode;
            setBlockMode(nextMode);
            if (nextMode) setView('month');
          }}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-wider transition-all border ${blockMode ? 'bg-green-500 border-transparent shadow-lg' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}>
          {blockMode ? <CheckCircle2 size={14}/> : <Unlock size={14}/>}
          {blockMode ? "Terminer l'édition" : 'Mode Édition Dates'}
        </button>

        {/* Mini calendar */}
        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <p className="font-extrabold text-[10px] uppercase tracking-widest">Aperçu Rapide</p>
            <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{MONTHS_FR[mM].slice(0, 3)} {mY}</span>
          </div>
          <div className="grid grid-cols-7 text-center gap-y-1">
            {['L','M','M','J','V','S','D'].map((l, i) => <div key={i} className="text-[8px] font-black opacity-30 pb-2">{l}</div>)}
            {miniDays.map((day, i) => {
              const isToday = isSameDay(new Date(), day);
              const isSel   = isSameDay(cur, day);
              const inM     = isSameMonth(day, cur);
              return (
                <div key={i}
                  className={`mini-d ${(isToday || isSel) ? 'today' : ''}`}
                  onClick={() => setCur(day)}
                  style={{ color: !inM ? 'rgba(255,255,255,0.15)' : (isToday || isSel) ? '#171717' : 'rgba(255,255,255,0.7)' }}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="flex-1">
          <h3 className="font-extrabold text-[10px] uppercase tracking-widest mb-4 flex items-center justify-between opacity-60">
            <span className="flex items-center gap-2"><Clock size={12}/> Prochains RDV</span>
            <span className="text-[8px]">{upcoming.length} Sessions</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {upcoming.length > 0 ? upcoming.map(e => (
              <div 
                key={e.id} 
                onClick={() => setSelectedAppt(e)}
                className="bg-white/10 p-4 rounded-3xl border border-white/10 flex flex-col justify-between aspect-square hover:bg-white/[0.15] transition-all cursor-pointer group relative overflow-hidden backdrop-blur-sm"
              >
                <div className="flex justify-between items-start z-10">
                   <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#54A0FF] group-hover:text-white transition-all duration-300">
                      <User size={12}/>
                   </div>
                   <a 
                    onClick={ev => ev.stopPropagation()}
                    href={`https://wa.me/${(e.phone || '').replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(e.clientNameSnapshot || e.title)},%20je%20vous%20contacte%20suite%20à%20votre%20réservation%20Serenity%20Relax.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-[#1DD1A1] text-white flex items-center justify-center hover:scale-110 transition shadow-lg shadow-[#1DD1A1]/20 z-20"
                    title="Contacter sur WhatsApp"
                   >
                    <MessageCircle size={14}/>
                   </a>
                </div>
                <div className="min-w-0 z-10">
                  <div className="text-[10px] font-black truncate leading-tight uppercase tracking-tight text-white mb-0.5">{e.clientNameSnapshot || e.title}</div>
                  <div className="text-[8px] text-[#54A0FF] font-black uppercase tracking-wider">{format(new Date(e.startTime), 'HH:mm')}</div>
                </div>
                <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-[#54A0FF]/10 rounded-full blur-2xl group-hover:bg-[#54A0FF]/20 transition-colors"/>
              </div>
            )) : <div className="col-span-2 text-[10px] text-center py-4 text-white/20 italic font-bold">Aucun rendez-vous</div>}
          </div>
        </div>

        {/* Saturation bar */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Saturation Planning</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${saturation}%`, background: saturation > 80 ? '#f87171' : saturation > 50 ? '#fbbf24' : '#4ade80' }}/>
            </div>
            <span className="text-xs font-black">{saturation}%</span>
          </div>
        </div>
      </aside>

      {/* ══ EVENT MODAL ══════════════════════════════════════════════════════ */}
      {evModal && (
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-50 p-4 backdrop-blur-md" onClick={() => setEvModal(null)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden border-2 border-[#54A0FF]/10" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#54A0FF] to-[#5F27CD]"/>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-serif font-medium text-[#222F3E] tracking-tighter">Gérer le créneau</h2>
                <p className="text-[10px] font-bold text-[#576574] uppercase tracking-[0.2em] mt-1">Options de disponibilité</p>
              </div>
              <button onClick={() => setEvModal(null)} className="bg-[#54A0FF]/10 p-3 rounded-2xl text-[#54A0FF] hover:bg-[#54A0FF] hover:text-white transition-all duration-300 transform hover:rotate-90"><X size={20}/></button>
            </div>
            {evStep === 'choice' ? (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setEvStep('book')} className="flex flex-col items-center justify-center gap-4 p-8 border border-[#54A0FF]/10 rounded-[2.5rem] bg-[#54A0FF]/5 hover:bg-gradient-to-br hover:from-[#54A0FF] hover:to-[#5F27CD] hover:text-white transition-all duration-500 group shadow-lg hover:shadow-[#54A0FF]/20 aspect-square">
                  <div className="w-14 h-14 bg-white text-[#54A0FF] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition shrink-0"><Users size={24}/></div>
                  <div className="text-center">
                    <div className="font-black text-sm uppercase tracking-tight">Réserver</div>
                    <div className="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-[0.2em]">Client</div>
                  </div>
                </button>
                <button onClick={saveBlock} className="flex flex-col items-center justify-center gap-4 p-8 border border-[#1DD1A1]/10 rounded-[2.5rem] bg-[#1DD1A1]/5 hover:bg-gradient-to-br hover:from-[#1DD1A1] hover:to-[#10AC84] hover:text-white transition-all duration-500 group shadow-lg hover:shadow-[#1DD1A1]/20 aspect-square">
                  <div className="w-14 h-14 bg-white text-[#1DD1A1] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition shrink-0"><Lock size={20}/></div>
                  <div className="text-center">
                    <div className="font-black text-sm uppercase tracking-tight">Bloquer</div>
                    <div className="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-[0.2em]">Indispo</div>
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
                    onKeyDown={e => e.key === 'Enter' && saveBook()}
                    className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all placeholder:text-[#576574]/40"
                    placeholder="Tapez pour rechercher ou ajouter..."
                  />
                  {evName && clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).length > 0 && (
                    <div className="max-h-32 overflow-y-auto border border-neutral-100 rounded-2xl bg-white shadow-sm mt-2 p-1">
                      {clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).map(c => (
                        <button key={c.id} onClick={() => setEvName(`${c.firstName} ${c.lastName}`)} className="w-full p-3 text-left hover:bg-[#54A0FF]/10 rounded-xl flex items-center justify-between group transition-colors">
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
                      <input 
                        value={editService}
                        onChange={e => setEditService(e.target.value)}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden border-2 border-[#FECA57]/10" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FECA57] to-[#FF9F43]"/>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-serif font-medium text-[#222F3E] tracking-tighter">Horaires Types</h2>
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
                <h2 className="text-2xl font-serif font-medium text-[#222F3E] tracking-tighter">Nouveau Patient</h2>
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
                   <h2 className="text-3xl font-serif font-medium tracking-tighter">{selectedClient.firstName} {selectedClient.lastName}</h2>
                   <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Dossier Patient #{selectedClient.id?.slice(0, 8)}</p>
                 </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* Info Column */}
               <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-serif font-medium text-[#222F3E] tracking-tighter">Informations</h3>
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
                    <h3 className="text-lg font-serif font-medium text-[#222F3E] tracking-tighter mb-6 flex items-center gap-3"><Clock size={20} className="text-[#54A0FF]"/> Futur</h3>
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
                    <h3 className="text-lg font-serif font-medium text-[#222F3E] tracking-tighter mb-6 flex items-center gap-3"><History size={20} className="text-[#5F27CD]"/> Historique</h3>
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