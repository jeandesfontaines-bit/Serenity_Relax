import React from 'react';
import { Appointment, Invoice } from '../../types';

export type SortField = 'date' | 'firstName' | 'lastName' | 'reference' | 'serviceName' | 'price' | 'status';
export type PaymentMethod = 'Twint' | 'Card' | 'Cash';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'late';

export interface TransactionFilters {
  status: TransactionStatus | 'all';
  paymentMethod: PaymentMethod | 'all';
  minAmount: number | null;
}

export interface ComptaPageProps {
  appointments: Appointment[];
  invoices: Invoice[];
  onTogglePayment: (id: string, current: boolean, method?: string) => void;
  onSelectAppt?: (appt: Appointment) => void;
  onDeleteInvoices?: (ids: string[]) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onSelectedCountChange: (count: number) => void;
  showFilterPanel: boolean;
  onShowFilterPanelChange: (value: boolean) => void;
}
