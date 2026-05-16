import React from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, Invoice } from '../../types';
import { TableCheckbox } from './TableComponents';
import { 
  getTransactionStatus, 
  STATUS_META, 
  getClientNameParts, 
  formatCurrency, 
  GRID_TEMPLATE 
} from './constants';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

interface TransactionRowProps {
  appt: Appointment;
  isSelected: boolean;
  todayStr: string;
  invoice?: Invoice;
  onToggleSelection: (id: string) => void;
  onSelect?: (appt: Appointment) => void;
  onTogglePayment: (id: string, current: boolean) => void;
  onOpenInvoice: (appt: Appointment) => void;
  setPayingId: (id: string) => void;
  isPaying: boolean;
  onChoosePaymentMethod: (id: string, method: 'Twint' | 'Card' | 'Cash') => void;
}

export function TransactionRow({
  appt,
  isSelected,
  todayStr,
  invoice,
  onToggleSelection,
  onSelect,
  onTogglePayment,
  onOpenInvoice,
  setPayingId,
  isPaying,
  onChoosePaymentMethod,
}: TransactionRowProps) {
  const status = getTransactionStatus(appt, todayStr);
  const meta = STATUS_META[status];
  const { firstName, lastName } = getClientNameParts(appt);
  const isInteractive = Boolean(onSelect);

  return (
    <div
      onClick={() => onSelect?.(appt)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
          e.preventDefault();
          onSelect(appt);
        }
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : -1}
      className={`grid w-full items-center border-b px-4 py-3 text-left transition-all duration-200 group border-border ${
        isSelected ? 'bg-primary/5' : ''
      } ${isInteractive ? 'cursor-pointer hover:bg-accent/50 active:scale-[0.998]' : ''}`}
      style={{ gridTemplateColumns: GRID_TEMPLATE }}
    >
      <div className="flex justify-center">
        <TableCheckbox checked={isSelected} onChange={() => onToggleSelection(appt.id)} />
      </div>

      <div className="dashboard-table-cell-strong">
        {appt.date ? format(new Date(appt.date), 'dd MMM yyyy') : '—'}
      </div>

      <div className="min-w-0 pr-3">
        <div className="dashboard-table-cell-strong truncate">
          {firstName}
        </div>
      </div>

      <div className="min-w-0 pr-3">
        <div className="dashboard-table-cell-strong truncate">
          {lastName}
        </div>
      </div>

      <div className="dashboard-table-cell truncate pr-3">
        {invoice?.invoiceNumber || '—'}
      </div>

      <div className="dashboard-table-cell-strong truncate pr-3">
        {cleanServiceLabel(appt.serviceName) || 'Session'}
      </div>

      <div className="relative">
        <span
          data-payment-trigger="true"
          onClick={(e) => {
            e.stopPropagation();
            if (appt.paid) onTogglePayment(appt.id, true);
            else setPayingId(appt.id);
          }}
          className={`dashboard-status-chip inline-flex cursor-pointer rounded-md px-3 py-1 border transition-colors ${meta.className}`}
        >
          {meta.label}
        </span>
        {isPaying && !appt.paid && (
          <div
            data-payment-menu="true"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full z-30 mt-2 flex overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            {(['Cash', 'Twint', 'Card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => onChoosePaymentMethod(appt.id, method)}
                className="dashboard-meta-strong px-3 py-2 text-foreground transition-colors hover:bg-accent"
              >
                {method === 'Twint' ? 'TWINT' : method}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenInvoice(appt); }} 
          className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground" 
        >
          <Download size={15} strokeWidth={1.5} />
        </button>
      </div>

      <div 
        className={`dashboard-table-cell-strong text-right tabular-nums ${status === 'cancelled' ? 'text-muted-foreground' : status === 'late' ? 'text-amber-500' : 'text-foreground'}`} 
      >
        {status === 'cancelled' ? '0 CHF' : formatCurrency(appt.price || 0)}
      </div>
    </div>
  );
}
