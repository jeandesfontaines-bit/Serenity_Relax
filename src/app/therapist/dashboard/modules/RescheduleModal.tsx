'use client';
import React, { useState } from 'react';
import { X, CalendarClock, ArrowDown, ChevronLeft, ChevronRight, Check, Activity, Calendar, Clock, MapPin, CreditCard, Mail, Trash2, FileText } from 'lucide-react';
import { Appointment } from '../types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-[1100px] h-full max-h-[85vh] bg-[#faf9f7] border border-zinc-200 flex flex-col overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* HEADER */}
        <div className="px-10 py-8 flex items-end justify-between border-b border-zinc-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400 mb-3">
              <span>Clients</span>
              <span className="opacity-40">/</span>
              <span>{appt.clientNameSnapshot}</span>
              <span className="opacity-40">/</span>
              <span className="text-zinc-900">Reprogrammer</span>
            </div>
            <h1 className="font-serif text-4xl tracking-tighter uppercase text-zinc-900 leading-none">Gestion de la séance</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onResendConfirmation?.(appt)}
              className="h-10 px-5 bg-white border border-zinc-200 flex items-center gap-2 font-serif text-[9px] uppercase tracking-[0.4em] text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500"
            >
              <Mail size={13} strokeWidth={1.5} /> Confirmation
            </button>
            <button className="h-10 px-5 bg-white border border-zinc-200 flex items-center gap-2 font-serif text-[9px] uppercase tracking-[0.4em] text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500">
              <FileText size={13} strokeWidth={1.5} /> Facture
            </button>
            <button
              onClick={() => { onCancelAppt?.(appt.id); onClose(); }}
              className="h-10 px-5 bg-white border border-zinc-200 flex items-center gap-2 font-serif text-[9px] uppercase tracking-[0.4em] text-amber-600 hover:border-amber-600 transition-all duration-500"
            >
              <Trash2 size={13} strokeWidth={1.5} /> Annuler
            </button>
            <div className="w-px h-8 bg-zinc-100 mx-1" />
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500">
              <X size={18} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row p-8 gap-6">

          {/* LEFT SIDEBAR - INFO */}
          <div className="w-full lg:w-[340px] bg-white border border-zinc-100 p-8 shrink-0 flex flex-col gap-8 h-fit">
            <div className="flex items-center gap-4 border-b border-zinc-50 pb-8">
              <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center font-serif text-lg">
                {appt.clientNameSnapshot?.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-serif text-lg tracking-tighter text-zinc-900 uppercase">{appt.clientNameSnapshot}</span>
                <span className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400">Client</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { icon: Activity, label: 'Prestation', val: appt.serviceName || 'Séance' },
                { icon: Calendar, label: 'Date prévue', val: appt.date ? format(new Date(appt.date), 'EEEE d MMMM yyyy', { locale: fr }) : '—' },
                { icon: Clock, label: 'Horaire', val: `${appt.time || '—'}` },
                { icon: MapPin, label: 'Lieu', val: 'Cabinet Principal' },
                { icon: CreditCard, label: 'Tarif', val: `${appt.price || 150} CHF` }
              ].map((d, i) => (
                <div key={i} className="flex gap-4">
                  <d.icon size={16} strokeWidth={1.5} className="text-zinc-300 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400">{d.label}</span>
                    <span className="font-serif text-sm tracking-tight text-zinc-900 capitalize">{d.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT - RESCHEDULE */}
          <div className="flex-1 bg-white border border-zinc-100 p-10 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl tracking-tighter text-zinc-900 uppercase">Reprogrammer</h2>
              <span className="px-4 py-1.5 border border-zinc-100 font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400">Modifiable</span>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border border-dashed border-zinc-200 bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <CalendarClock size={18} strokeWidth={1.5} className="text-zinc-400" />
                <span className="font-serif text-[11px] tracking-[0.1em] text-zinc-500">
                  Horaire actuel : <strong className="font-serif text-zinc-900">{appt.date} à {appt.time}</strong>
                </span>
              </div>
              <ArrowDown size={16} strokeWidth={1} className="text-zinc-300" />
            </div>

            {/* DATE SCROLLER */}
            <div className="flex flex-col gap-4">
              <label className="font-serif text-[9px] tracking-[0.5em] uppercase text-zinc-400">Choisir une nouvelle date</label>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all shrink-0">
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>

                {weekDays.map((d, i) => {
                  const active = isSameDay(d, selectedDate);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      className={`flex-1 h-[72px] flex flex-col items-center justify-center gap-1 border cursor-pointer transition-all duration-500 ${
                        active ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-100 text-zinc-900 hover:border-zinc-400'
                      }`}
                    >
                      <span className={`font-serif text-[8px] tracking-[0.4em] uppercase ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {format(d, 'EEE', { locale: fr })}
                      </span>
                      <span className="font-serif text-2xl tracking-tighter leading-none">{format(d, 'd')}</span>
                    </div>
                  );
                })}

                <button className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all shrink-0">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* TIME GRID */}
            <div className="flex flex-col gap-4">
              <label className="font-serif text-[9px] tracking-[0.5em] uppercase text-zinc-400">Créneaux disponibles</label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_TIMES.map(t => {
                  const disabled = DISABLED_TIMES.includes(t);
                  const active = selectedTime === t;
                  return (
                    <div
                      key={t}
                      onClick={() => !disabled && setSelectedTime(t)}
                      className={`h-12 flex items-center justify-center font-serif text-sm tracking-tight transition-all duration-500 ${
                        disabled ? 'bg-zinc-50 text-zinc-200 line-through cursor-not-allowed' :
                        active ? 'bg-zinc-900 text-white cursor-pointer' :
                        'bg-white border border-zinc-100 text-zinc-900 hover:border-zinc-900 cursor-pointer'
                      }`}
                    >
                      {t}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NOTE TEXTAREA */}
            <div className="flex flex-col gap-3">
              <label className="font-serif text-[9px] tracking-[0.5em] uppercase text-zinc-400">Message au patient</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note ou un motif de décalage..."
                className="w-full h-[90px] p-5 bg-white border border-zinc-200 font-serif text-sm text-zinc-900 placeholder:text-zinc-300 outline-none focus:border-zinc-900 transition-all resize-none"
              />
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-50 mt-auto">
              <button
                onClick={onClose}
                className="h-12 px-8 font-serif text-[10px] tracking-[0.4em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => onConfirm(format(selectedDate, 'yyyy-MM-dd'), selectedTime, note)}
                className="h-12 px-8 bg-zinc-900 text-white font-serif text-[10px] tracking-[0.4em] uppercase flex items-center gap-3 hover:bg-zinc-700 transition-all duration-500"
              >
                <Check size={14} strokeWidth={1.5} /> Valider
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
