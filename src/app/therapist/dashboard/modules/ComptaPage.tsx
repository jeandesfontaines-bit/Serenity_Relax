import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Download, FileText, Smartphone,
  CreditCard, Banknote, X, ArrowUpDown, Printer, Calendar,
  ChevronRight, Trash2, Check,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Appointment, Invoice } from '../types';

interface ComptaPageProps {
  appointments: Appointment[];
  invoices: Invoice[];
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt: (appt: Appointment) => void;
  onDeleteInvoices?: (ids: string[]) => void;
}

type SortField = 'date' | 'time' | 'lastName' | 'firstName' | 'price' | 'serviceName' | 'status';

const STATUS_CONFIG = {
  wait: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border border-amber-100' },
  late: { label: 'En retard',  cls: 'bg-rose-50 text-rose-600 border border-rose-100' },
  paid: { label: 'Réglé',      cls: 'bg-zinc-900 text-white border border-zinc-900' },
};

export default function ComptaPage({
  appointments, invoices, onTogglePayment, onSelectAppt, onDeleteInvoices,
}: ComptaPageProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDateRange, setShowDateRange] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filtered = useMemo(() =>
    appointments
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
          valA = (a.clientNameSnapshot || '').split(' ').slice(0, -1).join(' ');
          valB = (b.clientNameSnapshot || '').split(' ').slice(0, -1).join(' ');
        }
        if (sortField === 'status') {
          const order = (apt: Appointment) => apt.paid ? 3 : (apt.date && apt.date < todayStr ? 1 : 2);
          valA = order(a);
          valB = order(b);
        }
        const res = String(valA).localeCompare(String(valB));
        return sortDir === 'asc' ? res : -res;
      }),
    [appointments, search, dateRange, sortField, sortDir, todayStr],
  );

  const totalPaid = useMemo(() =>
    filtered.filter(a => a.paid).reduce((acc, a) => acc + (a.price || 0), 0),
    [filtered],
  );
  const totalUnpaid = useMemo(() =>
    filtered.filter(a => !a.paid).reduce((acc, a) => acc + (a.price || 0), 0),
    [filtered],
  );
  const lateCount = useMemo(() =>
    filtered.filter(a => !a.paid && a.date && a.date < todayStr).length,
    [filtered, todayStr],
  );

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }, [sortField]);

  const handlePrint = (id: string) => window.open(`/therapist/invoice/${id}`, '_blank');

  const handleExport = () => {
    const toExport = selectedIds.size > 0
      ? filtered.filter(a => selectedIds.has(a.id))
      : filtered;
    const csv = [
      ['Date', 'Client', 'Service', 'Montant', 'Statut'].join(','),
      ...toExport.map(a => [a.date, a.clientNameSnapshot, a.serviceName || 'Soin', a.price, a.paid ? 'RÉGLÉ' : 'EN ATTENTE'].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `compta-${dateRange.start}-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (confirm(`Supprimer ces ${ids.length} mouvement(s) ? Les factures et rendez-vous associés seront également supprimés.`)) {
      onDeleteInvoices?.(ids);
      setSelectedIds(new Set());
    }
  }, [selectedIds, onDeleteInvoices]);

  const GRID = 'grid-cols-[36px_90px_56px_1.5fr_1fr_1fr_100px_120px_80px]';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]">

      {/* ── PAGE HEADER ── */}
      <header className="h-16 border-b border-zinc-100 bg-[#faf9f7] px-8 sm:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 min-w-0 flex-1">
          <div>
            <p className="font-serif text-[8px] tracking-[0.5em] text-zinc-400 uppercase mb-0.5">MODULE</p>
            <h1 className="font-serif text-base tracking-tighter text-zinc-900 uppercase">Facturation</h1>
          </div>

          <div className="relative flex-1 max-w-xs min-w-0">
            <Search size={13} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-9 bg-white border border-zinc-200 pl-10 pr-4 font-serif text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showDateRange && (
            <div className="hidden sm:flex items-center gap-2 h-9 bg-white border border-zinc-200 px-3">
              <Calendar size={12} strokeWidth={1.5} className="text-zinc-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-transparent font-serif text-xs text-zinc-700 focus:outline-none"
              />
              <span className="font-serif text-xs text-zinc-200">→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-transparent font-serif text-xs text-zinc-700 focus:outline-none"
              />
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
            className="flex items-center gap-2 h-9 px-4 bg-white border border-zinc-200 font-serif text-[10px] tracking-[0.3em] uppercase text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-300"
          >
            <Download size={13} strokeWidth={1.5} />
            {selectedIds.size > 0 ? `Exporter (${selectedIds.size})` : 'Exporter'}
          </button>
        </div>
      </header>

      {/* ── SELECTION BAR ── */}
      {selectedIds.size > 0 && (
        <div className="h-10 bg-zinc-900 px-8 sm:px-12 flex items-center justify-between shrink-0">
          <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-zinc-300">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-5">
            <button
              onClick={handleDelete}
              className="font-serif text-[10px] tracking-[0.3em] uppercase text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
            >
              <Trash2 size={12} strokeWidth={1.5} /> Supprimer
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="font-serif text-[10px] tracking-[0.3em] uppercase text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <X size={12} strokeWidth={1.5} /> Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* ── SUMMARY BAR ── */}
      <div className="h-10 bg-white border-b border-zinc-100 px-8 sm:px-12 flex items-center gap-8 shrink-0">
        <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-zinc-500">
          <span className="text-zinc-900">{totalPaid} CHF</span> encaissés
        </span>
        <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-zinc-500">
          <span className="text-amber-600">{totalUnpaid} CHF</span> en attente
        </span>
        {lateCount > 0 && (
          <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-zinc-500">
            <span className="text-rose-600">{lateCount}</span> en retard
          </span>
        )}
        <span className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-300 ml-auto">{filtered.length} mouvements</span>
      </div>

      {/* ── TABLE ── */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-6 h-full flex flex-col">
          <div className="bg-white border border-zinc-100 flex-1 flex flex-col overflow-hidden">

            {/* Table header */}
            <div className={`grid ${GRID} px-5 h-10 items-center border-b border-zinc-100 bg-zinc-50 shrink-0`}>
              <div className="flex justify-center">
                <TableCheckbox
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(filtered.map(a => a.id)));
                  }}
                />
              </div>
              <SortHeader label="Date"    field="date"        current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Heure"   field="time"        current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Nom"     field="lastName"    current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Prénom"  field="firstName"   current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Soin"    field="serviceName" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Montant" field="price"       current={sortField} dir={sortDir} onSort={toggleSort} />
              <div className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400">Statut</div>
              <div className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400">Actions</div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
              {filtered.map(a => {
                const status = a.paid ? 'paid' : (a.date && a.date < todayStr ? 'late' : 'wait');
                const cfg = STATUS_CONFIG[status];
                const isSelected = selectedIds.has(a.id);
                const nameParts = (a.clientNameSnapshot || '').split(' ');
                const lastName = nameParts.length > 1 ? nameParts.pop() : a.clientNameSnapshot;
                const firstName = nameParts.join(' ');

                return (
                  <div
                    key={a.id}
                    className={`grid ${GRID} px-5 h-12 items-center transition-colors duration-150 group ${isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50/60'}`}
                  >
                    <div className="flex justify-center">
                      <TableCheckbox
                        checked={isSelected}
                        onChange={() => {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            next.has(a.id) ? next.delete(a.id) : next.add(a.id);
                            return next;
                          });
                        }}
                      />
                    </div>

                    <span className="font-serif text-sm text-zinc-500 cursor-pointer" onClick={() => onSelectAppt(a)}>
                      {a.date ? format(new Date(a.date), 'dd/MM/yy') : '—'}
                    </span>
                    <span className="font-serif text-sm text-zinc-500 cursor-pointer" onClick={() => onSelectAppt(a)}>{a.time}</span>
                    <span className="font-serif text-sm text-zinc-900 truncate tracking-tight cursor-pointer group-hover:italic transition-all" onClick={() => onSelectAppt(a)}>{lastName}</span>
                    <span className="font-serif text-sm text-zinc-500 truncate cursor-pointer" onClick={() => onSelectAppt(a)}>{firstName}</span>
                    <span className="font-serif text-sm text-zinc-500 truncate cursor-pointer" onClick={() => onSelectAppt(a)}>{a.serviceName || 'Séance'}</span>
                    <span className="font-serif text-sm text-zinc-900 tracking-tight cursor-pointer" onClick={() => onSelectAppt(a)}>{a.price || 0} CHF</span>

                    {/* Status / pay button */}
                    <div onClick={e => e.stopPropagation()}>
                      {payingId === a.id ? (
                        <div className="flex items-center gap-1">
                          {(['Twint', 'Card', 'Cash'] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => { onTogglePayment(a.id, false, m); setPayingId(null); }}
                              className="w-7 h-7 bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300"
                              title={m}
                            >
                              {m === 'Twint' ? <Smartphone size={11} strokeWidth={1.5} /> : m === 'Card' ? <CreditCard size={11} strokeWidth={1.5} /> : <Banknote size={11} strokeWidth={1.5} />}
                            </button>
                          ))}
                          <button
                            onClick={() => setPayingId(null)}
                            className="w-7 h-7 bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:border-rose-400 hover:text-rose-500 transition-all"
                          >
                            <X size={11} strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => a.paid ? onTogglePayment(a.id, true) : setPayingId(a.id)}
                          className={`px-2.5 py-1 font-serif text-[9px] tracking-[0.2em] uppercase transition-all ${cfg.cls}`}
                        >
                          {cfg.label}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePrint(a.id)}
                        className="w-7 h-7 bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all duration-300"
                        title="Imprimer"
                      >
                        <Printer size={12} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => onSelectAppt(a)}
                        className="w-7 h-7 bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all duration-300"
                        title="Détail"
                      >
                        <ChevronRight size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <FileText size={28} strokeWidth={1} className="text-zinc-200 mb-4" />
                <p className="font-serif text-sm text-zinc-400 tracking-tight">Aucun mouvement sur cette période</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── TABLE CHECKBOX ── */
function TableCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`w-4 h-4 border cursor-pointer transition-all duration-200 flex items-center justify-center ${
        checked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200 bg-white hover:border-zinc-600'
      }`}
    >
      {checked && <Check size={9} strokeWidth={2.5} className="text-white" />}
    </div>
  );
}

/* ── SORT HEADER ── */
function SortHeader({
  label, field, current, dir, onSort,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: 'asc' | 'desc';
  onSort: (f: SortField) => void;
}) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1.5 font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
    >
      {label}
      {current === field && <ArrowUpDown size={9} strokeWidth={1.5} className="text-zinc-900" />}
    </button>
  );
}
