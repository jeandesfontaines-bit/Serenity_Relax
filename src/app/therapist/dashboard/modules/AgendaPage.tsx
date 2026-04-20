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
function parseDuration(d?: string | number): number {
  if (!d) return DEFAULT_DURATION;
  const n = typeof d === 'string' ? parseInt(d) : d;
  return isNaN(n) ? DEFAULT_DURATION : n;
}

function getServiceColor(serviceName?: string) {
  // Mineral categories
  const colors: Record<string, { bg: string; border: string; text: string; muted: string }> = {
    'Relaxation': { bg: 'bg-slate-50 hover:bg-slate-100', border: 'border-slate-200', text: 'text-slate-900', muted: 'text-slate-600' },
    'Storm': { bg: 'bg-slate-900/5 hover:bg-slate-900/10', border: 'border-slate-900/10', text: 'text-slate-900', muted: 'text-slate-700' },
    'Sand': { bg: 'bg-[#D7C9B5]/10 hover:bg-[#D7C9B5]/20', border: 'border-[#D7C9B5]/30', text: 'text-[#3C4247]', muted: 'text-[#576574]' },
  };
  // Default to a professional Slate
  return { bg: 'bg-slate-50 hover:bg-slate-100', border: 'border-slate-200', text: 'text-slate-900', muted: 'text-slate-600' };
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

export default function AgendaPage({
  view, cur, onPeriod, onToday, onToggleView,
  onSelectAppt, onOpenSlot, appointments,
  configSlots, isDayOpen, isSlotBlocked, toggleSlot, onToggleDay,
  blockMode, setBlockMode, absenceMode, setAbsenceMode,
  onOpenWeeklySettings, onMoveAppt,
}: AgendaPageProps) {
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());

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
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* ── HEADER (Google Style) ── */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onToday}
            className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            Aujourd'hui
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <button onClick={() => onPeriod(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-all"><ChevronLeft size={20} /></button>
              <button onClick={() => onPeriod(1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-all"><ChevronRight size={20} /></button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight ml-2 first-letter:uppercase">{titleLabel}</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onToggleView(v)}
                className={`h-8 px-4 flex items-center rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          
          <button
            onClick={absenceMode ? handleSaveAbsences : () => { setAbsenceMode(true); setBlockMode(false); }}
            className={`h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest border transition-all ${absenceMode ? 'bg-[#3C4247] border-[#3C4247] text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {absenceMode ? <CheckCircle2 size={14} /> : <Ban size={14} />}
            <span className="hidden sm:inline">{absenceMode ? `Valider (${pendingDates.size})` : 'Absences'}</span>
          </button>

          <button onClick={onOpenWeeklySettings} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-all"><Settings size={18} /></button>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">
        <AgendaSidebar
          cur={cur}
          appointments={appointments}
          view={view}
          onToggleView={onToggleView}
          onSelectAppt={onSelectAppt}
        />

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

/* ── SIDEBAR ── */
function AgendaSidebar({ cur, appointments, view, onToggleView, onSelectAppt }: any) {
  const todayStr = fmt(new Date());
  const todayAppts = useMemo(
    () => appointments.filter((a: any) => a.date === todayStr && a.status !== 'cancelled').sort((a: any, b: any) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-slate-50 border-r border-slate-200 shrink-0">
      <div className="p-6 border-b border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Aujourd'hui</h3>
        <p className="text-3xl font-black text-slate-900 leading-tight">{todayAppts.length}</p>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">sessions prévues</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">À venir</h3>
          {todayAppts.length > 0 ? (
            <div className="space-y-1">
              {todayAppts.slice(0, 10).map((a: any) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAppt(a)}
                  className="w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all hover:bg-white hover:shadow-sm hover:border-slate-200 border border-transparent group active:scale-[0.98]"
                >
                  <div className="text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 py-1 rounded-lg w-10 shrink-0 text-center group-hover:bg-slate-900 group-hover:text-white transition-colors">{a.time}</div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover:text-slate-900">{a.clientNameSnapshot || a.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-tight">{a.serviceName || 'Session'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-[10px] text-slate-400 font-black uppercase">Libre</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-slate-200 bg-white">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total prévu</h3>
        <p className="text-xl font-black text-slate-900 flex items-baseline gap-1">
          {todayAppts.reduce((s: number, a: any) => s + (a.price || 150), 0)}
          <span className="text-[10px] text-slate-400">CHF</span>
        </p>
      </div>
    </aside>
  );
}

/* ── WEEK VIEW ── */
function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode, blockMode,
  pendingDates, togglePending, onMoveAppt, onToggleDay,
}: any) {
  const days = useMemo(() => {
    const s = wkStart(new Date(cur));
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cur]);

  const gridHeight = HOURS.length * HOUR_H;
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeAppt = useMemo(() => activeId ? appointments.find((a: any) => a.id === activeId) : null, [activeId, appointments]);

  const handleDragStart = (event: any) => setActiveId(event.active.id);
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
      <div className="flex border-b border-slate-200">
        <div className="w-14 border-r border-slate-200" />
        {days.map(d => {
          const dStr = fmt(d);
          const isToday = dStr === fmt(new Date());
          const open = isDayOpen(dStr);
          const dayAppts = appointments.filter((a: any) => a.date === dStr && a.status !== 'cancelled');
          const slotsCount = (configSlots[isoDay(d)] || []).length;
          const occupancy = slotsCount > 0 ? Math.round((dayAppts.length / slotsCount) * 100) : 0;

          return (
            <div key={dStr} className="flex-1 min-w-0 border-r border-slate-100 last:border-r-0 py-3 relative">
              <div className={`mx-auto w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all ${isToday ? 'bg-slate-900 text-white shadow-md' : 'text-slate-900'}`}>
                <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">{DAYS_LABELS[isoDay(d)]}</span>
                <span className="text-[15px] font-bold leading-none">{format(d, 'd')}</span>
              </div>
              {open && slotsCount > 0 && (
                <div className="mt-2 px-4">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${occupancy > 80 ? 'bg-slate-900' : occupancy > 40 ? 'bg-slate-500' : 'bg-slate-300'}`} 
                      style={{ width: `${occupancy}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div className="grid relative" style={{ gridTemplateColumns: '56px repeat(7, 1fr)', height: gridHeight }}>
            <div className="border-r border-slate-100 relative">
              {HOURS.map(h => (
                <div key={h} className="absolute right-0 pr-2 text-[10px] font-medium text-slate-400 -translate-y-1/2" style={{ top: (h - START_HOUR) * HOUR_H }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {days.map((d, dayIdx) => {
              const dStr = fmt(d);
              const isOpen = isDayOpen(dStr);
              const daySlots = [...(configSlots[isoDay(d)] || [])].sort();
              const dayAppts = appointments.filter((a: any) => a.date === dStr);

              return (
                <div key={dayIdx} className="border-r border-slate-100 relative">
                  {HOURS.map(h => <div key={h} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: (h - START_HOUR) * HOUR_H }} />)}
                  {!isOpen && <div className="absolute inset-0 bg-slate-50/80 z-[1] flex items-center justify-center"><Lock size={20} className="text-slate-300" /></div>}
                  
                  {isOpen && daySlots.map(t => {
                    const isBlocked = isSlotBlocked(dStr, t);
                    const isPending = pendingDates.has(dStr);
                    const isBusy = dayAppts.some((a: any) => a.time === t && a.status !== 'cancelled');
                    if (isBusy) return null;

                    return (
                      <div
                        key={t}
                        onClick={() => absenceMode ? togglePending(dStr) : (blockMode ? toggleSlot(dStr, t) : onOpenSlot(dStr, t))}
                        className={`absolute left-0 right-0 z-[2] cursor-pointer transition-all border-l-2 ${isBlocked ? 'bg-slate-100/50 border-slate-300' : (isPending ? 'bg-slate-900/10 border-slate-900 animate-pulse' : 'hover:bg-slate-50/50 border-transparent hover:border-slate-200')}`}
                        style={{ top: getTop(t), height: HOUR_H }}
                      >
                        <div className="p-1">
                           <div className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-slate-400' : (isPending ? 'bg-slate-900' : 'bg-slate-200 opacity-0 group-hover:opacity-100')}`} />
                        </div>
                      </div>
                    );
                  })}

                  {isOpen && dayAppts.map((appt: any) => {
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
                  <DroppableColumn id={dStr} />
                </div>
              );
            })}
            
            <DragOverlay zIndex={100} dropAnimation={null}>
              {activeAppt ? <div className="p-3 bg-white border-2 border-indigo-500 rounded-xl shadow-2xl scale-[1.02] opacity-90 font-bold text-xs pointer-events-none">{activeAppt.clientNameSnapshot}</div> : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </div>
  );
}

function DroppableColumn({ id }: any) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="absolute inset-0" />;
}

function DraggableAppointmentBlock({ appt, top, height, onSelect, isDragging, disabled }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appt.id,
    disabled: disabled || appt.status === 'cancelled',
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={isDragging ? 'opacity-0' : ''}>
      <AppointmentBlock appt={appt} top={top} height={height} onSelect={onSelect} />
    </div>
  );
}

function AppointmentBlock({ appt, top, height, onSelect }: any) {
  const isCancelled = appt.status === 'cancelled';
  const c = getServiceColor(appt.serviceName);
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute left-1 right-1 z-[3] rounded-md px-2.5 py-1.5 cursor-pointer border transition-all hover:shadow-md overflow-hidden ${isCancelled ? 'bg-slate-100 border-slate-200 grayscale opacity-80' : `${c.bg} ${c.border}`}`}
      style={{ top, height: Math.max(height, 28) }}
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-bold leading-tight truncate ${isCancelled ? 'text-slate-400' : c.text}`}>{appt.clientNameSnapshot || appt.title}</p>
        {!appt.paid && !isCancelled && <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${c.muted} bg-current opacity-70`} />}
      </div>
      {height >= 48 && <p className={`text-[10px] mt-0.5 truncate font-medium ${isCancelled ? 'text-slate-400' : c.muted}`}>{appt.serviceName || 'Session'}{isCancelled && ' (ANNULÉE)'}</p>}
    </div>
  );
}

/* ── MONTH VIEW ── */
function MonthView({ cur, appointments, isDayOpen, absenceMode, pendingDates, togglePending, onToggleView }: any) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cur), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cur), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cur]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAYS_LABELS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-auto no-scrollbar">
        {days.map((d, i) => {
          const dStr = fmt(d);
          const sameMonth = isSameMonth(d, cur);
          const dayAppts = appointments.filter((a: any) => a.date === dStr && a.status !== 'cancelled');
          const isToday = isSameDay(d, new Date());
          const open = isDayOpen(dStr);
          const pending = pendingDates.has(dStr);

          return (
            <div
              key={i}
              onClick={() => absenceMode ? togglePending(dStr) : (onToggleView('week'))}
              className={`min-h-[120px] p-2 border-r border-b border-slate-100 relative transition-all ${!sameMonth ? 'bg-slate-50/30' : 'bg-white'} ${!open ? 'bg-rose-50/10' : ''} ${pending ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[13px] font-black w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-slate-900 text-white shadow-md' : (sameMonth ? 'text-slate-900' : 'text-slate-300')}`}>{format(d, 'd')}</span>
                {!open && sameMonth && <div className="text-[9px] font-black text-rose-500 uppercase">OFF</div>}
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayAppts.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white truncate shadow-sm">{a.time} {a.clientNameSnapshot}</div>
                ))}
                {dayAppts.length > 4 && <div className="text-[9px] font-black text-slate-400 pl-1">+{dayAppts.length - 4} plus</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
