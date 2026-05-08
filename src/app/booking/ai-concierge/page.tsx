'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkle, Send, ArrowRight, Heart, Brain, 
  Wind, Zap, Bot, ArrowLeft, Loader2, CheckCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function AIConcierge() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: 'Bienvenue au Sanctuaire. Je suis votre Compagnon Zen. Comment vous sentez-vous aujourd\'hui ? Décrivez-moi votre état physique ou émotionnel...' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // SIMULATION IA (En attendant la connexion réelle au provider)
    setTimeout(() => {
      setIsTyping(false);
      const text = input.toLowerCase();
      
      let reco = null;
      let reply = "";

      if (text.includes('stress') || text.includes('fatigue') || text.includes('tendu')) {
        reco = {
          title: 'Massage Sensoriel 90 min',
          description: 'Votre corps a besoin d\'un lâcher-prise total. Le massage sensoriel va dénouer vos tensions profondes et rétablir votre sérénité.',
          price: 180,
          color: '#5F27CD'
        };
        reply = "Je perçois une accumulation de stress dans votre système. Pour libérer ces tensions, je vous suggère une immersion sensorielle profonde.";
      } else if (text.includes('énergie') || text.includes('bloqué') || text.includes('motivation')) {
        reco = {
          title: 'Rituel Énergétique 60 min',
          description: 'Une séance focalisée sur la circulation de vos flux vitaux pour retrouver vitalité et clarté d\'esprit.',
          price: 150,
          color: '#0ABDE3'
        };
        reply = "Votre flux vital semble avoir besoin d'un rééquilibrage. Un rituel énergétique serait idéal pour réactiver votre dynamisme.";
      } else {
        reco = {
          title: 'Immersion Holistique 120 min',
          description: 'Le voyage ultime. Idéal pour une reconnexion totale corps-esprit.',
          price: 240,
          color: '#1DD1A1'
        };
        reply = "C'est une belle introspection. Pour une harmonie complète, notre immersion holistique est le choix souverain.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setRecommendation(reco);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      
      {/* ── HEADER IMPACT ── */}
      <motion.header 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#222F3E] text-white p-12 lg:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none -rotate-12"><Bot size={400} /></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5F27CD] to-[#0ABDE3] text-white flex items-center justify-center animate-pulse"><Sparkle size={24} /></div>
              <p className="text-[0.7rem] font-black uppercase tracking-[0.5em] text-[#0ABDE3]">Oracle Intelligent</p>
           </div>
           <h1 className="title-luxe text-6xl md:text-8xl">L&apos;Expérience <br/><span className="italic font-serif opacity-40 text-[#F8F5F0]">Assistée par IA.</span></h1>
           <p className="text-xl text-gray-400 font-serif italic max-w-2xl px-6">Confiez vos ressentis à notre Compagnon Zen. Il saura guider vos pas vers le soin dont votre âme a besoin aujourd&apos;hui.</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* CHAT INTERFACE */}
        <div className="lg:col-span-7 flex flex-col h-[700px] dash-card bg-white border border-white overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-widest text-[#222F3E]">Compagnon Zen en ligne</p>
           </div>
           
           <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'assistant' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-8 rounded-[2rem] text-lg font-serif italic leading-relaxed shadow-sm ${
                    m.role === 'assistant' ? 'bg-[#222F3E] text-white rounded-tl-none' : 'bg-indigo-50 text-[#5F27CD] rounded-tr-none border border-indigo-100'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-6 rounded-3xl animate-pulse text-gray-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> L&apos;Oracle réfléchit...
                  </div>
                </div>
              )}
           </div>

           <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4 items-center">
              <input 
                type="text"
                placeholder="Ex: Je me sens très stressé par le travail..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 p-6 bg-white border border-gray-100 rounded-[2rem] text-lg focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner font-serif italic"
              />
              <button 
                onClick={handleSend}
                className="w-16 h-16 rounded-full bg-[#5F27CD] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all"
              >
                 <Send size={24} />
              </button>
           </div>
        </div>

        {/* AI RECOMMENDATION PANEL */}
        <div className="lg:col-span-5 relative">
           <AnimatePresence>
             {recommendation ? (
               <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="dash-card p-12 bg-white border border-white space-y-10 sticky top-12 shadow-2xl shadow-indigo-100/30"
               >
                  <div className="flex items-center gap-4 text-emerald-500">
                    <CheckCircle size={28} />
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em]">Soin Recommandé</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-4xl font-serif font-medium text-[#222F3E] leading-tight">{recommendation.title}</h3>
                    <p className="text-xl text-gray-400 font-serif italic font-light italic leading-relaxed">{recommendation.description}</p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 flex justify-between items-center">
                     <div>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-1">Durée conseillée</p>
                        <p className="text-lg font-bold text-[#222F3E]">Détente Absolue</p>
                     </div>
                     <p className="text-3xl font-light text-[#5F27CD]">{recommendation.price} CHF</p>
                  </div>

                  <button 
                    onClick={() => router.push('/booking')}
                    className="w-full py-8 btn-luxe flex items-center justify-center gap-4 text-xl shadow-2xl shadow-indigo-200/50 group"
                  >
                    Réserver ce voyage <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>

                  <div className="pt-6 border-t border-gray-50 text-center">
                    <p className="text-[0.65rem] text-gray-300 font-black uppercase tracking-widest">Conseil généré par Intelligence Holistique v2.0</p>
                  </div>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col justify-center items-center text-center p-12 space-y-8 bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gray-200 shadow-sm"><Brain size={40} /></div>
                  <p className="text-lg font-serif italic text-gray-400 max-w-xs leading-relaxed">Parlez-moi de vous. L&apos;Oracle attend vos mots pour vous révéler votre destin sensoriel.</p>
               </div>
             )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
