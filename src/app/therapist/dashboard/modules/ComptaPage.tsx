import React, { useState } from 'react';
import { 
  Search, Download, AlertCircle, FileText, Smartphone, 
  CreditCard, Banknote, X, ArrowUpDown, Printer, Calendar, 
  ChevronRight, Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment, Invoice } from '../types';

interface ComptaPageProps {
  appointments: Appointment[];
  invoices: Invoice[];
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt: (appt: Appointment) => void;
}

type SortField = 'date' | 'time' | 'lastName' | 'firstName' | 'price' | 'serviceName' | 'status';

const STATUS_CONFIG = {
  wait: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  late: { label: 'En retard', className: 'bg-rose-50 text-rose-600 border-rose-100' },
  paid: { label: 'Réglé', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
};

export default function ComptaPage({ 
  appointments, 
  invoices, 
  onTogglePayment, 
  onSelectAppt 
}: ComptaPageProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDateRange, setShowDateRange] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filtered = appointments
    .filter(a => {
      const statusLabel = a.paid ? 'réglé' : (a.date && a.date < todayStr ? 'en retard' : 'en attente');
      const searchStr = `${a.clientNameSnapshot} ${a.serviceName || ''} ${a.date || ''} ${a.time || ''} ${a.price || ''} ${statusLabel}`.toLowerCase();
      const matchesSearch = searchStr.includes(search.toLowerCase());
      const inRange = a.date && a.date >= dateRange.start && a.date <= dateRange.end;
      return matchesSearch && inRange;
    })
    .sort((a, b) => {
      let valA: any = a[sortField as keyof Appointment] || '';
      let valB: any = b[sortField as keyof Appointment] || '';
      if (sortField === 'lastName') {
        valA = (a.clientNameSnapshot || '').split(' ').pop() || '';
        valB = (b.clientNameSnapshot || '').split(' ').pop() || '';
      }
      if (sortField === 'firstName') {
        const partsA = (a.clientNameSnapshot || '').split(' ');
        const partsB = (b.clientNameSnapshot || '').split(' ');
        valA = partsA.length > 1 ? partsA[0] : '';
        valB = partsB.length > 1 ? partsB[0] : '';
      }
      if (sortField === 'status') {
        const getStatusOrder = (apt: Appointment) => {
          if (apt.paid) return 3;
          if (apt.date && apt.date < todayStr) return 1;
          return 2;
        };
        valA = getStatusOrder(a);
        valB = getStatusOrder(b);
      }
      const res = String(valA).localeCompare(String(valB));
      return sortDir === 'asc' ? res : -res;
    });

  const total = filtered.reduce((acc, a) => acc + (a.price || 0), 0);
  const totalPaid = filtered.filter(a => a.paid).reduce((acc, a) => acc + (a.price || 0), 0);
  const lateCount = filtered.filter(a => !a.paid && a.date && a.date < todayStr).length;

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handlePrint = (id: string) => {
    window.open(`/therapist/invoice/${id}`, '_blank');
  };

  const handleExport = () => {
    const toExport = selectedIds.size > 0 
      ? filtered.filter(a => selectedIds.has(a.id))
      : filtered;

    const csv = [
      ['Date', 'Client', 'Service', 'Montant', 'Statut'].join(','),
      ...toExport.map(a => [
        a.date,
        a.clientNameSnapshot,
        a.serviceName || 'Soin',
        a.price,
        a.paid ? 'RÉGLÉ' : 'EN ATTENTE'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export-compta-${dateRange.start}-au-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in fade-in duration-500">
      {/* Topbar */}
      <div className="h-24 border-b border-slate-100 px-12 flex items-center gap-10 shrink-0 bg-white shadow-sm z-30">
        <h1 className="text-xl font-black tracking-[0.1em] text-slate-900 uppercase">Comptabilité</h1>
        
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="RECHERCHER..."
            className="w-full h-9 bg-slate-50 border border-slate-100 rounded-full pl-12 pr-4 text-[11px] font-black text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-inner tracking-[0.05em]"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {showDateRange && selectedIds.size === 0 && (
            <div className="flex items-center h-9 bg-slate-50 p-1 rounded-full border border-slate-100 shadow-inner animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-2 px-3">
                  <Calendar size={12} className="text-slate-300"/>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    className="bg-transparent text-[9px] font-black text-slate-600 focus:outline-none uppercase tracking-[0.1em]"
                  />
               </div>
               <div className="w-px h-4 bg-slate-200" />
               <div className="flex items-center gap-2 px-3">
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    className="bg-transparent text-[9px] font-black text-slate-600 focus:outline-none uppercase tracking-[0.1em]"
                  />
               </div>
            </div>
          )}

          <button 
            onClick={() => {
              if (selectedIds.size > 0 || showDateRange) {
                handleExport();
                if (showDateRange) setShowDateRange(false);
              } else {
                setShowDateRange(true);
              }
            }}
            className="flex items-center gap-2 h-9 px-6 bg-slate-50 text-slate-400 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-100 hover:text-slate-600 transition-all shadow-sm active:scale-95"
          >
            <Download size={14} /> 
            {selectedIds.size > 0 ? `Exporter (${selectedIds.size})` : "Exporter"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-12 py-10">
        {/* Table Content */}
        <div className="min-w-full inline-block align-middle">
          <div className="grid grid-cols-[60px_120px_80px_160px_120px_180px_100px_140px_100px] px-8 h-12 items-center border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex justify-start pl-2">
              <div 
                onClick={() => {
                  if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                  else setSelectedIds(new Set(filtered.map(a => a.id)));
                }}
                className={`w-4 h-4 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'}`}
              >
                {selectedIds.size === filtered.length && filtered.length > 0 && <span className="text-white text-[8px]">✓</span>}
              </div>
            </div>
            <button onClick={() => toggleSort('date')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">DATE <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('time')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">HEURE <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('lastName')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">NOM <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('firstName')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">PRÉNOM <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('serviceName')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">SOIN <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('price')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">MONTANT <ArrowUpDown size={11}/></button>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STATUT</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">ACTIONS</div>
          </div>

          <div className="divide-y divide-slate-50 mt-4">
            {filtered.map((a, idx) => {
              const status = a.paid ? 'paid' : (a.date && a.date < todayStr ? 'late' : 'wait');
              const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
              const isSelected = selectedIds.has(a.id);
              
              const nameParts = (a.clientNameSnapshot || '').split(' ');
              const lastName = nameParts.length > 1 ? nameParts.pop() : a.clientNameSnapshot;
              const firstName = nameParts.join(' ');
              
              return (
                <div key={a.id} className={`grid grid-cols-[60px_120px_80px_160px_120px_180px_100px_140px_100px] px-8 h-14 items-center border-b border-transparent hover:bg-slate-50/80 cursor-pointer transition-all group rounded-[2rem] my-1 ${isSelected ? 'bg-indigo-50/50 border-indigo-100' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                   <div className="flex justify-start pl-2">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = new Set(selectedIds);
                        if (next.has(a.id)) next.delete(a.id);
                        else next.add(a.id);
                        setSelectedIds(next);
                      }}
                      className={`w-4 h-4 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'bg-[#5F27CD] border-[#5F27CD]' : 'border-slate-200 bg-white'}`}
                    >
                      {isSelected && <span className="text-white text-[8px]">✓</span>}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{a.date ? format(new Date(a.date), 'dd MMM yyyy') : '—'}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{a.time}</span>
                  <div onClick={() => onSelectAppt(a)} className="flex items-center cursor-pointer">
                    <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate pr-4">{lastName}</span>
                  </div>
                  <div onClick={() => onSelectAppt(a)} className="flex items-center cursor-pointer">
                    <span className="text-[11px] font-bold text-slate-500 tracking-tight truncate pr-4">{firstName}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-wide truncate pr-4">{a.serviceName || 'Soin'}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-black text-slate-900">{a.price || 0}</span>
                  </div>
                  
                  <div onClick={e => e.stopPropagation()}>
                    {payingId === a.id ? (
                      <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                        {(['Twint', 'Card', 'Cash'] as const).map(m => (
                          <button key={m} onClick={() => { onTogglePayment(a.id, false, m); setPayingId(null); }} className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-[#5F27CD] hover:text-white transition-all">
                            {m === 'Twint' ? <Smartphone size={14}/> : m === 'Card' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                          </button>
                        ))}
                        <button onClick={() => setPayingId(null)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={14}/></button>
                      </div>
                    ) : (
                      <button onClick={() => a.paid ? onTogglePayment(a.id, true) : setPayingId(a.id)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${cfg.className}`}>
                        {a.paid ? `RÉGLÉ` : cfg.label}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-start gap-2">
                    <button 
                      onClick={() => handlePrint(a.id)}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <Printer size={16} />
                    </button>
                    <div onClick={() => onSelectAppt(a)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-[#5F27CD] hover:text-white transition-all shadow-sm active:scale-90">
                       <ChevronRight size={16}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-32 text-center bg-slate-50/30">
              <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                <FileText size={40}/>
              </div>
              <p className="text-slate-400 font-bold italic tracking-tight">Aucun mouvement financier sur cette période.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
