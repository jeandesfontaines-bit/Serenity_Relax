'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutGrid, Users, Wallet } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onBookingClick?: () => void;
}

export function Navbar({ onBookingClick }: NavbarProps) {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
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

  const isTherapistArea = pathname?.startsWith('/therapist');

  const adminLinks = [
    { id: "dashboard", label: "Accueil", icon: LayoutGrid, href: "/therapist/dashboard" },
    { id: "clients", label: "Clients", icon: Users, href: "/therapist/clients" },
    { id: "invoices", label: "Factures", icon: Wallet, href: "/therapist/invoices" },
  ];

  return (
    <div className="absolute top-8 left-0 right-0 z-[150] px-6">
      <nav className="max-w-4xl mx-auto bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full px-8 py-1.5 md:py-2">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-baseline gap-1 md:gap-2 cursor-pointer group">
            <span className="font-sans font-bold text-[0.7rem] tracking-[0.3em] text-neutral-900 uppercase transition-all duration-500 md:text-[0.75rem] lg:text-[0.8rem]">SERENITY RELAX</span>
            <span className="font-cursive text-[1.1rem] text-neutral-900 tracking-normal whitespace-nowrap normal-case transition-colors ml-1 md:text-[1.25rem] lg:text-[1.35rem]">by João</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            {isTherapistArea ? (
              <>
                {adminLinks.map((link) => (
                  <Link 
                    key={link.id} 
                    href={link.href} 
                    className={`flex items-center gap-2 text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-colors md:text-[0.7rem] lg:text-[0.75rem] ${pathname === link.href ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              <>
                <Link 
                  href="/client/portal" 
                  className={`flex items-center gap-2 text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-all md:text-[0.7rem] lg:text-[0.75rem] ${pathname === '/client/portal' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}
                >
                  Espace Privé
                </Link>
                <button 
                  onClick={onBookingClick}
                  className="flex items-center justify-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-all px-5 py-1.5 rounded-full border border-neutral-900 md:text-[0.7rem] lg:text-[0.75rem] text-neutral-900 hover:bg-neutral-900 hover:text-white"
                >
                  Réserver
                </button>
              </>
            )}

            {user && !user.isAnonymous && (
              <button onClick={handleSignOut} className="text-neutral-300 hover:text-rose-500 transition-colors ml-2">
                <LogOut size={14}/>
              </button>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-neutral-900 p-1">
            {isMenuOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-[2rem] border border-white/20 p-8 flex flex-col gap-6 md:hidden text-center overflow-hidden"
            >
              {isTherapistArea ? (
                adminLinks.map((link) => (
                  <Link key={link.id} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-neutral-900 py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/client/portal" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-4 text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-neutral-900 py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                    Espace Privé
                  </Link>
                  <button 
                    onClick={() => { setIsMenuOpen(false); onBookingClick?.(); }} 
                    className="flex items-center justify-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] bg-neutral-900 text-white rounded-full py-3 w-full md:text-[0.7rem] lg:text-[0.75rem]"
                  >
                    Réserver
                  </button>
                </>
              )}
              
              {user && !user.isAnonymous && (
                <button onClick={handleSignOut} className="text-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-rose-500 pt-4 border-t border-neutral-100 md:text-[0.7rem] lg:text-[0.75rem]">Déconnexion</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}