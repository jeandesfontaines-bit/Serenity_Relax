'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowUpRight,
  Plus,
  Minus,
  Instagram,
  MapPin,
  Calendar,
  Layers,
  Wind,
  AlignCenter,
  ArrowRightLeft
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingFlow } from '@/components/booking/booking-flow';

const MY_PHOTO = "https://storage.googleapis.com/stitch-99c9c.firebasestorage.app/projects/6998478571438886640/assets/f41d99042b4d4554b706c4a675037d4f";
const HERO_IMAGE = "https://images.unsplash.com/photo-1544161515-4ad6ce6db874?auto=format&fit=crop&q=80&w=2070";

const services = [
  {
    id: 'bambous-60',
    name: '01. BAMBOUS',
    duration: '60 MINUTES',
    price: '160 CHF',
    description: 'Une séance de pressions glissées avec tiges de bambous pour dénouer les tensions profondes.',
    tag: 'Structural alignment',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANpHouC1EYQFGTfeb3LQe-QMbFkeT2atbAuVo1IDyxIvaVbkdBz3v0_aJxWQOmc65zYMvBn7UI0-G9-Cni-K4Ke2pVy73kXg4zGgk8cc3dluLfEwQ-CGJqP5E53__NOQraCO2SPCawyNsYwqgJ_AJ4PjVWhiOTv-oR47pu-1Y3GuJNqqIX9jf4JPUK9YhC3hxb4mLhYNDf06H9EaZNtNcJEaHHclLCZhYKRBhHTUnlnDxR-2fBGq-zlJJP72GOtKFBtLJNxO0v_k0'
  },
  {
    id: 'draineur-90',
    name: '02. DRAINEUR',
    duration: '90 MINUTES',
    price: '220 CHF',
    description: 'Méthode de drainage lymphatique manuel pour une détoxification profonde et une légèreté retrouvée.',
    tag: 'Lymphatic Flow',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxU7jFYDcXbNkJkvvM2bCjXwZMkKXlZQnCRPQ3Q_jFmAcmRaZlO2vbEFxHbEhDFgWRoxlGXuUJIhdn9FP82-YWyOEz-2RqLRfIn2SxJmHLgu5iXG-9Trk4C00P6ox_AbtjCyN7sld7PIYObA1jGt28Lmqe-_IAibFv8XpWHnS4VSnCvXGFyJEQJetwM6p8LdHcglI50JLZ9lWw9rXD8PSQZv1XFy8ekwnffUIMFiIMNAvCCInyJQre2-LQm8tifQZLqp3XJDaR8Z4'
  },
  {
    id: 'draineur-120',
    name: '03. DRAINEUR MAX',
    duration: '120 MINUTES',
    price: '280 CHF',
    description: 'Immersion complète dans le drainage lymphatique pour un renouvellement cellulaire optimal.',
    tag: 'Metabolic Reset',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNQmWEecXnoaoF8DTSSJZlbIk8d2TMr3qMs4Ss_WTFP4mzCLoUbWcxkzgoP8RnQJ51qlhQAv2HJWTk395aGQ7xTlvyUSsb-RVqtCRmj_SrAEvr6f4i0eJx60GdNosbejcchn8aiX8GUUXy0x5Rb247Z9G8eAU4Tmq6TZHVhKOmHOGfIAtqsOcKMf1aFDsvWgzBwxRRBcDpJdgzSLxNxBccknQBwQyxl9vjIsBgfL5BA7J7hHca6CUgImdZ0i0NhdKmfSFPdC8JgE'
  },
  {
    id: 'restauration-90',
    name: '04. SUR-MESURE',
    duration: '90 MINUTES',
    price: '240 CHF',
    description: 'Une approche architecturale adaptée à vos besoins spécifiques pour restaurer l\'équilibre.',
    tag: 'Bespoke study',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIUraQMOw7lKKHCSCRUEG0wszxC8zCBJsIEi7_yw0MJgcbuKsnruc3KbDMu17LUCgOtpoW3PeCEU9fbj3N4pTGwjVPy_MPBioP0u0Hhj0KuYH7Qov4kbW2PC9Y4sGv0DbstrkOk7b0-m61Q7H0ZeN9eCznULb4T6b4_-BAPhUpk86bfpVw9snfktC2R7Hqt3JzRfECDh8RRWxANGAt-zmT4eaqOTFqLDVhUNMCv9S5ECZ_w9fkKk9PItNOith2Vcu8JhPTDuAuUSc'
  }
];

const methodology = [
  {
    title: 'RÉDUCTION',
    description: 'Éliminer le bruit pour révéler la structure essentielle de votre bien-être physique.',
    icon: Wind
  },
  {
    title: 'SYMÉTRIE',
    description: 'Restaurer l\'équilibre naturel entre l\'alignement squelettique et la tension musculaire.',
    icon: AlignCenter
  },
  {
    title: 'INTERVALLE',
    description: 'Créer la pause nécessaire pour que les mécanismes de guérison innés du corps s\'activent.',
    icon: Layers
  }
];

const faqs = [
  {
    question: "Comment se déroule une séance ?",
    answer: "Chaque séance commence par une analyse structurelle pour adapter notre approche à votre architecture corporelle unique. Nous privilégions la lenteur et la précision pour une recalibration complète."
  },
  {
    question: "Quelle est la durée idéale ?",
    answer: "Nous recommandons des sessions de 90 minutes pour permettre une décompression profonde et une recalibration émotionnelle et physique optimale."
  },
  {
    question: "Dois-je réserver à l'avance ?",
    answer: "Oui, pour garantir une immersion totale, nos séances sont uniquement sur rendez-vous dans notre sanctuaire de Genève Cointrin."
  },
  {
    question: "Quelle est la philosophie de l'approche ?",
    answer: "Mon approche est une architecture de l'instant. Inspiré par le design structurel, je traite le corps comme une construction vivante nécessitant équilibre, espace et maintenance intentionnelle."
  }
];

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
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
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1c1b] selection:bg-[#435544] selection:text-white overflow-x-hidden font-sans">
      <Navbar onBookingClick={() => setIsBookingOpen(true)} />
      
      {/* ── HERO SECTION (ARCHITECTURAL MINIMALISM) ── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-24 px-8 md:px-16 lg:px-24 overflow-hidden">
        {/* Architectural Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-[#1a1c1b]"></div>
          <div className="absolute top-0 left-2/4 w-px h-full bg-[#1a1c1b]"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-[#1a1c1b]"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-[#1a1c1b]"></div>
          <div className="absolute top-2/3 left-0 w-full h-px bg-[#1a1c1b]"></div>
        </div>

        {/* Floating Architectural Marker */}
        <div className="absolute top-40 right-20 w-12 h-12 border border-[#435544]/20 rotate-45 hidden lg:block animate-pulse"></div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <div className="lg:col-span-7">
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-12">
              <div className="w-2 h-2 bg-[#435544] rotate-45"></div>
              <span className="font-serif uppercase tracking-[0.6em] text-[10px] text-[#725a38]">
                EST. 2024 — GENÈVE, CH
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-serif text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.85] tracking-tighter uppercase mb-16">
              Stillness <br />
              <span className="italic font-light text-[#c3c8c0] block mt-6 lowercase">is the new luxury.</span>
            </motion.h1>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start gap-12">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-[#1a1c1b] text-white font-serif uppercase tracking-[0.4em] text-[10px] py-6 px-12 hover:bg-[#435544] transition-all duration-700 shadow-2xl relative group overflow-hidden"
              >
                <span className="relative z-10">INITIER LE RITUEL</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
              <div className="flex items-center gap-6 group cursor-pointer py-6 border-b border-[#efeeec] hover:border-[#1a1c1b] transition-all">
                <span className="font-serif uppercase tracking-[0.4em] text-[10px] group-hover:pr-4 transition-all text-[#725a38]">DÉCOUVRIR L'APPROCHE</span>
                <ArrowRight size={14} strokeWidth={1} className="group-hover:translate-x-2 transition-transform duration-700 text-[#1a1c1b]" />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              variants={fadeIn}
              className="aspect-[3/4] w-full bg-[#efeeec] overflow-hidden relative group border border-[#efeeec]"
            >
              <img 
                src={HERO_IMAGE}
                alt="Sanctuary Space" 
                className="w-full h-full object-cover grayscale transition-all duration-[2000ms] group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-[#435544]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/30"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/30"></div>
            </motion.div>
            
            {/* Float quote */}
            <motion.div 
              variants={fadeIn}
              className="absolute -bottom-12 -left-12 bg-white p-12 max-w-xs hidden md:block border border-[#efeeec] shadow-2xl"
            >
              <div className="w-4 h-4 border border-[#435544]/20 rotate-45 mb-6"></div>
              <p className="font-serif text-lg text-[#1a1c1b] italic leading-relaxed">
                "Nous ne proposons pas seulement une thérapie ; nous concevons des environnements pour une recalibration émotionnelle."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── METHODOLOGY SECTION ── */}
      <section className="py-48 px-8 md:px-16 lg:px-24 bg-[#f4f3f1] border-y border-[#efeeec]">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-24"
          >
            {methodology.map((item, idx) => (
              <motion.div key={idx} variants={fadeIn} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 flex items-center justify-center border border-[#c3c8c0] rotate-45 mb-14 text-[#435544] group-hover:border-[#1a1c1b] transition-all duration-700 bg-white">
                  <div className="-rotate-45">
                    <item.icon size={28} strokeWidth={1} />
                  </div>
                </div>
                <h3 className="font-serif text-[10px] uppercase tracking-[0.5em] text-[#725a38] mb-8">{item.title}</h3>
                <p className="font-serif text-lg text-[#1a1c1b] italic leading-relaxed max-w-xs opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PHILOSOPHY SECTION (ABOUT JOÃO) ── */}
      <section id="about" className="py-48 md:py-64 px-8 md:px-16 lg:px-24 overflow-hidden bg-[#faf9f7] relative">
        {/* Decorative Vertical Line */}
        <div className="absolute top-0 left-1/2 w-px h-32 bg-[#efeeec] hidden lg:block"></div>

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-[#efeeec] border border-[#efeeec]">
              <img 
                src={MY_PHOTO}
                alt="João - Lead Therapist" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]" 
              />
              <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-[#1a1c1b] opacity-10"></div>
              <div className="absolute bottom-12 right-12 w-6 h-6 border border-[#435544] rotate-45"></div>
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="lg:col-span-7"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-1.5 bg-[#435544] rotate-45"></div>
              <span className="font-serif uppercase tracking-[0.4em] text-[10px] text-[#725a38]">NOTRE FONDATEUR</span>
            </motion.div>
            
            <motion.h2 variants={fadeIn} className="font-serif text-5xl md:text-8xl mb-12 tracking-tighter leading-none uppercase">
              João: Architecte <br /> <span className="italic text-[#c3c8c0] lowercase font-light">de la Présence.</span>
            </motion.h2>
            
            <motion.div variants={fadeIn} className="space-y-10 max-w-xl">
              <p className="font-serif text-xl md:text-2xl text-[#1a1c1b] leading-relaxed italic">
                Avec un parcours mêlant design structurel et thérapie holistique, João aborde le corps humain comme une architecture vivante qui requiert équilibre, espace et maintenance intentionnelle.
              </p>
              <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-[#725a38] leading-loose border-l border-[#efeeec] pl-8">
                Sa méthode, "The Centered Framework", intègre des techniques japonaises traditionnelles à une compréhension ergonomique moderne, créant un sanctuaire pour une restauration profonde dans un monde à haute vélocité.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-20 flex items-center gap-20">
              <div className="flex flex-col">
                <span className="font-serif text-7xl mb-2 tracking-tighter leading-none">12<span className="text-[#c3c8c0] font-light">+</span></span>
                <span className="font-serif uppercase tracking-[0.2em] text-[10px] text-[#725a38]">ANS D'EXPÉRIENCE</span>
              </div>
              <div className="h-24 w-[1px] bg-[#efeeec]"></div>
              <div className="flex flex-col">
                <span className="font-serif text-7xl mb-2 tracking-tighter leading-none">4<span className="text-[#c3c8c0] font-light">k+</span></span>
                <span className="font-serif uppercase tracking-[0.2em] text-[10px] text-[#725a38]">SÉANCES EFFECTUÉES</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES GRID (PRECISION MODULES) ── */}
      <section id="services" className="py-48 px-8 md:px-16 lg:px-24 bg-white border-b border-[#efeeec]">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-12"
          >
            <div className="max-w-2xl">
              <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-1.5 bg-[#435544] rotate-45"></div>
                <span className="font-serif uppercase tracking-[0.6em] text-[10px] text-[#725a38]">PROTOCOLES CURATÉS</span>
              </motion.div>
              <h2 className="font-serif text-5xl md:text-8xl tracking-tighter uppercase leading-[0.9]">
                Precision <br /> Modules.
              </h2>
            </div>
            <div className="flex items-center gap-6 group cursor-pointer font-serif uppercase tracking-[0.5em] text-[10px] text-[#1a1c1b] border-b border-[#efeeec] pb-4 hover:border-[#1a1c1b] transition-all">
              VOIR LE MENU COMPLET
              <ArrowRight size={14} className="group-hover:translate-x-3 transition-transform duration-700" />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#efeeec] border border-[#efeeec]">
            {services.map((service, idx) => (
              <motion.div 
                key={service.id} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 1.5 }}
                className="group relative aspect-square bg-[#faf9f7] overflow-hidden cursor-pointer"
                onClick={() => setIsBookingOpen(true)}
              >
                <img 
                  src={service.image}
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 grayscale group-hover:grayscale-0" 
                />
                
                {/* Overlay Shutter Effect */}
                <div className="absolute inset-0 bg-[#1a1c1b]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-12 translate-y-8 group-hover:translate-y-0 transition-transform duration-1000">
                  <div className="relative z-10">
                    <span className="font-serif uppercase tracking-[0.4em] text-[8px] text-white/60 mb-4 block">{service.tag}</span>
                    <h3 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-tighter leading-none mb-4 group-hover:italic transition-all duration-700">
                      {service.name}
                    </h3>
                    <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">
                      <p className="font-serif text-[10px] text-white/80 uppercase tracking-[0.2em]">{service.duration}</p>
                      <p className="font-serif text-xl text-white tracking-tighter">{service.price}</p>
                    </div>
                  </div>
                  {/* Shutter reveal background */}
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1a1c1b]/80 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-48 p-24 md:p-32 border border-[#efeeec] flex flex-col md:flex-row justify-between items-center gap-24 relative overflow-hidden bg-[#f4f3f1]/50"
          >
            <div className="relative z-10">
              <h3 className="font-serif text-4xl md:text-7xl tracking-tighter text-[#1a1c1b] text-center md:text-left leading-[0.9] uppercase">
                Trouvez votre axe <br /> <span className="italic text-[#c3c8c0] font-light lowercase">dans un monde en mouvement.</span>
              </h3>
            </div>
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="relative z-10 bg-[#435544] text-white px-20 py-10 font-serif uppercase tracking-[0.6em] text-[10px] hover:bg-[#1a1c1b] transition-all duration-1000 shadow-2xl group"
            >
              <span className="relative z-10">INITIER LA RECALIBRATION</span>
              <motion.div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
            </button>
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none flex items-center justify-center">
              <span className="font-serif text-[20vw] uppercase tracking-tighter select-none">Serenity</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-48 md:py-64 px-8 md:px-16 lg:px-24 bg-[#faf9f7]">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-16"
          >
            <div className="w-1.5 h-1.5 bg-[#435544] rotate-45 mb-6"></div>
            <span className="font-serif uppercase tracking-[0.6em] text-[10px] text-[#725a38]">
              QUESTIONS FRÉQUEMMENT POSÉES
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-5xl md:text-8xl tracking-tighter text-left mb-32 uppercase"
          >
            Équilibre <br /> <span className="italic text-[#c3c8c0] lowercase font-light">et clarté.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-24 text-left">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-t border-[#efeeec] pt-12 group"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-1 bg-[#435544] rotate-45 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="font-serif text-[11px] uppercase tracking-[0.4em] text-[#725a38] group-hover:text-[#1a1c1b] transition-colors duration-500">
                    {faq.question}
                  </h4>
                </div>
                <p className="font-serif text-xl md:text-2xl text-[#1a1c1b] leading-relaxed italic opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="py-64 px-8 md:px-16 bg-[#1a1c1b] overflow-hidden relative text-white border-t border-white/5">
        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5 }}
          >
            <div className="flex flex-col items-center mb-20">
              <div className="w-2 h-2 bg-[#435544] rotate-45 mb-6"></div>
              <span className="font-serif uppercase tracking-[0.8em] text-[10px] text-[#435544]">
                A HIGHER STANDARD OF THERAPY
              </span>
            </div>
            
            <h2 className="font-serif text-5xl md:text-[9rem] italic mb-32 tracking-tighter leading-[0.8] uppercase">
              Où l'architecture <br /> <span className="text-[#435544] not-italic">rencontre le corps.</span>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-32 border-t border-white/10 pt-24">
              <div className="flex flex-col items-center gap-6 group">
                <MapPin size={20} strokeWidth={1} className="text-[#435544] group-hover:scale-110 transition-transform" />
                <span className="font-serif uppercase tracking-[0.4em] text-[11px]">Genève, Suisse</span>
                <span className="font-serif text-[10px] text-white/40 italic">Cointrin Sanctuary</span>
              </div>
              <div className="flex flex-col items-center gap-6 group">
                <Instagram size={20} strokeWidth={1} className="text-[#435544] group-hover:scale-110 transition-transform" />
                <span className="font-serif uppercase tracking-[0.4em] text-[11px]">@serenity_relax</span>
                <span className="font-serif text-[10px] text-white/40 italic">Presence Digitale</span>
              </div>
              <div className="flex flex-col items-center gap-6 group">
                <Calendar size={20} strokeWidth={1} className="text-[#435544] group-hover:scale-110 transition-transform" />
                <span className="font-serif uppercase tracking-[0.4em] text-[11px]">Mardi - Samedi</span>
                <span className="font-serif text-[10px] text-white/40 italic">Sur Rendez-vous</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="mt-32 font-serif uppercase tracking-[0.6em] text-[12px] py-10 px-24 border border-white/20 hover:bg-white hover:text-[#1a1c1b] transition-all duration-1000 relative group overflow-hidden"
            >
              <span className="relative z-10">RÉSERVER UNE SÉANCE</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
          </motion.div>
        </div>
        
        {/* Large Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
          <span className="font-serif text-[40vw] leading-none tracking-tighter uppercase">Serenity</span>
        </div>
      </section>

      <Footer />
      <BookingFlow 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        services={services}
      />
    </main>
  );
}
