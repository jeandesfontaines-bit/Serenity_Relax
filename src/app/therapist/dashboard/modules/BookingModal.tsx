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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Nouvelle réservation</h2>
            {(date || time) && (
              <p className="text-xs text-slate-500 mt-0.5">
                {date && date} {time && `· ${time}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex shrink-0 px-5 sm:px-6 py-3 gap-1">
          {['Client', 'Prestation'].map((label, i) => {
            const stepId = i === 0 ? 'client' : 'service';
            const isActive = step === stepId;
            const isDone = (i === 0 && step === 'service');
            return (
              <div key={label} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${isActive ? 'bg-emerald-600 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i === 0 && <ChevronRight size={13} className="text-slate-300 mx-0.5" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── STEP 1: Client selection ── */}
          {step === 'client' && (
            <div className="px-5 sm:px-6 pb-5 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                  placeholder="Rechercher un client…"
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 focus:bg-white transition-all"
                />
              </div>

              {/* Results */}
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-700">
                        {c.firstName} {c.lastName}
                      </p>
                      {(c.email || c.phone) && (
                        <p className="text-xs text-slate-400">{c.email || c.phone}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 shrink-0" />
                  </button>
                ))}

                {/* No results → create new */}
                {filtered.length === 0 && search.trim() && (
                  <button
                    onClick={handleSelectNew}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-200 shrink-0">
                      <UserPlus size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-medium text-emerald-700">Créer et réserver</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{search}</p>
                    </div>
                  </button>
                )}
              </div>

              {/* New client shortcut (when results exist) */}
              {filtered.length > 0 && (
                <button
                  onClick={handleSelectNew}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/30 hover:text-emerald-600 transition-colors"
                >
                  <UserPlus size={14} />
                  <span className="text-sm font-medium">Nouveau client</span>
                </button>
              )}
            </div>
          )}

          {/* ── STEP 2: Service selection ── */}
          {step === 'service' && (
            <div className="px-5 sm:px-6 pb-5 space-y-4">
              {/* Selected client recap */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
                    {isCreatingNew
                      ? search[0]?.toUpperCase()
                      : `${selectedClient?.firstName?.[0]}${selectedClient?.lastName?.[0]}`}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {isCreatingNew ? search : `${selectedClient?.firstName} ${selectedClient?.lastName}`}
                    </p>
                    {isCreatingNew && <p className="text-xs text-emerald-600">Nouveau client</p>}
                  </div>
                </div>
                <button
                  onClick={() => setStep('client')}
                  className="text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                >
                  Changer
                </button>
              </div>

              {/* Service grid */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Prestation</p>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(s => {
                    const displayName = s.name.split(' -')[0];
                    const isSelected = selectedService === s.name;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService(s.name)}
                        className={`px-3 py-3 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <p className={`text-sm font-medium truncate leading-tight ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {displayName}
                        </p>
                        {s.duration && (
                          <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`}>
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
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 size={15} />
                {isCreatingNew ? 'Créer et confirmer' : 'Confirmer la réservation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
