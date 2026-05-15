import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Appointment } from '../types';
import { MetricSection } from './home/MetricSection';
import { TodayAgenda } from './home/TodayAgenda';
import { RecentNotes } from './home/RecentNotes';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  clientsCount: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
  searchQuery: string;
}

function normalizeSearchQuery(value?: string) {
  return (value || '').trim().toLowerCase();
}

function appointmentMatchesSearch(appt: Appointment, query: string) {
  if (!query) return true;
  const haystack = [appt.clientNameSnapshot, appt.title, appt.serviceName, appt.notes, appt.date, appt.time, appt.status]
    .filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query);
}

export default function HomePage({
  appointments, monthlyGoal, clientsCount, onSelectAppt, onNavigate, onEditGoal, searchQuery,
}: HomePageProps) {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentMonth = format(now, 'yyyy-MM');
  const normalizedSearch = normalizeSearchQuery(searchQuery);

  const todayAppts = useMemo(
    () => appointments
      .filter((appt) => appt.date === todayStr && appointmentMatchesSearch(appt, normalizedSearch))
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, normalizedSearch, todayStr],
  );

  const paidThisMonth = useMemo(
    () => appointments.filter((appt) => appt.paid && appt.date?.startsWith(currentMonth))
      .reduce((sum, appt) => sum + (appt.price || appt.totalAmount || 0), 0),
    [appointments, currentMonth],
  );

  const completedSessions = useMemo(() => appointments.filter((appt) => appt.paid).length, [appointments]);
  const pendingInvoices = useMemo(() => appointments.filter((appt) => !appt.paid && appt.status !== 'cancelled').length, [appointments]);
  const monthlyProgress = useMemo(() => {
    if (!monthlyGoal) return 0;
    return Math.max(0, Math.min(100, Math.round((paidThisMonth / monthlyGoal) * 100)));
  }, [monthlyGoal, paidThisMonth]);

  const progressNotes = useMemo(
    () => appointments
      .filter((appt) => appt.notes && appt.notes.trim() && appointmentMatchesSearch(appt, normalizedSearch))
      .sort((a, b) => `${b.date || ''}${b.time || ''}`.localeCompare(`${a.date || ''}${a.time || ''}`))
      .slice(0, 2),
    [appointments, normalizedSearch],
  );

  return (
    <div className="mx-auto space-y-8 text-foreground">
      <MetricSection 
        paidThisMonth={paidThisMonth}
        completedSessions={completedSessions}
        clientsCount={clientsCount}
        pendingInvoices={pendingInvoices}
      />

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <TodayAgenda 
          todayAppts={todayAppts}
          todayStr={todayStr}
          onSelectAppt={onSelectAppt}
          onNavigate={onNavigate}
          normalizedSearch={normalizedSearch}
        />

        <RecentNotes 
          progressNotes={progressNotes}
          onSelectAppt={onSelectAppt}
          onNavigate={onNavigate}
          onEditGoal={onEditGoal}
          monthlyGoal={monthlyGoal}
          paidThisMonth={paidThisMonth}
          monthlyProgress={monthlyProgress}
        />
      </section>
    </div>
  );
}
