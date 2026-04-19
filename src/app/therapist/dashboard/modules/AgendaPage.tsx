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

/* ── CONSTANTS ── */
const HOUR_H = 72;          // pixels per hour row
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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* ── HEADER ── */}
      <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
        {/* Left: view toggle */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex h-8 bg-slate-100 p-0.5 rounded-lg">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onToggleView(v)}
                className={`h-full px-3 flex items-center rounded-md text-xs font-medium transition-colors ${
                  view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onPeriod(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onPeriod(1)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <h2 className="text-sm font-semibold text-slate-900 capitalize truncate">
              {titleLabel}
            </h2>

            <button
              onClick={onToday}
              className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors hidden sm:block"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleView(view === 'month' ? 'week' : 'month')}
            className="sm:hidden h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 transition-colors"
          >
            {view === 'month' ? 'Sem.' : 'Mois'}
          </button>

          <button
            onClick={absenceMode ? handleSaveAbsences : () => { setAbsenceMode(true); setBlockMode(false); }}
            className={`h-8 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium border transition-colors ${
              absenceMode
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
            }`}
          >
            {absenceMode ? <CheckCircle2 size={13} /> : <Ban size={13} />}
            <span className="hidden sm:inline">{absenceMode ? `Valider (${pendingDates.size})` : 'Absences'}</span>
          </button>

          <button
            onClick={onOpenWeeklySettings}
            className="h-8 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Settings size={13} />
            <span className="hidden sm:inline">Créneaux</span>
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
          onToggleView={onToggleView}
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
                onToggleDay={onToggleDay}
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
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════════ */
function AgendaSidebar({
  cur, appointments, view, onToggleView,
}: {
  cur: Date;
  appointments: Appointment[];
  view: string;
  onToggleView: (v: 'month' | 'week') => void;
}) {
  const todayStr = fmt(new Date());
  const todayAppts = useMemo(
    () => appointments.filter(a => a.date === todayStr).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-slate-200 bg-white shrink-0">
      {/* Today summary */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Aujourd'hui</h3>
        <p className="text-2xl font-semibold text-slate-900">{todayAppts.length}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          session{todayAppts.length !== 1 ? 's' : ''} prévue{todayAppts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Upcoming today */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-3">
          Prochaines séances
        </h3>
        {todayAppts.length > 0 ? (
          <div className="space-y-2">
            {todayAppts.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center gap-2.5 py-1.5">
                <span className="text-xs font-medium text-slate-500 w-10 shrink-0">{a.time}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {a.clientNameSnapshot || a.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {a.serviceName || 'Session'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Aucune session</p>
        )}
      </div>

      {/* Revenue */}
      <div className="p-4 border-t border-slate-100">
        <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Revenus du jour</h3>
        <p className="text-lg font-semibold text-slate-900">
          {todayAppts.reduce((s, a) => s + (a.price || 150), 0)} CHF
        </p>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════
   WEEK TIME GRID (Calendly / Cron style)
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
  onToggleDay: (d: string) => void;
}

function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode, blockMode,
  pendingDates, togglePending, onMoveAppt, onToggleDay,
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
      {/* Header Row */}
      <div className="flex border-b border-slate-200">
        <div className="w-16 border-r border-slate-200" />
        {days.map(d => {
          const dStr = fmt(d);
          const isToday = dStr === fmt(new Date());
          const open = isDayOpen(dStr);
          const dayAppts = appointments.filter(a => a.date === dStr);
          const slotsCount = (configSlots[isoDay(d)] || []).length;
          const occupancy = slotsCount > 0 ? Math.round((dayAppts.length / slotsCount) * 100) : 0;

          return (
            <div key={dStr} className="flex-1 min-w-0 border-r border-slate-100 last:border-r-0 py-3 relative">
              <div className={`mx-auto w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-900 group-hover:bg-slate-50'}`}>
                <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">{DAYS_LABELS[isoDay(d)]}</span>
                <span className="text-[15px] font-bold leading-none">{format(d, 'd')}</span>
              </div>
              {open && slotsCount > 0 && (
                <div className="mt-2 px-4">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${occupancy > 80 ? 'bg-rose-500' : occupancy > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${occupancy}%` }} 
                    />
                  </div>
                </div>
              )}
              {onToggleDay && (
                <button 
                  onClick={() => onToggleDay(dStr)}
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${open ? 'text-slate-200 hover:text-emerald-500' : 'text-rose-500 bg-rose-50'}`}
                  title={open ? "Fermer la journée" : "Ouvrir la journée"}
                >
                  <CheckCircle2 size={12} fill={open ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-auto">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div
            className="grid relative"
            style={{ gridTemplateColumns: '56px repeat(7, 1fr)', height: gridHeight }}
          >
            {/* Time labels column */}
          <div className="border-r border-slate-100 relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-0 pr-2 text-[10px] font-medium text-slate-400 -translate-y-1/2"
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
              <div key={dayIdx} className="border-r border-slate-100 relative">
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-slate-100"
                    style={{ top: (h - START_HOUR) * HOUR_H }}
                  />
                ))}
                {/* Half-hour lines */}
                {HOURS.map(h => (
                  <div
                    key={`${h}-half`}
                    className="absolute left-0 right-0 border-t border-slate-50"
                    style={{ top: (h - START_HOUR) * HOUR_H + HOUR_H / 2 }}
                  />
                ))}

                {/* Closed day overlay */}
                {!isOpen && (
                  <div className="absolute inset-0 bg-slate-50/80 z-[1] flex items-center justify-center">
                    <Lock size={20} className="text-slate-300" />
                  </div>
                )}

                {/* Slots rendering */}
                {isOpen && daySlots.map(t => {
                  const [h, m] = t.split(':').map(Number);
                  const slotMinutes = h * 60 + m;
                  const isBusy = dayAppts.some(a => {
                    const [ah, am] = (a.time || '00:00').split(':').map(Number);
                    const startMin = ah * 60 + am;
                    const duration = parseInt(a.duration || '60');
                    const endMin = startMin + duration;
                    return slotMinutes >= startMin && slotMinutes < endMin;
                  });
                  const blocked = isSlotBlocked(dStr, t);
                  if (isBusy) return null;

                  return (
                    <div 
                      key={`${dStr}-${t}`} 
                      className={`absolute left-0 right-0 group transition-all ${blocked ? 'bg-slate-50/80 z-10' : ''}`}
                      style={{ top: getTop(t), height: HOUR_H }}
                    >
                      <div className={`absolute inset-x-1.5 inset-y-1 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${
                        blocked 
                          ? 'border-slate-200 bg-white/40' 
                          : 'border-transparent hover:border-slate-100 hover:bg-slate-50/50'
                      }`}>
                        {!blocked && !absenceMode && (
                          <>
                            <button 
                              onClick={() => onOpenSlot(dStr, t)}
                              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                              title="Nouvelle séance"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => toggleSlot(dStr, t)}
                              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                              title="Bloquer le créneau"
                            >
                              <Ban size={14} />
                            </button>
                          </>
                        )}
                        {blocked && (
                          <div className="flex flex-col items-center gap-1">
                            <Lock size={14} className="text-slate-300" />
                            <button 
                              onClick={() => toggleSlot(dStr, t)}
                              className="text-[9px] font-bold text-indigo-500 hover:underline hover:text-indigo-700"
                            >
                              DÉBLOQUER
                            </button>
                          </div>
                        )}
                      </div>
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
function getServiceColor(serviceName?: string) {
  const colors: Record<string, { bg: string; border: string; text: string; muted: string }> = {
    'Relaxation': { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', text: 'text-blue-900', muted: 'text-blue-600' },
    'Deep Tissue': { bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-900', muted: 'text-indigo-600' },
    'Deep tissue': { bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-900', muted: 'text-indigo-600' },
    'Sports massage': { bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900', muted: 'text-emerald-600' },
    'Sports': { bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900', muted: 'text-emerald-600' },
    'Therapeutic': { bg: 'bg-teal-50 hover:bg-teal-100', border: 'border-teal-200', text: 'text-teal-900', muted: 'text-teal-600' },
    'Hot stone': { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', text: 'text-amber-900', muted: 'text-amber-600' },
    'Hot Stone': { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', text: 'text-amber-900', muted: 'text-amber-600' },
    'Pregnancy': { bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200', text: 'text-rose-900', muted: 'text-rose-600' },
    'Lymphatic': { bg: 'bg-cyan-50 hover:bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-900', muted: 'text-cyan-600' },
    'Cranial': { bg: 'bg-violet-50 hover:bg-violet-100', border: 'border-violet-200', text: 'text-violet-900', muted: 'text-violet-600' },
  };
  return colors[serviceName || ''] || { bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900', muted: 'text-emerald-600' };
}

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
  const c = getServiceColor(appt.serviceName);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-1 right-1 z-[3] rounded-md px-2.5 py-1.5 cursor-pointer border transition-all hover:shadow-md overflow-hidden ${c.bg} ${c.border} ${className}`}
      style={{ top, height: Math.max(height, 28) }}
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-medium leading-tight truncate ${c.text}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        {!isPaid && (
          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${c.muted} bg-current opacity-70`} title="Paiement en attente" />
        )}
      </div>
      {height >= 48 && (
        <p className={`text-[10px] mt-0.5 truncate ${c.muted}`}>
          {appt.serviceName || 'Session'}
        </p>
      )}
      {height >= 64 && (
        <p className={`text-[10px] mt-0.5 ${c.muted} opacity-80`}>
          {appt.time} · {appt.price || 150} CHF
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MONTH VIEW
   ══════════════════════════════════════════════════ */
interface MonthViewProps {
  cur: Date;
  appointments: Appointment[];
  isDayOpen: (d: string) => boolean;
  absenceMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onToggleView: (v: 'month' | 'week') => void;
}

function MonthView({ cur, appointments, isDayOpen, absenceMode, pendingDates, togglePending, onToggleView }: MonthViewProps) {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }),
  }), [cur]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
        {DAYS_LABELS.map(d => (
          <div key={d} className="py-2.5 text-center border-r border-slate-100">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 overflow-auto">
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
              className={`border-r border-b border-slate-100 p-2 flex flex-col min-h-[90px] transition-colors relative ${
                !inMonth ? 'opacity-25 cursor-default' : 'cursor-pointer hover:bg-slate-50'
              } ${isToday && inMonth ? 'bg-indigo-50/30' : ''
              } ${!isOpen && inMonth ? 'bg-slate-50' : ''
              } ${isPend ? 'bg-rose-50' : ''}`}
            >
              {isPend && <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />}

              <span className={`text-xs font-medium self-end ${
                isToday
                  ? 'text-white bg-emerald-600 w-6 h-6 rounded-full flex items-center justify-center'
                  : inMonth ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {day.getDate()}
              </span>

              {inMonth && isOpen && booked > 0 && (
                <div className="mt-auto flex flex-wrap gap-0.5 justify-end">
                  {Array.from({ length: Math.min(booked, 3) }).map((_, idx) => (
                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ))}
                  {booked > 3 && <span className="text-[8px] font-medium text-emerald-400">+{booked - 3}</span>}
                </div>
              )}
              {inMonth && !isOpen && (
                <span className="mt-auto text-[8px] font-medium text-slate-300 italic self-end">Fermé</span>
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
      className={`absolute left-1 right-1 z-[2] rounded-md border border-dashed transition-colors group flex items-center justify-center ${isOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-300'}`}
      style={{ top, height: getHeight(DEFAULT_DURATION) }}
    >
      <Plus size={14} className={`transition-colors ${isOver ? 'text-emerald-500' : 'text-slate-300 group-hover:text-emerald-500'}`} />
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
      <AppointmentBlock appt={appt} top={top} height={height} onSelect={onSelect} className={`${isDragging ? 'pointer-events-none' : ''} ${!disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`} />
    </div>
  );
}
