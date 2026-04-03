
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, FileCheck, Filter, ArrowUpRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Navbar } from '@/components/navbar';

export default function InvoicingManagement() {
  const { firestore } = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [currentPeriodFormatted, setCurrentPeriodFormatted] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentPeriodFormatted(format(new Date(), 'MMMM yyyy', { locale: fr }));
  }, []);

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'invoices');
  }, [firestore]);

  const { data: invoices, isLoading } = useCollection(invoicesQuery);

  const unpaidTotal = invoices?.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const currentMonth = format(new Date(), 'yyyy-MM');
  const paidMonth = invoices?.filter(i => i.status === 'Paid' && i.issueDate.startsWith(currentMonth)).reduce((sum, i) => sum + i.totalAmount, 0) || 0;

  const toggleStatus = (id: string, current: string) => {
    if (!firestore) return;
    const nextStatus = current === 'Paid' ? 'Pending' : 'Paid';
    updateDocumentNonBlocking(doc(firestore, 'invoices', id), { status: nextStatus });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F7F7F2] pt-24">
      <Navbar />
      <main className="p-10 space-y-10 max-w-7xl mx-auto w-full">
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400 block mb-2">COMPTABILITÉ PRIVEÉ</span>
            <h1 className="text-4xl font-serif font-bold text-neutral-900">Gestion Comptable</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full gap-3 text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] uppercase font-sans font-black tracking-[0.2em] px-8 py-3 border-neutral-200">
              <ArrowUpRight className="h-4 w-4" /> Export CSV
            </Button>
            <Button className="rounded-full bg-neutral-900 text-white gap-3 text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] uppercase font-sans font-black tracking-[0.2em] px-8 py-3">
              <FileCheck className="h-4 w-4" /> Traitement par Lot
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <p className="text-[10px] font-sans font-black text-neutral-400 uppercase tracking-[0.3em] mb-4">Encours Clients</p>
            <p className="text-3xl font-serif font-bold text-amber-600">CHF {unpaidTotal.toFixed(2)}</p>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <p className="text-[10px] font-sans font-black text-neutral-400 uppercase tracking-[0.3em] mb-4">Honoraires du mois</p>
            <p className="text-3xl font-serif font-bold text-emerald-600">CHF {paidMonth.toFixed(2)}</p>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <p className="text-[10px] font-sans font-black text-neutral-400 uppercase tracking-[0.3em] mb-4">Numéro RCC</p>
            <p className="text-3xl font-serif font-bold text-neutral-900">Z123.456</p>
          </Card>
           <Card className="rounded-[2.5rem] border-none shadow-sm bg-neutral-900 text-white p-10">
            <p className="text-[10px] font-sans font-black text-white/40 uppercase tracking-[0.3em] mb-4">Période Active</p>
            <p className="text-2xl font-serif font-bold capitalize">
              {mounted ? currentPeriodFormatted : '...'}
            </p>
          </Card>
        </div>

        <Card className="rounded-[4rem] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-neutral-50 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-serif font-bold text-neutral-900">Journal des Ventes</CardTitle>
            <Button variant="ghost" size="sm" className="gap-3 text-neutral-400 text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] uppercase font-sans font-black tracking-[0.3em] hover:text-neutral-900">
              <Filter className="h-4 w-4" /> Filtrer
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-neutral-50">
                  <TableHead className="pl-10 h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">N° Facture</TableHead>
                  <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Patient</TableHead>
                  <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Émission</TableHead>
                  <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Montant</TableHead>
                  <TableHead className="h-16 font-sans font-black uppercase tracking-[0.2em] text-[10px] text-neutral-400">Statut</TableHead>
                  <TableHead className="pr-10 h-16 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={6} className="text-center p-20 italic font-serif text-xl text-neutral-200">Accès au grand livre...</TableCell></TableRow>}
                {!isLoading && invoices?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center p-20 italic font-serif text-xl text-neutral-200">Aucune activité enregistrée.</TableCell></TableRow>}
                {invoices?.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-neutral-50 transition-colors">
                    <TableCell className="pl-10 font-sans text-[10px] font-black tracking-widest text-neutral-300">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-serif font-bold text-2xl text-neutral-900 py-6">{inv.clientNameSnapshot}</TableCell>
                    <TableCell className="text-sm font-sans text-neutral-400">{format(new Date(inv.issueDate), 'PPP', { locale: fr })}</TableCell>
                    <TableCell className="font-serif font-bold text-xl text-neutral-900">CHF {inv.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        onClick={() => toggleStatus(inv.id, inv.status)}
                        className={`rounded-full px-5 py-2 uppercase text-[9px] font-sans font-black tracking-[0.2em] cursor-pointer transition-all ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'}`}
                      >
                        {inv.status === 'Paid' ? 'Reglée' : 'En Attente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <Button variant="ghost" className="rounded-full h-12 w-12 hover:bg-neutral-900 hover:text-white transition-all duration-500">
                        <Download className="h-5 w-5" />
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
