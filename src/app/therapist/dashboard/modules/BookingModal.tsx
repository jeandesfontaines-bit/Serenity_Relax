import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2, ChevronRight, Users, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-onyx/40 backdrop-blur-2xl" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-[#F4F2EE] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-forest uppercase tracking-[0.2em] block mb-1">Réservation</span>
            <h2 className="text-[28px] font-black text-onyx tracking-tighter uppercase leading-none">Perspective</h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-border/10 text-earth hover:text-onyx transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* RECAP BAR */}
        <div className="px-8 pb-8 flex items-center gap-4 text-earth/40 font-bold text-[13px] uppercase tracking-widest">
           <span className="flex items-center gap-1"><Sparkles size={14} className="text-neon" /> {date || '—'}</span>
           <span className="w-1 h-1 rounded-full bg-border" />
           <span className="text-onyx">{time || '—'}</span>
        </div>

        {/* PROGRESS PILLS */}
        <div className="px-8 flex gap-2 mb-8">
           {['Client', 'Prestation'].map((label, i) => {
             const stepId = i === 0 ? 'client' : 'service';
             const cur = step === stepId;
             const done = (i === 0 && step === 'service');
             return (
               <div key={label} className={`flex-1 h-1 rounded-full transition-all duration-700 ${cur || done ? 'bg-onyx' : 'bg-black/5'}`} />
             );
           })}
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
          {/* STEP 1 */}
          {step === 'client' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="relative">
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-earth/30 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                  placeholder="Chercher un dossier…"
                  className="w-full h-16 bg-white border border-border/10 rounded-[20px] pl-16 pr-6 text-[15px] font-bold text-onyx shadow-sm focus:ring-1 focus:ring-onyx transition-all uppercase tracking-tight"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-earth/40 uppercase tracking-[0.2em] mb-4">Correspondances</p>
                {filtered.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c)}
                    className="w-full flex items-center justify-between p-5 rounded-[24px] bg-white border border-transparent hover:border-border/10 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                       <div className="w-10 h-10 rounded-full bg-bg-soft flex items-center justify-center font-black text-[12px] text-onyx">
                          {c.lastName?.[0]}
                       </div>
                       <div className="text-left">
                          <p className="text-[14px] font-black text-onyx uppercase tracking-tighter">
                            {c.lastName} {c.firstName}
                          </p>
                          <p className="text-[11px] font-bold text-earth/30 uppercase tracking-widest mt-1">{c.city || 'Suisse'}</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-earth/20 group-hover:text-onyx group-hover:translate-x-1 transition-all" />
                  </button>
                ))}

                <button
                  onClick={handleSelectNew}
                  className="w-full flex items-center gap-4 p-5 rounded-[24px] border border-dashed border-border/40 bg-white/40 hover:bg-white hover:border-onyx transition-all group text-left"
                >
                  <div className="w-10 h-10 bg-onyx text-neon rounded-full flex items-center justify-center border border-border shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-onyx uppercase">CRÉER : {search || 'NOUVEAU CLIENT'}</p>
                    <p className="text-[9px] font-bold text-earth/40 uppercase tracking-widest">Nouveau dossier automatique</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'service' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-border/10 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-onyx text-white rounded-full flex items-center justify-center font-black text-[14px] shrink-0">
                    <Users size={18}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-black text-onyx uppercase truncate">
                      {isCreatingNew ? search : `${selectedClient?.lastName} ${selectedClient?.firstName}`}
                    </p>
                    <p className="text-[10px] font-black text-forest uppercase tracking-widest mt-1">Étape Finale</p>
                  </div>
                </div>
                <button onClick={() => setStep('client')} className="text-[10px] font-black text-earth hover:text-onyx transition-all uppercase underline tracking-widest">Modifier</button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-earth/40 uppercase tracking-[0.2em]">Choisir la prestation</p>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICES.map(s => {
                    const disp = s.name.split(' -')[0];
                    const sel = selectedService === s.name;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService(s.name)}
                        className={`p-5 rounded-[24px] border border-transparent text-left transition-all flex flex-col justify-between min-h-[100px] shadow-sm ${
                          sel ? 'bg-onyx text-neon ring-2 ring-neon/40' : 'bg-white text-onyx hover:border-border/20 shadow-none'
                        }`}
                      >
                        <p className="text-[13px] font-black uppercase tracking-tight leading-tight">{disp}</p>
                        {s.duration && <span className={`text-[10px] font-black uppercase tracking-widest ${sel ? 'text-neon/60' : 'text-earth/40'}`}>{s.duration}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full h-16 bg-onyx hover:bg-forest text-white rounded-full font-black uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-onyx/20"
              >
                <CheckCircle2 size={20} />
                Confirmer l'engagement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
