import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, FileText, CreditCard,
  Plus, Phone, MapPin, ShieldCheck, Edit3, Trash2
} from 'lucide-react';
import { Client, Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PatientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
}

export default function PatientDetail({ client, onClose, appointments, onSelectAppt, onUpdateClient }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'notes' | 'billing' | 'profil'>('sessions');
  const [editData, setEditData] = useState<Partial<Client>>({...client});

  const clientAppts = appointments
    .filter(a => a.clientId === client.id || (a.clientNameSnapshot === `${client.firstName} ${client.lastName}`))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-stretch justify-end pointer-events-none">
      <div className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-sm pointer-events-auto md:hidden" onClick={onClose} />
      
      <div className="relative bg-[#FAFAFA] w-full md:w-[80vw] lg:w-[70vw] h-[95vh] md:h-full rounded-t-[2.5rem] md:rounded-none shadow-2xl pointer-events-auto overflow-hidden flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-500">
        {/* Drawer Handle (Mobile Only) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0 bg-white">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>

        {/* Topbar */}
        <div className="h-20 md:h-24 bg-white border-b border-slate-100 px-6 md:px-12 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={onClose} className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                {client.firstName} {client.lastName}
              </h1>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dossier #{client.id.slice(0, 5)}</p>
            </div>
          </div>
          <button className="h-10 md:h-14 px-4 md:px-8 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg active:scale-95">
            <Plus size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Nouvelle Séance</span><span className="sm:hidden">Séance</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Mobile Small Header */}
          <div className="md:hidden px-6 py-4 flex items-center justify-between bg-white border-b border-slate-50">
             <div className="flex items-center gap-3">
                <div>
                   <p className="text-[10px] font-black text-slate-900">{client.firstName} {client.lastName}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{client.phone || 'Pas de numéro'} · {clientAppts.length} séances</p>
                </div>
             </div>
             <button 
               onClick={() => setActiveTab('profil')} 
               className="h-8 px-4 bg-indigo-50 text-[#5F27CD] rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100"
             >Détails</button>
          </div>

          <div className="flex flex-col md:flex-row h-full">
            {/* Summary Card - Desktop Only Sidebar */}
            <div className="hidden md:flex w-80 flex-col gap-6 shrink-0 p-8 border-r border-slate-100 bg-white/50">
               <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-8 leading-tight">
                    {client.firstName}<br/>{client.lastName}
                  </h2>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 text-slate-600">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300"><Phone size={16} /></div>
                       <span className="text-sm font-black">{client.phone || '—'}</span>
                     </div>
                     <div className="flex items-start gap-4 text-slate-600">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mt-1"><MapPin size={16} /></div>
                       <span className="text-sm font-bold leading-tight">{client.street}<br/>{client.zip} {client.city}</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('profil')}
                    className="w-full h-12 rounded-2xl bg-indigo-50 text-[#5F27CD] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all mt-8 border border-indigo-100"
                  >
                    Voir le profil complet
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 px-1">Statistiques</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Séances</span>
                        <span className="text-2xl font-black text-slate-900">{clientAppts.length}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-4 md:gap-8 p-4 md:p-12 overflow-hidden">
               {/* Tabs */}
               <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 p-1.5 flex gap-1 shrink-0 shadow-sm overflow-x-auto no-scrollbar">
                  {[
                    { id: 'sessions', label: 'Séances', icon: Calendar },
                    { id: 'notes', label: 'Dossier', icon: FileText },
                    { id: 'profil', label: 'Profil', icon: Edit3 },
                    { id: 'billing', label: 'Compta', icon: CreditCard },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex-1 h-12 md:h-16 min-w-[85px] rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all
                        ${activeTab === t.id ? 'bg-[#5F27CD] text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      <t.icon size={14} /> {t.label}
                    </button>
                  ))}
               </div>

               <div className="flex-1 overflow-y-auto pr-1 md:pr-4 scrollbar-hide space-y-4">
                  {activeTab === 'sessions' && (
                    <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {clientAppts.map(appt => (
                        <div 
                          key={appt.id} 
                          onClick={() => onSelectAppt(appt)}
                          className="group bg-white rounded-[2rem] border border-slate-100 p-5 md:p-8 flex items-center justify-between hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4 md:gap-10">
                            <div className="w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center text-slate-900 font-black text-sm shadow-inner group-hover:bg-[#5F27CD] group-hover:text-white transition-all">
                              <span className="text-xl md:text-2xl leading-none">{appt.date ? format(new Date(appt.date), 'dd') : '--'}</span>
                              <span className="text-[7px] md:text-[9px] uppercase opacity-50 mt-1">{appt.date ? format(new Date(appt.date), 'MMM', { locale: fr }) : '??'}</span>
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm md:text-xl">{appt.serviceName || 'Soin'}</h4>
                               <div className="flex items-center gap-3 mt-1 md:mt-3">
                                  <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> {appt.time}</p>
                                  <div className="w-1 h-1 bg-slate-200 rounded-full"/>
                                  <p className="text-[9px] md:text-xs font-black text-[#5F27CD] uppercase tracking-widest">{appt.price} CHF</p>
                               </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 md:gap-6">
                             <div className={`px-4 py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${appt.paid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {appt.paid ? 'RÉGLÉ' : 'DÛ'}
                             </div>
                             <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.5rem] bg-slate-50 hidden md:flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                <ChevronRight size={20} />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                     <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 p-6 md:p-14 h-full min-h-[400px] shadow-sm animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                           <h3 className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tight">Dossier Clinique</h3>
                           <span className="px-3 py-1 bg-rose-50 rounded-lg text-[8px] md:text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck size={14}/> Top Secret
                           </span>
                        </div>
                        <textarea 
                          defaultValue={client.notes}
                          onChange={(e) => onUpdateClient(client.id, { notes: e.target.value })}
                          className="w-full h-full min-h-[350px] p-6 md:p-12 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-transparent focus:border-indigo-100 focus:bg-white focus:outline-none text-slate-700 font-semibold leading-relaxed transition-all placeholder:text-slate-300"
                          placeholder="Commencez à rédiger vos observations..."
                        />
                     </div>
                  )}

                  {activeTab === 'profil' && (
                    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 p-6 md:p-14 shadow-sm animate-in fade-in duration-500">
                       <div className="flex items-center justify-between mb-10 md:mb-14">
                          <h3 className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tight">Identité Patient</h3>
                          <button 
                            onClick={() => onUpdateClient(client.id, editData)}
                            className="h-10 md:h-14 px-6 md:px-12 bg-[#5F27CD] text-white rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                          >Enregistrer</button>
                       </div>

                       <div className="space-y-4 md:space-y-8">
                          <div className="grid grid-cols-2 gap-4 md:gap-8">
                             <div className="space-y-1 md:space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Prénom</label>
                                <input type="text" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-5 text-sm font-black"/>
                             </div>
                             <div className="space-y-1 md:space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Nom</label>
                                <input type="text" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-5 text-sm font-black"/>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                             <div className="space-y-1 md:space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Email</label>
                                <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-5 text-sm font-black"/>
                             </div>
                             <div className="space-y-1 md:space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Téléphone</label>
                                <input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-5 text-sm font-black"/>
                             </div>
                          </div>

                          <div className="space-y-1 md:space-y-2">
                             <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Adresse</label>
                             <input type="text" value={editData.street} onChange={e => setEditData({...editData, street: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-5 text-sm font-black"/>
                          </div>

                          <div className="grid grid-cols-3 gap-3 md:gap-8">
                             <div className="space-y-1 md:space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">NPA</label>
                                <input type="text" value={editData.zip} onChange={e => setEditData({...editData, zip: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 text-sm font-black"/>
                             </div>
                             <div className="col-span-2 space-y-1 md:space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Ville</label>
                                <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-5 text-sm font-black"/>
                             </div>
                          </div>
                          
                          <div className="mt-12 pt-12 border-t border-slate-50">
                             <button className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors">
                                <Trash2 size={16}/> Archiver ce patient
                             </button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
