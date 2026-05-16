import React from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Client } from '../../types';
import { SERVICES } from '@/lib/types';

interface ServiceStepProps {
  isCreatingNew: boolean;
  search: string;
  selectedClient: Client | null;
  selectedService: string;
  onSelectService: (service: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function ServiceStep({
  isCreatingNew,
  search,
  selectedClient,
  selectedService,
  onSelectService,
  onBack,
  onConfirm,
}: ServiceStepProps) {
  return (
    <motion.div
      key="step-service"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="p-12 space-y-8"
    >
      {/* Patient Recap */}
      <div className="dashboard-surface-soft flex items-center justify-between rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <User size={16} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="dashboard-eyebrow mb-0.5">Patient sélectionné</p>
            <p className="text-base font-black tracking-tight truncate leading-tight text-foreground">
              {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="dashboard-secondary-button h-9 rounded-full px-5 text-[11px]"
        >
          Modifier
        </button>
      </div>

      {/* Service Selection Grid */}
      <div className="space-y-4">
        <p className="dashboard-eyebrow px-1">Sélection du soin</p>
        <div className="grid grid-cols-2 gap-4">
          {SERVICES.map(s => {
            const displayName = s.name.split(' -')[0];
            const isSelected = selectedService === s.name;
            return (
              <motion.button
                key={s.id}
                onClick={() => onSelectService(s.name)}
                whileHover={isSelected ? {} : { y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary bg-primary shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.35)] scale-[1.02]' 
                    : 'border-border bg-background shadow-sm hover:border-primary/50'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="service-glow"
                    className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary-foreground/15 to-transparent"
                  />
                )}
                <p className={`text-base font-black tracking-tight leading-tight ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {displayName}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className={`text-[11px] font-bold tracking-[0.05em] ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                    {s.duration || '60 min'}
                  </p>
                  {isSelected && (
                    <CheckCircle2 size={16} strokeWidth={2.5} className="text-primary-foreground" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Confirm Button */}
      <motion.button
        onClick={onConfirm}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.97 }}
        className="dashboard-primary-button h-16 w-full rounded-2xl text-[12px] tracking-[0.05em] shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.4)]"
      >
        <ShieldCheck size={20} strokeWidth={2.5} className="transition-transform duration-300 group-hover:scale-110" />
        {isCreatingNew ? 'Finaliser et créer le profil' : 'Confirmer la réservation'}
      </motion.button>
    </motion.div>
  );
}
