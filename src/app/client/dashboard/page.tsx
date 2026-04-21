'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { 
  Calendar, Clock, MapPin, Receipt, ChevronRight, LogOut, Loader2, 
  User, UserCircle2, ArrowUpRight, Download, ChevronDown
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';

export default function ClientDashboardPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!firestore) return;

      const clientId = sessionStorage.getItem('serenity_client_id');
      if (!clientId) {
        router.push('/client/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch Client
        const clientDoc = await getDoc(doc(firestore, 'clients', clientId));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() });
        } else {
          router.push('/client/login');
          return;
        }

        // Fetch Appointments
        const q = query(
          collection(firestore, 'appointments'),
          where('clientId', '==', clientId),
          orderBy('startTime', 'desc')
        );
        const snap = await getDocs(q);
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [firestore, router]);

  const logout = () => {
    sessionStorage.removeItem('serenity_client_id');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sandstone">
        <Loader2 className="w-12 h-12 text-onyx animate-spin" />
      </div>
    );
  }

  const upcoming = appointments.filter(a => isAfter(new Date(a.startTime), startOfDay(new Date())));
  const past = appointments.filter(a => isBefore(new Date(a.startTime), startOfDay(new Date())));

  return (
    <div className="min-h-screen bg-sandstone text-onyx selection:bg-onyx/5 antialiased flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1040px] mx-auto px-6 pt-32 pb-40 md:pt-48">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[12px] font-black uppercase tracking-[2px] text-forest mb-4">Espace client</div>
            <h1 className="text-[56px] md:text-[64px] font-black leading-[0.9] tracking-tight uppercase">Bonjour, {client?.firstName}.</h1>
          </motion.div>
          <button 
            onClick={() => router.push('/')}
            className="bg-forest text-white h-16 px-9 rounded-full text-[13px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-forest/20"
          >
            Réserver une séance
          </button>
        </div>

        {/* Upcoming Session */}
        <section className="mb-24">
          <h2 className="text-[14px] font-black uppercase tracking-widest text-earth mb-8">Prochain rendez-vous</h2>
          {upcoming.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cream border border-clay rounded-[40px] p-8 md:p-12 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-10"
            >
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 rounded-[32px] bg-sandstone border border-clay flex flex-col items-center justify-center shrink-0">
                  <span className="text-[14px] font-black uppercase tracking-widest text-earth/60">{format(new Date(upcoming[0].startTime), 'MMM', { locale: fr })}</span>
                  <span className="text-[32px] font-black leading-none mt-1">{format(new Date(upcoming[0].startTime), 'd')}</span>
                </div>
                <div>
                  <h3 className="text-[28px] font-black uppercase tracking-tight mb-4">{upcoming[0].serviceName.split(' - ')[0]}</h3>
                  <div className="flex flex-wrap gap-8 text-[14px] font-medium text-earth">
                    <span className="flex items-center gap-3">
                      <Clock size={18} className="text-forest" />
                      {format(new Date(upcoming[0].startTime), 'HH:mm')} - {format(new Date(upcoming[0].endTime), 'HH:mm')} ({upcoming[0].duration || '90 min'})
                    </span>
                    <span className="flex items-center gap-3">
                      <MapPin size={18} className="text-forest" />
                      Cointrin, Genève
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="h-14 px-8 border border-clay rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-sandstone transition-all">
                  Reporter
                </button>
                <button className="h-14 px-8 border border-red-100 text-red-700 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                  Annuler
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-cream border border-clay border-dashed rounded-[40px] py-24 text-center">
              <p className="text-[18px] text-earth font-medium mb-10 italic">Vous n'avez pas encore de rituel prévu.</p>
              <button 
                onClick={() => router.push('/')}
                className="h-14 px-10 border border-clay rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-sandstone transition-all"
              >
                Découvrir les soins
              </button>
            </div>
          )}
        </section>

        {/* History & Invoices */}
        <section>
          <h2 className="text-[14px] font-black uppercase tracking-widest text-earth mb-8">Historique & Factures</h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-cream border border-clay rounded-[40px] overflow-hidden shadow-sm"
          >
            <div className="hidden lg:grid grid-cols-[1.5fr_3fr_1.5fr_1.5fr_2fr] gap-6 px-10 py-6 border-b border-clay bg-sandstone/30 text-[11px] font-black uppercase tracking-widest text-earth/50">
              <div>Date</div>
              <div>Soin</div>
              <div>Durée</div>
              <div>Statut</div>
              <div className="text-right">Document</div>
            </div>

            <div className="divide-y divide-clay/50">
              {past.length > 0 ? (
                past.map((appt) => (
                  <div key={appt.id} className="grid grid-cols-1 lg:grid-cols-[1.5fr_3fr_1.5fr_1.5fr_2fr] gap-6 px-10 py-8 items-center hover:bg-sandstone/10 transition-all">
                    <div className="text-[15px] font-black text-onyx/40 lg:text-onyx uppercase tracking-widest">
                       {format(new Date(appt.startTime), 'd MMMM yyyy', { locale: fr })}
                    </div>
                    <div>
                      <div className="text-[18px] font-black uppercase tracking-tight">{appt.serviceName.split(' - ')[0]}</div>
                    </div>
                    <div className="text-[15px] font-medium text-earth/60">
                      {appt.duration || '75 min'}
                    </div>
                    <div>
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${appt.status === 'cancelled' ? 'bg-earth/10 text-earth/50' : 'bg-forest/10 text-forest'}`}>
                        {appt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                      </span>
                    </div>
                    <div className="text-right">
                      {appt.status !== 'cancelled' ? (
                        <button className="h-10 px-6 border border-clay rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-sandstone transition-all flex items-center gap-3 ml-auto">
                          <Download size={14} className="text-forest" />
                          Facture PDF
                        </button>
                      ) : (
                        <span className="text-earth/30">−</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center text-earth/40 italic font-medium">Aucun historique disponible.</div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <section className="px-6 pb-12 mt-auto">
        <footer className="container mx-auto bg-forest text-white rounded-[40px] p-12 md:p-24 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 lg:gap-32 items-start mb-32">
            <div>
              <div className="leading-none flex flex-col gap-2">
                <span className="text-[32px] font-black uppercase tracking-tighter">Serenity Relax</span>
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">Therapy Genève</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Localisation</h4>
                <p className="text-[15px] leading-relaxed font-medium">
                  Alfa Business Center, Cointrin<br />Genève, Suisse
                </p>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Contact</h4>
                <p className="text-[15px] leading-relaxed font-medium">
                  +41 78 333 68 23<br />serenityrelaxtherapy@gmail.com
                </p>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Suivez-nous</h4>
                <div className="flex flex-col gap-3">
                  <a href="#" className="text-[15px] hover:text-white/60 transition-all font-medium">Instagram</a>
                  <a href="#" className="text-[15px] hover:text-white/60 transition-all font-medium">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-20 border-t border-white/10 text-center">
            <span className="text-[12vw] font-black tracking-[-0.05em] leading-[0.8] opacity-10 select-none">SERENITY</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
