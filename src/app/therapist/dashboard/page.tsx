
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  X, Trash2, Plus, ChevronLeft, ChevronRight, Calendar, Clock, 
  Search, TrendingUp, User, Sparkles, Activity, Heart, 
  LayoutGrid, CalendarDays, Users, Wallet, ArrowUpRight, ArrowDownRight,
  Bell, Settings, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SERVICES } from '@/lib/types';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from "next/link";

// --- UTILS & CONSTANTES ---

const GrainEffect = () => (
  <div className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.02] mix-blend-multiply">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const TIME_SLOTS = ["08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

const STATUSES = [
  { id: "Booked", label: "Confirmé", color: "bg-emerald-500", text: "text-emerald-600", lightBg: "bg-emerald-50" },
  { id: "Completed", label: "Terminé", color: "bg-blue-500", text: "text-blue-600", lightBg: "bg-blue-50" },
  { id: "Cancelled", label: "Annulé", color: "bg-rose-500", text: "text-rose-600", lightBg: "bg-rose-50" }
];

const getLocalISODate = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd');
};

const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// --- SOUS-COMPOSANTS ---

const EditableDetail = ({ icon: Icon, value, onChange, placeholder, multiline, type = "text", options = [] }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const handleBlur = () => setIsEditing(false);
  const commonClasses = "w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-10 text-sm outline-none text-gray-900 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all";

  if (isEditing) {
    return (
      <div className="relative w-full">
        <Icon size={14} className={`absolute left-3 ${multiline ? 'top-4' : 'top-1/2 -translate-y-1/2'} text-blue-500`} />
        {type === "select" ? (
          <select autoFocus value={value} onChange={onChange} onBlur={handleBlur} className={commonClasses}>
            {options.map((o: any) => <option key={o.id || o} value={o.id || o}>{o.label || o}</option>)}
          </select>
        ) : multiline ? (
          <textarea autoFocus value={value} onChange={onChange} onBlur={handleBlur} placeholder={placeholder} className={`${commonClasses} min-h-[100px] resize-none`} />
        ) : (
          <input autoFocus type={type} value={value} onChange={onChange} onBlur={handleBlur} placeholder={placeholder} className={commonClasses} />
        )}
      </div>
    );
  }

  return (
    <div onDoubleClick={() => setIsEditing(true)} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-text min-h-[44px]">
      <Icon size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
      <span className={`text-sm ${value ? 'text-gray-700 font-medium' : 'text-gray-400 italic'}`}>{value || placeholder}</span>
    </div>
  );
};

// --- APPLICATION PRINCIPALE ---

export default function TherapistDashboard() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [calendarView, setCalendarView] = useState("week"); 
  const [sidePanel, setSidePanel] = useState<string | null>(null); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    setFormattedDate(format(new Date(), 'EEEE d MMMM', { locale: fr }));
  }, []);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'appointments'), orderBy('startTime', 'asc'));
  }, [firestore]);

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'invoices');
  }, [firestore]);

  const { data: rawAppointments } = useCollection(appointmentsQuery);
  const { data: rawClients } = useCollection(clientsQuery);
  const { data: rawInvoices } = useCollection(invoicesQuery);

  const appointments = rawAppointments || [];
  const clients = rawClients || [];
  const invoices = rawInvoices || [];

  const currentISODate = getLocalISODate(currentDate);

  const stats = useMemo(() => {
    const todayStr = getLocalISODate(new Date());
    const todayAppts = appointments.filter(b => b.startTime.startsWith(todayStr) && b.status !== 'Cancelled');
    const revenue = todayAppts.reduce((acc, b) => {
      const s = SERVICES.find(srv => srv.id === b.serviceId);
      return acc + (s?.price || 0);
    }, 0);
    
    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthlyInvoices = invoices.filter(i => i.issueDate.startsWith(currentMonth));
    const monthlyRevenue = monthlyInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);

    return { 
      dailyRevenue: revenue, 
      occupation: Math.round((todayAppts.length / TIME_SLOTS.length) * 100) || 0, 
      monthlyRevenue: monthlyRevenue,
      totalAppointments: appointments.length || 0,
      newClients: clients.length || 0
    };
  }, [appointments, clients, invoices]);

  const handleOpenAdd = (dateStr?: string, time?: string) => {
    const defaultDate = dateStr || getLocalISODate(new Date());
    const defaultTime = time || "10:00";
    setEditingBookingId(null);
    setFormData({
      clientId: "",
      clientName: "",
      serviceId: SERVICES[0].id,
      date: defaultDate,
      time: defaultTime,
      status: "Booked",
      message: ""
    });
    setSidePanel('form');
  };

  const handleOpenEdit = (booking: any) => {
    setEditingBookingId(booking.id);
    const [date, timePart] = booking.startTime.split('T');
    setFormData({
      ...booking,
      date: date,
      time: timePart.substring(0, 5),
      clientName: clients.find(c => c.id === booking.clientId)?.firstName || "Client"
    });
    setSidePanel('form');
  };

  const handleSaveBooking = () => {
    if (!firestore) return;

    const startTime = `${formData.date}T${formData.time}:00`;
    const service = SERVICES.find(s => s.id === formData.serviceId);
    const durationMatch = service?.duration.match(/\d+/);
    const duration = durationMatch ? parseInt(durationMatch[0]) : 60;
    
    const updateData = {
      clientId: formData.clientId || "manual_entry",
      serviceId: formData.serviceId,
      startTime: startTime,
      endTime: format(addDays(parseISO(startTime), 0), "yyyy-MM-dd'T'HH:mm:ss"), // Simple logic
      status: formData.status,
      clientMessage: formData.message || "",
      isLoyaltyFreeSession: false,
      isConfirmed: true,
      updatedAt: serverTimestamp()
    };

    if (editingBookingId) {
      updateDocumentNonBlocking(doc(firestore, 'appointments', editingBookingId), updateData);
    } else {
      addDocumentNonBlocking(collection(firestore, 'appointments'), {
        ...updateData,
        createdAt: serverTimestamp()
      });
    }
    setSidePanel(null);
  };

  if (!mounted) return null;

  return (
    <div className="h-screen bg-[#F9FAFB] text-gray-900 font-sans flex flex-col overflow-hidden">
      <GrainEffect />

      {/* HEADER CLAIR */}
      <header className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-black/5"><Calendar size={18}/></div>
            <div>
              <span className="text-sm font-bold tracking-[0.2em] block text-gray-900 uppercase">SERENITY RELAX</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Portail Praticien</span>
            </div>
          </div>
          
          <nav className="hidden md:flex bg-gray-100 p-1 rounded-full border border-gray-200">
            {[
              { id: 'dashboard', label: 'Accueil', icon: LayoutGrid },
              { id: 'calendar', label: 'Agenda', icon: CalendarDays },
              { id: 'clients', label: 'Clients', icon: Users, href: '/therapist/clients' },
              { id: 'finance', label: 'Finance', icon: Wallet, href: '/therapist/invoices' },
            ].map(item => (
              <button 
                key={item.id} onClick={() => item.href ? window.location.href = item.href : setActiveTab(item.id)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === item.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <item.icon size={13} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"><Bell size={18}/></button>
            <button className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"><Settings size={18}/></button>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right">
              <p className="text-xs font-bold leading-none mb-1 text-gray-900">Dr. João</p>
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Thérapeute Agréé ASCA</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
               <User size={18}/>
            </div>
          </div>
        </div>
      </header>

      {/* SOUS-BARRE DATE (AGENDA SEULEMENT) */}
      <AnimatePresence>
        {activeTab === 'calendar' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between"
          >
            <DateNavigation currentDate={currentDate} setCurrentDate={setCurrentDate} view={calendarView} />
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {[
                { id: 'list', label: 'Jour' },
                { id: 'week', label: 'Semaine' },
                { id: 'month', label: 'Mois' },
              ].map(sub => (
                <button 
                  key={sub.id} onClick={() => setCalendarView(sub.id)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${calendarView === sub.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 overflow-y-auto scrollbar-hide transition-all duration-500 ${sidePanel ? 'pr-[450px]' : ''}`}>
          
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto p-12 space-y-12 pb-24">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-5xl font-serif font-light text-gray-900 mb-3 tracking-tight">Bonjour <span className="text-blue-600 font-medium">João,</span></h1>
                  <p className="text-gray-500 font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> 
                    Nous sommes le {formattedDate}
                  </p>
                </div>
                <button onClick={() => handleOpenAdd()} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-black/10">
                  <Plus size={16} /> Programmer un soin
                </button>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "CA Estimé (Mois)", value: `${stats.monthlyRevenue} CHF`, change: "+12.5%", trend: "up", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Taux d'Occupation", value: `${stats.occupation}%`, change: "-2%", trend: "down", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Séances (Total)", value: stats.totalAppointments, change: "+5", trend: "up", icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Nouveaux Patients", value: stats.newClients, change: "+3", trend: "up", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
                ].map((kpi, idx) => (
                  <div key={idx} className="p-8 rounded-[2.5rem] bg-white border border-gray-200 group hover:shadow-xl hover:shadow-gray-200/50 transition-all">
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PROCHAINES SEANCES */}
                <div className="lg:col-span-7 space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h2 className="text-xl font-serif font-bold text-gray-900">Prochaines Séances</h2>
                      <button onClick={() => setActiveTab('calendar')} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline transition-all">Voir l'agenda</button>
                   </div>
                   <div className="space-y-3">
                      {appointments.filter(b => b.startTime >= currentISODate).slice(0, 4).map((b, i) => {
                        const s = SERVICES.find(srv => srv.id === b.serviceId);
                        const status = STATUSES.find(st => st.id === b.status) || STATUSES[0];
                        const dateObj = parseISO(b.startTime);
                        const client = clients.find(c => c.id === b.clientId);

                        return (
                          <div key={i} onClick={() => handleOpenEdit(b)} className="group p-5 rounded-[2rem] bg-white border border-gray-200 flex items-center gap-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border border-gray-200">
                               <span className="text-[9px] font-bold uppercase text-gray-400">{format(dateObj, 'MMM', { locale: fr })}</span>
                               <span className="text-xl font-bold text-gray-900">{format(dateObj, 'd')}</span>
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-gray-900">{client?.firstName || "Client"} {client?.lastName || ""}</span>
                                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>{s?.name.split(' - ')[0] || "Massage"}</span>
                               </div>
                               <div className="flex items-center gap-3 text-gray-500 text-[10px] font-medium">
                                  <span className="flex items-center gap-1"><Clock size={10}/> {format(dateObj, 'HH:mm')}</span>
                                  <span className="flex items-center gap-1"><Wallet size={10}/> {s?.price || 0} CHF</span>
                               </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest ${status.text} ${status.lightBg} border border-transparent`}>
                               {status.label}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                {/* AUJOURD'HUI PANEL */}
                <div className="lg:col-span-5 space-y-6">
                   <h2 className="text-xl font-serif font-bold text-gray-900 px-2">Aperçu du Jour</h2>
                   <div className="p-8 rounded-[3rem] bg-white border border-gray-200 shadow-sm relative overflow-hidden group">
                      <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-600 mb-6">Vous avez <span className="text-blue-600 font-bold">{appointments.filter(b => b.startTime.startsWith(currentISODate)).length} séances</span> aujourd'hui.</p>
                        
                        <div className="space-y-4">
                          {appointments.filter(b => b.startTime.startsWith(currentISODate)).map((b, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-xs text-gray-900 font-bold">{b.startTime.split('T')[1].substring(0, 5)}</span>
                              <span className="text-xs text-gray-400">—</span>
                              <span className="text-xs text-gray-700">{clients.find(c => c.id === b.clientId)?.firstName || "Client"}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between">
                           <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Revenu du jour</p>
                              <p className="text-2xl font-bold text-emerald-600">{stats.dailyRevenue} CHF</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Occupation</p>
                              <p className="text-2xl font-bold text-blue-600">{stats.occupation}%</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {/* VIEW: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="max-w-[1400px] mx-auto p-8 h-full">
              {calendarView === 'week' && <WeekView appointments={appointments} clients={clients} currentDate={currentDate} onSelectSlot={handleOpenAdd} onSelectBooking={handleOpenEdit} />}
              {calendarView === 'month' && <MonthView appointments={appointments} clients={clients} currentDate={currentDate} onSelectSlot={handleOpenAdd} onSelectBooking={handleOpenEdit} setCurrentDate={setCurrentDate} setView={setCalendarView} />}
              {calendarView === 'list' && (
                <div className="max-w-4xl mx-auto py-12">
                   <div className="space-y-4">
                    {TIME_SLOTS.map(slot => {
                      const booking = appointments.find(b => b.startTime === `${currentISODate}T${slot}:00`);
                      const service = booking ? SERVICES.find(s => s.id === booking.serviceId) : null;
                      return (
                        <div key={slot} onClick={() => booking ? handleOpenEdit(booking) : handleOpenAdd(currentISODate, slot)} className={`group p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-8 ${booking ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-200 hover:bg-white hover:border-blue-200'}`}>
                          <span className="w-20 text-sm font-bold text-gray-400">{slot}</span>
                          {booking ? (
                            <>
                              <div className={`w-1.5 h-10 rounded-full bg-blue-500`} />
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{clients.find(c => c.id === booking.clientId)?.firstName || "Client"}</h3>
                                <p className={`text-[10px] font-bold uppercase tracking-widest text-blue-600`}>{service?.name.split(' - ')[0]}</p>
                              </div>
                              <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${STATUSES.find(s => s.id === booking.status)?.lightBg} ${STATUSES.find(s => s.id === booking.status)?.text}`}>
                                {STATUSES.find(s => s.id === booking.status)?.label || booking.status}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-300 text-[10px] uppercase tracking-[0.3em] font-bold group-hover:text-blue-400 transition-colors">Créneau Libre</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDE PANEL CLAIR */}
        <AnimatePresence>
          {sidePanel && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{type: "spring", damping: 30, stiffness: 200}} className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white border-l border-gray-200 z-[200] p-10 flex flex-col shadow-2xl shadow-black/5">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">{editingBookingId ? 'Modifier' : 'Nouvelle'} Séance</h2>
                <button onClick={() => setSidePanel(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Patient</label>
                  <EditableDetail 
                    icon={Users} 
                    type="select" 
                    options={clients.map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }))} 
                    value={formData.clientId} 
                    onChange={(e: any) => setFormData({...formData, clientId: e.target.value})} 
                    placeholder="Sélectionner un client" 
                  />
                </section>
                <section>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Soin & Statut</label>
                   <EditableDetail icon={Sparkles} type="select" options={SERVICES.map(s => ({id: s.id, label: s.name}))} value={formData.serviceId} onChange={(e: any) => setFormData({...formData, serviceId: e.target.value})} />
                   <div className="grid grid-cols-3 gap-2 mt-4">
                    {STATUSES.map(s => (
                      <button key={s.id} onClick={() => setFormData({...formData, status: s.id})} className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.status === s.id ? `${s.color} text-white border-transparent shadow-lg shadow-black/10` : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Planification</label>
                  <div className="flex flex-col gap-4">
                     <EditableDetail icon={Calendar} type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                     <EditableDetail icon={Clock} type="select" options={TIME_SLOTS} value={formData.time} onChange={(e: any) => setFormData({...formData, time: e.target.value})} />
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Notes</label>
                  <EditableDetail icon={Activity} multiline value={formData.message} onChange={(e: any) => setFormData({...formData, message: e.target.value})} placeholder="Motif de consultation..." />
                </section>
              </div>
              <div className="pt-8 flex gap-4 mt-auto">
                {editingBookingId && <button onClick={() => { if(firestore) deleteDocumentNonBlocking(doc(firestore, 'appointments', editingBookingId)); setSidePanel(null); }} className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-rose-600 transition-all border border-gray-200"><Trash2 size={20}/></button>}
                <button onClick={handleSaveBooking} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-black/10 hover:bg-black transition-all">Enregistrer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS AGENDA ---

function DateNavigation({ currentDate, setCurrentDate, view }: any) {
  const handleNav = (dir: number) => {
    const next = new Date(currentDate);
    if (view === 'week') next.setDate(currentDate.getDate() + (dir * 7));
    else if (view === 'month') {
        next.setMonth(currentDate.getMonth() + dir);
    }
    else next.setDate(currentDate.getDate() + dir);
    setCurrentDate(next);
  };

  const label = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: fr });
    if (view === 'list') return format(currentDate, 'd MMMM', { locale: fr });
    const days = getWeekDays(currentDate);
    return `${format(days[0], 'd')} – ${format(days[6], 'd')} ${format(days[0], 'MMMM', { locale: fr })}`;
  }, [currentDate, view]);

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 shadow-inner">
        <button onClick={() => handleNav(-1)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors"><ChevronLeft size={18}/></button>
        <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900">Aujourd'hui</button>
        <button onClick={() => handleNav(1)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors"><ChevronRight size={18}/></button>
      </div>
      <span className="text-2xl font-serif font-bold text-gray-900 capitalize tracking-tight">{label}</span>
    </div>
  );
}

function WeekView({ appointments, clients, currentDate, onSelectSlot, onSelectBooking }: any) {
  const days = useMemo(() => getWeekDays(currentDate), [currentDate]);
  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex border-b border-gray-200 ml-20 bg-gray-50/50">
        {days.map((day, i) => (
          <div key={i} className="flex-1 py-4 flex flex-col items-center border-l border-gray-100 first:border-l-0">
            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-400'}`}>{format(day, 'EEE', { locale: fr })}</span>
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-900'}`}>{format(day, 'd')}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex relative">
          <div className="w-20 flex flex-col shrink-0 bg-gray-50/30">
            {TIME_SLOTS.map(slot => (
              <div key={slot} className="h-24 text-[11px] font-bold text-gray-400 text-right pr-4 py-2 border-b border-gray-50">{slot}</div>
            ))}
          </div>
          <div className="flex-1 flex">
            {days.map((day, dayIdx) => {
              const dateStr = getLocalISODate(day);
              return (
                <div key={dayIdx} className="flex-1 border-l border-gray-100 relative">
                  {TIME_SLOTS.map(slot => {
                    const booking = (appointments || []).find((b: any) => b.startTime === `${dateStr}T${slot}:00`);
                    const s = booking ? SERVICES.find(srv => srv.id === booking.serviceId) : null;
                    const client = booking ? (clients || []).find((c: any) => c.id === booking.clientId) : null;
                    return (
                      <div key={slot} onClick={() => booking ? onSelectBooking(booking) : onSelectSlot(dateStr, slot)} className="h-24 border-b border-gray-50 hover:bg-blue-50/20 cursor-pointer relative group">
                        {booking && (
                          <div className={`absolute inset-1 rounded-xl p-2 flex flex-col border border-blue-100 bg-blue-50 shadow-sm overflow-hidden transition-all group-active:scale-95`}>
                            <span className="text-[10px] font-bold text-gray-900 truncate">{client?.firstName || "Client"}</span>
                            <span className={`text-[8px] mt-0.5 font-bold text-blue-600 uppercase`}>{s?.name.split(' - ')[0] || "Massage"}</span>
                          </div>
                        )}
                        {!booking && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={14} className="text-blue-300" /></div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthView({ appointments, clients, currentDate, onSelectSlot, setCurrentDate, setView }: any) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const offset = getFirstDayOfMonth(year, month) === 0 ? 6 : getFirstDayOfMonth(year, month) - 1;
  const calendarDays = useMemo(() => {
    const arr = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = offset; i > 0; i--) arr.push({ day: prevMonthDays - i + 1, current: false, monthOffset: -1 });
    for (let i = 1; i <= daysInMonth; i++) arr.push({ day: i, current: true, monthOffset: 0 });
    while (arr.length < 42) arr.push({ day: arr.length - daysInMonth - offset + 1, current: false, monthOffset: 1 });
    return arr;
  }, [year, month, offset, daysInMonth]);

  return (
    <div className="h-full flex flex-col bg-white rounded-[2rem] border border-gray-200 p-8 shadow-sm">
      <div className="grid grid-cols-7 mb-4">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(l => <div key={l} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">{l}</div>)}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
        {calendarDays.map((d, i) => {
          const date = new Date(year, month + d.monthOffset, d.day);
          const dateStr = getLocalISODate(date);
          const dayBookings = (appointments || []).filter((b: any) => b.startTime.startsWith(dateStr));
          const isToday = isSameDay(date, new Date());

          return (
            <div 
                key={i} 
                className={`bg-white p-3 flex flex-col gap-1.5 group hover:bg-gray-50 transition-colors relative ${!d.current ? 'bg-gray-50/50' : ''}`} 
                onClick={() => { 
                    if (!d.current) { 
                        const next = new Date(currentDate); 
                        next.setMonth(month + d.monthOffset); 
                        setCurrentDate(next); 
                    } else { 
                        setCurrentDate(date); 
                        setView('list'); 
                    }
                }}
            >
              <span className={`text-xs w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday ? 'bg-blue-600 text-white font-bold shadow-md' : d.current ? 'text-gray-900 font-medium' : 'text-gray-300'}`}>
                {d.day}
              </span>
              <div className="flex-1 space-y-1 overflow-hidden">
                {d.current && dayBookings.slice(0, 3).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-md px-2 border border-gray-100">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500`} />
                    <span className="text-[9px] text-gray-600 truncate font-bold">{(clients || []).find((c: any) => c.id === b.clientId)?.firstName || "Client"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
