import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, Plus, ArrowUpDown, Users,
  Settings2, GitPullRequest, CheckCircle2, Phone, MapPin, X,
} from 'lucide-react';
import { Client, Appointment } from '../types';

/* ── COLUMN DEFINITIONS ── */
interface ColDef {
  id: string;
  label: string;
  minWidth: string;
  flex: string;
  align?: 'center' | 'start';
}

const ALL_COLUMNS: ColDef[] = [
  { id: 'lastName',  label: 'Nom',        minWidth: '160px', flex: '1.5fr' },
  { id: 'firstName', label: 'Prénom',     minWidth: '140px', flex: '1fr' },
  { id: 'email',     label: 'Email',      minWidth: '220px', flex: '2fr' },
  { id: 'phone',     label: 'Téléphone',  minWidth: '140px', flex: '1fr' },
  { id: 'city',      label: 'Ville',      minWidth: '120px', flex: '1fr' },
  { id: 'canton',    label: 'Canton',     minWidth: '80px',  flex: '0.6fr', align: 'center' },
  { id: 'sessions',  label: 'Sessions',    minWidth: '80px',  flex: '0.6fr', align: 'center' },
  { id: 'insurance', label: 'Assurance',  minWidth: '140px', flex: '1fr' },
];

/* ── PROPS ── */
interface ClientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: (initialName?: string) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function ClientsPage({
  clients, appointments, onSelectClient, onNewClient, onMergeClients,
}: ClientsPageProps) {
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ['lastName', 'firstName', 'email', 'phone', 'city', 'sessions'],
  );
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showColPicker, setShowColPicker] = useState(false);
  const [sortField, setSortField] = useState<string>('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Close column picker on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowColPicker(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Sessions map
  const sessionsByClient = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach(apt => {
      if (apt.clientId) map.set(apt.clientId, (map.get(apt.clientId) || 0) + 1);
    });
    return map;
  }, [appointments]);

  // Filtered + sorted
  const filtered = useMemo(() =>
    clients
      .filter(p => {
        const s = `${p.firstName} ${p.lastName} ${p.email || ''} ${p.phone || ''} ${p.city || ''} ${p.canton || ''} ${p.insurance || ''}`.toLowerCase();
        return s.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof Client] || '';
        let valB: any = b[sortField as keyof Client] || '';
        if (sortField === 'sessions') {
          valA = sessionsByClient.get(a.id) || 0;
          valB = sessionsByClient.get(b.id) || 0;
        }
        const res = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
        return sortDir === 'asc' ? res : -res;
      }),
    [clients, search, sortField, sortDir, sessionsByClient],
  );

  const toggleSort = useCallback((id: string) => {
    if (sortField === id) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(id); setSortDir('asc'); }
  }, [sortField]);

  const toggleClient = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedClients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Grid template with minmax
  const gridTemplate = useMemo(() => {
    const cols = visibleColumns.map(colId => {
      const col = ALL_COLUMNS.find(c => c.id === colId);
      return col ? `minmax(${col.minWidth}, ${col.flex})` : 'minmax(100px, 1fr)';
    });
    return `40px ${cols.join(' ')}`;
  }, [visibleColumns]);

  const handleMerge = useCallback(() => {
    const [primary, ...others] = Array.from(selectedClients);
    onMergeClients?.(primary, others);
    setSelectedClients(new Set());
  }, [selectedClients, onMergeClients]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── PAGE HEADER ── */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 sm:px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-slate-900 shrink-0">Clients</h1>
          <div className="relative flex-1 max-w-sm min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Column picker */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors duration-150"
              title="Colonnes"
            >
              <Settings2 size={14} />
            </button>
            {showColPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColPicker(false)} />
                <div className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <p className="px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">Colonnes</p>
                  {ALL_COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => setVisibleColumns(prev =>
                        prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id]
                      )}
                      className="w-full h-8 flex items-center justify-between text-sm px-3 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      {col.label}
                      {visibleColumns.includes(col.id) && <CheckCircle2 size={13} className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Merge */}
          {selectedClients.size > 1 && (
            <button
              onClick={handleMerge}
              className="flex items-center gap-1.5 h-8 px-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors duration-150"
            >
              <GitPullRequest size={13} />
              Fusionner ({selectedClients.size})
            </button>
          )}

          {/* New client */}
          <button
            onClick={() => onNewClient()}
            className="flex items-center gap-1.5 h-8 px-3 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors duration-150"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nouveau client</span>
          </button>
        </div>
      </header>

      {/* ── SELECTION BAR ── */}
      {selectedClients.size > 0 && (
        <div className="h-10 bg-emerald-50 border-b border-emerald-100 px-6 sm:px-10 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-emerald-700">
            {selectedClients.size} sélectionné{selectedClients.size > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setSelectedClients(new Set())}
            className="text-xs font-medium text-emerald-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Désélectionner
          </button>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-5 h-full flex flex-col">

          {/* Desktop table */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div
              className="grid px-4 h-10 items-center border-b border-slate-200 bg-slate-50 shrink-0"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="flex justify-center">
                <Checkbox
                  checked={selectedClients.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selectedClients.size === filtered.length && filtered.length > 0) setSelectedClients(new Set());
                    else setSelectedClients(new Set(filtered.map(a => a.id)));
                  }}
                />
              </div>
              {visibleColumns.map(colId => {
                const col = ALL_COLUMNS.find(c => c.id === colId);
                return (
                  <div
                    key={colId}
                    onClick={() => toggleSort(colId)}
                    className={`py-2 px-2 text-[11px] font-medium text-slate-500 cursor-pointer hover:text-slate-700 transition-colors flex items-center gap-1 ${col?.align === 'center' ? 'justify-center' : 'justify-start'}`}
                  >
                    {col?.label}
                    {sortField === colId && <ArrowUpDown size={11} className="text-emerald-500" />}
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filtered.map(p => (
                <ClientRow
                  key={p.id}
                  client={p}
                  sessionsCount={sessionsByClient.get(p.id) || 0}
                  isSelected={selectedClients.has(p.id)}
                  visibleColumns={visibleColumns}
                  gridTemplate={gridTemplate}
                  onSelect={onSelectClient}
                  onToggle={toggleClient}
                />
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2 pb-4">
            {filtered.map(p => (
              <ClientCard
                key={p.id}
                client={p}
                sessionsCount={sessionsByClient.get(p.id) || 0}
                isSelected={selectedClients.has(p.id)}
                onSelect={onSelectClient}
                onToggle={toggleClient}
              />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <EmptyState search={search} onNewClient={onNewClient} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ── CHECKBOX ── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`w-4 h-4 rounded border-[1.5px] cursor-pointer transition-colors duration-150 flex items-center justify-center ${checked ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 bg-white hover:border-slate-400'}`}
    >
      {checked && <span className="text-white text-[8px] leading-none">✓</span>}
    </div>
  );
}

/* ── CLIENT ROW (desktop) ── */
interface ClientRowProps {
  client: Client;
  sessionsCount: number;
  isSelected: boolean;
  visibleColumns: string[];
  gridTemplate: string;
  onSelect: (c: Client) => void;
  onToggle: (e: React.MouseEvent, id: string) => void;
}

function ClientRow({ client: p, sessionsCount, isSelected, visibleColumns, gridTemplate, onSelect, onToggle }: ClientRowProps) {
  return (
    <div
      onClick={() => onSelect(p)}
      className={`grid px-4 h-12 items-center cursor-pointer transition-colors duration-150 group hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/50' : ''}`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex justify-center">
        <Checkbox checked={isSelected} onChange={() => {}} />
        {/* We intercept click in the parent div via onToggle */}
        <div className="absolute inset-0" onClick={(e) => { e.stopPropagation(); onToggle(e, p.id); }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
      </div>

      {visibleColumns.map(colId => {
        if (colId === 'lastName') return (
          <span key={colId} className="text-sm font-medium text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
            {p.lastName}
          </span>
        );
        if (colId === 'firstName') return (
          <span key={colId} className="text-sm text-slate-500 truncate">{p.firstName}</span>
        );
        if (colId === 'email') return (
          <span key={colId} className="text-sm text-slate-500 truncate pr-2">{p.email || '—'}</span>
        );
        if (colId === 'phone') return (
          <span key={colId} className="text-sm text-slate-500 truncate">{p.phone || '—'}</span>
        );
        if (colId === 'city') return (
          <span key={colId} className="text-sm text-slate-500 truncate">{p.city || '—'}</span>
        );
        if (colId === 'canton') return (
          <span key={colId} className="text-sm font-medium text-slate-700 text-center">{p.canton || '—'}</span>
        );
        if (colId === 'insurance') return (
          <span key={colId} className="text-sm text-slate-500 truncate">{p.insurance || '—'}</span>
        );
        if (colId === 'sessions') return (
          <div key={colId} className="flex justify-center">
            <SessionBadge count={sessionsCount} />
          </div>
        );
        return null;
      })}
    </div>
  );
}

/* ── CLIENT CARD (mobile) ── */
function ClientCard({
  client: p, sessionsCount, isSelected, onSelect, onToggle,
}: {
  client: Client;
  sessionsCount: number;
  isSelected: boolean;
  onSelect: (c: Client) => void;
  onToggle: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(p)}
      className={`bg-white border border-slate-200 rounded-xl p-4 transition-colors duration-150 cursor-pointer ${isSelected ? 'ring-1 ring-emerald-300 bg-emerald-50/30' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 min-w-0">
          <div onClick={(e) => onToggle(e, p.id)}>
            <Checkbox checked={isSelected} onChange={() => {}} />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-slate-900 text-sm">{p.lastName}</span>{' '}
            <span className="text-slate-500 text-sm">{p.firstName}</span>
          </div>
        </div>
        <SessionBadge count={sessionsCount} />
      </div>
      {p.email && (
        <p className="text-xs text-slate-500 truncate mt-2 pl-7">{p.email}</p>
      )}
      <div className="text-xs text-slate-400 mt-1 pl-7 flex gap-3">
        {p.city && <span className="flex items-center gap-1"><MapPin size={10} />{p.city}</span>}
        {p.phone && <span className="flex items-center gap-1"><Phone size={10} />{p.phone}</span>}
      </div>
    </div>
  );
}

/* ── SESSION BADGE ── */
function SessionBadge({ count }: { count: number }) {
  const style = count === 0
    ? 'bg-slate-100 text-slate-500'
    : count < 5
      ? 'bg-blue-50 text-blue-700'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium ${style}`}>
      {count}
    </span>
  );
}

/* ── EMPTY STATE ── */
function EmptyState({ search, onNewClient }: { search: string; onNewClient: (s?: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
        <Users size={24} className="text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">Aucun client trouvé</p>
        {search && <p className="text-sm text-slate-400">pour «&#8239;{search}&#8239;»</p>}
      </div>
      <button
        onClick={() => onNewClient(search)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors duration-150"
      >
        <Plus size={15} />
        Créer ce client
      </button>
    </div>
  );
}