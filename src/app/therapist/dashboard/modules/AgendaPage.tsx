import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Appointment } from '../types';
import { motion } from 'framer-motion';
import WeekTimeGrid from './agenda/WeekTimeGrid';
import MonthView from './agenda/MonthView';

/* ── PROPS ── */
interface AgendaPageProps {
  view: 'month' | 'week';
  cur: Date;
  onPeriod?: (dir: number) => void;
  onToday?: () => void;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onToggleDay?: (d: string) => void;
  blockMode?: boolean;
  setBlockMode?: (m: boolean) => void;
  absenceMode?: boolean;
  setAbsenceMode?: (m: boolean) => void;
  onOpenWeeklySettings?: () => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
  onSelectDate?: (date: Date) => void;
  onSelectApptFromMonth?: (appt: Appointment) => void;
  searchQuery?: string;
  pendingDates?: Set<string>;
  togglePending?: (date: string) => void;
  onClearAbsenceMode?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export default function AgendaPage({
  view, cur, onPeriod, onToday, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, toggleSlot, onToggleDay,
  blockMode, setBlockMode, absenceMode, setAbsenceMode,
  onOpenWeeklySettings, onMoveAppt, onSelectApptFromMonth, searchQuery, pendingDates, togglePending, onClearAbsenceMode,
}: AgendaPageProps) {
  const safeSetAbsenceMode = setAbsenceMode ?? (() => {});
  const safeOnClearAbsenceMode = onClearAbsenceMode ?? (() => {});
  const resolvedBlockMode = blockMode ?? false;
  const resolvedAbsenceMode = absenceMode ?? false;
  
  const [localPendingDates, setLocalPendingDates] = useState<Set<string>>(new Set());
  const activePendingDates = pendingDates ?? localPendingDates;

  // Escape cancels absence mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && resolvedAbsenceMode) {
        if (togglePending) {
          safeOnClearAbsenceMode();
        } else {
          setLocalPendingDates(new Set());
        }
        safeSetAbsenceMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resolvedAbsenceMode, safeSetAbsenceMode, safeOnClearAbsenceMode, togglePending]);

  const handleTogglePending = useCallback((dStr: string) => {
    if (togglePending) {
      togglePending(dStr);
    } else {
      setLocalPendingDates(prev => {
        const next = new Set(prev);
        if (next.has(dStr)) next.delete(dStr);
        else next.add(dStr);
        return next;
      });
    }
  }, [togglePending]);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(appt => 
      appt.clientNameSnapshot?.toLowerCase().includes(q) ||
      appt.serviceName?.toLowerCase().includes(q) ||
      appt.title?.toLowerCase().includes(q)
    );
  }, [appointments, searchQuery]);

  return (
    <motion.div 
      className="flex h-full flex-1 overflow-hidden bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex h-full w-full flex-col">
        {view === 'week'
          ? <WeekTimeGrid
              cur={cur}
              appointments={filteredAppointments}
              configSlots={configSlots}
              isDayOpen={isDayOpen}
              isSlotBlocked={isSlotBlocked}
              toggleSlot={toggleSlot}
              onSelectAppt={onSelectAppt}
              onOpenSlot={onOpenSlot}
              absenceMode={resolvedAbsenceMode}
              blockMode={resolvedBlockMode}
              pendingDates={activePendingDates}
              togglePending={handleTogglePending}
              onMoveAppt={onMoveAppt}
            />
          : <MonthView
              cur={cur}
              appointments={filteredAppointments}
              configSlots={configSlots}
              isDayOpen={isDayOpen}
              isSlotBlocked={isSlotBlocked}
              absenceMode={resolvedAbsenceMode}
              pendingDates={activePendingDates}
              togglePending={handleTogglePending}
              onToggleView={onToggleView}
              onSelectAppt={onSelectApptFromMonth || onSelectAppt}
            />
        }
      </div>
    </motion.div>
  );
}
