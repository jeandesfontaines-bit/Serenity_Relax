import React, { useState } from 'react';
import { 
  Smartphone, Bell, Target, Clock, Save, 
  MessageSquare, Briefcase, ChevronRight,
  Info, CheckCircle2, Sparkles
} from 'lucide-react';

interface SettingsPageProps {
  monthlyGoal: number;
  reminderTemplate: string;
  confirmationTemplate: string;
  followupTemplate: string;
  emailTemplate: string;
  emailEnabled: boolean;
  cabinetName: string;
  cabinetAddress: string;
  cabinetEmail: string;
  onUpdateMetadata: (data: any) => void;
}

export default function SettingsPage({ 
  monthlyGoal, reminderTemplate, confirmationTemplate, followupTemplate,
  emailTemplate, emailEnabled, cabinetName, cabinetAddress, cabinetEmail,
  onUpdateMetadata 
}: SettingsPageProps) {
  const [localGoal, setLocalGoal] = useState(monthlyGoal.toString());
  const [localTemplate, setLocalTemplate] = useState(reminderTemplate);
  const [localConfirmation, setLocalConfirmation] = useState(confirmationTemplate);
  const [localFollowup, setLocalFollowup] = useState(followupTemplate);
  const [localEmail, setLocalEmail] = useState(emailTemplate || "Bonjour {firstName}, votre rendez-vous est confirmé pour le {date} à {time}.");
  const [localEmailEnabled, setLocalEmailEnabled] = useState(emailEnabled);
  const [localCabinetName, setLocalCabinetName] = useState(cabinetName);
  const [localCabinetEmail, setLocalCabinetEmail] = useState(cabinetEmail);
  const [localCabinetAddress, setLocalCabinetAddress] = useState(cabinetAddress);
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateMetadata({
      monthlyGoal: parseInt(localGoal),
      reminderTemplate: localTemplate,
      confirmationTemplate: localConfirmation,
      followupTemplate: localFollowup,
      emailTemplate: localEmail,
      emailEnabled: localEmailEnabled,
      cabinetName: localCabinetName,
      cabinetEmail: localCabinetEmail,
      cabinetAddress: localCabinetAddress
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'email', label: 'Emails', icon: Bell },
    { id: 'cabinet', label: 'Cabinet', icon: Briefcase },
    { id: 'objectives', label: 'Business', icon: Target },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F2EE] animate-in fade-in duration-700 h-full overflow-hidden">
      
      {/* ── STICKY HEADER ── */}
      <header className="h-24 bg-white border-b border-border/10 flex items-center justify-between px-10 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-onyx text-neon rounded-xl flex items-center justify-center">
              <Sparkles size={20} />
           </div>
           <div>
              <h1 className="text-[24px] font-semibold text-onyx tracking-tighter uppercase leading-none">Réglages</h1>
              <p className="text-[10px] font-bold text-earth/30 uppercase tracking-[0.2em] mt-1.5 font-semibold">Studio Infrastructure</p>
           </div>
        </div>
        
        <button
          onClick={handleSave}
          className={`flex items-center gap-3 h-12 px-8 rounded-full text-[13px] font-semibold uppercase tracking-widest transition-all shadow-lg
            ${saved ? 'bg-forest text-white' : 'bg-onyx text-white hover:bg-forest'}`}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'Enregistré' : 'Sauvegarder'}
        </button>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1400px] mx-auto flex gap-10 p-10">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-[240px] flex flex-col gap-2 shrink-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-full text-[13px] font-semibold uppercase tracking-widest transition-all
                  ${activeTab === t.id ? 'bg-onyx text-white shadow-xl' : 'text-earth/40 hover:text-onyx hover:bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <t.icon size={18} />
                  {t.label}
                </div>
                {activeTab === t.id && <ChevronRight size={14} className="text-neon" />}
              </button>
            ))}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 bg-white rounded-[40px] shadow-sm border border-border/10 overflow-y-auto custom-scrollbar p-12">
            
            <div className="max-w-[800px] mx-auto">
              {activeTab === 'whatsapp' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                  <header className="space-y-2">
                     <span className="text-[10px] font-semibold text-forest uppercase tracking-[0.2em]">Automations</span>
                     <h2 className="text-[32px] font-semibold text-onyx tracking-tighter uppercase leading-none">WhatsApp Connect</h2>
                  </header>

                  <div className="space-y-12">
                     {[
                       { label: 'Relance Impayé', val: localTemplate, set: setLocalTemplate },
                       { label: 'Confirmation RDV', val: localConfirmation, set: setLocalConfirmation },
                       { label: 'Suivi Séance', val: localFollowup, set: setLocalFollowup }
                     ].map((item, i) => (
                       <div key={i} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start border-t border-border/5 pt-10">
                          <div className="space-y-4">
                             <label className="text-[11px] font-semibold text-onyx uppercase tracking-widest">{item.label}</label>
                             <textarea
                               value={item.val}
                               onChange={(e) => item.set(e.target.value)}
                               rows={4}
                               className="w-full bg-bg-soft/70 border border-border/10 rounded-[24px] p-6 text-[15px] font-medium text-onyx focus:bg-white focus:ring-1 focus:ring-onyx outline-none transition-all resize-none shadow-inner"
                             />
                          </div>
                          
                          {/* Chat Bubble Preview */}
                          <div className="bg-[#E7E9EC] rounded-[32px] p-4 pt-10 shadow-lg relative border border-white">
                             <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm relative">
                                <p className="text-[13px] font-medium text-onyx leading-snug">
                                   {item.val.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage').replace(/{date}/g, '21/04').replace(/{price}/g, '150').replace(/{time}/g, '14:30')}
                                </p>
                                <span className="text-[9px] text-earth/20 font-semibold absolute bottom-1 right-2 uppercase tracking-tighter">14:20 ✓✓</span>
                             </div>
                             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/10 rounded-full" />
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                     <header className="space-y-2">
                        <span className="text-[10px] font-semibold text-forest uppercase tracking-[0.2em]">Communication</span>
                        <h2 className="text-[32px] font-semibold text-onyx tracking-tighter uppercase leading-none">Email Butler</h2>
                     </header>
                     <button 
                        onClick={() => setLocalEmailEnabled(!localEmailEnabled)}
                        className={`w-16 h-8 rounded-full p-1 transition-all ${localEmailEnabled ? 'bg-forest' : 'bg-earth/20'}`}
                     >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${localEmailEnabled ? 'translate-x-[32px]' : 'translate-x-0'}`} />
                     </button>
                  </div>

                  <div className={`space-y-8 transition-all ${localEmailEnabled ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                     <div className="space-y-4">
                        <label className="text-[11px] font-semibold text-onyx uppercase tracking-widest">Modèle de corps d'email</label>
                        <textarea
                           value={localEmail}
                           onChange={(e) => setLocalEmail(e.target.value)}
                           rows={8}
                           className="w-full bg-bg-soft/70 border border-border/10 rounded-[32px] p-8 text-[16px] font-medium text-onyx focus:bg-white outline-none focus:ring-1 focus:ring-onyx transition-all resize-none shadow-inner"
                        />
                     </div>
                     <div className="p-6 bg-forest/5 rounded-2xl flex items-center gap-4 text-forest">
                        <Info size={20} />
                        <p className="text-[13px] font-bold">L'email inclura automatiquement votre logo et les détails du cabinet configurés.</p>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'objectives' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                  <header className="space-y-2">
                     <span className="text-[10px] font-semibold text-forest uppercase tracking-[0.2em]">Business Strategy</span>
                     <h2 className="text-[32px] font-semibold text-onyx tracking-tighter uppercase leading-none">Performance Cible</h2>
                  </header>

                  <div className="max-w-md space-y-8">
                     <div className="bg-bg-soft/40 p-10 rounded-[32px] border border-border/5 space-y-4">
                        <label className="text-[11px] font-semibold text-onyx uppercase tracking-widest">Objectif CA Mensuel</label>
                        <div className="relative">
                           <input 
                              type="number"
                              value={localGoal}
                              onChange={(e) => setLocalGoal(e.target.value)}
                              className="w-full bg-white border border-border/10 rounded-2xl h-20 px-8 text-[42px] font-semibold text-onyx outline-none focus:ring-1 focus:ring-onyx transition-all tabular-nums tracking-tighter"
                           />
                           <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-earth/20 uppercase tracking-widest">CHF</span>
                        </div>
                        <p className="text-[12px] font-bold text-earth/40 leading-relaxed">Cet objectif est utilisé pour calculer votre barre de progression sur le tableau de bord principal.</p>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'cabinet' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                  <header className="space-y-2">
                     <span className="text-[10px] font-semibold text-forest uppercase tracking-[0.2em]">Legal Identity</span>
                     <h2 className="text-[32px] font-semibold text-onyx tracking-tighter uppercase leading-none">Entité Cabinet</h2>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[11px] font-semibold text-onyx uppercase tracking-widest">Nom Public</label>
                        <input value={localCabinetName} onChange={(e) => setLocalCabinetName(e.target.value)} className="w-full h-14 bg-bg-soft/70 border border-border/10 rounded-2xl px-6 font-semibold text-onyx outline-none focus:bg-white transition-all uppercase tracking-tight" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[11px] font-semibold text-onyx uppercase tracking-widest">Email Contact</label>
                        <input value={localCabinetEmail} onChange={(e) => setLocalCabinetEmail(e.target.value)} className="w-full h-14 bg-bg-soft/70 border border-border/10 rounded-2xl px-6 font-semibold text-onyx outline-none focus:bg-white transition-all lowercase" />
                     </div>
                     <div className="space-y-4 md:col-span-2">
                        <label className="text-[11px] font-semibold text-onyx uppercase tracking-widest">Coordonnées Facturation</label>
                        <input value={localCabinetAddress} onChange={(e) => setLocalCabinetAddress(e.target.value)} className="w-full h-14 bg-bg-soft/70 border border-border/10 rounded-2xl px-6 font-semibold text-onyx outline-none focus:bg-white transition-all uppercase tracking-tight" />
                     </div>
                  </div>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

    </div>
  );
}
