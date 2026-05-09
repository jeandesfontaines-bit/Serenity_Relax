import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Ban, Lock, CheckCircle2,
  Clock, Settings,
} from 'lucide-react';
import { format, isSameDay, isSameMonth, addDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DndContext, useDraggable, useDroppable, DragOverlay, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Appointment } from '../types';
import { motion } from 'framer-motion';

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
function cleanServiceLabel(value?: string): string {
  if (value === undefined || value === null) return '';
  const raw = typeof value === 'string' ? value : String(value);
  return raw
    .replace(/\s*-\s*s[ée]ance cibl[ée]e?/gi, '')
    .replace(/\bs[ée]ance cibl[ée]e?\b/gi, '')
    .trim();
}

type AppointmentTone = {
  surface: string;
  border: string;
  title: string;
  meta: string;
  dot: string;
};

const APPOINTMENT_TONES: Record<'default' | 'paid' | 'cancelled' | 'pending', AppointmentTone> = {
  default: {
    surface: 'bg-white',
    border: 'border-[var(--dashboard-border)]',
    title: 'text-[var(--dashboard-asphalt)]',
    meta: 'text-[var(--dashboard-rooftop-grey)]',
    dot: 'bg-[var(--dashboard-bench-green)]',
  },
  paid: {
    surface: 'bg-[color:rgba(232,242,238,0.85)]',
    border: 'border-[#bad5c8]',
    title: 'text-[var(--dashboard-bench-green)]',
    meta: 'text-[var(--dashboard-rooftop-grey)]',
    dot: 'bg-[var(--dashboard-fresh-green)]',
  },
  cancelled: {
    surface: 'bg-[color:rgba(253,236,237,0.9)]',
    border: 'border-[#f2bec2]',
    title: 'text-[var(--dashboard-deep-red)]',
    meta: 'text-[#ab5a61]',
    dot: 'bg-[var(--dashboard-bright-red)]',
  },
  pending: {
    surface: 'bg-[color:rgba(248,235,223,0.9)]',
    border: 'border-[#f0cfb8]',
    title: 'text-[#9d5f32]',
    meta: 'text-[#9d5f32]',
    dot: 'bg-[var(--dashboard-matte-orange)]',
  },
};

function getAppointmentTone(appt: Appointment): AppointmentTone {
  const status = String(appt.status || '').toLowerCase();
  if (status.includes('cancel')) return APPOINTMENT_TONES.cancelled;
  if (appt.paid || status === 'paid' || status === 'done' || status === 'réglé' || status === 'regle') {
    return APPOINTMENT_TONES.paid;
  }
  if (status === 'pending' || status === 'late') return APPOINTMENT_TONES.pending;
  return APPOINTMENT_TONES.default;
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
  searchQuery?: string;
  pendingDates?: Set<string>;
  togglePending?: (date: string) => void;
  onClearAbsenceMode?: () => void;
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function AgendaPage({
  view, cur, onPeriod, onToday, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, toggleSlot, onToggleDay,
  blockMode, setBlockMode, absenceMode, setAbsenceMode,
  onOpenWeeklySettings, onMoveAppt, pendingDates, togglePending, onClearAbsenceMode,
}: AgendaPageProps) {
  const safeOnPeriod = onPeriod ?? (() => {});
  const safeOnToday = onToday ?? (() => {});
  const safeOnToggleDay = onToggleDay ?? (() => {});
  const safeSetBlockMode = setBlockMode ?? (() => {});
  const safeSetAbsenceMode = setAbsenceMode ?? (() => {});
  const safeOnClearAbsenceMode = onClearAbsenceMode ?? (() => {});
  const safeOnOpenWeeklySettings = onOpenWeeklySettings ?? (() => {});
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

  const handleSaveAbsences = useCallback(() => {
    activePendingDates.forEach(d => safeOnToggleDay(d));
    if (togglePending) {
      safeOnClearAbsenceMode();
    } else {
      setLocalPendingDates(new Set());
    }
    safeSetAbsenceMode(false);
  }, [activePendingDates, safeOnToggleDay, safeSetAbsenceMode, safeOnClearAbsenceMode, togglePending]);

  const handleTogglePending = useCallback((dStr: string) => {
    if (togglePending) {
      togglePending(dStr);
      return;
    }
    setLocalPendingDates(prev => {
      const next = new Set(prev);
      next.has(dStr) ? next.delete(dStr) : next.add(dStr);
      return next;
    });
  }, [togglePending]);

  const titleLabel = useMemo(() => {
    if (view === 'week') {
      const s = wkStart(cur);
      const e = addDays(s, 6);
      return `${format(s, 'd')} – ${format(e, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(cur, 'MMMM yyyy', { locale: fr });
  }, [view, cur]);

  return (
    <motion.div 
      className="flex-1 flex flex-col overflow-hidden bg-[var(--dashboard-sandstone)]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── HEADER ── */}
      <header className="h-24 border-b border-[var(--dashboard-border)] bg-white/50 backdrop-blur-md px-8 sm:px-16 flex items-center justify-between shrink-0">
        {/* Left: navigation */}
        <div className="flex items-center gap-10 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => safeOnPeriod(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-none border border-[var(--dashboard-border)] hover:border-[var(--dashboard-bench-green)] text-[var(--dashboard-asphalt)] transition-all duration-500 bg-white"
            >
              <ChevronLeft size={16} strokeWidth={1} />
            </button>
            <button
              onClick={() => safeOnPeriod(1)}
              className="w-10 h-10 flex items-center justify-center rounded-none border border-[var(--dashboard-border)] hover:border-[var(--dashboard-bench-green)] text-[var(--dashboard-asphalt)] transition-all duration-500 bg-white"
            >
              <ChevronRight size={16} strokeWidth={1} />
            </button>
          </div>

          <div>
            <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-[var(--dashboard-rooftop-grey)] block mb-1">PROGRAMMATION</span>
            <h2 className="text-xl font-sans text-[var(--dashboard-asphalt)] capitalize truncate tracking-tight uppercase">
              {titleLabel}
            </h2>
          </div>

          <button
            onClick={safeOnToday}
            className="h-10 px-6 text-[9px] font-sans uppercase tracking-[0.3em] text-[var(--dashboard-blue-grey)] border border-transparent hover:text-[var(--dashboard-asphalt)] hover:border-[var(--dashboard-border)] transition-all duration-500 hidden sm:block bg-white/50"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex h-10 bg-[var(--dashboard-light)] p-1">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onToggleView(v)}
                className={`h-full px-6 flex items-center text-[9px] font-sans uppercase tracking-[0.2em] transition-all duration-500 ${
                  view === v ? 'bg-white text-[var(--dashboard-asphalt)] shadow-sm' : 'text-[var(--dashboard-blue-grey)] hover:text-[var(--dashboard-rooftop-grey)]'
                }`}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          <button
            onClick={resolvedAbsenceMode ? handleSaveAbsences : () => { safeSetAbsenceMode(true); safeSetBlockMode(false); }}
            className={`h-10 px-6 flex items-center gap-3 text-[9px] font-sans uppercase tracking-[0.2em] transition-all duration-500 ${
              resolvedAbsenceMode
                ? 'bg-[var(--dashboard-asphalt)] text-white'
                : 'bg-white border border-[var(--dashboard-border)] text-[var(--dashboard-asphalt)] hover:border-[var(--dashboard-bench-green)]'
            }`}
          >
            {resolvedAbsenceMode ? <CheckCircle2 size={12} strokeWidth={1} /> : <Ban size={12} strokeWidth={1} />}
            <span className="hidden sm:inline">{resolvedAbsenceMode ? `Valider (${activePendingDates.size})` : 'Absences'}</span>
          </button>

          <button
            onClick={safeOnOpenWeeklySettings}
            className="h-10 w-10 sm:w-auto sm:px-6 flex items-center justify-center gap-3 text-[9px] font-sans uppercase tracking-[0.2em] bg-white border border-[var(--dashboard-border)] text-[var(--dashboard-asphalt)] hover:border-[var(--dashboard-bench-green)] transition-all duration-500"
          >
            <Settings size={12} strokeWidth={1} />
            <span className="hidden sm:inline text-xs mt-0.5">Configuration</span>
          </button>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (desktop only) */}
        <AgendaSidebar
          cur={cur}
          appointments={appointments}
          view={view}
        />

        {/* Main calendar area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/20">
          {view === 'week'
            ? <WeekTimeGrid
                cur={cur}
                appointments={appointments}
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
                appointments={appointments}
                configSlots={configSlots}
                isDayOpen={isDayOpen}
                isSlotBlocked={isSlotBlocked}
                absenceMode={resolvedAbsenceMode}
                pendingDates={activePendingDates}
                togglePending={handleTogglePending}
                onToggleView={onToggleView}
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
    <aside className="hidden xl:flex flex-col w-80 border-r border-[var(--dashboard-border)] bg-white/30 backdrop-blur-sm shrink-0">
      {/* Today summary */}
      <div className="p-10 border-b border-[var(--dashboard-border)]">
        <h3 className="text-[9px] font-sans text-[var(--dashboard-rooftop-grey)] uppercase tracking-[0.4em] mb-6 opacity-60">AUJOURD'HUI</h3>
        <p className="text-5xl font-sans text-[var(--dashboard-asphalt)] ">{todayAppts.length}</p>
        <p className="text-[10px] text-[var(--dashboard-blue-grey)] mt-4 font-sans uppercase tracking-[0.1em]">
          Soins confirmés
        </p>
      </div>

      {/* Upcoming today */}
      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
        <h3 className="text-[9px] font-sans text-[var(--dashboard-rooftop-grey)] uppercase tracking-[0.4em] mb-10 opacity-60">
          PROCHAINES SÉANCES
        </h3>
        {todayAppts.length > 0 ? (
          <div className="space-y-10">
            {todayAppts.slice(0, 8).map(a => (
              <div key={a.id} className="group cursor-pointer">
                <div className="flex items-start gap-6">
                  <span className="text-[11px] font-sans text-[var(--dashboard-rooftop-grey)] w-14 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">{a.time}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-sans text-[var(--dashboard-asphalt)] truncate transition-all duration-500">
                      {a.clientNameSnapshot || a.title}
                    </p>
                    <p className="text-[9px] text-[var(--dashboard-blue-grey)] uppercase tracking-[0.2em] mt-2 group-hover:text-[var(--dashboard-bench-green)] transition-colors">
                      {cleanServiceLabel(a.serviceName) || cleanServiceLabel(a.title) || 'RDV'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center opacity-30">
             <Clock size={32} className="text-[var(--dashboard-blue-grey)] mx-auto mb-6" strokeWidth={0.5} />
             <p className="text-[9px] font-sans text-[var(--dashboard-blue-grey)] uppercase tracking-[0.3em]">Zone de repos</p>
          </div>
        )}
      </div>

      {/* Revenue */}
      <div className="p-10 border-t border-[var(--dashboard-border)] bg-[color:rgba(230,235,240,0.2)]">
        <h3 className="text-[9px] font-sans text-[var(--dashboard-rooftop-grey)] uppercase tracking-[0.4em] mb-3 opacity-60">REVENUS ESTIMÉS</h3>
        <p className="text-2xl font-sans text-[var(--dashboard-asphalt)]">
          {todayAppts.reduce((s, a) => s + (a.price || 150), 0)} <span className="text-[10px] font-sans text-[var(--dashboard-blue-grey)] ml-1 uppercase tracking-widest ">CHF</span>
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
    const nextId = event?.active?.id;
    setActiveId(nextId ? String(nextId) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const active = event?.active;
    const over = event?.over;
    if (over?.id && active?.id && onMoveAppt) {
      const [newDate, newTime] = String(over.id).split('|');
      onMoveAppt(String(active.id), newDate, newTime);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Day column headers */}
      <div className="grid shrink-0 border-b border-[var(--dashboard-border)]" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
        {/* Empty corner */}
        <div className="border-r border-[var(--dashboard-border)] bg-[color:rgba(246,242,234,0.5)]" />
        {days.map((d, i) => {
          const dStr = fmt(d);
          const isToday = isSameDay(new Date(), d);
          const isOpen = isDayOpen(dStr);
          const isPending = pendingDates.has(dStr);
          return (
            <div
              key={i}
              onClick={() => absenceMode && togglePending(dStr)}
              className={`py-8 text-center border-r border-[var(--dashboard-border)] transition-all duration-700 ${
                absenceMode ? 'cursor-pointer hover:bg-[var(--dashboard-sandstone)]' : ''
              } ${isPending ? 'bg-[var(--dashboard-asphalt)] text-white' : !isOpen ? 'bg-[color:rgba(230,235,240,0.5)]' : ''}`}
            >
              <p className={`text-[9px] font-sans uppercase tracking-[0.4em] mb-3 ${isToday ? 'text-[var(--dashboard-bench-green)]' : 'text-[var(--dashboard-blue-grey)]'}`}>
                {DAYS_LABELS[i]}
              </p>
              <p className={`text-3xl font-sans leading-none ${
                isToday && !isPending
                  ? 'text-[var(--dashboard-asphalt)] relative'
                  : isOpen ? (isPending ? 'text-white' : 'text-[var(--dashboard-asphalt)]') : 'text-[var(--dashboard-blue-grey)] opacity-40'
              }`}>
                {d.getDate()}
                {isToday && !isPending && (
                   <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--dashboard-bench-green)] rounded-none rotate-45" />
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div
            className="grid relative"
            style={{ gridTemplateColumns: '100px repeat(7, 1fr)', height: gridHeight }}
          >
            {/* Time labels column */}
          <div className="border-r border-[var(--dashboard-border)] relative bg-[color:rgba(246,242,234,0.2)]">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-6 text-[10px] font-sans text-[var(--dashboard-blue-grey)] -translate-y-1/2 uppercase tracking-widest "
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
            const dayAppts = appointments.filter(
              (a) => a && typeof a.id === 'string' && a.id.trim().length > 0 && a.date === dStr && typeof a.time === 'string',
            );

            return (
              <div key={dayIdx} className="border-r border-[var(--dashboard-border)] relative">
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[color:rgba(217,222,228,0.3)]"
                    style={{ top: (h - START_HOUR) * HOUR_H }}
                  />
                ))}
                
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
                      className="absolute left-3 right-3 z-[2] rounded-[14px] bg-[color:rgba(230,235,240,0.8)] border border-[var(--dashboard-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--dashboard-light)] transition-all duration-500"
                      style={{ top: getTop(t) + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
                    >
                      <Lock size={12} strokeWidth={1} className="text-[var(--dashboard-blue-grey)]" />
                    </div>
                  );
                })}

                {/* Appointment blocks */}
                {isOpen && dayAppts.map(appt => {
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
  const tone = getAppointmentTone(appt);
  const serviceLabel = cleanServiceLabel(appt.serviceName) || cleanServiceLabel(appt.title) || 'RDV';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-3 right-3 z-[3] rounded-[14px] p-4 cursor-pointer border transition-all duration-300 overflow-hidden group shadow-sm ${tone.surface} ${tone.border} ${className}`}
      style={{ top: top + 6, height: Math.max(height - 12, 40) }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`text-[13px] font-semibold font-sans leading-tight truncate ${tone.title}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${tone.dot}`} />
      </div>
      {height >= 70 && (
        <p className={`text-[9px] mt-2 truncate uppercase tracking-[0.16em] font-medium font-sans ${tone.meta}`}>
          {serviceLabel}
        </p>
      )}
      {height >= 100 && (
        <div className="mt-auto pt-3 flex items-center border-t border-[color:rgba(217,222,228,0.35)]">
          <span className={`text-[9px] font-medium font-sans uppercase tracking-[0.15em] ${tone.meta}`}>{appt.time}</span>
        </div>
      )}
      <div className={`absolute left-0 top-0 h-full w-[3px] ${tone.dot}`} />
    </div>
  );
}

/* ── Month view ── */
type MonthViewProps = {
  cur: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  absenceMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onToggleView: (v: 'month' | 'week') => void;
};

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
}: MonthViewProps) {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }),
  }), [cur]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-[var(--dashboard-border)] shrink-0 bg-[color:rgba(246,242,234,0.5)]">
        {DAYS_LABELS.map(d => (
          <div key={d} className="py-6 text-center border-r border-[var(--dashboard-border)]">
            <span className="text-[9px] font-sans text-[var(--dashboard-rooftop-grey)] uppercase tracking-[0.4em] opacity-60">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 overflow-auto scrollbar-hide bg-[var(--dashboard-light)]">
        {days.map((day, i) => {
          const dStr = fmt(day);
          const isOpen = isDayOpen(dStr);
          const isPend = pendingDates.has(dStr);
          const isToday = isSameDay(new Date(), day);
          const inMonth = isSameMonth(day, cur);
          const dayAppointments = appointments
            .filter((e) => e && typeof e.id === 'string' && e.id.trim().length > 0 && e.date === dStr)
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          const freeSlots = isOpen
            ? [...(configSlots[isoDay(day)] || [])]
                .sort()
                .filter((time) => (
                  !dayAppointments.some((appt) => appt.time === time) &&
                  !isSlotBlocked(dStr, time)
                ))
            : [];

          return (
            <div
              key={i}
              onClick={() => {
                if (!inMonth) return;
                absenceMode ? togglePending(dStr) : onToggleView('week');
              }}
              className={`border-r border-b border-[var(--dashboard-border)] p-4 flex flex-col min-h-[165px] transition-all duration-300 relative group ${
                !inMonth ? 'opacity-20 cursor-default bg-white' : 'cursor-pointer bg-white hover:bg-[var(--dashboard-sandstone)]'
              } ${isToday && inMonth ? 'bg-[var(--dashboard-sandstone)]' : ''} ${
                !isOpen && inMonth ? 'bg-[var(--dashboard-light)]' : ''
              } ${isPend ? 'bg-[var(--dashboard-sandstone-strong)]' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  inMonth ? 'text-[var(--dashboard-rooftop-grey)]' : 'text-[var(--dashboard-blue-grey)]'
                }`}>
                  {format(day, 'MMM', { locale: fr }).replace('.', '')}
                </span>
                <span className={`text-[2rem] font-semibold leading-none ${
                  isToday && !isPend ? 'text-[var(--dashboard-rooftop-grey)]' : inMonth ? 'text-[var(--dashboard-asphalt)]' : 'text-[var(--dashboard-blue-grey)]'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              {inMonth && isOpen && (
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--dashboard-fresh-green)]">
                  {freeSlots.length > 1 ? `${freeSlots.length} créneaux libres` : `${freeSlots.length} créneau libre`}
                </p>
              )}

              {inMonth && isOpen && (
                <div className="mt-2 rounded-[14px] bg-[var(--dashboard-sandstone-strong)] px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-[var(--dashboard-fresh-green)]">
                  {freeSlots.length > 0
                    ? `${freeSlots.slice(0, 2).join(' · ')}${freeSlots.length > 2 ? ` +${freeSlots.length - 2}` : ''}`
                    : 'COMPLET'}
                </div>
              )}

              {inMonth && isOpen && dayAppointments.slice(0, 1).map((appt) => {
                const tone = getAppointmentTone(appt);
                const serviceLabel = cleanServiceLabel(appt.serviceName) || cleanServiceLabel(appt.title) || 'RDV';
                return (
                  <div
                    key={appt.id}
                    className={`mt-2 rounded-[14px] border px-3 py-2 text-[11px] font-medium truncate ${tone.surface} ${tone.border} ${tone.title}`}
                  >
                    <span className={`font-semibold ${tone.meta}`}>{appt.time || '--:--'}</span>
                    {' · '}
                    {serviceLabel}
                  </div>
                );
              })}

              {inMonth && isOpen && (
                <div className="mt-auto rounded-[14px] border border-dashed border-[var(--dashboard-border)] bg-white px-4 py-2 text-[11px] text-[var(--dashboard-rooftop-grey)]">
                  {freeSlots.length > 0 ? 'Libre' : 'Complet'}
                </div>
              )}

              {inMonth && !isOpen && (
                <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(45deg,rgba(47,101,114,0.06),rgba(47,101,114,0.06)_12px,transparent_12px,transparent_24px)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── DND-KIT WRAPPERS ── */
function DroppableSlot({ id, onClick, top }: { id: string; onClick: () => void; top: number; }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`absolute left-3 right-3 z-[2] rounded-[14px] border border-dashed transition-all duration-700 group flex items-center justify-center overflow-hidden ${
        isOver 
          ? 'border-[var(--dashboard-asphalt)] bg-[var(--dashboard-sandstone)]' 
          : 'border-transparent bg-transparent hover:bg-[color:rgba(246,242,234,0.5)] hover:border-[var(--dashboard-border)]'
      }`}
      style={{ top: top + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
    >
      <Plus size={18} strokeWidth={1} className={`transition-all duration-700 ${isOver ? 'text-[var(--dashboard-asphalt)] scale-110' : 'text-transparent group-hover:text-[var(--dashboard-blue-grey)]'}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-transparent group-hover:to-[color:rgba(246,242,234,0.2)] transition-colors" />
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
