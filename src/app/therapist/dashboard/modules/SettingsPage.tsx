'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Target, MessageSquare, Info, User, Mail, Store, Shield, 
  CheckCircle2, Bell, Smartphone, Lock, LogOut, ChevronRight,
  Zap, Heart, CreditCard, Sparkles, Save, Trash2, ArrowRight
} from 'lucide-react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';

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
  fullName?: string;
  profileEmail?: string;
  phone?: string;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifySms?: boolean;
  onUpdateMetadata: (data: any) => void;
  searchQuery: string;
}

const DEFAULT_REMINDER      = "Bonjour {firstName}, petit rappel concernant le paiement de votre séance {service} du {date}. Montant restant: {price} CHF. Merci beaucoup.";
const DEFAULT_CONFIRMATION  = "Bonjour {firstName}, votre rendez-vous pour {service} est confirmé le {date} à {time}. Au plaisir de vous accueillir.";
const DEFAULT_FOLLOWUP      = "Bonjour {firstName}, j'espère que vous vous sentez bien après votre séance. Pensez à bien vous hydrater aujourd'hui.";
const DEFAULT_EMAIL         = "Bonjour {firstName}, votre rendez-vous est confirmé pour le {date} à {time}. Bien à vous.";

export default function SettingsPage({
  monthlyGoal, reminderTemplate, confirmationTemplate, followupTemplate,
  emailTemplate, emailEnabled, cabinetName, cabinetAddress, cabinetEmail,
  fullName = 'João Silva', profileEmail = 'joao.silva@sereneholistic.com', phone = '+351 912 345 678',
  notifyEmail = true, notifyPush = true, notifySms = false,
  onUpdateMetadata, searchQuery,
}: SettingsPageProps) {
  // Existing states
  const [localGoal,          setLocalGoal]          = useState(monthlyGoal.toString());
  const [localTemplate,      setLocalTemplate]      = useState(reminderTemplate     || DEFAULT_REMINDER);
  const [localConfirmation,  setLocalConfirmation]  = useState(confirmationTemplate || DEFAULT_CONFIRMATION);
  const [localFollowup,      setLocalFollowup]      = useState(followupTemplate     || DEFAULT_FOLLOWUP);
  const [localEmail,         setLocalEmail]         = useState(emailTemplate        || DEFAULT_EMAIL);
  const [localEmailEnabled,  setLocalEmailEnabled]  = useState(emailEnabled);
  const [localCabinetName,   setLocalCabinetName]   = useState(cabinetName);
  const [localCabinetEmail,  setLocalCabinetEmail]  = useState(cabinetEmail);
  const [localCabinetAddress,setLocalCabinetAddress]= useState(cabinetAddress);
  
  // New profile states
  const [localFullName, setLocalFullName] = useState(fullName);
  const [localProfileEmail, setLocalProfileEmail] = useState(profileEmail);
  const [localPhone, setLocalPhone] = useState(phone);
  
  // Notification toggles
  const [localNotifyEmail, setLocalNotifyEmail] = useState(notifyEmail);
  const [localNotifyPush, setLocalNotifyPush] = useState(notifyPush);
  const [localNotifySms, setLocalNotifySms] = useState(notifySms);

  const auth = useAuth();
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = async () => {
    if (!user || !user.email) return;
    if (!currentPassword || !newPassword) return alert("Veuillez remplir les deux champs.");
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Mot de passe mis à jour avec succès.");
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      alert("Erreur lors de la mise à jour: " + e.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      alert("Erreur de déconnexion: " + e.message);
    }
  };

  const [activeTab,          setActiveTab]          = useState('account');
  const [saveState,          setSaveState]          = useState<'idle' | 'saving' | 'saved'>('idle');
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const buildMetadataPayload = () => ({
      monthlyGoal: parseInt(localGoal),
      reminderTemplate: localTemplate,
      confirmationTemplate: localConfirmation,
      followupTemplate: localFollowup,
      emailTemplate: localEmail,
      emailEnabled: localEmailEnabled,
      cabinetName: localCabinetName,
      cabinetEmail: localCabinetEmail,
      cabinetAddress: localCabinetAddress,
      fullName: localFullName,
      profileEmail: localProfileEmail,
      phone: localPhone,
      notifyEmail: localNotifyEmail,
      notifyPush: localNotifyPush,
      notifySms: localNotifySms,
    });

  const persistedMetadata = useMemo(
    () => ({
      monthlyGoal,
      reminderTemplate: reminderTemplate || DEFAULT_REMINDER,
      confirmationTemplate: confirmationTemplate || DEFAULT_CONFIRMATION,
      followupTemplate: followupTemplate || DEFAULT_FOLLOWUP,
      emailTemplate: emailTemplate || DEFAULT_EMAIL,
      emailEnabled,
      cabinetName,
      cabinetEmail,
      cabinetAddress,
      fullName,
      profileEmail,
      phone,
      notifyEmail,
      notifyPush,
      notifySms,
    }),
    [
      monthlyGoal,
      reminderTemplate,
      confirmationTemplate,
      followupTemplate,
      emailTemplate,
      emailEnabled,
      cabinetName,
      cabinetEmail,
      cabinetAddress,
      fullName,
      profileEmail,
      phone,
      notifyEmail,
      notifyPush,
      notifySms,
    ],
  );

  const TABS = [
    { id: 'account',     label: 'Compte',     icon: User },
    { id: 'whatsapp',    label: 'WhatsApp',   icon: MessageSquare },
    { id: 'email',       label: 'Emails',     icon: Mail },
    { id: 'cabinet',     label: 'Cabinet',    icon: Store },
    { id: 'objectives',  label: 'Objectifs',  icon: Target },
  ];
  
  const whatsappFields = [
    { label: 'Relance paiement', val: localTemplate, set: setLocalTemplate, preset: DEFAULT_REMINDER },
    { label: 'Confirmation RDV', val: localConfirmation, set: setLocalConfirmation, preset: DEFAULT_CONFIRMATION },
    { label: 'Suivi après séance', val: localFollowup, set: setLocalFollowup, preset: DEFAULT_FOLLOWUP },
  ];
  const cabinetFields = [
    { label: 'Nom Public', value: localCabinetName, set: setLocalCabinetName, full: false },
    { label: 'Email Contact', value: localCabinetEmail, set: setLocalCabinetEmail, full: false },
    { label: 'Coordonnées Facturation', value: localCabinetAddress, set: setLocalCabinetAddress, full: true },
  ];

  const matchingTabs = useMemo(() => {
    if (!normalizedSearch) return TABS.map((tab) => tab.id);

    const searchIndex: Record<string, string[]> = {
      account: ['compte', 'sécurité', 'notifications', 'mot de passe', 'profil', 'personnel'],
      whatsapp: ['whatsapp', 'messages rapides', 'relance paiement', 'confirmation rdv', 'suivi après séance'],
      email: ['email', 'emails', 'communication', "modèle de corps d'email"],
      cabinet: ['cabinet', 'entité cabinet', 'nom public', 'email contact', 'coordonnées facturation'],
      objectives: ['objectifs', 'performance cible', 'objectif ca mensuel', 'business strategy'],
    };

    return TABS
      .filter((tab) => [tab.label, ...(searchIndex[tab.id] || [])].join(' ').toLowerCase().includes(normalizedSearch))
      .map((tab) => tab.id);
  }, [normalizedSearch]);

  useEffect(() => {
    if (!normalizedSearch || matchingTabs.includes(activeTab)) return;
    if (matchingTabs[0]) setActiveTab(matchingTabs[0]);
  }, [activeTab, matchingTabs, normalizedSearch]);

  useEffect(() => {
    const payload = buildMetadataPayload();
    if (JSON.stringify(payload) === JSON.stringify(persistedMetadata)) {
      setSaveState('idle');
      return;
    }

    setSaveState('saving');

    const timeout = window.setTimeout(() => {
      onUpdateMetadata(payload);
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1800);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [
    localCabinetAddress,
    localCabinetEmail,
    localCabinetName,
    localConfirmation,
    localEmail,
    localEmailEnabled,
    localFollowup,
    localFullName,
    localGoal,
    localNotifyEmail,
    localNotifyPush,
    localNotifySms,
    localPhone,
    localProfileEmail,
    localTemplate,
    onUpdateMetadata,
    persistedMetadata,
  ]);

  const filteredWhatsappFields = useMemo(
    () => whatsappFields.filter((field) => !normalizedSearch || field.label.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, whatsappFields],
  );

  const filteredCabinetFields = useMemo(
    () => cabinetFields.filter((field) => !normalizedSearch || field.label.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, cabinetFields],
  );

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFB] h-full overflow-hidden text-neutral-900 scrollbar-hide">
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="max-w-[800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
            {/* Sidebar Navigation */}
            <aside className="space-y-3 sticky top-0">
               <nav className="space-y-1">
                  {TABS.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`w-full flex items-center justify-between h-8 px-2.5 rounded-lg transition-all group ${
                          isActive 
                            ? 'bg-neutral-900 text-white shadow-sm z-10' 
                            : 'bg-white border border-neutral-100 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                           <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                             isActive ? 'bg-white/10 text-white' : 'bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white'
                           }`}>
                              <Icon size={11} strokeWidth={2.5} />
                           </div>
                           <span className="text-[9px] font-bold tracking-tight uppercase">{t.label}</span>
                        </div>
                        {isActive && <ChevronRight size={8} strokeWidth={3} />}
                      </button>
                    );
                  })}
               </nav>

               <div className="bg-neutral-900 rounded-xl p-3 text-white shadow-lg space-y-2 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                     <Shield size={40} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                     <h4 className="text-[7px] font-bold uppercase tracking-[0.4em] text-white/40 mb-0.5">SÉCURITÉ</h4>
                     <p className="text-[10px] font-bold tracking-tight leading-tight">Accès cabinet</p>
                  </div>
                  <button onClick={handleDisconnect} className="relative z-10 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-white transition-all">
                     <LogOut size={10} strokeWidth={3} /> Déconnexion
                  </button>
               </div>

               {/* Saving Indicator */}
                <AnimatePresence mode="wait">
                  {saveState !== 'idle' && (
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] shadow-lg ${
                         saveState === 'saving' ? 'bg-neutral-900 text-white' : 'bg-emerald-500 text-white'
                       }`}
                     >
                       {saveState === 'saving' ? <Zap size={10} className="animate-pulse" /> : <CheckCircle2 size={10} />}
                       {saveState === 'saving' ? 'Synchro...' : 'Enregistré'}
                     </motion.div>
                  )}
                </AnimatePresence>
            </aside>

            {/* Content Area */}
            <div className="space-y-4 min-h-[500px]">
               <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                 >
                    {activeTab === 'account' && (
                       <div className="space-y-3">
                          <SectionHeader title="Compte" subtitle="Accès essentiel" />
                          <div className="bg-white rounded-xl p-3 border border-neutral-100 shadow-sm">
                             <InlineEditableField
                                placeholder="Email"
                                value={localProfileEmail}
                                onChange={setLocalProfileEmail}
                                type="email"
                             />
                          </div>

                          <div className="bg-neutral-900 rounded-xl p-4 text-white shadow-xl space-y-4 border border-white/5">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <InlineEditableFieldDark
                                   placeholder="Mot de passe actuel"
                                   value={currentPassword}
                                   onChange={setCurrentPassword}
                                   type="password"
                                />
                                <InlineEditableFieldDark
                                   placeholder="Nouveau mot de passe"
                                   value={newPassword}
                                   onChange={setNewPassword}
                                   type="password"
                                />
                             </div>
                             <button onClick={handleUpdatePassword} className="h-8 px-4 rounded-lg bg-white text-neutral-900 font-bold text-[9px] uppercase tracking-[0.2em] hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <Lock size={12} strokeWidth={3} /> METTRE À JOUR LE MOT DE PASSE
                             </button>
                          </div>
                       </div>
                    )}

                    {activeTab === 'whatsapp' && (
                       <div className="space-y-3">
                          <SectionHeader title="Modèles WhatsApp" subtitle="Automatisation des messages patients" />
                          <div className="space-y-3">
                             {filteredWhatsappFields.map((item, i) => (
                                <div key={i} className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-4 items-start">
                                   <div className="space-y-1.5">
                                      <div className="flex items-center justify-between px-1">
                                         <label className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-neutral-400">{item.label}</label>
                                         <button onClick={() => item.set(item.preset)} className="text-[7px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-[0.1em]">Réinitialiser</button>
                                      </div>
                                      <InlineEditableTextarea
                                        placeholder={item.label}
                                        value={item.val}
                                        onChange={item.set}
                                        rows={3}
                                      />
                                      <div className="flex items-center gap-2 px-1 opacity-50">
                                         <Info size={10} className="text-neutral-400" />
                                         <p className="text-[7px] font-bold uppercase tracking-[0.1em]">Variables : {'{firstName}, {date}, {time}, {service}, {price}'}</p>
                                      </div>
                                   </div>
                                   <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none p-3 shadow-sm relative group hover:-translate-y-0.5 transition-all">
                                      <p className="text-[10px] font-medium text-neutral-800 leading-relaxed">
                                         {item.val.replace(/{firstName}/g,'Patient').replace(/{service}/g,'Soin Holistique').replace(/{date}/g,'Demain').replace(/{price}/g,'120').replace(/{time}/g,'10:00')}
                                      </p>
                                      <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                                         <span className="text-[7px] font-bold">10:45</span>
                                         <CheckCircle2 size={10} strokeWidth={2.5} />
                                      </div>
                                      <div className="absolute top-0 right-[-5px] w-0 h-0 border-t-[8px] border-t-[#DCF8C6] border-r-[8px] border-r-transparent"></div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === 'email' && (
                       <div className="space-y-3">
                          <SectionHeader title="Service Emailing" subtitle="Communications officielles par courriel" />
                          <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm space-y-4 relative overflow-hidden">
                             <div className="flex items-center justify-between relative z-10">
                                <div>
                                   <h4 className="text-[9.5px] font-bold tracking-tight text-neutral-900 uppercase">Module d'expédition</h4>
                                   <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-neutral-300 mt-0.5">STATUT : {localEmailEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}</p>
                                </div>
                                <button onClick={() => setLocalEmailEnabled(!localEmailEnabled)} className={`w-8 h-4 rounded-full relative transition-all shadow-inner ${localEmailEnabled ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                                   <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-md transition-all ${localEmailEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                </button>
                             </div>
                             <div className={`space-y-3 transition-all duration-700 ${localEmailEnabled ? 'opacity-100' : 'opacity-30 blur-sm pointer-events-none translate-y-2'}`}>
                                <div className="space-y-1.5">
                                   <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-1">CORPS DU MESSAGE TYPE</label>
                                   <InlineEditableTextarea
                                      placeholder="Corps du message type"
                                      value={localEmail}
                                      onChange={setLocalEmail}
                                      rows={4}
                                      variant="soft"
                                   />
                                </div>
                                <div className="flex items-start gap-2 p-3 bg-neutral-900 text-white rounded-xl shadow-lg">
                                   <Sparkles size={14} className="shrink-0 text-emerald-400" />
                                   <p className="text-[9px] font-bold leading-normal text-white/70 uppercase tracking-tight">Le système injectera automatiquement votre charte graphique Serenity.</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'cabinet' && (
                       <div className="space-y-3">
                          <SectionHeader title="Identité du Cabinet" subtitle="Informations légales et administratives" />
                          <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredCabinetFields.map(f => (
                                   <div key={f.label} className={`space-y-1 ${f.full ? 'md:col-span-2' : ''}`}>
                                      <label className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-1">{f.label}</label>
                                      {f.full ? (
                                        <InlineEditableTextarea
                                          placeholder={f.label}
                                          value={f.value}
                                          onChange={f.set}
                                          rows={2}
                                          variant="soft"
                                        />
                                      ) : (
                                        <InlineEditableField
                                          placeholder={f.label}
                                          value={f.value}
                                          onChange={f.set}
                                        />
                                      )}
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'objectives' && (
                       <div className="space-y-3">
                          <SectionHeader title="Performance & Objectifs" subtitle="Ambitions financières mensuelles" />
                          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm text-center relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                <Target size={60} strokeWidth={1} />
                             </div>
                             <div className="relative z-10 max-w-[260px] mx-auto space-y-2">
                                <label className="text-[7.5px] font-bold uppercase tracking-[0.4em] text-neutral-400 leading-none block">CHIFFRE D'AFFAIRE MENSUEL CIBLE</label>
                                <div className="relative inline-block group/input">
                                   <InlineEditableField
                                      placeholder="0"
                                      value={localGoal}
                                      onChange={setLocalGoal}
                                      type="number"
                                      align="center"
                                      className="h-10 bg-transparent px-0 text-xl font-black tabular-nums tracking-tighter hover:bg-transparent"
                                      editingClassName="h-10 rounded-none border-0 border-b border-neutral-900 bg-transparent px-0 text-center text-xl font-black tabular-nums tracking-tighter shadow-none"
                                   />
                                   <p className="mt-0 text-[7px] font-bold uppercase tracking-[0.3em] text-neutral-900 opacity-30">FRANCS SUISSES / MOIS</p>
                                   <div className="h-1 w-full bg-neutral-50 rounded-full mt-3 overflow-hidden shadow-inner">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        className="h-full bg-neutral-900"
                                      />
                                   </div>
                                </div>
                                <p className="text-[9px] font-bold text-neutral-400 leading-normal max-w-[180px] mx-auto uppercase tracking-widest">
                                   Influence vos KPIs affichés sur le tableau de bord.
                                </p>
                             </div>
                          </div>
                       </div>
                    )}
                 </motion.div>
               </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
   return (
      <div className="border-l-[1.5px] border-neutral-900 pl-2.5 py-0.5 mb-5">
         <h4 className="text-[10px] font-black tracking-tight text-neutral-900 leading-none uppercase">{title}</h4>
         <p className="text-[7.5px] font-bold uppercase tracking-[0.15em] text-neutral-400 mt-1 leading-none">{subtitle}</p>
      </div>
   );
}

function InlineEditableField({
   placeholder,
   value,
   onChange,
   type = 'text',
   align = 'left',
   className = '',
   editingClassName = '',
}: {
   placeholder: string,
   value: string,
   onChange: (v: string) => void,
   type?: string,
   align?: 'left' | 'center',
   className?: string,
   editingClassName?: string,
}) {
   const [editing, setEditing] = React.useState(false);
   const [draft, setDraft] = React.useState(value);

   React.useEffect(() => {
      setDraft(value);
   }, [value]);

   const commit = () => {
      setEditing(false);
      if (draft !== value) onChange(draft);
   };

   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') {
         setDraft(value);
         setEditing(false);
      }
   };

   return editing ? (
      <input
         autoFocus
         type={type}
         value={draft}
         onChange={e => setDraft(e.target.value)}
         onBlur={commit}
         onKeyDown={handleKey}
         placeholder={placeholder}
         className={`w-full h-8 px-3 rounded-full bg-neutral-50 border border-neutral-900 text-[9px] font-bold tracking-tight text-neutral-900 outline-none shadow-sm ${align === 'center' ? 'text-center' : ''} ${editingClassName}`}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`flex h-8 cursor-text items-center rounded-full bg-neutral-50 px-3 text-[9px] font-bold tracking-tight text-neutral-900 transition-all hover:bg-neutral-100 ${align === 'center' ? 'justify-center text-center' : ''} ${className}`}
      >
         <span className="truncate">
            {value || <span className="text-neutral-300">{placeholder}</span>}
         </span>
      </div>
   );
}

function InlineEditableTextarea({
   placeholder,
   value,
   onChange,
   rows = 3,
   variant = 'default',
}: {
   placeholder: string,
   value: string,
   onChange: (v: string) => void,
   rows?: number,
   variant?: 'default' | 'soft',
}) {
   const [editing, setEditing] = React.useState(false);
   const [draft, setDraft] = React.useState(value);

   React.useEffect(() => {
      setDraft(value);
   }, [value]);

   const commit = () => {
      setEditing(false);
      if (draft !== value) onChange(draft);
   };

   const baseView = variant === 'soft'
      ? 'bg-neutral-50 shadow-inner'
      : 'bg-white border border-neutral-100 shadow-sm';
   const baseEdit = variant === 'soft'
      ? 'bg-white ring-4 ring-neutral-900/5 shadow-inner'
      : 'bg-white border border-neutral-900 shadow-sm';

   return editing ? (
      <textarea
         autoFocus
         value={draft}
         onChange={(e) => setDraft(e.target.value)}
         onBlur={commit}
         rows={rows}
         placeholder={placeholder}
         className={`w-full rounded-xl p-3 text-[10px] font-medium text-neutral-900 outline-none resize-none leading-relaxed ${baseEdit}`}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`min-h-[88px] w-full cursor-text rounded-xl p-3 text-[10px] font-medium text-neutral-900 transition-all hover:-translate-y-0.5 ${baseView}`}
      >
         <p className="whitespace-pre-wrap leading-relaxed">
            {value || <span className="text-neutral-300">{placeholder}</span>}
         </p>
      </div>
   );
}

function InlineEditableFieldDark({
   placeholder,
   value,
   onChange,
   type = 'text',
}: {
   placeholder: string,
   value: string,
   onChange: (v: string) => void,
   type?: string,
}) {
   const [editing, setEditing] = React.useState(false);
   const [draft, setDraft] = React.useState(value);

   React.useEffect(() => {
      setDraft(value);
   }, [value]);

   const commit = () => {
      setEditing(false);
      if (draft !== value) onChange(draft);
   };

   const masked = value ? '•'.repeat(Math.min(Math.max(value.length, 6), 12)) : '';

   return editing ? (
      <input
         autoFocus
         type={type}
         value={draft}
         onChange={e => setDraft(e.target.value)}
         onBlur={commit}
         onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
               setDraft(value);
               setEditing(false);
            }
         }}
         placeholder={placeholder}
         className="w-full h-8 px-3 rounded-full bg-white/10 border border-white text-[9px] font-bold tracking-tight text-white placeholder:text-white/20 outline-none shadow-inner"
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className="flex h-8 cursor-text items-center rounded-full bg-white/5 px-3 text-[9px] font-bold tracking-tight text-white transition-all hover:bg-white/10"
      >
         <span className="truncate">
            {masked || <span className="text-white/20">{placeholder}</span>}
         </span>
      </div>
   );
}

function InputGroup({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, type?: string }) {
   return (
      <div className="space-y-1.5 group">
         <div className="flex items-center gap-2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors px-1">
            {icon && <div className="shrink-0 scale-[0.6] w-4 h-4 flex items-center justify-center">{icon}</div>}
            <label className="text-[7.5px] font-bold uppercase tracking-[0.2em] leading-none">{label}</label>
         </div>
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-8 px-3 rounded-full bg-white border border-neutral-100 text-[9px] font-bold tracking-tight text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-sm" 
         />
      </div>
   );
}

function InputGroupDark({ placeholder, value, onChange, type = 'text' }: { placeholder: string, value: string, onChange: (v: string) => void, type?: string }) {
   return (
      <div className="group">
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
            className="w-full h-8 px-3 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold tracking-tight text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white transition-all outline-none shadow-inner" 
         />
      </div>
   );
}

function ToggleItem({ label, desc, val, set }: { label: string, desc: string, val: boolean, set: (v: boolean) => void }) {
   return (
      <div className="flex items-center justify-between p-2 bg-white border border-neutral-100 rounded-xl shadow-sm group hover:border-neutral-900 transition-all">
         <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${val ? 'bg-neutral-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-300'}`}>
               <Bell size={9} strokeWidth={2.5} />
            </div>
            <div>
               <h5 className="text-[8px] font-bold tracking-tight text-neutral-900 leading-none uppercase">{label}</h5>
               <p className="text-[6.5px] font-bold uppercase tracking-[0.1em] text-neutral-300 mt-1 leading-none">{desc}</p>
            </div>
         </div>
         <button 
            onClick={() => set(!val)} 
            className={`w-7 h-4 rounded-full relative transition-all shadow-inner ${val ? 'bg-neutral-900' : 'bg-neutral-100'}`}
         >
            <motion.div 
               animate={{ x: val ? 14 : 2 }}
               className="w-2.5 h-2.5 bg-white rounded-full absolute top-1 shadow-md"
            />
         </button>
      </div>
   );
}
