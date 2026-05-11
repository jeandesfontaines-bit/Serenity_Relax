'use client';

import { useEffect, useMemo, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { addMinutes, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

    setSelectedServiceId(initialServiceId ?? services[0]?.id ?? null);
    setStep(1);
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
    const currentDay = today.getDay();
    const mondayOffset = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(mondayOffset + weekOffset * 7);

    const days: WeekDay[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const fullDate = format(date, 'yyyy-MM-dd');
      const slots = getFreeSlotsForDate(fullDate);
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
        isDisabled: isBefore(date, startOfDay(new Date())) || slots.length === 0,
        slots,
        totalSlots,
        availabilityTone,
      };
    });

    const monthLabel = format(days[3] ? parseISO(days[3].fullDate) : startOfWeek, 'MMMM yyyy', { locale: fr });

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
      className: 'bg-[#fee2e2] text-[#b91c1c]',
    },
  };

  const updateField = (field: keyof BookingData, value: string) => {
    setBookingData((current) => ({ ...current, [field]: value }));
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setBookingData((current) => ({ ...current, date: '', time: '' }));
    setStep(1);
  };

  const handleDateSelect = (fullDate: string) => {
    setBookingData((current) => ({ ...current, date: fullDate, time: '' }));
  };

  const handleTimeSelect = (time: string) => {
    setBookingData((current) => ({ ...current, time }));
    window.setTimeout(() => setStep(2), 140);
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

      const appointmentId = `SR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const magicToken = `${Math.random().toString(36).slice(2, 10).toUpperCase()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const startTime = `${bookingData.date}T${bookingData.time}:00`;
      const durationMatch = selectedService.duration.match(/\d+/);
      const duration = durationMatch ? Number(durationMatch[0]) : 60;
      const endTime = addMinutes(new Date(startTime), duration);
      const firstName = bookingData.firstName.trim();
      const lastName = bookingData.lastName.trim();
      const fullName = `${firstName} ${lastName}`.trim();
      const fullPhone = `${PHONE_PREFIXES[bookingData.phonePrefix]} ${bookingData.phone.trim()}`;
      const fullStreet = [bookingData.streetNum.trim(), bookingData.streetName.trim()].filter(Boolean).join(' ');

      await Promise.all([
        setDoc(doc(firestore, 'appointments', appointmentId), {
          id: appointmentId,
          clientId: finalUserId,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          startTime,
          endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
          status: 'confirmed',
          clientMessage: bookingData.note.trim(),
          firstName,
          lastName,
          clientNameSnapshot: fullName,
          clientEmail: bookingData.email.trim(),
          magicToken,
          phone: fullPhone,
          createdAt: serverTimestamp(),
        }),
        setDoc(
          doc(firestore, 'clients', finalUserId),
          {
            id: finalUserId,
            firstName,
            lastName,
            email: bookingData.email.trim(),
            phone: fullPhone,
            therapistNotes: '',
            loyaltySessionsCompleted: 0,
            isNextSessionFree: false,
            addressStreet: fullStreet,
            addressCity: bookingData.city.trim(),
            addressPostalCode: '',
            addressCountry: bookingData.country.trim(),
            addressCanton: bookingData.canton.trim(),
            dateOfBirth: '',
            magicToken,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        ),
        setDoc(doc(firestore, 'availability', appointmentId), {
          type: 'booked',
          date: bookingData.date,
          time: bookingData.time,
          appointmentId,
        }),
      ]);

      setBookingRef(appointmentId);
      setStep(4);
      toast({
        title: 'Rendez-vous confirmé',
        description: 'Votre réservation a bien été enregistrée.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message ?? 'Une erreur est survenue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !selectedService) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-5 backdrop-blur-xl"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-foreground/5 bg-background shadow-[0_40px_100px_-20px_rgba(21,32,35,0.2)] lg:grid-cols-[minmax(0,1fr)_22rem]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-booking-title"
      >
        <section className="max-h-[92vh] overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <span className="mono-caption text-[var(--sage-deep)] mb-3 block">— Réservation</span>
              <h2 id="landing-booking-title" className="display-tight text-3xl text-foreground md:text-4xl lg:text-5xl leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                {shortenServiceName(selectedService.name)}
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-foreground/50">{selectedService.price} CHF</span>
                <span className="h-1 w-1 rounded-full bg-foreground/10" />
                <span className="text-sm font-medium text-foreground/50">{selectedService.duration}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-white text-foreground shadow-sm transition-all duration-300 hover:bg-foreground hover:text-background active:scale-95"
              aria-label="Fermer la réservation"
            >
              <X size={20} />
            </button>
          </div>

          {/* New refined stepper */}
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

          {/* Editorial service selector */}
          <div className="mb-12">
            <span className="mono-caption text-[var(--sage-deep)] mb-5 block">— Choisir un autre soin</span>
            <div className="flex flex-wrap gap-2.5">
              {services.map((service) => {
                const isActive = service.id === selectedService.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceChange(service.id)}
                    className={`rounded-full px-5 py-2.5 text-xs font-bold tracking-tight uppercase whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'bg-foreground text-background shadow-lg shadow-foreground/10'
                        : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground'
                    }`}
                  >
                    {shortenServiceName(service.name)}
                  </button>
                );
              })}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between gap-4">
                <span className="mono-caption text-[var(--sage-deep)] uppercase tracking-[0.2em]">
                  {weekData.monthLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((value) => value - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-white text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
                    aria-label="Semaine précédente"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((value) => value + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-white text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
                    aria-label="Semaine suivante"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
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

              {selectedDay ? (
                <div className="space-y-4 pt-4 border-t border-foreground/5 animate-in fade-in duration-700">
                  <span className="mono-caption text-[var(--sage-deep)] block">
                    — Horaires disponibles le {formattedDate}
                  </span>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                    {selectedDay.slots.map((slot) => {
                      const isActive = bookingData.time === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={`min-h-12 rounded-2xl border text-xs font-bold tracking-tight transition-all duration-300 ${
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
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-foreground/10 bg-foreground/[0.02] px-6 py-10 text-center">
                  <p className="text-sm text-foreground/40 italic font-serif">
                    Choisissez une date pour révéler les créneaux disponibles.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
              onSubmit={(event) => {
                event.preventDefault();
                setStep(3);
              }}
            >
              <span className="mono-caption text-[var(--sage-deep)] block">— Vos informations</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Prénom</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Nom</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                    placeholder="Dupont"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Téléphone</label>
                  <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3">
                    <select
                      className="min-h-16 rounded-[1.5rem] border border-foreground/5 bg-white px-5 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20"
                      value={bookingData.phonePrefix}
                      onChange={(event) => updateField('phonePrefix', event.target.value as BookingData['phonePrefix'])}
                    >
                      <option value="CH">CH +41</option>
                      <option value="FR">FR +33</option>
                      <option value="BE">BE +32</option>
                    </select>
                    <input
                      className="min-h-16 rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                      type="tel"
                      value={bookingData.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      placeholder="079 000 00 00"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Email</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    type="email"
                    value={bookingData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="jean.dupont@email.com"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_2fr] pt-4">
                <button
                  className="min-h-14 rounded-full border border-foreground/10 bg-white px-8 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background"
                  type="button"
                  onClick={() => setStep(1)}
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

          {step === 3 && (
            <form className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={submitBooking}>
              <span className="mono-caption text-[var(--sage-deep)] block">— Adresse et notes</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">N°</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.streetNum}
                    onChange={(event) => updateField('streetNum', event.target.value)}
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Rue</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.streetName}
                    onChange={(event) => updateField('streetName', event.target.value)}
                    placeholder="Rue du Simplon"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Ville</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    placeholder="Genève"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Canton</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02]"
                    value={bookingData.canton}
                    onChange={(event) => updateField('canton', event.target.value)}
                    placeholder="GE"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Pays</label>
                  <input
                    className="min-h-16 w-full rounded-[1.5rem] border border-foreground/5 bg-white px-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20"
                    value={bookingData.country}
                    onChange={(event) => updateField('country', event.target.value)}
                    placeholder="Suisse"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-4">Notes (facultatif)</label>
                  <textarea
                    className="min-h-32 w-full rounded-[1.5rem] border border-foreground/5 bg-white p-6 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.02] resize-none"
                    value={bookingData.note}
                    onChange={(event) => updateField('note', event.target.value)}
                    placeholder="Précisions pour le thérapeute..."
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-foreground/5 bg-foreground/[0.02] p-6 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-foreground/40">Soin sélectionné</span>
                  <span className="text-foreground">{shortenServiceName(selectedService.name)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-foreground/40">Date et heure</span>
                  <span className="text-foreground">{formattedDate} · {bookingData.time}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                <button
                  className="min-h-14 rounded-full border border-foreground/10 bg-white px-8 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Retour
                </button>
                <button
                  className="min-h-14 rounded-full bg-foreground px-8 text-xs font-bold uppercase tracking-widest text-background transition-all hover:brightness-110 disabled:opacity-40"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Confirmation en cours...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
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

        <aside className="hidden border-l border-foreground/5 bg-foreground/[0.02] lg:flex lg:flex-col">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {selectedService.image ? (
              <img
                src={selectedService.image}
                alt={selectedService.name}
                className="h-full w-full object-cover grayscale-[0.2] contrast-[1.1]"
              />
            ) : (
              <div className="h-full w-full bg-[var(--sage-deep)]/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-flex rounded-full bg-[var(--neon)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--off-black)]">
                {selectedService.duration}
              </span>
              <p className="mt-4 display-tight text-2xl text-foreground whitespace-nowrap truncate">
                {shortenServiceName(selectedService.name)}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-8">
            <span className="mono-caption text-[var(--sage-deep)] mb-6 block">— Résumé</span>
            <div className="space-y-5 border-t border-foreground/5 pt-6">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Prix</span>
                <strong className="text-sm font-bold text-foreground">{selectedService.price} CHF</strong>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Date</span>
                <strong className="text-sm font-bold text-foreground">{formattedDate || '--'}</strong>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Heure</span>
                <strong className="text-sm font-bold text-foreground">{bookingData.time || '--'}</strong>
              </div>
            </div>

            <p className="mt-auto text-xs leading-relaxed text-foreground/40 italic">
              Confirmation immédiate après validation. Un email récapitulatif vous sera envoyé.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
