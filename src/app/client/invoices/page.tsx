'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, ArrowLeft, Sparkle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { buildInvoicePdf } from '@/lib/pdf-utils';

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
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setInvoices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Invoices fetch error:', err);
        setLoading(false);
      },
    );

    return unsub;
  }, [effectiveClientId, firestore, isUserLoading]);

  const handleDownload = (inv: any) => {
    buildInvoicePdf({
      invoiceNumber: inv.invoiceNumber || inv.id.slice(0, 8).toUpperCase(),
      clientName: inv.clientNameSnapshot || user?.displayName || 'Patient',
      date: inv.date || new Date().toLocaleDateString('fr-CH'),
      serviceName: inv.service || inv.items?.[0]?.description || 'Soin holistique',
      amount: Number(inv.amount || 0),
    });
  };

  return (
    <div className="landing-v2 min-h-screen pb-24" style={{ background: 'var(--landing-page-bg)' }}>
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-6 pt-28 md:px-10 lg:px-12 lg:pt-36">
        <div className="mx-auto max-w-5xl space-y-8">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="landing-type-caption inline-flex items-center gap-3 text-[var(--landing-muted)] transition-colors hover:text-[var(--teal-deep)]"
          >
            <ArrowLeft size={16} className="transition-transform hover:-translate-x-0.5" />
            Retour au dashboard
          </button>

          <header className="space-y-4">
            <div className="landing-pill landing-pill-soft landing-type-caption inline-flex gap-3 border text-[var(--landing-warm)]">
              <Sparkle className="h-4 w-4 text-[var(--orange)]" />
              <span>Espace justificatifs</span>
            </div>
            <h1 className="landing-type-h1 landing-text-high display-tight max-w-[11ch]">
              Mes
              <br />
              <span className="landing-display-italic text-[var(--landing-muted)]">sessions</span>
            </h1>
            <p className="landing-type-body landing-text-body max-w-2xl">
              Retrouvez l&apos;historique complet de vos soins et téléchargez vos justificatifs de remboursement en un clic.
            </p>
          </header>

          {loading ? (
            <div className="landing-surface-card flex h-80 flex-col items-center justify-center gap-5 rounded-[2rem] p-10">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--teal-deep)]" />
              <p className="landing-type-caption landing-text-muted">Synchronisation des justificatifs</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="landing-surface-card rounded-[2rem] border-dashed px-8 py-10 text-center md:px-12 md:py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-[var(--landing-tint-fill)] text-[var(--landing-muted)]">
                <Calendar size={30} />
              </div>
              <h2 className="landing-type-h4 landing-text-high mt-6">Aucune prestation enregistrée</h2>
              <p className="landing-type-body-s landing-text-body mx-auto mt-3 max-w-md">
                Dès votre premier soin, vos justificatifs apparaîtront ici avec téléchargement immédiat.
              </p>
              <button
                onClick={() => router.push('/client/book')}
                className="landing-type-micro mt-6 inline-flex rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:scale-[1.01] hover:bg-[var(--orange)]"
              >
                Réserver mon premier soin
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {invoices.map((inv, index) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="landing-surface-card rounded-[2rem] p-6 md:p-8"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <p className="landing-type-caption landing-text-muted">Date</p>
                        <p className="landing-type-h5 landing-text-high">{inv.date || 'Date à confirmer'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="landing-type-caption landing-text-muted">Soin reçu</p>
                        <p className="landing-type-h5 landing-text-high">
                          {inv.service || inv.items?.[0]?.description || 'Soin holistique'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="landing-type-caption landing-text-muted">Investissement</p>
                        <p className="landing-type-h4 landing-text-high">
                          {inv.amount || 0}
                          <span className="landing-type-caption ml-2 text-[var(--landing-muted)]">CHF</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(inv)}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[var(--teal-deep)] text-white transition-all hover:scale-[1.03] hover:bg-[var(--orange)]"
                      title="Télécharger le justificatif"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
