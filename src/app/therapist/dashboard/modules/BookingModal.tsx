'use client';
import React, { useState } from 'react';
import { 
  X, Search, UserPlus, CheckCircle2, ChevronRight, Calendar, 
  Clock, Sparkles, ArrowRight, User, ShieldCheck
} from 'lucide-react';
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-3xl bg-[#FDFDFB] rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="px-16 pt-16 pb-12 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-10">
             <div className="w-16 h-16 bg-neutral-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                <Sparkles size={28} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-neutral-300 mb-2 leading-none">RÉSERVATION EXECUTIVE</p>
                <h2 className="text-5xl font-bold text-neutral-900 tracking-tighter leading-none">Nouvelle Séance</h2>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Status Line */}
        {(date || time) && (
           <div className="bg-neutral-900 px-16 py-4 flex items-center gap-8 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-3 text-white/40">
                 <Calendar size={14} strokeWidth={2.5} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{date}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-3 text-white/40">
                 <Clock size={14} strokeWidth={2.5} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{time}</span>
              </div>
           </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {step === 'client' && (
              <motion.div
                key="step-client"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-16 space-y-12"
              >
                {/* Search */}
                <div className="relative group">
                  <Search size={22} strokeWidth={3} className="absolute left-8 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    placeholder="Rechercher un patient..."
                    className="w-full h-24 bg-neutral-50 border-2 border-transparent rounded-[2.5rem] pl-20 pr-10 text-2xl font-bold tracking-tighter placeholder:text-neutral-200 focus:bg-white focus:border-neutral-900 transition-all outline-none shadow-inner"
                  />
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {filtered.slice(0, 5).map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectClient(c)}
                      className="group w-full flex items-center justify-between p-10 rounded-[3rem] bg-white border border-neutral-50 hover:bg-neutral-900 hover:text-white transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-8 text-left">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-white/10 group-hover:text-white transition-all">
                           <User size={20} strokeWidth={2.5} />
                        </div>
                         <div>
                          <p className="text-2xl font-bold tracking-tighter leading-none transition-all">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-3 text-neutral-300 group-hover:text-white/40">
                             {c.email || c.phone || 'Aucun contact enregistré'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={24} strokeWidth={3} className="text-neutral-100 group-hover:text-white group-hover:translate-x-2 transition-all" />
                    </button>
                  ))}

                  {/* Create new */}
                  {filtered.length === 0 && search.trim() && (
                    <button
                      onClick={handleSelectNew}
                      className="w-full flex items-center justify-between p-10 border-2 border-dashed border-neutral-100 rounded-[3.5rem] bg-neutral-50/50 hover:border-neutral-900 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-8 text-left">
                        <div className="w-20 h-20 rounded-[2rem] bg-neutral-900 shadow-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <UserPlus size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300 mb-2 leading-none">NOUVEAU PATIENT</p>
                          <p className="text-4xl font-bold tracking-tighter text-neutral-900 leading-none">{search}</p>
                        </div>
                      </div>
                      <ArrowRight size={28} strokeWidth={3} className="text-neutral-900 group-hover:translate-x-3 transition-transform" />
                    </button>
                  )}
                </div>

                {filtered.length > 0 && (
                  <button
                    onClick={handleSelectNew}
                    className="w-full flex items-center justify-center gap-4 py-8 border-t border-neutral-100 text-neutral-300 hover:text-neutral-900 transition-all font-bold uppercase tracking-[0.4em] text-[10px]"
                  >
                    <UserPlus size={16} strokeWidth={3} /> CRÉER UN NOUVEAU PROFIL
                  </button>
                )}
              </motion.div>
            )}

            {step === 'service' && (
              <motion.div
                key="step-service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-16 space-y-16"
              >
                {/* Header Recap */}
                <div className="flex items-center justify-between p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100 shadow-inner">
                  <div className="flex items-center gap-8">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-neutral-900 flex items-center justify-center text-white shadow-xl">
                        <User size={24} strokeWidth={2.5} />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 mb-2 leading-none">SÉLECTIONNÉ</p>
                        <p className="text-3xl font-bold tracking-tighter text-neutral-900 truncate leading-none">
                          {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
                        </p>
                     </div>
                  </div>
                  <button
                    onClick={() => setStep('client')}
                    className="h-12 px-8 rounded-full border-2 border-neutral-200 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-all"
                  >
                    MODIFIER
                  </button>
                </div>

                {/* Service Selection */}
                <div className="space-y-6">
                   <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-300 px-6">SÉLECTION DU SOIN</p>
                   <div className="grid grid-cols-2 gap-6">
                    {SERVICES.map(s => {
                      const displayName = s.name.split(' -')[0];
                      const isSelected = selectedService === s.name;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.name)}
                          className={`p-10 rounded-[3.5rem] border-2 text-left transition-all duration-700 relative overflow-hidden group ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] scale-105 z-10'
                              : 'border-neutral-50 bg-white text-neutral-900 hover:border-neutral-900 shadow-sm'
                          }`}
                        >
                          {isSelected && (
                             <motion.div layoutId="selection-glow" className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          )}
                          <p className={`text-2xl font-bold tracking-tighter leading-tight transition-all group-hover:${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                            {displayName}
                          </p>
                          <div className="flex items-center justify-between mt-6">
                             <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isSelected ? 'text-white/40' : 'text-neutral-300'}`}>
                               {s.duration || '60 MIN'}
                             </p>
                             {isSelected && <CheckCircle2 size={18} strokeWidth={3} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                   </div>
                </div>

                {/* Confirm Action */}
                <div className="pt-8">
                   <button
                    onClick={handleConfirm}
                    className="w-full h-24 bg-neutral-900 rounded-[3rem] text-white text-[13px] font-bold uppercase tracking-[0.5em] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-2 active:scale-95 transition-all flex items-center justify-center gap-6 group"
                   >
                     <ShieldCheck size={24} strokeWidth={2.5} className="group-hover:scale-125 transition-transform" />
                     {isCreatingNew ? 'FINALISER ET CRÉER PROFIL' : 'CONFIRMER LA RÉSERVATION'}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
