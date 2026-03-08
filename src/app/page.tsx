import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Leaf, ShieldCheck, Sparkles, MapPin, Mail, Phone } from 'lucide-react';

export default function HomePage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-spa');
  const philosophyImg = PlaceHolderImages.find(i => i.id === 'massage-1');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed w-full z-50 bg-background/60 backdrop-blur-xl border-b border-black/5">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="text-white h-4 w-4" />
            </div>
            <span className="text-xl font-headline font-bold text-primary tracking-[0.2em] uppercase">AuraFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link href="#services" className="hover:text-secondary transition-colors">Therapies</Link>
            <Link href="#about" className="hover:text-secondary transition-colors">Philosophy</Link>
            <Link href="/booking" className="hover:text-secondary transition-colors">Reserve</Link>
            <Link href="/client/login" className="px-6 py-2 rounded-none border border-primary text-primary hover:bg-primary hover:text-white transition-all">Member Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg?.imageUrl || 'https://picsum.photos/seed/aura-hero/1920/1080'}
            alt="Luxury Spa"
            fill
            className="object-cover scale-105"
            priority
            data-ai-hint="luxury spa"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-6 block">The Art of Stillness</span>
            <h1 className="text-7xl md:text-9xl font-headline font-light text-white leading-[0.9] mb-10">
              Reclaim Your <br />
              <span className="italic font-normal">Equilibrium</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-12 leading-relaxed max-w-lg font-light">
              A curated sanctuary in Geneva where clinical mastery meets the profound silence of holistic rejuvenation.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button asChild size="lg" className="rounded-none px-12 py-8 text-sm uppercase tracking-widest font-bold shadow-2xl hover:bg-secondary transition-colors">
                <Link href="/booking">Reserve Your Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none px-12 py-8 text-sm uppercase tracking-widest font-bold bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-primary transition-all">
                <Link href="#services">Explore Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-[#F2F2F2]">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-20">
            <span className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Tailored Experience</span>
            <h2 className="text-5xl font-headline font-light text-primary mb-6">Curated Therapies</h2>
            <p className="text-muted-foreground leading-relaxed font-light">
              Every touch is intentional. Our therapies are scientifically grounded and intuitively delivered, ensuring a path to restorative well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-border border border-border">
            {SERVICES.map((service) => (
              <div key={service.id} className="bg-background group p-12 text-left hover:bg-white transition-all duration-700 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{service.duration}</span>
                  <span className="text-lg font-headline italic">CHF {service.price}</span>
                </div>
                <h3 className="text-2xl font-headline font-medium mb-6 group-hover:text-secondary transition-colors">{service.name}</h3>
                <p className="text-muted-foreground text-sm font-light mb-auto leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  {service.description}
                </p>
                <Link href={`/booking?serviceId=${service.id}`} className="mt-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-secondary transition-all">
                  Reserve Now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="about" className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-[4/5] overflow-hidden grayscale-[0.2]">
            <Image
              src={philosophyImg?.imageUrl || 'https://picsum.photos/seed/massage1/800/600'}
              alt="Massage Session"
              fill
              className="object-cover"
              data-ai-hint="massage therapy"
            />
          </div>
          <div>
            <span className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">Our Ethos</span>
            <h2 className="text-6xl font-headline font-light mb-10 leading-tight">Swiss Precision, <br />Holistic Heart</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light mb-12">
              In the heart of Geneva, AuraFlow defines the intersection of traditional Swiss clinical rigor and the serene flow of Eastern longevity practices.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="h-px w-12 bg-secondary/50 mb-6"></div>
                <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-secondary">Accreditation</h4>
                <p className="text-white/40 text-sm font-light leading-relaxed">ASCA & RME standards ensuring medical-grade excellence for health fund compliance.</p>
              </div>
              <div className="space-y-4">
                <div className="h-px w-12 bg-secondary/50 mb-6"></div>
                <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-secondary">Technology</h4>
                <p className="text-white/40 text-sm font-light leading-relaxed">AI-enhanced wellness journey mapping tailored to your specific physiological profile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="text-white h-3 w-3" />
                </div>
                <span className="text-lg font-headline font-bold text-primary tracking-[0.2em] uppercase">AuraFlow</span>
              </div>
              <p className="text-muted-foreground text-sm font-light max-w-sm leading-relaxed">
                Elevating the standards of wellness through precision, empathy, and artistic dedication to the human form.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Connect</h4>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Chemin des Coquelicots 12, 1202 Geneva
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> +41 22 734 50 00
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> concierge@auraflow.ch
              </div>
            </div>
            <div className="space-y-4">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Legal</h4>
               <Link href="/therapist/login" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Practitioner Access</Link>
               <p className="text-xs text-muted-foreground/50">RCC: M123456 • VAT: CHE-123.456.789</p>
            </div>
          </div>
          <div className="pt-8 border-t border-black/5 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/50">© 2024 AuraFlow Wellness. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}