"use client";

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Printer, Mail, CheckCircle2, ArrowLeft, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { buildInvoicePdf } from '@/lib/pdf-utils';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const invoiceAmount = Number(invoice?.totalAmount ?? invoice?.amount ?? 0);
  const invoiceReference = invoice?.invoiceNumber || `INV-${id}`;
  const clientName = invoice?.clientNameSnapshot || 'Client';
  const issueDate = invoice?.issueDate || invoice?.date || new Date().toISOString().slice(0, 10);
  const sessionDate = invoice?.date || invoice?.issueDate || new Date().toISOString().slice(0, 10);
  const serviceName = invoice?.serviceName || invoice?.items?.[0]?.description || 'Soin thérapeutique';
  const clientFolder = invoice?.clientId ? String(invoice.clientId).slice(0, 8).toUpperCase() : 'N/A';

  const handleDownloadPdf = () => {
    if (!invoice) return;
    buildInvoicePdf({
      invoiceNumber: invoiceReference,
      clientName,
      date: sessionDate,
      serviceName,
      amount: invoiceAmount,
    });
  };

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
          setInvoice({ id: snapshot.id, ...snapshot.data() });
        } else {
          const fallbackQuery = query(collection(firestore, 'invoices'), where('appointmentId', '==', id));
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackInvoice = fallbackSnapshot.docs[0];
          if (fallbackInvoice) {
            setInvoice({ id: fallbackInvoice.id, ...fallbackInvoice.data() });
          } else {
            console.error("Invoice not found");
          }
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
    <div className="min-h-screen flex items-center justify-center font-sans tracking-[0.3em] text-[10px] uppercase font-black text-muted-foreground/30"
      style={{ background: "hsl(var(--background))" }}>
      Chargement de l'architecture...
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center font-sans tracking-[0.3em] text-[10px] uppercase font-black text-foreground"
      style={{ background: "hsl(var(--background))" }}>
      Facture introuvable dans le sanctuaire
    </div>
  );

  return (
    <div className="min-h-screen font-display flex flex-col items-center py-24 print:py-0 print:bg-white overflow-hidden selection:bg-primary/10"
      style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-[210mm] flex flex-col relative px-8 md:px-0">
        
        {/* Action Bar (No Print) */}
        <div className="mb-16 flex justify-between items-center print:hidden no-print">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-4 text-[10px] md:text-xs font-display uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          
          <div className="flex gap-6">
            <button
              onClick={handleDownloadPdf}
              className="px-8 py-4 bg-card border border-border text-foreground font-display uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-accent transition-all flex items-center gap-3 shadow-sm"
            >
              <Download size={16} /> Télécharger PDF
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-8 py-4 bg-foreground text-background font-display uppercase tracking-[0.2em] text-[10px] md:text-xs hover:opacity-90 transition-all flex items-center gap-3 shadow-xl shadow-foreground/5"
            >
              <Printer size={16} /> Imprimer / PDF
            </button>
            <button
              onClick={sendByEmail}
              disabled={isSending || sent}
              className={`px-8 py-4 ${sent ? 'bg-accent text-muted-foreground' : 'bg-card border border-border text-foreground'} font-display uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-accent transition-all flex items-center gap-3 shadow-sm`}
            >
              {sent ? <CheckCircle2 size={16} /> : <Mail size={16} />}
              {isSending ? 'Envoi...' : sent ? 'Envoyée' : 'Email'}
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        {/* Invoice Body */}
        <div className="bg-card shadow-sm min-h-[297mm] flex flex-col print:shadow-none print:w-full print:h-auto border border-border p-8 md:p-16 print:p-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
            <div>
              <h1 className="text-3xl font-light text-foreground tracking-tight mb-4">Facture</h1>
              <div className="flex items-center gap-6">
                <span className="font-display uppercase tracking-[0.4em] text-[10px] text-muted-foreground/30">Référence</span>
                <p className="text-sm font-display font-bold tracking-widest text-foreground">#{invoiceReference}</p>
              </div>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <span className="block text-xl font-medium text-foreground mb-1">Serenity Relax</span>
              <span className="block font-display uppercase tracking-[0.3em] text-[9px] text-muted-foreground mb-4 leading-none">Architecture of Presence</span>
              <div className="font-display uppercase tracking-[0.2em] text-[10px] text-muted-foreground space-y-2">
                <p>Route d'Exemple 123</p>
                <p>1000 Lausanne, Suisse</p>
                <p className="pt-2 text-muted-foreground/30">RCC: Z123.456</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-16 py-8 border-y border-border">
            <div>
              <span className="font-display uppercase tracking-[0.3em] text-[9px] text-muted-foreground block mb-4">Destinataire</span>
              <p className="text-xl font-medium text-foreground mb-2">{clientName}</p>
              <div className="font-display uppercase tracking-[0.2em] text-[10px] text-muted-foreground space-y-2">
                <p>Dossier No. {clientFolder}</p>
                <p className="text-muted-foreground/30">Méthode Thérapeutique : Soins Holistiques</p>
              </div>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <span className="font-display uppercase tracking-[0.3em] text-[9px] text-muted-foreground block mb-4">Temporalité</span>
              <div className="space-y-4 w-full md:w-auto">
                <div className="flex justify-between md:justify-end items-center gap-12">
                  <span className="font-display uppercase tracking-[0.3em] text-[10px] text-muted-foreground">Émission</span>
                  <p className="text-sm font-bold tracking-widest text-foreground">{issueDate}</p>
                </div>
                <div className="flex justify-between md:justify-end items-center gap-12">
                  <span className="font-display uppercase tracking-[0.3em] text-[10px] text-muted-foreground">Échéance</span>
                  <p className="text-sm font-bold tracking-widest text-foreground">Sous 10 jours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 font-display uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Prestation de soin</th>
                  <th className="py-4 text-right font-display uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Unités</th>
                  <th className="py-4 text-right font-display uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Honoraires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(invoice.items || []).length > 0 ? (invoice.items.map((item: any, idx: number) => (
                  <tr key={idx} className="group">
                    <td className="py-6">
                      <p className="text-sm font-medium text-foreground mb-1">{item.description}</p>
                      <p className="font-display uppercase tracking-[0.2em] text-[9px] text-muted-foreground">Code Tarifa 590 : 1001</p>
                    </td>
                    <td className="py-6 text-right font-display text-[11px] text-muted-foreground">1</td>
                    <td className="py-6 text-right text-base font-medium text-foreground">{Number(item.amount || 0).toFixed(2)} <span className="text-[10px] text-muted-foreground ml-1">CHF</span></td>
                  </tr>
                ))) : (
                  <tr className="group">
                    <td className="py-6">
                      <p className="text-sm font-medium text-foreground mb-1">{serviceName}</p>
                      <p className="font-display uppercase tracking-[0.2em] text-[9px] text-muted-foreground">Code Tarifa 590 : 1001</p>
                    </td>
                    <td className="py-6 text-right font-display text-[11px] text-muted-foreground">1</td>
                    <td className="py-6 text-right text-base font-medium text-foreground">{invoiceAmount.toFixed(2)} <span className="text-[10px] text-muted-foreground ml-1">CHF</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Total */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 items-end gap-8 md:gap-0">
            <div className="max-w-xs">
              <span className="font-display uppercase tracking-[0.2em] text-[9px] text-muted-foreground block mb-2">Informations</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Paiement par virement bancaire ou QR-code. 
                Veuillez mentionner la référence <span className="text-foreground font-bold">#{invoiceReference}</span> lors de votre transaction.
              </p>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <span className="font-display uppercase tracking-[0.3em] text-[9px] text-muted-foreground block mb-2">Total dû</span>
              <div className="flex flex-col md:items-end">
                <p className="text-4xl font-semibold text-foreground tracking-tight leading-none">
                  {invoiceAmount.toFixed(2)}
                </p>
                <span className="text-xs text-muted-foreground mt-2 uppercase tracking-[0.1em]">Francs Suisses</span>
              </div>
            </div>
          </div>

          {/* Footer Sign (Print Only) */}
          <div className="hidden print:block mt-16 pt-8 border-t border-border text-center">
            <p className="font-display uppercase tracking-[0.2em] text-[9px] text-muted-foreground">
              Généré par Serenity Relax Digital Ecosystem — Lausanne
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
