import React, { useState, useEffect } from 'react';
import { LayoutGrid, Calendar, Users, CreditCard, Settings, FileText, BarChart3, PanelLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_MAIN = [
  { id: 'dashboard',  label: 'Home',        icon: LayoutGrid },
  { id: 'scheduler',  label: 'Agenda',      icon: Calendar },
  { id: 'clients',    label: 'Clients',     icon: Users },
  { id: 'accounting', label: 'Facturation', icon: CreditCard },
];

const NAV_SECONDARY = [
  { id: 'documents',  label: 'Documents',   icon: FileText,  disabled: true },
  { id: 'stats',      label: 'Statistiques', icon: BarChart3, disabled: true },
];

const NAV_MOBILE = [
  { id: 'dashboard',  label: 'Accueil',  icon: LayoutGrid },
  { id: 'scheduler',  label: 'Agenda',   icon: Calendar },
  { id: 'clients',    label: 'Clients',  icon: Users },
  { id: 'accounting', label: 'Compta',   icon: CreditCard },
];

function isActive(itemId: string, activePage: string) {
  if (itemId === 'clients' && activePage === 'client-detail') return true;
  return itemId === activePage;
}

export default function AppLayout({ children, activePage, onNavigate }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setIsCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  return (
    <div
      className="flex h-screen bg-bg-soft overflow-hidden font-heading text-forest"
    >
      {/* ── SIDEBAR (desktop) ── */}
      <nav className={`hidden sm:flex flex-col sidebar-bg border-r border-border shrink-0 z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-60'}`}>
        {/* Logo / Brand */}
        <div className="h-xl flex items-center px-m border-b border-border justify-between">
          {!isCollapsed && (
            <span className="font-heading text-small font-black text-white/90 tracking-widest uppercase">Cabinet</span>
          )}
          <button 
            onClick={toggleSidebar}
            className={`p-xs rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
          >
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Main nav */}
        <div className="flex-1 px-s py-m space-y-xxs overflow-y-auto">
          {!isCollapsed && (
            <p className="px-s mb-xs font-heading text-[9px] font-black text-white/30 uppercase tracking-widest">Principal</p>
          )}
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const active = isActive(id, activePage);
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`group relative w-full flex items-center h-xl rounded-md font-heading text-small transition-all duration-150
                  ${isCollapsed ? 'justify-center px-0' : 'gap-xs px-s'}
                  ${active
                    ? 'bg-azraq text-white font-black shadow-lg shadow-azraq/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{label}</span>}
                {isCollapsed && active && (
                  <motion.span layoutId="sidebar-active" className="absolute left-[2px] top-1/2 -translate-y-1/2 w-[4px] h-6 bg-aurora rounded-r-full" />
                )}
                {!isCollapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-aurora shadow-sm shadow-aurora/50" />
                )}
              </button>
            );
          })}

          <div className="pt-m">
            {!isCollapsed && (
              <p className="px-s mb-xs font-heading text-[9px] font-black text-white/30 uppercase tracking-widest">Outils</p>
            )}
            {NAV_SECONDARY.map(({ id, label, icon: Icon, disabled }) => (
              <button
                key={id}
                disabled={disabled}
                className={`group w-full flex items-center h-xl rounded-md font-heading text-small text-white/20 cursor-default
                  ${isCollapsed ? 'justify-center px-0' : 'gap-xs px-s'}`}
              >
                <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{label}</span>}
                {!isCollapsed && disabled && (
                  <span className="ml-auto font-heading text-[7px] font-black bg-white/5 text-white/10 px-xxs py-[1px] rounded uppercase tracking-widest">Soon</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom area */}
        <div className="px-s py-s border-t border-white/10">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center h-xl rounded-md font-heading text-small transition-all duration-150 
              ${isCollapsed ? 'justify-center px-0' : 'gap-xs px-s'}
              ${activePage === 'settings' ? 'bg-azraq text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={17} strokeWidth={1.8} className="shrink-0" />
            {!isCollapsed && <span>Paramètres</span>}
          </button>
        </div>
      </nav>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="sm:hidden fixed bottom-m inset-x-m z-40 bg-white/70 backdrop-blur-2xl border border-border shadow-2xl flex items-center justify-around h-xl rounded-full">
        {NAV_MOBILE.map(({ id, label, icon: Icon }) => {
          const active = isActive(id, activePage);
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center gap-[2px] transition-all relative
                ${active ? 'text-azraq' : 'text-samaritan'}
              `}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`font-heading text-[7px] font-black uppercase tracking-widest ${active ? 'text-azraq' : 'text-samaritan/40'}`}>
                {label}
              </span>
              {active && (
                <motion.span layoutId="mobile-active" className="absolute -bottom-xs w-xs h-xxs rounded-full bg-aurora shadow-lg shadow-aurora/50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden pb-14 sm:pb-0 relative">
        {children}
      </div>
    </div>
  );
}
