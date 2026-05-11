import { Timestamp } from 'firebase/firestore';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  street?: string;
  zip?: string;
  city?: string;
  canton?: string;
  insurance?: string;
  initials?: string;
  notes?: string;
  birthDate?: string;
  color?: string;
}

export interface Appointment {
  id: string;
  clientId?: string;
  date?: string;
  time?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  serviceName?: string;
  serviceId?: string;
  price?: number;
  totalAmount?: number;
  paid?: boolean;
  paymentMethod?: string;
  status?: 'confirmed' | 'done' | 'late' | 'cancelled';
  clientNameSnapshot?: string;
  clientEmail?: string;
  duration?: string;
  phone?: string;
  email?: string;
  notes?: string;
  magicToken?: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  invoiceNumber: string;
  amount: number;
  date: string;
}
