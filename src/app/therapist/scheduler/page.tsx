'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Plus,
  ChevronLeft, ChevronRight, User,
  CheckCircle, AlertCircle, FileText, Sparkles, LayoutGrid
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';

export default function ProfessionalScheduler() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // FORM STATE
  const [newAppt, setNewAppt] = useState({
    clientId: '',
    clientName: '',
    service: 'Massage Sensoriel 90 min',
    price: 180,
    time: '09:00',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (!firestore) return;
    const qAppts = query(collection(firestore, 'appointments'), orderBy('date', 'asc'));
    const unsubAppts = onSnapshot(qAppts, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubClients = onSnapshot(collection(firestore, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubAppts(); unsubClients(); };
  }, [firestore]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));

  const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getApptDate = (a: any) => a.date || (a.startTime ? a.startTime.split('T')[0] : '');
  const getApptTime = (a: any) => a.time || (a.startTime ? a.startTime.split('T')[1].substring(0, 5) : '');

  const handleAddAppointment = async () => {
    if (!firestore || !newAppt.clientId) return;
    try {
      await addDoc(collection(firestore, 'appointments'), {
        ...newAppt,
        status: 'pending',
        paid: false,
        createdAt: Timestamp.now()
      });
      setShowModal(false);
      alert('📅 Rendez-vous inscrit dans votre Sanctuaire.');
    } catch (e) {
      console.error(e);
    }
  };

  const generateInvoice = (appt: any) => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text('SERENITY RELAX', 20, 30);
    doc.setFontSize(10);
    doc.text(`Facture pour : ${appt.clientName || appt.clientNameSnapshot || 'Client'}`, 20, 50);
    doc.text(`Service : ${appt.service || appt.serviceName}`, 20, 60);
    doc.text(`Montant : ${appt.price || appt.priceSnapshot || 150} CHF`, 20, 70);
    doc.text(`Date : ${getApptDate(appt)}`, 20, 80);
    doc.save(`Facture_${appt.clientName || 'RDV'}_${getApptDate(appt)}.pdf`);
  };

  const shiftDate = (dir: number) => {
    if (view === 'week') setCurrentDate(dir > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      {/* ── HEADER NAVIGATION ── */}
      <motion.header
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#222F3E] text-white p-6 rounded-xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12"><CalendarIcon size={150} /></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="space-y-3 text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <div className="w-6 h-6 rounded-md bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><Sparkles size={10} /></div>
              <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#0ABDE3]">Chronos Sanctuary</p>
            </div>
            <h2 className="title-luxe text-2xl md:text-3xl text-white">Votre Agenda <span className="italic font-sans opacity-40">Pro.</span></h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex bg-white/10 p-1.5 rounded-full backdrop-blur-md">
              <button onClick={() => setView('week')} className={`px-5 py-2.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest transition-all ${view === 'week' ? 'bg-[#5F27CD] text-white shadow-md' : 'text-white/60 hover:text-white'}`}>Semaine</button>
              <button onClick={() => setView('month')} className={`px-5 py-2.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest transition-all ${view === 'month' ? 'bg-[#5F27CD] text-white shadow-md' : 'text-white/60 hover:text-white'}`}>Mois</button>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full">
              <button onClick={() => shiftDate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-all"><ChevronLeft size={16} /></button>
              <p className="text-sm font-sans italic text-white/90 min-w-[120px] text-center">{format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Semaine du' d MMM", { locale: fr })}</p>
              <button onClick={() => shiftDate(1)} className="p-2 rounded-full hover:bg-white/10 transition-all"><ChevronRight size={16} /></button>
            </div>

            <button onClick={() => setShowModal(true)} className="btn-luxe flex items-center gap-2 px-6 py-3 text-xs shadow-md shadow-indigo-200/20 whitespace-nowrap">
              <Plus size={16} /> Nouvelle Séance
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── VIEWS ── */}
      {view === 'week' ? (
        <AnimatePresence mode="wait">
          <motion.div key="week-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-7 gap-6">
            {weekDays.map((day, i) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayAppts = appointments.filter(a => getApptDate(a) === dayStr);
              const isToday = isSameDay(day, new Date());

              return (
                <div key={i} className={`dash-card p-4 min-h-[400px] flex flex-col gap-3 border ${isToday ? 'border-[#5F27CD] ring-4 ring-indigo-50 shadow-2xl' : 'border-white bg-white/60'}`}>
                  <div className="text-center pb-4 border-b border-gray-50">
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">{format(day, 'EEEE', { locale: fr })}</p>
                    <p className={`text-2xl mt-1 font-sans ${isToday ? 'text-[#5F27CD] font-bold' : 'text-[#222F3E]'}`}>{format(day, 'd')}</p>
                  </div>
                  <div className="flex-1 space-y-3">
                    {dayAppts.length === 0 ? (
                      <div className="h-full flex items-center justify-center opacity-10 py-10"><Clock size={40} className="text-gray-300" /></div>
                    ) : (
                      dayAppts.map((appt) => (
                        <div key={appt.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                          <div className={`absolute top-0 left-0 w-1 h-full ${appt.paid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[0.65rem] font-black text-[#5F27CD]">{getApptTime(appt)}</span>
                            {appt.paid ? <CheckCircle className="text-emerald-400" size={14} /> : <AlertCircle className="text-amber-400" size={14} />}
                          </div>
                          <p className="font-bold text-sm text-[#222F3E] break-words">{appt.clientName || appt.clientNameSnapshot || appt.firstName || 'Client'}</p>
                          <p className="text-[0.6rem] text-gray-400 font-sans italic truncate">{appt.service || appt.serviceName}</p>
                          <div className="mt-4 flex gap-2">
                            <button onClick={() => generateInvoice(appt)} className="w-full py-2 rounded-lg bg-indigo-50 text-[#5F27CD] hover:bg-[#5F27CD] hover:text-white transition-all flex items-center justify-center gap-1 text-[0.55rem] font-black uppercase tracking-widest"><FileText size={12} /> Reçu</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key="month-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(d => (
                <div key={d} className="text-[0.55rem] sm:text-[0.65rem] font-black tracking-widest text-[#5F27CD] text-center uppercase py-2 bg-indigo-50/50 rounded-xl">{d.substring(0, 3)}</div>
              ))}
              {monthDays.map((day, i) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayAppts = appointments.filter(a => getApptDate(a) === dayStr);
                const isSelectedMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={i} 
                    onClick={() => { setCurrentDate(day); setView('week'); }}
                    className={`aspect-square sm:aspect-auto sm:min-h-[140px] p-2 sm:p-4 rounded-xl sm:rounded-[2rem] border transition-all cursor-pointer group flex flex-col justify-between ${!isSelectedMonth ? 'opacity-30 bg-gray-50/50 border-transparent' : isToday ? 'border-[#5F27CD] bg-[#F8F5F0] shadow-sm' : 'border-gray-100 bg-white hover:border-[#5F27CD] hover:shadow-lg'}`}
                  >
                    <div className="text-right">
                      <p className={`text-sm sm:text-2xl font-sans ${isToday ? 'text-[#5F27CD] font-bold' : 'text-[#222F3E]'}`}>{format(day, 'd')}</p>
                    </div>
                    <div className="flex-1 overflow-hidden mt-1 sm:mt-2 space-y-1">
                      {dayAppts.slice(0, 3).map((appt, j) => (
                        <div key={j} className="text-[0.5rem] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-indigo-50 text-[#5F27CD] truncate leading-tight">
                          {getApptTime(appt)} - {appt.clientNameSnapshot?.split(' ')[0] || appt.clientName?.split(' ')[0] || 'RDV'}
                        </div>
                      ))}
                      {dayAppts.length > 3 && <div className="text-[0.5rem] font-black text-gray-400 pl-1">+{dayAppts.length - 3} soins</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── BOOKING MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#222F3E]/80 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="w-full max-w-xl bg-white rounded-2xl p-6 lg:p-8 shadow-2xl relative z-10 overflow-hidden">
              <h2 className="title-luxe text-3xl mb-2">Inscrire une Séance</h2>
              <p className="text-sm text-gray-500 font-sans italic mb-8">Réservez un espace de sérénité.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-2">Client</label>
                  <select className="w-full p-4 glass rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-50 text-sm" onChange={(e) => { const c = clients.find(cl => cl.id === e.target.value); setNewAppt(prev => ({ ...prev, clientId: e.target.value, clientName: c?.name || '' })); }}>
                    <option value="">Sélectionner un patient...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-2">Service</label>
                  <select className="w-full p-4 glass rounded-xl bg-white border border-gray-100 focus:outline-none text-sm" value={newAppt.service} onChange={(e) => setNewAppt(prev => ({ ...prev, service: e.target.value }))}>
                    <option>Massage Sensoriel 90 min</option>
                    <option>Rituel Énergétique 60 min</option>
                    <option>Immersion Holistique 120 min</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-2">Date</label>
                  <input type="date" value={newAppt.date} onChange={e => setNewAppt(prev => ({ ...prev, date: e.target.value }))} className="w-full p-4 glass rounded-xl text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-2">Heure</label>
                  <input type="time" value={newAppt.time} onChange={e => setNewAppt(prev => ({ ...prev, time: e.target.value }))} className="w-full p-4 glass rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl border border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm">Annuler</button>
                <button onClick={handleAddAppointment} className="flex-[2] py-4 rounded-xl bg-[#5F27CD] text-white font-bold hover:bg-[#4834d4] transition-all shadow-lg text-sm">Enregistrer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
