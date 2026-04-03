
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  serverTimestamp 
} from 'firebase/firestore';
import { 
  format, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  Wallet, 
  Clock, 
  X, 
  ArrowRight, 
  LayoutGrid,
  CalendarDays,
  Activity,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

const formatCHF = (amt: number) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amt);

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmé', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Annulé', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
};

const TIME_SLOTS = ["08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

export default function TherapistDashboard() {
  const { firestore } = useFirestore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [sidePanel, setSidePanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    serviceId: SERVICES[0].id,
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'pending' as keyof typeof STATUS_CONFIG,
    notes: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'appointments'), orderBy('startTime', 'asc'));
  }, [firestore]);

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'clients'), orderBy('lastName', 'asc'));
  }, [firestore]);

  const { data: appointmentsRaw } = useCollection(appointmentsQuery);
  const { data: clientsRaw } = useCollection(clientsQuery);
  
  const appointments = useMemo(() => appointmentsRaw || [], [appointmentsRaw]);
  const clients = useMemo(() => clientsRaw || [], [clientsRaw]);

  const stats = useMemo(() => {
    const todayStr = isClient ? format(new Date(), 'yyyy-MM-dd') : '';
    const todayBookings = appointments.filter(a => a.startTime.startsWith(todayStr));
    const revenueToday = todayBookings.reduce((acc, curr) => {
      const s = SERVICES.find(sv => sv.id === curr.serviceId);
      return acc + (s?.price || 0);
    }, 0);
    return { countToday: todayBookings.length, revenueToday };
  }, [appointments, isClient]);

  const handleSave = async () => {
    if (!firestore || !formData.firstName) return;
    const payload = { ...formData, updatedAt: serverTimestamp() };
    if (editingId) {
      await updateDoc(doc(firestore, 'appointments', editingId), payload);
    }
    setSidePanel(false);
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'appointments', id));
    setSidePanel(false);
  };

  const openNew = (dateStr?: string) => {
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      serviceId: SERVICES[0].id,
      startTime: dateStr ? `${dateStr}T10:00` : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      status: 'pending',
      notes: ''
    });
    setSidePanel(true);
  };

  const openEdit = (appt: any) => {
    setEditingId(appt.id);
    setFormData({
      firstName: appt.firstName || appt.clientNameSnapshot?.split(' ')[0] || 'Client',
      lastName: appt.lastName || appt.clientNameSnapshot?.split(' ')[1] || '',
      serviceId: appt.serviceId,
      startTime: appt.startTime,
      status: appt.status,
      notes: appt.notes || ''
    });
    setSidePanel(true);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-neutral-900 selection:bg-neutral-900 selection:text-white pt-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12 flex items-center justify-between">
            <nav className="flex bg-white p-1.5 rounded-full border border-neutral-100 shadow-sm">
              {[
                { id: "dashboard", label: "Accueil", icon: LayoutGrid },
                { id: "calendar", label: "Agenda", icon: CalendarDays },
                { id: "clients", label: "Dossiers", icon: Users },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedDate(null); }}
                  className={`px-6 py-2.5 text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${
                    activeTab === item.id 
                      ? "bg-neutral-900 text-white shadow-lg" 
                      : "text-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </nav>
            <button 
              onClick={() => openNew()}
              className="bg-neutral-900 text-white px-8 py-3 rounded-full hover:bg-neutral-800 transition-all flex items-center gap-3 shadow-xl active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.2em]">Nouveau Soin</span>
            </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {[
                   { label: "Revenue du jour", value: formatCHF(stats.revenueToday), trend: "up", icon: Wallet, color: "text-neutral-900" },
                   { label: "Occupation", value: `${Math.round((stats.countToday / TIME_SLOTS.length) * 100)}%`, trend: "down", icon: Activity, color: "text-neutral-900" },
                   { label: "Séances aujourd'hui", value: stats.countToday, trend: "up", icon: CalendarDays, color: "text-neutral-900" },
                   { label: "Total Clients", value: clients.length.toString(), trend: "up", icon: Users, color: "text-neutral-900" },
                 ].map((kpi, idx) => (
                  <div key={idx} className="p-10 rounded-[2.5rem] bg-white border border-neutral-100/50 hover:shadow-2xl transition-all duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 mb-8">
                      <kpi.icon size={20}/>
                    </div>
                    <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">{kpi.label}</p>
                    <p className="text-3xl font-serif font-bold text-neutral-900">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-16">
                <div className="col-span-12 lg:col-span-8 space-y-10">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-4xl font-serif font-bold tracking-tight">Planning du jour</h3>
                    <div className="bg-white px-8 py-3 rounded-full border border-neutral-100 flex items-center gap-4">
                      <Clock size={14} className="text-neutral-400" />
                      <span className="text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.3em] text-neutral-600">
                        {isClient ? format(new Date(), 'EEEE d MMMM', { locale: fr }) : '...'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {appointments
                      .filter(a => a.startTime.startsWith(format(new Date(), 'yyyy-MM-dd')))
                      .map(appt => {
                        const service = SERVICES.find(sv => sv.id === appt.serviceId);
                        const status = STATUS_CONFIG[appt.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={appt.id} 
                            onClick={() => openEdit(appt)} 
                            className="group bg-white p-8 rounded-[3rem] border border-neutral-100/50 hover:shadow-2xl transition-all duration-700 cursor-pointer flex items-center gap-10"
                          >
                            <div className="flex flex-col items-center justify-center min-w-[100px] h-24 bg-neutral-50 rounded-[2rem] group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
                              <span className="text-xl font-serif font-bold">{appt.startTime.split('T')[1].substring(0, 5)}</span>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="text-2xl font-serif font-bold text-neutral-900 mb-2">{appt.firstName || 'Client'} {appt.lastName || ''}</h4>
                              <div className="flex items-center gap-4">
                                 <span className={`text-[8px] font-sans font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${status.color}`}>
                                   {status.label}
                                 </span>
                                 <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-[0.3em]">
                                   {service?.name.split(' - ')[0]}
                                 </span>
                              </div>
                            </div>
                            
                            <div className="text-right flex items-center gap-12">
                              <span className="text-xl font-serif font-bold text-neutral-900">{formatCHF(service?.price || 0)}</span>
                              <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
                                <Edit3 size={20} />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    {appointments.filter(a => a.startTime.startsWith(format(new Date(), 'yyyy-MM-dd'))).length === 0 && (
                      <div className="py-32 text-center flex flex-col items-center gap-8 bg-white rounded-[4rem] border border-dashed border-neutral-200">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                          <Calendar size={32} />
                        </div>
                        <div>
                          <p className="text-2xl font-serif font-bold mb-3">Aucun rendez-vous aujourd'hui</p>
                          <p className="text-sm text-neutral-400 italic">Un moment de calme pour votre propre sérénité.</p>
                        </div>
                        <button onClick={() => openNew()} className="text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.3em] text-neutral-900 hover:underline">Planifier un soin</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:col-span-4 lg:block space-y-12">
                  <div className="p-12 rounded-[3.5rem] bg-neutral-900 text-white shadow-2xl relative overflow-hidden">
                    <Sparkles size={60} className="absolute -right-6 -bottom-6 text-white/5" />
                    <h4 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-white/40 mb-10">Mantra du jour</h4>
                    <p className="text-2xl font-serif italic font-light leading-relaxed mb-10">
                      "L'art du toucher commence par l'écoute du silence."
                    </p>
                    <div className="pt-10 border-t border-white/10 flex justify-between">
                       <div>
                          <p className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-white/40 mb-2">Visites du mois</p>
                          <p className="text-3xl font-serif font-bold">{appointments.length}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-white/40 mb-2">Objectif</p>
                          <p className="text-3xl font-serif font-bold">92%</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-12 rounded-[3.5rem] border border-neutral-100/50">
                    <h4 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 mb-10">Visites Récentes</h4>
                    <div className="space-y-8">
                      {clients.slice(0, 5).map((client) => (
                        <div key={client.id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 font-serif font-bold group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
                              {client.lastName?.charAt(0) || client.firstName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-sans font-bold">{client.firstName} {client.lastName}</p>
                              <p className="text-[8px] text-neutral-400 uppercase font-black tracking-[0.2em]">Client Dossier</p>
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-neutral-200 group-hover:text-neutral-900 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="bg-white rounded-[4rem] shadow-sm border border-neutral-100 overflow-hidden">
                 <div className="p-10 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/20">
                    <div className="flex items-center gap-10">
                       {selectedDate ? (
                         <button onClick={() => setSelectedDate(null)} className="text-neutral-900 flex items-center gap-4 hover:bg-neutral-50 px-6 py-2.5 rounded-full transition-all border border-neutral-200">
                           <ChevronLeft size={16} strokeWidth={2.5} />
                           <span className="text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.2em]">Retour au mois</span>
                         </button>
                       ) : (
                         <div className="flex items-center gap-10">
                           <h3 className="text-4xl font-serif font-bold tracking-tight capitalize">
                             {format(viewDate, 'MMMM yyyy', { locale: fr })}
                           </h3>
                           <div className="flex gap-2 bg-white p-1 rounded-full border border-neutral-100">
                              <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-2.5 text-neutral-300 hover:text-neutral-900 rounded-full hover:bg-neutral-50 transition-all"><ChevronLeft size={20} /></button>
                              <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-2.5 text-neutral-300 hover:text-neutral-900 rounded-full hover:bg-neutral-50 transition-all"><ChevronRight size={20} /></button>
                           </div>
                         </div>
                       )}
                    </div>
                 </div>

                 {!selectedDate ? (
                   <div className="grid grid-cols-7">
                     {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                       <div key={d} className="py-8 text-center text-[10px] font-sans font-black text-neutral-300 uppercase tracking-[0.3em] border-b border-neutral-50">{d}</div>
                     ))}
                     {eachDayOfInterval({
                       start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
                       end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 })
                     }).map((day, i) => {
                       const dateStr = format(day, 'yyyy-MM-dd');
                       const dayBookings = appointments.filter(a => a.startTime.startsWith(dateStr));
                       const isToday = isSameDay(day, new Date());
                       const currentMonthOnly = isSameMonth(day, viewDate);
                       
                       return (
                         <div 
                          key={dateStr} 
                          onClick={() => setSelectedDate(dateStr)} 
                          className={`h-40 p-6 cursor-pointer group border-r border-b border-neutral-50 hover:bg-neutral-50 transition-all relative ${!currentMonthOnly ? 'opacity-10 grayscale' : ''}`}
                         >
                            <span className={`w-10 h-10 flex items-center justify-center rounded-2xl text-xs font-sans font-bold transition-all ${isToday ? 'bg-neutral-900 text-white shadow-xl' : 'text-neutral-400 group-hover:bg-white group-hover:text-neutral-900'}`}>{format(day, 'd')}</span>
                            <div className="mt-6 flex flex-col gap-2.5">
                               {dayBookings.slice(0, 2).map(b => (
                                  <div key={b.id} className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-neutral-50">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG]?.dot || 'bg-neutral-300'}`} />
                                    <span className="text-[9px] font-sans font-bold text-neutral-600 truncate">{b.firstName || 'Client'}</span>
                                  </div>
                               ))}
                               {dayBookings.length > 2 && (
                                  <span className="text-[8px] font-sans font-black text-neutral-300 pl-2 uppercase tracking-widest">+{dayBookings.length - 2} soins</span>
                               )}
                            </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-neutral-50">
                      {TIME_SLOTS.map(slot => {
                        const appt = appointments.find(a => a.startTime === `${selectedDate}T${slot}`);
                        const service = appt ? SERVICES.find(s => s.id === appt.serviceId) : null;
                        const status = appt ? STATUS_CONFIG[appt.status as keyof typeof STATUS_CONFIG] : null;
                        
                        return (
                          <div key={slot} className="flex gap-16 py-8 px-16 hover:bg-neutral-50/40 transition-all group min-h-[140px]">
                            <span className="w-24 text-lg font-serif font-bold text-neutral-200 pt-5">{slot}</span>
                            <div className="flex-1">
                              {appt ? (
                                <div onClick={() => openEdit(appt)} className="cursor-pointer bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm hover:shadow-2xl transition-all flex justify-between items-center">
                                   <div className="flex items-center gap-10">
                                     <div className={`w-2 h-16 rounded-full ${status?.dot || 'bg-neutral-200'}`} />
                                     <div>
                                       <h4 className="text-2xl font-serif font-bold text-neutral-900 mb-2">{appt.firstName || 'Client'} {appt.lastName || ''}</h4>
                                       <div className="flex items-center gap-4">
                                          <span className={`text-[8px] font-sans font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${status?.color}`}>{status?.label}</span>
                                          <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-[0.3em]">{service?.name.split(' - ')[0]}</span>
                                       </div>
                                     </div>
                                   </div>
                                   <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all duration-500">
                                      <Edit3 size={20} />
                                   </div>
                                </div>
                              ) : (
                                <button onClick={() => openNew(selectedDate)} className="w-full h-full border-2 border-dashed border-neutral-50 rounded-[3rem] flex items-center justify-center gap-4 text-neutral-200 hover:text-neutral-900 hover:border-neutral-900/20 hover:bg-white transition-all group/btn">
                                  <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
                                  <span className="text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.4em]">Créneau Disponible</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                   </motion.div>
                 )}
               </div>
            </motion.div>
          )}

          {activeTab === "clients" && (
            <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-100 p-4 flex items-center gap-6">
                 <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center text-neutral-300">
                    <Search size={24} />
                 </div>
                 <input 
                  autoFocus 
                  type="text" 
                  placeholder="Rechercher un dossier client..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="flex-1 bg-transparent border-none outline-none text-2xl font-serif italic placeholder:text-neutral-200 text-neutral-900 h-16" 
                />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {clients
                   .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
                   .map(client => {
                     const clientBookings = appointments.filter(a => a.clientId === client.id);
                     return (
                     <div key={client.id} className="bg-white p-10 rounded-[4rem] border border-neutral-100 hover:shadow-2xl transition-all duration-700 group">
                        <div className="flex justify-between items-start mb-10">
                           <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center text-neutral-900 font-serif font-bold text-2xl group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
                             {client.lastName?.charAt(0) || client.firstName?.charAt(0)}
                           </div>
                           <div className="text-right">
                             <span className="block text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-300 mb-1">Soins</span>
                             <span className="text-3xl font-serif font-bold text-neutral-900">{clientBookings.length}</span>
                           </div>
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-neutral-900 mb-2">{client.firstName} {client.lastName}</h4>
                        <p className="text-[10px] font-sans font-black text-neutral-400 uppercase tracking-[0.3em] mb-10">{client.email}</p>
                        
                        <div className="pt-8 border-t border-neutral-50 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                             <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-neutral-600">Fidélité {clientBookings.length % 11}/10</span>
                           </div>
                           <button className="text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.2em] text-neutral-300 hover:text-neutral-900 transition-colors">Dossier <ArrowRight size={12} className="inline ml-1" /></button>
                        </div>
                     </div>
                   )})}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {sidePanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidePanel(false)} className="fixed inset-0 bg-neutral-950/20 backdrop-blur-md z-[120]" />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 35, stiffness: 300 }} 
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[550px] bg-[#F7F7F2] z-[130] p-16 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h3 className="text-4xl font-serif font-bold text-neutral-900 mb-2">{editingId ? "Détails" : "Nouveau Soin"}</h3>
                  <p className="text-[10px] text-neutral-400 font-sans font-black uppercase tracking-[0.3em]">Gestion Immédiate du Sanctuaire</p>
                </div>
                <button onClick={() => setSidePanel(false)} className="w-16 h-16 flex items-center justify-center rounded-[2.5rem] bg-white text-neutral-300 hover:text-neutral-900 transition-all shadow-sm"><X size={24} /></button>
              </div>
              
              <div className="space-y-12 flex-1 overflow-y-auto pr-6 scrollbar-hide">
                <section className="space-y-6">
                  <label className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Identité Patient</label>
                  <div className="grid grid-cols-2 gap-6">
                    <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="Prénom" className="w-full bg-white border-none rounded-[1.5rem] px-8 py-4 outline-none text-lg font-serif italic text-neutral-900 shadow-sm focus:shadow-xl transition-all" />
                    <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" placeholder="Nom" className="w-full bg-white border-none rounded-[1.5rem] px-8 py-4 outline-none text-lg font-serif italic text-neutral-900 shadow-sm focus:shadow-xl transition-all" />
                  </div>
                </section>
                
                <section className="space-y-6">
                  <label className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Planification</label>
                  <input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-white border-none rounded-[1.5rem] px-8 py-4 outline-none text-lg font-sans font-bold text-neutral-900 shadow-sm" />
                </section>

                <section className="space-y-6">
                  <label className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Choix du Rituel</label>
                  <div className="grid grid-cols-1 gap-4">
                    {SERVICES.map(s => (
                      <button 
                        key={s.id} onClick={() => setFormData({...formData, serviceId: s.id})} 
                        className={`w-full text-left p-6 rounded-[2rem] transition-all flex justify-between items-center border-2 ${
                          formData.serviceId === s.id ? 'border-neutral-900 bg-white' : 'border-transparent bg-white/50 hover:bg-white'
                        }`}
                      >
                        <div>
                          <span className="text-lg font-serif font-bold block">{s.name.split(' - ')[0]}</span>
                          <span className="text-[10px] text-neutral-400 font-sans font-black uppercase tracking-[0.2em]">{s.duration}</span>
                        </div>
                        <span className="text-lg font-serif font-bold">CHF {s.price}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <label className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Statut de la Séance</label>
                  <div className="flex gap-3">
                    {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(st => (
                      <button 
                        key={st} onClick={() => setFormData({...formData, status: st})}
                        className={`flex-1 py-3 rounded-full text-[9px] font-sans font-black uppercase tracking-[0.2em] border transition-all ${
                          formData.status === st ? `${STATUS_CONFIG[st].color} border-transparent` : 'bg-white border-neutral-100 text-neutral-400'
                        }`}
                      >
                        {STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-16 flex flex-col gap-6 pt-12 border-t border-neutral-100">
                <button 
                  onClick={handleSave} disabled={!formData.firstName}
                  className="bg-neutral-900 text-white py-4 rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-neutral-800 transition-all disabled:opacity-20"
                >
                  {editingId ? "Mettre à jour le Dossier" : "Enregistrer le Soin"}
                </button>
                {editingId && (
                  <button onClick={() => handleDelete(editingId)} className="flex items-center justify-center gap-3 text-rose-500 py-3 rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
                    <Trash2 size={16} /> Supprimer Définitivement
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
