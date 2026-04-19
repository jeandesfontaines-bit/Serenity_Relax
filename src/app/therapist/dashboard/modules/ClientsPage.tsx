'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, Plus, ArrowUpDown, Users,
  Settings2, GitPullRequest, CheckCircle2, Phone, MapPin, X, Sparkles, Filter, Mail, Trophy, History, ChevronRight, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client, Appointment } from '../types';

interface ClientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onNewClient: (initialName?: string) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
}

export default function ClientsPage({
  clients, appointments, onSelectClient, onNewClient, onMergeClients,
}: ClientsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sessionsByClient = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach(apt => {
      if (apt.clientId) map.set(apt.clientId, (map.get(apt.clientId) || 0) + 1);
    });
    return map;
  }, [appointments]);

  const filtered = useMemo(() =>
    clients
      .filter(p => {
        const s = `${p.firstName} ${p.lastName} ${p.email || ''} ${p.phone || ''} ${p.city || ''} ${p.canton || ''} ${p.insurance || ''}`.toLowerCase();
        return s.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof Client] || '';
        let valB: any = b[sortField as keyof Client] || '';
        if (sortField === 'sessions') {
          valA = sessionsByClient.get(a.id) || 0;
          valB = sessionsByClient.get(b.id) || 0;
        }
        const res = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
        return sortDir === 'asc' ? res : -res;
      }),
    [clients, search, sortField, sortDir, sessionsByClient],
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* ── HEADER ACTION BAR ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/40 backdrop-blur-3xl p-6 rounded-2xl border border-white shadow-lg">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#5F27CD] text-white flex items-center justify-center shadow-md"><Users size={16} /></div>
              <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[#5F27CD]">Gestion Clientèle</p>
           </div>
           <h1 className="title-luxe text-3xl leading-none">Dossiers Patients</h1>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative group flex-1 min-w-[240px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
             <input 
              type="text" 
              placeholder="Rechercher..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 bg-white/60 border border-white rounded-xl pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all"
             />
          </div>
          <button onClick={() => onNewClient()} className="btn-luxe flex items-center gap-2 px-6 py-3">
             <Plus size={16} /> Nouveau
          </button>
        </div>
      </header>

      {/* ── CLIENT GRID MASTERPIECE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((client, i) => {
            const sessions = sessionsByClient.get(client.id) || 0;
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onSelectClient(client)}
                className="dash-card p-6 group cursor-pointer border border-white/80 hover:border-[#5F27CD]/30 relative overflow-hidden flex flex-col"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Trophy size={100} />
                </div>

                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-[#F8F5F0] rounded-xl flex items-center justify-center text-lg font-bold text-[#222F3E] group-hover:bg-[#5F27CD] group-hover:text-white transition-all duration-500 shadow-sm">
                      {client.firstName[0]}{client.lastName[0]}
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[0.55rem] font-black uppercase tracking-widest text-gray-400">Séances</span>
                      <p className="text-2xl font-bold text-[#222F3E] group-hover:text-[#5F27CD] transition-colors">{sessions}</p>
                   </div>
                </div>

                <div className="space-y-2 flex-1">
                   <h3 className="text-xl font-medium text-[#222F3E] tracking-tight">{client.firstName} {client.lastName}</h3>
                   <div className="flex flex-wrap gap-2 pt-2">
                       <span className="px-3 py-1 bg-white/50 rounded-lg text-[0.6rem] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <MapPin size={10} /> {client.city || 'Genève'}
                       </span>
                       <span className="px-3 py-1 bg-white/50 rounded-lg text-[0.6rem] font-black uppercase tracking-widest text-[#0ABDE3] flex items-center gap-2">
                          <ShieldCheck size={10} /> {client.insurance || 'Sans ASS'}
                       </span>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6 grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#222F3E] transition-colors">
                      <Phone size={12} />
                      <span className="text-[0.65rem] font-medium">{client.phone || '-'}</span>
                   </div>
                   <button className="flex items-center justify-end gap-1 text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] group-hover:translate-x-1 transition-transform">
                      Dossier <ChevronRight size={12} />
                   </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-white/40 rounded-3xl border-2 border-dashed border-gray-100">
           <div className="w-12 h-12 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200">
              <Users size={20} />
           </div>
           <p className="text-base text-gray-300">Aucun patient ne correspond.</p>
        </div>
      )}
    </div>
  );
}