'use client';
import React, { useState } from 'react';
import {
  Ban, ChevronLeft, ChevronRight, Settings,
  Download, Filter, LogOut, Search, Calendar, Users, Wallet,
  Bell, ArrowRight, LayoutGrid, List, Menu, Home
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
    onBack: () => void; onOpenHistory: () => void; onOpenNotes: () => void;
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
  financeToolbar, settingsToolbar, onLogout,
}: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full py-10">
      <div className="px-8 mb-12">
        <button onClick={() => onNavigate('dashboard')} className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:rotate-12">
            <span className="text-primary-foreground font-black text-lg">S</span>
          </div>
          <p className="text-xl font-black tracking-tighter text-foreground">
            SERENITY
          </p>
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, activePage);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 ${
                active 
                  ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 translate-x-1' 
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.25} className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} />
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 mt-auto pt-8 space-y-2">
        {[
          { id: 'settings', label: 'Paramètres', Icon: Settings },
        ].map(({ id, label, Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 ${
                active 
                  ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 translate-x-1' 
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.25} className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} />
              <span className="tracking-tight">{label}</span>
            </button>
          );
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group"
          >
            <LogOut size={20} strokeWidth={1.25} className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <span className="tracking-tight">Déconnexion</span>
          </button>
        )}
      </div>
    </div>
  );

  const btnBase = {
    background: 'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
    color: 'hsl(var(--muted-foreground))',
  };
  const btnHoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'hsl(var(--primary))';
    e.currentTarget.style.color = 'hsl(var(--primary))';
  };
  const btnHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'hsl(var(--border))';
    e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[320px] shrink-0 border-r border-border/50 bg-[#F9FAFB]">
        <NavContent />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header
          className="h-[80px] shrink-0 flex items-center justify-between px-8 border-b border-border/40 backdrop-blur-xl sticky top-0 z-40 bg-background/60"
        >
          <div className="flex items-center gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors shadow-sm">
                  <Menu size={20} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 border-r border-border/50 bg-[#F9FAFB]">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-colors group-focus-within:text-primary" size={16} strokeWidth={1.5} />
              <input
                type="text" value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                placeholder="Rechercher partout..."
                className="h-11 w-[380px] rounded-2xl border border-border/50 bg-secondary/40 pl-11 pr-4 text-sm font-bold tracking-tight outline-none transition-all duration-500 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="w-11 h-11 flex items-center justify-center rounded-2xl border border-border/50 bg-background hover:border-primary/50 transition-all relative group shadow-sm">
              <Bell size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background group-hover:animate-ping" />
            </button>
            
            <div className="h-8 w-px bg-border/40 hidden sm:block" />
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="hidden sm:block text-right transition-transform duration-500 group-hover:-translate-x-1">
                <p className="text-sm font-black text-foreground">Joao Silva</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Thérapeute</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 group-hover:rotate-6 group-hover:scale-105">
                JS
              </div>
            </div>
          </div>
        </header>

        {/* Contextual Toolbar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-[60px] items-center justify-between px-6 md:px-8 py-3 border-b"
            style={{ background: 'hsl(var(--background) / 0.6)', backdropFilter: 'blur(8px)', borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex-1 flex items-center justify-between gap-6">
              {activePage === 'scheduler' && schedulerToolbar ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      {[schedulerToolbar.onPrev, schedulerToolbar.onNext].map((fn, i) => (
                        <button key={i} onClick={fn} className="h-9 w-9 flex items-center justify-center rounded-xl border transition-all" style={btnBase} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut}>
                          {i === 0 ? <ChevronLeft size={15} strokeWidth={2.5} /> : <ChevronRight size={15} strokeWidth={2.5} />}
                        </button>
                      ))}
                      <button onClick={schedulerToolbar.onToday} className="h-9 px-4 flex items-center justify-center rounded-xl border text-xs font-bold transition-all" style={btnBase} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut}>
                        Aujourd'hui
                      </button>
                    </div>
                    <h2 className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>{schedulerToolbar.title}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 items-center rounded-xl p-1 border" style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}>
                      {(['week', 'month'] as const).map((view) => (
                        <button key={view} onClick={() => schedulerToolbar.onToggleView(view)} className="h-7 px-4 rounded-lg text-xs font-bold transition-all"
                          style={{ background: schedulerToolbar.view === view ? 'hsl(var(--background))' : 'transparent', color: schedulerToolbar.view === view ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                          {view === 'week' ? 'Semaine' : 'Mois'}
                        </button>
                      ))}
                    </div>
                    <button onClick={schedulerToolbar.onToggleAbsenceMode} className="flex items-center gap-2 h-9 px-4 rounded-xl transition-all border text-xs font-bold"
                      style={{ background: schedulerToolbar.absenceMode ? 'hsl(var(--primary))' : 'hsl(var(--background))', borderColor: schedulerToolbar.absenceMode ? 'hsl(var(--primary))' : 'hsl(var(--border))', color: schedulerToolbar.absenceMode ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))' }}>
                      <Ban size={13} strokeWidth={2.5} />
                      {schedulerToolbar.absenceMode ? `Valider (${schedulerToolbar.absencePendingCount})` : 'Gérer Absences'}
                    </button>
                  </div>
                </>
              ) : activePage === 'clients' && clientsToolbar ? (
                <>
                  <div>
                    <h2 className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>Répertoire Patients</h2>
                    <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{clientsToolbar.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 items-center rounded-xl border p-1" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
                      {(['list', 'grid'] as const).map((mode) => (
                        <button key={mode} onClick={() => clientsToolbar.onViewModeChange(mode)} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
                          style={{ background: clientsToolbar.viewMode === mode ? 'hsl(var(--primary))' : 'transparent', color: clientsToolbar.viewMode === mode ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))' }}>
                          {mode === 'list' ? <List size={14} strokeWidth={2.5} /> : <LayoutGrid size={14} strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                    <button onClick={clientsToolbar.onToggleFilters} className="flex h-9 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all" style={btnBase} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut}>
                      <Filter size={13} strokeWidth={2.5} /> Filtres
                    </button>
                  </div>
                </>
              ) : activePage === 'accounting' && financeToolbar ? (
                <>
                  <div className="flex items-center gap-4">
                    <h2 className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>Analyse Financière</h2>
                    {financeToolbar.showDateRange && (
                      <div className="flex h-9 items-center gap-3 rounded-xl px-4 border" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
                        <input type="date" value={financeToolbar.dateRange.start} onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, start: e.target.value })} className="bg-transparent text-xs font-bold outline-none" style={{ color: 'hsl(var(--foreground))' }} />
                        <ArrowRight size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <input type="date" value={financeToolbar.dateRange.end} onChange={(e) => financeToolbar.onDateRangeChange({ ...financeToolbar.dateRange, end: e.target.value })} className="bg-transparent text-xs font-bold outline-none" style={{ color: 'hsl(var(--foreground))' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={financeToolbar.onToggleDateFilter} className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all" style={btnBase} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut}>
                      <Calendar size={16} strokeWidth={2} />
                    </button>
                    <button onClick={financeToolbar.onToggleFilters} className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all" style={btnBase} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut}>
                      <Filter size={16} strokeWidth={2} />
                    </button>
                    <button onClick={financeToolbar.onExport} className="h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 10px 15px -3px hsl(var(--primary) / 0.3)' }}>
                      <Download size={14} strokeWidth={2.5} /> EXPORTER CSV
                    </button>
                  </div>
                </>
              ) : activePage === 'settings' && settingsToolbar ? (
                <>
                  <div>
                    <h2 className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>Paramètres Système</h2>
                    <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Gérez votre profil et vos préférences</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(142.1 76.2% 36.3%)', boxShadow: '0 0 8px hsl(142.1 76.2% 36.3% / 0.4)' }} />
                    SYSTÈME OPÉRATIONNEL
                  </div>
                </>
              ) : (
                <div className="flex-1">
                  <h2 className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>{dashboardSummary?.title || 'Dashboard'}</h2>
                  <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{dashboardSummary?.subtitle || 'Bienvenue dans votre espace'}</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ background: 'hsl(var(--secondary) / 0.5)' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="h-full max-w-[1600px] mx-auto">
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
