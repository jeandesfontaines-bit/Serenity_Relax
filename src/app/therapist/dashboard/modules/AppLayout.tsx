import React from 'react';
import { LayoutGrid, CalendarRange, Users, WalletCards, Search, Bell, Plus, Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Tableau de bord', icon: LayoutGrid },
  { id: 'scheduler',  label: 'Agenda',          icon: CalendarRange },
  { id: 'clients',    label: 'Clients',         icon: Users },
  { id: 'accounting', label: 'Facturation',     icon: WalletCards },
];

export default function AppLayout({ children, activePage, onNavigate }: AppLayoutProps) {
  const currentTab = activePage === 'client-detail' ? 'clients' : activePage;

  return (
    <div className="min-h-screen bg-[#F4F2EE] font-heading text-onyx">
      
      {/* --- TOPBAR (IMAGE STYLE) --- */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-border/10 flex items-center justify-between px-10 z-50">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-forest text-neon flex items-center justify-center">
              <Sparkles size={16} />
           </div>
           <span className="text-[17px] font-semibold tracking-tight text-onyx">Studio Board</span>
        </div>

        {/* Navigation (Center Pill) */}
        <nav className="bg-bg-soft/80 border border-border/40 rounded-full p-1 flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => {
            const active = currentTab === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300
                  ${active 
                    ? 'bg-onyx text-white shadow-lg' 
                    : 'text-earth/60 hover:text-onyx hover:bg-white/50'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right Shell */}
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-4 text-earth/40">
              <Search size={20} />
              <Bell size={20} />
           </div>
           <div className="flex items-center gap-3 border-l border-border/20 pl-6 cursor-pointer hover:opacity-80">
              <div className="w-9 h-9 rounded-full bg-success text-onyx flex items-center justify-center font-semibold text-[12px] shadow-sm">
                 N
              </div>
              <span className="text-[14px] font-semibold text-onyx">Nadia</span>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="pt-32 pb-20 px-10 max-w-[1400px] mx-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
