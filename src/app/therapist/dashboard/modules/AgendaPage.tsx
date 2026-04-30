import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Ban, Lock, CheckCircle2,
  Clock, Settings, Calendar as CalendarIcon,
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
  onPeriod: (dir: number) => void;
  onToday: () => void;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onToggleDay: (d: string) => void;
  blockMode: boolean;
  setBlockMode: (m: boolean) => void;
  absenceMode: boolean;
  setAbsenceMode: (m: boolean) => void;
  onOpenWeeklySettings: () => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function AgendaPage({
  view, cur, onPeriod, onToday, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, toggleSlot, onToggleDay,
  blockMode, setBlockMode, absenceMode, setAbsenceMode,
  onOpenWeeklySettings, onMoveAppt,
}: AgendaPageProps) {
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());

  // Escape cancels absence mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && absenceMode) {
        setPendingDates(new Set());
        setAbsenceMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [absenceMode, setAbsenceMode]);

  const handleSaveAbsences = useCallback(() => {
    pendingDates.forEach(d => onToggleDay(d));
    setPendingDates(new Set());
    setAbsenceMode(false);
  }, [pendingDates, onToggleDay, setAbsenceMode]);

  const togglePending = useCallback((dStr: string) => {
    setPendingDates(prev => {
      const next = new Set(prev);
      next.has(dStr) ? next.delete(dStr) : next.add(dStr);
      return next;
    });
  }, []);

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
      className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── HEADER ── */}
      <header className="h-24 border-b border-[#efeeec] bg-white/50 backdrop-blur-md px-8 sm:px-16 flex items-center justify-between shrink-0">
        {/* Left: navigation */}
        <div className="flex items-center gap-10 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPeriod(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-none border border-[#efeeec] hover:border-[#435544] text-[#1a1c1b] transition-all duration-500 bg-white"
            >
              <ChevronLeft size={16} strokeWidth={1} />
            </button>
            <button
              onClick={() => onPeriod(1)}
              className="w-10 h-10 flex items-center justify-center rounded-none border border-[#efeeec] hover:border-[#435544] text-[#1a1c1b] transition-all duration-500 bg-white"
            >
              <ChevronRight size={16} strokeWidth={1} />
            </button>
          </div>

          <div>
            <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#725a38] block mb-1">PROGRAMMATION</span>
            <h2 className="text-xl font-serif text-[#1a1c1b] capitalize truncate tracking-tight uppercase italic">
              {titleLabel}
            </h2>
          </div>

          <button
            onClick={onToday}
            className="h-10 px-6 text-[9px] font-serif uppercase tracking-[0.3em] text-[#c3c8c0] border border-transparent hover:text-[#1a1c1b] hover:border-[#efeeec] transition-all duration-500 hidden sm:block bg-white/50"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex h-10 bg-[#f4f3f1] p-1">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onToggleView(v)}
                className={`h-full px-6 flex items-center text-[9px] font-serif uppercase tracking-[0.2em] transition-all duration-500 ${
                  view === v ? 'bg-white text-[#1a1c1b] shadow-sm' : 'text-[#c3c8c0] hover:text-[#725a38]'
                }`}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          <button
            onClick={absenceMode ? handleSaveAbsences : () => { setAbsenceMode(true); setBlockMode(false); }}
            className={`h-10 px-6 flex items-center gap-3 text-[9px] font-serif uppercase tracking-[0.2em] transition-all duration-500 ${
              absenceMode
                ? 'bg-[#1a1c1b] text-white'
                : 'bg-white border border-[#efeeec] text-[#1a1c1b] hover:border-[#435544]'
            }`}
          >
            {absenceMode ? <CheckCircle2 size={12} strokeWidth={1} /> : <Ban size={12} strokeWidth={1} />}
            <span className="hidden sm:inline">{absenceMode ? `Valider (${pendingDates.size})` : 'Absences'}</span>
          </button>

          <button
            onClick={onOpenWeeklySettings}
            className="h-10 w-10 sm:w-auto sm:px-6 flex items-center justify-center gap-3 text-[9px] font-serif uppercase tracking-[0.2em] bg-white border border-[#efeeec] text-[#1a1c1b] hover:border-[#435544] transition-all duration-500"
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
                absenceMode={absenceMode}
                blockMode={blockMode}
                pendingDates={pendingDates}
                togglePending={togglePending}
                onMoveAppt={onMoveAppt}
              />
            : <MonthView
                cur={cur}
                appointments={appointments}
                isDayOpen={isDayOpen}
                absenceMode={absenceMode}
                pendingDates={pendingDates}
                togglePending={togglePending}
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
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Day column headers */}
      <div className="grid shrink-0 border-b border-[#efeeec]" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
        {/* Empty corner */}
        <div className="border-r border-[#efeeec] bg-[#faf9f7]/50" />
        {days.map((d, i) => {
          const dStr = fmt(d);
          const isToday = isSameDay(new Date(), d);
          const isOpen = isDayOpen(dStr);
          const isPending = pendingDates.has(dStr);
          return (
            <div
              key={i}
              onClick={() => absenceMode && togglePending(dStr)}
              className={`py-8 text-center border-r border-[#efeeec] transition-all duration-700 ${
                absenceMode ? 'cursor-pointer hover:bg-[#faf9f7]' : ''
              } ${isPending ? 'bg-[#1a1c1b] text-white' : !isOpen ? 'bg-[#f4f3f1]/50' : ''}`}
            >
              <p className={`text-[9px] font-serif uppercase tracking-[0.4em] mb-3 ${isToday ? 'text-[#435544]' : 'text-[#c3c8c0]'}`}>
                {DAYS_LABELS[i]}
              </p>
              <p className={`text-3xl font-serif leading-none ${
                isToday && !isPending
                  ? 'text-[#1a1c1b] relative'
                  : isOpen ? (isPending ? 'text-white' : 'text-[#1a1c1b]') : 'text-[#c3c8c0] opacity-40'
              }`}>
                {d.getDate()}
                {isToday && !isPending && (
                   <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#435544] rounded-none rotate-45" />
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
          <div className="border-r border-[#efeeec] relative bg-[#faf9f7]/20">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-6 text-[10px] font-serif text-[#c3c8c0] -translate-y-1/2 uppercase tracking-widest italic"
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
            const dayAppts = appointments.filter(a => a.date === dStr);

            return (
              <div key={dayIdx} className="border-r border-[#efeeec] relative">
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[#efeeec]/30"
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
                      className="absolute left-3 right-3 z-[2] bg-[#f4f3f1]/80 border border-[#efeeec] flex items-center justify-center cursor-pointer hover:bg-[#efeeec] transition-all duration-500"
                      style={{ top: getTop(t) + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
                    >
                      <Lock size={12} strokeWidth={1} className="text-[#c3c8c0]" />
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
  const isPaid = appt.paid;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-3 right-3 z-[3] p-6 cursor-pointer border transition-all duration-700 overflow-hidden group ${
        isPaid 
          ? 'bg-[#1a1c1b] border-[#1a1c1b] text-white shadow-2xl shadow-[#1a1c1b]/10' 
          : 'bg-white border-[#efeeec] text-[#1a1c1b] shadow-sm hover:border-[#435544]'
      } ${className}`}
      style={{ top: top + 6, height: Math.max(height - 12, 40) }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`text-[13px] font-serif leading-tight truncate group-hover:italic transition-all duration-500 ${isPaid ? 'text-white' : 'text-[#1a1c1b]'}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        {!isPaid && (
          <div className="w-1.5 h-1.5 rounded-none rotate-45 mt-1 shrink-0 bg-[#435544]" />
        )}
      </div>
      {height >= 70 && (
        <p className={`text-[8px] mt-3 truncate uppercase tracking-[0.2em] font-serif italic ${isPaid ? 'text-[#c3c8c0]' : 'text-[#725a38]'}`}>
          {appt.serviceName || 'Soin Architectural'}
        </p>
      )}
      {height >= 100 && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#efeeec]/20">
           <span className={`text-[9px] font-serif uppercase tracking-widest ${isPaid ? 'text-[#c3c8c0]' : 'text-[#c3c8c0]'}`}>{appt.time}</span>
           <span className={`text-[10px] font-serif italic ${isPaid ? 'text-white' : 'text-[#1a1c1b]'}`}>{appt.price || 150} <span className="text-[8px] tracking-tighter opacity-60">CHF</span></span>
        </div>
      )}
      {/* Decorative architectural line */}
      <div className="absolute top-0 right-0 w-12 h-px bg-[#435544]/20 -rotate-45 translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

/* ── Month view ── */
function MonthView({ cur, appointments, isDayOpen, absenceMode, pendingDates, togglePending, onToggleView }: MonthViewProps) {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }),
  }), [cur]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-[#efeeec] shrink-0 bg-[#faf9f7]/50">
        {DAYS_LABELS.map(d => (
          <div key={d} className="py-6 text-center border-r border-[#efeeec]">
            <span className="text-[9px] font-serif text-[#725a38] uppercase tracking-[0.4em] opacity-60">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 overflow-auto scrollbar-hide bg-[#efeeec]/20">
        {days.map((day, i) => {
          const dStr = fmt(day);
          const isOpen = isDayOpen(dStr);
          const isPend = pendingDates.has(dStr);
          const isToday = isSameDay(new Date(), day);
          const inMonth = isSameMonth(day, cur);
          const booked = appointments.filter(e => e.date === dStr).length;

          return (
            <div
              key={i}
              onClick={() => {
                if (!inMonth) return;
                absenceMode ? togglePending(dStr) : onToggleView('week');
              }}
              className={`border-r border-b border-[#efeeec] p-6 flex flex-col min-h-[140px] transition-all duration-700 relative group bg-white ${
                !inMonth ? 'opacity-10 cursor-default' : 'cursor-pointer hover:bg-[#faf9f7]'
              } ${isToday && inMonth ? 'bg-[#faf9f7]/80' : ''
              } ${!isOpen && inMonth ? 'bg-[#f4f3f1]/30' : ''
              } ${isPend ? 'bg-[#1a1c1b] text-white' : ''}`}
            >
              <span className={`text-base font-serif self-end transition-all duration-500 ${
                isToday && !isPend
                  ? 'text-[#435544] font-bold'
                  : inMonth ? (isPend ? 'text-white' : 'text-[#1a1c1b]') : 'text-[#c3c8c0]'
              }`}>
                {day.getDate()}
              </span>

              <div className="mt-auto">
                {inMonth && isOpen && booked > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex -space-x-px overflow-hidden">
                       {Array.from({ length: Math.min(booked, 5) }).map((_, idx) => (
                         <div key={idx} className={`w-1 h-3 border border-transparent ${isPend ? 'bg-white' : 'bg-[#435544]'}`} />
                       ))}
                    </div>
                    <span className={`text-[8px] font-serif uppercase tracking-[0.2em] italic ${isPend ? 'text-[#c3c8c0]' : 'text-[#725a38]'}`}>
                       {booked} Soin{booked > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {inMonth && !isOpen && (
                  <span className="text-[8px] font-serif text-[#c3c8c0] uppercase tracking-[0.4em] italic opacity-60">Repos</span>
                )}
              </div>
              {isToday && !isPend && (
                 <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-[#435544] rotate-45" />
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
      className={`absolute left-3 right-3 z-[2] border border-dashed transition-all duration-700 group flex items-center justify-center overflow-hidden ${
        isOver 
          ? 'border-[#1a1c1b] bg-[#faf9f7]' 
          : 'border-transparent bg-transparent hover:bg-[#faf9f7]/50 hover:border-[#efeeec]'
      }`}
      style={{ top: top + 6, height: getHeight(DEFAULT_DURATION) - 12 }}
    >
      <Plus size={18} strokeWidth={1} className={`transition-all duration-700 ${isOver ? 'text-[#1a1c1b] scale-110' : 'text-transparent group-hover:text-[#efeeec]'}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-[#faf9f7]/0 group-hover:to-[#faf9f7]/10 transition-colors" />
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

