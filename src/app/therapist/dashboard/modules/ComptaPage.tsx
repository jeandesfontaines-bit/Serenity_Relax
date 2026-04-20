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
    <div className="flex-1 flex flex-col h-full bg-bg-soft">
      {/* Header & Stats */}
      <header className="bg-white border-b border-border px-m sm:px-xl py-m shrink-0">
        <div className="flex items-center justify-between mb-xl">
          <div>
            <h1 className="font-heading text-h3 font-black text-sapphire tracking-heading leading-heading uppercase">Facturation & Compta</h1>
            <p className="font-heading text-small font-bold text-samaritan uppercase tracking-widest mt-xxs">Gestion des revenus et encaissements</p>
          </div>
          <div className="flex gap-xs">
            <button className="h-xl px-m bg-bg-soft border border-border rounded-md text-[10px] font-black uppercase tracking-widest text-samaritan hover:bg-border transition-all flex items-center gap-xxs">
              <Download size={14} /> Export CSV
            </button>
            <button className="h-xl px-m bg-azraq text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-azraq/10 hover:bg-azraq/90 transition-all flex items-center gap-xxs">
              <Printer size={14} /> Impression Masse
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-s">
          <StatCard label="Mois en cours" value={`${stats.monthly}`} sub="Encaissé" accent="slate" icon={<TrendingUp size={14}/>} />
          <StatCard label="Année {currentYear}" value={`${stats.yearly}`} sub="Encaissé total" accent="slate" icon={<TrendingUp size={14}/>} />
          <StatCard label="À encaisser" value={`${stats.pending}`} sub={`${appointments.filter(a => !a.paid).length} séances`} accent="slate" icon={<AlertCircle size={14}/>} />
          <StatCard label="Retards" value={`${stats.late}`} sub={`${stats.lateCount} factures`} accent="slate" icon={<AlertCircle size={14}/>} isWarning={stats.late > 0} />
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-m sm:px-xl py-m bg-white border-b border-border flex flex-wrap items-center justify-between gap-m sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-m">
          <div className="flex bg-bg-soft p-xxs rounded-md">
            {(['all', 'month', 'quarter', 'year'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-m py-xs rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white text-azraq shadow-sm' : 'text-samaritan/40 hover:text-azraq'}`}
              >
                {p === 'all' ? 'Tout' : p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>
          <div className="h-l w-[1px] bg-border" />
          <div className="flex bg-bg-soft p-xxs rounded-md">
            {(['all', 'unpaid', 'late', 'paid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-m py-xs rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-white text-azraq shadow-sm' : 'text-samaritan/40 hover:text-azraq'}`}
              >
                {f === 'all' ? 'Tous les statuts' : f === 'unpaid' ? 'À payer' : f === 'late' ? 'En retard' : 'Réglé'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-s flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-s top-1/2 -translate-y-1/2 text-samaritan" size={14} />
            <input 
              type="text" 
              placeholder="RECHERCHER UN PATIENT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-xl pr-m py-xs bg-bg-soft/50 border border-transparent rounded-md font-heading text-small font-black uppercase tracking-widest focus:bg-white focus:border-border focus:ring-0 transition-all placeholder:text-samaritan/30"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-xs rounded-md border transition-all ${showFilters ? 'bg-azraq/5 border-azraq/20 text-azraq' : 'bg-white border-border text-samaritan hover:border-azraq'}`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto px-m sm:px-xl py-xl">
        <div className="bg-white border border-border rounded-card overflow-hidden shadow-xl shadow-azraq/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-soft/50 border-b border-border">
                <th className="px-xl py-m text-[9px] font-black text-samaritan uppercase tracking-widest">Patient & Rituel</th>
                <th className="px-xl py-m text-[9px] font-black text-samaritan uppercase tracking-widest">Période</th>
                <th className="px-xl py-m text-[9px] font-black text-samaritan uppercase tracking-widest text-right">Montant</th>
                <th className="px-xl py-m text-[9px] font-black text-samaritan uppercase tracking-widest text-center">Statut</th>
                <th className="px-xl py-m text-right w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(appt => {
                const isLate = !appt.paid && appt.date && appt.date < todayStr;
                return (
                  <tr key={appt.id} className="hover:bg-bg-soft transition-colors group">
                    <td className="px-xl py-m">
                      <div className="flex items-center gap-m">
                        <div className={`w-xl h-xl rounded-md flex items-center justify-center font-black text-[10px] uppercase tracking-widest ${appt.paid ? 'bg-azraq text-white' : 'bg-bg-soft text-samaritan border border-border'}`}>
                          {appt.clientNameSnapshot?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest truncate">{appt.clientNameSnapshot}</p>
                          <p className="font-heading text-[9px] text-samaritan font-black uppercase tracking-widest truncate">{simplifyServiceName(appt.serviceName || '')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-xl py-m">
                      <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest">{appt.date ? format(parseISO(appt.date), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</p>
                      <p className="font-heading text-[9px] text-samaritan font-black uppercase tracking-widest">{appt.time}</p>
                    </td>
                    <td className="px-xl py-m text-right">
                      <p className={`font-heading text-small font-black uppercase ${appt.paid ? 'text-azraq' : 'text-tomato'}`}>{appt.price || 150} <span className="text-[10px] opacity-40">CHF</span></p>
                    </td>
                    <td className="px-m py-m text-center">
                      <span className={`px-m py-xxs rounded-md font-heading text-[9px] font-black uppercase tracking-widest transition-all ${
                        appt.paid 
                          ? 'bg-aurora/10 text-aurora border border-aurora/10 shadow-sm' 
                          : (isLate ? 'bg-tomato/10 text-tomato border border-tomato/10 shadow-sm' : 'bg-squash/10 text-squash border border-squash/10')
                      }`}>
                        {appt.paid ? 'Réglé' : (isLate ? 'En retard' : 'À encaisser')}
                      </span>
                    </td>
                    <td className="px-xl py-m text-right">
                      <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-all transform translate-x-s group-hover:translate-x-0">
                        {!appt.paid && (
                          <button onClick={() => onSelectAppt(appt)} className="w-xl h-xl flex items-center justify-center bg-white border border-border text-azraq rounded-md hover:bg-azraq/5 hover:border-azraq transition-all shadow-sm" title="Encaisser">
                            <Banknote size={14} />
                          </button>
                        )}
                        <button onClick={() => handlePrint(appt.id)} className="w-xl h-xl flex items-center justify-center bg-white border border-border text-samaritan rounded-md hover:border-azraq hover:text-azraq transition-all shadow-sm" title="Voir / Imprimer">
                          <Printer size={14} />
                        </button>
                        {!appt.paid && (
                          <button className="w-xl h-xl flex items-center justify-center bg-white border border-border text-aurora rounded-md hover:bg-aurora/10 hover:border-aurora transition-all shadow-sm" title={isLate ? "Relancer WhatsApp" : "Envoyer confirmation"}>
                            <Bell size={14} />
                          </button>
                        )}
                        <div className="w-[1px] h-l bg-border mx-xxs" />
                        <button onClick={() => onSelectAppt(appt)} className="w-xl h-xl flex items-center justify-center bg-white border border-border text-samaritan rounded-md hover:border-azraq hover:text-azraq transition-all shadow-sm">
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
            <div className="py-xxxl text-center bg-bg-soft/50">
              <FileText className="mx-auto text-samaritan/10 mb-m" size={48} strokeWidth={1} />
              <p className="font-heading text-[10px] font-black text-samaritan/40 uppercase tracking-widest">Aucune facture trouvée pour ces critères</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ label, value, sub, icon, isWarning }: { label: string, value: string, sub: string, accent: string, icon: React.ReactNode, isWarning?: boolean }) {
  return (
    <div className={`bg-white border border-border rounded-lg p-m shadow-sm transition-all hover:shadow-md ${isWarning ? 'ring-2 ring-tomato/10' : ''}`}>
      <div className="flex items-center justify-between mb-m">
        <span className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest">{label}</span>
        <div className={`w-xl h-xl rounded-md flex items-center justify-center bg-bg-soft text-azraq`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-xxs">
        <p className={`font-heading text-h3 font-black tracking-heading text-sapphire`}>{value}</p>
        <span className="font-heading text-[10px] font-bold text-samaritan uppercase">CHF</span>
      </div>
      <p className="font-heading text-small font-bold text-samaritan mt-xxs uppercase tracking-tight">{sub}</p>
    </div>
  );
}
