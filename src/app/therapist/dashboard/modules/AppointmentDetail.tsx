'use client';
import React, { useState, useEffect } from 'react';
import {
  Clock, CreditCard, Calendar, Edit3, Save,
  MessageSquare, FileText, Phone, Mail, Check,
  Zap
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  ActionBtn, 
  DetailRow, 
  BarChart, 
  EditableField, 
  InlineEditableTextarea 
} from './appointment/AppointmentComponents';

import AppointmentHeader from './appointment/AppointmentHeader';
import AppointmentClientCard from './appointment/AppointmentClientCard';

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
  const monthStr = format(dateObj, 'MMM', { locale: fr });
  const fullDateLabel = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 backdrop-blur-xl bg-foreground/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-5xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border bg-background border-border/30"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <AppointmentHeader
          onClose={onClose}
          onCancel={handleCancelAppt}
          eyebrow="Dossier de séance"
          title="Observations cliniques"
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
            
            {/* LEFT COLUMN */}
            <div className="space-y-8">
              <AppointmentClientCard
                current={current}
                dayNum={dayNum}
                monthStr={monthStr}
                fullDateLabel={fullDateLabel}
              />

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
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h4 className="dashboard-eyebrow">Caractéristiques de séance</h4>
                  <div className="h-px flex-1 bg-border/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailRow icon={<Zap size={22} />} label="Type de soin" value={<EditableField label="Soin" value={cleanServiceLabel(current.serviceName) || ''} onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { serviceName: val })} />} />
                  <DetailRow 
                    icon={<CreditCard size={22} />} 
                    label="Honoraires"
                    value={
                      <div className="flex items-center gap-2 text-foreground">
                        <EditableField 
                          label="Prix" 
                          value={String(current.price || '')} 
                          onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { price: Number(val) })} 
                        />
                        <span className="font-bold text-muted-foreground">CHF</span>
                      </div>
                    } 
                  />
                  <DetailRow icon={<Phone size={22} />} label="Mobile" value={<EditableField label="Téléphone" value={current.phone || ''} onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { phone: val })} />} />
                  <DetailRow icon={<Mail size={22} />} label="Courriel" value={<EditableField label="Email" value={current.email || ''} onChange={(val) => updateDoc(doc(firestore!, 'appointments', appt.id), { email: val })} />} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
              {/* Executive Summary */}
              <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-[2rem] p-6 shadow-lg flex items-center justify-between group transition-all duration-700 border bg-background border-border/30">
                    <div>
                      <p className="dashboard-eyebrow mb-1 text-muted-foreground">Séances totales</p>
                      <p className="text-2xl font-bold tracking-tight leading-none text-foreground">{sessionCount}</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl transition-all bg-secondary text-muted-foreground">
                       <BarChart size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className={`rounded-[2rem] p-6 shadow-lg flex items-center justify-between transition-all duration-700 border ${
                   totalDue > 0 ? "bg-primary text-primary-foreground border-transparent" : "bg-background text-foreground border-border/30"
                 }`}>
                    <div>
                      <p className={`dashboard-eyebrow mb-1 ${totalDue > 0 ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>Solde à régler</p>
                      <p className="text-2xl font-bold tracking-tight leading-none">{totalDue} CHF</p>
                    </div>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                      totalDue > 0 ? "bg-primary-foreground/10 text-primary-foreground" : "bg-secondary text-muted-foreground"
                     }`}>
                       <CreditCard size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="rounded-[2rem] p-6 shadow-lg flex items-center justify-between group transition-all duration-700 border bg-background border-border/30">
                    <div>
                      <p className="dashboard-eyebrow mb-1 text-muted-foreground">Dernière visite</p>
                      <p className="text-2xl font-bold tracking-tight leading-none text-foreground">
                        {lastVisit?.date ? format(parseISO(lastVisit.date), 'dd MMM', { locale: fr }) : 'aucune'}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl transition-all bg-secondary text-muted-foreground">
                       <Calendar size={20} strokeWidth={2.5} />
                    </div>
                  </div>
              </div>

              {/* Notes Section */}
              <div className="rounded-[2rem] p-8 shadow-xl space-y-6 relative overflow-hidden border bg-background border-border/30">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                   <FileText size={140} strokeWidth={1} className="text-foreground/5" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg bg-primary text-primary-foreground">
                       <Edit3 size={16} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-[13px] font-bold tracking-[0.05em] text-foreground">Journal clinique</h4>
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.1em] px-4 py-2 rounded-full shadow-lg bg-primary text-primary-foreground">Archivé</span>
                </div>
                
                <InlineEditableTextarea
                  value={notes}
                  onChange={setNotes}
                  placeholder="Écrivez vos observations ici..."
                />
                
                <button 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className={`w-full flex items-center justify-center gap-4 h-14 rounded-full font-bold text-[12px] tracking-[0.1em] transition-all duration-700 relative z-10 ${
                    saveSuccess 
                      ? 'shadow-md scale-95 bg-primary text-primary-foreground' 
                      : 'hover:shadow-lg hover:-translate-y-0.5 active:scale-95 shadow-xl bg-primary text-primary-foreground'
                  }`}
                >
                  {isSavingNotes ? (
                    <Clock size={18} className="animate-spin" />
                  ) : saveSuccess ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <Save size={18} strokeWidth={2.5} />
                  )}
                  {saveSuccess ? 'Dossier archivé' : 'Sauvegarder'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
