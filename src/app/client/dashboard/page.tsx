'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Receipt, ChevronRight, LogOut, Loader2, User, UserCircle2, ArrowUpRight } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 text-neutral-900 animate-spin" />
      </div>
    );
  }

  const upcoming = appointments.filter(a => isAfter(new Date(a.startTime), startOfDay(new Date())));
  const past = appointments.filter(a => isBefore(new Date(a.startTime), startOfDay(new Date())));

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans pb-24">
      {/* HEADER */}
      <header className="bg-white border-b border-neutral-100 px-8 py-8 md:px-12 lg:px-16 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-xl shadow-neutral-200">
            {client?.firstName?.[0] || 'S'}
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-neutral-900">Bienvenue, {client?.firstName}</h1>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400">VOTRE ESPACE BIEN-ÊTRE</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-all text-neutral-400 hover:text-neutral-900 shadow-sm"
          title="Se déconnecter"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 md:px-12 py-12 space-y-16">
        
        {/* UPCOMING */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <h2 className="text-[1.2rem] font-serif font-bold text-neutral-900">Prochaines Séances</h2>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[0.65rem] font-black uppercase tracking-widest">{upcoming.length} RITUEL(S)</span>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map(appt => (
                <div key={appt.id} className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-xl shadow-neutral-100 transition-all hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[#FAF9F6] rounded-2xl text-neutral-900">
                      <Calendar size={24} />
                    </div>
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[0.65rem] font-black uppercase tracking-[0.1em]">CONFIRMÉ</span>
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2">{appt.serviceName.split(' - ')[0]}</h3>
                  <div className="space-y-3 text-[0.9rem] text-neutral-500 font-medium">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-neutral-400" />
                      <span>{format(new Date(appt.startTime), 'EEEE d MMMM', { locale: fr })} à {format(new Date(appt.startTime), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-neutral-400" />
                      <span>Avenue de Mategnin 4, 1217 Meyrin</span>
                    </div>
                  </div>
                  <hr className="my-6 border-neutral-50" />
                  <button className="w-full py-4 border border-neutral-900 rounded-full text-[0.7rem] font-black uppercase tracking-[0.15em] hover:bg-neutral-900 hover:text-white transition">
                    MODIFIER OU ANNULER
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-neutral-100 border-dashed">
              <p className="text-neutral-400 font-serif italic text-lg mb-6">Vous n'avez pas encore de rituel prévu.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-10 py-4 bg-neutral-900 text-white rounded-full text-[0.7rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-neutral-100"
              >
                RÉSERVER UN SOIN
              </button>
            </div>
          )}
        </section>

        {/* PAST & INVOICES */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <h2 className="text-[1.2rem] font-serif font-bold text-neutral-900">Historique & Factures</h2>
            <span className="px-3 py-1 bg-neutral-100 text-neutral-400 rounded-full text-[0.65rem] font-black uppercase tracking-widest">{past.length} SÉANCE(S)</span>
          </div>

          <div className="bg-white rounded-[3rem] overflow-hidden border border-neutral-100 shadow-xl shadow-neutral-100">
            {past.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F6]">
                  <tr>
                    <th className="px-8 py-5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400">Date & Soin</th>
                    <th className="px-8 py-5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400">Status</th>
                    <th className="px-8 py-5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {past.map(appt => (
                    <tr key={appt.id} className="group hover:bg-neutral-50 transition">
                      <td className="px-8 py-6">
                        <div className="font-serif font-bold text-neutral-900 text-lg leading-tight mb-1">{appt.serviceName.split(' - ')[0]}</div>
                        <div className="text-[0.75rem] font-medium text-neutral-400 flex items-center gap-2">
                           {format(new Date(appt.startTime), 'd MMMM yyyy', { locale: fr })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-neutral-50 text-neutral-500 rounded-full text-[0.6rem] font-black uppercase tracking-widest">TERMINÉ</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="inline-flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-widest text-neutral-900 hover:text-emerald-600 transition group">
                          TÉLÉCHARGER <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition translate-y-1 group-hover:translate-y-0" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
               <div className="py-20 text-center text-neutral-400 font-serif italic text-lg">Aucun historique disponible.</div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
