import React, { useState } from 'react';
import { Search, Plus, ChevronRight, ArrowUpDown, Users, Settings2, Trash2, GitPullRequest, CheckCircle2 } from 'lucide-react';
import { Client, Appointment } from '../types';

interface PatientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: () => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
}

const ALL_COLUMNS = [
  { id: 'lastName', label: 'NOM', width: '160px' },
  { id: 'firstName', label: 'PRÉNOM', width: '120px' },
  { id: 'email', label: 'EMAIL', width: '220px' },
  { id: 'phone', label: 'TÉLÉPHONE', width: '140px' },
  { id: 'city', label: 'VILLE', width: '120px' },
  { id: 'canton', label: 'CANTON', width: '80px', align: 'center' },
  { id: 'sessions', label: 'SÉANCES', width: '80px', align: 'center' },
  { id: 'insurance', label: 'ASSURANCE', width: '140px' },
];

export default function PatientsPage({ clients, appointments, onSelectClient, onNewClient, onMergeClients }: PatientsPageProps) {
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['lastName', 'firstName', 'email', 'phone', 'city', 'sessions']);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showColPicker, setShowColPicker] = useState(false);
  const [sortField, setSortField] = useState<string>('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = clients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    let valA: any = a[sortField as keyof Client] || '';
    let valB: any = b[sortField as keyof Client] || '';
    
    if (sortField === 'sessions') {
      valA = appointments.filter(apt => apt.clientId === a.id).length;
      valB = appointments.filter(apt => apt.clientId === b.id).length;
    }

    const res = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
    return sortDir === 'asc' ? res : -res;
  });

  const toggleSort = (id: string) => {
    if (sortField === id) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(id); setSortDir('asc'); }
  };

  const toggleClient = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedClients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedClients(next);
  };

  const gridTemplate = `60px ${visibleColumns.map(colId => ALL_COLUMNS.find(c => c.id === colId)?.width).join(' ')} 60px`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in fade-in duration-500">
      {/* Topbar */}
      <div className="h-24 border-b border-slate-100 px-12 flex items-center gap-10 shrink-0 bg-white shadow-sm z-30">
        <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Patients</h1>
        
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="RECHERCHER UN PATIENT..."
            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-[11px] font-black text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {selectedClients.size > 1 && (
            <button 
              onClick={() => {
                const [primary, ...others] = Array.from(selectedClients);
                onMergeClients?.(primary, others);
                setSelectedClients(new Set());
              }}
              className="flex items-center gap-3 h-14 px-8 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm border border-indigo-100"
            >
              <GitPullRequest size={16} /> Fusionner ({selectedClients.size})
            </button>
          )}

          <div className="relative">
            <button 
              onClick={() => setShowColPicker(!showColPicker)}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
            >
              <Settings2 size={20} />
            </button>
            
            {showColPicker && (
              <div className="absolute right-0 top-16 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 animate-in zoom-in-95 duration-200">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Afficher Colonnes</p>
                <div className="space-y-2">
                  {ALL_COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => {
                        if (visibleColumns.includes(col.id)) setVisibleColumns(visibleColumns.filter(id => id !== col.id));
                        else setVisibleColumns([...visibleColumns, col.id]);
                      }}
                      className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-tight py-2 px-3 rounded-xl transition-all hover:bg-slate-50 text-slate-500"
                    >
                      {col.label}
                      {visibleColumns.includes(col.id) && <CheckCircle2 size={14} className="text-[#5F27CD]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={onNewClient}
            className="flex items-center gap-3 h-14 px-8 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> Nouveau patient
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-12 py-8 scrollbar-hide">
        <div className="min-w-full inline-block align-middle">
          {/* Header */}
          <div className="grid px-8 h-12 items-center border-b border-slate-100 sticky top-0 bg-white z-10" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">SELECT</div>
            {visibleColumns.map(colId => {
              const col = ALL_COLUMNS.find(c => c.id === colId);
              return (
                <div 
                  key={colId} 
                  onClick={() => toggleSort(colId)}
                  className={`text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors flex items-center gap-1 ${col?.align === 'center' ? 'justify-center' : ''}`}
                >
                  {col?.label}
                  {sortField === colId && <ArrowUpDown size={11} />}
                </div>
              );
            })}
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-right pr-2">ACTIONS</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {filtered.map(p => {
              const sessionsCount = appointments.filter(a => a.clientId === p.id || a.clientNameSnapshot === `${p.firstName} ${p.lastName}`).length;
              const isSelected = selectedClients.has(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectClient(p)}
                  className={`grid px-8 h-20 items-center border-b border-transparent hover:bg-slate-50/80 cursor-pointer transition-all group rounded-[2rem] my-1 ${isSelected ? 'bg-indigo-50/50 border-indigo-100' : ''}`}
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <div onClick={(e) => toggleClient(e, p.id)} className="flex items-center">
                     <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-[#5F27CD] border-[#5F27CD]' : 'border-slate-200 bg-white'}`}>
                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                     </div>
                  </div>

                  {visibleColumns.map(colId => {
                    if (colId === 'lastName') return <span key={colId} className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{p.lastName}</span>;
                    if (colId === 'firstName') return <span key={colId} className="text-[11px] font-bold text-slate-400 uppercase">{p.firstName}</span>;
                    if (colId === 'email') return <span key={colId} className="text-[11px] font-bold text-slate-400 truncate pr-6">{p.email || '—'}</span>;
                    if (colId === 'phone') return <span key={colId} className="text-[11px] font-black text-slate-700">{p.phone || '—'}</span>;
                    if (colId === 'city') return <span key={colId} className="text-[11px] font-bold text-slate-400 uppercase">{p.city || '—'}</span>;
                    if (colId === 'canton') return <span key={colId} className="text-[11px] font-black text-slate-400 uppercase text-center">{p.canton || '—'}</span>;
                    if (colId === 'insurance') return <span key={colId} className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{p.insurance || '—'}</span>;
                    if (colId === 'sessions') return (
                      <div key={colId} className="flex justify-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${sessionsCount === 0 ? 'bg-slate-50 text-slate-200' : 'bg-white border border-slate-100 text-slate-900 shadow-sm'}`}>
                          {sessionsCount}
                        </span>
                      </div>
                    );
                    return null;
                  })}

                  <div className="flex justify-end">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm group-hover:bg-slate-900 group-hover:text-white">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Users size={32}/>
              </div>
              <p className="text-slate-400 font-bold italic tracking-tight">Aucun patient trouvé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
