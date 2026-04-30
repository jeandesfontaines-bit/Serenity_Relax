import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, Plus, ArrowUpDown, Users,
  Settings2, GitPullRequest, CheckCircle2, Phone, MapPin, X, Trash2,
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

/* ── COLUMN DEFINITIONS ── */
interface ColDef {
  id: string;
  label: string;
  minWidth: string;
  flex: string;
  align?: 'center' | 'start';
}

const ALL_COLUMNS: ColDef[] = [
  { id: 'lastName',  label: 'NOM',        minWidth: '160px', flex: '1.5fr' },
  { id: 'firstName', label: 'PRÉNOM',     minWidth: '140px', flex: '1fr' },
  { id: 'email',     label: 'EMAIL',      minWidth: '220px', flex: '2fr' },
  { id: 'phone',     label: 'TÉLÉPHONE',  minWidth: '140px', flex: '1fr' },
  { id: 'city',      label: 'VILLE',      minWidth: '120px', flex: '1fr' },
  { id: 'canton',    label: 'CANTON',     minWidth: '80px',  flex: '0.6fr', align: 'center' },
  { id: 'sessions',  label: 'SÉANCES',    minWidth: '80px',  flex: '0.6fr', align: 'center' },
  { id: 'insurance', label: 'ASSURANCE',  minWidth: '140px', flex: '1fr' },
];

/* ── PROPS ── */
interface ClientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: (initialName?: string) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
  onDeleteClients?: (ids: string[]) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function ClientsPage({
  clients, appointments, onSelectClient, onNewClient, onMergeClients, onDeleteClients,
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

  const toggleClient = useCallback((id: string) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Grid template
  const gridTemplate = useMemo(() => {
    const cols = visibleColumns.map(colId => {
      const col = ALL_COLUMNS.find(c => c.id === colId);
      return col ? `minmax(${col.minWidth}, ${col.flex})` : 'minmax(100px, 1fr)';
    });
    return `80px ${cols.join(' ')}`;
  }, [visibleColumns]);

  const handleMerge = useCallback(() => {
    const [primary, ...others] = Array.from(selectedClients);
    onMergeClients?.(primary, others);
    setSelectedClients(new Set());
  }, [selectedClients, onMergeClients]);

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedClients);
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${ids.length} client(s) ? Cette action est irréversible.`)) {
      onDeleteClients?.(ids);
      setSelectedClients(new Set());
    }
  }, [selectedClients, onDeleteClients]);

  return (
    <motion.div 
      className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── PAGE HEADER ── */}
      <header className="h-24 border-b border-[#efeeec] bg-white/50 backdrop-blur-md px-8 sm:px-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-12 min-w-0 flex-1">
          <div>
            <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#725a38] block mb-1">ARCHIVES</span>
            <h1 className="text-xl font-serif text-[#1a1c1b] tracking-tight uppercase italic">Répertoire Clients</h1>
          </div>

          <div className="relative flex-1 max-w-lg min-w-0">
            <Search size={14} strokeWidth={1} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c3c8c0] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, ville..."
              className="w-full h-12 bg-white/50 border border-[#efeeec] rounded-none pl-14 pr-6 text-[13px] font-serif text-[#1a1c1b] placeholder:text-[#c3c8c0] placeholder:italic focus:outline-none focus:border-[#435544] focus:bg-white transition-all duration-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 ml-8">
          {/* Column picker */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="hidden sm:flex h-12 w-12 items-center justify-center border border-[#efeeec] bg-white text-[#1a1c1b] hover:border-[#435544] transition-all duration-500"
              title="Configuration colonnes"
            >
              <Settings2 size={16} strokeWidth={1} />
            </button>
            <AnimatePresence>
              {showColPicker && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowColPicker(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className="absolute right-0 top-14 w-64 bg-white border border-[#efeeec] shadow-2xl py-6 z-50 overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-[9px] font-serif text-[#725a38] uppercase tracking-[0.4em] border-b border-[#faf9f7] mb-2">Structure de vue</p>
                    {ALL_COLUMNS.map(col => (
                      <button
                        key={col.id}
                        onClick={() => setVisibleColumns(prev =>
                          prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id]
                        )}
                        className="w-full h-12 flex items-center justify-between text-[11px] px-6 hover:bg-[#faf9f7] text-[#1a1c1b] font-serif uppercase tracking-widest transition-colors"
                      >
                        {col.label}
                        {visibleColumns.includes(col.id) && <div className="w-1.5 h-1.5 bg-[#435544] rotate-45" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Merge */}
          {selectedClients.size > 1 && (
            <button
              onClick={handleMerge}
              className="flex items-center gap-3 h-12 px-6 bg-[#f4f3f1] text-[#1a1c1b] text-[9px] font-serif uppercase tracking-[0.2em] border border-[#efeeec] hover:border-[#435544] transition-all duration-500"
            >
              <GitPullRequest size={14} strokeWidth={1} />
              Fusionner
            </button>
          )}

          {/* New client */}
          <button
            onClick={() => onNewClient()}
            className="flex items-center gap-3 h-12 px-8 bg-[#1a1c1b] text-white text-[9px] font-serif uppercase tracking-[0.2em] hover:bg-[#435544] transition-all duration-500"
          >
            <Plus size={16} strokeWidth={1} />
            <span className="hidden sm:inline">Ajouter un Client</span>
          </button>
        </div>
      </header>

      {/* ── SELECTION BAR ── */}
      <AnimatePresence>
        {selectedClients.size > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 60, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#1a1c1b] text-white px-8 sm:px-16 flex items-center justify-between shrink-0 overflow-hidden"
          >
            <span className="text-[10px] font-serif uppercase tracking-[0.2em] italic">
              {selectedClients.size} Profil{selectedClients.size > 1 ? 's' : ''} sélectionné{selectedClients.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-10">
              <button
                onClick={handleDelete}
                className="text-[9px] font-serif uppercase tracking-[0.3em] text-[#c3c8c0] hover:text-white flex items-center gap-3 transition-colors"
              >
                <Trash2 size={14} strokeWidth={1} /> Supprimer
              </button>
              <button
                onClick={() => setSelectedClients(new Set())}
                className="text-[9px] font-serif uppercase tracking-[0.3em] text-white hover:text-[#c3c8c0] flex items-center gap-3 transition-colors"
              >
                <X size={14} strokeWidth={1} /> Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-8 sm:px-16 py-12 h-full flex flex-col">

          {/* Desktop table */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 bg-white border border-[#efeeec] shadow-2xl shadow-[#1a1c1b]/5 overflow-hidden">
            {/* Header */}
            <div
              className="grid px-8 h-16 items-center border-b border-[#efeeec] bg-[#faf9f7]/50 shrink-0"
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
                    className={`py-2 px-4 text-[9px] font-serif text-[#c3c8c0] uppercase tracking-[0.3em] cursor-pointer hover:text-[#1a1c1b] transition-all duration-500 flex items-center gap-3 ${col?.align === 'center' ? 'justify-center' : 'justify-start'}`}
                  >
                    {col?.label}
                    {sortField === colId && <div className="w-1 h-1 bg-[#1a1c1b] rotate-45" />}
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#efeeec]/30 scrollbar-hide">
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
          <div className="md:hidden flex-1 overflow-y-auto space-y-6 pb-12">
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
    </motion.div>
  );
}

/* ── CHECKBOX ── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`w-5 h-5 transition-all duration-500 flex items-center justify-center border ${checked ? 'bg-[#1a1c1b] border-[#1a1c1b]' : 'border-[#efeeec] bg-white hover:border-[#435544]'}`}
    >
      {checked && <div className="w-1.5 h-1.5 bg-white rotate-45" />}
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
  onToggle: (id: string) => void;
}

function ClientRow({ client: p, sessionsCount, isSelected, visibleColumns, gridTemplate, onSelect, onToggle }: ClientRowProps) {
  return (
    <div
      onClick={() => onSelect(p)}
      className={`grid px-8 h-20 items-center cursor-pointer transition-all duration-700 group ${isSelected ? 'bg-[#faf9f7]' : 'hover:bg-[#faf9f7]/30'}`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex justify-center">
        <Checkbox checked={isSelected} onChange={() => onToggle(p.id)} />
      </div>

      {visibleColumns.map(colId => {
        if (colId === 'lastName') return (
          <span key={colId} className="text-[15px] font-serif text-[#1a1c1b] truncate group-hover:italic transition-all duration-500 uppercase">
            {p.lastName}
          </span>
        );
        if (colId === 'firstName') return (
          <span key={colId} className="text-[13px] font-serif text-[#725a38] truncate opacity-60 italic">{p.firstName}</span>
        );
        if (colId === 'email') return (
          <span key={colId} className="text-[11px] font-serif text-[#c3c8c0] truncate pr-8 lowercase tracking-tight italic">{p.email || '—'}</span>
        );
        if (colId === 'phone') return (
          <span key={colId} className="text-[11px] font-serif text-[#1a1c1b] truncate tracking-widest">{p.phone || '—'}</span>
        );
        if (colId === 'city') return (
          <span key={colId} className="text-[11px] font-serif text-[#725a38] truncate uppercase tracking-widest">{p.city || '—'}</span>
        );
        if (colId === 'canton') return (
          <span key={colId} className="text-[11px] font-serif text-[#1a1c1b] text-center uppercase tracking-[0.2em]">{p.canton || '—'}</span>
        );
        if (colId === 'insurance') return (
          <span key={colId} className="text-[11px] font-serif text-[#c3c8c0] truncate italic uppercase tracking-wider">{p.insurance || '—'}</span>
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
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(p)}
      className={`bg-white border border-[#efeeec] p-8 transition-all duration-500 cursor-pointer ${isSelected ? 'bg-[#faf9f7] shadow-xl' : 'hover:shadow-lg'}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-6 min-w-0">
          <Checkbox checked={isSelected} onChange={() => onToggle(p.id)} />
          <div className="min-w-0">
            <p className="font-serif text-[#1a1c1b] text-lg leading-tight uppercase italic">{p.lastName} {p.firstName}</p>
            <p className="text-[11px] font-serif text-[#c3c8c0] mt-2 truncate italic">{p.email || 'Pas d\'email'}</p>
          </div>
        </div>
        <SessionBadge count={sessionsCount} />
      </div>
      
      <div className="flex items-center gap-8 pt-6 border-t border-[#faf9f7]">
        <div className="flex items-center gap-3 text-[9px] font-serif text-[#725a38] uppercase tracking-[0.3em]">
          <MapPin size={12} strokeWidth={1} className="text-[#c3c8c0]" />
          {p.city || 'Non défini'}
        </div>
        <div className="flex items-center gap-3 text-[9px] font-serif text-[#725a38] uppercase tracking-[0.3em]">
          <Phone size={12} strokeWidth={1} className="text-[#c3c8c0]" />
          {p.phone || '—'}
        </div>
      </div>
    </div>
  );
}

/* ── SESSION BADGE ── */
function SessionBadge({ count }: { count: number }) {
  return (
    <span className={`inline-flex items-center justify-center min-w-[32px] h-8 px-3 text-[10px] font-serif italic tracking-tighter ${count === 0 
      ? 'bg-[#f4f3f1] text-[#c3c8c0]' 
      : 'bg-[#435544] text-white'}`}>
      {count}
    </span>
  );
}

/* ── EMPTY STATE ── */
function EmptyState({ search, onNewClient }: { search: string; onNewClient: (s?: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 text-center gap-10">
      <div className="w-32 h-32 bg-[#faf9f7] flex items-center justify-center relative overflow-hidden">
        <Users size={40} className="text-[#c3c8c0]" strokeWidth={0.5} />
        <div className="absolute inset-0 border border-[#efeeec]/30 scale-75 rotate-45" />
      </div>
      <div>
        <p className="text-2xl font-serif text-[#1a1c1b] mb-4 italic uppercase">Silence des Archives</p>
        <p className="text-[12px] font-serif text-[#c3c8c0] max-w-sm mx-auto uppercase tracking-[0.2em] leading-relaxed">
          {search 
            ? `Aucun profil ne correspond à l'empreinte « ${search} »`
            : "Votre répertoire est vierge. L'espace attend vos premières fiches."}
        </p>
      </div>
      <button
        onClick={() => onNewClient(search)}
        className="flex items-center gap-4 px-10 py-4 bg-[#1a1c1b] text-white text-[10px] font-serif uppercase tracking-[0.3em] hover:bg-[#435544] transition-all duration-500"
      >
        <Plus size={18} strokeWidth={1} />
        Créer un nouveau profil
      </button>
    </div>
  );
}
