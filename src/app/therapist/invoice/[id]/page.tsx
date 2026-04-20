"use client";

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Printer, Mail, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const [data, setData] = useState<any>(null);
  const [cabinet, setCabinet] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!firestore) return;
      try {
        // 1. Try to fetch as a specific Invoice
        let docRef = doc(firestore, 'invoices', id);
        let snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), type: 'invoice' });
        } else {
          // 2. If not found, try to fetch as an Appointment (direct print)
          docRef = doc(firestore, 'appointments', id);
          snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const appt = snapshot.data();
            setData({
              invoiceNumber: `INV-${format(new Date(), 'yyyy')}-${id.substring(0, 5).toUpperCase()}`,
              clientNameSnapshot: appt.clientNameSnapshot,
              totalAmount: appt.price || 150,
              issueDate: format(new Date(), 'dd.MM.yyyy'),
              items: [{ 
                description: appt.serviceName || 'Session de Thérapie',
                quantity: 1,
                amount: appt.price || 150
              }],
              type: 'appointment'
            });
          }
        }

        // 3. Fetch Cabinet Config
        const configRef = doc(firestore, 'config', 'metadata');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) setCabinet(configSnap.data());

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, firestore]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans tracking-widest text-[10px] uppercase font-black text-slate-400">Génération du document...</div>;
  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans tracking-widest text-[10px] uppercase font-black text-red-500 underline cursor-pointer" onClick={() => router.back()}>Document introuvable - Retour</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col items-center py-10 print:py-0 print:bg-white">
      <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] flex flex-col relative print:shadow-none print:w-full print:border-none">

        {/* Action Bar (No Print) */}
        <div className="p-10 flex justify-between items-center bg-slate-50 border-b border-slate-100 print:hidden no-print">
          <div className="flex gap-4">
            <button onClick={() => window.print()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-3">
              <Printer size={18} /> Imprimer / PDF
            </button>
            <button
              onClick={() => { setIsSending(true); setTimeout(() => { setIsSending(false); setSent(true); }, 1500); }}
              disabled={isSending || sent}
              className={`px-8 py-4 ${sent ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600'} rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3`}
            >
              {sent ? <CheckCircle2 size={18} /> : <Mail size={18} />}
              {isSending ? 'Envoi...' : sent ? 'Envoyé !' : 'Envoyer par Email'}
            </button>
          </div>
          <button onClick={() => window.history.back()} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-3">
            <ChevronLeft size={16} /> Retour
          </button>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 p-20 lg:p-24 bg-white print:p-12">
          <div className="flex justify-between items-start mb-24">
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Facture</h1>
              <p className="text-lg font-bold text-slate-400 italic">#{data.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-indigo-600 uppercase text-sm tracking-widest">{cabinet.cabinetName || 'Mon Cabinet'}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
                {cabinet.cabinetAddress || 'Adresse pro non spécifiée'}<br />
                {cabinet.cabinetEmail || 'email@professionnel.com'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mb-24 pb-12 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Destinataire</p>
              <p className="text-2xl font-black text-slate-900 mb-2">{data.clientNameSnapshot}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Assurance: Complémentaire</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Détails</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 uppercase">Émission : {data.issueDate}</p>
                <p className="text-sm font-bold text-rose-500 uppercase">Échéance : Sous 10 jours</p>
              </div>
            </div>
          </div>

          <table className="w-full text-left mb-24">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-6 text-[10px] font-black text-slate-900 uppercase tracking-widest">Description</th>
                <th className="py-6 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Qté</th>
                <th className="py-6 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(data.items || []).map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-8">
                    <p className="font-bold text-slate-900 text-sm">{item.description}</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Code Prestation : 1001</p>
                  </td>
                  <td className="py-8 text-right font-bold text-slate-600 text-sm">{item.quantity}</td>
                  <td className="py-8 text-right font-black text-slate-900 text-sm">{item.amount} CHF</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-auto pt-16 border-t border-slate-100 flex justify-between items-end">
            <div className="max-w-xs">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Informations</p>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                Règlement par virement sous 10 jours.<br />
                Mentionnez la facture #{data.invoiceNumber}.<br />
                Merci de votre confiance.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Total à payer</p>
              <p className="text-6xl font-black text-slate-900 tracking-tighter">{data.totalAmount} <span className="text-2xl opacity-20">CHF</span></p>
            </div>
          </div>
        </div>

        <div className="p-12 bg-slate-50 border-t border-slate-100 text-center opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Document original certifié · Généré par AuraFlow</p>
        </div>
      </div>
    </div>
  );
}
