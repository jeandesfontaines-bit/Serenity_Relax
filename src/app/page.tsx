'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
const HERO_IMAGE = '/studio-hero.jpg';
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

/* ── Animations ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.15 },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/* ── Components ── */

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      className="border-b border-black/[0.05] last:border-0 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-10 text-left group"
      >
        <span className="text-[20px] md:text-[24px] font-serif text-foreground tracking-tight group-hover:text-primary transition-colors duration-700">
          {q}
        </span>
        <div className={`w-12 h-12 rounded-full border border-black/[0.05] flex items-center justify-center transition-all duration-1000 ${open ? 'bg-foreground border-foreground text-background rotate-180' : 'group-hover:border-foreground'}`}>
          <ChevronDown size={20} strokeWidth={1} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <p className="pb-10 text-[18px] leading-relaxed text-foreground/60 font-light max-w-2xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ServiceCard({
  service,
  index,
  onBook,
}: {
  service: (typeof SERVICES)[0];
  index: number;
  onBook: () => void;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      className="group relative bg-white overflow-hidden transition-all duration-1000 ease-premium hover:shadow-[0_80px_120px_-40px_rgba(0,0,0,0.1)] border border-black/[0.03] cursor-pointer"
      onClick={onBook}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-1000" />
        
        <div className="absolute inset-0 p-10 flex flex-col justify-end">
          <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-bold uppercase tracking-[0.4em] text-white rounded-full mb-6">
              {service.duration}
            </span>
            <h3 className="font-serif text-[24px] md:text-[28px] leading-[0.9] text-white mb-4">
              {service.name}
            </h3>
            <p className="text-[14px] text-white/60 font-light line-clamp-2 mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-200">
              {service.description}
            </p>
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <span className="font-serif text-[22px] text-white">
                {service.price} <span className="text-[11px] font-sans text-white/40 uppercase tracking-[0.2em] ml-2">CHF</span>
              </span>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-white transition-all duration-700 transform scale-90 group-hover:scale-100">
                <ChevronRight size={24} strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };
  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      <button onClick={onClick} className={className}>
        {children}
      </button>
    </motion.div>
  );
}

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const studioParallax = useTransform(scrollYProgress, [0.3, 0.6], ['-10%', '10%']);

  useEffect(() => { setMounted(true); }, []);

  const openBooking = (serviceId?: string) => {
    setBookingServiceId(serviceId);
    setIsBookingOpen(true);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/10 selection:text-primary">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[110] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      <Navbar onBookingClick={() => openBooking()} />

      {/* ════════════════════════════════════════
          HERO SECTION (EDITORIAL)
      ════════════════════════════════════════ */}
      <section id="hero" className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="absolute inset-0">
          <Image src={HERO_IMAGE} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        </motion.div>

        <div className="container-wide relative z-10 pt-20">
          <div className="max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <div className="flex items-center gap-6 mb-12">
                <div className="h-[1px] w-20 bg-white/30" />
                <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.8em] text-white/70">
                  Genève Cointrin · Thérapeute Agréé
                </span>
              </div>
              
              <h1 className="font-serif text-[clamp(48px,10vw,120px)] leading-[0.78] tracking-[-0.06em] text-white mb-16">
                L&apos;Espace <br />
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 2, ease: [0.22, 1, 0.36, 1] as const }}
                  className="italic font-light text-gradient-gold ml-[0.05em]"
                >
                  Suspendu.
                </motion.span>
              </h1>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-16 mt-24">
                <MagneticButton
                  onClick={() => openBooking()}
                  className="premium-button group bg-white text-foreground rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.3)] min-w-[320px]"
                >
                  <span className="relative z-10">Réserver l&apos;Instant</span>
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-premium" />
                </MagneticButton>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8, duration: 1.5 }}
                  className="max-w-xs border-l border-white/20 pl-10 py-2"
                >
                  <p className="text-[18px] text-white/60 font-light leading-relaxed tracking-wide mb-4">
                    Un sanctuaire confidentiel dédié à la restauration profonde du corps et de l&apos;esprit.
                  </p>
                  <div className="flex items-center gap-3 text-[9px] text-white/40 uppercase tracking-[0.4em] font-bold">
                     ASCA & RME <ShieldCheck size={12} className="text-primary" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-40">
           <span className="text-[9px] uppercase tracking-[0.6em] [writing-mode:vertical-lr] text-white">Explorer</span>
           <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOUNDER SECTION (PORTRAIT)
      ════════════════════════════════════════ */}
      <section id="practitioner" className="section-padding bg-white relative overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 lg:gap-40 items-center">
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] as const }}
                className="aspect-[4/5] relative shadow-[0_120px_180px_-60px_rgba(0,0,0,0.2)] overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 z-10"
                  initial={{ y: '0%' }}
                  whileInView={{ y: '-100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.5 }}
                  style={{ background: 'var(--background)' }}
                />
                <Image src={JOAO_PORTRAIT} alt="João Silva" fill className="object-cover" />
                <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
              </motion.div>
              
              <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-black/[0.05] rounded-full flex items-center justify-center animate-spin-slow">
                <div className="text-[10px] font-bold uppercase tracking-[0.6em] text-foreground/20 text-center px-6">
                  Thérapeute Manuel · Genève · ASCA RME
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] as const }}
              >
                <span className="section-subtitle">Le Praticien</span>
                <h2 className="section-title">João — <br /><span className="italic font-light text-secondary">La Présence.</span></h2>
                
                <div className="space-y-12 max-w-xl">
                  <p className="text-[20px] md:text-[24px] leading-[1.3] text-foreground font-light italic text-balance">
                    &quot;Mon approche est une écoute attentive des tensions silencieuses, une quête de l&apos;équilibre absolu.&quot;
                  </p>
                  <p className="text-[20px] leading-relaxed text-foreground/50 font-light">
                    Avec plus de 12 ans d&apos;expérience au cœur de Genève, João Silva a développé une signature thérapeutique où la rigueur scientifique rencontre une intuition sensorielle. Sa pratique est dédiée à une clientèle exigeante en quête de résultats tangibles et de sérénité profonde.
                  </p>
                  
                  <div className="pt-20 border-t border-black/[0.05]">
                    <p className="font-serif text-[48px] text-primary leading-none mb-4" style={{ fontFamily: 'var(--font-signature)' }}>
                      João Silva
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.6em] text-secondary">Thérapeute Agréé ASCA & RME</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Partners / Accreditations Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="mt-32 pt-20 border-t border-black/[0.03] flex flex-wrap justify-center items-center gap-16 md:gap-32 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
          >
            {['ASCA', 'RME', 'VISANA', 'GROUPE MUTUEL', 'SWICA'].map((partner) => (
              <span key={partner} className="text-[12px] md:text-[14px] font-bold tracking-[0.6em] text-foreground uppercase">{partner}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PHILOSOPHY SECTION (MAGAZINE STYLE)
      ════════════════════════════════════════ */}
      <section id="about" className="section-padding bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-muted/30 -z-0" />
        
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 lg:gap-40 items-start">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="pt-20"
              >
                <motion.span variants={fadeInUp} className="section-subtitle">
                  Philosophie
                </motion.span>
                <motion.h2 variants={fadeInUp} className="section-title">
                  L&apos;Éloge du <br />
                  <span className="italic font-light text-secondary">Mouvement.</span>
                </motion.h2>
                <motion.div variants={fadeInUp} className="space-y-10 max-w-xl">
                  <p className="text-[20px] leading-[1.4] text-foreground font-light">
                    Dans le silence de notre studio, nous réapprenons au corps l&apos;art de la fluidité.
                  </p>
                  <p className="text-[20px] leading-relaxed text-foreground/50 font-light">
                    Chaque soin est une immersion architecturée autour de votre physiologie unique. Nous fusionnons l&apos;anatomie moderne et les rituels de restauration pour libérer les tensions cristallisées et restaurer une vitalité souveraine.
                  </p>
                  <div className="pt-12 grid grid-cols-2 gap-12 border-t border-black/[0.05]">
                    <div>
                      <span className="font-serif text-[48px] text-foreground block leading-none">12</span>
                      <span className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold mt-4 block">Ans d&apos;Expertise</span>
                    </div>
                    <div>
                      <span className="font-serif text-[48px] text-foreground block leading-none">∞</span>
                      <span className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold mt-4 block">Soin Sur-Mesure</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8 }}
                className="relative aspect-[4/5] lg:aspect-[1/1.2] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.15)] group overflow-hidden"
              >
                <motion.div 
                   style={{ y: studioParallax }}
                   className="absolute inset-0 scale-125"
                >
                  <Image src={STUDIO_IMAGE} alt="Studio Serenity" fill className="object-cover" />
                </motion.div>
                
                {/* Floating Quote Card */}
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1.2 }}
                  className="absolute bottom-16 -left-16 md:-left-32 bg-foreground p-12 md:p-16 text-background max-w-[440px] shadow-2xl hidden md:block"
                >
                  <Wind size={32} className="text-primary mb-10" strokeWidth={1} />
                  <p className="font-serif text-[20px] md:text-[26px] leading-[1.2] italic font-light mb-10">
                    &quot;La thérapie manuelle est une conversation où le corps retrouve sa voix.&quot;
                  </p>
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-[1px] bg-primary" />
                     <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">João Silva</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          PROCESS SECTION (MINIMAL)
      ════════════════════════════════════════ */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-end gap-16 mb-40">
            <div className="max-w-3xl">
              <span className="section-subtitle !text-primary">La Méthode</span>
              <h2 className="section-title !text-background mb-0">Un cycle de <br /><span className="italic font-light text-background/40">régénération.</span></h2>
            </div>
            <p className="max-w-sm text-[20px] text-background/40 font-light leading-relaxed pb-4">
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
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={i}
                className="group p-16 md:p-20 border-r border-background/10 last:border-r-0 hover:bg-white/[0.03] transition-colors duration-1000"
              >
                <div className="w-16 h-16 rounded-full border border-background/10 flex items-center justify-center mb-16 group-hover:bg-primary group-hover:border-primary transition-all duration-700">
                  <item.icon size={24} strokeWidth={1} className="text-primary group-hover:text-background" />
                </div>
                <h3 className="font-serif text-[28px] mb-8 tracking-tight">{item.title}</h3>
                <p className="text-[16px] leading-relaxed text-background/40 font-light group-hover:text-background/70 transition-colors">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ATMOSPHÈRE SECTION (GALLERY)
      ════════════════════════════════════════ */}
      <section id="studio" className="py-0 bg-background overflow-hidden">
        <div className="container-wide py-32 border-t border-black/[0.03]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-end mb-32">
            <div className="lg:col-span-8">
               <span className="section-subtitle">Le Lieu</span>
               <h2 className="section-title">Un Sanctuaire <br /><span className="italic font-light text-secondary">de Sérénité.</span></h2>
            </div>
            <div className="lg:col-span-4 pb-6">
               <p className="text-[20px] text-foreground/50 font-light leading-relaxed">
                 Situé au cœur de Cointrin, notre studio est une enclave de calme absolu, conçue pour favoriser l&apos;introspection et la détente profonde.
               </p>
            </div>
          </div>
        </div>

        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-32 px-8 md:px-16 lg:px-24">
          {[
            { img: STUDIO_IMAGE, title: 'L\'Équilibre', subtitle: 'Lumière Naturelle' },
            { img: DETAIL_IMAGE, title: 'Le Détail', subtitle: 'Matériaux Nobles' },
            { img: HERO_IMAGE, title: 'L\'Essence', subtitle: 'Espace Minimal' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] aspect-[16/10] group overflow-hidden"
            >
              <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-[3000ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-1000" />
              <div className="absolute bottom-12 left-12 text-white">
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold block mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-1000">
                  {item.subtitle}
                </span>
                <h4 className="font-serif text-[28px] leading-none opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-1000 delay-100">
                  {item.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SERVICES SECTION (GRID)
      ════════════════════════════════════════ */}
      <section id="services" className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-16 mb-32">
            <div className="max-w-2xl">
              <span className="section-subtitle">Les Soins</span>
              <h2 className="section-title">Architectures de <br /><span className="italic font-light text-secondary">Bien-être.</span></h2>
            </div>
            <div className="flex flex-col gap-6 max-w-sm pb-6">
               <p className="text-[20px] text-foreground/50 font-light">
                Une sélection de thérapies exclusives conçues pour répondre aux exigences du corps moderne.
               </p>
               <button onClick={() => openBooking()} className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary flex items-center gap-4 group">
                  Voir tout le catalogue <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
               </button>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {SERVICES.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={i}
                onBook={() => openBooking(service.id)}
              />
            ))}
          </motion.div>
        </div>
      </section>



      {/* ════════════════════════════════════════
          TESTIMONIALS SECTION (EDITORIAL)
      ════════════════════════════════════════ */}
      <section className="section-padding bg-muted/30 overflow-hidden">
        <div className="container-wide">
          <div className="text-center mb-32">
            <span className="section-subtitle">Témoignages</span>
            <h2 className="section-title">Paroles de <br /><span className="italic font-light text-secondary">Confiance.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                className="relative"
              >
                <div className="mb-10 text-primary/30">
                  <Sparkles size={32} strokeWidth={1} />
                </div>
                <p className="font-serif text-[20px] md:text-[24px] leading-[1.4] text-foreground mb-12 italic font-light">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-secondary" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground">{t.author}</p>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-1">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ SECTION
      ════════════════════════════════════════ */}
      <section id="faq" className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
            <div className="lg:col-span-5">
              <span className="section-subtitle">FAQ</span>
              <h2 className="section-title">Questions <br /><span className="italic font-light text-secondary">Fréquentes.</span></h2>
              <p className="text-[20px] text-foreground/50 font-light max-w-sm">
                Tout ce que vous devez savoir pour préparer votre immersion chez Serenity.
              </p>
            </div>
            <div className="lg:col-span-7">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-4"
              >
                {faqs.map((faq, i) => (
                  <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA SECTION (IMMERSIVE)
      ════════════════════════════════════════ */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-foreground">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0.3 }}
          whileInView={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] as const }}
          className="absolute inset-0"
        >
          <Image src={DETAIL_IMAGE} alt="" fill className="object-cover" />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-foreground via-transparent to-foreground" />
        
        <div className="container-wide relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <span className="inline-block px-10 py-4 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.8em] text-white/70 mb-16 backdrop-blur-xl">
              Disponibilités Limitées
            </span>
            <h2 className="font-serif text-[clamp(40px,8vw,100px)] leading-[0.8] tracking-[-0.06em] text-white mb-24">
              Retrouvez votre <br />
              <span className="italic font-light text-white/30 ml-[0.05em]">Souveraineté.</span>
            </h2>
            <MagneticButton
              onClick={() => openBooking()}
              className="premium-button group bg-white text-foreground rounded-full min-w-[360px] shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
            >
              <span className="relative z-10">Réserver votre Instant</span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Booking Overlay */}
      <AnimatePresence>
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
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
        .text-balance {
          text-wrap: balance;
        }
      `}</style>
    </main>
  );
}
