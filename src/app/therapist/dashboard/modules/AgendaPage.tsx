'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Clock, Plus, Download, User, 
  FileText, ChevronLeft, ChevronRight, Sparkles, Settings,
  MapPin, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import { format, addDays, startOfWeek, isSameDay, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';

interface AgendaPageProps {
  view: 'month' | 'week';
  cur: Date;
  onPeriod: (dir: number) => void;
  onToday: () => void;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  onOpenWeeklySettings: () => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
}

export default function AgendaPage({ 
  view, cur, onPeriod, onToday, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, 
  onOpenWeeklySettings, onMoveAppt 
}: AgendaPageProps) {
  
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const start = startOfWeek(cur, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const filteredAppointments = appointments.filter(appt => appt.date === selectedDate);

  const generateInvoiceFromAppointment = (appt: any) => {
    try {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(95, 39, 205); 
        doc.text('SERENITY RELAX', 20, 30);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Chemin de Joinville 26 • 1216 Cointrin • Genève', 20, 38);
        
        doc.setFontSize(14);
        doc.setTextColor(34, 47, 62);
        doc.text(`JUSTIFICATIF DE SOIN N° RDV-${appt.id}`, 20, 60);
        doc.text(`Date du soin : ${appt.date} à ${appt.time}`, 20, 70);
        doc.text(`Patient : ${appt.clientNameSnapshot}`, 20, 80);
        
        doc.line(20, 90, 190, 90);
        
        doc.setFont("helvetica", "bold");
        doc.text('DESCRIPTION', 20, 105);
        doc.text('MONTANT', 150, 105);
        
        doc.setFont("helvetica", "normal");
        doc.text(appt.serviceName || 'Soin Holistique', 20, 115);
        doc.text(`${appt.price || 150} CHF`, 150, 115);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL RÉGLÉ : ${appt.price || 150} CHF`, 20, 150);
        
        doc.save(`Facture-RDV-${appt.id}.pdf`);
        alert(`✅ Facture PDF générée pour ${appt.clientNameSnapshot} !`);
    } catch (err) {
        console.error("PDF Generate Error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      {/* ── ZEN AGENDA HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-white/40 backdrop-blur-3xl p-5 rounded-xl border border-white shadow-xl shadow-emerald-100/10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center animate-pulse"><CalendarIcon size={20} /></div>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#059669]">Planification Thérapeutique</p>
           </div>
           <h1 className="title-luxe text-2xl md:text-3xl leading-none">Flux du <br/><span className="italic font-sans opacity-40">Sanctuaire.</span></h1>
        </div>

        <div className="flex bg-white/60 p-2 rounded-full border border-white shadow-sm">
           <button onClick={() => onToggleView('week')} className={`px-8 py-3 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all ${view === 'week' ? 'bg-[#222F3E] text-white shadow-lg' : 'text-gray-400 hover:text-[#059669]'}`}>Semaine</button>
           <button onClick={() => onToggleView('month')} className={`px-8 py-3 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all ${view === 'month' ? 'bg-[#222F3E] text-white shadow-lg' : 'text-gray-400 hover:text-[#059669]'}`}>Mois</button>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-white/60 p-2 rounded-full border border-white">
              <button onClick={() => onPeriod(-1)} className="p-3 hover:bg-white rounded-full transition-all text-gray-400 hover:text-[#059669]"><ChevronLeft size={20} /></button>
              <button onClick={onToday} className="px-6 text-[0.65rem] font-black uppercase tracking-widest text-[#222F3E]">Aujourd&apos;hui</button>
              <button onClick={() => onPeriod(1)} className="p-3 hover:bg-white rounded-full transition-all text-gray-400 hover:text-[#059669]"><ChevronRight size={20} /></button>
           </div>
           <button onClick={onOpenWeeklySettings} className="p-5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#059669] shadow-xl hover:shadow-emerald-100 transition-all"><Settings size={22} /></button>
        </div>
      </header>

      {/* Mini calendrier hebdomadaire */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, i) => {
          const dStr = format(day, 'yyyy-MM-dd');
          const isSelected = dStr === selectedDate;
          const isToday = isSameDay(day, new Date());
          
          return (
            <motion.div
              key={dStr}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedDate(dStr)}
              className={`text-center p-8 rounded-[1.5rem] border border-white cursor-pointer transition-all relative overflow-hidden ${isSelected ? 'bg-[#222F3E] text-white shadow-2xl scale-105 z-10' : 'bg-white/60 hover:bg-white'}`}
            >
              {isToday && !isSelected && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#34D399]" />}
              <p className={`text-[0.6rem] uppercase tracking-widest font-black ${isSelected ? 'text-[#10B981]' : 'text-gray-400'}`}>{format(day, 'EEE', { locale: fr })}</p>
              <p className="text-4xl font-light mt-4 leading-none">{format(day, 'd')}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Liste des rendez-vous DU JOUR SÉLECTIONNÉ */}
      <div className="space-y-10">
        <div className="flex justify-between items-center px-4">
           <h2 className="text-3xl font-sans font-light flex items-center gap-4 text-[#222F3E]">
              <Sparkles className="text-[#059669]" /> Rituels du {format(new Date(selectedDate), 'EEEE d MMMM', { locale: fr })}
           </h2>
           <button
             onClick={() => onOpenSlot(selectedDate, '09:00')}
             className="btn-luxe flex items-center gap-4 px-6 py-5 text-[0.65rem]"
           >
             <Plus className="w-5 h-5" /> Nouveau RDV
           </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.sort((a,b) => a.time.localeCompare(b.time)).map((appt) => (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col lg:flex-row gap-5 items-start lg:items-center group hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all bg-white/60 backdrop-blur-3xl border border-white"
                >
                  <div className="text-center lg:text-left min-w-[120px]">
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#059669] mb-1">Heure</p>
                    <p className="text-3xl font-light text-[#222F3E]">{appt.time}</p>
                  </div>

                  <div className="h-12 w-px bg-gray-100 hidden lg:block" />

                  <div className="flex-1 space-y-2">
                    <p className="text-xl font-medium text-[#222F3E]">{appt.clientNameSnapshot}</p>
                    <p className="text-gray-400  italic">{appt.serviceName}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <button
                      onClick={() => generateInvoiceFromAppointment(appt)}
                      className="btn-luxe flex items-center justify-center gap-3 px-8 py-5 text-[0.65rem]"
                    >
                      <Download className="w-4 h-4" /> Justificatif PDF
                    </button>

                    <button
                      onClick={() => onSelectAppt(appt)}
                      className="px-8 py-5 border border-gray-100 bg-white/80 rounded-full hover:bg-white hover:shadow-xl transition-all flex items-center justify-center gap-3 text-[0.65rem] font-black uppercase tracking-widest"
                    >
                      <User className="w-4 h-4" /> Gérer Dossier
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center border-2 border-dashed border-gray-100 rounded-xl space-y-4"
              >
                 <CalendarIcon className="mx-auto text-gray-100" size={40} />
                 <p className="text-base text-gray-300">Aucun rituel prévu pour cette journée...</p>
                 <button onClick={() => onOpenSlot(selectedDate, '09:00')} className="btn-luxe px-6 py-3 mx-auto">Réserver maintenant</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
