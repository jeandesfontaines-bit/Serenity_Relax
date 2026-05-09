'use client';
import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import { SERVICES } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import * as dashboardTheme from './dashboardTheme';

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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        className={`${dashboardTheme.dashboardPanel} relative w-full sm:max-w-lg flex flex-col max-h-[90vh] overflow-hidden`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-[#d9dee4] shrink-0">
          <div>
            <p className={`${dashboardTheme.dashboardEyebrow} mb-1`}>RÉSERVATION MANUELLE</p>
            <h2 className={`${dashboardTheme.dashboardTitle} text-xl`}>Nouvelle séance</h2>
            {(date || time) && (
              <p className={`${dashboardTheme.dashboardEyebrow} text-slate-400 mt-2`}>
                {date && date} {time && `· ${time}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#f7f4ec] text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex shrink-0 px-8 py-5 gap-1 border-b border-[#e6ebf0]">
          {['Client', 'Prestation'].map((label, i) => {
            const stepId = i === 0 ? 'client' : 'service';
            const isActive = step === stepId;
            const isDone = (i === 0 && step === 'service');
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${dashboardTheme.dashboardEyebrow} ${isActive ? 'text-slate-900' : isDone ? 'text-slate-900' : 'text-slate-300'}`}>
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full ${isActive ? 'bg-[#2e5b97] text-white' : isDone ? 'bg-[#e8f2ee] text-[#2e5b97]' : 'bg-slate-50 text-slate-300'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i === 0 && <ChevronRight size={12} strokeWidth={1} className="text-slate-200 mx-1" />}
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
                  <Search size={13} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    placeholder="Rechercher un client…"
                    className="w-full h-12 bg-white/70 backdrop-blur-sm border border-[#d9dee4] rounded-xl pl-10 pr-4 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2e5b97] focus:ring-2 focus:ring-[#2e5b97]/15 transition-all"
                  />
                </div>

                {/* Results */}
                <div className="space-y-0 max-h-56 overflow-y-auto">
                  {filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectClient(c)}
                      className="w-full flex items-center justify-between px-4 py-4 border-b border-[#e6ebf0] hover:bg-[#f7f4ec] text-left transition-colors group"
                    >
                      <div>
                        <p className=" text-sm text-slate-900 tracking-tight group-hover:italic transition-all">
                          {c.firstName} {c.lastName}
                        </p>
                        {(c.email || c.phone) && (
                          <p className="font-sans text-[11px] text-slate-500 mt-0.5">{c.email || c.phone}</p>
                        )}
                      </div>
                      <ChevronRight size={13} strokeWidth={1} className="text-slate-200 group-hover:text-slate-900 shrink-0 transition-colors" />
                    </button>
                  ))}

                  {/* No results → create new */}
                  {filtered.length === 0 && search.trim() && (
                    <button
                      onClick={handleSelectNew}
                      className="w-full flex items-center gap-4 p-4 border border-dashed border-[#d9dee4] rounded-xl bg-white/70 hover:border-[#2e5b97] transition-all group mt-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-[#d9dee4] group-hover:border-[#2e5b97] shrink-0 transition-all">
                        <UserPlus size={13} strokeWidth={1.5} className="text-slate-400 group-hover:text-[#2e5b97]" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`${dashboardTheme.dashboardEyebrow} text-slate-400 group-hover:text-[#2e5b97]`}>Créer et réserver</p>
                        <p className=" text-sm text-slate-900 truncate tracking-tight mt-0.5">{search}</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* New client shortcut */}
                {filtered.length > 0 && (
                  <button
                    onClick={handleSelectNew}
                    className="w-full flex items-center gap-3 p-4 border border-dashed border-[#d9dee4] rounded-xl text-slate-400 hover:border-[#2e5b97] hover:text-[#2e5b97] transition-all mt-4"
                  >
                    <UserPlus size={13} strokeWidth={1.5} />
                    <span className={`${dashboardTheme.dashboardEyebrow}`}>Nouveau client</span>
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
                <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border border-[#d9dee4] rounded-xl">
                  <div className="min-w-0">
                    <p className=" text-sm text-slate-900 truncate tracking-tight">
                      {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
                    </p>
                    {isCreatingNew && <p className={`${dashboardTheme.dashboardEyebrow} text-slate-400 mt-1`}>Nouveau client</p>}
                  </div>
                  <button
                    onClick={() => setStep('client')}
                    className={`${dashboardTheme.dashboardEyebrow} text-slate-400 hover:text-[#2e5b97] transition-colors shrink-0`}
                  >
                    Changer
                  </button>
                </div>

                {/* Service grid */}
                <div>
                  <p className={`${dashboardTheme.dashboardEyebrow} mb-4`}>Prestation</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.map(s => {
                      const displayName = s.name.split(' -')[0];
                      const isSelected = selectedService === s.name;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.name)}
                          className={`px-4 py-4 border rounded-xl text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-[#2e5b97] bg-[#2e5b97] text-white shadow-md'
                              : 'border-[#d9dee4] bg-white/70 text-slate-700 hover:border-[#9ec4b2]'
                          }`}
                        >
                          <p className={` text-sm tracking-tight truncate leading-tight ${isSelected ? 'text-white italic' : 'text-slate-900'}`}>
                            {displayName}
                          </p>
                          {s.duration && (
                            <p className={`${dashboardTheme.dashboardEyebrow} mt-2 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
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
                  className={`${dashboardTheme.dashboardPrimaryButton} w-full h-12 flex items-center justify-center gap-3`}
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
