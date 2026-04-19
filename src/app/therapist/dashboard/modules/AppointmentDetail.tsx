'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, ArrowRight, User as UserIcon, Wallet, FileText, CheckCircle2, X, CreditCard, Banknote, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Appointment } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';

interface AppointmentDetailProps {
  appt: Appointment;
  onClose: () => void;
  appointments: Appointment[];
  onGoToClient?: (clientId: string) => void;
}

export default function AppointmentDetail({
  appt, onClose, appointments = [], onGoToClient,
}: AppointmentDetailProps) {
  const firestore = useFirestore();
  const router = useRouter();
  const current = appointments.find(a => a.id === appt.id) || appt;
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  /* ── Computed patient context ── */
  const clientAppts = appointments
    .filter(a => a.clientId === appt.clientId || a.clientNameSnapshot === appt.clientNameSnapshot)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sessionCount = clientAppts.length;
  const totalDue = appointments
    .filter(a => a.clientId === appt.clientId && !a.paid)
    .reduce((s, a) => s + (a.price || 150), 0);

  /* ── Actions ── */
  const handleUpdatePayment = async (method: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', appt.id), { paid: true, paymentMethod: method });
    setShowPaymentSelector(false);
  };

  const handleTogglePaid = async () => {
    if (!firestore) return;
    if (current.paid) {
      await updateDoc(doc(firestore, 'appointments', appt.id), { paid: false, paymentMethod: null });
    } else {
      setShowPaymentSelector(true);
    }
  };

  const dateLabel = current.date
    ? format(new Date(current.date), 'EEEE d MMMM yyyy', { locale: fr })
    : 'Date inconnue';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div 
        initial={{ y: '100%', opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '100%', opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full sm:max-w-md glass rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh] border border-white/80"
      >
            {/* HEADER IMPACT LUXE */}
            <div className="bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] px-6 py-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-full transition-colors"
                title="Fermer"
              >
                <X size={32} />
              </button>
              
              <div className="space-y-1">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-60">Session Thérapeutique</p>
                <h2 className="text-xl font-bold leading-tight">
                  {current.clientNameSnapshot || current.title}
                </h2>
                <div className="flex items-baseline gap-3 mt-2">
                  <p className="text-3xl font-bold tracking-tighter">{current.time}</p>
                  <p className="text-sm opacity-80 italic">{dateLabel}</p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 space-y-10">
              {/* Context Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm border-l-4 border-[#059669]">
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Prestation</p>
                  <p className="text-xl font-sans font-medium text-[#222F3E]">{current.serviceName || 'Rituel Sensoriel'}</p>
                </div>
                <div className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm border-l-4 border-[#10B981]">
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Valeur</p>
                  <p className="text-3xl font-sans font-medium text-[#222F3E]">{current.price || 150}<span className="text-xs ml-1 opacity-50 font-sans uppercase">chf</span></p>
                </div>
              </div>

              {/* Payment Hub */}
              <div className="bg-white/60 p-8 rounded-[1.5rem] border border-white shadow-xl shadow-emerald-100/20">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Wallet size={14} className="text-gray-300" />
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-gray-400">État du Règlement</p>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {showPaymentSelector ? (
                        <motion.div 
                          key="payment-grid"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap gap-3"
                        >
                          {(['Twint', 'Card', 'Cash'] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => handleUpdatePayment(m)}
                              className="flex-1 min-w-[100px] py-5 rounded-2xl border border-gray-100 hover:border-[#34D399] hover:bg-[#34D399] hover:text-white transition-all text-sm font-bold shadow-sm"
                            >
                              {m}
                            </button>
                          ))}
                          <button onClick={() => setShowPaymentSelector(false)} className="w-16 h-[60px] rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500">
                             <X size={20} />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="payment-status"
                          onClick={handleTogglePaid}
                          className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-2xl cursor-pointer hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${current.paid ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-orange-50 text-[#0F766E]'}`}>
                               {current.paid ? <CreditCard size={20} /> : <Banknote size={20} />}
                            </div>
                            <span className={`text-lg font-sans font-medium ${current.paid ? 'text-[#34D399]' : 'text-[#0F766E]'}`}>
                               {current.paid ? `Encaissement validé via ${current.paymentMethod}` : 'Transaction en attente'}
                            </span>
                          </div>
                          <ChevronRight size={20} className="text-gray-200 group-hover:text-[#059669] transition-all" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Dossier Access */}
              {current.clientId && onGoToClient && (
                <button
                  onClick={() => onGoToClient(current.clientId as string)}
                  className="w-full flex items-center justify-between p-8 bg-gradient-to-r from-gray-50 to-white border border-white rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-[#222F3E] text-white flex items-center justify-center group-hover:bg-[#059669] transition-all">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-base font-sans font-medium text-[#222F3E]">Consulter le Dossier Patient</p>
                      <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">{sessionCount} séances enregistrées</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                      <p className={`text-xl font-sans font-medium ${totalDue > 0 ? 'text-[#FF6B6B]' : 'text-[#34D399]'}`}>{totalDue} CHF</p>
                      <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30">Solde dû</p>
                  </div>
                </button>
              )}

          {/* Financial summary metrics */}
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="text-center space-y-1">
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Total Séances</p>
              <p className="text-3xl font-sans font-medium text-[#222F3E]">{sessionCount}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Solde Patient</p>
              <p className={`text-3xl font-sans font-medium ${totalDue > 0 ? 'text-[#FF6B6B]' : 'text-[#34D399]'}`}>
                {totalDue}<span className="text-xs ml-0.5 opacity-50">CHF</span>
              </p>
            </div>
          </div>

          <div className="pt-10">
            <button 
              onClick={() => router.push(`/therapist/invoices/new?clientId=${current.clientId}&desc=${current.serviceName}&amount=${current.price || 150}`)}
              className="w-full flex items-center justify-center gap-4 py-8 bg-[#222F3E] text-white rounded-[1.5rem] shadow-2xl shadow-emerald-200/50 group hover:scale-[1.02] active:scale-95 transition-all text-[0.7rem] font-black uppercase tracking-[0.3em]"
            >
              <FileText size={20} className="text-[#10B981] group-hover:rotate-6 transition-transform" />
              Générer la Facture Pro
            </button>
          </div>
        </div>
        
        {/* Safe area spacer for mobile */}
        <div className="h-10 shrink-0" />
      </motion.div>
    </div>
  );
}
