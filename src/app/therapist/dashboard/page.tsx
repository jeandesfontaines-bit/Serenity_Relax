"use client";

import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';
import { Users, Calendar, FileText, LayoutDashboard, Clock, BadgeEuro, TrendingUp, Settings, MoreHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { SERVICES } from '@/lib/types';

export default function TherapistDashboard() {
  const { firestore } = useFirestore();

  // Fetch today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'appointments'),
      where('startTime', '>=', `${today}T00:00:00`),
      where('startTime', '<=', `${today}T23:59:59`),
      orderBy('startTime', 'asc')
    );
  }, [firestore, today]);

  const { data: appointments, isLoading: aptLoading } = useCollection(appointmentsQuery);

  // Fetch all invoices for metrics
  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'invoices');
  }, [firestore]);

  const { data: invoices } = useCollection(invoicesQuery);

  // Calculate metrics
  const todayRevenue = invoices
    ?.filter(inv => inv.issueDate.startsWith(today) && inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0) || 0;

  const monthlyRevenue = invoices
    ?.filter(inv => inv.issueDate.startsWith(format(new Date(), 'yyyy-MM')))
    .reduce((sum, inv) => sum + inv.totalAmount, 0) || 0;

  const paidCount = invoices?.filter(inv => inv.status === 'Paid').length || 0;
  const pendingCount = invoices?.filter(inv => inv.status === 'Pending').length || 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F7F7F2]">
        <Sidebar className="border-r border-primary/10">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-2 rounded-xl">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-sm font-body font-bold text-primary uppercase tracking-widest">SERENITY RELAX</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive asChild>
                  <Link href="/therapist/dashboard">
                    <Calendar className="h-4 w-4" /> Dashboard
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
                    <FileText className="h-4 w-4" /> Invoicing
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <TrendingUp className="h-4 w-4" /> Reports
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" /> Availability
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-8 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-headline font-bold text-primary">Daily Pulse</h1>
            </div>
            <div className="flex items-center gap-6">
              <WeatherWidget />
              <div className="flex items-center gap-3 border-l pl-6">
                <div className="text-right">
                  <p className="text-sm font-bold">Admin Therapist</p>
                  <p className="text-xs text-muted-foreground">Geneva Practice</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">AT</div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl border-none shadow-sm bg-primary text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest">Today's Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-headline font-bold">CHF {todayRevenue.toFixed(2)}</p>
                  <p className="text-xs mt-2 opacity-60">Real-time update</p>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-none shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Monthly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-headline font-bold">CHF {monthlyRevenue.toFixed(0)}</p>
                    <span className="text-sm font-bold text-primary">{Math.min(100, Math.round((monthlyRevenue / 10000) * 100))}%</span>
                  </div>
                  <Progress value={(monthlyRevenue / 10000) * 100} className="h-2 bg-primary/10" />
                </CardContent>
              </Card>
               <Card className="rounded-3xl border-none shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Invoice Status</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-headline font-bold text-green-600">Paid: {paidCount}</p>
                    <p className="text-2xl font-headline font-bold text-amber-500">Pending: {pendingCount}</p>
                  </div>
                  <BadgeEuro className="h-12 w-12 text-muted-foreground/20" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="border-b bg-primary/5 p-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="text-primary h-5 w-5" />
                      <CardTitle className="text-xl font-headline font-bold">Today's Schedule</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">Manage Calendar</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {aptLoading && <div className="p-12 text-center text-muted-foreground">Loading appointments...</div>}
                      {!aptLoading && appointments?.length === 0 && <div className="p-12 text-center text-muted-foreground italic">No appointments scheduled for today.</div>}
                      {appointments?.map((apt, idx) => {
                        const service = SERVICES.find(s => s.id === apt.serviceId);
                        const isNext = idx === 0; // Simple indicator for demo
                        return (
                          <div key={apt.id} className={`flex p-6 hover:bg-muted/50 transition-colors relative ${isNext ? 'bg-secondary/5' : ''}`}>
                            {isNext && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />}
                            <div className="w-20 pt-1">
                              <span className="text-lg font-bold text-primary">{apt.startTime.split('T')[1].substring(0, 5)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-headline font-bold text-xl">{apt.clientId.includes('anonymous') ? 'Guest Client' : 'Registered Client'}</h4>
                                  <p className="text-sm text-muted-foreground">{service?.name || 'Unknown Service'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isNext && (
                                    <span className="bg-secondary text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Next Up</span>
                                  )}
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </div>
                              </div>
                              <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-primary/10">
                                <p className="text-xs italic text-muted-foreground">"{apt.clientMessage || 'No specific notes'}"</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
                   <CardHeader className="bg-secondary/10 p-6">
                    <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Recent Activity
                    </CardTitle>
                   </CardHeader>
                   <CardContent className="p-6 space-y-6">
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">✓</div>
                        <div>
                          <p className="text-sm font-medium">Invoice generated</p>
                          <p className="text-xs text-muted-foreground">Just now</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">+</div>
                        <div>
                          <p className="text-sm font-medium">New booking received</p>
                          <p className="text-xs text-muted-foreground">Today</p>
                        </div>
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
