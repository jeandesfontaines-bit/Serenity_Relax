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
    [cabinetFields, normalizedSearch],
  );

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFB] h-full overflow-hidden text-neutral-900 scrollbar-hide">
      <main className="flex-1 overflow-y-auto p-12 lg:p-24 scrollbar-hide">
        <div className="max-w-[1400px] mx-auto space-y-20">
          
          {/* Header Status */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-12">
            <div>
               <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300 mb-2 leading-none">PARAMÈTRES SYSTÈME</p>
               <h1 className="text-6xl font-bold text-neutral-900 tracking-tighter leading-none">Configuration</h1>
            </div>
            <div className="flex items-center gap-6">
               <AnimatePresence mode="wait">
                 {saveState !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm ${
                        saveState === 'saving' ? 'bg-neutral-900 text-white animate-pulse' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {saveState === 'saving' ? <Zap size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {saveState === 'saving' ? 'Synchronisation...' : 'Modifications enregistrées'}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-24 items-start">
            
            {/* Sidebar Navigation */}
            <aside className="space-y-12 sticky top-0">
               <nav className="space-y-4">
                  {TABS.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`w-full flex items-center justify-between p-8 rounded-[2.5rem] transition-all group ${
                          isActive 
                            ? 'bg-neutral-900 text-white shadow-2xl scale-105 z-10' 
                            : 'bg-white border border-neutral-100 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                             isActive ? 'bg-white/10 text-white' : 'bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white'
                           }`}>
                              <Icon size={20} strokeWidth={2.5} />
                           </div>
                           <span className="text-xl font-bold tracking-tighter">{t.label}</span>
                        </div>
                        {isActive && <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />}
                      </button>
                    );
                  })}
               </nav>

               <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                     <Shield size={160} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-2">SÉCURITÉ</h4>
                     <p className="text-xl font-bold tracking-tighter leading-tight">Accès restreint & Chiffrement bout-en-bout</p>
                  </div>
                  <button onClick={handleDisconnect} className="relative z-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-white transition-all">
                     <LogOut size={14} strokeWidth={3} /> Se déconnecter
                  </button>
               </div>
            </aside>

            {/* Content Area */}
            <div className="space-y-24 min-h-[600px]">
               <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                 >
                    {activeTab === 'account' && (
                       <div className="space-y-16">
                          <SectionHeader title="Profil Personnel" subtitle="Identité et coordonnées de contact." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <InputGroup label="Nom Complet" value={localFullName} onChange={setLocalFullName} icon={<User />} />
                             <InputGroup label="Email Direct" value={localProfileEmail} onChange={setLocalProfileEmail} icon={<Mail />} type="email" />
                             <InputGroup label="Téléphone" value={localPhone} onChange={setLocalPhone} icon={<Smartphone />} type="tel" />
                          </div>

                          <SectionHeader title="Notifications" subtitle="Alertes et rapports de performance." />
                          <div className="grid grid-cols-1 gap-6">
                             <ToggleItem label="Rapports par Email" desc="Analyses hebdomadaires et bilans." val={localNotifyEmail} set={setLocalNotifyEmail} />
                             <ToggleItem label="Alertes Push" desc="Notifications instantanées sur mobile." val={localNotifyPush} set={setLocalNotifyPush} />
                             <ToggleItem label="Canal SMS" desc="Rappels critiques de dernière minute." val={localNotifySms} set={setLocalNotifySms} />
                          </div>

                          <SectionHeader title="Sécurité du Compte" subtitle="Gestion de vos accès confidentiels." />
                          <div className="bg-neutral-900 rounded-[3.5rem] p-12 text-white shadow-2xl space-y-10 border border-white/5">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroupDark label="Ancien Mot de Passe" value={currentPassword} onChange={setCurrentPassword} type="password" />
                                <InputGroupDark label="Nouveau Mot de Passe" value={newPassword} onChange={setNewPassword} type="password" />
                             </div>
                             <button onClick={handleUpdatePassword} className="h-16 px-10 rounded-full bg-white text-neutral-900 font-bold text-[11px] uppercase tracking-[0.3em] hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Lock size={16} strokeWidth={3} /> METTRE À JOUR LE MOT DE PASSE
                             </button>
                          </div>
                       </div>
                    )}

                    {activeTab === 'whatsapp' && (
                       <div className="space-y-16">
                          <SectionHeader title="Studio WhatsApp" subtitle="Configuration des messages automatiques." />
                          <div className="space-y-16">
                             {filteredWhatsappFields.map((item, i) => (
                                <div key={i} className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-12 items-start">
                                   <div className="space-y-6">
                                      <div className="flex items-center justify-between px-4">
                                         <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-300">{item.label}</label>
                                         <button onClick={() => item.set(item.preset)} className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-[0.2em]">Réinitialiser</button>
                                      </div>
                                      <textarea value={item.val} onChange={e => item.set(e.target.value)} rows={5} className="w-full p-10 rounded-[3rem] bg-white border border-neutral-100 text-lg font-medium text-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none resize-none leading-relaxed shadow-sm" />
                                      <div className="flex items-center gap-4 px-4 opacity-30">
                                         <Info size={14} className="text-neutral-400" />
                                         <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Variables : {'{firstName}, {date}, {time}, {service}, {price}'}</p>
                                      </div>
                                   </div>
                                   <div className="bg-[#DCF8C6] rounded-[3rem] rounded-tr-none p-8 shadow-xl relative group hover:-translate-y-1 transition-all">
                                      <p className="text-base font-medium text-neutral-800 leading-relaxed">
                                         {item.val.replace(/{firstName}/g,'Patient').replace(/{service}/g,'Soin').replace(/{date}/g,'Demain').replace(/{price}/g,'120').replace(/{time}/g,'10:00')}
                                      </p>
                                      <div className="flex items-center justify-end gap-2 mt-4 opacity-40">
                                         <span className="text-[10px] font-bold">10:45</span>
                                         <CheckCircle2 size={14} strokeWidth={2.5} />
                                      </div>
                                      <div className="absolute top-0 right-[-10px] w-0 h-0 border-t-[15px] border-t-[#DCF8C6] border-r-[15px] border-r-transparent"></div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === 'email' && (
                       <div className="space-y-16">
                          <SectionHeader title="Butler Email" subtitle="Automatisation des communications officielles." />
                          <div className="bg-white rounded-[3.5rem] p-12 border border-neutral-100 shadow-2xl space-y-12 relative overflow-hidden">
                             <div className="flex items-center justify-between relative z-10">
                                <div>
                                   <h4 className="text-2xl font-bold tracking-tighter text-neutral-900">Module d&apos;Expédition</h4>
                                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mt-2">ÉTAT DU SERVICE : {localEmailEnabled ? 'ACTIF' : 'INACTIF'}</p>
                                </div>
                                <button onClick={() => setLocalEmailEnabled(!localEmailEnabled)} className={`w-16 h-10 rounded-full relative transition-all shadow-inner ${localEmailEnabled ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                                   <div className={`w-8 h-8 bg-white rounded-full absolute top-1 shadow-md transition-all ${localEmailEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                             </div>
                             <div className={`space-y-10 transition-all duration-700 ${localEmailEnabled ? 'opacity-100' : 'opacity-30 blur-md pointer-events-none translate-y-4'}`}>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300 px-4">CORPS DE L&apos;EMAIL TYPE</label>
                                   <textarea value={localEmail} onChange={e => setLocalEmail(e.target.value)} rows={10} className="w-full p-12 rounded-[3.5rem] bg-neutral-50 border-none text-xl font-medium text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none resize-none leading-relaxed shadow-inner" />
                                </div>
                                <div className="flex items-start gap-6 p-8 bg-neutral-900 text-white rounded-[2.5rem] shadow-xl">
                                   <Sparkles size={24} className="shrink-0 text-white/50" />
                                   <p className="text-sm font-bold leading-relaxed text-white/60">Le système injectera automatiquement votre charte graphique et vos informations de cabinet lors de chaque envoi.</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'cabinet' && (
                       <div className="space-y-16">
                          <SectionHeader title="Identité Cabinet" subtitle="Informations légales et de facturation." />
                          <div className="bg-white rounded-[4rem] p-12 border border-neutral-100 shadow-2xl space-y-12">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {filteredCabinetFields.map(f => (
                                   <div key={f.label} className={`space-y-4 ${f.full ? 'md:col-span-2' : ''}`}>
                                      <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-300 px-4">{f.label}</label>
                                      {f.full ? (
                                        <textarea value={f.value} onChange={e => f.set(e.target.value)} rows={4} className="w-full p-10 rounded-[2.5rem] bg-neutral-50 border-none text-xl font-bold tracking-tighter text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none resize-none leading-relaxed shadow-inner" />
                                      ) : (
                                        <input value={f.value} onChange={e => f.set(e.target.value)} className="w-full h-16 px-10 rounded-full bg-neutral-50 border-none text-xl font-bold tracking-tighter text-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-inner" />
                                      )}
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'objectives' && (
                       <div className="space-y-16">
                          <SectionHeader title="Performance & Vision" subtitle="Stratégie et ambitions financières." />
                          <div className="bg-white rounded-[4rem] p-16 border border-neutral-100 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.1)] text-center relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                <Target size={200} strokeWidth={1} />
                             </div>
                             <div className="relative z-10 max-w-xl mx-auto space-y-16">
                                <label className="text-[11px] font-bold uppercase tracking-[0.5em] text-neutral-300 leading-none block">OBJECTIF CHIFFRE D&apos;AFFAIRE MENSUEL</label>
                                <div className="relative inline-block group/input">
                                   <input 
                                      type="number" 
                                      value={localGoal} 
                                      onChange={e => setLocalGoal(e.target.value)}
                                      className="w-full h-32 text-center text-9xl font-bold text-neutral-900 bg-transparent border-none outline-none tabular-nums tracking-tighter group-hover/input:scale-110 transition-transform" 
                                   />
                                   <p className="mt-6 text-[14px] font-bold uppercase tracking-[0.5em] text-neutral-900 opacity-40">FRANCS SUISSES / MOIS</p>
                                   <div className="h-2 w-full bg-neutral-50 rounded-full mt-10 overflow-hidden shadow-inner">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        className="h-full bg-neutral-900"
                                      />
                                   </div>
                                </div>
                                <p className="text-base font-bold text-neutral-300 leading-relaxed max-w-sm mx-auto uppercase tracking-widest text-[10px]">
                                   Ce curseur définit vos KPIs de performance et guide l&apos;évolution stratégique de votre cabinet Serenity.
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
      <div className="border-l-4 border-neutral-900 pl-8 py-2">
         <h4 className="text-4xl font-bold tracking-tighter text-neutral-900 leading-none">{title}</h4>
         <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-300 mt-3 leading-none">{subtitle}</p>
      </div>
   );
}

function InputGroup({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, type?: string }) {
   return (
      <div className="space-y-4 group">
         <div className="flex items-center gap-3 text-neutral-300 group-focus-within:text-neutral-900 transition-colors">
            {icon && <div className="shrink-0">{icon}</div>}
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] leading-none">{label}</label>
         </div>
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-16 px-8 rounded-full bg-white border border-neutral-100 text-lg font-bold tracking-tighter text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all outline-none shadow-sm" 
         />
      </div>
   );
}

function InputGroupDark({ label, value, onChange, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
   return (
      <div className="space-y-4 group">
         <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 px-4 leading-none">{label}</label>
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-16 px-8 rounded-full bg-white/5 border border-white/10 text-xl font-bold tracking-tighter text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white transition-all outline-none shadow-inner" 
         />
      </div>
   );
}

function ToggleItem({ label, desc, val, set }: { label: string, desc: string, val: boolean, set: (v: boolean) => void }) {
   return (
      <div className="flex items-center justify-between p-10 bg-white border border-neutral-50 rounded-[3rem] shadow-sm group hover:border-neutral-900 transition-all">
         <div className="flex items-center gap-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${val ? 'bg-neutral-900 text-white shadow-xl' : 'bg-neutral-50 text-neutral-300'}`}>
               <Bell size={24} strokeWidth={2.5} />
            </div>
            <div>
               <h5 className="text-xl font-bold tracking-tighter text-neutral-900 leading-none">{label}</h5>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mt-3 leading-none">{desc}</p>
            </div>
         </div>
         <button 
            onClick={() => set(!val)} 
            className={`w-16 h-10 rounded-full relative transition-all shadow-inner ${val ? 'bg-neutral-900' : 'bg-neutral-100'}`}
         >
            <motion.div 
               animate={{ x: val ? 28 : 4 }}
               className="w-8 h-8 bg-white rounded-full absolute top-1 shadow-md"
            />
         </button>
      </div>
   );
}
