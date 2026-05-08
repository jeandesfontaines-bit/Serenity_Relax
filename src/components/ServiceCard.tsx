'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Service = {
  id: string;
  name: string;
  duration: string;
  intensity: number;
  price: number;
  image: string;
  desc: string;
  tag: string;
};

export default function ServiceCard({ s, i, onSelect }: { s: Service; i: number; onSelect: (s: Service) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      onClick={() => onSelect(s)}
      className={`group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-neutral-100 shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-neutral-200 hover:border-neutral-200 ${i % 2 === 1 ? 'md:translate-y-12' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50 m-2.5 rounded-[2rem]">
        <Image
          src={s.image}
          alt={s.name}
          fill
          className="object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-sm">PHILOSOPHIE</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-sm">{s.tag}</span>
        </div>
        <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/20 transition-all duration-500 flex items-end justify-center pb-8 z-10">
          <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-white text-neutral-900 px-7 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">
            Réserver ce soin →
          </div>
        </div>
      </div>

      <div className="p-7 md:p-9 flex flex-col justify-between flex-1">
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-medium serif-font text-neutral-900 leading-tight mb-3">{s.name}</h3>
          <p className="text-neutral-400 text-xs font-medium leading-relaxed uppercase tracking-wider line-clamp-2">{s.desc}</p>
        </div>
        <div className="pt-6 flex items-center justify-between border-t border-neutral-50">
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className={`h-0.5 w-4 rounded-full transition-colors ${idx < s.intensity ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
            ))}
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-neutral-900 block">CHF {s.price}</span>
            <span className="text-[10px] font-bold text-neutral-300 tracking-[0.15em] uppercase">{s.duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
