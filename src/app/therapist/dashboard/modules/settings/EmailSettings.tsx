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
      <div className="rounded-xl p-4 border shadow-sm space-y-4 relative overflow-hidden" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h4 className="text-[9.5px] font-bold tracking-tight uppercase" style={{ color: 'hsl(var(--foreground))' }}>Module d'expédition</h4>
            <p className="text-[7px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>STATUT : {enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}</p>
          </div>
          <button onClick={() => onEnabledChange(!enabled)} className="w-8 h-4 rounded-full relative transition-all shadow-inner"
          style={{ background: enabled ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>
            <div className={`w-3 h-3 rounded-full absolute top-0.5 shadow-md transition-all ${enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} style={{ background: 'hsl(var(--background))' }} />
          </button>
        </div>
        <div className={`space-y-3 transition-all duration-700 ${enabled ? 'opacity-100' : 'opacity-30 blur-sm pointer-events-none translate-y-2'}`}>
          <div className="space-y-1.5">
            <label className="text-[7px] font-bold uppercase tracking-[0.2em] px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>CORPS DU MESSAGE TYPE</label>
            <InlineEditableTextarea
              placeholder="Corps du message type"
              value={template}
              onChange={onTemplateChange}
              rows={4}
              variant="soft"
            />
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl shadow-lg" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
            <Sparkles size={14} className="shrink-0" style={{ color: 'hsl(var(--primary-foreground))' }} />
            <p className="text-[9px] font-bold leading-normal opacity-70 uppercase tracking-tight">Le système injectera automatiquement votre charte graphique Serenity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
