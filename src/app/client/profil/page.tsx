'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit, Save, Camera, Heart, Calendar, Shield, Settings, Phone, Mail, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ClientProfil() {
  const { user, isUserLoading: userLoading } = useUser();
  const firestore = useFirestore();

  const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'history' | 'security'>('info');
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
    async function fetchProfile() {
      if (!user?.uid || !firestore) return;
      const d = await getDoc(doc(firestore, 'clients', user.uid));
      if (d.exists()) {
        const data = d.data();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: user.email || '',
          phone: data.phone || '',
          city: data.city || 'Genève',
          notes: data.notes || '',
        });
      }
    }
    if (!userLoading && user) fetchProfile();
  }, [user, userLoading, firestore]);

  const handleSave = async () => {
    if (!user?.uid || !firestore) return;
    setUpdating(true);
    try {
      await updateDoc(doc(firestore, 'clients', user.uid), {
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

  if (userLoading) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] to-white pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          
          {/* ── PROFILE HEADER IMPACT ── */}
          <motion.header 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 lg:mb-24"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-[#5F27CD] to-[#0ABDE3] rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl relative overflow-hidden transition-all duration-700 group-hover:rounded-[2rem]">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">{profile.lastName?.[0] || '👤'}</span>
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-[#5F27CD] border border-[#F8F5F0]">
                  <Camera size={20} />
                </button>
              </div>
              
              <div className="text-center md:text-left space-y-2">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#5F27CD] opacity-60">Status de Membre</p>
                <h1 className="text-5xl lg:text-7xl font-serif font-light leading-none tracking-tight">
                  {profile.firstName || 'Ami'} <span className="font-normal text-[#222F3E]">{profile.lastName}</span>
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                   <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Profil Vérifié
                   </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={updating}
              className={`btn-luxe flex items-center gap-4 px-10 py-6 shadow-2xl transition-all ${isEditing ? 'bg-[#222F3E]' : ''}`}
            >
              {updating ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                isEditing ? <CheckCircle2 size={20} /> : <Edit size={20} />
              )}
              <span className="text-[0.7rem] font-black uppercase tracking-widest">
                {updating ? 'Sauvegarde...' : isEditing ? 'Valider les Changements' : 'Éditer le Profil'}
              </span>
            </button>
          </motion.header>

          {/* ── TABS NAVIGATION ── */}
          <div className="flex border-b border-white/60 mb-12 overflow-x-auto scrollbar-hide bg-white/40 p-1.5 rounded-[2rem] border border-white backdrop-blur-md">
            {[
              { id: 'info', label: 'Identité', icon: User },
              { id: 'preferences', label: 'Rituels Préférés', icon: Heart },
              { id: 'history', label: 'Cheminement', icon: Calendar },
              { id: 'security', label: 'Accès & Sécurité', icon: Shield },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === t.id 
                    ? 'bg-white text-[#5F27CD] shadow-xl' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <t.icon size={16} className={activeTab === t.id ? 'text-[#0ABDE3]' : 'text-gray-300'} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── CONTENT AREA ── */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="dash-card p-10 lg:p-16"
          >
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="group">
                    <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] mb-3 block opacity-60">Prénom Souverain</label>
                    <div className="relative">
                       <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full h-18 bg-white/50 border border-white rounded-3xl pl-16 pr-8 text-xl font-serif font-medium text-[#222F3E] focus:outline-none focus:ring-8 focus:ring-indigo-50 shadow-sm transition-all disabled:opacity-70"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] mb-3 block opacity-60">Nom de Famille</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full h-18 bg-white/50 border border-white rounded-3xl px-8 text-xl font-serif font-medium text-[#222F3E] focus:outline-none focus:ring-8 focus:ring-indigo-50 shadow-sm transition-all disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] mb-3 block opacity-60">Adresse Électronique</label>
                    <div className="relative">
                       <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200" />
                       <input type="email" value={profile.email} disabled className="w-full h-18 bg-gray-50/50 border border-transparent rounded-3xl pl-16 pr-8 text-lg font-medium text-gray-400 cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] mb-3 block opacity-60">Contact Téléphonique</label>
                    <div className="relative">
                       <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full h-18 bg-white/50 border border-white rounded-3xl pl-16 pr-8 text-xl font-serif font-medium text-[#222F3E] focus:outline-none focus:ring-8 focus:ring-indigo-50 shadow-sm transition-all disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] mb-3 block opacity-60">Notes de Soin Personnalisées</label>
                  <textarea
                    value={profile.notes}
                    onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-white/50 border border-white rounded-[2rem] p-8 text-lg font-serif italic text-gray-600 focus:outline-none focus:ring-8 focus:ring-indigo-50 shadow-sm transition-all resize-none"
                    placeholder="Allergies, huiles préférées, zones sensibles..."
                  />
                </div>
              </div>
            )}

            {/* TAB PREF PLACEHOLDER */}
            {activeTab === 'preferences' && (
              <div className="py-20 text-center space-y-10">
                <div className="w-20 h-20 bg-[#F8F5F0] rounded-[2.5rem] mx-auto flex items-center justify-center text-[#5F27CD]">
                    <Heart size={40} />
                </div>
                <div>
                   <h3 className="text-3xl font-serif font-medium text-[#222F3E] mb-3">Vos Préférences Sensorielles</h3>
                   <p className="text-gray-400 max-w-sm mx-auto">Ces réglages nous permettent de préparer votre salle avant même votre arrivée.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {['Massage Sensoriel 90min', 'Huiles de Lavande', 'Ambiance Nature', 'Pression Modérée'].map(p => (
                     <div key={p} className="p-6 bg-white/40 border border-white rounded-[2rem] text-[0.65rem] font-bold uppercase tracking-widest text-[#5F27CD]">{p}</div>
                   ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-md mx-auto">
                <button className="w-full py-6 px-10 border border-gray-100 rounded-3xl text-[0.65rem] font-black uppercase tracking-widest text-gray-400 hover:text-[#5F27CD] hover:border-[#5F27CD]/20 hover:bg-white transition-all">
                   Changer mon mot de passe
                </button>
                <button className="w-full py-6 px-10 border border-red-50 text-red-400 rounded-3xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                   Déconnecter les autres appareils
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
