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
        className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-[#fcfaf6] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1fr)_21rem]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-booking-title"
      >
        <section className="max-h-[92vh] overflow-y-auto px-5 py-5 md:px-8 md:py-7">
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.34em] text-[#9d8b75]">
                Reservation
              </span>
              <h2 id="landing-booking-title" className="text-[clamp(1.85rem,4vw,3.2rem)] font-semibold italic tracking-[-0.05em] text-[#151515]">
                {shortenServiceName(selectedService.name)}
              </h2>
              <p className="mt-2 text-sm text-[#6f675d]">
                {selectedService.price} CHF · {selectedService.duration}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/75 text-[#151515] transition hover:border-black/30"
              aria-label="Fermer la réservation"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className={`h-1 rounded-full transition ${
                  step >= item ? 'bg-[#151515]' : 'bg-[#e7e0d6]'
                }`}
              />
            ))}
          </div>

          <div className="mb-6 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {services.map((service) => {
                const isActive = service.id === selectedService.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceChange(service.id)}
                    className={`rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] transition ${
                      isActive
                        ? 'bg-[#151515] text-white'
                        : 'bg-white text-[#6f675d] ring-1 ring-black/10 hover:text-[#151515]'
                    }`}
                  >
                    {shortenServiceName(service.name)}
                  </button>
                );
              })}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9d8b75]">
                  {weekData.monthLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((value) => value - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#151515] transition hover:border-black/30"
                    aria-label="Semaine précédente"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((value) => value + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#151515] transition hover:border-black/30"
                    aria-label="Semaine suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekData.days.map((day) => {
                  const isActive = bookingData.date === day.fullDate;
                  const availabilityMeta = AVAILABILITY_META[day.availabilityTone];

                  return (
                    <button
                      key={day.fullDate}
                      type="button"
                      disabled={day.isDisabled}
                      onClick={() => handleDateSelect(day.fullDate)}
                      className={`flex min-h-[7rem] flex-col items-center justify-center rounded-[1.1rem] border px-1 text-center transition ${
                        day.isDisabled
                          ? 'cursor-not-allowed border-transparent bg-[#efebe4] text-[#c3bbb0] opacity-60'
                          : isActive
                            ? 'border-[#151515] bg-[#151515] text-white'
                            : 'border-black/5 bg-white text-[#6f675d] hover:border-black/20 hover:text-[#151515]'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                        {day.dayLabel}
                      </span>
                      <span className="mt-1 text-[15px] font-semibold italic">{day.dayNumber}</span>
                      <span
                        className={`mt-2 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${
                          isActive ? 'bg-white/18 text-white' : availabilityMeta.className
                        }`}
                      >
                        {availabilityMeta.label}
                      </span>
                      <span className={`mt-1 text-[10px] font-semibold ${isActive ? 'text-white/78' : 'text-[#9d8b75]'}`}>
                        {day.slots.length}/{day.totalSlots || day.slots.length} créneaux
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDay ? (
                <div className="space-y-3">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9d8b75]">
                    Horaires disponibles
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {selectedDay.slots.map((slot) => {
                      const isActive = bookingData.time === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={`min-h-12 rounded-[1rem] border text-[12px] font-extrabold tracking-[0.14em] transition ${
                            isActive
                              ? 'border-[#151515] bg-[#151515] text-white'
                              : 'border-transparent bg-[#efebe4] text-[#6f675d] hover:border-black/15 hover:text-[#151515]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-black/10 bg-white/60 px-5 py-6 text-sm text-[#8c847a]">
                  Choisissez un jour disponible pour afficher les horaires réels.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setStep(3);
              }}
            >
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9d8b75]">
                Vos informations
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                  value={bookingData.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder="Prénom"
                />
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                  value={bookingData.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  placeholder="Nom"
                />
                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 sm:col-span-2">
                  <select
                    className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                    value={bookingData.phonePrefix}
                    onChange={(event) => updateField('phonePrefix', event.target.value as BookingData['phonePrefix'])}
                  >
                    <option value="CH">CH +41</option>
                    <option value="FR">FR +33</option>
                    <option value="BE">BE +32</option>
                  </select>
                  <input
                    className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                    type="tel"
                    value={bookingData.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="Portable"
                  />
                </div>
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25 sm:col-span-2"
                  type="email"
                  value={bookingData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="Email"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_1.8fr]">
                <button
                  className="min-h-12 rounded-full bg-[#ece7de] px-5 text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#6f675d] transition hover:text-[#151515]"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Retour
                </button>
                <button
                  className="min-h-12 rounded-full bg-[#151515] px-5 text-[11px] font-extrabold uppercase tracking-[0.26em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                  type="submit"
                  disabled={!canContinueInfo}
                >
                  Suivant
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-5" onSubmit={submitBooking}>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9d8b75]">
                Adresse et notes
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                  value={bookingData.streetNum}
                  onChange={(event) => updateField('streetNum', event.target.value)}
                  placeholder="N°"
                />
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                  value={bookingData.streetName}
                  onChange={(event) => updateField('streetName', event.target.value)}
                  placeholder="Rue"
                />
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                  value={bookingData.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Ville"
                />
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25"
                  value={bookingData.canton}
                  onChange={(event) => updateField('canton', event.target.value)}
                  placeholder="Canton"
                />
                <input
                  className="min-h-14 rounded-[1rem] border border-transparent bg-white px-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25 sm:col-span-2"
                  value={bookingData.country}
                  onChange={(event) => updateField('country', event.target.value)}
                  placeholder="Pays"
                />
                <textarea
                  className="min-h-28 rounded-[1rem] border border-transparent bg-white px-4 py-4 text-sm font-semibold text-[#151515] outline-none ring-1 ring-black/5 transition focus:ring-black/25 sm:col-span-2"
                  value={bookingData.note}
                  onChange={(event) => updateField('note', event.target.value)}
                  placeholder="Notes (facultatif)"
                />
              </div>

              <div className="rounded-[1.35rem] border border-black/5 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3 text-[11px] font-extrabold uppercase tracking-[0.22em]">
                  <span className="text-[#9d8b75]">Soin</span>
                  <strong className="text-right text-[#151515]">{shortenServiceName(selectedService.name)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-extrabold uppercase tracking-[0.22em]">
                  <span className="text-[#9d8b75]">Créneau</span>
                  <strong className="text-right text-[#151515]">
                    {formattedDate} · {bookingData.time}
                  </strong>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_1.8fr]">
                <button
                  className="min-h-12 rounded-full bg-[#ece7de] px-5 text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#6f675d] transition hover:text-[#151515]"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Retour
                </button>
                <button
                  className="min-h-12 rounded-full bg-[#151515] px-5 text-[11px] font-extrabold uppercase tracking-[0.26em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Confirmation...' : 'Confirmer'}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#151515] text-white">
                <Check size={30} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-semibold uppercase tracking-[-0.05em] text-[#151515]">
                C&apos;est validé.
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6f675d]">
                À bientôt au studio{bookingData.firstName ? `, ${bookingData.firstName}` : ''}. Votre rendez-vous a bien été enregistré.
              </p>
              {bookingRef && (
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9d8b75]">
                  Référence {bookingRef}
                </p>
              )}
              <button
                className="mt-8 min-h-12 rounded-full bg-[#151515] px-8 text-[11px] font-extrabold uppercase tracking-[0.26em] text-white transition hover:bg-black"
                type="button"
                onClick={onClose}
              >
                Fermer
              </button>
            </div>
          )}
        </section>

        <aside className="hidden border-l border-black/5 bg-[#f2ede5] lg:flex lg:flex-col">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {selectedService.image ? (
              <img
                src={selectedService.image}
                alt={selectedService.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#e7dfd2]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#151515]">
                {selectedService.duration}
              </span>
              <p className="mt-3 text-2xl font-semibold italic leading-tight text-white">
                {shortenServiceName(selectedService.name)}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-7">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9d8b75]">
              Résumé
            </span>
            <div className="mt-4 space-y-4 border-t border-black/5 pt-4">
              <div className="flex items-start justify-between gap-4 text-[11px] font-extrabold uppercase tracking-[0.22em]">
                <span className="text-[#9d8b75]">Prix</span>
                <strong className="text-right text-[#151515]">{selectedService.price} CHF</strong>
              </div>
              <div className="flex items-start justify-between gap-4 text-[11px] font-extrabold uppercase tracking-[0.22em]">
                <span className="text-[#9d8b75]">Date</span>
                <strong className="text-right text-[#151515]">{formattedDate || '--'}</strong>
              </div>
              <div className="flex items-start justify-between gap-4 text-[11px] font-extrabold uppercase tracking-[0.22em]">
                <span className="text-[#9d8b75]">Heure</span>
                <strong className="text-right text-[#151515]">{bookingData.time || '--'}</strong>
              </div>
            </div>

            <p className="mt-auto text-sm leading-relaxed text-[#6f675d]">
              Chaque réservation passe par les disponibilités réelles du cabinet et crée directement le rendez-vous confirmé.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
