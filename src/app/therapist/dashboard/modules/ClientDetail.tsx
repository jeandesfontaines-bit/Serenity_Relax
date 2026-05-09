import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment, Client } from '../types';
import {
  dashboardPageContainer,
  dashboardPanel,
  dashboardPrimaryButton,
  dashboardTableCell,
  dashboardTableHeader,
  dashboardTableSectionHeader,
} from './dashboardTheme';

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
  loyalty: { label: 'Client fidele', className: 'border border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]' },
  new: { label: 'Nouveau client', className: 'border border-[#bef264] bg-[#ecfccb] text-[#3f6212]' },
  hiatus: { label: 'En pause', className: 'border border-[#c4cdd7] bg-[#f7f4ec] text-[#3f565f]' },
  active: { label: 'Client actif', className: 'border border-[#bdd0e5] bg-[#e8f2ee] text-[#184f40]' },
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
  const clientInitials = (client.initials || `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}` || 'CL').slice(0, 2).toUpperCase();
  const headerSummary = [
    ageLabel,
    clientAppts.length > 0 ? `${clientAppts.length} seance${clientAppts.length > 1 ? 's' : ''} enregistree${clientAppts.length > 1 ? 's' : ''}` : 'Aucune seance enregistree',
    lastAppt?.date ? `Derniere visite le ${formatDisplayDate(lastAppt.date)}` : null,
  ].filter(Boolean).join(' • ');
  const upcomingAppts = [...clientAppts]
    .map((appt) => ({ appt, date: parseAppointmentDate(appt) }))
    .filter((entry): entry is { appt: Appointment; date: Date } => !!entry.date && entry.date.getTime() >= Date.now())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 2);
  const urgencyCount = unpaidCount + incompleteAppts.length;

  return (
    <div className="flex-1 overflow-auto bg-transparent text-[#101416]">
      <main className={`${dashboardPageContainer} max-w-[1380px]`}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-6 xl:sticky xl:top-6 self-start">
            <section className={`overflow-hidden ${dashboardPanel}`}>
              <div className="border-b border-[#d9dee4] bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.96))] p-6">
                <div className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-white text-[42px] font-semibold text-[#101416] shadow-[0_16px_32px_rgba(15,23,42,0.06)]">
                  {clientInitials}
                </div>
                <h2 className="mt-6 text-[2.05rem] font-semibold leading-[0.95] tracking-tight text-[#101416]">
                  {fullName}
                </h2>
                <p className="mt-3 text-base font-medium text-[#2e5b97]">
                  {editData.email || 'E-mail non renseigne'}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                  <span className="rounded-full border border-[#d9dee4] bg-white/92 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3f565f]">
                    {preferredService}
                  </span>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <SidebarInfoRow icon="call" label="Telephone" value={editData.phone || 'Non renseigne'} />
                <SidebarInfoRow icon="location_on" label="Adresse" value={getAddress(editData)} />
                <SidebarInfoRow icon="shield" label="Assurance" value={editData.insurance || 'Non renseignee'} />
                {ageLabel && <SidebarInfoRow icon="cake" label="Age" value={ageLabel} />}

                <div className="border-t border-[#d9dee4] pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8fa1b2]">
                    Resume
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3f565f]">
                    {headerSummary || 'Dossier patient disponible pour le suivi, les notes et l’historique des seances.'}
                  </p>
                </div>

                <div className="grid gap-3 pt-3">
                  <button
                    onClick={() => document.getElementById('client-billing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="flex items-center justify-center gap-2 rounded-[18px] border border-[#d9dee4] bg-white px-5 py-4 text-sm font-semibold text-[#1d292e] transition-all hover:border-[#bdd0e5] hover:bg-[#f7f4ec] hover:text-[#312e81]"
                  >
                    {materialIcon('payments')}
                    Voir factures
                  </button>
                  <button
                    onClick={() => onScheduleClient(client)}
                    className={`flex items-center justify-center gap-2 ${dashboardPrimaryButton}`}
                  >
                    {materialIcon('add', true)}
                    Nouvelle seance
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-[16px] border border-[#d9dee4] bg-white/88 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3f565f] transition-all duration-200 hover:border-[#bdd0e5] hover:bg-[#f7f4ec] hover:text-[#312e81]"
                  >
                    Retour
                  </button>
                </div>
              </div>
            </section>

            <section className={`${dashboardPanel} p-5`}>
              <SectionHeader icon="edit_square" title="Modifier le profil" />
              <div className="grid grid-cols-1 gap-2 rounded-[22px] border border-[#d9dee4] bg-white/80 p-3 sm:grid-cols-2 xl:grid-cols-1">
                <EditableField label="Prenom" value={editData.firstName || ''} onChange={(value) => updateField('firstName', value)} />
                <EditableField label="Nom" value={editData.lastName || ''} onChange={(value) => updateField('lastName', value)} />
                <EditableField label="E-mail" value={editData.email || ''} onChange={(value) => updateField('email', value)} type="email" className="sm:col-span-2 xl:col-span-1" />
                <EditableField label="Telephone" value={editData.phone || ''} onChange={(value) => updateField('phone', value)} />
                <EditableField label="Date de naissance" value={editData.birthDate || ''} onChange={(value) => updateField('birthDate', value)} type="date" />
                <EditableField label="Rue" value={editData.street || ''} onChange={(value) => updateField('street', value)} className="sm:col-span-2 xl:col-span-1" />
                <EditableField label="NPA" value={editData.zip || ''} onChange={(value) => updateField('zip', value)} />
                <EditableField label="Ville" value={editData.city || ''} onChange={(value) => updateField('city', value)} />
                <EditableField label="Canton" value={editData.canton || ''} onChange={(value) => updateField('canton', value)} />
                <EditableField label="Assurance" value={editData.insurance || ''} onChange={(value) => updateField('insurance', value)} />
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className={`${dashboardPanel} p-6`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8fa1b2]">
                    Parcours patient
                  </p>
                  <h3 className="mt-2 text-[2.2rem] font-semibold italic leading-none tracking-tight text-[#101416]">
                    Prochains soins
                  </h3>
                </div>
                {urgencyCount > 0 ? (
                  <span className="rounded-full border border-[#bdd0e5] bg-[#e8f2ee] px-4 py-2 text-sm font-semibold text-[#184f40]">
                    {urgencyCount} alerte{urgencyCount > 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>

              {upcomingAppts.length > 0 ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {upcomingAppts.map(({ appt }, index) => (
                    <UpcomingSessionCard
                      key={appt.id}
                      appt={appt}
                      index={index}
                      onOpen={() => onSelectAppt(appt)}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyBlock icon="event_busy" label="Aucun prochain soin planifie pour le moment." compact />
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  label="Solde client"
                  icon="payments"
                  value={totalDue > 0 ? formatMoney(totalDue) : 'Aucun impaye'}
                  accent={totalDue > 0 ? 'primary' : 'neutral'}
                />
              </div>
            </section>

            <section
              id="client-history"
              className={`overflow-hidden ${dashboardPanel}`}
            >
            <div className={dashboardTableSectionHeader}>
              <SectionHeader icon="history" title="Historique des seances" noMargin />
              <button
                onClick={() => document.getElementById('client-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e5b97] hover:underline"
              >
                Journal complet
              </button>
            </div>

            {completedAppts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className={`border-b border-[#d9dee4] ${dashboardTableHeader}`}>
                    <tr>
                      <th className={dashboardTableCell}>Soin</th>
                      <th className={dashboardTableCell}>Date</th>
                      <th className={dashboardTableCell}>Heure</th>
                      <th className={dashboardTableCell}>Duree</th>
                      <th className={dashboardTableCell}>Paiement</th>
                      <th className={`${dashboardTableCell} text-right`}>Voir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d9dee4] text-sm">
                    {completedAppts.map((appt) => (
                      <tr
                        key={appt.id}
                        onClick={() => onSelectAppt(appt)}
                        className="cursor-pointer transition-colors hover:bg-[#f7f4ec]"
                      >
                        <td className={`${dashboardTableCell} font-medium text-[#101416]`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[#2e5b97]">{materialIcon('spa')}</span>
                            <span>{appt.serviceName || 'Seance'}</span>
                          </div>
                        </td>
                        <td className={`${dashboardTableCell} text-[#3f565f]`}>{appt.date ? formatDisplayDate(appt.date) : '—'}</td>
                        <td className={`${dashboardTableCell} text-[#3f565f]`}>{appt.time || '—'}</td>
                        <td className={`${dashboardTableCell} text-[#3f565f]`}>{appt.duration || '60 min'}</td>
                        <td className={dashboardTableCell}>
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            appt.paid
                              ? 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]'
                              : 'border border-[#fecaca] bg-[#fff1f2] text-[#be123c]'
                          }`}>
                            {appt.paid ? 'Regle' : appt.price ? `${appt.price} CHF` : 'A regler'}
                          </span>
                        </td>
                        <td className={`${dashboardTableCell} text-right text-[#8fa1b2]`}>
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
              <div className="border-t border-[#d9dee4] bg-[#fbfcff] px-6 py-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fa1b2]">
                  Seances incompletes
                </p>
                <div className="space-y-2">
                  {incompleteAppts.map((appt) => (
                    <button
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className="flex w-full items-center justify-between rounded-[18px] border border-[#d9dee4] bg-white px-4 py-3 text-left transition-colors hover:bg-[#f7f4ec]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#101416]">{appt.serviceName || 'Seance incomplete'}</p>
                        <p className="mt-1 text-xs text-[#3f565f]">Date ou heure manquante</p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} className="text-[#8fa1b2]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className={`flex flex-col p-6 ${dashboardPanel}`}>
                <div className="mb-4 flex items-center justify-between border-b border-[#d9dee4] pb-4">
                  <SectionHeader icon="clinical_notes" title="Notes de suivi" noMargin />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bdd0e5] bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#184f40]">
                    <ShieldCheck size={12} strokeWidth={1.7} />
                    Confidentiel
                  </span>
                </div>

                <div className="mb-5 rounded-[24px] border border-[#d9dee4] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="mb-2 flex items-center gap-2 text-[#2e5b97]">
                    {materialIcon('psychiatry')}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">Directive praticien</p>
                  </div>
                  <p className="border-l-2 border-[#84cc16] pl-4 text-sm leading-6 text-[#3f565f]">
                    {getDirective(client.notes)}
                  </p>
                </div>

                <p className="mb-4 text-sm leading-6 text-[#3f565f]">
                  Vos notes cliniques restent privees et servent de fil conducteur pour le suivi, les zones de tension et les recommandations post-seance.
                </p>

                <textarea
                  id="client-notes"
                  value={client.notes || ''}
                  onChange={(e) => onUpdateClient(client.id, { notes: e.target.value })}
                  placeholder="Renseignez ici les observations de seance, zones de tension, recommandations et plan de suivi..."
                  className="min-h-[320px] flex-1 resize-none rounded-[24px] border border-[#d9dee4] bg-[#f7f4ec] p-5 text-sm leading-7 text-[#101416] outline-none transition focus:border-[#2e5b97] focus:ring-4 focus:ring-[#2e5b97]/12"
                />

                <div className="mt-4 flex items-center justify-between border-t border-[#d9dee4] pt-4">
                  <p className="text-xs text-[#3f565f]">
                    {client.notes?.trim() ? `${client.notes.trim().length} caracteres enregistres` : 'Aucune note enregistree'}
                  </p>
                  <button
                    onClick={() => {
                      const notesEl = document.getElementById('client-notes');
                      notesEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      if (notesEl instanceof HTMLTextAreaElement) notesEl.focus();
                    }}
                    className="rounded-full bg-gradient-to-r from-[#184f40] to-[#2e5b97] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(99,102,241,0.2)] transition-opacity hover:opacity-95"
                  >
                    Continuer l'edition
                  </button>
                </div>
              </section>

              <div id="client-billing" className="space-y-6">
                <div className={`${dashboardPanel} p-6`}>
                  <SectionHeader icon="payments" title="Synthese facturation" />

                  <div className="grid grid-cols-1 gap-4">
                    <BillingStat label="Total encaisse" value={formatMoney(totalPaid)} />
                    <BillingStat label="Montant du" value={formatMoney(totalDue)} alert={totalDue > 0} />
                    <BillingStat label="Factures en attente" value={String(unpaidCount)} />
                    <SummaryChip label="Chiffre genere" value={formatMoney(totalRevenue)} />
                  </div>
                </div>

                <div className={`${dashboardPanel} p-6`}>
                  <SectionHeader icon="warning" title="Paiements en attente" />

                  {unpaidAppts.length > 0 ? (
                    <div className="space-y-3">
                      {unpaidAppts.map((appt) => (
                        <div key={appt.id} className="rounded-[22px] border border-[#fecaca] bg-[linear-gradient(135deg,#fff1f2,#ffffff)] px-4 py-4">
                          <p className="text-sm font-medium text-[#101416]">{appt.serviceName || 'Seance'}</p>
                          <p className="mt-1 text-xs text-[#3f565f]">
                            {appt.date ? formatDisplayDate(appt.date) : 'Date a confirmer'}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#be123c]">A relancer</span>
                            <span className="text-sm font-semibold text-[#be123c]">{formatMoney(appt.price || 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyBlock icon="task_alt" label="Aucun paiement en attente." compact />
                  )}
                </div>

                <div className={`${dashboardPanel} p-6`}>
                  <SectionHeader icon="receipt_long" title="Historique paiements" />

                  {paidAppts.length > 0 ? (
                    <div className="space-y-3">
                      {paidAppts.slice(0, 8).map((appt) => (
                        <div key={appt.id} className="rounded-[22px] border border-[#d9dee4] bg-[#fbfcff] px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-[#101416]">{appt.serviceName || 'Seance'}</p>
                              <p className="mt-1 text-xs text-[#3f565f]">
                                {appt.date ? formatDisplayDate(appt.date) : 'Date non definie'}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-[#101416]">{formatMoney(appt.price || 0)}</span>
                          </div>
                          {appt.paymentMethod && (
                            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#2e5b97]">
                              {appt.paymentMethod}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <CreditCard size={24} strokeWidth={1.4} className="mx-auto mb-3 text-[#c4cdd7]" />
                      <p className="text-sm text-[#3f565f]">Aucun paiement enregistre.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ icon, title, noMargin = false }: { icon: string; title: string; noMargin?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${noMargin ? '' : 'mb-4 border-b border-[#d9dee4] pb-3'}`}>
      <span className="text-[18px] text-[#2e5b97]">{materialIcon(icon)}</span>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#101416]">
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

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

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
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
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
          className="w-full rounded-[16px] border border-[#2e5b97] bg-white px-4 py-3 text-sm text-[#101416] outline-none ring-4 ring-[#2e5b97]/10"
        />
      ) : (
        <div
          onDoubleClick={startEdit}
          title={`Double-cliquer pour modifier ${label}`}
          className="flex min-h-[56px] cursor-text items-center rounded-[16px] border border-transparent bg-white/70 px-4 py-3 text-sm text-[#101416] transition group-hover:border-[#d9dee4] group-hover:bg-[#f7f4ec]"
        >
          {value ? <span>{value}</span> : <span className="italic text-[#8fa1b2]">{label}</span>}
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
      ? 'bg-[linear-gradient(135deg,#e8f2ee,#ffffff)] border-[#bdd0e5] text-[#184f40]'
      : accent === 'neutral'
        ? 'bg-[#f7f4ec] border-[#d9dee4] text-[#3f565f]'
        : 'bg-[#fbfcff] border-[#d9dee4] text-[#184f40]';

  return (
    <div className={`rounded-[22px] border p-4 ${toneClass}`}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fa1b2]">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-[16px]">{materialIcon(icon)}</span>
        <span className="text-sm font-medium text-[#101416]">{value}</span>
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
    <div className={`rounded-[18px] border px-4 py-3 ${tone === 'alert' ? 'border-[#fecaca] bg-[#fff1f2]' : 'border-[#d9dee4] bg-[#fbfcff]'}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fa1b2]">{label}</p>
      <p className={`text-sm font-medium ${tone === 'alert' ? 'text-[#be123c]' : 'text-[#3f565f]'}`}>{value}</p>
    </div>
  );
}

function BillingStat({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-[20px] border p-4 ${alert ? 'border-[#fecaca] bg-[linear-gradient(135deg,#fff1f2,#ffffff)]' : 'border-[#d9dee4] bg-[linear-gradient(135deg,#fbfcff,#ffffff)]'}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fa1b2]">{label}</p>
      <p className={`text-lg font-semibold ${alert ? 'text-[#be123c]' : 'text-[#101416]'}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyBlock({ icon, label, compact = false }: { icon: string; label: string; compact?: boolean }) {
  return (
    <div className={`text-center ${compact ? 'py-8' : 'py-16'}`}>
      <div className="mb-3 text-[#c4cdd7]">{materialIcon(icon)}</div>
      <p className="text-sm text-[#3f565f]">{label}</p>
    </div>
  );
}

function SidebarInfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#d9dee4] bg-white text-[#8fa1b2] shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
        {materialIcon(icon)}
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c4cdd7]">{label}</p>
        <p className="mt-1 text-[1.05rem] font-medium leading-snug text-[#101416]">{value}</p>
      </div>
    </div>
  );
}

function UpcomingSessionCard({
  appt,
  index,
  onOpen,
}: {
  appt: Appointment;
  index: number;
  onOpen: () => void;
}) {
  const tones = [
    'bg-[#dbe7ff] border-[#bdd0e5]',
    'bg-[#ead8ff] border-[#ddd6fe]',
  ];

  return (
    <button
      onClick={onOpen}
      className={`rounded-[40px] border p-6 text-left transition-transform hover:-translate-y-[1px] ${tones[index % tones.length]}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.95rem] font-semibold tracking-[0.14em] text-[#6b7280]">
          {appt.time || '--:--'} {appt.duration ? `• ${appt.duration}` : ''}
        </p>
        <span className="rounded-full bg-white/70 px-3 py-2 text-[#101416] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          {materialIcon('more_vert')}
        </span>
      </div>

      <p className="mt-12 text-[2rem] font-semibold leading-[1.02] tracking-tight text-[#111827]">
        {appt.serviceName || 'Seance'}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <span className="rounded-full bg-black px-5 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-white">
          {appt.paid ? 'Paye' : 'Planifie'}
        </span>
        <span className="text-lg font-medium text-[#6b7280]">
          {appt.price ? `${appt.price} CHF` : 'A confirmer'}
        </span>
      </div>
    </button>
  );
}
