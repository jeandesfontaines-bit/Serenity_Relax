'use client';
import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import { SERVICES } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

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

  const filtered = clients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()),
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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full sm:max-w-lg bg-[#faf9f7] border border-zinc-200 flex flex-col max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-zinc-100 shrink-0">
          <div>
            <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-1">RÉSERVATION MANUELLE</p>
            <h2 className="font-serif text-lg tracking-tighter text-zinc-900 uppercase">Nouvelle séance</h2>
            {(date || time) && (
              <p className="font-serif text-[10px] text-zinc-400 tracking-[0.2em] mt-1 uppercase">
                {date && date} {time && `· ${time}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex shrink-0 px-8 py-5 gap-1 border-b border-zinc-50">
          {['Client', 'Prestation'].map((label, i) => {
            const stepId = i === 0 ? 'client' : 'service';
            const isActive = step === stepId;
            const isDone = (i === 0 && step === 'service');
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 font-serif text-[9px] tracking-[0.3em] uppercase ${isActive ? 'text-zinc-900' : isDone ? 'text-zinc-900' : 'text-zinc-300'}`}>
                  <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-serif ${isActive ? 'bg-zinc-900 text-white' : isDone ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-50 text-zinc-300'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i === 0 && <ChevronRight size={12} strokeWidth={1} className="text-zinc-200 mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'client' && (
              <motion.div
                key="step-client"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="px-8 py-6 space-y-4"
              >
                {/* Search */}
                <div className="relative">
                  <Search size={13} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    placeholder="Rechercher un client…"
                    className="w-full h-12 bg-white border border-zinc-200 pl-10 pr-4 font-serif text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all"
                  />
                </div>

                {/* Results */}
                <div className="space-y-0 max-h-56 overflow-y-auto">
                  {filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectClient(c)}
                      className="w-full flex items-center justify-between px-4 py-4 border-b border-zinc-50 hover:bg-white text-left transition-colors group"
                    >
                      <div>
                        <p className="font-serif text-sm text-zinc-900 tracking-tight group-hover:italic transition-all">
                          {c.firstName} {c.lastName}
                        </p>
                        {(c.email || c.phone) && (
                          <p className="font-serif text-[10px] text-zinc-400 tracking-[0.1em] mt-0.5">{c.email || c.phone}</p>
                        )}
                      </div>
                      <ChevronRight size={13} strokeWidth={1} className="text-zinc-200 group-hover:text-zinc-900 shrink-0 transition-colors" />
                    </button>
                  ))}

                  {/* No results → create new */}
                  {filtered.length === 0 && search.trim() && (
                    <button
                      onClick={handleSelectNew}
                      className="w-full flex items-center gap-4 p-4 border border-dashed border-zinc-200 bg-white hover:border-zinc-900 transition-all group"
                    >
                      <div className="w-8 h-8 bg-zinc-50 flex items-center justify-center border border-zinc-200 group-hover:border-zinc-900 shrink-0 transition-all">
                        <UserPlus size={13} strokeWidth={1.5} className="text-zinc-400 group-hover:text-zinc-900" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400 group-hover:text-zinc-700">Créer et réserver</p>
                        <p className="font-serif text-sm text-zinc-900 truncate tracking-tight">{search}</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* New client shortcut */}
                {filtered.length > 0 && (
                  <button
                    onClick={handleSelectNew}
                    className="w-full flex items-center gap-3 p-4 border border-dashed border-zinc-100 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                  >
                    <UserPlus size={13} strokeWidth={1.5} />
                    <span className="font-serif text-[10px] tracking-[0.3em] uppercase">Nouveau client</span>
                  </button>
                )}
              </motion.div>
            )}

            {step === 'service' && (
              <motion.div
                key="step-service"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="px-8 py-6 space-y-6"
              >
                {/* Selected client recap */}
                <div className="flex items-center justify-between p-4 bg-white border border-zinc-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-serif text-xs shrink-0">
                      {isCreatingNew
                        ? search[0]?.toUpperCase()
                        : `${selectedClient?.firstName?.[0]}${selectedClient?.lastName?.[0]}`}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-sm text-zinc-900 truncate tracking-tight">
                        {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
                      </p>
                      {isCreatingNew && <p className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400">Nouveau client</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('client')}
                    className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
                  >
                    Changer
                  </button>
                </div>

                {/* Service grid */}
                <div>
                  <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-4">Prestation</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.map(s => {
                      const displayName = s.name.split(' -')[0];
                      const isSelected = selectedService === s.name;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.name)}
                          className={`px-4 py-4 border text-left transition-all duration-500 ${
                            isSelected
                              ? 'border-zinc-900 bg-zinc-900 text-white'
                              : 'border-zinc-100 bg-white text-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <p className={`font-serif text-sm tracking-tight truncate leading-tight ${isSelected ? 'text-white italic' : 'text-zinc-900'}`}>
                            {displayName}
                          </p>
                          {s.duration && (
                            <p className={`font-serif text-[9px] tracking-[0.2em] uppercase mt-1 ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                              {s.duration}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm */}
                <button
                  onClick={handleConfirm}
                  className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white font-serif text-[10px] tracking-[0.5em] uppercase flex items-center justify-center gap-3 transition-all duration-500"
                >
                  <CheckCircle2 size={14} strokeWidth={1.5} />
                  {isCreatingNew ? 'Créer et confirmer' : 'Confirmer la réservation'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
