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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <h2 className="text-sm font-bold text-slate-900 leading-none">
            {client.firstName} {client.lastName}
          </h2>
          {saveStatus !== 'idle' && (
             <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 animate-pulse transition-all">
                {saveStatus === 'saving' ? 'Synchro...' : 'Enregistré'}
             </span>
          )}
        </div>
        <div className="flex items-center gap-2">
           <a href={`tel:${editData.phone}`} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm border border-slate-100"><Phone size={16}/></a>
           <a href={`mailto:${editData.email}`} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm border border-slate-100"><Mail size={16}/></a>
           <button className="h-9 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2 ml-2">
             <Calendar size={14}/> Nouveau RDV
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto font-sans">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row gap-8 shadow-sm">
            <div className={`w-28 h-28 rounded-[2.5rem] ${client.color || 'bg-indigo-100'} flex items-center justify-center text-5xl font-black text-indigo-600 shadow-inner shrink-0`}>
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{client.firstName} {client.lastName}</h1>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> Patient depuis {format(new Date(), 'yyyy')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {clientAppts.length} sessions</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(editData.tags || []).map((t: string) => (
                  <span key={t} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    {t}
                    <button onClick={() => toggleTag(t)} className="ml-1 hover:text-rose-500 opacity-50 hover:opacity-100">×</button>
                  </span>
                ))}
                <button className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100 hover:bg-indigo-100 transition-all">
                  + AJOUTER TAG
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-slate-200">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative border-b-2 ${
                  activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Adresse Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
                     <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin size={14}/> Coordonnées & Adresse</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
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

            <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Activité Clinic</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fréquence</p>
                        <p className="text-lg font-black text-slate-900">1.2 <span className="text-[10px] font-medium text-slate-400">/ mois</span></p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Moyen</p>
                        <p className="text-lg font-black text-slate-900">{totalPaid > 0 ? Math.round(totalPaid / clientAppts.length) : 150} <span className="text-[10px] font-medium text-slate-400">CHF</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Profil Rapide</h4>
                    <p className="text-sm font-medium leading-relaxed italic">
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
    <div className="flex items-center justify-between py-3.5 gap-4 border-b border-slate-50 last:border-0 focus-within:bg-slate-50/50 transition-all rounded-lg px-2">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
        {icon} {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs text-slate-900 font-bold text-right bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-200 min-w-0 flex-1"
        placeholder="—"
      />
    </div>
  );
}

function SessionsTab({ clientAppts, onSelectAppt, onCancelAppt, onResendConfirmation }: any) {
  if (clientAppts.length === 0) return <div className="p-20 text-center text-slate-400 italic font-medium">Aucune session enregistrée</div>;
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
       <div className="grid grid-cols-[100px_1fr_80px_120px] gap-4 px-6 h-12 items-center bg-slate-50 border-b border-slate-100">
          {['Date', 'Prestation', 'Montant', ''].map(h => <span key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>)}
       </div>
       <div className="divide-y divide-slate-50">
          {clientAppts.map((appt:any) => (
            <div key={appt.id} className={`grid grid-cols-[100px_1fr_80px_120px] gap-4 px-6 h-16 items-center hover:bg-slate-50/80 transition-all group ${appt.status === 'cancelled' ? 'opacity-40 grayscale' : ''}`}>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">{appt.date}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{appt.time}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate">{appt.serviceName}</span>
                  {appt.status === 'cancelled' && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Annulée (Historique)</span>}
               </div>
               <span className="text-xs font-black text-slate-900">{appt.price} CHF</span>
               <div className="flex items-center justify-end gap-1">
                  {appt.status !== 'cancelled' ? (
                    <>
                      <button onClick={() => onSelectAppt(appt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title="Modifier"><Edit2 size={14}/></button>
                      <button onClick={() => onResendConfirmation(appt)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all" title="Renvoyer confirmation"><Send size={14}/></button>
                      <button onClick={() => onCancelAppt(appt.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all" title="Annuler séance"><Trash2 size={14}/></button>
                    </>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 italic">No action</span>
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
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest flex items-center gap-2"><FileText size={16}/> Dossier Clinique Confidentiel</h3>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5"><ShieldCheck size={12}/> Sécurisé</span>
      </div>
      <textarea 
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={handleBlur}
        className="w-full h-[450px] p-6 bg-slate-50 rounded-2xl border-none text-sm leading-relaxed text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none shadow-inner"
        placeholder="Rédigez ici le suivi thérapeutique, antécédents, observations..."
      />
    </div>
  );
}

function BillingTab({ clientAppts, totalPaid, totalDue }: any) {
  const unpaid = clientAppts.filter((a:any) => !a.paid && a.price > 0);
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-50">
             <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Encaissé</p>
             <p className="text-2xl font-black">{totalPaid} CHF</p>
          </div>
          <div className="bg-rose-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-100">
             <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">À encaisser</p>
             <p className="text-2xl font-black">{totalDue} CHF</p>
          </div>
       </div>

       <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
             <AlertCircle size={16} className="text-rose-500" />
             <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">Détail des prestations à encaisser</h3>
          </div>
          <div className="divide-y divide-slate-50">
             {unpaid.map((a:any) => (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                   <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{a.serviceName}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{a.date} · {a.time}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-rose-600">{a.price} CHF</p>
                      <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Marquer réglé</button>
                   </div>
                </div>
             ))}
             {unpaid.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm font-medium">Tout est réglé ! ✅</div>
             )}
          </div>
       </div>
    </div>
  );
}
