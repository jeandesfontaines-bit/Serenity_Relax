import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, ChevronRight, ArrowUpDown, Users, Settings2, Trash2, GitPullRequest, CheckCircle2, Mail } from 'lucide-react';
import { Client, Appointment } from '../types';

interface PatientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: (initialName?: string) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
}

const ALL_COLUMNS = [
  { id: 'lastName', label: 'NOM', width: '160px', priority: 1 },
  { id: 'firstName', label: 'PRÉNOM', width: '120px', priority: 2 },
  { id: 'email', label: 'EMAIL', width: '220px', priority: 3 },
  { id: 'phone', label: 'TÉLÉPHONE', width: '140px', priority: 4 },
  { id: 'city', label: 'VILLE', width: '120px', priority: 5 },
  { id: 'canton', label: 'CANTON', width: '80px', align: 'center', priority: 6 },
  { id: 'sessions', label: 'SÉANCES', width: '80px', align: 'center', priority: 0 },
  { id: 'insurance', label: 'ASSURANCE', width: '140px', priority: 7 },
];

export default function PatientsPage({ clients, appointments, onSelectClient, onNewClient, onMergeClients }: PatientsPageProps) {
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['lastName', 'firstName', 'email', 'phone', 'city', 'sessions']);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showColPicker, setShowColPicker] = useState(false);
  const [sortField, setSortField] = useState<string>('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Sessions pré-calculées pour perf
  const sessionsByClient = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach(apt => {
      if (apt.clientId) {
        map.set(apt.clientId, (map.get(apt.clientId) || 0) + 1);
      }
    });
    return map;
  }, [appointments]);

  const filtered = useMemo(() =>
    clients
      .filter(p => {
        const searchStr = `${p.firstName} ${p.lastName} ${p.email || ''} ${p.phone || ''} ${p.city || ''} ${p.canton || ''} ${p.insurance || ''}`.toLowerCase();
        return searchStr.includes(search.toLowerCase());
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
    [clients, search, sortField, sortDir, sessionsByClient]
  );

  const toggleSort = useCallback((id: string) => {
    if (sortField === id) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(id); setSortDir('asc'); }
  }, [sortField, sortDir]);

  const toggleClient = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedClients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedClients(next);
  }, [selectedClients]);

  const gridTemplate = useMemo(() =>
    `60px ${visibleColumns.map(colId => ALL_COLUMNS.find(c => c.id === colId)?.width).join(' ')}`,
    [visibleColumns]
  );

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 min-h-screen">
      {/* Topbar Glassmorphism */}
      <div className="h-20 sm:h-24 border-b border-white/50 backdrop-blur-xl bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-4 sm:px-8 lg:px-12 flex items-center gap-4 sm:gap-6 shrink-0 z-30 sticky top-0">
        <h1 className="text-lg sm:text-xl font-black tracking-[0.15em] bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent uppercase">
          Patients
        </h1>

        <div className="relative flex-1 min-w-0 max-w-sm sm:max-w-md">
          <Search size={16} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un patient..."
            className="w-full h-11 sm:h-9 bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl sm:rounded-full pl-11 sm:pl-12 pr-4 text-sm sm:text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:bg-white/80 shadow-lg transition-all hover:shadow-xl active:scale-[0.98] tracking-[0.02em]"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
          {selectedClients.size > 1 && (
            <button
              onClick={() => {
                const [primary, ...others] = Array.from(selectedClients);
                onMergeClients?.(primary, others);
                setSelectedClients(new Set());
              }}
              className="flex items-center gap-1.5 sm:gap-2 h-10 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm text-indigo-600 border border-indigo-200/50 rounded-xl sm:rounded-full text-xs sm:text-[10px] font-black uppercase tracking-[0.12em] hover:from-indigo-500/30 active:scale-95 shadow-md hover:shadow-lg transition-all"
            >
              <GitPullRequest size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Fusion ({selectedClients.size})</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="w-10 sm:w-9 h-10 sm:h-9 flex items-center justify-center rounded-xl sm:rounded-full bg-white/70 backdrop-blur-sm border border-slate-200/50 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              <Settings2 size={16} />
            </button>

            {showColPicker && (
              <div className="absolute right-0 top-14 sm:top-16 w-60 sm:w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-5 sm:p-6 z-50 animate-in zoom-in-95 duration-200">
                <p className="text-[10px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Colonnes</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {ALL_COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => {
                        setVisibleColumns(prev =>
                          prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id]
                        );
                      }}
                      className="w-full h-9 flex items-center justify-between text-xs sm:text-[10px] font-black uppercase tracking-[0.1em] px-4 rounded-xl hover:bg-slate-50/50 backdrop-blur-sm text-slate-600 transition-all active:scale-95"
                    >
                      {col.label}
                      {visibleColumns.includes(col.id) && <CheckCircle2 size={14} className="text-indigo-500 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNewClient()}
            className="group flex items-center gap-2 h-10 sm:h-9 px-4 sm:px-4 bg-gradient-to-r from-slate-900/10 to-indigo-500/10 backdrop-blur-sm text-slate-700 border border-slate-200/50 rounded-xl sm:rounded-full text-xs sm:text-[10px] font-black uppercase tracking-[0.12em] hover:from-slate-900/20 hover:border-slate-300 shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus size={14} className="group-hover:scale-110 transition-transform" />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Table / Cards Responsive */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className={`w-full ${isMobile ? 'space-y-3' : 'inline-block align-middle'}`}>
          {isMobile ? (
            // Mobile: Stack Cards
            filtered.map((p) => {
              const sessionsCount = sessionsByClient.get(p.id) || 0;
              const isSelected = selectedClients.has(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectClient(p)}
                  className={`group/card backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-6 sm:p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-indigo-300/50 bg-indigo-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleClient(e, p.id); }}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 cursor-pointer transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                    >
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <ChevronRight size={20} className="text-slate-400 group-hover/card:text-slate-600 ml-auto opacity-0 group-hover/card:opacity-100 transition-all" />
                  </div>

                  {/* Priorité mobile: Nom + Prénom + SÉANCES */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{p.lastName}</span>
                      <span className="text-base font-bold text-slate-600">{p.firstName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border ${sessionsCount === 0 ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-900'}`}>
                        {sessionsCount}
                      </div>
                      <span className="text-slate-500">Séances</span>
                    </div>
                  </div>

                  {/* Infos secondaires swipe-like */}
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-500 pt-3 border-t border-slate-200/50">
                    {p.email && <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" />{p.email}</span>}
                    {p.phone && <span className="flex items-center gap-1"><span className="text-indigo-600 font-black">📞</span>{p.phone}</span>}
                    {p.city && <span>{p.city}{p.canton && `, ${p.canton}`}</span>}
                  </div>
                </div>
              );
            })
          ) : (
            // Desktop: Grid Table
            <>
              {/* Header */}
              <div className="grid px-8 h-14 items-center border-b border-slate-100/50 backdrop-blur-sm bg-white/80 sticky top-0 z-10 shadow-sm rounded-t-2xl" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="flex justify-start pl-3 py-2">
                  <div
                    onClick={() => {
                      if (selectedClients.size === filtered.length) setSelectedClients(new Set());
                      else setSelectedClients(new Set(filtered.map(a => a.id)));
                    }}
                    className={`w-5 h-5 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center ${selectedClients.size === filtered.length && filtered.length > 0 ? 'bg-indigo-500 border-indigo-500 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                  >
                    {selectedClients.size === filtered.length && filtered.length > 0 && <span className="text-white text-[9px]">✓</span>}
                  </div>
                </div>
                {visibleColumns.map(colId => {
                  const col = ALL_COLUMNS.find(c => c.id === colId);
                  return (
                    <div
                      key={colId}
                      onClick={() => toggleSort(colId)}
                      className={`py-3 px-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-800 transition-all flex items-center gap-1 justify-${col?.align || 'start'} hover:bg-slate-50/50 rounded-xl mx-1`}
                    >
                      {col?.label}
                      {sortField === colId && <ArrowUpDown size={12} className="text-indigo-500" />}
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto divide-y divide-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                {filtered.map((p, idx) => {
                  const sessionsCount = sessionsByClient.get(p.id) || 0;
                  const isSelected = selectedClients.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectClient(p)}
                      className={`grid px-8 h-16 items-center backdrop-blur-sm bg-white/70 border-b border-white/30 hover:bg-white/90 hover:shadow-lg cursor-pointer transition-all duration-200 group rounded-2xl my-2 active:scale-[0.99] ${isSelected ? 'ring-2 ring-indigo-200/50 shadow-md bg-indigo-50/70' : idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      <div className="flex justify-start pl-3">
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleClient(e, p.id); }}
                          className={`w-5 h-5 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center shadow-sm ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-md'}`}
                        >
                          {isSelected && <CheckCircle2 size={11} className="text-white" />}
                        </div>
                      </div>

                      {visibleColumns.map(colId => {
                        if (colId === 'lastName') return <span key={colId} className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-700">{p.lastName}</span>;
                        if (colId === 'firstName') return <span key={colId} className="text-xs font-bold text-slate-600">{p.firstName}</span>;
                        if (colId === 'email') return <span key={colId} className="text-xs font-bold text-slate-600 truncate pr-2">{p.email || '—'}</span>;
                        if (colId === 'phone') return <span key={colId} className="text-xs font-bold text-slate-600">{p.phone || '—'}</span>;
                        if (colId === 'city') return <span key={colId} className="text-xs font-bold text-slate-600 uppercase">{p.city || '—'}</span>;
                        if (colId === 'canton') return <span key={colId} className="text-xs font-black text-slate-900 uppercase text-center">{p.canton || '—'}</span>;
                        if (colId === 'insurance') return <span key={colId} className="text-xs font-bold text-slate-600 uppercase tracking-wider">{p.insurance || '—'}</span>;
                        if (colId === 'sessions') return (
                          <div key={colId} className="flex justify-center">
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-2xl text-sm font-black shadow-sm border backdrop-blur-sm ${sessionsCount === 0 ? 'bg-slate-100/70 border-slate-200/50 text-slate-400' : 'bg-white border-slate-200/50 text-slate-900 hover:shadow-md'}`}>
                              {sessionsCount}
                            </span>
                          </div>
                        );
                        return null;
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {filtered.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500 gap-6">
              <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100/70 to-indigo-100/70 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-xl border border-white/50">
                <Users size={32} className="text-slate-400" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-lg sm:text-base tracking-tight mb-2">Aucun patient trouvé</p>
                <p className="text-slate-400 text-sm italic">pour "{search}"</p>
              </div>
              <button
                onClick={() => onNewClient(search)}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-[0.1em] hover:shadow-2xl hover:scale-[1.02] active:scale-95 shadow-lg transition-all backdrop-blur-sm border border-indigo-300/30"
              >
                <Plus size={18} />
                Créer ce patient
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}