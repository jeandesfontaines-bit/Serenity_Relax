
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
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Expérience Privée</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-neutral-900 mb-8 tracking-tighter leading-[0.9]"
          >
            Réserver un <span className="italic font-light text-neutral-500">moment.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed italic"
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
