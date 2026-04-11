"use client";

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Printer, Mail, CheckCircle2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
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
    setIsSending(false);
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

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans tracking-widest text-[10px] uppercase font-black text-slate-400">Chargement de la facture...</div>;
  if (!invoice) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans tracking-widest text-[10px] uppercase font-black text-red-400">Facture introuvable</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col items-center py-10 print:py-0 print:bg-white overflow-hidden">
      <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] flex flex-col relative print:shadow-none print:w-full print:h-auto">

        {/* Action Bar (No Print) */}
        <div className="p-10 flex justify-between items-center bg-slate-50 border-b border-slate-100 print:hidden no-print">
          <div className="flex gap-4">
            <button onClick={() => window.print()} className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3">
              <Printer size={18} /> Imprimer / PDF
            </button>
            <button
              onClick={sendByEmail}
              disabled={isSending || sent}
              className={`px-8 py-4 ${sent ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600'} rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3`}
            >
              {sent ? <CheckCircle2 size={18} /> : <Mail size={18} />}
              {isSending ? 'Envoi...' : sent ? 'Facture Envoyée' : 'Envoyer par Email'}
            </button>
          </div>
          <button onClick={() => window.close()} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-3">
            Fermer
          </button>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 p-20 lg:p-24 bg-white print:p-0">
          <div className="flex justify-between items-start mb-24">
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-normal mb-4">Facture</h1>
              <p className="text-lg font-bold text-slate-400">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Serenity & Relax Therapy</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Route d'Exemple 123, Lausanne</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mb-24 pb-12 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Patienté facturé</p>
              <p className="text-2xl font-black text-slate-900 mb-2">{invoice.clientNameSnapshot}</p>
              <p className="text-sm font-medium text-slate-500">Dossier #{invoice.clientId?.slice(0, 8)}</p>
              <p className="text-sm font-medium text-slate-500">Assurance : Complémentaire</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Calendrier</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 uppercase">Émission : {invoice.issueDate}</p>
                <p className="text-sm font-bold text-red-500 uppercase">Échéance : Sous 10 jours</p>
              </div>
            </div>
          </div>

          <table className="w-full text-left mb-24">
            <thead>
              <tr className="border-b-4 border-slate-900">
                <th className="py-6 text-[10px] font-black text-slate-900 uppercase tracking-widest">Description du soin</th>
                <th className="py-6 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Quantité</th>
                <th className="py-6 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.items || []).map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-8">
                    <p className="font-bold text-slate-900">{item.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Code Prestation : 1001</p>
                  </td>
                  <td className="py-8 text-right font-bold text-slate-600">{item.quantity}</td>
                  <td className="py-8 text-right font-black text-slate-900">{item.amount} CHF</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-auto pt-12 border-t border-slate-100 grid grid-cols-2">
            <div className="max-w-xs">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Conditions</p>
              <p className="text-[10px] font-bold text-slate-400 italic">Paiement par virement bancaire ou QR-code. Merci de mentionner le numéro de facture #{invoice.invoiceNumber}.</p>
            </div>
            <div className="text-right flex flex-col justify-center gap-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Montant Total</p>
              <p className="text-6xl font-black text-slate-900 tracking-tighter">{invoice.totalAmount} <span className="text-2xl opacity-20">CHF</span></p>
            </div>
          </div>
        </div>

        {/* Footer Sign (Print Only) */}
        <div className="hidden print:block p-20 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Facture générée automatiquement par le système Serenity Relax V2</p>
        </div>
      </div>
    </div>
  );
}
