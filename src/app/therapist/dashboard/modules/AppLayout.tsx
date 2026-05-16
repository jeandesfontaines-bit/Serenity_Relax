'use client';
import React, { useState } from 'react';
import {
  Ban, ChevronLeft, ChevronRight, Settings,
  Download, Filter, LogOut, Search, Calendar, Users, Wallet,
  Bell, ArrowRight, LayoutGrid, List, Menu, Home, Plus, Goal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  dashboardSummary?: { title: string; subtitle: string };
  dashboardToolbar?: {
    dateLabel: string;
    goalLabel: string;
    onGoalClick: () => void;
  };
  schedulerToolbar?: {
    eyebrow: string; title: string; view: 'month' | 'week';
    onPrev: () => void; onNext: () => void; onToday: () => void;
    onToggleView: (view: 'month' | 'week') => void;
    absenceMode: boolean; absencePendingCount: number;
    onToggleAbsenceMode: () => void; onOpenSettings: () => void;
  };
  clientsToolbar?: {
    title: string; subtitle: string;
    onToggleFilters: () => void;
    viewMode: 'list' | 'grid';
    onViewModeChange: (mode: 'list' | 'grid') => void;
  };
  clientDetailToolbar?: {
    eyebrow: string; title: string;
    onBack: () => void;
    onSchedule?: () => void;
  };
  appointmentDetailToolbar?: {
    eyebrow: string;
    title: string;
    onBack: () => void;
  };
  financeToolbar?: {
    title: string; subtitle: string; showDateRange: boolean;
    dateRange: { start: string; end: string };
    onDateRangeChange: (range: { start: string; end: string }) => void;
    onToggleDateFilter: () => void; onToggleFilters: () => void; onExport: () => void; selectedCount: number;
  };
  settingsToolbar?: { title: string; subtitle: string; statusLabel?: string };
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'scheduler', label: 'Agenda', icon: Calendar },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'accounting', label: 'Finances', icon: Wallet },
];

function isActive(itemId: string, activePage: string) {
  if (itemId === 'clients' && activePage === 'client-detail') return true;
  return itemId === activePage;
}

export default function AppLayout({
  children, activePage, onNavigate, globalSearch, onGlobalSearchChange,
  dashboardSummary, dashboardToolbar, schedulerToolbar, clientsToolbar, clientDetailToolbar,
  appointmentDetailToolbar, financeToolbar, settingsToolbar, onLogout,
}: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full py-6">
      {/* Logo */}
      <div className={`mb-8 ${collapsed ? 'px-4' : 'px-6'}`}>
        <button onClick={() => onNavigate('dashboard')} className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <span className="dashboard-section-title text-primary-foreground">S</span>
          </div>
          <span className={`${collapsed ? 'hidden' : 'block'} dashboard-section-title`}>
            Serenity
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, activePage);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`dashboard-body-strong w-full group flex items-center rounded-lg transition-all duration-200 ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                active 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className="transition-colors" />
              <span className={collapsed ? 'hidden' : 'block'}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 mt-auto pt-6 space-y-1 border-t border-border mx-3">
        {[
          { id: 'settings', label: 'Paramètres', Icon: Settings },
        ].map(({ id, label, Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              className={`dashboard-body-strong w-full group flex items-center rounded-lg transition-all duration-200 ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                active 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className="transition-colors" />
              <span className={collapsed ? 'hidden' : 'block'}>{label}</span>
            </button>
          );
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            title={collapsed ? 'Déconnexion' : undefined}
            className={`dashboard-body w-full rounded-lg transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group ${
              collapsed ? 'flex items-center justify-center px-2 py-2.5' : 'flex items-center gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut size={18} strokeWidth={1.5} className="transition-colors" />
            <span className={collapsed ? 'hidden' : 'block'}>Déconnexion</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className={`mt-4 flex h-10 w-full items-center text-muted-foreground transition-colors hover:text-foreground ${collapsed ? 'justify-center px-0' : 'justify-start px-3'}`}
          aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
        >
          <ChevronLeft
            size={16}
            strokeWidth={2}
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-shell flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex ${isSidebarCollapsed ? 'w-[84px]' : 'w-[254px]'}`}>
        <NavContent collapsed={isSidebarCollapsed} />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          {/* Left: Menu & Title */}
          <div className="flex min-w-[240px] items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                  <Menu size={18} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 border-r border-border" style={{ background: 'hsl(var(--sidebar-background))' }}>
                <NavContent />
              </SheetContent>
            </Sheet>
            <div className="flex flex-col">
              {activePage === 'dashboard' && dashboardSummary && (
                <>
                  <h2 className="dashboard-header-title">{dashboardSummary.title}</h2>
                  <p className="dashboard-header-subtitle normal-case tracking-normal">{dashboardSummary.subtitle}</p>
                </>
              )}
              {activePage === 'scheduler' && schedulerToolbar && (
                <>
                  <h2 className="dashboard-header-title">{schedulerToolbar.title}</h2>
                  <p className="dashboard-header-subtitle">Agenda Thérapeute</p>
                </>
              )}
              {activePage === 'clients' && clientsToolbar && (
                <>
                  <h2 className="dashboard-header-title">Répertoire Patients</h2>
                  <p className="dashboard-header-subtitle">{clientsToolbar.subtitle}</p>
                </>
              )}
              {activePage === 'client-detail' && clientDetailToolbar && (
                <>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={clientDetailToolbar.onBack}
                      className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors text-muted-foreground"
                    >
                      <ChevronLeft size={16} strokeWidth={2} />
                    </button>
                    <div className="flex flex-col">
                      <h2 className="dashboard-header-title">{clientDetailToolbar.title}</h2>
                      <p className="dashboard-header-subtitle">{clientDetailToolbar.eyebrow}</p>
                    </div>
                  </div>
                </>
              )}
              {activePage === 'appointment-detail' && appointmentDetailToolbar && (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={appointmentDetailToolbar.onBack}
                      className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors text-muted-foreground"
                    >
                      <ChevronLeft size={16} strokeWidth={2} />
                    </button>
                    <div className="flex flex-col">
                      <h2 className="dashboard-header-title">{appointmentDetailToolbar.title}</h2>
                      <p className="dashboard-header-subtitle">{appointmentDetailToolbar.eyebrow}</p>
                    </div>
                  </div>
                </>
              )}
              {activePage === 'accounting' && financeToolbar && (
                <>
                  <h2 className="dashboard-header-title">Finances</h2>
                </>
              )}
              {activePage === 'settings' && settingsToolbar && (
                <>
                  <h2 className="dashboard-header-title">Paramètres</h2>
                  <p className="dashboard-header-subtitle">Configuration du compte</p>
                </>
              )}
            </div>

            {activePage === 'scheduler' && schedulerToolbar && (
              <div className="hidden xl:flex items-center gap-2">
                <button onClick={schedulerToolbar.onPrev} className="dashboard-topbar-icon">
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <button onClick={schedulerToolbar.onToday} className="dashboard-topbar-control dashboard-topbar-today px-4 uppercase">
                  Aujourd&apos;hui
                </button>
                <button onClick={schedulerToolbar.onNext} className="dashboard-topbar-icon">
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
          
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 px-4 md:block">
            <div className="pointer-events-auto relative group">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary" size={14} strokeWidth={2} />
              <input
                type="text" value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                placeholder="Rechercher un patient, un rdv, un soin..."
                className="dashboard-topbar-search pl-10"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="ml-auto flex min-w-[300px] items-center justify-end gap-2">
            {activePage === 'dashboard' && dashboardToolbar && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="dashboard-topbar-control gap-2 px-3 text-muted-foreground">
                  <Calendar size={14} strokeWidth={1.8} />
                  <span>{dashboardToolbar.dateLabel}</span>
                </div>
                <button
                  onClick={dashboardToolbar.onGoalClick}
                  className="dashboard-topbar-primary gap-2 px-4"
                >
                  <Goal size={14} strokeWidth={1.8} />
                  <span>{dashboardToolbar.goalLabel}</span>
                </button>
              </div>
            )}
            {activePage === 'scheduler' && schedulerToolbar && (
              <div className="flex items-center gap-2">
                <div className="dashboard-topbar-switch">
                  {(['week', 'month'] as const).map((view) => (
                    <button key={view} onClick={() => schedulerToolbar.onToggleView(view)} className={`dashboard-topbar-segment tracking-wide uppercase ${schedulerToolbar.view === view ? 'dashboard-topbar-segment-active' : ''}`}>
                      {view === 'week' ? 'Semaine' : 'Mois'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={schedulerToolbar.onOpenSettings}
                  className="dashboard-topbar-control gap-1.5 px-3 uppercase"
                >
                  <Calendar size={12} strokeWidth={2} />
                  Créneaux
                </button>
                <button onClick={schedulerToolbar.onToggleAbsenceMode} className={`dashboard-topbar-control gap-1.5 px-3 uppercase ${
                  schedulerToolbar.absenceMode 
                    ? 'bg-primary border-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' 
                    : ''
                }`}>
                  <Ban size={12} strokeWidth={2} />
                  {schedulerToolbar.absenceMode ? `Valider (${schedulerToolbar.absencePendingCount})` : 'Absences'}
                </button>
              </div>
            )}

            {activePage === 'clients' && clientsToolbar && (
              <div className="flex items-center gap-2">
                <div className="dashboard-topbar-switch">
                  {(['list', 'grid'] as const).map((mode) => (
                    <button key={mode} onClick={() => clientsToolbar.onViewModeChange(mode)} className={`dashboard-topbar-segment min-w-0 px-0 ${clientsToolbar.viewMode === mode ? 'dashboard-topbar-segment-active' : ''}`}>
                      {mode === 'list' ? <List size={14} strokeWidth={2} /> : <LayoutGrid size={14} strokeWidth={2} />}
                    </button>
                  ))}
                </div>
                <button onClick={clientsToolbar.onToggleFilters} className="dashboard-topbar-control gap-1.5 px-3 uppercase">
                  <Filter size={12} strokeWidth={2} /> Filtres
                </button>
              </div>
            )}

            {activePage === 'client-detail' && clientDetailToolbar && (
              <div className="flex items-center gap-2">
                {clientDetailToolbar.onSchedule && (
                  <button 
                    onClick={clientDetailToolbar.onSchedule}
                    className="dashboard-topbar-primary gap-1.5 px-4 uppercase"
                  >
                    <Plus size={13} strokeWidth={2} /> Nouvelle séance
                  </button>
                )}
              </div>
            )}

            {activePage === 'accounting' && financeToolbar && (
              <div className="flex items-center gap-2">
                {financeToolbar.showDateRange && (
                  <div className="dashboard-topbar-control gap-2 px-3">
                    <input type="date" value={financeToolbar.dateRange.start} onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, start: e.target.value })} className="dashboard-meta-strong bg-transparent outline-none text-foreground" />
                    <ArrowRight size={12} className="text-muted-foreground" />
                    <input type="date" value={financeToolbar.dateRange.end} onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, end: e.target.value })} className="dashboard-meta-strong bg-transparent outline-none text-foreground" />
                  </div>
                )}
                <button onClick={financeToolbar.onToggleDateFilter} className="dashboard-topbar-icon">
                  <Calendar size={14} strokeWidth={2} />
                </button>
                <button onClick={financeToolbar.onToggleFilters} className="dashboard-topbar-icon">
                  <Filter size={14} strokeWidth={2} />
                </button>
                <button onClick={financeToolbar.onExport} className="dashboard-topbar-primary gap-1.5 px-4 uppercase">
                  <Download size={13} strokeWidth={2} /> Exporter
                </button>
              </div>
            )}

            {activePage === 'settings' && (
              <div className="dashboard-table-header-cell flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Système opérationnel
              </div>
            )}
          </div>
        </header>



        {/* Main Content */}
        <main className={`flex-1 overflow-hidden ${activePage === 'scheduler' ? 'p-0' : activePage === 'appointment-detail' ? 'p-0' : 'p-8'}`} style={{ background: 'hsl(var(--secondary) / 0.4)' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activePage} 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -6 }} 
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} 
              className={`h-full ${activePage === 'scheduler' || activePage === 'appointment-detail' ? 'w-full' : 'max-w-[1360px] mx-auto'}`}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
