import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { 
  ChevronRight, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Zap
} from 'lucide-react';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
  searchQuery: string;
}

/** Returns badge + accent colors per appointment status — monochrome editorial style */
function appointmentStatus(appt: Appointment, todayStr: string) {
  if (appt.status === 'cancelled') {
    return {
      label: 'ANNULÉ',
      badgeClass: 'bg-red-50 text-red-400 border border-red-100',
      dotClass: 'bg-red-200',
      muted: true,
    };
  }

  if (appt.paid) {
    return {
      label: 'RÉGLÉ',
      badgeClass: 'bg-[var(--accent-teal)] text-emerald-600 border border-emerald-100/50',
      dotClass: 'bg-emerald-500',
      muted: false,
    };
  }

  if (appt.date && appt.date < todayStr) {
    return {
      label: 'EN RETARD',
      badgeClass: 'bg-[var(--accent-orange)] text-orange-600 border border-orange-100/50',
      dotClass: 'bg-orange-500',
      muted: false,
    };
  }

  return {
    label: 'À VENIR',
    badgeClass: 'bg-[var(--accent-blue)] text-blue-600 border border-blue-100/50',
    dotClass: 'bg-blue-500',
    muted: false,
  };
}

function displayTime(time?: string) {
  if (!time) return { hour: '--:--', period: '' };
  const [hStr, mStr] = time.split(':');
  const hours = Number(hStr);
  const minutes = mStr || '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = ((hours + 11) % 12) + 1;
  return {
    hour: `${String(displayHour).padStart(2, '0')}:${minutes}`,
    period,
  };
}

function formatDayLabel(dateStr?: string) {
  if (!dateStr) return 'Récemment';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Récemment';
  return format(date, 'MMM d').toUpperCase();
}

function normalizeSearchQuery(value?: string) {
  return (value || '').trim().toLowerCase();
}

function appointmentMatchesSearch(appt: Appointment, query: string) {
  if (!query) return true;
  const haystack = [
    appt.clientNameSnapshot,
    appt.title,
    appt.serviceName,
    appt.notes,
    appt.date,
    appt.time,
    appt.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function HomePage({
  appointments,
  monthlyGoal,
  onSelectAppt,
  onNavigate,
  onEditGoal,
  searchQuery,
}: HomePageProps) {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentMonth = format(now, 'yyyy-MM');
  const normalizedSearch = normalizeSearchQuery(searchQuery);

  const todayAppts = useMemo(
    () =>
      appointments
        .filter((appt) => appt.date === todayStr && appointmentMatchesSearch(appt, normalizedSearch))
        .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [appointments, normalizedSearch, todayStr],
  );

  const paidThisMonth = useMemo(
    () =>
      appointments
        .filter((appt) => appt.paid && appt.date?.startsWith(currentMonth))
        .reduce((sum, appt) => sum + (appt.price || appt.totalAmount || 0), 0),
    [appointments, currentMonth],
  );

  const completedSessions = useMemo(
    () => appointments.filter((appt) => appt.paid).length,
    [appointments],
  );

  const pendingInvoices = useMemo(
    () => appointments.filter((appt) => !appt.paid && appt.status !== 'cancelled').length,
    [appointments],
  );

  const urgentInvoices = useMemo(
    () => appointments.filter((appt) => !appt.paid && appt.date && appt.date < todayStr && appt.status !== 'cancelled').length,
    [appointments, todayStr],
  );

  const progressNotes = useMemo(
    () =>
      appointments
        .filter((appt) => appt.notes && appt.notes.trim() && appointmentMatchesSearch(appt, normalizedSearch))
        .sort((a, b) => `${b.date || ''}${b.time || ''}`.localeCompare(`${a.date || ''}${a.time || ''}`))
        .slice(0, 2),
    [appointments, normalizedSearch],
  );

  const revenueChange = monthlyGoal > 0 ? Math.round((paidThisMonth / monthlyGoal) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto p-8 lg:p-16 space-y-20 bg-neutral-50">
      
      {/* ── KPI cards ── */}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-4">
        <MetricCard
          icon={<CreditCard size={24} strokeWidth={2.5} />}
          label="REVENUS"
          value={`${paidThisMonth.toLocaleString('fr-CH')} CHF`}
          variant="blue"
        />
        <MetricCard
          icon={<CheckCircle2 size={24} strokeWidth={2.5} />}
          label="SOINS"
          value={completedSessions.toString()}
          variant="yellow"
        />
        <MetricCard
          icon={<Users size={24} strokeWidth={2.5} />}
          label="PATIENTS"
          value="124"
          variant="orange"
        />
        <MetricCard
          icon={<AlertCircle size={24} strokeWidth={2.5} />}
          label="IMPAYÉS"
          value={pendingInvoices.toString()}
          variant="pink"
        />
      </section>

      {/* ── Main content grid ── */}
      <section className="grid grid-cols-1 gap-24 lg:grid-cols-3">
        {/* Today's agenda */}
        <div className="space-y-12 lg:col-span-2">
          <div className="flex items-end justify-between border-b border-neutral-100 pb-8">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">PROGRAMMATION DU JOUR</p>
              <h4 className="text-4xl font-bold text-neutral-900 tracking-tight leading-none">Agenda</h4>
            </div>
            <button
              onClick={() => onNavigate('scheduler')}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-900 transition-all group"
            >
              VOIR TOUT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-6">
            {todayAppts.length > 0 ? (
              todayAppts.slice(0, 5).map((appt) => {
                const status = appointmentStatus(appt, todayStr);
                const { hour, period } = displayTime(appt.time);

                return (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    className={`group flex w-full items-center gap-8 rounded-3xl border border-neutral-100 bg-white p-8 text-left transition-all hover:shadow-xl hover:border-neutral-200 ${
                      status.muted ? 'opacity-40 hover:opacity-100' : ''
                    }`}
                  >
                    {/* Time */}
                    <div className="min-w-[80px] text-center border-r border-neutral-100 pr-8">
                      <p className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">{hour}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">{period}</p>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-xl font-bold text-neutral-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                        {appt.clientNameSnapshot || appt.title || 'Client'}
                      </h5>
                      <p className="mt-2 truncate text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {appt.serviceName || 'Consultation'} · {appt.duration || '60 MIN'}
                      </p>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-6">
                      <span className={`shrink-0 rounded-full px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm ${status.badgeClass}`}>
                        {status.label}
                      </span>
                      <div className="w-12 h-12 flex items-center justify-center rounded-full text-neutral-100 group-hover:text-neutral-900 group-hover:rotate-45 transition-all">
                        <ChevronRight size={24} strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-32 flex flex-col items-center justify-center bg-neutral-50 rounded-[4rem] border-2 border-dashed border-neutral-100 group hover:border-neutral-200 transition-all">
                <Clock size={48} strokeWidth={1} className="text-neutral-200 mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-300">
                  {normalizedSearch ? 'AUCUN RÉSULTAT' : 'AUCUNE SÉANCE AUJOURD\'HUI'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notes sidebar */}
        <div className="space-y-12">
          <div className="bg-white border border-neutral-100 rounded-[3.5rem] p-12 shadow-xl space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">ARCHIVES</p>
                <h4 className="text-3xl font-bold text-neutral-900 tracking-tight">Notes</h4>
              </div>
              <button
                onClick={onEditGoal}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-300 hover:text-neutral-900 transition-all shadow-inner"
              >
                <BarChart3 size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-6">
              {progressNotes.length > 0 ? (
                progressNotes.map((appt) => (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    className="block w-full rounded-2xl border border-neutral-100 bg-neutral-50 p-6 text-left transition-all hover:bg-white hover:shadow-lg group"
                  >
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {formatDayLabel(appt.date)}
                    </p>
                    <p className="truncate text-lg font-bold text-neutral-900 transition-all tracking-tight">
                      {appt.clientNameSnapshot || appt.title || 'Client'}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-neutral-500 leading-relaxed">
                      &ldquo;{appt.notes?.trim()}&rdquo;
                    </p>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-neutral-50 rounded-[2.5rem]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-200">AUCUNE NOTE RÉCENTE</p>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('clients')}
              className="w-full h-16 flex items-center justify-center rounded-full border border-neutral-100 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50 transition-all"
            >
              RÉPERTOIRE PATIENTS
            </button>
          </div>
        </div>
      </section>

      {/* ── Promo banners ── */}
      <section className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Photo card */}
        <div className="group relative h-[450px] overflow-hidden rounded-[4rem] border border-neutral-100 shadow-2xl">
          <img
            alt="Salle de thérapie"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=2070"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-16">
            <h4 className="text-5xl font-bold text-white tracking-tight leading-none mb-6">Sérénité Totale</h4>
            <p className="text-base font-medium text-white/60 max-w-sm leading-relaxed mb-10">Découvrez nos nouveaux protocoles d&apos;accueil pour une expérience patient sublimée dès l&apos;arrivée au cabinet.</p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-fit h-14 flex items-center px-10 rounded-full bg-white text-neutral-900 text-[10px] font-bold uppercase tracking-[0.4em] hover:scale-110 transition-all shadow-2xl"
            >
              EXPLORER
            </button>
          </div>
        </div>

        {/* Insight card */}
        <div className="flex flex-col justify-between rounded-[4rem] bg-neutral-900 p-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={240} strokeWidth={1} className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <Zap size={20} className="text-blue-400 fill-blue-400" />
               <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400">
                INSIGHT PERFORMANCE
              </span>
            </div>
            <h4 className="text-5xl font-bold text-white tracking-tight leading-tight mb-8">
              Optimisez<br />Votre Temps
            </h4>
            <p className="text-base font-medium text-white/40 max-w-xs leading-relaxed">
              Vos matinées du mardi sont saturées. Pensez à augmenter vos tarifs de 15% sur ces créneaux haute-densité.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-8 relative z-10">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-neutral-900 bg-neutral-800 overflow-hidden shadow-2xl">
                  <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="avatar" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-neutral-900 bg-white flex items-center justify-center text-[11px] font-bold text-neutral-900 shadow-2xl">
                +15
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">LISTE D&apos;ATTENTE ACTIVE</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'teal' | 'default';
}) {
  const variantStyles = {
    blue: 'bg-white border-neutral-100 text-neutral-900',
    yellow: 'bg-white border-neutral-100 text-neutral-900',
    orange: 'bg-white border-neutral-100 text-neutral-900',
    pink: 'bg-white border-neutral-100 text-neutral-900',
    teal: 'bg-white border-neutral-100 text-neutral-900',
    default: 'bg-white border-neutral-100 text-neutral-900',
  };

  const iconCircleStyles = {
    blue: 'bg-blue-50 text-blue-500',
    yellow: 'bg-yellow-50 text-yellow-500',
    orange: 'bg-orange-50 text-orange-500',
    pink: 'bg-pink-50 text-pink-500',
    teal: 'bg-emerald-50 text-emerald-500',
    default: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <div className={`group rounded-3xl border p-8 transition-all hover:shadow-2xl hover:border-neutral-200 ${variantStyles[variant]}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-transform group-hover:scale-110 ${iconCircleStyles[variant]}`}>
          {icon}
        </div>
        <ChevronRight size={18} className="text-neutral-200 group-hover:text-neutral-900 transition-colors" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
      <h3 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 leading-none">{value}</h3>
    </div>
  );
}

