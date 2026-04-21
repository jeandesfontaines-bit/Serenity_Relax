import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft, Calendar, Mail, Phone, MapPin, ShieldCheck, FileText, Clock,
  MoreHorizontal, Trash2, Send, Edit2, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
  onCancelAppt: (id: string) => void;
  onResendConfirmation: (appt: Appointment) => void;
}

export default function ClientDetail({
  client, onClose, appointments, onSelectAppt, onUpdateClient, onCancelAppt, onResendConfirmation,
}: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes' | 'billing'>('overview');
  const [editData, setEditData] = useState<any>({ ...client });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => { setEditData({ ...client }); }, [client]);

  const updateField = useCallback((field: string, value: any) => {
    const next = { ...editData, [field]: value };
    setEditData(next);
    setSaveStatus('saving');
    onUpdateClient(client.id, next);
    setTimeout(() => setSaveStatus('saved'), 600);
    setTimeout(() => setSaveStatus('idle'), 3000);
  }, [client.id, editData, onUpdateClient]);

  const clientAppts = useMemo(() =>
    [...appointments]
      .filter(a => a.clientId === client.id || a.clientNameSnapshot === `${client.firstName} ${client.lastName}`)
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [appointments, client],
  );

  const totalDue = clientAppts.filter(a => !a.paid && a.price && a.status !== 'cancelled').reduce((s, a) => s + (a.price || 0), 0);
  const totalPaid = clientAppts.filter(a => a.paid && a.price).reduce((s, a) => s + (a.price || 0), 0);

  const TABS = [
    { id: 'overview' as const, label: 'Identité' },
    { id: 'notes' as const, label: 'Dossier Clinique' },
    { id: 'sessions' as const, label: 'Sessions', count: clientAppts.length },
    { id: 'billing' as const, label: 'Finance' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F2EE] animate-in fade-in duration-500 overflow-hidden">
      
      {/* ── HEADER MAG STYLE ── */}
      <header className="h-24 bg-white border-b border-border/10 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="w-12 h-12 bg-bg-soft rounded-full flex items-center justify-center text-onyx hover:bg-white border border-transparent hover:border-border transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[28px] font-black text-onyx tracking-tighter uppercase leading-none">
                {client.lastName} {client.firstName}
              </h2>
              {saveStatus !== 'idle' && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 ${saveStatus === 'saving' ? 'bg-ochre/10 text-ochre' : 'bg-forest/10 text-forest'}`}>
                  {saveStatus === 'saving' ? 'Sync...' : 'Sauvegardé'}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-earth/40 uppercase tracking-[0.2em] mt-1">Dossier N° {client.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <a href={`tel:${editData.phone}`} className="w-12 h-12 bg-white border border-border/30 rounded-full flex items-center justify-center text-earth/60 hover:text-onyx transition-all"><Phone size={20}/></a>
           <a href={`mailto:${editData.email}`} className="w-12 h-12 bg-white border border-border/30 rounded-full flex items-center justify-center text-earth/60 hover:text-onyx transition-all"><Mail size={20}/></a>
           <button className="h-12 px-8 bg-onyx text-white rounded-full font-black text-[13px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-onyx/20 transition-all flex items-center gap-2 ml-4">
             <Calendar size={16}/> Séance
           </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-10">
          
          {/* Identity Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
             <div className="bg-white rounded-[32px] p-10 shadow-sm flex flex-col items-center text-center">
                <div className={`w-32 h-32 rounded-[28px] ${client.color || 'bg-bg-soft'} flex items-center justify-center text-[48px] font-black text-onyx shadow-inner shrink-0 uppercase mb-6`}>
                  {client.lastName?.[0]}{client.firstName?.[0]}
                </div>
                <h1 className="text-[32px] font-black text-onyx tracking-tighter uppercase leading-tight mb-2">{client.lastName} {client.firstName}</h1>
                <div className="flex flex-col gap-1 items-center mb-6">
                   <span className="text-[12px] font-bold text-earth/40 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={12}/> {clientAppts.length} Séances total
                   </span>
                   <span className="text-[12px] font-bold text-earth/40 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={12}/> Actif depuis {format(new Date(), 'yyyy')}
                   </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {(editData.tags || []).map((t: string) => (
                    <span key={t} className="px-4 py-1.5 bg-bg-soft border border-border/50 text-onyx rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      {t}
                      <button onClick={(e) => { e.stopPropagation(); const next = editData.tags.filter((tag:any) => tag !== t); updateField('tags', next); }} className="hover:text-[#F1664D]">×</button>
                    </span>
                  ))}
                  <button className="px-4 py-1.5 bg-white border border-dashed border-border text-earth/40 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-onyx hover:text-onyx transition-all">
                    + Tag
                  </button>
                </div>
             </div>

             <div className="flex flex-col gap-6">
                {/* Tabs Navigation */}
                <div className="bg-white rounded-full p-2 border border-border/10 flex items-center gap-2 shadow-xs self-start">
                   {TABS.map(t => (
                     <button
                       key={t.id}
                       onClick={() => setActiveTab(t.id)}
                       className={`px-8 py-3 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${
                         activeTab === t.id ? 'bg-onyx text-neon shadow-lg ring-1 ring-onyx' : 'text-earth/50 hover:text-onyx'
                       }`}
                     >
                        {t.label} {t.count !== undefined && <span className="ml-2 opacity-40">{t.count}</span>}
                     </button>
                   ))}
                </div>

                <div className="flex-1">
                   {activeTab === 'overview' && (
                     <div className="bg-white rounded-[32px] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/10">
                           <MapPin size={24} className="text-earth/40" />
                           <h3 className="text-[20px] font-black text-onyx uppercase tracking-tighter">Coordonnées & Résidence</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                           <EditableRow label="Email" value={editData.email || ''} onChange={(v:any) => updateField('email', v)} icon={<Mail size={16}/>} />
                           <EditableRow label="Téléphone" value={editData.phone || ''} onChange={(v:any) => updateField('phone', v)} icon={<Phone size={16}/>} />
                           <EditableRow label="Adresse" value={editData.street || ''} onChange={(v:any) => updateField('street', v)} />
                           <EditableRow label="NPA / Ville" value={`${editData.zip || ''} ${editData.city || ''}`} onChange={(v:any) => {
                              const [zip, ...city] = v.split(' ');
                              updateField('zip', zip);
                              updateField('city', city.join(' '));
                           }} />
                           <EditableRow label="Assurance" value={editData.insurance || ''} onChange={(v:any) => updateField('insurance', v)} icon={<ShieldCheck size={16}/>} />
                           <EditableRow label="Canton" value={editData.canton || ''} onChange={(v:any) => updateField('canton', v)} />
                        </div>
                     </div>
                   )}
                   
                   {activeTab === 'notes' && (
                     <div className="bg-white rounded-[32px] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/10">
                           <div className="flex items-center gap-4">
                              <FileText size={24} className="text-earth/40" />
                              <h3 className="text-[20px] font-black text-onyx uppercase tracking-tighter">Dossier Thérapeutique</h3>
                           </div>
                           <span className="px-4 py-1.5 bg-forest/10 text-forest rounded-full text-[11px] font-black uppercase flex items-center gap-2">
                             <ShieldCheck size={14}/> Sécurisé
                           </span>
                        </div>
                        <textarea 
                           value={editData.notes || ''}
                           onChange={e => setEditData({ ...editData, notes: e.target.value })}
                           onBlur={() => updateField('notes', editData.notes)}
                           className="w-full h-[400px] bg-bg-soft/50 rounded-[24px] p-8 text-[16px] font-medium leading-relaxed text-onyx outline-none focus:ring-1 focus:ring-neon/50 focus:bg-white transition-all shadow-inner resize-none"
                           placeholder="Commencez à rédiger vos observations cliniques ici..."
                        />
                     </div>
                   )}

                   {activeTab === 'sessions' && (
                     <div className="bg-white rounded-[32px] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 border-b border-border/10 bg-bg-soft/30 flex items-center justify-between">
                           <h3 className="text-[18px] font-black text-onyx uppercase tracking-tighter">Historique des séances</h3>
                        </div>
                        <div className="divide-y divide-border/5">
                           {clientAppts.map(appt => (
                             <div key={appt.id} onClick={() => onSelectAppt(appt)} className="px-10 h-20 grid grid-cols-[1.5fr_1fr_100px_100px] items-center hover:bg-bg-soft/50 cursor-pointer transition-all">
                                <div className="flex flex-col">
                                   <span className="text-[15px] font-black text-onyx uppercase tracking-tight">{appt.serviceName || 'Séance'}</span>
                                   <span className="text-[11px] font-bold text-earth/40 uppercase tracking-widest">{appt.time}</span>
                                </div>
                                <span className="text-[14px] font-bold text-earth">{appt.date}</span>
                                <span className="text-[14px] font-black text-onyx tabular-nums">{appt.price || 150} CHF</span>
                                <div className="flex justify-end gap-2">
                                   <button onClick={(e) => { e.stopPropagation(); onSelectAppt(appt); }} className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-earth/30 hover:text-onyx transition-all"><Edit2 size={16}/></button>
                                </div>
                             </div>
                           ))}
                           {clientAppts.length === 0 && (
                             <div className="py-20 text-center text-earth/20 font-black uppercase tracking-widest">Aucune séance</div>
                           )}
                        </div>
                     </div>
                   )}

                   {activeTab === 'billing' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#E1FBB8] rounded-[32px] p-10 flex flex-col justify-between min-h-[220px]">
                           <span className="text-[11px] font-black text-forest uppercase tracking-[0.2em] block mb-4">Total encaissé</span>
                           <div className="flex items-end gap-2 text-onyx">
                              <span className="text-[48px] font-black leading-none tracking-tighter">{totalPaid}</span>
                              <span className="text-[16px] font-bold mb-2">CHF</span>
                           </div>
                           <div className="mt-6 flex items-center gap-2 text-forest/70 font-bold text-[13px]">
                              <CheckCircle2 size={16}/> En règle
                           </div>
                        </div>
                        <div className={`${totalDue > 0 ? 'bg-[#FF6B61] text-white' : 'bg-bg-soft text-earth/30'} rounded-[32px] p-10 flex flex-col justify-between min-h-[220px] transition-all`}>
                           <span className="text-[11px] font-black uppercase tracking-[0.2em] block mb-4 opacity-70 text-inherit">Solde à percevoir</span>
                           <div className="flex items-end gap-2 text-inherit">
                              <span className="text-[48px] font-black leading-none tracking-tighter">{totalDue}</span>
                              <span className="text-[16px] font-bold mb-2">CHF</span>
                           </div>
                           {totalDue > 0 && <button className="mt-4 py-2 px-6 bg-white/20 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white/30 truncate">Relancer maintenant</button>}
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function EditableRow({ label, value, onChange, icon }: any) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-bg-soft/30 rounded-2xl border border-border/5 border-transparent hover:border-border/10 focus-within:bg-white focus-within:shadow-sm transition-all group">
       <div className="flex items-center gap-2 text-[10px] font-black text-earth/30 uppercase tracking-widest group-focus-within:text-forest transition-all">
         {icon} {label}
       </div>
       <input 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="bg-transparent border-none outline-none font-black text-onyx text-[15px] placeholder:text-earth/10 uppercase tracking-tight"
          placeholder="Non renseigné"
       />
    </div>
  );
}
