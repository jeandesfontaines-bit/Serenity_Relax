
"use client";

import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles, Clock, History, Loader2, User, ShieldCheck } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { SERVICES } from '@/lib/types';
import Link from 'next/link';

export default function ClientPortal() {
  const { firestore } = useFirestore();
  const { user, isUserLoading } = useUser();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'appointments'),
      where('clientId', '==', user.uid),
      orderBy('startTime', 'desc')
    );
  }, [firestore, user]);

  const { data: appointments, isLoading: aptLoading } = useCollection(appointmentsQuery);

  const now = new Date();
  const upcoming = appointments?.filter(apt => isAfter(new Date(apt.startTime), now)) || [];
  const past = appointments?.filter(apt => !isAfter(new Date(apt.startTime), now)) || [];

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F2] p-8 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 max-w-md w-full">
          <ShieldCheck className="h-16 w-16 text-slate-200 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">Accès Personnel</h1>
          <p className="text-muted-foreground font-serif italic mb-8">Veuillez vous identifier pour gérer vos séances et consulter vos recommandations personnalisées.</p>
          <Button asChild className="w-full rounded-full py-7 bg-slate-950 text-white font-bold uppercase tracking-widest">
            <Link href="/login">Se Connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Bienvenue</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-primary">{user.displayName || 'Client'} João</h1>
            <p className="text-muted-foreground font-serif italic mt-2">Votre sanctuaire personnel et historique de soins.</p>
          </div>
          <Button asChild className="rounded-full px-12 py-7 bg-slate-950 text-white font-bold uppercase tracking-widest shadow-xl">
            <Link href="/booking">Réserver un soin</Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                <Clock className="text-emerald-600 h-6 w-6" /> Séances à Venir
              </h2>
              {aptLoading && <Loader2 className="animate-spin text-slate-200" />}
              {!aptLoading && upcoming.length === 0 && (
                <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                  <p className="text-slate-400 font-serif italic">Aucune séance prévue pour le moment.</p>
                </div>
              )}
              {upcoming.map((apt) => {
                const service = SERVICES.find(s => s.id === apt.serviceId);
                const aptDate = new Date(apt.startTime);
                return (
                  <Card key={apt.id} className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden mb-6 group transition-all hover:shadow-xl">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-slate-950 text-white p-10 flex flex-col justify-center items-center text-center min-w-[220px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">{format(aptDate, 'yyyy')}</span>
                        <span className="text-4xl font-serif font-bold">{format(aptDate, 'd MMM')}</span>
                        <span className="text-lg font-bold mt-2 opacity-80">{format(aptDate, 'HH:mm')}</span>
                      </div>
                      <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-serif font-bold text-slate-950">{service?.name.split(' - ')[0]}</h3>
                          <Badge className="mt-4 rounded-full px-4 py-1.5 bg-emerald-50 text-emerald-700 border-none font-bold uppercase tracking-widest text-[8px]">{apt.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-8">
                          <Button variant="outline" className="rounded-full px-6 border-slate-200 text-[9px] font-bold uppercase tracking-widest">Gérer / Déplacer</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                <History className="text-emerald-600 h-6 w-6" /> Historique de Soins
              </h2>
              <div className="space-y-4">
                {past.map((apt) => {
                  const service = SERVICES.find(s => s.id === apt.serviceId);
                  const aptDate = new Date(apt.startTime);
                  return (
                    <div key={apt.id} className="bg-white border-none shadow-sm rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:shadow-md">
                      <div className="flex items-center gap-8">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold leading-none">{format(aptDate, 'd')}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{format(aptDate, 'MMM')}</span>
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-lg">{service?.name.split(' - ')[0]}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{format(aptDate, 'PPP')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <p className="font-bold text-lg">CHF {service?.price || 0}</p>
                        <Button variant="ghost" className="rounded-full px-6 py-2 bg-slate-50 hover:bg-slate-950 hover:text-white transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Download size={12} /> Facture PDF
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
             <Card className="rounded-[3rem] border-none shadow-xl bg-slate-950 text-white p-10 relative overflow-hidden">
                <Sparkles className="h-12 w-12 text-amber-500 mb-8" />
                <h3 className="text-2xl font-serif font-bold mb-6">Bon à savoir !</h3>
                <div className="space-y-6 text-sm font-serif italic text-white/70 leading-relaxed">
                  <p>Suite à vos récents soins, voici vos conseils personnalisés :</p>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      Hydratez-vous abondamment avec des infusions tièdes aujourd'hui.
                    </li>
                    <li className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      Évitez les efforts physiques intenses durant les prochaines 48h.
                    </li>
                    <li className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      Un bain tiède au sel d'Epsom ce soir prolongera les bienfaits.
                    </li>
                  </ul>
                  <p className="pt-8 border-t border-white/10 opacity-40 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">Accompagnement IA Serenity</p>
                </div>
             </Card>

             <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 text-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Programme Fidélité</h3>
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`h-4 w-4 rounded-full border transition-all ${i < (past.length % 11) ? 'bg-amber-400 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-transparent border-slate-100'}`} />
                  ))}
                  <div className="h-4 w-4 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-amber-500" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-serif italic">Plus que {10 - (past.length % 11)} séances avant votre massage offert !</p>
             </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
