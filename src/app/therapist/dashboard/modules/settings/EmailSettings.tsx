import React from 'react';
import { Sparkles } from 'lucide-react';
import { SectionHeader, InlineEditableTextarea } from './SharedComponents';

interface EmailSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  template: string;
  onTemplateChange: (template: string) => void;
}

export default function EmailSettings({
  enabled,
  onEnabledChange,
  template,
  onTemplateChange,
}: EmailSettingsProps) {
  return (
    <div className="space-y-3">
      <SectionHeader title="Service Emailing" subtitle="Communications officielles par courriel" />
      <div className="dashboard-panel space-y-4 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h4 className="dashboard-meta-strong text-foreground">Module d'expédition</h4>
            <p className="dashboard-meta mt-0.5">Statut : {enabled ? 'Activé' : 'Désactivé'}</p>
          </div>
          <button onClick={() => onEnabledChange(!enabled)} className={`relative h-5 w-10 rounded-full transition-all shadow-inner ${enabled ? 'bg-primary' : 'bg-border'}`}>
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-md transition-all ${enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className={`space-y-3 transition-all duration-700 ${enabled ? 'opacity-100' : 'opacity-30 blur-sm pointer-events-none translate-y-2'}`}>
          <div className="space-y-1.5">
            <label className="dashboard-metric-label px-1">Corps du message type</label>
            <InlineEditableTextarea
              placeholder="Corps du message type"
              value={template}
              onChange={onTemplateChange}
              rows={4}
              variant="soft"
            />
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-primary p-3 text-primary-foreground shadow-lg">
            <Sparkles size={14} className="shrink-0 text-primary-foreground" />
            <p className="dashboard-meta-strong leading-normal opacity-70">Le système injectera automatiquement votre charte graphique Serenity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
