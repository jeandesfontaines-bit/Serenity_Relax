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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!effectiveClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="max-w-md glass-premium p-10">
          <h1 className="font-serif text-3xl font-light text-foreground">Espace client</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Connectez-vous pour retrouver vos rendez-vous et vos factures.
          </p>
          <Link
            href="/login"
            className="mt-8 premium-button button-fill rounded-full"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-10 lg:px-8 lg:py-40">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-2">
            <Sparkle className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Tableau de bord</span>
          </div>
          <h1 className="text-5xl font-serif leading-tight text-foreground md:text-7xl">
            Bon retour, <span className="text-primary italic">{firstName}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground font-sans">
            Votre parcours de rééquilibrage continue ici. Prenez un instant et retrouvez vos prochains soins.
          </p>
        </section>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Card: Next Appointment */}
          <section className="relative overflow-hidden glass-premium p-8 lg:p-12 lg:col-span-8 group">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 transition-transform duration-1000 group-hover:scale-150" />
            
            <div className="relative z-10">
              <div className="mb-12 flex items-center justify-between gap-4">
                <h2 className="font-serif text-3xl font-normal text-foreground">
                  Prochain soin
                </h2>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {nextAppointment ? 'Confirmé' : 'À planifier'}
                </span>
              </div>

              {nextAppointment ? (
                <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
                  <div className="flex-1 space-y-10">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
                        Type de soin
                      </p>
                      <p className="text-4xl font-serif text-foreground">{getServiceName(nextAppointment)}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
                          Durée
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                             <History className="w-4 h-4 text-primary" />
                           </div>
                           <p className="text-lg font-sans text-foreground">{getServiceDuration(nextAppointment)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
                          Date et heure
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                             <CalendarDays className="w-4 h-4 text-primary" />
                           </div>
                           <p className="text-lg font-sans text-foreground">
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
                <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-muted/30">
                  <p className="text-xl font-serif text-foreground">Aucun soin à venir pour le moment.</p>
                  <p className="mt-3 text-sm text-muted-foreground">Offrez-vous un moment de détente profonde.</p>
                  <Link href="/#services" className="mt-8 inline-flex premium-button button-fill rounded-full">
                     Réserver un soin
                  </Link>
                </div>
              )}

              {nextAppointment && (
                <div className="mt-16 flex flex-wrap gap-6 pt-10 border-t border-border/50">
                  <button
                    onClick={() => router.push('/client/book')}
                    className="premium-button button-fill rounded-full py-4 text-[11px]"
                  >
                    Reprogrammer
                  </button>
                  <button
                    onClick={handleCancelNextAppointment}
                    disabled={!nextAppointment || isCancelling}
                    className="premium-button button-outline rounded-full py-4 text-[11px] disabled:opacity-40"
                  >
                    {isCancelling ? 'Annulation...' : 'Annuler'}
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(nextAppointment ? invoiceByAppointmentId.get(nextAppointment.id) : null, nextAppointment)}
                    disabled={!nextAppointment}
                    className="flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.4em] text-secondary hover:text-primary transition-colors disabled:opacity-40"
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
            <div className="glass-premium p-8 h-full flex flex-col">
              <h2 className="mb-10 font-serif text-2xl text-foreground">
                Derniers soins
              </h2>

              <div className="space-y-8 flex-1">
                {pastAppointments.slice(0, 4).map((appointment, index) => {
                  const invoice = invoiceByAppointmentId.get(appointment.id);
                  const appointmentDate = getAppointmentDate(appointment);
                  return (
                    <div key={appointment.id} className="group cursor-default">
                      <div className="flex items-start gap-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                          <Sparkle size={18} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-sans font-medium text-[15px] text-foreground">{getServiceName(appointment)}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            {appointmentDate ? formatLongDate(appointmentDate) : '...'}
                          </p>
                          <button
                            onClick={() => handleDownloadInvoice(invoice, appointment)}
                            className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:opacity-70 transition-all opacity-0 group-hover:opacity-100"
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
                  <div className="rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground italic font-sans">
                    Votre historique apparaîtra ici après votre première séance.
                  </div>
                )}
              </div>

              {pastAppointments.length > 0 && (
                <Link
                  href="/client/invoices"
                  className="mt-10 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors py-4 border-t border-border/50"
                >
                  Historique complet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </aside>
        </div>

        {/* Recent Invoices Table */}
        <section className="mt-20">
          <div className="mb-10 flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-foreground">
              Factures récentes
            </h2>
            <Link href="/client/invoices" className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary hover:underline">
              Tout voir
            </Link>
          </div>

          <div className="glass-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Date</th>
                    <th className="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Référence</th>
                    <th className="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Désignation</th>
                    <th className="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Montant</th>
                    <th className="p-8 text-right text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                  {invoices.slice(0, 5).map((invoice) => {
                    const matchingAppointment = invoice.appointmentId
                      ? appointments.find((appointment) => appointment.id === invoice.appointmentId) || null
                      : null;
                    const amount = Number(invoice.amount ?? invoice.totalAmount ?? (matchingAppointment ? getAppointmentAmount(matchingAppointment) : 0));
                    return (
                      <tr key={invoice.id} className="transition-colors hover:bg-primary/[0.02]">
                        <td className="p-8 text-foreground font-sans">
                          {formatLongDate(getInvoiceDate(invoice) || new Date())}
                        </td>
                        <td className="p-8 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</td>
                        <td className="p-8 text-foreground">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium font-sans">
                              {invoice.serviceName || invoice.items?.[0]?.description || (matchingAppointment ? getServiceName(matchingAppointment) : 'Soin holistique')}
                            </span>
                          </div>
                        </td>
                        <td className="p-8 font-sans font-bold text-foreground">{formatCurrency(amount)}</td>
                        <td className="p-8 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(invoice, matchingAppointment)}
                            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white hover:border-primary"
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
                      <td colSpan={5} className="p-20 text-center text-sm text-muted-foreground italic">
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
