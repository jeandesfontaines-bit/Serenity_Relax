'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, ShieldCheck, ArrowRight, Users, 
  User, Calendar, Clock, Sparkles, Filter 
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function ClientsCRM() {
  const router = useRouter();
  const firestore = useFirestore();

  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const unsub = onSnapshot(collection(firestore, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [firestore]);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ── HEADER ── */}
      <motion.header 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#222F3E] text-white p-6 rounded-xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12"><Users size={150} /></div>
        
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#059669] text-white flex items-center justify-center animate-pulse"><Sparkles size={10} /></div>
              <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#10B981]">CRM Haute-Fidélité</p>
           </div>
           <h2 className="title-luxe text-2xl md:text-3xl leading-none text-white">Bio-Dossiers <br/><span className="italic font-sans opacity-40 text-[#F8F5F0]">Patients.</span></h2>
           <p className="text-[0.65rem] text-gray-400 font-sans italic max-w-md leading-relaxed">La mémoire sensorielle et clinique de votre Sanctuaire.</p>
        </div>
        
        <div className="flex gap-4 relative z-10">
           <button className="btn-luxe flex items-center gap-2 px-6 py-3 text-xs shadow-md shadow-emerald-200/20">
              <Plus size={16} /> Nouveau Patient
           </button>
        </div>
      </motion.header>

      <div className="flex flex-col md:flex-row gap-3">
         <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#059669] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher... (nom, email)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 shadow-sm hover:shadow-md transition-all font-sans italic"
            />
         </div>
         <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-400 flex items-center gap-2 hover:text-[#059669] transition-all shadow-sm text-xs">
            <Filter size={14} /> Filtres
         </button>
      </div>

      {/* ── CLIENTS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredClients.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/therapist/clients/${client.id}`)}
              className="dash-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-[#059669]"><User size={60} /></div>
               
               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                     <span className="px-3 py-1 bg-emerald-50 text-[#059669] rounded-lg text-[0.5rem] font-black uppercase tracking-widest">{client.fidelityLevel || 'Argent'}</span>
                     <ArrowRight size={14} className="text-gray-200 group-hover:text-[#059669] group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-sans font-medium text-[#222F3E] group-hover:text-[#059669] transition-colors">{client.name}</h3>
                    <p className="text-[0.65rem] text-gray-400 font-sans italic mt-0.5">{client.email}</p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center text-[0.55rem] font-black uppercase tracking-widest text-gray-400">
                     <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        <span>Depuis {client.joinedAt || '20/03/2026'}</span>
                     </div>
                     <ShieldCheck className="text-emerald-400" size={14} />
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}