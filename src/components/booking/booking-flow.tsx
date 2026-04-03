
"use client";

import React, { useState, useEffect } from 'react';
import { Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Info,
  Loader2,
  MessageCircle,
  MapPin,
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
    setTimeout(() => setStep(2), 400);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => setStep(3), 500);
  };

  const times = ['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

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

  if (step === 5) {
    return (
      <div className="px-8 text-center animate-in zoom-in-95 duration-700 h-full flex flex-col justify-center">
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
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-emerald-600 border border-emerald-600 text-white rounded-full text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-emerald-700 gap-3"
          >
            <MessageCircle size={20} /> CONFIRMER WHATSAPP
          </a>
          <button onClick={() => window.location.reload()} className="w-full inline-flex items-center justify-center px-8 py-4 border border-neutral-200 rounded-full text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-neutral-900 hover:text-white">
            RETOUR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 font-sans pb-24">
      <div className="flex items-center justify-center mb-12 gap-3">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${step >= s ? 'bg-neutral-900 scale-125' : 'bg-neutral-100'}`} />
            {s < 4 && <div className={`w-8 h-[1px] ${step > s ? 'bg-neutral-900' : 'bg-neutral-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <span className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-300 block mb-2 md:text-[0.75rem]">Étape 01</span>
                <h2 className="text-[1.9rem] leading-tight font-serif font-bold text-neutral-900 tracking-tighter">Votre Rituel.</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className={`group p-4 rounded-2xl border text-left transition-all duration-500 flex items-center gap-4 bg-white
                      ${selectedService?.id === s.id ? 'border-neutral-900 shadow-xl' : 'border-neutral-50 hover:border-neutral-200'}
                    `}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image 
                        src={s.image || ''} 
                        fill 
                        unoptimized 
                        alt={s.name} 
                        className="object-cover transition-all duration-700 grayscale-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[1rem] leading-snug font-serif font-bold text-neutral-900 truncate">{s.name.split(' - ')[0]}</h4>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-400">{s.duration}</span>
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
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex justify-between items-end gap-6">
                <div>
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-300 block mb-2">Étape 02</span>
                  <h2 className="text-[1.9rem] leading-tight font-serif font-bold text-neutral-900 tracking-tighter">L'Agenda.</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-400 hover:text-neutral-900 flex items-center gap-2">
                  <ChevronLeft size={14} /> Modifier
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-neutral-50 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-neutral-50">
                  <h3 className="text-[1.1rem] font-serif font-bold text-neutral-900 capitalize">
                    {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-neutral-50 rounded-full transition-all text-neutral-300 hover:text-neutral-900"><ChevronLeft size={20} /></button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-neutral-50 rounded-full transition-all text-neutral-300 hover:text-neutral-900"><ChevronRight size={20} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center text-[0.7rem] font-black text-neutral-300 uppercase tracking-[0.28em] py-4 bg-neutral-50/50">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 p-4 gap-2">
                  {days.map((day, i) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const currentMonthOnly = isSameMonth(day, currentMonth);
                    return (
                      <button
                        key={i}
                        disabled={isPast || !currentMonthOnly}
                        onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                        className={`h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all
                          ${!currentMonthOnly ? 'opacity-0 pointer-events-none' : ''}
                          ${isPast ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-900 hover:bg-neutral-50'}
                          ${isSelected ? 'bg-neutral-900 text-white shadow-xl scale-110 !hover:bg-neutral-900' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {selectedDate && (
                  <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <label className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-300 block">Créneaux Disponibles</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {times.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleTimeSelect(t)}
                          className={`py-4 px-4 rounded-xl border-2 transition-all duration-500 font-serif font-bold text-[1.1rem]
                            ${selectedTime === t ? 'bg-neutral-900 border-neutral-900 text-white shadow-xl' : 'bg-white border-neutral-50 text-neutral-900 hover:border-neutral-200'}
                          `}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div>
                <span className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-300 block mb-2">Étape 03</span>
                <h2 className="text-[1.9rem] leading-tight font-serif font-bold text-neutral-900 tracking-tighter">Coordonnées.</h2>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-50 space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-serif text-[1rem] italic" />
                    <Input placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-serif text-[1rem] italic" />
                  </div>
                  <Input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-sans font-medium" />
                  <Input type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-14 rounded-2xl bg-neutral-50 border-none px-6 font-sans font-medium" />
                </div>
                
                <div className="pt-8 border-t border-neutral-50">
                  <h3 className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-900 mb-6 flex items-center gap-3">
                    <Info size={16} className="text-neutral-200" /> Conditions & informations
                  </h3>
                  <div className="space-y-4 text-[0.8125rem] leading-relaxed text-neutral-400 italic font-sans">
                    <p>Les prestations proposées sont exclusivement dédiées au bien-être et à la relaxation. Elles ne remplacent en aucun cas un avis ou un traitement médical.</p>
                    <p>En réservant une séance, vous confirmez être en bonne condition physique et ne pas avoir de contre-indication au massage. En cas de doute, n’hésitez pas à demander l’avis de votre médecin.</p>
                    <p>Toute annulation ou modification doit être effectuée au minimum 24h à l’avance. En cas d’annulation tardive ou d’absence, la séance pourra être facturée.</p>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 pt-6">
                  <button onClick={() => setStep(2)} className="inline-flex items-center justify-center px-8 py-3.5 border border-neutral-100 rounded-full text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all hover:bg-neutral-50">RETOUR</button>
                  <button 
                    disabled={!formData.firstName || !formData.email} 
                    onClick={() => setStep(4)} 
                    className="flex-1 inline-flex items-center justify-center px-8 py-3.5 bg-neutral-900 text-white border border-neutral-900 rounded-full text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all hover:bg-neutral-800"
                  >
                    VÉRIFIER
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-10 text-center"
            >
              <div className="inline-flex w-16 h-16 bg-neutral-50 rounded-full items-center justify-center text-neutral-900 mb-4">
                <Info size={24} />
              </div>
              <h2 className="text-[1.9rem] leading-tight font-serif font-bold text-neutral-900 tracking-tighter">Vérifiez votre rituel.</h2>
              
              <div className="text-left bg-white p-8 rounded-[2.5rem] border border-neutral-50 shadow-sm space-y-8">
                <div className="space-y-4">
                  <p className="text-[0.7rem] font-black text-neutral-300 uppercase tracking-widest">SOIN & RENDEZ-VOUS</p>
                  <p className="text-[1.1rem] leading-snug font-serif font-bold text-neutral-900">{selectedService?.name.split(' - ')[0]}</p>
                  <p className="text-[1rem] font-sans font-light italic text-neutral-500">
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : ''} à {selectedTime}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-[0.7rem] font-black text-neutral-300 uppercase tracking-widest">VOS COORDONNÉES</p>
                  <p className="text-[1.1rem] leading-snug font-serif font-bold text-neutral-900">{formData.firstName} {formData.lastName}</p>
                  <p className="text-[1rem] font-sans font-light italic text-neutral-500">{formData.email}</p>
                </div>
              </div>

              <div className="pt-10 flex flex-col gap-4">
                <button 
                  onClick={completeBooking} 
                  disabled={isSubmitting} 
                  className="w-full inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white border border-neutral-900 rounded-full text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all hover:bg-neutral-800 shadow-2xl gap-4"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>CONFIRMER LA RÉSERVATION <CheckCircle2 size={18} /></>}
                </button>
                <button onClick={() => setStep(3)} className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-neutral-300 hover:text-neutral-900 transition-colors">Retour</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
