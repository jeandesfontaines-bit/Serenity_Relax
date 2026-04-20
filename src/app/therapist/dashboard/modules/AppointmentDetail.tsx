'use client';

import React, { useState } from 'react';
import {
  X, Clock, Smartphone, CreditCard, Banknote, Calendar, ChevronRight, Edit3, Save, Trash2, Users
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
      <div className="absolute inset-0 bg-sapphire/30 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full sm:max-w-[400px] bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
        
        {/* Header - Clinical & Sharp */}
        <div className="px-m pt-xl pb-m flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-xs group">
              <h2 className="font-heading text-h4 font-black text-sapphire tracking-heading leading-heading truncate uppercase">
                {current.clientNameSnapshot?.split(' ')[1]} {current.clientNameSnapshot?.split(' ')[0]}
              </h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-xs text-samaritan hover:text-azraq transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-xs mt-xs text-samaritan font-bold text-small uppercase tracking-widest">
              <Calendar size={12} className="shrink-0" />
              <span>{dateLabel}</span>
              <span>•</span>
              <Clock size={12} className="shrink-0" />
              <span className="text-azraq">{current.time}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-xl h-xl flex items-center justify-center rounded-full bg-bg-soft text-samaritan hover:bg-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-m pb-xl space-y-m">
          
          {/* Main Info Blocks */}
          <div className="grid grid-cols-2 gap-s">
             <div className="bg-bg-soft/50 border border-border rounded-card-inner p-m transition-all">
                <span className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest block mb-xs">Soin</span>
                {isEditing ? (
                  <input 
                    autoFocus
                    value={editData.serviceName} 
                    onChange={e => setEditData({...editData, serviceName: e.target.value})}
                    className="w-full bg-white border border-border rounded-md px-xxs py-xxs font-heading text-small font-bold text-sapphire focus:outline-none focus:ring-2 focus:ring-azraq/10"
                  />
                ) : (
                  <p className="font-body text-small font-bold text-sapphire leading-body">{simplifyServiceName(current.serviceName || '')}</p>
                )}
             </div>
             <div className="bg-bg-soft/50 border border-border rounded-card-inner p-m transition-all">
                <span className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest block mb-xs">Tarif</span>
                {isEditing ? (
                  <div className="flex items-center gap-xxs">
                    <input 
                      type="number"
                      value={editData.price} 
                      onChange={e => setEditData({...editData, price: Number(e.target.value)})}
                      className="w-full bg-white border border-border rounded-md px-xxs py-xxs font-heading text-small font-bold text-sapphire focus:outline-none focus:ring-2 focus:ring-azraq/10"
                    />
                    <span className="font-heading text-[10px] font-bold text-samaritan">CHF</span>
                  </div>
                ) : (
                  <p className="font-heading text-small font-black text-sapphire">{current.price || 150} <span className="text-[10px] text-samaritan">CHF</span></p>
                )}
             </div>
          </div>

          {isEditing && (
            <button 
              onClick={handleSaveEdit}
              className="w-full h-11 bg-azraq text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-azraq/10 animate-in zoom-in-95"
            >
              <Save size={14} /> Enregistrer
            </button>
          )}

          {/* Payment Section - Ultra Compact */}
          {!isEditing && (
            <div className={`rounded-xl border transition-all px-m py-s flex items-center justify-between ${current.paid ? 'bg-aurora border-aurora' : 'bg-carrot/10 border-carrot/20'}`}>
              <div>
                <span className="font-heading text-[8px] font-black text-samaritan uppercase tracking-widest block leading-none mb-xxs">Règlement</span>
                <p className={`font-heading text-small font-black uppercase tracking-widest ${current.paid ? 'text-white' : 'text-carrot'}`}>
                  {current.paid ? `PAYÉ ${current.paymentMethod ? `(${current.paymentMethod})` : ''}` : 'À ENCAISSER'}
                </p>
              </div>
              
              {!current.paid ? (
                !showPaymentSelector ? (
                  <button 
                    onClick={() => setShowPaymentSelector(true)}
                    className="h-9 px-5 bg-azraq hover:bg-azraq/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    Encaisser
                  </button>
                ) : (
                  <div className="flex items-center gap-xxs animate-in slide-in-from-right-4">
                    {(['Twint', 'Cash', 'Card'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => handleUpdatePayment(m)}
                        className="w-xl h-xl flex flex-col items-center justify-center bg-white border border-border rounded-md hover:border-azraq transition-all group"
                      >
                        {m === 'Twint' ? <Smartphone size={12} className="text-azraq" /> : m === 'Cash' ? <Banknote size={12} className="text-azraq" /> : <CreditCard size={12} className="text-azraq" />}
                        <span className="font-heading text-[7px] font-black uppercase mt-xxs text-azraq">{m}</span>
                      </button>
                    ))}
                    <button onClick={() => setShowPaymentSelector(false)} className="ml-1 text-samaritan/30 hover:text-tomato"><X size={14} /></button>
                  </div>
                )
              ) : (
                <button onClick={handleTogglePaid} className="text-[9px] font-black text-white/60 uppercase hover:underline">Annuler</button>
              )}
            </div>
          )}

          {/* Patient Shortcuts */}
          <div className="grid grid-cols-1 gap-xs">
            <button 
              onClick={() => onGoToClient?.(current.clientId!)}
              className="w-full flex items-center justify-between h-xl px-m bg-white border border-border rounded-card-inner hover:bg-bg-soft transition-all group"
            >
              <div className="flex items-center gap-s">
                <Users size={15} className="text-samaritan group-hover:text-azraq transition-colors" />
                <span className="font-heading text-small font-black uppercase text-sapphire tracking-widest">Accès dossier complet</span>
              </div>
              <ChevronRight size={14} className="text-samaritan group-hover:translate-x-xxs transition-all" />
            </button>
            <button 
              onClick={() => onSendWhatsApp?.(current, 'followup')}
              className="w-full flex items-center justify-between h-xl px-m bg-white border border-border rounded-card-inner hover:bg-bg-soft transition-all group"
            >
              <div className="flex items-center gap-s">
                <Smartphone size={15} className="text-samaritan group-hover:text-aurora transition-colors" />
                <span className="font-heading text-small font-black uppercase text-sapphire tracking-widest">Suivi / Rappel</span>
              </div>
              <ChevronRight size={14} className="text-samaritan group-hover:translate-x-xxs transition-all" />
            </button>
          </div>

          {/* Quick Stats - Compacted */}
          <div className="flex gap-xs pt-xs">
            <div className="flex-1 bg-bg-soft/50 border border-border rounded-card-inner p-s text-center">
               <span className="font-heading text-[8px] font-black text-samaritan uppercase tracking-widest block mb-xxs">Visites</span>
               <span className="font-heading text-small font-black text-sapphire">{sessionCount}</span>
            </div>
            <div className="flex-1 bg-bg-soft/50 border border-border rounded-card-inner p-s text-center">
               <span className="font-heading text-[8px] font-black text-samaritan uppercase tracking-widest block mb-xxs">Balance</span>
               <span className={`font-heading text-small font-black ${totalDue > 0 ? 'text-tomato' : 'text-aurora'}`}>
                 {totalDue} <span className="text-[9px]">CHF</span>
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


