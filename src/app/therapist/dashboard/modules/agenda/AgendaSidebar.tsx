import React, { useMemo } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Appointment } from '../../types';
import { fmt } from './constants';
import SidebarHeader from './SidebarHeader';
import SidebarStats from './SidebarStats';
import UpcomingAppointments from './UpcomingAppointments';
import SidebarRevenue from './SidebarRevenue';

interface AgendaSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  appointments: Appointment[];
}

export default function AgendaSidebar({
  currentDate,
  onDateChange,
  view,
  onViewChange,
  appointments
}: AgendaSidebarProps) {
  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));

  const todayStr = fmt(new Date());
  const todayAppts = useMemo(
    () => appointments.filter((a: Appointment) => a.date === todayStr).sort((a: Appointment, b: Appointment) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  const estimatedRevenue = useMemo(
    () => todayAppts.reduce((s, a) => s + (a.price || 150), 0),
    [todayAppts]
  );

  return (
    <aside className="hidden xl:flex w-80 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden">
      <SidebarHeader 
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        view={view}
        onViewChange={onViewChange}
      />

      <SidebarStats count={todayAppts.length} />

      <UpcomingAppointments appointments={todayAppts} />

      <SidebarRevenue revenue={estimatedRevenue} />
    </aside>
  );
}
