
"use client";

import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, FileText, LayoutDashboard, Search, Plus, MoreHorizontal, ShieldCheck, ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function ClientsCRM() {
  const { firestore } = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const { data: clients, isLoading } = useCollection(clientsQuery);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F7F7F2]">
        <Sidebar className="border-r border-neutral-100 bg-white">
          <SidebarHeader className="p-8">
            <Link href="/" className="flex flex-col items-start group">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">SERENITY RELAX</span>
              <span className="font-cursive text-xl text-neutral-400 normal-case -mt-1 group-hover:text-neutral-900 transition-colors">by João</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-6">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-full h-12 px-6 hover:bg-neutral-50">
                  <Link href="/therapist/dashboard" className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-neutral-400">
                    <LayoutGrid className="h-4 w-4" /> Accueil
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive asChild className="rounded-full h-12 px-6 bg-neutral-900 text-white hover:bg-neutral-800">
                  <Link href="/therapist/clients" className="text-[10px] font-sans font-black uppercase tracking-[0.2em]">
                    <Users className="h-4 w-4" /> Dossiers Clients
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-full h-12 px-6 hover:bg-neutral-50">
                  <Link href="/therapist/invoices" className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-neutral-400">
                    <FileText className="h-4 w-4" /> Facturation
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-24 flex items-center justify-between px-10 border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="hover:bg-neutral-50 rounded-full h-10 w-10" />
              <h1 className="text-3xl font-serif font-bold text-neutral-900">Base Patients</h1>
            </div>
            <Button className="rounded-full bg-neutral-900 text-white px-8 py-3 text-[10px] font-sans font-black uppercase tracking-[0.2em] gap-3">
              <Plus className="h-4 w-4" /> Nouveau Patient
            </Button>
          </header>

          <main className="p-10 space-y-10 max-w-7xl mx-auto w-full">
            <Card className="rounded-[4rem] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-neutral-50 flex flex-row items-center justify-between gap-10">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-200" />
                  <Input placeholder="Rechercher par nom, email, assurance..." className="pl-16 rounded-full bg-neutral-50 border-none h-14 font-serif italic text-lg text-neutral-900 placeholder:text-neutral-200" />
                </div>
                <div className="hidden md:flex items-center gap-4 text-[9px] font-sans font-black text-neutral-400 uppercase tracking-[0.3em]">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> Sécurisé par Swiss Health Standard
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-neutral-50">
                      <TableHead className="pl-10 h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Identité</TableHead>
                      <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Contact</TableHead>
                      <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Assurance</TableHead>
                      <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400 text-center">Séances</TableHead>
                      <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Statut</TableHead>
                      <TableHead className="pr-10 h-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={6} className="text-center p-20 italic font-serif text-xl text-neutral-200">Consultation des archives...</TableCell></TableRow>}
                    {!isLoading && clients?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center p-20 italic font-serif text-xl text-neutral-200">Aucun dossier patient enregistré.</TableCell></TableRow>}
                    {clients?.map((client) => (
                      <TableRow key={client.id} className="hover:bg-neutral-50 transition-colors group">
                        <TableCell className="pl-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 font-serif font-bold text-lg group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
                              {client.firstName[0]}{client.lastName[0]}
                            </div>
                            <span className="font-serif font-bold text-2xl text-neutral-900">{client.firstName} {client.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-sans">
                            <p className="font-bold text-neutral-900">{client.email}</p>
                            <p className="text-neutral-400 mt-1">{client.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[9px] px-4 py-1.5 bg-neutral-50 text-neutral-600 rounded-full font-sans font-black uppercase tracking-[0.2em]">{client.insuranceFundName || 'Non Spécifiée'}</span>
                        </TableCell>
                        <TableCell className="font-serif font-bold text-2xl text-center text-neutral-900">{client.loyaltySessionsCompleted || 0}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                             <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-neutral-400">Actif</span>
                           </div>
                        </TableCell>
                        <TableCell className="pr-10 text-right">
                          <Button variant="ghost" className="rounded-full h-12 w-12 hover:bg-neutral-900 hover:text-white transition-all duration-500">
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const LayoutGrid = LayoutDashboard;
