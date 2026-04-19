'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, Calendar, DollarSign, Activity, 
  Sparkles, BarChart3, ArrowUpRight, ShieldCheck, Clock
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const unsubInvoices = onSnapshot(collection(firestore, 'invoices'), (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAppts = onSnapshot(collection(firestore, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsubInvoices(); unsubAppts(); };
  }, [firestore]);

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalCA = paidInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const activeClients = new Set(appointments.map(a => a.clientId)).size;
  const sessionsThisMonth = appointments.length;
  const occupancyRate = appointments.length > 0 ? 87 : 0; 
  
  // High-Fidelity Data for the Enhanced Graph
  const occupationData = [68, 75, 82, 91, 77, 88, 94]; 
  const caData = [1250, 980, 1650, 2100, 1340, 1890, 2300]; 
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32">
      
      {/* ── HEADER IMPACT ── */}
      <motion.header 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-[#222F3E] text-white p-8 lg:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none -rotate-12"><Activity size={300} /></div>
        
        <div className="space-y-6 relative z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><BarChart3 size={20} /></div>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#5F27CD]">Pulse Intelligence</p>
           </div>
           <h2 className="title-luxe text-2xl md:text-3xl leading-none text-white">Vision <br/><span className="italic font-sans opacity-40">Holistique.</span></h2>
           <p className="text-sm text-gray-400 font-sans italic max-w-md">Tableau de bord exécutif & flux mensuel.</p>
        </div>
        
        <div className="dash-card bg-[#222F3E] text-white p-6 flex flex-col justify-between h-40 w-full lg:w-64 shadow-xl shadow-indigo-200/20">
           <p className="text-[0.55rem] font-black uppercase tracking-widest text-[#0ABDE3]">Croissance</p>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-light">{occupancyRate}<small className="text-base opacity-30">%</small></span>
              <span className="text-emerald-400 flex items-center gap-1 text-[0.55rem] font-black"><TrendingUp size={12} /> +22%</span>
           </div>
           <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${occupancyRate}%` }} className="h-full bg-gradient-to-r from-[#5F27CD] to-[#0ABDE3]" />
           </div>
        </div>
      </motion.header>

      {/* ── KEY METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'CA du mois', val: `${totalCA} CHF`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+22% ce mois' },
          { label: 'Occupation', val: `${occupancyRate}%`, icon: Activity, color: 'text-[#5F27CD]', bg: 'bg-indigo-50' },
          { label: 'Clients actifs', val: activeClients, icon: Users, color: 'text-[#0ABDE3]', bg: 'bg-sky-50' },
          { label: 'Séances', val: sessionsThisMonth, icon: Calendar, color: 'text-[#FF9F43]', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="dash-card p-6 bg-white border border-white hover:shadow-xl transition-all"
          >
             <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[0.55rem] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-light text-[#222F3E] mt-2">{stat.val}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}><stat.icon size={18} /></div>
             </div>
             {stat.trend && (
                <p className={`${stat.color} text-[0.6rem] font-black uppercase tracking-widest flex items-center gap-2`}><TrendingUp size={12} /> {stat.trend}</p>
             )}
          </motion.div>
        ))}
      </div>

      {/* === ENHANCED DUAL GRAPH === */}
      <div className="dash-card p-12 bg-white border border-white space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
             <h2 className="text-3xl font-sans font-medium text-[#222F3E]">Pulse Hebdomadaire</h2>
             <p className="text-sm text-gray-400 font-sans italic">Taux d&apos;occupation (éveil) & Flux financiers (abondance).</p>
          </div>
          <div className="px-8 py-4 bg-gray-50/50 border border-gray-100 rounded-full text-[0.65rem] font-black uppercase tracking-widest text-gray-400">
             Semaine du 13 au 19 Avril 2026
          </div>
        </div>

        <div className="h-96 flex items-end gap-6 md:gap-10">
          {labels.map((day: string, i: number) => (
            <div key={day} className="flex-1 flex flex-col justify-end gap-3 group">
              {/* Bar occupation */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${occupationData[i]}%` }}
                transition={{ duration: 1.2, delay: i * 0.08, ease: "circOut" }}
                className="bg-gradient-to-t from-[#5F27CD] to-[#0ABDE3] rounded-[1.5rem] relative flex-1 group-hover:brightness-110 shadow-xl shadow-indigo-100/10 transition-all flex items-end justify-center pb-4"
              >
                <div className="text-[0.6rem] font-black text-white/40 vertical-rl transform -rotate-180 opacity-0 group-hover:opacity-100 transition-opacity">
                  {occupationData[i]}%
                </div>
              </motion.div>

              {/* Bar CA (subtle secondary indicator) */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(caData[i] / 2500) * 40}%` }}
                transition={{ duration: 1.2, delay: i * 0.1, ease: "circOut" }}
                className="bg-gradient-to-t from-[#1DD1A1] to-[#0ABDE3] rounded-[1rem] h-8 opacity-60 shadow-lg shadow-emerald-100/10"
              />
              
              <p className="text-center text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mt-4 group-hover:text-[#5F27CD] transition-colors">{day}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-12 pt-8 border-t border-gray-50 text-[0.65rem] font-black uppercase tracking-widest">
          <div className="flex items-center gap-3 text-[#5F27CD]">
            <div className="w-5 h-5 bg-gradient-to-t from-[#5F27CD] to-[#0ABDE3] rounded-lg shadow-sm"></div>
            <span>Occupation (%)</span>
          </div>
          <div className="flex items-center gap-3 text-[#1DD1A1]">
            <div className="w-5 h-5 bg-gradient-to-t from-[#1DD1A1] to-[#0ABDE3] rounded-lg shadow-sm"></div>
            <span>Affluence Financière (CA)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
