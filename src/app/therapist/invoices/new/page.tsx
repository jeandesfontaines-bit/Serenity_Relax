'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, User, Sparkles, CreditCard, Banknote, Smartphone, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [invoice, setInvoice] = useState({
    clientId: searchParams.get('clientId') || '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    items: [
      { 
        description: searchParams.get('desc') || 'Soin Thérapeutique', 
        amount: parseInt(searchParams.get('amount') || '150') 
      }
    ],
    status: 'pending',
    paymentMethod: null as string | null
  });

  const addItem = () => {
    setInvoice(prev => ({ ...prev, items: [...prev.items, { description: '', amount: 0 }] }));
  };

  const removeItem = (idx: number) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx: number, fields: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, ...fields } : item)
    }));
  };

  const total = invoice.items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !invoice.clientName) return;
    
    setLoading(true);
    try {
      await addDoc(collection(firestore, 'invoices'), {
        ...invoice,
        amount: total,
        createdAt: serverTimestamp(),
        id: `INV-${Date.now()}`
      });
      setSuccess(true);
      setTimeout(() => router.push('/therapist/invoices'), 2000);
    } catch (err) {
      console.error("Save invoice error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F5F0] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <button onClick={() => router.back()} className="flex items-center gap-3 text-gray-400 font-black text-[0.65rem] uppercase tracking-widest hover:text-[#059669] transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm border border-white relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-16">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center shadow-lg"><Plus size={20} /></div>
                     <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#059669]">Nouvelle Émission</p>
                  </div>
                  <h1 className="title-luxe text-2xl md:text-3xl">Création <br/><span className="font-sans italic opacity-40">de Facture.</span></h1>
               </div>
               <div className="hidden md:block text-right">
                  <p className="text-sm font-sans italic text-gray-400">Archivage Immédiat</p>
                  <p className="text-3xl font-light text-[#222F3E] mt-2">Dossier N° {Date.now().toString().slice(-6)}</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
               {/* Patient Selection */}
               <div className="space-y-6">
                  <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400">Identité du Patient</label>
                  <div className="relative group">
                     <User className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#059669] transition-colors" size={20} />
                     <input 
                       required
                       type="text" 
                       placeholder="Nom complet du patient..." 
                       value={invoice.clientName}
                       onChange={e => setInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                       className="w-full h-20 bg-white/60 border border-white rounded-xl pl-20 pr-10 text-xl font-sans italic focus:outline-none focus:ring-8 focus:ring-emerald-50 transition-all"
                     />
                  </div>
               </div>

               {/* Items List */}
               <div className="space-y-6">
                  <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400">Détail des Prestations</label>
                  <div className="space-y-4">
                     {invoice.items.map((item, idx) => (
                       <div key={idx} className="flex gap-4">
                          <div className="flex-1 relative group">
                             <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#10B981] transition-colors" size={16} />
                             <input 
                               type="text" 
                               placeholder="Description du soin..." 
                               value={item.description}
                               onChange={e => updateItem(idx, { description: e.target.value })}
                               className="w-full h-16 bg-white border border-gray-100 rounded-2xl pl-16 pr-6 focus:outline-none focus:border-[#10B981] transition-all"
                             />
                          </div>
                          <div className="w-32">
                             <input 
                               type="number" 
                               placeholder="CHF" 
                               value={item.amount || ''}
                               onChange={e => updateItem(idx, { amount: parseInt(e.target.value) || 0 })}
                               className="w-full h-16 bg-white border border-gray-100 rounded-2xl px-6 text-center font-bold focus:outline-none focus:border-[#10B981] transition-all"
                             />
                          </div>
                          <button type="button" onClick={() => removeItem(idx)} className="p-4 text-gray-300 hover:text-red-400 transition-colors">
                             <Trash2 size={20} />
                          </button>
                       </div>
                     ))}
                     <button type="button" onClick={addItem} className="flex items-center gap-3 px-8 py-4 bg-white border border-dashed border-gray-200 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-[#059669] hover:bg-emerald-50/30 transition-all">
                        <Plus size={14} /> Ajouter une ligne
                     </button>
                  </div>
               </div>

               {/* Total and Submit */}
               <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-5">
                  <div className="text-center md:text-left">
                     <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Total de la Facture</p>
                     <p className="text-3xl font-light text-[#222F3E]">{total} <small className="text-xl font-black opacity-20">CHF</small></p>
                  </div>
                  
                  <div className="flex gap-4">
                     {success ? (
                       <div className="flex items-center gap-4 py-8 px-12 bg-emerald-50 text-emerald-600 rounded-[1.5rem] font-black uppercase text-[0.7rem] tracking-widest animate-bounce">
                          <CheckCircle2 size={24} /> Facture Enregistrée
                       </div>
                     ) : (
                       <button 
                         disabled={loading}
                         type="submit"
                         className="h-24 px-16 bg-[#222F3E] text-white rounded-[1.5rem] shadow-2xl shadow-emerald-200/50 flex items-center justify-center gap-4 group hover:scale-105 active:scale-95 transition-all text-[0.8rem] font-black uppercase tracking-[0.3em]"
                       >
                         {loading ? "Traitement..." : <><Save size={24} className="text-[#34D399] group-hover:rotate-12 transition-transform" /> Émettre la Facture</>}
                       </button>
                     )}
                  </div>
               </div>
            </form>

          </motion.div>
        </div>
      </div>
    </>
  );
}
