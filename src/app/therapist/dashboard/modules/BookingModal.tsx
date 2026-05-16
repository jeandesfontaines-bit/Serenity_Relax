'use client';
import React, { useState, useMemo } from 'react';
import { 
  X, Sparkles, Calendar, Clock
} from 'lucide-react';
import { Client } from '../types';
import { SERVICES } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import { StepIndicator } from './booking/StepIndicator';
import { ClientStep } from './booking/ClientStep';
import { ServiceStep } from './booking/ServiceStep';

interface BookingModalProps {
  date?: string;
  time?: string;
  clients: Client[];
  initialSearch?: string;
  onClose: () => void;
  onBook: (clientId: string, service: string, isNew?: boolean) => void;
}

export default function BookingModal({
  date, time, clients, initialSearch = '', onClose, onBook,
}: BookingModalProps) {
  const [step, setStep] = useState<'client' | 'service'>('client');
  const [search, setSearch] = useState(initialSearch);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedService, setSelectedService] = useState(SERVICES[0]?.name || 'Session');

  const filtered = useMemo(() => 
    clients.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()),
    ),
    [clients, search]
  );

  const handleSelectClient = (c: Client) => {
    setSelectedClient(c);
    setIsCreatingNew(false);
    setStep('service');
  };

  const handleSelectNew = () => {
    setIsCreatingNew(true);
    setSelectedClient(null);
    setStep('service');
  };

  const handleConfirm = () => {
    if (isCreatingNew) onBook(search, selectedService, true);
    else if (selectedClient) onBook(selectedClient.id, selectedService);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 backdrop-blur-2xl bg-foreground/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="dashboard-panel-lg relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 60 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="px-12 pt-12 pb-10 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="dashboard-eyebrow mb-1">Réservation</p>
              <h2 className="text-3xl font-black tracking-tighter leading-none text-foreground">
                Nouvelle Séance
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="dashboard-icon-button"
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Date/Time Status Bar */}
        {(date || time) && (
          <div className="px-12 py-3 flex items-center gap-6 overflow-x-auto border-b bg-primary/10 border-primary/15">
            {date && (
              <div className="flex items-center gap-2.5 text-primary">
                <Calendar size={13} strokeWidth={2.5} />
                <span className="text-[11px] font-bold tracking-[0.05em]">{date}</span>
              </div>
            )}
            {date && time && (
              <div className="w-1 h-1 rounded-full bg-primary/25" />
            )}
            {time && (
              <div className="flex items-center gap-2.5 text-primary">
                <Clock size={13} strokeWidth={2.5} />
                <span className="text-[11px] font-bold tracking-[0.05em]">{time}</span>
              </div>
            )}
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'client' ? (
              <ClientStep
                search={search}
                onSearchChange={setSearch}
                filteredClients={filtered}
                onSelectClient={handleSelectClient}
                onSelectNew={handleSelectNew}
              />
            ) : (
              <ServiceStep
                isCreatingNew={isCreatingNew}
                search={search}
                selectedClient={selectedClient}
                selectedService={selectedService}
                onSelectService={setSelectedService}
                onBack={() => setStep('client')}
                onConfirm={handleConfirm}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
