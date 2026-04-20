import React, { useState } from 'react';
import { 
  Smartphone, Bell, Target, Clock, Save, 
  MessageSquare, UserCircle, Briefcase, ChevronRight,
  Info, CheckCircle2
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
  monthlyGoal, 
  reminderTemplate, 
  confirmationTemplate,
  followupTemplate,
  emailTemplate,
  emailEnabled,
  cabinetName,
  cabinetAddress,
  cabinetEmail,
  onUpdateMetadata 
}: SettingsPageProps) {
  const [localGoal, setLocalGoal] = useState(monthlyGoal.toString());
  const [localTemplate, setLocalTemplate] = useState(reminderTemplate);
  const [localConfirmation, setLocalConfirmation] = useState(confirmationTemplate);
  const [localFollowup, setLocalFollowup] = useState(followupTemplate);
  const [localEmail, setLocalEmail] = useState(emailTemplate || "Bonjour {firstName}, votre rendez-vous est confirmé pour le {date} à {time}. Bien à vous.");
  const [localEmailEnabled, setLocalEmailEnabled] = useState(emailEnabled || false);
  const [localCabinetName, setLocalCabinetName] = useState(cabinetName || "Mon Cabinet");
  const [localCabinetEmail, setLocalCabinetEmail] = useState(cabinetEmail || "");
  const [localCabinetAddress, setLocalCabinetAddress] = useState(cabinetAddress || "");
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
    { id: 'objectives', label: 'Objectifs', icon: Target },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-soft">
      <header className="h-xl border-b border-border bg-white px-m sm:px-xl flex items-center justify-between shrink-0">
        <h1 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Réglages du Cabinet</h1>
        <button
          onClick={handleSave}
          className={`flex items-center gap-xs h-l px-m rounded-md font-heading text-[10px] font-black uppercase tracking-widest transition-all ${
            saved ? 'bg-aurora text-white shadow-lg shadow-aurora/10' : 'bg-azraq text-white hover:bg-azraq/90 shadow-lg shadow-azraq/10'
          }`}
        >
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
            
            {/* Nav Gauche */}
            <aside className="space-y-xxs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-xs px-m py-xs rounded-md font-heading text-small font-black uppercase tracking-widest transition-all ${
                    activeTab === t.id ? 'bg-white text-azraq shadow-sm border border-border' : 'text-samaritan hover:bg-bg-soft'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </aside>

            {/* Contenu Droite */}
            <main className="space-y-8">
              
              {activeTab === 'whatsapp' && (
                <div className="space-y-xl">
                  <div className="bg-white border border-border rounded-card overflow-hidden shadow-sm shadow-azraq/5">
                    <div className="bg-bg-soft/50 border-b border-border px-xl py-m">
                       <h2 className="font-heading text-small font-black text-sapphire flex items-center gap-xs uppercase tracking-widest">
                          <MessageSquare size={18} className="text-azraq" /> WhatsApp Studio
                       </h2>
                       <p className="font-heading text-[9px] text-samaritan font-black uppercase tracking-widest mt-xxs">Personnalisez vos automations mobiles</p>
                    </div>
                    
                    <div className="p-xl space-y-xl">
                      {[
                        { id: 'remind', label: 'Relance de Paiement', val: localTemplate, set: setLocalTemplate, icon: Bell, color: 'text-tomato', sample: 'Soin du 12/04' },
                        { id: 'confirm', label: 'Confirmation de RDV', val: localConfirmation, set: setLocalConfirmation, icon: CheckCircle2, color: 'text-aurora', sample: 'Confirmé !' },
                        { id: 'follow', label: 'Suivi après Séance', val: localFollowup, set: setLocalFollowup, icon: Smartphone, color: 'text-azraq', sample: 'Comment allez-vous ?' }
                      ].map(item => (
                        <div key={item.id} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-xl items-start">
                          <div className="space-y-m">
                            <div className="flex items-center gap-xs">
                               <item.icon size={16} className={item.color} />
                               <h3 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">{item.label}</h3>
                            </div>
                            <textarea
                              value={item.val}
                              onChange={(e) => item.set(e.target.value)}
                              rows={3}
                              className="w-full font-heading text-small p-m rounded-card-inner border border-border bg-bg-soft/30 focus:ring-2 focus:ring-azraq/10 focus:bg-white focus:outline-none transition-all leading-body resize-none"
                            />
                          </div>
                          
                          {/* Chat Preview */}
                          <div className="relative">
                             <div className="bg-bg-soft/50 rounded-card-inner overflow-hidden border border-border shadow-2xl max-w-[280px] mx-auto">
                                <div className="bg-azraq px-m py-s flex items-center gap-m">
                                   <div className="w-l h-l rounded-md bg-white/10 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest">SR</div>
                                   <div className="flex-1">
                                      <p className="font-heading text-[10px] font-black text-white leading-none uppercase tracking-widest">Serenity Relax</p>
                                      <p className="font-heading text-[8px] text-white/50 uppercase tracking-widest mt-xxs">En ligne</p>
                                   </div>
                                </div>
                                <div className="p-m pt-l space-y-m min-h-[120px] bg-bg-soft/50">
                                   <div className="bg-white rounded-md p-m shadow-sm relative border border-border animate-in fade-in slide-in-from-bottom-2 duration-500">
                                      <p className="font-heading text-small text-sapphire leading-relaxed pr-m">
                                         {item.val.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage').replace(/{date}/g, '19/04').replace(/{price}/g, '150').replace(/{time}/g, '14:30')}
                                      </p>
                                      <span className="absolute bottom-xxs right-xs text-[8px] font-black text-samaritan/30 uppercase tracking-widest">12:45 ✓✓</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-m bg-azraq/5 border border-azraq/10 rounded-lg flex items-center gap-xs">
                    <Info size={16} className="text-azraq shrink-0" />
                    <p className="font-heading text-[11px] text-azraq font-black uppercase tracking-widest leading-relaxed">
                       Ces messages seront générés automatiquement. Vous pourrez les relire et les modifier avant chaque envoi WhatsApp définitif.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-xl">
                  <div className="bg-white border border-border rounded-card overflow-hidden shadow-sm shadow-azraq/5">
                    {/* Toolbar */}
                    <div className="bg-bg-soft/50 border-b border-border px-xl py-m flex items-center justify-between">
                      <div className="flex items-center gap-m">
                        <div className="w-xl h-xl bg-azraq rounded-md flex items-center justify-center text-white">
                          <Bell size={18} />
                        </div>
                        <div>
                          <h2 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Email Visual Composer</h2>
                          <p className="font-heading text-[9px] text-samaritan font-black uppercase tracking-widest mt-xxs">Configuration de la confirmation automatique</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setLocalEmailEnabled(!localEmailEnabled)}
                        className={`w-14 h-l rounded-full p-xxs transition-all duration-300 ${localEmailEnabled ? 'bg-aurora' : 'bg-border'}`}
                      >
                        <div className={`w-m h-m bg-white rounded-full shadow-md transition-transform duration-300 ${localEmailEnabled ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="p-xl">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
                          {/* Editeur */}
                          <div className={localEmailEnabled ? 'opacity-100 space-y-m' : 'opacity-30 pointer-events-none space-y-m'}>
                             <label className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Contenu personnalisé</label>
                             <textarea
                                value={localEmail}
                                onChange={(e) => setLocalEmail(e.target.value)}
                                rows={10}
                                className="w-full font-heading text-small p-m rounded-card-inner border border-border bg-bg-soft/30 focus:ring-2 focus:ring-azraq/10 focus:bg-white focus:outline-none transition-all leading-body resize-none"
                                placeholder="Rédigez votre email de bienvenue..."
                             />
                             <div className="p-m bg-bg-soft border border-border rounded-md">
                                <p className="font-heading text-[9px] text-samaritan font-black uppercase tracking-widest">✨ Astuce : Utilisez <span className="bg-white px-xxs py-px rounded border border-border text-azraq font-black">&#123;firstName&#125;</span> pour personnaliser.</p>
                             </div>
                          </div>

                          {/* Visual Preview */}
                          <div className="space-y-m">
                             <label className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Aperçu Réel (Client)</label>
                             <div className="border border-border rounded-card overflow-hidden shadow-xl shadow-azraq/5 bg-white">
                                <div className="bg-azraq px-xl py-xl text-center">
                                   <div className="w-xl h-xl bg-white/10 rounded-md mx-auto mb-m flex items-center justify-center backdrop-blur-md">
                                      <Briefcase className="text-white" size={24} />
                                   </div>
                                   <h3 className="text-white font-heading text-small font-black uppercase tracking-widest">VOTRE CABINET</h3>
                                </div>
                                <div className="p-xl space-y-xl">
                                   <div className="space-y-xs text-center">
                                      <h4 className="font-heading text-h4 font-black text-sapphire uppercase tracking-widest">Confirmation</h4>
                                      <p className="font-body text-body font-normal text-samaritan leading-body">
                                         {localEmail.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage').replace(/{date}/g, '19/04').replace(/{time}/g, '14:30')}
                                      </p>
                                   </div>
                                   
                                   <div className="bg-bg-soft rounded-card-inner p-m border border-border space-y-xxs">
                                      <div className="flex items-center justify-between border-b border-border/50 pb-xxs">
                                         <span className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest">Soin</span>
                                         <span className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Massage Relaxant</span>
                                      </div>
                                      <div className="flex items-center justify-between border-b border-border/50 pb-xxs">
                                         <span className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest">Temps</span>
                                         <span className="font-heading text-small font-black text-sapphire uppercase tracking-widest">19 Avril @ 14:30</span>
                                      </div>
                                   </div>

                                   <button className="w-full py-m bg-azraq rounded-md text-white font-heading text-small font-black uppercase tracking-widest shadow-lg shadow-azraq/10 flex items-center justify-center gap-xs hover:bg-azraq/90 transition-all">
                                      <Clock size={16} /> Ajouter au calendrier
                                   </button>
                                   
                                   <p className="font-heading text-[8px] text-center text-samaritan font-black uppercase tracking-widest">Cabinet Thérapeutique · Avenue de la Gare 12, Genève</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'objectives' && (
                <div className="bg-white border border-border rounded-card p-xl shadow-sm shadow-azraq/5 space-y-xl">
                   <div>
                    <h2 className="font-heading text-small font-black text-sapphire mb-xxs flex items-center gap-xs uppercase tracking-widest">
                       <Target size={18} className="text-azraq" /> Objectif Financier
                    </h2>
                    <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest">Définissez votre objectif de chiffre d'affaires mensuel.</p>
                  </div>

                  <div className="space-y-m max-w-xs">
                     <label className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Montant cible (CHF)</label>
                     <div className="relative">
                        <input 
                          type="number"
                          value={localGoal}
                          onChange={(e) => setLocalGoal(e.target.value)}
                          className="w-full h-l pl-m pr-l rounded-md border border-border bg-bg-soft/50 font-heading text-h3 font-black text-sapphire focus:ring-2 focus:ring-azraq/10 focus:border-border focus:bg-white focus:outline-none transition-all uppercase tracking-widest"
                        />
                        <span className="absolute right-m top-1/2 -translate-y-1/2 font-heading text-small font-black text-samaritan/30 uppercase tracking-widest">CHF</span>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'cabinet' && (
                <div className="bg-white border border-border rounded-card p-xl shadow-sm shadow-azraq/5 space-y-xl">
                   <div>
                    <h2 className="font-heading text-small font-black text-sapphire mb-xxs flex items-center gap-xs uppercase tracking-widest">
                       <Briefcase size={18} className="text-azraq" /> Informations Professionnelles
                    </h2>
                    <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest">Ces informations apparaîtront sur vos factures PDF.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-m">
                     <div className="space-y-xs">
                        <label className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Nom du Cabinet</label>
                        <input 
                          value={localCabinetName} 
                          onChange={(e) => setLocalCabinetName(e.target.value)}
                          placeholder="Ex: Cabinet Zen"
                          className="w-full h-l px-m rounded-md bg-bg-soft/50 border border-border font-heading text-small font-black text-sapphire focus:ring-2 focus:ring-azraq/10 focus:border-border focus:outline-none focus:bg-white transition-all uppercase tracking-widest placeholder:text-samaritan/30" 
                        />
                     </div>
                     <div className="space-y-xs">
                        <label className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Email Professionnel</label>
                        <input 
                          value={localCabinetEmail} 
                          onChange={(localE) => setLocalCabinetEmail(localE.target.value)}
                          placeholder="votre@email.com"
                          className="w-full h-l px-m rounded-md bg-bg-soft/50 border border-border font-heading text-small font-black text-sapphire focus:ring-2 focus:ring-azraq/10 focus:border-border focus:outline-none focus:bg-white transition-all lowercase tracking-widest placeholder:text-samaritan/30" 
                        />
                     </div>
                  </div>
                  <div className="space-y-xs">
                      <label className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Adresse Complète</label>
                      <input 
                        value={localCabinetAddress} 
                        onChange={(e) => setLocalCabinetAddress(e.target.value)}
                        placeholder="Rue du Lac 12, 1200 Genève"
                        className="w-full h-l px-m rounded-md bg-bg-soft/50 border border-border font-heading text-small font-black text-sapphire focus:ring-2 focus:ring-azraq/10 focus:border-border focus:outline-none focus:bg-white transition-all uppercase tracking-widest placeholder:text-samaritan/30" 
                      />
                  </div>
                  <div className="p-m bg-aurora/10 border border-aurora/10 rounded-lg flex items-center gap-xs">
                    <CheckCircle2 size={16} className="text-aurora" />
                    <p className="font-heading text-[10px] font-black text-aurora uppercase tracking-widest leading-relaxed">Ces informations seront utilisées pour générer automatiquement vos factures PDF.</p>
                  </div>
                </div>
              )}

            </main>

          </div>

        </div>
      </div>
    </div>
  );
}
