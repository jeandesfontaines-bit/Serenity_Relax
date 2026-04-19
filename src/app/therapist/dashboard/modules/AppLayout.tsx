'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, Settings, LogOut, LayoutGrid, FileText, Bell, BarChart3, Mail } from 'lucide-react';
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
  { id: 'invoices', label: 'Factures', icon: FileText, path: '/therapist/invoices' },
  { id: 'emails', label: 'Emails', icon: Mail, path: '/therapist/emails' },
  { id: 'reminders', label: 'Rappels', icon: Bell, path: '/therapist/reminders' },
  { id: 'accounting', label: 'Comptabilité', icon: DollarSign, path: '/therapist/accounting' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
      <div className="w-52 bg-white/60 backdrop-blur-xl border-r border-gray-100 hidden lg:flex flex-col z-30">
        <div className="p-5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans font-black text-base tracking-[0.15em] text-[#222F3E]">SERENITY</span>
            <span className="font-cursive text-xl text-[#5F27CD]">Relax</span>
          </div>
          <p className="text-[0.5rem] font-black uppercase tracking-widest text-gray-400 mt-1">Espace Thérapeute</p>
        </div>

        <div className="flex-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all duration-200 ${active ? 'bg-gradient-to-r from-[#5F27CD] to-[#0ABDE3] text-white shadow-md' : 'text-[#576574] hover:bg-gray-50 hover:text-[#222F3E]'}`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-300'}`} />
                <span className="text-[0.65rem] font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-[#FF6B6B] hover:bg-[#FF6B6B]/5 px-4 py-2.5 rounded-lg transition-all font-bold uppercase tracking-widest text-[0.6rem]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative background orb */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] aspect-square bg-indigo-50 rounded-full blur-[120px] opacity-40 pointer-events-none" />

        {/* Top bar mobile + desktop */}
        <div className="h-12 bg-white/60 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-6 flex items-center justify-between lg:justify-end shrink-0 z-20">
          <div className="lg:hidden flex items-baseline gap-1.5">
            <span className="font-sans font-black tracking-[0.15em] text-[#222F3E] text-sm">SERENITY</span>
            <span className="font-cursive text-lg text-[#5F27CD]">Relax</span>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-100 shadow-sm text-[0.55rem] font-black uppercase tracking-widest text-[#222F3E] hover:bg-white transition-all"
            >
              <Settings className="w-3 h-3 text-gray-300" />
              Config
            </motion.button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10 scrollbar-hide">
          {children}
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
                className={`flex flex-col items-center justify-center gap-1.5 w-16 h-14 transition-all ${active ? 'text-[#5F27CD]' : 'text-gray-400'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-50 scale-110' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[0.6rem] font-bold uppercase tracking-tighter ${active ? 'text-[#5F27CD]' : 'text-gray-400'}`}>
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
