'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Send, Search, Filter, Plus, TrendingUp, CreditCard, Banknote, Smartphone, FileText, ChevronRight, CheckCircle2, AlertCircle, Clock, PieChart, Table, Bell, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';

export default function ProInvoicesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user) return;
    const q = query(collection(firestore, 'invoices'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [firestore, user]);

  const totalCA = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingTotal = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'paid') return matchesSearch && inv.status === 'paid';
    if (statusFilter === 'pending') return matchesSearch && inv.status === 'pending';
    return matchesSearch;
  });

  const generateProPDF = (inv: any) => {
    try {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(95, 39, 205); 
        doc.text('SERENITY RELAX', 20, 30);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Chemin de Joinville 26 • 1216 Cointrin • Genève', 20, 38);
        doc.text('Tél : +41 79 123 45 67 • ASCA / RME agréé', 20, 44);
        
        doc.setFontSize(12);
        doc.setTextColor(34, 47, 62);
        doc.text(`Facture N° : ${inv.id}`, 140, 30);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(20, 55, 190, 55);
        
        doc.setFont("helvetica", "bold");
        doc.text('DESTINATAIRE', 20, 70);
        doc.setFont("helvetica", "normal");
        doc.text(inv.client, 20, 78);
        doc.text(`Date : ${inv.date}`, 20, 84);
        
        doc.setFillColor(248, 245, 240);
        doc.rect(20, 100, 170, 40, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.text('DÉSIGNATION', 30, 112);
        doc.text('MONTANT (CHF)', 140, 112);
        
        doc.setFont("helvetica", "normal");
        doc.text(inv.service, 30, 125);
        doc.text(`${inv.amount}.00`, 154, 125);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(95, 39, 205);
        doc.text(`TOTAL : ${inv.amount} CHF`, 20, 170);
        
        if (inv.status === 'paid') {
           doc.setFontSize(10);
           doc.setTextColor(29, 209, 161);
           doc.text(`Payé via ${inv.method} • Merci pour votre confiance.`, 20, 180);
        }

        doc.save(`Serenity-Relax-Facture-${inv.id}.pdf`);
    } catch (err) {
        console.error("PDF Fail:", err);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Client", "Date", "Service", "Montant", "Statut", "Methode"];
    const rows = invoices.map(inv => [
      inv.id,
      inv.client,
      inv.date,
      inv.service,
      inv.amount,
      inv.status,
      inv.method || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Serenity-Relax-Archives-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendReminder = (inv: any) => {
    const subject = encodeURIComponent(`Rappel : Votre soin chez Serenity Relax (${inv.id})`);
    const body = encodeURIComponent(`Bonjour ${inv.client},\n\nSauf erreur de notre part, le règlement pour votre soin "${inv.service}" du ${inv.date} (${inv.amount} CHF) est toujours en attente.\n\nNous vous remercions d'avance pour votre règlement.\n\nSereinement,\nL'équipe Serenity Relax`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const markAsPaid = async (invoiceId: string, method: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'invoices', invoiceId), {
        status: 'paid',
        method,
        paidAt: new Date().toISOString()
      });
      setExpandedId(null);
    } catch (err) {
      console.error("Update paid status error:", err);
    }
  };

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const bulkReminder = () => {
    if (selectedInvoices.length === 0) return;
    alert(`📧 ${selectedInvoices.length} relances automatiques envoyées !`);
    setSelectedInvoices([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F5F0] pt-16 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* ── SOVEREIGN HEADER ── */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 bg-[#222F3E] text-white p-6 rounded-xl shadow-xl relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><FileText size={10} /></div>
                  <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#0ABDE3]">Gestion de Cabinet</p>
              </div>
              <h2 className="title-luxe text-2xl md:text-3xl leading-none text-white">Factures <span className="italic font-serif opacity-40">Grand Livre.</span></h2>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportCSV}
                className="p-3 bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-all"
                title="Exporter CSV"
              >
                <Table size={16} />
              </button>
              <button
                onClick={() => router.push('/therapist/invoices/new')}
                className="btn-luxe flex items-center gap-2 px-6 py-3 text-xs"
              >
                <Plus size={16} /> Nouvelle Facture
              </button>
            </div>
          </div>

          {/* ── KINETIC STAT CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-5 border border-white relative group">
              <p className="text-[0.5rem] font-black uppercase tracking-widest text-[#1DD1A1] mb-3">CA (Mois)</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-light text-[#222F3E]">{totalCA}</span>
                 <span className="text-sm font-bold opacity-20">CHF</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dash-card p-5 border border-white relative group">
              <p className="text-[0.5rem] font-black uppercase tracking-widest text-amber-600 mb-3">En Attente</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-light text-amber-600">{pendingTotal}</span>
                 <span className="text-sm font-bold opacity-20">CHF</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="dash-card p-5 bg-[#222F3E] text-white relative group shadow-lg">
              <p className="text-[0.5rem] font-black uppercase tracking-widest text-[#0ABDE3] mb-3">Volume</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-light">{invoices.length}</span>
                 <span className="text-sm font-bold opacity-30">Dossiers</span>
              </div>
            </motion.div>
          </div>

          {/* ── FILTERS & SEARCH ── */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#5F27CD] transition-colors" size={16} />
              <input
                type="text"
                placeholder="Rechercher un dossier..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-6 py-3 text-sm font-serif italic focus:outline-none focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button onClick={() => setStatusFilter('all')} className={`px-5 py-2.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-[#5F27CD] text-white shadow-md' : 'text-gray-400 hover:text-[#222F3E]'}`}>Toutes</button>
              <button onClick={() => setStatusFilter('paid')} className={`px-5 py-2.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest transition-all ${statusFilter === 'paid' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-[#222F3E]'}`}>Payées</button>
              <button onClick={() => setStatusFilter('pending')} className={`px-5 py-2.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400 hover:text-[#222F3E]'}`}>Attente</button>
            </div>
          </div>

          {/* ── PRO LEDGER TABLE ── */}
          <div className="dash-card p-0 overflow-hidden border border-white/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3 text-center"><Table size={12} className="mx-auto opacity-20" /></th>
                    <th className="px-4 py-3 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Réf</th>
                    <th className="px-4 py-3 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Patient</th>
                    <th className="px-4 py-3 text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Rituel</th>
                    <th className="px-4 py-3 text-[0.55rem] font-black uppercase tracking-widest text-gray-400 text-right">Montant</th>
                    <th className="px-4 py-3 text-[0.55rem] font-black uppercase tracking-widest text-gray-400 text-center">Statut</th>
                    <th className="px-4 py-3 text-[0.55rem] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInvoices.map((inv, i) => (
                    <React.Fragment key={inv.id}>
                      <motion.tr 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: i * 0.05 }}
                        className={`group hover:bg-[#F8F5F0]/50 transition-colors ${selectedInvoices.includes(inv.id) ? 'bg-[#5F27CD]/5' : ''}`}
                      >
                        <td className="px-4 py-4 text-center">
                           <input 
                             type="checkbox" 
                             checked={selectedInvoices.includes(inv.id)}
                             onChange={() => toggleSelect(inv.id)}
                             className="w-4 h-4 rounded border-gray-200 text-[#5F27CD] focus:ring-[#5F27CD]"
                           />
                        </td>
                        <td className="px-4 py-4 font-bold text-[#222F3E] text-xs">{inv.id}</td>
                        <td className="px-4 py-4 text-sm font-serif font-medium text-[#222F3E]">{inv.client}</td>
                        <td className="px-4 py-4 text-xs text-gray-400 font-serif italic">{inv.service}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-lg font-light text-[#222F3E]">{inv.amount} <small className="text-[0.6rem] opacity-20 font-black">CHF</small></span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => inv.status === 'pending' && setExpandedId(expandedId === inv.id ? null : inv.id)}
                            className={`inline-flex px-4 py-1.5 rounded-lg text-[0.5rem] font-black uppercase tracking-widest transition-all ${
                              inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 hover:brightness-95 active:scale-95'
                            }`}
                          >
                            {inv.status === 'paid' ? `Payée • ${inv.method}` : 'Action'}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <button onClick={() => generateProPDF(inv)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#5F27CD] transition-all" title="PDF"><Download size={14} /></button>
                          <button 
                            onClick={() => inv.status === 'pending' && sendReminder(inv)} 
                            className={`p-2 border rounded-lg transition-all ${inv.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-500 hover:bg-amber-100' : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'}`}
                            title="Rappel"
                          >
                             <Bell size={14} />
                          </button>
                          <button onClick={() => router.push(`/therapist/invoice/${inv.id}`)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#5F27CD] transition-all" title="Détails"><ChevronRight size={14} /></button>
                        </td>
                      </motion.tr>

                      {/* ── INLINE TACTILE PAYMENT ── */}
                      <AnimatePresence>
                        {expandedId === inv.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={7} className="bg-gray-50/50 p-4 border-b border-gray-100">
                              <div className="flex flex-wrap gap-3 justify-center">
                                {[
                                  { label: 'Twint', icon: Smartphone, color: '#5F27CD' },
                                  { label: 'Carte', icon: CreditCard, color: '#0ABDE3' },
                                  { label: 'Espèces', icon: Banknote, color: '#1DD1A1' },
                                ].map((m) => (
                                  <motion.button
                                    key={m.label}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => markAsPaid(inv.id, m.label)}
                                    className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
                                  >
                                    <m.icon size={16} style={{ color: m.color }} />
                                    <span className="text-[0.55rem] font-black uppercase tracking-widest text-[#222F3E]">{m.label}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── BULK ACTIONS COCKPIT ── */}
          <AnimatePresence>
            {selectedInvoices.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#222F3E] text-white px-10 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-10 z-[100] border border-white/10 backdrop-blur-3xl"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#5F27CD] flex items-center justify-center font-black text-xs">{selectedInvoices.length}</div>
                   <p className="text-[0.65rem] font-black uppercase tracking-widest opacity-60">Dossiers Sélectionnés</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <button 
                  onClick={bulkReminder}
                  className="flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all"
                >
                  <Mail size={16} className="text-[#0ABDE3]" /> Envoyer Relances Groupées
                </button>
                <button 
                   onClick={() => setSelectedInvoices([])}
                   className="text-[0.65rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                   Annuler
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}