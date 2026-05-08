import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, ArrowUpDown, Users, GitPullRequest, Phone, MapPin,
  X, Trash2, NotebookText, CalendarDays,
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format, differenceInCalendarDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardChip, dashboardPanel, dashboardPrimaryButton, dashboardTableCell, dashboardTableHeader, dashboardTitleLg } from './dashboardTheme';
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
    className: 'border border-[#cbd5e1] bg-[#f8fafc] text-[#475569]',
  },
  active: {
    label: 'Client actif',
    className: 'border border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]',
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

  const filtered = useMemo(() =>
    clients
      .filter((client) => {
        const summary = summaryByClient.get(client.id);
        if (!summary) return false;
        const matchesSearch = summary.searchText.includes(search.trim().toLowerCase());
        return matchesSearch;
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
    [clients, search, sortDir, sortField, summaryByClient],
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

  useEffect(() => {
    onVisibleCountChange?.(filtered.length);
  }, [filtered.length, onVisibleCountChange]);

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden bg-[#fafbfc]"
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
              className="absolute right-4 top-28 z-50 w-[340px] rounded-[18px] border border-[#dbe3ef] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:right-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6366f1]">Affichage</p>
                  <h3 className="mt-1 font-sans text-lg font-semibold text-[#1f2937]">
                    Contrôles du répertoire
                  </h3>
                </div>
                <button
                  onClick={() => onShowFilterPanelChange(false)}
                  className="rounded-[10px] p-2 text-[#64748b] transition-colors hover:bg-[#f8fafc]"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">Tri</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_COLUMNS.filter((col) => col.id !== 'insurance').map((col) => (
                      <button
                        key={col.id}
                        onClick={() => toggleSort(col.id)}
                        className={`rounded-[12px] border px-3 py-2 text-left text-sm transition-colors ${
                          sortField === col.id
                            ? 'border-[#6366f1] bg-[#eef2ff] text-[#4f46e5]'
                            : 'border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">Colonnes visibles</p>
                  <div className="space-y-2">
                    {ALL_COLUMNS.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => setVisibleColumns((prev) =>
                          prev.includes(col.id)
                            ? prev.filter((id) => id !== col.id)
                            : [...prev, col.id],
                        )}
                        className="flex w-full cursor-pointer items-center justify-between rounded-[12px] border border-[#e2e8f0] px-3 py-2 text-sm text-[#1f2937] transition-colors hover:bg-[#f8fafc]"
                      >
                        <span>{col.label}</span>
                        <div className={`h-4 w-4 rounded border ${visibleColumns.includes(col.id) ? 'border-[#6366f1] bg-[#6366f1]' : 'border-[#cbd5e1] bg-white'}`}>
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
            className="shrink-0 overflow-hidden border-b border-[#c7d2fe] bg-[linear-gradient(135deg,#5b21b6_0%,#6366f1_100%)] px-4 text-white lg:px-8"
          >
            <div className="flex h-[60px] items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {selectedClients.size} client{selectedClients.size > 1 ? 's' : ''} sélectionné{selectedClients.size > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
                {selectedClients.size > 1 && (
                  <button
                    onClick={handleMerge}
                    className="flex items-center gap-2 rounded-[12px] bg-white/12 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/18"
                  >
                    <GitPullRequest size={14} strokeWidth={1.75} />
                    Fusionner
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-[12px] bg-white/12 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/18"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedClients(new Set())}
                  className="flex items-center gap-2 rounded-[12px] border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/12"
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
          {filtered.length === 0 ? (
            <EmptyState search={search} onNewClient={onNewClient} />
          ) : (
            <>
              <div className={`hidden overflow-hidden lg:block ${dashboardPanel}`}>
                <div
                  className={`grid items-center border-b border-[#e2e8f0] ${dashboardTableHeader}`}
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <div className={`flex justify-center ${dashboardTableCell}`}>
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
                        className={`flex items-center gap-2 ${dashboardTableCell} transition-colors hover:text-[#4f46e5] ${
                          col?.align === 'center' ? 'justify-center' : 'justify-start'
                        }`}
                      >
                        {col?.label}
                        <ArrowUpDown size={12} strokeWidth={1.8} className={sortField === colId ? 'text-[#4f46e5]' : 'opacity-50'} />
                      </button>
                    );
                  })}

                  <div className={`${dashboardTableCell} text-right`}>
                    Actions
                  </div>
                </div>

                <div className="divide-y divide-[#e2e8f0]">
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
          ? 'border-[#6366f1] bg-[#6366f1] text-white'
          : 'border-[#cbd5e1] bg-white text-transparent hover:border-[#6366f1]'
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
    <span className={dashboardChip + " inline-flex max-w-full truncate border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]"}>
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
      className={`grid items-center transition-colors cursor-pointer ${
        isSelected ? 'bg-[#f8fafc]' : 'hover:bg-[#f8fafc]'
      }`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className={`flex justify-center ${dashboardTableCell}`}>
        <Checkbox checked={isSelected} onChange={() => onToggle(client.id)} />
      </div>

      {visibleColumns.map((colId) => (
        <div key={colId} className={dashboardTableCell}>
          {renderDesktopCell(colId, client, summary)}
        </div>
      ))}

      <div className={`flex items-center justify-end gap-2 ${dashboardTableCell}`}>
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
          <p className="truncate font-bold text-[#0f172a] transition-colors group-hover:text-[#4338ca]">
            {summary.fullName}
          </p>
          <p className="truncate text-xs text-[#64748b]">{client.email || 'Aucun e-mail renseigné'}</p>
        </div>
      );
    case 'status':
      return <StatusBadge status={summary.status} />;
    case 'lastVisit':
      return <span className="text-sm text-[#0f172a]">{summary.lastVisitLabel}</span>;
    case 'preferredRitual':
      return <RitualBadge label={summary.preferredRitual} />;
    case 'sessions':
      return <div className="flex justify-center"><span className="text-sm font-bold text-[#4338ca]">{summary.sessionsCount}</span></div>;
    case 'email':
      return <span className="truncate text-sm text-[#475569]">{client.email || '—'}</span>;
    case 'phone':
      return <span className="text-sm text-[#475569]">{client.phone || '—'}</span>;
    case 'city':
      return <span className="text-sm text-[#475569]">{client.city || '—'}</span>;
    case 'insurance':
      return <span className="truncate text-sm text-[#475569]">{client.insurance || '—'}</span>;
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
          ? 'border-[#c7d2fe] bg-[#f8faff]'
          : 'border-[#e2e8f0] bg-white active:scale-[0.99]'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-[#0f172a]">{summary.fullName}</h3>
          <div className="mt-2">
            <StatusBadge status={summary.status} />
          </div>
        </div>
        <Checkbox checked={isSelected} onChange={() => onToggle(client.id)} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#64748b]">Dernière visite</span>
          <span className="font-medium text-[#0f172a]">{summary.lastVisitLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#64748b]">Rituel préféré</span>
          <div className="max-w-[60%] text-right"><RitualBadge label={summary.preferredRitual} /></div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#64748b]">Total séances</span>
          <span className="font-bold text-[#4338ca]">{summary.sessionsCount}</span>
        </div>
        <div className="flex items-center gap-2 text-[#475569]">
          <Phone size={14} strokeWidth={1.75} className="text-[#94a3b8]" />
          <span>{client.phone || 'Aucun téléphone'}</span>
        </div>
        <div className="flex items-center gap-2 text-[#475569]">
          <MapPin size={14} strokeWidth={1.75} className="text-[#94a3b8]" />
          <span>{client.city || 'Ville inconnue'}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#e2e8f0] pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(client);
          }}
          className="rounded-xl border border-[#dbe3ef] px-4 py-2.5 text-sm font-bold text-[#4338ca] transition-colors hover:bg-[#f8faff]"
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
    ? 'rounded-lg p-2 text-[#4338ca] transition-colors hover:bg-[#4338ca] hover:text-white'
    : 'rounded-lg p-2 text-[#94a3b8] transition-colors hover:bg-[#eef2ff] hover:text-[#4338ca]';

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
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0f172a] px-3 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function EmptyState({ search, onNewClient }: { search: string; onNewClient: (s?: string) => void }) {
  return (
    <div className={`flex min-h-[420px] flex-col items-center justify-center gap-8 px-6 py-16 text-center ${dashboardPanel}`}>
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f8fafc]">
        <Users size={32} strokeWidth={1.2} className="text-[#94a3b8]" />
      </div>
      <div className="space-y-3">
        <h2 className={dashboardTitleLg}>
          Aucun client trouvé
        </h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#64748b]">
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
