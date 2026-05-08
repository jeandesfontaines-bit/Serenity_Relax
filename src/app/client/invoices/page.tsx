'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, ArrowLeft, Sparkle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { buildInvoicePdf } from '@/lib/pdf-utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      if (!isUserLoading) setLoading(false);
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
    }, (err) => {
      console.error("Invoices fetch error:", err);
      setLoading(false);
    });
    return unsub;
  }, [effectiveClientId, firestore, isUserLoading]);

  const handleDownload = (inv: any) => {
    buildInvoicePdf({
      invoiceNumber: inv.invoiceNumber || inv.id.slice(0, 8).toUpperCase(),
      clientName: inv.clientNameSnapshot || user?.displayName || 'Patient',
      date: inv.date || format(new Date(), 'dd/MM/yyyy'),
      serviceName: inv.service || (inv.items && inv.items[0]?.description) || 'Soin holistique',
      amount: Number(inv.amount || 0)
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 pt-32 lg:px-8 lg:pt-40">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <button 
            onClick={() => router.push('/client/dashboard')} 
            className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
            Retour au Dashboard
          </button>

          <header className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <Sparkle className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Espace Justificatifs</span>
            </div>
            <h1 className="text-5xl font-serif leading-tight text-foreground md:text-8xl">
              Mes <span className="italic opacity-40 font-serif">Sessions.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-sans max-w-xl leading-relaxed">
              Retrouvez l&apos;historique complet de vos soins et téléchargez vos justificatifs de remboursement en un clic.
            </p>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
               <Loader2 className="w-12 h-12 text-primary animate-spin" />
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Synchronisation du Sanctuaire...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {invoices.length === 0 ? (
                <div className="glass-premium p-20 text-center space-y-6 border-dashed bg-muted/10">
                   <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                     <Calendar size={40} />
                   </div>
                   <p className="text-xl font-serif italic text-muted-foreground">Aucune prestation n&apos;a encore été enregistrée.</p>
                   <button 
                     onClick={() => router.push('/client/book')}
                     className="premium-button button-fill rounded-full"
                   >
                     Réserver mon premier soin
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {invoices.map((inv, i) => (
                    <motion.div 
                      key={inv.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-premium p-8 md:p-10 flex flex-col md:row justify-between items-center gap-10 group hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-10 w-full md:w-auto text-center md:text-left">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Date</p>
                            <p className="text-2xl font-serif text-foreground">{inv.date}</p>
                         </div>
                         <div className="hidden md:block w-px h-12 bg-border/50" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Soin Reçu</p>
                            <p className="text-2xl font-serif text-foreground">{inv.service || (inv.items && inv.items[0]?.description) || 'Soin Holistique'}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/50 pt-8 md:pt-0">
                         <div className="text-left md:text-right space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Investissement</p>
                            <p className="text-4xl font-light text-foreground">{inv.amount} <small className="text-xs font-bold opacity-30 tracking-tight">CHF</small></p>
                         </div>
                         
                         <button 
                           onClick={() => handleDownload(inv)}
                           className="w-16 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center hover:bg-primary transition-all shadow-xl hover:scale-105 active:scale-95 group-hover:shadow-primary/20"
                           title="Télécharger le justificatif"
                         >
                           <Download size={24} />
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
