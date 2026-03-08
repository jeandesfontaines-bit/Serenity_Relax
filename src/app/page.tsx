import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Leaf, MapPin, Mail, Phone, Instagram } from 'lucide-react';

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

      {/* Hero Section - Asymmetric & Immersive */}
      <section className="relative min-h-[100vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="h-1 w-1 rounded-full bg-secondary animate-pulse" />
              Geneva Sanctuary
            </div>
            <h1 className="text-7xl md:text-8xl font-headline leading-[0.9] text-primary text-balance">
              The Art of <br />
              <span className="italic font-light text-secondary">Slow Living</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-sm font-light">
              A boutique practice dedicated to physiological restoration. Experience the intersection of manual science and deep sensory calm.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button asChild size="lg" className="rounded-full px-12 py-8 text-[11px] uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20">
                <Link href="/booking">Book a Session</Link>
              </Button>
              <Link href="#services" className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary self-center">
                Explore Menu <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[4rem] overflow-hidden organic-shadow">
              <Image
                src={heroImg?.imageUrl || 'https://picsum.photos/seed/aura-hero/1920/1080'}
                alt="Sanctuary"
                fill
                className="object-cover"
                priority
                data-ai-hint="boutique spa"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating Decorative Element */}
            <div className="absolute -bottom-12 -left-12 hidden lg:block w-64 h-64 bg-accent rounded-[3rem] p-8 organic-shadow animate-bounce-slow">
              <p className="text-primary font-headline text-2xl italic leading-tight">
                "Where time folds and the body remembers how to breathe."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Sensorial Cards */}
      <section id="services" className="py-32 bg-white/50">
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

      {/* The Atmosphere - Tactile Section */}
      <section id="about" className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 space-y-12">
            <span className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] block">The Atmosphere</span>
            <h2 className="text-6xl font-headline text-primary leading-tight">A Sanctuary <br />for the <span className="italic font-light">Senses</span></h2>
            
            <div className="grid grid-cols-1 gap-12">
              <div className="flex gap-8 group">
                <div className="h-px w-12 bg-secondary mt-3 group-hover:w-24 transition-all" />
                <div className="space-y-4">
                  <h4 className="text-lg font-headline text-primary">Olfactory Silence</h4>
                  <p className="text-muted-foreground font-light leading-relaxed">Custom essential oil blends, diffused at precise intervals to signal the brain it is time to rest.</p>
                </div>
              </div>
              <div className="flex gap-8 group">
                <div className="h-px w-12 bg-secondary mt-3 group-hover:w-24 transition-all" />
                <div className="space-y-4">
                  <h4 className="text-lg font-headline text-primary">Thermal Comfort</h4>
                  <p className="text-muted-foreground font-light leading-relaxed">Heated linen, ambient wood tones, and soft indirect lighting create a cocoon of safety.</p>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="rounded-full px-10 py-6 text-[10px] uppercase tracking-widest font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
              <Link href="/booking">Reserve Silence</Link>
            </Button>
          </div>
          
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-6 relative">
             <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden organic-shadow mt-12">
               <Image src={philosophyImg?.imageUrl || ''} alt="Atmosphere" fill className="object-cover" data-ai-hint="minimalist spa" />
             </div>
             <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden organic-shadow">
               <Image src={oilsImg?.imageUrl || ''} alt="Details" fill className="object-cover" data-ai-hint="essential oils" />
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 bg-white rounded-full flex items-center justify-center border border-accent organic-shadow">
                <Leaf className="text-secondary h-8 w-8" />
             </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal & Soft */}
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