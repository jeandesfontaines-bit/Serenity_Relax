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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page header */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 sm:px-10 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-semibold text-slate-900">Tableau de bord</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('scheduler')}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Calendar size={13} />
            {todayAppts.length} séances aujourd'hui
          </button>
          {latePayments.length > 0 && (
            <button
              onClick={() => onNavigate('accounting')}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <AlertCircle size={13} />
              {latePayments.length} impayé{latePayments.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-6 sm:py-8">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Séances aujourd'hui"
              value={String(todayAppts.length)}
              sub={`${todayRevenue} CHF prévus`}
              accent="indigo"
            />
            <StatCard
              label="Encaissé (Mois)"
              value={`${(realPaid / 1000).toFixed(1)}K`}
              sub={`Objectif : ${(monthlyGoal / 1000).toFixed(0)}K CHF`}
              accent="emerald"
              action={
                <button onClick={onEditGoal} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Edit3 size={13} />
                </button>
              }
            />
            <StatCard
              label="Projection fin de mois"
              value={`${(projectedRevenue / 1000).toFixed(1)}K`}
              sub={projectedRevenue >= monthlyGoal ? "Objectif en vue ! 🚀" : "Besoin de boost 📈"}
              accent="indigo"
              isProjected
            />
            <StatCard
              label="Soin n°1"
              value={topService.split(' ')[0]}
              sub="Soin le plus demandé"
              accent="indigo"
            />
            <div onClick={() => onFilterCompta('unpaid')} className="cursor-pointer group">
              <StatCard
                label="À encaisser"
                value={`${unpaidCount}`}
                sub={`${unpaidTotal} CHF en attente`}
                accent="rose"
                action={<ChevronRight size={14} className="text-rose-400 group-hover:translate-x-1 transition-transform" />}
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">Progression mensuelle</span>
              </div>
              <span className="text-xs font-medium text-slate-500">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Séances du jour
                </h2>
                <button
                  onClick={() => onNavigate('scheduler')}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Voir l'agenda →
                </button>
              </div>

              {todayAppts.length > 0 ? (
                <div className="space-y-2">
                  {todayAppts.map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className="group bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all duration-150"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-700">
                          {appt.time}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {appt.clientNameSnapshot || appt.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {simplifyServiceName(appt.serviceName || '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${appt.paid
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}>
                          {appt.paid ? 'Payé' : 'À régler'}
                        </span>
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
                  <Clock size={28} className="text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-slate-500">Aucune séance programmée aujourd'hui</p>
                </div>
              )}
            </div>

            {/* Urgent payments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Paiements en retard
                </h2>
                <button
                  onClick={() => onFilterCompta('late')}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Gérer →
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {latePayments.length > 0 ? (
                  <>
                    {latePayments.slice(0, 5).map(a => (
                      <div
                        key={a.id}
                        onClick={() => onSelectAppt(a)}
                        className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {a.clientNameSnapshot || a.title}
                          </p>
                          <p className="text-xs text-slate-500">{a.date}</p>
                        </div>
                        <span className="text-sm font-semibold text-rose-600 shrink-0">
                          {a.price || 150} CHF
                        </span>
                      </div>
                    ))}
                    {latePayments.length > 5 && (
                      <div className="px-5 py-3 text-center">
                        <span className="text-xs text-slate-400">
                          + {latePayments.length - 5} autres
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <TrendingUp size={24} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Aucun impayé</p>
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
  label, value, sub, accent, action, isProjected
}: {
  label: string;
  value: string;
  sub: string;
  accent: 'indigo' | 'emerald' | 'rose';
  action?: React.ReactNode;
  isProjected?: boolean;
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 ${isProjected ? 'bg-gradient-to-br from-white to-indigo-50/30' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          {label}
          {isProjected && <TrendingUp size={12} className="text-indigo-500 animate-pulse" />}
        </span>
        {action}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold ${colors[accent].split(' ')[1]}`}>{value}</span>
      </div>
      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{sub}</p>
    </div>
  );
}
