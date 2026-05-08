'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  Shield, 
  Clock, 
  Sparkle, 
  Loader2, 
  ChevronRight, 
  MapPin, 
  CalendarDays, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Heart
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BookingDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      if (firestore && user) {
        await addDoc(collection(firestore, 'appointments'), {
          clientId: user.uid,
          clientName: `${form.firstName} ${form.lastName}`,
          clientEmail: form.email,
          clientPhone: form.phone,
          address: `${form.address}, ${form.zip} ${form.city}, ${form.canton}`,
          notes: form.notes,
          serviceId: 'bambous-60', // Simplified for demo
          status: 'confirmed',
          startTime: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFDFC] flex flex-col items-center justify-center p-6 text-center">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-neutral-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-emerald-600" strokeWidth={3} />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-serif font-bold text-neutral-900 leading-tight">
                Votre sanctuaire est <span className="text-neutral-400 italic font-light">réservé</span>
              </h1>
              <p className="text-neutral-500 font-sans italic">
                Un moment de restauration pure vous attend. Un email de confirmation a été envoyé à {form.email}.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-8 text-left space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Heart className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Séance</p>
                  <p className="text-lg font-serif font-bold">Massage aux Bambous</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <CalendarDays className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Date & Heure</p>
                  <p className="font-sans font-bold">Jeudi, 24 Octobre · 14h30</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="flex-1 rounded-full py-5 bg-neutral-900 text-white font-sans font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-neutral-800 transition-all"
              >
                Accéder au Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-full py-5 border-2 border-neutral-100 text-neutral-900 font-sans font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-50 transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-neutral-900">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
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
                  <div className={`h-[2px] w-12 sm:w-20 transition-all duration-700 ${s.done || s.active ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    s.done ? 'bg-neutral-900 text-white shadow-lg' :
                    s.active ? 'bg-neutral-900 text-white ring-4 ring-neutral-900/5 shadow-lg' :
                    'bg-neutral-50 text-neutral-300'
                  }`}>
                    {s.done ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="font-serif font-bold text-sm">{s.step}</span>}
                  </div>
                  <span className={`text-[9px] font-sans font-black uppercase tracking-[0.3em] ${
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
              className="lg:col-span-7"
            >
              <div className="mb-12">
                <button onClick={() => router.back()} className="flex items-center gap-3 text-neutral-400 hover:text-neutral-900 transition-colors mb-8 group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em]">Retour au calendrier</span>
                </button>
                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-neutral-900 leading-[1.1] mb-6">
                  Finalisez votre<br />
                  <span className="text-neutral-400 italic font-light">réservation</span>
                </h1>
                <p className="text-neutral-500 font-sans text-lg italic max-w-lg">
                  Quelques informations pour préparer votre moment de restauration. Vos données sont traitées avec le plus grand soin.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <InputField
                    icon={<User className="w-3.5 h-3.5" />}
                    label="Prénom"
                    value={form.firstName}
                    onChange={v => updateField('firstName', v)}
                    placeholder="Ex: Julian"
                    error={errors.firstName}
                  />
                  <InputField
                    icon={<User className="w-3.5 h-3.5" />}
                    label="Nom"
                    value={form.lastName}
                    onChange={v => updateField('lastName', v)}
                    placeholder="Ex: Thorne"
                    error={errors.lastName}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <InputField
                    icon={<Mail className="w-3.5 h-3.5" />}
                    label="Adresse e-mail"
                    value={form.email}
                    onChange={v => updateField('email', v)}
                    placeholder="Ex: julian@premium.com"
                    type="email"
                    error={errors.email}
                  />
                  <InputField
                    icon={<Phone className="w-3.5 h-3.5" />}
                    label="Téléphone"
                    value={form.phone}
                    onChange={v => updateField('phone', v)}
                    placeholder="Ex: +41 79 000 00 00"
                    type="tel"
                    error={errors.phone}
                  />
                </div>

                <div className="space-y-8 bg-neutral-50/50 rounded-[2.5rem] p-8 border border-neutral-100">
                  <InputField
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="Adresse (Rue et numéro)"
                    value={form.address}
                    onChange={v => updateField('address', v)}
                    placeholder="Ex: Rue du Rhône 12"
                    bg="bg-white"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <InputField
                      label="Code Postal"
                      value={form.zip}
                      onChange={v => updateField('zip', v)}
                      placeholder="1204"
                      bg="bg-white"
                    />
                    <InputField
                      label="Ville"
                      value={form.city}
                      onChange={v => updateField('city', v)}
                      placeholder="Genève"
                      bg="bg-white"
                    />
                    <InputField
                      label="Canton"
                      value={form.canton}
                      onChange={v => updateField('canton', v)}
                      placeholder="GE"
                      bg="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 ml-1 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Notes ou demandes particulières
                    <span className="font-normal normal-case tracking-normal text-neutral-300 italic ml-2">(Optionnel)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => updateField('notes', e.target.value)}
                    rows={4}
                    placeholder="Indiquez ici vos zones de tension, allergies ou préférences..."
                    className="w-full bg-white border-2 border-neutral-50 rounded-[2rem] px-8 py-6 text-lg font-serif text-neutral-900 placeholder:text-neutral-200 focus:outline-none focus:border-neutral-900/10 focus:shadow-2xl transition-all resize-none"
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <label className="flex items-start gap-5 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-all duration-300 ${
                      form.consent ? 'bg-neutral-900 border-neutral-900 shadow-lg' : 'border-neutral-200 group-hover:border-neutral-400'
                    }`}>
                      {form.consent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={e => updateField('consent', e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-sm font-sans text-neutral-500 leading-relaxed group-hover:text-neutral-700 transition-colors">
                      J'accepte les <Link href="#" className="text-neutral-900 font-bold border-b border-neutral-900/10 hover:border-neutral-900 transition-all">conditions générales</Link> et la{' '}
                      <Link href="#" className="text-neutral-900 font-bold border-b border-neutral-900/10 hover:border-neutral-900 transition-all">politique de confidentialité</Link>.
                      Annulation sans frais jusqu'à 24h avant.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-red-500 text-xs font-sans font-bold flex items-center gap-2 ml-11">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.consent}
                    </p>
                  )}
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full py-7 bg-neutral-900 text-white font-sans font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-neutral-900/20 hover:bg-neutral-800 hover:shadow-neutral-900/40 transition-all duration-500 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-4 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        Confirmer mon Ritual
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Summary Column */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 lg:sticky lg:top-36"
            >
              <div className="bg-white rounded-[3rem] shadow-2xl border border-neutral-100 overflow-hidden">
                <div className="relative h-64">
                  <img
                    alt="Rituel Premium"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-white/60 mb-2 block">Votre sélection</span>
                    <h3 className="text-3xl font-serif font-bold text-white">Massage aux Bambous</h3>
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="space-y-6">
                    <SummaryRow icon={<Clock className="w-4 h-4" />} label="Durée" value="60 minutes" />
                    <SummaryRow icon={<CalendarDays className="w-4 h-4" />} label="Date" value="Jeudi, 24 Oct. 2024" />
                    <SummaryRow icon={<Clock className="w-4 h-4" />} label="Heure" value="14h30" />
                    <SummaryRow icon={<MapPin className="w-4 h-4" />} label="Lieu" value="Genève (Cointrin)" />
                  </div>

                  <div className="h-px bg-neutral-50" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-sans text-neutral-500">
                      <span>Rituel Premium</span>
                      <span className="font-serif font-bold text-neutral-900">160 CHF</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-sans text-neutral-500">
                      <span>Expérience Spa</span>
                      <span className="font-serif font-bold text-neutral-900 italic">Incluse</span>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-neutral-50">
                      <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Total</span>
                      <span className="text-4xl font-serif font-bold text-neutral-900 tracking-tighter">160 CHF</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 rounded-3xl p-6 flex items-center gap-5 border border-emerald-100/50">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-sans text-emerald-800/70 leading-relaxed">
                      <span className="font-bold text-emerald-900">Confirmation immédiate.</span><br />
                      Vos informations de paiement sont cryptées et sécurisées.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-8 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                <Shield className="w-6 h-6" />
                <CreditCard className="w-6 h-6" />
                <LockIcon className="w-5 h-5" />
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  bg = 'bg-white'
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  bg?: string;
}) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 ml-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${bg} border-2 rounded-full px-8 py-5 text-lg font-serif font-medium text-neutral-900 placeholder:text-neutral-200 focus:outline-none transition-all shadow-sm ${
          error
            ? 'border-red-200 focus:border-red-400 focus:shadow-red-50'
            : 'border-transparent focus:border-neutral-900/10 focus:shadow-2xl'
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs font-sans font-bold flex items-center gap-2 ml-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-300">
          {icon}
        </div>
        <span className="text-neutral-500 font-sans text-sm">{label}</span>
      </div>
      <span className="font-serif font-bold text-neutral-900">{value}</span>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
