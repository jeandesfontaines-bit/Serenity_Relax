'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CurvedCarousel } from '@/components/curved-carousel';
import { Leaf, User, Coffee, Sparkles, Instagram, Linkedin, MessageSquare, ArrowRight } from 'lucide-react';

const BENEFITS = [
  { icon: Leaf, text: "Huiles Organiques", color: "text-emerald-500" },
  { icon: User, text: "Diagnostic Personnalisé", color: "text-amber-500" },
  { icon: Coffee, text: "Rituel Thé Cérémonial", color: "text-slate-500" },
  { icon: Sparkles, text: "Acoustique Zen", color: "text-indigo-500" }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCF8]">
      {/* Navigation */}
      <header className="fixed w-full z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/40 backdrop-blur-2xl rounded-full px-8 py-4 border border-white/20 organic-shadow">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="text-secondary h-4 w-4" />
            </div>
            <span className="text-xl font-headline font-medium text-primary tracking-tight">Serenity Relax</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
            <Link href="#carousel" className="hover:text-primary transition-colors">The Arts</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Our Ethos</Link>
            <Link href="/booking" className="hover:text-primary transition-colors">Reservations</Link>
            <Link href="/client/portal" className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Portal</Link>
          </nav>
        </div>
      </header>

      {/* New Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Arrière-plan avec dégradés animés */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[35rem] h-[35rem] bg-emerald-100/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[15%] right-[15%] w-[30rem] h-[30rem] bg-amber-50/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-6s' }} />
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-20">
          {/* Texte et Introduction */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1.2 }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200/30 rounded-full shadow-sm mb-10">
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-500">Genève Eaux-Vives</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-medium text-slate-950 mb-10 tracking-tight">
              L'éveil de la <br/>
              <span className="italic font-serif text-emerald-800 relative font-headline">plénitude.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-md font-headline italic mb-12">
              Un sanctuaire sensoriel confidentiel où le temps s'efface devant l'harmonie.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-10">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-100 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all cursor-default shadow-sm">
                  <b.icon className={`${b.color} opacity-60`} size={12} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="rounded-full px-10 h-14 text-[11px] uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/10">
              <Link href="/booking">Commencer l'expérience</Link>
            </Button>
          </motion.div>

          {/* Portrait avec Capsule Minimaliste */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1.5 }}
          >
            <div className="aspect-[4/5.2] max-w-[340px] mx-auto rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.1)] border-[8px] border-white group relative">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-40" />
              
              {/* Capsule João - Version réduite et élégante */}
              <div className="absolute bottom-6 left-6">
                <div className="bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/20">
                  <span className="text-sm font-bold uppercase tracking-[0.3em] block text-slate-950">João</span>
                  <span className="text-[7px] text-slate-400 block tracking-[0.5em] uppercase font-black mt-0.5 opacity-80">Praticien</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3D Curved Carousel Section */}
      <section id="carousel" className="py-24 bg-white/30">
        <div className="container mx-auto px-6 text-center mb-16">
          <span className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Découvrez nos soins</span>
          <h2 className="text-4xl md:text-5xl font-headline italic text-primary">Les Arts Thérapeutiques</h2>
        </div>
        <div className="w-full max-w-[1400px] mx-auto perspective-1000">
          <CurvedCarousel />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 py-24 text-left max-w-6xl">
        <div className="space-y-4">
          <div className="h-px w-12 bg-secondary/30 mb-6" />
          <h3 className="text-xl font-headline font-bold text-primary">Technical Precision</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            Nos praticiens combinent expertise anatomique et toucher intuitif pour libérer les tensions myofasciales profondes.
          </p>
        </div>
        <div className="space-y-4">
          <div className="h-px w-12 bg-secondary/30 mb-6" />
          <h3 className="text-xl font-headline font-bold text-primary">Architecture Sensorielle</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            Chaque détail—de l'acoustique aux huiles personnalisées—est pensé pour apaiser votre système nerveux.
          </p>
        </div>
        <div className="space-y-4">
          <div className="h-px w-12 bg-secondary/30 mb-6" />
          <h3 className="text-xl font-headline font-bold text-primary">Accompagnement IA</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            Bénéficiez de conseils post-traitement personnalisés par IA pour prolonger les bienfaits de votre séance à domicile.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] py-24 px-6 text-white/90 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-headline tracking-[0.4em] uppercase mb-4 text-white">Serenity Relax</h2>
            <p className="text-[10px] uppercase tracking-[0.6em] italic text-white/30">Excellence Thérapeutique</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center">
            {/* Localisation */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Localisation</h4>
              <div className="space-y-3 text-base font-light text-white/50 leading-relaxed">
                <p>Alfa Business Center</p>
                <p>Chemin de Joinville 26, 4ème étage</p>
                <p>1216 Cointrin - Genève</p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Contact</h4>
              <div className="space-y-3 text-base font-light text-white/50 leading-relaxed">
                <p>+41 78 333 68 23</p>
                <p className="break-all">serenityrelaxtherapy@gmail.com</p>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Social</h4>
              <div className="flex justify-center items-center gap-10">
                <Link href="#" className="text-white/40 hover:text-white transition-all">
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-white/40 hover:text-white transition-all">
                  <MessageSquare className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-white/40 hover:text-white transition-all">
                  <Linkedin className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-32 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-light">
              © 2026 Serenity Relax Therapy — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}