'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Target, MessageSquare, Info, User, Mail, Store } from 'lucide-react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';

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
    <div className="flex-1 flex flex-col bg-[#faf9f7] h-full overflow-hidden text-[#1a1c1b] [font-family:'Manrope',sans-serif]">
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-6">
              <div className="flex items-center justify-end">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  saveState === 'saving'
                    ? 'bg-[#efeeec] text-[#747872]'
                    : saveState === 'saved'
                      ? 'bg-[#d4e8d2] text-[#435544]'
                      : 'bg-transparent text-transparent'
                }`}>
                  {saveState === 'saving' ? 'Enregistrement…' : saveState === 'saved' ? 'Enregistré automatiquement' : 'Statut'}
                </span>
              </div>
              
              {/* Desktop / Mobile Tab Navigation */}
              <div className="flex overflow-x-auto gap-2 border-b border-[#e9e8e6] pb-4 sticky top-0 bg-[#faf9f7] z-10 pt-2">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === t.id 
                        ? 'bg-[#efeeec] text-[#435544] border border-[#c3c8c0]' 
                        : 'text-[#747872] hover:bg-[#efeeec]/50 border border-transparent'
                    }`}
                  >
                    <t.icon size={16} strokeWidth={1.8} />
                    {t.label}
                  </button>
                ))}
              </div>

              {normalizedSearch && matchingTabs.length === 0 && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 text-sm text-[#747872] border border-[#efeeec]">
                  Aucun réglage ne correspond à « {searchQuery.trim()} ».
                </div>
              )}

              {/* ── ACCOUNT SETTINGS (from user HTML) ── */}
              {activeTab === 'account' && matchingTabs.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Personal Information */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec]">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#e3e2e0] pb-4">
                      <span className="material-symbols-outlined text-[#725a38]" style={{fontVariationSettings:"'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>person</span>
                      <h4 className="text-lg font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">Personal Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold">Full Name</label>
                        <input className="w-full bg-transparent border-0 border-b border-[#c3c8c0] py-2 text-[#1a1c1b] focus:ring-0 focus:border-[#435544] outline-none transition-colors" type="text" value={localFullName} onChange={(e) => setLocalFullName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold">Email Address</label>
                        <input className="w-full bg-transparent border-0 border-b border-[#c3c8c0] py-2 text-[#1a1c1b] focus:ring-0 focus:border-[#435544] outline-none transition-colors" type="email" value={localProfileEmail} onChange={(e) => setLocalProfileEmail(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold">Phone Number</label>
                        <input className="w-full bg-transparent border-0 border-b border-[#c3c8c0] py-2 text-[#1a1c1b] focus:ring-0 focus:border-[#435544] outline-none transition-colors" type="tel" value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec]">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#e3e2e0] pb-4">
                      <span className="material-symbols-outlined text-[#725a38]" style={{fontVariationSettings:"'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>notifications_active</span>
                      <h4 className="text-lg font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">Notification Preferences</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-[#1a1c1b]">Email Notifications</h5>
                          <p className="text-xs text-[#434842]">Receive weekly reports and appointment reminders via email.</p>
                        </div>
                        <button onClick={() => setLocalNotifyEmail(!localNotifyEmail)} className={`w-11 h-6 rounded-full relative transition-colors ${localNotifyEmail ? 'bg-[#435544]' : 'bg-[#e3e2e0]'}`}>
                          <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-transform ${localNotifyEmail ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-[#1a1c1b]">Push Notifications</h5>
                          <p className="text-xs text-[#434842]">Get instant updates on client messages and schedule changes.</p>
                        </div>
                        <button onClick={() => setLocalNotifyPush(!localNotifyPush)} className={`w-11 h-6 rounded-full relative transition-colors ${localNotifyPush ? 'bg-[#435544]' : 'bg-[#e3e2e0]'}`}>
                          <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-transform ${localNotifyPush ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-[#1a1c1b]">SMS Reminders</h5>
                          <p className="text-xs text-[#434842]">Emergency alerts and same-day appointment confirmations.</p>
                        </div>
                        <button onClick={() => setLocalNotifySms(!localNotifySms)} className={`w-11 h-6 rounded-full relative transition-colors ${localNotifySms ? 'bg-[#435544]' : 'bg-[#e3e2e0]'}`}>
                          <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-transform ${localNotifySms ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security & Connections */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec]">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#e3e2e0] pb-4">
                      <span className="material-symbols-outlined text-[#725a38]" style={{fontVariationSettings:"'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>shield</span>
                      <h4 className="text-lg font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">Security &amp; Connections</h4>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <h5 className="text-sm font-semibold text-[#1a1c1b] mb-4">Change Password</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                          <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-transparent border-0 border-b border-[#c3c8c0] py-2 text-[#1a1c1b] focus:ring-0 focus:border-[#435544] outline-none transition-colors placeholder:text-[#c3c8c0] text-sm" placeholder="Current password" type="password" />
                          <input value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-transparent border-0 border-b border-[#c3c8c0] py-2 text-[#1a1c1b] focus:ring-0 focus:border-[#435544] outline-none transition-colors placeholder:text-[#c3c8c0] text-sm" placeholder="New password" type="password" />
                        </div>
                        <button onClick={handleUpdatePassword} className="mt-4 text-xs font-bold text-[#435544] hover:underline uppercase tracking-wider">Update Password</button>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-[#1a1c1b] mb-4">Linked Accounts</h5>
                        <div className="flex items-center justify-between p-4 bg-[#f4f3f1] rounded-xl border border-[#e3e2e0]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
                              <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                              </svg>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Google Account</span>
                              <p className="text-[11px] text-[#434842]">Connected as {user?.email || 'joao.silva@gmail.com'}</p>
                            </div>
                          </div>
                          <button onClick={handleDisconnect} className="text-xs font-semibold text-[#ba1a1a] hover:underline uppercase tracking-widest">Disconnect</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── WHATSAPP ── */}
              {activeTab === 'whatsapp' && matchingTabs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-8 border-b border-[#e3e2e0] pb-4">
                    <h2 className="text-xl font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">WhatsApp Studio</h2>
                    <p className="text-sm text-[#434842] mt-1">Configurez les textes utilisés par les boutons WhatsApp. Les variables sont remplacées automatiquement.</p>
                  </div>
                  <div className="space-y-10">
                    {filteredWhatsappFields.map((item, i) => (
                      <div key={i} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold">{item.label}</label>
                            <button type="button" onClick={() => item.set(item.preset)}
                              className="text-[10px] uppercase tracking-wider text-[#435544] hover:underline font-semibold">
                              Défaut
                            </button>
                          </div>
                          <textarea value={item.val} onChange={e => item.set(e.target.value)} rows={4}
                            className="w-full bg-[#f4f3f1] border-none rounded-xl p-4 text-sm text-[#1a1c1b] focus:ring-2 focus:ring-[#435544]/20 outline-none transition-all resize-none" />
                          <p className="text-[10px] text-[#747872] leading-relaxed">
                            Variables : {'{firstName}'}, {'{date}'}, {'{time}'}, {'{service}'}, {'{price}'}
                          </p>
                        </div>
                        {/* Chat bubble preview */}
                        <div className="bg-[#e9e8e6] rounded-xl p-4 relative shadow-inner">
                          <div className="bg-[#dcf8c6] rounded-lg p-3 shadow-sm relative ml-4">
                            <p className="text-sm text-[#1a1c1b] leading-snug break-words">
                              {item.val.replace(/{firstName}/g,'Jean').replace(/{service}/g,'Massage').replace(/{date}/g,'21/04').replace(/{price}/g,'150').replace(/{time}/g,'14:30')}
                            </p>
                            <span className="text-[9px] text-[#747872] block text-right mt-1">14:20 ✓✓</span>
                            {/* Tail */}
                            <div className="absolute top-0 right-[-6px] w-0 h-0 border-t-[8px] border-t-[#dcf8c6] border-r-[8px] border-r-transparent"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {normalizedSearch && filteredWhatsappFields.length === 0 && (
                      <div className="p-4 text-sm text-[#747872] text-center bg-[#f4f3f1] rounded-xl">
                        Aucun modèle WhatsApp ne correspond à cette recherche.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── EMAIL ── */}
              {activeTab === 'email' && matchingTabs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-8 border-b border-[#e3e2e0] pb-4">
                    <div>
                      <h2 className="text-xl font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">Email Butler</h2>
                      <p className="text-sm text-[#434842] mt-1">Configuration de la communication par email automatisée.</p>
                    </div>
                    <button onClick={() => setLocalEmailEnabled(!localEmailEnabled)} className={`w-12 h-6 rounded-full relative transition-colors ${localEmailEnabled ? 'bg-[#435544]' : 'bg-[#e3e2e0]'}`}>
                      <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-transform ${localEmailEnabled ? 'translate-x-[26px]' : 'translate-x-[3px]'}`} />
                    </button>
                  </div>
                  <div className={`space-y-6 transition-all ${localEmailEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold">Modèle de corps d'email</label>
                      <textarea value={localEmail} onChange={e => setLocalEmail(e.target.value)} rows={6}
                        className="w-full bg-[#f4f3f1] border-none rounded-xl p-4 text-sm text-[#1a1c1b] focus:ring-2 focus:ring-[#435544]/20 outline-none transition-all resize-none" />
                    </div>
                    <div className="p-4 bg-[#f4f3f1] rounded-xl border border-[#e3e2e0] flex items-start gap-3 text-[#747872]">
                      <Info size={16} className="mt-0.5 shrink-0" />
                      <p className="text-xs">L'email inclura automatiquement votre logo et les détails du cabinet configurés dans la section Entité Cabinet.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CABINET ── */}
              {activeTab === 'cabinet' && matchingTabs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-8 border-b border-[#e3e2e0] pb-4">
                    <h2 className="text-xl font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">Entité Cabinet</h2>
                    <p className="text-sm text-[#434842] mt-1">Identité légale et publique de votre pratique.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {filteredCabinetFields.map(f => (
                      <div key={f.label} className={`space-y-2 ${f.full ? 'md:col-span-2' : ''}`}>
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold">{f.label}</label>
                        <input value={f.value} onChange={e => f.set(e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-[#c3c8c0] py-2 text-[#1a1c1b] focus:ring-0 focus:border-[#435544] outline-none transition-colors" />
                      </div>
                    ))}
                    {normalizedSearch && filteredCabinetFields.length === 0 && (
                      <div className="md:col-span-2 p-4 text-sm text-[#747872] text-center bg-[#f4f3f1] rounded-xl">
                        Aucun réglage cabinet ne correspond à cette recherche.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── OBJECTIVES ── */}
              {activeTab === 'objectives' && matchingTabs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-[#efeeec] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-8 border-b border-[#e3e2e0] pb-4">
                    <h2 className="text-xl font-medium text-[#435544] [font-family:'Public_Sans',sans-serif]">Performance Cible</h2>
                    <p className="text-sm text-[#434842] mt-1">Objectifs et stratégie business.</p>
                  </div>
                  <div className="max-w-md">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#747872] font-bold block mb-4">Objectif CA Mensuel</label>
                    <div className="relative">
                      <input type="number" value={localGoal} onChange={e => setLocalGoal(e.target.value)}
                        className="w-full bg-[#f4f3f1] border-none rounded-xl h-16 px-6 text-3xl font-semibold text-[#1a1c1b] focus:ring-2 focus:ring-[#435544]/20 outline-none transition-all tabular-nums" />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-[#747872] font-bold uppercase tracking-widest">CHF</span>
                    </div>
                    <p className="text-xs text-[#747872] mt-3">
                      Cet objectif alimente la jauge de progression sur le tableau de bord principal.
                    </p>
                  </div>
                </div>
              )}

            </div>
        </div>
      </main>
    </div>
  );
}
