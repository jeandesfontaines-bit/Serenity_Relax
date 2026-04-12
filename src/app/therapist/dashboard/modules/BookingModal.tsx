import React, { useState } from 'react';
import { X, Search, User, UserPlus, Calendar, Clock, CheckCircle2 } from 'lucide-react';
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

export default function BookingModal({ date, time, clients, initialSearch = '', onClose, onBook }: BookingModalProps) {
  const [step, setStep] = useState<'choice' | 'details'>('choice');
  const [search, setSearch] = useState(initialSearch);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedService, setSelectedService] = useState(SERVICES[2]?.name || 'Aromathérapie');

  const filtered = clients.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 lg:p-10">
      <div className="absolute inset-0 bg-[#222F3E]/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full md:max-w-2xl rounded-t-[2.5rem] md:rounded-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-500 max-h-[95vh] md:max-h-none flex flex-col">
        {/* Drawer Handle (Mobile Only) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>

        <div className="p-6 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">Nouvelle Réservation</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                {date || 'Séance à planifier'} {time ? `· ${time}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          {step === 'choice' ? (
            <div className="space-y-8">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="RECHERCHER UN PATIENT..." 
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-inner" 
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {filtered.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => { setSelectedClient(c); setStep('details'); }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase group-hover:text-[#5F27CD] transition-colors">{c.firstName} {c.lastName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{c.email || c.phone}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#5F27CD] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
                
                {filtered.length === 0 && search.trim() !== '' && (
                  <button 
                    onClick={() => {
                        setIsCreatingNew(true);
                        setStep('details');
                    }}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <UserPlus size={18} />
                    </div>
                    <div className="text-left">
                       <span className="block text-[10px] font-black uppercase tracking-widest">Créer & Réserver pour :</span>
                       <span className="block text-[13px] font-black uppercase tracking-tight">{search}</span>
                    </div>
                  </button>
                )}

                {filtered.length > 0 && (
                  <button onClick={() => { setIsCreatingNew(true); setStep('details'); }} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white">
                      <UserPlus size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Nouveau patient</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black ${selectedClient?.color || 'bg-white text-indigo-500'}`}>
                    {selectedClient?.firstName?.[0]}{selectedClient?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-indigo-900 uppercase">{selectedClient?.firstName} {selectedClient?.lastName}</h4>
                    <button onClick={() => setStep('choice')} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600">Changer de patient</button>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type de prestation</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SERVICES.map(s => {
                      const displayName = s.name.split(' -')[0];
                      return (
                        <button 
                          key={s.id} 
                          onClick={() => setSelectedService(s.name)}
                          className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border px-2
                            ${selectedService === s.name ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center">{displayName}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedService === s.name ? 'text-slate-300' : 'text-slate-300'}`}>{s.duration}</span>
                        </button>
                      );
                    })}
                  </div>
               </div>

                <button 
                onClick={() => {
                   if (isCreatingNew) onBook(search, selectedService, true);
                   else if (selectedClient) onBook(selectedClient.id, selectedService);
                }}
                className="w-full h-16 bg-[#5F27CD] hover:bg-[#341F97] text-white rounded-[1.5rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95 mt-4"
               >
                 <CheckCircle2 size={20} /> {isCreatingNew ? 'Créer & Confirmer' : 'Confirmer la réservation'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
