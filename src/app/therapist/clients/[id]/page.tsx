'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Calendar, Clock, Sparkles, 
  MapPin, Phone, Mail, FileText, Heart, Shield 
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';

export default function PatientBioDossier() {
  const { id } = useParams();
  const router = useRouter();
  const firestore = useFirestore();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!firestore || !id) return;
    const unsub = onSnapshot(doc(firestore, 'clients', id as string), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setClient(data);
        setNotes(data.clinicalNotes || '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [firestore, id]);

  const saveNotes = async () => {
    if (!firestore || !id) return;
    setSaving(true);
    await updateDoc(doc(firestore, 'clients', id as string), {
      clinicalNotes: notes,
      lastUpdated: Timestamp.now()
    });
    setSaving(false);
    alert('📔 Bio-Dossier mis à jour avec succès.');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-gray-400">Immersion dans le dossier...</div>;
  if (!client) return <div className="min-h-screen flex items-center justify-center font-serif italic">Patient non localisé.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      
      {/* ── SOVEREIGN HEADER ── */}
      <motion.header 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 bg-[#222F3E] text-white p-12 lg:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none -rotate-12"><Heart size={300} /></div>
        
        <div className="space-y-6 relative z-10">
           <button onClick={() => router.push('/therapist/clients')} className="flex items-center gap-3 text-[#0ABDE3] font-black text-[0.65rem] uppercase tracking-widest hover:text-white transition-colors mb-4">
             <ArrowLeft size={16} /> Retour au CRM
           </button>
           <h1 className="title-luxe text-5xl md:text-7xl leading-none">{client.name} <br/><span className="italic font-serif opacity-40 text-[#F8F5F0]">Bio-Dossier.</span></h1>
           <div className="flex gap-4 mt-4">
              <span className="px-5 py-2 bg-white/10 rounded-full text-[0.6rem] font-black tracking-widest uppercase border border-white/10">{client.fidelityLevel || 'Nouveau'}</span>
              <span className="px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[0.6rem] font-black tracking-widest uppercase border border-emerald-500/20">Actif</span>
           </div>
        </div>
        
        <div className="flex flex-col gap-4 text-right relative z-10">
           <p className="text-xl font-serif italic text-gray-300">Inscrit le {client.joinedAt || '20/03/2026'}</p>
           <p className="text-sm font-black uppercase tracking-widest text-[#0ABDE3]">{client.email}</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* CLINICAL NOTES (MAIN CONTENT) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
           <section className="dash-card p-12 bg-white border border-white space-y-10 shadow-2xl shadow-indigo-100/10">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-serif font-medium flex items-center gap-4 text-[#222F3E]">
                    <FileText size={28} className="text-[#5F27CD]" /> Notes Cliniques & Soins
                 </h2>
                 <button 
                   onClick={saveNotes}
                   disabled={saving}
                   className="btn-luxe flex items-center gap-3 px-10 py-5 text-sm"
                 >
                    {saving ? 'Synchronisation...' : <><Save size={20} /> Sauvegarder</>}
                 </button>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Décrivez ici vos observations bio-énergétiques et le suivi de séance..."
                className="w-full min-h-[600px] bg-gray-50/50 rounded-[2.5rem] p-10 font-serif italic text-xl text-[#222F3E] leading-relaxed focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all border border-transparent hover:border-indigo-100"
              />
           </section>
        </div>

        {/* VITALS & PREFERENCES (SIDEBAR) */}
        <div className="lg:col-span-4 space-y-10">
           <section className="dash-card p-10 bg-[#222F3E] text-white space-y-10 relative overflow-hidden group">
              <h3 className="text-xl font-serif font-medium flex items-center gap-4 text-[#0ABDE3]">
                 <Shield size={20} /> Santé & Vitals
              </h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 mb-2">Allergies / Conditions</p>
                    <p className="text-lg font-serif italic">{client.healthInfo || 'Aucune contre-indication signalée.'}</p>
                 </div>
                 <div className="pt-6 border-t border-white/10">
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2">Dernière séance</p>
                    <p className="text-lg font-serif italic">13 Avril 2026 • Massage Sensoriel</p>
                 </div>
              </div>
           </section>

           <section className="dash-card p-10 bg-white border border-white space-y-10">
              <h3 className="text-xl font-serif font-medium flex items-center gap-4 text-[#5F27CD]">
                 <Sparkles size={20} /> Préférences Zen
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Huile Favorite', value: client.prefOil || 'Géranium d&apos;Égypte' },
                   { label: 'Pression', value: client.prefPressure || 'Moyenne / Profonde' },
                   { label: 'Ambiance', value: 'Lumière tamisée, Silence' }
                 ].map((pref, i) => (
                   <div key={i} className="flex justify-between items-end border-b border-gray-50 pb-4">
                      <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">{pref.label}</p>
                      <p className="text-sm font-bold text-[#222F3E]">{pref.value}</p>
                   </div>
                 ))}
              </div>
           </section>

           <div className="px-10 py-10 bg-indigo-50/50 border border-indigo-100/50 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-4 text-[#5F27CD]">
                 <Phone size={18} />
                 <p className="text-sm font-bold font-serif italic">{client.phoneNumber || '+41 XX XXX XX XX'}</p>
              </div>
              <div className="flex items-center gap-4 text-[#5F27CD]">
                 <Mail size={18} />
                 <p className="text-sm font-bold font-serif italic">{client.email}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
