import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, CreditCard, Plus,
  Mail, Phone, MapPin, ShieldCheck, FileText, Clock,
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
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
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
  const nextAppt = clientAppts.filter(a => a.date && a.date >= format(new Date(), 'yyyy-MM-dd')).reverse()[0];

  const TABS = [
    { id: 'overview' as const, label: 'Aperçu' },
    { id: 'sessions' as const, label: 'Séances', count: clientAppts.length },
    { id: 'notes' as const, label: 'Dossier' },
    { id: 'billing' as const, label: 'Facturation' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── HEADER ── */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center gap-4 shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-900 truncate">
            {client.lastName} {client.firstName}
          </h1>
        </div>

        {/* Tabs */}
        <div className="hidden sm:flex h-8 bg-slate-100 p-0.5 rounded-lg">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-full px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-emerald-600 text-white text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="sm:hidden flex border-b border-slate-200 bg-white px-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 space-y-6">

          {/* Client header card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-semibold shrink-0">
                {client.firstName?.[0]}{client.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {client.lastName} {client.firstName}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {editData.email && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Mail size={13} className="text-slate-400" /> {editData.email}
                    </span>
                  )}
                  {editData.phone && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Phone size={13} className="text-slate-400" /> {editData.phone}
                    </span>
                  )}
                  {(editData.city || editData.canton) && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={13} className="text-slate-400" /> {editData.city}{editData.canton ? `, ${editData.canton}` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Sessions" value={String(clientAppts.length)} />
            <StatCard
              label="Dernière visite"
              value={lastAppt?.date ? format(new Date(lastAppt.date), 'd MMM', { locale: fr }) : '—'}
            />
            <StatCard
              label="Soin favori"
              value={(() => {
                const counts = clientAppts.reduce((acc, a) => {
                  if (a.serviceName) acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                return top ? top[0].split(' ')[0] : '—';
              })()}
            />
            <StatCard
              label="Revenu total"
              value={`${totalPaid + totalDue} CHF`}
            />
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <OverviewTab
              client={client}
              editData={editData}
              updateField={updateField}
              onUpdateClient={onUpdateClient}
            />
          )}
          {activeTab === 'sessions' && (
            <SessionsTab
              clientAppts={clientAppts}
              onSelectAppt={onSelectAppt}
              totalDue={totalDue}
              clientFirstName={client.firstName}
            />
          )}
          {activeTab === 'notes' && (
            <NotesTab
              client={client}
              onUpdateClient={onUpdateClient}
            />
          )}
          {activeTab === 'billing' && (
            <BillingTab
              clientAppts={clientAppts}
              totalPaid={totalPaid}
              totalDue={totalDue}
              unpaidCount={unpaidCount}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ label, value, accent }: { label: string; value: string; accent?: 'rose' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${accent === 'rose' ? 'text-rose-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   OVERVIEW TAB
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-900">Informations client</h3>
        <div className="space-y-0 divide-y divide-slate-100">
          <EditableField icon={<Mail size={14} />} label="Email" value={editData.email || ''} onChange={v => updateField('email', v)} type="email" />
          <EditableField icon={<Phone size={14} />} label="Téléphone" value={editData.phone || ''} onChange={v => updateField('phone', v)} type="tel" />
          <InfoRow label="Adresse" value={[editData.street, `${editData.zip || ''} ${editData.city || ''}`.trim()].filter(Boolean).join(', ') || '—'} />
          <EditableField label="Ville" value={editData.city || ''} onChange={v => updateField('city', v)} />
          <EditableField label="NPA" value={editData.zip || ''} onChange={v => updateField('zip', v)} />
          <EditableField label="Canton" value={editData.canton || ''} onChange={v => updateField('canton', v)} />
          <InfoRow label="Date de naissance" value={editData.birthDate || '—'} />
          <EditableField label="Assurance" value={editData.insurance || ''} onChange={v => updateField('insurance', v)} icon={<ShieldCheck size={14} />} />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-900">Notes de la thérapie</h3>
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            <ShieldCheck size={10} /> Confidentiel
          </span>
        </div>
        <textarea
          value={client.notes || ''}
          onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
          placeholder="Notes, préférences de traitement, historique corporel…"
          className="w-full h-64 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
        />
      </div>
    </div>
  );
}

/* ── EDITABLE FIELD ── */
function EditableField({
  label, value, onChange, type = 'text', icon,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm text-slate-900 font-medium text-right bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 min-w-0 flex-1"
        placeholder="—"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SESSIONS TAB
   ══════════════════════════════════════════════════ */
function SessionsTab({
  clientAppts, onSelectAppt, totalDue, clientFirstName,
}: {
  clientAppts: Appointment[];
  onSelectAppt: (a: Appointment) => void;
  totalDue: number;
  clientFirstName: string;
}) {
  const complete = clientAppts.filter(a => a.date && a.time);
  const incomplete = clientAppts.filter(a => !a.date || !a.time);

  if (clientAppts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
        <Calendar size={28} className="text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">Aucune session</p>
        <p className="text-sm text-slate-400">Plafanifiez la première session pour {clientFirstName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[100px_50px_1fr_80px_80px_32px] gap-2 px-4 h-10 items-center border-b border-slate-200 bg-slate-50">
          {['Date', 'Heure', 'Soin', 'Montant', 'Statut', ''].map(h => (
            <span key={h} className="text-[11px] font-medium text-slate-500">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {complete.map(appt => (
            <SessionRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} />
          ))}
        </div>
      </div>

      {/* Incomplete section */}
      {incomplete.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 px-1">
            Sessions incomplètes
          </p>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {incomplete.map(appt => (
              <SessionRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} dim />
            ))}
          </div>
        </div>
      )}

      {/* Total due */}
      {totalDue > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs font-medium text-rose-700">Total non réglé</span>
          <span className="text-lg font-semibold text-rose-700">{totalDue} CHF</span>
        </div>
      )}
    </div>
  );
}

/* ── SESSION ROW ── */
function SessionRow({ appt, onClick, dim = false }: { appt: Appointment; onClick: () => void; dim?: boolean }) {
  const statusCls = !appt.date
    ? 'bg-slate-100 text-slate-500'
    : appt.paid
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-rose-50 text-rose-600';

  const statusLabel = !appt.date ? 'Incomplet' : appt.paid ? 'Réglé' : 'À payer';

  return (
    <div
      onClick={onClick}
      className={`grid grid-cols-[100px_50px_1fr_80px_80px_32px] gap-2 px-4 h-11 items-center cursor-pointer hover:bg-slate-50 transition-colors group ${dim ? 'opacity-50' : ''}`}
    >
      <span className="text-sm text-slate-700">
        {appt.date ? format(new Date(appt.date), 'dd MMM yy', { locale: fr }) : '—'}
      </span>
      <span className="text-sm text-slate-500">{appt.time || '—'}</span>
      <span className="text-sm text-slate-700 truncate">{appt.serviceName || 'Session'}</span>
      <span className="text-sm font-medium text-slate-900">{appt.price ? `${appt.price}` : '—'}</span>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md w-fit ${statusCls}`}>
        {statusLabel}
      </span>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   NOTES TAB
   ══════════════════════════════════════════════════ */
function NotesTab({ client, onUpdateClient }: { client: Client; onUpdateClient: (id: string, data: Partial<Client>) => void }) {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">Dossier de suivi</span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
          <ShieldCheck size={10} /> Confidentiel
        </span>
      </div>
      <textarea
        value={client.notes || ''}
        onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
        placeholder="Rédigez vos notes de traitement, évolution, zones de tension..."
        className="w-full min-h-[400px] bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   BILLING TAB
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
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total encaissé</p>
          <p className="text-lg font-semibold text-emerald-600">{totalPaid} CHF</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Montant dû</p>
          <p className="text-lg font-semibold text-rose-600">{totalDue} CHF</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Factures en attente</p>
          <p className="text-lg font-semibold text-slate-900">{unpaidCount}</p>
        </div>
      </div>

      {/* Unpaid list */}
      {unpaidAppts.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">En attente de paiement</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {unpaidAppts.map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.serviceName || 'Session'}</p>
                  <p className="text-xs text-slate-500">{a.date ? format(new Date(a.date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
                </div>
                <span className="text-sm font-semibold text-rose-600">{a.price} CHF</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid history */}
      {paidAppts.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">Historique des paiements</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {paidAppts.slice(0, 10).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">{a.serviceName || 'Session'}</p>
                  <p className="text-xs text-slate-400">{a.date ? format(new Date(a.date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-900">{a.price} CHF</span>
                  {a.paymentMethod && <p className="text-[10px] text-slate-400">{a.paymentMethod}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {clientAppts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
          <CreditCard size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Aucune donnée de facturation</p>
        </div>
      )}
    </div>
  );
}
