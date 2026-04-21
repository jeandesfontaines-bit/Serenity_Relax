import React, { useState } from 'react';
import { X, CalendarClock, ArrowDown, ChevronLeft, ChevronRight, Check, Activity, Calendar, Clock, MapPin, CreditCard, Mail, Trash2, FileText } from 'lucide-react';
import { Appointment } from '../types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RescheduleModalProps {
  appt: Appointment;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string, note: string) => void;
  onCancelAppt?: (id: string) => void;
  onResendConfirmation?: (appt: Appointment) => void;
}

const AVAILABLE_TIMES = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'];
const DISABLED_TIMES = ['08:00', '09:00', '14:30'];

export default function RescheduleModal({
  appt, onClose, onConfirm, onCancelAppt, onResendConfirmation
}: RescheduleModalProps) {
  const today = new Date();
  const startDay = startOfWeek(today, { weekStartsOn: 1 });
  
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string>('11:00');
  const [note, setNote] = useState('');

  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startDay, i));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-onyx/60 backdrop-blur-3xl" onClick={onClose} />

      <div className="relative w-full max-w-[1100px] h-full max-h-[85vh] bg-[#F4F2EE] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className="p-8 pb-4 flex items-end justify-between border-b border-border/10 shrink-0 bg-white/50 backdrop-blur-md">
           <div>
              <div className="flex items-center gap-2 text-earth/50 font-bold text-[12px] uppercase tracking-widest mb-3">
                 <span>Clients</span> <span className="opacity-40">/</span>
                 <span>{appt.clientNameSnapshot}</span> <span className="opacity-40">/</span>
                 <span className="text-onyx">Reprogrammer</span>
              </div>
              <h1 className="text-[36px] font-semibold text-onyx tracking-tighter uppercase leading-none">Gestion de la séance</h1>
           </div>

           <div className="flex items-center gap-3">
              <button onClick={() => onResendConfirmation?.(appt)} className="h-12 px-6 bg-white border border-border/20 rounded-full flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-onyx hover:bg-bg-soft transition-all shadow-sm">
                 <Mail size={16}/> Confirmation
              </button>
              <button className="h-12 px-6 bg-white border border-border/20 rounded-full flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-onyx hover:bg-bg-soft transition-all shadow-sm">
                 <FileText size={16}/> Facture
              </button>
              <button 
                onClick={() => { onCancelAppt?.(appt.id); onClose(); }} 
                className="h-12 px-6 bg-white border border-[#FF6B61]/30 rounded-full flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#FF6B61] hover:bg-[#FF6B61]/5 transition-all shadow-sm"
              >
                 <Trash2 size={16}/> Annuler
              </button>
              <div className="w-px h-8 bg-border ml-2 mr-2" />
              <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-border/20 text-earth hover:text-onyx transition-all shadow-sm"><X size={20}/></button>
           </div>
        </div>

        {/* CONTENT GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row p-8 gap-8">
           
           {/* LEFT SIDEBAR - INFO */}
           <div className="w-full lg:w-[380px] bg-white rounded-[32px] p-8 border border-border/10 shadow-sm shrink-0 flex flex-col gap-8 h-fit">
              <div className="flex items-center gap-5 border-b border-border/10 pb-8">
                 <div className="w-14 h-14 rounded-full bg-onyx text-neon flex items-center justify-center font-semibold text-[18px]">
                    {appt.clientNameSnapshot?.charAt(0)}
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[18px] font-semibold text-onyx uppercase truncate">{appt.clientNameSnapshot}</span>
                    <span className="text-[12px] font-bold text-earth/50">+41 79 XXX XX XX</span>
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                 {[
                   { icon: Activity, label: 'Type de prestation', val: appt.serviceName || 'Séance (Standard)' },
                   { icon: Calendar, label: 'Date prévue', val: appt.date ? format(new Date(appt.date), 'EEEE d MMMM yyyy', { locale: fr }) : '—' },
                   { icon: Clock, label: 'Horaire', val: `${appt.time || '—'} (1h)` },
                   { icon: MapPin, label: 'Lieu', val: 'Cabinet Principal' },
                   { icon: CreditCard, label: 'Tarif / Facturation', val: `${appt.price || 150} CHF` }
                 ].map((d, i) => (
                    <div key={i} className="flex gap-4">
                       <d.icon size={20} className="text-earth/30 mt-0.5 shrink-0" />
                       <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-earth/50 uppercase tracking-widest">{d.label}</span>
                          <span className="text-[14px] font-semibold text-onyx">{d.val}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* RIGHT CONTENT - RESCHEDULE */}
           <div className="flex-1 bg-white rounded-[32px] p-10 border border-border/10 shadow-sm flex flex-col gap-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-[24px] font-semibold text-onyx uppercase tracking-tighter">Reprogrammer</h2>
                 <span className="px-4 py-1.5 bg-[#E1FBB8] text-forest rounded-full text-[11px] font-semibold uppercase tracking-widest">Modifiable</span>
              </div>

              <div className="flex items-center justify-between px-6 py-4 bg-bg-soft/50 border border-dashed border-border/40 rounded-2xl">
                 <div className="flex items-center gap-4">
                    <CalendarClock size={24} className="text-earth/40" />
                    <span className="text-[14px] font-bold text-earth/60">Horaire actuel : <strong className="font-semibold text-onyx">{appt.date} à {appt.time}</strong></span>
                 </div>
                 <ArrowDown size={20} className="text-earth/30" />
              </div>

              {/* DATE SCROLLER */}
              <div className="flex flex-col gap-4">
                 <label className="text-[13px] font-semibold text-onyx uppercase tracking-widest">Choisir une nouvelle date</label>
                 <div className="flex items-center gap-3">
                    <button className="w-12 h-12 bg-white border border-border/20 rounded-full flex items-center justify-center text-earth/40 hover:text-onyx shadow-sm shrink-0">
                       <ChevronLeft size={18} />
                    </button>
                    
                    {weekDays.map((d, i) => {
                       const active = isSameDay(d, selectedDate);
                       return (
                          <div 
                             key={i} 
                             onClick={() => setSelectedDate(d)}
                             className={`flex-1 h-[80px] rounded-[20px] flex flex-col items-center justify-center gap-1 border border-transparent cursor-pointer transition-all ${
                               active ? 'bg-onyx text-white shadow-xl ring-1 ring-onyx' : 'bg-white border-border/20 text-onyx hover:bg-bg-soft'
                             }`}
                          >
                             <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${active ? 'text-white/60' : 'text-earth/40'}`}>
                                {format(d, 'EEE', { locale: fr })}
                             </span>
                             <span className="text-[24px] font-semibold leading-none">{format(d, 'd')}</span>
                          </div>
                       )
                    })}

                    <button className="w-12 h-12 bg-white border border-border/20 rounded-full flex items-center justify-center text-earth/40 hover:text-onyx shadow-sm shrink-0">
                       <ChevronRight size={18} />
                    </button>
                 </div>
              </div>

              {/* TIME GRID */}
              <div className="flex flex-col gap-4 pt-4">
                 <label className="text-[13px] font-semibold text-onyx uppercase tracking-widest">Créneaux disponibles</label>
                 <div className="grid grid-cols-4 gap-3">
                    {AVAILABLE_TIMES.map(t => {
                       const disabled = DISABLED_TIMES.includes(t);
                       const active = selectedTime === t;
                       return (
                          <div 
                             key={t}
                             onClick={() => !disabled && setSelectedTime(t)}
                             className={`h-12 rounded-xl flex items-center justify-center text-[14px] transition-all ${
                               disabled ? 'bg-bg-soft text-earth/20 line-through cursor-not-allowed' :
                               active ? 'bg-[#E5FD98] text-forest font-semibold border border-[#E1FBB8] shadow-sm' :
                               'bg-white border border-border/20 text-onyx font-bold hover:bg-bg-soft cursor-pointer shadow-sm'
                             }`}
                          >
                             {t}
                          </div>
                       )
                    })}
                 </div>
              </div>

              {/* REASON TEXTAREA */}
              <div className="flex flex-col gap-4 pt-4">
                 <label className="text-[13px] font-semibold text-onyx uppercase tracking-widest">Message au patient</label>
                 <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajouter une note ou un motif de décalage..."
                    className="w-full h-[100px] p-6 bg-white border border-border/20 rounded-2xl shadow-sm text-[14px] font-medium text-onyx outline-none focus:ring-1 focus:ring-onyx resize-none"
                 />
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border/10 mt-auto">
                 <button onClick={onClose} className="h-14 px-8 rounded-full text-[13px] font-semibold text-earth/60 uppercase tracking-widest hover:bg-bg-soft transition-all">
                    Fermer
                 </button>
                 <button 
                  onClick={() => onConfirm(format(selectedDate, 'yyyy-MM-dd'), selectedTime, note)}
                  className="h-14 px-8 bg-onyx text-white rounded-full flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] shadow-xl hover:bg-forest transition-all"
                 >
                    <Check size={18} /> Validité
                 </button>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
