
"use client";

import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Download, Sparkles, Clock, History, Loader2, Heart, Droplets, Wind, Calendar, Leaf, ShieldCheck } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SERVICES } from '@/lib/types';
import Link from 'next/link';

const WELLNESS_TIPS = [
  { id: 1, title: "Accueillez vos émotions", icon: Heart },
  { id: 2, title: "Prenez votre temps", icon: Clock },
  { id: 3, title: "Hydratez-vous", icon: Droplets },
  { id: 4, title: "Évitez la douche immédiate", icon: Sparkles },
  { id: 5, title: "Prolongez la détente", icon: Wind },
  { id: 6, title: "Planifiez un prochain soin", icon: Calendar },
  { id: 7, title: "Choisissez la douceur", icon: Leaf },
];

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

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]"><Loader2 className="animate-spin text-neutral-300" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F2] p-8 text-center">
        <Navbar />
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-neutral-100 max-w-md w-full">
          <ShieldCheck className="h-20 w-20 text-neutral-100 mx-auto mb-10" />
          <h1 className="text-4xl font-serif font-bold mb-6 text-neutral-900">Espace Privé</h1>
          <p className="text-neutral-500 mb-10 italic font-sans">Identifiez-vous pour accéder à vos rituels et recommandations.</p>
          <Button asChild className="w-full rounded-full py-4 bg-neutral-900 text-white font-sans font-black uppercase tracking-[0.3em] text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem]">
            <Link href="/login">Se Connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] pt-32 pb-32 px-6">
      <Navbar />
      <div className="max-w-7xl mx-auto space-y-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400">VOTRE SANCTUAIRE</span>
            </div>
            <h1 className="text-6xl font-serif font-bold text-neutral-900 leading-none">
              Bienvenue, <span className="text-neutral-500 italic font-light">{user.displayName?.split(' ')[0] || 'Client'}</span>
            </h1>
            <p className="text-neutral-500 mt-6 italic font-sans text-lg">Retrouvez l'historique de vos soins et vos avantages fidélité.</p>
          </div>
          <Button asChild className="rounded-full px-8 py-3 bg-neutral-900 text-white font-sans font-black uppercase tracking-[0.3em] text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] shadow-2xl shadow-neutral-900/10">
            <Link href="/">Réserver un soin</Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            <section>
              <h2 className="text-3xl font-serif font-bold mb-10 flex items-center gap-5">
                <Clock className="text-neutral-900 h-8 w-8" /> Séances à Venir
              </h2>
              {aptLoading && <Loader2 className="animate-spin text-neutral-200" />}
              {!aptLoading && upcoming.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-neutral-200 rounded-[4rem] bg-white/50">
                  <p className="text-neutral-400 italic font-serif text-xl">Aucune séance prévue pour le moment.</p>
                </div>
              )}
              {upcoming.map((apt) => {
                const service = SERVICES.find(s => s.id === apt.serviceId);
                const aptDate = new Date(apt.startTime);
                return (
                  <Card key={apt.id} className="border-none shadow-sm rounded-[4rem] bg-white overflow-hidden mb-8 group transition-all duration-700 hover:shadow-2xl">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-neutral-900 text-white p-12 flex flex-col justify-center items-center text-center min-w-[250px]">
                        <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] opacity-40 mb-3">{format(aptDate, 'yyyy')}</span>
                        <span className="text-5xl font-serif font-bold">{format(aptDate, 'd MMM', { locale: fr })}</span>
                        <span className="text-xl font-sans font-bold mt-4 opacity-80">{format(aptDate, 'HH:mm')}</span>
                      </div>
                      <div className="p-12 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-3xl font-serif font-bold text-neutral-900">{service?.name.split(' - ')[0]}</h3>
                          <Badge className="mt-6 rounded-full px-5 py-2 bg-emerald-50 text-emerald-700 border-none font-sans font-black uppercase tracking-[0.2em] text-[9px]">{apt.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-12">
                          <Button variant="outline" className="rounded-full px-8 py-3 border-neutral-200 text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-all">Gérer le rendez-vous</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </section>

            <section>
              <h2 className="text-3xl font-serif font-bold mb-10 flex items-center gap-5">
                <History className="text-neutral-900 h-8 w-8" /> Historique de Soins
              </h2>
              <div className="space-y-6">
                {past.map((apt) => {
                  const service = SERVICES.find(s => s.id === apt.serviceId);
                  const aptDate = new Date(apt.startTime);
                  return (
                    <div key={apt.id} className="bg-white border-none shadow-sm rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 transition-all duration-500 hover:shadow-xl">
                      <div className="flex items-center gap-10">
                        <div className="h-20 w-20 rounded-[2rem] bg-neutral-50 flex items-center justify-center text-neutral-900">
                          <span className="text-2xl font-serif font-bold leading-none">{format(aptDate, 'd')}</span>
                          <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] opacity-40 mt-1">{format(aptDate, 'MMM', { locale: fr })}</span>
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-2xl text-neutral-900">{service?.name.split(' - ')[0]}</h4>
                          <p className="text-[10px] font-sans font-black text-neutral-300 uppercase tracking-[0.3em] mt-2">{format(aptDate, 'PPP', { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <p className="font-serif font-bold text-2xl">CHF {service?.price || 0}</p>
                        <Button variant="ghost" className="rounded-full px-8 py-3 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.3em] flex items-center gap-3">
                          <Download size={14} /> Facture
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-12">
             <Card className="rounded-[4rem] border-none shadow-2xl bg-neutral-900 text-white p-12 relative overflow-hidden">
                <Sparkles className="h-16 w-16 text-neutral-600 mb-10" />
                <h3 className="text-3xl font-serif font-bold mb-8">Bon à savoir !</h3>
                <div className="space-y-8 text-neutral-400 leading-relaxed">
                  <p className="italic font-serif text-lg">7 rituels pour prolonger les bienfaits :</p>
                  <ul className="space-y-6">
                    {WELLNESS_TIPS.map((tip) => (
                      <li key={tip.id} className="flex gap-5 items-start">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <tip.icon className="h-4 w-4 text-white/40" />
                        </div>
                        <span className="text-sm font-sans font-medium leading-tight text-white/80">{tip.title}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-10 border-t border-white/5">
                    <p className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-white/20">ACCOMPAGNEMENT SERENITY</p>
                  </div>
                </div>
             </Card>

             <Card className="rounded-[4rem] border-none shadow-xl bg-white p-12 text-center">
                <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400 mb-10">PROGRAMME FIDÉLITÉ</h3>
                <div className="flex justify-center flex-wrap gap-3 mb-10">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`h-5 w-5 rounded-full border-2 transition-all ${i < (past.length % 11) ? 'bg-neutral-900 border-neutral-900 shadow-xl' : 'bg-transparent border-neutral-100'}`} />
                  ))}
                  <div className="h-5 w-5 rounded-full border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-neutral-300" />
                  </div>
                </div>
                <p className="text-sm font-serif italic text-neutral-500">
                  Encore {10 - (past.length % 11)} séances avant votre massage signature offert.
                </p>
             </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
