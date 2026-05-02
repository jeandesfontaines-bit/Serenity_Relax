import React from 'react';
import { Ban, CheckCircle2, ChevronLeft, ChevronRight, Lock, Plus, Settings, SlidersHorizontal, Calendar, Download, Filter } from 'lucide-react';
import {
  dashboardIconButton,
  dashboardMutedText,
  dashboardPrimaryButton,
  dashboardSecondaryButton,
  dashboardShell,
  dashboardTitleLg,
  dashboardToolbarButton,
  dashboardToolbarInput,
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
    blockMode: boolean;
    absenceMode: boolean;
    absencePendingCount: number;
    onToggleBlockMode: () => void;
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
  { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
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
  const searchPlaceholder =
    activePage === 'scheduler'
      ? 'Rechercher un rendez-vous...'
      : activePage === 'clients' || activePage === 'client-detail'
        ? 'Rechercher un client...'
        : activePage === 'accounting'
          ? 'Rechercher une transaction...'
          : activePage === 'settings'
            ? 'Rechercher un réglage...'
            : 'Rechercher des rendez-vous, clients ou notes...';

  return (
    <div className={`h-screen h-dvh overflow-hidden ${dashboardShell}`}>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-[#c4c7c3]/70 bg-[rgba(247,243,242,0.82)] p-6 backdrop-blur-[20px] md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#635e55] text-white shadow-[0_14px_32px_rgba(99,94,85,0.14)]">
            <span className="material-symbols-outlined" style={filledIcon}>
              spa
            </span>
          </div>
          <div>
            <h1 className="text-[28px] font-normal tracking-[-0.02em] text-[#1c1b1b] [font-family:'Noto_Serif',serif]">
              Serene Sanctuary
            </h1>
            <p className="text-[12px] uppercase tracking-[0.1em] text-[#757875]">Portail thérapeute</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.id, activePage);
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left text-sm transition-all duration-300 ${
                  active
                    ? 'border border-[#c4c7c3] bg-[rgba(255,255,255,0.78)] font-medium text-[#1c1b1b] shadow-[0_14px_32px_rgba(99,94,85,0.08)] backdrop-blur-[18px]'
                    : 'border border-transparent text-[#444845] hover:border-[#c4c7c3] hover:bg-[rgba(255,255,255,0.74)] hover:text-[#1c1b1b]'
                }`}
              >
                <span className="material-symbols-outlined" style={active ? filledIcon : outlinedIcon}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <button
            onClick={() => onNavigate('scheduler')}
            className={`flex w-full items-center justify-center gap-2 ${dashboardPrimaryButton}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={filledIcon}>
              add
            </span>
            <span>Nouveau rendez-vous</span>
          </button>

        </div>
      </aside>

      <div className="flex h-full flex-col pb-20 md:ml-64 md:pb-0">
        <header className="z-40 shrink-0 border-b border-[#c4c7c3]/70 bg-[rgba(252,248,247,0.78)] px-4 py-4 backdrop-blur-[20px] md:px-8">
          {activePage === 'scheduler' && schedulerToolbar ? (
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
                <div className="min-w-0">
                  <span className="mb-1 block text-[12px] font-medium uppercase tracking-[0.1em] text-[#757875]">
                    {schedulerToolbar.eyebrow}
                  </span>
                  <h2 className={`truncate capitalize ${dashboardTitleLg}`}>
                    {schedulerToolbar.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={schedulerToolbar.onPrev}
                    className={dashboardIconButton}
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={schedulerToolbar.onToday}
                    className={dashboardSecondaryButton}
                  >
                    Aujourd&apos;hui
                  </button>
                  <button
                    onClick={schedulerToolbar.onNext}
                    className={dashboardIconButton}
                  >
                    <ChevronRight size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                <div className="flex items-center gap-3">
                  <div className="flex rounded-full border border-[#c4c7c3] bg-[rgba(255,255,255,0.72)] p-1 shadow-[0_14px_32px_rgba(99,94,85,0.06)] backdrop-blur-[18px]">
                    {(['week', 'month'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => schedulerToolbar.onToggleView(view)}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                          schedulerToolbar.view === view ? 'bg-[#635e55] text-white shadow-sm' : 'text-[#444845] hover:bg-[rgba(255,255,255,0.8)] hover:text-[#1c1b1b]'
                        }`}
                      >
                        {view === 'week' ? 'Semaine' : 'Mois'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={schedulerToolbar.onToggleBlockMode}
                    className={`hidden h-11 items-center gap-2 rounded-[14px] border px-4 text-sm font-semibold transition-all sm:flex ${
                      schedulerToolbar.blockMode
                        ? 'border-[#635e55] bg-[#635e55] text-white'
                        : 'border-[#c4c7c3] bg-[rgba(255,255,255,0.72)] text-[#1c1b1b] hover:bg-[rgba(255,255,255,0.92)]'
                    }`}
                  >
                    <Lock size={14} strokeWidth={1.6} />
                    Créneaux
                  </button>

                  <button
                    onClick={schedulerToolbar.onToggleAbsenceMode}
                    className={`flex h-11 items-center gap-2 rounded-[14px] px-4 text-sm font-semibold transition-all ${
                      schedulerToolbar.absenceMode
                        ? 'border border-[#635e55] bg-[#635e55] text-white'
                        : 'border border-[#c4c7c3] bg-[rgba(255,255,255,0.72)] text-[#1c1b1b] hover:bg-[rgba(255,255,255,0.92)]'
                    }`}
                  >
                    {schedulerToolbar.absenceMode ? <CheckCircle2 size={14} strokeWidth={1.6} /> : <Ban size={14} strokeWidth={1.6} />}
                    <span>
                      {schedulerToolbar.absenceMode ? `Valider (${schedulerToolbar.absencePendingCount})` : 'Absences'}
                    </span>
                  </button>

                  <button
                    onClick={schedulerToolbar.onOpenSettings}
                    className={dashboardIconButton}
                    aria-label="Ouvrir la configuration"
                  >
                    <Settings size={16} strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            </div>
          ) : activePage === 'client-detail' && clientDetailToolbar ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  onClick={clientDetailToolbar.onBack}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[#c3c8c0] bg-white text-[#434842] transition-colors hover:bg-[#f4f3f1]"
                  aria-label="Retour a la liste des clients"
                >
                  <ChevronLeft size={20} strokeWidth={1.7} />
                </button>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.3em] text-[#747872]">
                    {clientDetailToolbar.eyebrow}
                  </p>
                  <h2 className="truncate text-3xl font-semibold leading-none text-[#435544] [font-family:'Public_Sans',sans-serif]">
                    {clientDetailToolbar.title}
                  </h2>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <button
                  onClick={clientDetailToolbar.onOpenHistory}
                  className={dashboardSecondaryButton}
                >
                  Historique
                </button>
                <button
                  onClick={clientDetailToolbar.onOpenNotes}
                  className={dashboardSecondaryButton}
                >
                  Notes
                </button>
              </div>
            </div>
          ) : activePage === 'clients' && clientsToolbar ? (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)_minmax(0,1fr)] lg:items-center">
              <div className="min-w-0">
                <h2 className={`truncate tracking-tight text-[#435544] ${dashboardTitleLg}`}>
                  {clientsToolbar.title}
                </h2>
                <p className={`mt-1 truncate ${dashboardMutedText}`}>
                  {clientsToolbar.subtitle}
                </p>
              </div>

              <div className="relative w-full max-w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-stone-400" style={outlinedIcon}>
                  search
                </span>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => onGlobalSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={dashboardToolbarInput}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  onClick={clientsToolbar.onToggleFilters}
                  className={dashboardToolbarButton}
                >
                  <SlidersHorizontal size={16} strokeWidth={1.75} />
                  Filtres avancés
                </button>

                <button
                  onClick={clientsToolbar.onAddClient}
                  className={`flex items-center justify-center gap-2 ${dashboardPrimaryButton}`}
                >
                  <Plus size={16} strokeWidth={1.9} />
                  Ajouter un client
                </button>
              </div>
            </div>
          ) : activePage === 'accounting' && financeToolbar ? (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)_minmax(0,1fr)] lg:items-center">
              <div className="min-w-0">
                <div className="text-xl font-normal tracking-tight text-[#435544] [font-family:'Public_Sans',sans-serif]">
                  {financeToolbar.title} <span className="mx-2 text-sm text-[#747872]/40">/</span>
                  <span className="text-base text-[#747872]">{financeToolbar.subtitle}</span>
                </div>
              </div>

              <div className="relative w-full max-w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-stone-400" style={outlinedIcon}>
                  search
                </span>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => onGlobalSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={dashboardToolbarInput}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {financeToolbar.showDateRange && (
                  <div className="flex items-center gap-2 rounded-[14px] border border-[#c3c8c0] bg-white px-3 py-2.5">
                    <Calendar size={14} strokeWidth={1.6} className="text-[#747872]" />
                    <input
                      type="date"
                      value={financeToolbar.dateRange.start}
                      onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, start: e.target.value })}
                      className="bg-transparent text-sm text-[#434842] outline-none"
                    />
                    <span className="text-[#c3c8c0]">→</span>
                    <input
                      type="date"
                      value={financeToolbar.dateRange.end}
                      onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, end: e.target.value })}
                      className="bg-transparent text-sm text-[#434842] outline-none"
                    />
                  </div>
                )}
                
                <button
                  onClick={financeToolbar.onToggleDateFilter}
                  className={dashboardToolbarButton}
                >
                  <Filter size={16} strokeWidth={1.75} />
                  Filtre par date
                </button>

                <button
                  onClick={financeToolbar.onExport}
                  className={dashboardToolbarButton}
                >
                  <Download size={16} strokeWidth={1.75} />
                  {financeToolbar.selectedCount > 0 ? `Exporter (${financeToolbar.selectedCount})` : 'Exporter'}
                </button>
              </div>
            </div>
          ) : activePage === 'settings' && settingsToolbar ? (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)_minmax(0,1fr)] lg:items-center">
              <div className="min-w-0">
                <h2 className={`truncate tracking-tight text-[#435544] ${dashboardTitleLg}`}>
                  {settingsToolbar.title}
                </h2>
                <p className={`mt-1 ${dashboardMutedText}`}>
                  {settingsToolbar.subtitle}
                </p>
              </div>

              <div className="relative w-full max-w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-stone-400" style={outlinedIcon}>
                  search
                </span>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => onGlobalSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={dashboardToolbarInput}
                />
              </div>

              <div className="flex items-center justify-start lg:justify-end">
                {settingsToolbar.statusLabel ? (
                  <span className="rounded-[999px] border border-[#d4e8d2] bg-[#f4fbf3] px-3 py-1.5 text-xs font-semibold text-[#435544]">
                    {settingsToolbar.statusLabel}
                  </span>
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)_minmax(0,1fr)] lg:items-center">
              {activePage === 'dashboard' && dashboardSummary ? (
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold tracking-tight text-[#1a1c1b] [font-family:'Public_Sans',sans-serif]">
                  {dashboardSummary.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                  <span className="material-symbols-outlined text-[18px]" style={outlinedIcon}>
                    calendar_today
                  </span>
                  <span className="truncate">{dashboardSummary.subtitle}</span>
                </div>
              </div>
              ) : (
                <div />
              )}

              <div className="relative w-full max-w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-stone-400" style={outlinedIcon}>
                  search
                </span>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => onGlobalSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={dashboardToolbarInput}
                />
              </div>

              <div className="hidden lg:block" />
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-stone-200 bg-stone-50/95 px-3 py-2 backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, activePage);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[14px] px-1 py-2 text-[11px] transition-all ${
                active ? 'text-emerald-900' : 'text-stone-500'
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
