import React, { useState } from 'react';
import {
  X, Clock, Smartphone, CreditCard, Banknote, Calendar, ChevronRight, Edit3, Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-[28rem] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[94vh] sm:max-h-[85vh]">

        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* ── LEFT: Appointment details ── */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-[17px] font-semibold text-slate-900">
                {current.clientNameSnapshot || current.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-[14px] text-slate-500 capitalize">{dateLabel}</span>
                {current.time && (
                  <>
                    <span className="text-slate-300">·</span>
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-[14px] font-medium text-slate-700">{current.time}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6 flex-1">
            {/* Service + price row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-[14px] p-4 text-center sm:text-left">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Prestation</p>
                {isEditing ? (
                  <input
                    value={editData.serviceName}
                    onChange={(e) => setEditData({ ...editData, serviceName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[14px] font-medium text-slate-900 outline-none focus:border-emerald-300"
                  />
                ) : (
                  <p className="text-[15px] font-medium text-slate-900">{current.serviceName || 'Session'}</p>
                )}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-[14px] p-4 text-center sm:text-left">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tarif</p>
                  <button
                    onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                    title={isEditing ? 'Enregistrer' : 'Modifier'}
                  >
                    {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                  </button>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[14px] font-semibold text-slate-900 outline-none focus:border-emerald-300"
                  />
                ) : (
                  <p className="text-[15px] font-semibold text-slate-900">{current.price || 150} CHF</p>
                )}
              </div>
            </div>

            {/* Payment status */}
            <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Paiement</p>
                  {showPaymentSelector ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['Twint', 'Card', 'Cash'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => handleUpdatePayment(m)}
                          className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-white border border-slate-200 text-[14px] font-medium text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                        >
                          {m === 'Twint' ? <Smartphone size={14} /> : m === 'Card' ? <CreditCard size={14} /> : <Banknote size={14} />}
                          {m}
                        </button>
                      ))}
                      <button onClick={() => setShowPaymentSelector(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className={`text-[15px] font-medium ${current.paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {current.paid ? `Réglé${current.paymentMethod ? ` · ${current.paymentMethod}` : ''}` : 'En attente de paiement'}
                    </p>
                  )}
                </div>
                {!showPaymentSelector && (
                  <button
                    onClick={handleTogglePaid}
                    className={`h-[42px] px-5 rounded-full text-[14px] font-medium border transition-colors ${
                      current.paid
                        ? 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200'
                        : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
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
                className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[14px] hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <span className="text-[15px] font-medium text-slate-700 group-hover:text-emerald-700">
                  Ouvrir le dossier client
                </span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>
            )}

            {onSendWhatsApp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onSendWhatsApp(current, current.paid ? 'followup' : 'reminder')}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-[14px] hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md transition-all"
                >
                  <Smartphone size={16} />
                  <span className="text-[14px] font-medium">{current.paid ? 'Suivi WhatsApp' : 'Relance WhatsApp'}</span>
                </button>
                <button
                  onClick={() => onSendWhatsApp(current, 'confirmation')}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-[14px] hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md transition-all"
                >
                  <Calendar size={16} />
                  <span className="text-[14px] font-medium">Confirmation</span>
                </button>
              </div>
            )}

            {/* Client context summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-[14px] p-4 text-center">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Sessions</p>
                <p className="text-lg font-semibold text-slate-900">{sessionCount}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-[14px] p-4 text-center">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Solde dû</p>
                <p className={`text-lg font-semibold ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {totalDue} CHF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
