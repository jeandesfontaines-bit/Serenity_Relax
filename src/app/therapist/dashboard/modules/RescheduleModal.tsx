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

import { dashboardPanel, dashboardTitle, dashboardEyebrow, dashboardPrimaryButton, dashboardSecondaryButton } from './dashboardTheme';

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
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className={`relative w-full sm:max-w-[1100px] flex flex-col overflow-hidden max-h-[94vh] sm:max-h-[85vh] ${dashboardPanel}`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* HEADER */}
        <div className="px-8 py-7 flex items-start justify-between border-b border-[#d9dee4] shrink-0">
          <div>
            <div className={`flex items-center gap-2 mb-3 ${dashboardEyebrow}`}>
              <span>Clients</span>
              <span className="opacity-40">/</span>
              <span>{appt.clientNameSnapshot}</span>
              <span className="opacity-40">/</span>
              <span className="text-[#1d292e]">Reprogrammer</span>
            </div>
            <h1 className={dashboardTitle}>Gestion de la séance</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onResendConfirmation?.(appt)}
              className={dashboardSecondaryButton + " flex items-center gap-2"}
            >
              <Mail size={13} strokeWidth={1.5} /> Confirmation
            </button>
            <button className={dashboardSecondaryButton + " flex items-center gap-2"}>
              <FileText size={13} strokeWidth={1.5} /> Facture
            </button>
            <button
              onClick={() => { onCancelAppt?.(appt.id); onClose(); }}
              className="h-9 px-5 rounded-full bg-white border border-[#fdba74] text-[#c2410c] text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-[#fff7ed] flex items-center gap-2 transition-all duration-300"
            >
              <Trash2 size={13} strokeWidth={1.5} /> Annuler
            </button>
            <div className="w-px h-6 bg-[#d9dee4] mx-1" />
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f7f4ec] text-[#3f565f] hover:text-[#1d292e] transition-colors">
              <X size={18} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row p-8 gap-6">

          {/* LEFT SIDEBAR - INFO */}
          <div className="w-full lg:w-[340px] bg-white/70 border border-[#d9dee4] rounded-xl p-8 shrink-0 flex flex-col gap-8 h-fit">
            <div className="flex items-center gap-4 border-b border-[#d9dee4] pb-8">
              <div className="w-12 h-12 rounded-full bg-[#e8f2ee] text-[#2e5b97] flex items-center justify-center  text-lg">
                {appt.clientNameSnapshot?.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <span className=" text-lg tracking-tight text-[#1d292e] capitalize">{appt.clientNameSnapshot}</span>
                <span className={dashboardEyebrow}>Client</span>
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
                  <d.icon size={16} strokeWidth={1.5} className="text-[#3f565f] mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className={dashboardEyebrow}>{d.label}</span>
                    <span className="text-sm tracking-tight text-[#1d292e] capitalize">{d.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT - RESCHEDULE */}
          <div className="flex-1 bg-white/70 border border-[#d9dee4] rounded-xl p-10 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className=" text-2xl tracking-tight text-[#1d292e] capitalize">Reprogrammer</h2>
              <span className="px-3 py-1 rounded-full border border-[#d9dee4] text-[10px] font-medium uppercase tracking-[0.1em] text-[#3f565f]">Modifiable</span>
            </div>

            <div className="flex items-center justify-between px-6 py-4 rounded-xl border border-dashed border-[#bdd0e5] bg-[#e8f2ee]/50">
              <div className="flex items-center gap-4">
                <CalendarClock size={18} strokeWidth={1.5} className="text-[#2e5b97]" />
                <span className="text-sm tracking-tight text-[#3f565f]">
                  Horaire actuel : <strong className="text-[#1d292e] font-medium">{appt.date} à {appt.time}</strong>
                </span>
              </div>
              <ArrowDown size={16} strokeWidth={1} className="text-[#c4cdd7]" />
            </div>

            {/* DATE SCROLLER */}
            <div className="flex flex-col gap-4">
              <label className={dashboardEyebrow}>Choisir une nouvelle date</label>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-white border border-[#d9dee4] flex items-center justify-center text-[#3f565f] hover:border-[#2e5b97] hover:text-[#2e5b97] transition-all shrink-0">
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>

                {weekDays.map((d, i) => {
                  const active = isSameDay(d, selectedDate);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      className={`flex-1 h-[72px] flex flex-col items-center justify-center gap-1 border rounded-xl cursor-pointer transition-all duration-300 ${
                        active ? 'bg-[#2e5b97] border-[#2e5b97] text-white shadow-sm' : 'bg-white border-[#d9dee4] text-[#1d292e] hover:border-[#9ec4b2]'
                      }`}
                    >
                      <span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${active ? 'text-white/80' : 'text-[#3f565f]'}`}>
                        {format(d, 'EEE', { locale: fr })}
                      </span>
                      <span className=" text-2xl tracking-tight leading-none">{format(d, 'd')}</span>
                    </div>
                  );
                })}

                <button className="w-10 h-10 rounded-full bg-white border border-[#d9dee4] flex items-center justify-center text-[#3f565f] hover:border-[#2e5b97] hover:text-[#2e5b97] transition-all shrink-0">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* TIME GRID */}
            <div className="flex flex-col gap-4">
              <label className={dashboardEyebrow}>Créneaux disponibles</label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_TIMES.map(t => {
                  const disabled = DISABLED_TIMES.includes(t);
                  const active = selectedTime === t;
                  return (
                    <div
                      key={t}
                      onClick={() => !disabled && setSelectedTime(t)}
                      className={`h-10 flex items-center justify-center rounded-full text-[13px] tracking-wide transition-all duration-300 ${
                        disabled ? 'bg-[#e6ebf0] text-[#c4cdd7] line-through cursor-not-allowed' :
                        active ? 'bg-[#2e5b97] text-white cursor-pointer shadow-sm' :
                        'bg-white border border-[#d9dee4] text-[#1d292e] hover:border-[#9ec4b2] cursor-pointer'
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
              <label className={dashboardEyebrow}>Message au patient</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note ou un motif de décalage..."
                className="w-full h-[90px] p-5 rounded-xl bg-white/70 border border-[#d9dee4] text-sm text-[#1d292e] placeholder:text-[#c4cdd7] outline-none focus:border-[#2e5b97] focus:ring-2 focus:ring-[#2e5b97]/15 transition-all resize-none"
              />
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#d9dee4] mt-auto">
              <button
                onClick={onClose}
                className={dashboardSecondaryButton}
              >
                Fermer
              </button>
              <button
                onClick={() => onConfirm(format(selectedDate, 'yyyy-MM-dd'), selectedTime, note)}
                className={dashboardPrimaryButton + " flex items-center gap-2"}
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
