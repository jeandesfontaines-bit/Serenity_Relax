'use client';
import React, { useState } from 'react';
import { Bell, Target, Save, MessageSquare, Briefcase, ChevronRight, Info, CheckCircle2 } from 'lucide-react';

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

const DEFAULT_REMINDER      = "Bonjour {firstName}, petit rappel concernant le paiement de votre séance {service} du {date}. Montant restant: {price} CHF. Merci beaucoup.";
const DEFAULT_CONFIRMATION  = "Bonjour {firstName}, votre rendez-vous pour {service} est confirmé le {date} à {time}. Au plaisir de vous accueillir.";
const DEFAULT_FOLLOWUP      = "Bonjour {firstName}, j'espère que vous vous sentez bien après votre séance. Pensez à bien vous hydrater aujourd'hui.";
const DEFAULT_EMAIL         = "Bonjour {firstName}, votre rendez-vous est confirmé pour le {date} à {time}. Bien à vous.";

export default function SettingsPage({
  monthlyGoal, reminderTemplate, confirmationTemplate, followupTemplate,
  emailTemplate, emailEnabled, cabinetName, cabinetAddress, cabinetEmail,
  onUpdateMetadata,
}: SettingsPageProps) {
  const [localGoal,          setLocalGoal]          = useState(monthlyGoal.toString());
  const [localTemplate,      setLocalTemplate]      = useState(reminderTemplate     || DEFAULT_REMINDER);
  const [localConfirmation,  setLocalConfirmation]  = useState(confirmationTemplate || DEFAULT_CONFIRMATION);
  const [localFollowup,      setLocalFollowup]      = useState(followupTemplate     || DEFAULT_FOLLOWUP);
  const [localEmail,         setLocalEmail]         = useState(emailTemplate        || DEFAULT_EMAIL);
  const [localEmailEnabled,  setLocalEmailEnabled]  = useState(emailEnabled);
  const [localCabinetName,   setLocalCabinetName]   = useState(cabinetName);
  const [localCabinetEmail,  setLocalCabinetEmail]  = useState(cabinetEmail);
  const [localCabinetAddress,setLocalCabinetAddress]= useState(cabinetAddress);
  const [activeTab,          setActiveTab]          = useState('whatsapp');
  const [saved,              setSaved]              = useState(false);

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
      cabinetAddress: localCabinetAddress,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { id: 'whatsapp',    label: 'WhatsApp',   icon: MessageSquare },
    { id: 'email',       label: 'Emails',     icon: Bell },
    { id: 'cabinet',     label: 'Cabinet',    icon: Briefcase },
    { id: 'objectives',  label: 'Objectifs',  icon: Target },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f7] h-full overflow-hidden">

      {/* HEADER */}
      <header className="h-16 border-b border-zinc-100 bg-[#faf9f7] px-8 sm:px-12 flex items-center justify-between shrink-0">
        <div>
          <p className="font-serif text-[8px] tracking-[0.5em] text-zinc-400 uppercase mb-0.5">Module</p>
          <h1 className="font-serif text-base tracking-tighter text-zinc-900 uppercase">Réglages</h1>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2.5 h-10 px-6 font-serif text-[10px] tracking-[0.4em] uppercase transition-all duration-500 ${
            saved ? 'bg-zinc-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-700'
          }`}
        >
          {saved ? <CheckCircle2 size={14} strokeWidth={1.5} /> : <Save size={14} strokeWidth={1.5} />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* SIDEBAR */}
        <aside className="w-[220px] border-r border-zinc-100 flex flex-col pt-6 shrink-0 hidden lg:flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center justify-between px-7 py-4 font-serif text-[9px] tracking-[0.35em] uppercase transition-all duration-300 ${
                activeTab === t.id ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <t.icon size={14} strokeWidth={1.5} />
                {t.label}
              </div>
              {activeTab === t.id && <ChevronRight size={12} strokeWidth={1.5} />}
            </button>
          ))}
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile tab bar */}
          <div className="lg:hidden flex border-b border-zinc-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3 font-serif text-[9px] tracking-[0.3em] uppercase whitespace-nowrap border-b-2 transition-colors ${activeTab === t.id ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-w-[820px] mx-auto p-8 sm:p-12">

            {/* ── WHATSAPP ── */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-12">
                <div>
                  <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-2">Messages rapides</p>
                  <h2 className="font-serif text-3xl tracking-tighter text-zinc-900 uppercase">WhatsApp Studio</h2>
                  <p className="font-serif text-sm text-zinc-400 mt-3 leading-relaxed max-w-lg">
                    Configurez les textes utilisés par les boutons WhatsApp. Les variables sont remplacées automatiquement.
                  </p>
                </div>

                <div className="space-y-10">
                  {[
                    { label: 'Relance paiement',  val: localTemplate,     set: setLocalTemplate,     preset: DEFAULT_REMINDER },
                    { label: 'Confirmation RDV',  val: localConfirmation, set: setLocalConfirmation, preset: DEFAULT_CONFIRMATION },
                    { label: 'Suivi après séance', val: localFollowup,    set: setLocalFollowup,     preset: DEFAULT_FOLLOWUP },
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start border-t border-zinc-50 pt-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="font-serif text-[10px] tracking-[0.4em] uppercase text-zinc-900">{item.label}</label>
                          <button type="button" onClick={() => item.set(item.preset)}
                            className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors">
                            Défaut
                          </button>
                        </div>
                        <textarea value={item.val} onChange={e => item.set(e.target.value)} rows={4}
                          className="w-full bg-white border border-zinc-200 p-5 font-serif text-sm text-zinc-900 focus:border-zinc-900 outline-none transition-all resize-none" />
                        <p className="font-serif text-[10px] text-zinc-400 leading-relaxed">
                          Variables : {'{firstName}'}, {'{date}'}, {'{time}'}, {'{service}'}, {'{price}'}
                        </p>
                      </div>

                      {/* Chat bubble preview */}
                      <div className="bg-zinc-100 border border-zinc-200 p-4 pt-8 relative">
                        <div className="bg-white border border-zinc-100 p-4 shadow-sm relative">
                          <p className="font-serif text-sm text-zinc-900 leading-snug">
                            {item.val.replace(/{firstName}/g,'Jean').replace(/{service}/g,'Massage').replace(/{date}/g,'21/04').replace(/{price}/g,'150').replace(/{time}/g,'14:30')}
                          </p>
                          <span className="font-serif text-[9px] text-zinc-300 absolute bottom-1.5 right-2.5 uppercase tracking-wider">14:20 ✓✓</span>
                        </div>
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-zinc-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── EMAIL ── */}
            {activeTab === 'email' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-2">Communication</p>
                    <h2 className="font-serif text-3xl tracking-tighter text-zinc-900 uppercase">Email Butler</h2>
                  </div>
                  <button onClick={() => setLocalEmailEnabled(!localEmailEnabled)}
                    className={`w-14 h-7 p-1 transition-all duration-500 ${localEmailEnabled ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                    <div className={`w-5 h-5 bg-white transition-transform duration-300 ${localEmailEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className={`space-y-6 transition-all ${localEmailEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <div className="space-y-3">
                    <label className="font-serif text-[10px] tracking-[0.4em] uppercase text-zinc-900">Modèle de corps d'email</label>
                    <textarea value={localEmail} onChange={e => setLocalEmail(e.target.value)} rows={8}
                      className="w-full bg-white border border-zinc-200 p-6 font-serif text-sm text-zinc-900 focus:border-zinc-900 outline-none transition-all resize-none" />
                  </div>
                  <div className="p-5 bg-zinc-50 border border-zinc-100 flex items-center gap-4 text-zinc-600">
                    <Info size={16} strokeWidth={1.5} />
                    <p className="font-serif text-[11px] tracking-[0.1em]">L'email inclura automatiquement votre logo et les détails du cabinet configurés.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── OBJECTIVES ── */}
            {activeTab === 'objectives' && (
              <div className="space-y-10">
                <div>
                  <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-2">Business Strategy</p>
                  <h2 className="font-serif text-3xl tracking-tighter text-zinc-900 uppercase">Performance Cible</h2>
                </div>
                <div className="bg-white border border-zinc-100 p-10 space-y-5 max-w-md">
                  <label className="font-serif text-[10px] tracking-[0.4em] uppercase text-zinc-900">Objectif CA Mensuel</label>
                  <div className="relative">
                    <input type="number" value={localGoal} onChange={e => setLocalGoal(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 h-20 px-7 font-serif text-[42px] tracking-tighter text-zinc-900 outline-none focus:border-zinc-900 transition-all tabular-nums" />
                    <span className="absolute right-7 top-1/2 -translate-y-1/2 font-serif text-sm text-zinc-400 uppercase tracking-widest">CHF</span>
                  </div>
                  <p className="font-serif text-[11px] text-zinc-400 leading-relaxed">
                    Cet objectif alimente la barre de progression sur le tableau de bord principal.
                  </p>
                </div>
              </div>
            )}

            {/* ── CABINET ── */}
            {activeTab === 'cabinet' && (
              <div className="space-y-10">
                <div>
                  <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-2">Legal Identity</p>
                  <h2 className="font-serif text-3xl tracking-tighter text-zinc-900 uppercase">Entité Cabinet</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Nom Public',               value: localCabinetName,    set: setLocalCabinetName,    full: false },
                    { label: 'Email Contact',            value: localCabinetEmail,   set: setLocalCabinetEmail,   full: false },
                    { label: 'Coordonnées Facturation',  value: localCabinetAddress, set: setLocalCabinetAddress, full: true  },
                  ].map(f => (
                    <div key={f.label} className={`space-y-3 ${f.full ? 'md:col-span-2' : ''}`}>
                      <label className="font-serif text-[10px] tracking-[0.4em] uppercase text-zinc-900">{f.label}</label>
                      <input value={f.value} onChange={e => f.set(e.target.value)}
                        className="w-full h-12 bg-white border border-zinc-200 px-5 font-serif text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-all tracking-tight" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
