'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Plus,
  ChevronLeft, ChevronRight, User,
  CheckCircle, AlertCircle, FileText, Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';

export default function ProfessionalScheduler() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
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

  // ── FIREBASE SYNC ──
  useEffect(() => {
    if (!firestore) return;

    // Sync Appointments
    const qAppts = query(collection(firestore, 'appointments'), orderBy('date', 'asc'));
    const unsubAppts = onSnapshot(qAppts, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Sync Clients for the dropdown
    const unsubClients = onSnapshot(collection(firestore, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubAppts(); unsubClients(); };
  }, [firestore]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));

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
    doc.text(`Facture pour : ${appt.clientName}`, 20, 50);
    doc.text(`Service : ${appt.service}`, 20, 60);
    doc.text(`Montant : ${appt.price} CHF`, 20, 70);
    doc.text(`Date : ${appt.date}`, 20, 80);
    doc.save(`Facture_${appt.clientName}_${appt.date}.pdf`);
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
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><Sparkles size={10} /></div>
              <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#0ABDE3]">Chronos Sanctuary</p>
            </div>
            <h2 className="title-luxe text-2xl md:text-3xl text-white">Votre Agenda <span className="italic font-serif opacity-40">Pro.</span></h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"><ChevronLeft size={16} /></button>
              <p className="text-lg font-serif italic text-white/80">{format(currentDate, 'MMMM yyyy', { locale: fr })}</p>
              <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-luxe flex items-center gap-2 px-6 py-3 text-xs shadow-md shadow-indigo-200/20"
          >
            <Plus size={16} /> Nouvelle Séance
          </button>
        </div>
      </motion.header>

      {/* ── WEEKLY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {weekDays.map((day, i) => {
          const dayAppts = appointments.filter(a => a.date === format(day, 'yyyy-MM-dd'));
          const isToday = isSameDay(day, new Date());

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`dash-card p-4 min-h-[400px] flex flex-col gap-3 border ${isToday ? 'border-[#5F27CD] ring-4 ring-indigo-50 shadow-2xl' : 'border-white bg-white/60'}`}
            >
              <div className="text-center pb-4 border-b border-gray-50">
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">{format(day, 'EEEE', { locale: fr })}</p>
                <p className={`text-2xl font-serif mt-1 ${isToday ? 'text-[#5F27CD] font-bold' : 'text-[#222F3E]'}`}>{format(day, 'd')}</p>
              </div>

              <div className="flex-1 space-y-3">
                {dayAppts.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-10 py-10"><Clock size={40} className="text-gray-300" /></div>
                ) : (
                  dayAppts.map((appt) => (
                    <motion.div
                      key={appt.id}
                      layoutId={appt.id}
                      className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${appt.paid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[0.65rem] font-black text-[#5F27CD]">{appt.time}</span>
                        {appt.paid ? <CheckCircle className="text-emerald-400" size={14} /> : <AlertCircle className="text-amber-400" size={14} />}
                      </div>
                      <p className="font-bold text-sm text-[#222F3E] truncate">{appt.clientName}</p>
                      <p className="text-[0.6rem] text-gray-400 font-serif italic truncate">{appt.service}</p>

                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => generateInvoice(appt)}
                          className="p-2 rounded-lg bg-indigo-50 text-[#5F27CD] hover:bg-[#5F27CD] hover:text-white transition-all flex items-center gap-1 text-[0.55rem] font-black uppercase tracking-widest"
                        >
                          <FileText size={12} /> Facture
                        </button>
                        <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-[#5F27CD] transition-all"><User size={12} /></button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── BOOKING MODAL (Simplified) ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#222F3E]/80 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-xl bg-white rounded-2xl p-6 lg:p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <h2 className="title-luxe text-3xl mb-2">Inscrire une Séance</h2>
              <p className="text-sm text-gray-500 font-serif italic mb-8">Réservez un espace de sérénité.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-2">Client</label>
                  <select
                    className="w-full p-4 glass rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-50 text-sm"
                    onChange={(e) => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      setNewAppt(prev => ({ ...prev, clientId: e.target.value, clientName: c?.name || '' }));
                    }}
                  >
                    <option value="">Sélectionner un patient...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-2">Service</label>
                  <select
                    className="w-full p-4 glass rounded-xl bg-white border border-gray-100 focus:outline-none text-sm"
                    value={newAppt.service}
                    onChange={(e) => setNewAppt(prev => ({ ...prev, service: e.target.value }))}
                  >
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
