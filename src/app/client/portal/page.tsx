"use client";

import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, Sparkles, Clock, History, Loader2 } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { SERVICES } from '@/lib/types';
import Link from 'next/link';

export default function ClientPortal() {
  const { firestore } = useFirestore();
  const { user, isUserLoading } = useUser();

  // Fetch appointments for this client
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'appointments'),
      where('clientId', '==', user.uid),
      orderBy('startTime', 'desc')
    );
  }, [firestore, user]);

  const { data: appointments, isLoading: aptLoading } = useCollection(appointmentsQuery);

  // Split into upcoming and past
  const now = new Date();
  const upcoming = appointments?.filter(apt => isAfter(new Date(apt.startTime), now)) || [];
  const past = appointments?.filter(apt => !isAfter(new Date(apt.startTime), now)) || [];

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F2] p-8 text-center">
        <h1 className="text-3xl font-headline font-bold mb-4">Access Your Sanctuary</h1>
        <p className="text-muted-foreground mb-8">Please log in to view your journey and manage your wellness sessions.</p>
        <Button asChild className="rounded-full px-8 bg-primary text-white">
          <Link href="/login">Log In to Portal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-headline font-bold text-primary mb-2">Welcome Back, {user.displayName || 'Friend'}</h1>
            <p className="text-muted-foreground">Your personal wellness sanctuary and session history.</p>
          </div>
          <Button asChild className="rounded-full px-8 bg-secondary text-primary hover:bg-secondary/90 font-bold">
            <Link href="/booking">Book Next Session</Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Upcoming Section */}
            <section>
              <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
                <Clock className="text-primary h-6 w-6" /> Upcoming Journey
              </h2>
              {aptLoading && <Loader2 className="animate-spin text-primary" />}
              {!aptLoading && upcoming.length === 0 && (
                <Card className="p-8 text-center border-dashed rounded-3xl bg-white">
                  <p className="text-muted-foreground italic">No upcoming sessions scheduled.</p>
                </Card>
              )}
              {upcoming.map((apt) => {
                const service = SERVICES.find(s => s.id === apt.serviceId);
                const aptDate = new Date(apt.startTime);
                return (
                  <Card key={apt.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden mb-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-primary text-white p-8 flex flex-col justify-center items-center text-center min-w-[200px]">
                        <span className="text-sm font-bold uppercase tracking-widest opacity-80">{format(aptDate, 'yyyy')}</span>
                        <span className="text-4xl font-headline font-bold">{format(aptDate, 'MMM d')}</span>
                        <span className="text-xl font-bold mt-2">{format(aptDate, 'HH:mm')}</span>
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-headline font-bold text-primary">{service?.name || 'Session'}</h3>
                            <Badge variant="secondary" className="mt-2 rounded-full px-3 uppercase text-[10px] tracking-widest font-bold">{apt.status}</Badge>
                          </div>
                          <p className="text-2xl font-headline font-bold">CHF {service?.price || 0}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-8">
                          <Button variant="outline" className="rounded-full border-primary/20">Reschedule</Button>
                          <Button variant="ghost" className="rounded-full text-destructive hover:bg-destructive/10">Cancel Session</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </section>

            {/* History Section */}
            <section>
              <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
                <History className="text-primary h-6 w-6" /> Past Sessions
              </h2>
              <div className="space-y-4">
                {past.map((apt) => {
                  const service = SERVICES.find(s => s.id === apt.serviceId);
                  const aptDate = new Date(apt.startTime);
                  return (
                    <Card key={apt.id} className="border-none shadow-sm rounded-3xl bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold">
                          {format(aptDate, 'MMM')}
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-lg">{service?.name || 'Session'}</h4>
                          <p className="text-xs text-muted-foreground">{format(aptDate, 'PPP')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <p className="font-bold">CHF {service?.price || 0}</p>
                        <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2">
                          <Download className="h-4 w-4" /> Invoice
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
             {/* AI Tips Card */}
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-white p-8">
                <Sparkles className="h-10 w-10 text-secondary mb-6" />
                <h3 className="text-2xl font-headline font-bold mb-4">Bon à savoir!</h3>
                <div className="space-y-4 text-sm opacity-80 leading-relaxed">
                  <p>Based on your session history, here is your personalized guidance:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Hydrate abundantly with warm herbal teas today.</li>
                    <li>Avoid heavy lifting for the next 48 hours.</li>
                    <li>Try a 10-min Epsom salt bath tonight to prolong muscle relaxation.</li>
                  </ul>
                  <p className="italic mt-6 pt-4 border-t border-white/10">Tailored by Serenity Relax AI</p>
                </div>
             </Card>

             {/* Loyalty Status */}
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center">
                <h3 className="text-xl font-headline font-bold text-primary mb-6">Loyalty Program</h3>
                <div className="flex justify-center flex-wrap gap-2 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className={`h-6 w-6 rounded-full border ${i <= (past.length % 11) ? 'bg-primary border-primary' : 'bg-transparent border-muted'}`} />
                  ))}
                  <div className="h-6 w-6 rounded-full border border-secondary bg-secondary/10 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-secondary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{10 - (past.length % 11)} sessions until your free session!</p>
             </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
