'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CalendarRange, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2,
  X, Trash2, Clock, Plus, Cog, Power
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, startOfDay, addDays, getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirestore, useAuth } from '@/firebase';
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
        <circle cx="24" cy="24" r={r} stroke="#F1F5F9" strokeWidth="3" fill="transparent"/>
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

  // Navigation
  const [tab,  setTab]  = useState<'dashboard' | 'scheduler' | 'clients' | 'settings'>('scheduler');
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

  // Clients state
  const [clients,    setClients]    = useState<any[]>([]);
  const [clModal,    setClModal]    = useState(false);
  const [clForm,     setClForm]     = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '' });
  const [clScaling,  setClScaling]  = useState(false); // For animation
  const [clSearch,   setClSearch]   = useState('');

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
    await deleteDoc(doc(firestore, 'appointments', selectedAppt.id));
    setSelectedAppt(null);
  };

  const saveEdit = async () => {
    if (!selectedAppt || !editName.trim() || !firestore) return;
    await updateDoc(doc(firestore, 'appointments', selectedAppt.id), {
      clientNameSnapshot: editName.trim()
    });
    setIsEditing(false);
    setSelectedAppt(null); // Close modal on success
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
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 shrink-0">
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
                className={`day-cell-m p-3 border-r border-b border-slate-100 flex flex-col gap-1 transition-colors relative cursor-pointer
                  ${!inMonth ? 'inactive-m' : ''}
                  ${inMonth && isToday ? 'today-m' : ''}
                  ${inMonth && !isOpen ? 'blocked-m' : ''}
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
                {isToday && inMonth && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"/>}
                <div className="flex justify-between items-center">
                  <span className={
                    isToday && inMonth
                      ? 'w-7 h-7 bg-blue-600 text-white flex items-center justify-center rounded-lg font-black text-[10px]'
                      : !inMonth ? 'text-xs font-black text-slate-300'
                      : 'text-xs font-black text-slate-600'
                  }>{day.getDate()}</span>
                  {inMonth && !isOpen && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">Off</span>}
                </div>
                {inMonth && isOpen && daySlots.length > 0 && (
                  <div className="mt-auto">
                    <div className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: free > 0 ? '#2D5BFF' : '#94a3b8' }}>
                      {free > 0 ? `${free} libres` : 'Complet'}
                    </div>
                    <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${daySlots.length ? (booked / daySlots.length) * 100 : 0}%` }}/>
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
        <div className="grid grid-cols-7 border-b border-slate-100 shrink-0">
          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            return (
              <div key={i} className={`py-3 text-center border-r border-slate-100 ${isToday ? 'bg-blue-600' : ''}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-blue-200' : 'text-slate-400'}`}>{DAYS_S[i]}</p>
                <p className={`text-xl font-black mt-0.5 ${isToday ? 'text-white' : 'text-slate-700'}`}>{d.getDate()}</p>
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
                className={`border-r border-slate-100 p-2 flex flex-col gap-1.5 min-h-[520px] transition-colors relative cursor-pointer
                  ${!isOpen ? 'blocked-m' : ''}
                  ${blockMode ? 'hover:bg-blue-50/50' : ''}
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
                        ${ev ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-100'
                            : blocked ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-blue-300 hover:text-blue-600'}`}
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
                    <p className="text-[9px] font-black text-slate-300 uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}>Fermé</p>
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
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Détail du planning</p>
            <h2 className="text-2xl font-black text-slate-900">
              {DAYS_F[isoDay(cur)]} <span className="text-blue-600">{cur.getDate()}</span>
            </h2>
          </div>
          <button onClick={() => toggleDay(dStr)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isOpen ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
            {isOpen ? 'Fermer la journée' : 'Ouvrir les réservations'}
          </button>
        </div>
        {isOpen ? (
          <div className="space-y-3">
            {slots.length > 0 ? slots.map(t => {
              const ev      = appointments.find(e => e.date === dStr && e.time === t);
              const blocked = isSlotBlocked(dStr, t);
              return (
                <div key={t}
                  className={`flex items-center gap-6 p-5 rounded-2xl border transition-all
                    ${ev ? 'bg-blue-50 border-blue-100'
                        : blocked ? 'bg-slate-50 border-slate-100 grayscale'
                        : 'bg-white border-slate-100 hover:border-blue-300 group cursor-pointer'}`}
                  onClick={() => !ev && !blocked && openModal(dStr, t)}
                >
                  <div className={`text-lg font-black w-16 shrink-0 transition-colors ${ev || blocked ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-500'}`}>{t}</div>
                  <div className="flex-1">
                    {ev ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-sm text-slate-900">{ev.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rendez-vous</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setSelectedAppt(ev); }} className="w-9 h-9 rounded-xl hover:bg-neutral-50 text-slate-400 flex items-center justify-center transition"><ChevronRight size={16}/></button>
                      </div>
                    ) : blocked ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-sm text-slate-500">Bloqué</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indisponible</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleSlot(dStr, t); }} className="w-9 h-9 rounded-xl hover:bg-blue-50 text-blue-400 flex items-center justify-center transition"><Unlock size={16}/></button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-slate-500 transition uppercase tracking-widest">Créneau disponible</span>
                        <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition"><Plus size={16}/></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic">Aucun créneau configuré pour ce jour.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm"><Clock size={32}/></div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Journée fermée</h3>
            <p className="text-sm font-medium text-slate-400 mb-8">Aucun créneau n&apos;est disponible pour cette date.</p>
            <button onClick={() => toggleDay(dStr)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-100 hover:scale-105 transition active:scale-95 uppercase tracking-wider">Ouvrir les réservations</button>
          </div>
        )}
      </div>
    );
  };

  const Dashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 overflow-y-auto h-full">
      <div className="lg:col-span-7 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black tracking-tight text-slate-800">Activité Récente</h3>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100">Rapport Complet</button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[
            { title: 'Drainage', desc: 'Séances actives', count: appointments.filter(e => (e.serviceId || '') === 'drainage').length || 12, g: 'from-blue-600 to-blue-400', icon: <Activity size={24}/> },
            { title: 'Massage', desc: 'Nouveaux patients', count: appointments.filter(e => (e.serviceId || '') === 'massage').length || 7, g: 'from-violet-600 to-violet-400', icon: <Leaf size={24}/> },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.g} p-7 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden`}>
              <div className="relative z-10 flex flex-col gap-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">{s.icon}</div>
                <div>
                  <h4 className="text-lg font-black">{s.title}</h4>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{s.desc}</p>
                </div>
                <div className="text-4xl font-black">{s.count}</div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"/>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Performance des Protocoles</h4>
          {[
            { label: "Taux d'occupation", prog: saturation, cls: 'text-blue-500', icon: <Target size={18}/> },
            { label: 'Fidélisation patients', prog: 75, cls: 'text-violet-500', icon: <Activity size={18}/> },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between mb-6 last:mb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">{s.icon}</div>
                <span className="text-xs font-bold text-slate-700">{s.label}</span>
              </div>
              <CircProgress pct={s.prog} cls={s.cls}/>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200">
          <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-6">Prochains RDV</h4>
          <div className="space-y-4">
            {upcoming.length > 0 ? upcoming.map((e, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shrink-0">{e.time?.slice(0, 5)}</div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black truncate">{e.title}</p>
                  <p className="text-[9px] font-bold opacity-40">{e.date}</p>
                </div>
                <ChevronRight size={14} className="ml-auto opacity-20 shrink-0"/>
              </div>
            )) : <p className="text-xs opacity-30 italic text-center py-4">Aucun rendez-vous à venir</p>}
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Accès Rapide</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📊', label: 'Rapport', fn: undefined },
              { icon: '⚙️', label: 'Créneaux', fn: () => setCfgOpen(true) },
              { icon: '👥', label: 'Patients', fn: undefined },
              { icon: '📨', label: 'Messages', fn: undefined },
            ].map((a, i) => (
              <button key={i} onClick={a.fn} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center cursor-pointer">
                <div className="text-2xl mb-2">{a.icon}</div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{a.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PatientsView = () => {
    const filtered = clients.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(clSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(clSearch.toLowerCase())
    );

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-8 pb-4 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Base Patients</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{filtered.length} Patients enregistrés</p>
          </div>
          <button onClick={() => setClModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition active:scale-95">
            <Plus size={16}/> Nouveau Patient
          </button>
        </div>

        <div className="px-8 py-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={18} className="text-slate-300"/>
            <input 
              type="text" value={clSearch} onChange={e => setClSearch(e.target.value)}
              placeholder="Rechercher par nom, email..." 
              className="bg-transparent border-none text-sm font-bold w-full outline-none text-slate-600 placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <div key={c.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-blue-600 text-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    {(c.firstName?.[0] || '') + (c.lastName?.[0] || '')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase truncate">{c.insurance || 'Sans Assurance'}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Bell size={12} className="opacity-40" />
                    <span className="text-[11px] font-bold truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Activity size={12} className="opacity-40" />
                    <span className="text-[11px] font-bold">{c.phone}</span>
                  </div>
                </div>
                <button className="w-full py-4 rounded-[1.5rem] border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                  Voir Dossier <ChevronRight size={12}/>
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200"><Users size={32}/></div>
                <p className="text-slate-400 font-bold italic">Aucun patient trouvé.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F7F2', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .sidebar-r { background: #2D5BFF; border-radius: 3rem 0 0 3rem; box-shadow: -20px 0 60px rgba(45,91,255,0.2); }
        .kpi-glass { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12); border-radius: 1.5rem; padding: 1rem; }
        .day-cell-m { background: #fff; transition: background 0.15s; }
        .day-cell-m:hover:not(.inactive-m):not(.blocked-m) { background: #F0F4FF; }
        .inactive-m { background: #fafbfc !important; cursor: default; }
        .today-m { background: #F0F7FF !important; }
        .blocked-m { background-image: repeating-linear-gradient(45deg,#F1F5F9,#F1F5F9 8px,#E2E8F0 8px,#E2E8F0 16px) !important; opacity: 0.7; }
        .nav-pill { border-radius: 1rem; padding: 10px 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; border: none; cursor: pointer; background: transparent; transition: all 0.2s; width: 60px; }
        .nav-pill:hover:not(.active) { background: #f1f5f9; }
        .nav-pill.active { background: #EEF4FF; }
        .view-btn { padding: 8px 18px; border-radius: 12px; border: none; cursor: pointer; font-family: inherit; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; transition: all 0.2s; color: #94a3b8; background: transparent; }
        .view-btn.active { background: #2D5BFF; color: #fff; box-shadow: 0 4px 14px rgba(45,91,255,0.3); }
        .mini-d { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 9px; font-weight: 700; cursor: pointer; transition: all 0.15s; margin: auto; }
        .mini-d:hover { background: rgba(255,255,255,0.15); }
        .mini-d.today { background: #fff; color: #2D5BFF; font-weight: 900; }
        button, input { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* ══ LEFT SIDEBAR ═════════════════════════════════════════════════════ */}
      <aside className="w-24 bg-white border-r border-slate-100 flex flex-col items-center py-10 gap-2 shrink-0 z-10">
        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-xl shadow-blue-100 mb-10">
          <Leaf size={22} className="text-white"/>
        </div>
        {([
          { id: 'dashboard', Icon: LayoutDashboard, label: 'Stats' },
          { id: 'scheduler', Icon: CalendarRange, label: 'Agenda' },
          { id: 'clients',   Icon: Users,          label: 'Patients' },
          { id: 'settings',  Icon: Settings,       label: 'Réglages' },
        ] as const).map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} className={`nav-pill ${tab === n.id ? 'active' : ''}`}>
            <n.Icon size={20} strokeWidth={tab === n.id ? 2.5 : 1.8} style={{ color: tab === n.id ? '#2D5BFF' : '#94a3b8' }}/>
            <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: tab === n.id ? '#2D5BFF' : '#94a3b8' }}>{n.label}</span>
          </button>
        ))}
        <div className="mt-auto">
          <button onClick={() => auth?.signOut()} title="Déconnexion" className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition">
            <Power size={14}/>
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">

        {/* Top nav */}
        <nav className="h-14 border-b border-gray-100 px-8 flex items-center justify-between bg-white shrink-0">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">{tab === 'scheduler' ? hdr : 'Performance'}</h1>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-0.5">
              {tab === 'scheduler' ? (view === 'month' ? 'Vue Mensuelle' : view === 'week' ? 'Vue Hebdomadaire' : 'Vue Quotidienne') : 'Tableau de bord'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Search size={14} className="text-slate-300"/>
              <input type="text" placeholder="Rechercher..." className="bg-transparent border-none text-[11px] font-bold w-36 outline-none text-slate-600 placeholder:text-slate-300"/>
            </div>
            {tab === 'scheduler' && (
              <>
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  {(['month', 'week', 'day'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} className={`view-btn ${view === v ? 'active' : ''}`}>
                      {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
                  <button onClick={() => period(-1)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-800"><ChevronLeft size={15}/></button>
                  <button onClick={() => setCur(new Date())} className="px-3 py-1.5 text-[9px] font-black text-slate-400 hover:text-blue-600 transition uppercase tracking-wider">Aujourd&apos;hui</button>
                  <button onClick={() => period(1)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-800"><ChevronRight size={15}/></button>
                </div>
              </>
            )}
            <button onClick={() => setCfgOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700"><Cog size={17}/></button>
            <div className="relative cursor-pointer ml-1">
              <Bell size={17} className="text-slate-400"/>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border border-white rounded-full"/>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {tab === 'scheduler' ? (
            view === 'month' ? <MonthView/> : view === 'week' ? <WeekView/> : <DayView/>
          ) : tab === 'clients' ? <PatientsView/> : <Dashboard/>}
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
            <div className="text-[8px] text-blue-300 font-bold mt-1">Cette semaine</div>
          </div>
        </div>

        {/* Block mode toggle */}
        <button onClick={() => setBlockMode(!blockMode)}
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
                  style={{ color: !inM ? 'rgba(255,255,255,0.15)' : (isToday || isSel) ? '#2D5BFF' : 'rgba(255,255,255,0.7)' }}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="flex-1">
          <h3 className="font-extrabold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 opacity-60">
            <Clock size={12}/> Prochains RDV
          </h3>
          <div className="space-y-3">
            {upcoming.length > 0 ? upcoming.map(e => (
              <div key={e.id} className="bg-white/10 p-3 rounded-2xl flex items-center justify-between border border-white/5">
                <div className="min-w-0">
                  <div className="text-[10px] font-black truncate">{e.title}</div>
                  <div className="text-[8px] opacity-60 font-bold uppercase tracking-wider mt-0.5">{e.date} • {e.time}</div>
                </div>
                <ChevronRight size={12} className="opacity-20 shrink-0 ml-2"/>
              </div>
            )) : <div className="text-[10px] text-center py-4 opacity-40 italic font-bold">Aucun rendez-vous à venir</div>}
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
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black mb-8 text-slate-900">Gérer le créneau</h2>
            {evStep === 'choice' ? (
              <div className="space-y-4">
                <button onClick={() => setEvStep('book')} className="w-full flex items-center gap-5 p-5 border border-blue-50 rounded-2xl bg-blue-50/50 hover:bg-blue-100/50 transition text-left group">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition shrink-0"><Users size={20}/></div>
                  <div>
                    <div className="font-extrabold text-sm text-blue-900">Réserver Client</div>
                    <div className="text-[10px] text-blue-600 font-medium opacity-70">Nouveau rendez-vous</div>
                  </div>
                </button>
                <button onClick={saveBlock} className="w-full flex items-center gap-5 p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100 transition text-left group">
                  <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition shrink-0"><Lock size={16}/></div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Bloquer Créneau</div>
                    <div className="text-[10px] text-slate-500 font-medium opacity-70">Rendre indisponible</div>
                  </div>
                </button>
                <div className="text-center mt-6">
                  <button onClick={() => setEvModal(null)} className="text-[10px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-widest">Fermer</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom du client</label>
                  <input
                    autoFocus value={evName}
                    onChange={e => setEvName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveBook()}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Tapez pour rechercher ou ajouter..."
                  />
                  {evName && clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).length > 0 && (
                    <div className="max-h-32 overflow-y-auto border border-slate-100 rounded-2xl bg-white shadow-sm mt-2 p-1">
                      {clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).map(c => (
                        <button key={c.id} onClick={() => setEvName(`${c.firstName} ${c.lastName}`)} className="w-full p-3 text-left hover:bg-blue-50 rounded-xl flex items-center justify-between group">
                          <div>
                            <p className="text-[11px] font-black text-slate-800">{c.firstName} {c.lastName}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.phone || c.email}</p>
                          </div>
                          <ChevronRight size={10} className="text-slate-200 group-hover:text-blue-400"/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <div className="px-4 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">{evModal.date}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Heure</label>
                    <div className="px-4 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">{evModal.time}</div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setEvStep('choice')} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Retour</button>
                  <button onClick={saveBook} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition">Confirmer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ APPOINTMENT DETAIL/EDIT MODAL ═══════════════════════════════════ */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-32 bg-blue-600 p-8 flex flex-col justify-end relative">
               <button onClick={() => { setSelectedAppt(null); setIsEditing(false); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition"><X size={20}/></button>
               <h2 className="text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Détails du RDV</h2>
               <p className="text-2xl font-black text-white truncate">{selectedAppt.title}</p>
            </div>
            
            <div className="p-8 space-y-6">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-bold text-slate-900">{selectedAppt.date}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Heure</p>
                      <p className="text-sm font-bold text-slate-900">{selectedAppt.time}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <button onClick={() => { setIsEditing(true); setEditName(selectedAppt.title); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition">
                      Modifier la réservation
                    </button>
                    <button onClick={deleteEvent} className="w-full py-4 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition">
                      Supprimer le rendez-vous
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom du client</label>
                      <input 
                        autoFocus value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Annuler</button>
                      <button onClick={saveEdit} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition">Enregistrer</button>
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
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black mb-2 text-slate-900">Horaires Types</h2>
            <p className="text-xs text-slate-500 mb-8 font-medium">Configurez les créneaux par défaut pour chaque journée.</p>
            <div className="flex border-b border-slate-100 mb-6 gap-1 overflow-x-auto">
              {DAYS_S.map((d, i) => (
                <button key={i} onClick={() => setCfgDay(i)}
                  className={`pb-3 px-3 text-[10px] font-black tracking-widest uppercase border-b-2 transition whitespace-nowrap ${cfgDay === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                >{d}</button>
              ))}
            </div>
            <div className="space-y-2 mb-6 max-h-52 overflow-y-auto pr-1">
              {[...(configSlots[cfgDay] || [])].sort().map(s => (
                <div key={s} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{s}</span>
                  <button onClick={() => removeSlot(s)} className="text-red-400 hover:text-red-600 transition"><X size={16}/></button>
                </div>
              ))}
              {(configSlots[cfgDay] || []).length === 0 && (
                <p className="text-center py-4 text-xs text-slate-300 italic font-bold">Aucun créneau configuré</p>
              )}
            </div>
            <div className="flex gap-2 mb-8">
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"/>
              <button onClick={addSlot} className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Ajouter</button>
            </div>
            <div className="flex flex-col gap-3 pt-5 border-t border-slate-100">
              <button onClick={applyToWeek} className="text-xs text-blue-600 font-bold hover:bg-blue-50 py-2 rounded-lg transition uppercase tracking-widest">
                Appliquer à toute la semaine
              </button>
              <button onClick={saveConfig} disabled={savingCfg}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition active:scale-95 disabled:opacity-60">
                {savingCfg ? 'Enregistrement…' : 'Enregistrer & Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ ADD CLIENT MODAL ═════════════════════════════════════════════════ */}
      {clModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"/>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Nouveau Patient</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Création de dossier</p>
              </div>
              <button onClick={() => setClModal(false)} className="bg-slate-50 p-3 rounded-2xl text-slate-300 hover:text-slate-600 transition"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                <input value={clForm.firstName} onChange={e => setClForm({...clForm, firstName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition" placeholder="Prénom"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                <input value={clForm.lastName} onChange={e => setClForm({...clForm, lastName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition" placeholder="Nom de famille"/>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" value={clForm.email} onChange={e => setClForm({...clForm, email: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition" placeholder="email@exemple.com"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                <input value={clForm.phone} onChange={e => setClForm({...clForm, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition" placeholder="+41 7x xxx xx xx"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Complète</label>
                <input value={clForm.address} onChange={e => setClForm({...clForm, address: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition" placeholder="Rue, ville, NPA..."/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">N° Assurance / Groupe</label>
                <input value={clForm.insurance} onChange={e => setClForm({...clForm, insurance: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition" placeholder="Ex: Groupe Mutuel, Helsana..."/>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setClModal(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Annuler</button>
              <button onClick={saveClient} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition active:scale-95">Créer le Dossier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}