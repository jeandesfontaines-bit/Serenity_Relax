import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Plus,
  Mail, Phone, MapPin, ShieldCheck, FileText, Clock,
  MoreHorizontal, Trash2, Send, Edit2, AlertCircle
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── PROPS ── */
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

  const toggleTag = (tag: string) => {
    const currentTags = (editData.tags || []) as string[];
    const nextTags = currentTags.includes(tag) 
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateField('tags', nextTags);
  };

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
  const lastAppt = clientAppts.find(a => a.date && a.time);

  const TABS = [
    { id: 'overview' as const, label: 'Aperçu' },
    { id: 'sessions' as const, label: 'Séances', count: clientAppts.length },
    { id: 'notes' as const, label: 'Dossier' },
    { id: 'billing' as const, label: 'Finance' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-soft">
      <header className="h-xl border-b border-border bg-white px-m sm:px-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-s">
          <button onClick={onClose} className="p-xs hover:bg-bg-soft rounded-md text-samaritan transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="h-m w-px bg-border" />
          <h2 className="font-heading text-small font-black text-sapphire leading-none uppercase tracking-widest">
            {client.firstName} {client.lastName}
          </h2>
          {saveStatus !== 'idle' && (
             <span className={`font-heading text-[10px] font-black px-s py-[1px] rounded uppercase tracking-widest animate-pulse transition-all ${saveStatus === 'saving' ? 'bg-azraq/10 text-azraq border border-azraq/10' : 'bg-aurora/10 text-aurora border border-aurora/10'}`}>
                {saveStatus === 'saving' ? 'Synchro...' : 'Enregistré'}
             </span>
          )}
        </div>
        <div className="flex items-center gap-xs">
           <a href={`tel:${editData.phone}`} className="p-xs bg-bg-soft text-azraq rounded-md hover:bg-border transition-all border border-border"><Phone size={16}/></a>
           <a href={`mailto:${editData.email}`} className="p-xs bg-bg-soft text-azraq rounded-md hover:bg-border transition-all border border-border"><Mail size={16}/></a>
           <button className="h-l px-m bg-azraq text-white rounded-md font-heading text-[10px] font-black uppercase tracking-widest hover:bg-azraq/90 shadow-lg shadow-azraq/10 transition-all flex items-center gap-xxs ml-s">
             <Calendar size={14}/> Nouveau RDV
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto font-heading">
        <div className="max-w-6xl mx-auto px-m py-xl space-y-xl">
          
          <div className="bg-white border border-border rounded-card p-xl flex flex-col md:flex-row gap-xl shadow-sm shadow-azraq/5">
            <div className={`w-28 h-28 rounded-xl ${client.color || 'bg-bg-soft'} flex items-center justify-center text-5xl font-black text-azraq shadow-inner shrink-0 uppercase tracking-widest`}>
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div className="flex-1 space-y-m">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-m">
                <div className="space-y-xxs">
                  <h1 className="text-h1 font-black text-sapphire tracking-heading leading-heading uppercase">{client.firstName} {client.lastName}</h1>
                  <div className="flex items-center gap-m font-heading text-small font-bold text-samaritan uppercase tracking-widest">
                    <span className="flex items-center gap-xs"><Calendar size={13} /> Patient depuis {format(new Date(), 'yyyy')}</span>
                    <span className="flex items-center gap-xs"><Clock size={13} /> {clientAppts.length} sessions</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-xs">
                {(editData.tags || []).map((t: string) => (
                  <span key={t} className="px-s py-xxs bg-white border border-border text-samaritan rounded-md font-heading text-[10px] font-black uppercase tracking-widest flex items-center gap-xxs shadow-sm">
                    {t}
                    <button onClick={() => toggleTag(t)} className="ml-xxs hover:text-tomato opacity-50 hover:opacity-100 transition-all">×</button>
                  </span>
                ))}
                <button className="px-s py-xxs bg-bg-soft text-azraq rounded-md font-heading text-[10px] font-black uppercase tracking-widest border border-border hover:bg-border transition-all">
                  + AJOUTER TAG
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-xl border-b border-border">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-m font-heading text-small font-black uppercase tracking-widest transition-all relative border-b-2 ${
                  activeTab === t.id ? 'border-azraq text-azraq' : 'border-transparent text-samaritan hover:text-azraq'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-m">
                  {/* Adresse Card */}
                  <div className="bg-white border border-border rounded-card p-xl space-y-xl">
                     <h3 className="font-heading text-[10px] font-black uppercase text-samaritan tracking-widest flex items-center gap-xs"><MapPin size={14}/> Coordonnées & Adresse</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-xl gap-y-xxs">
                        <EditableField label="Email" value={editData.email || ''} onChange={(v:any) => updateField('email', v)} type="email" icon={<Mail size={14}/>} />
                        <EditableField label="Téléphone" value={editData.phone || ''} onChange={(v:any) => updateField('phone', v)} type="tel" icon={<Phone size={14}/>} />
                        <EditableField label="Rue" value={editData.street || ''} onChange={(v:any) => updateField('street', v)} icon={<MapPin size={14}/>} />
                        <EditableField label="N°" value={editData.streetNumber || ''} onChange={(v:any) => updateField('streetNumber', v)} />
                        <EditableField label="NPA" value={editData.zip || ''} onChange={(v:any) => updateField('zip', v)} />
                        <EditableField label="Ville" value={editData.city || ''} onChange={(v:any) => updateField('city', v)} />
                        <EditableField label="Canton" value={editData.canton || ''} onChange={(v:any) => updateField('canton', v)} />
                        <EditableField label="Assurance" value={editData.insurance || ''} onChange={(v:any) => updateField('insurance', v)} icon={<ShieldCheck size={14}/>} />
                     </div>
                  </div>
                </div>
              )}
              {activeTab === 'sessions' && (
                <SessionsTab 
                  clientAppts={clientAppts} 
                  onSelectAppt={onSelectAppt} 
                  onCancelAppt={onCancelAppt}
                  onResendConfirmation={onResendConfirmation}
                />
              )}
              {activeTab === 'notes' && (
                <NotesTab client={client} onUpdateClient={onUpdateClient} />
              )}
              {activeTab === 'billing' && (
                <BillingTab clientAppts={clientAppts} totalPaid={totalPaid} totalDue={totalDue} />
              )}
            </div>

            <div className="space-y-xl">
                <div className="bg-white border border-border rounded-card shadow-sm shadow-azraq/5 overflow-hidden">
                  <div className="px-xl py-m bg-bg-soft/50 border-b border-border flex items-center justify-between">
                    <h3 className="font-heading text-[10px] font-black text-samaritan uppercase tracking-widest">Activité Clinic</h3>
                  </div>
                  <div className="p-xl space-y-xl">
                    <div className="grid grid-cols-2 gap-s">
                      <div className="bg-bg-soft p-m rounded-card-inner border border-border text-center">
                        <p className="font-heading text-[10px] font-black text-samaritan uppercase mb-xxs tracking-widest">Fréquence</p>
                        <p className="font-heading text-h3 font-black text-sapphire">1.2 <span className="text-[10px] font-bold text-samaritan lowercase">/ mois</span></p>
                      </div>
                      <div className="bg-bg-soft p-m rounded-card-inner border border-border text-center">
                        <p className="font-heading text-[10px] font-black text-samaritan uppercase mb-xxs tracking-widest">Moyen</p>
                        <p className="font-heading text-h3 font-black text-sapphire">{totalPaid > 0 ? Math.round(totalPaid / clientAppts.length) : 150} <span className="text-[10px] font-bold text-samaritan lowercase">CHF</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-sapphire rounded-card p-xl text-white shadow-xl shadow-sapphire/10">
                    <h4 className="font-heading text-[10px] font-black uppercase tracking-widest opacity-40 mb-xs">Profil Rapide</h4>
                    <p className="font-body text-body font-normal leading-body italic text-white/80">
                       "{client.notes?.substring(0, 120) || 'Aucune note spécifique rédigée...'}{client.notes && client.notes.length > 120 ? '...' : ''}"
                    </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EditableField({ label, value, onChange, type = 'text', icon }: any) {
  return (
    <div className="flex items-center justify-between py-xs gap-m border-b border-border last:border-0 focus-within:bg-bg-soft transition-all rounded-md px-xxs">
      <div className="flex items-center gap-xs font-heading text-[10px] font-black text-samaritan uppercase tracking-widest shrink-0">
        {icon} {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="font-heading text-small text-sapphire font-black text-right bg-transparent border-none outline-none focus:ring-0 placeholder:text-samaritan/20 min-w-0 flex-1 uppercase tracking-widest"
        placeholder="—"
      />
    </div>
  );
}

function SessionsTab({ clientAppts, onSelectAppt, onCancelAppt, onResendConfirmation }: any) {
  if (clientAppts.length === 0) return <div className="p-xxxl text-center text-muted-foreground/40 font-heading text-small font-bold uppercase tracking-widest">Aucune session enregistrée</div>;
  return (
    <div className="bg-white border border-border rounded-card overflow-hidden shadow-sm shadow-azraq/5">
       <div className="grid grid-cols-[100px_1fr_80px_120px] gap-m px-xl h-l items-center bg-bg-soft/50 border-b border-border">
          {['Date', 'Prestation', 'Montant', ''].map(h => <span key={h} className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest">{h}</span>)}
       </div>
       <div className="divide-y divide-border">
          {clientAppts.map((appt:any) => (
            <div key={appt.id} className={`grid grid-cols-[100px_1fr_80px_120px] gap-m px-xl h-xl items-center hover:bg-bg-soft transition-all group ${appt.status === 'cancelled' ? 'opacity-40 grayscale' : ''}`}>
               <div className="flex flex-col">
                  <span className="font-heading text-small font-black text-azraq uppercase tracking-widest">{appt.date}</span>
                  <span className="font-heading text-[9px] font-black text-samaritan uppercase tracking-widest">{appt.time}</span>
               </div>
               <div className="flex flex-col">
                  <span className="font-heading text-small font-black text-azraq uppercase tracking-widest truncate">{appt.serviceName}</span>
                  {appt.status === 'cancelled' && <span className="font-heading text-[9px] font-black text-tomato uppercase tracking-widest">Annulée</span>}
               </div>
               <span className="font-heading text-small font-black text-azraq uppercase tracking-widest">{appt.price} <span className="text-[10px] opacity-40">CHF</span></span>
               <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-all">
                  {appt.status !== 'cancelled' ? (
                    <>
                      <button onClick={() => onSelectAppt(appt)} className="w-l h-l flex items-center justify-center text-samaritan hover:text-azraq hover:bg-white rounded-md border border-transparent hover:border-border transition-all" title="Modifier"><Edit2 size={14}/></button>
                      <button onClick={() => onResendConfirmation(appt)} className="w-l h-l flex items-center justify-center text-samaritan hover:text-aurora hover:bg-white rounded-md border border-transparent hover:border-border transition-all" title="Relancer"><Send size={14}/></button>
                      <button onClick={() => onCancelAppt(appt.id)} className="w-l h-l flex items-center justify-center text-samaritan hover:text-tomato hover:bg-white rounded-md border border-transparent hover:border-border transition-all" title="Annuler"><Trash2 size={14}/></button>
                    </>
                  ) : (
                    <span className="font-heading text-[8px] font-black text-samaritan/30 uppercase tracking-widest">Archivé</span>
                  )}
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function NotesTab({ client, onUpdateClient }: any) {
  const [notes, setNotes] = useState(client.notes || '');
  const handleBlur = () => onUpdateClient(client.id, { notes });
  return (
    <div className="bg-white border border-border rounded-card p-xl shadow-sm shadow-azraq/5">
      <div className="flex items-center justify-between mb-xl">
        <h3 className="font-heading text-[10px] font-black uppercase text-azraq tracking-widest flex items-center gap-xs"><FileText size={16}/> Dossier Clinique Confidentiel</h3>
        <span className="px-m py-xxs bg-aurora/10 text-aurora border border-aurora/10 rounded-md font-heading text-[10px] font-black uppercase flex items-center gap-xxs tracking-widest"><ShieldCheck size={12}/> Sécurisé</span>
      </div>
      <textarea 
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={handleBlur}
        className="w-full h-[450px] p-xl bg-bg-soft/50 rounded-card-inner border-none font-body text-body leading-body text-sapphire focus:bg-white focus:ring-2 focus:ring-azraq/10 outline-none transition-all resize-none shadow-inner"
        placeholder="Rédigez ici le suivi thérapeutique, antécédents, observations..."
      />
    </div>
  );
}

function BillingTab({ clientAppts, totalPaid, totalDue }: any) {
  const unpaid = clientAppts.filter((a:any) => !a.paid && a.price > 0);
  return (
    <div className="space-y-xl">
       <div className="grid grid-cols-2 gap-s">
          <div className="bg-aurora/10 border border-aurora/10 rounded-card p-xl text-aurora shadow-sm">
             <p className="font-heading text-[10px] font-black uppercase opacity-60 mb-xxs tracking-widest">Encaissé</p>
             <p className="font-heading text-h2 font-black tracking-heading">{totalPaid} <span className="text-small opacity-40 uppercase">CHF</span></p>
          </div>
          <div className="bg-tomato/10 border border-tomato/10 rounded-card p-xl text-tomato shadow-sm">
             <p className="font-heading text-[10px] font-black uppercase opacity-60 mb-xxs tracking-widest">À encaisser</p>
             <p className="font-heading text-h2 font-black tracking-heading">{totalDue} <span className="text-small opacity-40 uppercase">CHF</span></p>
          </div>
       </div>

       <div className="bg-white border border-border rounded-card overflow-hidden shadow-sm shadow-azraq/5">
          <div className="px-xl py-m bg-bg-soft/50 border-b border-border flex items-center gap-xs">
             <AlertCircle size={16} className="text-tomato" />
             <h3 className="font-heading text-[10px] font-black uppercase text-azraq tracking-widest">Détail des prestations à encaisser</h3>
          </div>
          <div className="divide-y divide-border">
             {unpaid.map((a:any) => (
                <div key={a.id} className="px-xl py-m flex items-center justify-between hover:bg-bg-soft transition-all">
                   <div className="space-y-xxs">
                      <p className="font-heading text-small font-black text-sapphire uppercase tracking-widest">{a.serviceName}</p>
                      <p className="font-heading text-[10px] font-bold text-samaritan uppercase tracking-widest">{a.date} · {a.time}</p>
                   </div>
                   <div className="text-right">
                      <p className="font-heading text-small font-black text-tomato">{a.price} CHF</p>
                      <button className="font-heading text-[9px] font-black text-azraq uppercase tracking-widest hover:underline mt-xxs block ml-auto">Marquer réglé</button>
                   </div>
                </div>
             ))}
             {unpaid.length === 0 && (
                <div className="p-xl text-center text-samaritan/50 italic font-heading text-small font-bold uppercase tracking-widest">Tout est réglé ! ✅</div>
             )}
          </div>
       </div>
    </div>
  );
}
