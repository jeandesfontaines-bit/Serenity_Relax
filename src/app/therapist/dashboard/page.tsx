"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SERVICES } from '@/lib/types';
import { 
  Users, 
  Calendar, 
  FileText, 
  LayoutDashboard, 
  Clock, 
  TrendingUp, 
  MoreHorizontal, 
  Search, 
  CloudSun 
} from 'lucide-react';

export default function TherapistDashboard() {
  const { firestore } = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentDateFormatted(format(new Date(), 'EEEE d MMMM', { locale: fr }));
  }, []);

  const todayDate = format(new Date(), 'yyyy-MM-dd');

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'appointments'),
      where('startTime', '>=', `${todayDate}T00:00:00`),
      where('startTime', '<=', `${todayDate}T23:59:59`),
      orderBy('startTime', 'asc')
    );
  }, [firestore, todayDate]);

  const { data: appointments, isLoading: aptLoading } = useCollection(appointmentsQuery);

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'invoices');
  }, [firestore]);

  const { data: invoices } = useCollection(invoicesQuery);

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const { data: clients } = useCollection(clientsQuery);

  const earnedToday = invoices?.filter(i => i.issueDate.startsWith(todayDate) && i.status === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyRevenue = invoices?.filter(i => i.issueDate.startsWith(currentMonth) && i.status === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const monthlyGoal = 10000;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F7F7F2]">
        <Sidebar className="border-r border-primary/10">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {['#FACC15', '#A78BFA', '#34D399'].map((c, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full border border-white" style={{backgroundColor: c}}></div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">SERENITY RELAX</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive asChild>
                  <Link href="/therapist/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Daily Pulse
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/therapist/clients">
                    <Users className="h-4 w-4" /> Client Dossier
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/therapist/invoices">
                    <FileText className="h-4 w-4" /> Swiss Invoicing
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-20 flex items-center justify-between px-8 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-serif font-bold text-primary">Daily Pulse</h1>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Gestionnaire Serenity Relax</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <CloudSun size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cointrin: 14°C • Ensoleillé</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold">Admin João</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">RCC: Z123456</p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-[10px] font-bold">AJ</div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Column */}
              <div className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-950 text-white p-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">Gagné Aujourd'hui</p>
                  <p className="text-4xl font-serif font-bold">CHF {earnedToday.toFixed(2)}</p>
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-2">
                      <span>Objectif Mensuel</span>
                      <span>{Math.round((monthlyRevenue / monthlyGoal) * 100)}%</span>
                    </div>
                    <Progress value={(monthlyRevenue / monthlyGoal) * 100} className="h-1.5 bg-white/10" />
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Dossiers Récents</h3>
                    <Search className="h-3 w-3 text-slate-300" />
                  </div>
                  <div className="space-y-4">
                    {clients?.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-bold group-hover:bg-white">{c.firstName[0]}{c.lastName[0]}</div>
                          <div>
                            <p className="text-xs font-bold">{c.firstName} {c.lastName}</p>
                            <p className="text-[9px] text-slate-400">Fidélité {c.loyaltySessionsCompleted % 11}/10</p>
                          </div>
                        </div>
                        <TrendingUp size={12} className="text-slate-200 group-hover:text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Timeline Column */}
              <div className="lg:col-span-2">
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden min-h-[600px]">
                  <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="text-emerald-600 h-5 w-5" />
                      <CardTitle className="text-xl font-serif font-bold">Timeline du Jour</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-xs font-bold">
                        {mounted ? currentDateFormatted : '...'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative p-8 space-y-12">
                      <div className="absolute left-[43px] top-8 bottom-8 w-px bg-slate-100" />
                      
                      {aptLoading && <div className="text-center py-20 font-serif italic text-slate-400">Synchronisation des rendez-vous...</div>}
                      {!aptLoading && appointments?.length === 0 && (
                        <div className="text-center py-20 font-serif italic text-slate-400">Aucun rendez-vous aujourd'hui. Profitez de ce calme.</div>
                      )}
                      
                      {appointments?.map((appt, idx) => {
                        const service = SERVICES.find(s => s.id === appt.serviceId);
                        const isNext = idx === 0;
                        return (
                          <div key={appt.id} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 bg-white z-10 transition-colors ${isNext ? 'border-emerald-500' : 'border-slate-200'}`} />
                            <div className={`p-6 rounded-[2rem] border transition-all ${isNext ? 'bg-emerald-50/30 border-emerald-100 shadow-lg' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}>
                              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                <div className="flex items-center gap-6">
                                  <div className="text-center min-w-[60px]">
                                    <p className="text-xl font-bold leading-none">{appt.startTime.split('T')[1].substring(0, 5)}</p>
                                    <p className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter mt-1">{service?.duration}</p>
                                  </div>
                                  <div className="h-12 w-px bg-slate-200" />
                                  <div>
                                    <p className="text-lg font-serif font-bold">Séance avec {appt.clientId.length > 15 ? 'Client Serenity' : appt.clientId}</p>
                                    <p className="text-[10px] text-slate-400 font-serif italic">{service?.name.split(' - ')[0]}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {isNext && <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full animate-pulse">En cours / Prochain</span>}
                                  <button className="rounded-full p-2 hover:bg-slate-200 transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
