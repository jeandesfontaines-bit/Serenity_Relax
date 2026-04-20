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
      <header className="h-xl border-b border-border bg-white px-m sm:px-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-s sm:gap-m min-w-0 flex-1">
          <h1 className="font-heading text-small font-black text-sapphire shrink-0 uppercase tracking-widest">Clients</h1>
          <div className="relative flex-1 max-w-sm min-w-0">
            <Search size={14} className="absolute left-s top-1/2 -translate-y-1/2 text-samaritan pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-l bg-bg-soft/50 border border-transparent rounded-md pl-xl pr-m font-heading text-small font-black uppercase tracking-widest text-sapphire placeholder:text-samaritan/30 focus:outline-none focus:ring-2 focus:ring-azraq/10 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="hidden sm:flex w-xl h-xl items-center justify-center rounded-md bg-white border border-border text-samaritan hover:text-sapphire hover:border-azraq transition-all duration-150"
              title="Colonnes"
            >
              <Settings2 size={14} />
            </button>
            {showColPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColPicker(false)} />
                <div className="absolute right-0 top-xl mt-xxs w-52 bg-white rounded-md shadow-2xl border border-border py-xs z-50">
                  <p className="px-m py-xxs font-heading text-[9px] font-black text-samaritan uppercase tracking-widest">Affichage</p>
                  {ALL_COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => setVisibleColumns(prev =>
                        prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id]
                      )}
                      className="w-full h-l flex items-center justify-between font-heading text-[10px] font-black uppercase tracking-widest px-m hover:bg-bg-soft text-samaritan hover:text-azraq transition-all"
                    >
                      {col.label}
                      {visibleColumns.includes(col.id) && <CheckCircle2 size={12} className="text-aurora" />}
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
              className="flex items-center gap-xs h-l px-m bg-aurora/10 text-aurora border border-aurora/10 rounded-md font-heading text-[10px] font-black uppercase tracking-widest hover:bg-aurora/20 transition-colors duration-150"
            >
              <GitPullRequest size={13} />
              Fusionner ({selectedClients.size})
            </button>
          )}

          {/* New client */}
          <button
            onClick={() => onNewClient()}
            className="flex items-center gap-xs h-l px-m bg-azraq text-white rounded-md font-heading text-[10px] font-black uppercase tracking-widest hover:bg-azraq/90 transition-colors duration-150 shadow-lg shadow-azraq/10"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nouveau client</span>
          </button>
        </div>
      </header>

      {/* ── SELECTION BAR ── */}
      {selectedClients.size > 0 && (
        <div className="h-m bg-aurora/10 border-b border-aurora/10 px-m sm:px-xl flex items-center justify-between shrink-0">
          <span className="font-heading text-[10px] font-black uppercase tracking-widest text-aurora">
            {selectedClients.size} sélectionné{selectedClients.size > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setSelectedClients(new Set())}
            className="font-heading text-[10px] font-black uppercase tracking-widest text-aurora/50 hover:text-aurora flex items-center gap-xxs transition-colors"
          >
            <X size={12} /> Désélectionner
          </button>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-5 h-full flex flex-col">

          {/* Desktop table */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 bg-white border border-border rounded-lg overflow-hidden shadow-sm shadow-azraq/5">
            {/* Header */}
            <div
              className="grid px-m h-l items-center border-b border-border bg-bg-soft shrink-0"
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
                    className={`py-xxs px-xxs font-heading text-[9px] font-black text-samaritan uppercase tracking-widest cursor-pointer hover:text-azraq transition-all flex items-center gap-xxs ${col?.align === 'center' ? 'justify-center' : 'justify-start'}`}
                  >
                    {col?.label}
                    {sortField === colId && <ArrowUpDown size={11} className="text-azraq" />}
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
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
      className={`w-4 h-4 rounded border-[1.5px] cursor-pointer transition-colors duration-150 flex items-center justify-center ${checked ? 'bg-azraq border-azraq' : 'border-border bg-white hover:border-azraq'}`}
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
      className={`grid px-m h-xl items-center cursor-pointer transition-all duration-150 group hover:bg-bg-soft ${isSelected ? 'bg-aurora/10' : ''}`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex justify-center items-center h-full">
        <Checkbox 
          checked={isSelected} 
          onChange={() => {}} 
        />
        <div 
          className="absolute w-8 h-8 cursor-pointer z-[10]" 
          onClick={(e) => { e.stopPropagation(); onToggle(e, p.id); }} 
        />
      </div>

      {visibleColumns.map(colId => {
        if (colId === 'lastName') return (
          <span key={colId} className="font-heading text-small font-black text-sapphire uppercase tracking-widest truncate group-hover:text-azraq transition-all">
            {p.lastName}
          </span>
        );
        if (colId === 'firstName') return (
          <span key={colId} className="font-heading text-small font-bold text-samaritan uppercase tracking-widest truncate">{p.firstName}</span>
        );
        if (colId === 'email') return (
          <span key={colId} className="font-heading text-[10px] text-samaritan font-medium truncate pr-xxs lowercase">{p.email || '—'}</span>
        );
        if (colId === 'phone') return (
          <span key={colId} className="font-heading text-small text-samaritan font-bold tracking-widest truncate">{p.phone || '—'}</span>
        );
        if (colId === 'city') return (
          <span key={colId} className="font-heading text-small text-samaritan font-bold truncate">{p.city || '—'}</span>
        );
        if (colId === 'canton') return (
          <span key={colId} className="font-heading text-small font-black text-azraq text-center uppercase">{p.canton || '—'}</span>
        );
        if (colId === 'insurance') return (
          <span key={colId} className="font-heading text-small text-samaritan font-bold truncate pr-xxs uppercase tracking-widest ">{p.insurance || '—'}</span>
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
      className={`bg-white border border-border rounded-xl p-4 transition-colors duration-150 cursor-pointer ${isSelected ? 'ring-1 ring-aurora/30 bg-aurora/5' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 min-w-0">
          <div onClick={(e) => onToggle(e, p.id)}>
            <Checkbox checked={isSelected} onChange={() => {}} />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-sapphire text-sm">{p.lastName}</span>{' '}
            <span className="text-samaritan text-sm">{p.firstName}</span>
          </div>
        </div>
        <SessionBadge count={sessionsCount} />
      </div>
      {p.email && (
        <p className="text-[10px] font-heading font-black text-samaritan truncate mt-2 pl-7 lowercase tracking-widest">{p.email}</p>
      )}
      <div className="text-[10px] font-heading font-black text-samaritan/50 mt-1 pl-7 flex gap-3 uppercase tracking-widest">
        {p.city && <span className="flex items-center gap-1"><MapPin size={10} />{p.city}</span>}
        {p.phone && <span className="flex items-center gap-1"><Phone size={10} />{p.phone}</span>}
      </div>
    </div>
  );
}

/* ── SESSION BADGE ── */
function SessionBadge({ count }: { count: number }) {
  const style = count === 0
    ? 'bg-bg-soft text-samaritan/50 border border-border'
    : count < 5
      ? 'bg-azraq/5 text-azraq border border-azraq/10'
      : 'bg-aurora/10 text-aurora border border-aurora/10 shadow-sm';

  return (
    <span className={`inline-flex items-center justify-center px-s py-xxs rounded-md font-heading text-[10px] font-black uppercase tracking-widest ${style}`}>
      {count}
    </span>
  );
}

/* ── EMPTY STATE ── */
function EmptyState({ search, onNewClient }: { search: string; onNewClient: (s?: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-xxxl text-center gap-m">
      <div className="w-xxl h-xxl bg-bg-soft rounded-md flex items-center justify-center border border-border">
        <Users size={24} className="text-samaritan/30" />
      </div>
      <div className="space-y-xxs">
        <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Aucun client trouvé</p>
        {search && <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest">pour «&#8239;{search}&#8239;»</p>}
      </div>
      <button
        onClick={() => onNewClient(search)}
        className="flex items-center gap-xs h-l px-xl bg-azraq text-white rounded-md font-heading text-[10px] font-black uppercase tracking-widest hover:bg-azraq/90 transition-all shadow-lg shadow-azraq/10"
      >
        <Plus size={14} />
        Créer ce client
      </button>
    </div>
  );
}