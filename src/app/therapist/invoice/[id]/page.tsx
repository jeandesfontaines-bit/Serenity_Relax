'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Send, ArrowLeft, CreditCard, Banknote, Smartphone, CheckCircle, Clock, Edit, Sparkles, User, FileText, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export default function InvoiceDetail() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState({
    id: invoiceId || 'INV-20260413-001',
    client: 'Marie Dupont',
    date: '13 avril 2026',
    amount: 180,
    status: 'pending' as 'paid' | 'pending',
    paymentMethod: null as string | null,
    service: 'Massage sensoriel 90 min',
    notes: 'Cliente très détendue après la séance. A demandé de privilégier les huiles de lavande la prochaine fois.',
  });

  const [expanded, setExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const generatePDF = () => {
    try {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(95, 39, 205); 
        doc.text('SERENITY RELAX', 20, 30);
        
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
        doc.text(invoice.service, 30, 125);
        doc.text(`${invoice.amount}.00`, 154, 125);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(95, 39, 205);
        doc.text(`TOTAL RÉGLÉ : ${invoice.amount} CHF`, 20, 170);
        
        if (invoice.status === 'paid') {
           doc.setFontSize(10);
           doc.setTextColor(29, 209, 161);
           doc.text(`Moyen de paiement : ${invoice.paymentMethod}`, 20, 180);
        }

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Agrément ASCA/RME. Merci pour votre confiance.', 20, 280);
        
        doc.save(`facture-${invoice.id}.pdf`);
    } catch (e) {
        console.error("PDF Fail:", e);
    }
  };

  const resendEmail = () => {
    alert(`📧 Email de confirmation renvoyé à ${invoice.client}`);
  };

  const markAsPaid = (method: string) => {
    setInvoice(prev => ({ ...prev, status: 'paid', paymentMethod: method }));
    setExpanded(false);
  };

  const saveNotes = () => {
    setIsEditingNotes(false);
    // Ici tu ajouterais l'appel Firebase updateDoc
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F5F0] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-gray-400 font-black text-[0.65rem] uppercase tracking-widest hover:text-[#5F27CD] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Retour à l&apos;archive
          </button>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-12 lg:p-16 border border-white relative overflow-hidden">
            
            {/* ── HEADER SENSORIEL ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b border-gray-100 pb-12 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><FileText size={16} /></div>
                   <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#5F27CD]">Facturation Détaillée</p>
                </div>
                <h1 className="title-luxe text-5xl md:text-6xl">{invoice.id}</h1>
              </div>
              <div className="text-right">
                <p className="text-lg font-sans italic text-gray-400">{invoice.date}</p>
                <p className="text-6xl font-light text-[#222F3E] mt-2">{invoice.amount} <small className="text-xl font-black opacity-20">CHF</small></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-8">
                <div>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Patient Souverain</p>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#F8F5F0] rounded-2xl flex items-center justify-center text-[#5F27CD]"><User size={24} /></div>
                     <p className="text-3xl font-sans font-medium text-[#222F3E]">{invoice.client}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Rituel Pratiqué</p>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#F8F5F0] rounded-2xl flex items-center justify-center text-[#0ABDE3]"><Sparkles size={24} /></div>
                     <p className="text-xl font-sans text-[#222F3E]">{invoice.service}</p>
                  </div>
                </div>
              </div>

              {/* ── TIMELINE PAIEMENT ── */}
              <div className="space-y-8">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
                  <Clock className="w-4 h-4" /> Chronologie des Flux
                </p>
                <div className="relative pl-10 space-y-12">
                   <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-gray-100" />
                   
                   <div className="relative">
                      <div className="absolute -left-10 top-0 w-6 h-6 bg-gray-100 border-4 border-white rounded-full flex items-center justify-center" />
                      <div>
                         <p className="text-sm font-bold text-[#222F3E]">Émission de la Facture</p>
                         <p className="text-xs text-gray-400 font-medium italic mt-1">{invoice.date}</p>
                      </div>
                   </div>

                   {invoice.status === 'paid' && (
                     <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative">
                        <div className="absolute -left-10 top-0 w-6 h-6 bg-[#1DD1A1] border-4 border-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100" />
                        <div>
                           <p className="text-sm font-bold text-[#1DD1A1]">Règlement Confirmé</p>
                           <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1">Via {invoice.paymentMethod} • Flux Actif</p>
                        </div>
                     </motion.div>
                   )}
                </div>
              </div>
            </div>

            {/* ── ACTIONS DE PAIEMENT INLINE ── */}
            {invoice.status === 'pending' && (
              <div className="mt-20">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full h-24 bg-amber-50 text-amber-700 rounded-[2rem] border border-amber-100 flex items-center justify-between px-10 group hover:bg-amber-100 transition-all font-sans italic text-xl"
                >
                  <span className="flex items-center gap-4"><CreditCard className="animate-pulse" /> Marquer comme réglé</span>
                  <ChevronRight size={20} className={`transition-transform duration-500 ${expanded ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 grid grid-cols-3 gap-6"
                    >
                      {[
                        { label: 'Twint', icon: Smartphone, color: '#5F27CD' },
                        { label: 'Carte', icon: CreditCard, color: '#0ABDE3' },
                        { label: 'Espèces', icon: Banknote, color: '#1DD1A1' },
                      ].map((m) => (
                        <motion.button
                          key={m.label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markAsPaid(m.label)}
                          className="flex flex-col items-center justify-center gap-5 py-10 glass rounded-[2.5rem] border border-white hover:border-[#5F27CD]/20 transition-all shadow-sm"
                        >
                          <m.icon size={36} style={{ color: m.color }} />
                          <span className="font-black uppercase tracking-[0.2em] text-[0.65rem] text-[#222F3E]">{m.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── NOTES DYNAMIQUES ── */}
            <div className="mt-20 border-t border-gray-50 pt-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-gray-400">Notes & Observations</p>
                </div>
                <button
                  onClick={() => isEditingNotes ? saveNotes() : setIsEditingNotes(true)}
                  className="flex items-center gap-3 text-[#5F27CD] text-[0.6rem] font-black uppercase tracking-widest hover:underline"
                >
                  <Edit size={14} /> {isEditingNotes ? 'Terminer' : 'Éditer'}
                </button>
              </div>

              {isEditingNotes ? (
                <textarea
                  autoFocus
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  rows={6}
                  className="w-full bg-white/60 backdrop-blur-md border border-[#5F27CD]/20 p-8 rounded-[2.5rem] text-xl font-sans italic focus:outline-none focus:ring-8 focus:ring-indigo-50 transition-all resize-none shadow-inner"
                />
              ) : (
                <div className="bg-[#F8F5F0]/60 p-10 rounded-[2.5rem] text-gray-600 font-sans italic text-xl leading-relaxed italic border border-white">
                  {invoice.notes}
                </div>
              )}
            </div>

            {/* ── ACTIONS FINALES ── */}
            <div className="mt-20 flex flex-col sm:flex-row gap-6">
              <button onClick={generatePDF} className="flex-1 btn-luxe flex items-center justify-center gap-4 py-8 text-lg">
                <Download size={24} /> Télécharger l&apos;Acte PDF
              </button>
              <button 
                onClick={resendEmail} 
                className="flex-1 flex items-center justify-center gap-4 py-8 text-[0.7rem] font-black uppercase tracking-[0.2em] border border-gray-200 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all"
              >
                <Send size={20} className="text-gray-400" /> Renvoyer par Email
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}
