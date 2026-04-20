'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  onBookingClick?: () => void;
}

export function Navbar({ onBookingClick }: NavbarProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionClientId, setSessionClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedId = sessionStorage.getItem('serenity_client_id');
    setSessionClientId(storedId);

    if (storedId && firestore) {
      getDoc(doc(firestore, 'clients', storedId)).then(snap => {
        if (snap.exists()) {
          setClientName(snap.data().firstName);
        }
      });
    }
  }, [firestore]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      sessionStorage.removeItem('serenity_client_id');
      setSessionClientId(null);
      setClientName(null);
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isTherapistArea = pathname?.startsWith('/therapist');
  const isLoginPage = pathname === '/login';

  const isTherapist = user && user.email === 'jean.desfontaines@gmail.com';
  const effectiveUser = user && !user.isAnonymous ? {
    name: user.displayName?.split(' ')[0] || 'Profil',
    photo: user.photoURL,
    type: isTherapist ? 'therapist' : 'client'
  } : sessionClientId ? {
    name: clientName || 'Client',
    photo: null,
    type: 'client'
  } : null;

  const adminLinks = [
    { id: "dashboard", label: "Accueil", href: "/therapist/dashboard" },
    { id: "clients", label: "Clients", href: "/therapist/clients" },
    { id: "invoices", label: "Factures", href: "/therapist/invoices" },
  ];

  if (isLoginPage) return null;

  return (
    <div className="absolute top-6 left-0 right-0 z-40 px-6">
      <nav className="max-w-[1200px] xl:max-w-6xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full px-6 py-2.5 md:px-10 md:py-3.5">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-baseline gap-2 md:gap-3 cursor-pointer group">
            <span className="whitespace-nowrap font-sans font-black uppercase text-[0.75rem] tracking-[0.2em] text-[#222F3E] md:text-[0.85rem] lg:text-[1rem]">Serenity Relax Therapy</span>
            <span className="whitespace-nowrap font-cursive text-[1.2rem] text-[#5B6B78] md:text-[1.4rem] lg:text-[1.6rem]">by João</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {isTherapistArea ? (
              <>
                {adminLinks.map((link) => (
                  <Link 
                    key={link.id} 
                    href={link.href} 
                    className={`whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-colors md:text-[0.7rem] lg:text-[0.75rem] ${pathname === link.href ? 'text-[#54A0FF]' : 'text-[#576574] hover:text-[#222F3E]'}`}
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
                    className="whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#5F27CD] hover:text-[#5F27CD]/80 transition-all md:text-[0.7rem] lg:text-[0.75rem] flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} /> Dashboard
                  </Link>
                )}

                {!isTherapist && effectiveUser && (
                  <Link 
                    href="/client/portal" 
                    className="whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#222F3E] hover:text-[#54A0FF] transition-all md:text-[0.7rem] lg:text-[0.75rem] flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-[#FECA57]" /> Mon Sanctuaire
                  </Link>
                )}

                <button 
                  onClick={onBookingClick}
                  className="whitespace-nowrap flex items-center justify-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] transition-all px-5 py-2 rounded-full md:text-[0.7rem] lg:text-[0.75rem] text-white"
                  style={{ background: '#0F1114', boxShadow: '0 4px 15px rgba(0,0,0,0.25)' }}
                >
                  Réserver
                </button>
              </>
            )}

            <div className="h-6 w-[1px] bg-[#C8D6E5]" />

            {effectiveUser ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end justify-center">
                   <span className="whitespace-nowrap text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest font-black text-[#222F3E] leading-none mb-1">{effectiveUser.name}</span>
                   <button onClick={handleSignOut} className="whitespace-nowrap text-[0.55rem] md:text-[0.6rem] uppercase tracking-widest font-bold text-[#FF6B6B] hover:text-[#EE5A53] transition-colors leading-none">Déconnexion</button>
                </div>
                {effectiveUser.photo ? (
                  <img src={effectiveUser.photo} alt="" className="w-9 h-9 rounded-full border-2 border-[#54A0FF]/20 shadow-sm object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="whitespace-nowrap text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#222F3E] hover:text-[#54A0FF] transition-all md:text-[0.7rem] lg:text-[0.75rem] flex items-center gap-2"
              >
                Connexion
              </Link>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#222F3E] p-1">
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
                  <Link key={link.id} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#222F3E] py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  {isTherapist && (
                    <Link href="/therapist/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#5F27CD] py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                      Dashboard Administrateur
                    </Link>
                  )}
                  
                  {effectiveUser && effectiveUser.type === 'client' && (
                    <Link href="/client/portal" onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#222F3E] py-2 md:text-[0.7rem] lg:text-[0.75rem]">
                      Mon Sanctuaire
                    </Link>
                  )}

                  <button 
                    onClick={() => { setIsMenuOpen(false); onBookingClick?.(); }} 
                    className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-white rounded-full py-2.5 w-full md:text-[0.7rem] lg:text-[0.75rem]"
                    style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}
                  >
                    Réserver
                  </button>
                  
                  {!effectiveUser ? (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#222F3E] py-2 pt-4 border-t border-[#C8D6E5]/50">
                      Connexion
                    </Link>
                  ) : (
                    <div className="pt-4 border-t border-[#C8D6E5]/50 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-black uppercase tracking-widest">{effectiveUser.name}</span>
                      </div>
                      <button onClick={handleSignOut} className="text-center text-[0.65rem] font-sans font-black uppercase tracking-[0.18em] text-[#FF6B6B] md:text-[0.7rem] lg:text-[0.75rem]">Déconnexion</button>
                    </div>
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
