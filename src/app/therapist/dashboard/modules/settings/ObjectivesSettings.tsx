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
      <div className="dashboard-panel relative overflow-hidden rounded-xl p-6 text-center group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <Target size={60} strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-[260px] mx-auto space-y-2">
          <label className="dashboard-metric-label block">Chiffre d'affaire mensuel cible</label>
          <div className="relative inline-block group/input">
            <InlineEditableField
              placeholder="0"
              value={monthlyGoal}
              onChange={onMonthlyGoalChange}
              type="number"
              align="center"
              className="dashboard-edit-value-lg h-10 bg-transparent px-0 hover:bg-transparent"
              editingClassName="dashboard-edit-value-lg h-10 rounded-none border-0 border-b border-primary bg-transparent px-0 text-center shadow-none"
            />
            <p className="dashboard-meta mt-0 text-foreground/40">Francs suisses / mois</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-primary"
              />
            </div>
          </div>
          <p className="dashboard-meta mx-auto max-w-[180px] leading-normal">
            Influence vos KPIs affichés sur le tableau de bord.
          </p>
        </div>
      </div>
    </div>
  );
}
