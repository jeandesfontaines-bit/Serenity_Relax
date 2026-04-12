import React from 'react';
import { LayoutGrid, Calendar, Users, CreditCard, Leaf } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV = [
  { id: 'dashboard', label: 'Home', icon: LayoutGrid },
  { id: 'scheduler', label: 'Agenda', icon: Calendar },
  { id: 'clients', label: 'Patients', icon: Users },
  { id: 'accounting', label: 'Compta', icon: CreditCard },
];

export default function AppLayout({ children, activePage, onNavigate }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-white overflow-hidden text-[#222F3E]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <nav className="w-16 border-r border-slate-100 flex flex-col items-center py-5 gap-2 bg-white shrink-0 shadow-sm z-20">
        {/* Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-[#341F97] to-[#5F27CD] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#5F27CD]/20 mb-6">
          <Leaf size={22} strokeWidth={2.5}/>
        </div>

        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300
              ${activePage === id || (activePage === 'client-detail' && id === 'clients') ? 'bg-[#5F27CD]/5 text-[#5F27CD]' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon size={18} strokeWidth={activePage === id ? 2.5 : 2} />
            <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
          </button>
        ))}

      </nav>

      {/* Page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
