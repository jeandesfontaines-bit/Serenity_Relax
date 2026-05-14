import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import {
  addMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  X,
  Sparkles,
  ArrowRight,
  Info,
  Zap,
  CreditCard
} from 'lucide-react';
import { useAuth, useFirestore, useUser } from '../../firebase/provider';
import { Service } from '../../lib/types';
import { toast } from '../../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

type AvailabilitySlot = {
  id: string;
  date?: string;
  time?: string;
  type?: string;
  appointmentId?: string;
};

type BookingStage = 'service' | 'details';

const EMPTY_FORM: BookingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
};

export function BookingFlow({ services, initialServiceId, isOpen, onClose }: BookingFlowProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const auth = useAuth();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [stage, setStage] = useState<BookingStage>('service');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState<BookingFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({
    0: [],
    1: ['11:00', '13:30', '15:00', '16:30', '18:00'],
    2: ['09:00', '10:30', '13:30', '15:00', '16:30', '18:00'],
    3: ['09:00', '10:30', '13:30', '15:00', '16:30', '18:00'],
    4: ['09:00', '10:30', '13:30', '15:00', '16:30', '18:00'],
    5: ['09:00', '10:30', '13:30', '15:00', '16:30', '18:00'],
    6: ['09:00', '10:30', '12:00'],
  });

  useEffect(() => {
    if (!firestore) return;

    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap) => {
      setAvailableSlots(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() } as AvailabilitySlot)));
    });

    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (snap) => {
      if (snap.exists()) {
        setConfigSlots(snap.data() as Record<number, string[]>);
      }
    });

    return () => {
      unsubAvail();
      unsubConfig();
    };
  }, [firestore]);

  useEffect(() => {
    if (!isOpen) return;

    const nextService = initialServiceId
      ? services.find((service) => service.id === initialServiceId) ?? null
      : null;

    setSelectedService(nextService);
    setStage(nextService ? 'details' : 'service');
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentMonth(new Date());
    setFormData(EMPTY_FORM);
    setBookingRef(null);
    setIsSubmitting(false);
  }, [initialServiceId, isOpen, services]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  const monthLabel = useMemo(
    () => format(currentMonth, 'MMMM yyyy', { locale: fr }),
    [currentMonth],
  );

  const getFreeSlotsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const baseSlots = configSlots[dayOfWeek] || [];

    return baseSlots.filter((time) => (
      !availableSlots.some((slot) => (
        slot.date === dateStr &&
        slot.time === time &&
        (slot.type === 'blocked' || slot.type === 'booked')
      ))
    ));
  };

  const freeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getFreeSlotsForDate(selectedDate);
  }, [selectedDate, availableSlots, configSlots]);

  const isFormValid = Boolean(
    selectedService &&
    selectedDate &&
    selectedTime &&
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.includes('@') &&
    formData.phone.trim().length >= 8,
  );

  const updateField = (key: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const closeBooking = () => {
    onClose?.();
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStage('details');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const completeBooking = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!firestore || !selectedService || !selectedDate || !selectedTime || !isFormValid) return;

    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;

      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      if (!finalUserId) {
        throw new Error("Impossible d'établir une session sécurisée.");
      }

      const appointmentId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const magicToken = `${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const startTimeStr = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const durationMatch = selectedService.duration.match(/\d+/);
      const duration = durationMatch ? parseInt(durationMatch[0], 10) : 60;
      const endTime = addMinutes(new Date(startTimeStr), duration);
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const fullName = `${firstName} ${lastName}`.trim();

      const appointmentData = {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'confirmed',
        clientMessage: formData.message,
        firstName,
        lastName,
        clientNameSnapshot: fullName,
        clientEmail: formData.email,
        magicToken,
        phone: formData.phone,
        createdAt: serverTimestamp(),
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), appointmentData),
        setDoc(doc(firestore, 'clients', finalUserId), {
          id: finalUserId,
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          therapistNotes: '',
          loyaltySessionsCompleted: 0,
          isNextSessionFree: false,
          addressStreet: '',
          addressCity: '',
          addressPostalCode: '',
          addressCountry: '',
          dateOfBirth: '',
          magicToken,
          updatedAt: serverTimestamp(),
        }, { merge: true }),
        setDoc(doc(firestore, 'availability', appointmentId), {
          type: 'booked',
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          appointmentId,
        }),
      ]);

      setBookingRef(appointmentId);
      toast({
        title: 'Rendez-vous confirmé',
        description: 'Une confirmation vous a été envoyée par email.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-2xl p-4 md:p-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeBooking}
      />
      
      <motion.div
        className="relative w-full max-w-[1440px] bg-[#FDFDFB] rounded-[4rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <header className="px-16 pt-16 pb-12 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-10">
             <div className="w-16 h-16 bg-neutral-900 rounded-[2.25rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                <Sparkles size={28} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-neutral-300 mb-2 leading-none italic">RÉSERVATION OFFICIELLE</p>
                <h2 className="text-5xl font-black text-neutral-900 tracking-tighter italic leading-none uppercase">Serenity Relax</h2>
             </div>
          </div>
          <button 
            onClick={closeBooking}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-all shadow-inner"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Main Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
              {bookingRef ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-32 flex flex-col items-center text-center space-y-16"
                >
                   <div className="relative inline-block">
                      <div className="absolute inset-0 bg-neutral-900 rounded-[3rem] blur-3xl opacity-20 animate-pulse" />
                      <div className="relative w-32 h-32 bg-neutral-900 rounded-[3.5rem] flex items-center justify-center text-white shadow-2xl mx-auto rotate-3">
                         <CheckCircle2 size={56} strokeWidth={2.5} />
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 italic">TRANSMISSION RÉUSSIE</p>
                      <h3 className="text-6xl font-black text-neutral-900 tracking-tighter italic leading-none">Rendez-vous Confirmé.</h3>
                      <p className="text-xl font-medium text-neutral-400 italic max-w-xl mx-auto leading-relaxed">
                        Votre rituel pour {selectedService?.name} est validé. Une confirmation détaillée vous attend dans votre boîte mail.
                      </p>
                   </div>

                   <div className="bg-neutral-50 border border-neutral-100 rounded-[3rem] p-12 w-full max-w-md shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-4">RÉFÉRENCE DOSSIER</p>
                      <p className="text-3xl font-black tracking-tighter text-neutral-900">{bookingRef}</p>
                   </div>

                   <button 
                    onClick={closeBooking}
                    className="h-20 px-20 rounded-full bg-neutral-900 text-white text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                   >
                     RETOURNER AU SITE
                   </button>
                </motion.div>
              ) : stage === 'service' ? (
                <motion.div
                  key="service-stage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-16 space-y-16"
                >
                  <div className="flex items-center gap-10">
                     <span className="h-20 w-20 rounded-[2.5rem] bg-neutral-900 flex items-center justify-center text-white text-3xl font-black italic shadow-2xl">01</span>
                     <h3 className="text-6xl font-black text-neutral-900 tracking-tighter italic leading-none uppercase">Sélection du Soin</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="group flex flex-col text-left rounded-[3.5rem] border border-neutral-100 p-10 transition-all hover:-translate-y-2 hover:shadow-2xl bg-white relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
                            <Zap size={150} strokeWidth={1} />
                         </div>
                         <div className="flex items-center justify-between mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-neutral-50 border border-neutral-100 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">{service.duration}</span>
                            <span className="text-2xl font-black text-neutral-900 italic tracking-tighter">{service.price} CHF</span>
                         </div>
                         <h4 className="text-3xl font-black text-neutral-900 tracking-tighter italic leading-tight mb-4 group-hover:italic transition-all">{service.name}</h4>
                         <p className="text-sm font-medium text-neutral-400 leading-relaxed italic mb-8 line-clamp-2">{service.description}</p>
                         <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 group-hover:text-neutral-900 transition-colors">CHOISIR CE SOIN</span>
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                               <ChevronRight size={20} strokeWidth={3} />
                            </div>
                         </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="details-stage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-16 space-y-20"
                >
                  {/* Calendar Header */}
                  <div className="flex flex-col gap-8 border-b border-neutral-100 pb-12 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-10">
                        <span className="h-20 w-20 rounded-[2.5rem] bg-neutral-900 flex items-center justify-center text-white text-3xl font-black italic shadow-2xl">02</span>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 mb-2 italic">DATE & CRÉNEAU</p>
                           <div className="flex items-center gap-4">
                             <button 
                              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                              className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-100 text-neutral-300 transition-all hover:text-neutral-900"
                             >
                               <ChevronLeft size={22} strokeWidth={3} />
                             </button>
                             <h3 className="text-5xl font-black text-neutral-900 tracking-tighter italic leading-none uppercase">{monthLabel}</h3>
                             <button 
                              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                              className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-100 text-neutral-300 transition-all hover:text-neutral-900"
                             >
                               <ChevronRight size={22} strokeWidth={3} />
                             </button>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                     {/* Calendar Grid */}
                     <div className="space-y-12">
                        <div className="grid grid-cols-7 gap-4">
                           {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map(d => (
                              <div key={d} className="text-center">
                                 <span className="text-[9px] font-black text-neutral-200 uppercase tracking-widest">{d}</span>
                              </div>
                           ))}
                        </div>
                        <div className="grid grid-cols-7 gap-4">
                           {calendarDays.map((day) => {
                             const freeDaySlots = getFreeSlotsForDate(day);
                             const isPast = isBefore(day, startOfDay(new Date()));
                             const isCurrentMonthDay = isSameMonth(day, currentMonth);
                             const isDisabled = !isCurrentMonthDay || isPast || freeDaySlots.length === 0;
                             const isSelected = Boolean(selectedDate && isSameDay(selectedDate, day));

                             return (
                               <button
                                 key={format(day, 'yyyy-MM-dd')}
                                 type="button"
                                 disabled={isDisabled}
                                 onClick={() => handleDateSelect(day)}
                                 className={`aspect-square flex flex-col items-center justify-center rounded-[2.5rem] border-2 transition-all duration-700 relative group ${
                                   isDisabled
                                     ? 'opacity-5 border-transparent cursor-not-allowed'
                                     : isSelected
                                       ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xl scale-110 z-10'
                                       : 'border-neutral-50 text-neutral-900 bg-white hover:border-neutral-900 shadow-sm'
                                 }`}
                               >
                                 <span className="text-2xl font-black tracking-tighter italic leading-none">{format(day, 'd')}</span>
                               </button>
                             );
                           })}
                        </div>
                     </div>

                     {/* Slots Selection */}
                     <div className="space-y-12">
                        <div className="flex items-center gap-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-300 italic whitespace-nowrap">CRÉNEAUX LIBRES</h4>
                           <div className="h-px w-full bg-neutral-100" />
                        </div>
                        {selectedDate ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {freeSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleTimeSelect(slot)}
                                className={`h-20 rounded-[2rem] text-xl font-black tracking-tighter italic transition-all duration-500 border-2 ${
                                  selectedTime === slot 
                                    ? "bg-neutral-900 border-neutral-900 text-white shadow-xl scale-105 z-10" 
                                    : "bg-white border-neutral-50 text-neutral-900 hover:border-neutral-900 shadow-sm"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                            {freeSlots.length === 0 && (
                               <div className="col-span-full py-16 text-center bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-100">
                                  <Clock3 size={40} strokeWidth={1} className="text-neutral-200 mx-auto mb-6" />
                                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">AUCUN CRÉNEAU DISPONIBLE</p>
                               </div>
                            )}
                          </div>
                        ) : (
                          <div className="py-24 text-center bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-100">
                             <CalendarIcon size={40} strokeWidth={1} className="text-neutral-200 mx-auto mb-6" />
                             <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest px-10">VEUILLEZ SÉLECTIONNER UNE DATE SUR LE CALENDRIER</p>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Form Part */}
                  <div className="pt-20 space-y-20 border-t border-neutral-100">
                      <div className="flex items-center gap-10">
                        <span className="h-20 w-20 rounded-[2.5rem] bg-neutral-900 flex items-center justify-center text-white text-3xl font-black italic shadow-2xl">03</span>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 mb-2 italic">IDENTIFICATION</p>
                           <h3 className="text-5xl font-black text-neutral-900 tracking-tighter italic leading-none uppercase">Vos Coordonnées</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputGroup label="PRÉNOM" value={formData.firstName} onChange={(v) => updateField('firstName', v)} />
                        <InputGroup label="NOM" value={formData.lastName} onChange={(v) => updateField('lastName', v)} />
                        <InputGroup label="COURRIEL" type="email" value={formData.email} onChange={(v) => updateField('email', v)} />
                        <InputGroup label="TÉLÉPHONE" type="tel" value={formData.phone} onChange={(v) => updateField('phone', v)} />
                        <div className="md:col-span-2 space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 px-6 italic leading-none block">NOTES PARTICULIÈRES (FACULTATIF)</label>
                           <textarea 
                            value={formData.message}
                            onChange={(e) => updateField('message', e.target.value)}
                            placeholder="Précisions pour votre rituel..."
                            className="w-full h-40 p-10 rounded-[3.5rem] bg-neutral-50 border-none text-xl font-black tracking-tighter italic text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none resize-none leading-relaxed shadow-inner"
                           />
                        </div>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Sidebar Recap */}
          <aside className="w-full md:w-[450px] border-l border-neutral-100 bg-neutral-50/30 p-16 flex flex-col shrink-0">
             <div className="space-y-12">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 mb-8 italic">VOTRE PANIER</p>
                   {selectedService ? (
                      <div className="bg-white rounded-[3.5rem] border border-neutral-100 p-10 shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                            <Zap size={100} strokeWidth={1} />
                         </div>
                         <h5 className="text-3xl font-black text-neutral-900 tracking-tighter italic leading-none mb-6">{selectedService.name}</h5>
                         <div className="flex items-center justify-between text-neutral-400">
                            <div className="flex items-center gap-3">
                               <Clock3 size={16} strokeWidth={2.5} />
                               <span className="text-[11px] font-black uppercase tracking-[0.2em]">{selectedService.duration}</span>
                            </div>
                            <span className="text-2xl font-black text-neutral-900 italic tracking-tighter">{selectedService.price} CHF</span>
                         </div>
                      </div>
                   ) : (
                      <div className="bg-white rounded-[3rem] border-2 border-dashed border-neutral-100 p-16 text-center">
                         <p className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">AUCUN SOIN SÉLECTIONNÉ</p>
                      </div>
                   )}
                </div>

                <div className="space-y-6">
                   <RecapRow icon={<CalendarIcon size={18} />} label="DATE" value={selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : '--'} />
                   <RecapRow icon={<Clock3 size={18} />} label="HEURE" value={selectedTime || '--'} />
                </div>

                <div className="pt-12">
                   <div className="bg-neutral-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(45deg,#fff,#fff_1px,transparent_1px,transparent_10px)]" />
                      <div className="relative z-10 space-y-8">
                         <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">TOTAL À RÉGLER</p>
                            <ShieldCheck size={20} className="text-emerald-400" />
                         </div>
                         <div className="flex items-end justify-between">
                            <p className="text-7xl font-black tracking-tighter italic leading-none">{selectedService?.price || 0}</p>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">CHF</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-8">
                   <button 
                    disabled={!isFormValid || isSubmitting}
                    onClick={completeBooking}
                    className="w-full h-24 rounded-[3rem] bg-neutral-900 text-white text-[13px] font-black uppercase tracking-[0.5em] shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:-translate-y-2 active:scale-95 transition-all flex items-center justify-center gap-6 group disabled:opacity-10"
                   >
                     {isSubmitting ? (
                        <Clock3 size={24} className="animate-spin" />
                     ) : (
                        <CheckCircle2 size={24} strokeWidth={3} className="group-hover:scale-125 transition-transform" />
                     )}
                     {isSubmitting ? "TRANSMISSION..." : "VALIDER MA SÉANCE"}
                   </button>
                   <div className="flex items-center gap-4 mt-8 px-6 text-neutral-300">
                      <ShieldCheck size={16} />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Paiement sécurisé sur place</p>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}

function RecapRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
   return (
      <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-white border border-neutral-100 shadow-sm hover:border-neutral-900 transition-all group">
         <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all shadow-inner">
            {icon}
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-200 mb-1 italic">{label}</p>
            <p className="text-sm font-black text-neutral-900 tracking-tight italic truncate group-hover:italic uppercase">{value}</p>
         </div>
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
            placeholder="Saisir ici..."
            className="w-full h-16 px-10 rounded-full bg-neutral-50 border-none text-xl font-black tracking-tighter italic text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-inner" 
         />
      </div>
   );
}
