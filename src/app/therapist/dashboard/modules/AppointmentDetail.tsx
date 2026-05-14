'use client';
import React, { useState, useEffect } from 'react';
import {
  X, Clock, Smartphone, CreditCard, Banknote, Calendar, ChevronRight, Edit3, Save,
  MessageSquare, Send, FileText, Phone, Mail, ShieldCheck, Trash2, Check, ArrowLeft,
  Zap, Heart, Info, ArrowRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { SERVICES, Service } from '@/lib/types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface AppointmentDetailProps {
  appt: Appointment;
  onClose: () => void;
  appointments: Appointment[];
  onSendWhatsApp?: (appt: Appointment, type: 'reminder' | 'confirmation' | 'followup') => void;
  onGoToClient?: (clientId: string) => void;
}

export default function AppointmentDetail({
  appt, onClose, appointments = [], onSendWhatsApp, onGoToClient,
}: AppointmentDetailProps) {
  const firestore = useFirestore();
  const current = appointments.find(a => a.id === appt.id) || appt;
  
  const [notes, setNotes] = useState(current.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setNotes(current.notes || '');
  }, [current.notes]);

  const clientAppts = appointments
    .filter(a => a.clientId === appt.clientId || (appt.clientNameSnapshot && a.clientNameSnapshot === appt.clientNameSnapshot))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sessionCount = clientAppts.length;
  const lastVisit = clientAppts.find(a => a.id !== appt.id && (a.date || '') < (appt.date || ''));
  
  const unpaidAppts = clientAppts.filter(a => !a.paid && a.price);
  const totalDue = unpaidAppts.reduce((s, a) => s + (a.price || 0), 0);

  const handleSaveNotes = async () => {
    if (!firestore) return;
    setIsSavingNotes(true);
    try {
      await updateDoc(doc(firestore, 'appointments', appt.id), { notes });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCancelAppt = async () => {
    if (!firestore) return;
    if (confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
      await deleteDoc(doc(firestore, 'appointments', appt.id));
      onClose();
    }
  };

  const dateObj = current.date ? parseISO(current.date) : new Date();
  const dayNum = format(dateObj, 'd');
  const monthStr = format(dateObj, 'MMM', { locale: fr }).toUpperCase();
  const fullDateLabel = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-6xl bg-[#FDFDFB] rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-white"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-16 py-12 border-b border-neutral-100">
          <div className="flex items-center gap-10">
            <button onClick={onClose} className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-neutral-400 hover:text-neutral-900 transition-all shadow-sm border border-neutral-100 group">
              <ArrowLeft size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-2 leading-none">
                DOSSIER DE SÉANCE
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900 leading-none">Observations Cliniques</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={handleCancelAppt}
              className="h-14 px-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-sm"
            >
              <Trash2 size={16} strokeWidth={2.5} />
              ANNULER LE RDV
            </button>
            <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-900 text-white hover:scale-105 transition-transform shadow-xl">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-20">
            
            {/* LEFT COLUMN */}
            <div className="space-y-16">
              {/* Main Profile Card */}
              <div className="bg-neutral-900 rounded-[3.5rem] p-12 flex items-center gap-12 relative overflow-hidden shadow-2xl group border border-white/5">
                <div className="bg-white rounded-[2.5rem] w-40 h-40 flex flex-col items-center justify-center shadow-2xl group-hover:rotate-3 group-hover:scale-105 transition-all duration-700">
                  <span className="text-7xl font-bold text-neutral-900 tracking-tight leading-none">{dayNum}</span>
                  <span className="text-[11px] font-bold text-neutral-300 tracking-[0.2em] mt-3">{monthStr}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-6xl font-bold text-white tracking-tight leading-none mb-6">
                    {current.clientNameSnapshot || 'Client'}
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="px-6 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                        {fullDateLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                      <Clock size={16} strokeWidth={2.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em]">
                        {current.time || '--:--'} — {current.endTime || '--:--'}
                      </p>
                    </div>
                  </div>
                </div>
                {!current.paid && (
                  <div className="absolute top-12 right-12 bg-[var(--accent-orange)] text-[#9a3412] px-8 py-3 rounded-full shadow-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">À RÉGLER</span>
                  </div>
                )}
              </div>

              {/* Advanced Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionBtn 
                  onClick={() => onSendWhatsApp?.(current, current.paid ? 'followup' : 'reminder')}
                  icon={<MessageSquare size={20} strokeWidth={2.5} />}
                  label="WhatsApp Rappel"
                  sub="Notification instantanée"
                />
                <ActionBtn 
                  onClick={() => onSendWhatsApp?.(current, 'confirmation')}
                  icon={<Check size={20} strokeWidth={2.5} />}
                  label="Confirmer"
                  sub="Validation de séance"
                />
                <ActionBtn 
                  icon={<FileText size={20} strokeWidth={2.5} />}
                  label="Facture PDF"
                  sub="Générer document"
                  isPrimary
                />
              </div>

              {/* Structured Metadata */}
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">CARACTÉRISTIQUES DE SÉANCE</h4>
                  <div className="h-px flex-1 bg-neutral-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailRow icon={<Zap size={22} />} label="Type de soin" value={<EditableField label="Soin" value={current.serviceName || ''} onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { serviceName: val })} />} />
                  <DetailRow 
                    icon={<CreditCard size={22} />} 
                    label="Honoraires"
                    value={
                      <div className="flex items-center gap-2">
                        <EditableField 
                          label="Prix" 
                          value={String(current.price || '')} 
                          onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { price: Number(val) })} 
                        />
                        <span className="text-neutral-300 font-bold">CHF</span>
                      </div>
                    } 
                  />
                  <DetailRow icon={<Phone size={22} />} label="Mobile" value={<EditableField label="Téléphone" value={current.phone || ''} onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { phone: val })} />} />
                  <DetailRow icon={<Mail size={22} />} label="Courriel" value={<EditableField label="Email" value={current.email || ''} onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { email: val })} />} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-16">
              {/* Executive Summary */}
              <div className="grid grid-cols-1 gap-6">
                 <div className="bg-white border border-neutral-100 rounded-[3rem] p-10 shadow-xl flex items-center justify-between group hover:border-neutral-900 transition-all">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-300 mb-2 leading-none">SÉANCES TOTALES</p>
                      <p className="text-4xl font-bold text-neutral-900 tracking-tight leading-none">{sessionCount}</p>
                    </div>
                    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                       <BarChart size={24} strokeWidth={2.5} />
                    </div>
                 </div>

                 <div className={`rounded-[3rem] p-10 shadow-xl flex items-center justify-between transition-all ${totalDue > 0 ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-100'}`}>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-2 leading-none ${totalDue > 0 ? 'text-white/40' : 'text-neutral-300'}`}>SOLDE À RÉGLER</p>
                      <p className={`text-4xl font-bold tracking-tight leading-none ${totalDue > 0 ? 'text-white' : 'text-neutral-900'}`}>{totalDue} CHF</p>
                    </div>
                    <div className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all ${totalDue > 0 ? 'bg-white/10 text-white' : 'bg-neutral-50 text-neutral-300'}`}>
                       <CreditCard size={24} strokeWidth={2.5} />
                    </div>
                 </div>

                 <div className="bg-white border border-neutral-100 rounded-[3rem] p-10 shadow-xl flex items-center justify-between group hover:border-neutral-900 transition-all">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-300 mb-2 leading-none">DERNIÈRE VISITE</p>
                      <p className="text-4xl font-bold text-neutral-900 tracking-tight leading-none">
                        {lastVisit?.date ? format(parseISO(lastVisit.date), 'dd MMM', { locale: fr }).toUpperCase() : 'AUCUNE'}
                      </p>
                    </div>
                    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                       <Calendar size={24} strokeWidth={2.5} />
                    </div>
                 </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white border border-neutral-100 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <FileText size={180} strokeWidth={1} className="text-neutral-900" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg">
                      <Edit3 size={18} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-[14px] font-bold uppercase tracking-[0.1em] text-neutral-900">Journal Clinique</h4>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white bg-neutral-900 px-5 py-2.5 rounded-full shadow-lg">ARCHIVÉ</span>
                </div>
                
                <InlineEditableTextarea
                  value={notes}
                  onChange={setNotes}
                  placeholder="Écrivez vos observations ici..."
                />
                
                <button 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className={`w-full flex items-center justify-center gap-6 h-20 rounded-full font-bold text-[12px] uppercase tracking-[0.2em] transition-all relative z-10 ${
                    saveSuccess 
                      ? 'bg-emerald-500 text-white shadow-xl scale-95' 
                      : 'bg-neutral-900 text-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 shadow-2xl'
                  }`}
                >
                  {isSavingNotes ? (
                    <Clock size={20} className="animate-spin" />
                  ) : saveSuccess ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <Save size={20} strokeWidth={2.5} />
                  )}
                  {saveSuccess ? 'DOSSIER ARCHIVÉ' : 'SAUVEGARDER'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ActionBtn({ icon, label, sub, onClick, isPrimary = false }: { icon: React.ReactNode, label: string, sub: string, onClick?: () => void, isPrimary?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-8 rounded-[3rem] transition-all group relative overflow-hidden ${
        isPrimary 
          ? 'bg-neutral-900 text-white shadow-2xl hover:scale-[1.03]' 
          : 'bg-white border border-neutral-100 text-neutral-900 hover:border-neutral-900 shadow-sm'
      }`}
    >
      <div className={`mb-4 w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${
        isPrimary ? 'bg-white/10 text-white' : 'bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white'
      }`}>
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1">{label}</p>
      <p className={`text-[8px] font-bold tracking-widest opacity-40 uppercase`}>{sub}</p>
    </button>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-white border border-neutral-50 hover:border-neutral-900 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-2 leading-none">{label}</p>
        <div className="text-xl font-bold text-neutral-900 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, accent = false }: { label: string, value: string | number, sub: string, accent?: boolean }) {
  return (
    <div className={`border rounded-[2.5rem] p-10 text-center space-y-2 transition-all shadow-sm ${accent ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-100'}`}>
      <p className={`text-[9px] font-bold uppercase tracking-[0.1em] ${accent ? 'text-white/40' : 'text-neutral-300'}`}>{label}</p>
      <p className={`text-4xl font-bold tracking-tight leading-none ${accent ? 'text-white' : 'text-neutral-900'}`}>{value}</p>
      <p className={`text-[10px] font-bold tracking-[0.1em] uppercase ${accent ? 'text-white/20' : 'text-neutral-200'}`}>{sub}</p>
    </div>
  );
}

function BarChart({ size, strokeWidth }: { size: number, strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
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
      className="w-full bg-transparent outline-none border-b-2 border-neutral-900 transition-colors py-1"
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className="cursor-text hover:bg-neutral-50 rounded px-2 -mx-2 transition-all flex items-center justify-between group/field"
    >
      <span className="truncate">{value || <span className="text-neutral-200 font-normal italic">{label}</span>}</span>
      <Edit3 size={14} className="text-neutral-200 opacity-0 group-hover/field:opacity-100 transition-opacity ml-2" />
    </div>
  );
}

function InlineEditableTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  return editing ? (
    <textarea
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      placeholder={placeholder}
      className="w-full min-h-[350px] bg-neutral-50 rounded-[2.5rem] p-10 text-lg font-medium text-neutral-900 placeholder:text-neutral-200 border-none focus:ring-4 focus:ring-neutral-100 transition-all outline-none resize-none relative z-10 leading-relaxed shadow-inner"
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className="w-full min-h-[350px] cursor-text bg-neutral-50 rounded-[2.5rem] p-10 text-lg font-medium text-neutral-900 transition-all hover:bg-neutral-100/80 relative z-10 leading-relaxed shadow-inner"
    >
      <p className="whitespace-pre-wrap">
        {value || <span className="text-neutral-200">{placeholder}</span>}
      </p>
    </div>
  );
}
