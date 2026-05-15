"use client";

import { useEffect, useMemo, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { addMinutes, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameMonth, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths } from 'date-fns';
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
  const [monthOffset, setMonthOffset] = useState(0);
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
    setMonthOffset(0);
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

  const currentMonthLabel = useMemo(() => {
    let targetMonth = startOfMonth(new Date());
    if (monthOffset !== 0) {
      targetMonth = monthOffset > 0 ? addMonths(targetMonth, monthOffset) : subMonths(targetMonth, Math.abs(monthOffset));
    }
    return format(targetMonth, 'MMMM yyyy', { locale: fr });
  }, [monthOffset]);

  const calendarDays = useMemo(() => {
    const today = startOfDay(new Date());
    let targetMonth = startOfMonth(today);
    if (monthOffset !== 0) {
      targetMonth = monthOffset > 0 ? addMonths(targetMonth, monthOffset) : subMonths(targetMonth, Math.abs(monthOffset));
    }
    
    const firstDay = startOfWeek(targetMonth, { weekStartsOn: 1 });
    const lastDay = endOfWeek(endOfMonth(targetMonth), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    return days.map(date => {
      const fullDate = format(date, 'yyyy-MM-dd');
      const isPast = isBefore(date, today);
      const isCurrentMonth = isSameMonth(date, targetMonth);
      const slots = (isPast || !isCurrentMonth) ? [] : getFreeSlotsForDate(fullDate);

      return {
        fullDate,
        dayLabel: format(date, 'EEE', { locale: fr }).replace('.', ''),
        dayNumber: format(date, 'd'),
        isDisabled: isPast || !isCurrentMonth || slots.length === 0,
        isCurrentMonth,
        slots,
      };
    });
  }, [availableSlots, configSlots, monthOffset]);

  const selectedDay = calendarDays.find((day) => day.fullDate === bookingData.date);

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
      icon: Sparkles,
    },
    {
      id: 2,
      label: 'Agenda',
      val: bookingData.date ? `${formattedDate}${bookingData.time ? ` · ${bookingData.time}` : ''}` : '—',
      icon: Calendar,
    },
    {
      id: 3,
      label: 'Contact',
      val: bookingData.firstName || bookingData.lastName ? `${bookingData.firstName} ${bookingData.lastName}`.trim() : '—',
      icon: User,
    },
    {
      id: 4,
      label: 'Finalisation',
      val: step >= 4 ? 'En cours' : '—',
      icon: Check,
    },
  ];

  return (
    <div className={`landing-v2 landing-booking-modal fixed inset-0 z-[500] transition-all duration-500 ease-in-out ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-[2rem] bg-[#FDFDFB] shadow-2xl transition-all duration-700 ease-out h-[90vh] max-h-[720px] w-[95vw] max-w-[1000px] md:flex-row md:rounded-[2.5rem] ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="hidden w-[220px] shrink-0 flex-col justify-between border-r border-neutral-100 bg-white/50 px-6 py-10 md:flex">
          <div className="space-y-8">
            <div className="leading-none">
              <span className="block text-lg font-bold tracking-tighter uppercase text-neutral-900">Serenity</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-neutral-400 mt-1 block">Booking Portal</span>
            </div>

            <nav className="space-y-8">
              {stepItems.map((s) => (
                <div key={s.id} className={`flex items-start gap-4 transition-all duration-500 ${step < s.id ? 'opacity-40' : 'opacity-100'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all duration-500 ${step > s.id ? 'bg-emerald-500 text-white' : step === s.id ? 'bg-black text-white' : 'border border-neutral-200 text-neutral-400'}`}>
                    {step > s.id ? <Check size={12} /> : s.id}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <s.icon size={11} className={`${step === s.id ? 'text-black' : 'text-neutral-400'}`} />
                      <span className={`block text-[8px] font-bold uppercase tracking-[0.2em] ${step === s.id ? 'text-black' : 'text-neutral-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-bold uppercase tracking-tight text-neutral-900">
                      {s.val}
                    </p>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <button onClick={onClose} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-black">
            <X size={10} />
            <span>Fermer</span>
          </button>
        </aside>

        <main className="relative flex-1 flex flex-col justify-center overflow-hidden bg-neutral-50/20 px-6 py-8 md:px-10 md:py-10">
          <button onClick={onClose} className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 shadow-sm transition-colors hover:text-black md:hidden">
            <X size={14} />
          </button>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-6">
                <h2 className="landing-type-h3 landing-text-high display-tight leading-[0.94] text-neutral-900">
                  Planifiez votre <span className="landing-display-italic">séance</span>
                </h2>
                <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Une réservation pensée comme un parcours guidé
                </p>
              </div>
              
              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-neutral-100 bg-white py-16 text-neutral-400">
                  <Info size={24} className="mb-3 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Aucun service disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((s) => (
                    <button 
                      key={s.id} 
                      onClick={() => handleServiceChange(s.id)} 
                      className={`group relative flex flex-col items-start justify-between rounded-[1.2rem] border bg-white p-4 text-left shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md ${selectedServiceId === s.id ? 'border-black ring-1 ring-black' : 'border-neutral-100 hover:border-black'}`}
                    >
                      <div className="flex w-full items-start justify-between mb-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 group-hover:bg-black group-hover:text-white transition-all">
                          <Sparkles size={12} />
                        </span>
                        <span className="rounded-full bg-neutral-50 px-2 py-0.5 text-[8px] font-black text-neutral-800">
                          {s.price} CHF
                        </span>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest leading-tight">{s.name}</p>
                        <p className="text-[8px] font-medium text-neutral-400 flex items-center gap-1">
                          <Clock size={9} /> {s.duration} min
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button onClick={() => setStep(1)} className="group mb-4 flex items-center gap-2 text-neutral-400 transition-colors hover:text-black">
                <ChevronLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[8px] font-bold uppercase tracking-widest pt-0.5">Rituels</span>
              </button>
              
              <h2 className="mb-4 landing-type-h3 landing-text-high display-tight leading-[0.94] text-neutral-900">
                Choisir votre <span className="landing-display-italic">disponibilité</span>
              </h2>
              
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-900">{currentMonthLabel}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setMonthOffset(v => v-1)} disabled={monthOffset === 0} className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-100 hover:bg-neutral-50 disabled:opacity-30"><ChevronLeft size={12}/></button>
                      <button onClick={() => setMonthOffset(v => v+1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-100 hover:bg-neutral-50"><ChevronRight size={12}/></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
                      <div key={`head-${d}-${idx}`} className="text-[8px] font-bold uppercase text-neutral-400 text-center">{d}</div>
                    ))}
                    {calendarDays.map((day) => (
                      <button 
                        key={day.fullDate} 
                        disabled={day.isDisabled || !day.isCurrentMonth}
                        onClick={() => handleDateSelect(day.fullDate)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                          !day.isCurrentMonth ? 'opacity-0' :
                          day.isDisabled ? 'text-neutral-200 cursor-not-allowed' :
                          bookingData.date === day.fullDate ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50 border border-neutral-50'
                        }`}
                      >
                        {day.dayNumber}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-3">Horaires</div>
                  {selectedDay && selectedDay.slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDay.slots.map(t => (
                        <button 
                          key={t}
                          onClick={() => handleTimeSelect(t)}
                          className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${bookingData.time === t ? 'border-black bg-black text-white shadow-lg shadow-black/10' : 'border-neutral-50 bg-white text-neutral-800 hover:border-black'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-neutral-50 bg-white/50 py-10 text-center">
                      <p className="text-[10px] italic text-neutral-400 px-6">
                        {selectedDay ? 'Aucun créneau ce jour.' : 'Sélectionnez une date.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button onClick={() => setStep(2)} className="group mb-4 flex items-center gap-2 text-neutral-400 transition-colors hover:text-black">
                <ChevronLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[8px] font-bold uppercase tracking-widest pt-0.5">Agenda</span>
              </button>

              <h2 className="mb-6 landing-type-h3 landing-text-high display-tight leading-[0.94] text-neutral-900">
                Vos <span className="landing-display-italic">coordonnées</span>
              </h2>

              <div className="grid max-w-2xl gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input type="text" value={bookingData.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="Prénom" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                  <input type="text" value={bookingData.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Nom" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                </div>
                <div className="grid gap-3 md:grid-cols-[90px_1fr]">
                  <select value={bookingData.phonePrefix} onChange={e => updateField('phonePrefix', e.target.value)} className="w-full rounded-xl border border-neutral-100 bg-white px-3 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none">
                    <option value="CH">+41</option>
                    <option value="FR">+33</option>
                  </select>
                  <input type="tel" value={bookingData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Mobile" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                </div>
                <input type="email" value={bookingData.email} onChange={e => updateField('email', e.target.value)} placeholder="Email" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />

                <div className="pt-2">
                  <button onClick={() => setStep(4)} disabled={!canContinueInfo} className="rounded-full bg-black px-8 py-3 text-[9px] font-bold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-20 shadow-lg shadow-black/5">
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button onClick={() => setStep(3)} className="group mb-4 flex items-center gap-2 text-neutral-400 transition-colors hover:text-black">
                <ChevronLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[8px] font-bold uppercase tracking-widest pt-0.5">Contact</span>
              </button>

              <h2 className="mb-6 landing-type-h3 landing-text-high display-tight leading-[0.94] text-neutral-900">
                Dernier <span className="landing-display-italic">regard</span>
              </h2>

              <div className="grid max-w-2xl gap-4">
                <div className="grid gap-3 md:grid-cols-[3fr_1fr]">
                  <input type="text" value={bookingData.streetName} onChange={e => updateField('streetName', e.target.value)} placeholder="Adresse" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                  <input type="text" value={bookingData.streetNum} onChange={e => updateField('streetNum', e.target.value)} placeholder="N°" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                </div>
                <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                  <input type="text" value={bookingData.city} onChange={e => updateField('city', e.target.value)} placeholder="Ville" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                  <input type="text" value={bookingData.postalCode} onChange={e => updateField('postalCode', e.target.value)} placeholder="CP" className="w-full rounded-xl border border-neutral-100 bg-white px-4 py-2.5 text-[12px] shadow-sm focus:border-black focus:outline-none" required />
                </div>
                <textarea value={bookingData.note} onChange={e => updateField('note', e.target.value)} placeholder="Notes (optionnel)" className="h-12 w-full resize-none rounded-xl border border-neutral-100 bg-white px-4 py-2 text-[12px] shadow-sm focus:border-black focus:outline-none" />

                <label className="flex cursor-pointer items-start gap-3 py-1">
                  <input type="checkbox" required checked={bookingData.acceptedTerms} onChange={e => updateField('acceptedTerms', e.target.checked)} className="mt-1 h-3.5 w-3.5 rounded border-neutral-300 text-black focus:ring-black" />
                  <span className="text-[11px] text-neutral-500">J&apos;accepte les conditions de réservation et d&apos;annulation.</span>
                </label>

                <div className="mt-1 flex items-center justify-between rounded-2xl bg-black p-4 text-white">
                  <div>
                    <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-neutral-400">Total</p>
                    <p className="text-base font-bold">{selectedService?.price} CHF</p>
                  </div>
                  <button onClick={submitBooking} disabled={isSubmitting || !bookingData.acceptedTerms} className="rounded-full bg-white px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                    {isSubmitting ? '...' : 'Réserver'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex h-full flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-500">
                <Check size={32} strokeWidth={3} />
              </div>
              <h3 className="mb-3 text-3xl font-serif italic text-neutral-900 md:text-4xl">C&apos;est validé.</h3>
              <p className="mb-8 max-w-[320px] text-sm leading-relaxed text-neutral-500">Votre rendez-vous est confirmé. À bientôt au studio.</p>
              
              {bookingRef && (
                <div className="mb-8 rounded-[1.5rem] border border-neutral-100 bg-white px-5 py-3 shadow-sm">
                  <span className="block text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-400">Référence</span>
                  <span className="text-sm font-bold tracking-[0.2em] text-neutral-900">{bookingRef}</span>
                </div>
              )}
              
              <button onClick={onClose} className="rounded-full bg-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition-transform hover:scale-105">
                Terminer
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
