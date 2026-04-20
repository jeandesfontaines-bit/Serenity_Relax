import React, { useMemo } from 'react';
import { Calendar, AlertCircle, Clock, ChevronRight, Target, Edit3, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { simplifyServiceName } from '@/lib/utils';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onFilterCompta: (filter: 'unpaid' | 'late') => void;
  onEditGoal: () => void;
}

export default function HomePage({
  appointments,
  monthlyGoal,
  onSelectAppt,
  onNavigate,
  onFilterCompta,
  onEditGoal,
}: HomePageProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const todayAppts = useMemo(() =>
    appointments
      .filter(a => a.date === todayStr)
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, todayStr],
  );

  const latePayments = useMemo(() =>
    appointments.filter(a => !a.paid && a.date && a.date < todayStr),
    [appointments, todayStr],
  );

  const paidThisMonth = useMemo(() =>
    appointments
      .filter(a => a.paid && a.date && a.date.startsWith(currentMonth))
      .reduce((sum, a) => sum + (a.price || 150), 0),
    [appointments, currentMonth],
  );

  const realPaid = paidThisMonth;

  const { unpaidCount, unpaidTotal } = useMemo(() => {
    const unpaid = appointments.filter(a => !a.paid && a.date && a.date <= todayStr);
    return {
      unpaidCount: unpaid.length,
      unpaidTotal: unpaid.reduce((sum, a) => sum + (a.price || 150), 0)
    };
  }, [appointments, todayStr]);

  const projectedRevenue = useMemo(() => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = Math.max(1, new Date().getDate());
    return Math.round((realPaid / currentDay) * daysInMonth);
  }, [realPaid]);

  const topService = useMemo(() => {
    const counts = appointments.reduce((acc, a) => {
      if (a.serviceName) acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
    return top ? top[0] : 'N/A';
  }, [appointments]);

  const todayRevenue = todayAppts.reduce((s, a) => s + (a.price || 150), 0);
  const progress = Math.min(100, (paidThisMonth / monthlyGoal) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-soft">
      {/* Page header */}
      <header className="h-xl border-b border-border bg-white px-m sm:px-xl flex items-center justify-between shrink-0">
        <h1 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Tableau de bord</h1>
        <div className="flex items-center gap-xs">
          <button
            onClick={() => onNavigate('scheduler')}
            className="flex items-center gap-xs h-l px-m font-heading text-[10px] font-black uppercase tracking-widest text-azraq bg-bg-soft rounded-md hover:bg-border transition-all"
          >
            <Calendar size={13} />
            {todayAppts.length} séances
          </button>
          {latePayments.length > 0 && (
            <button
              onClick={() => onNavigate('accounting')}
              className="flex items-center gap-xs h-l px-m font-heading text-[10px] font-black uppercase tracking-widest text-white bg-tomato rounded-md hover:bg-tomato/90 transition-all shadow-lg shadow-tomato/10"
            >
              <AlertCircle size={13} />
              {latePayments.length} impayé{latePayments.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-m sm:px-xl py-xl">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-s mb-xl">
            <StatCard
              label="Séances aujourd'hui"
              value={String(todayAppts.length)}
              sub={`${todayRevenue} CHF prévus`}
              icon={<Calendar size={13} />}
              accent="aurora"
            />
            <StatCard
              label="Encaissé (Mois)"
              value={`${(realPaid / 1000).toFixed(1)}K`}
              sub={`Objectif : ${(monthlyGoal / 1000).toFixed(0)}K CHF`}
              icon={<Target size={13} />}
              accent="azraq"
              action={
                <button onClick={onEditGoal} className="text-samaritan hover:text-azraq transition-all">
                  <Edit3 size={13} />
                </button>
              }
            />
            <StatCard
              label="Projection fin de mois"
              value={`${(projectedRevenue / 1000).toFixed(1)}K`}
              sub={projectedRevenue >= monthlyGoal ? "Objectif en vue ! 🌿" : "Besoin de boost 📈"}
              icon={<TrendingUp size={13} />}
              accent="azraq"
              isProjected
            />
            <div onClick={() => onFilterCompta('unpaid')} className="cursor-pointer group">
              <StatCard
                label="À encaisser"
                value={`${unpaidCount}`}
                sub={`${unpaidTotal} CHF`}
                icon={<AlertCircle size={13} />}
                accent="carrot"
                action={<ChevronRight size={14} className="text-samaritan group-hover:translate-x-xxs transition-all" />}
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white border border-border rounded-xl p-m mb-xl shadow-sm shadow-azraq/5">
            <div className="flex items-center justify-between mb-s">
              <div className="flex items-center gap-xs">
                <Target size={15} className="text-azraq" />
                <span className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Progression mensuelle</span>
              </div>
              <span className="font-heading text-small font-black text-samaritan">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-bg-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-carrot rounded-full transition-all duration-700 shadow-lg shadow-carrot/20"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-xl">
            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-m">
                <h2 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">
                  Séances du jour
                </h2>
                <button
                  onClick={() => onNavigate('scheduler')}
                  className="font-heading text-[10px] font-black text-azraq/40 hover:text-azraq uppercase tracking-widest transition-all"
                >
                  Voir l'agenda →
                </button>
              </div>

              {todayAppts.length > 0 ? (
                <div className="space-y-xs">
                  {todayAppts.map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className="group bg-white border border-border rounded-xl px-m py-s flex items-center justify-between hover:bg-bg-soft hover:shadow-sm shadow-azraq/5 cursor-pointer transition-all duration-150"
                    >
                      <div className="flex items-center gap-m min-w-0">
                        <div className="w-xl h-l bg-azraq rounded-md flex items-center justify-center font-heading text-[10px] font-black text-white tracking-widest">
                          {appt.time}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest truncate">
                            {appt.clientNameSnapshot || appt.title}
                          </p>
                          <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest truncate">
                            {simplifyServiceName(appt.serviceName || '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-m shrink-0">
                        <span className={`px-m py-xxs rounded-md font-heading text-[9px] font-black uppercase tracking-widest ${appt.paid
                          ? 'bg-aurora text-white font-black shadow-sm'
                          : 'bg-bg-soft text-samaritan'
                        }`}>
                          {appt.paid ? 'Payé' : 'À régler'}
                        </span>
                        <ChevronRight size={15} className="text-border group-hover:text-azraq transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-border rounded-xl py-16 text-center">
                  <Clock size={28} className="text-samaritan/20 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-heading text-small font-black text-samaritan uppercase tracking-widest">Aucune séance aujourd'hui</p>
                </div>
              )}
            </div>

            {/* Urgent payments */}
            <div>
              <div className="flex items-center justify-between mb-m">
                <h2 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">
                  Paiements en retard
                </h2>
                <button
                  onClick={() => onFilterCompta('late')}
                  className="font-heading text-[10px] font-black text-tomato/60 hover:text-tomato uppercase tracking-widest transition-all"
                >
                  Gérer →
                </button>
              </div>

              <div className="bg-white border border-border rounded-xl divide-y divide-border shadow-sm shadow-azraq/5 overflow-hidden">
                {latePayments.length > 0 ? (
                  <>
                    {latePayments.slice(0, 5).map(a => (
                      <div
                        key={a.id}
                        onClick={() => onSelectAppt(a)}
                        className="px-m py-s flex items-center justify-between hover:bg-bg-soft cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest truncate">
                            {a.clientNameSnapshot || a.title}
                          </p>
                          <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest">{a.date}</p>
                        </div>
                        <span className="font-heading text-small font-black text-tomato shrink-0">
                          {a.price || 150} CHF
                        </span>
                      </div>
                    ))}
                    {latePayments.length > 5 && (
                      <div className="px-m py-xs text-center bg-bg-soft/30">
                        <span className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">
                          + {latePayments.length - 5} autres
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-xl text-center">
                    <TrendingUp size={24} className="text-samaritan/10 mx-auto mb-xs" />
                    <p className="font-heading text-small font-bold text-samaritan uppercase tracking-widest">Tout est en ordre</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({
  label, value, sub, action, icon, accent, isProjected
}: {
  label: string;
  value: string;
  sub: string;
  accent: 'azraq' | 'aurora' | 'carrot' | 'forest';
  icon?: React.ReactNode;
  action?: React.ReactNode;
  isProjected?: boolean;
}) {
  const getAccentClass = () => {
    switch (accent) {
      case 'aurora': return 'bg-aurora text-white';
      case 'carrot': return 'bg-carrot text-white';
      case 'forest': return 'bg-forest text-white';
      default: return 'bg-bg-soft text-azraq';
    }
  };

  return (
    <div className={`bg-white border border-border rounded-xl p-m shadow-sm shadow-azraq/5 transition-all hover:shadow-md h-full flex flex-col justify-between ${isProjected ? 'bg-gradient-to-br from-white to-bg-soft/30' : ''}`}>
      <div>
        <div className="flex items-center justify-between mb-m">
           <div className={`w-l h-l rounded-full flex items-center justify-center shadow-sm ${getAccentClass()}`}>
              {icon}
           </div>
           {action}
        </div>
        <p className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest mb-xxs">{label}</p>
        <span className={`font-heading text-h2 font-black text-sapphire tracking-heading`}>{value}</span>
      </div>
      <p className="font-heading text-[10px] font-bold text-samaritan mt-m uppercase tracking-tight">{sub}</p>
    </div>
  );
}
