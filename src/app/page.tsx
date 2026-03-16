
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CurvedCarousel } from '@/components/curved-carousel';
import { ArrowRight, Leaf, MapPin, Mail, Phone, Instagram, Sparkles } from 'lucide-react';

export default function HomePage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-spa');
  const philosophyImg = PlaceHolderImages.find(i => i.id === 'massage-1');
  const oilsImg = PlaceHolderImages.find(i => i.id === 'oils');

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
            <Link href="/client/login" className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Portal</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-12 overflow-hidden text-center bg-[#FDFCF8]">
        <div className="container mx-auto px-6 z-10 space-y-8 max-w-4xl">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">Curate your recovery</p>
          <h1 className="text-6xl md:text-8xl font-headline leading-[1] text-primary text-balance">
            and deliver — <br />
            <span className="italic font-light text-secondary">faster and smarter.</span>
          </h1>
          
          <div className="flex justify-center pt-4">
            <Button asChild size="lg" className="rounded-full px-10 py-7 text-[11px] uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20">
              <Link href="/booking" className="flex items-center gap-2">
                Get started for Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 3D Curved Carousel */}
        <div className="w-full max-w-[1400px] mt-16 mx-auto">
          <CurvedCarousel />
        </div>

        {/* Features Grid below Carousel */}
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 text-left max-w-6xl pb-20">
          <div className="space-y-4">
            <h3 className="text-xl font-headline font-bold text-primary">Real-Time Collaboration</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Communicate seamlessly and keep everyone in sync with built-in messaging, file sharing, and live updates.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-headline font-bold text-primary">Task & Project Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Assign tasks, set deadlines, and visualize progress with boards, lists, and timelines tailored to your team's style.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-headline font-bold text-primary">Performance Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Make smarter decisions with analytics that show productivity trends, bottlenecks, and team workload balance.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Selected Therapies</span>
              <h2 className="text-5xl font-headline text-primary italic leading-tight">Handcrafted Recovery</h2>
            </div>
            <p className="text-muted-foreground max-w-sm font-light leading-relaxed">
              Every session is a bespoke choreography of pressure and pace, tailored to your immediate physiological needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {SERVICES.slice(0, 6).map((service, idx) => (
              <Card key={service.id} className="group border-none bg-transparent shadow-none hover:shadow-2xl hover:bg-white transition-all duration-700 rounded-[3rem] overflow-hidden">
                <CardContent className="p-12 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-10">
                    <span className="text-[3rem] font-headline text-primary/10 group-hover:text-secondary/20 transition-colors">0{idx + 1}</span>
                    <span className="text-lg font-headline italic text-secondary">CHF {service.price}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-medium mb-6 text-primary group-hover:translate-x-2 transition-transform duration-500">{service.name.split('-')[0]}</h3>
                  <p className="text-muted-foreground text-sm font-light mb-10 leading-relaxed opacity-80">
                    {service.description}
                  </p>
                  <div className="mt-auto pt-6 border-t border-primary/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{service.duration}</span>
                    <Link href={`/booking?serviceId=${service.id}`} className="p-3 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
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
      <footer className="bg-primary py-24 px-6 text-white/90">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <Leaf className="text-secondary h-6 w-6" />
                <span className="text-3xl font-headline tracking-tight">AuraFlow</span>
              </div>
              <p className="text-white/60 text-lg font-light max-w-sm leading-relaxed">
                Quiet therapy for a loud world. Located in the heart of Geneva, serving the modern individual.
              </p>
              <div className="flex gap-6">
                <Link href="#" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Visit Us</h4>
              <div className="space-y-4 text-white/50 font-light text-sm">
                <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-secondary" /> Rue de la Confédération, Geneva</p>
                <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-secondary" /> +41 22 734 50 00</p>
                <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-secondary" /> hello@auraflow.ch</p>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">The Practice</h4>
              <div className="space-y-4 font-light text-sm text-white/50">
                <Link href="/therapist/login" className="block hover:text-white transition-colors underline underline-offset-8 decoration-white/10">Therapist Login</Link>
                <p className="text-[10px] opacity-30 uppercase tracking-widest mt-8">ASCA / RME Accredited Practice</p>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">© 2024 AuraFlow Wellness Sanctuary</p>
            <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-white/20">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
