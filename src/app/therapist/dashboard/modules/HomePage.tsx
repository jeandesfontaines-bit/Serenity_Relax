import React from 'react';
import { Calendar, AlertCircle, Clock, ChevronRight, Target, Edit3 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Appointment } from '../types';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
}

export default function HomePage({ 
  appointments, 
  monthlyGoal, 
  onSelectAppt, 
  onNavigate,
  onEditGoal 
}: HomePageProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAppts = appointments
    .filter(a => a.date === todayStr)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  
  const latePayments = appointments.filter(a => !a.paid && a.date && a.date < todayStr);
  const paidThisMonth = appointments
    .filter(a => a.paid && a.date && a.date.startsWith(format(new Date(), 'yyyy-MM')))
    .reduce((sum, a) => sum + (a.price || 150), 0);
  
  const progress = Math.min(100, (paidThisMonth / monthlyGoal) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Topbar */}
      <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#222F3E]">Bonjour 👋</h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {format(new Date(), 'EEEE d MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={() => onNavigate('scheduler')} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm">
            <Calendar size={14} /> {todayAppts.length} séances aujourd'hui
          </div>
          <div onClick={() => onNavigate('accounting')} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-rose-100 transition-all border border-rose-100 shadow-sm">
            <AlertCircle size={14} /> {latePayments.length} impayés
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-8 lg:p-10 gap-10">
        {/* Timeline */}
        <div className="flex-1 overflow-y-auto space-y-8 pr-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#222F3E] tracking-tight">Timeline du jour</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {todayAppts.length} rendez-vous programmés
              </p>
            </div>
            <button 
              onClick={() => onNavigate('scheduler')}
              className="text-[10px] font-black text-[#5F27CD] uppercase tracking-widest hover:opacity-70 transition"
            >
              Planning complet →
            </button>
          </div>

          <div className="space-y-4">
            {todayAppts.length > 0 ? todayAppts.map((appt) => (
              <div 
                key={appt.id} 
                onClick={() => onSelectAppt(appt)} 
                className="group bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  <div className="w-20 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900 text-xs shadow-inner">
                    {appt.time}
                  </div>
                  <div>
                    <h4 className="font-black text-[#222F3E] text-sm uppercase tracking-tight">
                      {appt.clientNameSnapshot || appt.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {appt.serviceName || 'Soin Signature'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${appt.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                     {appt.paid ? 'Payé' : 'À régler'}
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#5F27CD] group-hover:text-white transition-all shadow-sm">
                     <ChevronRight size={18}/>
                   </div>
                </div>
              </div>
            )) : (
              <div className="py-24 bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-100/50 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                  <Clock size={32} strokeWidth={1.5}/>
                </div>
                <p className="text-slate-400 font-bold italic tracking-tight text-sm">Aucune activité programmée pour aujourd'hui.</p>
              </div>
            )}
          </div>
        </div>

        {/* Widgets Panel */}
        <div className="w-96 flex flex-col gap-8 shrink-0">
          {/* Stats Bar */}
          <div className="premium-card p-10 rounded-[3rem] bg-gradient-to-br from-[#341F97] to-[#5F27CD] text-white shadow-2xl shadow-indigo-900/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"/>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Aujourd'hui</p>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <div className="text-3xl font-black">{todayAppts.length}</div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">Séances</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <div className="text-3xl font-black text-emerald-300">{todayAppts.reduce((s, a) => s + (a.price || 150), 0)}</div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">CHF prévus</div>
              </div>
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="premium-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Target size={24}/>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Objectif du mois</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-indigo-500">{(paidThisMonth / 1000).toFixed(1)}K</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">/ {(monthlyGoal / 1000).toFixed(0)}K CHF</span>
                    <button onClick={onEditGoal} className="ml-2 hover:text-indigo-600 transition-colors text-slate-300">
                      <Edit3 size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-[#5F27CD] rounded-full shadow-lg shadow-indigo-200 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3 text-center uppercase tracking-[0.2em]">
              {progress.toFixed(1)}% de l'objectif atteint
            </p>
          </div>

          {/* Urgent Payments */}
          <div className="premium-card p-8 rounded-[3rem] border border-rose-100 bg-white shadow-xl shadow-rose-200/10">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={14} /> Impayés urgents
            </h3>
            <div className="space-y-3">
              {latePayments.slice(0, 3).map((a, i) => (
                <div key={i} className="flex justify-between items-center bg-rose-50/50 rounded-2xl px-5 py-4 border border-rose-100/50 hover:bg-rose-50 transition-colors cursor-pointer" onClick={() => onSelectAppt(a)}>
                  <span className="text-xs font-black text-slate-900 uppercase">{a.clientNameSnapshot || a.title}</span>
                  <span className="text-xs font-black text-rose-500">−{a.price || 150} CHF</span>
                </div>
              ))}
              {latePayments.length > 3 && (
                <p className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-widest mt-2">+ {latePayments.length - 3} autres dossiers</p>
              )}
              <button 
                onClick={() => onNavigate('accounting')}
                className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mt-2 transition-all shadow-lg shadow-rose-200 active:scale-95"
              >
                Gérer les impayés →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
