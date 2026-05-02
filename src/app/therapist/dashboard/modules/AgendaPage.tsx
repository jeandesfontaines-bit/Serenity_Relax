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
  'bg-[#435544]/10 border-[#435544] text-[#435544]',
  'bg-[#725a38]/10 border-[#725a38] text-[#725a38]',
  'bg-[#6c685f]/10 border-[#6c685f] text-[#6c685f]',
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
      cardClassName: 'bg-[#ba1a1a]/10 border-[#ba1a1a]',
      badgeClassName: 'bg-[#ba1a1a] text-white',
      timeClassName: 'text-[#ba1a1a]',
      textClassName: 'text-[#1a1c1b]',
      subtextClassName: 'text-[#434842]',
    };
  }

  if (appt.paid || ['done', 'honoré', 'réglé'].includes(normalizedStatus)) {
    return {
      label: 'Réglé',
      cardClassName: 'bg-[#435544]/12 border-[#435544]',
      badgeClassName: 'bg-[#435544] text-white',
      timeClassName: 'text-[#435544]',
      textClassName: 'text-[#1a1c1b]',
      subtextClassName: 'text-[#434842]',
    };
  }

  if (['pending', 'late'].includes(normalizedStatus)) {
    return {
      label: 'En attente',
      cardClassName: 'bg-[#725a38]/10 border-[#725a38]',
      badgeClassName: 'bg-[#fcdaaf] text-[#775e3c]',
      timeClassName: 'text-[#725a38]',
      textClassName: 'text-[#1a1c1b]',
      subtextClassName: 'text-[#434842]',
    };
  }

  return {
    label: 'Confirmé',
    cardClassName: 'bg-[#435544]/10 border-[#435544]',
    badgeClassName: 'bg-[#435544] text-white',
    timeClassName: 'text-[#435544]',
    textClassName: 'text-[#1a1c1b]',
    subtextClassName: 'text-[#434842]',
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
  if (appt.status === 'cancelled') return 'bg-[#ba1a1a]/10 border-[#ba1a1a] text-[#ba1a1a]';
  if (appt.paid) return 'bg-[#1a1c1b] border-[#1a1c1b] text-white';
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
  blockMode: boolean;
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
  blockMode, absenceMode, onMoveAppt, onSelectDate, searchQuery,
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
      className="flex h-full min-h-full flex-col bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── CONTENT ── */}
      <div className="flex-1 flex">
        {/* Main calendar area */}
        <div className="flex-1 flex flex-col bg-white/20">
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
                blockMode={blockMode}
                pendingDates={pendingDates}
                togglePending={togglePending}
                onMoveAppt={onMoveAppt}
              />
            : <MonthView
                cur={cur}
                appointments={filteredAppointments}
                isDayOpen={isDayOpen}
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
    <aside className="hidden xl:flex flex-col w-80 border-r border-[#efeeec] bg-white/30 backdrop-blur-sm shrink-0">
      {/* Today summary */}
      <div className="p-10 border-b border-[#faf9f7]">
        <h3 className="text-[9px] font-serif text-[#725a38] uppercase tracking-[0.4em] mb-6 opacity-60">AUJOURD'HUI</h3>
        <p className="text-5xl font-serif text-[#1a1c1b] italic">{todayAppts.length}</p>
        <p className="text-[10px] text-[#c3c8c0] mt-4 font-serif uppercase tracking-[0.1em]">
          Soins confirmés
        </p>
      </div>

      {/* Upcoming today */}
      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
        <h3 className="text-[9px] font-serif text-[#725a38] uppercase tracking-[0.4em] mb-10 opacity-60">
          PROCHAINES SÉANCES
        </h3>
        {todayAppts.length > 0 ? (
          <div className="space-y-10">
            {todayAppts.slice(0, 8).map(a => (
              <div key={a.id} className="group cursor-pointer">
                <div className="flex items-start gap-6">
                  <span className="text-[11px] font-serif text-[#725a38] w-14 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">{a.time}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-serif text-[#1a1c1b] truncate group-hover:italic transition-all duration-500">
                      {a.clientNameSnapshot || a.title}
                    </p>
                    <p className="text-[9px] text-[#c3c8c0] uppercase tracking-[0.2em] mt-2 group-hover:text-[#435544] transition-colors">
                      {a.serviceName || 'Session'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center opacity-30">
             <Clock size={32} className="text-[#c3c8c0] mx-auto mb-6" strokeWidth={0.5} />
             <p className="text-[9px] font-serif text-[#c3c8c0] uppercase tracking-[0.3em]">Zone de repos</p>
          </div>
        )}
      </div>

      {/* Revenue */}
      <div className="p-10 border-t border-[#faf9f7] bg-[#f4f3f1]/20">
        <h3 className="text-[9px] font-serif text-[#725a38] uppercase tracking-[0.4em] mb-3 opacity-60">REVENUS ESTIMÉS</h3>
        <p className="text-2xl font-serif text-[#1a1c1b]">
          {todayAppts.reduce((s, a) => s + (a.price || 150), 0)} <span className="text-[10px] font-serif text-[#c3c8c0] ml-1 uppercase tracking-widest italic">CHF</span>
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
  blockMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
}

function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode, blockMode,
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

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f7]">
      {/* Day column headers */}
      <div
        className="sticky top-0 z-30 grid shrink-0 border-b border-[#e9e8e6] bg-[#f4f3f1]/70"
        style={{ gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, minmax(0, 1fr))` }}
      >
        {/* Empty corner */}
        <div className="border-r border-[#e9e8e6] bg-[#faf9f7]" />
        {days.map((d, i) => {
          const dStr = fmt(d);
          const isToday = isSameDay(new Date(), d);
          const isOpen = isDayOpen(dStr);
          const isPending = pendingDates.has(dStr);
          return (
            <div
              key={i}
              onClick={() => absenceMode && togglePending(dStr)}
              className={`border-r border-[#e9e8e6] px-2 py-4 text-center transition-colors duration-200 ${
                absenceMode ? 'cursor-pointer hover:bg-[#faf9f7]' : ''
              } ${isPending ? 'bg-[#435544] text-white' : !isOpen ? 'bg-[#efeeec]/80' : ''} ${
                isToday && !isPending ? 'bg-[#435544]/8' : ''
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                isToday && !isPending ? 'text-[#435544]' : isPending ? 'text-white/70' : 'text-[#747872]'
              }`}>
                {format(d, 'EEE', { locale: fr })}
              </p>
              <p className={`mt-1 text-2xl font-bold leading-none ${
                isToday && !isPending
                  ? 'text-[#435544]'
                  : isOpen ? (isPending ? 'text-white' : 'text-[#1a1c1b]') : 'text-[#747872] opacity-60'
              }`}>
                {d.getDate()}
              </p>
              {!isOpen && !isPending && (
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#747872]">Fermé</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 bg-white">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div
            className="grid relative"
            style={{ gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, minmax(0, 1fr))`, height: gridHeight }}
          >
            {/* Time labels column */}
          <div className="border-r border-[#e9e8e6] relative bg-[#faf9f7]">
            {HOURS.map(h => (
              <div
                key={`row-${h}`}
                className="absolute inset-x-0 border-t border-[#e9e8e6]/60"
                style={{ top: (h - START_HOUR) * HOUR_H }}
              />
            ))}
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-3 top-0 text-xs font-medium text-[#747872]"
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
                className={`border-r border-[#e9e8e6] relative ${
                  isToday ? 'bg-[#435544]/[0.03]' : 'bg-white'
                } ${!isOpen ? 'bg-[#faf9f7]' : ''} ${isPending ? 'bg-[#435544]/8' : ''}`}
              >
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[#e9e8e6]/60"
                    style={{ top: (h - START_HOUR) * HOUR_H }}
                  />
                ))}

                {!isOpen && (
                  <div className="absolute inset-x-2 top-3 z-[1] rounded-xl border border-[#e9e8e6] bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#747872] shadow-sm">
                    Journée fermée
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
                      top={top}
                      blockMode={blockMode}
                      onClick={() => {
                        if (absenceMode) return;
                        if (blockMode) { toggleSlot(dStr, t); return; }
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
                        if (!absenceMode) toggleSlot(dStr, t);
                      }}
                      className="absolute left-1 right-1 z-[2] flex items-center justify-center rounded-lg border border-[#e9e8e6] bg-[#f4f3f1]/90 px-2 text-center shadow-sm transition-all duration-200 hover:bg-[#efeeec]"
                      style={{ top: getTop(t) + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#747872]">
                        <Lock size={12} strokeWidth={1.5} className="text-[#747872]" />
                        <span>Bloqué</span>
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
                      disabled={absenceMode || blockMode}
                    />
                  );
                })}
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
      className={`absolute left-1 right-1 z-[3] cursor-pointer overflow-hidden rounded-lg border-l-4 p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ${meta.cardClassName} ${className}`}
      style={{ top: top + 6, height: Math.max(height - 12, 40) }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[10px] font-bold leading-none ${meta.timeClassName}`}>
          {formatAppointmentRange(appt.time, appt.duration)}
        </p>
        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tight ${meta.badgeClassName}`}>
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
  isDayOpen: (d: string) => boolean;
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
  isDayOpen,
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
  const visibleAppointmentLimit = weekRows >= 6 ? 2 : 3;
  const dayCellPadding = weekRows >= 6 ? 'p-3' : 'p-4';

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#faf9f7]">
      {/* Column headers */}
      <div
        className="sticky z-20 grid shrink-0 grid-cols-7 border-b border-[#e9e8e6] bg-white/95 backdrop-blur"
        style={{ top: 0 }}
      >
        {MONTH_DAY_LABELS.map(d => (
          <div key={d} className="py-2.5 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#747872]">{d}</span>
          </div>
        ))}
      </div>

      {searchQuery.trim() && (
        <div className="border-b border-[#e9e8e6] bg-[#faf9f7] px-4 py-2 text-sm text-[#747872] sm:px-6">
          {`${appointments.length} séance${appointments.length > 1 ? 's' : ''} correspondent à “${searchQuery.trim()}”.`}
        </div>
      )}

      <div
        className="grid min-h-0 flex-1 grid-cols-7 bg-[#f4f3f1]"
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
              className={`group flex min-h-0 flex-col border-r border-b border-[#e9e8e6] ${dayCellPadding} transition-colors duration-200 ${
                !inMonth
                  ? 'cursor-default bg-[#efeeec]/40 text-[#c3c8c0]'
                  : 'cursor-pointer bg-white hover:bg-[#fcfcfb]'
              } ${isToday && inMonth ? 'bg-[#f7f8f5]' : ''} ${
                !isOpen && inMonth ? 'bg-[#f4f3f1]' : ''
              } ${isPend ? 'bg-[#435544] text-white hover:bg-[#435544]' : ''}`}
            >
              <div className="mb-2 flex shrink-0 items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${
                    inMonth ? (isPend ? 'text-white/80' : 'text-[#747872]') : 'text-[#c3c8c0]'
                  }`}>
                    {format(day, 'MMM').replace('.', '')}
                  </span>
                  {inMonth && dayAppointments.length > 0 && (
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                      isPend ? 'text-white/70' : 'text-[#747872]'
                    }`}>
                      {dayAppointments.length} séance{dayAppointments.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isToday && !isPend
                    ? 'bg-[#435544] text-white ring-4 ring-[#435544]/10'
                    : inMonth
                      ? (isPend ? 'bg-white/10 text-white' : 'text-[#1a1c1b]')
                      : 'text-[#c3c8c0]'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
                {inMonth && !isOpen && (
                  <div className={`rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] ${
                    isPend ? 'border-white/20 bg-white/10 text-white/70' : 'border-[#e3e2e0] bg-[#faf9f7] text-[#747872]'
                  }`}>
                    Repos
                  </div>
                )}

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
                      className={`rounded-r-xl border-l-4 px-2 py-1.5 text-left transition-transform hover:-translate-y-0.5 ${tone}`}
                    >
                      <div className={`text-[10px] font-bold leading-none ${isPaid ? 'text-white/80' : ''}`}>
                        {appt.time || '--:--'}{appt.duration ? ` · ${appt.duration}` : ''}
                      </div>
                      <div className={`mt-1 truncate text-[11px] font-semibold leading-tight ${isPaid ? 'text-white' : 'text-[#1a1c1b]'}`}>
                        {appt.clientNameSnapshot || appt.title || 'Séance'}
                      </div>
                      <div className={`truncate text-[10px] leading-tight ${isPaid ? 'text-white/70' : 'text-[#434842]'}`}>
                        {appt.serviceName || 'Session'}
                      </div>
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
                    className={`mt-auto rounded-full px-3 py-1 text-left text-[11px] font-semibold transition-colors ${
                      isPend
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-[#f4f3f1] text-[#435544] hover:bg-[#efeeec]'
                    }`}
                  >
                    +{hiddenCount} autre{hiddenCount > 1 ? 's' : ''}
                  </button>
                )}

                {inMonth && isOpen && dayAppointments.length === 0 && (
                  <div className={`mt-auto rounded-xl border border-dashed px-3 py-3 text-[11px] ${
                    isPend ? 'border-white/20 text-white/70' : 'border-[#e3e2e0] text-[#747872]'
                  }`}>
                    Aucune séance planifiée
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
  onClick,
  top,
  blockMode,
}: {
  id: string;
  onClick: () => void;
  top: number;
  blockMode: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`absolute left-1 right-1 z-[2] flex items-center justify-center overflow-hidden rounded-lg border border-dashed transition-all duration-200 group ${
        isOver 
          ? 'border-[#1a1c1b] bg-[#faf9f7]' 
          : 'border-transparent bg-transparent hover:bg-[#faf9f7]/70 hover:border-[#d9ddd6]'
      }`}
      style={{ top: top + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
    >
      <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
        isOver
          ? 'text-[#1a1c1b] scale-105'
          : blockMode
            ? 'text-[#725a38] opacity-0 group-hover:opacity-100'
            : 'text-[#435544] opacity-0 group-hover:opacity-100'
      }`}>
        <Plus size={14} strokeWidth={1.8} />
        <span>{blockMode ? 'Bloquer' : 'Ajouter'}</span>
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
