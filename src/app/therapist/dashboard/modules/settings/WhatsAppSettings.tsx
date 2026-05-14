import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';
import { SectionHeader, InlineEditableTextarea } from './SharedComponents';

interface WhatsAppSettingsProps {
  fields: Array<{
    label: string;
    val: string;
    set: (v: string) => void;
    preset: string;
  }>;
}

export function WhatsAppSettings({ fields }: WhatsAppSettingsProps) {
  return (
    <div className="space-y-3">
      <SectionHeader title="Modèles WhatsApp" subtitle="Automatisation des messages patients" />
      <div className="space-y-3">
        {fields.map((item, i) => (
          <div key={i} className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-4 items-start">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[7.5px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.label}</label>
                <button 
                  onClick={() => item.set(item.preset)} 
                  className="text-[7px] font-bold transition-colors uppercase tracking-[0.1em]" 
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Réinitialiser
                </button>
              </div>
              <InlineEditableTextarea
                placeholder={item.label}
                value={item.val}
                onChange={item.set}
                rows={3}
              />
              <div className="flex items-center gap-2 px-1 opacity-50">
                <Info size={10} style={{ color: 'hsl(var(--muted-foreground))' }} />
                <p className="text-[7px] font-bold uppercase tracking-[0.1em]">Variables : {'{firstName}, {date}, {time}, {service}, {price}'}</p>
              </div>
            </div>
            <div className="rounded-xl rounded-tr-none p-3 shadow-sm relative group hover:-translate-y-0.5 transition-all" style={{ background: 'hsl(var(--secondary))' }}>
              <p className="text-[10px] font-medium leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
                {item.val
                  .replace(/{firstName}/g,'Patient')
                  .replace(/{service}/g,'Soin Holistique')
                  .replace(/{date}/g,'Demain')
                  .replace(/{price}/g,'120')
                  .replace(/{time}/g,'10:00')}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                <span className="text-[7px] font-bold">10:45</span>
                <CheckCircle2 size={10} strokeWidth={2.5} />
              </div>
              <div className="absolute top-0 right-[-5px] w-0 h-0 border-t-[8px] border-r-[8px] border-r-transparent" style={{ borderTopColor: 'hsl(var(--secondary))' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
