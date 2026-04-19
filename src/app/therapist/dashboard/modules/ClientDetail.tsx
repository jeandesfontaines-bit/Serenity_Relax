'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, CreditCard, Plus,
  Mail, Phone, MapPin, ShieldCheck, FileText, Clock, Sparkles, TrendingUp, Wallet
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

/* ── PROPS ── */
interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
}

export default function ClientDetail({
  client, onClose, appointments, onSelectAppt, onUpdateClient,
}: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes' | 'billing'>('overview');
  const [editData, setEditData] = useState<Partial<Client>>({ ...client });

  useEffect(() => { setEditData({ ...client }); }, [client]);

  const updateField = useCallback((field: keyof Client, value: string) => {
    const next = { ...editData, [field]: value };
    setEditData(next);
    onUpdateClient(client.id, next);
  }, [client.id, editData, onUpdateClient]);

  const clientAppts = useMemo(() =>
    [...appointments]
      .filter(a => a.clientId === client.id || a.clientNameSnapshot === `${client.firstName} ${client.lastName}`)
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [appointments, client],
  );

  const totalDue = clientAppts.filter(a => !a.paid && a.price).reduce((s, a) => s + (a.price || 0), 0);
  const totalPaid = clientAppts.filter(a => a.paid && a.price).reduce((s, a) => s + (a.price || 0), 0);
  const unpaidCount = clientAppts.filter(a => !a.paid && a.date).length;
  const lastAppt = clientAppts.find(a => a.date && a.time);

  const TABS = [
    { id: 'overview' as const, label: 'Identité' },
    { id: 'sessions' as const, label: 'Historique', count: clientAppts.length },
    { id: 'notes' as const, label: 'Dossier' },
    { id: 'billing' as const, label: 'Finance' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* ── HEADER IMPACT LUXE ── */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#5F27CD] via-[#0ABDE3] to-[#1DD1A1] p-10 lg:p-14 text-white relative shrink-0"
      >
        <button
          onClick={onClose}
          className="absolute top-8 left-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/40 transition-all shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8 mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white text-[#5F27CD] flex items-center justify-center text-5xl font-sans shadow-2xl">
              {client.lastName?.[0]}{client.firstName?.[0]}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] opacity-70 mb-2">Dossier Patient Confidentiel</p>
              <h1 className="text-5xl lg:text-6xl font-sans font-light leading-tight tracking-tight">
                {client.lastName} {client.firstName}
              </h1>
            </div>
          </div>

          <div className="flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 px-6 flex items-center gap-2 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#5F27CD] shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-white/40 bg-white/40 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-5 text-[0.6rem] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#5F27CD] text-[#5F27CD] bg-indigo-50/20'
                : 'border-transparent text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-auto bg-white/20 scrollbar-hide relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/10 to-transparent pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-10">

          {/* Identity Card LUXE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#1DD1A1] to-[#0ABDE3] text-white flex items-center justify-center text-4xl font-sans shadow-2xl shadow-cyan-100">
                {client.lastName?.[0]}{client.firstName?.[0]}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-4xl font-sans font-medium text-[#222F3E]">
                  {client.lastName} {client.firstName}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3 mt-4 text-[0.65rem] font-black uppercase tracking-widest text-gray-400">
                  {editData.email && (
                    <span className="flex items-center gap-2">
                       <Mail size={14} className="text-[#5F27CD]" /> {editData.email}
                    </span>
                  )}
                  {editData.phone && (
                    <span className="flex items-center gap-2">
                      <Phone size={14} className="text-[#0ABDE3]" /> {editData.phone}
                    </span>
                  )}
                  {(editData.city || editData.canton) && (
                    <span className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#1DD1A1]" /> {editData.city}{editData.canton ? `, ${editData.canton}` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="hidden sm:block">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1DD1A1]/10 text-[#1DD1A1] text-[0.6rem] font-black uppercase tracking-widest">
                    <ShieldCheck size={12} /> Patient Régulier
                </span>
            </div>
          </motion.div>

          {/* Stats Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Ritual" value={String(clientAppts.length)} icon={Calendar} color="#5F27CD" />
            <StatCard
              label="Dernière visite"
              value={lastAppt?.date ? format(new Date(lastAppt.date), 'd MMM yyyy', { locale: fr }) : 'Nouvel arrivant'}
              icon={Clock}
              color="#0ABDE3"
            />
            <StatCard
              label="Soin favori"
              value={(() => {
                const counts = clientAppts.reduce((acc, a) => {
                  if (a.serviceName) acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                return top ? top[0].split(' ')[0] : 'Soin Unique';
              })()}
              icon={Sparkles}
              color="#F368E0"
            />
            <StatCard
              label="Contribution"
              value={`${totalPaid + totalDue} CHF`}
              icon={Wallet}
              color="#1DD1A1"
            />
          </div>

          {/* Tab Content LUXE */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab client={client} editData={editData} updateField={updateField} onUpdateClient={onUpdateClient} />
              )}
              {activeTab === 'sessions' && (
                <SessionsTab clientAppts={clientAppts} onSelectAppt={onSelectAppt} totalDue={totalDue} clientFirstName={client.firstName} />
              )}
              {activeTab === 'notes' && (
                <NotesTab client={client} onUpdateClient={onUpdateClient} />
              )}
              {activeTab === 'billing' && (
                <BillingTab clientAppts={clientAppts} totalPaid={totalPaid} totalDue={totalDue} unpaidCount={unpaidCount} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ── STAT CARD LUXE ── */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/80 p-8 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-100/10 transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15', color }}>
            <Icon size={16} />
        </div>
        <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">{label}</p>
      </div>
      <p className="text-xl font-sans font-medium text-[#222F3E]">
        {value}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   OVERVIEW TAB LUXE
   ══════════════════════════════════════════════════ */
function OverviewTab({
  client, editData, updateField, onUpdateClient,
}: {
  client: Client;
  editData: Partial<Client>;
  updateField: (field: keyof Client, value: string) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Client Info Hub */}
      <div className="dash-card">
        <h3 className="text-xl font-sans font-medium text-[#222F3E] mb-8">Informations d&apos;identité</h3>
        <div className="space-y-2">
          <EditableField icon={<Mail size={14} />} label="Email" value={editData.email || ''} onChange={v => updateField('email', v)} type="email" />
          <EditableField icon={<Phone size={14} />} label="Téléphone" value={editData.phone || ''} onChange={v => updateField('phone', v)} type="tel" />
          <InfoRow label="Adresse Complète" value={[editData.street, `${editData.zip || ''} ${editData.city || ''} ${editData.canton || ''}`.trim()].filter(Boolean).join(', ') || '—'} />
          <EditableField label="Assurance Cabinet" value={editData.insurance || ''} onChange={v => updateField('insurance', v)} icon={<ShieldCheck size={14} />} />
          <InfoRow label="Anniversaire" value={editData.birthDate || 'Date non renseignée'} />
        </div>
      </div>

      {/* Therapy Context */}
      <div className="dash-card border-l-4 border-[#5F27CD]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-sans font-medium text-[#222F3E]">Contexte Thérapeutique</h3>
          <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5F27CD]/5 text-[#5F27CD] text-[0.6rem] font-black uppercase tracking-widest">
            <ShieldCheck size={12} /> Confidentialité Maximale
          </span>
        </div>
        <textarea
          value={client.notes || ''}
          onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
          placeholder="Rédigez les notes, préférences, contre-indications et évolutions du patient..."
          className="w-full h-80 bg-white/40 border border-white rounded-[2rem] p-6 text-sm text-[#222F3E] placeholder:text-gray-300 resize-none focus:outline-none focus:ring-4 focus:ring-[#5F27CD]/5 focus:border-[#5F27CD] transition-all leading-relaxed"
        />
      </div>
    </div>
  );
}

/* ── EDITABLE FIELD LUXE ── */
function EditableField({
  label, value, onChange, type = 'text', icon,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <div className="flex items-center justify-between p-4 py-5 border-b border-gray-100 group-last:border-none hover:bg-white/40 transition-all rounded-xl">
        <div className="flex items-center gap-3 shrink-0">
          {icon && <span className="text-gray-300 group-hover:text-[#5F27CD] transition-colors">{icon}</span>}
          <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-gray-400">{label}</span>
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-sm font-bold text-[#222F3E] text-right bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-200 min-w-0 flex-1 hover:text-[#5F27CD]"
          placeholder="—"
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4 py-5 border-b border-gray-100 group-last:border-none">
      <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-gray-400">{label}</span>
      <span className="text-sm font-bold text-[#222F3E] leading-loose max-w-[200px] text-right">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SESSIONS TAB LUXE
   ══════════════════════════════════════════════════ */
function SessionsTab({
  clientAppts, onSelectAppt, totalDue, clientFirstName,
}: {
  clientAppts: Appointment[];
  onSelectAppt: (a: Appointment) => void;
  totalDue: number;
  clientFirstName: string;
}) {
  if (clientAppts.length === 0) {
    return (
      <div className="dash-card py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] mx-auto flex items-center justify-center text-gray-200">
            <Calendar size={40} strokeWidth={1} />
        </div>
        <div>
            <p className="text-xl font-sans font-medium text-[#222F3E]">Aucune séance enregistrée</p>
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mt-2">Le voyage de {clientFirstName} commence aujourd&apos;hui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sessions Grid */}
      <div className="dash-card overflow-hidden !p-2">
        {/* Header */}
        <div className="grid grid-cols-[120px_90px_1fr_120px_120px_64px] gap-4 px-8 h-12 items-center border-b border-gray-100 bg-white/60">
          {['Date', 'Heure', 'Rituel', 'Valeur', 'Statut', ''].map(h => (
            <span key={h} className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {clientAppts.map(appt => (
            <div
              key={appt.id}
              onClick={() => onSelectAppt(appt)}
              className="grid grid-cols-[120px_90px_1fr_120px_120px_64px] gap-4 px-8 h-16 items-center cursor-pointer hover:bg-white transition-all group"
            >
              <span className="text-xs font-bold text-gray-500">
                {appt.date ? format(new Date(appt.date), 'dd MMM yyyy', { locale: fr }) : 'Non planifié'}
              </span>
              <span className="text-xs font-bold text-gray-400">{appt.time || '—'}</span>
              <span className="text-base font-sans font-medium text-[#222F3E] group-hover:text-[#5F27CD] transition-colors truncate">{appt.serviceName || 'Session'}</span>
              <span className="text-sm font-bold text-[#222F3E]">{appt.price || 0}<span className="text-[10px] ml-0.5 opacity-40">CHF</span></span>
              
              <div className="flex">
                  <span className={`h-8 px-4 rounded-xl flex items-center text-[0.6rem] font-black uppercase tracking-widest border transition-all ${
                    appt.paid ? 'bg-emerald-50 text-[#1DD1A1] border-emerald-100' : 'bg-rose-50 text-[#FF6B6B] border-red-100 shadow-sm shadow-red-50'
                  }`}>
                    {appt.paid ? 'Réglé' : 'À Encaisser'}
                  </span>
              </div>
              
              <div className="flex justify-end">
                <ChevronRight size={18} className="text-gray-200 group-hover:text-[#5F27CD] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalDue > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50 border border-red-100 rounded-[2.5rem] px-8 py-8 flex items-center justify-between shadow-xl shadow-red-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B] text-white flex items-center justify-center shadow-lg shadow-red-100">
                <AlertCircle />
            </div>
            <div>
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#FF6B6B]">Action Financière Requise</p>
                <p className="text-2xl font-sans font-medium text-[#222F3E]">Solde débiteur à régulariser</p>
            </div>
          </div>
          <div className="text-right">
              <p className="text-4xl font-sans font-medium text-[#FF6B6B] leading-none mb-1">{totalDue}<span className="text-base ml-1 opacity-50">CHF</span></p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AlertCircle() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }

/* ══════════════════════════════════════════════════
   NOTES TAB LUXE
   ══════════════════════════════════════════════════ */
function NotesTab({ client, onUpdateClient }: { client: Client; onUpdateClient: (id: string, data: Partial<Client>) => void }) {
  return (
    <div className="space-y-6">
      <div className="dash-card border-none !bg-gradient-to-br from-[#5F27CD] to-[#0ABDE3] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <FileText size={180} />
        </div>
        <div className="relative z-10 space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
                 <ShieldCheck size={24} className="text-[#1DD1A1]" />
                 <h3 className="text-2xl font-sans font-medium">Sanctuaire de Suivi</h3>
            </div>
            <p className="text-sm opacity-80 leading-relaxed font-medium">Ce dossier contient l&apos;historique clinique confidentiel de {client.firstName}. Toutes les notes sont cryptées et réservées à votre usage professionnel exclusif.</p>
        </div>
      </div>

      <textarea
        value={client.notes || ''}
        onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
        placeholder="Rédigez l'évolution thérapeutique, les observations cliniques et les futurs axes de traitement..."
        className="w-full min-h-[500px] glass rounded-[3rem] p-12 text-base text-[#222F3E] leading-relaxed placeholder:text-gray-300 resize-none focus:outline-none focus:ring-8 focus:ring-[#5F27CD]/5 border border-white shadow-2xl"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   BILLING TAB LUXE
   ══════════════════════════════════════════════════ */
function BillingTab({
  clientAppts, totalPaid, totalDue, unpaidCount,
}: {
  clientAppts: Appointment[];
  totalPaid: number;
  totalDue: number;
  unpaidCount: number;
}) {
  const paidAppts = clientAppts.filter(a => a.paid && a.price);
  const unpaidAppts = clientAppts.filter(a => !a.paid && a.price);

  return (
    <div className="space-y-12">
      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="dash-card bg-[#1DD1A1]/5 border-[#1DD1A1]/10">
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#1DD1A1] mb-2">Total Honoraires Encaissés</p>
          <p className="text-4xl font-sans font-medium text-[#222F3E]">{totalPaid}<span className="text-base ml-1 opacity-50">CHF</span></p>
        </div>
        <div className="dash-card bg-[#FF6B6B]/5 border-red-100 shadow-xl shadow-red-50/20">
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#FF6B6B] mb-2">Encours à Percevoir</p>
          <p className="text-4xl font-sans font-medium text-[#FF6B6B]">{totalDue}<span className="text-base ml-1 opacity-50">CHF</span></p>
        </div>
        <div className="dash-card">
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2">Factures en suspens</p>
          <p className="text-4xl font-sans font-medium text-[#222F3E]">{unpaidCount}<span className="text-base ml-1 opacity-50">Dossiers</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Unpaid Transactions */}
        <div className="space-y-6">
          <h3 className="text-xl font-sans font-medium text-[#FF6B6B] px-2 flex items-center gap-3">
              <TrendingUp size={20} /> Transactions en Attente
          </h3>
          <div className="dash-card !p-0 overflow-hidden">
            {unpaidAppts.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {unpaidAppts.map(a => (
                        <div key={a.id} className="p-6 flex items-center justify-between hover:bg-white transition-all">
                            <div>
                                <p className="text-base font-sans font-medium text-[#222F3E]">{a.serviceName || 'Session'}</p>
                                <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mt-1">{a.date ? format(new Date(a.date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
                            </div>
                            <span className="text-2xl font-sans font-medium text-[#FF6B6B]">{a.price}<span className="text-xs ml-0.5 opacity-40">CHF</span></span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-300 italic font-medium">Tout est en ordre</div>
            )}
          </div>
        </div>

        {/* Paid History */}
        <div className="space-y-6">
          <h3 className="text-xl font-sans font-medium text-[#1DD1A1] px-2 flex items-center gap-3">
              <CheckCircle2 size={20} /> Historique des Honoraires
          </h3>
          <div className="dash-card !p-0 overflow-hidden border-[#1DD1A1]/10 bg-[#1DD1A1]/[0.02]">
            {paidAppts.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {paidAppts.slice(0, 10).map(a => (
                        <div key={a.id} className="p-6 flex items-center justify-between hover:bg-white transition-all">
                            <div>
                                <p className="text-base font-sans font-medium text-[#222F3E] opacity-70">{a.serviceName || 'Session'}</p>
                                <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mt-1">{a.date ? format(new Date(a.date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-sans font-medium text-[#222F3E]">{a.price}<span className="text-xs ml-0.5 opacity-40">CHF</span></span>
                                {a.paymentMethod && <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#1DD1A1] mt-1">{a.paymentMethod}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-300 italic">Aucune donnée</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
