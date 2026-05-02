'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  ArrowRightCircle,
  Calendar,
  MapPin,
  Instagram
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingFlow } from '@/components/booking/booking-flow';

const MY_PHOTO = "/joao-portrait.png";
const HERO_IMAGE = "/studio-hero.jpg"; // Using the studio image for the hero section

const services = [
  {
    id: 'structural-90',
    name: '01. STRUCTURAL ALIGNMENT',
    duration: '90 MINUTES',
    price: 120,
    description: 'Une approche architecturale pour restaurer l\'équilibre corporel.',
    image: '/services/service-1.jpg'
  },
  {
    id: 'lymphatic-60',
    name: '02. LYMPHATIC FLOW',
    duration: '60 MINUTES',
    price: 85,
    description: 'Drainage profond pour une détoxification cellulaire.',
    image: '/services/service-2.jpg'
  },
  {
    id: 'shiatsu-75',
    name: '03. ZEN SHIATSU',
    duration: '75 MINUTES',
    price: 100,
    description: 'Technique traditionnelle japonaise pour harmoniser l\'énergie.',
    image: '/services/service-1.jpg'
  },
  {
    id: 'deeptissue-90',
    name: '04. DEEP TISSUE SCULPT',
    duration: '90 MINUTES',
    price: 130,
    description: 'Relâchement profond des tensions chroniques et musculaires.',
    image: '/services/service-2.jpg'
  },
  {
    id: 'privacy-120',
    name: '05. PRIVACY SESSION',
    duration: '120 MINUTES',
    price: 180,
    description: 'Une session premium exclusive conçue pour un lâcher-prise total.',
    image: '/services/service-1.jpg'
  },
  {
    id: 'cranial-45',
    name: '06. CRANIAL RELEASE',
    duration: '45 MINUTES',
    price: 70,
    description: 'Thérapie douce focalisée sur la sphère crânio-sacrée.',
    image: '/services/service-2.jpg'
  },
  {
    id: 'myofascial-90',
    name: '07. MYOFASCIAL STUDY',
    duration: '90 MINUTES',
    price: 140,
    description: 'Travail minutieux sur les fascias pour libérer la mobilité.',
    image: '/services/service-1.jpg'
  },
  {
    id: 'metabolic-60',
    name: '08. METABOLIC RESET',
    duration: '60 MINUTES',
    price: 95,
    description: 'Stimulation du métabolisme pour une vitalité renouvelée.',
    image: '/services/service-2.jpg'
  }
];

const faqs = [
  {
    question: "Comment se déroule une séance ?",
    answer: "Chaque séance commence par une analyse structurelle pour adapter notre approche à votre architecture corporelle unique."
  },
  {
    question: "Quelle est la durée idéale ?",
    answer: "Nous recommandons des sessions de 90 minutes pour permettre une décompression profonde et une recalibration complète."
  },
  {
    question: "Dois-je réserver à l'avance ?",
    answer: "Oui, pour garantir une immersion totale, nos séances sont uniquement sur rendez-vous dans notre studio de Lisbonne."
  },
  {
    question: "Politique d'annulation",
    answer: "Nous demandons un préavis de 24 heures pour toute modification afin de respecter le flux de travail de nos architectes du bien-être."
  }
];

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-on-surface selection:bg-surface-container-highest selection:text-on-surface overflow-x-hidden font-sans">
      {/* TopAppBar replaced with standard Navbar to keep auth features */}
      <Navbar onBookingClick={() => {
        setBookingServiceId(undefined);
        setIsBookingOpen(true);
      }} />
      
      {/* ── HERO SECTION ── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-36 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full z-0 opacity-20">
          <div className="absolute top-[64px] right-[64px] w-48 h-48 border-t border-r border-outline-variant"></div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <div className="lg:col-span-6">
            <motion.div variants={fadeIn} className="mb-6 flex items-baseline gap-2">
              <span className="font-sans text-[10px] tracking-[0.4em] text-on-tertiary-container uppercase">
                SERENITY RELAX THERAPY
              </span>
              <span className="font-cursive text-[18px] text-[#5a6366] lowercase" style={{ fontFamily: 'var(--font-signature)' }}>
                by João
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-display text-4xl md:text-5xl lg:text-[44px] leading-[1.15] tracking-[-0.02em] mb-10 text-on-background max-w-xl">
              Thérapie manuelle d'exception & restauration sensorielle.
            </motion.h1>
            
            <motion.div variants={fadeIn} className="flex flex-col items-start gap-6 sm:flex-row">
              <button 
                onClick={() => {
                  setBookingServiceId(undefined);
                  setIsBookingOpen(true);
                }}
                className="bg-primary text-primary-foreground font-label text-[10px] py-4 px-8 tracking-[0.6em] uppercase hover:bg-on-surface-variant transition-colors"
              >
                EXPLORE SERVICES
              </button>
              <div className="flex items-center gap-4 group cursor-pointer py-4" onClick={() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})}>
                <span className="font-label text-[10px] tracking-[0.6em] uppercase border-b border-on-surface transition-all group-hover:pr-4">LEARN MORE</span>
                <ArrowRight size={16} strokeWidth={1} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative">
            <motion.div variants={fadeIn} className="aspect-[3/4] w-full bg-surface-container overflow-hidden">
              <img 
                src={HERO_IMAGE}
                alt="Studio Serenity" 
                className="w-full h-full object-cover transition-all duration-1000" 
              />
            </motion.div>
            
            {/* Float quote */}
            <motion.div 
              variants={fadeIn}
              className="absolute -bottom-6 -left-6 hidden max-w-xs border-l border-b border-zinc-100 bg-white p-6 md:block"
            >
              <p className="font-body text-[16px] text-on-surface-variant italic leading-[1.6]">
                "Chaque corps mérite un espace de détente sur mesure, pensé avec soin par João."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── ABOUT JOÃO SECTION ── */}
      <section id="about" className="bg-surface-container-low px-6 py-[96px] md:px-12">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-square relative overflow-hidden bg-surface-container">
              <img 
                src={MY_PHOTO}
                alt="João - Lead Therapist" 
                className="w-full h-full object-cover transition-all duration-&lsqb;2000ms&rsqb;" 
              />
              <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-on-surface opacity-10"></div>
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="lg:col-span-7"
          >
            <motion.span variants={fadeIn} className="font-label mb-5 block text-[10px] uppercase tracking-[0.6em] text-on-tertiary-container">
              OUR FOUNDER
            </motion.span>
            
            <motion.h2 variants={fadeIn} className="font-headline mb-6 text-[22px] leading-[1.35] md:text-[28px]">
              João — Fondateur & Thérapeute
            </motion.h2>
            
            <motion.div variants={fadeIn} className="max-w-2xl space-y-5">
              <p className="font-body text-[17px] leading-[1.6] text-on-surface">
                Fort d'une formation en thérapie holistique et d'une sensibilité unique, João accompagne ses clients vers un état de détente profonde et de mieux-être durable.
              </p>
              <p className="font-body text-[15px] leading-[1.6] text-on-surface-variant">
                Sa méthode allie techniques manuelles traditionnelles et approche corporelle globale — offrant à chaque client une expérience de soin personnalisée au sein de son studio à Genève.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-10 flex items-center gap-10">
              <div className="flex flex-col">
                <span className="font-display mb-2 text-[34px] leading-[1.2] tracking-[-0.02em]">12+</span>
                <span className="font-label text-[10px] tracking-[0.6em] uppercase text-secondary">YEARS EXP.</span>
              </div>
              <div className="h-12 w-px bg-outline-variant"></div>
              <div className="flex flex-col">
                <span className="font-display mb-2 text-[34px] leading-[1.2] tracking-[-0.02em]">4k+</span>
                <span className="font-label text-[10px] tracking-[0.6em] uppercase text-secondary">SESSIONS</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section id="services" className="bg-background px-6 py-[96px] md:px-12">
        <div className="mx-auto max-w-[1320px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
          >
            <div className="max-w-xl">
              <span className="font-label mb-5 block text-[10px] uppercase tracking-[0.4em] text-on-tertiary-container">
                Curated Treatments
              </span>
              <h2 className="font-headline text-[22px] leading-[1.35] md:text-[28px]">
                Precision Wellness Modules.
              </h2>
            </div>
            <div className="font-label text-[10px] flex items-center gap-4 cursor-pointer group tracking-[0.6em] uppercase">
              VIEW FULL MENU
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-[2px] border border-outline-variant bg-outline-variant md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, idx) => (
              <motion.div 
                key={service.id} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 1.5 }}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden bg-surface md:aspect-[5/4] lg:aspect-[4/5]"
                onClick={() => {
                  setBookingServiceId(service.id);
                  setIsBookingOpen(true);
                }}
              >
                <img 
                  src={service.image}
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="absolute bottom-0 left-0 w-full translate-y-2 bg-gradient-to-t from-black/60 to-transparent p-4 transition-transform group-hover:translate-y-0 md:p-5">
                  <h3 className="mb-1 font-label text-[10px] font-medium uppercase tracking-[0.03em] text-white md:text-[11px]">
                    {service.name}
                  </h3>
                  <p className="font-label text-[8px] tracking-[0.45em] uppercase text-white/80 opacity-0 transition-opacity group-hover:opacity-100 md:text-[9px]">
                    {service.duration} — {service.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="overflow-hidden bg-surface px-6 py-[96px] md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-label mb-10 block text-[10px] uppercase tracking-[0.6em] text-on-tertiary-container"
          >
            QUESTIONS FRÉQUEMMENT POSÉES
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-left font-display text-[40px] leading-[1.15] tracking-[-0.02em] text-on-surface md:text-[44px]"
          >
            Équilibre et clarté.
          </motion.h2>

          <div className="grid grid-cols-1 gap-x-16 gap-y-12 text-left md:grid-cols-2">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-t border-outline-variant pt-6"
              >
                <h4 className="mb-3 font-label text-[13px] font-semibold uppercase leading-[1.2] tracking-[0.05em] text-on-surface">
                  {faq.question}
                </h4>
                <p className="font-body text-[15px] italic leading-[1.6] text-on-surface-variant">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer using Standard App Footer, but could be customized later if needed */}
      <Footer />
      
      <BookingFlow 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          setBookingServiceId(undefined);
        }} 
        services={services}
        initialServiceId={bookingServiceId}
      />
    </main>
  );
}
