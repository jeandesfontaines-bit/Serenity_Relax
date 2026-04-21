import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Settings2, 
  GitPullRequest, X, Mail, Phone, MapPin, ShieldCheck, Map 
} from 'lucide-react';
import { Client, Appointment } from '../types';

interface ColDef {
  id: string;
  label: string;
  flex: string;
}

const ALL_COLUMNS: ColDef[] = [
  { id: 'lastName',  label: 'Client',       flex: '1.5fr' },
  { id: 'phone',     label: 'Téléphone',   flex: '1fr' },
  { id: 'status',    label: 'Statut',      flex: '0.8fr' },
  { id: 'sessions',  label: 'Sessions',    flex: '0.6fr' },
  { id: 'lastSession', label: 'Dernière',    flex: '1fr' },
  { id: 'balance',   label: 'Solde',       flex: '0.8fr' },
  { id: 'email',     label: 'Email',       flex: '1.2fr' },
  { id: 'city',      label: 'Ville',       flex: '1fr' },
  { id: 'canton',    label: 'Canton',      flex: '0.6fr' },
  { id: 'insurance', label: 'Assurance',   flex: '1fr' },
];

interface ClientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: (initialName?: string) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
}

export default function ClientsPage({
  clients, appointments, onSelectClient, onNewClient, onMergeClients,
}: ClientsPageProps) {
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['lastName', 'phone', 'status', 'sessions', 'lastSession', 'balance']);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showColPicker, setShowColPicker] = useState(false);
  const [sortField, setSortField] = useState<string>('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Stats calculation
  const statsMap = useMemo(() => {
    const map = new Map<string, { count: number, last: string }>();
    appointments.forEach(apt => {
      if (apt.clientId) {
        const current = map.get(apt.clientId) || { count: 0, last: '' };
        map.set(apt.clientId, {
          count: current.count + 1,
          last: (apt.date && apt.date > current.last) ? apt.date : current.last
        });
      }
    });
    return map;
  }, [appointments]);

  const filtered = useMemo(() =>
    clients
      .filter(p => {
        const s = `${p.firstName} ${p.lastName} ${p.email || ''} ${p.phone || ''} ${p.city || ''} ${p.insurance || ''}`.toLowerCase();
        return s.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        let valA: any = (a[sortField as keyof Client] || '').toString();
        let valB: any = (b[sortField as keyof Client] || '').toString();
        
        if (sortField === 'sessions') {
           valA = statsMap.get(a.id)?.count || 0;
           valB = statsMap.get(b.id)?.count || 0;
        }

        const res = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
        return sortDir === 'asc' ? res : -res;
      }),
    [clients, search, sortField, sortDir, statsMap]
  );

  const toggleClient = useCallback((id: string) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-8">
      
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[42px] font-black tracking-tight text-onyx leading-none">Clients</h1>
          <span className="px-4 py-1.5 bg-border/40 text-earth/60 rounded-full text-[13px] font-bold mt-2">
            {filtered.length} total
          </span>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full h-12 bg-white border border-transparent rounded-full pl-12 pr-5 text-[14px] font-medium text-onyx shadow-sm focus:outline-none transition-all"
            />
          </div>
          
          <button onClick={() => setShowColPicker(!showColPicker)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-onyx shadow-sm hover:bg-bg-soft transition-all">
            <Settings2 size={20} />
          </button>

          {showColPicker && (
            <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-2xl border p-4 z-50">
               <p className="text-[10px] font-black text-earth/40 uppercase tracking-widest mb-4 px-2">Configuration</p>
               <div className="space-y-1 overflow-y-auto max-h-[400px]">
                  {ALL_COLUMNS.map(col => (
                    <button key={col.id} onClick={() => setVisibleColumns(prev => prev.includes(col.id) ? prev.filter(i => i !== col.id) : [...prev, col.id])} className="w-full flex justify-between p-2.5 hover:bg-bg-soft rounded-xl text-left transition-all">
                       <span className="text-[13px] font-bold text-onyx">{col.label}</span>
                       <input type="checkbox" checked={visibleColumns.includes(col.id)} readOnly className="accent-forest" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          {selectedClients.size > 1 && (
            <button onClick={() => onMergeClients?.(Array.from(selectedClients)[0], Array.from(selectedClients).slice(1))} className="h-12 px-6 bg-ochre/10 text-ochre rounded-full flex items-center gap-2 text-[14px] font-black uppercase tracking-widest hover:bg-ochre/20 transition-all">
              <GitPullRequest size={16} /> Fusionner
            </button>
          )}

          <button onClick={() => onNewClient()} className="h-12 px-6 bg-onyx text-white rounded-full flex items-center gap-2 text-[14px] font-bold shadow-lg shadow-onyx/20 hover:opacity-90 transition-all">
            <Plus size={18} /> <span className="hidden sm:inline">Nouveau client</span>
          </button>
        </div>
      </div>

      {/* ── SELECTION ── */}
      {selectedClients.size > 0 && (
        <div className="bg-onyx text-white rounded-2xl px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-4">
           <span className="text-[13px] font-bold uppercase tracking-widest">{selectedClients.size} client(s) sélectionné(s)</span>
           <button onClick={() => setSelectedClients(new Set())} className="text-white/40 hover:text-white transition-all"><X size={18} /></button>
        </div>
      )}

      {/* ── DESKTOP VIEW ── */}
      <div className="hidden md:block bg-white border border-border/10 rounded-[32px] overflow-hidden shadow-sm">
        <div className="grid px-10 h-16 items-center border-b border-border/10 bg-white/50" style={{ gridTemplateColumns: `40px ${visibleColumns.map(id => ALL_COLUMNS.find(c => c.id === id)?.flex).join(' ')} 40px` }}>
          <input type="checkbox" className="w-4 h-4 accent-forest" checked={selectedClients.size === filtered.length && filtered.length > 0} onChange={() => setSelectedClients(selectedClients.size === filtered.length ? new Set() : new Set(filtered.map(c => c.id)))} />
          {visibleColumns.map(id => (
            <div key={id} onClick={() => { setSortField(id); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }} className="text-[11px] font-black text-earth/40 uppercase tracking-[0.2em] cursor-pointer hover:text-onyx flex items-center gap-2">
              {ALL_COLUMNS.find(c => c.id === id)?.label}
              {sortField === id && <span className="opacity-40">{sortDir === 'asc' ? '▲' : '▼'}</span>}
            </div>
          ))}
          <span />
        </div>
        <div className="divide-y divide-border/5">
          {filtered.map(p => {
            const stats = statsMap.get(p.id) || { count: 0, last: '—' };
            return (
              <div key={p.id} onClick={() => onSelectClient(p)} className={`grid px-10 h-20 items-center hover:bg-bg-soft/50 cursor-pointer transition-all group ${selectedClients.has(p.id) ? 'bg-forest/5' : ''}`} style={{ gridTemplateColumns: `40px ${visibleColumns.map(id => ALL_COLUMNS.find(c => c.id === id)?.flex).join(' ')} 40px` }}>
                <div onClick={(e) => { e.stopPropagation(); toggleClient(p.id); }}>
                  <input type="checkbox" checked={selectedClients.has(p.id)} readOnly className="w-4 h-4 accent-forest cursor-pointer" />
                </div>
                {visibleColumns.map(colId => {
                  if (colId === 'lastName') return <div key={colId} className="flex items-center gap-4 min-w-0"><div className="w-9 h-9 rounded-full bg-border/20 flex items-center justify-center font-black text-[12px]">{p.lastName.charAt(0)}</div><div className="truncate pr-4"><p className="text-[14px] font-black text-onyx leading-tight uppercase truncate group-hover:text-forest transition-all">{p.lastName} {p.firstName}</p><p className="text-[11px] font-medium text-earth/50 leading-tight truncate lowercase">{p.insurance || 'Sans assurance'}</p></div></div>;
                  if (colId === 'phone') return <span key={colId} className="text-[14px] font-bold text-onyx tabular-nums">{p.phone || '—'}</span>;
                  if (colId === 'status') return <div key={colId}><span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#E1FBB8] text-forest/70">Actif</span></div>;
                  if (colId === 'sessions') return <div key={colId} className="w-8 h-8 rounded-lg bg-bg-soft flex items-center justify-center text-[13px] font-black text-onyx">{stats.count}</div>;
                  if (colId === 'lastSession') return <span key={colId} className="text-[13px] font-bold text-earth">{stats.last || '—'}</span>;
                  if (colId === 'balance') return <span key={colId} className="text-[14px] font-black text-earth/40">0 CHF</span>;
                  if (colId === 'email') return <span key={colId} className="text-[13px] font-medium text-earth/60 lowercase truncate pr-4">{p.email || '—'}</span>;
                  if (colId === 'city') return <span key={colId} className="text-[13px] font-bold text-earth truncate pr-4">{p.city || '—'}</span>;
                  if (colId === 'canton') return <span key={colId} className="text-[13px] font-black text-forest uppercase">{p.canton || '—'}</span>;
                  if (colId === 'insurance') return <span key={colId} className="text-[13px] font-bold text-earth/60 uppercase truncate pr-4">{p.insurance || '—'}</span>;
                  return null;
                })}
                <button className="text-earth/40 hover:text-onyx transition-all"><MoreHorizontal size={18} /></button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE VIEW ── */}
      <div className="md:hidden flex flex-col gap-4 px-1">
         {filtered.map(p => (
           <div key={p.id} onClick={() => onSelectClient(p)} className="bg-white border border-border/10 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-bg-soft flex items-center justify-center font-black text-[15px] uppercase text-onyx border border-border/10">{p.lastName.charAt(0)}</div>
                    <div><p className="font-black text-onyx uppercase leading-tight text-[15px]">{p.lastName} {p.firstName}</p><p className="text-[11px] font-bold text-forest uppercase tracking-widest mt-1">Patient Actif</p></div>
                 </div>
                 <div onClick={(e) => { e.stopPropagation(); toggleClient(p.id); }} className="p-2"><input type="checkbox" checked={selectedClients.has(p.id)} readOnly className="w-5 h-5 accent-forest" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/5">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-earth/40 uppercase tracking-widest">Téléphone</span>
                    <span className="text-[13px] font-bold text-onyx">{p.phone || '—'}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-earth/40 uppercase tracking-widest">Sessions</span>
                    <span className="text-[13px] font-black text-forest">{statsMap.get(p.id)?.count || 0}</span>
                 </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-border/5">
                 {p.email && <div className="flex items-center gap-3 text-[12px] font-medium text-earth/60 lowercase"><Mail size={14} className="opacity-40"/> {p.email}</div>}
                 <div className="flex items-center gap-3 text-[12px] font-medium text-earth/60 uppercase"><ShieldCheck size={14} className="opacity-40"/> {p.insurance || 'Sans assurance'}</div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}