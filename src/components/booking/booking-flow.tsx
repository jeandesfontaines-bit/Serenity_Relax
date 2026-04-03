
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
  Info,
  Loader2,
  MessageCircle,
  X
} from 'lucide-react';
import { format, addMinutes, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
}

export function BookingFlow({ services, initialServiceId }: BookingFlowProps) {
  const { firestore } = useFirestore();
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

  useEffect(() => {
    if (initialServiceId) {
      const found = services.find(s => s.id === initialServiceId);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
  }, [initialServiceId, services]);

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
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      if (!finalUserId) throw new Error("Session non établie.");

      const appointmentId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const startTimeStr = `${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const durationMatch = selectedService!.duration.match(/\d+/);
      const duration = durationMatch ? parseInt(durationMatch[0]) : 60;
      const endTime = addMinutes(new Date(startTimeStr), duration);

      setDocumentNonBlocking(doc(firestore, 'appointments', appointmentId), {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService!.id,
        serviceName: selectedService!.name,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'Booked',
        clientMessage: formData.message,
        isLoyaltyFreeSession: false,
        isConfirmed: false,
        createdAt: serverTimestamp()
      });

      setDocumentNonBlocking(doc(firestore, 'clients', finalUserId), {
        id: finalUserId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        loyaltySessionsCompleted: 0,
        isNextSessionFree: false,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setBookingRef(appointmentId);
      setStep(5);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Choix du soin", "Date & Heure", "Coordonnées", "Vérification"];

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
            className="w-full inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 text-white rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-emerald-700 gap-3"
          >
            <MessageCircle size={16} /> CONFIRMER WHATSAPP
          </a>
          <button onClick={() => window.location.reload()} className="w-full inline-flex items-center justify-center px-8 py-3.5 border border-neutral-900 rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-neutral-900 hover:text-white">
            RETOUR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white">
      {/* HEADER FIXE */}
      <div className="px-8 md:px-12 pt-12 pb-10 border-b border-neutral-100 mb-10">
        <div className="max-w-4xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-[2.2rem] font-serif font-bold text-neutral-900 tracking-tighter leading-none mb-3">Réserver un soin</h1>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-300">
              GENÈVE STUDIO — {step}/4
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 md:px-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300">1. SÉLECTIONNER UN RITUEL</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className={`group p-4 rounded-2xl border text-left transition-all duration-500 flex items-center gap-6 bg-white
                      ${selectedService?.id === s.id ? 'border-neutral-900 shadow-xl' : 'border-neutral-50 hover:border-neutral-200'}
                    `}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image 
                        src={s.image || ''} 
                        fill 
                        unoptimized 
                        alt={s.name} 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                      <h4 className="text-[1.05rem] leading-snug font-serif font-medium tracking-tight text-neutral-900 truncate">{s.name.split(' - ')[0]}</h4>
                      <div className="flex items-center gap-6 shrink-0">
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-neutral-300">{s.duration}</span>
                        <span className="text-[1.05rem] font-serif font-medium text-neutral-900">CHF {s.price}</span>
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
              <button 
                onClick={() => setStep(1)} 
                className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-neutral-300 hover:text-neutral-900 flex items-center gap-3 transition-colors"
              >
                <ChevronLeft size={16} /> MODIFIER LE SOIN ({selectedService?.name.split(' - ')[0].toUpperCase()})
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* COLONNE CALENDRIER */}
                <div className="space-y-10">
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300 block">1. SÉLECTIONNER UNE DATE</span>
                  
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[1.3rem] font-serif font-bold text-neutral-900 capitalize">
                        {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-neutral-50 rounded-full transition-all text-neutral-300 hover:text-neutral-900"><ChevronLeft size={20} /></button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-neutral-50 rounded-full transition-all text-neutral-300 hover:text-neutral-900"><ChevronRight size={20} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[0.7rem] font-black text-neutral-200 uppercase tracking-[0.2em] mb-4">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2">
                      {days.map((day, i) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isPast = isBefore(day, startOfDay(new Date()));
                        const currentMonthOnly = isSameMonth(day, currentMonth);
                        
                        // Mock de disponibilité pour le visuel
                        const availability = isPast ? 'none' : (day.getDate() % 3 === 0 ? 'medium' : day.getDate() % 5 === 0 ? 'full' : 'low');

                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <button
                              disabled={isPast || !currentMonthOnly}
                              onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                              className={`w-10 h-10 flex items-center justify-center rounded-full text-[1rem] font-sans font-medium transition-all relative
                                ${!currentMonthOnly ? 'opacity-0 pointer-events-none' : ''}
                                ${isPast ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-900 hover:bg-neutral-50'}
                                ${isSelected ? 'bg-neutral-900 text-white shadow-xl scale-110' : ''}
                              `}
                            >
                              {format(day, 'd')}
                            </button>
                            {currentMonthOnly && !isPast && (
                              <div className={`w-1.5 h-1.5 rounded-full ${availability === 'low' ? 'bg-emerald-400' : availability === 'medium' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* LÉGENDE */}
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-neutral-300">LIBRE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-neutral-300">MOYEN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-neutral-300">COMPLET</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLONNE HEURES */}
                <div className="space-y-10">
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300 block">2. CHOISIR L'HEURE</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {times.map((t) => (
                      <button
                        key={t}
                        disabled={!selectedDate}
                        onClick={() => handleTimeSelect(t)}
                        className={`py-6 px-4 rounded-2xl transition-all duration-500 font-sans font-bold text-[1.1rem] tracking-tight
                          ${!selectedDate ? 'bg-neutral-50/50 text-neutral-200 cursor-not-allowed' : 
                            selectedTime === t ? 'bg-neutral-900 text-white shadow-xl' : 'bg-neutral-50/50 text-neutral-900 hover:bg-neutral-100'}
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <button 
                onClick={() => setStep(2)} 
                className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-neutral-300 hover:text-neutral-900 flex items-center gap-3 transition-colors"
              >
                <ChevronLeft size={16} /> RETOUR AU CALENDRIER
              </button>

              <div className="space-y-10">
                <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300 block">3. VOS COORDONNÉES</span>
                
                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[0.65rem] font-black uppercase tracking-widest text-neutral-400 ml-4">PRÉNOM</Label>
                      <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-serif text-[1rem] italic" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[0.65rem] font-black uppercase tracking-widest text-neutral-400 ml-4">NOM</Label>
                      <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-serif text-[1rem] italic" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[0.65rem] font-black uppercase tracking-widest text-neutral-400 ml-4">EMAIL</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-sans font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[0.65rem] font-black uppercase tracking-widest text-neutral-400 ml-4">MOBILE</Label>
                    <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-sans font-medium" />
                  </div>
                </div>

                <div className="pt-10 border-t border-neutral-100 max-w-2xl">
                   <div className="space-y-6 text-[0.85rem] leading-relaxed text-neutral-400 italic font-sans mb-10">
                    <p>Les prestations proposées sont exclusivement dédiées au bien-être et à la relaxation. Elles ne remplacent en aucun cas un avis ou un traitement médical.</p>
                    <p>En réservant une séance, vous confirmez être en bonne condition physique et ne pas avoir de contre-indication au massage.</p>
                    <p>Toute annulation ou modification doit être effectuée au minimum 24h à l’avance. En cas d’annulation tardive ou d’absence, la séance pourra être facturée.</p>
                  </div>
                  <div className="flex items-start space-x-4 bg-neutral-50 p-8 rounded-[2rem]">
                    <Checkbox id="terms" checked={acceptedConditions} onCheckedChange={(checked) => setAcceptedConditions(checked === true)} className="mt-1" />
                    <Label htmlFor="terms" className="text-[0.8rem] font-sans font-bold text-neutral-900 cursor-pointer leading-tight">
                      J'accepte les conditions et confirme mon état de santé pour cette séance.
                    </Label>
                  </div>
                </div>

                <div className="pt-10">
                  <button 
                    disabled={!formData.firstName || !formData.email || !acceptedConditions} 
                    onClick={() => setStep(4)} 
                    className="w-full max-w-2xl inline-flex items-center justify-center px-12 py-4 bg-neutral-900 text-white rounded-full text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 disabled:opacity-20"
                  >
                    VÉRIFIER LE RÉCAPITULATIF
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-12 text-center"
            >
              <div className="inline-flex w-16 h-16 bg-neutral-50 rounded-full items-center justify-center text-neutral-900 mb-6">
                <Info size={24} />
              </div>
              <h2 className="text-[2.2rem] font-serif font-bold text-neutral-900 tracking-tighter leading-none">Récapitulatif de votre rituel.</h2>
              
              <div className="text-left bg-neutral-50/50 p-10 rounded-[3rem] space-y-10 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <p className="text-[0.65rem] font-black text-neutral-300 uppercase tracking-[0.2em]">SOIN & RENDEZ-VOUS</p>
                  <p className="text-[1.3rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{selectedService?.name.split(' - ')[0]}</p>
                  <p className="text-[1.1rem] font-sans font-medium text-neutral-500">
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : ''} à {selectedTime}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-[0.65rem] font-black text-neutral-300 uppercase tracking-[0.2em]">VOS COORDONNÉES</p>
                  <p className="text-[1.3rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{formData.firstName} {formData.lastName}</p>
                  <p className="text-[1.1rem] font-sans font-medium text-neutral-500">{formData.email}</p>
                </div>
              </div>

              <div className="pt-10 max-w-2xl mx-auto space-y-6">
                <button 
                  onClick={completeBooking} 
                  disabled={isSubmitting} 
                  className="w-full inline-flex items-center justify-center px-12 py-5 bg-neutral-900 text-white rounded-full text-[0.75rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 shadow-2xl gap-4"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>CONFIRMER LA RÉSERVATION <CheckCircle2 size={20} /></>}
                </button>
                <button onClick={() => setStep(3)} className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-neutral-300 hover:text-neutral-900 transition-colors">RETOUR</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
