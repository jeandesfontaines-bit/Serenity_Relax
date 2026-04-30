import React from 'react';
import { LayoutGrid, Calendar, Users, CreditCard, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_MAIN = [
  { id: 'dashboard',  label: 'VUE D\'ENSEMBLE', icon: LayoutGrid },
  { id: 'scheduler',  label: 'AGENDA & SOINS', icon: Calendar },
  { id: 'clients',    label: 'CLIENTS',         icon: Users },
  { id: 'accounting', label: 'FACTURATION',     icon: CreditCard },
  { id: 'settings',   label: 'CONFIGURATION',   icon: Settings },
];

function isActive(itemId: string, activePage: string) {
  if (itemId === 'clients' && activePage === 'client-detail') return true;
  return itemId === activePage;
}

export default function AppLayout({ children, activePage, onNavigate }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-[#faf9f7] overflow-hidden font-sans selection:bg-[#435544]/10 selection:text-[#435544]">
      {/* ── SIDEBAR (desktop) ── */}
      <nav className="hidden sm:flex flex-col w-72 bg-white border-r border-[#efeeec] shrink-0 z-20">
        {/* Logo / Brand */}
        <div className="h-24 flex items-center px-10 border-b border-[#faf9f7]">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-[#435544] rotate-45"></div>
            <span className="text-[11px] font-serif font-medium text-[#1a1c1b] uppercase tracking-[0.5em]">
              SERENITY <span className="text-[#c3c8c0] ml-1 font-light italic text-[10px]">v3</span>
            </span>
          </div>
        </div>

        {/* Main nav */}
        <div className="flex-1 px-6 py-12 space-y-2 overflow-y-auto">
          <p className="px-4 mb-10 text-[8px] font-serif font-medium text-[#725a38] uppercase tracking-[0.6em] opacity-40">
            SYSTÈME DE GESTION
          </p>
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const active = isActive(id, activePage);
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`group relative w-full flex items-center justify-between h-14 px-4 transition-all duration-700
                  ${active
                    ? 'text-[#1a1c1b]'
                    : 'text-[#c3c8c0] hover:text-[#1a1c1b]'
                  }`}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <Icon size={14} strokeWidth={active ? 1.5 : 1} className={`shrink-0 transition-colors ${active ? 'text-[#435544]' : ''}`} />
                  <span className={`font-serif text-[9px] uppercase tracking-[0.4em] transition-all duration-700 ${active ? 'font-medium' : 'group-hover:tracking-[0.5em]'}`}>
                    {label}
                  </span>
                </div>
                {active && (
                  <motion.div 
                    layoutId="active-indicator" 
                    className="absolute inset-0 bg-[#faf9f7]/50 border-r-2 border-[#435544]" 
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {!active && (
                  <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-[#efeeec]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-10 border-t border-[#efeeec] bg-[#faf9f7]">
           <div className="flex items-center gap-4 group cursor-default">
              <div className="w-8 h-8 rounded-none border border-[#efeeec] flex items-center justify-center bg-white rotate-45 group-hover:rotate-[135deg] transition-transform duration-1000">
                 <div className="-rotate-45 group-hover:rotate-[-135deg] transition-transform duration-1000">
                    <div className="w-1 h-1 bg-[#435544]"></div>
                 </div>
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-serif uppercase tracking-[0.3em] text-[#1a1c1b]">Cointrin Sanctuary</span>
                 <span className="text-[7px] font-sans uppercase tracking-[0.1em] text-[#725a38]/60 mt-0.5 italic">Genève, CH</span>
              </div>
           </div>
        </div>
      </nav>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#efeeec] flex items-center justify-around h-20 px-8">
        {NAV_MAIN.map(({ id, label, icon: Icon }) => {
          const active = isActive(id, activePage);
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center gap-3 transition-all duration-700 ${active ? 'text-[#1a1c1b]' : 'text-[#c3c8c0]'}`}
            >
              <Icon size={16} strokeWidth={active ? 1.5 : 1} className={active ? 'text-[#435544]' : ''} />
              {active && (
                 <motion.div 
                   layoutId="mobile-indicator"
                   className="w-1 h-1 bg-[#435544] rotate-45" 
                   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                 />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20 sm:pb-0">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

