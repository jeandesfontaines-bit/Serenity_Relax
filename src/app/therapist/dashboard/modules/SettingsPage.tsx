'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Target, MessageSquare, User, Mail, Store, Shield, 
  CheckCircle2, LogOut, ChevronRight, Zap
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';

import { AccountSettings } from './settings/AccountSettings';
import { WhatsAppSettings } from './settings/WhatsAppSettings';
import EmailSettings from './settings/EmailSettings';
import CabinetSettings from './settings/CabinetSettings';
import ObjectivesSettings from './settings/ObjectivesSettings';

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

  const [activeTab,          setActiveTab]          = useState('account');
  const [saveState,          setSaveState]          = useState<'idle' | 'saving' | 'saved'>('idle');
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const handleDisconnect = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      alert("Erreur de déconnexion: " + e.message);
    }
  };

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
      monthlyGoal, reminderTemplate, confirmationTemplate, followupTemplate,
      emailTemplate, emailEnabled, cabinetName, cabinetEmail, cabinetAddress,
      fullName, profileEmail, phone, notifyEmail, notifyPush, notifySms,
    ],
  );

  const TABS = [
    { id: 'account',     label: 'Compte',     icon: User },
    { id: 'whatsapp',    label: 'WhatsApp',   icon: MessageSquare },
    { id: 'email',       label: 'Emails',     icon: Mail },
    { id: 'cabinet',     label: 'Cabinet',    icon: Store },
    { id: 'objectives',  label: 'Objectifs',  icon: Target },
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
    localCabinetAddress, localCabinetEmail, localCabinetName, localConfirmation,
    localEmail, localEmailEnabled, localFollowup, localFullName, localGoal,
    localNotifyEmail, localNotifyPush, localNotifySms, localPhone, localProfileEmail,
    localTemplate, onUpdateMetadata, persistedMetadata,
  ]);

  const whatsappFields = useMemo(() => [
    { label: 'Relance paiement', val: localTemplate, set: setLocalTemplate, preset: DEFAULT_REMINDER },
    { label: 'Confirmation RDV', val: localConfirmation, set: setLocalConfirmation, preset: DEFAULT_CONFIRMATION },
    { label: 'Suivi après séance', val: localFollowup, set: setLocalFollowup, preset: DEFAULT_FOLLOWUP },
  ], [localTemplate, localConfirmation, localFollowup]);

  const filteredWhatsappFields = useMemo(
    () => whatsappFields.filter((field) => !normalizedSearch || field.label.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, whatsappFields],
  );

  return (
    <div className="flex-1 bg-transparent">
      <main className="mx-auto">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 items-start">
            {/* Sidebar Navigation */}
            <aside className="space-y-8 sticky top-0">
               <nav className="space-y-1.5">
                  {TABS.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`w-full flex items-center justify-between h-10 px-4 rounded-xl transition-all duration-300 group ${
                          isActive 
                            ? 'shadow-sm ring-1 ring-black/5 z-10' 
                            : 'border'
                        }`}
                        style={isActive ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' } : { background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                             isActive ? 'bg-white/20' : 'bg-[hsl(var(--muted)/0.5)]'
                           }`}>
                              <Icon size={12} strokeWidth={2.5} />
                           </div>
                           <span className="text-[10px] font-bold tracking-[0.05em]">{t.label}</span>
                        </div>
                        {isActive && <ChevronRight size={10} strokeWidth={3} className="opacity-50" />}
                      </button>
                    );
                  })}
               </nav>

               <div className="rounded-2xl p-5 text-white shadow-lg space-y-3 relative overflow-hidden group transition-transform duration-500 hover:scale-[1.02]" style={{ background: 'hsl(var(--primary))' }}>
                  <div className="absolute -top-4 -right-4 p-2 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                     <Shield size={60} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                     <p className="text-[9px] font-bold tracking-[0.15em] text-white/50 mb-1">Sécurité</p>
                     <h4 className="text-[13px] font-bold tracking-tight leading-tight">Accès cabinet</h4>
                  </div>
                  <button onClick={handleDisconnect} className="relative z-10 flex items-center gap-2 text-[10px] font-bold tracking-[0.05em] transition-all hover:translate-x-1" style={{ color: 'hsl(var(--destructive-foreground))' }}>
                     <LogOut size={12} strokeWidth={3} /> Déconnexion
                  </button>
               </div>

                <AnimatePresence mode="wait">
                  {saveState !== 'idle' && (
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-bold tracking-[0.05em] shadow-lg border border-white/10 text-primary-foreground ${
                          saveState === 'saving' ? 'bg-primary' : 'bg-emerald-500'
                        }`}
                      >
                       {saveState === 'saving' ? <Zap size={12} className="animate-pulse" /> : <CheckCircle2 size={12} />}
                       {saveState === 'saving' ? 'Synchronisation...' : 'Changements enregistrés'}
                     </motion.div>
                  )}
                </AnimatePresence>
            </aside>

            {/* Content Area */}
            <div className="space-y-6 min-h-[600px]">
               <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                 >
                    {activeTab === 'account' && (
                      <AccountSettings 
                        email={localProfileEmail} 
                        setEmail={setLocalProfileEmail} 
                      />
                    )}

                    {activeTab === 'whatsapp' && (
                      <WhatsAppSettings fields={filteredWhatsappFields} />
                    )}

                    {activeTab === 'email' && (
                      <EmailSettings 
                        enabled={localEmailEnabled}
                        onEnabledChange={setLocalEmailEnabled}
                        template={localEmail}
                        onTemplateChange={setLocalEmail}
                      />
                    )}

                    {activeTab === 'cabinet' && (
                      <CabinetSettings 
                        name={localCabinetName}
                        onNameChange={setLocalCabinetName}
                        email={localCabinetEmail}
                        onEmailChange={setLocalCabinetEmail}
                        address={localCabinetAddress}
                        onAddressChange={setLocalCabinetAddress}
                        searchQuery={searchQuery}
                      />
                    )}

                    {activeTab === 'objectives' && (
                      <ObjectivesSettings 
                        monthlyGoal={localGoal}
                        onMonthlyGoalChange={setLocalGoal}
                      />
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
