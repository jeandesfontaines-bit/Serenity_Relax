import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Download, FileText, Smartphone,
  CreditCard, Banknote, X, ArrowUpDown, Printer, Calendar,
  ChevronRight, Bell, Send, Settings, AlertCircle, TrendingUp, Filter, Mail, MessageCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isBefore, parseISO, startOfYear, endOfYear, subMonths, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment, Invoice, Client } from '../types';
import { simplifyServiceName } from '@/lib/utils';

interface ComptaPageProps {
  appointments: Appointment[];
  clients: Client[];
  invoices: Invoice[];
  reminderTemplate: string;
  initialFilter?: 'all' | 'unpaid' | 'late';
  onUpdateReminder: (val: string) => void;
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt: (appt: Appointment) => void;
}

type Period = 'month' | 'quarter' | 'year' | 'all';

export default function ComptaPage({
  appointments, clients, invoices, reminderTemplate, initialFilter, onUpdateReminder, onTogglePayment, onSelectAppt,
}: ComptaPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'late' | 'paid'>(initialFilter || 'all');
  const [period, setPeriod] = useState<Period>('year');
  const [showFilters, setShowFilters] = useState(false);
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentYear = new Date().getFullYear();

  // Sync with initial filter
  React.useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
      if (initialFilter === 'late' || initialFilter === 'unpaid') {
        setPeriod('all');
      }
    }
  }, [initialFilter]);

  // Financial Stats
  const stats = useMemo(() => {
    const now = new Date();
    const curMonth = format(now, 'yyyy-MM');
    const curYear = format(now, 'yyyy');

    const paid = appointments.filter(a => a.paid && a.status !== 'cancelled');
    const unpaid = appointments.filter(a => !a.paid && a.status !== 'cancelled');
    const late = unpaid.filter(a => a.date && a.date < todayStr);

    return {
      monthly: paid.filter(a => a.date?.startsWith(curMonth)).reduce((s, a) => s + (a.price || 150), 0),
      yearly: paid.filter(a => a.date?.startsWith(curYear)).reduce((s, a) => s + (a.price || 150), 0),
      pending: unpaid.reduce((s, a) => s + (a.price || 150), 0),
      late: late.reduce((s, a) => s + (a.price || 150), 0),
      lateCount: late.length
    };
  }, [appointments, todayStr]);

  const filtered = useMemo(() => {
    return appointments
      .filter(a => {
        if (a.status === 'cancelled') return false;

        // Status Filter
        const isLate = !a.paid && a.date && a.date < todayStr;
        if (statusFilter === 'late' && !isLate) return false;
        if (statusFilter === 'unpaid' && a.paid) return false;
        if (statusFilter === 'paid' && !a.paid) return false;

        // Period Filter
        if (period !== 'all' && a.date) {
          const d = parseISO(a.date);
          const now = new Date();
          if (period === 'month' && !isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) })) return false;
          if (period === 'quarter' && !isWithinInterval(d, { start: subMonths(now, 3), end: now })) return false;
          if (period === 'year' && !isWithinInterval(d, { start: startOfYear(now), end: endOfYear(now) })) return false;
        }

        // Search Filter
        const searchLow = search.toLowerCase();
        const matchesSearch = 
          (a.clientNameSnapshot || '').toLowerCase().includes(searchLow) ||
          (a.serviceName || '').toLowerCase().includes(searchLow);
        
        return matchesSearch;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [appointments, statusFilter, period, search, todayStr]);

  const handlePrint = (id: string) => {
    window.open(`/therapist/invoice/${id}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
      {/* Header & Stats */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Facturation & Compta</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestion des revenus et encaissements</p>
          </div>
          <div className="flex gap-2">
            <button className="h-9 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
            <button className="h-9 px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Printer size={14} /> Impression Masse
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Mois en cours" value={`${stats.monthly}`} sub="Encaissé" accent="indigo" icon={<TrendingUp size={14}/>} />
          <StatCard label="Année {currentYear}" value={`${stats.yearly}`} sub="Encaissé total" accent="emerald" icon={<TrendingUp size={14}/>} />
          <StatCard label="À encaisser" value={`${stats.pending}`} sub={`${appointments.filter(a => !a.paid).length} séances`} accent="amber" icon={<AlertCircle size={14}/>} />
          <StatCard label="Retards" value={`${stats.late}`} sub={`${stats.lateCount} factures`} accent="rose" icon={<AlertCircle size={14}/>} isWarning={stats.late > 0} />
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'month', 'quarter', 'year'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {p === 'all' ? 'Tout' : p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'unpaid', 'late', 'paid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f === 'all' ? 'Tous les statuts' : f === 'unpaid' ? 'À payer' : f === 'late' ? 'En retard' : 'Réglé'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="RECHERCHER UN PATIENT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-indigo-100 focus:ring-0 transition-all placeholder:text-slate-300"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto p-8 pt-6">
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient & Rituel</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Période</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Montant</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Statut</th>
                <th className="px-6 py-5 text-right w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(appt => {
                const isLate = !appt.paid && appt.date && appt.date < todayStr;
                return (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${appt.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                          {appt.clientNameSnapshot?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{appt.clientNameSnapshot}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{simplifyServiceName(appt.serviceName || '')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{appt.date ? format(parseISO(appt.date), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</p>
                      <p className="text-[9px] text-slate-300 font-black tracking-widest uppercase">{appt.time}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-black ${appt.paid ? 'text-slate-900' : 'text-rose-600'}`}>{appt.price || 150} <span className="text-[10px] opacity-40">CHF</span></p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                        appt.paid 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : (isLate ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-400 border border-slate-100')
                      }`}>
                        {appt.paid ? 'Réglé' : (isLate ? 'En retard' : 'À encaisser')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        {!appt.paid && (
                          <button onClick={() => onSelectAppt(appt)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-amber-500 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all shadow-sm" title="Encaisser">
                            <Banknote size={14} />
                          </button>
                        )}
                        <button onClick={() => handlePrint(appt.id)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm" title="Voir / Imprimer Facture">
                          <Printer size={14} />
                        </button>
                        {!appt.paid && (
                          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm" title={isLate ? "Relancer WhatsApp" : "Envoyer confirmation"}>
                            <MessageCircle size={14} />
                          </button>
                        )}
                        <div className="w-px h-6 bg-slate-100 mx-1" />
                        <button onClick={() => onSelectAppt(appt)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-300 rounded-lg hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center bg-slate-50/30">
              <FileText className="mx-auto text-slate-200 mb-4" size={48} strokeWidth={1} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune facture trouvée pour ces critères</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ label, value, sub, accent, icon, isWarning }: { label: string, value: string, sub: string, accent: 'indigo' | 'emerald' | 'rose' | 'amber', icon: React.ReactNode, isWarning?: boolean }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${isWarning ? 'ring-2 ring-rose-100' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <p className={`text-2xl font-black tracking-tighter ${colors[accent].split(' ')[0]}`}>{value}</p>
        <span className="text-[10px] font-bold text-slate-400 uppercase">CHF</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{sub}</p>
    </div>
  );
}
