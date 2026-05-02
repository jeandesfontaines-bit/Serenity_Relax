'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, query, updateDoc, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Loader2, Download, ArrowRight, ReceiptText, UserCircle2, Bell, CalendarDays, History, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { SERVICES } from '@/lib/types';

type ClientRecord = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type AppointmentRecord = {
  id: string;
  clientId?: string;
  serviceId?: string;
  serviceName?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  time?: string;
  status?: string;
  price?: number;
  totalAmount?: number;
};

type InvoiceRecord = {
  id: string;
  appointmentId?: string;
  invoiceNumber?: string;
  amount?: number;
  totalAmount?: number;
  issueDate?: string;
  date?: string;
  serviceName?: string;
  clientNameSnapshot?: string;
  items?: Array<{ description?: string; amount?: number }>;
};

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDqM1-4SBm4K39jKhXpNwTAIon7WsRrppqSkclIV7-I3QO0Py0RtVuKj2XUXUZ9KUIc_Bg3w0Yth_AE9iqCEn3uPvT0qSm2wfEjw7Fc-PSkdksVgdwGu3-7n5RM4sJmf8K3DLzkeYp3pCJZzi41P76-kOecgHNFb88KezTFd4hsd3QVlLJDCdnCHzd2DgwZkz59DQLkdtVKafhROYZy9MEWipx086CI-_5aJztwNrccQjh7UBWbYHK329TgapP9e52FaCaj3f8CtJ0';

const PAST_SESSION_ICONS = ['spa', 'self_improvement', 'air'] as const;

function getAppointmentDate(appointment: AppointmentRecord): Date | null {
  const raw =
    appointment.startTime ||
    (appointment.date && appointment.time ? `${appointment.date}T${appointment.time}:00` : appointment.date ? `${appointment.date}T12:00:00` : '');
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getInvoiceDate(invoice: InvoiceRecord): Date | null {
  const raw = invoice.issueDate || invoice.date;
  if (!raw) return null;
  const parsed = new Date(`${raw}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getServiceName(appointment: AppointmentRecord): string {
  if (appointment.serviceName) return appointment.serviceName;
  const fromCatalog = SERVICES.find((service) => service.id === appointment.serviceId)?.name;
  return fromCatalog || appointment.title || 'Soin holistique';
}

function getServiceDuration(appointment: AppointmentRecord): string {
  const fromCatalog = SERVICES.find((service) => service.id === appointment.serviceId)?.duration;
  if (fromCatalog) return fromCatalog;

  const start = getAppointmentDate(appointment);
  const end = appointment.endTime ? new Date(appointment.endTime) : null;
  if (start && end && !Number.isNaN(end.getTime())) {
    const diff = Math.round((end.getTime() - start.getTime()) / 60000);
    if (diff > 0) return `${diff} minutes`;
  }

  return '60 minutes';
}

function getAppointmentAmount(appointment: AppointmentRecord): number {
  return Number(appointment.price ?? appointment.totalAmount ?? SERVICES.find((service) => service.id === appointment.serviceId)?.price ?? 0);
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} CHF`;
}

function formatLongDate(value: Date): string {
  return format(value, 'd MMM yyyy', { locale: fr });
}

function formatDateTime(value: Date): string {
  return format(value, "d MMM, HH:mm", { locale: fr });
}

function buildInvoicePdf(invoice: {
  invoiceNumber: string;
  clientName: string;
  date: string;
  serviceName: string;
  amount: number;
}) {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(67, 85, 68);
  doc.text('SERENE HOLISTIC', 20, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(116, 120, 114);
  doc.text('Genève, Suisse', 20, 38);
  doc.text('Justificatif de séance', 20, 44);

  doc.setFontSize(12);
  doc.setTextColor(26, 28, 27);
  doc.text(`Référence : ${invoice.invoiceNumber}`, 140, 30);

  doc.setDrawColor(233, 232, 230);
  doc.line(20, 55, 190, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName, 20, 78);
  doc.text(`Date : ${invoice.date}`, 20, 84);

  doc.setFillColor(244, 243, 241);
  doc.rect(20, 100, 170, 40, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 30, 112);
  doc.text('MONTANT', 145, 112);

  doc.setFont('helvetica', 'normal');
  doc.text(invoice.serviceName, 30, 125);
  doc.text(`${invoice.amount.toFixed(2)} CHF`, 140, 125);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 85, 68);
  doc.text(`TOTAL : ${invoice.amount.toFixed(2)} CHF`, 20, 170);

  doc.save(`serene-holistic-${invoice.invoiceNumber}.pdf`);
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [sessionClientId, setSessionClientId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [clientData, setClientData] = useState<ClientRecord | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setSessionClientId(sessionStorage.getItem('serenity_client_id'));
    setSessionReady(true);
  }, []);

  const effectiveClientId = user?.uid || sessionClientId;

  useEffect(() => {
    async function fetchClient() {
      if (!firestore || !effectiveClientId) {
        if (sessionReady && !isUserLoading) setIsClientLoading(false);
        return;
      }

      setIsClientLoading(true);
      try {
        const clientDoc = await getDoc(doc(firestore, 'clients', effectiveClientId));
        if (clientDoc.exists()) {
          setClientData({ id: clientDoc.id, ...(clientDoc.data() as Omit<ClientRecord, 'id'>) });
        } else {
          setClientData(null);
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setClientData(null);
      } finally {
        setIsClientLoading(false);
      }
    }

    fetchClient();
  }, [effectiveClientId, firestore, isUserLoading, sessionReady]);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !effectiveClientId) return null;
    return query(collection(firestore, 'appointments'), where('clientId', '==', effectiveClientId));
  }, [effectiveClientId, firestore]);

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore || !effectiveClientId) return null;
    return query(collection(firestore, 'invoices'), where('clientId', '==', effectiveClientId));
  }, [effectiveClientId, firestore]);

  const { data: appointmentsData, isLoading: appointmentsLoading } = useCollection<AppointmentRecord>(appointmentsQuery);
  const { data: invoicesData, isLoading: invoicesLoading } = useCollection<InvoiceRecord>(invoicesQuery);

  const appointments = useMemo(
    () =>
      [...(appointmentsData || [])].sort((a, b) => {
        const aDate = getAppointmentDate(a)?.getTime() || 0;
        const bDate = getAppointmentDate(b)?.getTime() || 0;
        return aDate - bDate;
      }),
    [appointmentsData],
  );

  const invoices = useMemo(
    () =>
      [...(invoicesData || [])].sort((a, b) => {
        const aDate = getInvoiceDate(a)?.getTime() || 0;
        const bDate = getInvoiceDate(b)?.getTime() || 0;
        return bDate - aDate;
      }),
    [invoicesData],
  );

  const invoiceByAppointmentId = useMemo(() => {
    const map = new Map<string, InvoiceRecord>();
    invoices.forEach((invoice) => {
      if (invoice.appointmentId) map.set(invoice.appointmentId, invoice);
    });
    return map;
  }, [invoices]);

  const now = new Date();
  const upcomingAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const start = getAppointmentDate(appointment);
        return start && start.getTime() >= now.getTime() && appointment.status !== 'cancelled';
      }),
    [appointments, now],
  );

  const pastAppointments = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => {
          const start = getAppointmentDate(appointment);
          return start && start.getTime() < now.getTime() && appointment.status !== 'cancelled';
        })
        .sort((a, b) => (getAppointmentDate(b)?.getTime() || 0) - (getAppointmentDate(a)?.getTime() || 0)),
    [appointments, now],
  );

  const nextAppointment = upcomingAppointments[0] || null;
  const nextAppointmentDate = nextAppointment ? getAppointmentDate(nextAppointment) : null;
  const firstName = clientData?.firstName || user?.displayName?.split(' ')[0] || 'Alexandra';
  const clientFullName =
    [clientData?.firstName, clientData?.lastName].filter(Boolean).join(' ') || user?.displayName || firstName;
  const notificationCount = useMemo(
    () => invoices.filter((invoice) => Number(invoice.amount ?? invoice.totalAmount ?? 0) > 0).length,
    [invoices],
  );

  const isLoading = isUserLoading || !sessionReady || isClientLoading || appointmentsLoading || invoicesLoading;

  const handleDownloadInvoice = (invoice?: InvoiceRecord | null, appointment?: AppointmentRecord | null) => {
    if (!invoice && !appointment) return;

    const amount = Number(
      invoice?.amount ??
        invoice?.totalAmount ??
        (appointment ? getAppointmentAmount(appointment) : 0),
    );
    const invoiceDate = invoice
      ? formatLongDate(getInvoiceDate(invoice) || new Date())
      : appointment
        ? formatLongDate(getAppointmentDate(appointment) || new Date())
        : formatLongDate(new Date());
    const serviceName =
      invoice?.serviceName ||
      invoice?.items?.[0]?.description ||
      (appointment ? getServiceName(appointment) : 'Soin holistique');

    buildInvoicePdf({
      invoiceNumber: invoice?.invoiceNumber || `INV-${appointment?.id || Date.now()}`,
      clientName: invoice?.clientNameSnapshot || clientFullName,
      date: invoiceDate,
      serviceName,
      amount,
    });
  };

  const handleCancelNextAppointment = async () => {
    if (!firestore || !nextAppointment) return;
    const confirmed = window.confirm('Voulez-vous vraiment annuler ce rendez-vous ?');
    if (!confirmed) return;

    try {
      setIsCancelling(true);
      await updateDoc(doc(firestore, 'appointments', nextAppointment.id), { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#435544]" />
      </div>
    );
  }

  if (!effectiveClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] px-6 text-center">
        <div className="max-w-md rounded-[1.5rem] border border-[#e9e8e6] bg-white p-10 shadow-sm">
          <h1 className="font-['Public_Sans'] text-3xl font-light text-[#435544]">Espace client</h1>
          <p className="mt-4 text-sm text-[#434842]">
            Connectez-vous pour retrouver vos rendez-vous et vos factures.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-full bg-[#435544] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1c1b] pb-24 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-[#e3e2e0] bg-[#faf9f7]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-2xl font-light tracking-wide text-[#435544] [font-family:'Public_Sans',sans-serif]">
              Serene Holistic
            </div>

            <nav className="hidden items-center space-x-8 md:flex">
              <Link
                href="/client/dashboard"
                className="border-b-2 border-[#435544] pb-1 text-lg font-normal text-[#435544] transition-colors duration-300 [font-family:'Public_Sans',sans-serif]"
              >
                Mes rendez-vous
              </Link>
              <Link
                href="/client/invoices"
                className="text-lg font-normal text-[#434842] transition-colors duration-300 hover:text-[#5b6d5b] [font-family:'Public_Sans',sans-serif]"
              >
                Factures
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/client/invoices')}
                className="relative text-[#435544] transition-opacity hover:opacity-70"
                title="Voir mes factures"
              >
                <Bell className="h-6 w-6" strokeWidth={1.8} />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[9px] font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/client/profil')}
                className="text-[#435544] transition-opacity hover:opacity-70"
                title="Mon profil"
              >
                <UserCircle2 className="h-7 w-7" strokeWidth={1.6} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/client/book')}
              className="inline-flex items-center gap-2 rounded-full bg-[#435544] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5b6d5b]"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Réserver un soin
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#e3e2e0] bg-white px-4 py-2 text-sm text-[#434842]">
              <CalendarDays className="h-4 w-4 text-[#435544]" strokeWidth={1.8} />
              <span className="font-medium text-[#1a1c1b]">Prochain soin</span>
              <span className="text-[#747872]">
                {nextAppointmentDate ? format(nextAppointmentDate, "EEE d MMM · HH:mm", { locale: fr }) : 'Aucun prévu'}
              </span>
            </div>

            <button
              onClick={() => router.push('/client/invoices')}
              className="inline-flex items-center gap-2 rounded-full border border-[#e3e2e0] bg-white px-4 py-2 text-sm text-[#434842] transition-colors hover:bg-[#f4f3f1]"
            >
              <History className="h-4 w-4 text-[#725a38]" strokeWidth={1.8} />
              <span className="font-medium text-[#1a1c1b]">{pastAppointments.length}</span>
              <span className="text-[#747872]">soins passés</span>
            </button>

            <button
              onClick={() => router.push('/client/invoices')}
              className="inline-flex items-center gap-2 rounded-full border border-[#e3e2e0] bg-white px-4 py-2 text-sm text-[#434842] transition-colors hover:bg-[#f4f3f1]"
            >
              <ReceiptText className="h-4 w-4 text-[#435544]" strokeWidth={1.8} />
              <span className="font-medium text-[#1a1c1b]">{invoices.length}</span>
              <span className="text-[#747872]">factures</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <section className="space-y-4">
          <h1 className="text-4xl font-light leading-tight text-[#435544] md:text-5xl [font-family:'Public_Sans',sans-serif]">
            Bon retour, {firstName}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[#434842]">
            Votre parcours de rééquilibrage continue ici. Prenez un instant et retrouvez vos prochains soins.
          </p>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="relative overflow-hidden rounded-xl border border-[#e3e2e0] bg-[#f4f3f1] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] lg:col-span-7">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-bl-full bg-[#d4e8d2]/40 transition-transform duration-500 group-hover:scale-110" />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-normal text-[#435544] [font-family:'Public_Sans',sans-serif]">
                  Prochain soin
                </h2>
                <span className="rounded-full bg-[#5b6d5b] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#daeed8]">
                  Prochaine séance
                </span>
              </div>

              {nextAppointment ? (
                <div className="flex flex-col gap-8 md:flex-row md:items-end">
                  <div className="flex-1 space-y-6">
                    <div>
                      <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#747872]">
                        Type de soin
                      </p>
                      <p className="text-2xl font-light text-[#1a1c1b]">{getServiceName(nextAppointment)}</p>
                    </div>

                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#747872]">
                          Durée
                        </p>
                        <p className="text-lg text-[#1a1c1b]">{getServiceDuration(nextAppointment)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#747872]">
                          Date et heure
                        </p>
                        <p className="text-lg text-[#1a1c1b]">
                          {formatDateTime(getAppointmentDate(nextAppointment) || new Date())}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-48 w-full overflow-hidden rounded-lg bg-[#efeeec] md:w-48">
                    <img className="h-full w-full object-cover" alt="Cabine de massage" src={HERO_IMAGE} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#c3c8c0] bg-white/70 px-6 py-10 text-center">
                  <p className="text-lg font-light text-[#1a1c1b]">Aucun soin à venir pour le moment.</p>
                  <p className="mt-2 text-sm text-[#747872]">Vous pouvez réserver une nouvelle séance quand vous le souhaitez.</p>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/client/book')}
                  className="rounded-lg bg-[#435544] px-8 py-3 font-medium text-white transition-colors hover:bg-[#5b6d5b]"
                >
                  Reprogrammer
                </button>
                <button
                  onClick={handleCancelNextAppointment}
                  disabled={!nextAppointment || isCancelling}
                  className="rounded-lg border border-[#435544] px-6 py-3 font-medium text-[#435544] transition-colors hover:bg-[#d4e8d2] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCancelling ? 'Annulation...' : 'Annuler le soin'}
                </button>
                <button
                  onClick={() => handleDownloadInvoice(nextAppointment ? invoiceByAppointmentId.get(nextAppointment.id) : null, nextAppointment)}
                  disabled={!nextAppointment}
                  className="flex items-center gap-2 rounded-lg border border-[#725a38]/20 px-6 py-3 font-medium text-[#725a38] transition-colors hover:bg-[#fcdaaf]/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="h-4 w-4" />
                  Télécharger la facture
                </button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col justify-between rounded-xl border border-[#e3e2e0] bg-white p-8 lg:col-span-5">
            <div>
              <h2 className="mb-6 text-2xl font-normal text-[#435544] [font-family:'Public_Sans',sans-serif]">
                Séances passées
              </h2>

              <div className="space-y-6">
                {pastAppointments.slice(0, 3).map((appointment, index) => {
                  const invoice = invoiceByAppointmentId.get(appointment.id);
                  const appointmentDate = getAppointmentDate(appointment);
                  return (
                    <div key={appointment.id} className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efeeec] text-[#5b6d5b]">
                        <span className="material-symbols-outlined">{PAST_SESSION_ICONS[index % PAST_SESSION_ICONS.length]}</span>
                      </div>
                      <div className={`flex-1 ${index < 2 ? 'border-b border-[#e3e2e0] pb-4' : 'pb-1'}`}>
                        <p className="font-medium text-[#1a1c1b]">{getServiceName(appointment)}</p>
                        <p className="text-sm text-[#434842]">
                          {appointmentDate ? formatLongDate(appointmentDate) : 'Date non disponible'}
                        </p>
                        <button
                          onClick={() => handleDownloadInvoice(invoice, appointment)}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-[#725a38] transition-opacity hover:opacity-70"
                        >
                          <Download className="h-4 w-4" />
                          Facture
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pastAppointments.length === 0 && (
                  <div className="rounded-xl bg-[#f4f3f1] px-5 py-6 text-sm text-[#747872]">
                    Votre historique apparaîtra ici après votre première séance.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push('/client/invoices')}
              className="mt-8 flex items-center gap-2 font-medium text-[#725a38] transition-transform hover:translate-x-1"
            >
              Voir l&apos;historique complet
              <ArrowRight className="h-4 w-4" />
            </button>
          </aside>
        </div>

        <section className="mt-12 rounded-xl border border-[#e3e2e0] bg-[#efeeec] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-normal text-[#435544] [font-family:'Public_Sans',sans-serif]">
              Factures récentes
            </h2>
            <Link href="/client/invoices" className="text-sm font-medium text-[#725a38] hover:underline">
              Tout voir
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#c3c8c0]/40 text-left">
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-widest text-[#747872]">Date</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-widest text-[#747872]">Référence</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-widest text-[#747872]">Soin</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-widest text-[#747872]">Montant</th>
                  <th className="pb-4 text-right text-[10px] font-medium uppercase tracking-widest text-[#747872]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c8c0]/20 text-sm">
                {invoices.slice(0, 3).map((invoice) => {
                  const matchingAppointment = invoice.appointmentId
                    ? appointments.find((appointment) => appointment.id === invoice.appointmentId) || null
                    : null;
                  const amount = Number(invoice.amount ?? invoice.totalAmount ?? (matchingAppointment ? getAppointmentAmount(matchingAppointment) : 0));
                  return (
                    <tr key={invoice.id} className="transition-colors hover:bg-[#f4f3f1]">
                      <td className="py-5 text-[#1a1c1b]">
                        {formatLongDate(getInvoiceDate(invoice) || new Date())}
                      </td>
                      <td className="py-5 text-[#747872]">{invoice.invoiceNumber || invoice.id}</td>
                      <td className="py-5 text-[#1a1c1b]">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {invoice.serviceName || invoice.items?.[0]?.description || (matchingAppointment ? getServiceName(matchingAppointment) : 'Soin holistique')}
                          </span>
                          {matchingAppointment && (
                            <button
                              onClick={() => router.push('/client/invoices')}
                              className="mt-1 flex items-center gap-1 text-left text-[10px] font-bold uppercase tracking-wider text-[#5b6d5b] hover:underline"
                            >
                              <ReceiptText className="h-3 w-3" />
                              Voir la séance
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-5 font-bold text-[#435544]">{formatCurrency(amount)}</td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(invoice, matchingAppointment)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#c3c8c0] px-4 py-2 text-xs font-bold text-[#5b6d5b] transition-all hover:bg-white"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-[#747872]">
                      Aucune facture disponible pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-[#e3e2e0] bg-[#faf9f7] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] md:hidden">
        <Link href="/client/dashboard" className="flex h-14 w-14 scale-90 flex-col items-center justify-center rounded-full bg-[#5b6d5b] text-white transition-transform duration-200">
          <span className="material-symbols-outlined">calendar_month</span>
        </Link>
        <Link href="/client/invoices" className="flex flex-col items-center justify-center rounded-full p-2 text-[#434842] transition-colors hover:bg-[#efeeec]">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">Factures</span>
        </Link>
        <Link href="/client/profil" className="flex flex-col items-center justify-center rounded-full p-2 text-[#434842] transition-colors hover:bg-[#efeeec]">
          <span className="material-symbols-outlined">person</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
