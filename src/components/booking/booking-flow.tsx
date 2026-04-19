'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon, 
  Trophy, 
  ShieldCheck, 
  MessageSquare, 
  User, 
  Loader2,
  X,
  CreditCard
} from 'lucide-react';
import { format, addMinutes, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Service } from '@/lib/types';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, serverTimestamp, collection, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import Image from 'next/image';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
  onClose?: () => void;
}

const LEVELS = [
  { id: 'serenite', name: 'Sérénité', discount: 0.05, min: 0, color: '#5F27CD' },
  { id: 'harmonie', name: 'Harmonie', discount: 0.10, min: 500, color: '#0ABDE3' },
  { id: 'equilibre', name: 'Équilibre', discount: 0.15, min: 1000, color: '#1DD1A1' },
  { id: 'zen', name: 'Zen Master', discount: 0.20, min: 2000, color: '#FF9F43' },
];

export function BookingFlow({ services, initialServiceId, onClose }: BookingFlowProps) {
  const firestore = useFirestore();
  const { user, isUserLoading: userLoading } = useUser();
  const auth = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Loyalty State
  const [clientPoints, setClientPoints] = useState(0);
  const [clientLevel, setClientLevel] = useState(LEVELS[0]);

  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({
    0: [], 1: ["11:00", "13:30", "15:00", "16:30", "18:00"], 
    2: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    3: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    4: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    5: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    6: ["09:00", "10:30", "12:00"]
  });

  useEffect(() => {
    if (!firestore) return;
    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap) => {
      setAvailableSlots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (snap) => {
      if (snap.exists()) setConfigSlots(snap.data() as any);
    });
    return () => { unsubAvail(); unsubConfig(); };
  }, [firestore]);

  useEffect(() => {
    async function fetchLoyalty() {
      if (!user?.uid || !firestore) return;
      const d = await getDoc(doc(firestore, 'clients', user.uid));
      if (d.exists()) {
        const p = d.data().points || 0;
        setClientPoints(p);
        const level = LEVELS.reduce((acc, l) => (p >= l.min ? l : acc), LEVELS[0]);
        setClientLevel(level);
      }
    }
    if (!userLoading && user) fetchLoyalty();
  }, [user, userLoading, firestore]);

  useEffect(() => {
    if (initialServiceId && services.length) {
      const found = services.find(s => s.id === initialServiceId);
      if (found) { setSelectedService(found); setStep(2); }
    }
  }, [initialServiceId, services]);

  const discountedPrice = selectedService ? Math.round(selectedService.price * (1 - clientLevel.discount)) : 0;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const completeBooking = async () => {
    if (!firestore || !selectedService || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }
      if (!finalUserId) throw new Error("Session inaccessible.");

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
        firstName: formData.firstName || user?.displayName?.split(' ')[0] || 'Anonyme',
        lastName: formData.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '',
        email: formData.email || user?.email || '',
        phone: formData.phone,
        clientMessage: formData.message,
        priceSnapshot: discountedPrice,
        discountApplied: clientLevel.discount,
        pointsEarned: Math.round(discountedPrice * 0.5),
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), appointmentData),
        setDoc(doc(firestore, 'availability', appointmentId), {
           type: 'booked',
           date: format(selectedDate, 'yyyy-MM-dd'),
           time: selectedTime,
           appointmentId
        })
      ]);

      setBookingRef(appointmentId);
      setStep(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  });

  if (step === 5) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100/50">
          <CheckCircle2 size={32} />
        </motion.div>
        <h2 className="title-luxe text-2xl mb-2">Rituel Confirmé</h2>
        <p className="text-sm italic text-gray-500 mb-8 max-w-sm">Votre espace de sérénité est réservé. Référence : <span className="text-[#222F3E] font-bold">{bookingRef}</span></p>
        <button onClick={() => window.location.reload()} className="btn-luxe px-8 py-3 text-xs">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[80vh] bg-white overflow-hidden relative">
      <AnimatePresence>
        {onClose && (
          <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </AnimatePresence>

      {/* ── LEFT: RITUAL SUMMARY (BIO-SIDEBAR) ── */}
      <div className="w-[35%] bg-[#F8F5F0] border-r border-gray-100 p-8 hidden lg:flex flex-col">
        <div className="mb-8">
          <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] mb-2">Rituel en cours</p>
          <h2 className="text-2xl font-light text-[#222F3E] tracking-tight leading-none">Votre Chemin<br/><span className="italic">vers le Soi.</span></h2>
        </div>

        <div className="flex-1 space-y-6">
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8 relative z-10">
              {/* Step 1: Service */}
              <div className={`flex gap-4 transition-opacity ${step < 1 ? 'opacity-20' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${step >= 1 ? 'bg-[#5F27CD] text-white shadow-md' : 'bg-white border text-gray-300'}`}>01</div>
                <div>
                  <p className="text-[0.5rem] font-black uppercase tracking-widest text-gray-400 mb-0.5">Rituel</p>
                  <p className="text-sm text-[#222F3E]">{selectedService?.name || 'Sélectionner un soin'}</p>
                </div>
              </div>
              {/* Step 2: Date */}
              <div className={`flex gap-4 transition-opacity ${step < 2 ? 'opacity-20' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${step >= 2 ? 'bg-[#5F27CD] text-white shadow-md' : 'bg-white border text-gray-300'}`}>02</div>
                <div>
                  <p className="text-[0.5rem] font-black uppercase tracking-widest text-gray-400 mb-0.5">Moment</p>
                  <p className="text-sm text-[#222F3E]">{selectedDate ? format(selectedDate, 'EEEE d MMM', { locale: fr }) : 'Choisir une date'}</p>
                  {selectedTime && <p className="text-[0.5rem] text-[#0ABDE3] font-bold mt-0.5 uppercase tracking-widest">À {selectedTime}</p>}
                </div>
              </div>
              {/* Step 3: Identity */}
              <div className={`flex gap-4 transition-opacity ${step < 3 ? 'opacity-20' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${step >= 3 ? 'bg-[#5F27CD] text-white shadow-md' : 'bg-white border text-gray-300'}`}>03</div>
                <div>
                  <p className="text-[0.5rem] font-black uppercase tracking-widest text-gray-400 mb-0.5">Identité</p>
                  <p className="text-sm text-[#222F3E]">{formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Vos coordonnées'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Badge in Sidebar */}
        {user && (
          <div className="mt-auto p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: clientLevel.color }}>
                <Trophy size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#222F3E]">{clientLevel.name}</p>
                <p className="text-[0.5rem] font-bold text-emerald-500 uppercase tracking-widest">-{clientLevel.discount * 100}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: INTERACTIVE CONTENT ── */}
      <div className="flex-1 overflow-auto p-6 lg:p-10 scrollbar-hide">
        <div className="max-w-xl mx-auto h-full flex flex-col">
          <AnimatePresence mode="wait">
            {/* STEP 1: SERVICES GRID */}
            {step === 1 && (
              <motion.div key="st1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                <div className="text-center lg:text-left">
                  <h3 className="text-xl font-medium text-[#222F3E]">Menu Signature</h3>
                  <p className="text-[0.65rem] text-gray-400 mt-1 italic">Quel voyage souhaitez-vous entreprendre ?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {services.map(s => (
                    <motion.button
                      key={s.id}
                      whileHover={{ y: -4 }}
                      onClick={() => { setSelectedService(s); setStep(2); }}
                      className={`dash-card p-3 text-left border transition-all ${selectedService?.id === s.id ? 'ring-2 ring-[#1DD1A1] border-transparent' : 'border-gray-50'}`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-sm">
                        <Image src={s.image || ''} fill alt={s.name} className="object-cover" />
                      </div>
                      <p className="text-xs font-bold text-[#222F3E] line-clamp-1 px-1">{s.name}</p>
                      <div className="flex items-center justify-between mt-1 px-1">
                        <span className="text-[0.5rem] font-bold text-gray-300 uppercase">{s.duration}</span>
                        <span className="text-sm font-medium text-[#5F27CD]">{s.price} CHF</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHRONOLOGY */}
            {step === 2 && (
              <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-medium text-[#222F3E] flex items-center gap-2">
                      <Clock className="text-[#5F27CD]" size={20} /> Votre Moment
                   </h3>
                   <button onClick={handleBack} className="text-[0.5rem] font-black uppercase tracking-widest text-gray-400 hover:text-[#222F3E]">Retour</button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h4>
                    <div className="flex gap-1">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 glass rounded-full hover:bg-white transition-all"><ChevronLeft size={14} /></button>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 glass rounded-full hover:bg-white transition-all"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => <div key={idx} className="text-[0.5rem] font-black text-gray-300 text-center py-1">{d}</div>)}
                    {days.map(day => {
                      const isPast = isBefore(day, startOfDay(new Date()));
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const dayOfWeek = day.getDay();
                      const slots = configSlots[dayOfWeek] || [];
                      const isBooked = slots.length === 0;

                      return (
                        <button
                          key={day.toISOString()}
                          disabled={isPast || !isSameMonth(day, currentMonth) || isBooked}
                          onClick={() => setSelectedDate(day)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[0.7rem] font-bold transition-all ${
                            isSameDay(day, selectedDate!) ? 'bg-[#222F3E] text-white shadow-lg' : 
                            !isSameMonth(day, currentMonth) ? 'opacity-0 pointer-events-none' :
                            isPast || isBooked ? 'text-gray-100 cursor-not-allowed' : 'bg-[#F8F5F0] text-gray-600 hover:bg-[#5F27CD] hover:text-white'
                          }`}
                        >
                          {format(day, 'd')}
                          {!isPast && isSameMonth(day, currentMonth) && !isBooked && (
                            <div className={`w-0.5 h-0.5 rounded-full mt-0.5 ${isSameDay(day, selectedDate!) ? 'bg-[#0ABDE3]' : 'bg-[#1DD1A1]'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-gray-100 space-y-4">
                      <p className="text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Heures Disponibles</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {(configSlots[selectedDate.getDay()] || []).map(t => (
                          <button
                            key={t}
                            onClick={() => { setSelectedTime(t); setStep(3); }}
                            className={`py-3 rounded-xl text-[0.8rem] font-bold border transition-all ${selectedTime === t ? 'bg-[#222F3E] text-white border-transparent' : 'bg-white text-gray-500 border-gray-100 hover:border-[#5F27CD]'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 3: IDENTITY */}
            {step === 3 && (
              <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                   <h3 className="text-xl font-medium text-[#222F3E]">Vos Coordonnées</h3>
                   <button onClick={handleBack} className="text-[0.55rem] font-black uppercase tracking-widest text-gray-400 hover:text-[#222F3E]">Retour</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5 border-b border-gray-100 focus-within:border-[#5F27CD] transition-colors pb-1.5">
                      <label className="text-[0.5rem] font-black tracking-widest text-[#5F27CD]">PRÉNOM</label>
                      <input 
                        type="text" 
                        value={formData.firstName || user?.displayName?.split(' ')[0] || ''} 
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-transparent p-0 border-none italic text-sm focus:outline-none" 
                        placeholder="Ex: Clara"
                      />
                   </div>
                   <div className="space-y-1.5 border-b border-gray-100 focus-within:border-[#5F27CD] transition-colors pb-1.5">
                      <label className="text-[0.5rem] font-black tracking-widest text-[#5F27CD]">NOM</label>
                      <input 
                        type="text" 
                        value={formData.lastName || user?.displayName?.split(' ').slice(1).join(' ') || ''} 
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-transparent p-0 border-none italic text-sm focus:outline-none" 
                        placeholder="Ex: Miller"
                      />
                   </div>
                   <div className="space-y-1.5 border-b border-gray-100 focus-within:border-[#5F27CD] transition-colors pb-1.5">
                      <label className="text-[0.5rem] font-black tracking-widest text-[#5F27CD]">MOBILE</label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-transparent p-0 border-none text-sm focus:outline-none" 
                        placeholder="+41 78 000 00 00"
                      />
                   </div>
                   <div className="space-y-1.5 border-b border-gray-100 focus-within:border-[#5F27CD] transition-colors pb-1.5">
                      <label className="text-[0.5rem] font-black tracking-widest text-[#5F27CD]">EMAIL</label>
                      <input 
                        type="email" 
                        value={formData.email || user?.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-transparent p-0 border-none italic text-sm focus:outline-none" 
                        placeholder="Ex: clara@example.com"
                      />
                   </div>
                   <div className="md:col-span-2 space-y-1.5 border-b border-gray-100 focus-within:border-[#5F27CD] transition-colors pb-1.5">
                      <label className="text-[0.5rem] font-black tracking-widest text-[#5F27CD]">VOTRE INTENTION</label>
                      <textarea 
                        rows={2}
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-transparent p-0 border-none italic text-sm focus:outline-none resize-none" 
                        placeholder="Une remarque ?"
                      />
                   </div>
                </div>

                <button 
                  onClick={() => setStep(4)} 
                  disabled={
                    !(formData.firstName || user?.displayName?.split(' ')[0]) ||
                    !(formData.lastName || user?.displayName?.split(' ').slice(1).join(' ')) ||
                    !formData.phone ||
                    !(formData.email || user?.email)
                  }
                  className="btn-luxe w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {/* STEP 4: INTENTION REVELATION (CONFIRMATION) */}
            {step === 4 && (
              <motion.div key="st4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="text-center space-y-3">
                   <div className="w-12 h-12 bg-indigo-50 text-[#5F27CD] rounded-full mx-auto flex items-center justify-center">
                      <ShieldCheck size={20} />
                   </div>
                   <h3 className="title-luxe text-xl leading-none">Récapitulatif</h3>
                   <p className="text-[0.65rem] text-gray-400 italic">Prêt pour vous.</p>
                </div>

                <div className="dash-card p-6 space-y-6 bg-[#222F3E] text-white">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[0.5rem] font-bold tracking-[0.2em] text-[#0ABDE3] uppercase mb-1">RITUEL</p>
                        <h4 className="text-lg font-light">{selectedService?.name}</h4>
                        <p className="text-[#1DD1A1] font-bold text-[0.6rem] mt-0.5 uppercase tracking-widest">{selectedService?.duration}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[0.5rem] font-bold tracking-[0.2em] text-[#0ABDE3] uppercase mb-1">MONTANT</p>
                         <div className="flex flex-col items-end">
                            {clientLevel.discount > 0 && <span className="text-[0.6rem] line-through opacity-30">{selectedService?.price} CHF</span>}
                            <span className="text-2xl font-light text-white">{discountedPrice} CHF</span>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/10 flex flex-wrap gap-8">
                      <div>
                         <p className="text-[0.5rem] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1">MOMENT</p>
                         <p className="text-sm">{format(selectedDate!, 'EEEE d MMMM', { locale: fr })}</p>
                         <p className="text-[0.6rem] text-[#1DD1A1]">À {selectedTime}</p>
                      </div>
                      <div>
                         <p className="text-[0.5rem] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1">ACCUEIL POUR</p>
                         <p className="  text-sm">{formData.firstName || user?.displayName} {formData.lastName}</p>
                         <p className="text-[0.6rem] opacity-50">{formData.phone}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                   <input 
                    type="checkbox" 
                    id="accept" 
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#5F27CD] focus:ring-[#5F27CD]"
                  />
                   <label htmlFor="accept" className="text-[0.6rem] text-gray-600 leading-relaxed cursor-pointer selection:bg-none">
                      Je confirme avoir pris connaissance des conditions d'annulation (24h) et l'absence de contre-indications médicales.
                   </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleBack} className="py-4 rounded-xl border border-gray-100 text-gray-500 font-bold text-[0.6rem] uppercase tracking-widest">Retour</button>
                   <button 
                    disabled={!acceptedTerms || isSubmitting}
                    onClick={completeBooking}
                    className="btn-luxe py-4 text-[0.6rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <>Confirmer <Sparkles size={14} /></>}
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