import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { 
  format, 
  addMinutes, 
  eachDayOfInterval, 
  startOfWeek, 
  startOfMonth, 
  endOfWeek, 
  endOfMonth, 
  isSameDay, 
  isBefore, 
  startOfDay, 
  isSameMonth 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock3, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Leaf, 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  MessageCircle, 
  ArrowLeft, 
  Sparkles, 
  Loader2 
} from 'lucide-react';
import { useFirestore, useUser, useAuth } from '../../firebase/provider';
import { Service } from '../../lib/types';
import { toast } from '../../hooks/use-toast';

// --- Magnetic Component for tactile interactions ---
function Magnetic({ children, strength = 0.5 }: { children: React.ReactNode, strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove(e: React.MouseEvent) {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

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

const STEPS = [
  { id: 1, name: 'Soin', label: 'L\'Intention' },
  { id: 2, name: 'Date', label: 'Le Moment' },
  { id: 3, name: 'Détails', label: 'Votre Identité' },
  { id: 4, name: 'Résumé', label: 'Vérification' },
  { id: 5, name: 'Succès', label: 'Confirmation' },
];

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
  
  const [formData, setFormData] = useState<BookingFormData>({
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

  useEffect(() => {
    if (!firestore) return;
    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snap) => {
      const slots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAvailableSlots(slots);
    });
    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (snap) => {
      if (snap.exists()) setConfigSlots(snap.data() as any);
    });
    return () => { unsubAvail(); unsubConfig(); };
  }, [firestore]);

  useEffect(() => {
    if (initialServiceId && services.length > 0) {
      const found = services.find(s => s.id === initialServiceId);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
  }, [initialServiceId, services]);

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

      const appointmentData = {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService!.id,
        serviceName: selectedService!.name,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'confirmed',
        clientMessage: formData.message,
        firstName: formData.firstName,
        lastName: formData.lastName,
        clientNameSnapshot: `${formData.firstName} ${formData.lastName}`.trim(),
        clientEmail: formData.email,
        magicToken: magicToken,
        phone: formData.phone,
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), appointmentData),
        setDoc(doc(firestore, 'clients', finalUserId), { ...formData, id: finalUserId, magicToken, updatedAt: serverTimestamp() }, { merge: true }),
        setDoc(doc(firestore, 'availability', appointmentId), { type: 'booked', date: format(selectedDate!, 'yyyy-MM-dd'), time: selectedTime, appointmentId })
      ]);

      setBookingRef(appointmentId);
      setStep(5);
      toast({ title: "Soin confirmé", description: "Un récapitulatif vous a été envoyé par email." });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally { setIsSubmitting(false); }
  };

  const freeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayOfWeek = selectedDate.getDay();
    const baseConfigSlots = configSlots[dayOfWeek] || [];
    return baseConfigSlots.filter((t) => !availableSlots.some((s) => s.date === dateStr && s.time === t && (s.type === 'blocked' || s.type === 'booked')));
  }, [selectedDate, configSlots, availableSlots]);

  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  }), [currentMonth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-background/40 backdrop-blur-[100px]"
      />
      
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-secondary/10 blur-[150px] rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative w-full h-full flex flex-col lg:flex-row bg-white/40 shadow-2xl overflow-hidden"
      >
        {/* ── Progress Sidebar (Desktop) ── */}
        <div className="hidden lg:flex w-[380px] bg-white/20 backdrop-blur-md border-r border-black/[0.03] p-12 flex-col justify-between">
          <div className="space-y-16">
            <div className="space-y-12">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary block">Serenity Geneva</span>
                <p className="font-sans text-[13px] italic text-foreground/40">Le sanctuaire du bien-être</p>
              </div>

              <div className="flex flex-col gap-8">
                {STEPS.map((s) => (
                  <div key={s.id} className="flex items-center gap-6 group">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-700 ${step >= s.id ? 'bg-primary border-primary text-white shadow-lg' : 'border-black/10 text-foreground/20'}`}>
                      {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-foreground/20'}`}>{s.name}</span>
                      <span className={`font-sans text-[16px] ${step >= s.id ? 'text-foreground' : 'text-foreground/10'}`}>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {selectedService && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-12 border-t border-black/[0.05] space-y-8"
                >
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground/30">Votre Sélection</p>
                    <p className="font-sans text-[24px] text-primary leading-tight">{selectedService.name}</p>
                    <div className="flex items-center gap-3 text-[13px] text-foreground/40 font-light italic">
                      <Clock3 size={12} />
                      {selectedService.duration}
                    </div>
                  </div>
                  
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground/30">Le Moment</p>
                      <p className="font-sans text-[18px] capitalize">
                        {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                        {selectedTime && <span className="text-primary block mt-1">à {selectedTime}</span>}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex justify-between items-end pt-6 border-t border-black/[0.05]">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground/30">Investissement</span>
                    <span className="font-sans text-[28px]">{selectedService.price} CHF</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="space-y-8 pt-12 border-t border-black/[0.05]">
            <div className="flex items-center gap-4 text-primary/40">
              <ShieldCheck size={16} strokeWidth={1} />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Session Sécurisée</span>
            </div>
            <p className="text-[10px] text-foreground/30 font-light leading-relaxed italic">
              "Le luxe est une affaire de confiance et de discrétion."
            </p>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-white/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-8 py-20 md:px-16 lg:py-24 relative min-h-full">
            <Magnetic strength={0.2}>
              <button 
                onClick={onClose}
                className="absolute right-8 top-8 md:right-12 md:top-12 p-5 rounded-full hover:bg-white transition-all border border-black/[0.03] group z-50 bg-white/50 backdrop-blur-md shadow-sm"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </Magnetic>

            <AnimatePresence mode="wait">
              {/* STEP 1: SERVICE */}
              {step === 1 && (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="space-y-6">
                    <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary block">01 — L&apos;Intention</span>
                    <h2 className="font-sans text-[48px] md:text-[64px] leading-[1.1] tracking-tight">
                      Quel voyage <br />
                      <span className="italic font-light text-secondary">désirez-vous ?</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((s, idx) => (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => { setSelectedService(s); setStep(2); }}
                        className={`group relative overflow-hidden border transition-all duration-1000 flex flex-col min-h-[420px] ${selectedService?.id === s.id ? 'border-primary bg-white shadow-2xl scale-[1.02]' : 'border-black/[0.05] bg-white/40 hover:bg-white hover:border-primary/20'}`}
                      >
                        {/* Service Image */}
                        <div className="h-48 overflow-hidden relative">
                          <motion.img 
                            src={s.image || `/images/placeholder-service.jpg`} 
                            alt={s.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                            {s.duration}
                          </div>
                        </div>

                        <div className="p-10 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <h4 className="font-sans text-[28px] leading-tight group-hover:text-primary transition-colors">{s.name}</h4>
                            <p className="text-[14px] text-foreground/50 font-light leading-relaxed line-clamp-3">{s.description}</p>
                          </div>
                          
                          <div className="mt-8 flex items-center justify-between">
                            <span className="font-sans text-2xl">{s.price} CHF</span>
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                              Sélectionner <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DATE & TIME */}
              {step === 2 && (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black/[0.05] pb-12 gap-8">
                    <div className="space-y-6">
                      <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary block">02 — Le Moment</span>
                      <h2 className="font-sans text-[48px] md:text-[64px] leading-[1.1] tracking-tight">Le temps <br /><span className="italic font-light text-secondary">suspendu.</span></h2>
                    </div>
                    <Magnetic strength={0.1}>
                      <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors flex items-center gap-3 py-4 px-6 rounded-full hover:bg-white/50 backdrop-blur-sm">
                        <ChevronLeft size={16} /> Modifier le soin
                      </button>
                    </Magnetic>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                    <div className="xl:col-span-7 bg-white/60 backdrop-blur-md p-10 md:p-14 shadow-2xl border border-black/[0.03] rounded-[40px]">
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="font-sans text-[28px] capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h3>
                        <div className="flex gap-4">
                          <Magnetic strength={0.3}>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-4 hover:bg-muted rounded-full transition-colors"><ChevronLeft size={20} strokeWidth={1} /></button>
                          </Magnetic>
                          <Magnetic strength={0.3}>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-4 hover:bg-muted rounded-full transition-colors"><ChevronRight size={20} strokeWidth={1} /></button>
                          </Magnetic>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2 md:gap-4 text-center">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <span key={d} className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest py-4">{d}</span>)}
                        {days.map((day, i) => {
                          const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const isPast = isBefore(day, startOfDay(new Date()));
                          const currentMonthOnly = isSameMonth(day, currentMonth);
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const dayOfWeek = day.getDay();
                          const baseConfigSlots = configSlots[dayOfWeek] || [];
                          const hasSlots = baseConfigSlots.filter((t) => !availableSlots.some((s) => s.date === dateStr && s.time === t && (s.type === 'blocked' || s.type === 'booked'))).length > 0;

                          return currentMonthOnly ? (
                            <Magnetic key={i} strength={isPast || !hasSlots ? 0 : 0.4}>
                              <button
                                disabled={isPast || !hasSlots}
                                onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                                className={`aspect-square w-full flex flex-col items-center justify-center rounded-full text-[15px] transition-all relative ${isPast || !hasSlots ? 'opacity-5 cursor-not-allowed' : isSelected ? 'bg-primary text-white font-bold scale-110 shadow-xl' : 'hover:bg-white text-foreground'}`}
                              >
                                {format(day, 'd')}
                                {!isPast && hasSlots && !isSelected && <div className="absolute bottom-2 w-1.5 h-1.5 bg-primary/40 rounded-full" />}
                              </button>
                            </Magnetic>
                          ) : <div key={i} />;
                        })}
                      </div>
                    </div>

                    <div className="xl:col-span-5 flex flex-col">
                      {selectedDate ? (
                        <div className="space-y-12">
                          <div className="space-y-3">
                             <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-secondary">Instants Disponibles</p>
                             <p className="font-sans text-[32px] capitalize leading-none">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
                          </div>
                          
                          <div className="space-y-10 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {/* Morning Slots */}
                            <SlotSection 
                              title="Matinée" 
                              slots={freeSlots.filter(t => parseInt(t.split(':')[0]) < 12)} 
                              selectedTime={selectedTime}
                              onSelect={(t) => { setSelectedTime(t); setStep(3); }}
                            />
                            
                            {/* Afternoon Slots */}
                            <SlotSection 
                              title="Après-midi" 
                              slots={freeSlots.filter(t => {
                                const hour = parseInt(t.split(':')[0]);
                                return hour >= 12 && hour < 18;
                              })} 
                              selectedTime={selectedTime}
                              onSelect={(t) => { setSelectedTime(t); setStep(3); }}
                            />

                            {/* Evening Slots */}
                            <SlotSection 
                              title="Soirée" 
                              slots={freeSlots.filter(t => parseInt(t.split(':')[0]) >= 18)} 
                              selectedTime={selectedTime}
                              onSelect={(t) => { setSelectedTime(t); setStep(3); }}
                            />

                            {freeSlots.length === 0 && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 bg-white/40 border border-black/[0.03] rounded-[32px] flex flex-col items-center gap-6 text-center">
                                <Leaf size={40} className="text-primary/20" strokeWidth={1} />
                                <p className="text-[16px] font-light italic text-foreground/40 leading-relaxed">
                                  Le calme règne en ce jour.<br />
                                  <span className="text-[14px]">Merci d&apos;explorer une autre date.</span>
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-10 bg-white/20 backdrop-blur-md border border-dashed border-black/10 rounded-[40px]">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <CalendarIcon className="text-primary/20" size={40} strokeWidth={1} />
                          </div>
                          <p className="text-[16px] text-foreground/40 font-light max-w-[280px] leading-relaxed italic">Sélectionnez une date pour révéler les instants de sérénité disponibles.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CONTACT */}
              {step === 3 && (
                <motion.div 
                  key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black/[0.05] pb-12 gap-8">
                    <div className="space-y-6">
                      <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary block">03 — Votre Identité</span>
                      <h2 className="font-sans text-[48px] md:text-[64px] leading-[1.1] tracking-tight">Vos <br /><span className="italic font-light text-secondary">coordonnées.</span></h2>
                    </div>
                    <Magnetic strength={0.1}>
                      <button onClick={() => setStep(2)} className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors flex items-center gap-3 py-4 px-6 rounded-full hover:bg-white/50 backdrop-blur-sm">
                        <ChevronLeft size={16} /> Modifier le moment
                      </button>
                    </Magnetic>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                    <InputField 
                      id="input-firstName"
                      label="Prénom" 
                      value={formData.firstName} 
                      onChange={v => setFormData({...formData, firstName: v})} 
                      icon={User} 
                      placeholder="Jean"
                      onEnter={() => document.getElementById('input-lastName')?.focus()}
                    />
                    <InputField 
                      id="input-lastName"
                      label="Nom" 
                      value={formData.lastName} 
                      onChange={v => setFormData({...formData, lastName: v})} 
                      icon={User} 
                      placeholder="Dupont"
                      onEnter={() => document.getElementById('input-email')?.focus()}
                    />
                    <InputField 
                      id="input-email"
                      label="Email" 
                      type="email"
                      value={formData.email} 
                      onChange={v => setFormData({...formData, email: v})} 
                      icon={Mail} 
                      placeholder="jean@exemple.ch"
                      onEnter={() => document.getElementById('input-phone')?.focus()}
                    />
                    <InputField 
                      id="input-phone"
                      label="Téléphone" 
                      type="tel"
                      value={formData.phone} 
                      onChange={v => setFormData({...formData, phone: v})} 
                      icon={Phone} 
                      placeholder="+41 78 000 00 00"
                      onEnter={() => document.getElementById('input-message')?.focus()}
                    />
                    <div className="md:col-span-2 space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30 flex items-center gap-4">
                        <MessageCircle size={14} strokeWidth={1} className="text-primary" /> Notes Particulières
                      </label>
                      <textarea 
                        id="input-message"
                        className="w-full px-0 py-4 bg-transparent border-b border-black/10 text-[20px] focus:outline-none focus:border-primary transition-all h-32 resize-none font-sans placeholder:text-black/10 placeholder:font-sans placeholder:text-sm"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        placeholder="Pathologies, tensions spécifiques, ou attentes pour ce soin..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-8">
                    <Magnetic strength={0.2}>
                      <button
                        disabled={
                          !formData.firstName || 
                          !formData.lastName || 
                          !formData.email.includes('@') || 
                          formData.phone.length < 8
                        }
                        onClick={() => setStep(4)}
                        className="premium-button bg-foreground text-background rounded-full px-20 py-10 shadow-2xl group disabled:opacity-30 transition-all duration-700"
                      >
                        <span className="relative z-10 flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.4em]">
                          Vérifier mon invitation <ArrowRight size={18} />
                        </span>
                      </button>
                    </Magnetic>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUMMARY (INVITATION STYLE) */}
              {step === 4 && (
                <motion.div 
                  key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="space-y-6 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-primary block">04 — Vérification</span>
                    <h2 className="font-sans text-[48px] md:text-[64px] leading-[1.1] tracking-tight">Invitation au <br /><span className="italic font-light text-secondary">Lâcher-prise.</span></h2>
                  </div>

                  <div className="max-w-3xl mx-auto perspective-2000">
                    <motion.div 
                      whileHover={{ rotateY: 2, rotateX: -1, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="bg-white border border-black/[0.05] shadow-2xl relative overflow-hidden preserve-3d rounded-[40px]"
                    >
                       <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-secondary to-primary" />
                       
                       <div className="p-12 md:p-20 space-y-16">
                          <div className="flex flex-col md:flex-row justify-between items-start border-b border-black/[0.05] pb-16 gap-12">
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">L&apos;Expérience</p>
                                <h4 className="font-sans text-[42px] text-primary leading-tight">{selectedService?.name}</h4>
                                <div className="flex items-center gap-3 text-[16px] text-foreground/50 font-light italic">
                                  <Clock3 size={14} />
                                  {selectedService?.duration}
                                </div>
                             </div>
                             <div className="md:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">Investissement</p>
                                <p className="font-sans text-[48px]">{selectedService?.price} CHF</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-black/[0.05] pb-16">
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">Le Moment</p>
                                <p className="font-sans text-[28px] capitalize">{selectedDate && format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
                                <p className="text-[24px] text-primary font-sans italic">à {selectedTime}</p>
                             </div>
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">Le Lieu</p>
                                <p className="font-sans text-[28px]">Serenity Geneva</p>
                                <p className="text-[16px] text-foreground/40 font-light italic">Route de l&apos;Aéroport 1, Genève</p>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">Destinataire</p>
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                   <User size={24} />
                                </div>
                                <div>
                                   <p className="font-sans text-[24px]">{formData.firstName} {formData.lastName}</p>
                                   <p className="text-[16px] text-foreground/40 font-light italic">{formData.email} · {formData.phone}</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-muted/30 p-12 flex items-start gap-8 cursor-pointer group" onClick={() => setAcceptedConditions(!acceptedConditions)}>
                        <div className={`mt-1 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-500 ${acceptedConditions ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-black/10 group-hover:border-primary/40'}`}>
                          {acceptedConditions && <CheckCircle2 size={18} />}
                        </div>
                        <p className="text-[15px] text-foreground/60 leading-relaxed font-light italic">
                          Je confirme l&apos;exactitude de ces informations et j&apos;accepte les <span className="font-medium text-foreground underline underline-offset-8 decoration-primary/30 not-italic">conditions de réservation</span>, incluant le délai de préavis de 24h.
                        </p>
                      </div>
                    </motion.div>

                    <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-12">
                      <Magnetic strength={0.1}>
                        <button onClick={() => setStep(3)} className="text-[11px] font-bold uppercase tracking-[0.5em] text-foreground/30 hover:text-primary transition-colors flex items-center gap-4 py-4 px-6 rounded-full hover:bg-white/50 backdrop-blur-sm">
                           <ArrowLeft size={16} /> Revoir les détails
                        </button>
                      </Magnetic>
                      
                      <Magnetic strength={0.2}>
                        <button
                          disabled={!acceptedConditions || isSubmitting}
                          onClick={completeBooking}
                          className="premium-button bg-primary text-white rounded-full px-24 py-12 shadow-2xl group disabled:opacity-30 disabled:grayscale min-w-[320px]"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                            <span className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.5em]">
                              Confirmer le rituel <Sparkles size={20} className="group-hover:scale-125 transition-transform" />
                            </span>
                          )}
                        </button>
                      </Magnetic>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: SUCCESS (CONFIRMATION STYLE) */}
              {step === 5 && (
                <motion.div 
                  key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 space-y-16"
                >
                  <div className="relative inline-flex">
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                      className="w-56 h-56 bg-primary/5 text-primary rounded-full flex items-center justify-center relative z-10"
                    >
                      <CheckCircle2 size={84} strokeWidth={1} />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 2], opacity: [0.2, 0] }} 
                      transition={{ duration: 4, repeat: Infinity }} 
                      className="absolute inset-0 bg-primary rounded-full" 
                    />
                  </div>

                  <div className="space-y-8 max-w-3xl mx-auto">
                    <h2 className="font-sans text-[64px] md:text-[110px] leading-[0.8] tracking-tight">
                      Expérience <br />
                      <span className="italic font-light text-secondary">Confirmée.</span>
                    </h2>
                    <p className="text-[22px] text-foreground/50 font-light leading-relaxed max-w-xl mx-auto italic">Merci {formData.firstName}. Votre rituel est désormais inscrit dans notre agenda. Un voyage vers la sérénité vous attend.</p>
                  </div>

                  <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md p-12 border border-black/[0.03] shadow-2xl space-y-10 text-left relative overflow-hidden rounded-[40px]">
                    <div className="absolute top-0 right-0 p-10">
                       <Sparkles className="text-primary/10" size={40} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.5em] text-foreground/20">
                      <span>Référence de Session</span>
                      <span className="text-primary">{bookingRef}</span>
                    </div>
                    <div className="h-[1px] bg-black/[0.05]" />
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">Soin</span>
                        <span className="font-sans text-[26px] text-primary">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/30">Moment</span>
                        <div className="text-right">
                           <span className="font-sans text-[22px] block capitalize">{selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: fr })}</span>
                           <span className="font-sans text-[20px] text-primary italic">à {selectedTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-12">
                    <Magnetic strength={0.2}>
                      <button onClick={onClose} className="premium-button bg-foreground text-background rounded-full px-20 py-10 group min-w-[280px]">
                        <span className="text-[11px] font-bold uppercase tracking-[0.4em] flex items-center gap-6">
                          Retour au sanctuaire <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </span>
                      </button>
                    </Magnetic>
                    <Magnetic strength={0.1}>
                      <a href="tel:+41783336823" className="text-[11px] font-bold uppercase tracking-[0.4em] text-secondary hover:text-primary transition-colors flex items-center gap-4 py-4 px-6 rounded-full hover:bg-white/50 backdrop-blur-sm">
                        <Phone size={16} /> Assistance Conciergerie
                      </a>
                    </Magnetic>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SlotSection({ title, slots, selectedTime, onSelect }: { title: string, slots: string[], selectedTime: string | null, onSelect: (t: string) => void }) {
  if (slots.length === 0) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground/20">{title}</span>
        <div className="h-[1px] flex-1 bg-black/[0.03]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {slots.map(t => (
          <Magnetic key={t} strength={0.2}>
            <button
              onClick={() => onSelect(t)}
              className={`w-full py-6 px-4 rounded-[20px] border text-[16px] transition-all duration-500 font-sans ${selectedTime === t ? 'border-primary bg-primary text-white shadow-xl scale-105' : 'border-black/[0.03] bg-white/60 hover:bg-white hover:border-primary/20 hover:shadow-md'}`}
            >
              {t}
            </button>
          </Magnetic>
        ))}
      </div>
    </div>
  );
}

function InputField({ 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  type = 'text',
  placeholder,
  onEnter,
  id
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  icon: any;
  type?: string;
  placeholder?: string;
  onEnter?: () => void;
  id?: string;
}) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30 flex items-center gap-4">
        <Icon size={14} strokeWidth={1} className="text-primary" /> {label}
      </label>
      <input 
        id={id}
        type={type}
        className="w-full px-0 py-4 bg-transparent border-b border-black/10 text-[20px] focus:outline-none focus:border-primary transition-all font-sans placeholder:text-black/10 placeholder:font-sans placeholder:text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        required
      />
    </div>
  );
}
