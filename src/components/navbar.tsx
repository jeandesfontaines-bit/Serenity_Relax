
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isTherapistArea = pathname?.startsWith('/therapist');
  const isLoginPage = pathname === '/login';

  // Check if current user is the therapist
  const isTherapist = user && user.email === 'jean.desfontaines@gmail.com';

  const adminLinks = [
    { id: "dashboard", label: "Accueil", href: "/therapist/dashboard" },
    { id: "clients", label: "Clients", href: "/therapist/clients" },
    { id: "invoices", label: "Factures", href: "/therapist/invoices" },
  ];

  if (isLoginPage) return null;

  return (
    <div className="absolute top-6 left-0 right-0 z-40 px-6">
      <nav className="max-w-[1200px] xl:max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-full px-6 py-2.5 md:px-10 md:py-3.5">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-baseline gap-2 md:gap-3 cursor-pointer group">
            <span className="whitespace-nowrap font-sans font-black text-[0.75rem] tracking-[0.2em] text-neutral-900 md:text-[0.85rem] lg:text-[1rem]">Serenity Relax Therapy</span>
            <span className="whitespace-nowrap font-cursive text-[1.2rem] text-neutral-600 md:text-[1.4rem] lg:text-[1.6rem]">by João</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {isTherapistArea ? (
              <>
                {adminLinks.map((link) => (
                  <Link 
                    key={link.id} 
                    href={link.href} 
                    className={`whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-colors md:text-[0.7rem] lg:text-[0.75rem] ${pathname === link.href ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              <>
                {isTherapist && (
                  <Link 
                    href="/therapist/dashboard" 
                    className="whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-amber-600 hover:text-amber-700 transition-all md:text-[0.7rem] lg:text-[0.75rem] flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} /> Dashboard
                  </Link>
                )}

                <button 
                  onClick={onBookingClick}
                  className="whitespace-nowrap flex items-center justify-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-all px-5 py-2 rounded-full border border-neutral-900 md:text-[0.7rem] lg:text-[0.75rem] text-neutral-900 hover:bg-neutral-900 hover:text-white"
                >
                  Réserver
                </button>
              </>
            )}

            <div className="h-6 w-[1px] bg-neutral-200" />

            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end justify-center">
                   <span className="whitespace-nowrap text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest font-black text-neutral-900 leading-none mb-1">{user.displayName?.split(' ')[0] || 'Profil'}</span>
                   <button onClick={handleSignOut} className="whitespace-nowrap text-[0.55rem] md:text-[0.6rem] uppercase tracking-widest font-bold text-rose-500 hover:text-rose-600 transition-colors leading-none">Déconnexion</button>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border border-neutral-100 shadow-sm object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-neutral-900 hover:opacity-70 transition-all md:text-[0.7rem] lg:text-[0.75rem] flex items-center gap-2"
              >
                Connexion
              </Link>
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
                  <Link key={link.id} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-neutral-900 py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  {isTherapist && (
                    <Link href="/therapist/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-amber-600 py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                      Dashboard Administrateur
                    </Link>
                  )}
                  <button 
                    onClick={() => { setIsMenuOpen(false); onBookingClick?.(); }} 
                    className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] bg-neutral-900 text-white rounded-full py-2.5 w-full md:text-[0.7rem] lg:text-[0.75rem]"
                  >
                    Réserver
                  </button>
                  
                  {!user || user.isAnonymous ? (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-neutral-900 py-2 pt-4 border-t border-neutral-100">
                      Connexion
                    </Link>
                  ) : (
                    <button onClick={handleSignOut} className="text-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-rose-500 pt-4 border-t border-neutral-100 md:text-[0.7rem] lg:text-[0.75rem]">Déconnexion</button>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}

