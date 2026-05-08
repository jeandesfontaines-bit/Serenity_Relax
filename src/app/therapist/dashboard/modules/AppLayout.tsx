import React from 'react';
import { Ban, CheckCircle2, ChevronLeft, ChevronRight, Plus, Settings, SlidersHorizontal, Download, Filter } from 'lucide-react';
import {
  dashboardShell,
} from './dashboardTheme';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  dashboardSummary?: {
    title: string;
    subtitle: string;
  };
  schedulerToolbar?: {
    eyebrow: string;
    title: string;
    view: 'month' | 'week';
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onToggleView: (view: 'month' | 'week') => void;
    absenceMode: boolean;
    absencePendingCount: number;
    onToggleAbsenceMode: () => void;
    onOpenSettings: () => void;
  };
  clientsToolbar?: {
    title: string;
    subtitle: string;
    onToggleFilters: () => void;
    onAddClient: () => void;
  };
  clientDetailToolbar?: {
    eyebrow: string;
    title: string;
    onBack: () => void;
    onOpenHistory: () => void;
    onOpenNotes: () => void;
  };
  financeToolbar?: {
    title: string;
    subtitle: string;
    showDateRange: boolean;
    dateRange: { start: string; end: string };
    onDateRangeChange: (range: { start: string; end: string }) => void;
    onToggleDateFilter: () => void;
    onExport: () => void;
    selectedCount: number;
  };
  settingsToolbar?: {
    title: string;
    subtitle: string;
    statusLabel?: string;
  };
}

const NAV_ITEMS = [
  { id: 'scheduler', label: 'Agenda', icon: 'calendar_today' },
  { id: 'clients', label: 'Clients', icon: 'group' },
  { id: 'accounting', label: 'Finances', icon: 'payments' },
  { id: 'settings', label: 'Paramètres', icon: 'settings' },
];

const filledIcon = {
  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
} as const;

const outlinedIcon = {
  fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
} as const;

function isActive(itemId: string, activePage: string) {
  if (itemId === 'clients' && activePage === 'client-detail') return true;
  return itemId === activePage;
}

export default function AppLayout({
  children,
  activePage,
  onNavigate,
  globalSearch,
  onGlobalSearchChange,
  dashboardSummary,
  schedulerToolbar,
  clientsToolbar,
  clientDetailToolbar,
  financeToolbar,
  settingsToolbar,
}: AppLayoutProps) {
  const schedulerMode = activePage === 'scheduler';
  const searchPlaceholder = 'Rechercher un rendez-vous';

  return (
    <div className={`h-screen h-dvh overflow-hidden ${dashboardShell}`}>
      <div className="flex min-h-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="z-40 shrink-0 border-b border-[#dbe3ef]/90 bg-[rgba(251,252,255,0.85)] px-4 py-3 backdrop-blur-[24px] md:px-8">
          <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[auto_auto_minmax(220px,280px)_minmax(0,1fr)] md:items-center md:gap-4 xl:grid-cols-[auto_auto_minmax(260px,340px)_minmax(0,1fr)] xl:gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden shrink-0 items-baseline gap-2 transition-opacity hover:opacity-80 md:flex"
            >
              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.3em] text-[#0f172a] md:text-[0.88rem]">
                SERENITY
              </p>
            </button>

            <nav className="hidden items-center gap-1.5 md:flex">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.id, activePage);
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`dashboard-topbar-control ${
                      active
                        ? 'dashboard-topbar-control-active'
                        : 'dashboard-topbar-control-muted'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:block md:relative md:w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="dashboard-topbar-search"
              />
            </div>

            {/* Dynamic Content / Toolbar Area */}
            <div className="flex flex-1 items-center justify-between gap-4 min-w-0 md:justify-end">
              {activePage === 'scheduler' && schedulerToolbar ? (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:gap-4">
                  <div className="flex shrink-0 items-center gap-3 lg:gap-4">
                    <button onClick={schedulerToolbar.onPrev} className="dashboard-topbar-icon dashboard-topbar-icon-muted" aria-label="Période précédente">
                      <ChevronLeft size={18} strokeWidth={2} />
                    </button>
                    <button onClick={schedulerToolbar.onToday} className="dashboard-topbar-control dashboard-topbar-icon-muted dashboard-topbar-today">
                      AUJOURD&apos;HUI
                    </button>
                    <button onClick={schedulerToolbar.onNext} className="dashboard-topbar-icon dashboard-topbar-icon-muted" aria-label="Période suivante">
                      <ChevronRight size={18} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="dashboard-topbar-switch hidden sm:flex">
                      {(['week', 'month'] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => schedulerToolbar.onToggleView(view)}
                          className={`dashboard-topbar-segment ${
                            schedulerToolbar.view === view
                              ? 'dashboard-topbar-segment-active'
                              : ''
                          }`}
                        >
                          {view === 'week' ? 'Semaine' : 'Mois'}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={schedulerToolbar.onToggleAbsenceMode}
                      className={`dashboard-topbar-icon ${
                        schedulerToolbar.absenceMode
                          ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]'
                          : 'text-[#0f172a]'
                      }`}
                      aria-label={schedulerToolbar.absenceMode ? `Valider les absences (${schedulerToolbar.absencePendingCount})` : 'Absences'}
                    >
                      {schedulerToolbar.absenceMode ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    </button>

                    <button onClick={schedulerToolbar.onOpenSettings} className="dashboard-topbar-icon">
                      <Settings size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ) : activePage === 'client-detail' && clientDetailToolbar ? (
                <div className="flex items-center justify-between flex-1 gap-4 md:flex-none">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clientDetailToolbar.onBack}
                      className="dashboard-topbar-icon"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={clientDetailToolbar.onOpenHistory} className="dashboard-topbar-control min-w-[112px]">
                      Historique
                    </button>
                    <button onClick={clientDetailToolbar.onOpenNotes} className="dashboard-topbar-control min-w-[96px]">
                      Notes
                    </button>
                  </div>
                </div>
              ) : activePage === 'clients' && clientsToolbar ? (
                <div className="flex items-center justify-between flex-1 gap-4 md:flex-none">
                  <div className="flex items-center gap-2">
                    <button onClick={clientsToolbar.onToggleFilters} className="dashboard-topbar-icon">
                      <SlidersHorizontal size={16} />
                    </button>
                    <button
                      onClick={clientsToolbar.onAddClient}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f172a] text-white transition-all duration-200 hover:bg-[#111827]"
                      aria-label="Ajouter un client"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ) : activePage === 'accounting' && financeToolbar ? (
                <div className="flex items-center justify-between flex-1 gap-4 md:flex-none">
                  <div className="flex items-center gap-2">
                    {financeToolbar.showDateRange && (
                      <div className="hidden xl:flex h-10 items-center gap-2 rounded-full border border-[#dbe3ef] bg-white px-3">
                        <input
                          type="date"
                          value={financeToolbar.dateRange.start}
                          onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, start: e.target.value })}
                          className="bg-transparent text-[12px] text-[#475569] outline-none"
                        />
                        <span className="text-slate-300">→</span>
                        <input
                          type="date"
                          value={financeToolbar.dateRange.end}
                          onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, end: e.target.value })}
                          className="bg-transparent text-[12px] text-[#475569] outline-none"
                        />
                      </div>
                    )}
                    <button onClick={financeToolbar.onToggleDateFilter} className="dashboard-topbar-icon">
                      <Filter size={16} />
                    </button>
                    <button onClick={financeToolbar.onExport} className="dashboard-topbar-icon">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ) : activePage === 'settings' && settingsToolbar ? (
                <div className="flex items-center justify-between flex-1 gap-4 md:flex-none">
                  <div className="flex items-center gap-3 ml-auto">
                    {settingsToolbar.statusLabel && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        {settingsToolbar.statusLabel}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end flex-1 md:flex-none" />
              )}
            </div>
          </div>
        </header>

        <main className={`flex-1 min-h-0 ${schedulerMode ? 'overflow-hidden' : 'overflow-y-auto'}`}>{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#dbe3ef] bg-[rgba(251,252,255,0.95)] px-3 py-2 backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, activePage);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[14px] px-1 py-2 text-[11px] transition-all ${
                active ? 'bg-[#eef2ff] text-[#4338ca]' : 'text-[#64748b]'
              }`}
            >
              <span className="material-symbols-outlined" style={active ? filledIcon : outlinedIcon}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
