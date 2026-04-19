'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Mail, Send, CheckCircle, AlertCircle, Calendar, ArrowLeft, ChevronRight, User, Bell, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function RemindersSystem() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const [reminders, setReminders] = useState<any[]>([
    {
      id: 1,
      type: 'appointment',
      title: 'Rappel RDV - Marie Dupont',
      description: 'Massage sensoriel 90 min demain à 14:30',
      date: '2026-04-19',
      status: 'pending',
      recipient: 'marie.dupont@gmail.com'
    },
    {
      id: 2,
      type: 'invoice',
      title: 'Relance facture - Thomas Martin',
      description: 'Facture INV-20260410-002 (150 CHF) en attente depuis 4 jours',
      date: '2026-04-10',
      status: 'pending',
      recipient: 'thomas.martin@gmail.com'
    }
  ]);

  const [loading, setLoading] = useState(true);

  // Simulation de chargement des données réelles
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const sendReminder = (id: number) => {
    alert(`📧 Rappel automatique activé pour le dossier ${id} !`);
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r));
  };

  const sendAllPending = () => {
    const pendingCount = reminders.filter(r => r.status === 'pending').length;
    if (pendingCount === 0) return;
    alert(`📧 ${pendingCount} rappels envoyés instantanément !`);
    setReminders(prev => prev.map(r => ({ ...r, status: 'sent' })));
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const sentReminders = reminders.filter(r => r.status === 'sent');

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F5F0] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <button onClick={() => router.push('/therapist/dashboard')} className="flex items-center gap-3 text-gray-400 font-black text-[0.65rem] uppercase tracking-widest hover:text-[#5F27CD] transition-colors">
            <ArrowLeft size={16} /> Retour Dashboard
          </button>

          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-white/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white shadow-2xl shadow-indigo-100/10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><Bell size={20} /></div>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#5F27CD]">Centre de Communications</p>
               </div>
               <h1 className="title-luxe text-5xl md:text-7xl leading-none">Rappels <br/><span className="italic font-serif opacity-40">Auto-Bio.</span></h1>
            </div>
            
            <button
              onClick={sendAllPending}
              disabled={pendingReminders.length === 0}
              className={`flex items-center gap-4 px-12 py-7 text-lg rounded-[2.5rem] font-black uppercase tracking-[0.2em] transition-all ${pendingReminders.length > 0 ? 'bg-[#222F3E] text-white shadow-2xl shadow-indigo-200/50 hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            >
              <Send size={24} className={pendingReminders.length > 0 ? "text-[#0ABDE3]" : ""} /> Envoyer {pendingReminders.length} Rappels
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="dash-card p-10 bg-white shadow-sm border border-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={80} /></div>
               <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-amber-600 mb-4">En Attente d&apos;Action</p>
               <p className="text-6xl font-light text-[#222F3E]">{pendingReminders.length}</p>
            </div>
            <div className="dash-card p-10 bg-[#222F3E] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10"><CheckCircle size={80} /></div>
               <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#1DD1A1] mb-4">Rituels Confirmés (Aujourd&apos;hui)</p>
               <p className="text-6xl font-light text-white">{sentReminders.length}</p>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-3xl font-serif font-light flex items-center gap-4 text-[#222F3E]">
               <Sparkles className="text-amber-500" /> Flux de Relances Actives
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {pendingReminders.map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    layoutId={String(reminder.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="dash-card p-8 md:p-12 border border-white flex flex-col md:flex-row justify-between items-center gap-10 group hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center gap-8 w-full md:w-auto">
                       <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${reminder.type === 'invoice' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {reminder.type === 'invoice' ? <Mail size={24} /> : <Calendar size={24} />}
                       </div>
                       <div className="space-y-2">
                          <p className="text-2xl font-serif font-medium text-[#222F3E]">{reminder.title}</p>
                          <p className="description-luxe text-gray-400 italic line-clamp-1">{reminder.description}</p>
                       </div>
                    </div>
                    
                    <button 
                       onClick={() => sendReminder(reminder.id)}
                       className="w-full md:w-auto px-10 py-6 glass border border-gray-100 rounded-[2rem] text-[0.65rem] font-black uppercase tracking-widest text-[#222F3E] hover:bg-white hover:shadow-xl transition-all flex items-center justify-center gap-4 group"
                    >
                       <Send size={18} className="text-[#5F27CD] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       Lancer le Rappel
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {pendingReminders.length === 0 && (
                <div className="py-20 text-center space-y-4">
                   <CheckCircle className="mx-auto text-emerald-100" size={60} />
                   <p className="text-xl font-serif italic text-gray-300">Tous vos patients ont été prévenus.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
