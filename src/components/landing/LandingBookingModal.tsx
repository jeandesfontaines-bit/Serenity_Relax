'use client';

import { useEffect, useMemo, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { addMinutes, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, ChevronLeft, ChevronRight, X, ShieldCheck, Info } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';
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

  const selectedDay = weekData.days.find((day) => day.fullDate === bookingData.date);
  const canContinueInfo = Boolean(
    bookingData.firstName.trim() &&
    bookingData.lastName.trim() &&
    bookingData.phone.trim() &&
    bookingData.email.includes('@'),
  );

  const formattedDate = bookingData.date
    ? format(parseISO(bookingData.date), 'd MMM', { locale: fr })
    : '';

  const AVAILABILITY_META: Record<WeekDay['availabilityTone'], { label: string; className: string }> = {
    high: {
      label: 'Dispo',
      className: 'bg-[#ecfccb] text-[#3f6212]',
    },
    medium: {
      label: 'Limité',
      className: 'bg-[#ffedd5] text-[#c2410c]',
    },
    low: {
      label: 'Presque complet',
      className: 'bg-[#fee2e2] text-[#b91c1c]',
    },
    full: {
      label: 'Complet',
      className: 'bg-foreground/5 text-foreground/40',
    },
  };

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

      // Generate IDs and tokens
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

      // 1. Create the appointment
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

      // 2. Create/Update the client
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

      // 3. Create the invoice
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

      // 4. Update availability
      await setDoc(doc(firestore, 'availability', appointmentId), {
        type: 'booked',
        date: bookingData.date,
        time: bookingData.time,
        appointmentId,
      });

      // 5. Trigger notification (optional, but good practice)
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

  if (!isOpen || !selectedService) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 backdrop-blur-xl px-0 py-0 md:items-center md:px-4 md:py-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex flex-col w-full max-w-2xl overflow-hidden bg-background shadow-[0_40px_100px_-20px_rgba(21,32,35,0.2)] 
                   fixed bottom-0 inset-x-0 rounded-t-[2.5rem] h-[75vh] animate-in slide-in-from-bottom duration-500
                   md:relative md:mx-auto md:rounded-[2.5rem] md:border md:border-foreground/5 md:h-[min(800px,85vh)] md:animate-in md:zoom-in-95"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-booking-title"
      >
        {/* Mobile handle */}
        <div className="flex w-full justify-center pt-3 pb-1 md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-foreground/10" />
        </div>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          className="absolute right-6 top-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-white/80 text-foreground shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-foreground hover:text-background active:scale-95 z-[130]"
          aria-label="Fermer la réservation"
        >
          <X size={20} />
        </button>

        <section className="h-full overflow-y-auto px-6 py-8 md:px-12 md:py-12">
          {/* Compact Summary Header */}
          {selectedService && step > 1 && (
            <div className="mb-8 flex items-center justify-between rounded-2xl bg-foreground/[0.03] border border-foreground/5 p-5 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Soin</span>
                <span className="text-sm font-bold text-foreground">{shortenServiceName(selectedService.name)}</span>
              </div>
              {bookingData.date && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-right">Rendez-vous</span>
                  <span className="text-sm font-bold text-foreground text-right">{formattedDate} {bookingData.time ? `· ${bookingData.time}` : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Sequential stepper */}
          <div className="mb-12 flex gap-1.5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  step >= item ? 'bg-[var(--orange)]' : 'bg-foreground/5'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="display-tight text-4xl text-foreground font-serif italic">
                  Quel soin souhaitez-vous <br /> réserver aujourd&apos;hui ?
                </h3>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceChange(service.id)}
                    className="group relative flex flex-col items-start rounded-[2.5rem] border border-foreground/5 bg-white p-8 text-left transition-all duration-300 hover:border-foreground/20 hover:shadow-2xl hover:shadow-foreground/5 hover:-translate-y-1"
                  >
                    <span className="text-xl font-bold display-tight text-foreground leading-tight">{shortenServiceName(service.name)}</span>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--orange)]">{service.price} CHF</span>
                      <span className="h-1 w-1 rounded-full bg-foreground/10" />
                      <span className="text-xs font-medium text-foreground/40">{service.duration}</span>
                    </div>
                    <div className="absolute bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:bg-foreground group-hover:text-background">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-foreground/5 pb-6">
                <button
                  type="button"
                  onClick={() => setWeekOffset((value) => value - 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-white text-foreground transition-all duration-300 hover:bg-foreground hover:text-background disabled:opacity-10 disabled:cursor-not-allowed"
                  aria-label="Semaine précédente"
                  disabled={weekOffset === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="text-center">
                  <h3 className="text-3xl font-medium display-tight italic font-serif text-foreground capitalize">
                    {weekData.monthLabel}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setWeekOffset((value) => value + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-white text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
                  aria-label="Semaine suivante"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2.5">
                {weekData.days.map((day) => {
                  const isActive = bookingData.date === day.fullDate;
                  const availabilityMeta = AVAILABILITY_META[day.availabilityTone];

                  return (
                    <button
                      key={day.fullDate}
                      type="button"
                      disabled={day.isDisabled}
                      onClick={() => handleDateSelect(day.fullDate)}
                      className={`flex min-h-[7.5rem] flex-col items-center justify-center rounded-[1.5rem] border px-1 text-center transition-all duration-500 ${
                        day.isDisabled
                          ? 'cursor-not-allowed border-transparent bg-foreground/[0.03] text-foreground/20'
                          : isActive
                            ? 'border-foreground bg-foreground text-background shadow-xl shadow-foreground/10 scale-[1.02]'
                            : 'border-foreground/5 bg-white text-foreground/60 hover:border-foreground/20 hover:text-foreground'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {day.dayLabel}
                      </span>
                      <span className="mt-1 text-xl font-medium display-tight">{day.dayNumber}</span>
                      <span
                        className={`mt-2 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          isActive ? 'bg-background/20 text-background' : availabilityMeta.className
                        }`}
                      >
                        {availabilityMeta.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="space-y-4 pt-8 border-t border-foreground/5 animate-in fade-in duration-700">
                  <span className="mono-caption text-[var(--sage-deep)] block">
                    — Horaires disponibles le {formattedDate}
                  </span>
                  
                  {selectedDay.slots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {selectedDay.slots.map((slot) => {
                        const isActive = bookingData.time === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeSelect(slot)}
                            className={`min-h-16 rounded-2xl border text-sm font-bold tracking-tight transition-all duration-300 ${
                              isActive
                                ? 'border-foreground bg-foreground text-background shadow-lg shadow-foreground/10'
                                : 'border-foreground/5 bg-white text-foreground/60 hover:border-foreground/20 hover:text-foreground'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-dashed border-foreground/10 bg-foreground/[0.02] px-6 py-10 text-center">
                      <p className="text-sm text-foreground/40 italic font-serif">
                        Aucun créneau disponible pour cette date.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                >
                  ← Changer de soin
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
              onSubmit={(event) => {
                event.preventDefault();
                setStep(4);
              }}
            >
              <div className="mb-8">
                <h3 className="display-tight text-4xl text-foreground font-serif italic">
                  Vos informations
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="min-h-16 w-full rounded-full border border-foreground/5 bg-white px-8 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                  value={bookingData.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder="Prénom"
                  required
                />
                <input
                  className="min-h-16 w-full rounded-full border border-foreground/5 bg-white px-8 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                  value={bookingData.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  placeholder="Nom"
                  required
                />
                <div className="sm:col-span-2 flex gap-3">
                  <select
                    className="min-h-16 rounded-full border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 appearance-none cursor-pointer pr-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/19/9\' /%3E%3C/svg%3E")' }}
                    value={bookingData.phonePrefix}
                    onChange={(event) => updateField('phonePrefix', event.target.value as BookingData['phonePrefix'])}
                  >
                    <option value="CH">CH +41</option>
                    <option value="FR">FR +33</option>
                    <option value="BE">BE +32</option>
                  </select>
                  <input
                    className="min-h-16 flex-1 rounded-full border border-foreground/5 bg-white px-8 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    type="tel"
                    value={bookingData.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="Téléphone"
                    required
                  />
                </div>
                <input
                  className="sm:col-span-2 min-h-16 w-full rounded-full border border-foreground/5 bg-white px-8 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                  type="email"
                  value={bookingData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="Adresse email"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_2fr] pt-4">
                <button
                  className="min-h-14 rounded-full border border-foreground/10 bg-white px-8 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Retour
                </button>
                <button
                  className="min-h-14 rounded-full bg-[var(--orange)] px-8 text-xs font-bold uppercase tracking-widest text-white transition-all hover:brightness-110 disabled:opacity-30 disabled:grayscale"
                  type="submit"
                  disabled={!canContinueInfo}
                >
                  Continuer
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <form className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={submitBooking}>
              <div className="mb-8">
                <h3 className="display-tight text-4xl text-foreground font-serif italic">
                  Dernières précisions
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="min-h-14 w-full rounded-2xl border border-foreground/5 bg-white px-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                  value={bookingData.streetName}
                  onChange={(event) => updateField('streetName', event.target.value)}
                  placeholder="Rue"
                  required
                />
                <input
                  className="min-h-14 w-full rounded-2xl border border-foreground/5 bg-white px-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                  value={bookingData.streetNum}
                  onChange={(event) => updateField('streetNum', event.target.value)}
                  placeholder="N°"
                  required
                />
                <input
                  className="min-h-14 w-full rounded-2xl border border-foreground/5 bg-white px-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                  value={bookingData.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Ville"
                  required
                />
                <div className="flex gap-3">
                  <input
                    className="min-h-14 w-32 rounded-2xl border border-foreground/5 bg-white px-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.canton}
                    onChange={(event) => updateField('canton', event.target.value)}
                    placeholder="GE"
                    required
                  />
                  <input
                    className="min-h-14 flex-1 rounded-2xl border border-foreground/5 bg-white px-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.country}
                    onChange={(event) => updateField('country', event.target.value)}
                    placeholder="Suisse"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-foreground/5 bg-white p-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02] resize-none"
                  value={bookingData.note}
                  onChange={(event) => updateField('note', event.target.value)}
                  placeholder="Notes ou précisions (facultatif)..."
                />

                <div className="rounded-[2rem] border border-foreground/5 bg-foreground/[0.02] p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange)] flex items-center gap-2">
                      <ShieldCheck size={14} /> Santé & Éthique
                    </p>
                    <p className="text-[11px] leading-relaxed text-foreground/50">
                      Les prestations sont dédiées au bien-être et ne remplacent pas un traitement médical. En réservant, vous confirmez n&apos;avoir aucune contre-indication.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange)] flex items-center gap-2">
                      <Info size={14} /> Annulations
                    </p>
                    <p className="text-[11px] leading-relaxed text-foreground/50">
                      Toute annulation doit être effectuée 24h à l&apos;avance. En cas d&apos;annulation tardive, la séance pourra être facturée.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-4 pt-4 border-t border-foreground/5 group">
                    <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        required
                        checked={bookingData.acceptedTerms}
                        onChange={(e) => updateField('acceptedTerms', e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-foreground/10 bg-white transition-all checked:bg-[var(--orange)] checked:border-[var(--orange)]"
                      />
                      <Check className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                    </div>
                    <span className="text-[11px] font-medium leading-relaxed text-foreground/60 group-hover:text-foreground transition-colors">
                      J&apos;ai pris connaissance des conditions et je confirme ma bonne condition physique.
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                <button
                  className="min-h-14 rounded-full border border-foreground/10 bg-white px-8 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background"
                  type="button"
                  onClick={() => setStep(3)}
                >
                  Retour
                </button>
                <button
                  className="min-h-14 rounded-full bg-foreground px-8 text-xs font-bold uppercase tracking-widest text-background transition-all hover:brightness-110 disabled:opacity-40"
                  type="submit"
                  disabled={isSubmitting || !bookingData.acceptedTerms}
                >
                  {isSubmitting ? 'Confirmation en cours...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          )}

          {step === 5 && (
            <div className="flex min-h-[30rem] flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--orange)] text-white shadow-xl shadow-orange-200">
                <Check size={40} strokeWidth={3} />
              </div>
              <h3 className="display-tight text-4xl text-foreground md:text-5xl">
                C&apos;est validé.
              </h3>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-foreground/60 italic font-serif">
                À bientôt au studio{bookingData.firstName ? `, ${bookingData.firstName}` : ''}. Votre voyage vers la sérénité commence ici.
              </p>
              {bookingRef && (
                <div className="mt-10 rounded-xl bg-foreground/[0.03] px-6 py-3 border border-foreground/5">
                  <span className="mono-caption text-foreground/40 block mb-1">Numéro de confirmation</span>
                  <span className="text-sm font-bold tracking-[0.2em] text-foreground">{bookingRef}</span>
                </div>
              )}
              <button
                className="mt-12 min-h-14 rounded-full bg-foreground px-10 text-xs font-bold uppercase tracking-widest text-background transition-all hover:scale-105 active:scale-95"
                type="button"
                onClick={onClose}
              >
                Fermer l&apos;écran
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
