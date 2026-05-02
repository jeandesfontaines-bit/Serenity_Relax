import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment, Client } from '../types';
import { dashboardPageContainer, dashboardPanel, dashboardPanelSoft, dashboardPrimaryButton, dashboardSecondaryButton, dashboardTableCell, dashboardTableHeader, dashboardTableSectionHeader, dashboardTitle, dashboardTitleLg } from './dashboardTheme';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
  onScheduleClient: (client: Client) => void;
}

type ClientStatus = 'new' | 'active' | 'loyalty' | 'hiatus';

const STATUS_META: Record<ClientStatus, { label: string; className: string }> = {
  loyalty: { label: 'Client fidele', className: 'bg-[#ffddb2] text-[#594323]' },
  new: { label: 'Nouveau client', className: 'bg-[#d4e8d2] text-[#3a4b3b]' },
  hiatus: { label: 'En pause', className: 'bg-[#e3e2e0] text-[#434842]' },
  active: { label: 'Client actif', className: 'bg-[#efeeec] text-[#435544]' },
};

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value.includes('T') ? value : `${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseAppointmentDate(appt: Appointment): Date | null {
  if (appt.startTime) {
    const parsedStart = new Date(appt.startTime);
    if (!Number.isNaN(parsedStart.getTime())) return parsedStart;
  }

  if (!appt.date) return null;
  const fallback = new Date(`${appt.date}T${appt.time || '12:00'}:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function getClientStatus(sessionCount: number, lastVisitDate: Date | null): ClientStatus {
  if (!lastVisitDate) return 'new';

  const diffMs = Date.now() - lastVisitDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 90) return 'hiatus';
  if (sessionCount >= 8) return 'loyalty';
  if (sessionCount <= 2) return 'new';
  return 'active';
}

function formatDisplayDate(value?: string): string {
  const parsed = parseDate(value);
  return parsed ? format(parsed, 'd MMM yyyy', { locale: fr }) : value || 'Non renseigne';
}

function getAgeLabel(birthDate?: string): string | null {
  const parsed = parseDate(birthDate);
  if (!parsed) return null;

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const birthdayPassed =
    today.getMonth() > parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());

  if (!birthdayPassed) age -= 1;
  return age >= 0 ? `${age} ans` : null;
}

function formatMoney(amount: number): string {
  return `${amount} CHF`;
}

function getAddress(client: Partial<Client>): string {
  const parts = [
    client.street,
    [client.zip, client.city].filter(Boolean).join(' '),
    client.canton,
  ].filter(Boolean);

  return parts.join(', ') || 'Non renseigne';
}

function getPreferredService(appointments: Appointment[]): string {
  const counts = appointments.reduce((acc, appt) => {
    if (!appt.serviceName) return acc;
    acc[appt.serviceName] = (acc[appt.serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucun soin dominant';
}

function getDirective(notes?: string): string {
  const trimmed = notes?.trim();
  if (!trimmed) {
    return 'Ajoutez ici les recommandations de suivi, les sensibilites observees et les points de vigilance pour les prochaines seances.';
  }
  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
}

function materialIcon(name: string, filled = false) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  );
}

export default function ClientDetail({
  client,
  onClose,
  appointments,
  onSelectAppt,
  onUpdateClient,
  onScheduleClient,
}: ClientDetailProps) {
  const [editData, setEditData] = useState<Partial<Client>>({ ...client });
  useEffect(() => {
    setEditData({ ...client });
  }, [client]);

  const updateField = useCallback((field: keyof Client, value: string) => {
    const next = { ...editData, [field]: value };
    setEditData(next);
    onUpdateClient(client.id, next);
  }, [client.id, editData, onUpdateClient]);

  const clientAppts = useMemo(() =>
    [...appointments]
      .filter((appt) => appt.clientId === client.id || appt.clientNameSnapshot === `${client.firstName} ${client.lastName}`)
      .sort((a, b) => {
        const aDate = parseAppointmentDate(a);
        const bDate = parseAppointmentDate(b);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.getTime() - aDate.getTime();
      }),
    [appointments, client],
  );

  const completedAppts = clientAppts.filter((appt) => appt.date && appt.time);
  const incompleteAppts = clientAppts.filter((appt) => !appt.date || !appt.time);
  const paidAppts = clientAppts.filter((appt) => appt.paid && appt.price);
  const unpaidAppts = clientAppts.filter((appt) => !appt.paid && appt.price);
  const totalDue = unpaidAppts.reduce((sum, appt) => sum + (appt.price || 0), 0);
  const totalPaid = paidAppts.reduce((sum, appt) => sum + (appt.price || 0), 0);
  const unpaidCount = clientAppts.filter((appt) => !appt.paid && appt.date).length;
  const totalRevenue = totalDue + totalPaid;
  const lastAppt = completedAppts[0];
  const nextAppt = [...clientAppts]
    .map((appt) => ({ appt, date: parseAppointmentDate(appt) }))
    .filter((entry): entry is { appt: Appointment; date: Date } => !!entry.date && entry.date.getTime() >= Date.now())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.appt || null;
  const preferredService = getPreferredService(clientAppts);
  const status = getClientStatus(clientAppts.length, lastAppt ? parseAppointmentDate(lastAppt) : null);
  const statusMeta = STATUS_META[status];
  const ageLabel = getAgeLabel(editData.birthDate);
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';
  const address = getAddress(editData);
  const headerSummary = [
    ageLabel,
    clientAppts.length > 0 ? `${clientAppts.length} seance${clientAppts.length > 1 ? 's' : ''} enregistree${clientAppts.length > 1 ? 's' : ''}` : 'Aucune seance enregistree',
    lastAppt?.date ? `Derniere visite le ${formatDisplayDate(lastAppt.date)}` : null,
  ].filter(Boolean).join(' • ');

  return (
    <div className="flex-1 overflow-auto bg-[#fcf8f7] text-[#1c1b1b] [font-family:'Plus_Jakarta_Sans',sans-serif]">
      <main className={dashboardPageContainer}>
        <section className={`mb-6 p-6 ${dashboardPanel}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h2 className="text-[20px] font-normal leading-[1.1] tracking-[-0.02em] text-[#1c1b1b] [font-family:'Noto_Serif',serif] sm:text-[26px]">
                  {fullName}
                </h2>
                <span className="border-l border-[#c3c8c0] pl-3 text-[11px] text-[#747872]">
                  ID: {client.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <p className="text-xs leading-[1.6] text-[#444845]">
                {headerSummary || 'Dossier patient disponible pour suivi, notes et historique des seances.'}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
                <span className="rounded-full bg-[#effce9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#1c1b1b]">
                  {preferredService}
                </span>
                {unpaidCount > 0 && (
                  <span className="rounded-full bg-[#ffdad6] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#93000a]">
                    {unpaidCount} paiement{unpaidCount > 1 ? 's' : ''} en attente
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onScheduleClient(client)}
                className={`flex items-center justify-center gap-2 ${dashboardPrimaryButton}`}
              >
                {materialIcon('event_repeat', true)}
                Planifier une seance
              </button>
              <button
                onClick={() => {
                  const notesEl = document.getElementById('client-notes');
                  notesEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  if (notesEl instanceof HTMLTextAreaElement) notesEl.focus();
                }}
                className={`flex items-center justify-center gap-2 ${dashboardSecondaryButton}`}
              >
                {materialIcon('edit_note')}
                Nouvelle note
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className={`${dashboardPanel} p-6 lg:col-span-4`}>
            <SectionHeader icon="badge" title="Informations personnelles" />

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <EditableField label="Prenom" value={editData.firstName || ''} onChange={(value) => updateField('firstName', value)} />
              <EditableField label="Nom" value={editData.lastName || ''} onChange={(value) => updateField('lastName', value)} />
              <EditableField label="E-mail" value={editData.email || ''} onChange={(value) => updateField('email', value)} type="email" className="sm:col-span-2" />
              <EditableField label="Telephone" value={editData.phone || ''} onChange={(value) => updateField('phone', value)} />
              <EditableField label="Date de naissance" value={editData.birthDate || ''} onChange={(value) => updateField('birthDate', value)} type="date" />
              <EditableField label="Rue" value={editData.street || ''} onChange={(value) => updateField('street', value)} className="sm:col-span-2" />
              <EditableField label="NPA" value={editData.zip || ''} onChange={(value) => updateField('zip', value)} />
              <EditableField label="Ville" value={editData.city || ''} onChange={(value) => updateField('city', value)} />
              <EditableField label="Canton" value={editData.canton || ''} onChange={(value) => updateField('canton', value)} />
              <EditableField label="Assurance" value={editData.insurance || ''} onChange={(value) => updateField('insurance', value)} />
            </div>
          </section>

          <section className={`${dashboardPanel} p-6 lg:col-span-8`}>
            <SectionHeader icon="monitoring" title="Vue clinique" />

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InsightCard
                label="Soin principal"
                icon="spa"
                value={preferredService}
              />
              <InsightCard
                label="Derniere seance"
                icon="event_available"
                value={lastAppt?.date ? formatDisplayDate(lastAppt.date) : 'Aucune'}
              />
              <InsightCard
                label="Prochain rendez-vous"
                icon="calendar_month"
                value={nextAppt?.date ? `${formatDisplayDate(nextAppt.date)}${nextAppt.time ? ` • ${nextAppt.time}` : ''}` : 'Non programme'}
                accent={nextAppt ? 'primary' : 'neutral'}
              />
            </div>

            <div className="rounded-[20px] border border-[#bdcab9] bg-[rgba(239,252,233,0.6)] p-4 backdrop-blur-[18px]">
              <div className="mb-2 flex items-center gap-2 text-[#556253]">
                {materialIcon('psychiatry')}
                <p className="text-[10px] font-medium uppercase tracking-[0.1em]">Directive praticien</p>
              </div>
              <p className="border-l-2 border-[#556253] pl-3 text-xs leading-[1.6] text-[#444845]">
                {getDirective(client.notes)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryChip label="Adresse" value={address} />
              <SummaryChip label="Naissance" value={editData.birthDate ? formatDisplayDate(editData.birthDate) : 'Non renseignee'} />
              <SummaryChip label="Solde client" value={totalDue > 0 ? formatMoney(totalDue) : 'Aucun impaye'} tone={totalDue > 0 ? 'alert' : 'default'} />
              <SummaryChip label="Chiffre genere" value={formatMoney(totalRevenue)} />
            </div>
          </section>

          <section
            id="client-history"
            className={`overflow-hidden lg:col-span-7 ${dashboardPanel}`}
          >
            <div className={dashboardTableSectionHeader}>
              <SectionHeader icon="history" title="Historique des seances" noMargin />
              <button
                onClick={() => document.getElementById('client-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-xs font-bold uppercase tracking-[0.18em] text-[#435544] hover:underline"
              >
                Journal complet
              </button>
            </div>

            {completedAppts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className={`border-b border-[#c3c8c0]/60 ${dashboardTableHeader}`}>
                    <tr>
                      <th className={dashboardTableCell}>Soin</th>
                      <th className={dashboardTableCell}>Date</th>
                      <th className={dashboardTableCell}>Heure</th>
                      <th className={dashboardTableCell}>Duree</th>
                      <th className={dashboardTableCell}>Paiement</th>
                      <th className={`${dashboardTableCell} text-right`}>Voir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c8c0]/50 text-sm">
                    {completedAppts.map((appt) => (
                      <tr
                        key={appt.id}
                        onClick={() => onSelectAppt(appt)}
                        className="cursor-pointer transition-colors hover:bg-[#f4f3f1]"
                      >
                        <td className={`${dashboardTableCell} font-medium text-[#1a1c1b]`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[#747872]">{materialIcon('spa')}</span>
                            <span>{appt.serviceName || 'Seance'}</span>
                          </div>
                        </td>
                        <td className={`${dashboardTableCell} text-[#434842]`}>{appt.date ? formatDisplayDate(appt.date) : '—'}</td>
                        <td className={`${dashboardTableCell} text-[#434842]`}>{appt.time || '—'}</td>
                        <td className={`${dashboardTableCell} text-[#434842]`}>{appt.duration || '60 min'}</td>
                        <td className={dashboardTableCell}>
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            appt.paid
                              ? 'bg-[#d4e8d2] text-[#3a4b3b]'
                              : 'bg-[#ffdad6] text-[#93000a]'
                          }`}>
                            {appt.paid ? 'Regle' : appt.price ? `${appt.price} CHF` : 'A regler'}
                          </span>
                        </td>
                        <td className={`${dashboardTableCell} text-right text-[#747872]`}>
                          <ChevronRight size={16} strokeWidth={1.5} className="ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyBlock icon="calendar_month" label={`Aucune seance enregistree pour ${client.firstName || 'ce client'}.`} />
            )}

            {incompleteAppts.length > 0 && (
              <div className="border-t border-[#c3c8c0]/60 bg-[#faf9f7] px-6 py-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#747872]">
                  Seances incompletes
                </p>
                <div className="space-y-2">
                  {incompleteAppts.map((appt) => (
                    <button
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className="flex w-full items-center justify-between rounded-[16px] border border-[#c3c8c0] bg-white px-4 py-3 text-left transition-colors hover:bg-[#f4f3f1]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1a1c1b]">{appt.serviceName || 'Seance incomplte'}</p>
                        <p className="mt-1 text-xs text-[#747872]">Date ou heure manquante</p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} className="text-[#747872]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className={`flex flex-col p-6 lg:col-span-5 ${dashboardPanel}`}>
            <div className="mb-4 flex items-center justify-between border-b border-[#c3c8c0]/60 pb-4">
              <SectionHeader icon="clinical_notes" title="Notes de suivi" noMargin />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c3c8c0] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#434842]">
                <ShieldCheck size={12} strokeWidth={1.7} />
                Confidentiel
              </span>
            </div>

            <textarea
              id="client-notes"
              value={client.notes || ''}
              onChange={(e) => onUpdateClient(client.id, { notes: e.target.value })}
              placeholder="Renseignez ici les observations de seance, zones de tension, recommandations et plan de suivi..."
              className="min-h-[300px] flex-1 rounded-[20px] border border-[#c3c8c0] bg-[#faf9f7] p-4 text-xs leading-6 text-[#1a1c1b] shadow-inner outline-none transition focus:border-[#435544] focus:ring-1 focus:ring-[#435544] resize-none"
            />

            <div className="mt-4 flex items-center justify-between border-t border-[#c3c8c0]/60 pt-4">
              <p className="text-xs text-[#747872]">
                {client.notes?.trim() ? `${client.notes.trim().length} caracteres enregistres` : 'Aucune note enregistree'}
              </p>
              <button
                onClick={() => {
                  const notesEl = document.getElementById('client-notes');
                  notesEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  if (notesEl instanceof HTMLTextAreaElement) notesEl.focus();
                }}
                className="rounded-full bg-[#435544] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-95"
              >
                Continuer l&apos;edition
              </button>
            </div>
          </section>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className={`${dashboardPanel} p-6 xl:col-span-4`}>
            <SectionHeader icon="payments" title="Synthese facturation" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <BillingStat label="Total encaisse" value={formatMoney(totalPaid)} />
              <BillingStat label="Montant du" value={formatMoney(totalDue)} alert={totalDue > 0} />
              <BillingStat label="Factures en attente" value={String(unpaidCount)} />
            </div>
          </div>

          <div className={`${dashboardPanel} p-6 xl:col-span-4`}>
            <SectionHeader icon="warning" title="Paiements en attente" />

            {unpaidAppts.length > 0 ? (
              <div className="space-y-3">
                {unpaidAppts.map((appt) => (
                  <div key={appt.id} className="rounded-[18px] border border-[#ffdad6] bg-[#fff6f5] px-4 py-4">
                    <p className="text-sm font-medium text-[#1a1c1b]">{appt.serviceName || 'Seance'}</p>
                    <p className="mt-1 text-xs text-[#747872]">
                      {appt.date ? formatDisplayDate(appt.date) : 'Date a confirmer'}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#93000a]">A relancer</span>
                      <span className="text-sm font-semibold text-[#93000a]">{formatMoney(appt.price || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock icon="task_alt" label="Aucun paiement en attente." compact />
            )}
          </div>

          <div className={`${dashboardPanel} p-6 xl:col-span-4`}>
            <SectionHeader icon="receipt_long" title="Historique paiements" />

            {paidAppts.length > 0 ? (
              <div className="space-y-3">
                {paidAppts.slice(0, 8).map((appt) => (
                  <div key={appt.id} className="rounded-[18px] border border-[#c3c8c0] bg-[#faf9f7] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#1a1c1b]">{appt.serviceName || 'Seance'}</p>
                        <p className="mt-1 text-xs text-[#747872]">
                          {appt.date ? formatDisplayDate(appt.date) : 'Date non definie'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1c1b]">{formatMoney(appt.price || 0)}</span>
                    </div>
                    {appt.paymentMethod && (
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#435544]">
                        {appt.paymentMethod}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <CreditCard size={24} strokeWidth={1.4} className="mx-auto mb-3 text-[#c3c8c0]" />
                <p className="text-sm text-[#747872]">Aucun paiement enregistre.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ icon, title, noMargin = false }: { icon: string; title: string; noMargin?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${noMargin ? '' : 'mb-4 border-b border-[#c3c8c0]/60 pb-3'}`}>
      <span className="text-[#435544] text-[18px]">{materialIcon(icon)}</span>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a1c1b] [font-family:'Public_Sans',sans-serif]">
        {title}
      </h3>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync draft when external value changes
  React.useEffect(() => { setDraft(value); }, [value]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  return (
    <div className={`group relative ${className}`}>
      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          placeholder={label}
          className="w-full rounded-[12px] border border-[#435544] bg-white px-3 py-2 text-xs text-[#1a1c1b] outline-none ring-1 ring-[#435544]/20"
        />
      ) : (
        <div
          onDoubleClick={startEdit}
          title={`Double-cliquer pour modifier ${label}`}
          className="flex min-h-[32px] cursor-text items-center rounded-[12px] border border-transparent px-3 py-2 text-xs text-[#1a1c1b] transition group-hover:border-[#c3c8c0] group-hover:bg-[#faf9f7]"
        >
          {value
            ? <span>{value}</span>
            : <span className="text-[#b0b5ae] italic">{label}</span>
          }
        </div>
      )}
    </div>
  );
}

function InsightCard({
  label,
  icon,
  value,
  accent = 'default',
}: {
  label: string;
  icon: string;
  value: string;
  accent?: 'default' | 'primary' | 'neutral';
}) {
  const toneClass =
    accent === 'primary'
      ? 'bg-[#d4e8d2]/35 border-[#d4e8d2] text-[#435544]'
      : accent === 'neutral'
        ? 'bg-[#f4f3f1] border-[#c3c8c0] text-[#434842]'
        : 'bg-[#f4f3f1] border-[#c3c8c0] text-[#435544]';

  return (
    <div className={`rounded-[16px] border p-3 ${toneClass}`}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#747872]">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-[16px]">{materialIcon(icon)}</span>
        <span className="text-xs font-medium text-[#1a1c1b] [font-family:'Public_Sans',sans-serif]">{value}</span>
      </div>
    </div>
  );
}

function SummaryChip({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'alert';
}) {
  return (
    <div className={`rounded-[14px] border px-3 py-3 ${tone === 'alert' ? 'border-[#ffdad6] bg-[#fff6f5]' : 'border-[#c3c8c0] bg-[#faf9f7]'}`}>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#747872]">{label}</p>
      <p className={`text-xs ${tone === 'alert' ? 'text-[#93000a]' : 'text-[#434842]'}`}>{value}</p>
    </div>
  );
}

function BillingStat({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-[14px] border border-[#c3c8c0] bg-[#faf9f7] p-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#747872]">{label}</p>
      <p className={`text-sm font-semibold [font-family:'Public_Sans',sans-serif] ${alert ? 'text-[#93000a]' : 'text-[#1a1c1b]'}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyBlock({ icon, label, compact = false }: { icon: string; label: string; compact?: boolean }) {
  return (
    <div className={`text-center ${compact ? 'py-8' : 'py-16'}`}>
      <div className="mb-3 text-[#c3c8c0]">{materialIcon(icon)}</div>
      <p className="text-sm text-[#747872]">{label}</p>
    </div>
  );
}
