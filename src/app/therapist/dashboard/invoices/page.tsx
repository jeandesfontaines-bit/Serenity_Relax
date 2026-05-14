'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Send, Search, CreditCard, Banknote, Smartphone, ChevronRight, CheckCircle2, AlertCircle, Clock, FileText, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [invoices, setInvoices] = useState([
    { id: 'INV-20260413-001', client: 'Marie Dupont', date: '2026-04-13', amount: 180, status: 'paid', paymentMethod: 'Twint' },
    { id: 'INV-20260410-002', client: 'Thomas Martin', date: '2026-04-10', amount: 150, status: 'pending', paymentMethod: null },
    { id: 'INV-20260328-003', client: 'Sophie Laurent', date: '2026-03-28', amount: 160, status: 'paid', paymentMethod: 'Card' },
  ]);

  const generatePDF = (invoice: any) => {
    try {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(95, 39, 205); 
        doc.text('SERENITY RELAX THERAPY', 20, 30);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Excellence Thérapeutique • Genève Cointrin', 20, 38);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(20, 45, 190, 45);
        
        doc.setTextColor(34, 47, 62);
        doc.setFontSize(12);
        doc.text(`Facture N° : ${invoice.id}`, 20, 55);
        doc.text(`Date d'Émission : ${invoice.date}`, 20, 62);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('DESTINATAIRE', 20, 80);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(invoice.client, 20, 88);
        
        doc.setFillColor(248, 245, 240);
        doc.rect(20, 100, 170, 40, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.text('DÉSIGNATION', 30, 112);
        doc.text('MONTANT (CHF)', 140, 112);
        
        doc.setFont("helvetica", "normal");
        doc.text('Séance de Soin Thérapeutique (90min)', 30, 125);
        doc.text(`${invoice.amount}.00`, 154, 125);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(95, 39, 205);
        doc.text(`TOTAL À RÉGLER : ${invoice.amount} CHF`, 20, 170);
        
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Merci pour votre confiance. Agrément ASCA/RME.', 20, 280);
        
        doc.save(`facture-${invoice.id}.pdf`);
    } catch (e) {
        console.error("PDF Fail:", e);
    }
  };

  const resendEmail = (invoice: any) => {
    alert(`📧 Email de confirmation renvoyé à ${invoice.client}`);
  };

  const markAsPaid = (invoiceId: string, method: string) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid', paymentMethod: method }
          : inv
      )
    );
    setExpandedId(null);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* ── HEADER IMPACT LUXE ── */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 p-12 rounded-2xl border shadow-sm relative overflow-hidden"
                  style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}><FileText size={20} /></div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.4em]" style={{ color: 'hsl(var(--primary))' }}>Gestion Administrative</p>
              </div>
              <h1 className="title-luxe text-2xl md:text-3xl leading-none" style={{ color: 'hsl(var(--foreground))' }}>Invoices <br/><span className="font-sans opacity-40">Archive.</span></h1>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 relative z-10">
              <div className="relative group flex-1 md:min-w-[320px]">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 transition-colors" size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
                  <input 
                    type="text" 
                    placeholder="Rechercher une facture..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-16 rounded-full pl-16 pr-8 text-lg focus:outline-none transition-all shadow-sm border"
                    style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
              </div>
            </div>
          </header>

          {/* ── INVOICE LEDGER ── */}
          <div className="p-6 rounded-2xl border shadow-sm overflow-hidden" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                    <th className="px-6 py-6 text-[0.65rem] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>Identifiant</th>
                    <th className="px-6 py-6 text-[0.65rem] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>Destinataire</th>
                    <th className="px-6 py-6 text-[0.65rem] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>Émission</th>
                    <th className="px-6 py-6 text-[0.65rem] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>Montant</th>
                    <th className="px-6 py-6 text-[0.65rem] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>Statut</th>
                    <th className="px-6 py-6 text-[0.65rem] font-bold uppercase tracking-widest text-right" style={{ color: 'hsl(var(--muted-foreground))' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
                  {filteredInvoices.map((inv, i) => (
                    <motion.tr 
                      key={inv.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-[#F8F5F0]/50 transition-colors"
                    >
                    <td className="px-6 py-8 font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{inv.id}</td>
                      <td className="px-6 py-8 font-sans font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>{inv.client}</td>
                      <td className="px-6 py-8 text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{inv.date}</td>
                      <td className="px-6 py-8">
                        <span className="text-2xl font-light" style={{ color: 'hsl(var(--foreground))' }}>{inv.amount} <small className="text-[10px] opacity-30 font-bold">CHF</small></span>
                      </td>
                      <td className="px-6 py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {inv.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {inv.status === 'paid' ? 'Réglé' : 'En Attente'}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-right space-x-3">
                        <button 
                          onClick={() => generatePDF(inv)}
                          className="p-3 rounded-xl transition-all shadow-sm border"
                          style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--primary))'; e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => resendEmail(inv)}
                          className="p-3 rounded-xl transition-all shadow-sm border"
                          style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--primary))'; e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                        >
                          <Send size={20} />
                        </button>
                        <button className="p-3 transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--primary))'}
                                onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
