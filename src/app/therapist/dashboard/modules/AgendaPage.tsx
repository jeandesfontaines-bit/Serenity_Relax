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

const APPOINTMENT_TONES: Record<'default' | 'paid' | 'cancelled' | 'pending' | 'confirmed', AppointmentTone> = {
  default: {
    surface: 'bg-white',
    border: 'border-neutral-100',
    title: 'text-neutral-900',
    meta: 'text-neutral-400',
    dot: 'bg-neutral-900',
  },
  confirmed: {
    surface: 'bg-[var(--accent-blue)]/60',
    border: 'border-blue-200/50',
    title: 'text-blue-950',
    meta: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  paid: {
    surface: 'bg-[var(--accent-teal)]/60',
    border: 'border-emerald-200/50',
    title: 'text-emerald-950',
    meta: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    surface: 'bg-red-50/60',
    border: 'border-red-100',
    title: 'text-red-950',
    meta: 'text-red-600',
    dot: 'bg-red-500',
  },
  pending: {
    surface: 'bg-[var(--accent-yellow)]/60',
    border: 'border-amber-200/50',
    title: 'text-amber-950',
    meta: 'text-amber-600',
    dot: 'bg-amber-500',
  },
};

function getAppointmentTone(appt: Appointment): AppointmentTone {
  const status = String(appt.status || '').toLowerCase();
  if (status.includes('cancel')) return APPOINTMENT_TONES.cancelled;
  if (appt.paid || status === 'paid' || status === 'done' || status === 'réglé' || status === 'regle') {
    return APPOINTMENT_TONES.paid;
  }
  if (status === 'pending' || status === 'late') return APPOINTMENT_TONES.pending;
  if (status === 'confirmed') return APPOINTMENT_TONES.confirmed;
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

interface WeekTimeGridProps {
  cur: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  absenceMode: boolean;
  blockMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
}

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
      className="flex-1 flex flex-col overflow-hidden bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── HEADER (Integrated into AppLayout, this acts as secondary if needed or can be minimal) ── */}
      {/* Keeping a minimal header if used standalone, but usually AppLayout handles this */}
      <header className="h-20 border-b border-neutral-100 bg-white px-8 sm:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => safeOnPeriod(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-all"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => safeOnPeriod(1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-all"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight uppercase">
              {titleLabel}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-neutral-50 rounded-full p-1">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onToggleView(v)}
                className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                  view === v ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-300 hover:text-neutral-900'
                }`}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          <button
            onClick={resolvedAbsenceMode ? handleSaveAbsences : () => { safeSetAbsenceMode(true); safeSetBlockMode(false); }}
            className={`h-10 px-6 flex items-center gap-3 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
              resolvedAbsenceMode
                ? 'bg-neutral-900 text-white shadow-xl scale-105'
                : 'bg-white border border-neutral-100 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900'
            }`}
          >
            {resolvedAbsenceMode ? <CheckCircle2 size={12} strokeWidth={3} /> : <Ban size={12} strokeWidth={2.5} />}
            <span className="hidden sm:inline">{resolvedAbsenceMode ? `Valider (${activePendingDates.size})` : 'Gérer Absences'}</span>
          </button>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AgendaSidebar
          cur={cur}
          appointments={appointments}
          view={view}
        />

        {/* Main calendar area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
    () => appointments.filter((a: Appointment) => a.date === todayStr).sort((a: Appointment, b: Appointment) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  return (
    <aside className="hidden xl:flex flex-col w-80 border-r border-neutral-100 bg-white shrink-0">
      <div className="p-12 border-b border-neutral-100 bg-neutral-50/30">
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em] mb-6">Aujourd'hui</h3>
        <p className="text-7xl font-extrabold text-neutral-900 tracking-tighter leading-none">{todayAppts.length}</p>
        <p className="text-[11px] text-neutral-400 mt-6 font-bold uppercase tracking-[0.2em]">
          Séances de ce jour
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-12 scrollbar-hide space-y-12">
        <div>
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em] mb-10">
            PROCHAINS PATIENTS
          </h3>
          {todayAppts.length > 0 ? (
            <div className="space-y-10">
              {todayAppts.slice(0, 8).map(a => (
                <div key={a.id} className="group cursor-pointer">
                  <div className="flex items-start gap-6">
                    <span className="text-[11px] font-bold text-neutral-300 w-14 shrink-0 group-hover:text-neutral-900 transition-colors leading-tight">{a.time}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 truncate tracking-tight transition-all">
                        {a.clientNameSnapshot || a.title}
                      </p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-neutral-900 transition-colors">
                        {cleanServiceLabel(a.serviceName) || cleanServiceLabel(a.title) || 'SÉANCE'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
               <Clock size={32} className="text-neutral-100 mx-auto mb-6" strokeWidth={1} />
               <p className="text-[9px] font-bold text-neutral-200 uppercase tracking-[0.4em]">CALENDRIER VIDE</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-12 border-t border-neutral-100 bg-neutral-900 text-white rounded-tr-[3rem]">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-4">REVENUS ESTIMÉS</h3>
        <p className="text-4xl font-extrabold tracking-tighter">
          {todayAppts.reduce((s, a) => s + (a.price || 150), 0)} <span className="text-[10px] font-bold text-white/40 ml-1 uppercase tracking-widest ">CHF</span>
        </p>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════
   WEEK TIME GRID
   ══════════════════════════════════════════════════ */
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

  const activeAppt = useMemo(() => activeId ? appointments.find((a: Appointment) => a.id === activeId) : null, [activeId, appointments]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Day column headers */}
      <div className="grid shrink-0 border-b border-neutral-100" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
        <div className="border-r border-neutral-100 bg-neutral-50/30" />
        {days.map((d, i) => {
          const dStr = fmt(d);
          const isToday = isSameDay(new Date(), d);
          const isOpen = isDayOpen(dStr);
          const isPending = pendingDates.has(dStr);
          return (
            <div
              key={i}
              onClick={() => absenceMode && togglePending(dStr)}
              className={`py-8 text-center border-r border-neutral-100 transition-all duration-500 ${
                absenceMode ? 'cursor-pointer hover:bg-neutral-50' : ''
              } ${isPending ? 'bg-neutral-900 text-white shadow-2xl z-10' : !isOpen ? 'bg-neutral-50/30' : 'bg-white'}`}
            >
              <p className={`text-[9px] font-bold uppercase tracking-[0.4em] mb-4 ${isToday ? 'text-blue-500' : 'text-neutral-300'}`}>
                {DAYS_LABELS[i]}
              </p>
              <p className={`text-3xl font-extrabold leading-none tracking-tighter ${
                isToday && !isPending
                  ? 'text-neutral-900 relative'
                  : isOpen ? (isPending ? 'text-white' : 'text-neutral-900') : 'text-neutral-200'
              }`}>
                {d.getDate()}
                {isToday && !isPending && (
                   <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg" />
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
          <div className="border-r border-neutral-100 relative bg-neutral-50/10">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-8 text-[10px] font-bold text-neutral-300 -translate-y-1/2 uppercase tracking-widest"
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
              (a: Appointment) => a && typeof a.id === 'string' && a.id.trim().length > 0 && a.date === dStr && typeof a.time === 'string',
            );

            return (
              <div key={dayIdx} className="border-r border-neutral-100 relative">
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-neutral-50"
                    style={{ top: (h - START_HOUR) * HOUR_H }}
                  />
                ))}
                
                {/* Available slot markers */}
                {isOpen && daySlots.map(t => {
                  const hasAppt = dayAppts.some((a: Appointment) => a.time === t);
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
                  const hasAppt = dayAppts.some((a: Appointment) => a.time === t);
                  if (hasAppt) return null;

                  return (
                    <div
                      key={`block-${t}`}
                      onClick={() => {
                        if (!absenceMode) toggleSlot(dStr, t);
                      }}
                      className="absolute left-4 right-4 z-[2] rounded-[1.5rem] bg-neutral-50/80 border border-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all duration-500 shadow-inner"
                      style={{ top: getTop(t) + 8, height: getHeight(DEFAULT_DURATION) - 16 }}
                    >
                      <Lock size={14} strokeWidth={2} className="text-neutral-300" />
                    </div>
                  );
                })}

                {/* Appointment blocks */}
                {isOpen && dayAppts.map((appt: Appointment) => {
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
          
          <DragOverlay zIndex={500} dropAnimation={null}>
            {activeAppt ? (
              <AppointmentBlock
                appt={activeAppt}
                top={0}
                height={getHeight(parseDuration(activeAppt.duration))}
                onSelect={() => {}}
                className="shadow-[0_40px_80px_rgba(0,0,0,0.15)] opacity-90 scale-[1.02]"
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
  const serviceLabel = cleanServiceLabel(appt.serviceName) || cleanServiceLabel(appt.title) || 'SÉANCE';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-4 right-4 z-[3] rounded-[2.5rem] p-6 cursor-pointer border transition-all duration-500 overflow-hidden group shadow-md hover:shadow-2xl hover:scale-[1.01] active:scale-95 ${tone.surface} ${tone.border} ${className}`}
      style={{ top: top + 10, height: Math.max(height - 20, 60) }}
    >
      <div className="flex items-start justify-between gap-6">
        <p className={`text-base font-bold tracking-tight leading-tight transition-all ${tone.title}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm ${tone.dot}`} />
      </div>
      
      {height >= 100 && (
        <p className={`text-[10px] mt-3 truncate font-bold uppercase tracking-[0.25em] ${tone.meta}`}>
          {serviceLabel}
        </p>
      )}
      
      {height >= 140 && (
        <div className="mt-auto pt-4 flex items-center border-t border-neutral-100/50">
          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${tone.meta}`}>{appt.time}</span>
        </div>
      )}
      
      {/* Editorial side accent */}
      <div className={`absolute left-0 top-0 h-full w-[6px] ${tone.dot} opacity-20`} />
    </div>
  );
}

/* ── Month view ── */
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
      <div className="grid grid-cols-7 border-b border-neutral-100 shrink-0 bg-neutral-50/20">
        {DAYS_LABELS.map(d => (
          <div key={d} className="py-6 text-center border-r border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.4em] opacity-80">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 overflow-auto scrollbar-hide bg-neutral-50/10">
        {days.map((day, i) => {
          const dStr = fmt(day);
          const isOpen = isDayOpen(dStr);
          const isPend = pendingDates.has(dStr);
          const isToday = isSameDay(new Date(), day);
          const inMonth = isSameMonth(day, cur);
          const dayAppointments = appointments
            .filter((e: Appointment) => e && typeof e.id === 'string' && e.id.trim().length > 0 && e.date === dStr)
            .sort((a: Appointment, b: Appointment) => (a.time || '').localeCompare(b.time || ''));
          const freeSlots = isOpen
            ? [...(configSlots[isoDay(day)] || [])]
                .sort()
                .filter((time) => (
                  !dayAppointments.some((appt: Appointment) => appt.time === time) &&
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
              className={`border-r border-b border-neutral-100 p-8 flex flex-col min-h-[200px] transition-all duration-500 relative group ${
                !inMonth ? 'opacity-10 cursor-default bg-white' : 'cursor-pointer bg-white hover:bg-neutral-50'
              } ${isToday && inMonth ? 'bg-blue-50/10 shadow-inner' : ''} ${
                !isOpen && inMonth ? 'bg-neutral-50/40' : ''
              } ${isPend ? 'bg-neutral-900 shadow-2xl z-10' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-[0.4em] ${
                  inMonth ? (isPend ? 'text-white/30' : 'text-neutral-400') : 'text-neutral-100'
                }`}>
                  {format(day, 'MMM', { locale: fr }).toUpperCase()}
                </span>
                <span className={`text-4xl font-extrabold leading-none tracking-tighter ${
                  isPend ? 'text-white' : isToday && inMonth ? 'text-blue-500' : inMonth ? 'text-neutral-900' : 'text-neutral-100'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              {inMonth && isOpen && !isPend && (
                <div className="mt-6 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">
                    {freeSlots.length} LIBRES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {freeSlots.slice(0, 2).map(t => (
                      <span key={t} className="px-3 py-1 rounded-full bg-neutral-50 text-[10px] font-bold text-neutral-400 border border-neutral-100">
                        {t}
                      </span>
                    ))}
                    {freeSlots.length > 2 && (
                      <span className="text-[10px] font-bold text-neutral-200 self-center">+{freeSlots.length - 2}</span>
                    )}
                  </div>
                </div>
              )}

                  {dayAppointments.length > 0 && (
                    <div className="mt-auto pt-6 border-t border-neutral-50">
                       {dayAppointments.slice(0, 1).map((appt: Appointment) => (
                         <div key={appt.id} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shadow-sm ${getAppointmentTone(appt).dot}`} />
                            <p className="text-[11px] font-bold text-neutral-900 truncate tracking-tight uppercase">
                              {appt.clientNameSnapshot || appt.title}
                            </p>
                         </div>
                       ))}
                    </div>
                  )}

              {!inMonth && (
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)]" />
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
      className={`absolute left-4 right-4 z-[2] rounded-[1.5rem] border-2 border-dashed transition-all duration-700 group flex items-center justify-center overflow-hidden ${
        isOver 
          ? 'border-neutral-900 bg-neutral-50 shadow-2xl' 
          : 'border-transparent bg-transparent hover:bg-neutral-50/50 hover:border-neutral-100'
      }`}
      style={{ top: top + 8, height: getHeight(DEFAULT_DURATION) - 16 }}
    >
      <Plus size={24} strokeWidth={2} className={`transition-all duration-700 ${isOver ? 'text-neutral-900 scale-110' : 'text-transparent group-hover:text-neutral-200'}`} />
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
    zIndex: 100,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AppointmentBlock
        appt={appt}
        top={top}
        height={height}
        onSelect={onSelect}
        className={isDragging ? 'opacity-0' : ''}
      />
    </div>
  );
}
