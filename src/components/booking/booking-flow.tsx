"use client";

import React, { useState, useEffect } from 'react';
// Import font for premium look
const FONT_IMPORT = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
import { Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Info,
  Loader2,
  MessageCircle,
  X
} from 'lucide-react';
import { format, addMinutes, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { 
  doc, 
  serverTimestamp, 
  collection, 
  onSnapshot, 
  setDoc,
  addDoc
} from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
}

export function BookingFlow({ services, initialServiceId }: BookingFlowProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const auth = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [acceptedConditions, setAcceptedConditions] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({
    0: [], 1: ["11:00", "13:30", "15:00", "16:30", "18:00"], 
    2: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    3: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    4: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    5: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    6: ["09:00", "10:30", "12:00"]
  });

  const getAdjDay = (date: Date) => date.getDay();

  useEffect(() => {
    if (!firestore) return;
    
    // Listen to availability (locks, day openings & booked slots)
    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap: any) => {
      const slots = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setAvailableSlots(slots);
    });

    // Listen to global config (slots)
    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (snap) => {
      if (snap.exists()) setConfigSlots(snap.data() as any);
    });

    return () => {
      unsubAvail();
      unsubConfig();
    };
  }, [firestore]);

  useEffect(() => {
    if (initialServiceId) {
      const found = services.find(s => s.id === initialServiceId);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
  }, [initialServiceId, services]);

  useEffect(() => {
    if (user && !user.isAnonymous && !formData.firstName) {
      setFormData(prev => ({
        ...prev,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user, formData.firstName]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setTimeout(() => setStep(2), 300);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => setStep(3), 400);
  };

  const times = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00'];

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  });

  const completeBooking = async () => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;
      
      // If no user or anonymous, ensure we have an auth session
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      if (!finalUserId) throw new Error("Impossible d'établir une session sécurisée. Veuillez réessayer.");

      const appointmentId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const magicToken = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const startTimeStr = `${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const durationMatch = selectedService!.duration.match(/\d+/);
      const duration = durationMatch ? parseInt(durationMatch[0]) : 60;
      const endTime = addMinutes(new Date(startTimeStr), duration);

      const appointmentData = {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService!.id,
        serviceName: selectedService!.name,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'confirmed',
        clientMessage: formData.message,
        isLoyaltyFreeSession: false,
        isConfirmed: true,
        firstName: formData.firstName,
        lastName: formData.lastName,
        clientNameSnapshot: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        createdAt: serverTimestamp()
      };

      const clientData = {
        id: finalUserId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        magicToken: magicToken,
        updatedAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), appointmentData),
        setDoc(doc(firestore, 'clients', finalUserId), clientData, { merge: true }),
        setDoc(doc(firestore, 'availability', appointmentId), {
           type: 'booked',
           date: format(selectedDate!, 'yyyy-MM-dd'),
           time: selectedTime,
           appointmentId: appointmentId
        })
      ]);

      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          clientName: appointmentData.clientNameSnapshot,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          serviceName: selectedService!.name,
          startTime: appointmentData.startTime,
          duration: duration,
          magicToken: magicToken,
          clientId: finalUserId
        })
      }).catch(err => console.error("Erreur gérée silencieusement pour l'email:", err));

      setBookingRef(appointmentId);
      setStep(5);
      
      toast({
        title: "Réservation confirmée",
        description: "Votre rituel a bien été enregistré.",
      });

    } catch (err: any) {
      console.error('Booking error:', err);
      toast({ 
        variant: 'destructive', 
        title: 'Erreur de réservation', 
        description: err.message || "Une erreur est survenue. Veuillez vérifier votre connexion." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 5) {
    return (
      <div className="px-8 text-center h-screen flex flex-col justify-center bg-white">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-[2.4rem] font-serif font-bold text-neutral-900 mb-4 tracking-tighter">Réservé.</h2>
        <p className="text-[1rem] leading-relaxed font-sans italic text-neutral-500 mb-10">Référence de votre rituel : <span className="font-bold text-neutral-900">{bookingRef}</span></p>
        
        <div className="space-y-4 max-w-sm mx-auto w-full">
          <a 
            href="https://wa.me/41783336823" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-emerald-700 gap-3"
          >
            <MessageCircle size={16} /> CONFIRMER WHATSAPP
          </a>
          <button onClick={() => window.location.reload()} className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-neutral-900 rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-neutral-900 hover:text-white">
            RETOUR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-full bg-white flex flex-col lg:flex-row relative">
      <style>{`
        @import url('${FONT_IMPORT}');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
      {/* LEFT SIDE: Header & Summary */}
      <div className="w-full lg:w-[35%] lg:sticky lg:top-0 h-fit lg:min-h-[80vh] bg-[#FAF9F6] p-8 md:p-12 lg:p-16 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-100/60 z-10">
        <h1 className="text-[2.4rem] md:text-[3rem] font-serif font-medium text-neutral-900 tracking-tighter leading-none mb-4">
          Réserver<br/><span className="text-neutral-500 italic font-light">un rituel.</span>
        </h1>
        <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-neutral-400 mb-12">
          GENÈVE STUDIO — ÉTAPE {step}/4
        </p>

        {/* Dynamic Summary based on selection */}
        <div className="space-y-8 mt-4 lg:mt-12 flex-1">
          <AnimatePresence>
            {selectedService && step > 1 && (
                <motion.div key="summary-service" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">RITUEL SÉLECTIONNÉ</p>
                  <p className="text-[1.1rem] leading-snug font-serif font-bold text-neutral-900">{selectedService.name.split(' - ')[0]}</p>
                  <p className="text-[0.8rem] font-sans text-neutral-500 mt-1">{selectedService.duration} • CHF {selectedService.price}</p>
                </motion.div>
            )}
            {selectedDate && selectedTime && step > 2 && (
                <motion.div key="summary-datetime" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-6 border-t border-neutral-200/60 mt-6">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">DATE & HEURE</p>
                  <p className="text-[1.1rem] leading-snug font-serif font-bold text-neutral-900 capitalize">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
                  <p className="text-[0.8rem] font-sans text-neutral-500 mt-1">à {selectedTime}</p>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE: Content */}
      <div className="w-full lg:w-[65%] p-8 md:p-12 lg:p-16 pb-24">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-3 mb-8 text-center lg:text-left">
                  <h3 className="text-[1.5rem] md:text-[1.8rem] font-serif font-medium text-neutral-900 tracking-tight">Le Menu Signature</h3>
                  <p className="text-[0.85rem] font-sans text-neutral-500">Sélectionnez le rituel qui correspond à vos besoins d'aujourd'hui.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleServiceSelect(s)}
                      className={`group w-full flex flex-col p-4 rounded-[2.5rem] transition-all duration-500 text-center border
                        ${selectedService?.id === s.id ? 'bg-neutral-50 border-neutral-900 shadow-sm ring-1 ring-neutral-900' : 'bg-white border-neutral-100 hover:border-neutral-300 hover:shadow-md'}
                      `}
                    >
                      <div className="relative w-full aspect-[4/3] rounded-[1.8rem] overflow-hidden mb-4 shrink-0 shadow-sm border border-neutral-50/50">
                        <Image 
                          src={s.image || ''} 
                          fill 
                          unoptimized 
                          alt={s.name} 
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 space-y-2 px-1">
                        <h4 className="text-[1.05rem] leading-tight font-serif font-bold tracking-tight text-neutral-900">{s.name.split(' - ')[0]}</h4>
                        <p className="text-[0.7rem] font-sans text-neutral-400 line-clamp-2 leading-relaxed h-8">
                          {s.description || "Rituel personnalisé et adapté."}
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-1">
                          <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-neutral-300">{s.duration}</span>
                          <span className="text-[1rem] font-serif font-bold text-neutral-900">CHF {s.price}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300">DISPONIBILITÉS</span>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-neutral-400 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                  >
                    <ChevronLeft size={14} /> CHANGER LE SOIN
                  </button>
                </div>

                <div className="space-y-12">
                  {/* CALENDRIER */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[1.2rem] font-serif font-bold text-neutral-900 capitalize">
                        {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-all text-neutral-900"><ChevronLeft size={16} /></button>
                        <button onClick={handleNextMonth} className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-all text-neutral-900"><ChevronRight size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[0.65rem] font-black text-neutral-300 uppercase tracking-[0.2em] mb-4">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-y-3">
                      {days.map((day, i) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isPast = isBefore(day, startOfDay(new Date()));
                        const currentMonthOnly = isSameMonth(day, currentMonth);
                        
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayOfWeek = getAdjDay(day);
                        const baseConfigSlots = configSlots[dayOfWeek] || [];
                        
                        const isOpened = availableSlots.some(s => s.date === dateStr && s.type === 'day_opened');
                        
                        // Calculated slots count: base defined in config - (blocked + already booked)
                        const slotsForDay = !isOpened ? [] : baseConfigSlots.filter(t => {
                          const isBlocked = availableSlots.some(s => s.date === dateStr && s.time === t && s.type === 'blocked');
                          const isBooked = availableSlots.some(s => s.date === dateStr && s.time === t && s.type === 'booked');
                          return !isBlocked && !isBooked;
                        });

                        const slotsCount = slotsForDay.length;
                        
                        let availability = 'none';
                        if (!isPast && isOpened) {
                          if (slotsCount === 0) availability = 'full';
                          else if (slotsCount <= 2) availability = 'medium';
                          else availability = 'low';
                        }

                        return (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            <button
                              disabled={isPast || !currentMonthOnly || slotsCount === 0}
                              onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                              className={`w-10 h-10 flex items-center justify-center rounded-full text-[0.95rem] font-sans font-medium transition-all relative
                                ${!currentMonthOnly ? 'opacity-0 pointer-events-none' : ''}
                                ${isPast || slotsCount === 0 ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-900 bg-neutral-50 hover:bg-neutral-100'}
                                ${isSelected ? 'bg-neutral-900 text-white shadow-lg hover:bg-neutral-800' : ''}
                              `}
                            >
                              {format(day, 'd')}
                            </button>
                            {currentMonthOnly && !isPast && (
                              <div className={`w-1.5 h-1.5 rounded-full ${availability === 'low' ? 'bg-emerald-400' : availability === 'medium' ? 'bg-amber-400' : 'bg-neutral-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLONNE HEURES */}
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 pt-6 border-t border-neutral-100">
                        <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300 block">HEURES DISPONIBLES</span>
                        
                        {selectedDate && (() => {
                          const dateStr = format(selectedDate, 'yyyy-MM-dd');
                          const dayOfWeek = getAdjDay(selectedDate);
                          const baseConfigSlots = configSlots[dayOfWeek] || [];
                          
                          const freeSlots = baseConfigSlots.filter(t => {
                            const isBlocked = availableSlots.some(s => s.date === dateStr && s.time === t && s.type === 'blocked');
                            const isBooked = availableSlots.some(s => s.date === dateStr && s.time === t && s.type === 'booked');
                            return !isBlocked && !isBooked;
                          });

                          if (freeSlots.length > 0) {
                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {freeSlots.map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => handleTimeSelect(t)}
                                    className={`py-4 px-4 rounded-2xl transition-all duration-300 font-sans tracking-tight text-center
                                      ${selectedTime === t ? 'bg-neutral-900 text-white shadow-lg font-bold text-[1.05rem]' : 'bg-neutral-50 text-neutral-900 hover:bg-neutral-100 font-medium text-[1.05rem]'}
                                    `}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            );
                          }
                          return (
                            <div className="py-8 text-center bg-neutral-50 rounded-2xl">
                              <p className="text-[0.8rem] font-serif italic text-neutral-400">Aucun créneau disponible pour cette journée.</p>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300">VOS COORDONNÉES</span>
                  <button 
                    onClick={() => setStep(2)} 
                    className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-neutral-400 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                  >
                    <ChevronLeft size={14} /> CHANGER LA DATE
                  </button>
                </div>

                <div className="space-y-10">
                  <form onSubmit={(e) => e.preventDefault()} autoComplete="off" data-lpignore="true" data-1p-ignore="true" className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5 border-b border-neutral-200 focus-within:border-neutral-900 transition-colors pb-2">
                        <Label htmlFor="booking-fname" className="text-[0.6rem] font-black uppercase tracking-widest text-neutral-400">PRÉNOM *</Label>
                        <Input 
                          id="booking-fname"
                          name="booking_fname"
                          autoComplete="off"
                          spellCheck="false"
                          data-1p-ignore="true"
                          value={formData.firstName} 
                          onChange={(e: any) => setFormData({...formData, firstName: e.target.value})} 
                          className="h-10 rounded-none bg-transparent border-none px-0 font-serif text-[1.2rem] italic shadow-none focus-visible:ring-0 placeholder:text-neutral-200" 
                          placeholder="Ex: Marie" 
                        />
                      </div>
                      <div className="space-y-1.5 border-b border-neutral-200 focus-within:border-neutral-900 transition-colors pb-2">
                        <Label htmlFor="booking-lname" className="text-[0.6rem] font-black uppercase tracking-widest text-neutral-400">NOM *</Label>
                        <Input 
                          id="booking-lname"
                          name="booking_lname"
                          autoComplete="off"
                          spellCheck="false"
                          data-1p-ignore="true"
                          value={formData.lastName} 
                          onChange={(e: any) => setFormData({...formData, lastName: e.target.value})} 
                          className="h-10 rounded-none bg-transparent border-none px-0 font-serif text-[1.2rem] italic shadow-none focus-visible:ring-0 placeholder:text-neutral-200" 
                          placeholder="Ex: Dupont" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 border-b border-neutral-200 focus-within:border-neutral-900 transition-colors pb-2">
                      <Label htmlFor="booking-mail" className="text-[0.6rem] font-black uppercase tracking-widest text-neutral-400">EMAIL *</Label>
                      <Input 
                        id="booking-mail"
                        type="text" 
                        name="booking_mail"
                        autoComplete="off"
                        spellCheck="false"
                        data-1p-ignore="true"
                        value={formData.email} 
                        onChange={(e: any) => setFormData({...formData, email: e.target.value})} 
                        className="h-10 rounded-none bg-transparent border-none px-0 font-sans font-medium text-[1.05rem] shadow-none focus-visible:ring-0 placeholder:text-neutral-200" 
                        placeholder="marie.dupont@email.com" 
                      />
                    </div>
                    <div className="space-y-1.5 border-b border-neutral-200 focus-within:border-neutral-900 transition-colors pb-2">
                      <Label htmlFor="booking-tel" className="text-[0.6rem] font-black uppercase tracking-widest text-neutral-400">MOBILE *</Label>
                      <Input 
                        id="booking-tel"
                        type="text" 
                        name="booking_tel"
                        autoComplete="off"
                        spellCheck="false"
                        data-1p-ignore="true"
                        value={formData.phone} 
                        onChange={(e: any) => setFormData({...formData, phone: e.target.value})} 
                        className="h-10 rounded-none bg-transparent border-none px-0 font-sans font-medium text-[1.05rem] shadow-none focus-visible:ring-0 placeholder:text-neutral-200" 
                        placeholder="+41 78 000 00 00" 
                      />
                    </div>
                  </form>

                  <div className="bg-[#FAF9F6] p-6 sm:p-8 rounded-3xl">
                     <div className="space-y-4 text-[0.8rem] leading-relaxed text-neutral-500 font-sans mb-6">
                      <p className="font-bold text-neutral-900">Conditions de la séance</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Prestations dédiées au bien-être, non thérapeutiques ou médicales.</li>
                        <li>Aucune contre-indication stricte au massage (en cas de doute, avis médical requis).</li>
                        <li>Annulation minimum 24h à l'avance.</li>
                      </ul>
                    </div>
                    <div className="flex items-start space-x-4 border-t border-neutral-200 pt-6">
                      <Checkbox id="terms" checked={acceptedConditions} onCheckedChange={(checked: any) => setAcceptedConditions(checked === true)} className="mt-1" />
                      <Label htmlFor="terms" className="text-[0.85rem] font-sans font-medium text-neutral-900 cursor-pointer leading-snug">
                        J'accepte les conditions et je confirme ne pas avoir de problème de santé contre-indiquant cette séance.
                      </Label>
                    </div>
                  </div>

                  <button 
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !acceptedConditions} 
                    onClick={() => {
                        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                        setTimeout(() => setStep(4), 100);
                    }} 
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-neutral-900 text-white rounded-full text-[0.75rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.1)] gap-3"
                  >
                    VÉRIFIER LE RÉCAPITULATIF <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-12 text-center"
              >
                <div className="inline-flex w-16 h-16 bg-[#FAF9F6] rounded-full items-center justify-center text-neutral-900 mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <h2 className="text-[2rem] sm:text-[2.4rem] font-serif font-bold text-neutral-900 tracking-tighter leading-none">C'est presque prêt.</h2>
                
                <div className="text-left bg-[#FAF9F6] p-8 rounded-3xl space-y-8">
                  <div className="space-y-3">
                    <p className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-[0.2em]">RITUEL CONFIRMÉ</p>
                    <p className="text-[1.2rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{selectedService?.name.split(' - ')[0]}</p>
                    <p className="text-[1rem] font-sans font-medium text-neutral-600">
                      {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : ''} à {selectedTime}
                    </p>
                  </div>
                  <div className="border-t border-neutral-200/60 pt-8 space-y-3">
                    <p className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-[0.2em]">RÉSERVÉ POUR</p>
                    <p className="text-[1.2rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{formData.firstName} {formData.lastName}</p>
                    <p className="text-[1rem] font-sans font-medium text-neutral-600">{formData.email} • {formData.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={completeBooking} 
                    disabled={isSubmitting} 
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-emerald-600 text-white rounded-full text-[0.75rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-emerald-700 shadow-[0_10px_30px_rgba(5,150,105,0.2)] gap-3"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>VALIDER DÉFINITIVEMENT <CheckCircle2 size={18} /></>}
                  </button>
                  <button onClick={() => setStep(3)} className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors pt-2 block w-full">RETOUR</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}