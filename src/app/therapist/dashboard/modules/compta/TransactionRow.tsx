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
  onSelect: (appt: Appointment) => void;
  onTogglePayment: (id: string, current: boolean) => void;
  onOpenInvoice: (appt: Appointment) => void;
  setPayingId: (id: string) => void;
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
  setPayingId
}: TransactionRowProps) {
  const status = getTransactionStatus(appt, todayStr);
  const meta = STATUS_META[status];
  const { firstName, lastName } = getClientNameParts(appt);

  return (
    <div
      onClick={() => onSelect(appt)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(appt);
        }
      }}
      role="button"
      tabIndex={0}
      className="grid w-full items-center border-b px-8 py-8 text-left transition-all duration-500 group cursor-pointer border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] active:scale-[0.995]"
      style={{ 
        gridTemplateColumns: GRID_TEMPLATE, 
        background: isSelected ? 'hsl(var(--secondary)/0.5)' : 'transparent' 
      }}
    >
      <div className="flex justify-center">
        <TableCheckbox checked={isSelected} onChange={() => onToggleSelection(appt.id)} />
      </div>

      <div className="text-[13px] font-bold tracking-tight text-[hsl(var(--foreground))]">
        {appt.date ? format(new Date(appt.date), 'dd MMM yyyy') : '—'}
      </div>

      <div className="min-w-0 pr-4">
        <div className="truncate text-[13px] font-bold tracking-tight text-[hsl(var(--foreground))]">
          {firstName}
        </div>
      </div>

      <div className="min-w-0 pr-4">
        <div className="truncate text-[13px] font-bold tracking-tight text-[hsl(var(--foreground))]">
          {lastName}
        </div>
      </div>

      <div className="truncate pr-4 text-[13px] font-medium text-[hsl(var(--muted-foreground))]">
        {invoice?.invoiceNumber || '—'}
      </div>

      <div className="truncate pr-4 text-[13px] font-medium text-[hsl(var(--foreground))]">
        {cleanServiceLabel(appt.serviceName) || 'Session'}
      </div>

      <div>
        <span 
          onClick={(e) => {
            e.stopPropagation();
            if (appt.paid) onTogglePayment(appt.id, true);
            else setPayingId(appt.id);
          }} 
          className={`inline-flex rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer border transition-all duration-700 hover:scale-105 active:scale-95 shadow-sm ${meta.className}`} 
        >
          {meta.label}
        </span>
      </div>

      <div className="flex items-center">
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenInvoice(appt); }} 
          className="flex h-10 w-10 items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[hsl(var(--muted)/0.5)] rounded-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" 
        >
          <Download size={18} strokeWidth={1.5} />
        </button>
      </div>

      <div 
        className={`text-right text-lg font-black tracking-tight tabular-nums ${status === 'cancelled' ? 'text-muted-foreground' : status === 'late' ? 'text-amber-500' : 'text-foreground'}`} 
      >
        {status === 'cancelled' ? '0 CHF' : formatCurrency(appt.price || 0)}
      </div>
    </div>
  );
}
