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
  date: string;
  time: string;
  title: string;
  serviceName?: string;
  price?: number;
  paid?: boolean;
  paymentMethod?: string;
  status?: 'upcoming' | 'done' | 'late' | 'honoré' | 'A VENIR' | 'RÉGLÉ' | 'cancelled';
  clientNameSnapshot?: string;
  duration?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  invoiceNumber: string;
  amount: number;
  date: string;
}
