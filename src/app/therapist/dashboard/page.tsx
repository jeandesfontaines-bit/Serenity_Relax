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
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
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
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  Heart,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '@/lib/types';

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
  const { user } = useUser();
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
    
    const payload = {
      ...formData,
      updatedAt: serverTimestamp(),
      clientId: formData.firstName.toLowerCase()
    };

    if (editingId) {
      await updateDoc(doc(firestore, 'appointments', editingId), payload);
    } else {
      await addDoc(collection(firestore, 'appointments'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
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
    <div className="min-h-screen bg-[#F8F9FB] text-[#171717] font-sans">
      <header className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-black/5"><Calendar size={18}/></div>
              <div>
                <span className="text-sm font-bold tracking-tight block text-gray-900">Cabinet Serenity</span>
                <span className="hidden sm:inline-block text-[22px] font-cursive text-muted-foreground ml-1 normal-case">by João</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex bg-gray-100 p-1 rounded-full border border-gray-200">
              {[
                { id: "dashboard", label: "Accueil", icon: LayoutGrid },
                { id: "calendar", label: "Agenda", icon: CalendarDays },
                { id: "clients", label: "Clients", icon: Users },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedDate(null); }}
                  className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${
                    activeTab === item.id 
                      ? "bg-white text-black shadow-sm border border-gray-200" 
                      : "text-slate-400 hover:text-black"
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 px-6 py-2.5 bg-slate-50 rounded-full border border-gray-100">
              <Wallet size={14} className="text-slate-400" />
              <span className="text-xs font-bold">{formatCHF(stats.revenueToday)}</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Aujourd'hui</span>
            </div>
            <button 
              onClick={() => openNew()}
              className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-black/5 active:scale-95"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Nouveau</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[
                   { label: "Revenue du jour", value: formatCHF(stats.revenueToday), change: "+12%", trend: "up", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
                   { label: "Occupation", value: `${Math.round((stats.countToday / TIME_SLOTS.length) * 100)}%`, change: "-2%", trend: "down", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                   { label: "Séances aujourd'hui", value: stats.countToday, change: "+3", trend: "up", icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50" },
                   { label: "Nouveaux Patients", value: clients.length.toString(), change: "+5", trend: "up", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
                 ].map((kpi, idx) => (
                  <div key={idx} className="p-8 rounded-[2.5rem] bg-white border border-gray-100 group hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}><kpi.icon size={20}/></div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {kpi.change}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-bold tracking-tight">Planning du jour</h3>
                    <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-3">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {isClient ? format(new Date(), 'EEEE d MMMM', { locale: fr }) : '...'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {appointments
                      .filter(a => a.startTime.startsWith(format(new Date(), 'yyyy-MM-dd')))
                      .map(appt => {
                        const service = SERVICES.find(sv => sv.id === appt.serviceId);
                        const status = STATUS_CONFIG[appt.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={appt.id} 
                            onClick={() => openEdit(appt)} 
                            className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all cursor-pointer flex items-center gap-8"
                          >
                            <div className="flex flex-col items-center justify-center min-w-[80px] h-20 bg-slate-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all">
                              <span className="text-lg font-bold">{appt.startTime.split('T')[1].substring(0, 5)}</span>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="text-lg font-bold mb-1">{appt.firstName || appt.clientNameSnapshot || 'Client'} {appt.lastName || ''}</h4>
                              <div className="flex items-center gap-3">
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${status.color}`}>
                                   {status.label}
                                 </span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                   {service?.name}
                                 </span>
                              </div>
                            </div>
                            
                            <div className="text-right flex items-center gap-10">
                              <span className="text-lg font-bold text-slate-900">{formatCHF(service?.price || 0)}</span>
                              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-black group-hover:text-white transition-all">
                                <Edit3 size={18} />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    {appointments.filter(a => a.startTime.startsWith(format(new Date(), 'yyyy-MM-dd'))).length === 0 && (
                      <div className="py-24 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                          <Calendar size={28} />
                        </div>
                        <div>
                          <p className="text-lg font-bold mb-2">Aucun rendez-vous aujourd'hui</p>
                          <p className="text-sm text-slate-400 font-serif italic">Profitez de ce moment de calme pour vous ressourcer.</p>
                        </div>
                        <button onClick={() => openNew()} className="text-[10px] font-black uppercase tracking-[0.2em] text-black hover:underline">Programmer un soin</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:col-span-4 lg:block space-y-8">
                  <div className="p-8 rounded-[3rem] bg-gray-900 text-white shadow-2xl relative overflow-hidden group">
                    <Sparkles size={40} className="absolute -right-4 -bottom-4 text-white/10" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8">Focus du moment</h4>
                    <p className="text-lg font-light leading-relaxed mb-8">
                      "L'excellence n'est pas un acte, c'est une habitude."
                    </p>
                    <div className="pt-8 border-t border-white/10 flex justify-between">
                       <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Visites du mois</p>
                          <p className="text-2xl font-bold">{appointments.length}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Productivité</p>
                          <p className="text-2xl font-bold">84%</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Activité Clients</h4>
                    <div className="space-y-6">
                      {clients.slice(0, 4).map((client) => (
                        <div key={client.id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm group-hover:bg-black group-hover:text-white transition-all">
                              {client.lastName?.charAt(0) || client.firstName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="text-xs font-bold">{client.firstName} {client.lastName}</p>
                              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Client Fidèle</p>
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-slate-200 group-hover:text-black transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-6">
                       {selectedDate ? (
                         <button onClick={() => setSelectedDate(null)} className="text-black flex items-center gap-3 hover:bg-white px-5 py-2 rounded-2xl transition-all shadow-sm border border-gray-200">
                           <ChevronLeft size={16} strokeWidth={3} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Retour au mois</span>
                         </button>
                       ) : (
                         <div className="flex items-center gap-6">
                           <h3 className="text-2xl font-bold tracking-tight capitalize">
                             {format(viewDate, 'MMMM yyyy', { locale: fr })}
                           </h3>
                           <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-inner border border-slate-100">
                              <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-2 text-slate-400 hover:text-black rounded-xl hover:bg-slate-50 transition-all"><ChevronLeft size={18} /></button>
                              <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-2 text-slate-400 hover:text-black rounded-xl hover:bg-slate-50 transition-all"><ChevronRight size={18} /></button>
                           </div>
                         </div>
                       )}
                    </div>
                    <button onClick={() => openNew(selectedDate || undefined)} className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-6 py-3 rounded-2xl shadow-xl shadow-black/5 hover:bg-slate-800">
                      Ajouter une séance
                    </button>
                 </div>

                 {!selectedDate ? (
                   <div className="grid grid-cols-7">
                     {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                       <div key={d} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">{d}</div>
                     ))}
                     {eachDayOfInterval({
                       start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
                       end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 })
                     }).map((day, i) => {
                       const dateStr = format(day, 'yyyy-MM-dd');
                       const dayBookings = appointments.filter(a => a.startTime.startsWith(dateStr));
                       const isToday = isSameDay(day, new Date());
                       const currentMonth = isSameMonth(day, viewDate);
                       
                       return (
                         <div 
                          key={dateStr} 
                          onClick={() => setSelectedDate(dateStr)} 
                          className={`h-32 p-4 cursor-pointer group border-r border-b border-slate-50 hover:bg-slate-50 transition-all relative ${!currentMonth ? 'opacity-20 grayscale' : ''}`}
                         >
                            <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${isToday ? 'bg-black text-white shadow-xl shadow-black/20' : 'text-slate-400 group-hover:bg-white group-hover:text-black'}`}>{format(day, 'd')}</span>
                            <div className="mt-4 flex flex-col gap-2">
                               {dayBookings.slice(0, 2).map(b => (
                                  <div key={b.id} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-50">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG]?.dot || 'bg-slate-400'}`} />
                                    <span className="text-[9px] font-bold text-slate-600 truncate">{b.firstName || b.clientNameSnapshot?.split(' ')[0] || 'Client'}</span>
                                  </div>
                               ))}
                               {dayBookings.length > 2 && (
                                  <span className="text-[8px] font-black text-slate-300 pl-2 uppercase tracking-tighter">+{dayBookings.length - 2} séances</span>
                               )}
                            </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-slate-50">
                      {TIME_SLOTS.map(slot => {
                        const appt = appointments.find(a => a.startTime === `${selectedDate}T${slot}`);
                        const service = appt ? SERVICES.find(s => s.id === appt.serviceId) : null;
                        const status = appt ? STATUS_CONFIG[appt.status as keyof typeof STATUS_CONFIG] : null;
                        
                        return (
                          <div key={slot} className="flex gap-10 py-6 px-10 hover:bg-slate-50/50 transition-all group min-h-[120px]">
                            <span className="w-20 text-sm font-bold text-slate-300 pt-4 font-serif">{slot}</span>
                            <div className="flex-1">
                              {appt ? (
                                <div onClick={() => openEdit(appt)} className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-black/5 transition-all flex justify-between items-center group/card">
                                   <div className="flex items-center gap-6">
                                     <div className={`w-1.5 h-12 rounded-full ${status?.dot || 'bg-slate-200'}`} />
                                     <div>
                                       <h4 className="text-lg font-bold text-slate-900">{appt.firstName || appt.clientNameSnapshot || 'Client'} {appt.lastName || ''}</h4>
                                       <div className="flex items-center gap-3 mt-2">
                                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${status?.color}`}>{status?.label}</span>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{service?.name}</span>
                                       </div>
                                     </div>
                                   </div>
                                   <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/card:bg-black group-hover/card:text-white transition-all">
                                      <Edit3 size={18} />
                                   </div>
                                </div>
                              ) : (
                                <button onClick={() => openNew(selectedDate)} className="w-full h-full border-2 border-dashed border-slate-50 rounded-[2rem] flex items-center justify-center gap-3 text-slate-300 hover:text-black hover:border-black/20 hover:bg-white transition-all group/btn">
                                  <Plus size={18} className="group-hover/btn:scale-125 transition-transform" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Créneau libre</span>
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
            <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-3 flex items-center gap-4">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <Search size={22} />
                 </div>
                 <input 
                  autoFocus 
                  type="text" 
                  placeholder="Rechercher par nom ou email..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="flex-1 bg-transparent border-none outline-none text-lg italic placeholder:text-slate-300 text-slate-900 h-14" 
                />
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {clients
                   .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
                   .map(client => {
                     const clientBookings = appointments.filter(a => a.clientId === client.id);
                     return (
                     <div key={client.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 font-bold text-xl">
                             {client.lastName?.charAt(0) || client.firstName?.charAt(0) || 'C'}
                           </div>
                           <div className="text-right">
                             <span className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Visites</span>
                             <span className="text-2xl font-bold text-black">{clientBookings.length}</span>
                           </div>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{client.firstName} {client.lastName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{client.email}</p>
                        
                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Fidélité {clientBookings.length % 11}/10</span>
                           </div>
                           <button className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-black transition-colors">Détails <ArrowRight size={10} className="inline ml-1" /></button>
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSidePanel(false)} 
              className="fixed inset-0 bg-black/5 backdrop-blur-sm z-[60]" 
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 30, stiffness: 300 }} 
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white z-[70] p-12 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{editingId ? "Édition" : "Nouveau soin"}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestion des dossiers patients</p>
                </div>
                <button onClick={() => setSidePanel(false)} className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] hover:bg-slate-50 text-slate-300 hover:text-black transition-all"><X size={24} /></button>
              </div>
              
              <div className="space-y-10 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                <section className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identité Patient</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="Prénom" className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 outline-none text-base italic text-slate-900 focus:bg-white focus:shadow-sm transition-all" />
                    <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" placeholder="Nom" className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 outline-none text-base italic text-slate-900 focus:bg-white focus:shadow-sm transition-all" />
                  </div>
                </section>
                
                <section className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Planification</label>
                  <input 
                    type="datetime-local" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 outline-none text-sm font-bold text-slate-900 focus:bg-white transition-all" 
                  />
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Soin Sélectionné</label>
                  <div className="grid grid-cols-1 gap-3">
                    {SERVICES.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => setFormData({...formData, serviceId: s.id})} 
                        className={`w-full text-left p-5 rounded-[1.5rem] transition-all flex justify-between items-center border-2 ${
                          formData.serviceId === s.id 
                            ? 'border-black bg-slate-50' 
                            : 'border-transparent bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-3 h-3 rounded-full ${s.id === '1' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                           <div>
                             <span className="text-sm font-bold block">{s.name}</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.duration}</span>
                           </div>
                        </div>
                        <span className="text-sm font-bold">{formatCHF(s.price)}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Statut du Soin</label>
                  <div className="flex gap-2">
                    {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(st => (
                      <button 
                        key={st} 
                        onClick={() => setFormData({...formData, status: st})}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          formData.status === st 
                            ? `${STATUS_CONFIG[st].color} border-transparent` 
                            : 'bg-slate-50 border-slate-50 text-slate-400'
                        }`}
                      >
                        {STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-12 flex flex-col gap-4 pt-10 border-t border-slate-100">
                <button 
                  onClick={handleSave} 
                  disabled={!formData.firstName}
                  className="bg-black text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/10 hover:bg-slate-800 transition-all disabled:opacity-20 active:scale-[0.98]"
                >
                  {editingId ? "Mettre à jour" : "Confirmer le soin"}
                </button>
                {editingId && (
                  <button 
                    onClick={() => handleDelete(editingId)} 
                    className="flex items-center justify-center gap-2 text-rose-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
                  >
                    <Trash2 size={16} />
                    Supprimer le dossier
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
