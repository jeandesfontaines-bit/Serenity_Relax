'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit, Save, Camera, Heart, Calendar, Shield, Settings, Phone, Mail, MapPin, Sparkle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ClientProfil() {
  const router = useRouter();
  const { user, isUserLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const [sessionClientId, setSessionClientId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'security'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Profil state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Genève',
    notes: '',
  });

  useEffect(() => {
    setSessionClientId(sessionStorage.getItem('serenity_client_id'));
  }, []);

  const effectiveClientId = user?.uid || sessionClientId;

  useEffect(() => {
    async function fetchProfile() {
      if (!effectiveClientId || !firestore) return;
      try {
        const d = await getDoc(doc(firestore, 'clients', effectiveClientId));
        if (d.exists()) {
          const data = d.data();
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: user?.email || data.email || '',
            phone: data.phone || '',
            city: data.city || 'Genève',
            notes: data.notes || '',
          });
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      }
    }
    if (!userLoading && effectiveClientId) fetchProfile();
  }, [effectiveClientId, user, userLoading, firestore]);

  const handleSave = async () => {
    if (!effectiveClientId || !firestore) return;
    setUpdating(true);
    try {
      await updateDoc(doc(firestore, 'clients', effectiveClientId), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        city: profile.city,
        notes: profile.notes
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!effectiveClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="max-w-md glass-premium p-10">
          <h1 className="font-serif text-3xl font-light text-foreground">Mon Profil</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Connectez-vous pour gérer vos informations personnelles.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-8 premium-button button-fill rounded-full"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 pt-32 lg:px-8 lg:pt-40">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <button 
            onClick={() => router.push('/client/dashboard')} 
            className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
            Retour au Dashboard
          </button>

          {/* PROFILE HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-5xl font-serif text-primary border border-primary/10 transition-all duration-700 group-hover:rounded-2xl group-hover:bg-primary group-hover:text-white">
                  {profile.firstName?.[0] || profile.lastName?.[0] || '👤'}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-background p-3 rounded-xl shadow-lg border border-border hover:text-primary transition-colors">
                  <Camera size={18} />
                </button>
              </div>
              
              <div className="text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Profil Vérifié
                </div>
                <h1 className="text-5xl lg:text-7xl font-serif leading-none">
                  {profile.firstName || 'Ami'} <span className="italic opacity-40">{profile.lastName}</span>
                </h1>
              </div>
            </div>

            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={updating}
              className={`premium-button rounded-full px-10 py-5 ${isEditing ? 'button-fill' : 'button-outline'}`}
            >
              {updating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                isEditing ? <CheckCircle2 size={20} /> : <Edit size={20} />
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest ml-2">
                {updating ? 'Sauvegarde...' : isEditing ? 'Valider' : 'Éditer'}
              </span>
            </button>
          </header>

          {/* TABS */}
          <div className="flex bg-muted/20 p-1.5 rounded-full border border-border/50 overflow-x-auto scrollbar-hide">
            {[
              { id: 'info', label: 'Identité', icon: User },
              { id: 'preferences', label: 'Préférences', icon: Heart },
              { id: 'security', label: 'Sécurité', icon: Shield },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === t.id 
                    ? 'bg-background text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon size={16} className={activeTab === t.id ? 'text-primary' : 'text-muted-foreground/40'} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium p-10 lg:p-16"
          >
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Prénom</label>
                    <div className="relative">
                       <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                       <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full h-16 bg-muted/10 border border-border/50 rounded-2xl pl-14 pr-6 text-lg font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Nom</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full h-16 bg-muted/10 border border-border/50 rounded-2xl px-6 text-lg font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Email</label>
                    <div className="relative">
                       <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/20" />
                       <input type="email" value={profile.email} disabled className="w-full h-16 bg-muted/5 border border-border/20 rounded-2xl pl-14 pr-6 text-lg text-muted-foreground/40 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Téléphone</label>
                    <div className="relative">
                       <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                       <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full h-16 bg-muted/10 border border-border/50 rounded-2xl pl-14 pr-6 text-lg font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">Notes & Zones sensibles</label>
                  <textarea
                    value={profile.notes}
                    onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-muted/10 border border-border/50 rounded-3xl p-6 text-lg font-serif italic text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="Ex: Allergies, huiles préférées, zones de tension..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="py-12 text-center space-y-8">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl mx-auto flex items-center justify-center text-primary">
                    <Heart size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-serif text-foreground">Votre Rituel</h3>
                   <p className="text-muted-foreground max-w-sm mx-auto font-sans leading-relaxed">Ces détails nous aident à personnaliser votre accueil avant votre arrivée.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                   {['Massage Signature', 'Huile neutre', 'Ambiance zen', 'Pression moyenne'].map(p => (
                     <div key={p} className="p-6 bg-muted/5 border border-border/30 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-primary/70">{p}</div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-md mx-auto space-y-4">
                <button className="w-full py-5 px-8 border border-border/50 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all">
                   Réinitialiser le mot de passe
                </button>
                <button className="w-full py-5 px-8 border border-red-500/10 text-red-500/60 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/5 hover:text-red-500 transition-all">
                   Supprimer mon compte
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
