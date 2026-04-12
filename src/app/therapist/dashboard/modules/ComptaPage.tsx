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

type SortField = 'date' | 'clientName' | 'price' | 'serviceName';

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
  const [payingId, setPayingId] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filtered = appointments
    .filter(a => {
      const matchesSearch = `${a.clientNameSnapshot} ${a.serviceName || ''}`.toLowerCase().includes(search.toLowerCase());
      const inRange = a.date && a.date >= dateRange.start && a.date <= dateRange.end;
      return matchesSearch && inRange;
    })
    .sort((a, b) => {
      let valA: any = a[sortField as keyof Appointment] || '';
      let valB: any = b[sortField as keyof Appointment] || '';
      if (sortField === 'clientName') {
        valA = a.clientNameSnapshot || '';
        valB = b.clientNameSnapshot || '';
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
        <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Comptabilité</h1>
        
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="RECHERCHER..."
            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-[11px] font-black text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center h-14 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex items-center gap-3 px-4">
                <Calendar size={14} className="text-slate-300"/>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent text-[10px] font-black text-slate-600 focus:outline-none uppercase"
                />
             </div>
             <div className="w-px h-6 bg-slate-200" />
             <div className="flex items-center gap-2 px-3">
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent text-[10px] font-black text-slate-600 focus:outline-none uppercase"
                />
             </div>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-3 h-14 px-8 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all shadow-sm active:scale-95"
          >
            <Download size={16} /> Exporter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-12 py-10">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div className="bg-gradient-to-br from-[#5F27CD] to-[#341F97] p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Total période</p>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black tracking-tighter">{total.toFixed(2)}</h3>
               <span className="text-lg opacity-60 pb-1 font-bold">CHF</span>
            </div>
          </div>
          <div className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:border-indigo-100 transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Encaissé</p>
            <h3 className="text-4xl font-black tracking-tighter text-emerald-600">{totalPaid.toFixed(2)} <span className="text-lg opacity-40">CHF</span></h3>
          </div>
          <div className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:border-rose-100 transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">En retard</p>
            <h3 className="text-4xl font-black tracking-tighter text-rose-500">{lateCount}</h3>
          </div>
          <div className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:border-indigo-100 transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Prélevé / Moyenne</p>
            <h3 className="text-4xl font-black tracking-tighter text-slate-900">{(total / (filtered.length || 1)).toFixed(0)} <span className="text-lg opacity-40">CHF</span></h3>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-sm">
          <div className="grid grid-cols-[60px_120px_220px_180px_100px_140px_100px] px-10 h-16 items-center border-b border-slate-50 bg-slate-50/30">
            <div className="flex justify-center">
              <div 
                onClick={() => {
                  if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                  else setSelectedIds(new Set(filtered.map(a => a.id)));
                }}
                className={`w-5 h-5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'}`}
              >
                {selectedIds.size === filtered.length && filtered.length > 0 && <span className="text-white text-[10px]">✓</span>}
              </div>
            </div>
            <button onClick={() => toggleSort('date')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">DATE <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('clientName')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">PATIENT <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('serviceName')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">SOIN <ArrowUpDown size={11}/></button>
            <button onClick={() => toggleSort('price')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">MONTANT <ArrowUpDown size={11}/></button>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">STATUT</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ACTIONS</div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map(a => {
              const inv = invoices.find(i => i.appointmentId === a.id);
              const status = a.paid ? 'paid' : (a.date && a.date < todayStr ? 'late' : 'wait');
              const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
              const isSelected = selectedIds.has(a.id);
              
              return (
                <div key={a.id} className="grid grid-cols-[60px_120px_220px_180px_100px_140px_100px] px-10 h-24 items-center hover:bg-slate-50/50 transition-all group">
                   <div className="flex justify-center">
                    <div 
                      onClick={() => {
                        const next = new Set(selectedIds);
                        if (next.has(a.id)) next.delete(a.id);
                        else next.add(a.id);
                        setSelectedIds(next);
                      }}
                      className={`w-5 h-5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'bg-[#5F27CD] border-[#5F27CD]' : 'border-slate-200 bg-white'}`}
                    >
                      {isSelected && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </div>
                   <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900">{a.date ? format(new Date(a.date), 'dd MMM yyyy') : '—'}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{a.time}</span>
                  </div>
                  <div onClick={() => onSelectAppt(a)} className="flex items-center cursor-pointer">
                    <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate pr-4">{a.clientNameSnapshot}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate pr-4">{a.serviceName || 'Soin Signature'}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-black text-slate-900">CHF {a.price || 0}</span>
                  </div>
                  
                  <div onClick={e => e.stopPropagation()}>
                    {payingId === a.id ? (
                      <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                        {(['Twint', 'Card', 'Cash'] as const).map(m => (
                          <button key={m} onClick={() => { onTogglePayment(a.id, false, m); setPayingId(null); }} className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-[#5F27CD] hover:text-white transition-all hover:scale-110">
                            {m === 'Twint' ? <Smartphone size={14}/> : m === 'Card' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                          </button>
                        ))}
                        <button onClick={() => setPayingId(null)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={14}/></button>
                      </div>
                    ) : (
                      <button onClick={() => a.paid ? onTogglePayment(a.id, true) : setPayingId(a.id)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${cfg.className}`}>
                        {a.paid ? `RÉGLÉ ${a.paymentMethod ? '· ' + a.paymentMethod : ''}` : cfg.label}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handlePrint(a.id)}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                      title="Imprimer la facture"
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
