'use client';
import React, { useState } from 'react';
import { 
  X, CalendarClock, ArrowDown, ChevronLeft, ChevronRight, Check, 
  Activity, Calendar, Clock, MapPin, CreditCard, Mail, Trash2, 
  FileText, ArrowRight, Save, Info, AlertTriangle, User
} from 'lucide-react';
import { Appointment } from '../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

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

  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDay, i));

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 backdrop-blur-2xl bg-primary/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-[1200px] rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border/30 bg-background"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="px-16 py-12 border-b border-border/30 flex items-center justify-between bg-background">
          <div className="flex items-center gap-10">
             <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-primary-foreground shadow-2xl rotate-3 bg-primary">
                <CalendarClock size={28} strokeWidth={2.5} />
             </div>
             <div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] mb-2 text-muted-foreground/60">
                   <span>GESTION SÉANCE</span>
                   <span className="opacity-40">/</span>
                   <span className="text-foreground">{appt.clientNameSnapshot}</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter leading-none text-foreground">Reprogrammer</h2>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button onClick={() => onResendConfirmation?.(appt)} className="h-12 px-6 rounded-full border border-border/30 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 text-muted-foreground hover:border-primary hover:text-primary">
                <Mail size={16} strokeWidth={2.5} /> CONFIRMATION
             </button>
             <button 
                onClick={() => { onCancelAppt?.(appt.id); onClose(); }} 
                className="h-12 px-6 rounded-full border border-destructive/20 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 group text-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground"
             >
                <Trash2 size={16} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" /> ANNULER RDV
             </button>
             <div className="w-px h-10 mx-2 bg-border/30" />
             <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-full transition-all bg-secondary text-muted-foreground hover:bg-secondary/80">
                <X size={20} strokeWidth={3} />
             </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-16 p-16">
           
           {/* Sidebar Info */}
           <aside className="space-y-12">
              <div className="rounded-[3rem] p-12 border border-border/30 bg-background shadow-sm space-y-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <User size={120} strokeWidth={1} />
                 </div>
                 
                 <div className="flex items-center gap-6 border-b border-border/30 pb-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-xl bg-primary">
                       {appt.clientNameSnapshot?.charAt(0)}
                    </div>
                    <div>
                       <p className="text-2xl font-black tracking-tighter text-foreground">{appt.clientNameSnapshot}</p>
                       <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2 text-muted-foreground/60">DOSSIER ACTIF</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <InfoRow icon={Activity} label="PRESTATION" value={cleanServiceLabel(appt.serviceName) || 'Soin'} />
                    <InfoRow icon={Calendar} label="DATE ACTUELLE" value={appt.date || '—'} />
                    <InfoRow icon={Clock} label="HORAIRE" value={appt.time || '—'} />
                    <InfoRow icon={CreditCard} label="VALEUR" value={`${appt.price || 150} CHF`} />
                 </div>

                 <div className="pt-6 border-t border-border/30">
                    <button className="w-full h-14 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-700 group bg-secondary text-muted-foreground hover:bg-secondary/80">
                       <FileText size={16} strokeWidth={2.5} /> VOIR FACTURE
                    </button>
                 </div>
              </div>

              <div className="rounded-3xl p-10 border border-amber-500/30 bg-amber-500/10 flex items-start gap-6">
                 <AlertTriangle size={24} className="shrink-0 mt-1 text-amber-500" />
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-500">ATTENTION</p>
                    <p className="text-sm font-medium leading-relaxed text-amber-500">Toute modification enverra une notification automatique au patient.</p>
                 </div>
              </div>
           </aside>

           {/* Main Selection Area */}
           <div className="space-y-16">
              <div className="flex items-center justify-between border-b border-border/30 pb-8">
                 <h3 className="text-4xl font-black tracking-tighter text-foreground">Nouvel Horaire</h3>
                 <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> DISPONIBILITÉS EN TEMPS RÉEL
                 </div>
              </div>

              {/* Current Status Recap */}
              <div className="rounded-[3rem] p-10 flex items-center justify-between text-primary-foreground shadow-2xl relative overflow-hidden group bg-primary">
                 <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                       <CalendarClock size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-2">PROGRAMMATION INITIALE</p>
                       <p className="text-2xl font-black tracking-tighter">{appt.date} à {appt.time}</p>
                    </div>
                 </div>
                 <ArrowRight size={32} strokeWidth={2} className="text-white/20 group-hover:translate-x-4 transition-transform duration-700" />
              </div>

              {/* Date Scroller */}
              <div className="space-y-6">
                 <p className="text-[11px] font-bold uppercase tracking-[0.4em] px-6 text-muted-foreground/60">SÉLECTION DE LA DATE</p>
                 <div className="flex items-center gap-4">
                    <button className="w-12 h-12 flex items-center justify-center rounded-full border border-border/30 transition-all text-muted-foreground hover:bg-secondary">
                       <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <div className="flex-1 grid grid-cols-6 gap-3">
                       {weekDays.map((d, i) => {
                         const active = isSameDay(d, selectedDate);
                         return (
                           <button
                             key={i}
                             onClick={() => setSelectedDate(d)}
                             className={`h-24 flex flex-col items-center justify-center rounded-[2rem] border transition-all duration-700 ${
                               active 
                                 ? 'text-primary-foreground shadow-xl scale-105 z-10 border-transparent bg-primary' 
                                 : 'border-border/30 bg-transparent hover:border-primary/50 text-foreground'
                             }`}
                           >
                             <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${active ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                               {format(d, 'EEE', { locale: fr })}
                             </span>
                             <span className="text-3xl font-black tracking-tighter leading-none">{format(d, 'd')}</span>
                           </button>
                         );
                       })}
                    </div>
                    <button className="w-12 h-12 flex items-center justify-center rounded-full border border-border/30 transition-all text-muted-foreground hover:bg-secondary">
                       <ChevronRight size={20} strokeWidth={3} />
                    </button>
                 </div>
              </div>

              {/* Time Grid */}
              <div className="space-y-6">
                 <p className="text-[11px] font-bold uppercase tracking-[0.4em] px-6 text-muted-foreground/60">CRÉNEAUX DISPONIBLES</p>
                 <div className="grid grid-cols-4 gap-4">
                    {AVAILABLE_TIMES.map(t => {
                      const disabled = DISABLED_TIMES.includes(t);
                      const active = selectedTime === t;
                      return (
                        <button
                          key={t}
                          disabled={disabled}
                          onClick={() => setSelectedTime(t)}
                          className={`h-16 rounded-full text-lg font-black tracking-tighter transition-all duration-700 border ${
                            disabled ? 'cursor-not-allowed opacity-50 border-border/30 bg-secondary/50 text-muted-foreground' :
                            active ? 'text-primary-foreground shadow-xl scale-105 z-10 border-transparent bg-primary' :
                            'border-border/30 bg-transparent hover:border-primary/50 text-foreground shadow-sm'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                 </div>
              </div>

              {/* Note */}
              <div className="space-y-4">
                 <label className="text-[11px] font-bold uppercase tracking-[0.4em] px-6 text-muted-foreground/60">NOTE AU PATIENT (OPTIONNEL)</label>
                 <textarea
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   placeholder="Indiquez le motif de la reprogrammation..."
                   className="w-full h-32 p-10 rounded-3xl border border-border/30 text-lg font-medium focus:ring-4 transition-all duration-700 outline-none resize-none leading-relaxed shadow-inner bg-secondary focus:bg-background focus:ring-primary/10 text-foreground"
                 />
              </div>

              {/* Action */}
              <div className="pt-8">
                 <button
                   onClick={() => onConfirm(format(selectedDate, 'yyyy-MM-dd'), selectedTime, note)}
                   className="w-full h-24 rounded-[3rem] text-primary-foreground text-[13px] font-bold uppercase tracking-[0.5em] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-2 active:scale-95 transition-all duration-700 flex items-center justify-center gap-6 group bg-primary"
                 >
                   <Save size={24} strokeWidth={2.5} className="group-hover:scale-125 transition-transform duration-700" />
                   VALIDER LA REPROGRAMMATION
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
   return (
      <div className="flex items-center gap-6 group">
         <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-inner bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
            <Icon size={18} strokeWidth={2.5} />
         </div>
         <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-1 text-muted-foreground/60">{label}</p>
            <p className="text-base font-black tracking-tighter text-foreground">{value}</p>
         </div>
      </div>
   );
}
