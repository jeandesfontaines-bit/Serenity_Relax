"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signInAnonymously } from "firebase/auth";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Navbar from "./Navbar";
import { SERVICES } from "./data";
import { useAuth, useFirestore, useUser } from "@/firebase";
import type { Service } from "@/lib/types";

type BookingData = {
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phonePrefix: "CH" | "FR" | "BE";
  phone: string;
  email: string;
  streetName: string;
  streetNum: string;
  postalCode: string;
  city: string;
  canton: string;
  country: string;
  notes: string;
  acceptedTerms: boolean;
  wantsNewsletter: boolean;
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

type BookingService = Service & {
  tag?: string;
  displayTag?: string;
  displayDuration?: string;
};

const EMPTY_BOOKING_DATA: BookingData = {
  date: "",
  time: "",
  firstName: "",
  lastName: "",
  phonePrefix: "CH",
  phone: "",
  email: "",
  streetName: "",
  streetNum: "",
  postalCode: "",
  city: "Genève",
  canton: "Genève",
  country: "Suisse",
  notes: "",
  acceptedTerms: false,
  wantsNewsletter: false,
};

const PHONE_PREFIXES: Record<BookingData["phonePrefix"], string> = {
  CH: "+41",
  FR: "+33",
  BE: "+32",
};

function BookingSummaryCard({
  service,
  bookingData,
  actionLabel,
  actionForm,
  actionDisabled,
  actionLoading,
  footerText,
}: {
  service: BookingService | null;
  bookingData: BookingData;
  actionLabel?: string;
  actionForm?: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  footerText?: string;
}) {
  if (!service) return null;

  const formattedDate = bookingData.date
    ? format(parseISO(bookingData.date), "d MMM yyyy", { locale: fr })
    : "À définir";

  return (
    <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          {(service.displayTag || service.tag) ? (
            <div className="landing-type-caption inline-flex rounded-full bg-[var(--landing-tint-fill)] px-3 py-1 font-bold uppercase tracking-[0.18em] text-[var(--landing-warm-muted)]">
              {service.displayTag || service.tag}
            </div>
          ) : null}
          <h3 className="landing-type-h3 text-[var(--off-black)]">{service.name}</h3>
        </div>
        <div className="text-right">
          <div className="landing-type-h5 text-[var(--off-black)]">{service.price} CHF</div>
          <div className="landing-type-caption mt-1 font-bold uppercase tracking-[0.14em] text-[var(--landing-muted)]">
            {service.displayDuration || service.duration}
          </div>
        </div>
      </div>

      <p className="landing-type-body-s leading-relaxed text-[var(--landing-body)]">
        {service.description}
      </p>

      <div className="mt-5 border-t border-[var(--landing-tint-soft)] pt-4">
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="landing-type-body-s flex items-center gap-3 font-medium text-[var(--landing-muted)]">
            <CalendarIcon size={16} />
            <span>Date</span>
          </div>
          <div className="landing-type-body-s font-bold text-[var(--off-black)]">{formattedDate}</div>
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="landing-type-body-s flex items-center gap-3 font-medium text-[var(--landing-muted)]">
            <Clock size={16} />
            <span>Heure</span>
          </div>
          <div className="landing-type-body-s font-bold text-[var(--off-black)]">
            {bookingData.time || "Choisir un créneau"}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 border-t border-[var(--landing-tint-soft)] pt-4">
          <Banknote size={16} className="text-[var(--landing-muted)]" />
          <span className="landing-type-body-s font-medium text-[var(--landing-muted)]">Paiement sur place</span>
        </div>
      </div>

      {actionLabel ? (
        <button
          type="submit"
          form={actionForm}
          disabled={actionDisabled}
          className="landing-type-body mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[1rem] bg-[var(--teal-deep)] px-5 text-white transition-colors hover:bg-[#2b3a32] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {actionLoading ? "Confirmation..." : actionLabel}
        </button>
      ) : null}

      {footerText ? (
        <p className="landing-type-caption mt-4 text-center text-[var(--landing-muted)]">{footerText}</p>
      ) : null}
    </div>
  );
}

export default function BookingPageExperience({ initialServiceId }: { initialServiceId?: string }) {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();

  const services = useMemo<BookingService[]>(
    () =>
      SERVICES.map((service) => ({
        id: service.id,
        name: service.displayName || service.name,
        description: service.desc,
        duration: service.duration,
        price: service.price,
        image: service.image,
        tag: service.tag,
        displayTag: service.displayTag,
        displayDuration: service.displayDuration,
      })),
    [],
  );

  const [step, setStep] = useState(initialServiceId ? 2 : 1);
  const [selectedService, setSelectedService] = useState<BookingService | null>(
    services.find((service) => service.id === initialServiceId) ?? services[0] ?? null,
  );
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>(EMPTY_BOOKING_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(startOfDay(new Date())));
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [configSlots, setConfigSlots] = useState<Record<number, string[]>>({
    0: [],
    1: ["11:00", "13:30", "15:00", "16:30", "18:00"],
    2: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    3: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    4: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    5: ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"],
    6: ["09:00", "10:30", "12:00"],
  });

  useEffect(() => {
    if (!firestore) return;

    const unsubAvail = onSnapshot(collection(firestore, "availability"), (snapshot) => {
      setAvailableSlots(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as AvailabilitySlot));
    });

    const unsubConfig = onSnapshot(doc(firestore, "config", "slots"), (snapshot) => {
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
    if (!initialServiceId) return;
    const initial = services.find((service) => service.id === initialServiceId);
    if (initial) {
      setSelectedService(initial);
      setStep(2);
    }
  }, [initialServiceId, services]);

  const getFreeSlotsForDate = (fullDate: string) => {
    const date = parseISO(fullDate);
    const dayOfWeek = date.getDay();
    const configuredSlots = configSlots[dayOfWeek] ?? [];
    const dayAvailability = availableSlots.find((slot) => slot.id === fullDate);
    const blockedSlots = dayAvailability?.blockedSlots ?? [];

    if (dayAvailability?.closed) {
      return [];
    }

    return configuredSlots.filter(
      (time) =>
        !blockedSlots.includes(time) &&
        !availableSlots.some(
          (slot) =>
            slot.date === fullDate &&
            slot.time === time &&
            (slot.type === "blocked" || slot.type === "booked"),
        ),
    );
  };

  const bookingWindowStart = useMemo(() => startOfDay(new Date()), []);
  const availableDates = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => format(addDays(bookingWindowStart, index), "yyyy-MM-dd")).filter(
        (date) => getFreeSlotsForDate(date).length > 0,
      ),
    [availableSlots, bookingWindowStart, configSlots],
  );

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  const selectedSlots = useMemo(
    () => (bookingData.date ? getFreeSlotsForDate(bookingData.date) : []),
    [availableSlots, bookingData.date, configSlots],
  );

  const lastAvailableMonth = useMemo(() => {
    if (availableDates.length === 0) return startOfMonth(bookingWindowStart);
    return startOfMonth(parseISO(availableDates[availableDates.length - 1]));
  }, [availableDates, bookingWindowStart]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const isCurrentMonth = isSameMonth(date, visibleMonth);
      const isPast = isBefore(date, bookingWindowStart);
      const isAvailable = !isPast && isCurrentMonth && availableDateSet.has(dateStr);

      return {
        date,
        dateStr,
        dayNumber: format(date, "d"),
        isCurrentMonth,
        isPast,
        isAvailable,
        isSelected: bookingData.date === dateStr,
      };
    });
  }, [availableDateSet, bookingData.date, bookingWindowStart, visibleMonth]);

  const visibleAvailableDays = useMemo(
    () => calendarDays.filter((day) => day.isCurrentMonth && day.isAvailable),
    [calendarDays],
  );

  const canSubmit = Boolean(
    selectedService &&
      bookingData.date &&
      bookingData.time &&
      bookingData.firstName.trim() &&
      bookingData.lastName.trim() &&
      bookingData.phone.trim() &&
      bookingData.email.includes("@") &&
      bookingData.streetName.trim() &&
      bookingData.streetNum.trim() &&
      bookingData.postalCode.trim() &&
      bookingData.city.trim() &&
      bookingData.acceptedTerms,
  );

  const updateField = (field: keyof BookingData, value: string | boolean) => {
    setBookingData((current) => ({ ...current, [field]: value }));
  };

  const fieldShellClassName =
    "rounded-[1rem] border border-[var(--landing-tint)] bg-white transition-colors focus-within:border-[var(--teal-deep)]";
  const inputClassName =
    "landing-type-body h-14 w-full bg-transparent px-4 text-[var(--off-black)] outline-none placeholder:text-[var(--landing-muted)]";

  useEffect(() => {
    if (!bookingData.date) return;
    setVisibleMonth(startOfMonth(parseISO(bookingData.date)));
  }, [bookingData.date]);

  useEffect(() => {
    if (bookingData.date || availableDates.length === 0 || step !== 2) return;
    setVisibleMonth(startOfMonth(parseISO(availableDates[0])));
  }, [availableDates, bookingData.date, step]);

  const handleBack = () => {
    router.push("/");
  };

  const handleConfirm = async () => {
    if (!firestore || !selectedService || !canSubmit) return;

    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;
      if (!finalUserId) {
        const credential = await signInAnonymously(auth);
        finalUserId = credential.user.uid;
      }

      if (!finalUserId) {
        throw new Error("Impossible d'établir une session sécurisée.");
      }

      const firstName = bookingData.firstName.trim();
      const lastName = bookingData.lastName.trim();
      const fullName = `${firstName} ${lastName}`.trim();
      const magicToken = `${Math.random().toString(36).slice(2, 10).toUpperCase()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const fullPhone = `${PHONE_PREFIXES[bookingData.phonePrefix]} ${bookingData.phone.trim()}`;
      const fullAddress = `${bookingData.streetName.trim()} ${bookingData.streetNum.trim()}, ${bookingData.postalCode.trim()} ${bookingData.city.trim()}, ${bookingData.country.trim()}`;

      const startTime = `${bookingData.date}T${bookingData.time}:00`;
      const durationMatch = selectedService.duration.match(/\d+/);
      const duration = durationMatch ? Number(durationMatch[0]) : 60;
      const endTimeDate = new Date(new Date(startTime).getTime() + duration * 60000);
      const endTimeStr = format(endTimeDate, "yyyy-MM-dd'T'HH:mm:ss");

      const appointmentRef = await addDoc(collection(firestore, "appointments"), {
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
        status: "confirmed",
        paid: false,
        clientMessage: bookingData.notes.trim(),
        createdAt: serverTimestamp(),
      });

      const appointmentId = appointmentRef.id;

      await setDoc(
        doc(firestore, "clients", finalUserId),
        {
          id: finalUserId,
          firstName,
          lastName,
          email: bookingData.email.trim(),
          phone: fullPhone,
          addressStreet: `${bookingData.streetName.trim()} ${bookingData.streetNum.trim()}`.trim(),
          addressCity: bookingData.city.trim(),
          addressPostalCode: bookingData.postalCode.trim(),
          addressCountry: bookingData.country.trim(),
          addressCanton: bookingData.canton.trim(),
          marketingOptIn: bookingData.wantsNewsletter,
          magicToken,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await addDoc(collection(firestore, "invoices"), {
        appointmentId,
        clientId: finalUserId,
        clientNameSnapshot: fullName,
        invoiceNumber: `INV-${format(new Date(), "yyyyMMdd")}-${appointmentId.slice(-4).toUpperCase()}`,
        date: bookingData.date,
        issueDate: format(new Date(), "yyyy-MM-dd"),
        dueDate: bookingData.date,
        amount: selectedService.price,
        totalAmount: selectedService.price,
        status: "Pending",
        serviceName: selectedService.name,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(firestore, "availability", appointmentId), {
        type: "booked",
        date: bookingData.date,
        time: bookingData.time,
        appointmentId,
      });

      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            clientName: fullName,
            clientEmail: bookingData.email.trim(),
            clientPhone: fullPhone,
            clientAddress: fullAddress,
            clientNotes: bookingData.notes.trim(),
            serviceName: selectedService.name,
            startTime,
            duration: selectedService.duration,
            magicToken,
            clientId: finalUserId,
          }),
        });
      } catch (err) {
        console.error("Failed to send notification:", err);
      }

      setBookingRef(appointmentId);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(error?.message ?? "Une erreur est survenue lors de la réservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="landing-v2 min-h-screen" style={{ background: "var(--landing-page-bg)" }}>
        <Navbar />
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center p-6 text-center">
          <div className="mx-auto max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white"
            >
              <CheckCircle2 size={20} />
            </motion.div>
            <h2 className="landing-type-h3 display-tight text-neutral-900">Demande envoyée</h2>
            <p className="mx-auto mt-2 max-w-xs text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              João reviendra vers vous très vite par message.
            </p>
            {bookingRef ? (
              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-300">{bookingRef}</p>
            ) : null}
            <button
              onClick={handleBack}
              className="mt-7 rounded-full bg-neutral-900 px-5 py-3 text-[8px] font-black uppercase tracking-[0.28em] text-white"
            >
              Retour au site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-v2 min-h-screen overflow-hidden landing-text-high" style={{ background: "var(--landing-page-bg)" }}>
      <Navbar />

      <div className="flex min-h-[calc(100vh-72px)] flex-col">
        <nav className="shrink-0 border-b border-[var(--landing-divider)] px-6 py-3">
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between md:px-4">
            <button
              onClick={() => {
                if (step === 1) {
                  handleBack();
                  return;
                }
                setStep((current) => Math.max(1, current - 1));
              }}
              className="landing-type-caption inline-flex items-center gap-2 text-[var(--landing-muted)] transition-colors hover:text-[var(--off-black)]"
            >
              <ArrowLeft size={10} />
              Retour
            </button>

            <div className="flex gap-1">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-0.5 w-6 rounded-full transition-all duration-500 ${
                    step >= item ? "bg-[var(--teal-deep)]" : "bg-[var(--landing-tint)]"
                  }`}
                />
              ))}
            </div>

            <div className="w-10" />
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto px-6 py-12 md:px-10 md:py-14 lg:px-12 lg:py-6">
          <div className="mx-auto w-full max-w-[1280px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-14 text-center"
                >
                  <div className="space-y-3 pt-10 md:pt-14">
                    <p className="landing-type-caption text-[var(--landing-warm-muted)]">Étape 01</p>
                    <h2 className="landing-type-h2 display-tight">
                      Choisir un soin
                    </h2>
                    <p className="landing-type-body-s landing-text-body mx-auto max-w-xl">
                      Une sélection directe, sans détour. Choisissez le soin puis passez immédiatement aux créneaux.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedService(service);
                          updateField("date", "");
                          updateField("time", "");
                          setStep(2);
                        }}
                        className={`group rounded-[1.85rem] border bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(48,31,16,0.1)] ${
                          selectedService?.id === service.id
                            ? "border-[var(--teal-deep)] shadow-[0_22px_50px_rgba(21,56,57,0.14)]"
                            : "border-[var(--landing-tint)] hover:border-[var(--teal-deep)]"
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              {(service.displayTag || service.tag) ? (
                                <span className="landing-type-caption inline-flex rounded-full bg-[var(--landing-tint-fill)] px-2.5 py-1 font-bold uppercase tracking-[0.16em] text-[var(--landing-warm-muted)]">
                                  {service.displayTag || service.tag}
                                </span>
                              ) : null}
                              <h3 className="landing-type-h5 max-w-[14ch]">{service.name}</h3>
                            </div>
                            <span className="landing-type-caption shrink-0 text-[var(--landing-warm-muted)]">
                              {service.price} CHF
                            </span>
                          </div>
                          <div className="landing-type-caption font-bold uppercase tracking-[0.14em] text-[var(--landing-muted)]">
                            {service.displayDuration || service.duration}
                          </div>
                          <p className="landing-type-body-s text-[var(--landing-body)]">
                            {service.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-auto max-w-[1160px]"
                >
                  <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
                    <section className="min-w-0 flex-1 space-y-6">
                      <div className="space-y-3">
                        <div className="landing-type-caption inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--orange)_15%,transparent)] px-4 py-2 font-bold uppercase tracking-[0.12em] text-[var(--orange)]">
                          <CalendarDays size={14} />
                          Étape 2 sur 3
                        </div>
                        <div className="space-y-2">
                          <h2 className="landing-type-h3 display-tight text-[var(--landing-display-dark)]">
                            Quand souhaitez-vous venir ?
                          </h2>
                          <p className="landing-type-body-s landing-text-body max-w-xl">
                            Choisissez une date, puis une heure.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="landing-type-h5 capitalize text-[var(--off-black)]">
                            {format(visibleMonth, "LLLL yyyy", { locale: fr })}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              aria-label="Mois précédent"
                              disabled={startOfMonth(visibleMonth).getTime() <= startOfMonth(bookingWindowStart).getTime()}
                              onClick={() => setVisibleMonth((current) => subMonths(current, 1))}
                              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--landing-tint)] bg-white text-[var(--off-black)] transition-colors hover:bg-[var(--landing-tint-fill)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Mois suivant"
                              disabled={startOfMonth(visibleMonth).getTime() >= lastAvailableMonth.getTime()}
                              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--landing-tint)] bg-white text-[var(--off-black)] transition-colors hover:bg-[var(--landing-tint-fill)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 border-b border-[var(--landing-tint-soft)] pb-5">
                          {visibleAvailableDays.length > 0 ? (
                            <div className="-mx-1 overflow-x-auto pb-1">
                              <div className="flex min-w-max gap-2 px-1">
                                {visibleAvailableDays.map((day) => (
                                  <button
                                    key={day.dateStr}
                                    type="button"
                                    onClick={() => {
                                      updateField("date", day.dateStr);
                                      updateField("time", "");
                                    }}
                                    className={`flex w-[86px] shrink-0 flex-col rounded-[1rem] border px-3 py-3 text-left transition-all ${
                                      day.isSelected
                                        ? "border-[var(--teal-deep)] bg-[var(--teal-deep)] text-white"
                                        : "border-[var(--landing-tint)] bg-white text-[var(--off-black)] hover:border-[var(--teal-deep)]"
                                    }`}
                                  >
                                    <span className={`landing-type-caption ${day.isSelected ? "text-white/72" : "text-[var(--landing-muted)]"}`}>
                                      {format(day.date, "EEE", { locale: fr }).replace(".", "")}
                                    </span>
                                    <span className="landing-type-h4 mt-1 leading-none">{day.dayNumber}</span>
                                    <span className={`landing-type-caption mt-1 ${day.isSelected ? "text-white/72" : "text-[var(--landing-warm-muted)]"}`}>
                                      {format(day.date, "MMM", { locale: fr })}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="landing-type-body-s text-[var(--landing-muted)]">
                              Aucun jour disponible sur ce mois.
                            </p>
                          )}
                        </div>

                        <div className="pt-5">
                          <div className="mb-3 flex items-center gap-2">
                            <Clock size={16} className="text-[var(--orange)]" />
                            <h3 className="landing-type-body text-[var(--off-black)]">
                              {bookingData.date
                                ? format(parseISO(bookingData.date), "EEEE d MMMM", { locale: fr })
                                : "Créneaux disponibles"}
                            </h3>
                          </div>

                          {bookingData.date ? (
                            selectedSlots.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {selectedSlots.map((time) => {
                                  const isSelected = bookingData.time === time;
                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => {
                                        updateField("time", time);
                                        window.setTimeout(() => setStep(3), 120);
                                      }}
                                      className={`landing-type-body rounded-[1rem] border px-4 py-3 transition-colors ${
                                        isSelected
                                          ? "border-[var(--teal-deep)] bg-[var(--teal-deep)] text-white"
                                          : "border-[var(--landing-tint)] bg-white text-[var(--off-black)] hover:border-[var(--teal-deep)]"
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="landing-type-body-s text-[var(--landing-muted)]">
                                Aucun créneau libre pour ce jour.
                              </p>
                            )
                          ) : (
                            <p className="landing-type-caption text-[var(--landing-muted)]">
                              Choisissez une date pour faire apparaître les heures disponibles.
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <aside className="w-full shrink-0 md:sticky md:top-24 md:w-[320px]">
                      <BookingSummaryCard
                        service={selectedService}
                        bookingData={bookingData}
                        footerText="Vous ne serez pas débité à cette étape."
                      />
                    </aside>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-auto max-w-[1160px]"
                >
                  <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
                    <section className="min-w-0 flex-1 space-y-6">
                      <div className="space-y-3">
                        <div className="landing-type-caption inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--orange)_15%,transparent)] px-4 py-2 font-bold uppercase tracking-[0.12em] text-[var(--orange)]">
                          <User size={14} />
                          Étape 3 sur 3
                        </div>
                        <div className="space-y-2">
                          <h2 className="landing-type-h3 display-tight text-[var(--landing-display-dark)]">
                            Vos coordonnées
                          </h2>
                          <p className="landing-type-body-s landing-text-body max-w-xl">
                            Paiement sur place.
                          </p>
                        </div>
                      </div>

                      <form
                        id="booking-contact-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void handleConfirm();
                        }}
                        className="space-y-4 rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] sm:p-6"
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <div className={fieldShellClassName}>
                              <input
                                id="booking-first-name"
                                value={bookingData.firstName}
                                onChange={(e) => updateField("firstName", e.target.value)}
                                className={inputClassName}
                                placeholder="Prénom"
                                autoComplete="given-name"
                              />
                            </div>
                          </div>
                          <div>
                            <div className={fieldShellClassName}>
                              <input
                                id="booking-last-name"
                                value={bookingData.lastName}
                                onChange={(e) => updateField("lastName", e.target.value)}
                                className={inputClassName}
                                placeholder="Nom"
                                autoComplete="family-name"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className={`${fieldShellClassName} flex items-center gap-3 px-4`}>
                            <Mail size={18} className="text-[var(--landing-muted)]" />
                            <input
                              id="booking-email"
                              value={bookingData.email}
                              onChange={(e) => updateField("email", e.target.value)}
                              className="landing-type-body h-14 w-full bg-transparent text-[var(--off-black)] outline-none placeholder:text-[var(--landing-muted)]"
                              placeholder="Adresse e-mail"
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        <div>
                          <div className={`${fieldShellClassName} flex items-center overflow-hidden`}>
                            <select
                              aria-label="Indicatif pays"
                              value={bookingData.phonePrefix}
                              onChange={(e) => updateField("phonePrefix", e.target.value)}
                              className="landing-type-body h-14 shrink-0 border-r border-[var(--landing-tint)] bg-transparent pl-4 pr-8 text-[var(--off-black)] outline-none"
                            >
                              <option value="CH">+41</option>
                              <option value="FR">+33</option>
                              <option value="BE">+32</option>
                            </select>
                            <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                              <Phone size={18} className="text-[var(--landing-muted)]" />
                              <input
                                id="booking-phone"
                                value={bookingData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                className="landing-type-body h-14 w-full min-w-0 bg-transparent text-[var(--off-black)] outline-none placeholder:text-[var(--landing-muted)]"
                                placeholder="Numéro de téléphone"
                                autoComplete="tel"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
                          <div>
                            <div className={fieldShellClassName}>
                              <input
                                id="booking-street"
                                value={bookingData.streetName}
                                onChange={(e) => updateField("streetName", e.target.value)}
                                className={inputClassName}
                                placeholder="Rue"
                                autoComplete="street-address"
                              />
                            </div>
                          </div>
                          <div>
                            <div className={fieldShellClassName}>
                              <input
                                id="booking-street-num"
                                value={bookingData.streetNum}
                                onChange={(e) => updateField("streetNum", e.target.value)}
                                className={inputClassName}
                                placeholder="N°"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                          <div>
                            <div className={fieldShellClassName}>
                              <input
                                id="booking-postal-code"
                                value={bookingData.postalCode}
                                onChange={(e) => updateField("postalCode", e.target.value)}
                                className={inputClassName}
                                placeholder="Code postal"
                                autoComplete="postal-code"
                              />
                            </div>
                          </div>
                          <div>
                            <div className={fieldShellClassName}>
                              <input
                                id="booking-city"
                                value={bookingData.city}
                                onChange={(e) => updateField("city", e.target.value)}
                                className={inputClassName}
                                placeholder="Ville"
                                autoComplete="address-level2"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className={fieldShellClassName}>
                            <textarea
                              id="booking-notes"
                              value={bookingData.notes}
                              onChange={(e) => updateField("notes", e.target.value)}
                              className="landing-type-body min-h-[120px] w-full resize-none bg-transparent px-4 py-4 text-[var(--off-black)] outline-none placeholder:text-[var(--landing-muted)]"
                              placeholder="Notes ou demandes particulières"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-[var(--landing-tint-soft)] pt-4">
                          <label className="group flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={bookingData.acceptedTerms}
                              onChange={(e) => updateField("acceptedTerms", e.target.checked)}
                              className="peer sr-only"
                            />
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 border-[var(--landing-tint)] bg-white text-white transition-colors peer-checked:border-[var(--teal-deep)] peer-checked:bg-[var(--teal-deep)]">
                              <Check size={12} />
                            </span>
                            <span className="landing-type-body-s leading-relaxed text-[var(--landing-body)]">
                              J’accepte les conditions de réservation, les contre-indications médicales et la politique de confidentialité.
                            </span>
                          </label>

                          <label className="group flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={bookingData.wantsNewsletter}
                              onChange={(e) => updateField("wantsNewsletter", e.target.checked)}
                              className="peer sr-only"
                            />
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 border-[var(--landing-tint)] bg-white text-white transition-colors peer-checked:border-[var(--teal-deep)] peer-checked:bg-[var(--teal-deep)]">
                              <Check size={12} />
                            </span>
                            <span className="landing-type-body-s leading-relaxed text-[var(--landing-body)]">
                              Je souhaite recevoir des conseils bien-être et des ouvertures de créneaux, au maximum une fois par mois.
                            </span>
                          </label>
                        </div>
                      </form>

                      <div className="pt-1">
                        <Link
                          href="/login"
                          className="landing-type-caption text-[var(--landing-muted)] transition-colors hover:text-[var(--teal-deep)]"
                        >
                          Déjà client ? Se connecter
                        </Link>
                      </div>
                    </section>

                    <aside className="w-full shrink-0 md:sticky md:top-24 md:w-[320px]">
                      <BookingSummaryCard
                        service={selectedService}
                        bookingData={bookingData}
                        actionLabel="Confirmer la réservation"
                        actionForm="booking-contact-form"
                        actionDisabled={!canSubmit || isSubmitting}
                        actionLoading={isSubmitting}
                        footerText="Le paiement s’effectuera sur place."
                      />
                    </aside>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
