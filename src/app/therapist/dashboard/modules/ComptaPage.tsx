import React, { useState, useMemo, useCallback } from 'react';
import {
  Download, Smartphone, CreditCard, Banknote, X,
  Trash2, Check, Printer, ChevronRight, Wallet, BadgeCheck,
  CircleDollarSign, TrendingUp,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { Appointment, Invoice } from '../types';
import { dashboardPanel, dashboardPanelSoft, dashboardPrimaryButton, dashboardSecondaryButton, dashboardTableCell, dashboardTableHeader, dashboardTableSectionHeader, dashboardTitle, dashboardTitleLg } from './dashboardTheme';

interface ComptaPageProps {
  appointments: Appointment[];
  invoices: Invoice[];
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt: (appt: Appointment) => void;
  onDeleteInvoices?: (ids: string[]) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onSelectedCountChange: (count: number) => void;
}

type SortField = 'date' | 'client' | 'serviceName' | 'price' | 'status';
type PaymentMethod = 'Twint' | 'Card' | 'Cash';
type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'late';

const STATUS_META: Record<TransactionStatus, { label: string; className: string }> = {
  completed: {
    label: 'Réglé',
    className: 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
  },
  pending: {
    label: 'En attente',
    className: 'border border-[#fdba74] bg-[#fff7ed] text-[#c2410c]',
  },
  cancelled: {
    label: 'Annulé',
    className: 'border border-[#fecaca] bg-[#fff1f2] text-[#be123c]',
  },
  late: {
    label: 'En retard',
    className: 'border border-[#fecaca] bg-[#fff1f2] text-[#be123c]',
  },
};

function toComparableDate(date?: string): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTransactionStatus(appt: Appointment, todayStr: string): TransactionStatus {
  if (appt.status === 'cancelled') return 'cancelled';
  if (appt.paid) return 'completed';
  if (appt.date && appt.date < todayStr) return 'late';
  return 'pending';
}

function getClientDisplayName(appt: Appointment): string {
  return appt.clientNameSnapshot || appt.title || 'Client inconnu';
}

function getPaymentMethodLabel(method?: string): string {
  if (!method) return 'Non précisé';
  return method;
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function ComptaPage({
  appointments,
  invoices,
  onTogglePayment,
  onSelectAppt,
  onDeleteInvoices,
  searchQuery,
  onSearchQueryChange,
  dateRange,
  onSelectedCountChange,
}: ComptaPageProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [payingId, setPayingId] = useState<string | null>(null);
  const search = searchQuery;

  React.useEffect(() => {
    onSelectedCountChange(selectedIds.size);
  }, [selectedIds.size, onSelectedCountChange]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const invoiceByAppointmentId = useMemo(() => {
    const map = new Map<string, Invoice>();
    invoices.forEach((invoice) => {
      if (invoice.appointmentId) map.set(invoice.appointmentId, invoice);
    });
    return map;
  }, [invoices]);

  const filtered = useMemo(() =>
    appointments
      .filter((appt) => {
        const status = getTransactionStatus(appt, todayStr);
        const haystack = [
          getClientDisplayName(appt),
          appt.serviceName,
          appt.date,
          appt.time,
          appt.price,
          STATUS_META[status].label,
          invoiceByAppointmentId.get(appt.id)?.invoiceNumber,
          appt.paymentMethod,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch = haystack.includes(search.trim().toLowerCase());
        const inRange = appt.date
          ? appt.date >= dateRange.start && appt.date <= dateRange.end
          : false;

        return matchesSearch && inRange;
      })
      .sort((a, b) => {
        let valueA: string | number = '';
        let valueB: string | number = '';

        switch (sortField) {
          case 'date':
            valueA = `${a.date || ''} ${a.time || ''}`;
            valueB = `${b.date || ''} ${b.time || ''}`;
            break;
          case 'client':
            valueA = getClientDisplayName(a);
            valueB = getClientDisplayName(b);
            break;
          case 'serviceName':
            valueA = a.serviceName || 'Session';
            valueB = b.serviceName || 'Session';
            break;
          case 'price':
            valueA = a.price || 0;
            valueB = b.price || 0;
            break;
          case 'status': {
            const order = { cancelled: 0, late: 1, pending: 2, completed: 3 };
            valueA = order[getTransactionStatus(a, todayStr)];
            valueB = order[getTransactionStatus(b, todayStr)];
            break;
          }
          default:
            valueA = '';
            valueB = '';
        }

        const result = typeof valueA === 'string'
          ? String(valueA).localeCompare(String(valueB))
          : Number(valueA) - Number(valueB);

        return sortDir === 'asc' ? result : -result;
      }),
    [appointments, dateRange.end, dateRange.start, invoiceByAppointmentId, search, sortDir, sortField, todayStr],
  );

  const totalRevenue = useMemo(
    () => filtered
      .filter((appt) => getTransactionStatus(appt, todayStr) === 'completed')
      .reduce((sum, appt) => sum + (appt.price || 0), 0),
    [filtered, todayStr],
  );
  const completedSessions = useMemo(
    () => filtered.filter((appt) => getTransactionStatus(appt, todayStr) === 'completed').length,
    [filtered, todayStr],
  );
  const pendingInvoiceAmount = useMemo(
    () => filtered
      .filter((appt) => {
        const status = getTransactionStatus(appt, todayStr);
        return status === 'pending' || status === 'late';
      })
      .reduce((sum, appt) => sum + (appt.price || 0), 0),
    [filtered, todayStr],
  );

  const monthlyDelta = useMemo(() => {
    const now = new Date();
    const currentRange = { start: startOfMonth(now), end: endOfMonth(now) };
    const previousDate = subMonths(now, 1);
    const previousRange = { start: startOfMonth(previousDate), end: endOfMonth(previousDate) };

    const computeRevenue = (range: { start: Date; end: Date }) =>
      appointments.reduce((sum, appt) => {
        const date = toComparableDate(appt.date);
        if (!date || !isWithinInterval(date, range) || !appt.paid) return sum;
        return sum + (appt.price || 0);
      }, 0);

    const currentRevenue = computeRevenue(currentRange);
    const previousRevenue = computeRevenue(previousRange);

    if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0;
    return Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
  }, [appointments]);

  const serviceAllocations = useMemo(() => {
    const totals = filtered.reduce((acc, appt) => {
      if (getTransactionStatus(appt, todayStr) === 'cancelled') return acc;
      const key = appt.serviceName || 'Session';
      acc[key] = (acc[key] || 0) + (appt.price || 0);
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const grandTotal = entries.reduce((sum, [, value]) => sum + value, 0) || 1;

    return entries.map(([label, value]) => ({
      label,
      value,
      percent: Math.round((value / grandTotal) * 100),
    }));
  }, [filtered, todayStr]);

  const recentTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = subMonths(new Date(), 5 - index);
      const range = { start: startOfMonth(date), end: endOfMonth(date) };
      const total = appointments.reduce((sum, appt) => {
        const apptDate = toComparableDate(appt.date);
        if (!apptDate || !isWithinInterval(apptDate, range) || !appt.paid) return sum;
        return sum + (appt.price || 0);
      }, 0);

      return {
        label: format(date, 'MMM'),
        value: total,
      };
    });

    const max = Math.max(...months.map((month) => month.value), 1);
    return { months, max };
  }, [appointments]);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir((prev) => prev === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  const handleExport = useCallback(() => {
    const rows = selectedIds.size > 0
      ? filtered.filter((appt) => selectedIds.has(appt.id))
      : filtered;

    const csv = [
      ['Date', 'Client', 'Type de rituel', 'Statut', 'Facture', 'Montant'].join(','),
      ...rows.map((appt) => {
        const invoice = invoiceByAppointmentId.get(appt.id);
        return [
          appt.date || '',
          getClientDisplayName(appt),
          appt.serviceName || 'Session',
          STATUS_META[getTransactionStatus(appt, todayStr)].label,
          invoice?.invoiceNumber || '',
          appt.price || 0,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finances-${dateRange.start}-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [dateRange.end, dateRange.start, filtered, invoiceByAppointmentId, selectedIds, todayStr]);

  React.useEffect(() => {
    const triggerExport = () => handleExport();
    window.addEventListener('trigger-finance-export', triggerExport);
    return () => window.removeEventListener('trigger-finance-export', triggerExport);
  }, [handleExport]);

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (confirm(`Supprimer ${ids.length} transaction(s) ? Les rendez-vous et factures liés seront aussi supprimés.`)) {
      onDeleteInvoices?.(ids);
      setSelectedIds(new Set());
    }
  }, [onDeleteInvoices, selectedIds]);

  const handleInvoiceOpen = useCallback((appt: Appointment) => {
    const invoice = invoiceByAppointmentId.get(appt.id);
    window.open(`/therapist/invoice/${invoice?.id || appt.id}`, '_blank');
  }, [invoiceByAppointmentId]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafbfc]">

      {selectedIds.size > 0 && (
        <div className="shrink-0 border-b border-[#bdd0e5] bg-[linear-gradient(135deg,#184f40_0%,#2e5b97_100%)] px-4 py-3 text-white lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">
              {selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-[12px] bg-white/12 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/18"
              >
                <Trash2 size={14} strokeWidth={1.75} />
                Supprimer
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-2 rounded-[12px] border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/12"
              >
                <X size={14} strokeWidth={1.75} />
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <section className="mx-auto w-full max-w-7xl space-y-8 p-4 lg:p-8">
          <div className={`${dashboardPanel} overflow-hidden`}>
            <div className={dashboardTableSectionHeader}>
              <div>
                <h2 className={dashboardTitle}>Liste des factures</h2>
                <p className="mt-1 text-xs text-[#3f565f]">Toutes les transactions de la période en CHF</p>
              </div>
              <button
                onClick={() => {
                  onSearchQueryChange('');
                  setSelectedIds(new Set());
                }}
                className="text-xs font-semibold text-[#2e5b97] transition-colors hover:underline"
              >
                Tout voir
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className={dashboardTableHeader}>
                    <th className={dashboardTableCell}>
                      <TableCheckbox checked={allSelected} onChange={() => {
                        if (allSelected) setSelectedIds(new Set());
                        else setSelectedIds(new Set(filtered.map((appt) => appt.id)));
                      }} />
                    </th>
                    <SortableHeader label="Date" field="date" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Client" field="client" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Type de rituel" field="serviceName" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Statut" field="status" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <th className={dashboardTableCell}>Facture</th>
                    <SortableHeader align="right" label="Montant" field="price" current={sortField} dir={sortDir} onSort={toggleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d9dee4] text-xs">
                  {filtered.map((appt) => {
                    const invoice = invoiceByAppointmentId.get(appt.id);
                    const status = getTransactionStatus(appt, todayStr);
                    const meta = STATUS_META[status];
                    const isSelected = selectedIds.has(appt.id);

                    return (
                      <tr
                        key={appt.id}
                        className={`group transition-colors hover:bg-[#f7f4ec] ${isSelected ? 'bg-[#f7f4ec]' : ''}`}
                      >
                        <td className={dashboardTableCell}>
                          <TableCheckbox checked={isSelected} onChange={() => toggleSelection(appt.id)} />
                        </td>

                        <td className={`cursor-pointer text-[#3f565f] ${dashboardTableCell}`} onClick={() => onSelectAppt(appt)}>
                          {appt.date ? format(new Date(appt.date), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className={`cursor-pointer font-medium text-[#1d292e] ${dashboardTableCell}`} onClick={() => onSelectAppt(appt)}>
                          {getClientDisplayName(appt)}
                        </td>
                        <td className={`cursor-pointer text-[#3f565f] ${dashboardTableCell}`} onClick={() => onSelectAppt(appt)}>
                          {appt.serviceName || 'Session'}
                        </td>
                        <td className={dashboardTableCell}>
                          <div onClick={(e) => e.stopPropagation()}>
                            {payingId === appt.id ? (
                              <div className="flex items-center gap-1">
                                {(['Twint', 'Card', 'Cash'] as PaymentMethod[]).map((method) => (
                                  <button
                                    key={method}
                                    onClick={() => {
                                      onTogglePayment(appt.id, false, method);
                                      setPayingId(null);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#c4cdd7] bg-white text-[#3f565f] transition-colors hover:border-[#2e5b97] hover:bg-[#2e5b97] hover:text-white"
                                    title={method}
                                  >
                                    {method === 'Twint'
                                      ? <Smartphone size={13} strokeWidth={1.75} />
                                      : method === 'Card'
                                        ? <CreditCard size={13} strokeWidth={1.75} />
                                        : <Banknote size={13} strokeWidth={1.75} />}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setPayingId(null)}
                                  className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#c4cdd7] bg-white text-[#3f565f] transition-colors hover:border-[#ef4444] hover:text-[#ef4444]"
                                >
                                  <X size={13} strokeWidth={1.75} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => appt.paid ? onTogglePayment(appt.id, true) : setPayingId(appt.id)}
                                className={`inline-flex rounded-[999px] px-3 py-1 text-xs font-semibold ${meta.className}`}
                              >
                                {meta.label}
                                {appt.paymentMethod ? ` · ${getPaymentMethodLabel(appt.paymentMethod)}` : ''}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className={`${dashboardTableCell} text-[#3f565f]`}>
                          <button
                            onClick={() => handleInvoiceOpen(appt)}
                            disabled={status === 'cancelled'}
                            className={`rounded-[10px] p-2 transition-colors ${
                              status === 'cancelled'
                                ? 'cursor-not-allowed opacity-30'
                                : 'hover:bg-[#e8f2ee] hover:text-[#2e5b97]'
                            }`}
                            title={invoice?.invoiceNumber || 'Ouvrir la facture'}
                          >
                            <Download size={18} strokeWidth={1.8} />
                          </button>
                        </td>
                        <td className={`${dashboardTableCell} text-right font-semibold text-[#1d292e]`}>
                          {status === 'cancelled' ? formatCurrency(0) : formatCurrency(appt.price || 0)}
                          <div className="mt-1 flex justify-end gap-1">
                            <button
                              onClick={() => handleInvoiceOpen(appt)}
                              className="rounded-[10px] p-1.5 text-[#3f565f] transition-colors hover:bg-[#e8f2ee] hover:text-[#2e5b97]"
                              title="Imprimer ou ouvrir la facture"
                            >
                              <Printer size={14} strokeWidth={1.75} />
                            </button>
                            <button
                              onClick={() => onSelectAppt(appt)}
                              className="rounded-full p-1.5 text-[#3f565f] transition-colors hover:bg-[#e8f2ee] hover:text-[#2e5b97]"
                              title="Ouvrir le rendez-vous"
                            >
                              <ChevronRight size={14} strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                <Wallet size={22} strokeWidth={1.4} className="text-[#c4cdd7]" />
                <div>
                  <p className="text-xs font-medium text-[#1d292e]">Aucune transaction trouvée</p>
                  <p className="mt-0.5 text-xs text-[#3f565f]">
                    Ajustez la recherche ou la période pour afficher l'activité financière.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricCard
              icon={<Wallet size={20} strokeWidth={1.8} />}
              iconClassName="bg-[#dcfce7] text-[#15803d]"
              title="Revenu mensuel"
              value={formatCurrency(totalRevenue)}
              badge={monthlyDelta >= 0 ? `+${monthlyDelta}%` : `${monthlyDelta}%`}
              badgeIcon={<TrendingUp size={12} strokeWidth={2} />}
              badgeClassName="bg-[#ecfccb] text-[#4d7c0f]"
              compact
            />
            <MetricCard
              icon={<BadgeCheck size={20} strokeWidth={1.8} />}
              iconClassName="bg-[#e8f2ee] text-[#184f40]"
              title="Séances terminées"
              value={String(completedSessions)}
              compact
            />
            <MetricCard
              icon={<CircleDollarSign size={20} strokeWidth={1.8} />}
              iconClassName="bg-[#ffedd5] text-[#c2410c]"
              title="Factures en attente"
              value={formatCurrency(pendingInvoiceAmount)}
              compact
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className={`${dashboardPanel} p-5 lg:col-span-2`}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className={dashboardTitle}>Performance des revenus</h2>
                  <p className="mt-1 text-xs text-[#3f565f]">Revenus encaissés sur les 6 derniers mois</p>
                </div>
                <span className="rounded-full bg-[#e8f2ee] px-3 py-1 text-xs font-semibold text-[#184f40]">
                  Tendance
                </span>
              </div>

              <div className="flex h-44 items-end gap-3 rounded-xl bg-[#f7f4ec] px-4 py-5">
                {recentTrend.months.map((month) => (
                  <div key={month.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                    <div className="w-full text-center text-xs font-semibold text-[#3f565f]">
                      {month.value > 0 ? formatCurrency(month.value) : formatCurrency(0)}
                    </div>
                    <div
                      className="w-full rounded-t-md bg-[#2e5b97]"
                      style={{
                        height: `${Math.max((month.value / recentTrend.max) * 95, month.value > 0 ? 14 : 6)}px`,
                        opacity: 0.35 + ((month.value / recentTrend.max) * 0.65),
                      }}
                    />
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#3f565f]">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${dashboardPanelSoft} p-5`}>
              <div className="mb-6">
                <h2 className={dashboardTitle}>Répartition des services</h2>
                <p className="mt-1 text-xs text-[#3f565f]">Part des revenus par type de soin</p>
              </div>

              <div className="space-y-4">
                {serviceAllocations.length > 0 ? serviceAllocations.map((service, index) => (
                  <div key={service.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate text-xs font-medium text-[#1d292e]">{service.label}</span>
                      <span className="text-xs font-semibold text-[#2e5b97]">{service.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e8f2ee]">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${service.percent}%`,
                          backgroundColor: ['#2e5b97', '#334e72', '#f59e0b', '#84cc16'][index % 4],
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#3f565f]">{formatCurrency(service.value)}</div>
                  </div>
                )) : (
                  <div className="rounded-xl bg-[#f7f4ec] px-4 py-5 text-xs text-[#3f565f]">
                    Aucun revenu de service sur la période sélectionnée.
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>

        <footer className="px-8 pb-8 pt-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8fa1b2]">
            Serene Portal © 2023 | Au service de la pratique holistique
          </p>
        </footer>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  iconClassName,
  title,
  value,
  badge,
  badgeIcon,
  badgeClassName,
  compact = false,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  value: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  badgeClassName?: string;
  compact?: boolean;
}) {
  return (
    <div className={`${dashboardPanel} transition-shadow hover:shadow-md ${compact ? 'p-3' : 'p-5'}`}>
      <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
        <div className={`rounded-lg ${compact ? 'p-1' : 'p-1.5'} ${iconClassName}`}>
          {icon}
        </div>
        {badge && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClassName || ''}`}>
            {badgeIcon && <span className="mr-1">{badgeIcon}</span>}
            {badge}
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#3f565f]">{title}</p>
      <h3 className={`mt-0.5 font-semibold text-[#1d292e] ${compact ? 'text-xl' : 'text-2xl'}`}>{value}</h3>
    </div>
  );
}

function TableCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
        checked
          ? 'border-[#2e5b97] bg-[#2e5b97] text-white'
          : 'border-[#c4cdd7] bg-white text-transparent hover:border-[#2e5b97]'
      }`}
    >
      <Check size={10} strokeWidth={2.5} className="text-current" />
    </button>
  );
}

function SortableHeader({
  label,
  field,
  current,
  dir,
  onSort,
  align = 'left',
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
}) {
  return (
    <th className={`px-3 py-2.5 lg:px-6 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'} hover:text-[#2e5b97]`}
      >
        {label}
        <span className={current === field ? 'text-[#2e5b97]' : 'opacity-50'}>
          {dir === 'asc' || current !== field ? '↑' : '↓'}
        </span>
      </button>
    </th>
  );
}
