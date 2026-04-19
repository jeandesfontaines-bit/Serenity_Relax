import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Download, FileText, Smartphone,
  CreditCard, Banknote, X, ArrowUpDown, Printer, Calendar,
  ChevronRight, Bell, Send, Settings
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Appointment, Invoice, Client } from '../types';

interface ComptaPageProps {
  appointments: Appointment[];
  clients: Client[];
  invoices: Invoice[];
  reminderTemplate: string;
  onUpdateReminder: (val: string) => void;
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt: (appt: Appointment) => void;
}

type SortField = 'date' | 'time' | 'lastName' | 'firstName' | 'price' | 'serviceName' | 'status';

const STATUS_CONFIG = {
  wait: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  late: { label: 'En retard',  cls: 'bg-rose-50 text-rose-600' },
  paid: { label: 'Réglé',      cls: 'bg-emerald-50 text-emerald-700' },
};

export default function ComptaPage({
  appointments, clients, invoices, reminderTemplate, onUpdateReminder, onTogglePayment, onSelectAppt,
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
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filtered + sorted
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

  const toggleSelect = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handlePrint = (id: string) => {
    window.open(`/therapist/invoice/${id}`, '_blank');
  };

  const handleReminder = (appt: Appointment) => {
    const firstName = appt.clientNameSnapshot?.split(' ')[0] || 'Client';
    
    // Remplacement des variables dans le template
    let message = reminderTemplate
      .replace(/{firstName}/g, firstName)
      .replace(/{date}/g, appt.date || '')
      .replace(/{price}/g, (appt.price || 0).toString());

    // On va chercher le numéro dans la fiche client
    const client = clients.find(c => c.id === appt.clientId);
    const phone = client?.phone?.replace(/\D/g, '') || '';
    
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
      
    window.open(whatsappUrl, '_blank');
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
        a.paid ? 'RÉGLÉ' : 'EN ATTENTE',
      ].join(','))
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

  const GRID = 'grid-cols-[40px_100px_60px_1.5fr_1fr_1fr_90px_130px_90px]';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── PAGE HEADER ── */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 sm:px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-slate-900 shrink-0">Facturation</h1>

          <div className="relative flex-1 max-w-sm min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Date range toggle */}
          {showDateRange && (
            <div className="hidden sm:flex items-center gap-2 h-8 bg-slate-50 border border-slate-200 rounded-lg px-2">
              <Calendar size={12} className="text-slate-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none"
              />
              <span className="text-xs text-slate-300">→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={() => setShowTemplateEditor(!showTemplateEditor)}
            className={`flex items-center justify-center w-8 h-8 border rounded-lg transition-colors ${showTemplateEditor ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
            title="Réglages Relance"
          >
            <Settings size={14} />
          </button>

          <button
            onClick={() => {
              if (selectedIds.size > 0 || showDateRange) {
                handleExport();
                if (showDateRange) setShowDateRange(false);
              } else {
                setShowDateRange(true);
              }
            }}
            className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
          >
            <Download size={13} />
            {selectedIds.size > 0 ? `Exporter (${selectedIds.size})` : 'Exporter'}
          </button>
        </div>
      </header>

      {/* ── TEMPLATE EDITOR ── */}
      {showTemplateEditor && (
        <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 sm:px-10 py-4 shrink-0 overflow-hidden animate-in slide-in-from-top duration-200">
           <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                    <Smartphone size={12}/> Message de relance WhatsApp
                 </h3>
                 <span className="text-[9px] text-indigo-400 font-medium italic">Variables : &#123;firstName&#125;, &#123;date&#125;, &#123;price&#125;</span>
              </div>
              <textarea 
                value={reminderTemplate}
                onChange={(e) => onUpdateReminder(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-indigo-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-700 leading-relaxed"
              />
              <p className="mt-2 text-[9px] text-indigo-400">Le message sera automatiquement mis à jour avec le nom du client et les détails de sa séance.</p>
           </div>
        </div>
      )}

      {/* ── SUMMARY BAR ── */}
      <div className="h-10 bg-white border-b border-slate-200 px-6 sm:px-10 flex items-center gap-6 shrink-0">
        <span className="text-xs text-slate-500">
          <span className="font-medium text-emerald-600">{totalPaid} CHF</span> encaissés
        </span>
        <span className="text-xs text-slate-500">
          <span className="font-medium text-amber-600">{totalUnpaid} CHF</span> en attente
        </span>
        {lateCount > 0 && (
          <span className="text-xs text-slate-500">
            <span className="font-medium text-rose-600">{lateCount}</span> en retard
          </span>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} mouvements</span>
      </div>

      {/* ── TABLE ── */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-5 h-full flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className={`grid ${GRID} px-4 h-10 items-center border-b border-slate-200 bg-slate-50 shrink-0`}>
              <div className="flex justify-center">
                <TableCheckbox
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(filtered.map(a => a.id)));
                  }}
                />
              </div>
              <SortHeader label="Date" field="date" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Heure" field="time" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Nom" field="lastName" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Prénom" field="firstName" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Soin" field="serviceName" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortHeader label="Montant" field="price" current={sortField} dir={sortDir} onSort={toggleSort} />
              <div className="text-[11px] font-medium text-slate-500">Statut</div>
              <div className="text-[11px] font-medium text-slate-500">Actions</div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
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
                    className={`grid ${GRID} px-4 h-12 items-center cursor-pointer transition-colors duration-150 group hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/40' : ''}`}
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

                    <span className="text-sm text-slate-500" onClick={() => onSelectAppt(a)}>
                      {a.date ? format(new Date(a.date), 'dd/MM/yy') : '—'}
                    </span>
                    <span className="text-sm text-slate-500" onClick={() => onSelectAppt(a)}>{a.time}</span>
                    <span className="text-sm font-medium text-slate-900 truncate" onClick={() => onSelectAppt(a)}>{lastName}</span>
                    <span className="text-sm text-slate-500 truncate" onClick={() => onSelectAppt(a)}>{firstName}</span>
                    <span className="text-sm text-slate-500 truncate" onClick={() => onSelectAppt(a)}>{a.serviceName || 'Séance'}</span>
                    <span className="text-sm font-medium text-slate-900" onClick={() => onSelectAppt(a)}>{a.price || 0} CHF</span>

                    {/* Status button */}
                    <div onClick={e => e.stopPropagation()}>
                      {payingId === a.id ? (
                        <div className="flex items-center gap-1">
                          {(['Twint', 'Card', 'Cash'] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => { onTogglePayment(a.id, false, m); setPayingId(null); }}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors duration-150"
                              title={m}
                            >
                              {m === 'Twint' ? <Smartphone size={12} /> : m === 'Card' ? <CreditCard size={12} /> : <Banknote size={12} />}
                            </button>
                          ))}
                          <button
                            onClick={() => setPayingId(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => a.paid ? onTogglePayment(a.id, true) : setPayingId(a.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${cfg.cls}`}
                        >
                          {cfg.label}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      {status === 'late' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReminder(a); }}
                          className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-150"
                          title="Relancer"
                        >
                          <Bell size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handlePrint(a.id)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors duration-150"
                        title="Imprimer"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        onClick={() => onSelectAppt(a)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors duration-150"
                        title="Détail"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <FileText size={28} className="text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Aucun mouvement sur cette période</p>
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
      className={`w-4 h-4 rounded border-[1.5px] cursor-pointer transition-colors duration-150 flex items-center justify-center ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white hover:border-slate-400'}`}
    >
      {checked && <span className="text-white text-[8px] leading-none">✓</span>}
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
      className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
    >
      {label}
      {current === field && <ArrowUpDown size={10} className="text-indigo-500" />}
    </button>
  );
}
