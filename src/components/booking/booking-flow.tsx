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
import { simplifyServiceName } from '@/lib/utils';

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
        clientEmail: formData.email, // Added email
        magicToken: magicToken, // Added magicToken
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
        items: [
          {
            description: selectedService!.name,
            amount: selectedService!.price || 0,
            quantity: 1
          }
        ],
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
    const waMsg = `Bonjour Joao, je viens de réserver un rituel : ${simplifyServiceName(selectedService?.name || '')} le ${format(selectedDate!, 'EEEE d MMMM', { locale: fr })} à ${selectedTime}. Merci ! (Ref: ${bookingRef})`;
    const waUrl = `https://wa.me/41783336823?text=${encodeURIComponent(waMsg)}`;

    return (
      <div className="px-m text-center h-[80vh] flex flex-col justify-center bg-white">
        <div className="w-xxl h-xxl bg-success-background text-success rounded-md flex items-center justify-center mx-auto mb-l animate-in zoom-in-50 duration-500">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-display font-medium text-onyx mb-m tracking-heading leading-heading">Rituel réservé.</h2>
        <p className="font-heading text-small italic text-muted-foreground mb-xl max-w-sm mx-auto uppercase tracking-widest leading-loose">
          Votre réservation est enregistrée ! Un email de confirmation vient de vous être envoyé.
        </p>
        
        <div className="space-y-m max-w-sm mx-auto w-full px-m">
          <a 
            href={waUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full inline-flex items-center justify-center h-xl bg-success text-white rounded-md font-heading text-small font-black uppercase tracking-widest transition-all duration-500 hover:scale-[1.02] shadow-xl shadow-success/10 gap-xs"
          >
            <MessageCircle size={18} /> CONFIRMER SUR WHATSAPP
          </a>
          <button onClick={() => window.location.reload()} className="w-full h-l inline-flex items-center justify-center font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-onyx transition-all">
            RETOUR AU SITE
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
      <div className="w-full lg:w-[35%] lg:sticky lg:top-0 h-fit lg:min-h-full bg-secondary p-m md:p-xl lg:p-xxxl flex flex-col border-b lg:border-b-0 lg:border-r border-border z-10">
        <h1 className="font-heading text-display font-medium text-onyx tracking-heading leading-heading mb-m">
          Réserver<br/><span className="text-muted-foreground italic font-light">un rituel.</span>
        </h1>
        <p className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-xl">
          GENÈVE STUDIO — ÉTAPE {step}/4
        </p>

        {/* Dynamic Summary based on selection */}
        <div className="space-y-m mt-m lg:mt-xl flex-1">
          <AnimatePresence>
            {selectedService && step > 1 && (
                <motion.div key="summary-service" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-m bg-white border border-border rounded-md shadow-sm">
                  <p className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-xxs">RITUEL SÉLECTIONNÉ</p>
                  <p className="font-heading text-small font-black text-onyx uppercase tracking-widest leading-snug">{simplifyServiceName(selectedService.name)}</p>
                  <p className="font-heading text-[10px] font-bold text-muted-foreground mt-xxs uppercase tracking-widest">{selectedService.duration} • CHF {selectedService.price}</p>
                </motion.div>
            )}
            {selectedDate && selectedTime && step > 2 && (
                <motion.div key="summary-datetime" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-m bg-white border border-border rounded-md shadow-sm mt-m">
                  <p className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-xxs">DATE & HEURE</p>
                  <p className="font-heading text-small font-black text-onyx uppercase tracking-widest leading-snug capitalize">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
                  <p className="font-heading text-[10px] font-bold text-muted-foreground mt-xxs uppercase tracking-widest">à {selectedTime}</p>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE: Content */}
      <div className="w-full lg:w-[65%] p-m md:p-xl lg:p-xxxl pb-xl">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-xl"
              >
                <div className="space-y-xxs mb-l text-center lg:text-left">
                  <h3 className="font-heading text-small font-black text-onyx uppercase tracking-widest">Le Menu Signature</h3>
                  <p className="font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sélectionnez le rituel qui correspond à vos besoins d'aujourd'hui.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-xs sm:gap-s">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleServiceSelect(s)}
                      className={`group w-full flex flex-col p-xxs rounded-md transition-all duration-500 text-center border
                        ${selectedService?.id === s.id ? 'bg-secondary border-onyx shadow-sm' : 'bg-white border-border hover:border-muted-foreground/30 hover:shadow-sm'}
                      `}
                    >
                      <div className="relative w-full aspect-square rounded-md overflow-hidden mb-xs shrink-0 shadow-sm border border-border/50">
                        <Image 
                          src={s.image || ''} 
                          fill 
                          unoptimized 
                          alt={s.name} 
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-xxs pb-xs space-y-px">
                        <h4 className="font-heading text-[10px] leading-tight font-black text-onyx uppercase tracking-widest line-clamp-1">{simplifyServiceName(s.name)}</h4>
                        <div className="flex items-center justify-center gap-xs">
                          <span className="font-heading text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">{s.duration}</span>
                          <span className="font-heading text-[10px] font-black text-onyx uppercase tracking-widest">{s.price} CHF</span>
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
                className="space-y-xl"
              >
                <div className="flex items-center justify-between border-b border-border pb-m">
                  <span className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">DISPONIBILITÉS</span>
                  <button 
                    onClick={() => setStep(1)} 
                    className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-onyx flex items-center gap-xs transition-all"
                  >
                    <ChevronLeft size={14} /> CHANGER LE SOIN
                  </button>
                </div>

                <div className="space-y-xl">
                  {/* CALENDRIER */}
                  <div className="space-y-m">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-small font-black text-onyx uppercase tracking-widest">
                        {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-xs">
                        <button onClick={handlePrevMonth} className="w-l h-l flex items-center justify-center bg-secondary hover:bg-muted-foreground/10 rounded-md transition-all text-onyx"><ChevronLeft size={16} /></button>
                        <button onClick={handleNextMonth} className="w-l h-l flex items-center justify-center bg-secondary hover:bg-muted-foreground/10 rounded-md transition-all text-onyx"><ChevronRight size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center font-heading text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-xs">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-y-xs">
                      {days.map((day, i) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isPast = isBefore(day, startOfDay(new Date()));
                        const currentMonthOnly = isSameMonth(day, currentMonth);
                        
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayOfWeek = getAdjDay(day);
                        const baseConfigSlots = configSlots[dayOfWeek] || [];
                        
                        const isOpened = availableSlots.some(s => s.date === dateStr && s.type === 'day_opened');
                        
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
                          <div key={i} className="flex flex-col items-center gap-xxs">
                            <button
                              disabled={isPast || !currentMonthOnly || slotsCount === 0}
                              onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                              className={`w-l h-l flex items-center justify-center rounded-md font-heading text-small font-black transition-all relative
                                ${!currentMonthOnly ? 'opacity-0 pointer-events-none' : ''}
                                ${isPast || slotsCount === 0 ? 'text-muted-foreground/10 cursor-not-allowed' : 'text-onyx bg-secondary/50 hover:bg-secondary'}
                                ${isSelected ? 'bg-onyx text-white shadow-lg hover:bg-onyx/90' : ''}
                              `}
                            >
                              {format(day, 'd')}
                            </button>
                            {currentMonthOnly && !isPast && (
                              <div className={`w-xxs h-xxs rounded-full ${availability === 'low' ? 'bg-success' : availability === 'medium' ? 'bg-warning' : 'bg-muted-foreground/10'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLONNE HEURES */}
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-m pt-m border-t border-border">
                        <span className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 block">HEURES DISPONIBLES</span>
                        
                        {(() => {
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
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-xs">
                                {freeSlots.map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => handleTimeSelect(t)}
                                    className={`h-xl px-m rounded-md transition-all duration-300 font-heading uppercase tracking-widest text-center
                                      ${selectedTime === t ? 'bg-onyx text-white shadow-lg font-black text-small' : 'bg-secondary/50 text-onyx hover:bg-secondary font-black text-small'}
                                    `}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            );
                          }
                          return (
                            <div className="py-xl text-center bg-secondary/50 rounded-md">
                              <p className="font-heading text-[10px] font-bold italic text-muted-foreground uppercase tracking-widest">Aucun créneau disponible.</p>
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
                className="space-y-xl"
              >
                <div className="flex items-center justify-between border-b border-border pb-m">
                  <span className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">VOS COORDONNÉES</span>
                  <button 
                    onClick={() => setStep(2)} 
                    className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-onyx flex items-center gap-xs transition-all"
                  >
                    <ChevronLeft size={14} /> CHANGER LA DATE
                  </button>
                </div>

                <div className="space-y-xl">
                  <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="grid grid-cols-1 gap-m">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-m">
                      <div className="space-y-xxs border-b border-border focus-within:border-onyx transition-colors pb-xs">
                        <Label htmlFor="booking-fname" className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">PRÉNOM *</Label>
                        <Input 
                          id="booking-fname"
                          name="booking_fname"
                          autoComplete="off"
                          value={formData.firstName} 
                          onChange={(e: any) => setFormData({...formData, firstName: e.target.value})} 
                          className="h-l rounded-none bg-transparent border-none px-0 font-heading text-small font-black text-onyx shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/20 uppercase tracking-widest" 
                          placeholder="Ex: Marie" 
                        />
                      </div>
                      <div className="space-y-xxs border-b border-border focus-within:border-onyx transition-colors pb-xs">
                        <Label htmlFor="booking-lname" className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">NOM *</Label>
                        <Input 
                          id="booking-lname"
                          name="booking_lname"
                          autoComplete="off"
                          value={formData.lastName} 
                          onChange={(e: any) => setFormData({...formData, lastName: e.target.value})} 
                          className="h-l rounded-none bg-transparent border-none px-0 font-heading text-small font-black text-onyx shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/20 uppercase tracking-widest" 
                          placeholder="Ex: Dupont" 
                        />
                      </div>
                    </div>
                    <div className="space-y-xxs border-b border-border focus-within:border-onyx transition-colors pb-xs">
                      <Label htmlFor="booking-mail" className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">EMAIL *</Label>
                      <Input 
                        id="booking-mail"
                        name="booking_mail"
                        autoComplete="off"
                        value={formData.email} 
                        onChange={(e: any) => setFormData({...formData, email: e.target.value})} 
                        className="h-l rounded-none bg-transparent border-none px-0 font-heading text-small font-black text-onyx shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/20 uppercase tracking-widest" 
                        placeholder="marie.dupont@email.com" 
                      />
                    </div>
                    <div className="space-y-xxs border-b border-border focus-within:border-onyx transition-colors pb-xs">
                      <Label htmlFor="booking-tel" className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">MOBILE *</Label>
                      <Input 
                        id="booking-tel"
                        name="booking_tel"
                        autoComplete="off"
                        value={formData.phone} 
                        onChange={(e: any) => setFormData({...formData, phone: e.target.value})} 
                        className="h-l rounded-none bg-transparent border-none px-0 font-heading text-small font-black text-onyx shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/20 uppercase tracking-widest" 
                        placeholder="+41 78 000 00 00" 
                      />
                    </div>
                  </form>

                  <button 
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone} 
                    onClick={() => {
                        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                        setTimeout(() => setStep(4), 100);
                    }} 
                    className="w-full h-xl inline-flex items-center justify-center bg-onyx text-white rounded-md font-heading text-small font-black uppercase tracking-widest transition-all hover:bg-onyx/90 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-onyx/10 gap-xs"
                  >
                    CONTINUER <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-xl text-center"
              >
                <div className="inline-flex w-xxl h-xxl bg-secondary rounded-md items-center justify-center text-onyx mb-xxs">
                  <CheckCircle2 size={24} />
                </div>
                <h2 className="font-heading text-display font-medium text-onyx tracking-heading leading-heading">C'est presque prêt.</h2>
                
                <div className="text-left bg-secondary p-m lg:p-xl rounded-md space-y-m">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-m">
                    <div className="space-y-xxs">
                      <p className="font-heading text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">RITUEL CONFIRMÉ</p>
                      <p className="font-heading text-small font-black text-onyx uppercase tracking-widest leading-tight">{simplifyServiceName(selectedService?.name || '')}</p>
                      <p className="font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-xxs">
                        {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : ''} à {selectedTime}
                      </p>
                    </div>
                    <div className="space-y-xxs sm:border-l sm:border-border sm:pl-m">
                      <p className="font-heading text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">RÉSERVÉ POUR</p>
                      <p className="font-heading text-small font-black text-onyx uppercase tracking-widest leading-tight">{formData.firstName} {formData.lastName}</p>
                      <p className="font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-xxs">{formData.phone}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-m mt-m">
                     <p className="font-heading text-[10px] font-black text-onyx uppercase tracking-widest mb-xs">Conditions</p>
                     <ul className="list-disc pl-m space-y-xxs font-heading text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-m">
                        <li>Bien-être, non thérapeutique.</li>
                        <li>Aucune contre-indication.</li>
                        <li>Annulation minimum 24h à l'avance.</li>
                     </ul>
                     <div className="flex items-start space-x-m bg-white p-m rounded-md border border-border/50">
                      <Checkbox id="terms" checked={acceptedConditions} onCheckedChange={(checked: any) => setAcceptedConditions(checked === true)} className="mt-0.5" />
                      <Label htmlFor="terms" className="font-heading text-[10px] font-bold text-onyx uppercase tracking-widest cursor-pointer leading-relaxed">
                        J'accepte les conditions et je confirme ne pas avoir de contre-indication.
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-m">
                  <button 
                    onClick={completeBooking} 
                    disabled={isSubmitting || !acceptedConditions} 
                    className="w-full h-xl inline-flex items-center justify-center bg-success text-white rounded-md font-heading text-small font-black uppercase tracking-widest transition-all hover:bg-success/90 shadow-xl shadow-success/10 gap-xs"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>CONFIRMER LE RITUEL <CheckCircle2 size={18} /></>}
                  </button>
                  <button onClick={() => setStep(3)} className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-onyx transition-all pt-xs block w-full">RETOUR</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}