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
  onUpdateMetadata: (data: any) => void;
}

export default function SettingsPage({ 
  monthlyGoal, 
  reminderTemplate, 
  confirmationTemplate,
  followupTemplate,
  onUpdateMetadata 
}: SettingsPageProps) {
  const [localGoal, setLocalGoal] = useState(monthlyGoal.toString());
  const [localTemplate, setLocalTemplate] = useState(reminderTemplate);
  const [localConfirmation, setLocalConfirmation] = useState(confirmationTemplate);
  const [localFollowup, setLocalFollowup] = useState(followupTemplate);
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateMetadata({
      monthlyGoal: parseInt(localGoal),
      reminderTemplate: localTemplate,
      confirmationTemplate: localConfirmation,
      followupTemplate: localFollowup
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
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
                <div className="space-y-6">
                  {/* Template RELANCE */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Bell size={16} className="text-rose-500" /> Relance de Paiement
                      </h2>
                      <p className="text-[10px] text-slate-500">Envoyé pour les séances non réglées.</p>
                    </div>
                    <textarea
                      value={localTemplate}
                      onChange={(e) => setLocalTemplate(e.target.value)}
                      rows={3}
                      className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed"
                    />
                    <div className="text-[9px] text-slate-400 italic">Preview: "{localTemplate.replace(/{firstName}/g, 'Jean').replace(/{date}/g, '19/04').replace(/{price}/g, '150')}"</div>
                  </div>

                  {/* Template CONFIRMATION */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Confirmation de RDV
                      </h2>
                      <p className="text-[10px] text-slate-500">Envoyé juste après la prise de rendez-vous.</p>
                    </div>
                    <textarea
                      value={localConfirmation}
                      onChange={(e) => setLocalConfirmation(e.target.value)}
                      rows={3}
                      className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed"
                    />
                    <div className="text-[9px] text-slate-400 italic">Preview: "{localConfirmation.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage Relaxant').replace(/{date}/g, '19/04').replace(/{time}/g, '14:30')}"</div>
                  </div>

                  {/* Template SUIVI */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Smartphone size={16} className="text-blue-500" /> Suivi après Séance
                      </h2>
                      <p className="text-[10px] text-slate-500">Envoyé après le soin (remerciements + facture).</p>
                    </div>
                    <textarea
                      value={localFollowup}
                      onChange={(e) => setLocalFollowup(e.target.value)}
                      rows={3}
                      className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed"
                    />
                    <div className="text-[9px] text-slate-400 italic">Preview: "{localFollowup.replace(/{firstName}/g, 'Jean').replace(/{service}/g, 'Massage Relaxant')}"</div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-[10px] text-indigo-700 font-medium">Variables disponibles : <code className="bg-white px-1 rounded">&#123;firstName&#125;</code>, <code className="bg-white px-1 rounded">&#123;date&#125;</code>, <code className="bg-white px-1 rounded">&#123;time&#125;</code>, <code className="bg-white px-1 rounded">&#123;service&#125;</code>, <code className="bg-white px-1 rounded">&#123;price&#125;</code></p>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom du Cabinet</label>
                        <input disabled value="Cabinet Jean Desfontaines" className="w-full h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-400" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                        <input disabled value="jean.desfontaines@gmail.com" className="w-full h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-400" />
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 italic">La modification complète des infos du cabinet sera disponible dans la prochaine mise à jour.</p>
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
