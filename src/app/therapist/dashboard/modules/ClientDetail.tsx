import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft, Calendar, Mail, Phone, MapPin, CalendarPlus, FileText, Clock,
  MoreHorizontal, Plus, AlertCircle, Sparkles, Activity, CheckCircle2
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format, parseISO, isAfter } from 'date-fns';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'invoices' | 'notes'>('overview');
  const [editData, setEditData] = useState<any>({ ...client });

  useEffect(() => { setEditData({ ...client }); }, [client]);

  const updateField = useCallback((field: string, value: any) => {
    const safeValue = value === undefined ? '' : value;
    const next = { ...editData, [field]: safeValue };
    setEditData(next);
    onUpdateClient(client.id, next);
  }, [client.id, editData, onUpdateClient]);

  const clientAppts = useMemo(() =>
    [...appointments]
      .filter(a => a.clientId === client.id || a.clientNameSnapshot === `${client.firstName} ${client.lastName}`)
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [appointments, client],
  );

  const pastAppts = clientAppts.filter(a => !isAfter(new Date(a.date || ''), new Date()));
  const nextAppts = clientAppts.filter(a => isAfter(new Date(a.date || ''), new Date())).reverse();
  const nextAppt = nextAppts[0];

  const totalDue = clientAppts.filter(a => !a.paid && a.price && a.status !== 'cancelled').reduce((s, a) => s + (a.price || 0), 0);
  const totalPaid = clientAppts.filter(a => a.paid && a.price).reduce((s, a) => s + (a.price || 0), 0);

  const TABS = [
    { id: 'overview' as const, label: 'Aperçu' },
    { id: 'sessions' as const, label: `Séances (${clientAppts.length})` },
    { id: 'invoices' as const, label: 'Factures' },
    { id: 'notes' as const, label: 'Notes & Fichiers' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F2EE] animate-in fade-in duration-500 overflow-hidden">
      
      {/* ── HEADER BREADCRUMB ── */}
      <header className="px-10 pt-10 pb-6 shrink-0 flex items-center justify-between">
         <div className="flex items-center gap-2 text-[13px] text-earth/50 font-bold uppercase tracking-widest">
            <button onClick={onClose} className="hover:text-onyx transition-all flex items-center gap-1"><ChevronLeft size={16}/> Clients</button>
            <span className="opacity-40">/</span>
            <span className="text-onyx">{client.firstName} {client.lastName}</span>
         </div>
         <button onClick={onClose} className="w-10 h-10 bg-white border border-border/20 rounded-full flex items-center justify-center text-onyx hover:bg-bg-soft transition-all shadow-sm">
            <ChevronLeft size={18} className="mr-0.5" />
         </button>
      </header>

      {/* ── MAIN GRID ── */}
      <main className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          
          {/* LEFT SIDEBAR (PROFILE CARD) */}
          <div className="bg-white rounded-[32px] border border-border/10 shadow-sm flex flex-col overflow-hidden">
             
             {/* Identity Hero */}
             <div className="p-10 flex flex-col items-center text-center border-b border-border/10">
                <div className="w-24 h-24 rounded-full bg-onyx text-neon flex items-center justify-center font-semibold text-[32px] mb-6 shadow-xl shadow-onyx/10 uppercase">
                   {client.lastName?.charAt(0)}
                </div>
                <h2 className="text-[24px] font-semibold text-onyx tracking-tighter uppercase leading-tight">{client.firstName} {client.lastName}</h2>
                <span className="text-[13px] font-bold text-earth/50 uppercase tracking-widest mt-1 mb-6">Client Régulier</span>

                <div className="flex gap-8 justify-center mb-8 w-full">
                   <div className="flex flex-col items-center">
                      <span className="text-[18px] font-semibold text-onyx">{clientAppts.length}</span>
                      <span className="text-[11px] font-bold text-earth/40 uppercase tracking-widest">Séances</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className={`text-[18px] font-semibold ${totalDue > 0 ? 'text-[#FF6B61]' : 'text-onyx'}`}>{totalDue > 0 ? `-${totalDue}` : '0'} CHF</span>
                      <span className="text-[11px] font-bold text-earth/40 uppercase tracking-widest">Solde</span>
                   </div>
                   <div className="flex flex-col items-center justify-center pt-1">
                      <span className="px-3 py-1 bg-[#E1FBB8] text-forest rounded-full text-[10px] font-semibold uppercase tracking-widest">Actif</span>
                   </div>
                </div>

                <div className="flex gap-3 w-full">
                   <a href={`mailto:${editData.email}`} className="flex-1 h-12 bg-white border border-border/20 rounded-full flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-onyx hover:bg-bg-soft transition-all shadow-sm">
                      <Mail size={16}/> Msg
                   </a>
                   <button className="flex-1 h-12 bg-onyx text-white rounded-full flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-widest shadow-xl shadow-onyx/20 hover:bg-forest transition-all">
                      <CalendarPlus size={16}/> RDV
                   </button>
                </div>
             </div>

             {/* Contact Details */}
             <div className="p-8 flex flex-col gap-6 bg-bg-soft/30">
                <EditableRow icon={Phone} label="Téléphone" value={editData.phone || ''} onChange={(v:any) => updateField('phone', v)} />
                <EditableRow icon={Mail} label="Email" value={editData.email || ''} onChange={(v:any) => updateField('email', v)} />
                <EditableRow icon={MapPin} label="Adresse" value={editData.city ? `${editData.street || ''}, ${editData.city}` : ''} onChange={(v:any) => updateField('city', v)} />
                <div className="flex items-start gap-4 p-2">
                   <Calendar size={18} className="text-earth/30 mt-0.5 shrink-0" />
                   <div className="flex flex-col gap-1 w-full">
                      <span className="text-[11px] font-bold text-earth/40 uppercase tracking-widest">Dernière séance</span>
                      <span className="text-[14px] font-semibold text-onyx bg-transparent uppercase">
                         {pastAppts.length > 0 && pastAppts[0].date ? format(new Date(pastAppts[0].date), 'd MMMM yyyy', { locale: fr }) : 'Aucune'}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="bg-white rounded-[32px] border border-border/10 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
             
             {/* Custom Tabs */}
             <div className="flex px-10 border-b border-border/10 gap-8">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`h-16 relative text-[13px] font-semibold uppercase tracking-widest transition-all ${
                      activeTab === t.id ? 'text-onyx' : 'text-earth/40 hover:text-onyx'
                    }`}
                  >
                     {t.label}
                     {activeTab === t.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-onyx rounded-t-full" />
                     )}
                  </button>
                ))}
             </div>

             <div className="p-10 flex flex-col gap-10">
                {activeTab === 'overview' && (
                   <div className="space-y-10 animate-in fade-in duration-500">
                      
                      {/* Prochaine Séance Widget */}
                      {nextAppt ? (
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="text-[16px] font-semibold text-onyx uppercase tracking-widest">Prochaine séance</h3>
                               <button className="text-[11px] font-semibold text-earth/40 uppercase tracking-widest hover:text-onyx">Voir l'agenda</button>
                            </div>
                            <div className="p-4 rounded-[24px] border border-border/10 bg-bg-soft/20 flex items-center gap-6">
                               <div className="min-w-[80px] bg-[#E1FBB8] text-forest rounded-[16px] p-3 flex flex-col items-center justify-center">
                                  <span className="text-[28px] font-semibold leading-none">{format(new Date(nextAppt.date!), 'd')}</span>
                                  <span className="text-[11px] font-semibold uppercase tracking-widest mt-1">{format(new Date(nextAppt.date!), 'MMM', { locale: fr })}</span>
                               </div>
                               <div className="flex flex-col gap-1 flex-1">
                                  <span className="text-[16px] font-semibold text-onyx uppercase">{nextAppt.serviceName || 'Séance Standard'}</span>
                                  <span className="text-[13px] font-bold text-earth/50 flex items-center gap-2 mt-1">
                                     <Clock size={14}/> {nextAppt.time} (1h)
                                  </span>
                               </div>
                               <button 
                                 onClick={() => onSelectAppt(nextAppt)} 
                                 className="h-10 px-5 bg-white border border-border/20 rounded-full text-[11px] font-semibold text-onyx uppercase tracking-widest hover:bg-bg-soft shadow-sm"
                               >
                                  Reprogrammer
                               </button>
                            </div>
                         </div>
                      ) : (
                         <div className="p-8 rounded-[24px] border border-dashed border-border/40 text-center flex flex-col items-center gap-3">
                            <span className="text-[12px] font-semibold text-earth/40 uppercase tracking-widest">Aucune séance prévue</span>
                            <button className="h-10 px-6 bg-onyx text-white rounded-full text-[11px] font-semibold uppercase tracking-widest shadow-lg">Planifier un RDV</button>
                         </div>
                      )}

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-6 border-t border-border/5">
                         
                         {/* Dernière Note */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="text-[16px] font-semibold text-onyx uppercase tracking-widest">Dernière note</h3>
                               <button className="text-[11px] font-semibold text-earth/40 uppercase tracking-widest hover:text-onyx"><Plus size={16}/></button>
                            </div>
                            <div className="h-[200px] p-6 rounded-[24px] bg-bg-soft/70 border border-border/10 flex flex-col">
                               <textarea 
                                  value={editData.notes || ''}
                                  onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                  onBlur={() => updateField('notes', editData.notes)}
                                  className="w-full flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-onyx resize-none leading-relaxed placeholder:text-earth/30"
                                  placeholder="Historique ou observations cliniques..."
                               />
                               <span className="text-[10px] font-bold text-earth/40 uppercase tracking-widest mt-4">Dossier Actif</span>
                            </div>
                         </div>

                         {/* Mini Factures */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="text-[16px] font-semibold text-onyx uppercase tracking-widest">Factures récentes</h3>
                               <button onClick={() => setActiveTab('invoices')} className="text-[11px] font-semibold text-earth/40 uppercase tracking-widest hover:text-onyx">Tout voir</button>
                            </div>
                            <div className="flex flex-col">
                               {clientAppts.filter(a => a.price).slice(0, 3).map((inv, i) => (
                                 <div key={i} className="flex items-center justify-between py-4 border-b border-border/5 last:border-0 hover:bg-bg-soft/50 px-2 rounded-xl transition-all cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                       <span className="text-[13px] font-semibold text-onyx uppercase">FAC-{inv.date?.replace(/-/g, '')}</span>
                                       <span className="text-[11px] font-bold text-earth/40">{inv.date}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <span className="text-[14px] font-semibold text-onyx">{inv.price} CHF</span>
                                       <span className={`px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest ${inv.paid ? 'bg-bg-soft text-earth/50' : 'bg-[#FF6B61]/10 text-[#FF6B61]'}`}>
                                          {inv.paid ? 'Payé' : 'Impayé'}
                                       </span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>

                      </div>
                   </div>
                )}

                {activeTab === 'sessions' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      {clientAppts.map(appt => (
                         <div key={appt.id} onClick={() => onSelectAppt(appt)} className="flex items-center justify-between p-6 rounded-[24px] border border-border/10 hover:border-onyx/20 hover:shadow-lg transition-all cursor-pointer bg-white">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-bg-soft rounded-[16px] flex flex-col items-center justify-center">
                                  <span className="text-[16px] font-semibold text-onyx leading-none">{format(new Date(appt.date || ''), 'd')}</span>
                                  <span className="text-[9px] font-semibold uppercase tracking-widest mt-1 text-earth/40">{format(new Date(appt.date || ''), 'MMM', { locale: fr })}</span>
                               </div>
                               <div className="flex flex-col gap-1">
                                  <span className="text-[15px] font-semibold text-onyx uppercase">{appt.serviceName || 'Séance Standard'}</span>
                                  <span className="text-[12px] font-bold text-earth/40">{appt.time} (1h)</span>
                               </div>
                            </div>
                            <span className="text-[14px] font-semibold text-onyx">{appt.price || 150} CHF</span>
                         </div>
                      ))}
                      {clientAppts.length === 0 && <div className="py-20 text-center font-semibold text-earth/30 uppercase tracking-widest text-[12px]">Aucune séance enregistrée</div>}
                   </div>
                )}

                {activeTab === 'invoices' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-[#E1FBB8] rounded-[32px] p-10 flex flex-col justify-between min-h-[220px]">
                         <span className="text-[11px] font-semibold text-forest uppercase tracking-[0.2em] block mb-4">Total encaissé</span>
                         <div className="flex items-end gap-2 text-onyx">
                            <span className="text-[48px] font-semibold leading-none tracking-tighter">{totalPaid}</span>
                            <span className="text-[16px] font-bold mb-2">CHF</span>
                         </div>
                         <div className="mt-6 flex items-center gap-2 text-forest/70 font-semibold text-[11px] uppercase tracking-widest">
                            <CheckCircle2 size={16}/> Transactions vérifiées
                         </div>
                      </div>
                      <div className={`${totalDue > 0 ? 'bg-[#FF6B61] text-white' : 'bg-bg-soft text-earth/30'} rounded-[32px] p-10 flex flex-col justify-between min-h-[220px] transition-all`}>
                         <span className="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-4 opacity-70 text-inherit">Solde à percevoir</span>
                         <div className="flex items-end gap-2 text-inherit">
                            <span className="text-[48px] font-semibold leading-none tracking-tighter">{totalDue}</span>
                            <span className="text-[16px] font-bold mb-2">CHF</span>
                         </div>
                         {totalDue > 0 && <button className="mt-4 py-3 px-8 bg-white text-onyx rounded-full text-[11px] font-semibold uppercase tracking-widest hover:bg-white/90 truncate self-start shadow-xl">Relancer</button>}
                      </div>
                   </div>
                )}

                {activeTab === 'notes' && (
                   <div className="animate-in fade-in slide-in-from-right-4">
                      <textarea 
                         value={editData.notes || ''}
                         onChange={e => setEditData({ ...editData, notes: e.target.value })}
                         onBlur={() => updateField('notes', editData.notes)}
                         className="w-full h-[500px] bg-bg-soft/30 rounded-[32px] p-10 text-[16px] font-medium leading-relaxed text-onyx outline-none focus:ring-1 focus:ring-onyx transition-all resize-none border border-border/10"
                         placeholder="Commencez à rédiger vos observations cliniques ici..."
                      />
                   </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EditableRow({ label, value, onChange, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-4 p-2 group bg-transparent focus-within:bg-white focus-within:ring-1 focus-within:ring-border/20 focus-within:shadow-sm rounded-xl transition-all">
       <Icon size={18} className="text-earth/30 mt-1 shrink-0 group-focus-within:text-onyx transition-all" />
       <div className="flex flex-col gap-1 w-full">
          <span className="text-[11px] font-bold text-earth/40 uppercase tracking-widest">{label}</span>
          <input 
             value={value}
             onChange={e => onChange(e.target.value)}
             className="bg-transparent border-none outline-none font-semibold text-onyx text-[14px] placeholder:text-earth/20 uppercase tracking-tight w-full"
             placeholder="—"
          />
       </div>
    </div>
  );
}
