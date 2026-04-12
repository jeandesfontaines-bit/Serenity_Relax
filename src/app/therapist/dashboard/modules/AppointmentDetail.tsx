import React, { useState } from 'react';
import { 
  X, MessageCircle, Mail, FileText, Activity, 
  Clock, Phone, CheckCircle2, AlertCircle, Save
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
}

export default function AppointmentDetail({ appt, onClose, appointments = [] }: AppointmentDetailProps) {
  const firestore = useFirestore();
  const [notes, setNotes] = useState(appt.notes || '');
  const [isSaving, setIsSaving] = useState(false);

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

  const day = appt.date ? format(new Date(appt.date), 'dd') : '--';
  const month = appt.date ? format(new Date(appt.date), 'MMM', { locale: fr }).replace('.', '').toUpperCase() : '??';

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
            <div className="w-24 h-28 bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl shadow-slate-900/10 shrink-0">
              <div className="text-4xl font-black mb-1">{day}</div>
              <div className="text-[10px] font-black tracking-[0.3em] opacity-60">{month}</div>
            </div>
            <div className="flex-1 pt-2">
              <h2 className="text-2xl lg:text-3xl font-black text-[#222F3E] tracking-tighter uppercase mb-2">
                {appt.clientNameSnapshot || appt.title}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex flex-wrap justify-center sm:justify-start items-center gap-2">
                {appt.date ? format(new Date(appt.date), 'EEEE d MMMM yyyy', { locale: fr }) : 'Date inconnue'}
                <span className="opacity-30 hidden sm:inline">·</span>
                <span className="text-[#5F27CD]">{appt.time}</span>
              </p>
              <div className="mt-6 flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${appt.paid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                   {appt.paid ? 'SÉANCE RÉGLÉE' : 'PAIEMENT EN ATTENTE'}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                   {appt.serviceName || 'Aromathérapie'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-[#25D366]/5 text-[#25D366] border border-[#25D366]/10 hover:bg-[#25D366] hover:text-white transition-all group">
              <MessageCircle className="mb-3 group-hover:scale-110 transition-transform" size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-[#5F27CD]/5 text-[#5F27CD] border border-[#5F27CD]/10 hover:bg-[#5F27CD] hover:text-white transition-all group">
              <Mail className="mb-3 group-hover:scale-110 transition-transform" size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all group">
              <FileText className="mb-3 group-hover:scale-110 transition-transform" size={20} />
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
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-black text-sm shadow-inner">{appt.price || 150}</div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Tarif Séance</p>
                   <p className="text-sm font-black text-slate-900">CHF {appt.price || 150}.00</p>
                 </div>
              </div>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={20}/></div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Téléphone</p>
                   <p className="text-sm font-black text-slate-900">{appt.phone || 'Non renseigné'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Activity size={20}/></div>
                 <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Statut</p>
                   <p className="text-sm font-black text-slate-900">{appt.paid ? 'Honoré & Réglé' : 'En attente'}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Stats & Notes */}
        <div className="w-full lg:w-[450px] bg-[#F8F9FA] p-10 lg:p-14 border-l border-slate-100 flex flex-col gap-10">
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
                  <span className="font-black text-lg">{lastVisit?.date ? format(new Date(lastVisit.date), 'dd MMM yyyy', { locale: fr }) : '—'}</span>
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
              className={`mt-6 h-14 w-full rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95
                ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-[#5F27CD] shadow-indigo-100'}`}
            >
              {isSaving ? <CheckCircle2 size={16} className="animate-bounce" /> : <Save size={16}/>}
              {isSaving ? 'Enregistrement...' : 'Sauvegarder les notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
