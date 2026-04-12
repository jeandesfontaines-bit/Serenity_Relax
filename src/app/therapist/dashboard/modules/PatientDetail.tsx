import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, FileText, CreditCard, Plus, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'sessions' | 'notes' | 'billing'>('sessions');
  const [editData, setEditData] = useState<Partial<Client>>({ ...client });

  useEffect(() => {
    setEditData({ ...client });
  }, [client]);

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
    [appointments, client]
  );

  const completeAppts = clientAppts.filter(a => a.date && a.time);
  const incompleteAppts = clientAppts.filter(a => !a.date || !a.time);

  const totalDue = clientAppts
    .filter(a => !a.paid && a.price)
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const totalPaid = clientAppts
    .filter(a => a.paid && a.price)
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const unpaidCount = clientAppts.filter(a => !a.paid && a.date).length;
  const lastAppt = completeAppts[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#ECEEF8', fontFamily: "'Inter', sans-serif" }}>

      {/* Topbar */}
      <div style={{
        background: '#fff',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        borderBottom: '1px solid #ECEEF8',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#F4F5FB', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <ChevronLeft size={16} color="#6B7280" />
        </button>

        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D2E', flex: 1 }}>
          {client.lastName} {client.firstName}
        </span>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F4F5FB', borderRadius: 12, padding: 4 }}>
          {[
            { id: 'sessions' as const, label: 'Séances', count: clientAppts.length },
            { id: 'notes' as const, label: 'Dossier' },
            { id: 'billing' as const, label: 'Factures' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#1A1D2E' : '#9CA3AF',
                boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  background: '#6366F1', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  width: 17, height: 17, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 16, padding: 20, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Profile card */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 20,
            boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366F1,#818CF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12,
            }}>
              {client.firstName?.[0]}{client.lastName?.[0]}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E', marginBottom: 2 }}>
              {client.lastName} {client.firstName}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>
              Patient
            </div>

            {/* Editable fields */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: <Mail size={12} color="#C4C9E2" />, field: 'email' as keyof Client, placeholder: 'Email', type: 'email' },
                { icon: <Phone size={12} color="#C4C9E2" />, field: 'phone' as keyof Client, placeholder: 'Téléphone', type: 'tel' },
              ].map(({ icon, field, placeholder, type }) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: '1px solid #F4F5FB' }}>
                  {icon}
                  <input
                    type={type}
                    value={(editData[field] as string) || ''}
                    onChange={e => updateField(field, e.target.value)}
                    placeholder={placeholder}
                    style={{
                      flex: 1, border: 'none', outline: 'none', background: 'transparent',
                      fontSize: 11, color: '#6B7280', fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: '1px solid #F4F5FB' }}>
                <MapPin size={12} color="#C4C9E2" />
                <input
                  type="text"
                  value={(editData.zip as string) || ''}
                  onChange={e => updateField('zip', e.target.value)}
                  placeholder="NPA"
                  style={{ width: 40, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: '#6B7280', fontFamily: 'inherit' }}
                />
                <input
                  type="text"
                  value={(editData.city as string) || ''}
                  onChange={e => updateField('city', e.target.value)}
                  placeholder="Ville"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: '#6B7280', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { num: clientAppts.length, label: 'Séances', colors: ['#6366F1', '#818CF8'] },
              { num: `${totalDue}`, label: 'CHF dû', colors: ['#F43F5E', '#FB7185'] },
              { num: `${totalPaid}`, label: 'CHF réglé', colors: ['#10B981', '#34D399'] },
              { num: unpaidCount, label: 'En attente', colors: ['#F59E0B', '#FCD34D'] },
            ].map(({ num, label, colors }) => (
              <div key={label} style={{
                borderRadius: 14, padding: '14px 12px',
                background: `linear-gradient(135deg,${colors[0]},${colors[1]})`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
              </div>
            ))}

            {lastAppt && (
              <div style={{
                gridColumn: '1/-1',
                background: '#fff', borderRadius: 14, padding: '12px 14px',
                boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Dernière séance</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6366F1' }}>
                  {format(new Date(lastAppt.date), 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {activeTab === 'sessions' && (
            <>
              {/* Table header */}
              <div style={{
                background: '#fff', borderRadius: 14, padding: '10px 16px',
                boxShadow: '0 1px 4px rgba(99,102,241,0.05)',
                display: 'grid',
                gridTemplateColumns: '110px 58px minmax(0,1fr) 90px 84px 32px',
                gap: 8,
              }}>
                {['Date', 'Heure', 'Soin', 'Montant', 'Statut', ''].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 600, color: '#C4C9E2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>

              {/* Complete sessions */}
              {completeAppts.map(appt => (
                <SessionRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} />
              ))}

              {/* Incomplete sessions */}
              {incompleteAppts.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#C4C9E2', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px 2px' }}>
                    Séances incomplètes
                  </div>
                  {incompleteAppts.map(appt => (
                    <SessionRow key={appt.id} appt={appt} onClick={() => onSelectAppt(appt)} dim />
                  ))}
                </>
              )}

              {/* Empty state */}
              {clientAppts.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={24} color="#6366F1" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D2E' }}>Aucune séance</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>Créez la première séance pour {client.firstName}</div>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                    background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                    color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8,
                  }}>
                    <Plus size={16} /> Nouvelle séance
                  </button>
                </div>
              )}

              {/* Total */}
              {totalDue > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg,#FEF2F2,#FFF1F2)',
                  border: '1px solid #FECDD3', borderRadius: 14, padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#F43F5E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total non réglé</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', letterSpacing: '-0.5px' }}>{totalDue} CHF</span>
                </div>
              )}
            </>
          )}

          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E' }}>Dossier clinique</span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                  background: '#FEE2E2', borderRadius: 20, fontSize: 10, fontWeight: 600, color: '#DC2626',
                }}>
                  <ShieldCheck size={12} /> Confidentiel
                </span>
              </div>
              <textarea
                value={client.notes || ''}
                onChange={e => onUpdateClient(client.id, { notes: e.target.value })}
                placeholder="Rédigez vos observations cliniques, historique, évolution du patient..."
                style={{
                  background: '#fff', borderRadius: 14, border: '2px solid #ECEEF8', padding: 20,
                  fontSize: 13, color: '#374151', lineHeight: 1.7, resize: 'none', outline: 'none',
                  minHeight: 400, fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(99,102,241,0.05)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#A5B4FC'}
                onBlur={e => e.target.style.borderColor = '#ECEEF8'}
              />
            </div>
          )}

          {activeTab === 'billing' && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center',
              boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CreditCard size={24} color="#6366F1" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D2E', marginBottom: 8 }}>Facturation</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.6 }}>
                Historique complet et export PDF en cours d'implémentation.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                  background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                  color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Plus size={14} /> Nouvelle facture
                </button>
                <button style={{
                  padding: '10px 18px', background: '#F4F5FB', border: 'none',
                  borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer',
                }}>
                  Exporter PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionRow({ appt, onClick, dim = false }: { appt: Appointment; onClick: () => void; dim?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '13px 16px',
        boxShadow: hovered ? '0 4px 16px rgba(99,102,241,0.13)' : '0 1px 4px rgba(99,102,241,0.05)',
        transform: hovered && !dim ? 'translateY(-1px)' : 'none',
        display: 'grid',
        gridTemplateColumns: '110px 58px minmax(0,1fr) 90px 84px 32px',
        gap: 8,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
        opacity: dim ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: appt.date ? '#1A1D2E' : '#D1D5DB' }}>
        {appt.date ? format(new Date(appt.date), 'dd MMM yyyy', { locale: fr }) : '—'}
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
        {appt.time || '—'}
      </div>
      <div style={{ fontSize: 12, color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {appt.serviceName || 'Consultation'}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: appt.price ? '#1A1D2E' : '#D1D5DB' }}>
        {appt.price ? `${appt.price} CHF` : '—'}
      </div>
      <div>
        {!appt.date ? (
          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#F3F4F6', color: '#9CA3AF' }}>Incomplet</span>
        ) : appt.paid ? (
          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#D1FAE5', color: '#059669' }}>Réglé</span>
        ) : (
          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>À payer</span>
        )}
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? '#EEF2FF' : '#F4F5FB', transition: 'background 0.15s',
      }}>
        <ChevronRight size={12} color={hovered ? '#6366F1' : '#9CA3AF'} />
      </div>
    </div>
  );
}
