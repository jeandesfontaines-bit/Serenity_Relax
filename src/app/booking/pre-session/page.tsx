'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, Heart, Wind, Droplets, ShieldCheck, Thermometer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export default function PreSessionForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    allergies: '',
    medicalConditions: '',
    preferences: 'lavande',
    pressure: 'moyenne',
    notes: '',
  });

  const handleSubmit = () => {
    alert('✅ Vos intentions de soin ont été capturées avec succès.');
    router.push('/client/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F5F0] pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <button onClick={() => router.back()} className="flex items-center gap-3 text-gray-400 font-black text-[0.65rem] uppercase tracking-widest hover:text-[#5F27CD] transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>

          <header className="space-y-6 text-center">
             <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-3xl px-8 py-4 rounded-[2rem] border border-white shadow-xl shadow-indigo-100/10">
                <Sparkles className="text-[#5F27CD]" />
                <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#5F27CD]">Personnalisation du Soin</p>
             </div>
             <h1 className="title-luxe text-6xl md:text-7xl leading-none">Vos Intentions <br/><span className="italic font-serif opacity-40">de Séance.</span></h1>
             <p className="text-xl text-gray-400 font-serif italic max-w-xl mx-auto">Aidez-nous à préparer votre sanctuaire en partageant vos préférences et vos besoins spécifiques.</p>
          </header>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card p-10 md:p-16 space-y-12 bg-white/60 backdrop-blur-3xl border border-white"
          >
            {/* BILAN DE SANTÉ */}
            <div className="space-y-8">
               <h3 className="text-2xl font-serif font-medium flex items-center gap-4 text-[#222F3E]">
                  <ShieldCheck className="text-emerald-500" /> Bilan de Présence
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 ml-6">Allergies ou Sensibilités</label>
                     <textarea 
                        value={form.allergies} 
                        onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 text-lg font-serif italic text-[#222F3E] focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none min-h-[150px]"
                        placeholder="Huiles essentielles, parfums..."
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 ml-6">Points de Vigilance Médicale</label>
                     <textarea 
                        value={form.medicalConditions} 
                        onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 text-lg font-serif italic text-[#222F3E] focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none min-h-[150px]"
                        placeholder="Post-chirurgie, grossesse, fractures..."
                     />
                  </div>
               </div>
            </div>

            {/* EXPÉRIENCE SENSORIELLE */}
            <div className="space-y-8">
               <h3 className="text-2xl font-serif font-medium flex items-center gap-4 text-[#222F3E]">
                  <Droplets className="text-[#0ABDE3]" /> Éveil des Sens
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 ml-6">Atmosphère Olfactive</label>
                     <select 
                        value={form.preferences} 
                        onChange={(e) => setForm({ ...form, preferences: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 text-lg font-serif italic text-[#222F3E] focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer appearance-none"
                     >
                        <option value="lavande">Sérénité Provencale (Lavande)</option>
                        <option value="santal">Force Sacrée (Bois de Santal)</option>
                        <option value="ylang">Douceur Tropicale (Ylang-Ylang)</option>
                        <option value="aucune">Souffle Neutre (Sans parfum)</option>
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 ml-6">Intensité du Toucher</label>
                     <div className="flex gap-4 p-2 bg-gray-50/50 rounded-[2.5rem]">
                        {['douce', 'moyenne', 'profonde'].map((p) => (
                           <button 
                              key={p} 
                              onClick={() => setForm({ ...form, pressure: p })} 
                              className={`flex-1 py-5 rounded-[2rem] text-[0.65rem] font-black uppercase tracking-widest transition-all ${form.pressure === p ? 'bg-[#222F3E] text-white shadow-xl' : 'text-gray-400 hover:text-[#5F27CD]'}`}
                           >
                              {p}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <button 
               onClick={handleSubmit} 
               className="w-full btn-luxe py-8 text-xl flex items-center justify-center gap-6 group"
            >
               <Save className="w-6 h-6 group-hover:scale-125 transition-transform" />
               Confirmer mes préférences
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
