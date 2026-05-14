'use client';
import React from 'react';
import { 
  Ban, ChevronLeft, ChevronRight, Plus, Settings, SlidersHorizontal, 
  Download, Filter, LogOut, Search, Calendar, Users, Wallet, 
  LayoutGrid, Bell, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { id: 'scheduler', label: 'Agenda', icon: Calendar },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'accounting', label: 'Finances', icon: Wallet },
];

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
  onLogout,
}: AppLayoutProps) {
  const searchPlaceholder = 'Rechercher un patient...';

  return (
    <div className="h-screen h-dvh overflow-hidden bg-neutral-100 text-neutral-900 flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="z-[100] shrink-0 border-b border-neutral-200 bg-white/95 backdrop-blur-2xl px-6 py-4 md:px-12 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <LayoutGrid size={16} strokeWidth={2.5} />
            </div>
            <p className="text-xl font-bold tracking-tight text-neutral-900">
              SERENITY
            </p>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex bg-neutral-100 p-1 rounded-full border border-neutral-200 shadow-sm">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.id, activePage);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`h-9 px-5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-neutral-900 text-white shadow-xl'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  <Icon size={14} strokeWidth={active ? 3 : 2.5} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions Area */}
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="hidden lg:block relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" size={14} strokeWidth={2.5} />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-[320px] h-10 pl-10 pr-4 rounded-full bg-white border border-neutral-200 text-[12px] font-semibold tracking-tight placeholder:text-neutral-400 focus:border-neutral-900 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="h-10 w-px bg-neutral-200 hidden md:block" />

          {/* Notifications & Profile */}
          <div className="flex items-center gap-3">
             <button className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 transition-all relative shadow-sm">
                <Bell size={16} strokeWidth={2.5} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-neutral-900 rounded-full border border-white" />
             </button>
             {onLogout && (
              <button
                onClick={onLogout}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                <LogOut size={16} strokeWidth={2.5} />
              </button>
            )}
             <button
               onClick={() => onNavigate('settings')}
               className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                 activePage === 'settings'
                   ? 'bg-neutral-900 text-white'
                   : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900'
               }`}
             >
                <Settings size={16} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </header>

      {/* ── Sub-header / Toolbar ── */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activePage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white border-b border-neutral-200 px-6 py-3 md:px-12 flex items-center justify-between min-h-[68px] shadow-[0_8px_24px_rgba(0,0,0,0.025)]"
        >
          {/* Toolbar content based on active page */}
          <div className="flex-1 flex items-center justify-between gap-8">
            {activePage === 'scheduler' && schedulerToolbar ? (
              <>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full border border-neutral-200 shadow-sm">
                      <button onClick={schedulerToolbar.onPrev} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-neutral-600 hover:text-neutral-900 transition-all shadow-sm">
                        <ChevronLeft size={14} strokeWidth={3} />
                      </button>
                      <button onClick={schedulerToolbar.onToday} className="h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 hover:bg-white transition-all">
                        AUJOURD&apos;HUI
                      </button>
                      <button onClick={schedulerToolbar.onNext} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-neutral-600 hover:text-neutral-900 transition-all shadow-sm">
                        <ChevronRight size={14} strokeWidth={3} />
                      </button>
                   </div>
                   <div className="h-8 w-px bg-neutral-200" />
                   <div className="flex bg-neutral-100 p-1 rounded-full border border-neutral-200 shadow-sm">
                      {(['week', 'month'] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => schedulerToolbar.onToggleView(view)}
                          className={`h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                            schedulerToolbar.view === view
                              ? 'bg-neutral-900 text-white shadow-lg'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {view === 'week' ? 'Semaine' : 'Mois'}
                        </button>
                      ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={schedulerToolbar.onToggleAbsenceMode}
                    className={`flex items-center gap-2 h-10 px-4 rounded-full transition-all border shadow-sm ${
                      schedulerToolbar.absenceMode
                        ? 'bg-red-500 border-red-500 text-white shadow-xl'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-900'
                    }`}
                  >
                    <Ban size={14} strokeWidth={3} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Mode Absence</span>
                  </button>
                  <button onClick={schedulerToolbar.onOpenSettings} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 text-white hover:shadow-xl transition-all">
                    <SlidersHorizontal size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </>
            ) : activePage === 'clients' && clientsToolbar ? (
              <>
                 <div>
                    <h2 className="text-lg font-bold tracking-tighter text-neutral-900">Répertoire Patients</h2>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={clientsToolbar.onToggleFilters} className="flex items-center gap-2 h-10 px-4 rounded-full bg-white text-neutral-700 hover:text-neutral-900 transition-all border border-neutral-200 shadow-sm">
                       <Filter size={14} strokeWidth={2.5} />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Filtres</span>
                    </button>
                    <button onClick={clientsToolbar.onAddClient} className="h-10 px-6 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                       <Plus size={16} strokeWidth={3} />
                       NOUVEAU PATIENT
                    </button>
                 </div>
              </>
            ) : activePage === 'accounting' && financeToolbar ? (
              <>
                 <div className="flex items-center gap-6">
                    <h2 className="text-lg font-bold tracking-tighter text-neutral-900">Analyse Financière</h2>
                    {financeToolbar.showDateRange && (
                        <div className="flex h-10 items-center gap-3 rounded-full bg-white px-5 border border-neutral-200 shadow-sm">
                          <input
                            type="date"
                            value={financeToolbar.dateRange.start}
                            onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, start: e.target.value })}
                            className="bg-transparent text-[11px] font-semibold uppercase text-neutral-900 outline-none"
                          />
                          <ArrowRight size={12} className="text-neutral-500" />
                          <input
                            type="date"
                            value={financeToolbar.dateRange.end}
                            onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, end: e.target.value })}
                            className="bg-transparent text-[11px] font-semibold uppercase text-neutral-900 outline-none"
                          />
                        </div>
                      )}
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={financeToolbar.onToggleDateFilter} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-neutral-600 hover:text-neutral-900 transition-all border border-neutral-200 shadow-sm">
                       <Calendar size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={financeToolbar.onExport} className="h-10 px-6 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                       <Download size={16} strokeWidth={2.5} />
                       EXPORTER CSV
                    </button>
                 </div>
              </>
            ) : activePage === 'settings' && settingsToolbar ? (
              <>
                 <div>
                    <h2 className="text-lg font-bold tracking-tighter text-neutral-900">Paramètres Système</h2>
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] mr-2" />
                    SYSTÈME OPÉRATIONNEL
                 </div>
              </>
            ) : (
              <div className="flex-1 h-12" />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Main Content Scroll Area ── */}
      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Mobile Navigation ── */}
      <nav className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-around border-t border-neutral-100 bg-white/90 px-6 py-6 backdrop-blur-3xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, activePage);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-2 transition-all ${
                active ? 'text-neutral-900 scale-110' : 'text-neutral-300'
              }`}
            >
              <Icon size={active ? 24 : 20} strokeWidth={active ? 3 : 2.5} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
