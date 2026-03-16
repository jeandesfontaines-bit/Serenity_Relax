
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CurvedCarousel } from '@/components/curved-carousel';
import { ArrowRight, Leaf, MapPin, Mail, Phone, Instagram, Sparkles } from 'lucide-react';

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
            <span className="text-xl font-headline font-medium text-primary tracking-tight">AuraFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
            <Link href="#services" className="hover:text-primary transition-colors">The Menu</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Our Ethos</Link>
            <Link href="/booking" className="hover:text-primary transition-colors">Reservations</Link>
            <Link href="/client/portal" className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Portal</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-12 overflow-hidden text-center">
        <div className="container mx-auto px-6 z-10 space-y-8 max-w-4xl">
          <span className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Bespoke Wellness in Geneva</span>
          <h1 className="text-6xl md:text-8xl font-headline leading-[0.95] text-primary text-balance mb-8">
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
        <div className="w-full max-w-[1400px] mt-16 mx-auto perspective-1000">
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

      {/* Services Grid */}
      <section id="services" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-xl">
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">The Menu</span>
              <h2 className="text-5xl font-headline text-primary italic leading-tight">Therapeutic Arts</h2>
            </div>
            <p className="text-muted-foreground max-w-sm font-light leading-relaxed">
              Select from our curated range of services, each meticulously crafted to address specific physical and mental states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {SERVICES.slice(0, 6).map((service, idx) => (
              <Card key={service.id} className="group border-none bg-transparent shadow-none hover:shadow-3xl hover:bg-[#FDFCF8] transition-all duration-700 rounded-[3rem] overflow-hidden">
                <CardContent className="p-12 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-[3.5rem] font-headline text-primary/5 group-hover:text-secondary/10 transition-colors">0{idx + 1}</span>
                    <span className="text-lg font-headline italic text-secondary">CHF {service.price}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-medium mb-6 text-primary group-hover:translate-x-2 transition-transform duration-500">{service.name.split('-')[0]}</h3>
                  <p className="text-muted-foreground text-sm font-light mb-12 leading-relaxed opacity-80">
                    {service.description}
                  </p>
                  <div className="mt-auto pt-8 border-t border-primary/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{service.duration}</span>
                    <Link href={`/booking?serviceId=${service.id}`} className="p-4 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-32 px-6 text-white/90">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
            <div className="md:col-span-2 space-y-10">
              <div className="flex items-center gap-3">
                <Leaf className="text-secondary h-8 w-8" />
                <span className="text-4xl font-headline tracking-tight">AuraFlow</span>
              </div>
              <p className="text-white/60 text-xl font-light max-w-sm leading-relaxed">
                A contemporary sanctuary for physical restoration and mental clarity in the heart of Geneva.
              </p>
              <div className="flex gap-6">
                <Link href="#" className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <Instagram className="h-6 w-6" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Sanctuary</h4>
              <div className="space-y-6 text-white/50 font-light text-base">
                <p className="flex items-center gap-4"><MapPin className="h-5 w-5 text-secondary" /> Rue de la Confédération, 1204 Genève</p>
                <p className="flex items-center gap-4"><Phone className="h-5 w-5 text-secondary" /> +41 22 734 50 00</p>
                <p className="flex items-center gap-4"><Mail className="h-5 w-5 text-secondary" /> hello@auraflow.ch</p>
              </div>
            </div>

            <div className="space-y-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">The Practice</h4>
              <div className="space-y-6 font-light text-base text-white/50">
                <Link href="/therapist/dashboard" className="block hover:text-white transition-colors underline underline-offset-[12px] decoration-white/10">Therapist Portal</Link>
                <p className="text-[10px] opacity-30 uppercase tracking-[0.2em] mt-12 leading-loose">Accredited by ASCA / RME <br /> Complementary Medicine</p>
              </div>
            </div>
          </div>
          
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">© 2024 AuraFlow Wellness Sanctuary</p>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] text-white/20">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
