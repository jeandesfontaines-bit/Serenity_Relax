'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Send, Clock, CheckCircle, Sparkles, 
  Bell, Settings, ArrowRight, ShieldCheck,
  TrendingUp, MessageSquare, Heart, Bookmark
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';

export default function AutomaticEmails() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    confirmationRDV: true,
    rappel24h: true,
    rappel48h: false,
    relanceFacture: true,
    apresSeance: true,
    bienvenueClient: true,
  });

  const templates = [
    { key: 'confirmationRDV', title: 'Confirmation de RDV', description: 'Rituel d\'accueil immédiat après réservation', icon: CheckCircle },
    { key: 'rappel24h', title: 'Rappel 24h avant', description: 'Invitation à la présence avant la séance', icon: Clock },
    { key: 'relanceFacture', title: 'Relance Facture', description: 'Rappel bienveillant de l\'abondance due', icon: Bookmark },
    { key: 'apresSeance', title: 'Gratitude Post-Soin', description: 'Message de suivi après l\'immersion', icon: Heart },
    { key: 'bienvenueClient', title: 'Email de Bienvenue', description: 'Introduction au Sanctuaire Zen Zenith', icon: Sparkles },
  ];

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ── HEADER NAVIGATION ── */}
      <motion.header 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#222F3E] text-white p-6 rounded-xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12"><MessageSquare size={150} /></div>
        
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#059669] text-white flex items-center justify-center animate-pulse"><Mail size={10} /></div>
              <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#10B981]">Automation Clinic</p>
           </div>
           <h2 className="title-luxe text-2xl md:text-3xl leading-none text-white">Messagerie <span className="italic opaque-40">Automatique.</span></h2>
           <p className="text-[0.65rem] text-gray-400  max-w-md">Orchestrez vos rituels de communication.</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/therapist/emails/templates')}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs transition-all shadow-md"
          >
            <Sparkles size={16} className="text-[#10B981]" /> Éditeur Visuel
          </button>
          <button
            onClick={() => alert('📧 Test d\'envoi simulé du pack confirmation.')}
            className="btn-luxe flex items-center gap-2 px-6 py-3 text-xs shadow-md"
          >
            <Send size={16} /> Tester le Flux
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
           <h2 className="text-xl font-medium text-[#222F3E] flex items-center gap-2">
              <Sparkles size={16} className="text-slate-500" /> Vos Rituels Actifs
           </h2>

           <div className="grid grid-cols-1 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.key}
                  className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 group bg-white/60 hover:bg-white border border-white transition-all overflow-hidden relative"
                >
                  <div className="flex items-center gap-5 w-full md:w-auto relative z-10">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings[template.key as keyof typeof settings] ? 'bg-emerald-50 text-[#059669]' : 'bg-gray-50 text-gray-300'}`}>
                        <template.icon size={18} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-base font-medium text-[#222F3E]">{template.title}</p>
                        <p className="text-[0.65rem] text-gray-400 ">{template.description}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => toggleSetting(template.key)}
                    className={`relative w-14 h-7 rounded-full p-0.5 transition-all duration-300 ${settings[template.key as keyof typeof settings] ? 'bg-[#34D399]' : 'bg-gray-200'}`}
                  >
                     <motion.div 
                        animate={{ x: settings[template.key as keyof typeof settings] ? 28 : 0 }}
                        className="w-6 h-6 rounded-full bg-white shadow-md"
                     />
                  </button>
                </motion.div>
              ))}
           </div>
        </div>

        {/* STATS & SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
           <section className="dash-card p-6 bg-[#222F3E] text-white space-y-4 relative overflow-hidden">
              <p className="text-[0.5rem] font-black uppercase tracking-widest text-[#10B981]">Volumes du mois</p>
              <div className="space-y-1">
                 <p className="text-4xl font-light text-white">184</p>
                 <p className="text-[0.55rem] font-bold text-emerald-400 uppercase tracking-widest">+12% vs mois dernier</p>
              </div>
           </section>

           <section className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm border border-gray-100 rounded-xl shadow-sm space-y-5">
              <h3 className="text-base font-medium text-[#222F3E]">Dernières Diffusions</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Marie Dupont', type: 'Confirmation RDV', time: '10:42' },
                   { name: 'Thomas Martin', type: 'Rappel 24h', time: '18:15' },
                   { name: 'Sophie Laurent', type: 'Facture Relance', time: '09:05' }
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-center group">
                      <div className="flex gap-3 items-center">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                         <div>
                            <p className="text-xs font-bold text-[#222F3E]">{log.name}</p>
                            <p className="text-[0.5rem] font-black uppercase tracking-widest text-gray-300">{log.type}</p>
                         </div>
                      </div>
                      <p className="text-[0.5rem] font-black text-gray-400">{log.time}</p>
                   </div>
                 ))}
              </div>
              <button className="w-full py-3 border border-gray-100 rounded-xl text-[0.55rem] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Historique</button>
           </section>

           <div className="px-5 py-3 bg-emerald-50/30 border border-emerald-100/50 rounded-xl flex items-center gap-3 text-emerald-600">
              <ShieldCheck size={14} />
              <p className="text-[0.55rem] font-black uppercase tracking-widest">RGPD : Archivage sécurisé</p>
           </div>
        </div>

      </div>
    </div>
  );
}
