import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Ban, Lock, CheckCircle2,
  Clock, Settings, Calendar as CalendarIcon,
} from 'lucide-react';
import {
  format, isSameDay, isSameMonth, addDays,
  startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
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
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function AgendaPage({
  view, cur, onPeriod, onToday, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, toggleSlot, onToggleDay,
  blockMode, setBlockMode, absenceMode, setAbsenceMode,
  onOpenWeeklySettings,
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
        {/* Left: navigation */}
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

        {/* Center: view toggle */}
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
                onSelectAppt={onSelectAppt}
                onOpenSlot={onOpenSlot}
                absenceMode={absenceMode}
                blockMode={blockMode}
                pendingDates={pendingDates}
                togglePending={togglePending}
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
}

function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode, blockMode,
  pendingDates, togglePending,
}: WeekTimeGridProps) {
  const days = useMemo(() => {
    const s = wkStart(new Date(cur));
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cur]);

  const gridHeight = HOURS.length * HOUR_H;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Day column headers */}
      <div className="grid shrink-0 border-b border-slate-200" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        {/* Empty corner */}
        <div className="border-r border-slate-100" />
        {days.map((d, i) => {
          const dStr = fmt(d);
          const isToday = isSameDay(new Date(), d);
          const isOpen = isDayOpen(dStr);
          const isPending = pendingDates.has(dStr);
          return (
            <div
              key={i}
              onClick={() => absenceMode && togglePending(dStr)}
              className={`py-3 text-center border-r border-slate-100 transition-colors ${
                absenceMode ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${isPending ? 'bg-rose-50' : !isOpen ? 'bg-slate-50' : ''}`}
            >
              <p className={`text-[10px] font-medium uppercase tracking-wider ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                {DAYS_LABELS[i]}
              </p>
              <p className={`text-lg font-semibold mt-0.5 leading-none ${
                isToday
                  ? 'text-white bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto'
                  : isOpen ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {d.getDate()}
              </p>
              {isPending && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mx-auto mt-1" />}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-auto">
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

                {/* Available slot markers (empty slots) */}
                {isOpen && daySlots.map(t => {
                  const hasAppt = dayAppts.some(a => a.time === t);
                  const blocked = isSlotBlocked(dStr, t);
                  if (hasAppt || blocked) return null;

                  const top = getTop(t);
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        if (absenceMode) return;
                        if (blockMode) { toggleSlot(dStr, t); return; }
                        onOpenSlot(dStr, t);
                      }}
                      className="absolute left-1 right-1 z-[2] rounded-md border border-dashed border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group flex items-center justify-center"
                      style={{ top, height: getHeight(DEFAULT_DURATION) }}
                    >
                      <Plus size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
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
                      className="absolute left-1 right-1 z-[2] rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                      style={{ top: getTop(t), height: getHeight(DEFAULT_DURATION) }}
                    >
                      <Lock size={12} className="text-slate-400" />
                    </div>
                  );
                })}

                {/* Appointment blocks */}
                {isOpen && dayAppts.map(appt => {
                  if (!appt.time) return null;
                  const top = getTop(appt.time);
                  const height = getHeight(parseDuration(appt.duration));
                  return (
                    <AppointmentBlock
                      key={appt.id}
                      appt={appt}
                      top={top}
                      height={height}
                      onSelect={onSelectAppt}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
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
  appt, top, height, onSelect,
}: {
  appt: Appointment;
  top: number;
  height: number;
  onSelect: (a: Appointment) => void;
}) {
  const isPaid = appt.paid;
  const c = getServiceColor(appt.serviceName);

  return (
    <div
      onClick={() => onSelect(appt)}
      className={`absolute left-1 right-1 z-[3] rounded-md px-2.5 py-1.5 cursor-pointer border transition-all hover:shadow-md overflow-hidden ${c.bg} ${c.border}`}
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
