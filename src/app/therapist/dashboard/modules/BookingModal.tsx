'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2, ChevronRight, User, Sparkles, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '../types';
import { SERVICES } from '@/lib/types';

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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-xl" 
        onClick={onClose} 
      />

      {/* Modal */}
      <motion.div 
        initial={{ y: '100%', opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '100%', opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full sm:max-w-xl glass rounded-t-[3rem] sm:rounded-xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-white/80"
      >
        {/* HEADER IMPACT LUXE */}
        <div className="relative bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] p-5 lg:p-8 text-white overflow-hidden shrink-0">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-white/20 rounded-full transition-colors z-10"
            title="Fermer"
          >
            <X size={32} />
          </button>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles size={20} />
                </div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] opacity-70">Rituel de Réservation</p>
             </div>
             
             <h2 className="text-4xl lg:text-3xl font-sans font-light leading-tight tracking-tight">
                {step === 'client' ? 'Désignation du Patient' : 'Choix du Rituel'}
             </h2>
             
             <div className="flex items-center gap-8 pt-2">
                {(date || time) && (
                  <div className="flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-widest opacity-80">
                    <Calendar size={12} />
                    {date && date} {time && `• ${time}`}
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                    {[
                      { id: 'client', label: 'Identité' },
                      { id: 'service', label: 'Soin' }
                    ].map((s, i) => {
                      const isActive = step === s.id;
                      const isDone = (i === 0 && step === 'service');
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                           <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${
                             isActive ? 'bg-white text-[#059669]' : isDone ? 'bg-[#34D399] text-white' : 'bg-white/10 text-white/40'
                           }`}>
                             {isDone ? '✓' : i + 1}
                           </div>
                        </div>
                      );
                    })}
                </div>
             </div>
          </div>
          
          <div className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none scale-150 rotate-12">
              <Calendar size={200} />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {step === 'client' ? (
              <motion.div 
                key="client-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#059669] transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    placeholder="Chercher le profil du patient..."
                    className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm font-medium text-[#222F3E] placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-[#059669]/5 shadow-sm transition-all focus:border-[#059669]"
                  />
                </div>

                {/* Results Area */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                  {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {filtered.map(c => (
                        <motion.button
                          key={c.id}
                          whileHover={{ x: 5 }}
                          onClick={() => handleSelectClient(c)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white hover:shadow-xl hover:shadow-emerald-50/50 transition-all border border-transparent group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-all">
                              <User size={18} />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-[#222F3E]">{c.firstName} {c.lastName}</p>
                              {(c.email || c.phone) && (
                                <p className="text-[0.65rem] font-medium text-gray-400 truncate max-w-[180px]">{c.email || c.phone}</p>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-200 group-hover:text-[#059669] transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  ) : search.trim() ? (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleSelectNew}
                      className="w-full flex items-center gap-4 p-6 rounded-xl border-2 border-dashed border-[#059669]/20 bg-[#059669]/5 hover:bg-[#059669]/10 transition-all group"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#059669] shadow-lg">
                        <UserPlus size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[0.65rem] font-black uppercase tracking-widest text-[#059669]">Nouveau profil détecté</p>
                        <p className="text-lg font-sans font-medium text-[#222F3E] break-all">Créer et inscrire « {search} »</p>
                      </div>
                    </motion.button>
                  ) : (
                    <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl mx-auto flex items-center justify-center text-gray-200">
                             <User size={30} />
                        </div>
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Saisissez un nom pour commencer</p>
                    </div>
                  )}
                </div>

                {filtered.length > 0 && (
                   <button
                    onClick={handleSelectNew}
                    className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 text-gray-400 hover:text-[#059669] hover:border-[#059669] transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <UserPlus size={16} />
                    Inscrire un nouveau patient
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="service-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Identity Recap */}
                <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-100 shadow-xl shadow-emerald-100/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#059669] text-white flex items-center justify-center text-lg font-sans shadow-lg">
                      {isCreatingNew ? search[0]?.toUpperCase() : selectedClient?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-lg font-sans font-medium text-[#222F3E]">
                        {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
                      </p>
                      {isCreatingNew && <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#34D399]">Nouveau Dossier</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('client')}
                    className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 hover:text-[#059669] transition-all px-4 py-2 bg-gray-50 rounded-xl"
                  >
                    Changer
                  </button>
                </div>

                {/* Ritual Choice Grid */}
                <div className="space-y-4">
                  <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-gray-400">Choix du Rituel Thérapeutique</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(s => {
                      const displayName = s.name.split(' -')[0];
                      const isSelected = selectedService === s.name;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.name)}
                          className={`p-5 rounded-xl border transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden group ${
                            isSelected
                              ? 'bg-[#222F3E] border-[#222F3E] text-white shadow-2xl shadow-emerald-200'
                              : 'bg-white border-gray-100 text-[#222F3E] hover:border-[#059669]/30'
                          }`}
                        >
                          <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform duration-700 ${isSelected ? 'scale-150' : 'group-hover:scale-125'}`}>
                              <Sparkles size={40} />
                          </div>
                          
                          <p className={`text-base font-sans font-medium leading-tight ${isSelected ? 'text-white' : 'text-[#222F3E]'}`}>
                            {displayName}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1 text-[0.65rem] font-bold ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                                <Clock size={12} />
                                {s.duration}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleConfirm}
                  className="w-full btn-luxe flex items-center gap-4 shadow-2xl shadow-emerald-100 py-6"
                >
                  <CheckCircle2 size={20} />
                  <span>{isCreatingNew ? 'Confirmer le Nouveau Dossier' : 'Sceller le Rendez-vous'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Safe area spacer for mobile */}
        <div className="h-10 shrink-0" />
      </motion.div>
    </div>
  );
}
