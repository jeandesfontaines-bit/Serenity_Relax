"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Users, Calendar as CalendarIcon, CreditCard, TrendingUp, Plus,
  LayoutDashboard, UserPlus, Lock, ChevronRight, Power, CloudSun,
  Leaf, Wand2, ChevronLeft, Clock, Trash2, Check, LockOpen, Info,
  Bell, Search, ArrowUpRight, MessageSquare, Target, MoreHorizontal
} from 'lucide-react';
import { 
  useFirestore, 
  useCollection, 
  useUser, 
  useMemoFirebase 
} from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  doc,
  updateDoc,
  deleteDoc, 
  serverTimestamp,
  onSnapshot,
  addDoc,
  setDoc
} from 'firebase/firestore';
import { SERVICES } from '@/lib/types';

// Utils
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const dayNamesShort = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

const formatDate = (date: Date) => {
  try {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

const getAdjDay = (d: Date) => { 
  let day = d.getDay(); 
  return day === 0 ? 6 : day - 1; 
};

const getStartOfWeek = (d: Date) => {
  const res = new Date(d);
  res.setDate(res.getDate() - getAdjDay(res));
  return res;
};

const defaultSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function TherapistDashboard() {
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);

  // --- ÉTATS DE NAVIGATION ET VUE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); 
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);

  // --- ÉTATS DE DONNÉES ---
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'appointments'), orderBy('startTime', 'asc'));
  }, [firestore]);

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'clients'), orderBy('lastName', 'asc'));
  }, [firestore]);

  const { data: appointmentsRaw } = useCollection(appointmentsQuery) as { data: any[] | null };
  const { data: clientsRaw } = useCollection(clientsQuery) as { data: any[] | null };
  
  const events = useMemo(() => {
    if (!appointmentsRaw) return [];
    return appointmentsRaw.map(a => {
      const parts = a.startTime.split('T');
      return {
        id: a.id,
        date: parts[0],
        time: parts[1].substring(0, 5), // Assure un format HH:MM
        title: `${a.firstName} ${a.lastName}`,
        type: a.status === 'cancelled' ? 'blocked' : 'reservation',
        ...a
      };
    });
  }, [appointmentsRaw]);

  const patients = useMemo(() => clientsRaw || [], [clientsRaw]);

  const [pendingEvent, setPendingEvent] = useState({ date: '', time: '', title: '', type: 'reservation', firstName: '', lastName: '', email: '', phone: '' });
  const [pendingDelete, setPendingDelete] = useState<any>(null);

  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

  const [weekdaySlotsStr, setWeekdaySlotsStr] = useState("09:00, 10:30, 13:00, 14:30, 16:00, 17:30, 19:00");
  const [saturdaySlotsStr, setSaturdaySlotsStr] = useState("09:00, 10:30, 12:00, 13:30, 15:00, 16:30");

  const defaultWeekdaySlots = weekdaySlotsStr.split(',').map(s => s.trim()).filter(Boolean);
  const defaultSaturdaySlots = saturdaySlotsStr.split(',').map(s => s.trim()).filter(Boolean);

  const configSlots = {
    0: [], 1: defaultWeekdaySlots, 2: defaultWeekdaySlots, 3: defaultWeekdaySlots, 
    4: defaultWeekdaySlots, 5: defaultWeekdaySlots, 6: defaultSaturdaySlots
  };

  useEffect(() => {
    setIsClient(true);
    const unsubBlocks = listenToBlocks();
    const unsubConfig = listenToConfig();
    return () => {
      unsubBlocks?.();
      unsubConfig?.();
    };
  }, [firestore]);

  const listenToConfig = () => {
    if (!firestore) return;
    return onSnapshot(doc(firestore, "settings", "global_config"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.weekdaySlots) setWeekdaySlotsStr(data.weekdaySlots.join(', '));
        if (data.saturdaySlots) setSaturdaySlotsStr(data.saturdaySlots.join(', '));
      }
    });
  };

  const listenToBlocks = () => {
    if (!firestore) return;
    return onSnapshot(collection(firestore, "availability"), (snapshot) => {
      setBlockedSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const handleLogout = () => { window.location.reload(); };

  const toggleSlot = async (dStr: string, tStr: string) => {
    if (!firestore) return;
    const existing = blockedSlots.find(s => s.date === dStr && s.time === tStr);
    if (existing) {
      await deleteDoc(doc(firestore, "availability", existing.id));
    } else {
      await addDoc(collection(firestore, "availability"), {
        date: dStr,
        time: tStr,
        type: 'blocked'
      });
    }
  };

  const checkDayIsOpened = (dStr: string) => {
    return blockedSlots.some(s => s.date === dStr && s.type === 'day_opened');
  };

  const toggleDay = async (dStr: string) => {
    if (!firestore) return;
    const existing = blockedSlots.find(s => s.date === dStr && s.type === 'day_opened');
    if (existing) {
      // If we close the day, we remove the 'day_opened' marker. 
      // We could also remove all slot blocks for that day to reset.
      await deleteDoc(doc(firestore, "availability", existing.id));
    } else {
      // Open the day by adding the marker
      await addDoc(collection(firestore, "availability"), {
        date: dStr,
        type: 'day_opened'
      });
    }
  };

  const blockFullDay = async (dStr: string, dObj: Date) => {
    if (!firestore) return;
    const dayOfWeek = getAdjDay(dObj);
    const slotsToBlock = configSlots[dayOfWeek as keyof typeof configSlots] || [];
    
    const existingBlocks = blockedSlots.filter(s => s.date === dStr);
    
    const promises = slotsToBlock.map(tStr => {
      if (!existingBlocks.some(s => s.time === tStr)) {
        return addDoc(collection(firestore, "availability"), {
          date: dStr,
          time: tStr,
          type: 'blocked'
        });
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  };

  const unblockFullDay = async (dStr: string) => {
    if (!firestore) return;
    const existingBlocks = blockedSlots.filter(s => s.date === dStr);
    const promises = existingBlocks.map(s => deleteDoc(doc(firestore, "availability", s.id)));
    await Promise.all(promises);
  };

  const changePeriod = (delta: number) => {
    const newDate = new Date(currentDisplayDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + delta);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (delta * 7));
    else newDate.setDate(newDate.getDate() + delta);
    setCurrentDisplayDate(newDate);
  };

  const saveEvent = async (e: any) => {
    if (e) e.preventDefault();
    if (!firestore) return;

    const appointmentId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const apptPayload = { 
      id: appointmentId,
      firstName: pendingEvent.firstName || pendingEvent.title.split(' ')[0] || '',
      lastName: pendingEvent.lastName || pendingEvent.title.split(' ').slice(1).join(' ') || '',
      email: pendingEvent.email,
      phone: pendingEvent.phone,
      serviceId: SERVICES[0].id,
      startTime: `${pendingEvent.date}T${pendingEvent.time}`,
      status: 'confirmed',
      updatedAt: serverTimestamp(),
      clientNameSnapshot: pendingEvent.title || `${pendingEvent.firstName} ${pendingEvent.lastName}`
    };
    
    await setDoc(doc(firestore, 'appointments', appointmentId), apptPayload, { merge: true });
    setShowModal(null);
  };

  const deleteEvent = async () => {
    if (pendingDelete && pendingDelete.id && firestore) {
      await deleteDoc(doc(firestore, 'appointments', pendingDelete.id));
    }
    setShowModal(null);
  };

  if (!isClient) return null;

  // --- VIEWS ---

  const DashboardView = () => {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const todayStr = formatDate(new Date());
    const todayEvents = events.filter(e => e.date === todayStr);
    
    // logic for stats:
    const revenueWeek = events
      .filter(e => {
        const d = new Date(e.date);
        const wStart = getStartOfWeek(new Date());
        return d >= wStart && d <= new Date();
      })
      .reduce((acc, curr) => acc + (SERVICES.find(s => s.id === curr.serviceId)?.price || 0), 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En ligne • {today}</p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Bonjour, <span className="text-emerald-600">Joao</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Consultations", value: todayEvents.length, sub: "aujourd'hui", icon: <CalendarIcon size={18}/>, color: "emerald" },
            { label: "Patients", value: patients.length, sub: "base active", icon: <UserPlus size={18}/>, color: "blue" },
            { label: "Revenus", value: revenueWeek, sub: "CHF / semaine", icon: <CreditCard size={18}/>, color: "indigo" },
            { label: "Remplissage", value: "88%", sub: "+4% vs m-1", icon: <Target size={18}/>, color: "rose" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all group cursor-default">
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-colors ${
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
                <div className="flex justify-between items-baseline">
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                  <ArrowUpRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[7px] font-bold text-slate-300 uppercase mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Prochains rendez-vous</h3>
              <button onClick={() => setActiveTab('calendar')} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Voir agenda</button>
            </div>
            <div className="space-y-2">
              {todayEvents.length > 0 ? todayEvents.map((ev, i) => {
                const service = SERVICES.find(s => s.id === ev.serviceId);
                const phoneToUse = ev.phone || patients.find(p => p.id === ev.clientId)?.phone;
                const waPhone = phoneToUse ? phoneToUse.replace(/[^0-9]/g, '') : null;
                const message = encodeURIComponent(`Bonjour ${ev.firstName || ''}, je vous contacte concernant votre soin d'aujourd'hui à ${ev.time}.`);
                return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                  <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm font-black border border-slate-50 shrink-0">
                    <span className="text-[10px] text-emerald-600">{ev.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 uppercase text-xs tracking-tight truncate">{ev.title}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{service?.name || 'Soin'} • 45 min</p>
                  </div>
                  <div className="flex gap-1">
                    {waPhone && (
                    <a href={`https://wa.me/${waPhone}?text=${message}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                      <MessageSquare size={14} />
                    </a>
                    )}
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-all">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}) : (
                <div className="text-center py-16 text-slate-300">
                  <CalendarIcon size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Aucun rendez-vous aujourd'hui</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-between overflow-hidden relative min-h-[320px]">
            <div className="relative z-10">
              <h3 className="text-base font-black uppercase tracking-tight mb-6">Notes du Cabinet</h3>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="w-1 h-10 bg-emerald-500 rounded-full shrink-0"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Visites</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-medium">L'art du toucher commence par l'écoute du silence.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Objectif Mensuel</p>
                 <div className="flex justify-between items-end mb-2">
                    <p className="text-xl font-black">78%</p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase">156 / 200</p>
                 </div>
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[78%]"></div>
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600/20 blur-[80px] rounded-full"></div>
          </div>
        </div>
      </div>
    );
  };

  const PatientsView = () => {
    const [searchQuery, setSearchQuery] = useState("");
    
    return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Gestion Patients</p>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Fiches Patients</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-2 flex items-center gap-3">
            <Search size={14} className="text-slate-300" />
            <input 
              type="text" 
              placeholder="Recherche..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-slate-800 focus:outline-none" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {patients.filter((p: any) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).map((p: any) => {
          const clientBookings = events.filter((a: any) => a.clientId === p.id);
          return (
          <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  {p.firstName?.charAt(0) || p.lastName?.charAt(0)}
                </div>
                <button className="text-slate-200 hover:text-slate-400 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{p.firstName} {p.lastName}</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1 truncate">{p.email || 'Email non fourni'}</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
              <div>
                <p className="text-[7px] font-bold text-slate-300 uppercase">Soins réels</p>
                <p className="text-[9px] font-black text-emerald-600">{clientBookings.length}</p>
              </div>
              <button className="w-7 h-7 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-emerald-600 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  )};

  const MonthView = () => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = getAdjDay(firstDay);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset; i > 0; i--) cells.push({ day: prevMonthLastDay - i + 1, inactive: true, type: 'prev' });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, inactive: false, type: 'current' });
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) cells.push({ day: i, inactive: true, type: 'next' });

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-100 animate-in fade-in duration-500">
        {dayNamesShort.map(d => (
          <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-widest bg-[#fbfcfb] uppercase">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          let dObj: Date;
          if (cell.type === 'prev') dObj = new Date(year, month - 1, cell.day);
          else if (cell.type === 'next') dObj = new Date(year, month + 1, cell.day);
          else dObj = new Date(year, month, cell.day);
          const dStr = formatDate(dObj);
          
          const isOpened = checkDayIsOpened(dStr);
          const isToday = isSameDay(new Date(), dObj);
          const dayEvents = events.filter(e => e.date === dStr);
          
          const defaultSlotsForDay = configSlots[getAdjDay(dObj) as keyof typeof configSlots] || [];
          const blockedCount = blockedSlots.filter(s => s.date === dStr).length;
          const availableCount = defaultSlotsForDay.length - blockedCount;

          return (
            <div 
              key={idx}
              onClick={() => {
                if (!cell.inactive) {
                  setCurrentDisplayDate(dObj);
                  setViewMode('day');
                  setActiveTab('calendar');
                }
              }}
              className={`min-h-[105px] p-4 transition-all cursor-pointer relative group ${cell.inactive ? 'bg-slate-50/40 text-slate-300' : 'bg-white text-slate-700 hover:bg-emerald-50/30'} ${!cell.inactive && !isOpened ? 'bg-stripe opacity-40' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-emerald-600 text-white shadow-lg' : 'group-hover:text-emerald-600'}`}>{cell.day}</span>
                {!cell.inactive && isOpened && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      blockFullDay(dStr, dObj); 
                    }} 
                    className="p-1 bg-emerald-50 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-colors tooltip hidden group-hover:block"
                    title="Bloquer cette journée"
                  >
                    <Lock size={10} className="text-emerald-600 group-hover:text-rose-500" />
                  </button>
                )}
                {!cell.inactive && !isOpened && defaultSlotsForDay.length > 0 && (
                   <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      unblockFullDay(dStr); 
                    }} 
                    className="p-1 bg-rose-50 rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors tooltip"
                    title="Débloquer cette journée"
                  >
                    <LockOpen size={10} className="text-rose-600 group-hover:text-emerald-600" />
                  </button>
                )}
              </div>
              {!cell.inactive && isOpened && availableCount > 0 && (
                <div className="mt-1">
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${dayEvents.length >= availableCount ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {Math.max(0, availableCount - dayEvents.length)} dispos
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const WeekView = () => {
    const start = getStartOfWeek(new Date(currentDisplayDate));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i); days.push(d);
    }
    return (
      <div className="grid grid-cols-7 gap-px bg-slate-100 min-h-[500px] animate-in fade-in duration-500">
        {days.map((d, i) => {
          const dStr = formatDate(d);
          const isOpened = checkDayIsOpened(dStr);
          const slots = configSlots[i as keyof typeof configSlots] || [];
          const isToday = isSameDay(new Date(), d);
          return (
            <div key={i} className={`p-4 bg-white ${!isOpened ? 'bg-slate-50/50' : ''}`}>
              <div onClick={() => { setCurrentDisplayDate(d); setViewMode('day'); }} className={`text-center mb-6 cursor-pointer p-3 rounded-2xl transition-all relative group ${isToday ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>{dayNamesShort[i]}</div>
                <div className={`text-2xl font-black ${isToday ? 'text-emerald-700' : 'text-slate-800'}`}>{d.getDate()}</div>
                {slots.length > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); toggleDay(dStr); }} className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-sm hidden group-hover:block transition-all ${isOpened ? 'bg-rose-50 text-rose-500 hover:bg-emerald-50 hover:text-emerald-600' : 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-500'}`} title={isOpened ? "Bloquer cette journée" : "Ouvrir cette journée"}>
                    {isOpened ? <Lock size={12} /> : <LockOpen size={12} />}
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                  {isOpened && slots.map(t => {
                    const isSlotBlocked = blockedSlots.some(s => s.date === dStr && s.time === t);
                    const ev = events.find(e => e.date === dStr && e.time === t);
                    
                    if (ev) {
                      return (
                        <div key={t} onClick={() => { setPendingDelete(ev); setShowModal('delete'); }} className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col gap-0.5 cursor-pointer hover:scale-[1.02] transition-all shadow-sm ${ev.type === 'blocked' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white'}`}>
                          <span className="opacity-70">{t}</span><span className="truncate font-black uppercase">{ev.title}</span>
                        </div>
                      )
                    } 
                    if (!isSlotBlocked && !isBlockMode) {
                      return (
                        <button key={t} onClick={() => { setPendingEvent({date: dStr, time: t, title: '', type: 'reservation', firstName:'', lastName:'', email:'', phone:''}); setShowModal('event'); }} className="w-full py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1 shadow-inner opacity-80 hover:opacity-100 mt-1">
                          <Plus size={10} /> {t}
                        </button>
                      );
                    }
                    if (isBlockMode) {
                      return (
                        <button key={t} onClick={() => toggleSlot(dStr, t)} className={`w-full py-2.5 border rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all mt-1 ${isSlotBlocked ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-emerald-50 hover:text-emerald-600' : 'bg-white border-slate-100 text-slate-400 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500'}`}>
                          {isSlotBlocked ? <Lock size={10} /> : <LockOpen size={10} />} {t}
                        </button>
                      );
                    }
                    return null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const DayView = () => {
    const dStr = formatDate(currentDisplayDate);
    const slots = configSlots[getAdjDay(currentDisplayDate) as keyof typeof configSlots] || [];
    const occupiedCount = events.filter(e => e.date === dStr).length;
    const blockedCount = blockedSlots.filter(s => s.date === dStr).length;
    const availableCount = Math.max(0, slots.length - occupiedCount - blockedCount);
    const isOpened = checkDayIsOpened(dStr);

    return (
      <div className="bg-white min-h-[600px] flex flex-col animate-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col flex-1 p-8">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  {currentDisplayDate.toLocaleDateString('fr-FR', {weekday: 'long'})}
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
                    {currentDisplayDate.toLocaleDateString('fr-FR', {day: 'numeric', month: 'long'})}
                  </h3>
                  {slots.length > 0 && (
                    <button onClick={() => toggleDay(dStr)} className={`p-2 ml-2 rounded-xl transition-colors tooltip ${isOpened ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-100 hover:text-rose-500' : 'bg-rose-50 text-rose-500 hover:bg-emerald-50 hover:text-emerald-600'}`} title={isOpened ? "Bloquer toute la journée" : "Ouvrir toute la journée"}>
                      {isOpened ? <Lock size={16} /> : <LockOpen size={16} />}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-4">
                   <div className="text-right">
                    <p className="text-[14px] font-black text-emerald-600 leading-none">{availableCount}</p>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Libres</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black text-slate-800 leading-none">{occupiedCount}</p>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Occupés</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slots.map(t => {
                const ev = events.find(e => e.date === dStr && e.time === t);
                const isSlotBlocked = blockedSlots.some(s => s.date === dStr && s.time === t);

                if (ev) {
                  return (
                    <div key={t} className={`p-4 rounded-3xl border transition-all flex flex-col justify-between min-h-[140px] group ${ev.type === 'blocked' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-50 shadow-sm hover:shadow-md'}`}>
                      <div className="flex justify-between items-start">
                        <div className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${ev.type === 'blocked' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white'}`}>
                          {t}
                        </div>
                        <button onClick={() => { setPendingDelete(ev); setShowModal('delete'); }} className="text-slate-200 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div>
                        <p className={`text-[11px] font-black uppercase tracking-tight truncate ${ev.type === 'blocked' ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                          {ev.title}
                        </p>
                        <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">
                          {ev.type === 'blocked' ? 'Indisponible' : 'Confirmé'}
                        </p>
                      </div>
                    </div>
                  ) 
                }
                
                if (!isSlotBlocked) {
                  return (
                    <div key={t} className="relative group p-4 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between min-h-[140px] hover:border-emerald-300 transition-all text-left">
                      <div className="flex justify-between items-start">
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 font-black text-[10px] text-emerald-600 transition-all">
                          {t}
                        </div>
                        <button onClick={() => toggleSlot(dStr, t)} className="text-slate-300 hover:text-rose-500 z-10 transition-colors tooltip" title="Bloquer ce créneau">
                          <Lock size={14} /> 
                        </button>
                      </div>
                      <button onClick={() => { setPendingEvent({date: dStr, time: t, title: '', type: 'reservation', firstName:'', lastName:'', email:'', phone:''}); setShowModal('event'); }} className="text-[9px] font-black text-slate-400 bg-slate-50 flex items-center justify-center gap-1 rounded-xl p-2 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors">
                        <Plus size={12}/> Réserver
                      </button>
                    </div>
                  )
                }

                return (
                  <button key={t} onClick={() => toggleSlot(dStr, t)} className="p-4 rounded-3xl border border-rose-100 bg-rose-50 flex flex-col justify-between min-h-[140px] hover:border-emerald-200 hover:bg-emerald-50/20 transition-all text-left group/closed opacity-80 hover:opacity-100">
                    <div className="flex justify-between items-start">
                      <div className="px-2.5 py-1 rounded-lg bg-white font-black text-[10px] text-rose-400 group-hover/closed:text-emerald-600 transition-all">
                        {t}
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-rose-300 group-hover/closed:bg-emerald-600 group-hover/closed:text-white transition-all shadow-sm">
                        <LockOpen size={12} />
                      </div>
                    </div>
                    <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest group-hover/closed:text-emerald-600 transition-colors">Débloquer</p>
                  </button>
                );
              })}
            </div>
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fbfcfb] text-slate-900 relative font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <style>{`
        .bg-stripe {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px);
        }
      `}</style>
      <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-[#fbfcfb]/80 backdrop-blur-md px-4 md:px-10 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-4 md:gap-10">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><Leaf size={18} /></div>
            <div className="ml-3 hidden sm:block"><h1 className="font-black text-sm leading-none text-slate-800 tracking-tight">Serenity Relax</h1><p className="text-[7px] text-emerald-600 font-black uppercase tracking-[0.3em] mt-1">Cabinet Santé</p></div>
          </div>
          <nav className="flex items-center gap-1 md:gap-2">
            {[
              { id: 'dashboard', label: 'Aperçu', icon: <LayoutDashboard size={14}/> },
              { id: 'patients', label: 'Patients', icon: <Users size={14}/> },
              { id: 'calendar', label: 'Agenda', icon: <CalendarIcon size={14}/> }
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-3 md:px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                {item.icon}
                <span className={`${activeTab !== item.id && 'hidden'} md:inline`}>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowModal('config')} className="text-slate-400 hover:text-emerald-600 transition-all font-black text-[9px] uppercase tracking-widest hidden md:block"><Clock size={16} /></button>
          <button onClick={handleLogout} className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all shadow-sm"><Power size={16} /></button>
        </div>
      </header>

      <main className="w-full pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'patients' && <PatientsView />}
          {activeTab === 'calendar' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase whitespace-nowrap">
                    {viewMode === 'month' ? `${monthNames[currentDisplayDate.getMonth()]} ${currentDisplayDate.getFullYear()}` : viewMode === 'week' ? `Semaine ${Math.ceil(currentDisplayDate.getDate() / 7)}` : currentDisplayDate.toLocaleDateString('fr-FR', {day:'numeric', month:'long'})}
                  </h2>
                  <div className="hidden lg:flex items-center gap-1">
                    <button onClick={() => changePeriod(-1)} className="w-9 h-9 flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-800">
                      <ChevronLeft size={18}/>
                    </button>
                    <button onClick={() => setCurrentDisplayDate(new Date())} className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800">Aujourd'hui</button>
                    <button onClick={() => changePeriod(1)} className="w-9 h-9 flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-800">
                      <ChevronRight size={18}/>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button onClick={() => setIsBlockMode(!isBlockMode)} className={`flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isBlockMode ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 shadow-sm hover:text-rose-600'}`}>
                    {isBlockMode ? <Check size={12} /> : <Lock size={12} />} 
                    {isBlockMode ? 'Terminé' : 'Bloquer Créneaux'}
                  </button>
                  
                  <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                    {['month', 'week', 'day'].map(m => (
                      <button key={m} onClick={() => setViewMode(m)} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${viewMode === m ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-500'}`}>
                        {m === 'month' ? 'Mois' : m === 'week' ? 'Sem' : 'Jour'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm min-h-[600px]">
                {viewMode === 'month' && <MonthView />}
                {viewMode === 'week' && <WeekView />}
                {viewMode === 'day' && <DayView />}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALES */}
      {showModal === 'event' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/5 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-xl font-black mb-8 text-slate-800 uppercase tracking-tight">Nouv. RDV manuel à {pendingEvent.time}</h3>
            <form onSubmit={saveEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Prénom</label>
                  <input type="text" autoFocus value={pendingEvent.firstName} onChange={e => setPendingEvent({...pendingEvent, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom</label>
                  <input type="text" value={pendingEvent.lastName} onChange={e => setPendingEvent({...pendingEvent, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                <input type="email" value={pendingEvent.email} onChange={e => setPendingEvent({...pendingEvent, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Téléphone</label>
                <input type="tel" value={pendingEvent.phone} onChange={e => setPendingEvent({...pendingEvent, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Annuler</button>
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'delete' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/5 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl p-10 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tight">Supprimer le RDV ?</h3>
            <p className="text-xs text-slate-400 font-medium mb-8">Cette action libérera le créneau de {pendingDelete?.time}.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Annuler</button>
              <button type="button" onClick={deleteEvent} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'config' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/5 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl p-10 animate-in zoom-in-95">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Configuration Cabinet</h3>
                <p className="text-xs text-slate-400 font-medium">Les créneaux ci-dessous seront générés par défaut chaque jour. Vous pourrez les bloquer individuellement depuis l'agenda.</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Clock size={20} />
              </div>
            </div>
            
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Du Lundi au Vendredi (Format: HH:MM, séparés par des virgules)</h4>
                 <input 
                   type="text" 
                   value={weekdaySlotsStr} 
                   onChange={(e) => setWeekdaySlotsStr(e.target.value)} 
                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm"
                 />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Samedi (Format: HH:MM, séparés par des virgules)</h4>
                 <input 
                   type="text" 
                   value={saturdaySlotsStr} 
                   onChange={(e) => setSaturdaySlotsStr(e.target.value)} 
                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm"
                 />
              </div>
              <div className="p-4 bg-rose-50/50 rounded-2xl space-y-3">
                 <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Dimanche</h4>
                 <p className="text-xs font-medium text-rose-400">Fermé (Aucun créneau par défaut)</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-4">
              <button type="button" onClick={() => setShowModal(null)} className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm text-center">Fermer</button>
              <button 
                type="button" 
                onClick={async () => {
                  if (!firestore) return;
                  await setDoc(doc(firestore, "settings", "global_config"), {
                    weekdaySlots: weekdaySlotsStr.split(',').map(s => s.trim()).filter(Boolean),
                    saturdaySlots: saturdaySlotsStr.split(',').map(s => s.trim()).filter(Boolean)
                  }, { merge: true });
                  setShowModal(null);
                }} 
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-center"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}