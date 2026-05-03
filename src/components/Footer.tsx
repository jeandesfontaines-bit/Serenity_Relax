'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-foreground text-background overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
      
      <div className="container-wide py-32 md:py-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="flex flex-col gap-10">
              <Link href="/" className="flex flex-col group">
                <span className="font-sans font-medium text-[20px] md:text-[24px] tracking-[0.5em] uppercase text-white">
                  SERENITY
                </span>
                <span className="font-signature text-[28px] md:text-[32px] text-primary lowercase -mt-2">
                  by João
                </span>
              </Link>
              <p className="max-w-md text-[18px] text-background/40 font-light leading-relaxed">
                Un sanctuaire confidentiel dédié à la restauration profonde du corps et de l&apos;esprit. Thérapeute agréé ASCA & RME à Genève Cointrin.
              </p>
              <div className="flex items-center gap-8 mt-10">
                 {['Instagram', 'LinkedIn', 'Facebook'].map((social) => (
                   <a key={social} href="#" className="text-[10px] font-bold uppercase tracking-[0.4em] text-background/30 hover:text-primary">{social}</a>
                 ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-white/20 mb-12">Exploration</h4>
            <nav className="flex flex-col gap-6">
              {[
                { label: 'Le Studio', href: '/#hero' },
                { label: 'Les Soins', href: '/#services' },
                { label: 'Philosophie', href: '/#about' },
                { label: 'Questions', href: '/#faq' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="text-[16px] font-light text-background/60 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-white/20 mb-12">Contact</h4>
            <div className="flex flex-col gap-6 text-[16px] font-light text-background/60">
              <p>Genève Cointrin, Suisse</p>
              <p>joao@serenity-geneve.ch</p>
              <p>+41 (0) 22 123 45 67</p>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">
            © {currentYear} Serenity Relax Therapy. Tous droits réservés.
          </p>
          <div className="flex items-center gap-10 text-[10px] uppercase tracking-[0.4em] text-white/20">
            <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white">Mentions Légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
