import React, { useState, useMemo, useCallback } from 'react';
import {
  Download, Smartphone, CreditCard, Banknote, X,
  Trash2, Check, Printer, ChevronRight, Wallet, BadgeCheck,
  CircleDollarSign, TrendingUp, Search, Calendar,
  ArrowRight, BarChart3, PieChart, Zap, ShieldCheck
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Appointment, Invoice } from '../types';

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
    label: 'RÉGLÉ',
    className: 'bg-[var(--accent-teal)] text-emerald-600 border border-emerald-100/50',
  },
  pending: {
    label: 'EN ATTENTE',
    className: 'bg-[var(--accent-blue)] text-blue-600 border border-blue-100/50',
  },
  cancelled: {
    label: 'ANNULÉ',
    className: 'bg-red-50 text-red-400 border border-red-100',
  },
  late: {
    label: 'RETARD',
    className: 'bg-[var(--accent-orange)] text-orange-600 border border-orange-100/50',
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

function formatCurrency(value: number): string {
  return `${value.toLocaleString('fr-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} CHF`;
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

        const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
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
    [appointments, dateRange.end, dateRange.start, invoiceByAppointmentId, searchQuery, sortDir, sortField, todayStr],
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
        label: format(date, 'MMM').toUpperCase(),
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
  const gridTemplate = `56px minmax(140px, 1fr) minmax(200px, 1.5fr) minmax(200px, 1.5fr) minmax(140px, 1fr) 100px minmax(140px, 1fr)`;

  return (
    <div className="max-w-[1440px] mx-auto p-8 lg:p-16 space-y-20 bg-neutral-50 min-h-full">
      
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between border-b border-neutral-100 pb-10">
        <div>
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">ÉTATS FINANCIERS</p>
          <h1 className="text-6xl font-bold text-neutral-900 tracking-tight leading-none">Comptabilité</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em] mb-1">PÉRIODE</p>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-neutral-100 text-xs font-bold text-neutral-900 shadow-sm">
               <Calendar size={14} className="text-neutral-400" />
               {format(new Date(dateRange.start), 'd MMM')} — {format(new Date(dateRange.end), 'd MMM yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <MetricCard
          icon={<Wallet size={24} strokeWidth={2.5} />}
          label="Revenus Encaissés"
          value={formatCurrency(totalRevenue)}
          variant="blue"
        />
        <MetricCard
          icon={<BadgeCheck size={24} strokeWidth={2.5} />}
          label="Volume D'activité"
          value={String(completedSessions)}
          variant="teal"
        />
        <MetricCard
          icon={<CircleDollarSign size={24} strokeWidth={2.5} />}
          label="Encours Clients"
          value={formatCurrency(pendingInvoiceAmount)}
          variant="orange"
          isUrgent={pendingInvoiceAmount > 0}
        />
      </section>

      {/* ── Selection Toolbar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 80, opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="shrink-0 overflow-hidden rounded-[2.5rem] bg-neutral-900 p-6 text-white flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-8 ml-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">ACTIONS GROUPÉES</span>
              <p className="text-xl font-bold tracking-tight">
                {selectedIds.size} Transaction{selectedIds.size > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDelete}
                className="h-12 px-8 flex items-center gap-3 rounded-full bg-red-500 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg"
              >
                <Trash2 size={14} strokeWidth={2.5} /> SUPPRIMER
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="h-12 px-8 flex items-center gap-3 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
              >
                <X size={14} strokeWidth={2.5} /> ANNULER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content grid ── */}
      <section className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        {/* Transaction list */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-end justify-between border-b border-neutral-100 pb-8">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">JOURNAL DES OPÉRATIONS</p>
              <h4 className="text-4xl font-bold text-neutral-900 tracking-tight leading-none">Transactions</h4>
            </div>
          </div>

          <div className="space-y-6">
            {/* Table Header */}
            <div 
              className="grid items-center px-10 mb-4"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="flex justify-center">
                <TableCheckbox checked={allSelected} onChange={() => {
                  if (allSelected) setSelectedIds(new Set());
                  else setSelectedIds(new Set(filtered.map(c => c.id)));
                }} />
              </div>
              <HeaderBtn label="DATE" field="date" current={sortField} onSort={toggleSort} />
              <HeaderBtn label="PATIENT" field="client" current={sortField} onSort={toggleSort} />
              <HeaderBtn label="SOIN" field="serviceName" current={sortField} onSort={toggleSort} />
              <HeaderBtn label="STATUT" field="status" current={sortField} onSort={toggleSort} />
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300">PDF</div>
              <HeaderBtn label="MONTANT" field="price" current={sortField} onSort={toggleSort} align="right" />
            </div>

            <div className="space-y-4">
              {filtered.map(appt => {
                const status = getTransactionStatus(appt, todayStr);
                const meta = STATUS_META[status];
                const isSelected = selectedIds.has(appt.id);
                return (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    className={`grid w-full items-center px-10 py-7 rounded-[2rem] border border-neutral-100 bg-white shadow-sm transition-all hover:shadow-xl text-left group ${
                      isSelected ? 'border-neutral-900 shadow-xl' : ''
                    }`}
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    <div className="flex justify-center">
                      <TableCheckbox checked={isSelected} onChange={() => toggleSelection(appt.id)} />
                    </div>

                    <div className="text-sm font-bold text-neutral-900 tracking-tight">
                       {appt.date ? format(new Date(appt.date), 'dd.MM.yyyy') : '—'}
                    </div>

                    <div className="truncate pr-4 text-lg font-bold text-neutral-900 tracking-tight leading-none group-hover:text-blue-600 transition-all">
                       {getClientDisplayName(appt)}
                    </div>

                    <div className="truncate pr-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                       {appt.serviceName || 'Session'}
                    </div>

                    <div>
                       <span onClick={(e) => {
                         e.stopPropagation();
                         if (appt.paid) onTogglePayment(appt.id, true);
                         else setPayingId(appt.id);
                       }} className={`inline-flex rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer shadow-sm ${meta.className}`}>
                         {meta.label}
                       </span>
                    </div>

                    <div className="flex items-center">
                       <button onClick={(e) => { e.stopPropagation(); handleInvoiceOpen(appt); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 transition-all">
                         <Download size={16} strokeWidth={2.5} />
                       </button>
                    </div>

                    <div className="text-right text-xl font-bold text-neutral-900 tracking-tight">
                       {status === 'cancelled' ? '0 CHF' : formatCurrency(appt.price || 0)}
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-neutral-100 group">
                <Search size={48} strokeWidth={1} className="text-neutral-200 mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-300">AUCUNE TRANSACTION TROUVÉE</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics sidebar */}
        <div className="space-y-12">
          {/* Revenue Chart */}
          <div className="bg-white border border-neutral-100 rounded-[3.5rem] p-12 shadow-xl space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">TENDANCES</p>
                <h4 className="text-4xl font-bold text-neutral-900 tracking-tight">Revenus</h4>
              </div>
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-300 shadow-inner">
                <BarChart3 size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex h-48 items-end gap-3 px-2">
              {recentTrend.months.map((month) => (
                <div key={month.label} className="flex flex-1 flex-col items-center gap-4 group">
                  <div className="w-full relative flex flex-col items-center justify-end">
                    <div 
                      className="w-full rounded-full bg-neutral-900 transition-all duration-700 shadow-lg"
                      style={{ 
                        height: `${Math.max((month.value / recentTrend.max) * 160, 8)}px`,
                        opacity: 0.1 + ((month.value / recentTrend.max) * 0.9)
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-[0.1em] group-hover:text-neutral-900 transition-colors">{month.label}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-neutral-50">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.3em]">TOTAL 6 MOIS</p>
                  <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                    {formatCurrency(recentTrend.months.reduce((s, m) => s + m.value, 0))}
                  </p>
               </div>
               <p className="text-[11px] font-medium text-neutral-400 leading-relaxed">
                 Croissance de <span className="text-emerald-500 font-bold">+14%</span> par rapport au semestre précédent.
               </p>
            </div>
          </div>

          {/* Allocation card */}
          <div className="bg-neutral-900 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
               <PieChart size={180} strokeWidth={1} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">RÉPARTITION</p>
              <h4 className="text-4xl font-bold text-white tracking-tight">Services</h4>
            </div>

            <div className="space-y-8 relative z-10">
              {serviceAllocations.map((service, idx) => (
                <div key={service.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] truncate max-w-[140px]">{service.label}</span>
                    <span className="text-lg font-bold text-white tracking-tight">{service.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${service.percent}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  variant = 'default',
  isUrgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'teal' | 'default';
  isUrgent?: boolean;
}) {
  const iconCircleStyles = {
    blue: 'bg-blue-50 text-blue-500',
    yellow: 'bg-yellow-50 text-yellow-500',
    orange: isUrgent ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500',
    pink: 'bg-pink-50 text-pink-500',
    teal: 'bg-emerald-50 text-emerald-500',
    default: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <div className="group rounded-[2.5rem] border border-neutral-100 bg-white p-8 transition-all hover:shadow-2xl hover:border-neutral-200">
      <div className="mb-8 flex items-center justify-between">
        <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-transform group-hover:scale-110 ${iconCircleStyles[variant]}`}>
          {icon}
        </div>
        <ChevronRight size={18} className="text-neutral-200 group-hover:text-neutral-900 transition-colors" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
      <h3 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 leading-none">{value}</h3>
    </div>
  );
}

function TableCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`h-7 w-7 flex items-center justify-center rounded-full border-2 transition-all ${
        checked ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-transparent hover:border-neutral-300'
      }`}
    >
      <ShieldCheck size={14} strokeWidth={3} className={checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} />
    </button>
  );
}

function HeaderBtn({ label, field, current, onSort, align = 'left' }: {
  label: string;
  field: SortField;
  current: SortField;
  onSort: (f: SortField) => void;
  align?: 'left' | 'right';
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSort(field); }}
      className={`text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 hover:text-neutral-900 transition-all flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}
    >
      {label}
      {current === field && <ArrowRight size={10} strokeWidth={3} className="rotate-90" />}
    </button>
  );
}

