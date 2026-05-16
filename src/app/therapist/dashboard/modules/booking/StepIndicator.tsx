import React from 'react';

interface StepIndicatorProps {
  currentStep: 'client' | 'service';
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: 'client', label: 'Patient' },
    { id: 'service', label: 'Soin' },
  ] as const;

  return (
    <div className="flex items-center gap-3 border-b border-border px-12 py-3">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                currentStep === s.id || (s.id === 'client' && currentStep === 'service')
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[11px] font-bold tracking-[0.05em] transition-all duration-300 ${
                currentStep === s.id ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i === 0 && (
            <div className="flex-1 h-px max-w-[40px] bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
