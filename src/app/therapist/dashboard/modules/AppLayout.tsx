import React from 'react';
import { LayoutGrid, Calendar, Users, CreditCard } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;

}

const NAV = [
  { id: 'dashboard',  label: 'Accueil',  icon: LayoutGrid },
  { id: 'scheduler',  label: 'Agenda',   icon: Calendar   },
  { id: 'clients',    label: 'Patients', icon: Users      },
  { id: 'accounting', label: 'Compta',   icon: CreditCard },
];

/** Returns true when the nav item should be shown as active */
function isActive(itemId: string, activePage: string) {
  if (itemId === 'clients' && activePage === 'client-detail') return true;
  return itemId === activePage;
}

export default function AppLayout({
  children,
  activePage,
  onNavigate,

}: AppLayoutProps) {
  return (
    <div
      className="flex h-screen bg-white overflow-hidden text-[#222F3E]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── SIDEBAR (desktop) ── */}
      <nav
        className="hidden sm:flex flex-col border-r border-slate-100 py-5 gap-1 bg-white shrink-0 shadow-sm z-20 w-[68px]"
      >

        {/* Main nav */}
        <div className="flex-1 flex flex-col gap-1 px-3">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = isActive(id, activePage);
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                title={label}
                className={`group relative flex items-center justify-center h-11 rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-[#5F27CD]/8 text-[#5F27CD]'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#5F27CD] rounded-r-full" />
                )}
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className="shrink-0"
                />
              </button>
            );
          })}
        </div>


      </nav>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-2 h-16 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = isActive(id, activePage);
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-2xl transition-all ${active ? 'text-[#5F27CD]' : 'text-slate-400'}`}
            >
              {active && (
                <span className="absolute bottom-14 w-8 h-0.5 bg-[#5F27CD] rounded-full" />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[8px] font-black uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-60'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 sm:pb-0">
        {children}
      </div>
    </div>
  );
}
