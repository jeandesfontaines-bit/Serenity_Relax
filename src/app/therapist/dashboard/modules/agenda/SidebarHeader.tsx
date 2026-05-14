import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
}

export default function SidebarHeader({
  onPrevMonth,
  onNextMonth,
  view,
  onViewChange,
}: SidebarHeaderProps) {
  return (
    <div className="p-8 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.1)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--muted-foreground)/0.6)]">
          Calendrier
        </h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevMonth} 
            className="h-7 w-7 rounded-full hover:bg-[hsl(var(--primary)/0.05)] transition-colors"
          >
            <ChevronLeft className="h-3 w-3" strokeWidth={1.5} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNextMonth} 
            className="h-7 w-7 rounded-full hover:bg-[hsl(var(--primary)/0.05)] transition-colors"
          >
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-[hsl(var(--muted)/0.5)] rounded-2xl">
        <Button
          variant="ghost"
          onClick={() => onViewChange('week')}
          className={`flex h-9 items-center justify-center gap-2 rounded-xl transition-all duration-300 ${
            view === 'week' 
              ? 'bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-sm' 
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Semaine</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onViewChange('month')}
          className={`flex h-9 items-center justify-center gap-2 rounded-xl transition-all duration-300 ${
            view === 'month' 
              ? 'bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-sm' 
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          <CalendarRange className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Mois</span>
        </Button>
      </div>
    </div>
  );
}
