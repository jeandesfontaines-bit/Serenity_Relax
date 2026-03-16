import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';
import { Users, Calendar, FileText, LayoutDashboard, Clock, BadgeEuro, TrendingUp, Settings, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TherapistDashboard() {
  const appointments = [
    { time: '09:00', client: 'Jean Dupont', service: 'Massage Signature', status: 'confirmed', note: 'Persistent lower back pain' },
    { time: '10:30', client: 'Marie Lambert', service: 'Draineur Lymphatique', status: 'next', note: 'Post-flight recovery' },
    { time: '13:00', client: 'Lucas Steiner', service: 'Massage Sportif', status: 'pending', note: 'Marathon prep' },
    { time: '16:00', client: 'Sophie Martin', service: 'Réflexologie', status: 'pending', note: 'Stress relief' },
  ];

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
                  <p className="text-4xl font-headline font-bold">CHF 480.00</p>
                  <p className="text-xs mt-2 opacity-60">+12% from yesterday</p>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-none shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Monthly Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-headline font-bold">CHF 8,400</p>
                    <span className="text-sm font-bold text-primary">70%</span>
                  </div>
                  <Progress value={70} className="h-2 bg-primary/10" />
                </CardContent>
              </Card>
               <Card className="rounded-3xl border-none shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Invoice Status</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-headline font-bold text-green-600">Paid: 12</p>
                    <p className="text-2xl font-headline font-bold text-amber-500">Pending: 3</p>
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
                      {appointments.map((apt, idx) => (
                        <div key={idx} className={`flex p-6 hover:bg-muted/50 transition-colors relative ${apt.status === 'next' ? 'bg-secondary/5' : ''}`}>
                          {apt.status === 'next' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />}
                          <div className="w-20 pt-1">
                            <span className="text-lg font-bold text-primary">{apt.time}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-headline font-bold text-xl">{apt.client}</h4>
                                <p className="text-sm text-muted-foreground">{apt.service}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {apt.status === 'next' && (
                                  <span className="bg-secondary text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Next Up</span>
                                )}
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-primary/10">
                              <p className="text-xs italic text-muted-foreground">"{apt.note}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                          <p className="text-sm font-medium">Invoice #INV-2024-001 paid</p>
                          <p className="text-xs text-muted-foreground">20 mins ago</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">+</div>
                        <div>
                          <p className="text-sm font-medium">New booking: Sophie Martin</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
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
