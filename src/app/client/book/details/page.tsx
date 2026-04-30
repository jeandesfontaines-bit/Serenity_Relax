'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Shield, Clock, Sparkles, Loader2, ChevronRight, MapPin, CalendarDays, User, Phone, Mail, FileText, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SERVICES } from '@/lib/types';

export default function BookingDetails() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    canton: '',
    notes: '',
    consent: false,
  });

  // Pre-fill from user data
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!form.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email valide requis';
    if (!form.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (!form.consent) newErrors.consent = 'Veuillez accepter les conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call / Firestore write
      if (firestore && user) {
        await addDoc(collection(firestore, 'appointments'), {
          clientId: user.uid,
          clientName: `${form.firstName} ${form.lastName}`,
          clientEmail: form.email,
          clientPhone: form.phone,
          address: `${form.address}, ${form.zip} ${form.city}, ${form.canton}`,
          notes: form.notes,
          serviceId: 'bambous-60', // Would come from booking flow state
          status: 'confirmed',
          startTime: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      }
      // Small delay for UX feel
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsSuccess(true);
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F7F7F2] pt-40 pb-32 px-6 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg w-full text-center space-y-10"
          >
            <div className="relative mx-auto w-28 h-28">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center"
              >
                <Check className="w-14 h-14 text-emerald-600" strokeWidth={1.5} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl font-serif font-bold text-neutral-900 leading-tight">
                Réservation Confirmée
              </h1>
              <p className="text-neutral-500 font-sans text-lg italic max-w-sm mx-auto">
                Votre moment de restauration est réservé. Un email de confirmation a été envoyé.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-neutral-100 text-left space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <p className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Séance</p>
                  <p className="text-lg font-serif font-bold text-neutral-900">Massage aux Bambous</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <p className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Détails</p>
                  <p className="font-sans font-bold text-neutral-900">60 min · 160 CHF</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push('/client/portal')}
                className="flex-1 rounded-full px-8 py-5 bg-neutral-900 text-white font-sans font-black uppercase tracking-[0.18em] text-[0.65rem] shadow-2xl shadow-neutral-900/10 hover:bg-neutral-800 transition-all"
              >
                Mon Espace
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-full px-8 py-5 border-2 border-neutral-200 text-neutral-900 font-sans font-black uppercase tracking-[0.18em] text-[0.65rem] hover:bg-neutral-50 transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F7F2] pt-36 pb-32 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Progress Stepper */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-20"
          >
            {[
              { step: 1, label: 'Sélection', done: true },
              { step: 2, label: 'Calendrier', done: true },
              { step: 3, label: 'Détails', active: true },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                {i > 0 && (
                  <div className={`h-[2px] w-16 sm:w-24 transition-all duration-700 ${s.done || s.active ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    s.done ? 'bg-neutral-900 text-white shadow-xl' :
                    s.active ? 'bg-neutral-900 text-white ring-4 ring-neutral-900/10 shadow-xl' :
                    'bg-neutral-100 text-neutral-400'
                  }`}>
                    {s.done ? <Check className="w-5 h-5" strokeWidth={2.5} /> : <span className="font-serif font-bold text-lg">{s.step}</span>}
                  </div>
                  <span className={`text-[9px] font-sans font-black uppercase tracking-[0.25em] ${
                    s.active ? 'text-neutral-900' : s.done ? 'text-neutral-500' : 'text-neutral-300'
                  }`}>
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="mb-12">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors mb-8 group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em]">Retour</span>
                </button>
                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-neutral-900 leading-[1.1] mb-4">
                  Finalisez votre<br />
                  <span className="text-neutral-400 italic font-light">réservation</span>
                </h1>
                <p className="text-neutral-500 font-sans text-lg italic max-w-lg">
                  Dernière étape avant votre moment de restauration. Vos informations restent confidentielles.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    label="Prénom"
                    value={form.firstName}
                    onChange={v => updateField('firstName', v)}
                    placeholder="Julian"
                    error={errors.firstName}
                  />
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    label="Nom"
                    value={form.lastName}
                    onChange={v => updateField('lastName', v)}
                    placeholder="Thorne"
                    error={errors.lastName}
                  />
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField
                    icon={<Mail className="w-4 h-4" />}
                    label="Adresse e-mail"
                    value={form.email}
                    onChange={v => updateField('email', v)}
                    placeholder="julian@example.com"
                    type="email"
                    error={errors.email}
                  />
                  <InputField
                    icon={<Phone className="w-4 h-4" />}
                    label="Téléphone"
                    value={form.phone}
                    onChange={v => updateField('phone', v)}
                    placeholder="+41 79 000 00 00"
                    type="tel"
                    error={errors.phone}
                  />
                </div>

                {/* Address */}
                <InputField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Adresse (Rue et numéro)"
                  value={form.address}
                  onChange={v => updateField('address', v)}
                  placeholder="Rue du Lac 5"
                />

                {/* City row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <InputField
                    label="Code Postal"
                    value={form.zip}
                    onChange={v => updateField('zip', v)}
                    placeholder="1215"
                  />
                  <InputField
                    label="Ville"
                    value={form.city}
                    onChange={v => updateField('city', v)}
                    placeholder="Genève"
                  />
                  <InputField
                    label="Canton"
                    value={form.canton}
                    onChange={v => updateField('canton', v)}
                    placeholder="GE"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 ml-1 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Notes ou demandes particulières
                    <span className="font-normal normal-case tracking-normal text-neutral-300 italic">(optionnel)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => updateField('notes', e.target.value)}
                    rows={4}
                    placeholder="Allergies, zones sensibles, préférences d'huiles..."
                    className="w-full bg-white border-2 border-transparent rounded-[1.5rem] px-8 py-6 text-lg font-serif text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900/10 focus:shadow-xl transition-all resize-none shadow-sm"
                  />
                </div>

                {/* Consent */}
                <div className="space-y-2">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      form.consent ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-200 group-hover:border-neutral-400'
                    }`}>
                      {form.consent && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={e => updateField('consent', e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-sm font-sans text-neutral-500 leading-relaxed">
                      J'accepte les <Link href="#" className="text-neutral-900 font-bold border-b border-neutral-900/20 hover:border-neutral-900 transition-colors">conditions générales</Link> et la{' '}
                      <Link href="#" className="text-neutral-900 font-bold border-b border-neutral-900/20 hover:border-neutral-900 transition-colors">politique de confidentialité</Link>.
                      Annulation gratuite jusqu'à 24h avant la séance.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-red-500 text-xs font-sans font-bold flex items-center gap-1 ml-10">
                      <AlertCircle className="w-3 h-3" /> {errors.consent}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-full px-10 py-6 bg-neutral-900 text-white font-sans font-black uppercase tracking-[0.18em] text-[0.65rem] shadow-2xl shadow-neutral-900/10 hover:bg-neutral-800 hover:shadow-3xl transition-all duration-500 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        Confirmer la Réservation
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Sidebar Summary */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 lg:sticky lg:top-36"
            >
              <div className="bg-white rounded-[3rem] shadow-2xl border border-neutral-100 overflow-hidden">
                {/* Service image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    alt="Massage aux bambous"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANpHouC1EYQFGTfeb3LQe-QMbFkeT2atbAuVo1IDyxIvaVbkdBz3v0_aJxWQOmc65zYMvBn7UI0-G9-Cni-K4Ke2pVy73kXg4zGgk8cc3dluLfEwQ-CGJqP5E53__NOQraCO2SPCawyNsYwqgJ_AJ4PjVWhiOTv-oR47pu-1Y3GuJNqqIX9jf4JPUK9YhC3hxb4mLhYNDf06H9EaZNtNcJEaHHclLCZhYKRBhHTUnlnDxR-2fBGq-zlJJP72GOtKFBtLJNxO0v_k0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                    <span className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-white/60">Votre sélection</span>
                    <h3 className="text-3xl font-serif font-bold text-white mt-1">Massage aux Bambous</h3>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  {/* Session details */}
                  <div className="space-y-5">
                    <DetailRow icon={<Clock className="w-4 h-4" />} label="Durée" value="60 minutes" />
                    <DetailRow icon={<CalendarDays className="w-4 h-4" />} label="Date" value="Jeudi, 24 oct. 2024" />
                    <DetailRow icon={<Clock className="w-4 h-4" />} label="Heure" value="14h30" />
                    <DetailRow icon={<MapPin className="w-4 h-4" />} label="Lieu" value="Cointrin, Genève" />
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-dashed border-neutral-100" />

                  {/* Price breakdown */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-sans">Séance</span>
                      <span className="font-serif font-bold text-neutral-900">160 CHF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-sans">TVA incluse</span>
                      <span className="text-neutral-400 font-sans text-sm">—</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                      <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Total</span>
                      <span className="text-3xl font-serif font-bold text-neutral-900">160 CHF</span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="bg-neutral-50 rounded-2xl p-5 flex items-center gap-4">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-sans text-neutral-500 leading-relaxed">
                      <span className="font-bold text-neutral-900">Confirmation instantanée.</span>{' '}
                      Annulation gratuite jusqu'à 24h avant. Paiement sécurisé.
                    </p>
                  </div>
                </div>
              </div>

              {/* Concierge help */}
              <div className="mt-8 p-6 bg-white/50 rounded-[2rem] border border-neutral-100 flex items-center gap-5 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Besoin d'aide ?</p>
                  <p className="text-sm font-sans text-neutral-600">Notre concierge est disponible.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-300" />
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  );
}


// ── Reusable Input Component ──
function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 ml-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border-2 rounded-full px-8 py-5 text-lg font-serif font-medium text-neutral-900 placeholder:text-neutral-300 focus:outline-none transition-all shadow-sm ${
          error
            ? 'border-red-300 focus:border-red-400 focus:shadow-red-50'
            : 'border-transparent focus:border-neutral-900/10 focus:shadow-xl'
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs font-sans font-bold flex items-center gap-1 ml-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ── Reusable Detail Row ──
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
        <span className="text-neutral-500 font-sans text-sm">{label}</span>
      </div>
      <span className="font-serif font-bold text-neutral-900">{value}</span>
    </div>
  );
}
