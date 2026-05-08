'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ item }: { item: { q: string; a: string } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-8 flex items-center justify-between text-left group transition-all"
      >
        <span className="text-xl font-medium text-neutral-800 group-hover:text-black transition-colors">{item.q}</span>
        <div className={`p-2 rounded-full bg-neutral-50 group-hover:bg-neutral-100 transition-all ${isOpen ? 'rotate-180 bg-neutral-900 text-white' : ''}`}>
          <ChevronDown size={18} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-neutral-500 text-base leading-relaxed max-w-2xl">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
