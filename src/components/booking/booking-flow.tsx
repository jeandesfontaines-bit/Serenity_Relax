"use client";

import React, { useState, useEffect } from 'react';
import { Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2,
  MessageCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Plus
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
  setDoc
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function BookingFlow({ services, initialServiceId, isOpen, onClose }: BookingFlowProps) {
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
    
    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap: any) => {
      const slots = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setAvailableSlots(slots);
    });

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
    setTimeout(() => setStep(2), 400);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => setStep(3), 500);
  };

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
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      if (!finalUserId) throw new Error("Impossible d'établir une session sécurisée.");

      const appointmentId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const magicToken = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const startTimeStr = `${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const durationMatch = selectedService!.duration.match(/\d+/);
      const duration = durationMatch ? parseInt(durationMatch[0]) : 60;
      const endTime = addMinutes(new Date(startTimeStr), duration);

      const invoiceId = `INV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
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
        clientEmail: formData.email,
        magicToken: magicToken,
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

      const invoiceData = {
        id: invoiceId,
        invoiceNumber: invoiceId,
        clientId: finalUserId,
        clientNameSnapshot: appointmentData.clientNameSnapshot,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        totalAmount: selectedService!.price || 0,
        status: 'Pending',
        appointmentId: appointmentId,
        items: [{ description: selectedService!.name, amount: selectedService!.price || 0, quantity: 1 }],
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), appointmentData),
        setDoc(doc(firestore, 'clients', finalUserId), clientData, { merge: true }),
        setDoc(doc(firestore, 'invoices', invoiceId), invoiceData),
        setDoc(doc(firestore, 'availability', appointmentId), {
           type: 'booked',
           date: format(selectedDate!, 'yyyy-MM-dd'),
           time: selectedTime,
           appointmentId: appointmentId
        })
      ]);

      // Trigger Email Notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointmentId,
            clientName: appointmentData.clientNameSnapshot,
            clientEmail: appointmentData.clientEmail,
            clientPhone: appointmentData.phone,
            serviceName: appointmentData.serviceName,
            startTime: appointmentData.startTime,
            duration: duration,
            magicToken: appointmentData.magicToken,
            clientId: finalUserId
          })
        });
      } catch (notifyErr) {
        console.error('Failed to trigger notification:', notifyErr);
      }

      setBookingRef(appointmentId);
      setStep(5);
      toast({ title: "Rituel confirmé" });

    } catch (err: any) {
      console.error('Booking error:', err);
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden">
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute top-8 right-8 z-50 p-4 hover:bg-zinc-50 rounded-full transition-colors"
      >
        <X size={24} strokeWidth={1} className="text-zinc-400 hover:text-zinc-900 transition-colors" />
      </motion.button>

      <div className="w-full h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
        
        {/* ── SIDEBAR SUMMARY ── */}
        <div className="w-full lg:w-[40%] bg-zinc-50/50 p-6 md:p-12 lg:p-24 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-100 shrink-0">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-md">
            <span className="font-serif uppercase tracking-[0.4em] text-[10px] text-zinc-400 mb-8 block">
              PHASE {step} / 4
            </span>
            <h1 className="font-serif text-5xl md:text-8xl tracking-tighter leading-[0.85] mb-12">
              Le Rituel <br /> <span className="italic text-zinc-300 font-light">Intentionnel.</span>
            </h1>
            
            <div className="space-y-16 mt-24">
              <AnimatePresence mode="wait">
                {selectedService && (
                  <motion.div 
                    key="summary-service" 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }} 
                    className="group"
                  >
                    <p className="font-serif uppercase tracking-[0.4em] text-[8px] text-zinc-400 mb-6">MODULE SÉLECTIONNÉ</p>
                    <p className="font-serif text-3xl tracking-tighter uppercase leading-tight group-hover:italic transition-all duration-700">{selectedService.name}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="font-serif text-[10px] text-zinc-400 tracking-[0.2em] uppercase">{selectedService.duration}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-200"></span>
                      <span className="font-serif text-[10px] text-zinc-400 tracking-[0.2em] uppercase">{selectedService.price} CHF</span>
                    </div>
                  </motion.div>
                )}
                
                {selectedDate && selectedTime && (
                  <motion.div 
                    key="summary-datetime" 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }} 
                    className="pt-16 border-t border-zinc-100"
                  >
                    <p className="font-serif uppercase tracking-[0.4em] text-[8px] text-zinc-400 mb-6">TEMPORALITÉ</p>
                    <p className="font-serif text-3xl tracking-tighter capitalize leading-tight italic font-light">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
                    <p className="font-serif text-[10px] text-zinc-400 mt-4 tracking-[0.3em] uppercase">Rendez-vous à {selectedTime}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="mt-auto hidden lg:block">
            <p className="font-serif text-[10px] text-zinc-300 tracking-[0.2em] uppercase">Serenity Relax Therapy by João © {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6 md:p-12 lg:p-24 overflow-y-auto scrollbar-hide relative">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-zinc-50">
            <motion.div 
              className="h-full bg-zinc-900"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="max-w-3xl mx-auto min-h-full flex flex-col pt-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-24">
                  <div>
                    <span className="font-serif uppercase tracking-[0.5em] text-[10px] text-zinc-300 mb-8 block">01 / SÉLECTION</span>
                    <h2 className="font-serif text-5xl md:text-7xl tracking-tighter uppercase leading-[0.9]">
                      L'Architecture <br /> <span className="italic font-light text-zinc-400 text-4xl md:text-6xl">de votre séance.</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-12">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleServiceSelect(s)}
                        className={`group relative text-left transition-all duration-700 flex justify-between items-end pb-12 border-b border-zinc-100 hover:border-zinc-900
                          ${selectedService?.id === s.id ? 'border-zinc-900' : ''}
                        `}
                      >
                        <div className="flex items-start gap-12">
                           <div className="w-24 h-32 bg-zinc-50 overflow-hidden transition-all duration-1000 shrink-0 relative">
                             <img src={s.image || ''} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                             <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/5 transition-colors"></div>
                           </div>
                           <div className="pt-2">
                            <span className="font-serif text-[9px] tracking-[0.4em] text-zinc-400 uppercase block mb-4">SOIN {s.id.split('-')[0]}</span>
                            <h4 className="font-serif text-2xl md:text-4xl tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">{s.name}</h4>
                            <p className="font-serif text-sm text-zinc-500 italic mt-6 max-w-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">{s.description}</p>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className="font-serif text-2xl tracking-tighter text-zinc-900 block mb-2">{s.price} CHF</span>
                          <span className="font-serif text-[10px] tracking-[0.3em] text-zinc-400 uppercase">{s.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-24">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-serif uppercase tracking-[0.5em] text-[10px] text-zinc-300 mb-8 block">02 / TEMPORALITÉ</span>
                      <h2 className="font-serif text-5xl md:text-7xl tracking-tighter uppercase italic font-light leading-[0.9]">L'instant <br /> <span className="text-zinc-900 not-italic">Présent.</span></h2>
                    </div>
                    <button onClick={() => setStep(1)} className="font-serif text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 flex items-center gap-4 transition-all pb-2 border-b border-zinc-100 hover:border-zinc-900">
                      <ArrowLeft size={12} /> RETOUR
                    </button>
                  </div>

                  <div className="space-y-24">
                    {/* CALENDAR */}
                    <div className="bg-white">
                      <div className="flex items-center justify-between mb-16">
                        <h3 className="font-serif text-2xl tracking-tighter uppercase italic text-zinc-900 font-light">
                          {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-8">
                          <button onClick={handlePrevMonth} className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><ChevronLeft size={20} strokeWidth={1} /></button>
                          <button onClick={handleNextMonth} className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><ChevronRight size={20} strokeWidth={1} /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-y-12">
                        {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map((d, i) => (
                          <div key={i} className="text-center font-serif text-[8px] tracking-[0.5em] text-zinc-300 font-medium">{d}</div>
                        ))}
                        {days.map((day, i) => {
                          const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const isPast = isBefore(day, startOfDay(new Date()));
                          const currentMonthOnly = isSameMonth(day, currentMonth);
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const dayOfWeek = getAdjDay(day);
                          const isOpened = availableSlots.some(s => s.date === dateStr && s.type === 'day_opened');
                          const baseConfigSlots = configSlots[dayOfWeek] || [];
                          const freeSlotsCount = !isOpened ? 0 : baseConfigSlots.filter(t => {
                            return !availableSlots.some(s => s.date === dateStr && s.time === t && (s.type === 'blocked' || s.type === 'booked'));
                          }).length;

                          return (
                            <div key={i} className="flex flex-col items-center">
                              <button
                                disabled={isPast || !currentMonthOnly || freeSlotsCount === 0}
                                onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                                className={`w-14 h-14 flex flex-col items-center justify-center font-serif text-lg transition-all duration-700 relative
                                  ${!currentMonthOnly ? 'opacity-0 pointer-events-none' : ''}
                                  ${isPast || freeSlotsCount === 0 ? 'text-zinc-200 cursor-not-allowed opacity-20' : 'text-zinc-900 hover:text-zinc-400'}
                                  ${isSelected ? 'text-zinc-900 italic font-medium scale-125' : ''}
                                `}
                              >
                                {format(day, 'd')}
                                {isSelected && (
                                  <motion.div 
                                    layoutId="cal-active-dot" 
                                    className="absolute -bottom-2 w-1 h-1 bg-zinc-900 rounded-full" 
                                  />
                                )}
                                {!isPast && currentMonthOnly && freeSlotsCount > 0 && !isSelected && (
                                  <div className="absolute -bottom-2 w-[2px] h-[2px] bg-zinc-100 rounded-full" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* TIME SLOTS */}
                    <AnimatePresence>
                      {selectedDate && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12 pt-12 border-t border-zinc-100">
                          <span className="font-serif uppercase tracking-[0.5em] text-[10px] text-zinc-300 block">CRÉNEAUX DISPONIBLES</span>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {(() => {
                              const dateStr = format(selectedDate, 'yyyy-MM-dd');
                              const dayOfWeek = getAdjDay(selectedDate);
                              const baseConfigSlots = configSlots[dayOfWeek] || [];
                              const freeSlots = baseConfigSlots.filter(t => !availableSlots.some(s => s.date === dateStr && s.time === t && (s.type === 'blocked' || s.type === 'booked')));
                              
                              return freeSlots.map((t) => (
                                <button
                                  key={t}
                                  onClick={() => handleTimeSelect(t)}
                                  className={`py-8 border-b transition-all duration-700 font-serif text-2xl tracking-tighter
                                    ${selectedTime === t ? 'text-zinc-900 border-zinc-900 italic scale-110' : 'text-zinc-300 border-zinc-100 hover:text-zinc-900 hover:border-zinc-900'}
                                  `}
                                >
                                  {t}
                                </button>
                              ));
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-24">
                   <div className="flex items-end justify-between">
                    <div>
                      <span className="font-serif uppercase tracking-[0.5em] text-[10px] text-zinc-300 mb-8 block">03 / IDENTIFICATION</span>
                      <h2 className="font-serif text-5xl md:text-7xl tracking-tighter uppercase leading-[0.9]">Présence <br /> <span className="italic font-light text-zinc-400">&amp; Contact.</span></h2>
                    </div>
                    <button onClick={() => setStep(2)} className="font-serif text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 flex items-center gap-4 transition-all pb-2 border-b border-zinc-100 hover:border-zinc-900">
                      <ArrowLeft size={12} /> RETOUR
                    </button>
                  </div>

                  <form className="space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-6 group">
                        <Label className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase group-focus-within:text-zinc-900 transition-colors">PRÉNOM</Label>
                        <Input 
                          value={formData.firstName} 
                          onChange={(e: any) => setFormData({...formData, firstName: e.target.value})}
                          className="h-16 bg-transparent border-0 border-b border-zinc-100 rounded-none px-0 font-serif text-3xl md:text-4xl tracking-tighter uppercase focus-visible:ring-0 focus-visible:border-zinc-900 transition-all placeholder:text-zinc-50"
                          placeholder="MARIE"
                        />
                      </div>
                      <div className="space-y-6 group">
                        <Label className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase group-focus-within:text-zinc-900 transition-colors">NOM</Label>
                        <Input 
                          value={formData.lastName} 
                          onChange={(e: any) => setFormData({...formData, lastName: e.target.value})}
                          className="h-16 bg-transparent border-0 border-b border-zinc-100 rounded-none px-0 font-serif text-3xl md:text-4xl tracking-tighter uppercase focus-visible:ring-0 focus-visible:border-zinc-900 transition-all placeholder:text-zinc-50"
                          placeholder="DUPONT"
                        />
                      </div>
                    </div>
                    <div className="space-y-6 group">
                      <Label className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase group-focus-within:text-zinc-900 transition-colors">EMAIL</Label>
                      <Input 
                        type="email"
                        value={formData.email} 
                        onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                        className="h-16 bg-transparent border-0 border-b border-zinc-100 rounded-none px-0 font-serif text-3xl md:text-4xl tracking-tighter lowercase focus-visible:ring-0 focus-visible:border-zinc-900 transition-all placeholder:text-zinc-50"
                        placeholder="marie.dupont@email.com"
                      />
                    </div>
                    <div className="space-y-6 group">
                      <Label className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase group-focus-within:text-zinc-900 transition-colors">TÉLÉPHONE MOBILE</Label>
                      <Input 
                        value={formData.phone} 
                        onChange={(e: any) => setFormData({...formData, phone: e.target.value})}
                        className="h-16 bg-transparent border-0 border-b border-zinc-100 rounded-none px-0 font-serif text-3xl md:text-4xl tracking-tighter focus-visible:ring-0 focus-visible:border-zinc-900 transition-all placeholder:text-zinc-50"
                        placeholder="+41 78 000 00 00"
                      />
                    </div>

                    <div className="pt-12">
                      <button 
                        onClick={() => setStep(4)}
                        disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                        className="w-full py-10 bg-zinc-900 text-white font-serif uppercase tracking-[0.5em] text-[10px] hover:bg-zinc-800 transition-all duration-700 disabled:opacity-10 flex items-center justify-center gap-8 group shadow-2xl shadow-zinc-900/10"
                      >
                        VÉRIFIER LE RÉCAPITULATIF <ArrowRight size={14} className="group-hover:translate-x-4 transition-transform duration-700" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-24">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-serif uppercase tracking-[0.5em] text-[10px] text-zinc-300 mb-8 block">04 / RÉCAPITULATIF</span>
                      <h2 className="font-serif text-5xl md:text-7xl tracking-tighter uppercase leading-[0.9]">
                        L&apos;alignement <br /> <span className="italic font-light text-zinc-400">Final.</span>
                      </h2>
                    </div>
                    <button onClick={() => setStep(3)} className="font-serif text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 flex items-center gap-4 transition-all pb-2 border-b border-zinc-100 hover:border-zinc-900">
                      <ArrowLeft size={12} /> RETOUR
                    </button>
                  </div>

                  <div className="space-y-16">
                    <div className="grid grid-cols-1 gap-16">
                      <div className="pb-12 border-b border-zinc-50 flex justify-between items-end">
                        <div className="space-y-4">
                          <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase">CONFIGURATION</p>
                          <p className="font-serif text-3xl md:text-5xl tracking-tighter uppercase italic leading-none">{selectedService?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-xl tracking-tighter text-zinc-900 leading-none mb-2">{selectedService?.price} CHF</p>
                          <p className="font-serif text-[9px] tracking-[0.3em] text-zinc-400 uppercase">{selectedService?.duration}</p>
                        </div>
                      </div>

                      <div className="pb-12 border-b border-zinc-50 flex justify-between items-end">
                        <div className="space-y-4">
                          <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase">TEMPORALITÉ</p>
                          <p className="font-serif text-3xl md:text-5xl tracking-tighter uppercase leading-none">
                            {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-xl tracking-tighter text-zinc-900 leading-none uppercase italic font-light">à {selectedTime}</p>
                        </div>
                      </div>

                      <div className="pb-12 border-b border-zinc-50">
                        <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-300 uppercase mb-4">COORDONNÉES</p>
                        <p className="font-serif text-3xl md:text-5xl tracking-tighter uppercase leading-none">
                          {formData.firstName} <span className="italic font-light text-zinc-400">{formData.lastName}</span>
                        </p>
                        <div className="flex gap-8 mt-6">
                           <span className="font-serif text-[10px] tracking-[0.2em] text-zinc-400 uppercase">{formData.email}</span>
                           <span className="w-1 h-1 rounded-full bg-zinc-100 self-center"></span>
                           <span className="font-serif text-[10px] tracking-[0.2em] text-zinc-400 uppercase">{formData.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="flex items-start gap-8 group">
                         <div className="pt-1">
                           <Checkbox 
                            id="terms" 
                            checked={acceptedConditions} 
                            onCheckedChange={(checked: any) => setAcceptedConditions(checked === true)} 
                            className="w-5 h-5 border-zinc-200 rounded-none data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 transition-all duration-500" 
                           />
                         </div>
                         <Label htmlFor="terms" className="font-serif text-[11px] tracking-[0.2em] text-zinc-500 uppercase leading-relaxed cursor-pointer select-none group-hover:text-zinc-900 transition-colors">
                           Je confirme ma présence à ce rituel et accepte les conditions de réservation (annulation 24h à l'avance).
                         </Label>
                      </div>

                      <button 
                        onClick={completeBooking}
                        disabled={isSubmitting || !acceptedConditions}
                        className="w-full py-12 bg-zinc-900 text-white font-serif uppercase tracking-[0.5em] text-[10px] hover:bg-zinc-800 transition-all duration-1000 disabled:opacity-5 flex items-center justify-center gap-8 group relative overflow-hidden"
                      >
                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
                              <Loader2 className="animate-spin" size={16} strokeWidth={1} />
                              SÉCURISATION DU RITUEL...
                            </motion.div>
                          ) : (
                            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
                              CONFIRMER LA RÉSERVATION <ArrowRight size={14} className="group-hover:translate-x-8 transition-transform duration-1000" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" initial="hidden" animate="visible" variants={fadeIn} className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-16 md:space-y-24">
                   <div className="relative">
                     <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                        className="w-32 h-32 border border-zinc-100 flex items-center justify-center text-zinc-900 relative z-10 bg-white"
                     >
                       <CheckCircle2 size={40} strokeWidth={1} />
                     </motion.div>
                     <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.05 }}
                        transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-zinc-900 rounded-full"
                     />
                   </div>

                   <div className="space-y-8">
                     <h2 className="font-serif text-6xl md:text-8xl tracking-tighter uppercase italic leading-[0.8]">Confirmé.</h2>
                     <p className="font-serif text-xl text-zinc-400 italic max-w-sm mx-auto leading-relaxed">
                       Votre espace est préservé. <br />
                       <span className="not-italic text-[10px] uppercase tracking-[0.3em] text-zinc-300 mt-4 block">Le calme commence maintenant.</span>
                     </p>
                   </div>
                   
                   <div className="w-full max-w-sm pt-24 border-t border-zinc-50 space-y-12">
                      <div className="space-y-2">
                        <p className="font-serif text-[8px] tracking-[0.5em] text-zinc-300 uppercase">RÉFÉRENCE DE RÉSERVATION</p>
                        <p className="font-serif text-2xl tracking-tighter text-zinc-900 uppercase">{bookingRef}</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <a 
                          href="https://wa.me/41783336823" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group flex items-center justify-center gap-4 py-6 bg-zinc-900 text-white font-serif text-[10px] tracking-[0.5em] uppercase hover:bg-zinc-800 transition-all duration-700 shadow-2xl"
                        >
                          <MessageCircle size={14} className="group-hover:scale-110 transition-transform duration-700" /> CONTACT WHATSAPP
                        </a>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="py-6 border border-zinc-100 font-serif text-[10px] tracking-[0.5em] uppercase text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all duration-700"
                        >
                          FERMER LE PORTAIL
                        </button>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}