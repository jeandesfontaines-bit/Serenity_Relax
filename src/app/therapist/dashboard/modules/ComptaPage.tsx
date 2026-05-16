import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  quickFilter,
}: ComptaPageProps) {
  const router = useRouter();
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
  const [payingId, setPayingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!payingId) return;
    const handlePointerDown = () => setPayingId(null);
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [payingId]);

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
        const matchesQuickClient = quickFilter?.clientId ? appt.clientId === quickFilter.clientId : true;
        const matchesQuickUnpaid = quickFilter?.unpaidOnly ? !appt.paid : true;

        // Apply Advanced Filters
        if (filters.status !== 'all' && status !== filters.status) return false;
        if (filters.paymentMethod !== 'all' && appt.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minAmount !== null && (appt.price || 0) < filters.minAmount) return false;

        return matchesSearch && inRange && matchesQuickClient && matchesQuickUnpaid;
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
    [appointments, dateRange.end, dateRange.start, invoiceByAppointmentId, searchQuery, sortDir, sortField, todayStr, filters, quickFilter],
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
    router.push(`/therapist/invoice/${invoice?.id || appt.id}`);
  }, [invoiceByAppointmentId, router]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div className="mx-auto min-h-full space-y-6 bg-transparent">
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <SelectionToolbar 
            selectedCount={selectedIds.size} 
            onDelete={handleDelete} 
            onClear={() => setSelectedIds(new Set())} 
          />
        )}
      </AnimatePresence>

      <section className="relative space-y-6">
        {showFilterPanel && (
          <FilterPanel 
            filters={filters}
            onFiltersChange={setFilters}
            dropdownRef={filterDropdownRef}
          />
        )}
        <div className="dashboard-panel-lg overflow-hidden">
          <div
            className="grid items-center border-b border-border/60 px-4 pb-3 pt-4"
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
            <HeaderBtn label="Date" field="date" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="Prénom" field="firstName" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="Nom" field="lastName" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="Référence" field="reference" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="Soin" field="serviceName" current={sortField} onSort={toggleSort} />
            <HeaderBtn label="Statut" field="status" current={sortField} onSort={toggleSort} />
            <div className="dashboard-table-header-cell justify-center">PDF</div>
            <HeaderBtn label="Montant" field="price" current={sortField} onSort={toggleSort} align="right" />
          </div>

          <div className="bg-white">
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
                isPaying={payingId === appt.id}
                onChoosePaymentMethod={(id, method) => {
                  void onTogglePayment(id, false, method);
                  setPayingId(null);
                }}
              />
            ))}
          </div>

          {filtered.length === 0 && <div className="p-8"><EmptyState /></div>}
        </div>
      </section>
    </div>
  );
}
