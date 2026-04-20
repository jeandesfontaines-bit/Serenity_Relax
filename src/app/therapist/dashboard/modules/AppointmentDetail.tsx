'use client';

import React, { useState } from 'react';
import {
  X, Clock, Smartphone, CreditCard, Banknote, Calendar, ChevronRight, Edit3, Save, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { simplifyServiceName } from '@/lib/utils';

interface AppointmentDetailProps {
  appt: Appointment;
  onClose: () => void;
  appointments: Appointment[];
  followupTemplate?: string;
  onSendWhatsApp?: (appt: Appointment, type: 'followup' | 'confirmation') => void;
  onGoToClient?: (clientId: string) => void;
}

export default function AppointmentDetail({
  appt, onClose, appointments = [], followupTemplate, onSendWhatsApp, onGoToClient,
}: AppointmentDetailProps) {
  const firestore = useFirestore();
  const current = appointments.find(a => a.id === appt.id) || appt;
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    serviceName: current.serviceName || '',
    price: current.price || 150
  });

  const clientAppts = appointments
    .filter(a => a.clientId === appt.clientId || a.clientNameSnapshot === appt.clientNameSnapshot)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sessionCount = clientAppts.length;
  const totalDue = appointments
    .filter(a => a.clientId === appt.clientId && !a.paid && (a.status as any) !== 'cancelled')
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
      price: Number(editData.price)
    });
    setIsEditing(false);
  };

  const dateLabel = current.date
    ? format(new Date(current.date), 'EEEE d MMMM yyyy', { locale: fr })
    : 'Date inconnue';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full sm:max-w-[400px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
        
        {/* Header - Clinical & Sharp */}
        <div className="px-6 pt-8 pb-5 flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 group">
              <h2 className="text-xl font-black text-slate-900 tracking-tight truncate uppercase">
                {current.clientNameSnapshot?.split(' ')[1]} {current.clientNameSnapshot?.split(' ')[0]}
              </h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              <Calendar size={12} className="shrink-0" />
              <span>{dateLabel}</span>
              <span>•</span>
              <Clock size={12} className="shrink-0" />
              <span className="text-slate-900">{current.time}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4">
          
          {/* Main Info Blocks */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Soin</span>
                {isEditing ? (
                  <input 
                    autoFocus
                    value={editData.serviceName} 
                    onChange={e => setEditData({...editData, serviceName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-700 leading-tight">{simplifyServiceName(current.serviceName || '')}</p>
                )}
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tarif</span>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={editData.price} 
                      onChange={e => setEditData({...editData, price: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <span className="text-[10px] font-bold text-slate-400">CHF</span>
                  </div>
                ) : (
                  <p className="text-sm font-black text-slate-900">{current.price || 150} <span className="text-[10px] text-slate-400">CHF</span></p>
                )}
             </div>
          </div>

          {isEditing && (
            <button 
              onClick={handleSaveEdit}
              className="w-full h-11 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 animate-in zoom-in-95"
            >
              <Save size={14} /> Enregistrer
            </button>
          )}

          {/* Payment Section - Ultra Compact */}
          {!isEditing && (
            <div className={`rounded-2xl border transition-all px-5 py-3 flex items-center justify-between ${current.paid ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Règlement</span>
                <p className={`text-[11px] font-black uppercase tracking-tight ${current.paid ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {current.paid ? `PAYÉ ${current.paymentMethod ? `(${current.paymentMethod})` : ''}` : 'À ENCAISSER'}
                </p>
              </div>
              
              {!current.paid ? (
                !showPaymentSelector ? (
                  <button 
                    onClick={() => setShowPaymentSelector(true)}
                    className="h-9 px-5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    Encaisser
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 animate-in slide-in-from-right-4">
                    {(['Twint', 'Cash', 'Card'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => handleUpdatePayment(m)}
                        className="w-10 h-10 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-all group"
                      >
                        {m === 'Twint' ? <Smartphone size={12} /> : m === 'Cash' ? <Banknote size={12} /> : <CreditCard size={12} />}
                        <span className="text-[7px] font-black uppercase mt-0.5">{m}</span>
                      </button>
                    ))}
                    <button onClick={() => setShowPaymentSelector(false)} className="ml-1 text-slate-300 hover:text-rose-500"><X size={14} /></button>
                  </div>
                )
              ) : (
                <button onClick={handleTogglePaid} className="text-[9px] font-black text-rose-500 uppercase hover:underline opacity-50 hover:opacity-100">Annuler</button>
              )}
            </div>
          )}

          {/* Patient Shortcuts */}
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => onGoToClient?.(current.clientId!)}
              className="w-full flex items-center justify-between h-12 px-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users size={15} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Accès dossier complet</span>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button 
              onClick={() => onSendWhatsApp?.(current, 'followup')}
              className="w-full flex items-center justify-between h-12 px-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Smartphone size={15} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Suivi / Rappel</span>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Quick Stats - Compacted */}
          <div className="flex gap-2 pt-2">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Visites</span>
               <span className="text-sm font-black text-slate-700">{sessionCount}</span>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Balance</span>
               <span className={`text-sm font-black ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                 {totalDue} <span className="text-[9px]">CHF</span>
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Support Icons Missing in Local Import
function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
