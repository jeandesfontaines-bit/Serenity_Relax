'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1a1c1b] border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 px-8 md:px-16 py-32 max-w-[1440px] mx-auto text-white">
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-[#435544] rotate-45"></div>
            <div className="font-serif text-2xl tracking-tighter text-white uppercase">SERENITY & RELAX</div>
          </div>
          <p className="font-serif uppercase tracking-[0.6em] text-[8px] max-w-sm leading-[2.2] text-white/40 italic">
            A HIGHER STANDARD OF THERAPY. <br />
            WHERE ARCHITECTURE MEETS THE BODY. <br />
            GENÈVE, SUISSE.
          </p>
        </div>
        <div className="flex flex-col md:items-end justify-between gap-16">
          <nav className="flex flex-wrap gap-8 md:gap-16">
            <Link href="/#hero" className="font-serif uppercase tracking-[0.4em] text-[9px] text-white/60 hover:text-white transition-all duration-700 hover:tracking-[0.6em]">STUDIO</Link>
            <Link href="/#services" className="font-serif uppercase tracking-[0.4em] text-[9px] text-white/60 hover:text-white transition-all duration-700 hover:tracking-[0.6em]">TREATMENTS</Link>
            <Link href="/#about" className="font-serif uppercase tracking-[0.4em] text-[9px] text-white/60 hover:text-white transition-all duration-700 hover:tracking-[0.6em]">PHILOSOPHY</Link>
            <Link href="/#faq" className="font-serif uppercase tracking-[0.4em] text-[9px] text-white/60 hover:text-white transition-all duration-700 hover:tracking-[0.6em]">FAQ</Link>
          </nav>
          <div className="font-serif uppercase tracking-[0.4em] text-[8px] text-white/20">
            © {currentYear} SERENITY & RELAX THERAPY. ARCHITECTURAL WELLNESS.
          </div>
        </div>
      </div>
    </footer>
  );
}
