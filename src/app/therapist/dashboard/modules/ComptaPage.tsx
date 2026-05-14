import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { Appointment } from '../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

// Sub-components
import { ComptaPageProps, SortField } from './compta/types';
import { 
  STATUS_META, 
  getTransactionStatus, 
  getClientDisplayName, 
  getClientNameParts, 
  GRID_TEMPLATE 
} from './compta/constants';
import { TableCheckbox, HeaderBtn } from './compta/TableComponents';
import { SelectionToolbar } from './compta/SelectionToolbar';
import { TransactionRow } from './compta/TransactionRow';
import { EmptyState } from './compta/EmptyState';
import { FilterPanel } from './compta/FilterPanel';
import { TransactionFilters } from './compta/types';

export default function ComptaPage({
  appointments,
  invoices,
  onTogglePayment,
  onSelectAppt,
  onDeleteInvoices,
  searchQuery,
  dateRange,
  onSelectedCountChange,
  showFilterPanel,
  onShowFilterPanelChange,
}: ComptaPageProps) {
  const filterDropdownRef = React.useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    paymentMethod: 'all',
    minAmount: null,
  });

  React.useEffect(() => {
    if (!showFilterPanel) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        onShowFilterPanelChange(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showFilterPanel, onShowFilterPanelChange]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payingId, setPayingId] = useState<string | null>(null);

  React.useEffect(() => {
    onSelectedCountChange(selectedIds.size);
  }, [selectedIds.size, onSelectedCountChange]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const invoiceByAppointmentId = useMemo(() => {
    const map = new Map<string, any>();
    invoices.forEach((invoice) => {
      if (invoice.appointmentId) map.set(invoice.appointmentId, invoice);
    });
    return map;
  }, [invoices]);

  const filtered = useMemo(() =>
    appointments
      .filter((appt) => {
        const status = getTransactionStatus(appt, todayStr);
        const haystack = [
          getClientDisplayName(appt),
          appt.serviceName,
          appt.date,
          appt.time,
          appt.price,
          STATUS_META[status].label,
          invoiceByAppointmentId.get(appt.id)?.invoiceNumber,
          appt.paymentMethod,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
        const inRange = appt.date
          ? appt.date >= dateRange.start && appt.date <= dateRange.end
          : false;

        // Apply Advanced Filters
        if (filters.status !== 'all' && status !== filters.status) return false;
        if (filters.paymentMethod !== 'all' && appt.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minAmount !== null && (appt.price || 0) < filters.minAmount) return false;

        return matchesSearch && inRange;
      })
      .sort((a, b) => {
        let valueA: string | number = '';
        let valueB: string | number = '';

        switch (sortField) {
          case 'date':
            valueA = `${a.date || ''} ${a.time || ''}`;
            valueB = `${b.date || ''} ${b.time || ''}`;
            break;
          case 'firstName':
            valueA = getClientNameParts(a).firstName;
            valueB = getClientNameParts(b).firstName;
            break;
          case 'lastName':
            valueA = getClientNameParts(a).lastName;
            valueB = getClientNameParts(b).lastName;
            break;
          case 'reference':
            valueA = invoiceByAppointmentId.get(a.id)?.invoiceNumber || '';
            valueB = invoiceByAppointmentId.get(b.id)?.invoiceNumber || '';
            break;
          case 'serviceName':
            valueA = cleanServiceLabel(a.serviceName) || 'Session';
            valueB = cleanServiceLabel(b.serviceName) || 'Session';
            break;
          case 'price':
            valueA = a.price || 0;
            valueB = b.price || 0;
            break;
          case 'status': {
            const order = { cancelled: 0, late: 1, pending: 2, completed: 3 };
            valueA = order[getTransactionStatus(a, todayStr)];
            valueB = order[getTransactionStatus(b, todayStr)];
            break;
          }
          default:
            valueA = '';
            valueB = '';
        }

        const result = typeof valueA === 'string'
          ? String(valueA).localeCompare(String(valueB))
          : Number(valueA) - Number(valueB);

        return sortDir === 'asc' ? result : -result;
      }),
    [appointments, dateRange.end, dateRange.start, invoiceByAppointmentId, searchQuery, sortDir, sortField, todayStr, filters],
  );

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir((prev) => prev === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  const handleExport = useCallback(() => {
    const rows = selectedIds.size > 0
      ? filtered.filter((appt) => selectedIds.has(appt.id))
      : filtered;

    const csv = [
      ['Date', 'Client', 'Type de rituel', 'Statut', 'Facture', 'Montant'].join(','),
      ...rows.map((appt) => {
        const invoice = invoiceByAppointmentId.get(appt.id);
        return [
          appt.date || '',
          getClientDisplayName(appt),
          cleanServiceLabel(appt.serviceName) || 'Session',
          STATUS_META[getTransactionStatus(appt, todayStr)].label,
          invoice?.invoiceNumber || '',
          appt.price || 0,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finances-${dateRange.start}-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [dateRange.end, dateRange.start, filtered, invoiceByAppointmentId, selectedIds, todayStr]);

  React.useEffect(() => {
    const triggerExport = () => handleExport();
    window.addEventListener('trigger-finance-export', triggerExport);
    return () => window.removeEventListener('trigger-finance-export', triggerExport);
  }, [handleExport]);

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (confirm(`Supprimer ${ids.length} transaction(s) ? Les rendez-vous et factures liés seront aussi supprimés.`)) {
      onDeleteInvoices?.(ids);
      setSelectedIds(new Set());
    }
  }, [onDeleteInvoices, selectedIds]);

  const handleInvoiceOpen = useCallback((appt: Appointment) => {
    const invoice = invoiceByAppointmentId.get(appt.id);
    window.open(`/therapist/invoice/${invoice?.id || appt.id}`, '_blank');
  }, [invoiceByAppointmentId]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div className="mx-auto min-h-full space-y-8 bg-transparent">
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <SelectionToolbar 
            selectedCount={selectedIds.size} 
            onDelete={handleDelete} 
            onClear={() => setSelectedIds(new Set())} 
          />
        )}
      </AnimatePresence>

      <section className="relative space-y-10">
        {showFilterPanel && (
          <FilterPanel 
            filters={filters}
            onFiltersChange={setFilters}
            dropdownRef={filterDropdownRef}
          />
        )}
        <div className="flex items-end justify-between border-b border-border/30 pb-8">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">JOURNAL DES OPÉRATIONS</p>
            <h4 className="text-3xl font-black leading-none tracking-tight text-foreground">Transactions</h4>
          </div>
          <div className="flex items-center gap-3 border border-border/30 rounded-2xl px-6 py-3 text-sm font-black tracking-tight shadow-sm bg-background text-foreground">
            {format(new Date(dateRange.start), 'd MMM')} — {format(new Date(dateRange.end), 'd MMM yyyy')}
          </div>
        </div>

        <div className="space-y-4">
          {/* Table Header */}
          <div
            className="grid items-center border-b border-border/30 px-8 pb-8"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            <div className="flex justify-center">
              <TableCheckbox 
                checked={allSelected} 
                onChange={() => {
                  if (allSelected) setSelectedIds(new Set());
                  else setSelectedIds(new Set(filtered.map(c => c.id)));
                }} 
              />
            </div>
            <HeaderBtn label="DATE" field="date" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="PRÉNOM" field="firstName" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="NOM" field="lastName" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="RÉFÉRENCE" field="reference" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="SOIN" field="serviceName" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="STATUT" field="status" current={sortField} onSort={toggleSort} />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/60">PDF</div>
            <HeaderBtn label="MONTANT" field="price" current={sortField} onSort={toggleSort} align="right" />
          </div>

          <div className="bg-background">
            {filtered.map(appt => (
              <TransactionRow
                key={appt.id}
                appt={appt}
                isSelected={selectedIds.has(appt.id)}
                todayStr={todayStr}
                invoice={invoiceByAppointmentId.get(appt.id)}
                onToggleSelection={toggleSelection}
                onSelect={onSelectAppt}
                onTogglePayment={onTogglePayment}
                onOpenInvoice={handleInvoiceOpen}
                setPayingId={setPayingId}
              />
            ))}
          </div>

          {filtered.length === 0 && <EmptyState />}
        </div>
      </section>
    </div>
  );
}
