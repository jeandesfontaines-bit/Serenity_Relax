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
}

export interface ClientFilters {
  status: 'all' | 'active' | 'inactive';
  minSessions: number | null;
  lastVisitWithinDays: number | null;
}

export const ALL_COLUMNS: ColDef[] = [
  { id: 'patient', label: 'Patient', minWidth: '220px', flex: '2fr' },
  { id: 'status', label: 'Statut', minWidth: '100px', flex: '0.8fr', align: 'start' },
  { id: 'lastVisit', label: 'Dernier soin', minWidth: '140px', flex: '1.2fr' },
  { id: 'sessions', label: 'Séances', minWidth: '80px', flex: '0.7fr', align: 'center' },
  { id: 'email', label: 'Email', minWidth: '220px', flex: '1.5fr' },
  { id: 'phone', label: 'Téléphone', minWidth: '150px', flex: '1fr' },
];

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

  return {
    fullName,
    searchText: [
      fullName,
      client.firstName,
      client.lastName,
      client.email,
      client.phone,
      client.zip,
      client.city,
      client.street,
      client.canton,
      client.insurance,
      preferredRitual,
    ].filter(Boolean).join(' ').toLowerCase(),
    sessionsCount,
    lastVisitDate,
    lastVisitLabel,
    preferredRitual,
  };
}
222E2222EXYASYXX