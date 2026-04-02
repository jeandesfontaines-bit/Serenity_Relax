
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSignOut = () => {
    signOut(auth);
    setIsMenuOpen(false);
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-[100] px-6 py-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-baseline gap-2 cursor-pointer group">
          <span className="font-sans font-bold text-xs md:text-sm tracking-[0.2em] text-white uppercase">SERENITY RELAX</span>
          <span className="font-cursive text-[20px] md:text-[24px] text-white/60 tracking-normal whitespace-nowrap normal-case group-hover:text-white transition-colors ml-1">by João</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/client/portal" className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Espace Client</Link>
          <Link href="/therapist/dashboard" className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full font-sans font-bold text-[10px] uppercase tracking-widest text-white hover:bg-white/20 transition-all border border-white/10">
            <LayoutDashboard size={12} /> Admin
          </Link>
          {user && !user.isAnonymous && (
            <button onClick={handleSignOut} className="text-white/70 hover:text-rose-400 transition-colors">
              <LogOut size={16}/>
            </button>
          )}
        </div>
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
          {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-[#0a0a0a] shadow-2xl border-t border-white/5 p-8 flex flex-col gap-6 md:hidden"
          >
            <Link href="/client/portal" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/70">Espace Client</Link>
            <Link href="/therapist/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/70">Admin</Link>
            {user && !user.isAnonymous && (
              <button onClick={handleSignOut} className="text-left text-[10px] font-sans font-bold uppercase tracking-widest text-rose-400">Déconnexion</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
