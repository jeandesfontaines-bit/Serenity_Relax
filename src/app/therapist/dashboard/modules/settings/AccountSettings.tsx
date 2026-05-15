import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useUser } from '@/firebase';
import { SectionHeader, InlineEditableField, InlineEditableFieldDark } from './SharedComponents';

interface AccountSettingsProps {
  email: string;
  setEmail: (email: string) => void;
}

export function AccountSettings({ email, setEmail }: AccountSettingsProps) {
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

  return (
    <div className="space-y-3">
      <SectionHeader title="Compte" subtitle="Accès essentiel" />
      <div className="rounded-xl p-3 border shadow-sm" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
        <InlineEditableField
          placeholder="Email"
          value={email}
          onChange={setEmail}
          type="email"
        />
      </div>

      <div className="rounded-xl p-4 shadow-xl space-y-4 border border-white/5" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
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
        <button 
          onClick={handleUpdatePassword} 
          className="h-8 px-4 rounded-lg font-bold text-[9px] tracking-[0.05em] hover:shadow-lg transition-all flex items-center justify-center gap-2" 
          style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
        >
          <Lock size={12} strokeWidth={3} /> Mettre à jour le mot de passe
        </button>
      </div>
    </div>
  );
}
