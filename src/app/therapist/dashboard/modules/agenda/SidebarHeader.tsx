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
    <div className="p-5 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium tracking-[0.05em] text-muted-foreground">
          Calendrier
        </h3>
        <div className="flex gap-0.5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevMonth} 
            className="h-7 w-7 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNextMonth} 
            className="h-7 w-7 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-lg">
        <Button
          variant="ghost"
          onClick={() => onViewChange('week')}
          className={`flex h-8 items-center justify-center gap-1.5 rounded-md transition-all text-xs font-medium tracking-[0.05em] ${
            view === 'week' 
              ? 'bg-background text-primary shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
          Semaine
        </Button>
        <Button
          variant="ghost"
          onClick={() => onViewChange('month')}
          className={`flex h-8 items-center justify-center gap-1.5 rounded-md transition-all text-xs font-medium tracking-[0.05em] ${
            view === 'month' 
              ? 'bg-background text-primary shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarRange className="h-3.5 w-3.5" strokeWidth={1.5} />
          Mois
        </Button>
      </div>
    </div>
  );
}
