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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      <header className="h-14 border-b border-slate-200 bg-white px-6 sm:px-10 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-semibold text-slate-900">Réglages du Cabinet</h1>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-bold transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          }`}
        >
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saved ? 'Enregistré' : 'Enregistrer les modifications'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
            
            {/* Nav Gauche */}
            <aside className="space-y-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
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
                <div className="space-y-8">
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-8 py-5">
                       <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MessageSquare size={18} className="text-emerald-500" /> WhatsApp Studio
                       </h2>
                       <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Personnalisez vos automations mobiles</p>
                    </div>
                    
                    <div className="p-8 space-y-10">
                      {[
                        { id: 'remind', label: 'Relance de Paiement', val: localTemplate, set: setLocalTemplate, icon: Bell, color: 'text-rose-500', sample: 'Soin du 12/04' },
                        { id: 'confirm', label: 'Confirmation de RDV', val: localConfirmation, set: setLocalConfirmation, icon: CheckCircle2, color: 'text-emerald-500', sample: 'Confirmé !' },
                        { id: 'follow', label: 'Suivi après Séance', val: localFollowup, set: setLocalFollowup, icon: Smartphone, color: 'text-blue-500', sample: 'Comment allez-vous ?' }
                      ].map(item => (
                        <div key={item.id} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                               <item.icon size={16} className={item.color} />
                               <h3 className="text-sm font-bold text-slate-800">{item.label}</h3>
                            </div>
                            <textarea
                              value={item.val}
                              onChange={(e) => item.set(e.target.value)}
                              rows={3}
                              className="w-full text-sm p-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:outline-none transition-all leading-relaxed resize-none"
                            />
                          </div>
                          
                          {/* Chat Preview */}
                          <div className="relative">
                             <div className="bg-[#E5DDD5] rounded-3xl overflow-hidden border border-slate-200 shadow-xl max-w-[280px] mx-auto">
                                <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                                   <div className="flex-1">
                                      <p className="text-[11px] font-bold text-white leading-none">Votre Thérapeute</p>
                                      <p className="text-[9px] text-white/70">En ligne</p>
                                   </div>
                                </div>
                                <div className="p-4 pt-6 space-y-4 min-h-[120px] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain">
                                   <div className="bg-white rounded-2xl p-3 shadow-sm relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                                      <p className="text-[12px] text-slate-800 leading-relaxed pr-6">
                                         {item.val.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage').replace(/{date}/g, '19/04').replace(/{price}/g, '150').replace(/{time}/g, '14:30')}
                                      </p>
                                      <span className="absolute bottom-1 right-2 text-[8px] text-slate-400">12:45 ✓✓</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                    <Info size={16} className="text-indigo-600 shrink-0" />
                    <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                       Ces messages seront générés automatiquement. Vous pourrez les relire et les modifier avant chaque envoi WhatsApp définitif.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <Bell size={18} />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">Email Visual Composer</h2>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Configuration de la confirmation automatique</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setLocalEmailEnabled(!localEmailEnabled)}
                        className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${localEmailEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${localEmailEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="p-8">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* Editeur */}
                          <div className={localEmailEnabled ? 'opacity-100 space-y-4' : 'opacity-30 pointer-events-none space-y-4'}>
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contenu personnalisé</label>
                             <textarea
                                value={localEmail}
                                onChange={(e) => setLocalEmail(e.target.value)}
                                rows={10}
                                className="w-full text-sm p-5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-amber-50 focus:border-amber-200 focus:outline-none transition-all leading-relaxed resize-none"
                                placeholder="Rédigez votre email de bienvenue..."
                             />
                             <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <p className="text-[10px] text-indigo-700 font-medium">✨ Astuce : Utilisez <span className="bg-white px-1.5 rounded text-indigo-600 font-bold">&#123;firstName&#125;</span> pour personnaliser.</p>
                             </div>
                          </div>

                          {/* Visual Preview */}
                          <div className="space-y-4">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperçu Réel (Client)</label>
                             <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100/50 bg-white">
                                <div className="bg-slate-900 px-6 py-8 text-center">
                                   <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-md">
                                      <Briefcase className="text-white" size={24} />
                                   </div>
                                   <h3 className="text-white font-bold text-lg tracking-tight">VOTRE CABINET</h3>
                                </div>
                                <div className="p-8 space-y-6">
                                   <div className="space-y-2">
                                      <h4 className="text-xl font-black text-slate-900">Confirmation de Réservation</h4>
                                      <p className="text-sm text-slate-600 leading-relaxed">
                                         {localEmail.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage').replace(/{date}/g, '19/04').replace(/{time}/g, '14:30')}
                                      </p>
                                   </div>
                                   
                                   <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">Soin</span>
                                         <span className="text-xs font-bold text-slate-900">Massage Relaxant</span>
                                      </div>
                                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Heure</span>
                                         <span className="text-xs font-bold text-slate-900">19 Avril à 14:30</span>
                                      </div>
                                   </div>

                                   <button className="w-full py-4 bg-indigo-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                                      <Clock size={16} /> Ajouter au calendrier
                                   </button>
                                   
                                   <p className="text-[10px] text-center text-slate-400 font-medium">Cabinet Thérapeutique · Avenue de la Gare 12, Genève</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'objectives' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                   <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                       <Target size={18} className="text-emerald-600" /> Objectif Financier
                    </h2>
                    <p className="text-xs text-slate-500">Définissez votre objectif de chiffre d'affaires mensuel.</p>
                  </div>

                  <div className="space-y-4 max-w-xs">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant cible (CHF)</label>
                     <div className="relative">
                        <input 
                          type="number"
                          value={localGoal}
                          onChange={(e) => setLocalGoal(e.target.value)}
                          className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-lg font-black text-slate-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">CHF</span>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'cabinet' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                   <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                       <Briefcase size={18} className="text-slate-600" /> Informations Professionnelles
                    </h2>
                    <p className="text-xs text-slate-500">Ces informations apparaîtront sur vos factures PDF.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom du Cabinet</label>
                        <input 
                          value={localCabinetName} 
                          onChange={(e) => setLocalCabinetName(e.target.value)}
                          placeholder="Ex: Cabinet Zen"
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none focus:bg-white transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Professionnel</label>
                        <input 
                          value={localCabinetEmail} 
                          onChange={(localE) => setLocalCabinetEmail(localE.target.value)}
                          placeholder="votre@email.com"
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none focus:bg-white transition-all" 
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adresse Complète</label>
                      <input 
                        value={localCabinetAddress} 
                        onChange={(e) => setLocalCabinetAddress(e.target.value)}
                        placeholder="Rue du Lac 12, 1200 Genève"
                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none focus:bg-white transition-all" 
                      />
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium font-medium">Ces informations seront utilisées pour générer automatiquement vos factures PDF.</p>
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
