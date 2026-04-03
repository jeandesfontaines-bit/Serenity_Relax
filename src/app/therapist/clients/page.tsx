
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, ShieldCheck, ArrowRight, Users } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Navbar } from '@/components/navbar';

export default function ClientsCRM() {
  const { firestore } = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const { data: clients, isLoading } = useCollection(clientsQuery);

  return (
    <div className="flex min-h-screen w-full bg-[#F7F7F2] pt-24">
      <Navbar />
      <main className="p-10 space-y-10 max-w-7xl mx-auto w-full">
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400 block mb-2">GESTION PATIENTS</span>
            <h1 className="text-4xl font-serif font-bold text-neutral-900">Base Patients</h1>
          </div>
          <Button className="rounded-full bg-neutral-900 text-white px-8 py-3 text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-sans font-black uppercase tracking-[0.2em] gap-3">
            <Plus className="h-4 w-4" /> Nouveau Patient
          </Button>
        </header>

        <Card className="rounded-[4rem] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-neutral-50 flex flex-row items-center justify-between gap-10">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-200" />
              <Input placeholder="Rechercher par nom, email..." className="pl-16 rounded-full bg-neutral-50 border-none h-14 font-serif italic text-lg text-neutral-900 placeholder:text-neutral-200" />
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
    </div>
  );
}
