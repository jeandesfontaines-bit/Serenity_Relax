"use client";

import { useEffect, useMemo, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { addMinutes, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, ChevronLeft, ChevronRight, ChevronDown, X, ShieldCheck, Info, Sparkles, Calendar, Clock, User, Mail, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import type { Service } from '@/lib/types';

interface LandingBookingModalProps {
  initialServiceId?: string;
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

type BookingData = {
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phonePrefix: 'CH' | 'FR' | 'BE';
  phone: string;
  email: string;
  streetNum: string;
  streetName: string;
  city: string;
  postalCode: string;
  canton: string;
  country: string;
  note: string;
  acceptedTerms: boolean;
};

type AvailabilitySlot = {
  id: string;
  appointmentId?: string;
  date?: string;
  time?: string;
  type?: string;
  closed?: boolean;
  blockedSlots?: string[];
};

type WeekDay = {
  dayLabel: string;
  dayNumber: string;
  fullDate: string;
  isDisabled: boolean;
  slots: string[];
  totalSlots: number;
  availabilityTone: 'high' | 'medium' | 'low' | 'full';
};

const EMPTY_BOOKING_DATA: BookingData = {
  date: '',
  time: '',
  firstName: '',
  lastName: '',
  phonePrefix: 'CH',
  phone: '',
  email: '',
  streetNum: '',
  streetName: '',
  city: '',
  postalCode: '',
  canton: '',
  country: 'Suisse',
  note: '',
  acceptedTerms: false,
};

const PHONE_PREFIXES: Record<BookingData['phonePrefix'], string> = {
  CH: '+41',
  FR: '+33',
  BE: '+32',
};

function shortenServiceName(name: string) {
  return name.split('-')[0].split('/')[0].trim();
}

export function LandingBookingModal({
  initialServiceId,
  isOpen,
  onClose,
  services,
}: LandingBookingModalProps) {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(services[0]?.id ?? null);
  const [step, setStep] = useState(1);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>(EMPTY_BOOKING_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, services],
  );

  useEffect(() => {
    if (!firestore) return;

    const unsubAvail = onSnapshot(collection(firestore, 'availability'), (snapshot) => {
      setAvailableSlots(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as AvailabilitySlot)));
    });

    const unsubConfig = onSnapshot(doc(firestore, 'config', 'slots'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setConfigSlots((data.days || data) as Record<number, string[]>);
      }
    });

    return () => {
      unsubAvail();
      unsubConfig();
    };
  }, [firestore]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
      setStep(2);
    } else {
      setSelectedServiceId(services[0]?.id ?? null);
      setStep(1);
    }
    setWeekOffset(0);
    setBookingRef(null);
    setBookingData(EMPTY_BOOKING_DATA);
    setIsSubmitting(false);
  }, [initialServiceId, isOpen, services]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getFreeSlotsForDate = (fullDate: string) => {
    const date = parseISO(fullDate);
    const dayOfWeek = date.getDay();
    const configuredSlots = configSlots[dayOfWeek] ?? [];
    const dayAvailability = availableSlots.find((slot) => slot.id === fullDate);
    const blockedSlots = dayAvailability?.blockedSlots ?? [];

    if (dayAvailability?.closed) {
      return [];
    }

    return configuredSlots.filter((time) => (
      !blockedSlots.includes(time) &&
      !availableSlots.some((slot) => (
        slot.date === fullDate &&
        slot.time === time &&
        (slot.type === 'blocked' || slot.type === 'booked')
      ))
    ));
  };

  const weekData = useMemo(() => {
    const today = new Date();
    const startFrom = new Date(today);
    startFrom.setHours(0, 0, 0, 0);
    startFrom.setDate(today.getDate() + weekOffset * 7);

    const days: WeekDay[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startFrom);
      date.setDate(startFrom.getDate() + index);
      const fullDate = format(date, 'yyyy-MM-dd');
      const isPast = isBefore(date, startOfDay(today));
      const slots = isPast ? [] : getFreeSlotsForDate(fullDate);
      const totalSlots = (configSlots[date.getDay()] ?? []).length;
      const ratio = totalSlots > 0 ? slots.length / totalSlots : 0;
      const availabilityTone =
        slots.length === 0
          ? 'full'
          : ratio > 0.66
            ? 'high'
            : ratio > 0.33
              ? 'medium'
              : 'low';

      return {
        dayLabel: format(date, 'EEE', { locale: fr }).replace('.', ''),
        dayNumber: format(date, 'd'),
        fullDate,
        isDisabled: isPast || slots.length === 0,
        slots,
        totalSlots,
        availabilityTone,
      };
    });

    const monthLabel = format(days[3] ? parseISO(days[3].fullDate) : new Date(), 'MMMM yyyy', { locale: fr });

    return { days, monthLabel };
  }, [availableSlots, configSlots, weekOffset]);

  const calendarDays = useMemo(() => {
    const today = new Date();
    const startFrom = new Date(today);
    startFrom.setHours(0, 0, 0, 0);
    startFrom.setDate(today.getDate() + weekOffset * 7);

    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(startFrom);
      date.setDate(startFrom.getDate() + index);
      const fullDate = format(date, 'yyyy-MM-dd');
      const isPast = isBefore(date, startOfDay(today));
      const slots = isPast ? [] : getFreeSlotsForDate(fullDate);

      return {
        fullDate,
        dayLabel: format(date, 'EEE', { locale: fr }).replace('.', ''),
        dayNumber: format(date, 'd'),
        isDisabled: isPast || slots.length === 0,
        slots,
      };
    });
  }, [availableSlots, configSlots, weekOffset]);

  const selectedDay = weekData.days.find((day) => day.fullDate === bookingData.date) || 
                      calendarDays.find((day) => day.fullDate === bookingData.date);

  const canContinueInfo = Boolean(
    bookingData.firstName.trim() &&
    bookingData.lastName.trim() &&
    bookingData.phone.trim() &&
    bookingData.email.includes('@'),
  );

  const formattedDate = bookingData.date
    ? format(parseISO(bookingData.date), 'd MMM', { locale: fr })
    : '';

  const updateField = (field: keyof BookingData, value: string | boolean) => {
    setBookingData((current) => ({ ...current, [field]: value }));
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setBookingData((current) => ({ ...current, date: '', time: '' }));
    setStep(2);
  };

  const handleDateSelect = (fullDate: string) => {
    setBookingData((current) => ({ ...current, date: fullDate, time: '' }));
  };

  const handleTimeSelect = (time: string) => {
    setBookingData((current) => ({ ...current, time }));
    window.setTimeout(() => setStep(3), 140);
  };

  const submitBooking = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!firestore || !selectedService || !bookingData.date || !bookingData.time || !canContinueInfo) {
      return;
    }

    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;

      if (!finalUserId) {
        const credential = await signInAnonymously(auth);
        finalUserId = credential.user.uid;
      }

      if (!finalUserId) {
        throw new Error('Impossible d’établir une session sécurisée.');
      }

      const magicToken = `${Math.random().toString(36).slice(2, 10).toUpperCase()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const firstName = bookingData.firstName.trim();
      const lastName = bookingData.lastName.trim();
      const fullName = `${firstName} ${lastName}`.trim();
      const fullPhone = `${PHONE_PREFIXES[bookingData.phonePrefix]} ${bookingData.phone.trim()}`;
      const fullStreet = [bookingData.streetNum.trim(), bookingData.streetName.trim()].filter(Boolean).join(' ');
      
      const startTime = `${bookingData.date}T${bookingData.time}:00`;
      const durationMatch = selectedService.duration.match(/\d+/);
      const duration = durationMatch ? Number(durationMatch[0]) : 60;
      const endTimeDate = new Date(new Date(startTime).getTime() + duration * 60000);
      const endTimeStr = format(endTimeDate, "yyyy-MM-dd'T'HH:mm:ss");

      const appointmentRef = await addDoc(collection(firestore, 'appointments'), {
        clientId: finalUserId,
        clientNameSnapshot: fullName,
        date: bookingData.date,
        time: bookingData.time,
        startTime,
        endTime: endTimeStr,
        serviceName: selectedService.name,
        serviceId: selectedService.id,
        price: selectedService.price,
        magicToken,
        phone: fullPhone,
        status: 'confirmed',
        paid: false,
        clientMessage: bookingData.note.trim(),
        createdAt: serverTimestamp(),
      });

      const appointmentId = appointmentRef.id;

      await setDoc(
        doc(firestore, 'clients', finalUserId),
        {
          id: finalUserId,
          firstName,
          lastName,
          email: bookingData.email.trim(),
          phone: fullPhone,
          addressStreet: fullStreet,
          addressCity: bookingData.city.trim(),
          addressPostalCode: bookingData.postalCode.trim(),
          addressCountry: bookingData.country.trim(),
          addressCanton: bookingData.canton.trim(),
          magicToken,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await addDoc(collection(firestore, 'invoices'), {
        appointmentId,
        clientId: finalUserId,
        clientNameSnapshot: fullName,
        invoiceNumber: `INV-${format(new Date(), 'yyyyMMdd')}-${appointmentId.slice(-4).toUpperCase()}`,
        date: bookingData.date,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: bookingData.date,
        amount: selectedService.price,
        totalAmount: selectedService.price,
        status: 'Pending',
        serviceName: selectedService.name,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(firestore, 'availability', appointmentId), {
        type: 'booked',
        date: bookingData.date,
        time: bookingData.time,
        appointmentId,
      });

      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            clientName: fullName,
            clientEmail: bookingData.email.trim(),
            clientPhone: fullPhone,
            clientAddress: `${fullStreet}, ${bookingData.postalCode.trim()} ${bookingData.city.trim()}`,
            clientNotes: bookingData.note.trim(),
            serviceName: selectedService.name,
            startTime,
            duration: selectedService.duration,
            magicToken,
            clientId: finalUserId,
          }),
        });
      } catch (err) {
        console.error('Failed to send notification:', err);
      }

      setBookingRef(appointmentId);
      setStep(5);
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error?.message ?? 'Une erreur est survenue lors de la réservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepItems = [
    {
      id: 1,
      label: 'Rituel',
      val: selectedService ? shortenServiceName(selectedService.name) : 'À choisir',
    },
    {
      id: 2,
      label: 'Agenda',
      val: bookingData.date ? `${formattedDate}${bookingData.time ? ` · ${bookingData.time}` : ''}` : '—',
    },
    {
      id: 3,
      label: 'Contact',
      val: bookingData.firstName || bookingData.lastName ? `${bookingData.firstName} ${bookingData.lastName}`.trim() : '—',
    },
    {
      id: 4,
      label: 'Finalisation',
      val: step >= 4 ? 'En cours' : '—',
    },
  ];

  return (
    <div className={`fixed inset-0 z-[500] transition-all duration-500 ease-in-out ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div className={`absolute bottom-0 left-0 right-0 bg-[#FDFDFB] rounded-t-[3rem] shadow-2xl transition-transform duration-700 ease-out flex flex-col md:flex-row overflow-hidden h-[90vh] md:h-[85vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
        
        <aside className="w-full md:w-72 bg-white p-8 md:p-12 hidden md:flex flex-col justify-between shrink-0 border-r border-neutral-100">
          <div className="space-y-12">
            <div className="leading-none">
              <span className="block text-xl font-bold tracking-tighter uppercase text-neutral-800">Serenity</span>
              <span className="text-[9px] tracking-[0.4em] uppercase text-neutral-400 font-bold">Booking Portal</span>
            </div>
            
            <nav className="space-y-8">
              {stepItems.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step < s.id ? 'opacity-20' : 'opacity-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black transition-colors ${step > s.id ? 'bg-emerald-500 text-white' : (step === s.id ? 'bg-black text-white' : 'border border-neutral-200 text-neutral-400')}`}>
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[7px] font-bold text-neutral-400 tracking-[0.2em] uppercase">{s.label}</span>
                    <p className="text-[10px] font-bold uppercase truncate max-w-[140px] text-neutral-700">{s.val}</p>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <button onClick={onClose} className="flex items-center gap-3 text-neutral-400 hover:text-black transition-colors group">
            <X size={16} className="group-hover:rotate-90 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Fermer</span>
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-14 overflow-y-auto no-scrollbar bg-neutral-50/30 relative">
          <button onClick={onClose} className="md:hidden absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-neutral-100 text-neutral-400 hover:text-black z-10">
            <X size={18} />
          </button>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-serif italic text-neutral-900 mb-2 mt-4 md:mt-0">Sélectionnez un Rituel</h2>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-10">Une immersion sur-mesure</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <button 
                    key={s.id} 
                    onClick={() => handleServiceChange(s.id)} 
                    className={`group flex flex-col justify-between p-6 bg-white border rounded-[2rem] transition-all shadow-sm hover:shadow-xl hover:shadow-black/5 text-left min-h-[14rem] ${selectedServiceId === s.id ? 'border-black ring-1 ring-black' : 'border-neutral-100 hover:border-black'}`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 bg-neutral-50 rounded-full text-neutral-700">{s.price} CHF</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-tight mb-1 text-neutral-900">{shortenServiceName(s.name)}</h4>
                      <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold text-neutral-500">{s.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-neutral-400 hover:text-black mb-8 transition-colors mt-4 md:mt-0">
                <ChevronLeft size={16} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Retour</span>
              </button>
              <h2 className="text-3xl font-serif italic mb-10 text-neutral-900">Agenda disponible</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Jours disponibles</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setWeekOffset(v => v-1)} disabled={weekOffset === 0} className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-100 bg-white hover:bg-neutral-50 disabled:opacity-30 transition-all"><ChevronLeft size={14}/></button>
                      <button onClick={() => setWeekOffset(v => v+1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-100 bg-white hover:bg-neutral-50 transition-all"><ChevronRight size={14}/></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day) => (
                      <button 
                        key={day.fullDate} 
                        disabled={day.isDisabled}
                        onClick={() => handleDateSelect(day.fullDate)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                          day.isDisabled ? 'bg-neutral-50/50 text-neutral-300 cursor-not-allowed' :
                          bookingData.date === day.fullDate ? 'bg-black text-white shadow-md' : 'bg-white hover:bg-neutral-100 border border-neutral-100'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider opacity-60 font-bold">{day.dayLabel}</span>
                        <span className="text-xs font-bold mt-1">{day.dayNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Heures</div>
                    <span className="text-[9px] font-bold bg-neutral-100 px-2 py-1 rounded-full text-neutral-500">{selectedService?.duration}</span>
                  </div>
                  {selectedDay && selectedDay.slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedDay.slots.map(t => (
                        <button 
                          key={t}
                          onClick={() => handleTimeSelect(t)}
                          className={`py-4 rounded-xl border text-xs font-bold transition-all ${bookingData.time === t ? 'bg-black text-white border-black shadow-md' : 'bg-white border-neutral-100 hover:border-black text-neutral-800'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white border border-neutral-100 rounded-[2rem]">
                      <p className="text-xs italic text-neutral-400">{selectedDay ? 'Aucun créneau disponible pour cette date.' : 'Sélectionnez un jour pour voir les horaires.'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-neutral-400 hover:text-black mb-8 transition-colors mt-4 md:mt-0">
                <ChevronLeft size={16} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Retour</span>
              </button>
              <h2 className="text-3xl font-serif italic mb-10 text-neutral-900">Détails de contact</h2>
              
              <div className="grid gap-6 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                    <input type="text" value={bookingData.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="Prénom" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                    <input type="text" value={bookingData.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Nom" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-4">
                  <div className="relative">
                    <select value={bookingData.phonePrefix} onChange={e => updateField('phonePrefix', e.target.value)} className="w-full bg-white border border-neutral-100 rounded-2xl py-4 pl-4 pr-8 text-sm focus:outline-none focus:border-black transition-all shadow-sm appearance-none">
                      <option value="CH">+41</option>
                      <option value="FR">+33</option>
                      <option value="BE">+32</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                    <input type="tel" value={bookingData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Téléphone" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                  <input type="email" value={bookingData.email} onChange={e => updateField('email', e.target.value)} placeholder="Adresse Email" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                </div>

                <div className="mt-8 pt-4">
                  <button onClick={() => setStep(4)} disabled={!canContinueInfo} className="bg-black text-white w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 disabled:bg-neutral-200 transition-colors hover:bg-neutral-800 disabled:hover:bg-neutral-200">
                    Étape suivante
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col pb-10">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-neutral-400 hover:text-black mb-8 transition-colors mt-4 md:mt-0">
                <ChevronLeft size={16} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Retour</span>
              </button>
              <h2 className="text-3xl font-serif italic mb-10 text-neutral-900">Dernières précisions</h2>
              
              <div className="grid gap-6 max-w-xl">
                <div className="grid grid-cols-[2fr_1fr] gap-4">
                  <input type="text" value={bookingData.streetName} onChange={e => updateField('streetName', e.target.value)} placeholder="Rue" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                  <input type="text" value={bookingData.streetNum} onChange={e => updateField('streetNum', e.target.value)} placeholder="N°" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                </div>
                <div className="grid grid-cols-[1fr_80px_1fr] gap-4">
                  <input type="text" value={bookingData.city} onChange={e => updateField('city', e.target.value)} placeholder="Ville" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                  <input type="text" value={bookingData.canton} onChange={e => updateField('canton', e.target.value)} placeholder="Canton" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                  <input type="text" value={bookingData.country} onChange={e => updateField('country', e.target.value)} placeholder="Pays" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-black transition-all shadow-sm" required />
                </div>

                <textarea value={bookingData.note} onChange={e => updateField('note', e.target.value)} placeholder="Notes (facultatif)" className="w-full bg-white border border-neutral-100 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-black transition-all shadow-sm min-h-24 resize-none" />

                <label className="flex items-start gap-4 p-5 bg-neutral-50/80 rounded-2xl border border-neutral-100 cursor-pointer group transition-all hover:bg-neutral-100">
                  <div className="relative flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <input type="checkbox" required checked={bookingData.acceptedTerms} onChange={e => updateField('acceptedTerms', e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-neutral-300 bg-white transition-all checked:border-black checked:bg-black focus:outline-none" />
                    <Check className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-neutral-600 leading-relaxed group-hover:text-black transition-colors">J'accepte les conditions d'annulation (24h) et confirme ma bonne condition physique.</span>
                  </div>
                </label>

                <div className="mt-8 flex items-center justify-between p-6 sm:p-8 bg-black text-white rounded-[2.5rem] shadow-2xl shadow-black/20">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-1">Total à régler</p>
                    <p className="text-xl font-bold">{selectedService?.price} CHF</p>
                  </div>
                  <button onClick={submitBooking} disabled={isSubmitting || !bookingData.acceptedTerms} className="bg-white text-black px-6 sm:px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                    {isSubmitting ? 'Attente...' : 'Confirmer'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700 ease-out">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
                <Check size={40} strokeWidth={3} />
              </div>
              <h3 className="text-4xl md:text-5xl font-serif italic text-neutral-900 mb-4">C'est validé.</h3>
              <p className="text-sm font-medium text-neutral-500 max-w-sm leading-relaxed mb-10">À bientôt au studio. Votre voyage vers la sérénité commence ici.</p>
              
              {bookingRef && (
                <div className="rounded-2xl border border-neutral-100 bg-white px-8 py-4 shadow-sm mb-10">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 block mb-1">Confirmation</span>
                  <span className="text-sm font-bold tracking-widest text-neutral-900">{bookingRef}</span>
                </div>
              )}
              
              <button onClick={onClose} className="px-8 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
                Fermer l'écran
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
