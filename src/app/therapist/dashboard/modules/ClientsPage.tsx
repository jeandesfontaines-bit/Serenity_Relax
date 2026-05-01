import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, Plus, ArrowUpDown, Users, Download, GitPullRequest, Phone, MapPin,
  X, Trash2, NotebookText, CalendarDays, BarChart3, SlidersHorizontal,
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format, differenceInCalendarDays, endOfMonth, isWithinInterval, startOfMonth, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'name', label: 'Name', minWidth: '240px', flex: '2.2fr' },
  { id: 'status', label: 'Status', minWidth: '140px', flex: '1.1fr' },
  { id: 'lastVisit', label: 'Last Visit', minWidth: '120px', flex: '0.9fr' },
  { id: 'preferredRitual', label: 'Preferred Ritual', minWidth: '220px', flex: '1.7fr' },
  { id: 'sessions', label: 'Sessions', minWidth: '90px', flex: '0.7fr', align: 'center' },
  { id: 'email', label: 'Email', minWidth: '220px', flex: '1.7fr' },
  { id: 'phone', label: 'Phone', minWidth: '140px', flex: '1fr' },
  { id: 'city', label: 'City', minWidth: '140px', flex: '1fr' },
  { id: 'insurance', label: 'Insurance', minWidth: '160px', flex: '1.1fr' },
];

const FILTERS: Array<{ id: FilterKey; label: string }> = [
  { id: 'all', label: 'All Clients' },
  { id: 'new', label: 'New Clients' },
  { id: 'loyalty', label: 'Loyalty Members' },
  { id: 'hiatus', label: 'On Hiatus' },
];

const STATUS_META: Record<ClientStatus, { label: string; className: string }> = {
  loyalty: {
    label: 'Loyalty Member',
    className: 'bg-[#ffddb2] text-[#594323]',
  },
  new: {
    label: 'New Client',
    className: 'bg-[#d4e8d2] text-[#3a4b3b]',
  },
  hiatus: {
    label: 'On Hiatus',
    className: 'bg-[#e3e2e0] text-[#434842]',
  },
  active: {
    label: 'Active Client',
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
}

function parseAppointmentDate(date?: string): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getClientInitials(client: Client): string {
  return `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase() || 'CL';
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
  clients, appointments, onSelectClient, onNewClient, onMergeClients, onDeleteClients,
}: ClientsPageProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ['name', 'status', 'lastVisit', 'preferredRitual', 'sessions'],
  );
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFilterPanel(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
      const preferredRitual = Object.entries(ritualCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No preference yet';
      const sessionsCount = clientAppts.length;
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
      const status = getClientStatus(sessionsCount, lastVisitDate);
      const lastVisitLabel = lastVisitDate ? format(lastVisitDate, 'MMM d, yyyy') : 'No visits yet';

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
    if (confirm(`Are you sure you want to delete ${ids.length} client(s)? This cannot be undone.`)) {
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

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="shrink-0 border-b border-[#e3e2e0] bg-[#faf9f7] px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-['Public_Sans',sans-serif] text-2xl font-semibold tracking-tight text-[#435544]">
                Client Directory
              </h1>
              <p className="mt-1 text-sm text-[#747872]">
                {clients.length} profiles, {filtered.length} visible
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-72">
              <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#747872]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full rounded-full border-none bg-[#f4f3f1] py-2.5 pl-10 pr-4 text-sm text-[#1a1c1b] outline-none ring-1 ring-transparent transition-all focus:ring-[#435544]/20"
              />
            </label>

            <button
              onClick={() => setShowFilterPanel((prev) => !prev)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#c3c8c0] bg-white px-4 py-2.5 text-sm font-medium text-[#434842] transition-colors hover:bg-[#efeeec]"
            >
              <SlidersHorizontal size={16} strokeWidth={1.75} />
              Advanced Filters
            </button>

            <button
              onClick={() => onNewClient(search.trim() || undefined)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#435544] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={16} strokeWidth={1.9} />
              Add Client
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showFilterPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => setShowFilterPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="absolute right-4 top-28 z-50 w-[340px] rounded-2xl border border-[#e3e2e0] bg-white p-5 shadow-2xl lg:right-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#725a38]">Display Setup</p>
                  <h3 className="mt-1 font-['Public_Sans',sans-serif] text-lg font-semibold text-[#1a1c1b]">
                    Directory Controls
                  </h3>
                </div>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="rounded-full p-2 text-[#747872] transition-colors hover:bg-[#efeeec]"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#747872]">Sorting</p>
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
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#747872]">Visible Columns</p>
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
            className="shrink-0 overflow-hidden bg-[#1a1c1b] px-4 text-white lg:px-8"
          >
            <div className="flex h-[60px] items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {selectedClients.size} client{selectedClients.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-3">
                {selectedClients.size > 1 && (
                  <button
                    onClick={handleMerge}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15"
                  >
                    <GitPullRequest size={14} strokeWidth={1.75} />
                    Merge
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedClients(new Set())}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  <X size={14} strokeWidth={1.75} />
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-full gap-2 overflow-x-auto rounded-xl bg-[#f4f3f1] p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-all ${
                    activeFilter === filter.id
                      ? 'bg-[#435544] text-white shadow-sm'
                      : 'text-[#434842] hover:text-[#435544]'
                  }`}
                >
                  {filter.label} <span className="opacity-70">{filterCounts[filter.id]}</span>
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 self-start text-sm font-semibold text-[#725a38] transition-colors hover:text-[#435544]">
              <Download size={16} strokeWidth={1.75} />
              Download Full Report
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState search={search} onNewClient={onNewClient} />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-[#e9e8e6] bg-white shadow-sm lg:block">
                <div
                  className="grid items-center border-b border-[#e9e8e6] bg-[#f4f3f1]/50 px-5 py-4"
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
                  <h2 className="font-['Public_Sans',sans-serif] text-xl font-bold text-[#435544]">
                    Client Retention Insights
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <InsightCard
                    icon={<BarChart3 size={24} strokeWidth={1.75} />}
                    label="Monthly Growth"
                    value={formatMetricPercent(insights.growth)}
                    detail="vs last month"
                  />
                  <InsightCard
                    icon={<Users size={24} strokeWidth={1.75} />}
                    label="Returning Rate"
                    value={`${insights.returningRate}%`}
                    detail="returning clients"
                  />
                  <InsightCard
                    icon={<CalendarDays size={24} strokeWidth={1.75} />}
                    label="Avg Sessions"
                    value={insights.avgSessions}
                    detail="per active client"
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

function ClientAvatar({ client }: { client: Client }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e8e6] bg-[#f4f3f1] text-sm font-bold text-[#435544]">
      {getClientInitials(client)}
    </div>
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function RitualBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-full truncate rounded px-2 py-1 text-xs font-semibold text-[#3a4b3b] bg-[#d4e8d2]/40">
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
        <button
          type="button"
          title="View Notes"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(client);
          }}
          className="rounded-lg p-2 text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#435544]"
        >
          <NotebookText size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          title="Schedule"
          onClick={(e) => {
            e.stopPropagation();
            onSchedule(client);
          }}
          className="rounded-lg p-2 text-[#435544] transition-colors hover:bg-[#435544] hover:text-white"
        >
          <CalendarDays size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function renderDesktopCell(colId: string, client: Client, summary: ClientSummary) {
  switch (colId) {
    case 'name':
      return (
        <div className="flex items-center gap-3">
          <ClientAvatar client={client} />
          <div className="min-w-0">
            <p className="truncate font-bold text-[#1a1c1b] transition-colors group-hover:text-[#435544]">
              {summary.fullName}
            </p>
            <p className="truncate text-xs text-[#747872]">{client.email || 'No email provided'}</p>
          </div>
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
      className={`rounded-xl border p-6 shadow-sm transition-all cursor-pointer ${
        isSelected
          ? 'border-[#435544] bg-[#faf9f7]'
          : 'border-[#e9e8e6] bg-white active:scale-[0.99]'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ClientAvatar client={client} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#1a1c1b]">{summary.fullName}</h3>
            <StatusBadge status={summary.status} />
          </div>
        </div>
        <Checkbox checked={isSelected} onChange={() => onToggle(client.id)} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#747872]">Last Visit</span>
          <span className="font-medium text-[#1a1c1b]">{summary.lastVisitLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#747872]">Preferred Ritual</span>
          <div className="max-w-[60%] text-right"><RitualBadge label={summary.preferredRitual} /></div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#747872]">Total Sessions</span>
          <span className="font-bold text-[#435544]">{summary.sessionsCount}</span>
        </div>
        <div className="flex items-center gap-2 text-[#434842]">
          <Phone size={14} strokeWidth={1.75} className="text-[#747872]" />
          <span>{client.phone || 'No phone'}</span>
        </div>
        <div className="flex items-center gap-2 text-[#434842]">
          <MapPin size={14} strokeWidth={1.75} className="text-[#747872]" />
          <span>{client.city || 'Unknown city'}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#efeeec] pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(client);
          }}
          className="rounded-lg border border-[#435544]/20 px-4 py-2.5 text-sm font-bold text-[#435544] transition-colors hover:bg-[#d4e8d2]/30"
        >
          View Notes
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSchedule(client);
          }}
          className="rounded-lg bg-[#435544] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Schedule
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
    <div className="relative overflow-hidden rounded-2xl bg-[#efeeec] p-6">
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

function TrendCard({
  trend,
  maxTrend,
}: {
  trend: Array<{ label: string; value: number }>;
  maxTrend: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#fcdaaf] bg-[#fcdaaf]/30 p-6">
      <div>
        <p className="text-sm font-bold text-[#775e3c]">Trend Analysis</p>
        <p className="mt-1 text-xs text-[#775e3c]/70">Unique active clients over the last 6 months</p>
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
        Stability Growth: {trend[trend.length - 1]?.value >= trend[0]?.value ? 'Positive' : 'Needs attention'}
      </p>
    </div>
  );
}

function EmptyState({ search, onNewClient }: { search: string; onNewClient: (s?: string) => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 rounded-2xl border border-[#e9e8e6] bg-white px-6 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4f3f1]">
        <Users size={32} strokeWidth={1.2} className="text-[#747872]" />
      </div>
      <div className="space-y-3">
        <h2 className="font-['Public_Sans',sans-serif] text-2xl font-semibold text-[#1a1c1b]">
          No clients found
        </h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#747872]">
          {search
            ? `No profile matches "${search}". Try another query or create a new client record.`
            : 'Your directory is empty. Start by creating a client profile or booking a first session.'}
        </p>
      </div>
      <button
        onClick={() => onNewClient(search.trim() || undefined)}
        className="flex items-center gap-2 rounded-xl bg-[#435544] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus size={16} strokeWidth={1.9} />
        Create Client
      </button>
    </div>
  );
}
