'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, query, updateDoc, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Loader2, Download, ArrowRight, CalendarDays, History, Sparkle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { SERVICES } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { buildInvoicePdf } from '@/lib/pdf-utils';

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
      <div className="landing-v2 flex min-h-screen items-center justify-center bg-[var(--off-white)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--teal-deep)]" />
      </div>
    );
  }

  if (!effectiveClientId) {
    return (
      <div className="landing-v2 flex min-h-screen items-center justify-center bg-[var(--landing-page-bg)] px-6 text-center">
        <div className="landing-surface-card max-w-md rounded-[2rem] p-10">
          <h1 className="landing-type-h3 landing-text-high display-tight">Espace client</h1>
          <p className="landing-type-body-s landing-text-body mt-4">
            Connectez-vous pour retrouver vos rendez-vous et vos factures.
          </p>
          <Link
            href="/login"
            className="landing-type-micro mt-8 inline-flex rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:scale-[1.01] hover:bg-[var(--orange)]"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-v2 min-h-screen pb-24 md:pb-0" style={{ background: 'var(--landing-page-bg)' }}>
      <Navbar />

      <main className="mx-auto max-w-[1360px] px-6 pb-10 pt-28 md:px-10 lg:px-12 lg:pb-16 lg:pt-36">
        <section className="space-y-6">
          <div className="landing-pill landing-pill-soft landing-type-caption inline-flex border text-[var(--landing-warm)] shadow-[0_10px_24px_rgba(48,31,16,0.08)]">
            <Sparkle className="h-4 w-4 text-[var(--orange)]" />
            <span>Tableau de bord</span>
          </div>
          <h1 className="landing-type-h1 landing-text-high display-tight max-w-[11ch]">
            Bon retour,
            <br />
            <span className="landing-display-italic text-[var(--landing-muted)]">{firstName}</span>
          </h1>
          <p className="landing-type-body landing-text-body max-w-2xl">
            Votre parcours de rééquilibrage continue ici. Prenez un instant et retrouvez vos prochains soins.
          </p>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Card: Next Appointment */}
          <section className="landing-surface-card relative overflow-hidden rounded-[2rem] p-6 lg:col-span-8 lg:p-10 group">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[rgba(21,56,57,0.05)] transition-transform duration-1000 group-hover:scale-150" />
            
            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="landing-type-h3 landing-text-high display-tight">
                  Prochain soin
                </h2>
                <span className="landing-type-caption rounded-full border border-[var(--landing-tint)] bg-[var(--landing-tint-fill)] px-4 py-1.5 text-[var(--landing-warm)]">
                  {nextAppointment ? 'Confirmé' : 'À planifier'}
                </span>
              </div>

              {nextAppointment ? (
                <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
                  <div className="flex-1 space-y-10">
                    <div className="space-y-2">
                      <p className="landing-type-micro text-[var(--landing-warm-muted)]">
                        Type de soin
                      </p>
                      <p className="landing-type-h2 landing-text-high display-tight">{getServiceName(nextAppointment)}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <p className="landing-type-micro text-[var(--landing-warm-muted)]">
                          Durée
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--landing-tint-fill)] text-[var(--orange)]">
                             <History className="h-4 w-4" />
                           </div>
                           <p className="landing-type-body landing-text-high">{getServiceDuration(nextAppointment)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="landing-type-micro text-[var(--landing-warm-muted)]">
                          Date et heure
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--landing-tint-fill)] text-[var(--orange)]">
                             <CalendarDays className="h-4 w-4" />
                           </div>
                           <p className="landing-type-body landing-text-high">
                             {formatDateTime(getAppointmentDate(nextAppointment) || new Date())}
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-64 w-full overflow-hidden rounded-2xl md:w-64 lg:aspect-square">
                    <img 
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt="Soins Serenity" 
                      src={HERO_IMAGE} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-[var(--landing-tint)] bg-[var(--landing-tint-fill)] p-8 text-center md:p-10">
                  <p className="landing-type-h4 landing-text-high display-tight">Aucun soin à venir pour le moment.</p>
                  <p className="landing-type-body-s landing-text-body mt-3">Offrez-vous un moment de détente profonde.</p>
                  <Link href="/#services" className="landing-type-micro mt-6 inline-flex rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:bg-[var(--orange)]">
                     Réserver un soin
                  </Link>
                </div>
              )}

              {nextAppointment && (
                <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--landing-tint)] pt-8">
                  <button
                    onClick={() => router.push('/client/book')}
                    className="landing-type-micro rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:bg-[var(--orange)]"
                  >
                    Reprogrammer
                  </button>
                  <button
                    onClick={handleCancelNextAppointment}
                    disabled={!nextAppointment || isCancelling}
                    className="landing-type-micro rounded-full border border-[var(--landing-tint)] bg-white px-8 py-4 text-[var(--landing-warm)] transition-all hover:border-[var(--orange)] hover:text-[var(--off-black)] disabled:opacity-40"
                  >
                    {isCancelling ? 'Annulation...' : 'Annuler'}
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(nextAppointment ? invoiceByAppointmentId.get(nextAppointment.id) : null, nextAppointment)}
                    disabled={!nextAppointment}
                    className="landing-type-micro flex items-center gap-3 px-4 py-4 text-[var(--landing-warm)] transition-colors hover:text-[var(--orange)] disabled:opacity-40"
                  >
                    <Download className="h-4 w-4" />
                    Facture PDF
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Side section: Recent History */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="landing-surface-card flex h-full flex-col rounded-[2rem] p-6 md:p-8">
              <h2 className="landing-type-h4 landing-text-high display-tight mb-8">
                Derniers soins
              </h2>

              <div className="space-y-8 flex-1">
                {pastAppointments.slice(0, 4).map((appointment, index) => {
                  const invoice = invoiceByAppointmentId.get(appointment.id);
                  const appointmentDate = getAppointmentDate(appointment);
                  return (
                    <div key={appointment.id} className="group cursor-default">
                      <div className="flex items-start gap-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--landing-tint)] bg-[var(--landing-tint-fill)] text-[var(--orange)] transition-colors group-hover:bg-[var(--teal-deep)] group-hover:text-white">
                          <Sparkle size={18} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="landing-type-body landing-text-high">{getServiceName(appointment)}</p>
                          <p className="landing-type-caption text-[var(--landing-warm-muted)]">
                            {appointmentDate ? formatLongDate(appointmentDate) : '...'}
                          </p>
                          <button
                            onClick={() => handleDownloadInvoice(invoice, appointment)}
                            className="landing-type-micro mt-3 flex items-center gap-2 text-[var(--orange)] opacity-0 transition-all group-hover:opacity-100 hover:opacity-70"
                          >
                            <Download className="h-3 w-3" />
                            Facture
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {pastAppointments.length === 0 && (
                  <div className="landing-type-body-s landing-text-body rounded-[1.5rem] bg-[var(--landing-tint-fill)] p-6 text-center italic">
                    Votre historique apparaîtra ici après votre première séance.
                  </div>
                )}
              </div>

              {pastAppointments.length > 0 && (
                <Link
                  href="/client/invoices"
                  className="landing-type-micro mt-10 flex items-center justify-center gap-3 border-t border-[var(--landing-tint)] py-4 text-[var(--landing-warm-muted)] transition-colors hover:text-[var(--orange)]"
                >
                  Historique complet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </aside>
        </div>

        {/* Recent Invoices Table */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="landing-type-h3 landing-text-high display-tight">
              Factures récentes
            </h2>
            <Link href="/client/invoices" className="landing-type-micro text-[var(--orange)] hover:underline">
              Tout voir
            </Link>
          </div>

          <div className="landing-surface-card overflow-hidden rounded-[2rem]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--landing-tint)] text-left">
                    <th className="landing-type-micro p-6 text-[var(--landing-warm-muted)]">Date</th>
                    <th className="landing-type-micro p-6 text-[var(--landing-warm-muted)]">Référence</th>
                    <th className="landing-type-micro p-6 text-[var(--landing-warm-muted)]">Désignation</th>
                    <th className="landing-type-micro p-6 text-[var(--landing-warm-muted)]">Montant</th>
                    <th className="landing-type-micro p-6 text-right text-[var(--landing-warm-muted)]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--landing-tint)] text-sm">
                  {invoices.slice(0, 5).map((invoice) => {
                    const matchingAppointment = invoice.appointmentId
                      ? appointments.find((appointment) => appointment.id === invoice.appointmentId) || null
                      : null;
                    const amount = Number(invoice.amount ?? invoice.totalAmount ?? (matchingAppointment ? getAppointmentAmount(matchingAppointment) : 0));
                    return (
                      <tr key={invoice.id} className="transition-colors hover:bg-[var(--landing-tint-fill)]">
                        <td className="landing-type-body-s landing-text-high p-6">
                          {formatLongDate(getInvoiceDate(invoice) || new Date())}
                        </td>
                        <td className="landing-type-body-s p-6 font-mono uppercase tracking-wider text-[var(--landing-warm-muted)]">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</td>
                        <td className="p-6 landing-text-high">
                          <div className="flex flex-col gap-1">
                            <span className="landing-type-body font-medium">
                              {invoice.serviceName || invoice.items?.[0]?.description || (matchingAppointment ? getServiceName(matchingAppointment) : 'Soin holistique')}
                            </span>
                          </div>
                        </td>
                        <td className="landing-type-body p-6 font-semibold text-[var(--off-black)]">{formatCurrency(amount)}</td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(invoice, matchingAppointment)}
                            className="landing-type-micro inline-flex items-center gap-2 rounded-full border border-[var(--landing-tint)] bg-white px-6 py-2.5 text-[var(--orange)] transition-all hover:border-[var(--orange)] hover:bg-[var(--orange)] hover:text-white"
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
                      <td colSpan={5} className="landing-type-body-s landing-text-body p-12 text-center italic">
                        Aucune facture disponible pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
