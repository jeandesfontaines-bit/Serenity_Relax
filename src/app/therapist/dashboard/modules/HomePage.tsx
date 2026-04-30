import React, { useMemo } from 'react';
import { Calendar, AlertCircle, Clock, ChevronRight, Target, Edit3, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { motion } from 'framer-motion';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function HomePage({
  appointments,
  monthlyGoal,
  onSelectAppt,
  onNavigate,
  onEditGoal,
}: HomePageProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const todayAppts = useMemo(() =>
    appointments
      .filter(a => a.date === todayStr)
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  const latePayments = useMemo(() =>
    appointments.filter(a => !a.paid && a.date && a.date < todayStr),
    [appointments, todayStr],
  );

  const paidThisMonth = useMemo(() =>
    appointments
      .filter(a => a.paid && a.date && a.date.startsWith(currentMonth))
      .reduce((sum, a) => sum + (a.price || 150), 0),
    [appointments, currentMonth],
  );

  const todayRevenue = todayAppts.reduce((s, a) => s + (a.price || 150), 0);
  const progress = Math.min(100, (paidThisMonth / monthlyGoal) * 100);

  return (
    <motion.div 
      className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page header */}
      <header className="h-24 border-b border-[#efeeec] bg-white/50 backdrop-blur-md px-8 sm:px-16 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#725a38] block mb-1">TABLEAU DE BORD</span>
          <h1 className="text-xl font-serif text-[#1a1c1b] tracking-tight uppercase">Vue d'ensemble</h1>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('scheduler')}
            className="flex items-center gap-3 h-10 px-6 text-[10px] font-serif uppercase tracking-[0.2em] text-[#1a1c1b] bg-white border border-[#efeeec] hover:border-[#435544] transition-all duration-500"
          >
            <Calendar size={12} className="text-[#435544]" />
            {todayAppts.length} Soins
          </button>
          {latePayments.length > 0 && (
            <button
              onClick={() => onNavigate('accounting')}
              className="flex items-center gap-3 h-10 px-6 text-[10px] font-serif uppercase tracking-[0.2em] text-white bg-[#1a1c1b] hover:bg-[#435544] transition-all duration-500"
            >
              <AlertCircle size={12} />
              {latePayments.length} Rappels
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1440px] mx-auto px-8 sm:px-16 py-12 sm:py-20">
          {/* Stats row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#efeeec] border border-[#efeeec] mb-16">
            <StatCard
              label="Revenue Jour"
              value={`${todayRevenue} CHF`}
              sub={`${todayAppts.length} séances prévues`}
            />
            <StatCard
              label="Collecté / Mois"
              value={`${(paidThisMonth / 1000).toFixed(1)}k`}
              sub={`Objectif: ${(monthlyGoal / 1000).toFixed(0)}k CHF`}
              action={
                <button onClick={onEditGoal} className="text-[#c3c8c0] hover:text-[#435544] transition-colors">
                  <Edit3 size={13} strokeWidth={1.5} />
                </button>
              }
            />
            <StatCard
              label="Dettes Clients"
              value={`${latePayments.reduce((s, a) => s + (a.price || 150), 0)} CHF`}
              sub={`${latePayments.length} factures en attente`}
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div variants={itemVariants} className="bg-white border border-[#efeeec] p-10 mb-16 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Target size={16} strokeWidth={1} className="text-[#435544]" />
                <span className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#725a38]">Progression Mensuelle</span>
              </div>
              <span className="text-sm font-serif text-[#1a1c1b] italic">{progress.toFixed(0)}% de l'objectif</span>
            </div>
            <div className="h-[2px] bg-[#f4f3f1] relative z-10">
              <motion.div
                className="h-full bg-[#435544]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              />
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <TrendingUp size={80} strokeWidth={0.5} />
            </div>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-20">
            {/* Timeline */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#efeeec]">
                <h2 className="text-2xl font-serif text-[#1a1c1b] uppercase tracking-tight">
                  Séquence du Jour
                </h2>
                <button
                  onClick={() => onNavigate('scheduler')}
                  className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#c3c8c0] hover:text-[#1a1c1b] transition-all"
                >
                  DÉTAILS AGENDA →
                </button>
              </div>

              {todayAppts.length > 0 ? (
                <div className="space-y-4">
                  {todayAppts.map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className="group bg-white border border-[#efeeec] p-8 flex items-center justify-between hover:border-[#435544] transition-all duration-700 cursor-pointer overflow-hidden relative"
                    >
                      <div className="flex items-center gap-10 min-w-0 relative z-10">
                        <div className="w-20 text-sm font-serif text-[#725a38] opacity-60">
                          {appt.time}
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-serif text-[#1a1c1b] truncate group-hover:italic transition-all duration-700">
                            {appt.clientNameSnapshot || appt.title}
                          </p>
                          <p className="text-[9px] text-[#c3c8c0] uppercase tracking-[0.2em] mt-1 group-hover:text-[#435544] transition-colors">
                            {appt.serviceName || 'Soin Architectural'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 relative z-10">
                        <span className={`px-4 py-2 text-[8px] font-serif uppercase tracking-[0.2em] border transition-all duration-700 ${appt.paid
                          ? 'border-[#efeeec] text-[#c3c8c0]'
                          : 'border-[#435544] text-[#435544] group-hover:bg-[#435544] group-hover:text-white'
                        }`}>
                          {appt.paid ? 'ACQUITTÉ' : 'À RÉGLER'}
                        </span>
                        <ChevronRight size={14} strokeWidth={1} className="text-[#efeeec] group-hover:translate-x-1 group-hover:text-[#1a1c1b] transition-all duration-700" />
                      </div>
                      {/* Hover reveal line */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-[#435544] -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#efeeec] border-dashed py-32 text-center">
                  <Clock size={40} className="text-[#efeeec] mx-auto mb-6" strokeWidth={0.5} />
                  <p className="text-xs font-serif text-[#c3c8c0] uppercase tracking-[0.4em]">Secteur en attente</p>
                </div>
              )}
            </motion.div>

            {/* Urgent payments */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#efeeec]">
                <h2 className="text-2xl font-serif text-[#1a1c1b] uppercase tracking-tight">
                  Flux Financier
                </h2>
                <button
                  onClick={() => onNavigate('accounting')}
                  className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#c3c8c0] hover:text-[#1a1c1b] transition-all"
                >
                  COMPTABILITÉ →
                </button>
              </div>

              <div className="bg-white border border-[#efeeec] divide-y divide-[#faf9f7] overflow-hidden">
                {latePayments.length > 0 ? (
                  <>
                    {latePayments.slice(0, 5).map(a => (
                      <div
                        key={a.id}
                        onClick={() => onSelectAppt(a)}
                        className="p-8 flex items-center justify-between hover:bg-[#f4f3f1]/50 cursor-pointer transition-all duration-500 group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-serif text-[#1a1c1b] truncate group-hover:italic transition-all">
                            {a.clientNameSnapshot || a.title}
                          </p>
                          <p className="text-[9px] text-[#725a38]/60 uppercase tracking-widest mt-1">{format(new Date(a.date || ''), 'dd MMMM', { locale: fr })}</p>
                        </div>
                        <span className="text-sm font-serif text-[#1a1c1b] shrink-0">
                          {a.price || 150} <span className="text-[10px] text-[#c3c8c0] ml-1">CHF</span>
                        </span>
                      </div>
                    ))}
                    {latePayments.length > 5 && (
                      <div className="p-4 text-center bg-[#f4f3f1]/30">
                        <span className="text-[9px] text-[#c3c8c0] uppercase tracking-[0.3em] font-medium">
                          + {latePayments.length - 5} autres dossiers
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 text-center">
                    <TrendingUp size={32} className="text-[#efeeec] mx-auto mb-4" strokeWidth={0.5} />
                    <p className="text-[10px] font-serif text-[#c3c8c0] uppercase tracking-[0.4em]">Solde équilibré</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

/* ── STAT CARD ── */
function StatCard({
  label, value, sub, action,
}: {
  label: string;
  value: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white p-10 flex flex-col justify-between group hover:bg-[#faf9f7] transition-colors duration-700">
      <div className="flex items-center justify-between mb-8">
        <span className="text-[9px] font-serif text-[#725a38] uppercase tracking-[0.4em] opacity-60">{label}</span>
        {action}
      </div>
      <div>
        <span className="text-4xl font-serif text-[#1a1c1b] tracking-tighter uppercase">{value}</span>
        <p className="text-[10px] text-[#c3c8c0] mt-3 font-serif uppercase tracking-[0.1em] italic">{sub}</p>
      </div>
    </div>
  );
}

