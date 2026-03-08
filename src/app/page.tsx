import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Leaf, Sparkles, MapPin, Mail, Phone, Instagram } from 'lucide-react';

export default function HomePage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-spa');
  const philosophyImg = PlaceHolderImages.find(i => i.id === 'massage-1');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed w-full z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="text-primary h-6 w-6" />
            <span className="text-xl font-headline font-semibold text-primary tracking-wide">AuraFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.15em]">
            <Link href="#services" className="hover:text-secondary transition-colors">Treatments</Link>
            <Link href="#about" className="hover:text-secondary transition-colors">The Studio</Link>
            <Link href="/booking" className="hover:text-secondary transition-colors">Book Online</Link>
            <Link href="/client/login" className="px-5 py-2 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">Portal</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg?.imageUrl || 'https://picsum.photos/seed/aura-hero/1920/1080'}
            alt="Wellness Sanctuary"
            fill
            className="object-cover"
            priority
            data-ai-hint="luxury spa"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <span className="text-secondary font-semibold uppercase tracking-[0.3em] text-[10px] mb-4 block">A Haven of Tranquility</span>
            <h1 className="text-6xl md:text-8xl font-headline font-normal text-white leading-[1.1] mb-8">
              Restore Your <br />
              <span className="italic">Inner Vitality</span>
            </h1>
            <p className="text-lg text-white/90 mb-10 leading-relaxed max-w-md font-light">
              Experience the perfect harmony of modern clinical massage and holistic relaxation in the heart of Geneva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-full px-10 py-6 text-xs uppercase tracking-widest font-semibold bg-primary hover:bg-primary/90 transition-all">
                <Link href="/booking">Book Your Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-6 text-xs uppercase tracking-widest font-semibold bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-primary transition-all">
                <Link href="#services">Our Treatments</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-accent/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="text-secondary font-semibold uppercase tracking-[0.2em] text-[10px] mb-3 block">Bespoke Therapies</span>
            <h2 className="text-4xl md:text-5xl font-headline font-normal text-primary mb-6">Curated for Your Well-being</h2>
            <p className="text-muted-foreground leading-relaxed font-light">
              Each treatment is tailored to your unique needs, combining scientific precision with a rhythmic, restorative touch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.slice(0, 6).map((service) => (
              <Card key={service.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white flex flex-col h-full">
                <CardContent className="p-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">{service.duration}</span>
                    <span className="text-xl font-headline italic text-primary">CHF {service.price}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-medium mb-4 group-hover:text-secondary transition-colors">{service.name.split('-')[0]}</h3>
                  <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  <Link href={`/booking?serviceId=${service.id}`} className="mt-auto flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary hover:text-secondary transition-all">
                    Reserve <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button asChild variant="ghost" className="rounded-full text-primary hover:text-secondary">
              <Link href="/booking" className="flex items-center gap-2">View Full Menu <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem]">
            <Image
              src={philosophyImg?.imageUrl || 'https://picsum.photos/seed/massage1/800/600'}
              alt="The Studio Experience"
              fill
              className="object-cover scale-105"
              data-ai-hint="modern spa"
            />
          </div>
          <div className="lg:pl-10">
            <span className="text-secondary font-semibold uppercase tracking-[0.3em] text-[10px] mb-6 block">The AuraFlow Way</span>
            <h2 className="text-5xl md:text-6xl font-headline font-normal text-primary mb-8 leading-tight">Modern Science, <br />Sensory Comfort</h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-light mb-10">
              We've reimagined the wellness journey for the modern individual. Our studio combines Swiss clinical excellence (ASCA/RME) with a warm, inviting atmosphere designed to let you breathe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">Certified Quality</h4>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">Recognized by major health funds for therapeutic excellence and professional care.</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">Personalized Care</h4>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">Our AI-assisted consultation ensures every stroke serves your recovery goals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Leaf className="text-secondary h-6 w-6" />
                <span className="text-2xl font-headline font-semibold tracking-wide">AuraFlow</span>
              </div>
              <p className="text-white/60 text-sm font-light max-w-sm leading-relaxed">
                A contemporary retreat dedicated to the art of holistic recovery and physiological balance.
              </p>
              <div className="flex gap-4">
                <Instagram className="h-5 w-5 text-secondary cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-secondary">Contact</h4>
              <div className="space-y-3 text-sm text-white/60 font-light">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Geneva City Centre</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +41 22 734 50 00</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@auraflow.ch</p>
              </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-secondary">Practitioners</h4>
               <Link href="/therapist/login" className="block text-sm text-white/60 hover:text-secondary transition-colors font-light underline underline-offset-4">Therapist Login</Link>
               <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">RCC: M123456</p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">© 2024 AuraFlow. Redefining Wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
