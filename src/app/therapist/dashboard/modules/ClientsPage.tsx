import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, ArrowUpDown, Users, GitPullRequest, Phone, MapPin,
  X, Trash2, NotebookText, CalendarDays, Search, Filter,
  ChevronRight, Mail, ShieldCheck, MoreHorizontal,
  LayoutGrid, List
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format, differenceInCalendarDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'name', label: 'PATIENT', minWidth: '280px', flex: '2.5fr' },
  { id: 'status', label: 'STATUT', minWidth: '150px', flex: '1fr' },
  { id: 'lastVisit', label: 'DERNIER SOIN', minWidth: '140px', flex: '1fr' },
  { id: 'preferredRitual', label: 'RITUEL FAVORI', minWidth: '220px', flex: '1.8fr' },
  { id: 'sessions', label: 'TOTAL', minWidth: '100px', flex: '0.8fr', align: 'center' },
];

const STATUS_META: Record<ClientStatus, { label: string; className: string }> = {
  loyalty: {
    label: 'FIDÈLE',
    className: 'bg-[var(--accent-teal)] text-[#1a4a44]',
  },
  new: {
    label: 'NOUVEAU',
    className: 'bg-[var(--accent-blue)] text-[#1e3a8a]',
  },
  hiatus: {
    label: 'EN PAUSE',
    className: 'bg-neutral-100 text-neutral-500',
  },
  active: {
    label: 'ACTIF',
    className: 'bg-[var(--accent-blue)] text-[#1e3a8a]',
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
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
      const preferredRitual = Object.entries(ritualCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucun soin';
      const sessionsCount = clientAppts.length;
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
      const status = getClientStatus(sessionsCount, lastVisitDate);
      const lastVisitLabel = lastVisitDate ? format(lastVisitDate, 'd MMM yyyy') : '—';

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
        return summary.searchText.includes(searchQuery.trim().toLowerCase());
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
    [clients, searchQuery, sortDir, sortField, summaryByClient],
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

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedClients);
    if (confirm(`Voulez-vous vraiment supprimer ${ids.length} patient(s) ? Cette action est irréversible.`)) {
      onDeleteClients?.(ids);
      setSelectedClients(new Set());
    }
  }, [onDeleteClients, selectedClients]);

  useEffect(() => {
    onVisibleCountChange?.(filtered.length);
  }, [filtered.length, onVisibleCountChange]);

  const gridTemplate = `56px minmax(280px, 2.5fr) minmax(150px, 1fr) minmax(140px, 1fr) minmax(220px, 1.8fr) minmax(100px, 0.8fr) 120px`;

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFB] p-10 lg:p-16 space-y-12">
      
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between border-b border-neutral-100 pb-10">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em] mb-4">BASE DE DONNÉES PATIENTS</p>
          <h1 className="text-6xl font-bold text-neutral-900 tracking-tight leading-none">Répertoire</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center p-1 bg-neutral-50 rounded-full border border-neutral-100">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-300'}`}
            >
              <List size={18} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-300'}`}
            >
              <LayoutGrid size={18} strokeWidth={2.5} />
            </button>
          </div>
          <button
            onClick={() => onNewClient()}
            className="h-16 px-10 flex items-center gap-4 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl"
          >
            <Plus size={18} strokeWidth={3} />
            NOUVEAU PATIENT
          </button>
        </div>
      </div>

      {/* ── Selection Toolbar ── */}
      <AnimatePresence>
        {selectedClients.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 80, opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="shrink-0 overflow-hidden rounded-[2.5rem] bg-neutral-900 p-6 text-white flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-8 ml-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">SÉLECTION</span>
              <p className="text-xl font-bold tracking-tight">
                {selectedClients.size} Patient{selectedClients.size > 1 ? 's' : ''}
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
                onClick={() => setSelectedClients(new Set())}
                className="h-12 px-8 flex items-center gap-3 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
              >
                <X size={14} strokeWidth={2.5} /> ANNULER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <main className="flex-1">
        {filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center bg-neutral-50 rounded-[4rem] border-2 border-dashed border-neutral-100 group">
             <Search size={64} strokeWidth={1} className="text-neutral-200 mb-8 group-hover:scale-110 transition-transform" />
             <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300">
               AUCUN RÉSULTAT CORRESPONDANT
             </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-6">
            {/* Table Header */}
            <div 
              className="grid items-center px-10 mb-4"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="flex justify-center">
                <Checkbox
                  checked={selectedClients.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selectedClients.size === filtered.length) setSelectedClients(new Set());
                    else setSelectedClients(new Set(filtered.map(c => c.id)));
                  }}
                />
              </div>
               {ALL_COLUMNS.map(col => (
                <button
                  key={col.id}
                  onClick={() => toggleSort(col.id)}
                  className={`text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300 hover:text-neutral-900 transition-all flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : ''}`}
                >
                  {col.label}
                  {sortField === col.id && <ArrowUpDown size={10} strokeWidth={3} />}
                </button>
              ))}
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300 text-right pr-4">ACTIONS</div>
            </div>

            {/* Table Body */}
            <div className="space-y-4">
              {filtered.map(client => {
                const summary = summaryByClient.get(client.id);
                if (!summary) return null;
                return (
                  <button
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className={`grid w-full items-center px-10 py-8 rounded-[3rem] border border-neutral-50 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl text-left group ${
                      selectedClients.has(client.id) ? 'border-neutral-900 shadow-xl' : ''
                    }`}
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={selectedClients.has(client.id)} 
                        onChange={() => toggleClient(client.id)} 
                      />
                    </div>
                    
                    <div className="min-w-0 pr-8">
                      <p className="text-xl font-bold text-neutral-900 tracking-tight leading-none truncate transition-all">
                        {summary.fullName}
                      </p>
                      <p className="mt-2 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] truncate">
                        {client.email || 'NO EMAIL'}
                      </p>
                    </div>

                    <div>
                      <StatusBadge status={summary.status} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-neutral-900 tracking-tight">
                        {summary.lastVisitLabel}
                      </p>
                    </div>

                    <div className="pr-8">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-neutral-50 border border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em] truncate max-w-full">
                        {summary.preferredRitual}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-2xl font-bold text-neutral-900 tracking-tight">
                        {summary.sessionsCount}
                      </span>
                    </div>

                    <div className="flex justify-end gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-300 group-hover:text-neutral-900 group-hover:bg-neutral-100 transition-all">
                         <ChevronRight size={20} strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map(client => {
              const summary = summaryByClient.get(client.id);
              if (!summary) return null;
              return (
                <ClientCard 
                  key={client.id}
                  client={client}
                  summary={summary}
                  isSelected={selectedClients.has(client.id)}
                  onSelect={onSelectClient}
                  onToggle={() => toggleClient(client.id)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
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

function StatusBadge({ status }: { status: ClientStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function ClientCard({ client, summary, isSelected, onSelect, onToggle }: {
  client: Client;
  summary: ClientSummary;
  isSelected: boolean;
  onSelect: (c: Client) => void;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(client)}
      className={`group flex flex-col text-left rounded-[3.5rem] border p-12 transition-all hover:-translate-y-2 hover:shadow-2xl bg-white ${
        isSelected ? 'border-neutral-900 shadow-2xl ring-2 ring-neutral-900 ring-offset-8' : 'border-neutral-100 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-10">
        <div className="w-20 h-20 rounded-[2rem] bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:scale-110 transition-transform shadow-inner">
          <Users size={32} strokeWidth={1.5} />
        </div>
        <Checkbox checked={isSelected} onChange={onToggle} />
      </div>

      <div className="space-y-2 mb-10">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em]">PATIENT</p>
        <h3 className="text-3xl font-bold text-neutral-900 tracking-tight leading-none truncate transition-all">
          {summary.fullName}
        </h3>
        <p className="text-sm font-medium text-neutral-400 truncate">{client.email || 'Aucun email'}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-50">
        <div className="space-y-1">
          <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-[0.2em]">STATUT</p>
          <StatusBadge status={summary.status} />
        </div>
        <div className="space-y-1">
          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.3em]">SÉANCES</p>
          <p className="text-3xl font-bold text-neutral-900 tracking-tight">{summary.sessionsCount}</p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between group-hover:pl-4 transition-all duration-500">
        <div className="space-y-1">
          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.3em]">DERNIER SOIN</p>
          <p className="text-sm font-bold text-neutral-900 tracking-tight">{summary.lastVisitLabel}</p>
        </div>
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
          <ChevronRight size={20} strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}
