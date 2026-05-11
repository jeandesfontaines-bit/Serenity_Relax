"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import { 
  X, ChevronLeft, ChevronRight, User, MapPin, Check, 
  Calendar, Clock, Sparkles, ArrowRight, ShieldCheck,
  CreditCard, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_SLOTS = [
  "09:00", "10:30", "12:00",
  "14:00", "15:30", "17:00",
  "18:30"
];

export function BookingModal() {
  const { 
    isModalOpen, 
    closeModal, 
    selectedService: service, 
    step, 
    setStep, 
    bookingData, 
    updateBookingData, 
    submitBooking, 
    isSubmitting, 
    error 
  } = useBooking();
  
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  if (!isModalOpen || !service) return null;

  const getWeekInfo = () => {
    const today = new Date();
    const startOfWeekDate = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeekDate.setDate(diff + weekOffset * 7);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeekDate);
      date.setDate(startOfWeekDate.getDate() + index);
      return {
        fullDate: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
        dayNum: date.getDate(),
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      };
    });

    const midWeek = new Date(startOfWeekDate);
    midWeek.setDate(startOfWeekDate.getDate() + 3);
    const monthLabel = midWeek.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    return { days, monthLabel };
  };

  const { days, monthLabel } = getWeekInfo();
  
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => phone.length >= 8;
  const canContinueInfo = Boolean(
    bookingData.firstName.trim() && 
    bookingData.lastName.trim() && 
    isValidPhone(bookingData.phone.trim()) && 
    isValidEmail(bookingData.email.trim())
  );
  
  const formattedDate = bookingData.date ? new Date(bookingData.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";

  const selectDate = (date: string) => {
    updateBookingData("date", date);
    updateBookingData("time", "");
  };

  const selectTime = (time: string) => {
    updateBookingData("time", time);
    window.setTimeout(() => setStep(2), 300);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <motion.div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-2xl" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal} 
      />
      
      <motion.div 
        className="relative w-full max-w-4xl bg-[#FDFDFB] rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="px-16 pt-16 pb-12 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-10">
             <div className="w-16 h-16 bg-neutral-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                <Sparkles size={28} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-neutral-300 mb-2 leading-none italic">RÉSERVATION STUDIO</p>
                <h3 className="text-5xl font-black text-neutral-900 tracking-tighter italic leading-none">{service.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-4 italic">{service.price} · {service.duration}</p>
             </div>
          </div>
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-all" onClick={closeModal}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-16">
            {error && (
              <div className="bg-red-50 text-red-500 p-8 rounded-[2rem] border border-red-100 text-[10px] font-black uppercase tracking-[0.2em] mb-12 flex items-center gap-4">
                <Info size={16} /> {error}
              </div>
            )}
            
            {step < 4 && (
              <div className="flex items-center gap-4 mb-16 px-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <motion.div 
                      className="h-full bg-neutral-900" 
                      initial={{ width: 0 }}
                      animate={{ width: step >= item ? "100%" : "0%" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-8">
                    <h4 className="text-3xl font-black tracking-tighter italic text-neutral-900">{monthLabel}</h4>
                    <div className="flex items-center gap-4">
                      <button className="w-12 h-12 flex items-center justify-center rounded-full border border-neutral-100 text-neutral-300 hover:text-neutral-900 transition-all" onClick={() => setWeekOffset((v) => v - 1)}>
                        <ChevronLeft size={18} strokeWidth={3} />
                      </button>
                      <button className="w-12 h-12 flex items-center justify-center rounded-full border border-neutral-100 text-neutral-300 hover:text-neutral-900 transition-all" onClick={() => setWeekOffset((v) => v + 1)}>
                        <ChevronRight size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-4">
                    {days.map((day) => (
                      <button
                        key={day.fullDate}
                        disabled={day.isPast || day.isWeekend}
                        onClick={() => selectDate(day.fullDate)}
                        className={`h-28 flex flex-col items-center justify-center rounded-[2.5rem] border-2 transition-all duration-500 ${
                          bookingData.date === day.fullDate 
                            ? "bg-neutral-900 border-neutral-900 text-white shadow-2xl scale-110 z-10" 
                            : day.isPast || day.isWeekend ? "opacity-10 border-transparent cursor-not-allowed" : "bg-white border-neutral-50 text-neutral-900 hover:border-neutral-900"
                        }`}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${bookingData.date === day.fullDate ? "text-white/40" : "text-neutral-300"}`}>{day.dayName}</span>
                        <span className="text-3xl font-black tracking-tighter italic leading-none">{day.dayNum}</span>
                      </button>
                    ))}
                  </div>

                  {bookingData.date && (
                    <div className="space-y-8 pt-8">
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-300 px-6 italic">CRÉNEAUX DISPONIBLES</p>
                      <div className="grid grid-cols-4 gap-4">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => selectTime(slot)}
                            className={`h-16 rounded-full text-lg font-black tracking-tighter italic transition-all duration-500 border-2 ${
                              bookingData.time === slot 
                                ? "bg-neutral-900 border-neutral-900 text-white shadow-xl scale-105 z-10" 
                                : "bg-white border-neutral-50 text-neutral-900 hover:border-neutral-900 shadow-sm"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="flex items-center gap-6 border-l-4 border-neutral-900 pl-8">
                    <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 shadow-inner">
                       <User size={24} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-4xl font-black tracking-tighter italic text-neutral-900">Vos Informations</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <InputGroup label="PRÉNOM" value={bookingData.firstName} onChange={(v) => updateBookingData("firstName", v)} />
                    <InputGroup label="NOM" value={bookingData.lastName} onChange={(v) => updateBookingData("lastName", v)} />
                    
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 px-6 italic">MOBILE</label>
                       <div className="flex gap-4">
                          <select 
                            className="w-32 h-16 px-6 rounded-full bg-neutral-50 border-none text-[12px] font-black tracking-tight italic text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-inner"
                            value={bookingData.phonePrefix} 
                            onChange={(e) => updateBookingData("phonePrefix", e.target.value)}
                          >
                            <option value="CH">+41</option>
                            <option value="FR">+33</option>
                            <option value="BE">+32</option>
                          </select>
                          <input 
                            className="flex-1 h-16 px-10 rounded-full bg-neutral-50 border-none text-xl font-black tracking-tighter italic text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-inner"
                            type="tel" 
                            value={bookingData.phone} 
                            onChange={(e) => updateBookingData("phone", e.target.value)} 
                            placeholder="Votre numéro..." 
                          />
                       </div>
                    </div>
                    
                    <InputGroup label="EMAIL" type="email" value={bookingData.email} onChange={(v) => updateBookingData("email", v)} />
                  </div>

                  <div className="flex items-center gap-4 pt-12">
                    <button className="h-16 px-12 rounded-full border-2 border-neutral-100 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 hover:text-neutral-900 hover:border-neutral-900 transition-all" onClick={() => setStep(1)}>RETOUR</button>
                    <button className="flex-1 h-16 rounded-full bg-neutral-900 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-10" disabled={!canContinueInfo} onClick={() => setStep(3)}>SUIVANT</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="flex items-center gap-6 border-l-4 border-neutral-900 pl-8">
                    <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 shadow-inner">
                       <MapPin size={24} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-4xl font-black tracking-tighter italic text-neutral-900">Adresse & Notes</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1"><InputGroup label="N°" value={bookingData.streetNum} onChange={(v) => updateBookingData("streetNum", v)} /></div>
                    <div className="md:col-span-3"><InputGroup label="RUE" value={bookingData.streetName} onChange={(v) => updateBookingData("streetName", v)} /></div>
                    <div className="md:col-span-2"><InputGroup label="VILLE" value={bookingData.city} onChange={(v) => updateBookingData("city", v)} /></div>
                    <div className="md:col-span-2"><InputGroup label="CANTON" value={bookingData.canton} onChange={(v) => updateBookingData("canton", v)} /></div>
                    <div className="md:col-span-4"><InputGroup label="PAYS" value={bookingData.country} onChange={(v) => updateBookingData("country", v)} /></div>
                    <div className="md:col-span-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 px-6 italic block mb-4">NOTES (FACULTATIF)</label>
                       <textarea 
                        className="w-full h-32 p-10 rounded-[3rem] bg-neutral-50 border-none text-xl font-black tracking-tighter italic text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none resize-none leading-relaxed shadow-inner"
                        value={bookingData.note} 
                        onChange={(e) => updateBookingData("note", e.target.value)} 
                        placeholder="Précisions pour votre séance..." 
                       />
                    </div>
                  </div>

                  <div className="bg-neutral-900 rounded-[3.5rem] p-12 text-white shadow-2xl space-y-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <ShieldCheck size={180} strokeWidth={1} />
                     </div>
                     <div className="flex items-center justify-between border-b border-white/10 pb-8 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">RÉSUMÉ RÉSERVATION</p>
                        <div className="flex items-center gap-3 text-emerald-400">
                           <Check size={16} strokeWidth={3} />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">PRÊT À VALIDER</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">SOIN SÉLECTIONNÉ</p>
                           <p className="text-3xl font-black tracking-tighter italic leading-none">{service.title}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">HORAIRE PRÉVU</p>
                           <p className="text-3xl font-black tracking-tighter italic leading-none">{formattedDate} · {bookingData.time}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 pt-8">
                    <button className="h-20 px-12 rounded-full border-2 border-neutral-100 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-300 hover:text-neutral-900 hover:border-neutral-900 transition-all" onClick={() => setStep(2)} disabled={isSubmitting}>RETOUR</button>
                    <button className="flex-1 h-20 rounded-[2.5rem] bg-neutral-900 text-white text-[13px] font-black uppercase tracking-[0.5em] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-2 active:scale-95 transition-all flex items-center justify-center gap-6 group" onClick={submitBooking} disabled={isSubmitting}>
                      {isSubmitting ? <Clock size={24} className="animate-spin" /> : <ShieldCheck size={24} strokeWidth={2.5} className="group-hover:scale-125 transition-transform" />}
                      {isSubmitting ? "TRANSMISSION..." : "CONFIRMER MA SÉANCE"}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-32 text-center space-y-16"
                >
                  <div className="relative inline-block">
                     <div className="absolute inset-0 bg-neutral-900 rounded-[3rem] blur-3xl opacity-20 animate-pulse" />
                     <div className="relative w-32 h-32 bg-neutral-900 rounded-[3.5rem] flex items-center justify-center text-white shadow-2xl mx-auto rotate-3 group">
                        <Check size={56} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-6xl font-black text-neutral-900 tracking-tighter italic leading-none">C&apos;est Validé.</h4>
                    <p className="text-xl font-medium text-neutral-400 italic">À bientôt au studio{bookingData.firstName ? `, ${bookingData.firstName}` : ""}.</p>
                  </div>

                  <button className="h-20 px-20 rounded-full bg-neutral-900 text-white text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all" onClick={closeModal}>TERMINER</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
   return (
      <div className="space-y-4 group">
         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 px-6 italic leading-none block">{label}</label>
         <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="Écrivez ici..."
            className="w-full h-16 px-10 rounded-full bg-neutral-50 border-none text-xl font-black tracking-tighter italic text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-inner" 
         />
      </div>
   );
}
