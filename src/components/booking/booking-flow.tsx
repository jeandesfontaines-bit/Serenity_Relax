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
} from 'lucide-react';
import { useAuth, useFirestore, useUser } from '../../firebase/provider';
import { Service } from '../../lib/types';
import { toast } from '../../hooks/use-toast';

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

  if (bookingRef) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2c3e50]/25 p-4 backdrop-blur-xl">
        <div className="relative w-full max-w-2xl rounded-[32px] bg-white p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] md:p-14">
          <button
            type="button"
            onClick={closeBooking}
            className="absolute right-6 top-6 rounded-full p-3 text-[#6b7280] hover:bg-[#f5f4f1] hover:text-[#2c3e50]"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#edf3ef] text-[#435544]">
              <CheckCircle2 size={42} strokeWidth={1.6} />
            </div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#a89078]">
              Confirmation instantanée
            </p>
            <h2 className="mb-5 font-sans text-[34px] font-medium tracking-tight text-[#2c3e50] md:text-[42px]">
              Rendez-vous confirmé
            </h2>
            <p className="max-w-xl text-[15px] leading-relaxed text-[#6b7280]">
              Votre réservation pour {selectedService?.name} le{' '}
              {selectedDate && format(selectedDate, 'EEEE d MMMM', { locale: fr })} à {selectedTime}
              {' '}a bien été enregistrée.
            </p>

            <div className="mt-10 w-full max-w-md rounded-[24px] border border-[#ece9e4] bg-[#faf8f5] px-6 py-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9ca3af]">
                  Référence
                </span>
                <span className="text-sm font-semibold text-[#435544]">{bookingRef}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeBooking}
              className="mt-10 rounded-[18px] bg-[#2c3e50] px-8 py-4 text-sm font-semibold text-white hover:bg-[#435544]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#2c3e50]/25 p-4 backdrop-blur-xl md:items-center md:py-6"
      onClick={closeBooking}
    >
      <div
        className="relative my-auto w-full max-w-[1480px] overflow-hidden rounded-[32px] bg-[#fcfbf8] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeBooking}
          className="absolute right-5 top-5 z-20 rounded-full p-3 text-[#9ca3af] hover:bg-[#f7f5f2] hover:text-[#2c3e50]"
        >
          <X size={18} />
        </button>

        <div className="border-b border-[#efe9df] bg-white/80 px-5 py-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-[#a89078]">
                Serenity Relax Genève
              </span>
              <div className="flex items-center gap-3">
                <StepPill index={1} label="Soin" active={stage === 'service'} completed={stage === 'details'} />
                <StepPill index={2} label="Créneau & coordonnées" active={stage === 'details'} completed={false} />
              </div>
            </div>

            {stage === 'details' && !initialServiceId && (
              <button
                type="button"
                onClick={() => setStage('service')}
                className="inline-flex items-center gap-2 rounded-full border border-[#ece9e4] bg-white px-4 py-2 text-xs font-semibold text-[#6b7280] hover:border-[#d8d0c6] hover:text-[#2c3e50]"
              >
                <ArrowLeft size={14} />
                Changer de soin
              </button>
            )}
          </div>
        </div>

        {stage === 'service' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.48fr]">
            <div className="border-b border-[#efe9df] bg-[linear-gradient(180deg,#f8f4ee_0%,#fcfbf8_100%)] px-5 py-6 md:px-8 md:py-8 lg:border-b-0 lg:border-r">
              <div className="max-w-sm space-y-5">
                <span className="inline-flex items-center rounded-full bg-[#efe7da] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#a89078]">
                  Étape 1
                </span>
                <h2 className="font-sans text-[30px] font-medium tracking-tight text-[#2c3e50] md:text-[36px]">
                  Choisissez votre soin.
                </h2>
                <p className="text-[14px] leading-relaxed text-[#6b7280]">
                  Commencez par sélectionner le rituel qui correspond à votre besoin. Une fois le soin choisi, vous accédez directement au calendrier réel et au formulaire de réservation.
                </p>
                <div className="rounded-[24px] border border-[#ece5da] bg-white/80 p-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9ca3af]">
                    Ce qui suit ensuite
                  </p>
                  <div className="space-y-2 text-sm text-[#4b5563]">
                    <p>1. Sélection du soin</p>
                    <p>2. Choix de la date et de l’heure</p>
                    <p>3. Confirmation avec vos coordonnées</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 md:px-8 md:py-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    className="group overflow-hidden rounded-[22px] border border-[#ece9e4] bg-white text-left shadow-[0_20px_40px_-30px_rgba(0,0,0,0.18)] hover:border-[#d7c8b6]"
                  >
                    <div className="relative h-28 overflow-hidden bg-[#f3efe8] md:h-32">
                      {service.image ? (
                        <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#c3b7a8]">
                          <CalendarIcon size={34} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1d262f]/55 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#2c3e50]">
                          {service.duration}
                        </span>
                        <span className="rounded-full bg-[#2c3e50] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white">
                          {service.price} CHF
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <h3 className="line-clamp-2 font-sans text-[17px] font-medium leading-tight text-[#2c3e50]">
                        {service.name}
                      </h3>
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
                        {service.description}
                      </p>
                      <div className="pt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a89078]">
                        Choisir ce soin
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1.22fr_0.68fr]">
            <div className="border-b border-[#f0ece6] px-5 py-6 md:border-b-0 md:border-r md:px-8 md:py-8 lg:px-10">
              <header className="mb-6 pr-10 md:mb-8">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-[#a89078]">
                  Étape 2
                </span>
                <h2 className="font-sans text-[28px] font-medium tracking-tight text-[#2c3e50] md:text-[34px]">
                  {selectedService?.name}
                </h2>
                {selectedService && (
                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#6b7280]">
                    {selectedService.description}
                  </p>
                )}
              </header>

              <div className="rounded-[24px] border border-[#ece6dd] bg-white p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold capitalize tracking-tight text-[#2c3e50]">{monthLabel}</h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#b5aa9a]">
                      Disponibilités réelles
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="rounded-full border border-[#ece9e4] p-2 text-[#6b7280] hover:bg-[#f7f5f2] hover:text-[#2c3e50]"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="rounded-full border border-[#ece9e4] p-2 text-[#6b7280] hover:bg-[#f7f5f2] hover:text-[#2c3e50]"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-2 text-center">
                  {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((label, index) => (
                    <div
                      key={label}
                      className={`text-[10px] font-bold uppercase ${
                        index === 5 ? 'text-[#a89078]' : index === 6 ? 'text-[#d6b6b0]' : 'text-[#d1d5db]'
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
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
                        className={`aspect-square rounded-[18px] border px-1 py-2 text-center ${
                          isDisabled
                            ? 'cursor-not-allowed border-[#f1efeb] bg-[#faf8f5] opacity-25'
                            : isSelected
                              ? 'border-[#2c3e50] bg-[#2c3e50] text-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.25)]'
                              : 'border-[#f0ece6] text-[#2c3e50] hover:bg-[#f9f7f4]'
                        }`}
                      >
                        <span className={`block text-[9px] font-bold uppercase ${isSelected ? 'text-white/70' : 'text-[#9ca3af]'}`}>
                          {format(day, 'EEE', { locale: fr }).replace('.', '')}
                        </span>
                        <span className={`mt-1 block text-base font-semibold ${isSelected ? 'text-white' : isCurrentMonthDay ? 'text-[#2c3e50]' : 'text-[#c7c3bd]'}`}>
                          {format(day, 'd')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#ece9e4]" />
                  <p className="text-xs font-semibold italic text-[#9ca3af]">
                    {selectedDate
                      ? format(selectedDate, 'EEEE d MMMM', { locale: fr })
                      : 'Veuillez sélectionner une date'}
                  </p>
                  <span className="h-px flex-1 bg-[#ece9e4]" />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {(selectedDate ? freeSlots : []).map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleTimeSelect(slot)}
                        className={`rounded-[16px] border px-3 py-3 text-[11px] font-bold ${
                          isSelected
                            ? 'border-[#a89078] bg-[#a89078] text-white'
                            : 'border-[#ece9e4] bg-white text-[#2c3e50] hover:border-[#a89078]/40'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && freeSlots.length === 0 && (
                  <div className="rounded-[20px] border border-[#f0ece6] bg-[#faf8f5] px-5 py-6 text-center text-sm text-[#9ca3af]">
                    Aucun créneau disponible pour cette date.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,#faf9f7_0%,#f5f1eb_100%)] px-5 py-6 md:px-7 md:py-8">
              <div className="mb-6">
                <h3 className="font-sans text-2xl font-medium tracking-tight text-[#2c3e50]">
                  Vos informations
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#7b8088]">
                  Finalisez votre demande avec vos coordonnées et vérifiez le résumé avant validation.
                </p>
              </div>

              <form onSubmit={completeBooking} className="flex h-full flex-col">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      icon={User}
                      value={formData.firstName}
                      onChange={(value) => updateField('firstName', value)}
                      placeholder="Prénom"
                    />
                    <Field
                      icon={User}
                      value={formData.lastName}
                      onChange={(value) => updateField('lastName', value)}
                      placeholder="Nom"
                    />
                  </div>
                  <Field
                    icon={Mail}
                    type="email"
                    value={formData.email}
                    onChange={(value) => updateField('email', value)}
                    placeholder="Adresse email"
                  />
                  <Field
                    icon={Phone}
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => updateField('phone', value)}
                    placeholder="Téléphone"
                  />
                  <TextAreaField
                    icon={MessageCircle}
                    value={formData.message}
                    onChange={(value) => updateField('message', value)}
                    placeholder="Message ou précision utile"
                  />
                </div>

                <div className="mt-6 rounded-[24px] border border-[#e7dfd4] bg-white px-4 py-5 shadow-[0_15px_35px_-30px_rgba(0,0,0,0.2)]">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9ca3af]">
                      Votre réservation
                    </p>
                    {selectedService && (
                      <span className="rounded-full bg-[#f2ebe1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a89078]">
                        {selectedService.duration}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <SummaryRow label="Soin" value={selectedService?.name || '--'} />
                    <SummaryRow
                      label="Date"
                      value={selectedDate
                        ? format(selectedDate, 'EEEE d MMMM', { locale: fr })
                        : '--'}
                    />
                    <SummaryRow
                      label="Heure"
                      value={selectedTime || '--'}
                      accent
                    />
                    {selectedService && (
                      <SummaryRow
                        label="Tarif"
                        value={`${selectedService.price} CHF`}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full rounded-[18px] py-4 text-sm font-bold ${
                      isFormValid && !isSubmitting
                        ? 'bg-[#2c3e50] text-white shadow-[0_20px_40px_-20px_rgba(44,62,80,0.35)] hover:bg-[#435544]'
                        : 'cursor-not-allowed bg-[#d8d9dc] text-white'
                    }`}
                  >
                    {isSubmitting ? 'Confirmation...' : 'Confirmer le rendez-vous'}
                  </button>

                  <div className="mt-4 flex items-start gap-3 text-[10px] leading-relaxed text-[#9ca3af]">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#a89078]" />
                    <p>Confirmation instantanée par email après validation.</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepPill({
  index,
  label,
  active,
  completed,
}: {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] ${
        active
          ? 'border-[#2c3e50] bg-[#2c3e50] text-white'
          : completed
            ? 'border-[#d7c8b6] bg-[#f2ebe1] text-[#8f7a62]'
            : 'border-[#ece9e4] bg-white text-[#b1b6be]'
      }`}
    >
      <span>{index}</span>
      <span>{label}</span>
    </div>
  );
}

function Field({
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[16px] border border-[#ece9e4] bg-white px-4 py-4 shadow-sm">
      <Icon size={16} className="shrink-0 text-[#a89078]" />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#2c3e50] placeholder:text-[#b7bcc5] focus:outline-none"
      />
    </label>
  );
}

function TextAreaField({
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  icon: typeof MessageCircle;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex gap-3 rounded-[16px] border border-[#ece9e4] bg-white px-4 py-4 shadow-sm">
      <Icon size={16} className="mt-1 shrink-0 text-[#a89078]" />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none bg-transparent text-sm text-[#2c3e50] placeholder:text-[#b7bcc5] focus:outline-none"
      />
    </label>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9ca3af]">
        {label}
      </span>
      <span className={`text-right text-xs font-bold ${accent ? 'text-[#a89078]' : 'text-[#2c3e50]'}`}>
        {value}
      </span>
    </div>
  );
}
