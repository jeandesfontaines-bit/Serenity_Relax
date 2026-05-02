'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, CheckCircle2, Clock, Calendar, Sparkles, ArrowLeft, Search, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function ClientInvoicesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionClientId, setSessionClientId] = useState<string | null>(null);

  useEffect(() => {
    setSessionClientId(sessionStorage.getItem('serenity_client_id'));
  }, []);

  const effectiveClientId = user?.uid || sessionClientId;

  useEffect(() => {
    if (isUserLoading) return;
    if (!firestore || !effectiveClientId) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(firestore, 'invoices'), 
      where('clientId', '==', effectiveClientId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [effectiveClientId, firestore, isUserLoading]);

  const generateLuxePDF = (inv: any) => {
    try {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(95, 39, 205); 
        doc.text('SERENITY RELAX THERAPY', 20, 30);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Chemin de Joinville 26 • 1216 Cointrin • Genève', 20, 38);
        doc.text('Tél : +41 79 123 45 67 • ASCA / RME agréé', 20, 44);
        
        doc.setFontSize(12);
        doc.setTextColor(34, 47, 62);
        doc.text(`Pièce N° : ${inv.id}`, 140, 30);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(20, 55, 190, 55);
        
        doc.setFont("helvetica", "bold");
        doc.text('PATIENT', 20, 70);
        doc.setFont("helvetica", "normal");
        doc.text(inv.clientName || 'Patient Élite', 20, 78);
        doc.text(`Date : ${inv.date}`, 20, 84);
        
        doc.setFillColor(248, 245, 240);
        doc.rect(20, 100, 170, 40, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.text('DESCRIPTION DU SOIN', 30, 112);
        doc.text('MONTANT (CHF)', 140, 112);
        
        doc.setFont("helvetica", "normal");
        const serviceText = inv.service || (inv.items && inv.items[0]?.description) || 'Soin Holistique';
        doc.text(serviceText, 30, 125);
        doc.text(`${inv.amount}.00`, 154, 125);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(95, 39, 205);
        doc.text(`TOTAL RÉGLÉ : ${inv.amount} CHF`, 20, 170);
        
        doc.save(`Serenity-Relax-Therapy-Justificatif-${inv.id}.pdf`);
    } catch (err) {
        console.error("PDF Client Fail:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F5F0] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <button onClick={() => router.push('/client/dashboard')} className="flex items-center gap-3 text-gray-400 font-black text-[0.65rem] uppercase tracking-widest hover:text-[#5F27CD] transition-colors">
            <ArrowLeft size={16} /> Retour au Dashboard
          </button>

          <header className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[1.5rem] bg-[#222F3E] text-white flex items-center justify-center shadow-indigo-100 shadow-2xl animate-pulse">
                  <FileText size={24} />
               </div>
               <p className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-[#5F27CD]">Espace Justificatifs</p>
            </div>
            <h1 className="title-luxe text-6xl md:text-8xl">Mes <br/><span className="italic font-serif opacity-40">Sessions.</span></h1>
            <p className="text-xl text-gray-400 font-serif italic max-w-xl">Retrouvez l&apos;historique complet de vos soins et téléchargez vos justificatifs de remboursement en un clic.</p>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
               <div className="w-16 h-16 border-4 border-[#5F27CD]/10 border-t-[#5F27CD] rounded-full animate-spin" />
               <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-300">Synchronisation du Sanctuaire...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {invoices.length === 0 ? (
                <div className="dash-card p-20 text-center space-y-6 border-dashed border-2 border-gray-100 bg-transparent">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto opacity-20"><Calendar size={40} /></div>
                   <p className="text-xl font-serif italic text-gray-400">Aucune prestation n&apos;a encore été enregistrée.</p>
                </div>
              ) : (
                invoices.map((inv, i) => (
                  <motion.div 
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="dash-card p-8 md:p-12 border border-white flex flex-col md:flex-row justify-between items-center gap-10 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all"
                  >
                    <div className="flex items-center gap-10 w-full md:w-auto">
                       <div className="text-center md:text-left space-y-1">
                          <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-300">Date</p>
                          <p className="text-2xl font-serif font-medium text-[#222F3E]">{inv.date}</p>
                       </div>
                       <div className="h-10 w-px bg-gray-100 hidden md:block" />
                       <div className="flex-1 space-y-1">
                          <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-300">Soin Reçu</p>
                          <p className="text-2xl font-serif font-medium text-[#222F3E]">{inv.service || (inv.items && inv.items[0]?.description)}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                       <div className="text-right space-y-1">
                          <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-300">Investissement</p>
                          <p className="text-4xl font-light text-[#222F3E]">{inv.amount} <small className="text-xs font-black opacity-20">CHF</small></p>
                       </div>
                       
                       <button 
                         onClick={() => generateLuxePDF(inv)}
                         className="w-20 h-20 rounded-[2rem] bg-[#222F3E] text-white flex items-center justify-center group-hover:bg-[#5F27CD] transition-all shadow-xl hover:scale-110 active:scale-90"
                         title="Télécharger le justificatif"
                       >
                         <Download size={24} />
                       </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
