'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, Clock, LayoutGrid, Target, Sparkles } from 'lucide-react';
import { Appointment } from '../types';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
}

export default function HomePage({ appointments, monthlyGoal, onSelectAppt, onNavigate, onEditGoal }: HomePageProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today).sort((a, b) => a.time.localeCompare(b.time));

  const totalToday = todayAppts.length;
  const revenueToday = todayAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  
  // Calculate current month's total revenue for goal tracking
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthRevenue = appointments
    .filter(a => a.date.startsWith(currentMonth))
    .reduce((sum, a) => sum + (a.price || 0), 0);
  
  const goalPercent = Math.min(Math.round((monthRevenue / monthlyGoal) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* ── WELCOME SECTION LUXE ── */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 mb-12 sm:mb-16"
      >
        <span className="text-6xl sm:text-7xl animate-float">🌿</span>
        <div>
          <h1 className="title-luxe text-5xl sm:text-7xl leading-tight">Bonjour João 👋</h1>
          <p className="text-xl sm:text-2xl text-gray-500  mt-1">Ton sanctuaire est prêt.</p>
        </div>
      </motion.header>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white hover:shadow-2xl transition-all duration-500 group" 
          whileHover={{ y: -10 }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#54A0FF]">Flux du jour</p>
              <p className="text-5xl font-serif font-medium">{totalToday}</p>
              <p className="text-xs font-bold text-gray-400">Rendez-vous prévus</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#5F27CD] group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white hover:shadow-2xl transition-all duration-500 group" 
          whileHover={{ y: -10 }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#1DD1A1]">CA Journalier</p>
              <p className="text-5xl font-serif font-medium">{revenueToday}<span className="text-xl ml-1">CHF</span></p>
              <p className="text-xs font-bold text-gray-400">Restaurations générées</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1DD1A1] group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white hover:shadow-2xl transition-all duration-500 group relative overflow-hidden" 
          whileHover={{ y: -10 }}
        >
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-4">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#FF9F43]">Précision Objectif</p>
              <p className="text-5xl font-serif font-medium">{goalPercent}<span className="text-xl ml-1">%</span></p>
              <button 
                onClick={onEditGoal} 
                className="text-[0.55rem] font-black uppercase tracking-widest bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg border border-gray-100 transition-colors"
              >
                Cible: {monthlyGoal} CHF
              </button>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF9F43] group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
          </div>
          {/* Progress gauge visual at bottom of card */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              className="h-full bg-gradient-to-r from-[#FF9F43] to-[#FF6B6B]"
            />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white hover:shadow-2xl transition-all duration-500 group" 
          whileHover={{ y: -10 }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#0ABDE3]">Fidélité Mensuelle</p>
              <p className="text-5xl font-serif font-medium">42</p>
              <p className="text-xs font-bold text-gray-400">Patients ce mois</p>
            </div>
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-[#0ABDE3] group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* AGENDA SECTION */}
      <div className="space-y-8 pt-8 px-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-medium text-[#222F3E] tracking-tight">Agenda du <span className="italic">jour</span></h2>
            <p className="text-sm font-sans font-medium text-[#576574]">Optimisation de votre temps de soin.</p>
          </div>
          <button 
            onClick={() => onNavigate('scheduler')} 
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#222F3E] text-white text-[0.7rem] font-black uppercase tracking-widest hover:bg-[#5F27CD] transition-all hover:shadow-xl hover:shadow-indigo-100 active:scale-95 self-start sm:self-auto"
          >
            Vue calendrier complet <Calendar className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-6">
          {todayAppts.length > 0 ? (
            todayAppts.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => onSelectAppt(appt)}
                className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 flex flex-col sm:flex-row sm:items-center gap-6 cursor-pointer border border-transparent hover:border-white hover:bg-white hover:shadow-xl transition-all duration-500 group relative"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-20 text-center py-2 bg-white rounded-2xl border border-gray-50 shadow-sm group-hover:bg-indigo-50 transition-colors">
                    <p className="text-2xl font-serif font-medium text-[#5F27CD] tracking-tight">{appt.time}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xl font-serif font-medium text-[#222F3E] tracking-tight group-hover:text-[#5F27CD] transition-colors">{appt.clientNameSnapshot || 'Patient'}</p>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <p className="text-[0.75rem] font-bold uppercase tracking-widest leading-none">{appt.serviceName || appt.title || 'Soin Thérapeutique'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-6 sm:border-l border-gray-100">
                  <div className="flex flex-col items-end">
                    <span className={`inline-block px-4 py-1.5 rounded-xl text-[0.65rem] font-black uppercase tracking-wider ${appt.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {appt.paid ? 'Règlement effectué' : 'Action de paiement'}
                    </span>
                    <p className="text-base font-serif font-medium mt-1 text-gray-500">{appt.price || 150} CHF</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-gray-200 py-24 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <p className="text-xl  text-gray-400">Aucune session prévue pour aujourd&apos;hui — magnifique respiration !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
