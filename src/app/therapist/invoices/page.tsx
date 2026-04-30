"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, FileCheck, Filter, ArrowUpRight, Search, MoreHorizontal } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Navbar } from '@/components/Navbar';

export default function InvoicingManagement() {
  const firestore = useFirestore();
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

  const [selectedInv, setSelectedInv] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editStatus, setEditStatus] = useState('');

  const handleEdit = (inv: any) => {
    setSelectedInv(inv);
    setEditName(inv.clientNameSnapshot);
    setEditAmount(inv.totalAmount);
    setEditStatus(inv.status);
    setIsEditing(true);
  };

  const saveInvoice = async () => {
    if (!selectedInv || !firestore) return;
    try {
      await updateDocumentNonBlocking(doc(firestore, 'invoices', selectedInv.id), {
        clientNameSnapshot: editName,
        totalAmount: Number(editAmount),
        status: editStatus
      });
      setIsEditing(false);
      setSelectedInv(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white selection:bg-zinc-100">
      <Navbar />
      
      <main className="pt-40 pb-20 px-8 md:px-16 max-w-[1440px] mx-auto space-y-24">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-zinc-200" />
              <span className="font-display uppercase tracking-[0.3em] text-[10px] md:text-xs text-zinc-400">Comptabilité Privée</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-zinc-900 tracking-tighter">Gestion des Flux</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="group px-8 py-4 bg-white border border-zinc-200 text-zinc-900 font-display uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-3 hover:bg-zinc-50 transition-all">
              <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Export CSV
            </button>
            <button className="px-8 py-4 bg-zinc-900 text-white font-display uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
              <FileCheck size={14} />
              Traitement Lot
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5 bg-zinc-200 border border-zinc-200 shadow-sm">
          {[
            { label: 'Encours Clients', value: `CHF ${unpaidTotal.toFixed(2)}`, color: 'text-zinc-900' },
            { label: 'Honoraires du mois', value: `CHF ${paidMonth.toFixed(2)}`, color: 'text-zinc-900' },
            { label: 'Numéro RCC', value: 'Z123.456', color: 'text-zinc-900' },
            { label: 'Période Active', value: mounted ? currentPeriodFormatted : '...', color: 'text-zinc-500', bg: 'bg-white' },
          ].map((stat, i) => (
            <div key={i} className={`p-10 ${stat.bg || 'bg-white'} flex flex-col justify-between min-h-[180px] group transition-all duration-500`}>
              <span className="font-display uppercase tracking-[0.3em] text-[9px] md:text-[10px] text-zinc-400">{stat.label}</span>
              <p className={`text-4xl font-serif font-light tracking-tight ${stat.color} capitalize`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="p-10 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-serif font-light text-zinc-900">Journal des Ventes</h2>
            <div className="flex items-center gap-6">
               <div className="relative hidden md:block">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                <input 
                  type="text" 
                  placeholder="RECHERCHER..." 
                  className="pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-100 font-display uppercase tracking-[0.2em] text-[10px] text-zinc-900 focus:outline-none focus:border-zinc-300 w-80 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 font-display uppercase tracking-[0.2em] text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors">
                <Filter size={14} />
                Filtrer
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                  <TableHead className="pl-10 py-8 font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">N° Facture</TableHead>
                  <TableHead className="py-8 font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">Patient</TableHead>
                  <TableHead className="py-8 font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">Émission</TableHead>
                  <TableHead className="py-8 font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">Montant</TableHead>
                  <TableHead className="py-8 font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">Statut</TableHead>
                  <TableHead className="pr-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-32 font-serif text-zinc-300 italic text-2xl">Ouverture du registre...</TableCell></TableRow>
                ) : invoices?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-32 font-serif text-zinc-300 italic text-2xl">Aucune écriture comptable.</TableCell></TableRow>
                ) : invoices?.map((inv) => (
                  <TableRow key={inv.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group">
                    <TableCell className="pl-10 font-display text-[10px] tracking-[0.2em] text-zinc-400">#{inv.invoiceNumber}</TableCell>
                    <TableCell className="py-8">
                      <p className="font-serif text-2xl font-light text-zinc-900">{inv.clientNameSnapshot}</p>
                      <span className="font-display text-[9px] text-zinc-400 uppercase tracking-[0.3em]">Dossier Holistique</span>
                    </TableCell>
                    <TableCell className="font-display text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
                      {format(new Date(inv.issueDate), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="font-serif text-xl text-zinc-900">
                      {inv.totalAmount.toFixed(2)} <span className="text-xs opacity-20 ml-1">CHF</span>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleStatus(inv.id, inv.status)}
                        className={`px-5 py-2 font-display uppercase tracking-[0.2em] text-[9px] border transition-all ${
                          inv.status === 'Paid' 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                            : 'bg-zinc-900 border-zinc-900 text-white'
                        }`}
                      >
                        {inv.status === 'Paid' ? 'Reglée' : 'En Attente'}
                      </button>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/therapist/invoice/${inv.id}`}>
                          <button className="p-4 bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm">
                            <FileText size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleEdit(inv)}
                          className="px-6 py-2 font-display uppercase tracking-[0.2em] text-[10px] text-zinc-300 hover:text-zinc-900 transition-colors"
                        >
                          Détails
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl border border-zinc-200 animate-in fade-in zoom-in duration-500 shadow-2xl">
              <div className="p-12 space-y-12">
                <header className="flex items-center justify-between border-b border-zinc-100 pb-8">
                  <h3 className="text-4xl font-serif font-light text-zinc-900 tracking-tight">Rectification</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-300 hover:text-zinc-900 transition-colors">
                    <X size={28} />
                  </button>
                </header>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="font-display text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Patient</label>
                    <input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-8 py-5 bg-zinc-50 border-none text-xl font-serif text-zinc-900 focus:ring-1 focus:ring-zinc-200 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="font-display text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Montant (CHF)</label>
                      <input 
                        type="number"
                        value={editAmount}
                        onChange={e => setEditAmount(Number(e.target.value))}
                        className="w-full px-8 py-5 bg-zinc-50 border-none text-xl font-serif text-zinc-900 focus:ring-1 focus:ring-zinc-200 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="font-display text-[10px] text-zinc-400 uppercase tracking-[0.3em]">État</label>
                      <select 
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="w-full px-8 py-5 bg-zinc-50 border-none font-display uppercase tracking-[0.2em] text-[10px] text-zinc-900 focus:ring-1 focus:ring-zinc-200 outline-none appearance-none transition-all"
                      >
                        <option value="Pending">En Attente</option>
                        <option value="Paid">Reglée</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 pt-6 border-t border-zinc-100">
                  <button 
                    className="flex-1 py-5 font-display uppercase tracking-[0.2em] text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    className="flex-1 py-5 bg-zinc-900 text-white font-display uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all"
                    onClick={saveInvoice}
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const X = ({ className, size = 24, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);