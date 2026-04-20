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
    'Relaxation': { bg: 'bg-bg-soft hover:bg-bg-soft/80', border: 'border-border', text: 'text-sapphire', muted: 'text-samaritan' },
    'Storm': { bg: 'bg-azraq/5 hover:bg-azraq/10', border: 'border-azraq/10', text: 'text-azraq', muted: 'text-azraq/70' },
    'Sand': { bg: 'bg-carrot/10 hover:bg-carrot/20', border: 'border-carrot/30', text: 'text-carrot', muted: 'text-carrot/70' },
  };
  // Default to a professional Sapphire
  return { bg: 'bg-white hover:bg-bg-soft', border: 'border-border', text: 'text-sapphire', muted: 'text-samaritan' };
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
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-soft text-forest">
      {/* ── HEADER (Premium Style) ── */}
      <header className="h-xl border-b border-border bg-white px-m sm:px-xl flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-m">
          <button
            onClick={onToday}
            className="h-l px-m border border-border rounded-md font-heading text-[10px] font-black uppercase tracking-widest text-azraq hover:bg-bg-soft transition-all active:scale-95"
          >
            Aujourd'hui
          </button>

          <div className="flex items-center gap-xs">
            <div className="flex items-center">
              <button onClick={() => onPeriod(-1)} className="w-l h-l flex items-center justify-center rounded-md hover:bg-bg-soft text-azraq transition-all"><ChevronLeft size={20} /></button>
              <button onClick={() => onPeriod(1)} className="w-l h-l flex items-center justify-center rounded-md hover:bg-bg-soft text-azraq transition-all"><ChevronRight size={20} /></button>
            </div>
            <h2 className="font-heading text-h4 font-black text-sapphire tracking-heading ml-s uppercase">{titleLabel}</h2>
          </div>
        </div>

        <div className="flex items-center gap-m">
          <div className="hidden sm:flex bg-bg-soft p-xxs rounded-md">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onToggleView(v)}
                className={`h-l px-m flex items-center rounded-md font-heading text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-azraq shadow-sm' : 'text-samaritan hover:text-azraq'}`}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          
          <button
            onClick={absenceMode ? handleSaveAbsences : () => { setAbsenceMode(true); setBlockMode(false); }}
            className={`h-l px-m rounded-md flex items-center gap-xs font-heading text-[10px] font-black uppercase tracking-widest border transition-all ${absenceMode ? 'bg-azraq border-azraq text-white shadow-lg shadow-azraq/10' : 'bg-white border-border text-azraq hover:bg-bg-soft'}`}
          >
            {absenceMode ? <CheckCircle2 size={14} /> : <Ban size={14} />}
            <span className="hidden sm:inline">{absenceMode ? `Valider (${pendingDates.size})` : 'Absences'}</span>
          </button>

          <button onClick={onOpenWeeklySettings} className="w-l h-l flex items-center justify-center rounded-md hover:bg-bg-soft text-azraq transition-all"><Settings size={18} /></button>
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
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-border shrink-0">
      <div className="p-xl border-b border-border bg-bg-soft">
        <h3 className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest mb-xxs">Aujourd'hui</h3>
        <p className="font-heading text-h1 font-black text-sapphire leading-none uppercase tracking-heading">{todayAppts.length}</p>
        <p className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest mt-xxs">sessions prévues</p>
      </div>

      <div className="flex-1 overflow-y-auto p-m space-y-m">
        <div>
          <h3 className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest mb-m px-xxs">À venir</h3>
          {todayAppts.length > 0 ? (
            <div className="space-y-xxs">
              {todayAppts.slice(0, 10).map((a: any) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAppt(a)}
                  className="w-full flex items-start gap-xs p-xs rounded-md text-left transition-all hover:bg-bg-soft hover:shadow-sm border border-transparent group active:scale-[0.98]"
                >
                  <div className="font-heading text-[10px] font-black text-azraq bg-white px-xs py-[3px] rounded-md border border-border w-10 shrink-0 text-center group-hover:bg-azraq group-hover:text-white group-hover:border-azraq transition-all">{a.time}</div>
                  <div className="min-w-0">
                    <p className="font-heading text-small font-black text-sapphire truncate leading-tight uppercase tracking-widest">{a.clientNameSnapshot || a.title}</p>
                    <p className="font-heading text-[9px] font-black text-samaritan truncate uppercase mt-xxs tracking-widest">{a.serviceName || 'Session'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-xl text-center rounded-md border-2 border-dashed border-border">
              <p className="font-heading text-[9px] text-samaritan font-black uppercase tracking-widest">Agenda Libre</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-xl border-t border-border bg-white">
        <h3 className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest mb-xxs">Total prévu</h3>
        <p className="font-heading text-h3 font-black text-sapphire flex items-baseline gap-xxs uppercase tracking-heading">
          {todayAppts.reduce((s: number, a: any) => s + (a.price || 150), 0)}
          <span className="text-small text-samaritan opacity-40 uppercase">CHF</span>
        </p>
      </div>
    </aside>
  );
}

/* ── WEEK VIEW ── */
function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode, blockMode,
  pendingDates, togglePending, onMoveAppt,
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
      const parts = String(over.id).split('|');
      if (parts.length === 2) {
        onMoveAppt(String(active.id), parts[0], parts[1]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-soft">
      <div className="flex border-b border-border bg-white">
        <div className="w-14 border-r border-border" />
        {days.map(d => {
          const dStr = fmt(d);
          const isToday = dStr === fmt(new Date());
          const open = isDayOpen(dStr);
          const dayAppts = appointments.filter((a: any) => a.date === dStr && a.status !== 'cancelled');
          const slotsCount = (configSlots[isoDay(d)] || []).length;
          const occupancy = slotsCount > 0 ? Math.round((dayAppts.length / slotsCount) * 100) : 0;

          return (
            <div key={dStr} className="flex-1 min-w-0 border-r border-border last:border-r-0 py-m relative">
              <div className={`mx-auto w-xl h-xl rounded-md flex flex-col items-center justify-center transition-all ${isToday ? 'bg-azraq text-white shadow-lg shadow-azraq/10' : 'text-sapphire'}`}>
                <span className="font-heading text-[8px] font-black uppercase tracking-widest opacity-40">{DAYS_LABELS[isoDay(d)]}</span>
                <span className="font-heading text-small font-black leading-none uppercase tracking-widest">{format(d, 'd')}</span>
              </div>
              {open && slotsCount > 0 && (
                <div className="mt-s px-m">
                  <div className="h-xxs bg-bg-soft rounded-full overflow-hidden">
                    <div 
                       className={`h-full transition-all duration-500 rounded-full ${occupancy > 80 ? 'bg-azraq' : occupancy > 40 ? 'bg-samaritan' : 'bg-border'}`} 
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
            <div className="border-r border-border relative bg-white">
              {HOURS.map(h => (
                <div key={h} className="absolute right-0 pr-xxs font-heading text-[9px] font-black text-samaritan/30 uppercase tracking-widest -translate-y-1/2" style={{ top: (h - START_HOUR) * HOUR_H }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {days.map((d, dayIdx) => {
              const dStr = fmt(d);
              const isOpen = isDayOpen(dStr);
              const dayAppts = appointments.filter((a: any) => a.date === dStr);

              return (
                <div key={dayIdx} className="border-r border-border relative">
                  {HOURS.map(h => (
                     <React.Fragment key={h}>
                        <div className="absolute left-0 right-0 border-t border-border/50" style={{ top: (h - START_HOUR) * HOUR_H }} />
                        {/* 30min slots for dropping */}
                        <div className="absolute left-0 right-0" style={{ top: (h - START_HOUR) * HOUR_H, height: HOUR_H }}>
                           <DroppableSlot id={`${dStr}|${String(h).padStart(2, '0')}:00`} top={0} />
                           <DroppableSlot id={`${dStr}|${String(h).padStart(2, '0')}:30`} top={HOUR_H/2} />
                        </div>
                     </React.Fragment>
                  ))}
                  
                  {!isOpen && <div className="absolute inset-0 bg-bg-soft/80 z-[1] flex items-center justify-center backdrop-blur-[2px]"><Lock size={20} className="text-samaritan/20" /></div>}
                  
                  {isOpen && (configSlots[isoDay(d)] || []).map((t: string) => {
                    const isBlocked = isSlotBlocked(dStr, t);
                    const isPending = pendingDates.has(dStr);
                    const isBusy = dayAppts.some((a: any) => a.time === t && a.status !== 'cancelled');
                    if (isBusy) return null;

                    return (
                      <div
                        key={t}
                        onClick={() => absenceMode ? togglePending(dStr) : (blockMode ? toggleSlot(dStr, t) : onOpenSlot(dStr, t))}
                        className={`absolute left-0 right-0 z-[2] cursor-pointer transition-all border-l-2 ${isBlocked ? 'bg-tomato/5 border-tomato' : (isPending ? 'bg-azraq/5 border-azraq animate-pulse' : 'hover:bg-bg-soft border-transparent hover:border-border')}`}
                        style={{ top: getTop(t), height: HOUR_H }}
                      >
                        <div className="p-xxs">
                           <div className={`w-1 h-1 rounded-full ${isBlocked ? 'bg-tomato' : (isPending ? 'bg-azraq' : 'bg-border')}`} />
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
                        disabled={absenceMode}
                      />
                    );
                  })}
                </div>
              );
            })}
            
            <DragOverlay zIndex={100} dropAnimation={null}>
              {activeAppt ? (
                <div className="w-full max-w-[180px] p-s bg-white border border-azraq rounded-md shadow-2xl flex flex-col font-heading animate-in fade-in zoom-in-95 duration-200">
                   <p className="text-[10px] font-black text-azraq uppercase tracking-widest truncate">{activeAppt.clientNameSnapshot}</p>
                   <p className="text-[8px] font-black text-samaritan uppercase tracking-widest mt-xxs">{activeAppt.serviceName}</p>
                </div>
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </div>
  );
}

function DroppableSlot({ id, top }: { id: string; top: number }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`absolute left-0 right-0 z-[1] transition-colors ${isOver ? 'bg-azraq/5 ring-1 ring-inset ring-azraq/10' : ''}`} 
      style={{ top, height: HOUR_H/2 }} 
    />
  );
}

function DraggableAppointmentBlock({ appt, top, height, onSelect, isDragging, disabled }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appt.id,
    disabled: disabled || appt.status === 'cancelled',
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`z-[10] relative ${isDragging ? 'opacity-0' : ''}`}>
      <AppointmentBlock appt={appt} top={top} height={height} onSelect={onSelect} />
    </div>
  );
}

function AppointmentBlock({ appt, top, height, onSelect }: any) {
  const isCancelled = appt.status === 'cancelled';
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute left-xxs right-xxs z-[3] rounded-md px-s py-xs cursor-pointer border shadow-sm transition-all hover:shadow-md overflow-hidden ${isCancelled ? 'bg-bg-soft border-border grayscale opacity-50' : `bg-white border-border hover:border-azraq`}`}
      style={{ top, height: Math.max(height, 28) }}
    >
      <div className="flex items-start justify-between gap-xxs">
        <p className={`font-heading text-[10px] font-black leading-tight truncate uppercase tracking-widest ${isCancelled ? 'text-samaritan' : 'text-sapphire'}`}>{appt.clientNameSnapshot || appt.title}</p>
        {!appt.paid && !isCancelled && <div className={`w-1.5 h-1.5 rounded-full mt-px shrink-0 bg-tomato shadow-sm shadow-tomato/20`} />}
      </div>
      {height >= 48 && <p className={`font-heading text-[9px] font-bold mt-xxs truncate uppercase tracking-widest ${isCancelled ? 'text-samaritan/50' : 'text-samaritan'}`}>{appt.serviceName || 'Session'}</p>}
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
    <div className="flex-1 flex flex-col bg-bg-soft">
      <div className="grid grid-cols-7 border-b border-border bg-white">
        {DAYS_LABELS.map(d => (
          <div key={d} className="py-m text-center font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="calendar-grid flex-1">
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
              className={`day-cell ${!sameMonth ? 'bg-bg-soft/50' : ''} ${!open ? 'blocked-date' : ''} ${pending ? 'bg-azraq/10' : ''}`}
            >
              <div className="flex justify-between items-start mb-s">
                <span className={`font-heading text-small font-black w-xl h-xl flex items-center justify-center rounded-md uppercase tracking-widest ${isToday ? 'bg-azraq text-white shadow-lg shadow-azraq/10' : (sameMonth ? 'text-sapphire' : 'text-samaritan/30')}`}>{format(d, 'd')}</span>
                {!open && sameMonth && <div className="font-heading text-[9px] font-black text-tomato uppercase tracking-widest">OFF</div>}
              </div>
              <div className="space-y-xxs overflow-hidden">
                {dayAppts.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="font-heading text-[8px] font-black px-xs py-xxs rounded bg-azraq text-white truncate shadow-sm uppercase tracking-widest">{a.time} {a.clientNameSnapshot}</div>
                ))}
                {dayAppts.length > 4 && <div className="font-heading text-[8px] font-black text-samaritan px-xs uppercase tracking-widest">+{dayAppts.length - 4} plus</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
