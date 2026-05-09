import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Appointment } from '../types';
import {
  dashboardPageContainer,
  dashboardPanel,
  dashboardPanelSoft,
  dashboardSectionHeader,
  dashboardTitle,
  dashboardMutedText,
} from './dashboardTheme';

interface HomePageProps {
  appointments: Appointment[];
  monthlyGoal: number;
  onSelectAppt: (appt: Appointment) => void;
  onNavigate: (tab: string) => void;
  onEditGoal: () => void;
  searchQuery: string;
}

const filledIcon = {
  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
} as const;

const outlinedIcon = {
  fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
} as const;

/** Returns badge + accent colors per appointment status — richly differentiated */
function appointmentStatus(appt: Appointment, todayStr: string) {
  if (appt.status === 'cancelled') {
    return {
      label: 'ANNULÉ',
      badgeClass: 'bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]',
      lineClass: 'bg-[#ef4444]',
      muted: true,
    };
  }

  if (appt.paid) {
    return {
      label: 'RÉGLÉ',
      badgeClass: 'bg-[#dcfce7] text-[#15803d] border border-[#86efac]',
      lineClass: 'bg-[#22c55e]',
      muted: false,
    };
  }

  if (appt.date && appt.date < todayStr) {
    return {
      label: 'EN RETARD',
      badgeClass: 'bg-[#ffedd5] text-[#c2410c] border border-[#fdba74]',
      lineClass: 'bg-[#f59e0b]',
      muted: false,
    };
  }

  // future / unpaid
  return {
    label: 'CONFIRMÉ',
    badgeClass: 'bg-[#e8f2ee] text-[#184f40] border border-[#bdd0e5]',
    lineClass: 'bg-[#2e5b97]',
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
    <div className={`${dashboardPageContainer} space-y-8`}>
      {normalizedSearch && (
        <section className="space-y-2">
          <p className="text-sm text-[#3f565f]">
            Filtre actif&nbsp;: <span className="font-semibold text-[#2e5b97]">{searchQuery.trim()}</span>
          </p>
        </section>
      )}

      {/* ── KPI cards ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon="payments"
          iconClass="bg-[#dcfce7] text-[#15803d]"
          badgeClass="bg-[#ecfccb] text-[#4d7c0f] border border-[#bef264]"
          badgeLabel={`${revenueChange}% objectif`}
          label="Revenus du mois"
          value={`${paidThisMonth.toLocaleString('fr-CH')} CHF`}
        />
        <MetricCard
          icon="task_alt"
          iconClass="bg-[#e8f2ee] text-[#184f40]"
          badgeClass="bg-[#e8f2ee] text-[#184f40] border border-[#bdd0e5]"
          badgeLabel="Séances réglées"
          label="Séances complètes"
          value={completedSessions.toString()}
        />
        <MetricCard
          icon="pending_actions"
          iconClass={urgentInvoices > 0 ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#ffedd5] text-[#c2410c]"}
          badgeClass={urgentInvoices > 0 ? "bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]" : "bg-[#ffedd5] text-[#c2410c] border border-[#fdba74]"}
          badgeLabel={urgentInvoices > 0 ? `${urgentInvoices} en retard !` : "À jour"}
          label="Factures en attente"
          value={pendingInvoices.toString()}
        />
      </section>

      {/* ── Main content grid ── */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Today's agenda */}
        <div className="space-y-5 lg:col-span-2">
          <div className={dashboardSectionHeader}>
            <div>
              <h4 className={dashboardTitle}>Agenda d&apos;aujourd&apos;hui</h4>
              <p className={`mt-0.5 text-sm ${dashboardMutedText}`}>{format(now, 'EEEE d MMMM')}</p>
            </div>
            <button
              onClick={() => onNavigate('scheduler')}
              className="text-sm font-semibold text-[#2e5b97] hover:underline"
            >
              Voir l&apos;agenda →
            </button>
          </div>

          <div className="space-y-3">
            {todayAppts.length > 0 ? (
              todayAppts.slice(0, 5).map((appt) => {
                const status = appointmentStatus(appt, todayStr);
                const { hour, period } = displayTime(appt.time);

                return (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    className={`group flex w-full items-center gap-5 rounded-[18px] border border-[#d9dee4] bg-[rgba(255,255,255,0.94)] p-4 text-left shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-[#bdd0e5] ${
                      status.muted ? 'opacity-55' : ''
                    }`}
                  >
                    {/* Time */}
                    <div className="min-w-[52px] text-center">
                      <p className={`text-base font-bold leading-none ${status.muted ? 'text-[#8fa1b2]' : 'text-[#1d292e]'}`}>{hour}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8fa1b2]">{period}</p>
                    </div>

                    {/* Accent line */}
                    <div className={`h-10 w-1 shrink-0 rounded-full transition-colors ${status.lineClass}`} />

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h5 className={`truncate text-sm font-semibold leading-tight ${status.muted ? 'text-[#8fa1b2] line-through' : 'text-[#1d292e]'}`}>
                        {appt.clientNameSnapshot || appt.title || 'Client'}
                      </h5>
                      <p className={`mt-0.5 truncate text-xs ${status.muted ? 'text-[#c4cdd7]' : 'text-[#3f565f]'}`}>
                        {appt.serviceName || 'Consultation'} · {appt.duration || '60 min'}
                      </p>
                    </div>

                    {/* Badge */}
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.badgeClass}`}>
                      {status.label}
                    </span>

                    <span
                      className="material-symbols-outlined text-[18px] text-[#c4cdd7] transition-colors group-hover:text-[#2e5b97]"
                      style={outlinedIcon}
                    >
                      chevron_right
                    </span>
                  </button>
                );
              })
            ) : (
              <div className={`${dashboardPanel} border-dashed p-10 text-center`}>
                <span className="material-symbols-outlined text-[40px] text-[#d5d9d4] block mb-3" style={outlinedIcon}>
                  calendar_today
                </span>
                <p className="text-sm font-medium text-[#3f565f]">
                  {normalizedSearch ? 'Aucune séance ne correspond à cette recherche.' : 'Pas de séances aujourd\'hui.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent notes sidebar */}
        <div className="flex flex-col gap-5">
          <div className={`${dashboardPanelSoft} space-y-4 p-5`}>
            <div className={dashboardSectionHeader}>
              <h4 className={dashboardTitle}>Notes récentes</h4>
              <button
                onClick={onEditGoal}
                className="text-xs font-semibold text-[#2e5b97] hover:underline"
              >
                Metrics
              </button>
            </div>

            <div className="space-y-3">
              {progressNotes.length > 0 ? (
                progressNotes.map((appt) => (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    className="block w-full rounded-[14px] border border-[#d9dee4] bg-white p-4 text-left transition hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                  >
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#334e72]">
                      {formatDayLabel(appt.date)}
                    </p>
                    <p className="truncate text-sm font-semibold text-[#1d292e]">
                      {appt.clientNameSnapshot || appt.title || 'Client'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#3f565f]">
                      {appt.notes?.trim()}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-[#d9dee4] p-4 text-sm text-[#8fa1b2] text-center">
                  {normalizedSearch ? 'Aucune note ne correspond.' : 'Aucune note récente.'}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('clients')}
              className="w-full rounded-[14px] border border-[#d9dee4] bg-white py-2.5 text-sm font-semibold text-[#3f565f] transition hover:bg-[#f7f4ec] hover:text-[#312e81]"
            >
              Voir les clients
            </button>
          </div>
        </div>
      </section>

      {/* ── Promo banners ── */}
      <section className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2">
        {/* Photo card */}
        <div className="group relative h-44 overflow-hidden rounded-[20px] border border-[#d9ddd7] shadow-sm">
          <img
            alt="Salle de thérapie"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPaRBukscQbQOlF_Wzn70s27jimKubN_LdBwTO204FQl-JfKeDEvqyoq_Fpt3c75Domx6A8ge2H8JYAW32_4JAboD7ym4lxCqVi0HOJe5UzfXWiKsXi84wRnsyHH7OB8RPVjEJzKnEumDPZG76cXA8yYsaw421zdnFPY_mCB-SJPo23ncLTImpofqOA_4SC_Eaud2E1H7ZR7KXWmqAfBkD6INkgrlPxrImNCPQbllB4d8u8PFR1jW09fOx0Zy6EECGhRLwxP-nxiY"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/65 to-transparent p-5">
            <h4 className="text-xl font-bold text-white leading-tight">Nouveaux Rituels</h4>
            <p className="mb-3 text-sm text-white/80">Introduisez des expériences curatives à vos clients.</p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-fit rounded-[12px] border border-white/30 bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#1a1c1b]"
            >
              Configurer →
            </button>
          </div>
        </div>

        {/* Insight card */}
        <div className="flex flex-col justify-between rounded-[20px] bg-[linear-gradient(135deg,#184f40_0%,#2e5b97_100%)] p-6 shadow-[0_18px_40px_rgba(99,102,241,0.24)]">
          <div>
            <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
              Insight agenda
            </span>
            <h4 className="text-xl font-bold leading-tight text-white">
              Optimisez votre planning
            </h4>
            <p className="mt-2 text-sm text-white/75">
              Vos matinées du jeudi sont les plus demandées. Ouvrez plus de créneaux pour répondre à la demande.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              <img
                alt="Client 1"
                className="h-8 w-8 rounded-full border-2 border-[#4c1d95] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_4sEw_ELEGLzOS5ExgiWm4rj6-bBXQIJqJUtdsz-d436QzSO6YFCgyVPeFB8eqYI4cwTnovlKu4NYrrtWCDx4I1MJ4ywRjt2Oq1HWZCCeZuraiV13GTO7VVcTj9iss8qpUj37v3xdcYiyBL7yDr_xPSuoInYpKjzjoqD0k9jiqIpTtbj57bXWY51paTso04MyGKQKgpgT3PvALxSWa64EdNojuO1imURT1_wq37012jbA62qRddBNyZ1b-_CzGfM4vcnV_rGxmTI"
              />
              <img
                alt="Client 2"
                className="h-8 w-8 rounded-full border-2 border-[#4c1d95] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7yt8Zx0TAbU8jMZ2_yb2Xv7GPN5qANDJF0F7wq6vSQeTwdcEhTiHHK_fZ-2Suz3br25vyF8ujPDk5wRmX_qblc0VsaCMSUu-BGkzTwkdUwktQq_nkl7lMzOCqza9l7b18pExovc4PsAQ-wR1WgiE9fR67FazH6Pto3Inept49yxLbDRb30FVtkbzzhnruPF5ogI621DrI6WiLmXKYa67BWN6IUw8IqvU9FeX5FsPxrCAwHAHntqi_hgy3cCCPgYHNbP_HZJi7OtU"
              />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#4c1d95] bg-[#84cc16] text-[10px] font-bold text-[#1d292e]">
                +12
              </div>
            </div>
            <p className="text-xs font-medium text-white/80">Liste d&apos;attente active</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  iconClass,
  badgeClass,
  badgeLabel,
  label,
  value,
}: {
  icon: string;
  iconClass: string;
  badgeClass: string;
  badgeLabel: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#d9dee4] bg-[rgba(255,255,255,0.94)] p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-[1px] hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-[12px] p-2.5 ${iconClass}`}>
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
            {icon}
          </span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeClass}`}>{badgeLabel}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3f565f]">{label}</p>
      <h3 className="mt-1 text-2xl font-semibold text-[#1d292e]">{value}</h3>
    </div>
  );
}
