import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICES } from '@/lib/types';
import { CurvedCarousel } from '@/components/curved-carousel';
import { ArrowRight, Leaf, MapPin, Mail, Phone, Instagram, Sparkles, Linkedin, MessageSquare } from 'lucide-react';

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

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-12 overflow-hidden text-center">
        <div className="container mx-auto px-6 z-10 space-y-8 max-w-4xl">
          <span className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block text-center">Bespoke Wellness in Geneva</span>
          <h1 className="text-6xl md:text-8xl font-headline leading-[0.95] text-primary text-balance mb-8 text-center">
            Reclaim your <br />
            <span className="italic font-light text-secondary">inner silence.</span>
          </h1>
          
          <div className="flex justify-center pt-4">
            <Button asChild size="lg" className="rounded-full px-12 py-8 text-[11px] uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20">
              <Link href="/booking" className="flex items-center gap-2">
                Begin Your Journey <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 3D Curved Carousel */}
        <div id="carousel" className="w-full max-w-[1400px] mt-16 mx-auto perspective-1000">
          <CurvedCarousel />
        </div>

        {/* Feature Highlights */}
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 mt-24 text-left max-w-6xl pb-20">
          <div className="space-y-4">
            <div className="h-px w-12 bg-secondary/30 mb-6" />
            <h3 className="text-xl font-headline font-bold text-primary">Technical Precision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Our therapists combine medical anatomical knowledge with intuitive touch to release deep-seated myofascial tension.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-px w-12 bg-secondary/30 mb-6" />
            <h3 className="text-xl font-headline font-bold text-primary">Sensory Architecture</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Every detail—from the acoustic dampening to the custom-blended oils—is designed to down-regulate your nervous system.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-px w-12 bg-secondary/30 mb-6" />
            <h3 className="text-xl font-headline font-bold text-primary">AI-Driven Recovery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Leverage our personalized post-treatment guidance to prolong the therapeutic effects of your session at home.
            </p>
          </div>
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
