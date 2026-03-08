import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-spa');
  const philosophyImg = PlaceHolderImages.find(i => i.id === 'massage-1');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6" />
            <span className="text-2xl font-headline font-bold text-primary tracking-tight">AuraFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Philosophy</Link>
            <Link href="/booking" className="hover:text-primary transition-colors">Book Now</Link>
            <Link href="/client/login" className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all">Client Portal</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg?.imageUrl || 'https://picsum.photos/seed/aura-hero/1920/1080'}
            alt="Luxury Spa"
            fill
            className="object-cover brightness-[0.85]"
            priority
            data-ai-hint="luxury spa"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-primary leading-tight mb-6">
              Reclaim Your <br />
              <span className="text-secondary italic">Inner Radiance</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed max-w-lg">
              Experience the pinnacle of Swiss massage therapy. A sanctuary where clinical expertise meets holistic serenity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg shadow-xl hover:scale-105 transition-transform">
                <Link href="/booking">Book Your Journey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg bg-white/50 backdrop-blur-sm border-primary/20">
                <Link href="#services">Explore Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-headline font-bold text-primary mb-4">Curated Therapies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each session is tailored to your body's specific needs, using premium techniques and sustainable ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <div key={service.id} className="group p-8 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-background transition-all duration-500">
                <div className="mb-6 flex items-start justify-between">
                  <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold text-primary">CHF {service.price}</span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-3">{service.name}</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold uppercase tracking-widest text-secondary">{service.duration}</span>
                  <Link href={`/booking?serviceId=${service.id}`} className="flex items-center gap-1 text-sm font-bold text-primary hover:gap-3 transition-all">
                    Book Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="about" className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={philosophyImg?.imageUrl || 'https://picsum.photos/seed/massage1/800/600'}
              alt="Massage Session"
              fill
              className="object-cover"
              data-ai-hint="massage therapy"
            />
          </div>
          <div>
            <h2 className="text-5xl font-headline font-bold mb-8">Clinical Excellence, <br />Holistic Heart</h2>
            <p className="text-xl text-white/80 leading-relaxed mb-10">
              In the heart of Geneva, AuraFlow combines traditional Swiss clinical precision with the intuitive flow of Eastern wellness philosophies.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <ShieldCheck className="h-10 w-10 text-secondary" />
                <h4 className="text-xl font-headline font-bold">ASCA/RME Accredited</h4>
                <p className="text-white/60 text-sm">Professional therapeutic standards for Swiss health fund compliance.</p>
              </div>
              <div className="space-y-4">
                <Sparkles className="h-10 w-10 text-secondary" />
                <h4 className="text-xl font-headline font-bold">Bespoke Aftercare</h4>
                <p className="text-white/60 text-sm">Every session includes AI-powered wellness guidance tailored to you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6" />
            <span className="text-2xl font-headline font-bold text-primary">AuraFlow Wellness</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 AuraFlow Wellness - Chemin des Coquelicots 12, Geneva. RCC: M123456</p>
          <div className="flex gap-6">
             <Link href="/therapist/login" className="text-xs text-muted-foreground hover:text-primary">Therapist Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
