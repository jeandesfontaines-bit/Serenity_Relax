'use client';
import React, { useState } from 'react';
import {
  X, Clock, Smartphone, CreditCard, Banknote, Calendar, ChevronRight, Edit3, Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface AppointmentDetailProps {
  appt: Appointment;
  onClose: () => void;
  appointments: Appointment[];
  onSendWhatsApp?: (appt: Appointment, type: 'reminder' | 'confirmation' | 'followup') => void;
  onGoToClient?: (clientId: string) => void;
}

export default function AppointmentDetail({
  appt, onClose, appointments = [], onSendWhatsApp, onGoToClient,
}: AppointmentDetailProps) {
  const firestore = useFirestore();
  const current = appointments.find(a => a.id === appt.id) || appt;
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    serviceName: current.serviceName || 'Session',
    price: current.price || 150,
  });

  const clientAppts = appointments
    .filter(a => a.clientId === appt.clientId || a.clientNameSnapshot === appt.clientNameSnapshot)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sessionCount = clientAppts.length;
  const totalDue = appointments
    .filter(a => a.clientId === appt.clientId && !a.paid)
    .reduce((s, a) => s + (a.price || 150), 0);

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

  const handleSaveEdit = async () => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'appointments', appt.id), {
      serviceName: editData.serviceName,
      price: Number(editData.price) || 0,
    });
    setIsEditing(false);
  };

  const dateLabel = current.date
    ? format(new Date(current.date), 'EEEE d MMMM yyyy', { locale: fr })
    : 'Date inconnue';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full sm:max-w-[30rem] bg-[#faf9f7] border border-zinc-200 flex flex-col overflow-hidden max-h-[94vh] sm:max-h-[85vh]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-7 border-b border-zinc-100">
          <div>
            <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-3">RENDEZ-VOUS</p>
            <h2 className="font-serif text-2xl tracking-tighter text-zinc-900 uppercase">
              {current.clientNameSnapshot || current.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <Calendar size={12} className="text-zinc-400" />
              <span className="font-serif text-[11px] text-zinc-500 tracking-[0.1em] capitalize">{dateLabel}</span>
              {current.time && (
                <>
                  <span className="text-zinc-200">·</span>
                  <Clock size={12} className="text-zinc-400" />
                  <span className="font-serif text-[11px] font-medium text-zinc-700 tracking-[0.1em]">{current.time}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-8 space-y-8 flex-1">

            {/* Service + price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-zinc-100 p-5">
                <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-3">Prestation</p>
                {isEditing ? (
                  <input
                    value={editData.serviceName}
                    onChange={(e) => setEditData({ ...editData, serviceName: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-1 font-serif text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-all"
                  />
                ) : (
                  <p className="font-serif text-sm text-zinc-900 tracking-tight">{current.serviceName || 'Session'}</p>
                )}
              </div>
              <div className="bg-white border border-zinc-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase">Tarif</p>
                  <button
                    onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
                    className="text-zinc-300 hover:text-zinc-900 transition-colors"
                    title={isEditing ? 'Enregistrer' : 'Modifier'}
                  >
                    {isEditing ? <Save size={13} strokeWidth={1.5} /> : <Edit3 size={13} strokeWidth={1.5} />}
                  </button>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                    className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-1 font-serif text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-all"
                  />
                ) : (
                  <p className="font-serif text-sm font-medium text-zinc-900">{current.price || 150} CHF</p>
                )}
              </div>
            </div>

            {/* Payment status */}
            <div className="bg-white border border-zinc-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-3">Paiement</p>
                  {showPaymentSelector ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['Twint', 'Card', 'Cash'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => handleUpdatePayment(m)}
                          className="flex items-center gap-2 h-9 px-4 bg-white border border-zinc-200 font-serif text-[11px] tracking-[0.2em] uppercase text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-500"
                        >
                          {m === 'Twint' ? <Smartphone size={12} strokeWidth={1.5} /> : m === 'Card' ? <CreditCard size={12} strokeWidth={1.5} /> : <Banknote size={12} strokeWidth={1.5} />}
                          {m}
                        </button>
                      ))}
                      <button onClick={() => setShowPaymentSelector(false)} className="w-9 h-9 flex items-center justify-center border border-zinc-100 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                        <X size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <p className={`font-serif text-sm tracking-tight ${current.paid ? 'text-zinc-900' : 'text-amber-600'}`}>
                      {current.paid ? `Réglé${current.paymentMethod ? ` · ${current.paymentMethod}` : ''}` : 'En attente de paiement'}
                    </p>
                  )}
                </div>
                {!showPaymentSelector && (
                  <button
                    onClick={handleTogglePaid}
                    className={`h-10 px-5 font-serif text-[10px] tracking-[0.3em] uppercase border transition-all duration-500 ${
                      current.paid
                        ? 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-900'
                        : 'bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-700'
                    }`}
                  >
                    {current.paid ? 'Annuler' : 'Marquer réglé'}
                  </button>
                )}
              </div>
            </div>

            {/* Go to client */}
            {current.clientId && onGoToClient && (
              <button
                onClick={() => onGoToClient(current.clientId as string)}
                className="w-full flex items-center justify-between p-5 bg-white border border-zinc-100 hover:border-zinc-900 transition-all duration-500 group"
              >
                <span className="font-serif text-[11px] tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-900 transition-colors">
                  Ouvrir le dossier client
                </span>
                <ChevronRight size={14} strokeWidth={1.5} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </button>
            )}

            {/* WhatsApp actions */}
            {onSendWhatsApp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onSendWhatsApp(current, current.paid ? 'followup' : 'reminder')}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-zinc-100 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500 group"
                >
                  <Smartphone size={14} strokeWidth={1.5} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-900 transition-colors">
                    {current.paid ? 'Suivi WhatsApp' : 'Relance WhatsApp'}
                  </span>
                </button>
                <button
                  onClick={() => onSendWhatsApp(current, 'confirmation')}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-zinc-100 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500 group"
                >
                  <Calendar size={14} strokeWidth={1.5} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-900 transition-colors">Confirmation</span>
                </button>
              </div>
            )}

            {/* Client context summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-zinc-100 p-5 text-center">
                <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-3">Sessions</p>
                <p className="font-serif text-2xl tracking-tighter text-zinc-900">{sessionCount}</p>
              </div>
              <div className="bg-white border border-zinc-100 p-5 text-center">
                <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-3">Solde dû</p>
                <p className={`font-serif text-2xl tracking-tighter ${totalDue > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
                  {totalDue} CHF
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
