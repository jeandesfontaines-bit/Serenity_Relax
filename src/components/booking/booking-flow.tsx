
"use client";

import React, { useState, useEffect } from 'react';
import { Service } from '@/lib/types';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2,
  X,
  CalendarClock,
  Clock,
  Banknote,
  ArrowLeft,
  Check
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
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { simplifyServiceName } from '@/lib/utils';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
  onClose?: () => void;
}

export function BookingFlow({ services, initialServiceId, onClose }: BookingFlowProps) {
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
      setAvailableSlots(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (snap) => {
      if (snap.exists()) setConfigSlots(snap.data() as any);
    });
    return () => { unsubAvail(); unsubConfig(); };
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
    setStep(2);
  };

  const completeBooking = async () => {
    if (!firestore || !selectedService || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      let finalUserId = user?.uid;
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }
      if (!finalUserId) throw new Error("Impossible d'établir une session sécurisée.");

      const appointmentId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const startTimeStr = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const duration = parseInt(selectedService.duration) || 60;
      const endTime = addMinutes(new Date(startTimeStr), duration);
      
      const appointmentData = {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'confirmed',
        clientMessage: formData.message,
        clientNameSnapshot: `${formData.firstName} ${formData.lastName}`.trim(),
        clientEmail: formData.email,
        phone: formData.phone,
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), appointmentData),
        setDoc(doc(firestore, 'clients', finalUserId), { ...formData, id: finalUserId, updatedAt: serverTimestamp() }, { merge: true }),
        setDoc(doc(firestore, 'availability', appointmentId), {
           type: 'booked',
           date: format(selectedDate, 'yyyy-MM-dd'),
           time: selectedTime,
           appointmentId
        })
      ]);

      setBookingRef(appointmentId);
      setStep(5);
      toast({ title: "Réservation confirmée" });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally { setIsSubmitting(false); }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  });

  if (step === 5) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-[#19684a] text-white rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-medium tracking-tight">Rituel réservé avec succès.</h2>
        <p className="text-[#6b625c] max-w-sm">
          Un email de confirmation vous a été envoyé. Nous nous réjouissons de vous accueillir prochainement.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#161311] text-white px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-widest"
        >
          Retour au site
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white relative overflow-hidden">
      
      {/* --- LEFT SIDEBAR: Service Summary (Hidden on Step 1) --- */}
      {step > 1 && (
        <div className="w-full lg:w-[400px] bg-[#ede2d6] p-10 flex flex-col flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedService ? (
              <motion.div 
                key="service-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full"
              >
                <Image 
                  src={selectedService.image || ''} 
                  width={400} 
                  height={250} 
                  alt={selectedService.name}
                  className="w-full aspect-[16/10] object-cover rounded-[18px] mb-8 shadow-lg"
                  unoptimized
                />
                <div className="inline-flex items-center px-3 py-1.5 bg-white rounded-full text-[10px] font-semibold uppercase tracking-[1px] mb-6 self-start">
                  {selectedService.duration.includes('90') || selectedService.name.includes('Bambou') ? 'Signature' : 'Performance'}
                </div>
                <h2 className="text-[28px] font-medium leading-[1.15] tracking-tight mb-4">
                  {simplifyServiceName(selectedService.name)}
                </h2>
                <p className="text-[15px] text-[#6b625c] leading-relaxed mb-8">
                  {selectedService.description}
                </p>

                <div className="mt-auto space-y-4 border-t border-[#d9cdc0] pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] text-[#6b625c]">
                      <CalendarClock size={18} /> <span>Séance</span>
                    </div>
                    <div className={`text-[14px] font-semibold px-2.5 py-1 rounded bg-white ${selectedDate ? 'text-[#161311]' : 'text-[#6b625c]/40 italic'}`}>
                      {selectedDate && selectedTime ? format(selectedDate, 'eee d MMM, HH:mm', { locale: fr }) : 'Non planifié'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] text-[#6b625c]">
                      <Clock size={18} /> <span>Durée</span>
                    </div>
                    <div className="text-[14px] font-semibold">{selectedService.duration}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] text-[#6b625c]">
                      <Banknote size={18} /> <span>Prix</span>
                    </div>
                    <div className="text-[14px] font-semibold">{selectedService.price} CHF</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#161311] flex items-center justify-center">
                  <Clock size={32} />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest">Sélectionnez un rituel</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- RIGHT CONTENT: Steps --- */}
      <div className={`flex-1 p-8 lg:p-14 relative flex flex-col ${step === 1 ? 'max-w-7xl mx-auto w-full' : ''}`}>
        {/* Top Header Actions */}
        <div className="flex items-center justify-between mb-12">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="w-10 h-10 rounded-full bg-[#f6f0e8] flex items-center justify-center hover:bg-[#ede2d6] transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex-1" />
          {onClose && (
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#f6f0e8] flex items-center justify-center hover:bg-[#ede2d6] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SERVICE SELECTION */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full">
                <div className="mb-10">
                  <h3 className="text-[32px] font-medium leading-none tracking-tight mb-2">Choisir un soin</h3>
                  <p className="text-base text-[#6b625c]">Sélectionnez le rituel qui correspond à vos besoins et disponibilités.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(s => {
                    const isSignature = s.duration.includes('90') || s.name.includes('Bambous') || s.name.includes('Aromathérapie');
                    const isEssentiel = s.name.includes('Suédois') || s.name.includes('Prénatal');
                    const tag = isSignature ? 'Signature' : (isEssentiel ? 'Essentiel' : 'Performance');
                    const tagColorClass = isSignature ? 'bg-[#e6efe8] text-[#244235]' : (isEssentiel ? 'bg-[#ede2d6] text-[#14110f]' : 'bg-[#f4e8cf] text-[#695200]');

                    return (
                      <button 
                        key={s.id} 
                        onClick={() => handleServiceSelect(s)}
                        className="flex items-center justify-between p-5 rounded-[24px] border border-[#d9cdc0] bg-white hover:border-[#161311] hover:bg-[#f6f0e8] transition-all text-left min-h-[112px] group"
                      >
                        <div className="flex flex-col gap-2.5 flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-[18px] font-semibold text-[#161311] leading-tight truncate">
                              {simplifyServiceName(s.name)}
                            </h4>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${tagColorClass}`}>
                              {tag}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 text-sm text-[#6b625c] font-medium">
                            <div className="flex items-center gap-1.5">
                              <Clock size={16} className="text-[#6b625c]/60" />
                              <span>{s.duration}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-[#6b625c]/30" />
                            <span className="truncate max-w-[120px]">
                              {s.name.includes('Bambous') ? 'Relâchement profond' : 
                               s.name.includes('Lympha') ? 'Jambes légères' :
                               s.name.includes('Aroma') ? 'Apaisement sensoriel' :
                               s.name.includes('Réflex') ? 'Rééquilibrage global' :
                               s.name.includes('Sport') ? 'Récupération active' :
                               s.name.includes('Thérap') ? 'Zone ciblée' :
                               s.name.includes('Suédois') ? 'Détente totale' : 'Douceur & Confort'}
                            </span>
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-[#ede2d6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#161311] transition-colors">
                           <ChevronRight size={20} className="text-[#19684a] group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CALENDAR & TIME */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="max-w-xl">
                  <h3 className="text-2xl font-medium tracking-tight mb-2">Planifiez votre séance</h3>
                  <p className="text-[#6b625c]">Nos prochaines disponibilités au Alfa Business Center, Cointrin.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  {/* Calendar Widget */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-[#f6f0e8] rounded-full"><ChevronLeft size={16}/></button>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-[#f6f0e8] rounded-full"><ChevronRight size={16}/></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#6b625c]/40 uppercase tracking-widest">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((day, i) => {
                        const isPast = isBefore(day, startOfDay(new Date()));
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isOpened = availableSlots.some(s => s.date === dateStr && s.type === 'day_opened');
                        const isBooked = !isOpened; // Simple logic for demo, refine if needed

                        return (
                          <button
                            key={i}
                            disabled={isPast || !isCurrentMonth || isBooked}
                            onClick={() => setSelectedDate(day)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                              ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                              ${isPast || isBooked ? 'text-[#6b625c]/10' : 'text-[#161311] hover:bg-[#f6f0e8]'}
                              ${isSelected ? 'bg-[#161311] text-white shadow-lg' : ''}
                            `}
                          >
                            {format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-6">
                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#6b625c]">Heures disponibles</span>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-3">
                        {(() => {
                          const dateStr = format(selectedDate, 'yyyy-MM-dd');
                          const dayOfWeek = getAdjDay(selectedDate);
                          const baseSlots = configSlots[dayOfWeek] || [];
                          const freeSlots = baseSlots.filter(t => !availableSlots.some(s => s.date === dateStr && s.time === t && s.type === 'booked'));
                          
                          return freeSlots.length > 0 ? freeSlots.map(t => (
                            <button
                              key={t}
                              onClick={() => { setSelectedTime(t); setStep(3); }}
                              className={`py-3 rounded-xl border text-sm font-bold tracking-widest transition-all
                                ${selectedTime === t ? 'bg-[#161311] border-[#161311] text-white' : 'border-[#d9cdc0] hover:border-[#161311] hover:bg-[#f6f0e8]'}
                              `}
                            >
                              {t}
                            </button>
                          )) : <p className="text-xs italic text-[#6b625c]">Plus de créneaux.</p>;
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-[#d9cdc0] rounded-2xl text-xs text-[#6b625c]/40 font-medium italic">
                        Sélectionnez une date
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: INFOS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full">
                <div className="mt-8 mb-10 pr-12">
                  <h3 className="text-2xl font-medium tracking-tight mb-2">Vos Coordonnées</h3>
                  <p className="text-[15px] text-[#6b625c] leading-normal">
                    Veuillez renseigner vos informations pour confirmer la réservation.
                  </p>
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold">Nom complet</label>
                      <input 
                        type="text" 
                        value={`${formData.firstName} ${formData.lastName}`.trim()}
                        onChange={(e) => {
                          const [f, ...l] = e.target.value.split(' ');
                          setFormData({...formData, firstName: f || '', lastName: l.join(' ') || ''});
                        }}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-3.5 bg-[#fbf7f2] border border-[#d9cdc0] rounded-xl text-sm text-[#161311] focus:outline-none focus:ring-1 focus:ring-[#161311]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-semibold">Téléphone</label>
                       <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+41 78 123 45 67"
                        className="w-full px-4 py-3.5 bg-[#fbf7f2] border border-[#d9cdc0] rounded-xl text-sm text-[#161311] focus:outline-none focus:ring-1 focus:ring-[#161311]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jean.dupont@example.com"
                      className="w-full px-4 py-3.5 bg-[#fbf7f2] border border-[#d9cdc0] rounded-xl text-sm text-[#161311] focus:outline-none focus:ring-1 focus:ring-[#161311]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold">Adresse complète</label>
                    <textarea 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Rue de la Paix 10, 1200 Genève"
                      className="w-full px-4 py-3.5 bg-[#fbf7f2] border border-[#d9cdc0] rounded-xl text-sm text-[#161311] min-h-[80px] focus:outline-none focus:ring-1 focus:ring-[#161311]"
                    />
                  </div>

                  <div 
                    className="mt-2 flex items-start gap-3 cursor-pointer"
                    onClick={() => setAcceptedConditions(!acceptedConditions)}
                  >
                    <div className={`w-5 h-5 rounded-[4px] border flex flex-shrink-0 items-center justify-center transition-colors mt-0.5 ${acceptedConditions ? 'bg-[#19684a] border-[#19684a]' : 'bg-white border-[#d9cdc0]'}`}>
                      {acceptedConditions && <Check size={14} className="text-white" />}
                    </div>
                    <p className="text-[13px] text-[#6b625c] leading-relaxed">
                      En confirmant, j'accepte les <span className="text-[#19684a] font-medium underline">Conditions Générales</span> et la politique d'annulation. Toute séance non annulée 24h à l'avance sera facturée.
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t border-[#d9cdc0] flex justify-end">
                   <button 
                    disabled={isSubmitting || !acceptedConditions || !formData.firstName || !formData.email || !formData.phone}
                    onClick={completeBooking}
                    className="bg-[#19684a] text-white px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-widest flex items-center gap-2.5 disabled:opacity-30 transition-all hover:shadow-xl shadow-[#19684a]/20 active:scale-95"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirmer la réservation <CheckCircle2 size={18}/></>}
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}