import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Appointment } from '../types';
import { dashboardPanel, dashboardPanelSoft, dashboardTitle, dashboardTitleLg, dashboardMutedText } from './dashboardTheme';

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

function appointmentStatus(appt: Appointment, todayStr: string) {
  if (appt.status === 'cancelled') {
    return {
      label: 'CANCELLED',
      badgeClass: 'bg-[#ffdad6] text-[#93000a]',
      lineClass: 'bg-stone-200',
      muted: true,
    };
  }

  if (appt.paid) {
    return {
      label: 'CONFIRMED',
      badgeClass: 'bg-emerald-50 text-emerald-700',
      lineClass: 'bg-emerald-200',
      muted: false,
    };
  }

  if (appt.date && appt.date < todayStr) {
    return {
      label: 'PENDING',
      badgeClass: 'bg-stone-100 text-stone-600',
      lineClass: 'bg-[#fcdaaf]',
      muted: false,
    };
  }

  return {
    label: 'SCHEDULED',
    badgeClass: 'bg-stone-100 text-stone-600',
    lineClass: 'bg-[#fcdaaf]',
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
  if (!dateStr) return 'Recently';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Recently';
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
    () => appointments.filter((appt) => !appt.paid).length,
    [appointments],
  );

  const urgentInvoices = useMemo(
    () => appointments.filter((appt) => !appt.paid && appt.date && appt.date < todayStr).length,
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
  const todayLabel = format(now, 'EEEE, MMMM do');

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 md:p-10">
      {normalizedSearch && (
        <section className="space-y-2">
          <p className="text-sm text-stone-500">
            Filtre actif : <span className="font-medium text-[#435544]">{searchQuery.trim()}</span>
          </p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          icon="payments"
          iconClass="bg-emerald-100 text-emerald-800"
          badgeClass="bg-emerald-50 text-emerald-600"
          badgeLabel={`+${revenueChange}%`}
          label="Monthly Revenue"
          value={`${paidThisMonth.toLocaleString('en-US')} CHF`}
        />
        <MetricCard
          icon="task_alt"
          iconClass="bg-stone-200 text-stone-700"
          badgeClass="bg-stone-100 text-stone-500"
          badgeLabel="On track"
          label="Completed Sessions"
          value={completedSessions.toString()}
        />
        <MetricCard
          icon="pending_actions"
          iconClass="bg-[#fcdaaf] text-[#775e3c]"
          badgeClass="bg-[#ffddb2] text-[#725a38]"
          badgeLabel={`${urgentInvoices} urgent`}
          label="Pending Invoices"
          value={pendingInvoices.toString()}
        />
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className={dashboardTitle}>
              Today&apos;s Agenda
            </h4>
            <button
              onClick={() => onNavigate('scheduler')}
              className="text-sm font-medium text-[#435544] hover:underline"
            >
              View full schedule
            </button>
          </div>

          <div className="space-y-4">
            {todayAppts.length > 0 ? (
              todayAppts.slice(0, 4).map((appt) => {
                const status = appointmentStatus(appt, todayStr);
                const { hour, period } = displayTime(appt.time);

                return (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    className={`group flex w-full items-center gap-6 p-5 text-left transition-all duration-300 hover:border-emerald-200 ${dashboardPanel} ${
                      status.muted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="min-w-[60px] text-center">
                      <p className={`text-sm font-bold ${status.muted ? 'text-stone-400' : 'text-stone-900'}`}>{hour}</p>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400">{period}</p>
                    </div>
                    <div className={`h-10 w-[2px] transition-colors ${status.lineClass}`} />
                    <div className="min-w-0 flex-1">
                      <h5 className={`truncate text-sm font-semibold ${status.muted ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                        {appt.clientNameSnapshot || appt.title || 'Client'}
                      </h5>
                      <p className={`truncate text-xs ${status.muted ? 'text-stone-400' : 'text-stone-500'}`}>
                        {appt.serviceName || 'Clinical Consultation'} • {appt.duration || '60 min'}
                      </p>
                    </div>
                    <div className="flex items-center -space-x-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${status.badgeClass}`}>{status.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-stone-300 transition-colors group-hover:text-stone-600" style={outlinedIcon}>
                      more_vert
                    </span>
                  </button>
                );
              })
            ) : (
              <div className={`${dashboardPanel} border-dashed p-10 text-center text-stone-500`}>
                {normalizedSearch ? 'Aucune séance ne correspond à cette recherche aujourd’hui.' : 'No sessions scheduled for today.'}
              </div>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col space-y-8">
          <div className={`${dashboardPanelSoft} space-y-4 p-6`}>
            <div className="flex items-center justify-between">
              <h4 className={dashboardTitle}>
                Recent Notes
              </h4>
              <button
                onClick={onEditGoal}
                className="text-xs font-medium text-[#435544] hover:underline"
              >
                Review metrics
              </button>
            </div>

            <div className="space-y-4">
              {progressNotes.length > 0 ? (
                progressNotes.map((appt) => (
                  <button
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                  className={`block w-full p-4 text-left transition hover:bg-white ${dashboardPanel}`}
                  >
                    <p className="mb-1 text-xs font-bold text-[#435544]">{formatDayLabel(appt.date)}</p>
                    <p className="truncate text-sm font-medium text-stone-800">
                      {(appt.clientNameSnapshot || appt.title || 'Client') + ': ' + appt.notes?.trim()}
                    </p>
                    <p className="mt-2 text-xs text-stone-500">
                      {appt.time || 'Added manually'}
                    </p>
                  </button>
                ))
              ) : (
                <div className={`${dashboardPanel} p-4 text-sm text-stone-500`}>
                  {normalizedSearch ? 'Aucune note récente ne correspond à cette recherche.' : 'No recent notes available yet.'}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('clients')}
              className="w-full py-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#435544]"
            >
              Write new note
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-2">
        <div className="group relative h-48 overflow-hidden rounded-[28px] border border-[#d9ddd7] shadow-[0_10px_30px_rgba(26,28,27,0.04)]">
          <img
            alt="Therapy room"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPaRBukscQbQOlF_Wzn70s27jimKubN_LdBwTO204FQl-JfKeDEvqyoq_Fpt3c75Domx6A8ge2H8JYAW32_4JAboD7ym4lxCqVi0HOJe5UzfXWiKsXi84wRnsyHH7OB8RPVjEJzKnEumDPZG76cXA8yYsaw421zdnFPY_mCB-SJPo23ncLTImpofqOA_4SC_Eaud2E1H7ZR7KXWmqAfBkD6INkgrlPxrImNCPQbllB4d8u8PFR1jW09fOx0Zy6EECGhRLwxP-nxiY"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-r from-stone-900/60 to-transparent p-6">
            <h4 className="text-xl font-medium text-white [font-family:'Public_Sans',sans-serif]">New Ritual Bundles</h4>
            <p className="mb-4 text-sm text-stone-200">Introduce curated experiences to your clients.</p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-fit rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-stone-900"
            >
              Configure Services
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[28px] border border-[#355138] bg-[#435544] p-8 text-[#daeed8] shadow-[0_10px_30px_rgba(26,28,27,0.08)]">
          <div>
            <h4 className="mb-2 text-xl font-semibold text-white [font-family:'Public_Sans',sans-serif]">
              Optimize Your Schedule
            </h4>
            <p className="text-sm text-emerald-100/70">
              Your busiest time is Thursday mornings. Try opening more slots to meet the demand of your recurring clients.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                alt="Client 1"
                className="h-8 w-8 rounded-full border-2 border-emerald-900 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_4sEw_ELEGLzOS5ExgiWm4rj6-bBXQIJqJUtdsz-d436QzSO6YFCgyVPeFB8eqYI4cwTnovlKu4NYrrtWCDx4I1MJ4ywRjt2Oq1HWZCCeZuraiV13GTO7VVcTj9iss8qpUj37v3xdcYiyBL7yDr_xPSuoInYpKjzjoqD0k9jiqIpTtbj57bXWY51paTso04MyGKQKgpgT3PvALxSWa64EdNojuO1imURT1_wq37012jbA62qRddBNyZ1b-_CzGfM4vcnV_rGxmTI"
              />
              <img
                alt="Client 2"
                className="h-8 w-8 rounded-full border-2 border-emerald-900 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7yt8Zx0TAbU8jMZ2_yb2Xv7GPN5qANDJF0F7wq6vSQeTwdcEhTiHHK_fZ-2Suz3br25vyF8ujPDk5wRmX_qblc0VsaCMSUu-BGkzTwkdUwktQq_nkl7lMzOCqza9l7b18pExovc4PsAQ-wR1WgiE9fR67FazH6Pto3Inept49yxLbDRb30FVtkbzzhnruPF5ogI621DrI6WiLmXKYa67BWN6IUw8IqvU9FeX5FsPxrCAwHAHntqi_hgy3cCCPgYHNbP_HZJi7OtU"
              />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-900 bg-emerald-700 text-[10px] font-bold">
                +12
              </div>
            </div>
            <p className="text-xs text-emerald-100">Waitlist active for Elena R.</p>
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
    <div className="rounded-[28px] border border-stone-100 bg-[#f4f3f1] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl p-2 ${iconClass}`}>
          <span className="material-symbols-outlined" style={filledIcon}>
            {icon}
          </span>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${badgeClass}`}>{badgeLabel}</span>
      </div>
      <p className={`mb-1 font-medium ${dashboardMutedText}`}>{label}</p>
      <h3 className={dashboardTitleLg}>{value}</h3>
    </div>
  );
}
