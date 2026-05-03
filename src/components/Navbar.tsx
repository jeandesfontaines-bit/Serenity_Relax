'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User as UserIcon, Sparkles } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar({ onBookingClick }: { onBookingClick?: () => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sessionClientId, setSessionClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const storedId = sessionStorage.getItem('serenity_client_id');
    setSessionClientId(storedId);

    if (storedId && firestore) {
      getDoc(doc(firestore, 'clients', storedId)).then(snap => {
        if (snap.exists()) {
          setClientName(snap.data().firstName);
        }
      });
    }

    return () => window.removeEventListener('scroll', handleScroll);
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

  const mainLinks = [
    { label: 'Studio', href: '/#hero' },
    { label: 'Soins', href: '/#services' },
    { label: 'Philosophie', href: '/#about' },
    { label: 'FAQ', href: '/#faq' },
  ];

  if (isLoginPage) return null;

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-[100] ${
        isScrolled 
          ? 'py-4 bg-white/70 backdrop-blur-2xl border-b border-black/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.02)]' 
          : 'py-10 bg-transparent'
      }`}
    >
      <div className="flex justify-between items-center w-full px-8 md:px-16 max-w-[1920px] mx-auto">
        <Link href="/" className="flex flex-col group relative">
          <span className={`font-sans font-medium text-[15px] md:text-[17px] tracking-[0.5em] uppercase ${isScrolled ? 'text-foreground' : 'text-white'}`}>
            SERENITY
          </span>
          <span className={`font-signature text-[20px] md:text-[24px] lowercase -mt-1.5 opacity-70 ${isScrolled ? 'text-secondary' : 'text-white/70'}`}>
            by João
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-14">
          {(isTherapistArea ? adminLinks : mainLinks).map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className={`relative font-sans uppercase tracking-[0.4em] text-[10px] group ${
                isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/50 hover:text-white'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary ${
                pathname === link.href ? '' : 'hidden'
              }`} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-10">
          {effectiveUser ? (
            <div className="flex items-center gap-5 group cursor-pointer">
              <div className="flex flex-col items-end justify-center">
                 <span className={`font-sans uppercase tracking-[0.3em] text-[9px] leading-none mb-1.5 ${isScrolled ? 'text-foreground' : 'text-white'}`}>
                   {effectiveUser.name}
                 </span>
                 <button onClick={handleSignOut} className={`font-sans uppercase tracking-[0.3em] text-[9px] leading-none ${isScrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/40 hover:text-white'}`}>
                   Sortie
                 </button>
              </div>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden ${
                isScrolled ? 'border-border bg-white text-foreground' : 'border-white/20 bg-white/10 text-white'
              }`}>
                {effectiveUser.photo ? (
                  <img src={effectiveUser.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={14} strokeWidth={1.5} />
                )}
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              className={`hidden sm:block font-sans uppercase tracking-[0.4em] text-[10px] ${
                isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/50 hover:text-white'
              }`}
            >
              Accès
            </Link>
          )}

          <button 
            onClick={onBookingClick}
            className={`premium-button rounded-full overflow-hidden ${
              isScrolled 
                ? 'bg-foreground text-background hover:bg-primary' 
                : 'bg-white text-foreground hover:bg-primary hover:text-white'
            }`}
          >
            <span>Réserver</span>
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden rounded-full p-3 ${isScrolled ? 'text-foreground hover:bg-black/5' : 'text-white hover:bg-white/10'}`}>
            {isMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
          <div className="fixed inset-0 top-0 z-[90] flex flex-col gap-20 bg-background p-16 md:p-32">
            <div className="flex justify-between items-center mb-10">
               <span className="font-sans uppercase tracking-[0.6em] text-[12px] text-muted-foreground">Menu</span>
               <button onClick={() => setIsMenuOpen(false)} className="p-4 rounded-full bg-muted text-foreground">
                  <X size={24} strokeWidth={1.5} />
               </button>
            </div>

            <nav className="flex flex-col gap-10">
              {(isTherapistArea ? adminLinks : mainLinks).map((link) => (
                <div key={link.label}>
                  <Link 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center justify-between font-serif text-[48px] tracking-tight text-foreground hover:text-primary md:text-[64px]"
                  >
                    <span>{link.label}</span>
                    <Sparkles className="text-primary" size={32} strokeWidth={1} />
                  </Link>
                </div>
              ))}
            </nav>
            
            <div className="mt-auto flex flex-col gap-8">
              {!effectiveUser && (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="font-sans uppercase tracking-[0.5em] text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Espace Praticien
                </Link>
              )}
              <button 
                onClick={() => { setIsMenuOpen(false); onBookingClick?.(); }} 
                className="premium-button bg-foreground text-background rounded-full py-8 text-[14px]"
              >
                Initialiser un Soin
              </button>
            </div>
          </div>
        )}
    </header>
  );
}
