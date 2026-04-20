import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-m">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-sapphire/30 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-m bg-white rounded-t-card sm:rounded-card shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-s pb-xs shrink-0">
          <div className="w-l h-xxs bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-m sm:px-xl py-m border-b border-border shrink-0">
          <div>
            <h2 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Nouvelle réservation</h2>
            {(date || time) && (
              <p className="font-heading text-[10px] font-bold text-samaritan mt-xxs uppercase tracking-widest">
                {date && date} {time && `· ${time}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-l h-l flex items-center justify-center rounded-md hover:bg-bg-soft text-samaritan hover:text-sapphire transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex shrink-0 px-m sm:px-xl py-m gap-xs">
          {['Client', 'Prestation'].map((label, i) => {
            const stepId = i === 0 ? 'client' : 'service';
            const isActive = step === stepId;
            const isDone = (i === 0 && step === 'service');
            return (
              <div key={label} className="flex items-center gap-xs">
                <div className={`flex items-center gap-xs font-heading text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-azraq' : isDone ? 'text-aurora' : 'text-samaritan/30'}`}>
                  <div className={`w-m h-m rounded-md flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-azraq text-white' : isDone ? 'bg-aurora/10 text-aurora' : 'bg-bg-soft'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i === 0 && <ChevronRight size={13} className="text-border mx-xxs" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── STEP 1: Client selection ── */}
          {step === 'client' && (
            <div className="px-m sm:px-xl pb-xl space-y-m">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-m top-1/2 -translate-y-1/2 text-samaritan/30 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                  placeholder="Rechercher un client…"
                  className="w-full h-l bg-bg-soft/50 border border-border rounded-md pl-xl pr-m font-heading text-small text-sapphire placeholder:text-samaritan/30 focus:outline-none focus:ring-2 focus:ring-azraq/10 focus:border-border focus:bg-white transition-all uppercase tracking-widest"
                />
              </div>

              {/* Results */}
              <div className="space-y-xxs max-h-56 overflow-y-auto">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c)}
                    className="w-full flex items-center justify-between px-m py-s rounded-md hover:bg-bg-soft hover:text-azraq text-left transition-all group border border-transparent hover:border-border"
                  >
                    <div>
                      <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest">
                        {c.firstName} {c.lastName}
                      </p>
                      {(c.email || c.phone) && (
                        <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest mt-xxs">{c.email || c.phone}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-border group-hover:text-azraq shrink-0" />
                  </button>
                ))}

                {/* No results → create new */}
                {filtered.length === 0 && search.trim() && (
                  <button
                    onClick={handleSelectNew}
                    className="w-full flex items-center gap-m p-m rounded-md border border-dashed border-azraq/20 bg-bg-soft/50 hover:bg-bg-soft transition-all"
                  >
                    <div className="w-xl h-xl bg-white rounded-md flex items-center justify-center border border-border shrink-0">
                      <UserPlus size={14} className="text-azraq" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-heading text-[10px] font-black text-sapphire uppercase tracking-widest">Créer et réserver</p>
                      <p className="font-heading text-small font-black text-sapphire truncate uppercase tracking-widest">{search}</p>
                    </div>
                  </button>
                )}
              </div>

              {/* New client shortcut (when results exist) */}
              {filtered.length > 0 && (
                <button
                  onClick={handleSelectNew}
                  className="w-full flex items-center justify-center gap-xs p-m rounded-md border border-dashed border-border text-samaritan hover:bg-bg-soft hover:text-azraq transition-all font-heading text-[10px] font-black uppercase tracking-widest"
                >
                  <UserPlus size={14} />
                  Nouvelle fiche client
                </button>
              )}
            </div>
          )}

          {/* ── STEP 2: Service selection ── */}
          {step === 'service' && (
            <div className="px-m sm:px-xl pb-xl space-y-xl">
              {/* Selected client recap */}
              <div className="flex items-center justify-between p-m bg-bg-soft border border-border rounded-md">
                <div className="flex items-center gap-m min-w-0">
                  <div className="w-xl h-xl bg-white border border-border text-azraq rounded-md flex items-center justify-center font-heading text-small font-black shrink-0 uppercase tracking-widest">
                    {isCreatingNew
                      ? search[0]?.toUpperCase()
                      : `${selectedClient?.firstName?.[0]}${selectedClient?.lastName?.[0]}`}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-small font-black text-sapphire truncate uppercase tracking-widest">
                      {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
                    </p>
                    {isCreatingNew && <p className="font-heading text-[9px] font-black text-aurora uppercase tracking-widest">Nouveau client</p>}
                  </div>
                </div>
                <button
                  onClick={() => setStep('client')}
                  className="font-heading text-[10px] font-black text-samaritan hover:text-azraq transition-all uppercase tracking-widest shrink-0"
                >
                  Changer
                </button>
              </div>

              {/* Service grid */}
              <div className="space-y-m">
                <p className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Prestation</p>
                <div className="grid grid-cols-2 gap-xs">
                  {SERVICES.map(s => {
                    const displayName = s.name.split(' -')[0];
                    const isSelected = selectedService === s.name;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService(s.name)}
                        className={`px-m py-m rounded-md border text-left transition-all ${
                          isSelected
                            ? 'border-azraq bg-azraq text-white shadow-lg shadow-azraq/10'
                            : 'border-border bg-white text-sapphire hover:bg-bg-soft'
                        }`}
                      >
                        <p className={`font-heading text-small font-black truncate leading-tight uppercase tracking-widest ${isSelected ? 'text-white' : 'text-sapphire'}`}>
                          {displayName}
                        </p>
                        {s.duration && (
                          <p className={`font-heading text-[9px] font-black mt-xxs uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-samaritan'}`}>
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
                className="w-full h-l bg-azraq hover:bg-azraq/90 text-white rounded-md font-heading text-small font-black uppercase tracking-widest flex items-center justify-center gap-xs shadow-lg shadow-azraq/10 transition-all"
              >
                <CheckCircle2 size={15} />
                {isCreatingNew ? 'Créer et confirmer' : 'Confirmer le RDV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
