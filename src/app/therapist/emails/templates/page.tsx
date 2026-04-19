'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Eye, ArrowLeft, Send, Monitor, Smartphone,
  Sparkles, Code, Layout, Type, Info, ChevronRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';

const templatesData = {
  confirmationRDV: {
    name: "Confirmation de rendez-vous",
    subject: "Votre immersion Serenity Relax est confirmée",
    html: `<div style="max-width:620px;margin:20px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 15px 40px rgba(95,39,205,0.15);font-family:'Helvetica Neue', Arial, sans-serif;">
      <div style="background:linear-gradient(90deg,#5F27CD,#0ABDE3);padding:40px 30px;text-align:center;color:white;">
        <h1 style="margin:0;font-size:28px;font-weight:300;">Serenity Relax</h1>
      </div>
      <div style="padding:40px 35px;line-height:1.7;color:#222F3E;">
        <h2 style="font-weight:300;font-size:26px;">Bonjour {prenom},</h2>
        <p>Votre rendez-vous est officiellement confirmé :</p>
        <p style="font-size:18px;margin:20px 0;"><strong>{date}</strong> à <strong>{heure}</strong><br><strong>{prestation}</strong></p>
        <div style="text-align:center">
          <a href="#" style="display:inline-block;padding:16px 36px;background:#1DD1A1;color:white;text-decoration:none;border-radius:9999px;font-weight:600;margin:25px 0;">Voir les détails du rendez-vous</a>
        </div>
        <p>Nous avons hâte de vous accueillir dans votre sanctuaire de sérénité.</p>
        <p style="margin-top:30px;">À très bientôt,<br><strong>João & l’équipe Serenity Relax</strong></p>
      </div>
      <div style="background:#F8F5F0;padding:25px;text-align:center;font-size:13px;color:#666;">
        Chemin de Joinville 26 • 1216 Cointrin • Genève
      </div>
    </div>`
  },
  rappel24h: {
    name: "Rappel 24h avant",
    subject: "Rappel : Votre séance demain à {heure}",
    html: `<div style="max-width:620px;margin:20px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 15px 40px rgba(95,39,205,0.15);font-family:'Helvetica Neue', Arial, sans-serif;">
      <div style="background:#5F27CD;padding:35px 30px;text-align:center;color:white;">
        <h2 style="margin:0;font-weight:300;">Rappel • Votre séance demain</h2>
      </div>
      <div style="padding:40px 35px;line-height:1.7;color:#222F3E;">
        <p>Bonjour {prenom},</p>
        <p style="font-size:18px;">Nous vous rappelons votre rendez-vous :</p>
        <p style="font-size:19px;margin:25px 0;"><strong>{date} à {heure}</strong><br>{prestation}</p>
        <p>Adresse : Chemin de Joinville 26, 1216 Cointrin</p>
        <p style="margin-top:30px;">Nous avons hâte de vous retrouver.<br><strong>João</strong></p>
      </div>
    </div>`
  },
  relanceFacture: {
    name: "Relance facture",
    subject: "Votre facture Serenity Relax est en attente",
    html: `<div style="max-width:620px;margin:20px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 15px 40px rgba(95,39,205,0.15);font-family:'Helvetica Neue', Arial, sans-serif;">
      <div style="padding:40px 35px;line-height:1.7;color:#222F3E;">
        <p>Bonjour {prenom},</p>
        <p>Nous vous rappelons que la facture <strong>{facture}</strong> d’un montant de <strong>{montant} CHF</strong> est toujours en attente.</p>
        <div style="text-align:center">
          <a href="#" style="display:inline-block;padding:16px 36px;background:#FF9F43;color:white;text-decoration:none;border-radius:9999px;font-weight:600;margin:20px 0;">Régler maintenant</a>
        </div>
        <p style="margin-top:30px;">Merci de votre confiance.<br><strong>Serenity Relax</strong></p>
      </div>
    </div>`
  },
  merciApresSeance: {
    name: "Merci après séance",
    subject: "Merci d’avoir choisi Serenity Relax",
    html: `<div style="max-width:620px;margin:20px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 15px 40px rgba(95,39,205,0.15);font-family:'Helvetica Neue', Arial, sans-serif;">
      <div style="padding:40px 35px;line-height:1.7;color:#222F3E;">
        <p>Bonjour {prenom},</p>
        <p>Merci d’avoir choisi Serenity Relax aujourd’hui.</p>
        <p>Nous espérons que vous vous sentez plus léger·e, serein·e et reconnecté·e.</p>
        <p>À très bientôt pour un prochain moment de lâcher-prise.</p>
        <p style="margin-top:30px;">Avec toute notre attention,<br><strong>João & l’équipe Serenity Relax</strong></p>
      </div>
    </div>`
  }
};

export default function EmailTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState(templatesData);
  const [selectedKey, setSelectedKey] = useState<keyof typeof templatesData>('confirmationRDV');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [htmlContent, setHtmlContent] = useState('');

  const current = templates[selectedKey];
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync content with debounce for performance
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setHtmlContent(current.html);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [current.html]);

  const updateField = (field: 'subject' | 'html', value: string) => {
    setTemplates(prev => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], [field]: value }
    }));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = current.html;
    const newText = text.substring(0, start) + variable + text.substring(end);
    updateField('html', newText);
    setTimeout(() => textarea.focus(), 10);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      
      {/* ── HEADER ── */}
      <motion.header 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-white/40 backdrop-blur-3xl p-10 lg:p-14 rounded-[3.5rem] border border-white shadow-2xl shadow-indigo-100/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none rotate-12"><Layout size={300} /></div>
        
        <div className="space-y-6 relative z-10">
           <button onClick={() => router.push('/therapist/emails')} className="flex items-center gap-3 text-gray-400 font-black text-[0.65rem] uppercase tracking-widest hover:text-[#5F27CD] transition-colors mb-4">
             <ArrowLeft size={16} /> Flux Automatiques
           </button>
           <h1 className="title-luxe text-5xl md:text-7xl leading-none">Studio de <br/><span className="italic font-sans opacity-40">Rédaction.</span></h1>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => alert('✅ Email de test envoyé.')}
            className="flex items-center gap-4 px-10 py-7 border border-emerald-100 bg-white/50 rounded-[2.5rem] text-[0.65rem] font-black tracking-widest uppercase text-emerald-600 hover:bg-[#1DD1A1] hover:text-white transition-all shadow-xl"
          >
            <Send size={20} /> Tester
          </button>
          <button
            onClick={() => alert('✅ Vos manuscrits digitaux ont été sauvegardés.')}
            className="btn-luxe flex items-center gap-4 px-10 py-7 text-[0.65rem] shadow-2xl shadow-indigo-200/50"
          >
            <Save size={20} /> Sauvegarder
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SELECTOR + VARIABLES */}
        <div className="lg:col-span-3 space-y-4">
           {Object.entries(templates).map(([key, t]) => (
             <button
               key={key}
               onClick={() => setSelectedKey(key as keyof typeof templatesData)}
               className={`w-full text-left p-6 rounded-[2rem] border border-white transition-all flex items-center justify-between group ${
                 selectedKey === key ? 'bg-[#222F3E] text-white shadow-2xl' : 'bg-white/60 hover:bg-white text-gray-400 font-sans italic'
               }`}
             >
               <span className="text-[0.65rem] font-black uppercase tracking-widest leading-tight">{t.name}</span>
               <ChevronRight className={selectedKey === key ? 'text-[#0ABDE3]' : 'opacity-0'} size={20} />
             </button>
           ))}

           <section className="dash-card p-8 bg-[#222F3E] text-white space-y-6 mt-6">
              <h3 className="text-lg font-sans font-medium flex items-center gap-3 text-[#0ABDE3]">
                 <Type size={18} /> Particules
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 {['{prenom}', '{nom}', '{date}', '{heure}', '{prestation}', '{facture}'].map((v) => (
                   <button
                     key={v}
                     onClick={() => insertVariable(v)}
                     className="px-3 py-3 text-[0.55rem] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 hover:border-[#5F27CD] rounded-xl transition-all"
                   >
                     {v}
                   </button>
                 ))}
              </div>
           </section>
        </div>

        {/* EDITOR */}
        <div className="lg:col-span-4 space-y-6">
           <section className="dash-card p-10 bg-white/60 backdrop-blur-3xl border border-white space-y-8 h-full">
              <div className="flex items-center gap-4 text-[#5F27CD]">
                 <Code size={20} />
                 <h2 className="text-xl font-sans font-medium text-[#222F3E]">Édition HTML</h2>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-4">Objet Global</label>
                    <input
                      type="text"
                      value={current.subject}
                      onChange={(e) => updateField('subject', e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-base font-sans italic text-[#222F3E] focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-4">Structure HTML</label>
                    <textarea
                      id="body-editor"
                      value={current.html}
                      onChange={(e) => updateField('html', e.target.value)}
                      rows={14}
                      className="w-full bg-white border border-gray-100 rounded-[2rem] p-6 text-[10px] font-mono text-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none min-h-[500px]"
                    />
                 </div>
              </div>
           </section>
        </div>

        {/* IFRAME PREVIEW */}
        <div className="lg:col-span-5 relative">
           <div className="sticky top-10 space-y-6">
              <div className="dash-card p-8 bg-white border border-white space-y-6 overflow-hidden flex flex-col shadow-2xl shadow-indigo-100/20">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-sans font-medium text-[#222F3E] flex items-center gap-3"><Eye size={20} className="text-[#5F27CD]" /> Miroir Dynamique</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setViewMode('desktop')} className={`p-3 rounded-xl transition-all ${viewMode === 'desktop' ? 'bg-[#222F3E] text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}><Monitor size={16} /></button>
                      <button onClick={() => setViewMode('mobile')} className={`p-3 rounded-xl transition-all ${viewMode === 'mobile' ? 'bg-[#222F3E] text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}><Smartphone size={16} /></button>
                    </div>
                 </div>
                 
                 <div className={`flex-1 min-h-[580px] bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner overflow-hidden transition-all duration-700 ${viewMode === 'mobile' ? 'max-w-[340px] mx-auto' : 'w-full'}`}>
                    <iframe
                      srcDoc={htmlContent}
                      className="w-full h-full border-0"
                      title="Email Sensory Preview"
                    />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
