import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, ArrowUpDown, Users, Download, GitPullRequest, Phone, MapPin,
  X, Trash2, NotebookText, CalendarDays, BarChart3,
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format, differenceInCalendarDays, endOfMonth, isWithinInterval, startOfMonth, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardChip, dashboardPanel, dashboardPanelSoft, dashboardPrimaryButton, dashboardSecondaryButton, dashboardTitle, dashboardTitleLg } from './dashboardTheme';

type FilterKey = 'all' | 'new' | 'loyalty' | 'hiatus';
type SortDir = 'asc' | 'desc';
type ClientStatus = 'new' | 'loyalty' | 'hiatus' | 'active';

interface ColDef {
  id: string;
  label: string;
  minWidth: string;
  flex: string;
  align?: 'center' | 'start';
}

interface ClientSummary {
  fullName: string;
  searchText: string;
  sessionsCount: number;
  lastVisitDate: Date | null;
  lastVisitLabel: string;
  preferredRitual: string;
  status: ClientStatus;
}

const ALL_COLUMNS: ColDef[] = [
  { id: 'name', label: 'Nom', minWidth: '240px', flex: '2.2fr' },
  { id: 'status', label: 'Statut', minWidth: '140px', flex: '1.1fr' },
  { id: 'lastVisit', label: 'Dernière visite', minWidth: '120px', flex: '0.9fr' },
  { id: 'preferredRitual', label: 'Rituel préféré', minWidth: '220px', flex: '1.7fr' },
  { id: 'sessions', label: 'Séances', minWidth: '90px', flex: '0.7fr', align: 'center' },
  { id: 'email', label: 'E-mail', minWidth: '220px', flex: '1.7fr' },
  { id: 'phone', label: 'Téléphone', minWidth: '140px', flex: '1fr' },
  { id: 'city', label: 'Ville', minWidth: '140px', flex: '1fr' },
  { id: 'insurance', label: 'Assurance', minWidth: '160px', flex: '1.1fr' },
];

const FILTERS: Array<{ id: FilterKey; label: string }> = [
  { id: 'all', label: 'Tous les clients' },
  { id: 'new', label: 'Nouveaux clients' },
  { id: 'loyalty', label: 'Clients fidèles' },
  { id: 'hiatus', label: 'En pause' },
];

const STATUS_META: Record<ClientStatus, { label: string; className: string }> = {
  loyalty: {
    label: 'Client fidèle',
    className: 'bg-[#ffddb2] text-[#594323]',
  },
  new: {
    label: 'Nouveau client',
    className: 'bg-[#d4e8d2] text-[#3a4b3b]',
  },
  hiatus: {
    label: 'En pause',
    className: 'bg-[#e3e2e0] text-[#434842]',
  },
  active: {
    label: 'Client actif',
    className: 'bg-[#efeeec] text-[#435544]',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

interface ClientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: (initialName?: string) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
  onDeleteClients?: (ids: string[]) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showFilterPanel: boolean;
  onShowFilterPanelChange: (value: boolean) => void;
  onVisibleCountChange?: (count: number) => void;
}

function parseAppointmentDate(date?: string): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getClientStatus(sessionsCount: number, lastVisitDate: Date | null): ClientStatus {
  if (!lastVisitDate || differenceInCalendarDays(new Date(), lastVisitDate) > 90) return 'hiatus';
  if (sessionsCount >= 8) return 'loyalty';
  if (sessionsCount <= 2) return 'new';
  return 'active';
}

function formatMetricPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}%`;
}

export default function ClientsPage({
  clients,
  appointments,
  onSelectClient,
  onNewClient,
  onMergeClients,
  onDeleteClients,
  searchQuery,
  onSearchQueryChange,
  showFilterPanel,
  onShowFilterPanelChange,
  onVisibleCountChange,
}: ClientsPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ['name', 'status', 'lastVisit', 'preferredRitual', 'sessions'],
  );
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const search = searchQuery;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onShowFilterPanelChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onShowFilterPanelChange]);

  const summaryByClient = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();

    appointments.forEach((appt) => {
      if (!appt.clientId) return;
      const current = grouped.get(appt.clientId) || [];
      current.push(appt);
      grouped.set(appt.clientId, current);
    });

    const summaryMap = new Map<string, ClientSummary>();

    clients.forEach((client) => {
      const clientAppts = grouped.get(client.id) || [];
      const datedAppts = clientAppts
        .map((appt) => ({ appt, date: parseAppointmentDate(appt.date) }))
        .filter((entry): entry is { appt: Appointment; date: Date } => !!entry.date)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      const lastVisitDate = datedAppts[0]?.date || null;
      const ritualCounts = clientAppts.reduce((acc, appt) => {
        if (!appt.serviceName) return acc;
        acc[appt.serviceName] = (acc[appt.serviceName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const preferredRitual = Object.entries(ritualCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucune préférence pour le moment';
      const sessionsCount = clientAppts.length;
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
      const status = getClientStatus(sessionsCount, lastVisitDate);
      const lastVisitLabel = lastVisitDate ? format(lastVisitDate, 'd MMM yyyy') : 'Aucune visite';

      summaryMap.set(client.id, {
        fullName,
        searchText: [
          fullName,
          client.email,
          client.phone,
          client.city,
          client.canton,
          client.insurance,
          preferredRitual,
          STATUS_META[status].label,
        ].filter(Boolean).join(' ').toLowerCase(),
        sessionsCount,
        lastVisitDate,
        lastVisitLabel,
        preferredRitual,
        status,
      });
    });

    return summaryMap;
  }, [appointments, clients]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = { all: clients.length, new: 0, loyalty: 0, hiatus: 0 };
    clients.forEach((client) => {
      const summary = summaryByClient.get(client.id);
      if (!summary) return;
      if (summary.status === 'new') counts.new += 1;
      if (summary.status === 'loyalty') counts.loyalty += 1;
      if (summary.status === 'hiatus') counts.hiatus += 1;
    });
    return counts;
  }, [clients, summaryByClient]);

  const filtered = useMemo(() =>
    clients
      .filter((client) => {
        const summary = summaryByClient.get(client.id);
        if (!summary) return false;
        const matchesSearch = summary.searchText.includes(search.trim().toLowerCase());
        const matchesFilter = activeFilter === 'all' ? true : summary.status === activeFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const summaryA = summaryByClient.get(a.id);
        const summaryB = summaryByClient.get(b.id);
        if (!summaryA || !summaryB) return 0;

        let valueA: string | number = '';
        let valueB: string | number = '';

        switch (sortField) {
          case 'name':
            valueA = summaryA.fullName;
            valueB = summaryB.fullName;
            break;
          case 'status':
            valueA = ['new', 'active', 'loyalty', 'hiatus'].indexOf(summaryA.status);
            valueB = ['new', 'active', 'loyalty', 'hiatus'].indexOf(summaryB.status);
            break;
          case 'lastVisit':
            valueA = summaryA.lastVisitDate?.getTime() || 0;
            valueB = summaryB.lastVisitDate?.getTime() || 0;
            break;
          case 'preferredRitual':
            valueA = summaryA.preferredRitual;
            valueB = summaryB.preferredRitual;
            break;
          case 'sessions':
            valueA = summaryA.sessionsCount;
            valueB = summaryB.sessionsCount;
            break;
          default:
            valueA = String(a[sortField as keyof Client] || '');
            valueB = String(b[sortField as keyof Client] || '');
        }

        const result = typeof valueA === 'string'
          ? String(valueA).localeCompare(String(valueB))
          : Number(valueA) - Number(valueB);

        return sortDir === 'asc' ? result : -result;
      }),
    [activeFilter, clients, search, sortDir, sortField, summaryByClient],
  );

  const toggleSort = useCallback((id: string) => {
    if (sortField === id) {
      setSortDir((prev) => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(id);
      setSortDir('asc');
    }
  }, [sortField]);

  const toggleClient = useCallback((id: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const gridTemplate = useMemo(() => {
    const cols = visibleColumns.map((colId) => {
      const col = ALL_COLUMNS.find((entry) => entry.id === colId);
      return col ? `minmax(${col.minWidth}, ${col.flex})` : 'minmax(120px, 1fr)';
    });
    return `56px ${cols.join(' ')} 120px`;
  }, [visibleColumns]);

  const handleMerge = useCallback(() => {
    const [primary, ...others] = Array.from(selectedClients);
    onMergeClients?.(primary, others);
    setSelectedClients(new Set());
  }, [onMergeClients, selectedClients]);

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedClients);
    if (confirm(`Voulez-vous vraiment supprimer ${ids.length} client(s) ? Cette action est irréversible.`)) {
      onDeleteClients?.(ids);
      setSelectedClients(new Set());
    }
  }, [onDeleteClients, selectedClients]);

  const handleSchedule = useCallback((client: Client) => {
    onNewClient(`${client.firstName || ''} ${client.lastName || ''}`.trim());
  }, [onNewClient]);

  const insights = useMemo(() => {
    const now = new Date();
    const currentMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
    const previousMonthDate = subMonths(now, 1);
    const previousMonth = {
      start: startOfMonth(previousMonthDate),
      end: endOfMonth(previousMonthDate),
    };

    const currentClientIds = new Set<string>();
    const previousClientIds = new Set<string>();
    appointments.forEach((appt) => {
      if (!appt.clientId) return;
      const date = parseAppointmentDate(appt.date);
      if (!date) return;
      if (isWithinInterval(date, currentMonth)) currentClientIds.add(appt.clientId);
      if (isWithinInterval(date, previousMonth)) previousClientIds.add(appt.clientId);
    });

    const growth = previousClientIds.size === 0
      ? (currentClientIds.size > 0 ? 100 : 0)
      : Math.round(((currentClientIds.size - previousClientIds.size) / previousClientIds.size) * 100);

    const activeClients = Array.from(summaryByClient.values()).filter((summary) => summary.sessionsCount > 0);
    const returningRate = activeClients.length === 0
      ? 0
      : Math.round((activeClients.filter((summary) => summary.sessionsCount > 1).length / activeClients.length) * 100);

    const avgSessions = activeClients.length === 0
      ? '0.0'
      : (activeClients.reduce((sum, summary) => sum + summary.sessionsCount, 0) / activeClients.length).toFixed(1);

    const monthlyTrend = Array.from({ length: 6 }, (_, idx) => {
      const date = subMonths(now, 5 - idx);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const uniqueClients = new Set<string>();

      appointments.forEach((appt) => {
        if (!appt.clientId) return;
        const apptDate = parseAppointmentDate(appt.date);
        if (!apptDate) return;
        if (isWithinInterval(apptDate, { start, end })) uniqueClients.add(appt.clientId);
      });

      return {
        label: format(date, 'MMM'),
        value: uniqueClients.size,
      };
    });

    const maxTrend = Math.max(...monthlyTrend.map((item) => item.value), 1);

    return {
      growth,
      returningRate,
      avgSessions,
      maxTrend,
      monthlyTrend,
    };
  }, [appointments, summaryByClient]);

  useEffect(() => {
    onVisibleCountChange?.(filtered.length);
  }, [filtered.length, onVisibleCountChange]);

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence>
        {showFilterPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => onShowFilterPanelChange(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="absolute right-4 top-28 z-50 w-[340px] rounded-[24px] border border-[#d9ddd7] bg-white p-5 shadow-[0_18px_40px_rgba(26,28,27,0.1)] lg:right-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#725a38]">Affichage</p>
                  <h3 className="mt-1 font-['Public_Sans',sans-serif] text-lg font-semibold text-[#1a1c1b]">
                    Contrôles du répertoire
                  </h3>
                </div>
                <button
                  onClick={() => onShowFilterPanelChange(false)}
                  className="rounded-full p-2 text-[#747872] transition-colors hover:bg-[#efeeec]"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#747872]">Tri</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_COLUMNS.filter((col) => col.id !== 'insurance').map((col) => (
                      <button
                        key={col.id}
                        onClick={() => toggleSort(col.id)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                          sortField === col.id
                            ? 'border-[#435544] bg-[#435544]/8 text-[#435544]'
                            : 'border-[#e3e2e0] text-[#434842] hover:bg-[#faf9f7]'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#747872]">Colonnes visibles</p>
                  <div className="space-y-2">
                    {ALL_COLUMNS.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => setVisibleColumns((prev) =>
                          prev.includes(col.id)
                            ? prev.filter((id) => id !== col.id)
                            : [...prev, col.id],
                        )}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#e3e2e0] px-3 py-2 text-sm text-[#1a1c1b] transition-colors hover:bg-[#faf9f7]"
                      >
                        <span>{col.label}</span>
                        <div className={`h-4 w-4 rounded border ${visibleColumns.includes(col.id) ? 'border-[#435544] bg-[#435544]' : 'border-[#c3c8c0] bg-white'}`}>
                          {visibleColumns.includes(col.id) && <div className="mx-auto mt-[3px] h-1.5 w-1.5 rotate-45 bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedClients.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 60, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-[#d9ddd7] bg-[#435544] px-4 text-white lg:px-8"
          >
            <div className="flex h-[60px] items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {selectedClients.size} client{selectedClients.size > 1 ? 's' : ''} sélectionné{selectedClients.size > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
                {selectedClients.size > 1 && (
                  <button
                    onClick={handleMerge}
                    className="flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/18"
                  >
                    <GitPullRequest size={14} strokeWidth={1.75} />
                    Fusionner
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/18"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedClients(new Set())}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/12"
                >
                  <X size={14} strokeWidth={1.75} />
                  Effacer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-full gap-2 overflow-x-auto rounded-full border border-[#dde2db] bg-white p-1.5 shadow-[0_8px_24px_rgba(26,28,27,0.04)]">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-all ${
                    activeFilter === filter.id
                      ? 'bg-[#435544] text-white shadow-sm'
                      : 'text-[#5e655f] hover:bg-[#f4f3f1] hover:text-[#435544]'
                  }`}
                >
                  {filter.label} <span className="opacity-70">{filterCounts[filter.id]}</span>
                </button>
              ))}
            </div>

            <button className={`${dashboardSecondaryButton} flex items-center gap-2 self-start`}>
              <Download size={16} strokeWidth={1.75} />
              Download Full Report
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState search={search} onNewClient={onNewClient} />
          ) : (
            <>
              <div className={`hidden overflow-hidden lg:block ${dashboardPanel}`}>
                <div
                  className="grid items-center border-b border-[#e3e7e1] bg-[#f8f8f6] px-5 py-4"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <div className="flex justify-center">
                    <Checkbox
                      checked={selectedClients.size === filtered.length && filtered.length > 0}
                      onChange={() => {
                        if (selectedClients.size === filtered.length && filtered.length > 0) {
                          setSelectedClients(new Set());
                          return;
                        }
                        setSelectedClients(new Set(filtered.map((client) => client.id)));
                      }}
                    />
                  </div>

                  {visibleColumns.map((colId) => {
                    const col = ALL_COLUMNS.find((entry) => entry.id === colId);
                    return (
                      <button
                        key={colId}
                        onClick={() => toggleSort(colId)}
                        className={`flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-[0.18em] text-[#747872] transition-colors hover:text-[#435544] ${
                          col?.align === 'center' ? 'justify-center' : 'justify-start'
                        }`}
                      >
                        {col?.label}
                        <ArrowUpDown size={12} strokeWidth={1.8} className={sortField === colId ? 'text-[#435544]' : 'opacity-50'} />
                      </button>
                    );
                  })}

                  <div className="px-2 text-right text-xs font-bold uppercase tracking-[0.18em] text-[#747872]">
                    Actions
                  </div>
                </div>

                <div className="divide-y divide-[#e9e8e6]">
                  {filtered.map((client) => {
                    const summary = summaryByClient.get(client.id);
                    if (!summary) return null;
                    return (
                      <ClientRow
                        key={client.id}
                        client={client}
                        summary={summary}
                        isSelected={selectedClients.has(client.id)}
                        visibleColumns={visibleColumns}
                        gridTemplate={gridTemplate}
                        onSelect={onSelectClient}
                        onToggle={toggleClient}
                        onSchedule={handleSchedule}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:hidden md:grid-cols-2">
                {filtered.map((client) => {
                  const summary = summaryByClient.get(client.id);
                  if (!summary) return null;
                  return (
                    <ClientCard
                      key={client.id}
                      client={client}
                      summary={summary}
                      isSelected={selectedClients.has(client.id)}
                      onSelect={onSelectClient}
                      onToggle={toggleClient}
                      onSchedule={handleSchedule}
                    />
                  );
                })}
              </div>

              <section className="space-y-5 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className={`${dashboardTitleLg} text-[#435544]`}>
                    Analyse de fidélisation
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <InsightCard
                    icon={<BarChart3 size={24} strokeWidth={1.75} />}
                    label="Croissance mensuelle"
                    value={formatMetricPercent(insights.growth)}
                    detail="vs mois précédent"
                  />
                  <InsightCard
                    icon={<Users size={24} strokeWidth={1.75} />}
                    label="Taux de retour"
                    value={`${insights.returningRate}%`}
                    detail="clients récurrents"
                  />
                  <InsightCard
                    icon={<CalendarDays size={24} strokeWidth={1.75} />}
                    label="Moy. séances"
                    value={insights.avgSessions}
                    detail="par client actif"
                  />
                  <TrendCard trend={insights.monthlyTrend} maxTrend={insights.maxTrend} />
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </motion.div>
  );
}

function Checkbox({
  checked,
  onChange,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex items-center justify-center rounded border transition-colors ${
        checked
          ? 'border-[#435544] bg-[#435544] text-white'
          : 'border-[#c3c8c0] bg-white text-transparent hover:border-[#435544]'
      }`}
    >
      <div className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} rotate-45 bg-current`} />
    </button>
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function RitualBadge({ label }: { label: string }) {
  return (
    <span className={dashboardChip + " inline-flex max-w-full truncate border-[#d4e8d2] bg-[#d4e8d2]/40 text-[#3a4b3b]"}>
      {label}
    </span>
  );
}

interface ClientRowProps {
  client: Client;
  summary: ClientSummary;
  isSelected: boolean;
  visibleColumns: string[];
  gridTemplate: string;
  onSelect: (client: Client) => void;
  onToggle: (id: string) => void;
  onSchedule: (client: Client) => void;
}

function ClientRow({
  client,
  summary,
  isSelected,
  visibleColumns,
  gridTemplate,
  onSelect,
  onToggle,
  onSchedule,
}: ClientRowProps) {
  return (
    <div
      onClick={() => onSelect(client)}
      className={`grid items-center px-5 py-4 transition-colors cursor-pointer ${
        isSelected ? 'bg-[#faf9f7]' : 'hover:bg-[#faf9f7]/50'
      }`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex justify-center">
        <Checkbox checked={isSelected} onChange={() => onToggle(client.id)} />
      </div>

      {visibleColumns.map((colId) => (
        <div key={colId} className="px-2">
          {renderDesktopCell(colId, client, summary)}
        </div>
      ))}

      <div className="flex items-center justify-end gap-2 px-2">
        <ActionIconButton
          label="Voir les notes"
          tone="muted"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(client);
          }}
        >
          <NotebookText size={16} strokeWidth={1.75} />
        </ActionIconButton>
        <ActionIconButton
          label="Planifier"
          tone="primary"
          onClick={(e) => {
            e.stopPropagation();
            onSchedule(client);
          }}
        >
          <CalendarDays size={16} strokeWidth={1.75} />
        </ActionIconButton>
      </div>
    </div>
  );
}

function renderDesktopCell(colId: string, client: Client, summary: ClientSummary) {
  switch (colId) {
    case 'name':
      return (
        <div className="min-w-0">
          <p className="truncate font-bold text-[#1a1c1b] transition-colors group-hover:text-[#435544]">
            {summary.fullName}
          </p>
          <p className="truncate text-xs text-[#747872]">{client.email || 'Aucun e-mail renseigné'}</p>
        </div>
      );
    case 'status':
      return <StatusBadge status={summary.status} />;
    case 'lastVisit':
      return <span className="text-sm text-[#1a1c1b]">{summary.lastVisitLabel}</span>;
    case 'preferredRitual':
      return <RitualBadge label={summary.preferredRitual} />;
    case 'sessions':
      return <div className="flex justify-center"><span className="text-sm font-bold text-[#435544]">{summary.sessionsCount}</span></div>;
    case 'email':
      return <span className="truncate text-sm text-[#434842]">{client.email || '—'}</span>;
    case 'phone':
      return <span className="text-sm text-[#434842]">{client.phone || '—'}</span>;
    case 'city':
      return <span className="text-sm text-[#434842]">{client.city || '—'}</span>;
    case 'insurance':
      return <span className="truncate text-sm text-[#434842]">{client.insurance || '—'}</span>;
    default:
      return null;
  }
}

function ClientCard({
  client,
  summary,
  isSelected,
  onSelect,
  onToggle,
  onSchedule,
}: {
  client: Client;
  summary: ClientSummary;
  isSelected: boolean;
  onSelect: (client: Client) => void;
  onToggle: (id: string) => void;
  onSchedule: (client: Client) => void;
}) {
  return (
    <div
      onClick={() => onSelect(client)}
      className={`cursor-pointer rounded-[24px] border p-6 shadow-[0_10px_30px_rgba(26,28,27,0.04)] transition-all ${
        isSelected
          ? 'border-[#435544] bg-[#faf9f7]'
          : 'border-[#d9ddd7] bg-white active:scale-[0.99]'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-[#1a1c1b]">{summary.fullName}</h3>
          <div className="mt-2">
            <StatusBadge status={summary.status} />
          </div>
        </div>
        <Checkbox checked={isSelected} onChange={() => onToggle(client.id)} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#747872]">Dernière visite</span>
          <span className="font-medium text-[#1a1c1b]">{summary.lastVisitLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#747872]">Rituel préféré</span>
          <div className="max-w-[60%] text-right"><RitualBadge label={summary.preferredRitual} /></div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#747872]">Total séances</span>
          <span className="font-bold text-[#435544]">{summary.sessionsCount}</span>
        </div>
        <div className="flex items-center gap-2 text-[#434842]">
          <Phone size={14} strokeWidth={1.75} className="text-[#747872]" />
          <span>{client.phone || 'Aucun téléphone'}</span>
        </div>
        <div className="flex items-center gap-2 text-[#434842]">
          <MapPin size={14} strokeWidth={1.75} className="text-[#747872]" />
          <span>{client.city || 'Ville inconnue'}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#efeeec] pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(client);
          }}
          className="rounded-xl border border-[#c8cdc6] px-4 py-2.5 text-sm font-bold text-[#435544] transition-colors hover:bg-[#f4f3f1]"
        >
          Voir les notes
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSchedule(client);
          }}
          className={`${dashboardPrimaryButton} rounded-xl px-4 py-2.5 text-sm`}
        >
          Planifier
        </button>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className={`${dashboardPanelSoft} relative overflow-hidden p-6`}>
      <div className="relative z-10">
        <p className="text-sm font-medium text-[#747872]">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#435544]">{value}</span>
        <span className="text-xs font-bold text-[#5b6d5b]/70">{detail}</span>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 opacity-10 text-[#435544]">
        {icon}
      </div>
    </div>
  );
}

function ActionIconButton({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: 'muted' | 'primary';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  const className = tone === 'primary'
    ? 'rounded-lg p-2 text-[#435544] transition-colors hover:bg-[#435544] hover:text-white'
    : 'rounded-lg p-2 text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#435544]';

  return (
    <div className="group relative flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1a1c1b] px-3 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function TrendCard({
  trend,
  maxTrend,
}: {
  trend: Array<{ label: string; value: number }>;
  maxTrend: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[24px] border border-[#ead5b5] bg-[#fcdaaf]/28 p-6 shadow-[0_10px_30px_rgba(26,28,27,0.03)]">
      <div>
        <p className="text-sm font-bold text-[#775e3c]">Analyse de tendance</p>
        <p className="mt-1 text-xs text-[#775e3c]/70">Clients actifs uniques sur les 6 derniers mois</p>
      </div>
      <div className="mt-5 flex h-14 items-end gap-1 px-1">
        {trend.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-sm bg-[#725a38]"
              style={{ height: `${Math.max((item.value / maxTrend) * 100, item.value > 0 ? 18 : 8)}%`, opacity: 0.35 + ((item.value / maxTrend) * 0.65) }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#775e3c]/70">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#775e3c]">
        Croissance de stabilité : {trend[trend.length - 1]?.value >= trend[0]?.value ? 'Positive' : 'À surveiller'}
      </p>
    </div>
  );
}

function EmptyState({ search, onNewClient }: { search: string; onNewClient: (s?: string) => void }) {
  return (
    <div className={`flex min-h-[420px] flex-col items-center justify-center gap-8 px-6 py-16 text-center ${dashboardPanel}`}>
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4f3f1]">
        <Users size={32} strokeWidth={1.2} className="text-[#747872]" />
      </div>
      <div className="space-y-3">
        <h2 className={dashboardTitleLg}>
          Aucun client trouvé
        </h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#747872]">
          {search
            ? `Aucun profil ne correspond à "${search}". Essayez une autre recherche ou créez une nouvelle fiche client.`
            : 'Votre répertoire est vide. Commencez par créer une fiche client ou réserver une première séance.'}
        </p>
      </div>
      <button
        onClick={() => onNewClient(search.trim() || undefined)}
        className={`${dashboardPrimaryButton} flex items-center gap-2 rounded-xl px-5 py-3 text-sm`}
      >
        <Plus size={16} strokeWidth={1.9} />
        Créer un client
      </button>
    </div>
  );
}
