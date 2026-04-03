
'use client';

import { Navbar } from '@/components/navbar';
import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';
import { motion } from 'framer-motion';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F2] pt-24 md:pt-32 pb-24 px-6">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-black/5 rounded-full mb-8 shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span className="text-[0.7rem] font-sans font-black uppercase tracking-[0.28em] text-muted-foreground md:text-[0.75rem] lg:text-[0.8rem]">Expérience Privée</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[2.4rem] leading-[0.95] md:text-[3.3rem] lg:text-[4.5rem] font-serif font-medium text-neutral-900 mb-8 tracking-tighter"
          >
            Réserver un <span className="italic font-light text-neutral-500">moment.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[1rem] leading-relaxed font-sans font-light italic text-muted-foreground max-w-xl mx-auto md:text-[1.08rem] lg:text-[1.15rem]"
          >
            Composez votre propre voyage de récupération. Sécuriser votre créneau dans notre sanctuaire est la première étape vers la restauration.
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-1 shadow-2xl rounded-[4rem] shadow-black/[0.02] border border-white overflow-hidden"
        >
          <BookingFlow services={SERVICES} />
        </motion.div>
      </div>
    </div>
  );
}
