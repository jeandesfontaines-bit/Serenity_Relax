import React from 'react';
import { 
  X, Calendar, Clock, Lock, UserPlus, 
  Trash2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SlotManagementProps {
  date: string;
  time: string;
  isBlocked: boolean;
  onClose: () => void;
  onBook: () => void;
  onToggleBlock: () => void;
}

export default function SlotManagement({ 
  date, 
  time, 
  isBlocked, 
  onClose, 
  onBook, 
  onToggleBlock 
}: SlotManagementProps) {
  const d = new Date(date);

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="relative bg-white w-full md:w-[480px] rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isBlocked ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-[#5F27CD]'}`}>
                 {isBlocked ? <Lock size={24}/> : <Calendar size={24}/>}
              </div>
              <div>
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Gestion Créneau</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    {format(d, 'EEEE d MMMM', { locale: fr })} <span className="w-1 h-1 bg-slate-200 rounded-full"/> {time}
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
             <X size={20} />
           </button>
        </div>

        <div className="p-8 space-y-4">
           {/* Primary Action */}
           {!isBlocked ? (
             <button 
               onClick={onBook}
               className="w-full group bg-[#5F27CD] hover:bg-[#341F97] p-6 rounded-[2rem] flex items-center justify-between transition-all shadow-xl shadow-indigo-100 active:scale-95"
             >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <UserPlus size={22} />
                   </div>
                   <div className="text-left">
                      <p className="text-white text-sm font-black uppercase tracking-tight">Réserver une séance</p>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Pour un nouveau ou ancien patient</p>
                   </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                   <CheckCircle2 size={18} />
                </div>
             </button>
           ) : (
             <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                   <Lock size={32} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Créneau Bloqué</h3>
                <p className="text-xs text-white/50 font-medium mt-2 leading-relaxed">Ce créneau n'est pas disponible à la réservation.<br/>Voulez-vous le rendre à nouveau libre ?</p>
             </div>
           )}

           {/* Toggle Block Action */}
           <button 
             onClick={onToggleBlock}
             className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between active:scale-95
               ${isBlocked 
                 ? 'bg-white border-emerald-100 hover:border-emerald-300 text-emerald-600' 
                 : 'bg-white border-slate-100 hover:border-slate-300 text-slate-900'}`}
           >
              <div className="flex items-center gap-5">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBlocked ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    {isBlocked ? <CheckCircle2 size={22} /> : <Lock size={22} />}
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-tight">
                       {isBlocked ? 'Libérer le créneau' : 'Bloquer le créneau'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                       {isBlocked ? 'Rendre réservable immédiatement' : 'Empêcher toute réservation'}
                    </p>
                 </div>
              </div>
           </button>
        </div>

        {/* Footer info */}
        <div className="p-8 pt-0 flex gap-4">
           <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 flex items-center gap-3">
              <Clock size={14} className="text-slate-300" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Durée standard: 60 min</span>
           </div>
        </div>
      </div>
    </div>
  );
}
