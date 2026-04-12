import React, { useState } from 'react';
import { 
  X, MessageCircle, Mail, FileText, Activity, 
  Clock, Phone, CheckCircle2, AlertCircle, Save, Smartphone, CreditCard, Banknote,
  Calendar, User
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
  onGoToClient?: (clientId: string) => void;
}

export default function AppointmentDetail({ appt, onClose, appointments = [], onGoToClient }: AppointmentDetailProps) {
  const firestore = useFirestore();
  const currentAppt = appointments.find(a => a.id === appt.id) || appt;
  const [notes, setNotes] = useState(currentAppt.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const handleUpdatePayment = async (method: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'appointments', appt.id), { 
        paid: true, 
        paymentMethod: method 
      });
      setShowPaymentSelector(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePaid = async () => {
    if (!firestore) return;
    if (currentAppt.paid) {
      await updateDoc(doc(firestore, 'appointments', appt.id), { paid: false, paymentMethod: null });
    } else {
      setShowPaymentSelector(true);
    }
  };

  // Stats for the side panel
  const clientAppts = appointments
    .filter(a => a.clientId === appt.clientId || (a.title === appt.clientNameSnapshot && appt.clientNameSnapshot))
    .sort((a, b) => {
      const dateA = a?.date || '';
      const dateB = b?.date || '';
      return dateB.localeCompare(dateA);
    });
  
  const sessionCount = clientAppts.length;
  const lastVisit = clientAppts.find(a => a.date < appt.date);
  const unpaidCount = appointments.filter(a => (a.clientId === appt.clientId) && !a.paid).length;
  const totalDue = appointments
    .filter(a => (a.clientId === appt.clientId) && !a.paid)
    .reduce((s, a) => s + (a.price || 150), 0);

  const handleSaveNotes = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(firestore, 'appointments', appt.id), { notes });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const day = currentAppt.date ? format(new Date(currentAppt.date), 'dd') : '--';
  const month = currentAppt.date ? format(new Date(currentAppt.date), 'MMM', { locale: fr }).replace('.', '').toUpperCase() : '??';

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full md:max-w-6xl h-[95vh] md:h-full md:max-h-[850px] rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in slide-in-from-bottom md:zoom-in-95 duration-500">
        {/* Drawer Handle (Mobile Only) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50 w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
        >
          <X size={20} className="lg:w-6 lg:h-6" strokeWidth={2.5} />
        </button>

        {/* Left Panel: Primary Info & Actions */}
        <div className="flex-1 p-8 lg:p-14 overflow-y-auto space-y-10 lg:space-y-12">
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10 text-center sm:text-left">
            <div className="w-24 h-28 bg-[#5F27CD] rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-[0_10px_40px_-10px_rgba(95,39,205,0.5)] shrink-0">
              <div className="text-xs font-black tracking-widest opacity-80 uppercase">{day} {month}</div>
              <div className="text-3xl font-black leading-none mt-1">{currentAppt.time}</div>
            </div>
            <div className="flex-1 pt-0 sm:pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                <h2 className="text-3xl lg:text-4xl font-black text-[#222F3E] tracking-tighter uppercase leading-none">
                  {currentAppt.clientNameSnapshot || currentAppt.title}
                </h2>
                {currentAppt.clientId && (
                  <button 
                    onClick={() => onGoToClient?.(currentAppt.clientId as string)}
                    className="w-fit h-9 px-5 rounded-full bg-slate-50 text-slate-500 border border-slate-100 font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    Ouvrir la fiche patient
                  </button>
                )}
              </div>
              <p className="text-[12px] font-bold text-slate-800 uppercase tracking-widest flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-6 bg-slate-50 border border-slate-100 rounded-full w-fit px-5 py-2">
                <Calendar size={14} className="text-[#5F27CD] opacity-80" />
                {currentAppt.date ? format(new Date(currentAppt.date), 'EEEE d MMMM yyyy', { locale: fr }) : 'Date inconnue'}
                <span className="opacity-30 mx-1">|</span>
                <Clock size={14} className="text-[#5F27CD] opacity-80" />
                <span className="font-black text-[#5F27CD]">{currentAppt.time}</span>
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 h-8">
                {showPaymentSelector ? (
                  <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                    {(['Twint', 'Card', 'Cash'] as const).map(m => (
                      <button key={m} onClick={() => handleUpdatePayment(m)} className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-[#5F27CD] hover:text-white transition-all text-slate-600">
                        {m === 'Twint' ? <Smartphone size={14}/> : m === 'Card' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                      </button>
                    ))}
                    <button onClick={() => setShowPaymentSelector(false)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={14}/></button>
                  </div>
                ) : (
                  <button 
                    onClick={handleTogglePaid}
                    className={`h-8 px-4 flex items-center rounded-full text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 shadow-sm ${currentAppt.paid ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'}`}
                  >
                     {currentAppt.paid ? 'SÉANCE RÉGLÉE' : 'PAIEMENT EN ATTENTE'}
                  </button>
                )}
                <span className="h-8 px-4 flex items-center rounded-full bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-100">
                   {currentAppt.serviceName || 'Soin Ciblé'}
                </span>
              </div>
            </div>

          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group shadow-sm active:scale-95">
              <MessageCircle className="mb-3 group-hover:-translate-y-1 transition-transform" size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group shadow-sm active:scale-95">
              <Mail className="mb-3 group-hover:-translate-y-1 transition-transform" size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group shadow-sm active:scale-95">
              <FileText className="mb-3 group-hover:-translate-y-1 transition-transform" size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">Facture</span>
            </button>
          </div>

          {/* Detailed Info Rows */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Détails de la séance</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Clock size={20}/></div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Durée Prévue</p>
                   <p className="text-sm font-black text-slate-900">60 Minutes</p>
                 </div>
              </div>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-black text-sm shadow-inner">{currentAppt.price || 150}</div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Tarif Séance</p>
                   <p className="text-sm font-black text-slate-900">CHF {currentAppt.price || 150}.00</p>
                 </div>
              </div>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={20}/></div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Téléphone</p>
                   <p className="text-sm font-black text-slate-900">{currentAppt.phone || 'Non renseigné'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Activity size={20}/></div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Statut</p>
                   <p className="text-sm font-black text-slate-900">{currentAppt.paid ? 'Honoré & Réglé' : 'En attente'}</p>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel: Stats & Notes */}
        <>
          {/* Mobile: Compact Bottom Sheet Style */}
          <div className="block lg:hidden w-full bg-white/95 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 pb-8 space-y-5 rounded-t-[3rem] mt-auto shrink-0 z-20">
            {/* Mobile Header Ultra-Compact */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-[#5F27CD] to-[#A855F7] rounded-xl flex items-center justify-center shadow-md">
                  <User size={16} className="text-white" strokeWidth={2.8} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 truncate leading-tight">{currentAppt.clientNameSnapshot || currentAppt.title}</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Actif</p>
                </div>
              </div>
              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                <Activity size={12} className="text-slate-500" />
              </div>
            </div>

            {/* Mobile Stats: Single Column */}
            <div className="space-y-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Résumé</div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">{sessionCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Séances</span>
                </div>
                <div className={`text-lg font-black mt-1 ${
                  totalDue > 0 ? 'text-rose-500' : 'text-emerald-600'
                }`}>
                  {totalDue} CHF
                  {totalDue > 0 && (
                    <AlertCircle className="inline ml-1 w-4 h-4 text-rose-400 relative -top-0.5" />
                  )}
                </div>
              </div>
              
              {lastVisit && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#5F27CD]/10 border border-[#5F27CD]/20 text-sm">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Dernière visite</div>
                  <div className="font-black text-slate-900">
                    {format(new Date(lastVisit.date), 'dd/MM', { locale: fr })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Notes: Compact */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-black text-slate-900 uppercase tracking-wider">
                  <FileText size={14} className="text-[#5F27CD]" />
                  Notes
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 font-black uppercase rounded-full">Privé</span>
              </div>
              
              <div className="relative">
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tension cervicales • Deep tissue 20min • Arnica..."
                  className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5F27CD]/30 focus:border-transparent shadow-sm"
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <button 
                onClick={handleSaveNotes}
                disabled={isSaving || !notes.trim()}
                className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest shadow-lg transition-all ${
                  isSaving || !notes.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-[#5F27CD] hover:shadow-2xl active:scale-[0.97]'
                }`}
              >
                {isSaving ? (
                  <CheckCircle2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isSaving ? 'Sauvegarde...' : `Enregistrer (${notes.length})`}
              </button>
            </div>
          </div>

          {/* Desktop Right Panel: Stats & Notes */}
          <div className="hidden lg:flex w-full lg:w-[450px] bg-[#F8F9FA] p-10 lg:p-14 border-l border-slate-100 flex-col gap-10">
            {/* Patient Quick Stats */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Historique Patient</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-2xl font-black text-slate-900">{sessionCount}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase mt-1">Séances</div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className={`text-2xl font-black ${totalDue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {totalDue}
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase mt-1">Solde dû (CHF)</div>
                </div>
              </div>
              {lastVisit && (
                <div className="bg-[#5F27CD] p-5 rounded-3xl text-white shadow-lg shadow-indigo-200">
                  <div className="text-[9px] font-black uppercase opacity-60 mb-2">Dernière visite</div>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg">{format(new Date(lastVisit.date), 'dd MMM yyyy', { locale: fr })}</span>
                    <Activity size={16} className="opacity-60" />
                  </div>
                </div>
              )}
            </div>

            {/* Session Notes Card */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-black text-[#222F3E] uppercase tracking-wider flex items-center gap-2">
                   <FileText size={16} className="text-[#5F27CD]" /> Notes de séance
                 </h3>
                 <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[8px] font-black uppercase rounded-full">Privé</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed">Observations cliniques, protocole utilisé et recommandations...</p>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Saisissez vos notes ici..."
                className="flex-1 w-full p-6 bg-slate-50 border-none rounded-2xl text-[13px] font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5F27CD]/20 transition-all resize-none"
              />
              <button 
                onClick={handleSaveNotes}
                disabled={isSaving}
                className={`mt-6 h-14 w-full rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95
                  ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm'}`}
              >
                {isSaving ? <CheckCircle2 size={16} className="animate-bounce" /> : <Save size={16}/>}
                {isSaving ? 'Enregistrement...' : 'Sauvegarder les notes'}
              </button>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}
