'use client';

import React, { useState } from 'react';
import {
  X, Clock, Smartphone, CreditCard, Banknote, Calendar, ChevronRight, Edit3, Save, Trash2, Users, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { simplifyServiceName } from '@/lib/utils';

interface AppointmentDetailProps {
  appt: Appointment;
  onClose: () => void;
  appointments: Appointment[];
  onSelectClient?: (clientId: string) => void;
  onSendWhatsApp?: (appt: Appointment, type: 'followup' | 'confirmation') => void;
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
    serviceName: current.serviceName || '',
    price: current.price || 150
  });

  const clientAppts = appointments
    .filter(a => a.clientId === appt.clientId || a.clientNameSnapshot === appt.clientNameSnapshot)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sessionCount = clientAppts.length;
  const totalDue = appointments
    .filter(a => a.clientId === appt.clientId && !a.paid && a.status !== 'cancelled')
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

  const dayLabel = current.date ? format(new Date(current.date), 'EEEE d MMMM', { locale: fr }) : '—';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-onyx/40 backdrop-blur-2xl" onClick={onClose} />

      <div className="relative w-full max-w-[440px] bg-[#F4F2EE] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
        
        {/* TOP STATUS BAR */}
        <div className="h-2 bg-neon w-full" />
        
        <div className="p-10 space-y-8">
           {/* HEADER */}
           <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-forest/10 text-forest rounded-full text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1">
                       <Sparkles size={10} /> Séance Confirmée
                    </span>
                 </div>
                 <h2 className="text-[36px] font-semibold text-onyx tracking-tighter leading-none uppercase truncate">
                    {current.clientNameSnapshot}
                 </h2>
                 <div className="flex items-center gap-3 mt-4 text-earth/50 font-bold text-[13px] uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {dayLabel}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-onyx">{current.time}</span>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-border/10 text-earth hover:text-onyx transition-all shadow-sm"
              >
                <X size={20} />
              </button>
           </div>

           {/* SERVICE & PRICE CARD */}
           <div className="bg-white rounded-[32px] p-8 border border-border/10 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-earth/30 uppercase tracking-[0.2em]">Prestation</span>
                    {isEditing ? (
                       <input 
                         value={editData.serviceName}
                         onChange={e => setEditData({...editData, serviceName: e.target.value})}
                         className="text-[18px] font-semibold text-onyx outline-none border-b border-neon w-full"
                       />
                    ) : (
                       <p className="text-[18px] font-semibold text-onyx uppercase tracking-tighter">{simplifyServiceName(current.serviceName || '')}</p>
                    )}
                 </div>
                 <button onClick={() => setIsEditing(!isEditing)} className="text-earth/30 hover:text-onyx transition-all">
                    {isEditing ? <Save onClick={handleSaveEdit} size={18}/> : <Edit3 size={18}/>}
                 </button>
              </div>

              <div className="pt-6 border-t border-border/5 flex justify-between items-end">
                 <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-earth/30 uppercase tracking-[0.2em]">Montant</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-[32px] font-semibold text-onyx tracking-tighter leading-none">{current.price || 150}</span>
                       <span className="text-[12px] font-bold text-earth/40 uppercase">CHF</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold text-earth/30 uppercase tracking-[0.2em]">Sessions</span>
                    <span className="text-[14px] font-semibold text-forest">#{sessionCount}</span>
                 </div>
              </div>
           </div>

           {/* PAYMENT PILL */}
           <div className={`p-1.5 rounded-full border transition-all flex items-center justify-between ${current.paid ? 'bg-[#E1FBB8] border-[#E1FBB8]' : 'bg-[#FF6B61]/10 border-[#FF6B61]/20'}`}>
              <div className="px-6 py-2">
                 <span className={`text-[12px] font-semibold uppercase tracking-widest ${current.paid ? 'text-forest' : 'text-[#FF6B61]'}`}>
                    {current.paid ? `RÉGLÉ - ${current.paymentMethod}` : 'PAIEMENT DÛ'}
                 </span>
              </div>
              
              {!current.paid ? (
                 <div className="flex items-center gap-1">
                    {showPaymentSelector ? (
                       <div className="flex items-center gap-1 animate-in slide-in-from-right-4">
                          {['Twint', 'Cash', 'Card'].map(m => (
                             <button key={m} onClick={() => handleUpdatePayment(m)} className="h-10 px-4 bg-white rounded-full text-[10px] font-semibold uppercase hover:bg-onyx hover:text-white transition-all shadow-sm">
                                {m}
                             </button>
                          ))}
                          <button onClick={() => setShowPaymentSelector(false)} className="px-2 text-earth/40 hover:text-onyx transition-all"><X size={16}/></button>
                       </div>
                    ) : (
                       <button onClick={() => setShowPaymentSelector(true)} className="h-10 px-6 bg-onyx text-white rounded-full text-[11px] font-semibold uppercase tracking-widest shadow-lg">
                          Encaisser
                       </button>
                    )}
                 </div>
              ) : (
                 <button onClick={handleTogglePaid} className="px-6 py-2 text-[10px] font-semibold text-forest hover:underline uppercase">Annuler</button>
              )}
           </div>

           {/* ACTIONS */}
           <div className="flex flex-col gap-3">
              <button 
                onClick={() => onGoToClient?.(current.clientId!)}
                className="w-full h-14 bg-white border border-border/10 rounded-2xl flex items-center justify-between px-6 hover:bg-bg-soft transition-all group shadow-sm"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-bg-soft flex items-center justify-center text-onyx"><Users size={16}/></div>
                    <span className="text-[13px] font-semibold uppercase text-onyx tracking-widest">Dossier Patient</span>
                 </div>
                 <ChevronRight size={18} className="text-earth/30 group-hover:translate-x-1 transition-all" />
              </button>
              
              <button 
                onClick={() => onSendWhatsApp?.(current, 'followup')}
                className="w-full h-14 bg-white border border-border/10 rounded-2xl flex items-center justify-between px-6 hover:bg-bg-soft transition-all group shadow-sm"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-bg-soft flex items-center justify-center text-onyx"><Smartphone size={16}/></div>
                    <span className="text-[13px] font-semibold uppercase text-onyx tracking-widest">Relancer WhatsApp</span>
                 </div>
                 <ChevronRight size={18} className="text-earth/30 group-hover:translate-x-1 transition-all" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
