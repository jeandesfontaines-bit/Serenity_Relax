'use client';
import React, { useState } from 'react';
import {
  Ban, ChevronLeft, ChevronRight, Settings,
  Download, Filter, LogOut, Search, Calendar, Users, Wallet,
  Bell, ArrowRight, LayoutGrid, List, Menu, Home, Plus
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
  dashboardSummary, schedulerToolbar, clientsToolbar, clientDetailToolbar,
  appointmentDetailToolbar, financeToolbar, settingsToolbar, onLogout,
}: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      {/* Logo */}
      <div className="px-6 mb-8">
        <button onClick={() => onNavigate('dashboard')} className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <span className="text-primary-foreground font-bold text-base">S</span>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
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
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className="transition-colors" />
              <span>{item.label}</span>
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
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className="transition-colors" />
              <span>{label}</span>
            </button>
          );
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group"
          >
            <LogOut size={18} strokeWidth={1.5} className="transition-colors" />
            <span>Déconnexion</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] shrink-0 border-r border-sidebar-border flex-col" style={{ background: 'hsl(var(--sidebar-background))' }}>
        <NavContent />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-border bg-white sticky top-0 z-40 shadow-sm">
          {/* Left: Menu & Title */}
          <div className="flex items-center gap-4 min-w-[240px]">
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
                  <h2 className="text-sm font-bold text-foreground leading-tight tracking-tight uppercase tracking-[0.05em]">{dashboardSummary.title}</h2>
                  <p className="text-[10px] text-muted-foreground/80 tracking-wide font-medium">{dashboardSummary.subtitle}</p>
                </>
              )}
              {activePage === 'scheduler' && schedulerToolbar && (
                <>
                  <h2 className="text-sm font-semibold text-foreground leading-tight tracking-tight">{schedulerToolbar.title}</h2>
                  <p className="text-[10px] text-muted-foreground tracking-wide font-medium">Agenda Thérapeute</p>
                </>
              )}
              {activePage === 'clients' && clientsToolbar && (
                <>
                  <h2 className="text-sm font-semibold text-foreground leading-tight tracking-tight">Répertoire Patients</h2>
                  <p className="text-[10px] text-muted-foreground tracking-wide font-medium">{clientsToolbar.subtitle}</p>
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
                      <h2 className="text-sm font-semibold text-foreground leading-tight tracking-tight">{clientDetailToolbar.title}</h2>
                      <p className="text-[10px] text-muted-foreground tracking-wide font-medium">{clientDetailToolbar.eyebrow}</p>
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
                      <h2 className="text-sm font-semibold text-foreground leading-tight tracking-tight">{appointmentDetailToolbar.title}</h2>
                      <p className="text-[10px] text-muted-foreground tracking-wide font-medium">{appointmentDetailToolbar.eyebrow}</p>
                    </div>
                  </div>
                </>
              )}
              {activePage === 'accounting' && financeToolbar && (
                <>
                  <h2 className="text-sm font-bold text-foreground leading-tight tracking-tight uppercase tracking-[0.05em]">Finances</h2>
                </>
              )}
              {activePage === 'settings' && settingsToolbar && (
                <>
                  <h2 className="text-sm font-semibold text-foreground leading-tight tracking-tight">Paramètres</h2>
                  <p className="text-[10px] text-muted-foreground tracking-wide font-medium">Configuration du compte</p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex justify-center px-4">
            <div className="relative group w-full max-w-md hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60 transition-colors group-focus-within:text-primary" size={14} strokeWidth={2} />
              <input
                type="text" value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                placeholder="Rechercher un patient, un rdv, un soin..."
                className="h-9 w-full rounded-full border border-border/50 bg-muted/40 pl-10 pr-4 text-[13px] font-medium outline-none transition-all duration-300 focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 placeholder:text-muted-foreground/40 shadow-sm group-hover:bg-muted/60"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 min-w-[240px] justify-end">
            {activePage === 'scheduler' && schedulerToolbar && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button onClick={schedulerToolbar.onPrev} className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors">
                    <ChevronLeft size={14} strokeWidth={2} />
                  </button>
                  <button onClick={schedulerToolbar.onNext} className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors">
                    <ChevronRight size={14} strokeWidth={2} />
                  </button>
                  <button onClick={schedulerToolbar.onToday} className="h-8 px-3 flex items-center justify-center rounded-md border border-border bg-background text-[11px] font-semibold tracking-wide hover:bg-accent transition-colors ml-1 uppercase">
                    Aujourd&apos;hui
                  </button>
                </div>
                <div className="flex h-8 items-center rounded-md p-0.5 border border-border bg-muted/50">
                  {(['week', 'month'] as const).map((view) => (
                    <button key={view} onClick={() => schedulerToolbar.onToggleView(view)} className={`h-7 px-3 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-200 uppercase ${schedulerToolbar.view === view ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {view === 'week' ? 'Semaine' : 'Mois'}
                    </button>
                  ))}
                </div>
                <button onClick={schedulerToolbar.onToggleAbsenceMode} className={`flex items-center gap-1.5 h-8 px-3 rounded-md transition-all duration-200 border text-[11px] font-semibold tracking-wide uppercase ${
                  schedulerToolbar.absenceMode 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                }`}>
                  <Ban size={12} strokeWidth={2} />
                  {schedulerToolbar.absenceMode ? `Valider (${schedulerToolbar.absencePendingCount})` : 'Absences'}
                </button>
              </div>
            )}

            {activePage === 'clients' && clientsToolbar && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 items-center rounded-md border border-border p-0.5 bg-muted/50">
                  {(['list', 'grid'] as const).map((mode) => (
                    <button key={mode} onClick={() => clientsToolbar.onViewModeChange(mode)} className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${clientsToolbar.viewMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {mode === 'list' ? <List size={14} strokeWidth={2} /> : <LayoutGrid size={14} strokeWidth={2} />}
                    </button>
                  ))}
                </div>
                <button onClick={clientsToolbar.onToggleFilters} className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-[11px] font-semibold tracking-wide uppercase bg-background text-muted-foreground hover:bg-accent transition-colors">
                  <Filter size={12} strokeWidth={2} /> Filtres
                </button>
              </div>
            )}

            {activePage === 'client-detail' && clientDetailToolbar && (
              <div className="flex items-center gap-2">
                {clientDetailToolbar.onSchedule && (
                  <button 
                    onClick={clientDetailToolbar.onSchedule}
                    className="h-8 px-3 rounded-md text-[11px] font-semibold tracking-wide uppercase transition-all duration-200 flex items-center gap-1.5 bg-primary text-primary-foreground hover:brightness-110"
                  >
                    <Plus size={13} strokeWidth={2} /> Nouvelle séance
                  </button>
                )}
              </div>
            )}

            {activePage === 'accounting' && financeToolbar && (
              <div className="flex items-center gap-2">
                {financeToolbar.showDateRange && (
                  <div className="flex h-8 items-center gap-2 rounded-md px-3 border border-border bg-background">
                    <input type="date" value={financeToolbar.dateRange.start} onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, start: e.target.value })} className="bg-transparent text-[11px] font-medium outline-none text-foreground" />
                    <ArrowRight size={12} className="text-muted-foreground" />
                    <input type="date" value={financeToolbar.dateRange.end} onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, end: e.target.value })} className="bg-transparent text-[11px] font-medium outline-none text-foreground" />
                  </div>
                )}
                <button onClick={financeToolbar.onToggleDateFilter} className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors text-muted-foreground">
                  <Calendar size={14} strokeWidth={2} />
                </button>
                <button onClick={financeToolbar.onToggleFilters} className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors text-muted-foreground">
                  <Filter size={14} strokeWidth={2} />
                </button>
                <button onClick={financeToolbar.onExport} className="h-8 px-3 rounded-md text-[11px] font-semibold tracking-wide uppercase transition-all duration-200 flex items-center gap-1.5 bg-primary text-primary-foreground hover:brightness-110">
                  <Download size={13} strokeWidth={2} /> Exporter
                </button>
              </div>
            )}

            {activePage === 'settings' && (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Système opérationnel
              </div>
            )}
          </div>
        </header>



        {/* Main Content */}
        <main className={`flex-1 overflow-hidden ${activePage === 'scheduler' ? 'p-0' : activePage === 'appointment-detail' ? 'p-0' : 'p-6'}`} style={{ background: 'hsl(var(--background))' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activePage} 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -6 }} 
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} 
              className={`h-full ${activePage === 'scheduler' || activePage === 'appointment-detail' ? 'w-full' : 'max-w-[1400px] mx-auto'}`}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
