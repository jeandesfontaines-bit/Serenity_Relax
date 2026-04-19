'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Calendar, Clock, Sparkles, 
  MapPin, Phone, Mail, FileText, Heart, Shield, Edit3, X 
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (!firestore || !id) return;
    const unsub = onSnapshot(doc(firestore, 'clients', id as string), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setClient(data);
        setNotes(data.clinicalNotes || '');
        if (!isEditing) setEditForm(data);
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
  };

  const saveClientInfo = async () => {
    if (!firestore || !id) return;
    setSaving(true);
    await updateDoc(doc(firestore, 'clients', id as string), {
      name: editForm.name || '',
      email: editForm.email || '',
      phoneNumber: editForm.phoneNumber || '',
      healthInfo: editForm.healthInfo || '',
      prefOil: editForm.prefOil || '',
      prefPressure: editForm.prefPressure || '',
      lastUpdated: Timestamp.now()
    });
    setIsEditing(false);
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans italic text-gray-400">Immersion dans le dossier...</div>;
  if (!client) return <div className="min-h-screen flex items-center justify-center font-sans italic">Patient non localisé.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ── SOVEREIGN HEADER ── */}
      <motion.header 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 bg-[#222F3E] text-white p-6 rounded-xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-[-30%] right-0 opacity-5 pointer-events-none -rotate-12"><Heart size={200} /></div>
        
        <div className="space-y-4 relative z-10 w-full md:w-auto">
           <button onClick={() => router.push('/therapist/clients')} className="flex items-center gap-2 text-[#10B981] font-black text-xs uppercase tracking-widest hover:text-white transition-colors">
             <ArrowLeft size={16} /> Retour au CRM
           </button>
           
           {isEditing ? (
             <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="bg-white/10 text-2xl font-bold text-white px-4 py-2 rounded-lg border border-white/20 focus:ring-2 outline-none w-full max-w-sm" />
           ) : (
             <h1 className="title-luxe text-2xl md:text-3xl leading-none">{client.name} <span className="italic font-sans opacity-40 text-[#F8F5F0]">Bio-Dossier.</span></h1>
           )}
           
           <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase border border-white/10">{client.fidelityLevel || 'Nouveau'}</span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase border border-emerald-500/20">Actif</span>
           </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 relative z-10">
           {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg bg-gray-500/50 hover:bg-gray-500 text-white text-xs font-bold transition-all"><X size={16}/></button>
                <button onClick={saveClientInfo} disabled={saving} className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 transition-all"><Save size={16}/> Sauvegarder Infos</button>
              </div>
           ) : (
              <button onClick={() => { setEditForm(client); setIsEditing(true); }} className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded-lg text-white text-xs font-black uppercase flex items-center gap-2 transition-all shadow-md"><Edit3 size={14}/> Profil</button>
           )}
           {!isEditing && (
              <>
                 <p className="text-sm font-sans italic text-gray-400">Client depuis {client.joinedAt || '20/03/2026'}</p>
                 <p className="text-xs font-black text-[#10B981]">{client.email}</p>
              </>
           )}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CLINICAL NOTES (MAIN CONTENT) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <section className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold flex items-center gap-3 text-[#222F3E]">
                    <FileText size={20} className="text-[#059669]" /> Notes Cliniques & Suivi
                 </h2>
                 <button 
                   onClick={saveNotes}
                   disabled={saving}
                   className="btn-luxe flex items-center gap-2 px-5 py-2 text-xs"
                 >
                    {saving ? 'Sauvegarde...' : <><Save size={16} /> Enregistrer Notes</>}
                 </button>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Rédigez vos observations de séance ici..."
                className="w-full flex-1 min-h-[300px] bg-slate-50/50 rounded-xl p-4 font-sans text-sm text-[#222F3E] leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-50/50 transition-all border border-gray-100 placeholder:italic"
              />
           </section>
        </div>

        {/* VITALS & PREFERENCES (SIDEBAR) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
           {isEditing ? (
             <section className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#222F3E] border-b pb-2">Informations de Contact</h3>
                <input placeholder="Email" value={editForm.email || ''} onChange={e=>setEditForm({...editForm, email: e.target.value})} className="w-full text-sm p-3 border rounded-lg bg-gray-50 mb-2"/>
                <input placeholder="Téléphone" value={editForm.phoneNumber || ''} onChange={e=>setEditForm({...editForm, phoneNumber: e.target.value})} className="w-full text-sm p-3 border rounded-lg bg-gray-50"/>
                
                <h3 className="text-sm font-bold text-[#222F3E] border-b pb-2 pt-4">Santé (Allergies, conditions)</h3>
                <textarea rows={3} placeholder="Allergies, CI..." value={editForm.healthInfo || ''} onChange={e=>setEditForm({...editForm, healthInfo: e.target.value})} className="w-full text-sm p-3 border rounded-lg bg-gray-50"/>
                
                <h3 className="text-sm font-bold text-[#222F3E] border-b pb-2 pt-4">Préférences</h3>
                <input placeholder="Huile favorite" value={editForm.prefOil || ''} onChange={e=>setEditForm({...editForm, prefOil: e.target.value})} className="w-full text-sm p-3 border rounded-lg bg-gray-50 mb-2"/>
                <input placeholder="Pression souhaitée" value={editForm.prefPressure || ''} onChange={e=>setEditForm({...editForm, prefPressure: e.target.value})} className="w-full text-sm p-3 border rounded-lg bg-gray-50"/>
             </section>
           ) : (
             <>
               <section className="dash-card p-6 bg-slate-800 text-white space-y-6 rounded-xl shadow-md">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-[#10B981]">
                     <Shield size={16} /> Santé & Vitals
                  </h3>
                  <div className="space-y-4">
                     <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Allergies / Conditions</p>
                        <p className="text-sm font-sans">{client.healthInfo || 'Aucune contre-indication signalée.'}</p>
                     </div>
                  </div>
               </section>

               <section className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-6">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-[#059669]">
                     <Sparkles size={16} /> Préférences Modales
                  </h3>
                  <div className="space-y-4">
                     {[
                       { label: 'Huile', value: client.prefOil || 'Neutre' },
                       { label: 'Pression', value: client.prefPressure || 'Standard' }
                     ].map((pref, i) => (
                       <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <p className="text-xs font-black uppercase text-gray-400">{pref.label}</p>
                          <p className="text-sm font-medium text-[#222F3E]">{pref.value}</p>
                       </div>
                     ))}
                  </div>
               </section>

               <section className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4 text-sm font-medium text-[#222F3E]">
                  <div className="flex items-center gap-3">
                     <Phone size={16} className="text-[#059669] shrink-0" />
                     <p>{client.phoneNumber || 'Numéro non renseigné'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Mail size={16} className="text-[#059669] shrink-0" />
                     <p className="break-all">{client.email}</p>
                  </div>
               </section>
             </>
           )}
        </div>

      </div>
    </div>
  );
}
