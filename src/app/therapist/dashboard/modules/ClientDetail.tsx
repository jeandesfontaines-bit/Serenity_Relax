'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  ChevronRight, CreditCard, ShieldCheck, Phone, MapPin, Shield, Plus, 
  FileText, MoreVertical, Calendar, Clock, Edit3, ArrowLeft, Mail,
  Zap, Heart, Info, ArrowRight, User, BarChart
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment, Client } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
  onScheduleClient: (client: Client) => void;
}

export default function ClientDetail({
  client,
  onClose,
  appointments,
  onSelectAppt,
  onUpdateClient,
  onScheduleClient,
}: ClientDetailProps) {
  const [editData, setEditData] = useState<Partial<Client>>({ ...client });

  useEffect(() => {
    setEditData({ ...client });
  }, [client]);

  const clientAppts = useMemo(() =>
    [...appointments]
      .filter((appt) => appt.clientId === client.id || (client.firstName && appt.clientNameSnapshot === `${client.firstName} ${client.lastName}`))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [appointments, client],
  );

  const completedAppts = clientAppts.filter((appt) => appt.date && appt.time && (appt.date < format(new Date(), 'yyyy-MM-dd')));
  const confirmedAppts = clientAppts.filter((appt) => appt.date && appt.time && (appt.date >= format(new Date(), 'yyyy-MM-dd'))).slice(0, 2);
  
  const unpaidCount = clientAppts.filter((appt) => !appt.paid && appt.price).length;
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';
  const clientInitials = (client.initials || `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}` || 'CL').slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8] text-neutral-900 scrollbar-hide">
      <main className="max-w-[1600px] mx-auto p-16 lg:p-24 space-y-20">
        
        {/* ── Page Header ── */}
        <div className="flex items-end justify-between border-b border-neutral-200 pb-12">
          <div className="flex items-center gap-10">
            <button onClick={onClose} className="w-16 h-16 flex items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm hover:scale-110 transition-all group">
              <ArrowLeft className="text-neutral-600 group-hover:-translate-x-1 transition-transform" size={24} strokeWidth={2.5} />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.38em] text-neutral-600 mb-2 leading-none">DOSSIER PATIENT</p>
              <h1 className="text-7xl font-bold text-neutral-900 tracking-tighter leading-none">
                {fullName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
              <button 
                onClick={() => onScheduleClient(client)}
                className="h-16 px-10 rounded-full bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-[0.28em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4"
              >
                <Plus size={18} strokeWidth={3} /> NOUVELLE SÉANCE
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-24 items-start">
          
          {/* ── Profile Sidebar ── */}
          <aside className="space-y-12 sticky top-24">
            <div className="bg-white rounded-[4rem] p-12 border border-neutral-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-12">
              <div className="flex flex-col items-center text-center space-y-10">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[3.5rem] bg-neutral-900 flex items-center justify-center text-6xl font-bold text-white shadow-2xl transform group-hover:rotate-3 transition-all duration-700">
                    {clientInitials}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border border-neutral-200 text-neutral-500">
                    <User size={24} strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-center gap-x-2 text-4xl font-bold text-neutral-900 tracking-tighter leading-none">
                    <EditableField 
                      label="Prénom" 
                      value={editData.firstName || ''} 
                      onChange={(val) => onUpdateClient(client.id, { firstName: val })} 
                    />
                    <EditableField 
                      label="Nom" 
                      value={editData.lastName || ''} 
                      onChange={(val) => onUpdateClient(client.id, { lastName: val })} 
                    />
                  </div>
                  <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-neutral-600">
                    <EditableField 
                      label="Email" 
                      value={editData.email || ''} 
                      onChange={(val) => onUpdateClient(client.id, { email: val })} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-10 pt-12 border-t border-neutral-200">
                <SidebarRow 
                  icon={<Phone size={20} strokeWidth={2.5} />} 
                  label="CONTACT"
                  value={
                    <EditableField 
                      label="Téléphone" 
                      value={editData.phone || ''} 
                      onChange={(val) => onUpdateClient(client.id, { phone: val })} 
                    />
                  } 
                />
                <SidebarRow 
                  icon={<MapPin size={20} strokeWidth={2.5} />} 
                  label="ADRESSE"
                  value={
                    <div className="space-y-2">
                      <EditableField 
                        label="Rue" 
                        value={editData.street || ''} 
                        onChange={(val) => onUpdateClient(client.id, { street: val })} 
                      />
                      <EditableField 
                        label="Ville" 
                        value={editData.city || ''} 
                        onChange={(val) => onUpdateClient(client.id, { city: val })} 
                      />
                    </div>
                  } 
                />
                <SidebarRow 
                  icon={<ShieldCheck size={20} strokeWidth={2.5} />} 
                  label="ASSURANCE"
                  value={
                    <EditableField 
                      label="Assurance" 
                      value={editData.insurance || ''} 
                      onChange={(val) => onUpdateClient(client.id, { insurance: val })} 
                    />
                  } 
                />
              </div>

              <div className="pt-10">
                <button className="w-full flex items-center justify-center gap-4 h-16 rounded-full border-2 border-neutral-200 text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-700 hover:text-neutral-900 hover:border-neutral-900 transition-all group">
                  <FileText size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" /> ARCHIVES FINANCIÈRES
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-2 group hover:-translate-y-1 transition-transform">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">TOTAL</p>
                  <p className="text-5xl font-bold tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left">{clientAppts.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">SÉANCES</p>
               </div>
               <div className={`rounded-[3rem] p-10 shadow-xl space-y-2 group hover:-translate-y-1 transition-transform ${unpaidCount > 0 ? 'bg-red-500 text-white' : 'bg-white border border-neutral-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${unpaidCount > 0 ? 'text-white/45' : 'text-neutral-600'}`}>OUVERTES</p>
                  <p className="text-5xl font-bold tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left">{unpaidCount}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${unpaidCount > 0 ? 'text-white/45' : 'text-neutral-500'}`}>FACTURES</p>
               </div>
            </div>
          </aside>

          {/* ── Main Dashboard ── */}
          <div className="space-y-32">
            
            {/* Prochains Rendez-vous */}
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-8">
                <div>
                  <h3 className="text-5xl font-bold text-neutral-900 tracking-tighter leading-none">Prochaines Séances</h3>
                  <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-neutral-600 mt-4 leading-none">PLANIFICATION ACTIVE</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {confirmedAppts.length > 0 ? (
                  confirmedAppts.map((appt, i) => (
                    <ConfirmedCard 
                      key={appt.id} 
                      appt={appt} 
                      variant={i === 0 ? 'dark' : 'light'} 
                      onClick={() => onSelectAppt(appt)} 
                    />
                  ))
                ) : (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center bg-neutral-100 rounded-[4rem] border-2 border-dashed border-neutral-300 group">
                    <Calendar size={64} strokeWidth={1.25} className="text-neutral-400 mb-8 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-neutral-600 font-bold text-[12px] uppercase tracking-[0.32em]">Aucune planification en cours</p>
                  </div>
                )}
              </div>
            </section>

            {/* Historique Chronologique */}
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-8">
                <div>
                  <h3 className="text-5xl font-bold text-neutral-900 tracking-tighter leading-none">Historique Complet</h3>
                  <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-neutral-600 mt-4 leading-none">CHRONOLOGIE DES SOINS</p>
                </div>
              </div>
              <div className="space-y-6">
                {completedAppts.length > 0 ? (
                  completedAppts.map((appt) => (
                    <HistoryRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} />
                  ))
                ) : (
                  <div className="py-20 px-12 bg-neutral-100 rounded-[3rem] border border-neutral-200">
                    <p className="text-neutral-700 font-bold text-xl tracking-tighter">Nouveau patient sans historique enregistré.</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-8 group">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-all shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-600 mb-2 leading-none">{label}</p>
        <div className="text-lg font-bold text-neutral-900 tracking-tighter leading-none">{value}</div>
      </div>
    </div>
  );
}

function ConfirmedCard({ appt, variant, onClick }: { appt: Appointment, variant: 'dark' | 'light', onClick: () => void }) {
  const isDark = variant === 'dark';
  
  return (
    <button 
      onClick={onClick}
      className={`${isDark ? 'bg-neutral-900 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]' : 'bg-white text-neutral-900 border border-neutral-100 shadow-xl'} rounded-[4rem] p-12 text-left transition-all hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] group relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-20">
        <div className={`flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.24em] ${isDark ? 'text-white/50' : 'text-neutral-600'}`}>
          <Clock size={18} strokeWidth={2.5} />
          <span>{appt.time || '10:00'} — {appt.endTime || '11:00'}</span>
        </div>
        <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-600'} group-hover:scale-110`}>
          <ArrowRight size={24} strokeWidth={3} />
        </div>
      </div>
      
      <h4 className="text-4xl font-bold tracking-tighter leading-none mb-10">
        {appt.serviceName || 'Soin Holistique'}
      </h4>
      
      <div className="flex items-center gap-6">
        <span className={`${isDark ? 'bg-white text-neutral-900 shadow-[0_10px_30px_rgba(255,255,255,0.2)]' : 'bg-neutral-900 text-white shadow-xl'} text-[9px] font-bold uppercase tracking-[0.3em] px-8 py-3 rounded-full`}>
          CONFIRMÉ
        </span>
        <span className={`${isDark ? 'text-white/40' : 'text-neutral-500'} font-bold text-[12px] tracking-widest`}>
           {appt.duration || '60 MIN'}
        </span>
      </div>
    </button>
  );
}

function HistoryRow({ appt, onClick }: { appt: Appointment, onClick: () => void }) {
  const dateObj = appt.date ? parseISO(appt.date) : new Date();
  const day = format(dateObj, 'd');
  const month = format(dateObj, 'MMM', { locale: fr }).toUpperCase();

  return (
    <button 
      onClick={onClick}
      className="w-full bg-white border border-neutral-200 rounded-[3rem] p-10 flex items-center gap-12 hover:bg-neutral-900 hover:text-white transition-all group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center w-24 h-24 border-r border-neutral-200 pr-12 group-hover:border-white/10 transition-colors">
        <span className="text-4xl font-bold leading-none tracking-tighter">{day}</span>
        <span className="text-[11px] font-bold text-neutral-600 tracking-[0.28em] mt-3 group-hover:text-white/45 leading-none">{month}</span>
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-3xl font-bold tracking-tighter leading-none transition-all">
          {appt.serviceName || 'Soin Signature'}
        </h4>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-3">
             <Clock size={14} strokeWidth={2.5} className="text-neutral-500 group-hover:text-white/30" />
             <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-[0.16em] group-hover:text-white/45">
               {appt.time || '09:00'} - {appt.endTime || '10:00'}
             </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-100 group-hover:bg-white/10" />
          <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-[0.16em] group-hover:text-white/45">
             {appt.duration || '45 MIN'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm transition-all border ${
          appt.paid 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-500 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white' 
            : 'bg-neutral-100 border-neutral-200 text-neutral-700 group-hover:bg-white/10 group-hover:border-white/10 group-hover:text-white/45'
        }`}>
          {appt.paid ? 'PAYÉ' : 'EN ATTENTE'}
        </div>
        <div className="w-14 h-14 flex items-center justify-center rounded-full text-neutral-400 group-hover:text-white group-hover:scale-110 transition-all">
          <ArrowRight size={28} strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  return editing ? (
    <input
      ref={inputRef}
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKey}
      placeholder={label}
      className="w-full bg-transparent outline-none border-b-4 border-neutral-900 transition-all py-1 font-bold text-neutral-900"
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className="cursor-text hover:bg-neutral-100 rounded-xl px-2 -mx-2 transition-all flex items-center group/edit"
    >
      <span className="truncate">{value || <span className="text-neutral-400 font-normal">{label}</span>}</span>
      <Edit3 size={14} className="ml-3 text-neutral-400 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
    </div>
  );
}
