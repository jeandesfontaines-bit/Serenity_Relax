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

const MY_PHOTO = "https://lh3.googleusercontent.com/aida-public/AB6AXuCtmXhVe0lRYhnQqaWvADAxaaeP5H8CTaWgWnwnHuBWTCKuNavepC8xV4YvCsn7T25SmmvQ2LfIY9SUB36F_fF7YTVeEU0FzFIeafA7Ngm7bs_FfqqQnt0XYSeA6J3fIzpxgcYiYggiNjL_9MmBfyQl38IBcgUw3T1ctoEvfiHYzHr5U5UFgGE1JgjR-iOmBet4paske22SV4Y-ncw6VMXYF_7iNqRMybOklEd3VQFELmhDvWIjqGGaQmIA6Oc_PpkGuBQfHkfi5Lc";
const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuB-f97ScrCfLi4ArzqF7XLGDNJ_MRRbIMv3KvSILd-5SAhlF5H4r1zfmr3kVHyi3ofFJENnVdt470pSBcglJc1C4AAxzKjw-3SE_rGEB0RV5N62Yh8Bi4m-7xhoRmIpMLriiYDtgQbQObJAoB6dWuVZpQPEy5xcS7Gdmy42mPvplv5sXRUHsYnCGh6geAnAmtrbcJPsLVK-CS_VTtwuCE9I2TuD24WffAA9iwRA2-moXobO3v1-k2zs5zPhLjEU1TlF610leGxubwE";

const services = [
  {
    id: 'structural-90',
    name: '01. STRUCTURAL ALIGNMENT',
    duration: '90 MINUTES',
    price: 120,
    description: 'Une approche architecturale pour restaurer l\'équilibre corporel.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANpHouC1EYQFGTfeb3LQe-QMbFkeT2atbAuVo1IDyxIvaVbkdBz3v0_aJxWQOmc65zYMvBn7UI0-G9-Cni-K4Ke2pVy73kXg4zGgk8cc3dluLfEwQ-CGJqP5E53__NOQraCO2SPCawyNsYwqgJ_AJ4PjVWhiOTv-oR47pu-1Y3GuJNqqIX9jf4JPUK9YhC3hxb4mLhYNDf06H9EaZNtNcJEaHHclLCZhYKRBhHTUnlnDxR-2fBGq-zlJJP72GOtKFBtLJNxO0v_k0'
  },
  {
    id: 'lymphatic-60',
    name: '02. LYMPHATIC FLOW',
    duration: '60 MINUTES',
    price: 85,
    description: 'Drainage profond pour une détoxification cellulaire.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxU7jFYDcXbNkJkvvM2bCjXwZMkKXlZQnCRPQ3Q_jFmAcmRaZlO2vbEFxHbEhDFgWRoxlGXuUJIhdn9FP82-YWyOEz-2RqLRfIn2SxJmHLgu5iXG-9Trk4C00P6ox_AbtjCyN7sld7PIYObA1jGt28Lmqe-_IAibFv8XpWHnS4VSnCvXGFyJEQJetwM6p8LdHcglI50JLZ9lWw9rXD8PSQZv1XFy8ekwnffUIMFiIMNAvCCInyJQre2-LQm8tifQZLqp3XJDaR8Z4'
  },
  {
    id: 'shiatsu-75',
    name: '03. ZEN SHIATSU',
    duration: '75 MINUTES',
    price: 100,
    description: 'Technique traditionnelle japonaise pour harmoniser l\'énergie.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNQmWEecXnoaoF8DTSSJZlbIk8d2TMr3qMs4Ss_WTFP4mzCLoUbWcxkzgoP8RnQJ51qlhQAv2HJWTk395aGQ7xTlvyUSsb-RVqtCRmj_SrAEvr6f4i0eJx60GdNosbejcchn8aiX8GUUXy0x5Rb247Z9G8eAU4Tmq6TZHVhKOmHOGfIAtqsOcKMf1aFDsvWgzBwxRRBcDpJdgzSLxNxBccknQBwQyxl9vjIsBgfL5BA7J7hHca6CUgImdZ0i0NhdKmfSFPdC8JgE'
  },
  {
    id: 'deeptissue-90',
    name: '04. DEEP TISSUE SCULPT',
    duration: '90 MINUTES',
    price: 130,
    description: 'Relâchement profond des tensions chroniques et musculaires.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIUraQMOw7lKKHCSCRUEG0wszxC8zCBJsIEi7_yw0MJgcbuKsnruc3KbDMu17LUCgOtpoW3PeCEU9fbj3N4pTGwjVPy_MPBioP0u0Hhj0KuYH7Qov4kbW2PC9Y4sGv0DbstrkOk7b0-m61Q7H0ZeN9eCznULb4T6b4_-BAPhUpk86bfpVw9snfktC2R7Hqt3JzRfECDh8RRWxANGAt-zmT4eaqOTFqLDVhUNMCv9S5ECZ_w9fkKk9PItNOith2Vcu8JhPTDuAuUSc'
  },
  {
    id: 'privacy-120',
    name: '05. PRIVACY SESSION',
    duration: '120 MINUTES',
    price: 180,
    description: 'Une session premium exclusive conçue pour un lâcher-prise total.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ZMRf4vBzN-Cs8Qjs8duytaYWrzpMKcNTCAPW0k0IuY6cEolxBE6xiYEnkY9l79ei-bV3-cJbNa_gwEAwoFhS_x2RQA3derpAFUM8vvlOfA821fizZubdwT4jx_p0C9L-dEOwb8OILHANEZzvvPMxsoW_dlfuWiFRbGlWarRe2FnWxBV_6n6Tf5J-eggCM34TpX1DQpi2-e_3W3b0yo0QwV4pmFo-rbba214v_D0LTXYLOlgGzptwggas9re3nXdJEKFE7xVxojE'
  },
  {
    id: 'cranial-45',
    name: '06. CRANIAL RELEASE',
    duration: '45 MINUTES',
    price: 70,
    description: 'Thérapie douce focalisée sur la sphère crânio-sacrée.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlVE7xSwZMkC_8yM-ORMTiAwJfWAhqu_SLl6HoKtBfRS78f6XcNMF2ZAIda29_PUcGk6ML3_KdIez6pKNhXm7MW4gGBHNEGK63l99SASH_DnAQMedbKY85EfJPawR7wtn8l_J3FouRPsgxMifN5TmghxT8hIurjwdprrEBZgPE8EYv_aOdS9_WMzPUldi_zGMGtE5X5yuKFghgoxVvZ1WYG5RDjrikZubpnuvl6d22TT0dJa3qpsaoPvBGzHq3n0u6B9lovB_JTZU'
  },
  {
    id: 'myofascial-90',
    name: '07. MYOFASCIAL STUDY',
    duration: '90 MINUTES',
    price: 140,
    description: 'Travail minutieux sur les fascias pour libérer la mobilité.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVlro2hAMsDzw2gbl4jWqk98IdekhIl82v_3JrThYycIPE87nNV89YRbvAwbcnawuyTgl-ASY8poCdglAaDAmILoImjajo_GWn57XZ9sGxUDTt-QjhgMdmM0Fs2oypbSbLoeginE5nQOYOlH7u-9-YMkktyhSS72SZApyYXcn2Tr0EP3t4nzrq_lZZzYbfKsHFaGghaqot7SjmyzCxehVrVIZv7uY06xc1eTysV31xQXi4B2DoBnQwNYzW1oFbkbGull_Gz9Q9jWs'
  },
  {
    id: 'metabolic-60',
    name: '08. METABOLIC RESET',
    duration: '60 MINUTES',
    price: 95,
    description: 'Stimulation du métabolisme pour une vitalité renouvelée.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpxWRk8P2ArTRraJbs4A5aqIAAW1hodHjodY92Fr9hCBP7OmZkNkjr2qv3aNpWWaQ8bMOW4EnEuZQpe9RAVAUQg2gEQrvSZ0gBYPIgQLn_IFqdto0T4_4pMfA103yzVz4X5V6RnRl0vimLxziTJKX4NC65hIKJ_eDshQhBkZPR0ByZDTdldULASB8w4Tk7p0s8NgvqlSPjs2O-6qEuQIWNI6Yt27gDSC9MYhF6oNoYFmkLyJ_0WPO_SJig-vJg6casBMNURfkl-JI'
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
      <Navbar onBookingClick={() => setIsBookingOpen(true)} />
      
      {/* ── HERO SECTION ── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-48 pb-24 px-8 md:px-16 overflow-hidden">
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
            <motion.h2 variants={fadeIn} className="font-label text-[10px] tracking-[0.6em] text-on-tertiary-container mb-8 block uppercase">
              EST. 2024 — LISBON
            </motion.h2>
            
            <motion.h1 variants={fadeIn} className="font-display text-5xl md:text-6xl lg:text-[48px] leading-[1.2] tracking-[-0.02em] mb-12 text-on-background max-w-xl">
              Architectural Stillness for the Modern Soul.
            </motion.h1>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start gap-8">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-primary text-primary-foreground font-label text-[10px] py-5 px-10 tracking-[0.6em] uppercase hover:bg-on-surface-variant transition-colors"
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
            <motion.div 
              variants={fadeIn}
              className="aspect-[3/4] w-full bg-surface-container overflow-hidden"
            >
              <img 
                src={HERO_IMAGE}
                alt="Sanctuary Space" 
                className="w-full h-full object-cover mix-blend-multiply hover:grayscale-0 transition-all duration-1000 grayscale" 
              />
            </motion.div>
            
            {/* Float quote */}
            <motion.div 
              variants={fadeIn}
              className="absolute -bottom-8 -left-8 bg-white p-8 max-w-xs hidden md:block border-l border-b border-zinc-100"
            >
              <p className="font-body text-[16px] text-on-surface-variant italic leading-[1.6]">
                "We don't just provide therapy; we design environments for emotional recalibration."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── ABOUT JOÃO SECTION ── */}
      <section id="about" className="py-[120px] px-8 md:px-16 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
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
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]" 
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
            <motion.span variants={fadeIn} className="font-label text-[10px] tracking-[0.6em] uppercase text-on-tertiary-container mb-6 block">
              OUR FOUNDER
            </motion.span>
            
            <motion.h2 variants={fadeIn} className="font-headline text-[24px] md:text-[32px] leading-[1.4] mb-8">
              João: Architect of Presence
            </motion.h2>
            
            <motion.div variants={fadeIn} className="space-y-6 max-w-2xl">
              <p className="font-body text-[18px] text-on-surface leading-[1.6]">
                With a background in both structural design and holistic therapy, João approaches the human body as a living architecture that requires balance, space, and intentional maintenance.
              </p>
              <p className="font-body text-[16px] text-on-surface-variant leading-[1.6]">
                His method, "The Centered Framework," integrates traditional Japanese techniques with modern ergonomic understanding, creating a sanctuary for those seeking deep restoration in a high-velocity world.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-12 flex items-center gap-12">
              <div className="flex flex-col">
                <span className="font-display text-[40px] leading-[1.2] mb-2 tracking-[-0.02em]">12+</span>
                <span className="font-label text-[10px] tracking-[0.6em] uppercase text-secondary">YEARS EXP.</span>
              </div>
              <div className="h-12 w-px bg-outline-variant"></div>
              <div className="flex flex-col">
                <span className="font-display text-[40px] leading-[1.2] mb-2 tracking-[-0.02em]">4k+</span>
                <span className="font-label text-[10px] tracking-[0.6em] uppercase text-secondary">SESSIONS</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section id="services" className="py-[120px] px-8 md:px-16 bg-background">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8"
          >
            <div className="max-w-xl">
              <span className="font-label text-[10px] text-on-tertiary-container mb-6 block uppercase tracking-[0.4em]">
                Curated Treatments
              </span>
              <h2 className="font-headline text-[24px] md:text-[32px] leading-[1.4]">
                Precision Wellness Modules.
              </h2>
            </div>
            <div className="font-label text-[10px] flex items-center gap-4 cursor-pointer group tracking-[0.6em] uppercase">
              VIEW FULL MENU
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-outline-variant border border-outline-variant">
            {services.map((service, idx) => (
              <motion.div 
                key={service.id} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 1.5 }}
                className="group relative aspect-square bg-surface overflow-hidden cursor-pointer"
                onClick={() => setIsBookingOpen(true)}
              >
                <img 
                  src={service.image}
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                />
                
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="font-label text-[12px] tracking-[0.03em] font-medium text-white mb-2 uppercase">
                    {service.name}
                  </h3>
                  <p className="font-label text-[9px] tracking-[0.6em] uppercase text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    {service.duration} — {service.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-[120px] px-8 md:px-16 overflow-hidden bg-surface">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-label text-[10px] tracking-[0.6em] uppercase text-on-tertiary-container mb-12 block"
          >
            QUESTIONS FRÉQUEMMENT POSÉES
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-[48px] leading-[1.2] tracking-[-0.02em] mb-20 text-left text-on-surface"
          >
            Équilibre et clarté.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 text-left">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-t border-outline-variant pt-8"
              >
                <h4 className="font-label text-[14px] leading-[1.2] tracking-[0.05em] font-semibold mb-4 uppercase text-on-surface">
                  {faq.question}
                </h4>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant italic">
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
        onClose={() => setIsBookingOpen(false)} 
        services={services}
      />
    </main>
  );
}
