import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Clock, Lock,
} from 'lucide-react';
import { format, isSameDay, isSameMonth, addDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DndContext, useDraggable, useDroppable, DragOverlay, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Appointment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

/* ── CONSTANTS ── */
const HOUR_H = 80;          // pixels per hour row
const START_HOUR = 8;
const END_HOUR = 20;
const DEFAULT_DURATION = 90; // minutes

const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
const isoDay = (d: Date) => { const x = d.getDay(); return x === 0 ? 6 : x - 1; };
const wkStart = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(x.setDate(diff));
};
const DAYS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const MONTH_DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_APPOINTMENT_TONES = [
  'bg-[#eef2ff] border-[#818cf8] text-[#4338ca]',
  'bg-[#f5f3ff] border-[#a78bfa] text-[#6d28d9]',
  'bg-[#fdf2f8] border-[#f9a8d4] text-[#be185d]',
] as const;
const TIME_COLUMN_WIDTH = 80;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}
function getTop(time: string): number {
  return ((timeToMinutes(time) - START_HOUR * 60) / 60) * HOUR_H;
}
function getHeight(mins: number): number {
  return (mins / 60) * HOUR_H;
}
function parseDuration(d?: string): number {
  if (!d) return DEFAULT_DURATION;
  const n = parseInt(d);
  return isNaN(n) ? DEFAULT_DURATION : n;
}
function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function formatAppointmentRange(time?: string, duration?: string): string {
  if (!time) return '--:--';
  const minutes = parseDuration(duration);
  return `${time} - ${minutesToTime(timeToMinutes(time) + minutes)}`;
}
function getWeekAppointmentMeta(appt: Appointment): {
  label: string;
  cardClassName: string;
  badgeClassName: string;
  timeClassName: string;
  textClassName: string;
  subtextClassName: string;
} {
  const normalizedStatus = String(appt.status || '').toLowerCase();

  if (normalizedStatus === 'cancelled') {
    return {
      label: 'Annulé',
      cardClassName: 'bg-[#fef2f2] border-[#fca5a5]',
      badgeClassName: 'bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]',
      timeClassName: 'text-[#dc2626]',
      textClassName: 'text-[#7f1d1d]',
      subtextClassName: 'text-[#f87171]',
    };
  }

  if (appt.paid || ['done', 'honoré', 'réglé'].includes(normalizedStatus)) {
    return {
      label: 'Réglé',
      cardClassName: 'bg-[#f0fdf4] border-[#86efac]',
      badgeClassName: 'bg-[#dcfce7] text-[#15803d] border border-[#86efac]',
      timeClassName: 'text-[#16a34a]',
      textClassName: 'text-[#1f2937]',
      subtextClassName: 'text-[#64748b]',
    };
  }

  if (['pending', 'late'].includes(normalizedStatus)) {
    return {
      label: 'En attente',
      cardClassName: 'bg-[#fff7ed] border-[#fdba74]',
      badgeClassName: 'bg-[#ffedd5] text-[#c2410c] border border-[#fdba74]',
      timeClassName: 'text-[#ea580c]',
      textClassName: 'text-[#1f2937]',
      subtextClassName: 'text-[#64748b]',
    };
  }

  return {
    label: 'Confirmé',
    cardClassName: 'bg-[#eef2ff] border-[#a5b4fc]',
    badgeClassName: 'bg-[#e0e7ff] text-[#4338ca] border border-[#c7d2fe]',
    timeClassName: 'text-[#4f46e5]',
    textClassName: 'text-[#1f2937]',
    subtextClassName: 'text-[#64748b]',
  };
}
function normalizeSearchValue(value?: string): string {
  return (value || '').trim().toLowerCase();
}
function appointmentMatchesQuery(appt: Appointment, query: string): boolean {
  if (!query) return true;

  const haystack = [
    appt.clientNameSnapshot,
    appt.title,
    appt.serviceName,
    appt.date,
    appt.time,
    appt.notes,
    appt.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}
function getMonthAppointmentTone(appt: Appointment, index: number): string {
  if (appt.status === 'cancelled') return 'bg-[#fef2f2] border-[#fca5a5] text-[#b91c1c]';
  if (appt.paid) return 'bg-[#f0fdf4] border-[#86efac] text-[#166534]';
  return MONTH_APPOINTMENT_TONES[index % MONTH_APPOINTMENT_TONES.length];
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

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

/* ── PROPS ── */
interface AgendaPageProps {
  view: 'month' | 'week';
  cur: Date;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  absenceMode: boolean;
  onMoveAppt?: (id: string, date: string, time: string) => void;
  onSelectDate: (date: Date) => void;
  searchQuery: string;
  pendingDates: Set<string>;
  togglePending: (date: string) => void;
  onClearAbsenceMode: () => void;
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function AgendaPage({
  view, cur, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, toggleSlot,
  absenceMode, onMoveAppt, onSelectDate, searchQuery,
  pendingDates, togglePending, onClearAbsenceMode,
}: AgendaPageProps) {
  // Escape cancels absence mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && absenceMode) {
        onClearAbsenceMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [absenceMode, onClearAbsenceMode]);
  const filteredAppointments = useMemo(() => {
    const query = normalizeSearchValue(searchQuery);
    if (!query) return appointments;
    return appointments.filter(appt => appointmentMatchesQuery(appt, query));
  }, [appointments, searchQuery]);

  return (
    <motion.div 
      className="flex h-full min-h-0 min-w-0 flex-col bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── CONTENT ── */}
      <div className="flex min-h-0 flex-1">
        {/* Main calendar area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[#e2e8f0] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
                absenceMode={absenceMode}
                pendingDates={pendingDates}
                togglePending={togglePending}
                onMoveAppt={onMoveAppt}
              />
            : <MonthView
                cur={cur}
                appointments={filteredAppointments}
                configSlots={configSlots}
                isDayOpen={isDayOpen}
                isSlotBlocked={isSlotBlocked}
                absenceMode={absenceMode}
                pendingDates={pendingDates}
                togglePending={togglePending}
                onToggleView={onToggleView}
                onSelectAppt={onSelectAppt}
                onSelectDate={onSelectDate}
                searchQuery={searchQuery}
              />
          }
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════════ */
function AgendaSidebar({
  cur, appointments, view,
}: {
  cur: Date;
  appointments: Appointment[];
  view: string;
}) {
  const todayStr = fmt(new Date());
  const todayAppts = useMemo(
    () => appointments.filter(a => a.date === todayStr).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-[#e2e8f0] bg-[#fbfcff] xl:flex">
      {/* Today summary */}
      <div className="border-b border-[#e2e8f0] p-8">
        <h3 className="mb-4 text-[9px] font-bold uppercase tracking-[0.4em] text-[#6366f1]">AUJOURD'HUI</h3>
        <p className="text-5xl font-bold text-[#0f172a]">{todayAppts.length}</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
          Soins confirmés
        </p>
      </div>

      {/* Upcoming today */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <h3 className="mb-6 text-[9px] font-bold uppercase tracking-[0.4em] text-[#6366f1]">
          PROCHAINES SÉANCES
        </h3>
        {todayAppts.length > 0 ? (
          <div className="space-y-5">
            {todayAppts.slice(0, 8).map(a => (
              <div key={a.id} className="group cursor-pointer">
                <div className="flex items-start gap-4">
                  <span className="w-12 shrink-0 text-[11px] font-bold text-[#4f46e5]">{a.time}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0f172a]">
                      {a.clientNameSnapshot || a.title}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#64748b]">
                      {a.serviceName || 'Session'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
             <Clock size={28} className="mx-auto mb-4 text-[#cbd5e1]" strokeWidth={1} />
             <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#94a3b8]">Aucune séance</p>
          </div>
        )}
      </div>

      {/* Revenue */}
      <div className="border-t border-[#e2e8f0] bg-white p-8">
        <h3 className="mb-2 text-[9px] font-bold uppercase tracking-[0.4em] text-[#6366f1]">REVENUS ESTIMÉS</h3>
        <p className="text-2xl font-bold text-[#0f172a]">
          {todayAppts.reduce((s, a) => s + (a.price || 150), 0)}{' '}
          <span className="ml-1 text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">CHF</span>
        </p>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════
   WEEK TIME GRID
   ══════════════════════════════════════════════════ */
interface WeekTimeGridProps {
  cur: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onSelectAppt: (a: Appointment) => void;
  onOpenSlot: (d: string, t: string) => void;
  absenceMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
}

function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode,
  pendingDates, togglePending, onMoveAppt,
}: WeekTimeGridProps) {
  const days = useMemo(() => {
    const s = wkStart(new Date(cur));
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cur]);

  const gridHeight = HOURS.length * HOUR_H;
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeAppt = useMemo(() => activeId ? appointments.find(a => a.id === activeId) : null, [activeId, appointments]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id && onMoveAppt) {
      const [newDate, newTime] = String(over.id).split('|');
      onMoveAppt(String(active.id), newDate, newTime);
    }
  };

  const now = new Date();
  const nowTop = useMemo(() => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    return ((minutes - START_HOUR * 60) / 60) * HOUR_H;
  }, [now]);

  return (
    <div className="flex-1 flex flex-col bg-[#fafbfc]">
      {/* Day column headers */}
      <div
        className="sticky top-0 z-30 grid shrink-0 border-b border-[#e2e8f0] bg-[rgba(255,255,255,0.94)] backdrop-blur"
        style={{ gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, minmax(0, 1fr))` }}
      >
        {/* Empty corner */}
        <div className="border-r border-[#e2e8f0] bg-[#f8fafc]/80" />
        {days.map((d, i) => {
          const dStr = fmt(d);
          const isToday = isSameDay(new Date(), d);
          const isOpen = isDayOpen(dStr);
          const isPending = pendingDates.has(dStr);
          const closedStripeStyle = !isOpen && !isPending
            ? {
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(15,23,42,0.025), rgba(15,23,42,0.025) 12px, transparent 12px, transparent 24px)',
              }
            : undefined;
          return (
            <div
              key={i}
              onClick={() => absenceMode && togglePending(dStr)}
              className={`border-r border-[#e2e8f0] px-2 py-4 text-center transition-colors duration-200 ${
                absenceMode ? 'cursor-pointer hover:bg-[#f8faff]' : ''
              } ${isPending ? 'bg-[#6366f1] text-white' : !isOpen ? 'bg-[#f1f5f9]' : ''} ${
                isToday && !isPending ? 'bg-[#eef2ff]' : ''
              }`}
              style={closedStripeStyle}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                isToday && !isPending ? 'text-[#4f46e5]' : isPending ? 'text-white/70' : 'text-[#64748b]'
              }`}>
                {format(d, 'EEE', { locale: fr })}
              </p>
              <p className={`mt-1 text-2xl font-bold leading-none ${
                isToday && !isPending
                  ? 'text-[#4f46e5]'
                  : isOpen ? (isPending ? 'text-white' : 'text-[#1f2937]') : 'text-[#94a3b8]'
              }`}>
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 bg-white/90">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div
            className="grid relative"
            style={{ gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, minmax(0, 1fr))`, height: gridHeight }}
          >
            {/* Time labels column */}
          <div className="border-r border-[#e2e8f0] relative bg-white/90">
            {HOURS.map(h => (
              <div
                key={`row-${h}`}
                className="absolute inset-x-0 border-t border-[#e2e8f0]"
                style={{ top: (h - START_HOUR) * HOUR_H }}
              />
            ))}
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-3 top-0 text-xs font-medium text-[#94a3b8]"
                style={{ top: (h - START_HOUR) * HOUR_H }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIdx) => {
            const dStr = fmt(d);
            const isOpen = isDayOpen(dStr);
            const daySlots = [...(configSlots[isoDay(d)] || [])].sort();
            const dayAppts = appointments
              .filter(a => a.date === dStr)
              .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            const isToday = isSameDay(new Date(), d);
            const isPending = pendingDates.has(dStr);

            return (
              <div
                key={dayIdx}
                className={`border-r border-[#e2e8f0] relative ${
                  isToday ? 'bg-[#eef2ff]/60' : 'bg-white/90'
                } ${!isOpen ? 'bg-[#f8fafc]' : ''} ${isPending ? 'bg-[#eef2ff]' : ''}`}
              >
                {/* Hour grid lines */}
                {isOpen && HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[#e2e8f0]"
                    style={{ top: (h - START_HOUR) * HOUR_H }}
                  />
                ))}

                {!isOpen && (
                  <div 
                    className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 12px, transparent 12px, transparent 24px)' }}
                  >
                    <Lock size={36} strokeWidth={1.5} className="text-[#cbd5e1]" />
                  </div>
                )}
                
                {/* Available slot markers */}
                {isOpen && daySlots.map(t => {
                  const hasAppt = dayAppts.some(a => a.time === t);
                  const blocked = isSlotBlocked(dStr, t);
                  if (hasAppt || blocked) return null;

                  const top = getTop(t);
                  return (
                    <DroppableSlot
                      key={t}
                      id={`${dStr}|${t}`}
                      time={t}
                      top={top}
                      absenceMode={absenceMode}
                      onClick={() => {
                        if (absenceMode) {
                          toggleSlot(dStr, t);
                          return;
                        }
                        onOpenSlot(dStr, t);
                      }}
                    />
                  );
                })}

                {/* Blocked slot markers */}
                {isOpen && daySlots.map(t => {
                  if (!isSlotBlocked(dStr, t)) return null;
                  const hasAppt = dayAppts.some(a => a.time === t);
                  if (hasAppt) return null;

                  return (
                    <div
                      key={`block-${t}`}
                      onClick={() => {
                        if (absenceMode) toggleSlot(dStr, t);
                      }}
                      className={`absolute left-1 right-1 z-[2] flex items-center justify-center rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] px-2 text-center shadow-sm transition-all duration-200 ${
                        absenceMode ? 'cursor-pointer hover:bg-[#fee2e2]' : 'cursor-default'
                      }`}
                      style={{ top: getTop(t) + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
                        <Lock size={12} strokeWidth={1.5} className="text-[#94a3b8]" />
                        <span>{absenceMode ? 'Rouvrir' : 'Bloqué'}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Appointment blocks */}
                {dayAppts.map(appt => {
                  if (!appt.time) return null;
                  const top = getTop(appt.time);
                  const height = getHeight(parseDuration(appt.duration));
                  return (
                    <DraggableAppointmentBlock
                      key={appt.id}
                      appt={appt}
                      top={top}
                      height={height}
                      onSelect={onSelectAppt}
                      isDragging={activeId === appt.id}
                      disabled={absenceMode}
                    />
                  );
                })}
                {/* Current time indicator */}
                {isToday && nowTop >= 0 && nowTop <= gridHeight && (
                  <div 
                    className="absolute left-0 right-0 z-[10] flex items-center pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="h-2 w-2 rounded-full bg-[#ef4444] -ml-1 shadow-sm" />
                    <div className="h-[2px] flex-1 bg-[#ef4444] shadow-sm" />
                  </div>
                )}
              </div>
            );
          })}
          
          <DragOverlay zIndex={100} dropAnimation={null}>
            {activeAppt ? (
              <AppointmentBlock
                appt={activeAppt}
                top={0}
                height={getHeight(parseDuration(activeAppt.duration))}
                onSelect={() => {}}
                className="shadow-2xl opacity-90 scale-[1.02]"
              />
            ) : null}
          </DragOverlay>
        </div>
        </DndContext>
      </div>
    </div>
  );
}

/* ── APPOINTMENT BLOCK ── */
function AppointmentBlock({
  appt, top, height, onSelect, className = '',
}: {
  appt: Appointment;
  top: number;
  height: number;
  onSelect: (a: Appointment) => void;
  className?: string;
}) {
  const meta = getWeekAppointmentMeta(appt);
  const compact = height < 88;
  const showClient = height >= 72;
  const showFooter = height >= 108;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-1 right-1 z-[3] cursor-pointer overflow-hidden rounded-[12px] border-l-4 p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ${meta.cardClassName} ${className}`}
      style={{ top: top + 6, height: Math.max(height - 12, 40) }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[10px] font-bold leading-none ${meta.timeClassName}`}>
          {formatAppointmentRange(appt.time, appt.duration)}
        </p>
        <span className={`rounded-[999px] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tight ${meta.badgeClassName}`}>
          {meta.label}
        </span>
      </div>

      <p className={`mt-1 truncate text-xs font-bold leading-tight ${meta.textClassName}`}>
        {appt.serviceName || appt.title || 'Séance'}
      </p>

      {showClient && (
        <p className={`mt-1 truncate text-[10px] ${meta.subtextClassName}`}>
          {appt.clientNameSnapshot || 'Client'}
        </p>
      )}

      {showFooter && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={`truncate text-[10px] ${meta.subtextClassName}`}>
            {compact ? 'RDV' : (appt.title || 'Session')}
          </span>
          <span className={`shrink-0 text-[10px] font-semibold ${meta.textClassName}`}>
            {appt.price || 150} CHF
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Month view ── */
interface MonthViewProps {
  cur: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  absenceMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
  onSelectDate: (date: Date) => void;
  searchQuery: string;
}

function MonthView({
  cur,
  appointments,
  configSlots,
  isDayOpen,
  isSlotBlocked,
  absenceMode,
  pendingDates,
  togglePending,
  onToggleView,
  onSelectAppt,
  onSelectDate,
  searchQuery,
}: MonthViewProps) {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }),
  }), [cur]);
  const weekRows = Math.ceil(days.length / 7);
  const denseMonth = weekRows >= 6;
  const visibleAppointmentLimit = denseMonth ? 1 : 3;
  const dayCellPadding = denseMonth ? 'p-2.5' : 'px-3 py-2.5';
  const freeSlotPreviewLimit = denseMonth ? 1 : 2;
  const headerMonthLabelClass = denseMonth ? 'text-[10px]' : 'text-[11px]';
  const countLabelClass = 'text-[10px]';
  const emptyStateClass = denseMonth ? 'px-2 py-2.5 text-[10px]' : 'px-3 py-3 text-[11px]';
  const appointmentCardClass = denseMonth ? 'rounded-r-[10px] px-2 py-1' : 'rounded-r-[12px] px-2 py-1.5';
  const appointmentTimeClass = denseMonth ? 'text-[9px]' : 'text-[10px]';
  const appointmentTitleClass = denseMonth ? 'text-[10px]' : 'text-[11px]';
  const appointmentSubtitleClass = denseMonth ? 'hidden' : 'truncate text-[10px] leading-tight';
  const moreButtonClass = denseMonth ? 'rounded-[10px] px-2 py-1 text-[10px]' : 'rounded-[12px] px-3 py-1.5 text-[11px]';
  const freeSlotBoxClass = denseMonth ? 'rounded-[10px] px-2 py-1.5 text-[10px]' : 'rounded-[12px] px-3 py-2 text-[11px]';
  const dayNumberCapsuleClass = denseMonth
    ? 'h-7 min-w-7 rounded-[9px] px-1 text-[13px]'
    : 'h-7 min-w-7 rounded-[9px] px-1.5 text-[13px]';

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#fafbfc]">
      {/* Column headers */}
      <div
        className="sticky z-20 grid shrink-0 grid-cols-7 border-b border-[#e2e8f0] bg-white/95 backdrop-blur"
        style={{ top: 0 }}
      >
        {MONTH_DAY_LABELS.map(d => (
          <div key={d} className="py-2.5 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#64748b]">{d}</span>
          </div>
        ))}
      </div>

      {searchQuery.trim() && (
        <div className="border-b border-[#e2e8f0] bg-white px-4 py-2 text-sm text-[#64748b] sm:px-6">
          {`${appointments.length} séance${appointments.length > 1 ? 's' : ''} correspondent à “${searchQuery.trim()}”.`}
        </div>
      )}

      <div
        className="grid min-h-0 flex-1 grid-cols-7 bg-[#f8fafc]"
        style={{ gridTemplateRows: `repeat(${weekRows}, minmax(0, 1fr))` }}
      >
        {days.map((day, i) => {
          const dStr = fmt(day);
          const isOpen = isDayOpen(dStr);
          const isPend = pendingDates.has(dStr);
          const isToday = isSameDay(new Date(), day);
          const inMonth = isSameMonth(day, cur);
          const dayAppointments = appointments
            .filter(e => e.date === dStr)
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          const freeSlots = isOpen
            ? [...(configSlots[isoDay(day)] || [])]
                .sort()
                .filter((time) => (
                  !dayAppointments.some((appt) => appt.time === time) &&
                  !isSlotBlocked(dStr, time)
                ))
            : [];
          const visibleAppointments = dayAppointments.slice(0, visibleAppointmentLimit);
          const hiddenCount = Math.max(dayAppointments.length - visibleAppointments.length, 0);

          return (
            <div
              key={i}
              onClick={() => {
                if (!inMonth) return;
                if (absenceMode) {
                  togglePending(dStr);
                  return;
                }
                onSelectDate(day);
                onToggleView('week');
              }}
              className={`relative group flex min-h-0 flex-col border-r border-b border-[#e2e8f0] ${dayCellPadding} transition-colors duration-200 ${
                !inMonth
                  ? 'cursor-default bg-[#f8fafc] text-[#94a3b8]'
                  : 'cursor-pointer bg-white hover:bg-[#f8faff]'
              } ${isToday && inMonth ? 'bg-[#eef2ff]/70' : ''} ${
                !isOpen && inMonth ? 'bg-[#f8fafc]' : ''
              } ${isPend ? 'bg-[#6366f1] text-white hover:bg-[#4f46e5]' : ''}`}
            >
              {inMonth && !isOpen && !isPend && (
                <div 
                  className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 12px, transparent 12px, transparent 24px)' }}
                >
                  <Lock size={24} strokeWidth={1.5} className="text-foreground/20" />
                </div>
              )}

              <div className="relative z-10 mb-1.5 flex shrink-0 items-start justify-between gap-1.5">
                <div className="flex flex-col">
                  <span className={`${headerMonthLabelClass} font-bold leading-none ${
                    inMonth ? (isPend ? 'text-primary-foreground/80' : 'text-[#64748b]') : 'text-[#94a3b8]'
                  }`}>
                    {format(day, 'MMM').replace('.', '')}
                  </span>
                  {inMonth && dayAppointments.length > 0 && (
                    <span className={`${countLabelClass} font-semibold uppercase tracking-[0.18em] ${
                      isPend ? 'text-primary-foreground/70' : 'text-[#64748b]'
                    }`}>
                      {dayAppointments.length} séance{dayAppointments.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {inMonth && freeSlots.length > 0 && (
                    <span className={`mt-1 ${countLabelClass} font-semibold uppercase tracking-[0.18em] ${
                      isPend ? 'text-primary-foreground/70' : 'text-[#65a30d]'
                    }`}>
                      {freeSlots.length} créneau{freeSlots.length > 1 ? 'x' : ''} libre{freeSlots.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <span className={`inline-flex items-center justify-center font-bold leading-none ${dayNumberCapsuleClass} ${
                  isToday && !isPend
                    ? 'bg-[#6366f1] text-white ring-4 ring-[#6366f1]/10'
                    : inMonth
                      ? (isPend ? 'bg-white/20 text-white' : 'text-[#1f2937]')
                      : 'text-[#94a3b8]'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
                {inMonth && isOpen && visibleAppointments.map((appt, index) => {
                  const tone = getMonthAppointmentTone(appt, index);
                  const isPaid = appt.paid;

                  return (
                    <button
                      key={appt.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppt(appt);
                      }}
                      className={`${appointmentCardClass} border-l-4 text-left transition-transform hover:-translate-y-0.5 ${tone}`}
                    >
                      <div className={`${appointmentTimeClass} font-bold leading-none ${isPaid ? 'text-emerald-800' : ''}`}>
                        {appt.time || '--:--'}{appt.duration ? ` · ${appt.duration}` : ''}
                      </div>
                      <div className={`mt-1 truncate ${appointmentTitleClass} font-semibold leading-tight ${isPaid ? 'text-emerald-950' : 'text-[#1f2937]'}`}>
                        {appt.clientNameSnapshot || appt.title || 'Séance'}
                      </div>
                      {!denseMonth && (
                        <div className={`${appointmentSubtitleClass} ${isPaid ? 'text-emerald-800/80' : 'text-[#64748b]'}`}>
                          {appt.serviceName || 'Session'}
                        </div>
                      )}
                    </button>
                  );
                })}

                {inMonth && isOpen && hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(day);
                      onToggleView('week');
                    }}
                    className={`mt-auto ${moreButtonClass} text-left font-bold transition-all duration-200 ${
                      isPend
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-[#f8fafc] text-[#4f46e5] hover:bg-[#eef2ff]'
                    }`}
                  >
                    +{hiddenCount} séance{hiddenCount > 1 ? 's' : ''}
                  </button>
                )}

                {inMonth && isOpen && freeSlots.length > 0 && (
                  <div className={`${freeSlotBoxClass} rounded-[12px] border ${
                    isPend ? 'border-white/20 bg-white/10 text-white/80' : 'border-[#dbe3ef] bg-[#f8fafc] text-[#65a30d]'
                  }`}>
                    <div className="font-bold uppercase tracking-[0.18em]">
                      {freeSlots.slice(0, freeSlotPreviewLimit).join(' · ')}
                      {freeSlots.length > freeSlotPreviewLimit ? ` +${freeSlots.length - freeSlotPreviewLimit}` : ''}
                    </div>
                  </div>
                )}

                {inMonth && isOpen && dayAppointments.length === 0 && (
                  <div className={`mt-auto rounded-[12px] border border-dashed ${emptyStateClass} ${
                    isPend ? 'border-white/20 text-white/70' : 'border-[#e2e8f0] text-[#94a3b8]'
                  }`}>
                    {freeSlots.length > 0 ? 'Disponible' : 'Aucune séance'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── DND-KIT WRAPPERS ── */
function DroppableSlot({
  id,
  time,
  onClick,
  top,
  absenceMode,
}: {
  id: string;
  time: string;
  onClick: () => void;
  top: number;
  absenceMode: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`absolute left-1 right-1 z-[2] flex items-center justify-between overflow-hidden rounded-[10px] border px-3 text-left transition-all duration-200 ${
        isOver 
          ? 'border-[#312e81] bg-[#eef2ff]'
          : absenceMode
            ? 'border-[#fecaca] bg-[#fff7ed] hover:border-[#fca5a5] hover:bg-[#fee2e2]'
            : 'border-[#dbe3ef] bg-[#f8fafc] hover:border-[#c7d2fe] hover:bg-[#f0f9ff]'
      }`}
      style={{ top: top + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-[#1f2937]">{time}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
          absenceMode ? 'text-[#b45309]' : 'text-[#65a30d]'
        }`}>
          {absenceMode ? 'Fermer ce créneau' : 'Disponible'}
        </span>
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
        isOver ? 'text-[#312e81]' : absenceMode ? 'text-[#b45309]' : 'text-[#4f46e5]'
      }`}>
        <Plus size={14} strokeWidth={1.8} />
        <span>{absenceMode ? 'Fermer' : 'Réserver'}</span>
      </div>
    </button>
  );
}

function DraggableAppointmentBlock({ appt, top, height, onSelect, isDragging, disabled }: { appt: Appointment; top: number; height: number; onSelect: (a: Appointment) => void; isDragging: boolean; disabled: boolean; }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appt.id,
    data: { appt },
    disabled
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`${isDragging ? 'opacity-30' : ''}`}>
      <AppointmentBlock 
        appt={appt} 
        top={top} 
        height={height} 
        onSelect={onSelect} 
        className={`${isDragging ? 'pointer-events-none' : ''} ${!disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`} 
      />
    </div>
  );
}
