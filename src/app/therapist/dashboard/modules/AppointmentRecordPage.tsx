'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Edit3,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Wallet,
  Zap,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';
import { Appointment, Invoice } from '../types';
import AppointmentClientCard from './appointment/AppointmentClientCard';
import {
  ActionBtn,
  BarChart,
  DetailRow,
  EditableField,
  InlineEditableTextarea,
} from './appointment/AppointmentComponents';

type PaymentMethod = 'Twint' | 'Card' | 'Cash';

interface AppointmentRecordPageProps {
  appt: Appointment;
  appointments: Appointment[];
  invoices: Invoice[];
  onBack: () => void;
  onTogglePayment: (id: string, current: boolean, method?: PaymentMethod) => Promise<void> | void;
  onSendWhatsApp?: (appt: Appointment, type: 'reminder' | 'confirmation' | 'followup') => void;
}

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Twint', label: 'TWINT' },
  { value: 'Card', label: 'Card' },
];

export default function AppointmentRecordPage({
  appt,
  appointments,
  invoices,
  onBack,
  onTogglePayment,
  onSendWhatsApp,
}: AppointmentRecordPageProps) {
  const firestore = useFirestore();
  const router = useRouter();
  const current = appointments.find((item) => item.id === appt.id) || appt;

  const [notes, setNotes] = useState(current.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    setNotes(current.notes || '');
  }, [current.notes]);

  const clientAppts = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            item.clientId === appt.clientId ||
            (appt.clientNameSnapshot && item.clientNameSnapshot === appt.clientNameSnapshot),
        )
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [appointments, appt.clientId, appt.clientNameSnapshot],
  );

  const sessionCount = clientAppts.length;
  const lastVisit = clientAppts.find((item) => item.id !== appt.id && (item.date || '') < (appt.date || ''));
  const unpaidAppts = clientAppts.filter((item) => !item.paid && item.price);
  const totalDue = unpaidAppts.reduce((sum, item) => sum + (item.price || 0), 0);
  const linkedInvoice = invoices.find((invoice) => invoice.appointmentId === current.id);

  const dateObj = current.date ? parseISO(current.date) : new Date();
  const dayNum = format(dateObj, 'd');
  const monthStr = format(dateObj, 'MMM', { locale: fr });
  const fullDateLabel = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });

  const handleSaveNotes = async () => {
    if (!firestore) return;
    setIsSavingNotes(true);
    try {
      await updateDoc(doc(firestore, 'appointments', current.id), { notes });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1800);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCancelAppt = async () => {
    if (!firestore) return;
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return;
    await deleteDoc(doc(firestore, 'appointments', current.id));
    onBack();
  };

  const handlePayment = async (method?: PaymentMethod) => {
    setIsUpdatingPayment(true);
    try {
      await onTogglePayment(current.id, Boolean(current.paid), method);
      setShowPaymentMethods(false);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto max-w-[1480px] space-y-8 px-6 py-6">
        <section className="flex justify-end">
          <button
            type="button"
            onClick={handleCancelAppt}
            className="inline-flex h-11 items-center gap-3 rounded-full border border-destructive/20 bg-destructive/10 px-5 text-[11px] font-bold tracking-[0.05em] text-destructive transition-colors hover:bg-destructive/15"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            Annuler le rdv
          </button>
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <AppointmentClientCard
              current={current}
              dayNum={dayNum}
              monthStr={monthStr}
              fullDateLabel={fullDateLabel}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <ActionBtn
                onClick={() => onSendWhatsApp?.(current, current.paid ? 'followup' : 'reminder')}
                icon={<MessageSquare size={20} strokeWidth={2.5} />}
                label="WhatsApp"
                sub="Rappel client"
              />
              <ActionBtn
                onClick={() => onSendWhatsApp?.(current, 'confirmation')}
                icon={<Check size={20} strokeWidth={2.5} />}
                label="Confirmer"
                sub="Validation séance"
              />
              <ActionBtn
                onClick={() => router.push(`/therapist/invoice/${linkedInvoice?.id || current.id}`)}
                icon={<FileText size={20} strokeWidth={2.5} />}
                label="Facture PDF"
                sub="Ouvrir document"
                isPrimary
              />
              <ActionBtn
                onClick={() => {
                  if (current.paid) {
                    void handlePayment();
                    return;
                  }
                  setShowPaymentMethods((prev) => !prev);
                }}
                icon={<Wallet size={20} strokeWidth={2.5} />}
                label={current.paid ? 'Réglée' : 'Marquer réglée'}
                sub={current.paid ? current.paymentMethod || 'Paiement reçu' : 'Cash, TWINT ou card'}
              />
            </div>

            {showPaymentMethods && !current.paid && (
              <div className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="dashboard-eyebrow mb-1">Règlement</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Choisissez le mode utilisé pour enregistrer la facture comme réglée.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        disabled={isUpdatingPayment}
                        onClick={() => void handlePayment(method.value)}
                        className="inline-flex h-11 items-center rounded-full border border-border bg-background px-5 text-[11px] font-bold tracking-[0.08em] text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h4 className="dashboard-eyebrow">Caractéristiques de séance</h4>
                <div className="h-px flex-1 bg-border/30" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DetailRow
                  icon={<Zap size={22} />}
                  label="Type de soin"
                  value={
                    <EditableField
                      label="Soin"
                      value={cleanServiceLabel(current.serviceName) || ''}
                      onChange={(value) => updateDoc(doc(firestore!, 'appointments', current.id), { serviceName: value })}
                    />
                  }
                />
                <DetailRow
                  icon={<CreditCard size={22} />}
                  label="Honoraires"
                  value={
                    <div className="flex items-center gap-2 text-foreground">
                      <EditableField
                        label="Prix"
                        value={String(current.price || '')}
                        onChange={(value) => updateDoc(doc(firestore!, 'appointments', current.id), { price: Number(value) })}
                      />
                      <span className="font-bold text-muted-foreground">CHF</span>
                    </div>
                  }
                />
                <DetailRow
                  icon={<Phone size={22} />}
                  label="Mobile"
                  value={
                    <EditableField
                      label="Téléphone"
                      value={current.phone || ''}
                      onChange={(value) => updateDoc(doc(firestore!, 'appointments', current.id), { phone: value })}
                    />
                  }
                />
                <DetailRow
                  icon={<Mail size={22} />}
                  label="Courriel"
                  value={
                    <EditableField
                      label="Email"
                      value={current.email || ''}
                      onChange={(value) => updateDoc(doc(firestore!, 'appointments', current.id), { email: value })}
                    />
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-5">
              <div className="rounded-[2rem] border border-border/40 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-eyebrow mb-1 text-muted-foreground">Séances totales</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">{sessionCount}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <BarChart size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <div className={`rounded-[2rem] border p-6 shadow-sm ${totalDue > 0 ? 'border-transparent bg-primary text-primary-foreground' : 'border-border/40 bg-card text-foreground'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`dashboard-eyebrow mb-1 ${totalDue > 0 ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>Solde à régler</p>
                    <p className="text-2xl font-bold tracking-tight">{totalDue} CHF</p>
                    {current.paid && current.paymentMethod && (
                      <p className="mt-2 text-xs font-semibold tracking-[0.05em] text-primary-foreground/80">
                        Dernier règlement : {current.paymentMethod}
                      </p>
                    )}
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${totalDue > 0 ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <CreditCard size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/40 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-eyebrow mb-1 text-muted-foreground">Dernière visite</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {lastVisit?.date ? format(parseISO(lastVisit.date), 'dd MMM', { locale: fr }) : 'aucune'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <Calendar size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/40 bg-card p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Edit3 size={16} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-[13px] font-bold tracking-[0.05em] text-foreground">Journal clinique</h4>
                </div>
                <span className="rounded-full bg-primary px-4 py-2 text-[9px] font-bold tracking-[0.1em] text-primary-foreground">
                  Archivé
                </span>
              </div>

              <InlineEditableTextarea
                value={notes}
                onChange={setNotes}
                placeholder="Écrivez vos observations ici..."
              />

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className={`mt-6 flex h-14 w-full items-center justify-center gap-4 rounded-full text-[12px] font-bold tracking-[0.1em] transition-all ${
                  saveSuccess
                    ? 'scale-95 bg-primary text-primary-foreground'
                    : 'bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-lg'
                }`}
              >
                {isSavingNotes ? (
                  <Clock size={18} className="animate-spin" />
                ) : saveSuccess ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <Save size={18} strokeWidth={2.5} />
                )}
                {saveSuccess ? 'Dossier archivé' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
