'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ArrowRight, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Clock,
  Compass,
  Wind,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';

/* ── Assets ── */
const HERO_IMAGE = '/images/hero-selected.png';
const STUDIO_IMAGE = '/images/Gemini_Generated_Image_4vxbi24vxbi24vxb.png';
const DETAIL_IMAGE = '/images/Gemini_Generated_Image_4vxbi24vxbi24vxb (2).png';
const JOAO_PORTRAIT = '/joao-portrait.png';

/* ── FAQ Data ── */
const faqs = [
  {
    q: 'Comment se déroule une première séance ?',
    a: "La séance commence par un bref échange sur vos besoins et éventuelles tensions. João adapte ensuite sa technique à votre corps en temps réel — chaque séance est unique.",
  },
  {
    q: 'Combien de temps à l\'avance dois-je réserver ?',
    a: "Nous recommandons de réserver au moins 48h à l'avance pour garantir votre créneau. Les créneaux du week-end partent rapidement.",
  },
  {
    q: 'Quelle est votre politique d\'annulation ?',
    a: "Toute annulation doit être faite au moins 24h avant la séance. En cas d'annulation tardive, la séance peut être facturée à 50%.",
  },
  {
    q: 'Où est situé le cabinet ?',
    a: "Le studio est situé à Genève Cointrin. L'adresse exacte vous est communiquée lors de la confirmation de votre réservation.",
  },
];

const testimonials = [
  {
    quote: "Un moment de suspension absolue. L'approche de João est d'une précision rare, on sent une expertise qui dépasse la simple technique.",
    author: "Elena M.",
    role: "Cliente régulière"
  },
  {
    quote: "Le studio est un havre de paix. Dès l'entrée, on change de dimension. Le soin est profond, millimétré, salvateur.",
    author: "Marc-Antoine D.",
    role: "Chef d'entreprise"
  },
  {
    quote: "Enfin un thérapeute qui écoute vraiment le corps. Chaque séance est une redécouverte de sa propre fluidité.",
    author: "Sophie L.",
    role: "Sportive de haut niveau"
  }
];

/* ── Components ── */

function FaqItem({ q, a }: { q: string; a: string; }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.05] last:border-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-6 text-left group"
      >
        <span className="text-[16px] md:text-[18px] font-sans font-medium text-foreground tracking-tight group-hover:text-primary">
          {q}
        </span>
        <div className={`w-10 h-10 rounded-full border border-black/[0.05] flex items-center justify-center ${open ? 'bg-foreground border-foreground text-background rotate-180' : 'group-hover:border-foreground'}`}>
          <ChevronDown size={16} strokeWidth={1.5} />
        </div>
      </button>
      {open && (
        <div className="pb-8">
          <p className="text-[15px] leading-relaxed text-foreground/60 font-light max-w-2xl">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onBook,
}: {
  service: (typeof SERVICES)[0];
  onBook: () => void;
}) {
  return (
    <div
      className="group relative bg-white overflow-hidden border border-black/[0.03] cursor-pointer hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]"
      onClick={onBook}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div>
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-medium tracking-widest text-white rounded-full mb-4">
              {service.duration}
            </span>
            <h3 className="font-sans text-[18px] md:text-[20px] font-medium leading-tight text-white mb-2">
              {service.name}
            </h3>
            <p className="text-[13px] text-white/70 font-light line-clamp-2 mb-6">
              {service.description}
            </p>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-sans text-[16px] font-medium text-white">
                {service.price} <span className="text-[10px] font-sans text-white/50 uppercase tracking-wider ml-1">CHF</span>
              </span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-white">
                <ChevronRight size={18} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openBooking = (serviceId?: string) => {
    setBookingServiceId(serviceId);
    setIsBookingOpen(true);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/10 selection:text-primary">
      <Navbar onBookingClick={() => openBooking()} />

      {/* ════════════════════════════════════════
          HERO SECTION (EDITORIAL)
      ════════════════════════════════════════ */}
      <section id="hero" className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={HERO_IMAGE} alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        </div>

        <div className="container-wide relative z-10 pt-20">
          <div className="max-w-4xl">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-white/30" />
                <span className="text-[10px] font-medium tracking-widest text-white/70">
                  Genève Cointrin · Thérapeute Agréé
                </span>
              </div>
              
              <h1 className="font-sans text-[clamp(36px,6vw,72px)] leading-tight tracking-tight font-light text-white mb-12">
                L&apos;Espace <br />
                <span className="font-medium text-white ml-2">
                  Suspendu.
                </span>
              </h1>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 mt-16">
                <button
                  onClick={() => openBooking()}
                  className="bg-white text-foreground rounded-full px-8 py-4 text-[14px] font-medium shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-primary hover:text-white transition-colors"
                >
                  Réserver l&apos;Instant
                </button>
                
                <div className="max-w-xs border-l border-white/20 pl-6 py-1">
                  <p className="text-[14px] text-white/70 font-light leading-relaxed tracking-wide mb-3">
                    Un sanctuaire confidentiel dédié à la restauration profonde du corps et de l&apos;esprit.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-white/50 tracking-widest font-medium">
                     ASCA & RME <ShieldCheck size={14} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
           <span className="text-[10px] tracking-widest [writing-mode:vertical-lr] text-white">Explorer</span>
           <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOUNDER SECTION (PORTRAIT)
      ════════════════════════════════════════ */}
      <section id="practitioner" className="section-padding bg-white relative overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden rounded-sm">
                <Image src={JOAO_PORTRAIT} alt="João Silva" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div>
                <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">Le Praticien</span>
                <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight mb-8">João — <span className="font-medium text-secondary">La Présence.</span></h2>
                
                <div className="space-y-8 max-w-xl">
                  <p className="text-[16px] md:text-[18px] leading-relaxed text-foreground font-light text-balance border-l-2 border-primary/20 pl-6 py-2">
                    "Mon approche est une écoute attentive des tensions silencieuses, une quête de l&apos;équilibre absolu."
                  </p>
                  <p className="text-[15px] leading-relaxed text-foreground/70 font-light">
                    Avec plus de 12 ans d&apos;expérience au cœur de Genève, João Silva a développé une signature thérapeutique où la rigueur scientifique rencontre une intuition sensorielle. Sa pratique est dédiée à une clientèle exigeante en quête de résultats tangibles et de sérénité profonde.
                  </p>
                  
                  <div className="pt-12">
                    <p className="font-sans text-[24px] text-foreground font-medium leading-none mb-2">
                      João Silva
                    </p>
                    <p className="text-[11px] font-medium tracking-widest text-secondary">Thérapeute Agréé ASCA & RME</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partners / Accreditations Row */}
          <div className="mt-24 pt-12 border-t border-black/[0.05] flex flex-wrap justify-center items-center gap-10 md:gap-20 text-foreground/40">
            {['ASCA', 'RME', 'VISANA', 'GROUPE MUTUEL', 'SWICA'].map((partner) => (
              <span key={partner} className="text-[11px] font-medium tracking-widest uppercase">{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PHILOSOPHY SECTION (MAGAZINE STYLE)
      ════════════════════════════════════════ */}
      <section id="about" className="section-padding bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-muted/30 -z-0" />
        
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="pt-12">
                <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">
                  Philosophie
                </span>
                <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight mb-8">
                  L&apos;Éloge du <br />
                  <span className="font-medium text-secondary">Mouvement.</span>
                </h2>
                <div className="space-y-6 max-w-xl">
                  <p className="text-[16px] leading-relaxed text-foreground font-medium">
                    Dans le silence de notre studio, nous réapprenons au corps l&apos;art de la fluidité.
                  </p>
                  <p className="text-[15px] leading-relaxed text-foreground/70 font-light">
                    Chaque soin est une immersion architecturée autour de votre physiologie unique. Nous fusionnons l&apos;anatomie moderne et les rituels de restauration pour libérer les tensions cristallisées et restaurer une vitalité souveraine.
                  </p>
                  <div className="pt-10 grid grid-cols-2 gap-8 border-t border-black/[0.05]">
                    <div>
                      <span className="font-sans text-[36px] text-foreground font-light block leading-none">12</span>
                      <span className="text-[10px] tracking-widest text-secondary font-medium mt-3 block">Ans d&apos;Expertise</span>
                    </div>
                    <div>
                      <span className="font-sans text-[36px] text-foreground font-light block leading-none">∞</span>
                      <span className="text-[10px] tracking-widest text-secondary font-medium mt-3 block">Soin Sur-Mesure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative aspect-[4/5] lg:aspect-[1/1.1] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group overflow-hidden rounded-sm">
                <div className="absolute inset-0">
                  <Image src={STUDIO_IMAGE} alt="Studio Serenity" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
                
                {/* Floating Quote Card */}
                <div className="absolute bottom-8 -left-8 md:-left-16 bg-foreground p-8 md:p-10 text-background max-w-[360px] shadow-xl hidden md:block rounded-sm">
                  <Wind size={24} className="text-primary mb-6" strokeWidth={1.5} />
                  <p className="font-sans text-[16px] md:text-[18px] leading-relaxed font-light mb-6">
                    "La thérapie manuelle est une conversation où le corps retrouve sa voix."
                  </p>
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-[1px] bg-primary" />
                     <span className="text-[10px] tracking-widest text-white/50 font-medium">João Silva</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PROCESS SECTION (MINIMAL)
      ════════════════════════════════════════ */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
            <div className="max-w-2xl">
              <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">La Méthode</span>
              <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight text-background mb-0">Un cycle de <br /><span className="font-medium text-background/80">régénération.</span></h2>
            </div>
            <p className="max-w-sm text-[15px] text-background/60 font-light leading-relaxed pb-2">
              Trois piliers fondamentaux pour une transformation durable et profonde.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-background/10">
            {[
              {
                icon: Compass,
                title: 'L’Écoute',
                desc: 'Un diagnostic sensoriel précis pour identifier les blocages énergétiques et musculaires.'
              },
              {
                icon: Layers,
                title: 'La Profondeur',
                desc: 'Une application technique rigoureuse, où chaque geste est orchestré selon votre anatomie.'
              },
              {
                icon: Clock,
                title: 'L’Ancrage',
                desc: 'Une phase de retour progressif accompagnée de conseils pour pérenniser les bénéfices.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-background/10 last:border-0"
              >
                <div className="w-12 h-12 rounded-full border border-background/20 flex items-center justify-center mb-10">
                  <item.icon size={20} strokeWidth={1.5} className="text-primary" />
                </div>
                <h3 className="font-sans text-[20px] font-medium mb-4">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-background/60 font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ATMOSPHÈRE SECTION (GALLERY)
      ════════════════════════════════════════ */}
      <section id="studio" className="py-0 bg-background overflow-hidden">
        <div className="container-wide py-24 border-t border-black/[0.05]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end mb-20">
            <div className="lg:col-span-8">
               <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">Le Lieu</span>
               <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight">Un Sanctuaire <br /><span className="font-medium text-secondary">de Sérénité.</span></h2>
            </div>
            <div className="lg:col-span-4 pb-2">
               <p className="text-[15px] text-foreground/70 font-light leading-relaxed">
                 Situé au cœur de Cointrin, notre studio est une enclave de calme absolu, conçue pour favoriser l&apos;introspection et la détente profonde.
               </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-24 px-6 md:px-12 lg:px-20">
          {[
            { img: STUDIO_IMAGE, title: 'L\'Équilibre', subtitle: 'Lumière Naturelle' },
            { img: DETAIL_IMAGE, title: 'Le Détail', subtitle: 'Matériaux Nobles' },
            { img: HERO_IMAGE, title: 'L\'Essence', subtitle: 'Espace Minimal' },
          ].map((item, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[85vw] md:w-[50vw] lg:w-[35vw] aspect-[16/10] overflow-hidden rounded-sm"
            >
              <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 35vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <span className="text-[10px] tracking-widest font-medium block mb-2 opacity-80">
                  {item.subtitle}
                </span>
                <h4 className="font-sans text-[20px] font-medium leading-none">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SERVICES SECTION (GRID)
      ════════════════════════════════════════ */}
      <section id="services" className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="max-w-2xl">
              <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">Les Soins</span>
              <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight">Architectures de <br /><span className="font-medium text-secondary">Bien-être.</span></h2>
            </div>
            <div className="flex flex-col gap-4 max-w-sm pb-2">
               <p className="text-[15px] text-foreground/70 font-light">
                Une sélection de thérapies exclusives conçues pour répondre aux exigences du corps moderne.
               </p>
               <button onClick={() => openBooking()} className="text-[11px] font-medium tracking-widest text-primary flex items-center gap-2 hover:opacity-70 transition-opacity">
                  Voir tout le catalogue <ArrowRight size={14} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={() => openBooking(service.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS SECTION (EDITORIAL)
      ════════════════════════════════════════ */}
      <section className="section-padding bg-muted/30 overflow-hidden">
        <div className="container-wide">
          <div className="text-center mb-24">
            <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">Témoignages</span>
            <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight">Paroles de <br /><span className="font-medium text-secondary">Confiance.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {testimonials.map((t, i) => (
              <div key={i} className="relative bg-white p-8 rounded-sm shadow-sm border border-black/[0.03]">
                <div className="mb-6 text-primary/30">
                  <Sparkles size={24} strokeWidth={1.5} />
                </div>
                <p className="font-sans text-[15px] md:text-[16px] leading-relaxed text-foreground mb-8 font-light italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-[1px] bg-secondary" />
                  <div>
                    <p className="text-[12px] font-medium text-foreground">{t.author}</p>
                    <p className="text-[10px] text-foreground/50 tracking-wide mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ SECTION
      ════════════════════════════════════════ */}
      <section id="faq" className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="text-[11px] tracking-widest text-primary uppercase font-medium block mb-4">FAQ</span>
              <h2 className="font-sans text-[clamp(28px,4vw,48px)] leading-tight font-light tracking-tight mb-6">Questions <br /><span className="font-medium text-secondary">Fréquentes.</span></h2>
              <p className="text-[15px] text-foreground/70 font-light max-w-sm">
                Tout ce que vous devez savoir pour préparer votre immersion chez Serenity.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-0">
                {faqs.map((faq, i) => (
                  <FaqItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA SECTION (IMMERSIVE)
      ════════════════════════════════════════ */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <Image src={DETAIL_IMAGE} alt="" fill sizes="100vw" className="object-cover opacity-50" />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground/80 to-foreground" />
        
        <div className="container-wide relative z-10 text-center">
          <div>
            <span className="inline-block px-6 py-2 border border-white/20 rounded-full text-[10px] font-medium tracking-widest text-white/80 mb-10 backdrop-blur-sm">
              Disponibilités Limitées
            </span>
            <h2 className="font-sans text-[clamp(32px,6vw,64px)] leading-tight tracking-tight font-light text-white mb-16">
              Retrouvez votre <br />
              <span className="font-medium text-white ml-2">Souveraineté.</span>
            </h2>
            <button
              onClick={() => openBooking()}
              className="bg-white text-foreground rounded-full px-10 py-4 text-[14px] font-medium shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-primary hover:text-white transition-colors"
            >
              Réserver votre Instant
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Booking Overlay */}
      {isBookingOpen && (
        <BookingFlow
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setBookingServiceId(undefined);
          }}
          services={SERVICES}
          initialServiceId={bookingServiceId}
        />
      )}

      <style jsx global>{`
        .text-balance {
          text-wrap: balance;
        }
      `}</style>
    </main>
  );
}
