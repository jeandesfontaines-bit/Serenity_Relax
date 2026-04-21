import React, { useState, useMemo } from 'react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO, addDays 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Plus, Ban, Clock, Calendar as CalendarIcon, Settings
} from 'lucide-react';
import { 
  DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, PointerSensor, useSensor, useSensors 
} from '@dnd-kit/core';
import { Appointment } from '../types';

/* ── SERVICE COLORS ── */
const SERVICE_COLORS: Record<string, { bg: string, border: string, text: string, dot: string }> = {
  'Deep Tissue': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', dot: 'bg-indigo-500' },
  'Sports massage': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', dot: 'bg-emerald-500' },
  'Therapeutic': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', dot: 'bg-teal-500' },
  'Hot Stone': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', dot: 'bg-amber-500' },
  'Pregnancy': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', dot: 'bg-rose-500' },
  'Reflexology': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', dot: 'bg-cyan-500' },
};

const DEFAULT_COLOR = { bg: 'bg-bg-soft', border: 'border-border', text: 'text-onyx', dot: 'bg-forest' };

interface AgendaPageProps {
  view: 'month' | 'week';
  onToggleView: (v: 'month' | 'week') => void;
  cur: Date;
  onPeriod: (dir: number) => void;
  onToday: () => void;
  appointments: Appointment[];
  configSlots: Record<number, string[]>;
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onToggleDay: (d: string) => void;
  blockMode: boolean;
  setBlockMode: (val: boolean) => void;
  absenceMode: boolean;
  setAbsenceMode: (val: boolean) => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (d: string, t: string) => void;
  onOpenWeeklySettings: () => void;
  onMoveAppt: (id: string, d: string, t: string) => void;
}

export default function AgendaPage({
  view, onToggleView, cur, onPeriod, onToday, appointments, configSlots,
  isDayOpen, isSlotBlocked, toggleSlot, onToggleDay, blockMode, setBlockMode,
  absenceMode, setAbsenceMode, onSelectAppt, onOpenSlot, onOpenWeeklySettings, onMoveAppt
}: AgendaPageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Month & Week Math directly uses 'cur' prop from dashboard
  const monthStart = startOfMonth(cur);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(cur), { weekStartsOn: 1 });
  const monthDays = useMemo(() => eachDayOfInterval({ start: calendarStart, end: calendarEnd }), [calendarStart, calendarEnd]);

  const weekStart = startOfWeek(cur, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const selectedDayAppts = useMemo(() =>
    appointments
      .filter(a => a.date && isSameDay(parseISO(a.date), selectedDate) && a.status !== 'cancelled')
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, selectedDate]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       onMoveAppt(active.id.toString(), format(selectedDate, 'yyyy-MM-dd'), over.id.toString());
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-700">
        
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <h1 className="text-[42px] font-semibold tracking-tight text-onyx leading-none capitalize">
                {format(cur, 'MMMM yyyy', { locale: fr })}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <span onClick={onToday} className="px-4 py-1.5 bg-[#E1FBB8] text-forest rounded-full text-[13px] font-semibold cursor-pointer hover:opacity-80">
                   AUJOURD'HUI
                 </span>
                 {absenceMode && <span className="px-4 py-1.5 bg-ochre text-white rounded-full text-[11px] font-semibold uppercase">Mode Absence</span>}
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="bg-white border border-border/50 rounded-full p-1 flex items-center shadow-sm font-bold text-onyx">
                 {['month', 'week'].map(v => (
                   <button 
                     key={v} 
                     onClick={() => onToggleView(v as any)}
                     className={`px-6 py-2 rounded-full text-[13px] transition-all capitalize ${view === v ? 'bg-onyx text-white' : 'hover:bg-bg-soft text-earth/60'}`}
                   >
                      {v === 'month' ? 'Mois' : 'Semaine'}
                   </button>
                 ))}
              </div>
              <div className="flex items-center gap-1">
                 <button onClick={() => onPeriod(-1)} className="w-10 h-10 bg-white border border-border/50 rounded-full flex items-center justify-center hover:bg-bg-soft"><ChevronLeft size={20} /></button>
                 <button onClick={() => onPeriod(1)} className="w-10 h-10 bg-white border border-border/50 rounded-full flex items-center justify-center hover:bg-bg-soft"><ChevronRight size={20} /></button>
                 <button onClick={onOpenWeeklySettings} className="w-10 h-10 bg-white border border-border/50 rounded-full flex items-center justify-center hover:bg-bg-soft ml-2"><Settings size={18} /></button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-8 flex-1 min-h-[600px]">
          
          <div className="bg-white border border-border/10 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full">
             <div className="grid grid-cols-7 border-b border-border/10 bg-bg-soft/30 h-12">
                {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map(d => (
                  <div key={d} className="flex items-center justify-center text-[11px] font-semibold text-earth/40 tracking-[0.2em]">{d}</div>
                ))}
             </div>
             
             <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-border/10 overflow-hidden">
                {(view === 'month' ? monthDays : weekDays).map((day, i) => {
                   const dStr = format(day, 'yyyy-MM-dd');
                   const isSel = isSameDay(day, selectedDate);
                   const isToday = isSameDay(day, new Date());
                   const inMonth = isSameMonth(day, cur);
                   const isOpen = isDayOpen(dStr);
                   const dayAppts = appointments.filter(a => a.date === dStr && a.status !== 'cancelled');
                   
                   return (
                      <div 
                        key={i} 
                        onClick={() => {
                          if (absenceMode) onToggleDay(dStr);
                          else setSelectedDate(day);
                        }}
                        className={`p-4 h-full cursor-pointer transition-all hover:bg-bg-soft/20 relative flex flex-col
                          ${!inMonth && view === 'month' ? 'opacity-20' : ''}
                          ${isSel ? 'bg-bg-soft/10 ring-2 ring-inset ring-neon/40' : ''}
                          ${!isOpen ? 'bg-bg-soft/50' : ''}
                        `}
                      >
                         <div className="flex justify-between items-center mb-1">
                            {isToday && <div className="w-1.5 h-1.5 rounded-full bg-forest" />}
                            <span className={`text-[13px] font-semibold ml-auto ${isSel ? 'text-forest' : 'text-onyx'}`}>
                              {format(day, 'd')}
                            </span>
                         </div>
                         <div className="flex flex-col gap-1 overflow-hidden">
                            {dayAppts.slice(0, 3).map((a, idx) => {
                               const style = SERVICE_COLORS[a.serviceName || ''] || DEFAULT_COLOR;
                               return (
                                  <div key={idx} className={`h-5 border ${style.border} ${style.bg} rounded-md px-2 flex items-center gap-1.5 overflow-hidden`}>
                                     <div className={`w-1 h-1 rounded-full ${style.dot}`} />
                                     <span className={`text-[9px] font-semibold ${style.text} truncate uppercase tracking-tighter`}>
                                       {a.clientNameSnapshot?.split(' ')[0]}
                                     </span>
                                  </div>
                               );
                            })}
                            {!isOpen && <span className="text-[9px] font-semibold text-earth/20 uppercase text-center mt-2">Fermé</span>}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>

          <div className="bg-white border border-border/10 rounded-[32px] p-8 flex flex-col shadow-sm">
             <div className="mb-6 flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-forest uppercase tracking-[0.2em] block mb-2 px-1">Engagement</span>
                  <h2 className="text-[32px] font-semibold text-onyx tracking-tighter capitalize leading-none">
                     {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                  </h2>
                </div>
             </div>

             <div className="flex gap-3 mb-8">
                <button 
                  onClick={() => setAbsenceMode(!absenceMode)}
                  className={`flex-1 h-12 rounded-2xl border flex items-center justify-center gap-2 text-[13px] font-semibold uppercase tracking-widest transition-all
                    ${absenceMode ? 'bg-[#F1664D] text-white border-[#F1664D]' : 'border-[#F1664D] text-[#F1664D] hover:bg-[#F1664D]/5'}`}
                >
                   <Ban size={16} /> Mode Absence
                </button>
                <button 
                  onClick={() => onOpenSlot(format(selectedDate, 'yyyy-MM-dd'), format(new Date(), 'HH:00'))}
                  className="flex-1 h-12 bg-onyx text-white rounded-2xl flex items-center justify-center gap-2 text-[13px] font-semibold uppercase tracking-widest hover:bg-forest transition-all"
                  title="Nouveau RDV"
                >
                   <Plus size={16} /> Séance
                </button>
             </div>

             <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {Array.from({ length: 11 }, (_, i) => {
                  const h = 8 + i;
                  const timeStr = `${h.toString().padStart(2, '0')}:00`;
                  const dStr = format(selectedDate, 'yyyy-MM-dd');
                  const appt = selectedDayAppts.find(a => (a.time || '').startsWith(timeStr));
                  const isBlocked = isSlotBlocked(dStr, timeStr);
                  
                  return (
                    <TimelineSlot 
                      key={timeStr} 
                      time={timeStr} 
                      appt={appt} 
                      isBlocked={isBlocked}
                      onSelect={onSelectAppt} 
                      onNew={() => onOpenSlot(dStr, timeStr)} 
                      onToggleBlock={() => toggleSlot(dStr, timeStr)}
                      absenceMode={absenceMode}
                    />
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

function TimelineSlot({ time, appt, isBlocked, onSelect, onNew, onToggleBlock, absenceMode }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: time });
  
  return (
    <div ref={setNodeRef} className="flex gap-4 min-h-[75px]">
       <span className="text-[12px] font-semibold text-earth/30 tabular-nums w-10 pt-4">{time}</span>
       
       {appt ? (
         <DraggableAppt appt={appt} onSelect={onSelect} />
       ) : (
         <div 
           onClick={absenceMode ? onToggleBlock : onNew}
           className={`flex-1 rounded-2xl p-4 flex items-center justify-center border-dashed border transition-all cursor-pointer grow
             ${isBlocked ? 'bg-[#FF6B61]/5 border-[#FF6B61]/20' : 'bg-bg-soft/40 border-border/20 hover:bg-white hover:border-onyx'}
             ${isOver ? 'bg-forest/10 border-forest' : ''}`}
         >
            {isBlocked ? (
               <span className="text-[10px] font-semibold text-[#FF6B61] uppercase tracking-widest">Indisponible</span>
            ) : (
               <Plus size={14} className={`opacity-10 ${isOver ? 'text-forest opacity-100 scale-150' : ''}`} />
            )}
         </div>
       )}
    </div>
  );
}

function DraggableAppt({ appt, onSelect }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: appt.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const col = SERVICE_COLORS[appt.serviceName || ''] || DEFAULT_COLOR;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={() => onSelect(appt)}
      className={`flex-1 rounded-2xl p-4 border transition-all z-10
        ${isDragging ? 'opacity-40 scale-95 shadow-none' : 'shadow-sm hover:shadow-xl'}
        ${appt.paid ? (col.bg + ' ' + col.border) : 'bg-onyx border-onyx text-white'}
      `}
    >
       <div className="flex justify-between items-start">
          <p className={`text-[14px] font-semibold uppercase tracking-tighter truncate ${appt.paid ? col.text : 'text-white'}`}>
             {appt.clientNameSnapshot}
          </p>
          {!appt.paid && <div className="w-1.5 h-1.5 rounded-full bg-ochre" />}
       </div>
       <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 ${appt.paid ? col.text : 'text-white'}`}>
          {appt.serviceName || 'Séance'}
       </p>
    </div>
  );
}
