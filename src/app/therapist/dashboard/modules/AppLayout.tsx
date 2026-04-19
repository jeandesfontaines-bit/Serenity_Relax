'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, Settings, LogOut, LayoutGrid, FileText, Bell, BarChart3, Mail, Menu, ChevronLeft } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutGrid, path: '/therapist/dashboard' },
  { id: 'scheduler', label: 'Agenda', icon: Calendar, path: '/therapist/scheduler' },
  { id: 'clients', label: 'Clients', icon: Users, path: '/therapist/clients' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/therapist/analytics' },
  { id: 'emails', label: 'Emails', icon: Mail, path: '/therapist/emails' },
  { id: 'invoices', label: 'Finances', icon: DollarSign, path: '/therapist/invoices' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F5F0] overflow-hidden">
      {/* SIDEBAR COMPACT */}
      <motion.div animate={{ width: isCollapsed ? 80 : 250 }} className="bg-white/60 backdrop-blur-xl border-r border-gray-100 hidden lg:flex flex-col z-30 overflow-hidden relative">
        <div className="p-5 flex justify-between items-center shrink-0">
          {!isCollapsed && (
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-sans font-black text-base tracking-[0.15em] text-[#222F3E]">SERENITY</span>
              <span className="font-cursive text-xl text-[#059669]">Relax</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 bg-gray-50 text-gray-400 hover:text-[#059669] rounded-xl transition-colors mx-auto">
             {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!isCollapsed && <p className="px-5 text-[0.5rem] font-black uppercase tracking-widest text-gray-400 mt-1 whitespace-nowrap">Espace Thérapeute</p>}

        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-start gap-4 px-4 py-3'} rounded-xl transition-all duration-200 ${active ? 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-xl' : 'text-[#576574] hover:bg-emerald-50 hover:text-[#059669]'}`}
              >
                <Icon className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${active ? 'text-white' : 'text-gray-400'}`} />
                {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Déconnexion" : ""}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold uppercase tracking-widest text-[0.6rem]`}
          >
            <LogOut className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {!isCollapsed && <span className="whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </motion.div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative background orb */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] aspect-square bg-emerald-50 rounded-full blur-[120px] opacity-40 pointer-events-none" />

        {/* Top bar mobile + desktop */}
        <div className="h-12 bg-white/60 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-6 flex items-center justify-between lg:justify-end shrink-0 z-20">
          <div className="lg:hidden flex items-baseline gap-1.5">
            <span className="font-sans font-black tracking-[0.15em] text-[#222F3E] text-sm">SERENITY</span>
            <span className="font-cursive text-lg text-[#059669]">Relax</span>
          </div>
          
          <div className="flex items-center gap-4">
            
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-auto relative z-10 scrollbar-hide flex flex-col">
          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
          <footer className="w-full text-center py-6 text-xs text-[#576574] font-medium tracking-wide bg-white/30 hidden lg:block border-t border-gray-100/50 mt-auto">
             &copy; {new Date().getFullYear()} <strong className="font-sans font-black tracking-widest text-[#222F3E]">SERENITY</strong> <span className="font-cursive text-[#059669]">Relax</span>. Tous droits réservés.
          </footer>
        </div>

        {/* ── BOTTOM NAV (mobile) ── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around h-14 px-3 rounded-t-xl shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-1.5 w-16 h-14 transition-all ${active ? 'text-[#059669]' : 'text-gray-400'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${active ? 'bg-emerald-50 scale-110' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[0.6rem] font-bold uppercase tracking-tighter ${active ? 'text-[#059669]' : 'text-gray-400'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
