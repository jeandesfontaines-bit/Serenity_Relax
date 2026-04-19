'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Download, FileText, Smartphone,
  CreditCard, Banknote, X, ArrowUpDown, Printer, Calendar,
  ChevronRight, Sparkles, TrendingUp, AlertCircle, CheckCircle2,
  DollarSign, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Appointment, Invoice } from '../types';

interface ComptaPageProps {
  appointments: Appointment[];
  invoices: Invoice[];
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt: (appt: Appointment) => void;
}

export default function ComptaPage({
  appointments, invoices, onTogglePayment, onSelectAppt,
}: ComptaPageProps) {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filtered = useMemo(() =>
    appointments
      .filter(a => {
        const inRange = a.date && a.date >= dateRange.start && a.date <= dateRange.end;
        const matchesSearch = `${a.clientNameSnapshot} ${a.serviceName || ''}`.toLowerCase().includes(search.toLowerCase());
        return inRange && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date)),
    [appointments, search, dateRange]
  );

  const stats = useMemo(() => {
    const paid = filtered.filter(a => a.paid).reduce((acc, a) => acc + (a.price || 0), 0);
    const pending = filtered.filter(a => !a.paid).reduce((acc, a) => acc + (a.price || 0), 0);
    const late = filtered.filter(a => !a.paid && a.date < todayStr).length;
    return { paid, pending, late };
  }, [filtered, todayStr]);

  return (
    <div className="space-y-12 pb-24">
      
      {/* ── EXECUTIVE FINANCIAL HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/40 backdrop-blur-3xl p-6 rounded-2xl border border-white shadow-lg relative overflow-hidden">
        <div className="space-y-2 relative z-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#5F27CD] text-white flex items-center justify-center shadow-md"><PieChart size={16} /></div>
              <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[#5F27CD]">Comptabilité</p>
           </div>
           <h1 className="title-luxe text-3xl leading-none">Grand Livre</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
           <div className="relative group min-w-[200px]">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="w-full h-12 bg-white/60 border border-white rounded-xl pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none"
              />
           </div>
           <button className="btn-luxe flex items-center gap-2 px-6 py-3">
              <Download size={16} /> Export
           </button>
        </div>
      </header>

      {/* ── KINETIC STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-6 border border-white relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><ArrowUpRight size={60} /></div>
            <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[#1DD1A1] mb-4">Réglé (Période)</p>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-bold text-[#222F3E]">{stats.paid}</span>
               <span className="text-sm font-black uppercase opacity-20">CHF</span>
            </div>
            <div className="w-full h-1 bg-gray-50 rounded-full mt-10 overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-[#1DD1A1]" />
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dash-card p-6 border border-white relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={60} /></div>
            <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[#FF9F43] mb-4">En Attente</p>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-bold text-[#222F3E]">{stats.pending}</span>
               <span className="text-sm font-black uppercase opacity-20">CHF</span>
            </div>
            <p className="text-[0.5rem] text-[#FF9F43] uppercase tracking-widest mt-6 italic">Flux Latent</p>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="dash-card p-6 bg-[#222F3E] text-white relative group overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={60} /></div>
            <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[#FF6B6B] mb-4">Retards</p>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-bold font-sans leading-none">{stats.late}</span>
               <span className="text-sm font-black uppercase opacity-30">Dossiers</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[#FF6B6B] text-[0.55rem] font-black uppercase tracking-widest">
               <AlertCircle size={10} /> Action Requise
            </div>
         </motion.div>
      </div>

      {/* ── THE SOVEREIGN LEDGER ── */}
      <div className="dash-card overflow-hidden border border-white/80 p-0">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/20 backdrop-blur-md">
            <h3 className="text-xl font-bold text-[#222F3E]">Historique</h3>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
               <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-48 h-10 bg-white/60 border border-white rounded-lg pl-10 pr-4 text-[0.6rem] font-black uppercase tracking-widest focus:outline-none"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/30">
                     <th className="px-6 py-4 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Date</th>
                     <th className="px-4 py-4 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Patient</th>
                     <th className="px-4 py-4 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Rituel</th>
                     <th className="px-4 py-4 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Valeur</th>
                     <th className="px-4 py-4 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Statut</th>
                     <th className="px-6 py-4 text-[0.55rem] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filtered.map((apt, i) => (
                    <motion.tr 
                      key={apt.id} 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="group hover:bg-[#F8F5F0]/50 transition-colors"
                    >
                       <td className="px-6 py-4">
                          <p className="text-xs font-bold text-[#222F3E]">{format(new Date(apt.date), 'dd MMM yyyy', { locale: fr })}</p>
                          <p className="text-[0.6rem] text-gray-400">{apt.time}</p>
                       </td>
                       <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#222F3E]">{apt.clientNameSnapshot}</p>
                       </td>
                       <td className="px-4 py-4">
                          <p className="text-xs text-gray-500 italic">{apt.serviceName}</p>
                       </td>
                       <td className="px-4 py-4">
                          <p className="text-lg font-bold text-[#222F3E]">{apt.price} <span className="text-[8px] font-black opacity-20">CHF</span></p>
                       </td>
                       <td className="px-4 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.55rem] font-black uppercase tracking-widest ${apt.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                             {apt.paid ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                             {apt.paid ? 'Réglé' : 'Attente'}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="p-2 text-gray-300 hover:text-[#5F27CD] transition-colors"><Printer size={16} /></button>
                          <button className="p-2 text-gray-300 hover:text-[#5F27CD] transition-colors"><ChevronRight size={16} /></button>
                       </td>
                    </motion.tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filtered.length === 0 && <div className="py-20 text-center text-gray-300 italic">Aucune transaction trouvée sur cette période.</div>}
      </div>

    </div>
  );
}
