import React, { useMemo } from 'react';
import { TrendingUp, Plus, Calendar, AlertCircle, ArrowUpRight, Target, Sparkles, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment } from '../types';
import { simplifyServiceName } from '@/lib/utils';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onFilterCompta: (filter: 'unpaid' | 'late') => void;
}

export default function HomePage({
  appointments,
  monthlyGoal,
  onSelectAppt,
  onNavigate,
  onFilterCompta,
}: HomePageProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const todayAppts = useMemo(() =>
    appointments
      .filter(a => a.date === todayStr && a.status !== 'cancelled')
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  const { unpaidCount, unpaidTotal } = useMemo(() => {
    const unpaid = appointments.filter(a => !a.paid && a.date && a.date <= todayStr);
    return {
      unpaidCount: unpaid.length,
      unpaidTotal: unpaid.reduce((sum, a) => sum + (a.price || 150), 0)
    };
  }, [appointments, todayStr]);

  const paidThisMonth = useMemo(() =>
    appointments
      .filter(a => a.paid && a.date && a.date.startsWith(currentMonth))
      .reduce((sum, a) => sum + (a.price || 150), 0),
    [appointments, currentMonth],
  );

  const apptsThisMonth = useMemo(() => 
    appointments.filter(a => a.date && a.date.startsWith(currentMonth)).length,
    [appointments, currentMonth]
  );

  const progress = Math.min(100, (paidThisMonth / monthlyGoal) * 100);

  return (
    <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* --- FULL CONTRAST HERO HEADER --- */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.9fr] gap-6">
        
        {/* Main Hero Card */}
        <div className="bg-white rounded-[32px] p-10 relative overflow-hidden flex flex-col justify-between min-h-[350px] shadow-sm">
           {/* Decorative Sphere */}
           <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-neon/80 rounded-full blur-[100px] opacity-40 select-none pointer-events-none" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                 <span className="px-4 py-1.5 bg-bg-soft rounded-full text-[10px] font-semibold uppercase tracking-widest text-onyx border border-border">Édition Magazine</span>
                 <span className="px-4 py-1.5 bg-onyx text-neon rounded-full text-[10px] font-semibold uppercase tracking-widest">Palette contrastée</span>
              </div>
              <h1 className="text-[54px] font-semibold text-onyx leading-[0.95] tracking-tighter mb-6 max-w-[690px]">
                Un dashboard plus vivant, plus éditorial.
              </h1>
              <p className="text-[17px] font-medium text-earth/60 leading-relaxed max-w-[560px]">
                Le résultat est plus unique, plus assumé et moins générique. Les cartes deviennent plus expressives avec un mix néon, teal et orange.
              </p>
           </div>

           <div className="relative z-10 flex items-center gap-3 mt-8">
              <button 
                onClick={() => onNavigate('scheduler')}
                className="h-12 px-6 bg-onyx text-white rounded-full flex items-center gap-2 text-[14px] font-semibold uppercase tracking-widest hover:bg-forest transition-all shadow-lg shadow-onyx/10"
              >
                <Plus size={16} /> Nouvelle séance
              </button>
              <button 
                onClick={() => onFilterCompta('late')}
                className="h-12 px-6 bg-white border border-border rounded-full flex items-center gap-2 text-[14px] font-semibold uppercase tracking-widest hover:bg-bg-soft transition-all"
              >
                Encaissements
              </button>
           </div>
        </div>

        {/* Orbit / Side Cards Stack */}
        <div className="grid grid-rows-[1.2fr_1fr] gap-6">
           <div className="bg-[#275E6A] rounded-[32px] p-8 text-white relative overflow-hidden">
              {/* Fake Orbit Ring */}
              <div className="absolute right-[-40px] bottom-[-40px] w-48 h-48 border-[20px] border-white/5 rounded-full" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div>
                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-2 block">Activité globale</span>
                    <h3 className="text-[28px] font-semibold tracking-tight leading-none uppercase">Volume de séances</h3>
                 </div>
                 <div className="flex items-center gap-6">
                    <p className="text-[13px] font-bold text-white/70 leading-relaxed max-w-[150px]">
                       +12% d'augmentation ce mois-ci par rapport à la moyenne.
                    </p>
                    <div className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center">
                       <div className="w-14 h-14 rounded-full bg-white text-[#275E6A] flex items-center justify-center font-semibold text-[22px]">12</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-ochre via-ochre to-[#F1664D] rounded-[32px] p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                 <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">Alerte encaissement</span>
                 <AlertCircle size={20} className="text-white/40" />
              </div>
              <div className="flex items-end justify-between">
                 <div>
                    <span className="text-[40px] font-semibold tracking-tighter leading-none">{unpaidTotal}</span>
                    <span className="text-[14px] font-bold ml-2">CHF</span>
                 </div>
                 <p className="text-[13px] font-semibold uppercase tracking-widest opacity-80 mb-2">Attention</p>
              </div>
           </div>
        </div>
      </section>

      {/* --- TINTED STATS GRID --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Encaissements", val: paidThisMonth, sub: "Ce mois", tint: "bg-neon/10", text: "text-onyx", icon: TrendingUp },
          { label: "Objectif", val: monthlyGoal, sub: "Cible mensuelle", tint: "bg-success/10", text: "text-forest", icon: Target },
          { label: "Temps libre", val: "68%", sub: "Disponibilité", tint: "bg-sky-100", text: "text-blue-900", icon: Activity },
          { label: "Sessions", val: todayAppts.length, sub: "Aujourd'hui", tint: "bg-stone-100", text: "text-earth", icon: Sparkles },
        ].map((s, i) => (
          <div key={i} className={`rounded-[28px] p-8 flex flex-col gap-6 shadow-xs ${s.tint} border border-border/5`}>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-earth/50 uppercase tracking-[0.2em]">{s.label}</span>
              <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center text-onyx shadow-sm">
                <s.icon size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className={`text-[38px] font-semibold tracking-tighter leading-none ${s.text}`}>
                {s.val}
              </div>
              <p className="text-[12px] font-bold text-earth/40 uppercase tracking-widest mt-2">{s.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* --- CONTENT BOARDS --- */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
         {/* Agenda Module */}
         <div className="bg-white rounded-[32px] p-10 flex flex-col gap-8 shadow-sm">
            <div className="flex items-center justify-between">
               <h2 className="text-[20px] font-semibold text-onyx uppercase tracking-tighter">Votre Board Agenda</h2>
               <div className="flex gap-2">
                  <div className="px-4 py-2 bg-bg-soft rounded-full text-[11px] font-semibold uppercase text-earth/60">Vue Jour</div>
                  <button className="px-4 py-2 bg-onyx text-neon rounded-full text-[11px] font-semibold uppercase">Plus</button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 bg-bg-soft/50 rounded-[28px] p-6 border border-border/10">
               <div className="flex flex-col justify-center gap-6 min-h-[220px]">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-onyx shadow-lg shadow-onyx/5">
                     <Calendar size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[36px] font-semibold text-onyx leading-none tracking-tighter mb-2">Focus Journée</h3>
                    <p className="text-[15px] font-medium text-earth/60 leading-relaxed">
                      L'edition magazine met l'accent sur la lisibilité et l'impact visuel de vos tâches prioritaires.
                    </p>
                  </div>
               </div>
               
               <div className="bg-[#152023] rounded-[24px] p-6 text-white flex flex-col justify-between gap-6 shadow-xl">
                  <span className="text-[12px] font-semibold text-white/40 uppercase tracking-widest">Priorités</span>
                  <div className="flex flex-col gap-3">
                     {todayAppts.slice(0, 2).map(a => (
                       <div key={a.id} className="bg-white/10 rounded-xl p-3 flex items-center justify-between border border-white/5">
                          <span className="text-[13px] font-semibold truncate max-w-[120px]">{a.clientNameSnapshot}</span>
                          <span className="text-[10px] font-semibold text-neon uppercase">{a.time}</span>
                       </div>
                     ))}
                     {todayAppts.length === 0 && (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-6 text-center">
                           <span className="text-[11px] font-semibold text-white/30 uppercase">Libre</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Payments Module */}
         <div className="bg-white rounded-[32px] p-10 flex flex-col gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-ochre/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[20px] font-semibold text-onyx uppercase tracking-tighter">Paiements</h2>
               <span className="px-3 py-1 bg-ochre/10 text-ochre rounded-full text-[11px] font-semibold uppercase">{unpaidCount} En attente</span>
            </div>

            <div className="flex flex-col gap-3">
               {appointments.filter(a => !a.paid && a.date && a.date <= todayStr).slice(0, 5).map(a => (
                 <div key={a.id} className="flex items-center justify-between p-4 bg-bg-soft/70 rounded-2xl border border-border/50 hover:bg-bg-soft transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-semibold text-[13px] text-forest shadow-sm">
                          {a.clientNameSnapshot?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-[14px] font-semibold text-onyx uppercase">{a.clientNameSnapshot?.split(' ')[0]}</p>
                          <p className="text-[11px] font-bold text-earth/50 uppercase mt-0.5">{a.date}</p>
                       </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[13px] font-semibold ${unpaidCount > 3 ? 'bg-ochre/10 text-ochre' : 'bg-[#E1FBB8] text-onyx'}`}>
                       {a.price || 150} CHF
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

    </div>
  );
}
