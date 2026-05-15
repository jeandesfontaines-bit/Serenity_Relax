'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Camera, Heart, Shield, Phone, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
        const profileDoc = await getDoc(doc(firestore, 'clients', effectiveClientId));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
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
        console.error('Fetch profile error:', err);
      }
    }

    if (!userLoading && effectiveClientId) fetchProfile();
  }, [effectiveClientId, firestore, user, userLoading]);

  const handleSave = async () => {
    if (!effectiveClientId || !firestore) return;
    setUpdating(true);
    try {
      await updateDoc(doc(firestore, 'clients', effectiveClientId), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        city: profile.city,
        notes: profile.notes,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (userLoading) {
    return (
      <div className="landing-v2 flex min-h-screen items-center justify-center bg-[var(--off-white)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--teal-deep)]" />
      </div>
    );
  }

  if (!effectiveClientId) {
    return (
      <div className="landing-v2 flex min-h-screen items-center justify-center bg-[var(--landing-page-bg)] px-6 text-center">
        <div className="landing-surface-card max-w-md rounded-[2rem] p-10">
          <h1 className="landing-type-h3 landing-text-high display-tight">Mon profil</h1>
          <p className="landing-type-body-s landing-text-body mt-4">
            Connectez-vous pour gérer vos informations personnelles.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="landing-type-micro mt-8 inline-flex rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:scale-[1.01] hover:bg-[var(--orange)]"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Identité', icon: User },
    { id: 'preferences', label: 'Préférences', icon: Heart },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ] as const;

  const fieldClass =
    'landing-type-body w-full rounded-[1.35rem] border border-[var(--landing-tint)] bg-[var(--landing-panel-input)] px-5 py-4 text-[var(--landing-ink)] outline-none transition-all focus:border-[var(--teal-deep)] disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="landing-v2 min-h-screen pb-24" style={{ background: 'var(--landing-page-bg)' }}>
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-6 pt-28 md:px-10 lg:px-12 lg:pt-36">
        <div className="mx-auto max-w-5xl space-y-8">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="landing-type-caption inline-flex items-center gap-3 text-[var(--landing-muted)] transition-colors hover:text-[var(--teal-deep)]"
          >
            <ArrowLeft size={16} />
            Retour au dashboard
          </button>

          <header className="landing-surface-card flex flex-col gap-6 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-[var(--landing-tint-fill)] text-[2rem] text-[var(--teal-deep)]">
                  {profile.firstName?.[0] || profile.lastName?.[0] || 'A'}
                </div>
                <button className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--landing-tint)] bg-[var(--off-white)] text-[var(--landing-muted)] transition-colors hover:text-[var(--teal-deep)]">
                  <Camera size={16} />
                </button>
              </div>

              <div className="space-y-3 text-center md:text-left">
                <div className="landing-pill landing-pill-soft landing-type-caption inline-flex gap-2 border text-[var(--landing-warm)]">
                  <div className="h-2 w-2 rounded-full bg-[var(--orange)]" />
                  <span>Profil vérifié</span>
                </div>
                <h1 className="landing-type-h2 landing-text-high display-tight">
                  {profile.firstName || 'Ami'}{' '}
                  <span className="landing-display-italic text-[var(--landing-muted)]">{profile.lastName}</span>
                </h1>
              </div>
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={updating}
              className="landing-type-micro inline-flex items-center justify-center gap-3 rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:scale-[1.01] hover:bg-[var(--orange)] disabled:opacity-70"
            >
              {updating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEditing ? (
                <CheckCircle2 size={18} />
              ) : (
                <Edit size={18} />
              )}
              <span>{updating ? 'Sauvegarde...' : isEditing ? 'Valider' : 'Éditer'}</span>
            </button>
          </header>

          <div className="landing-surface-card flex gap-2 overflow-x-auto rounded-full p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`landing-type-caption inline-flex flex-1 items-center justify-center gap-3 rounded-full px-5 py-3.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--teal-deep)] text-white'
                    : 'text-[var(--landing-muted)] hover:bg-[var(--landing-tint-fill)] hover:text-[var(--teal-deep)]'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="landing-surface-card rounded-[2rem] p-6 md:p-8"
          >
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="landing-type-caption text-[var(--landing-warm)]">Prénom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--landing-muted)]" />
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditing}
                      className={`${fieldClass} pl-12`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="landing-type-caption text-[var(--landing-warm)]">Nom</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    disabled={!isEditing}
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-3">
                  <label className="landing-type-caption text-[var(--landing-warm)]">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--landing-muted)]" />
                    <input type="email" value={profile.email} disabled className={`${fieldClass} pl-12`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="landing-type-caption text-[var(--landing-warm)]">Téléphone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--landing-muted)]" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`${fieldClass} pl-12`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="landing-type-caption text-[var(--landing-warm)]">Ville</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    disabled={!isEditing}
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="landing-type-caption text-[var(--landing-warm)]">Notes & zones sensibles</label>
                  <textarea
                    value={profile.notes}
                    onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Allergies, huiles préférées, zones de tension..."
                    className={`${fieldClass} resize-none rounded-[1.6rem]`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6 py-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-[var(--landing-tint-fill)] text-[var(--orange)]">
                  <Heart size={34} />
                </div>
                <div className="space-y-3">
                  <h2 className="landing-type-h4 landing-text-high">Votre rituel</h2>
                  <p className="landing-type-body-s landing-text-body mx-auto max-w-md">
                    Ces repères nous aident à personnaliser votre accueil avant votre arrivée.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {['Massage Signature', 'Huile neutre', 'Ambiance zen', 'Pression moyenne'].map((item) => (
                    <div
                      key={item}
                      className="landing-surface-card rounded-[1.4rem] bg-[var(--landing-tint-fill)] px-5 py-5 text-center"
                    >
                      <p className="landing-type-caption text-[var(--landing-warm)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="mx-auto max-w-md space-y-4">
                <button className="landing-type-caption w-full rounded-[1.4rem] border border-[var(--landing-tint)] bg-[var(--off-white)] px-6 py-5 text-[var(--landing-warm)] transition-colors hover:border-[var(--teal-deep)] hover:text-[var(--teal-deep)]">
                  Réinitialiser le mot de passe
                </button>
                <button className="landing-type-caption w-full rounded-[1.4rem] border border-[rgba(241,102,77,0.22)] bg-[rgba(241,102,77,0.05)] px-6 py-5 text-[var(--orange)] transition-colors hover:bg-[rgba(241,102,77,0.1)]">
                  Supprimer mon compte
                </button>
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
}
