import { Client, Appointment } from '../../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';
import { format } from 'date-fns';

export type SortDir = 'asc' | 'desc';

export interface ColDef {
  id: string;
  label: string;
  minWidth: string;
  flex: string;
  align?: 'center' | 'start';
}

export interface ClientSummary {
  fullName: string;
  searchText: string;
  sessionsCount: number;
  lastVisitDate: Date | null;
  lastVisitLabel: string;
  preferredRitual: string;
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
}

export interface ClientFilters {
  minSessions: number | null;
  lastVisitWithinDays: number | null;
}

export const ALL_COLUMNS: ColDef[] = [
  { id: 'firstName', label: 'Prénom', minWidth: '120px', flex: '0.9fr' },
  { id: 'lastName', label: 'Nom', minWidth: '130px', flex: '0.95fr' },
  { id: 'lastVisit', label: 'Dernier soin', minWidth: '120px', flex: '1fr' },
  { id: 'sessions', label: 'Séances', minWidth: '72px', flex: '0.6fr', align: 'center' },
  { id: 'email', label: 'Email', minWidth: '180px', flex: '1.25fr' },
  { id: 'phone', label: 'Téléphone', minWidth: '130px', flex: '0.95fr' },
  { id: 'addressStreet', label: 'Rue', minWidth: '180px', flex: '1.2fr' },
  { id: 'addressPostalCode', label: 'Code postal', minWidth: '96px', flex: '0.75fr' },
  { id: 'addressCity', label: 'Ville', minWidth: '120px', flex: '0.9fr' },
];

export function getClientAddressStreet(client: Client): string {
  return client.addressStreet || client.street || '';
}

export function getClientAddressPostalCode(client: Client): string {
  return client.addressPostalCode || client.zip || '';
}

export function getClientAddressCity(client: Client): string {
  return client.addressCity || client.city || '';
}

export function parseAppointmentDate(date?: string): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getClientSummary(client: Client, clientAppts: Appointment[]): ClientSummary {
  const datedAppts = clientAppts
    .map((appt) => ({ appt, date: parseAppointmentDate(appt.date) }))
    .filter((entry): entry is { appt: Appointment; date: Date } => !!entry.date)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastVisitDate = datedAppts[0]?.date || null;
  const ritualCounts = clientAppts.reduce((acc, appt) => {
    if (!appt.serviceName) return acc;
    acc[appt.serviceName] = (acc[appt.serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredRitual = cleanServiceLabel(
    (Object.entries(ritualCounts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0],
  ) || 'Aucun soin';

  const sessionsCount = clientAppts.length;
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  const lastVisitLabel = lastVisitDate ? format(lastVisitDate, 'd MMM yyyy') : '—';
  const addressStreet = getClientAddressStreet(client);
  const addressPostalCode = getClientAddressPostalCode(client);
  const addressCity = getClientAddressCity(client);

  return {
    fullName,
    searchText: [
      fullName,
      client.firstName,
      client.lastName,
      client.email,
      client.phone,
      addressPostalCode,
      addressCity,
      addressStreet,
      client.canton,
      client.addressCanton,
      client.insurance,
      preferredRitual,
    ].filter(Boolean).join(' ').toLowerCase(),
    sessionsCount,
    lastVisitDate,
    lastVisitLabel,
    preferredRitual,
    addressStreet,
    addressPostalCode,
    addressCity,
  };
}
