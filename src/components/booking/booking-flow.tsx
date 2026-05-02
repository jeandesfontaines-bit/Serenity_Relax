"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock3,
  Loader2,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
  X,
  ArrowRight,
  ArrowLeft,
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
    addressStreet: '',
    postalCode: '',
    city: '',
    region: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const timeSlotsRef = useRef<HTMLDivElement | null>(null);

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
    if (!isOpen) return;

    if (!initialServiceId) {
      setStep(1);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [initialServiceId, isOpen]);

  useEffect(() => {
    if (step !== 2 || !selectedDate) return;

    const timeout = window.setTimeout(() => {
      timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [selectedDate, step]);

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
    setSelectedDate(null);
    setSelectedTime(null);
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
        addressStreet: formData.addressStreet,
        addressPostalCode: formData.postalCode,
        addressCity: formData.city,
        addressCountry: formData.region || 'Suisse',
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

  const getFreeSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getAdjDay(date);
    const baseConfigSlots = configSlots[dayOfWeek] || [];
    return baseConfigSlots.filter((t) => !availableSlots.some((s) => s.date === dateStr && s.time === t && (s.type === 'blocked' || s.type === 'booked')));
  };

  const groupedSelectedDateSlots = selectedDate
    ? {
        morning: getFreeSlotsForDate(selectedDate).filter((time) => parseInt(time.split(':')[0], 10) < 12),
        afternoon: getFreeSlotsForDate(selectedDate).filter((time) => {
          const hour = parseInt(time.split(':')[0], 10);
          return hour >= 12 && hour < 18;
        }),
        evening: getFreeSlotsForDate(selectedDate).filter((time) => parseInt(time.split(':')[0], 10) >= 18),
      }
    : { morning: [], afternoon: [], evening: [] };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden">
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute right-5 top-5 z-50 rounded-full p-3 transition-colors hover:bg-zinc-50 md:right-8 md:top-8 md:p-4"
      >
        <X size={24} strokeWidth={1} className="text-zinc-400 hover:text-zinc-900 transition-colors" />
      </motion.button>

      <div className="h-full w-full overflow-y-auto bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <div className="relative min-h-full p-5 md:p-8 lg:p-10 xl:p-14">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-zinc-50">
            <motion.div 
              className="h-full bg-zinc-900"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="mx-auto flex min-h-full max-w-[1240px] flex-col pt-8 md:pt-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-10 lg:space-y-12">
                  <div>
                    <span className="mb-3 block font-serif text-[10px] uppercase tracking-[0.4em] text-zinc-300">01 / SÉLECTION</span>
                    <h2 className="font-serif text-[30px] tracking-tighter uppercase leading-[0.94] md:text-[36px] xl:text-[44px]">
                      Choisissez <br /> <span className="italic font-light text-zinc-400">votre soin.</span>
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-5 text-zinc-500 md:text-[14px]">
                      Sélectionnez le rituel qui correspond à votre besoin. La date et les horaires disponibles apparaîtront à l’étape suivante.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
                    <div className="space-y-4 lg:col-span-7">
                      {services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleServiceSelect(s)}
                          className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-[0_12px_24px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#435544] hover:bg-[#fcfcfb] ${
                            selectedService?.id === s.id
                              ? 'border-[#435544] ring-1 ring-[#435544]/10'
                              : 'border-zinc-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 md:h-24 md:w-20">
                              <img
                                src={s.image || ''}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <span className="mb-2 block font-serif text-[9px] uppercase tracking-[0.28em] text-zinc-400">
                                    SOIN {s.id.split('-')[0]}
                                  </span>
                                  <h4 className="font-serif text-lg leading-tight text-zinc-900 md:text-[22px]">
                                    {s.name}
                                  </h4>
                                </div>

                                <div className="shrink-0 text-right">
                                  <span className="block font-serif text-lg tracking-tight text-[#435544] md:text-xl">
                                    {s.price} CHF
                                  </span>
                                  <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                                    {s.duration}
                                  </span>
                                </div>
                              </div>

                              <p className="mt-3 text-sm leading-5 text-zinc-500">
                                {s.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="lg:col-span-5">
                      <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] lg:sticky lg:top-8 xl:rounded-[28px] xl:top-10">
                        <div className="relative h-44 overflow-hidden xl:h-56">
                          {selectedService?.image ? (
                            <Image
                              src={selectedService.image}
                              alt={selectedService.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400">
                              <Sparkles size={28} strokeWidth={1.6} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                          <div className="absolute bottom-5 left-5">
                            <span className="rounded-full bg-[#d4e8d2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f1f11]">
                              Sélection
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 p-5 xl:space-y-5 xl:p-6">
                          <div className="space-y-1">
                            <h3 className="font-serif text-xl tracking-tight text-zinc-900 xl:text-2xl">
                              {selectedService?.name || 'Aucun soin sélectionné'}
                            </h3>
                            <p className="flex items-center gap-2 text-sm text-zinc-500">
                              <Calendar size={15} strokeWidth={1.8} />
                              {selectedService?.duration || 'Durée à définir'}
                            </p>
                          </div>

                          <div className="h-px bg-zinc-100" />

                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Étape actuelle</span>
                              <span className="font-semibold text-zinc-900">Choix du soin</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Prochaine étape</span>
                              <span className="font-semibold text-zinc-900">Date & heure</span>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-zinc-50 p-4">
                            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">Description</p>
                            <p className="text-sm leading-5 text-zinc-700">
                              {selectedService?.description || 'Choisissez un soin à gauche pour voir son résumé ici.'}
                            </p>
                          </div>

                          <div className="border-t border-dashed border-zinc-200 pt-4">
                            <div className="flex items-end justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Tarif</span>
                                <div className="text-[28px] font-semibold leading-none text-[#435544] xl:text-[32px]">
                                  {selectedService?.price ? `${selectedService.price} CHF` : '--'}
                                </div>
                              </div>
                              <div className="pb-1 text-xs italic text-zinc-500">
                                {selectedService ? 'Prix par séance' : 'Sélection requise'}
                              </div>
                            </div>
                          </div>

                          <div className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] ${
                            selectedService
                              ? 'border-[#d4e8d2] bg-[#f4fbf3] text-[#435544]'
                              : 'border-[#435544]/15 bg-[#435544]/5 text-[#435544]'
                          }`}>
                            {selectedService ? <CheckCircle2 size={16} strokeWidth={1.9} /> : <Sparkles size={16} strokeWidth={1.9} />}
                            <span>{selectedService ? 'Soin prêt à planifier' : 'Choisissez un soin pour continuer'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-12 lg:space-y-14">
                  <nav className="mx-auto flex max-w-3xl items-center justify-center xl:max-w-4xl">
                    <div className="flex w-full items-start">
                      <div className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          <div className="h-[2px] flex-1 bg-[#435544]" />
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#435544] text-white shadow-sm">
                            <CheckCircle2 size={16} strokeWidth={2.2} />
                          </div>
                          <div className="h-[2px] flex-1 bg-[#435544]" />
                        </div>
                        <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#435544]">
                          Soin
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          <div className="h-[2px] flex-1 bg-[#435544]" />
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#435544] text-white ring-4 ring-[#daeed8] shadow-md">
                            <span className="font-serif text-base font-semibold">2</span>
                          </div>
                          <div className="h-[2px] flex-1 bg-zinc-200" />
                        </div>
                        <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#435544]">
                          Date & heure
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          <div className="h-[2px] flex-1 bg-zinc-200" />
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 shadow-sm">
                            <span className="font-serif text-base font-semibold">3</span>
                          </div>
                          <div className="h-[2px] flex-1 bg-zinc-200" />
                        </div>
                        <span className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                          Détails
                        </span>
                      </div>
                    </div>
                  </nav>

                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
                    <div className="space-y-8 lg:col-span-7 xl:space-y-10">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="mb-6 block font-serif text-[10px] uppercase tracking-[0.45em] text-zinc-300">02 / TEMPORALITÉ</span>
                          <h2 className="font-serif text-[30px] leading-[0.96] tracking-tight text-[#435544] md:text-[36px] xl:text-[44px]">
                            Choisissez <span className="italic font-light text-zinc-400">votre moment.</span>
                          </h2>
                        </div>
                        <button onClick={() => setStep(1)} className="flex items-center gap-3 border-b border-zinc-100 pb-2 font-serif text-[10px] uppercase tracking-[0.35em] text-zinc-400 transition-all hover:border-zinc-900 hover:text-zinc-900">
                          <ArrowLeft size={12} /> Retour
                        </button>
                      </div>

                      <section className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.03)] md:p-6 lg:p-6 xl:rounded-[28px] xl:p-8">
                        <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center md:mb-8">
                          <div>
                            <h3 className="font-serif text-[26px] font-semibold text-[#435544] md:text-[30px] xl:text-[34px]">
                              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                            </h3>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                              Heure locale: Europe/Paris
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={handlePrevMonth} className="rounded-full border border-zinc-200 p-2.5 text-[#435544] transition-colors hover:bg-zinc-50">
                              <ChevronLeft size={18} strokeWidth={1.6} />
                            </button>
                            <button onClick={handleNextMonth} className="rounded-full border border-zinc-200 p-2.5 text-[#435544] transition-colors hover:bg-zinc-50">
                              <ChevronRight size={18} strokeWidth={1.6} />
                            </button>
                          </div>
                        </div>

                        <div className="mx-auto mb-5 grid max-w-xl grid-cols-7 gap-x-2 gap-y-3 text-center xl:max-w-2xl">
                          {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map((d, i) => (
                            <span key={i} className="py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                              {d}
                            </span>
                          ))}
                        </div>

                        <div className="mx-auto grid max-w-xl grid-cols-7 gap-x-2 gap-y-3 md:gap-y-4 xl:max-w-2xl">
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

                            return currentMonthOnly ? (
                              <button
                                key={i}
                                disabled={isPast || freeSlotsCount === 0}
                                onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                                className={`aspect-square rounded-xl text-[14px] transition-all duration-300 md:text-base xl:rounded-2xl xl:text-lg ${
                                  isPast || freeSlotsCount === 0
                                    ? 'cursor-not-allowed text-zinc-300 opacity-40'
                                    : isSelected
                                      ? 'scale-105 bg-[#435544] font-bold text-white shadow-md'
                                      : 'text-zinc-900 hover:bg-zinc-100'
                                }`}
                              >
                                {format(day, 'd')}
                              </button>
                            ) : (
                              <div key={i} className="flex aspect-square items-center justify-center text-[14px] text-zinc-300 md:text-base xl:text-lg">
                                {format(day, 'd')}
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <AnimatePresence>
                        {selectedDate && (
                          <motion.div ref={timeSlotsRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 xl:space-y-5">
                            {[
                              { key: 'morning', label: 'Matin', icon: Sun, slots: groupedSelectedDateSlots.morning },
                              { key: 'afternoon', label: 'Après-midi', icon: Sparkles, slots: groupedSelectedDateSlots.afternoon },
                              { key: 'evening', label: 'Soir', icon: Moon, slots: groupedSelectedDateSlots.evening },
                            ]
                              .filter((group) => group.slots.length > 0)
                              .map((group) => {
                                const Icon = group.icon;
                                return (
                                  <section key={group.key} className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.03)] xl:rounded-[28px] xl:p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-[#725a38]">
                                        <Icon size={18} strokeWidth={1.8} />
                                      </div>
                                      <h3 className="font-serif text-[22px] font-semibold text-zinc-900 xl:text-[24px]">{group.label}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                      {group.slots.map((slot) => (
                                        <button
                                          key={slot}
                                          onClick={() => handleTimeSelect(slot)}
                                          className={`rounded-xl border px-3 py-3 text-[13px] font-medium transition-all xl:rounded-2xl xl:px-4 xl:py-3.5 xl:text-sm ${
                                            selectedTime === slot
                                              ? 'border-[#435544] bg-[#eaf4e8] font-semibold text-[#435544] shadow-sm'
                                              : 'border-zinc-200 text-zinc-900 hover:border-[#435544] hover:bg-[#f4fbf3]'
                                          }`}
                                        >
                                          {slot}
                                        </button>
                                      ))}
                                    </div>
                                  </section>
                                );
                              })}

                            {getFreeSlotsForDate(selectedDate).length === 0 && (
                              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-500 shadow-[0_12px_24px_rgba(0,0,0,0.03)]">
                                Aucun créneau disponible pour cette date.
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <aside className="space-y-6 lg:col-span-5 lg:sticky lg:top-8 xl:col-span-4 xl:col-start-9 xl:top-10">
                      <div className="space-y-6 rounded-[28px] border border-zinc-200 bg-[#efeeec] p-6 lg:p-7 xl:space-y-8 xl:rounded-[32px] xl:p-10">
                        {selectedService?.image ? (
                          <div className="h-40 w-full overflow-hidden rounded-2xl xl:h-48">
                            <Image
                              src={selectedService.image}
                              alt={selectedService.name}
                              width={640}
                              height={320}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}

                        <div>
                          <h2 className="mb-5 font-serif text-[24px] font-semibold text-[#435544] xl:mb-6 xl:text-[28px]">Récapitulatif</h2>

                          <div className="space-y-6 xl:space-y-8">
                            <div className="flex items-start gap-5">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dfeadf] text-[#435544]">
                                <Sparkles size={24} strokeWidth={1.8} />
                              </div>
                              <div>
                                <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Soin sélectionné</p>
                                <p className="font-serif text-lg font-semibold leading-tight text-zinc-900 xl:text-xl">{selectedService?.name || 'À sélectionner'}</p>
                                {selectedService?.duration ? (
                                  <span className="mt-3 inline-block rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#435544]">
                                    {selectedService.duration}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex items-start gap-5">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fcdaaf]/40 text-[#725a38]">
                                <Calendar size={24} strokeWidth={1.8} />
                              </div>
                              <div>
                                <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Date & heure</p>
                                <p className="font-serif text-base font-semibold text-zinc-900 xl:text-lg">
                                  {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Choisissez une date'}
                                </p>
                                <p className="mt-1 text-sm text-zinc-600 xl:text-base">
                                  {selectedTime ? `${selectedTime} · ${selectedService?.duration || ''}` : 'Choisissez ensuite un créneau'}
                                </p>
                              </div>
                            </div>

                            <div className="border-t border-zinc-300/60 pt-6 xl:pt-8">
                              <div className="mb-3 flex items-center justify-between text-sm xl:mb-4 xl:text-base">
                                <span className="text-zinc-600">Tarif du soin</span>
                                <span className="font-medium text-zinc-900">{selectedService?.price ? `${selectedService.price} CHF` : 'À définir'}</span>
                              </div>
                              <div className="mb-4 flex items-center justify-between text-sm xl:mb-5 xl:text-base">
                                <span className="text-zinc-600">Accès au cabinet</span>
                                <span className="font-medium text-zinc-900">Inclus</span>
                              </div>
                              <div className="flex items-center justify-between border-t border-zinc-300/60 pt-6">
                                <span className="font-serif text-lg font-bold text-[#435544] xl:text-xl">Total</span>
                                <span className="font-serif text-[28px] font-bold text-[#435544] xl:text-[32px]">
                                  {selectedService?.price ? `${selectedService.price} CHF` : '--'}
                                </span>
                              </div>
                            </div>

                            <div className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] ${
                              selectedTime
                                ? 'border-[#d4e8d2] bg-[#f4fbf3] text-[#435544]'
                                : 'border-[#435544]/15 bg-[#435544]/5 text-[#435544]'
                            }`}>
                              {selectedTime ? <CheckCircle2 size={16} strokeWidth={2.2} /> : <Clock3 size={16} strokeWidth={2.2} />}
                              <p>{selectedTime ? 'Créneau prêt à confirmer' : 'Sélection en cours...'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={fadeIn} className="space-y-10 lg:space-y-12">
                   <div className="flex items-end justify-between">
                    <div>
                      <span className="font-serif uppercase tracking-[0.5em] text-[10px] text-zinc-300 mb-8 block">03 / IDENTIFICATION</span>
                      <h2 className="font-serif text-[30px] tracking-tighter uppercase leading-[0.94] md:text-[36px] xl:text-[44px]">Finalisez <br /> <span className="italic font-light text-zinc-400">votre réservation.</span></h2>
                      <p className="mt-3 max-w-xl text-sm leading-5 text-zinc-500 md:text-[14px]">
                        Presque terminé. Veuillez fournir vos coordonnées pour sécuriser votre séance.
                      </p>
                    </div>
                    <button onClick={() => setStep(2)} className="font-serif text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 flex items-center gap-4 transition-all pb-2 border-b border-zinc-100 hover:border-zinc-900">
                      <ArrowLeft size={12} /> RETOUR
                    </button>
                  </div>

                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
                    <form className="space-y-6 lg:col-span-7">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Prénom</Label>
                          <Input
                            value={formData.firstName}
                            onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="Julian"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Nom</Label>
                          <Input
                            value={formData.lastName}
                            onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="Thorne"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Adresse e-mail</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="julian@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Numéro de téléphone</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="+41 00 000 00 00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="ml-1 block text-[13px] text-zinc-600">Adresse</Label>
                        <Input
                          value={formData.addressStreet}
                          onChange={(e: any) => setFormData({ ...formData, addressStreet: e.target.value })}
                          className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                          placeholder="Rue du Lac 5"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Code postal</Label>
                          <Input
                            value={formData.postalCode}
                            onChange={(e: any) => setFormData({ ...formData, postalCode: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="1000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Ville</Label>
                          <Input
                            value={formData.city}
                            onChange={(e: any) => setFormData({ ...formData, city: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="Lausanne"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="ml-1 block text-[13px] text-zinc-600">Canton</Label>
                          <Input
                            value={formData.region}
                            onChange={(e: any) => setFormData({ ...formData, region: e.target.value })}
                            className="h-12 rounded-xl border-none bg-zinc-50 px-4 text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/20"
                            placeholder="Vaud"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="ml-1 block text-[13px] text-zinc-600">Notes ou demandes particulières</Label>
                        <textarea
                          value={formData.message}
                          onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
                          className="min-h-[108px] w-full rounded-xl border-none bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900/20"
                          placeholder="Indiquez ici toute précision..."
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          disabled={
                            !formData.firstName ||
                            !formData.lastName ||
                            !formData.email ||
                            !formData.phone
                          }
                          className="flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 px-5 py-4 font-serif text-[10px] uppercase tracking-[0.32em] text-white transition-all duration-700 hover:bg-zinc-800 disabled:opacity-20"
                        >
                          Vérifier le récapitulatif <ArrowRight size={14} className="transition-transform duration-700 group-hover:translate-x-4" />
                        </button>
                      </div>
                    </form>

                    <div className="lg:col-span-5">
                      <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] lg:sticky lg:top-8 xl:rounded-[28px] xl:top-10">
                        <div className="relative h-44 overflow-hidden xl:h-56">
                          {selectedService?.image ? (
                            <Image
                              src={selectedService.image}
                              alt={selectedService.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-zinc-100" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                          <div className="absolute bottom-5 left-5">
                            <span className="rounded-full bg-[#d4e8d2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f1f11]">
                              Récapitulatif
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 p-5 xl:space-y-5 xl:p-6">
                          <div className="space-y-1">
                            <h3 className="font-serif text-xl tracking-tight text-zinc-900 xl:text-2xl">{selectedService?.name}</h3>
                            <p className="flex items-center gap-2 text-sm text-zinc-500">
                              <Calendar size={15} strokeWidth={1.8} />
                              {selectedService?.duration}
                            </p>
                          </div>

                          <div className="h-px bg-zinc-100" />

                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Date</span>
                              <span className="font-semibold text-zinc-900">
                                {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : 'À sélectionner'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Heure</span>
                              <span className="font-semibold text-zinc-900">{selectedTime || 'À sélectionner'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Lieu</span>
                              <span className="font-semibold text-zinc-900">Cabinet Serene</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-zinc-500">Client</span>
                              <span className="font-semibold text-zinc-900">
                                {[formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'À compléter'}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-zinc-50 p-4">
                            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Coordonnées</p>
                            <div className="space-y-2 text-sm text-zinc-700">
                              <p>{formData.email || 'E-mail à renseigner'}</p>
                              <p>{formData.phone || 'Téléphone à renseigner'}</p>
                              {(formData.addressStreet || formData.postalCode || formData.city || formData.region) ? (
                                <p>
                                  {[formData.addressStreet, `${formData.postalCode} ${formData.city}`.trim(), formData.region]
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                              ) : (
                                <p>Adresse à renseigner</p>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-dashed border-zinc-200 pt-4">
                            <div className="flex items-end justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Montant total</span>
                                <div className="text-3xl font-semibold leading-none text-[#435544] xl:text-4xl">
                                  {selectedService?.price} CHF
                                </div>
                              </div>
                              <div className="pb-1 text-xs italic text-zinc-500">Taxes incluses</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-2xl bg-[#f4fbf3] px-4 py-3 text-sm text-[#3a4b3b]">
                            <CheckCircle2 size={16} strokeWidth={1.9} />
                            <span>Confirmation instantanée disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
