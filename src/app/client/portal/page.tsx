import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, Sparkles, Clock, History } from 'lucide-react';

export default function ClientPortal() {
  const upcoming = [
    { date: 'Oct 24, 2024', time: '10:30', service: 'Massage Signature', price: 150, status: 'confirmed' }
  ];

  const past = [
    { date: 'Sep 12, 2024', service: 'Massage Sportif', price: 120, invoice: 'INV-2024-042' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F2] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-headline font-bold text-primary mb-2">Welcome Back, Jean</h1>
            <p className="text-muted-foreground">Your personal wellness sanctuary and session history.</p>
          </div>
          <Button className="rounded-full px-8 bg-secondary text-primary hover:bg-secondary/90 font-bold">Book Next Session</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Upcoming Section */}
            <section>
              <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
                <Clock className="text-primary h-6 w-6" /> Upcoming Journey
              </h2>
              {upcoming.map((apt, idx) => (
                <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-primary text-white p-8 flex flex-col justify-center items-center text-center min-w-[200px]">
                      <span className="text-sm font-bold uppercase tracking-widest opacity-80">{apt.date.split(',')[1]}</span>
                      <span className="text-4xl font-headline font-bold">{apt.date.split(',')[0]}</span>
                      <span className="text-xl font-bold mt-2">{apt.time}</span>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-headline font-bold text-primary">{apt.service}</h3>
                          <Badge variant="secondary" className="mt-2 rounded-full px-3 uppercase text-[10px] tracking-widest font-bold">Confirmed</Badge>
                        </div>
                        <p className="text-2xl font-headline font-bold">CHF {apt.price}</p>
                      </div>
                      <div className="flex justify-end gap-4 mt-8">
                        <Button variant="outline" className="rounded-full border-primary/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/50">Cancel Session</Button>
                        <Button variant="outline" className="rounded-full border-primary/20">Reschedule</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </section>

            {/* History Section */}
            <section>
              <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
                <History className="text-primary h-6 w-6" /> Past Sessions
              </h2>
              <div className="space-y-4">
                {past.map((apt, idx) => (
                  <Card key={idx} className="border-none shadow-sm rounded-3xl bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold">
                        {apt.date.split(' ')[0]}
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-lg">{apt.service}</h4>
                        <p className="text-xs text-muted-foreground">{apt.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="font-bold">CHF {apt.price}</p>
                      <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2">
                        <Download className="h-4 w-4" /> Invoice
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
             {/* AI Tips Card */}
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-white p-8">
                <Sparkles className="h-10 w-10 text-secondary mb-6" />
                <h3 className="text-2xl font-headline font-bold mb-4">Bon à savoir!</h3>
                <div className="space-y-4 text-sm opacity-80 leading-relaxed">
                  <p>Based on your last Signature Massage session focusing on lower back tension:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Hydrate abundantly with warm herbal teas today.</li>
                    <li>Avoid heavy lifting for the next 48 hours.</li>
                    <li>Try a 10-min Epsom salt bath tonight to prolong muscle relaxation.</li>
                  </ul>
                  <p className="italic mt-6 pt-4 border-t border-white/10">Tailored by AuraFlow AI</p>
                </div>
             </Card>

             {/* Loyalty Status */}
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center">
                <h3 className="text-xl font-headline font-bold text-primary mb-6">Loyalty Program</h3>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className={`h-6 w-6 rounded-full border ${i <= 3 ? 'bg-primary border-primary' : 'bg-transparent border-muted'}`} />
                  ))}
                  <div className="h-6 w-6 rounded-full border border-secondary bg-secondary/10 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-secondary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">7 sessions until your free session!</p>
             </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}