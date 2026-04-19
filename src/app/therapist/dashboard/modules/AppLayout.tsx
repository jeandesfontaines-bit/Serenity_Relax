import React from 'react';
import { LayoutGrid, Calendar, Users, CreditCard, Settings, FileText, BarChart3 } from 'lucide-react';

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
  { id: 'settings',   label: 'Réglages',    icon: Settings },
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
  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── SIDEBAR (desktop) ── */}
      <nav className="hidden sm:flex flex-col w-60 bg-white border-r border-slate-200 shrink-0 z-20">
        {/* Logo / Brand */}
        <div className="h-14 flex items-center px-5 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900 tracking-tight">Cabinet</span>
        </div>

        {/* Main nav */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Principal</p>
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const active = isActive(id, activePage);
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`group relative w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm transition-colors duration-150
                  ${active
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-600 rounded-r-full" />
                )}
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}

          <div className="pt-5">
            <p className="px-3 mb-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Outils</p>
            {NAV_SECONDARY.map(({ id, label, icon: Icon, disabled }) => (
              <button
                key={id}
                disabled={disabled}
                className="group w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm text-slate-400 cursor-default"
              >
                <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                <span className="truncate">{label}</span>
                {disabled && (
                  <span className="ml-auto text-[9px] font-medium bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Bientôt</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom area */}
        <div className="px-3 py-3 border-t border-slate-100">
          <button
            className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors duration-150"
          >
            <Settings size={17} strokeWidth={1.8} className="shrink-0" />
            <span>Paramètres</span>
          </button>
        </div>
      </nav>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-14">
        {NAV_MOBILE.map(({ id, label, icon: Icon }) => {
          const active = isActive(id, activePage);
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[9px] font-medium ${active ? 'text-emerald-600' : 'text-slate-500'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden pb-14 sm:pb-0">
        {children}
      </div>
    </div>
  );
}
