"use client";

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Printer, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendByEmail = async () => {
    setIsSending(true);
    // Simulation d'envoi
    await new Promise(r => setTimeout(r, 1500));
    setIsSending(true);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  useEffect(() => {
    if (!firestore || !id) return;
    const fetchInvoice = async () => {
      try {
        const docRef = doc(firestore, 'invoices', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setInvoice(snapshot.data());
        } else {
          console.error("Invoice not found");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [firestore, id]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center font-sans tracking-[0.3em] text-[10px] uppercase font-black text-[#435544]/40">
      Chargement de l'architecture...
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center font-sans tracking-[0.3em] text-[10px] uppercase font-black text-[#725a38]">
      Facture introuvable dans le sanctuaire
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-display flex flex-col items-center py-24 print:py-0 print:bg-white overflow-hidden selection:bg-zinc-900 selection:text-white">
      <div className="w-full max-w-[210mm] flex flex-col relative px-8 md:px-0">
        
        {/* Action Bar (No Print) */}
        <div className="mb-16 flex justify-between items-center print:hidden no-print">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-4 text-[10px] md:text-xs font-display uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          
          <div className="flex gap-6">
            <button 
              onClick={() => window.print()} 
              className="px-8 py-4 bg-zinc-900 text-white font-display uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-zinc-200"
            >
              <Printer size={16} /> Imprimer / PDF
            </button>
            <button
              onClick={sendByEmail}
              disabled={isSending || sent}
              className={`px-8 py-4 ${sent ? 'bg-zinc-100 text-zinc-400' : 'bg-white border border-zinc-200 text-zinc-900'} font-display uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-zinc-50 transition-all flex items-center gap-3 shadow-sm`}
            >
              {sent ? <CheckCircle2 size={16} /> : <Mail size={16} />}
              {isSending ? 'Envoi...' : sent ? 'Envoyée' : 'Email'}
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="bg-white shadow-[0_60px_100px_-20px_rgba(0,0,0,0.05)] min-h-[297mm] flex flex-col print:shadow-none print:w-full print:h-auto border border-zinc-100 p-20 md:p-32 print:p-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-32">
            <div>
              <h1 className="text-7xl font-serif font-light text-zinc-900 tracking-tighter mb-6">Facture</h1>
              <div className="flex items-center gap-6">
                <span className="font-display uppercase tracking-[0.4em] text-[10px] text-zinc-300">Référence</span>
                <p className="text-sm font-display font-bold tracking-widest text-zinc-900">#{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <span className="block font-serif text-3xl text-zinc-900 mb-2">Serenity Relax</span>
              <span className="block font-display uppercase tracking-[0.4em] text-[9px] text-zinc-400 mb-8 leading-none">Architecture of Presence</span>
              <div className="font-display uppercase tracking-[0.2em] text-[10px] text-zinc-400 space-y-2">
                <p>Route d'Exemple 123</p>
                <p>1000 Lausanne, Suisse</p>
                <p className="pt-2 text-zinc-300">RCC: Z123.456</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-32 py-16 border-y border-zinc-50">
            <div>
              <span className="font-display uppercase tracking-[0.4em] text-[9px] text-zinc-300 block mb-6">Destinataire</span>
              <p className="text-3xl font-serif font-light text-zinc-900 mb-4">{invoice.clientNameSnapshot}</p>
              <div className="font-display uppercase tracking-[0.2em] text-[10px] text-zinc-400 space-y-2">
                <p>Dossier No. {invoice.clientId?.slice(0, 8).toUpperCase()}</p>
                <p className="text-zinc-300">Méthode Thérapeutique : Soins Holistiques</p>
              </div>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <span className="font-display uppercase tracking-[0.4em] text-[9px] text-zinc-300 block mb-6">Temporalité</span>
              <div className="space-y-4 w-full md:w-auto">
                <div className="flex justify-between md:justify-end items-center gap-12">
                  <span className="font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">Émission</span>
                  <p className="text-sm font-bold tracking-widest text-zinc-900">{invoice.issueDate}</p>
                </div>
                <div className="flex justify-between md:justify-end items-center gap-12">
                  <span className="font-display uppercase tracking-[0.3em] text-[10px] text-zinc-400">Échéance</span>
                  <p className="text-sm font-bold tracking-widest text-zinc-900">Sous 10 jours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900">
                  <th className="py-10 font-display uppercase tracking-[0.4em] text-[10px] text-zinc-900">Prestation de soin</th>
                  <th className="py-10 text-right font-display uppercase tracking-[0.4em] text-[10px] text-zinc-900">Unités</th>
                  <th className="py-10 text-right font-display uppercase tracking-[0.4em] text-[10px] text-zinc-900">Honoraires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {(invoice.items || []).length > 0 ? (invoice.items.map((item: any, idx: number) => (
                  <tr key={idx} className="group">
                    <td className="py-12">
                      <p className="text-2xl font-serif font-light text-zinc-900 mb-2">{item.description}</p>
                      <p className="font-display uppercase tracking-[0.3em] text-[9px] text-zinc-300">Code Tarifa 590 : 1001</p>
                    </td>
                    <td className="py-12 text-right font-display text-[11px] text-zinc-400">1</td>
                    <td className="py-12 text-right font-serif text-2xl text-zinc-900">{item.amount.toFixed(2)} <span className="text-xs opacity-20 ml-1">CHF</span></td>
                  </tr>
                ))) : (
                  <tr className="group">
                    <td className="py-12">
                      <p className="text-2xl font-serif font-light text-zinc-900 mb-2">{invoice.serviceName || "Soin Holistique"}</p>
                      <p className="font-display uppercase tracking-[0.3em] text-[9px] text-zinc-300">Code Tarifa 590 : 1001</p>
                    </td>
                    <td className="py-12 text-right font-display text-[11px] text-zinc-400">1</td>
                    <td className="py-12 text-right font-serif text-2xl text-zinc-900">{invoice.totalAmount.toFixed(2)} <span className="text-xs opacity-20 ml-1">CHF</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Total */}
          <div className="mt-32 pt-20 border-t-2 border-zinc-900 grid grid-cols-1 md:grid-cols-2 items-end gap-16 md:gap-0">
            <div className="max-w-xs">
              <span className="font-display uppercase tracking-[0.4em] text-[9px] text-zinc-300 block mb-6">Informations</span>
              <p className="font-display uppercase tracking-[0.2em] text-[10px] text-zinc-400 leading-relaxed italic">
                Paiement par virement bancaire ou QR-code. 
                Veuillez mentionner la référence <span className="text-zinc-900 font-bold">#{invoice.invoiceNumber}</span> lors de votre transaction.
              </p>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <span className="font-display uppercase tracking-[0.4em] text-[9px] text-zinc-300 block mb-4">Total dû</span>
              <div className="flex flex-col md:items-end">
                <p className="text-8xl font-serif font-light text-zinc-900 tracking-tighter leading-none">
                  {invoice.totalAmount.toFixed(2)}
                </p>
                <span className="font-serif text-xl text-zinc-200 mt-4 uppercase tracking-[0.2em]">Francs Suisses</span>
              </div>
            </div>
          </div>

          {/* Footer Sign (Print Only) */}
          <div className="hidden print:block mt-32 pt-16 border-t border-zinc-50 text-center">
            <p className="font-display uppercase tracking-[0.5em] text-[9px] text-zinc-200">
              Généré par Serenity Relax Digital Ecosystem — Lausanne
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
