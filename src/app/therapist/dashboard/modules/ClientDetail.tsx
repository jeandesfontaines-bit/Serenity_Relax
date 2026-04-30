import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CreditCard, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Client, Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  appointments: Appointment[];
  onSelectAppt: (appt: Appointment) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => void;
}

export default function ClientDetail({ client, onClose, appointments, onSelectAppt, onUpdateClient }: ClientDetailProps) {
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
    [appointments, client]);

  const totalDue    = clientAppts.filter(a => !a.paid && a.price).reduce((s, a) => s + (a.price || 0), 0);
  const totalPaid   = clientAppts.filter(a =>  a.paid && a.price).reduce((s, a) => s + (a.price || 0), 0);
  const unpaidCount = clientAppts.filter(a => !a.paid && a.date).length;
  const lastAppt    = clientAppts.find(a => a.date && a.time);

  const TABS = [
    { id: 'overview'  as const, label: 'Aperçu' },
    { id: 'sessions'  as const, label: 'Séances', count: clientAppts.length },
    { id: 'notes'     as const, label: 'Dossier' },
    { id: 'billing'   as const, label: 'Facturation' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#faf9f7]">
      {/* HEADER */}
      <header className="h-16 border-b border-zinc-100 bg-[#faf9f7] px-8 flex items-center gap-5 shrink-0">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center border border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[8px] tracking-[0.5em] text-zinc-400 uppercase">Client</p>
          <h1 className="font-serif text-base tracking-tighter text-zinc-900 uppercase truncate">{client.lastName} {client.firstName}</h1>
        </div>
        <div className="hidden sm:flex items-center border border-zinc-200">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-5 flex items-center gap-2 font-serif text-[9px] tracking-[0.3em] uppercase border-r border-zinc-200 last:border-r-0 transition-all ${activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}>
              {tab.label}
              {tab.count !== undefined && <span className={`text-[9px] w-5 h-5 flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="sm:hidden flex border-b border-zinc-100 px-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-serif text-[9px] tracking-[0.3em] uppercase whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-5">
          {/* Client card */}
          <div className="bg-white border border-zinc-100 p-7 flex gap-5 items-center">
            <div className="w-14 h-14 bg-zinc-900 text-white flex items-center justify-center font-serif text-xl shrink-0">
              {client.firstName?.[0]}{client.lastName?.[0]}
            </div>
            <div>
              <h2 className="font-serif text-xl tracking-tighter text-zinc-900 uppercase">{client.lastName} {client.firstName}</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                {editData.email && <span className="flex items-center gap-1.5 font-serif text-xs text-zinc-500"><Mail size={12} strokeWidth={1.5} className="text-zinc-300" />{editData.email}</span>}
                {editData.phone && <span className="flex items-center gap-1.5 font-serif text-xs text-zinc-500"><Phone size={12} strokeWidth={1.5} className="text-zinc-300" />{editData.phone}</span>}
                {(editData.city || editData.canton) && <span className="flex items-center gap-1.5 font-serif text-xs text-zinc-500"><MapPin size={12} strokeWidth={1.5} className="text-zinc-300" />{editData.city}{editData.canton ? `, ${editData.canton}` : ''}</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Sessions" value={String(clientAppts.length)} />
            <StatCard label="Dernière visite" value={lastAppt?.date ? format(new Date(lastAppt.date), 'd MMM', { locale: fr }) : '—'} />
            <StatCard label="Soin favori" value={(() => {
              const counts = clientAppts.reduce((acc, a) => { if (a.serviceName) acc[a.serviceName] = (acc[a.serviceName] || 0) + 1; return acc; }, {} as Record<string, number>);
              const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
              return top ? top[0].split(' ')[0] : '—';
            })()} />
            <StatCard label="Revenu total" value={`${totalPaid + totalDue} CHF`} />
          </div>

          {activeTab === 'overview'  && <OverviewTab  client={client} editData={editData} updateField={updateField} onUpdateClient={onUpdateClient} />}
          {activeTab === 'sessions'  && <SessionsTab  clientAppts={clientAppts} onSelectAppt={onSelectAppt} totalDue={totalDue} clientFirstName={client.firstName} />}
          {activeTab === 'notes'     && <NotesTab     client={client} onUpdateClient={onUpdateClient} />}
          {activeTab === 'billing'   && <BillingTab   clientAppts={clientAppts} totalPaid={totalPaid} totalDue={totalDue} unpaidCount={unpaidCount} />}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-zinc-100 p-5">
      <p className="font-serif text-[8px] tracking-[0.4em] uppercase text-zinc-400 mb-2">{label}</p>
      <p className="font-serif text-xl tracking-tighter text-zinc-900">{value}</p>
    </div>
  );
}

function OverviewTab({ client, editData, updateField, onUpdateClient }: { client: Client; editData: Partial<Client>; updateField: (f: keyof Client, v: string) => void; onUpdateClient: (id: string, d: Partial<Client>) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white border border-zinc-100 p-7">
        <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400 mb-5">Informations client</p>
        <div className="divide-y divide-zinc-50">
          <EditableField icon={<Mail size={13} strokeWidth={1.5} />} label="Email" value={editData.email || ''} onChange={v => updateField('email', v)} type="email" />
          <EditableField icon={<Phone size={13} strokeWidth={1.5} />} label="Téléphone" value={editData.phone || ''} onChange={v => updateField('phone', v)} type="tel" />
          <EditableField label="Ville" value={editData.city || ''} onChange={v => updateField('city', v)} />
          <EditableField label="NPA" value={editData.zip || ''} onChange={v => updateField('zip', v)} />
          <EditableField label="Canton" value={editData.canton || ''} onChange={v => updateField('canton', v)} />
          <InfoRow label="Naissance" value={editData.birthDate || '—'} />
          <EditableField icon={<ShieldCheck size={13} strokeWidth={1.5} />} label="Assurance" value={editData.insurance || ''} onChange={v => updateField('insurance', v)} />
        </div>
      </div>
      <div className="bg-white border border-zinc-100 p-7 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400">Notes thérapeutiques</p>
          <span className="flex items-center gap-1.5 font-serif text-[9px] tracking-[0.2em] uppercase text-zinc-500 border border-zinc-100 px-3 py-1"><ShieldCheck size={10} strokeWidth={1.5} />Confidentiel</span>
        </div>
        <textarea value={client.notes || ''} onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
          placeholder="Notes, préférences de traitement, historique corporel…"
          className="flex-1 min-h-[220px] border border-zinc-200 p-5 font-serif text-sm text-zinc-900 placeholder:text-zinc-300 resize-none focus:outline-none focus:border-zinc-900 transition-all" />
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, type = 'text', icon }: { label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex items-center gap-2 font-serif text-xs text-zinc-400 shrink-0">{icon && <span className="text-zinc-300">{icon}</span>}{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder="—"
        className="font-serif text-sm text-zinc-900 text-right bg-transparent border-none outline-none placeholder:text-zinc-300 min-w-0 flex-1 tracking-tight" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="font-serif text-xs text-zinc-400">{label}</span>
      <span className="font-serif text-sm text-zinc-900 tracking-tight">{value}</span>
    </div>
  );
}

function SessionsTab({ clientAppts, onSelectAppt, totalDue, clientFirstName }: { clientAppts: Appointment[]; onSelectAppt: (a: Appointment) => void; totalDue: number; clientFirstName: string }) {
  const complete   = clientAppts.filter(a => a.date && a.time);
  const incomplete = clientAppts.filter(a => !a.date || !a.time);
  if (clientAppts.length === 0) return (
    <div className="bg-white border border-zinc-100 py-20 text-center">
      <Calendar size={24} strokeWidth={1} className="text-zinc-200 mx-auto mb-4" />
      <p className="font-serif text-sm text-zinc-400 tracking-tight">Aucune session pour {clientFirstName}</p>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-100">
        <div className="grid grid-cols-[110px_56px_1fr_90px_100px_32px] gap-2 px-5 h-10 items-center border-b border-zinc-50 bg-zinc-50">
          {['Date','Heure','Soin','Montant','Statut',''].map(h => <span key={h} className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400">{h}</span>)}
        </div>
        <div className="divide-y divide-zinc-50">{complete.map(a => <SessionRow key={a.id} appt={a} onClick={() => onSelectAppt(a)} />)}</div>
      </div>
      {incomplete.length > 0 && (
        <div>
          <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400 mb-3 px-1">Sessions incomplètes</p>
          <div className="bg-white border border-zinc-100 divide-y divide-zinc-50">{incomplete.map(a => <SessionRow key={a.id} appt={a} onClick={() => onSelectAppt(a)} dim />)}</div>
        </div>
      )}
      {totalDue > 0 && (
        <div className="bg-white border border-rose-100 px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-[9px] tracking-[0.4em] uppercase text-rose-600">Total non réglé</span>
          <span className="font-serif text-lg tracking-tighter text-rose-700">{totalDue} CHF</span>
        </div>
      )}
    </div>
  );
}

function SessionRow({ appt, onClick, dim = false }: { appt: Appointment; onClick: () => void; dim?: boolean }) {
  const statusCls = !appt.date ? 'bg-zinc-50 text-zinc-400 border border-zinc-100' : appt.paid ? 'bg-zinc-900 text-white' : 'bg-rose-50 text-rose-600 border border-rose-100';
  return (
    <div onClick={onClick} className={`grid grid-cols-[110px_56px_1fr_90px_100px_32px] gap-2 px-5 h-11 items-center cursor-pointer hover:bg-zinc-50 transition-colors group ${dim ? 'opacity-40' : ''}`}>
      <span className="font-serif text-sm text-zinc-700">{appt.date ? format(new Date(appt.date), 'dd MMM yy', { locale: fr }) : '—'}</span>
      <span className="font-serif text-sm text-zinc-500">{appt.time || '—'}</span>
      <span className="font-serif text-sm text-zinc-700 truncate group-hover:italic transition-all">{appt.serviceName || 'Session'}</span>
      <span className="font-serif text-sm text-zinc-900">{appt.price || '—'}</span>
      <span className={`font-serif text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 w-fit ${statusCls}`}>{!appt.date ? 'Incomplet' : appt.paid ? 'Réglé' : 'À payer'}</span>
      <ChevronRight size={13} strokeWidth={1} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
    </div>
  );
}

function NotesTab({ client, onUpdateClient }: { client: Client; onUpdateClient: (id: string, d: Partial<Client>) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-100 px-6 py-4 flex items-center justify-between">
        <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400">Dossier de suivi</p>
        <span className="flex items-center gap-1.5 font-serif text-[9px] tracking-[0.2em] uppercase text-zinc-500 border border-zinc-100 px-3 py-1"><ShieldCheck size={10} strokeWidth={1.5} />Confidentiel</span>
      </div>
      <textarea value={client.notes || ''} onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
        placeholder="Rédigez vos notes de traitement, évolution, zones de tension..."
        className="w-full min-h-[400px] bg-white border border-zinc-200 p-7 font-serif text-sm text-zinc-900 leading-relaxed placeholder:text-zinc-300 resize-none focus:outline-none focus:border-zinc-900 transition-all" />
    </div>
  );
}

function BillingTab({ clientAppts, totalPaid, totalDue, unpaidCount }: { clientAppts: Appointment[]; totalPaid: number; totalDue: number; unpaidCount: number }) {
  const paidAppts   = clientAppts.filter(a =>  a.paid && a.price);
  const unpaidAppts = clientAppts.filter(a => !a.paid && a.price);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[{ label: 'Total encaissé', value: `${totalPaid} CHF`, red: false }, { label: 'Montant dû', value: `${totalDue} CHF`, red: totalDue > 0 }, { label: 'Factures en attente', value: String(unpaidCount), red: false }].map(d => (
          <div key={d.label} className="bg-white border border-zinc-100 p-5">
            <p className="font-serif text-[8px] tracking-[0.4em] uppercase text-zinc-400 mb-2">{d.label}</p>
            <p className={`font-serif text-xl tracking-tighter ${d.red ? 'text-rose-600' : 'text-zinc-900'}`}>{d.value}</p>
          </div>
        ))}
      </div>
      {unpaidAppts.length > 0 && (
        <div>
          <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400 mb-3 px-1">En attente de paiement</p>
          <div className="bg-white border border-zinc-100 divide-y divide-zinc-50">
            {unpaidAppts.map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                <div><p className="font-serif text-sm text-zinc-900 tracking-tight">{a.serviceName || 'Session'}</p><p className="font-serif text-[10px] text-zinc-400 mt-0.5">{a.date ? format(new Date(a.date), 'dd MMM yyyy', { locale: fr }) : '—'}</p></div>
                <span className="font-serif text-sm text-rose-600">{a.price} CHF</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {paidAppts.length > 0 && (
        <div>
          <p className="font-serif text-[9px] tracking-[0.4em] uppercase text-zinc-400 mb-3 px-1">Historique des paiements</p>
          <div className="bg-white border border-zinc-100 divide-y divide-zinc-50">
            {paidAppts.slice(0, 10).map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                <div><p className="font-serif text-sm text-zinc-700 tracking-tight">{a.serviceName || 'Session'}</p><p className="font-serif text-[10px] text-zinc-400 mt-0.5">{a.date ? format(new Date(a.date), 'dd MMM yyyy', { locale: fr }) : '—'}</p></div>
                <div className="text-right"><p className="font-serif text-sm text-zinc-900">{a.price} CHF</p>{a.paymentMethod && <p className="font-serif text-[9px] text-zinc-400 tracking-[0.2em] uppercase mt-0.5">{a.paymentMethod}</p>}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {clientAppts.length === 0 && (
        <div className="bg-white border border-zinc-100 py-20 text-center">
          <CreditCard size={24} strokeWidth={1} className="text-zinc-200 mx-auto mb-4" />
          <p className="font-serif text-sm text-zinc-400 tracking-tight">Aucune donnée de facturation</p>
        </div>
      )}
    </div>
  );
}
