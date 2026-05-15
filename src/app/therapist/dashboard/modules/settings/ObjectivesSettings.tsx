import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { SectionHeader, InlineEditableField } from './SharedComponents';

interface ObjectivesSettingsProps {
  monthlyGoal: string;
  onMonthlyGoalChange: (val: string) => void;
}

export default function ObjectivesSettings({
  monthlyGoal,
  onMonthlyGoalChange,
}: ObjectivesSettingsProps) {
  return (
    <div className="space-y-3">
      <SectionHeader title="Performance & Objectifs" subtitle="Ambitions financières mensuelles" />
      <div className="rounded-xl p-6 border shadow-sm text-center relative overflow-hidden group" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <Target size={60} strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-[260px] mx-auto space-y-2">
          <label className="text-[7.5px] font-bold tracking-[0.05em] leading-none block" style={{ color: 'hsl(var(--muted-foreground))' }}>Chiffre d'affaire mensuel cible</label>
          <div className="relative inline-block group/input">
            <InlineEditableField
              placeholder="0"
              value={monthlyGoal}
              onChange={onMonthlyGoalChange}
              type="number"
              align="center"
              className="h-10 bg-transparent px-0 text-xl font-black tabular-nums tracking-tighter hover:bg-transparent"
              editingClassName="h-10 rounded-none border-0 border-b border-primary bg-transparent px-0 text-center text-xl font-black tabular-nums tracking-tighter shadow-none"
            />
            <p className="mt-0 text-[7px] font-bold tracking-[0.05em] opacity-30" style={{ color: 'hsl(var(--foreground))' }}>Francs suisses / mois</p>
            <div className="h-1 w-full rounded-full mt-3 overflow-hidden shadow-inner" style={{ background: 'hsl(var(--secondary))' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full" style={{ background: 'hsl(var(--primary))' }}
              />
            </div>
          </div>
          <p className="text-[9px] font-bold leading-normal max-w-[180px] mx-auto tracking-[0.05em]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Influence vos KPIs affichés sur le tableau de bord.
          </p>
        </div>
      </div>
    </div>
  );
}
