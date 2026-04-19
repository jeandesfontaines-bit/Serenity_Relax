'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Sparkles, Trophy, ArrowRight, Home, User, Heart, BarChart3, 
  Plus, LogOut, ShieldCheck, MapPin, Droplets, Wind, Leaf, Download, ChevronRight, CheckCircle2, History as HistoryIcon, FileText
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const WELLNESS_TIPS = [
  { id: 1, title: "Accueillez vos émotions", icon: Heart },
  { id: 2, title: "Prenez votre temps", icon: Clock },
  { id: 3, title: "Hydratez-vous", icon: Droplets },
  { id: 4, title: "Choisissez la douceur", icon: Leaf },
];

export default function ClientDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchZenData() {
      // Logic for session storage (anonymous booking)
      const storedId = sessionStorage.getItem('serenity_client_id');
      const effectiveId = user?.uid || storedId;

      if (!effectiveId || !firestore) {
         setFetching(false);
         return;
      }

      try {
        // Fetch Client Data
        const cDoc = await getDoc(doc(firestore, 'clients', effectiveId));
        if (cDoc.exists()) setClientData(cDoc.data());

        // Fetch Appointments
        const q = query(
          collection(firestore, 'appointments'),
          where('clientId', '==', effectiveId),
          orderBy('startTime', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Zen fetch error:", err);
      } finally {
        setFetching(false);
      }
    }
    if (!isUserLoading) fetchZenData();
  }, [user, isUserLoading, firestore]);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    sessionStorage.removeItem('serenity_client_id');
    router.push('/');
  };

  const points = clientData?.points || 820;
  const upcoming = appointments.filter(a => new Date(a.startTime) >= new Date()).reverse();
  const past = appointments.filter(a => new Date(a.startTime) < new Date());

  if (isUserLoading || fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F5F0]">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-[#5F27CD]/20 border-t-[#5F27CD] rounded-full animate-spin" />
           <p className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] animate-pulse">Ouverture du Sanctuaire...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* ── BACKGROUND ENGINE ── */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#F8F5F0] via-[#F0EBE4] to-[#F8F5F0] overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 10, repeat: Infinity }} className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#5F27CD_0%,transparent_50%)]" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 12, repeat: Infinity }} className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#0ABDE3_0%,transparent_50%)]" />
      </div>

      <div className="flex h-screen bg-transparent overflow-hidden relative z-10">
        
        {/* ── SIDEBAR ── */}
        <div className="w-80 glass border-r border-white/40 hidden lg:flex flex-col backdrop-blur-3xl p-10">
          <div className="mb-14">
            <h1 className="text-2xl font-black tracking-widest text-[#222F3E]">SERENITY</h1>
            <p className="text-[0.6rem] font-bold text-[#1DD1A1] uppercase tracking-[0.3em] mt-1">Espace Thérapeutique</p>
          </div>

          <nav className="flex-1 space-y-4">
            <button className="flex items-center gap-4 w-full px-8 py-6 rounded-[2rem] bg-gradient-to-r from-[#5F27CD] to-[#0ABDE3] text-white shadow-2xl">
               <Home size={18} /> <span className="text-xs font-black uppercase tracking-widest">Aperçu</span>
            </button>
            <button onClick={() => router.push('/client/profil')} className="flex items-center gap-4 w-full px-8 py-6 rounded-[2rem] text-gray-400 hover:bg-white transition-all">
               <User size={18} /> <span className="text-xs font-black uppercase tracking-widest">Mon Identité</span>
            </button>
            <button onClick={() => router.push('/client/fidelite')} className="flex items-center gap-4 w-full px-8 py-6 rounded-[2rem] text-gray-400 hover:bg-white transition-all">
               <Trophy size={18} /> <span className="text-xs font-black uppercase tracking-widest">Privilèges</span>
            </button>
            <button onClick={() => router.push('/client/invoices')} className="flex items-center gap-4 w-full px-8 py-6 rounded-[2rem] text-gray-400 hover:bg-white transition-all">
               <FileText size={18} /> <span className="text-xs font-black uppercase tracking-widest">Mes Sessions</span>
            </button>
            <div className="pt-10 border-t border-white/20 mt-10">
               <button onClick={() => router.push('/booking')} className="btn-luxe w-full py-6 flex justify-center items-center gap-3">
                  <Plus size={18} /> Réserver un Soin
               </button>
            </div>
          </nav>

          <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-red-400 font-black text-[0.6rem] uppercase tracking-widest px-8">
            <LogOut size={16} /> Quitter
          </button>
        </div>

        {/* ── MAIN ── */}
        <div className="flex-1 overflow-auto p-10 lg:p-20 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-24 pb-32">
            
            <header>
               <h2 className="title-luxe text-6xl md:text-8xl leading-none">Bonjour, <br/>{user?.displayName?.split(' ')[0] || clientData?.firstName || 'Ami'} 👋</h2>
               <p className="text-xl md:text-4xl text-gray-400 font-serif italic mt-8">Votre sanctuaire personnel est prêt.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               
               {/* ── NEXT APPOINTMENT ── */}
               <motion.div className="lg:col-span-12 dash-card p-12 border border-white/80 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12"><Calendar size={200} /></div>
                  <h3 className="text-2xl font-serif font-medium text-[#222F3E] flex items-center gap-3 mb-12"><Sparkles className="text-[#5F27CD]" /> Prochain Rituel</h3>
                  
                  {upcoming.length > 0 ? (
                    <div className="flex flex-col md:flex-row gap-12 items-center bg-white/60 p-10 rounded-[3.5rem] border border-white shadow-xl relative z-10">
                       <div className="text-center p-8 bg-[#F8F5F0] rounded-[2.5rem] min-w-[160px]">
                          <p className="text-7xl font-light text-[#5F27CD] tracking-tighter leading-none">{new Date(upcoming[0].startTime).getDate()}</p>
                          <p className="text-[0.65rem] font-black tracking-[0.3em] uppercase text-gray-400 mt-4">{format(new Date(upcoming[0].startTime), 'MMM', { locale: fr }).toUpperCase()}</p>
                       </div>
                       <div className="flex-1 space-y-4 text-center md:text-left">
                          <p className="text-4xl font-serif font-light text-[#222F3E] leading-tight">{upcoming[0].serviceName}</p>
                          <p className="text-xs font-black tracking-[0.2em] text-[#0ABDE3] uppercase">{format(new Date(upcoming[0].startTime), 'HH:mm')} • Studio Cointrin</p>
                       </div>
                       <div className="flex flex-col items-center gap-4">
                          <span className="px-8 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest">Confirmé</span>
                          <button className="text-[0.65rem] font-black uppercase tracking-widest text-[#5F27CD] hover:underline">Gérer →</button>
                       </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                       <p className="text-gray-300 font-serif italic italic text-xl">Aucun rituel prévu...</p>
                       <button onClick={() => router.push('/booking')} className="text-[0.65rem] font-black text-[#5F27CD] uppercase tracking-widest mt-6 hover:underline">Réserver maintenant →</button>
                    </div>
                  )}
               </motion.div>

               {/* ── WELLNESS ADVICE & FIDELITY ── */}
               <div className="lg:col-span-5 h-full">
                  <section className="dash-card p-10 bg-[#222F3E] text-white space-y-10 h-full">
                     <div>
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#0ABDE3] mb-4">L&apos;Accompagnement</p>
                        <h3 className="text-3xl font-serif font-light italic text-[#F8F5F0]">Prolonger la Sérénité</h3>
                     </div>
                     <div className="space-y-6">
                        {WELLNESS_TIPS.map(tip => (
                          <div key={tip.id} className="flex gap-4 items-center group">
                             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-[#1DD1A1]/20 group-hover:text-[#1DD1A1] transition-all">
                                <tip.icon size={16} />
                             </div>
                             <p className="text-[0.85rem] font-serif font-light text-gray-300">{tip.title}</p>
                          </div>
                        ))}
                     </div>
                  </section>
               </div>

               {/* ── HISTORY / STATS ── */}
               <div className="lg:col-span-7 h-full">
                  <div className="dash-card p-10 h-full border border-white">
                     <h3 className="text-2xl font-serif font-medium text-[#222F3E] mb-10">Parcours Accomplis</h3>
                     <div className="space-y-6">
                        {past.slice(0, 4).map(apt => (
                          <div key={apt.id} className="flex justify-between items-center group">
                             <div className="flex gap-6 items-center">
                                <div className="p-4 bg-[#F8F5F0] rounded-2xl text-[#222F3E]">
                                   <HistoryIcon size={18} />
                                </div>
                                <div>
                                   <p className="text-[0.95rem] font-serif font-bold text-[#222F3E]">{apt.serviceName}</p>
                                   <p className="text-[0.6rem] font-black text-gray-300 uppercase tracking-widest">{format(new Date(apt.startTime), 'd MMMM yyyy', { locale: fr })}</p>
                                </div>
                             </div>
                             <button className="p-3 hover:bg-[#F8F5F0] rounded-xl transition-colors text-gray-400 group-hover:text-[#5F27CD]"><Download size={16} /></button>
                          </div>
                        ))}
                        {past.length === 0 && <p className="text-gray-300 italic text-center py-10">Votre histoire commence ici...</p>}
                     </div>
                  </div>
               </div>

             </div>

             {/* ── SESSION HISTORY CTA ── */}
             <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => router.push('/client/invoices')}
                className="dash-card p-12 lg:p-16 border border-white hover:shadow-2xl transition-all cursor-pointer group bg-gradient-to-br from-white/40 to-[#F8F5F0]/20 flex flex-col md:flex-row justify-between items-center gap-10"
             >
                <div className="flex items-center gap-8">
                   <div className="w-20 h-20 rounded-[2.5rem] bg-[#222F3E] text-white flex items-center justify-center group-hover:bg-[#5F27CD] transition-all shadow-xl shadow-indigo-100/10"><FileText size={32} /></div>
                   <div className="space-y-2">
                      <h3 className="text-4xl font-serif font-medium text-[#222F3E]">Mes Justificatifs & Factures</h3>
                      <p className="text-xl text-gray-400 font-serif italic italic">Accédez à l&apos;intégralité de votre historique de soins en un clic.</p>
                   </div>
                </div>
                <ChevronRight size={40} className="text-gray-200 group-hover:text-[#5F27CD] group-hover:translate-x-2 transition-all" />
             </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
