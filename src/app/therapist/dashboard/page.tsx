'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CalendarRange, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2, Ban,
  X, Trash2, Clock, Plus, Cog, Power, Mail, FileText, History, User, CreditCard, Download, MessageCircle, MessageSquare, Edit3, ArrowUpRight, Smartphone, Banknote, ArrowUpDown, Cloud, Moon, Columns, Eye
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, startOfDay, addDays, getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirestore, useAuth, useUser } from '@/firebase';
import {
  collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc, setDoc, serverTimestamp, deleteField
} from 'firebase/firestore';
import { SERVICES } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRICE = 150;
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_S = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
const DAYS_F = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

// iso weekday: Mon=0 … Sun=6
const isoDay = (d: Date) => { const v = d.getDay(); return v === 0 ? 6 : v - 1; };
const fmt    = (d: Date) => format(d, 'yyyy-MM-dd');
const fmtFR  = (d: Date) => {
  if (isNaN(d.getTime())) return 'Date invalide';
  return format(d, 'd MMMM yyyy', { locale: fr });
};
const wkStart = (d: Date) => { const c = new Date(d); c.setDate(c.getDate() - isoDay(c)); return c; };

// ─── Circular progress ────────────────────────────────────────────────────────
const CircProgress = ({ pct, cls }: { pct: number; cls: string }) => {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} stroke="#C8D6E5" strokeWidth="3" fill="transparent"/>
        <circle cx="24" cy="24" r={r} stroke="currentColor" strokeWidth="3" fill="transparent"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" className={cls}/>
      </svg>
      <span className="absolute text-[9px] font-black">{pct}%</span>
    </div>
  );
};

// ─── Appointment Detail View ──────────────────────────────────────────────
const AppointmentDetailView = ({ appt, onClose }: { appt: any; onClose: () => void }) => {
  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto p-12 lg:p-16">
         <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 space-y-10">
               <div className="flex justify-between items-start gap-4">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#5F27CD]/5 flex items-center justify-center text-[#5F27CD] text-2xl font-black shadow-inner">
                       {appt.time?.split(':')[0]}
                    </div>
                    <div>
                       <h3 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">{appt.clientNameSnapshot || appt.title}</h3>
                       <p className="text-[10px] font-black text-[#5F27CD] uppercase tracking-[0.2em] mt-1">{format(new Date(appt.date), 'd MMMM yyyy', { locale: fr })}</p>
                    </div>
                 </div>
                 <button onClick={onClose} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm group shrink-0">
                    <X size={18} className="group-hover:rotate-90 transition-transform"/>
                 </button>
               </div>

               <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                   <button 
                     onClick={() => {
                       const phone = appt.clientPhoneSnapshot?.replace(/\D/g, '');
                       const msg = `Bonjour ${appt.clientNameSnapshot}, je vous confirme votre rendez-vous le ${format(new Date(appt.date), 'dd MMMM', { locale: fr })} à ${appt.time}. Au plaisir !`;
                       if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                     }}
                     className="px-6 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm group"
                   >
                     <MessageCircle size={14}/> WhatsApp
                   </button>

                   <button 
                     onClick={() => alert("Confirmation envoyée")}
                     className="px-6 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                   >
                     <Mail size={14}/> Confirmation
                   </button>

                   <button 
                     onClick={() => alert("Facture envoyée")}
                     className="px-6 h-12 rounded-2xl bg-slate-900 text-white flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-sm group"
                   >
                     <FileText size={14}/> Facture
                   </button>
               </div>

               <div className="space-y-4">
                  {[
                    { label: 'Soin', val: appt.serviceName || 'Soin Signature', icon: <Leaf size={16}/>, color: 'text-emerald-500' },
                    { label: 'Prix', val: `${appt.price || 150} CHF`, icon: <CreditCard size={16}/>, color: 'text-blue-500' },
                    { label: 'Téléphone', val: appt.phone || 'Non renseigné', icon: <Smartphone size={16}/>, color: 'text-orange-500' },
                    { label: 'Email', val: appt.email || 'Non renseigné', icon: <Mail size={16}/>, color: 'text-indigo-500' },
                    { label: 'Statut', val: appt.paid ? 'Réglé' : 'À régler', icon: <CheckCircle2 size={16}/>, color: appt.paid ? 'text-emerald-500' : 'text-orange-500' }
                  ].map((it, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                       <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center ${it.color} shadow-sm`}>
                          {it.icon}
                       </div>
                       <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{it.label}</div>
                          <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{it.val}</div>
                       </div>
                    </div>
                  ))}
               </div>
               

            </div>

            <div className="lg:col-span-8 space-y-10">
               <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Edit3 size={16} className="text-[#5F27CD]"/> Notes de Séance
                     </h4>
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Section Privée</span>
                  </div>
                  <textarea 
                    placeholder="Saisissez vos notes cliniques ici..."
                    className="w-full h-80 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-inner outline-none focus:ring-4 focus:ring-[#5F27CD]/5 transition-all text-slate-600 font-medium leading-relaxed"
                  />
                  <div className="flex justify-end">
                     <button className="px-10 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">
                        Sauvegarder les Notes
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function TherapistDashboard() {
  const firestore = useFirestore();
  const auth      = useAuth();
  const { user, isUserLoading } = useUser();

  // Navigation
  const [tab,  setTab]  = useState<'dashboard' | 'scheduler' | 'clients' | 'settings' | 'accounting' | 'client-detail' | 'config-slots'>('scheduler');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [cur,  setCur]  = useState(new Date());
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Drag-select mode
  const [blockMode, setBlockMode] = useState(false);
  const [isDrag,    setIsDrag]    = useState(false);
  const [dragAct,   setDragAct]   = useState<'open' | 'close'>('open');

  // Firestore data
  const [availability, setAvailability] = useState<any[]>([]);
  const [appointments,  setAppointments]  = useState<any[]>([]);
  const [configSlots,   setConfigSlots]   = useState<Record<number, string[]>>({
    0: [], 1: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    2: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    3: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    4: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    5: ['09:00','10:30','12:00','14:00','15:30','17:00'],
    6: ['10:00','11:30','14:00'],
  });
  const [monthlyGoal, setMonthlyGoal] = useState<number>(12000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('12000');

  // Modal state
  const [evModal, setEvModal] = useState<{ date: string; time: string } | null>(null);
  const [evStep,  setEvStep]  = useState<'choice' | 'book'>('choice');
  const [evName,  setEvName]  = useState('');
  const [evEmail, setEvEmail] = useState('');
  const [evPhone, setEvPhone] = useState('');
  const [evService, setEvService] = useState('');

  // Config modal
  const [cfgOpen,  setCfgOpen]  = useState(false);
  const [cfgDay,   setCfgDay]   = useState(0);
  const [newTime,  setNewTime]  = useState('');
  const [savingCfg, setSavingCfg] = useState(false);

  // New Detail/Edit states
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editService, setEditService] = useState('');
  const [editPrice, setEditPrice] = useState(150);
  const [isSending, setIsSending] = useState(false);
  
  // Invoice state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);

  // Clients state
  const [clients,    setClients]    = useState<any[]>([]);
  const [clModal,    setClModal]    = useState(false);
  const [clForm,     setClForm]     = useState({ firstName: '', lastName: '', email: '', phone: '', phonePrefix: '+41', street: '', zip: '', city: '', canton: '', insurance: '' });
  const [clScaling,  setClScaling]  = useState(false); // For animation
  const [clSearch,   setClSearch]   = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clEditForm, setClEditForm] = useState<any>({ firstName: '', lastName: '', email: '', phone: '', phonePrefix: '+41', street: '', zip: '', city: '', canton: '', insurance: '' });

  const [showColPicker, setShowColPicker] = useState(false);
  const [visibleCols, setVisibleCols] = useState<any>({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    street: false,
    zip: false,
    city: false,
    canton: false,
    insurance: true,
    sessions: true
  });
  const updateGoal = async () => {
    try {
      if (!firestore) return;
      await updateDoc(doc(firestore, 'settings', 'config'), { monthlyGoal: parseInt(tempGoal) || 12000 });
      setMonthlyGoal(parseInt(tempGoal) || 12000);
      setEditingGoal(false);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour de l'objectif");
    }
  };

  useEffect(() => {
    if (!firestore) return;
    return onSnapshot(doc(firestore, 'settings', 'config'), (s) => {
       if (s.exists()) setMonthlyGoal(s.data().monthlyGoal || 12000);
    });
  }, [firestore]);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [merging, setMerging] = useState(false);
  const [addingSlotDay, setAddingSlotDay] = useState<number | null>(null);
  const [acctFilter, setAcctFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [acctSearch, setAcctSearch] = useState('');
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo,   setExportTo]   = useState('');
  const [actionSlot, setActionSlot] = useState<{date: string, time: string} | null>(null);

  // Hydration guard
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // ── Firestore subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    if (!firestore) return;

    const unsubAvail = onSnapshot(collection(firestore, 'availability'), snap =>
      setAvailability(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubAppts = onSnapshot(collection(firestore, 'appointments'), snap =>
      setAppointments(snap.docs.map(d => {
        const data = d.data();
        const [dateStr, timeStr] = (data.startTime || '').split('T');
        return {
          id: d.id, ...data,
          date: dateStr,
          time: timeStr?.substring(0, 5) || '',
          title: data.clientNameSnapshot || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        };
      }).filter(a => a.date)));

    const unsubCfg = onSnapshot(doc(firestore, 'config', 'slots'), snap => {
      if (snap.exists()) setConfigSlots(snap.data() as any);
    });

    const unsubClients = onSnapshot(collection(firestore, 'clients'), snap =>
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubInvoices = onSnapshot(collection(firestore, 'invoices'), snap =>
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubAvail(); unsubAppts(); unsubCfg(); unsubClients(); unsubInvoices(); };
  }, [firestore]);

  const exportToCSV = () => {
    const useSelection = selectedInvoices.length > 0;
    const filtered = appointments.filter(a => {
      if (useSelection) return selectedInvoices.includes(a.id);
      const isOverdue = !a.paid && a.date < format(new Date(), 'yyyy-MM-dd');
      const isPending = !a.paid && a.date >= format(new Date(), 'yyyy-MM-dd');
      const matchStatus = 
        acctFilter === 'all' || 
        (acctFilter === 'paid' && a.paid) ||
        (acctFilter === 'overdue' && isOverdue) ||
        (acctFilter === 'pending' && isPending);
      const afterFrom = !exportFrom || a.date >= exportFrom;
      const beforeTo = !exportTo || a.date <= exportTo;
      return matchStatus && afterFrom && beforeTo;
    });
    const headers = ['Client', 'Date', 'Heure', 'Service', 'Montant', 'Statut'];
    const rows = filtered.map(a => [`"${a.title}"`, a.date, a.time, `"${a.serviceName || 'Soin Signature'}"`, (a.price || 150) + ' CHF', a.paid ? 'Réglé' : 'En attente']);
    const content = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `comptabilite_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportPanel(false);
  };

  // Release drag on mouseup
  useEffect(() => {
    const up = () => isDrag && setIsDrag(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [isDrag]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isDayOpen = useCallback((dStr: string) =>
    availability.some(s => s.date === dStr && s.type === 'day_opened'), [availability]);

  const isSlotBlocked = useCallback((dStr: string, t: string) =>
    availability.some(s => s.date === dStr && s.time === t && s.type === 'blocked'), [availability]);

  const toggleDay = useCallback(async (dStr: string) => {
    if (!firestore) return;
    const existing = availability.find(s => s.date === dStr && s.type === 'day_opened');
    if (existing) await deleteDoc(doc(firestore, 'availability', existing.id));
    else await addDoc(collection(firestore, 'availability'), { date: dStr, type: 'day_opened' });
  }, [firestore, availability]);

  const toggleSlot = useCallback(async (dStr: string, t: string) => {
    if (!firestore) return;
    const existing = availability.find(s => s.date === dStr && s.time === t && s.type === 'blocked');
    if (existing) await deleteDoc(doc(firestore, 'availability', existing.id));
    else await addDoc(collection(firestore, 'availability'), { date: dStr, time: t, type: 'blocked' });
  }, [firestore, availability]);

  const period = (dir: number) => {
    const d = new Date(cur);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCur(d);
  };

  const openModal = (date: string, time: string) => {
    setEvModal({ date, time }); setEvStep('choice'); setEvName(''); setEvEmail(''); setEvPhone(''); setEvService('');
  };

  const saveBook = async () => {
    if (!evName.trim() || !firestore || !evModal || !evModal.date || !evModal.time) {
      alert("Veuillez remplir le nom du client.");
      return;
    }
    
    try {
      // 1. Check/Create Client
      let clientId = '';
      const existingClient = clients.find(c => 
        (c.firstName + ' ' + c.lastName).toLowerCase().trim() === evName.trim().toLowerCase()
      );

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const parts = evName.trim().split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        const clientRef = await addDoc(collection(firestore, 'clients'), {
          firstName: firstName,
          lastName: lastName || '',
          email: evEmail.trim(),
          phone: evPhone.trim(),
          createdAt: serverTimestamp(),
        });
        clientId = clientRef.id;
      }

      // 2. Create Appointment
      const apptId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const magicToken = Math.random().toString(36).substring(2, 15);
      const selectedSvc = SERVICES.find(s => s.id === evService);
      const appointmentData = {
        date: evModal.date,
        time: evModal.time,
        startTime: `${evModal.date}T${evModal.time}:00`,
        clientId: clientId,
        clientNameSnapshot: evName.trim(),
        clientEmail: evEmail.trim(),
        phone: evPhone.trim(),
        title: evName.trim(),
        serviceName: selectedSvc ? selectedSvc.name : '',
        serviceId: evService,
        price: selectedSvc ? selectedSvc.price : 150,
        status: 'confirmed',
        magicToken: magicToken,
        createdAt: serverTimestamp(),
      };

      // 3. Create Invoice
      const invoiceId = `INV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const svcPrice = selectedSvc ? selectedSvc.price : 150;
      const svcName  = selectedSvc ? selectedSvc.name : 'Soin Serenity (Manuel)';
      const invoiceData = {
        id: invoiceId,
        invoiceNumber: invoiceId,
        clientId: clientId,
        clientNameSnapshot: evName.trim(),
        issueDate: evModal.date,
        dueDate: evModal.date,
        totalAmount: svcPrice,
        status: 'Pending',
        appointmentId: apptId,
        items: [
          {
            description: svcName,
            amount: svcPrice,
            quantity: 1
          }
        ],
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(firestore, 'appointments', apptId), appointmentData),
        setDoc(doc(firestore, 'invoices', invoiceId), invoiceData)
      ]);

      setEvModal(null);
      setEvName('');
      setEvStep('choice');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réservation.");
    }
  };

  const saveBlock = async () => {
    if (!firestore || !evModal) return;
    await toggleSlot(evModal.date, evModal.time);
    setEvModal(null);
  };

  const deleteEvent = async () => {
    if (!firestore || !selectedAppt) return;
    if (!window.confirm('Voulez-vous vraiment supprimer ce rendez-vous ? Cette action est irréversible.')) return;
    try {
      await deleteDoc(doc(firestore, 'appointments', selectedAppt.id));
      setSelectedAppt(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const saveEdit = async () => {
    if (!selectedAppt || !editName.trim() || !firestore) return;
    try {
      await updateDoc(doc(firestore, 'appointments', selectedAppt.id), {
        clientNameSnapshot: editName.trim(),
        serviceName: editService.trim(),
        price: editPrice
      });

      // Update associated invoice
      const linkedInv = invoices.find(inv => inv.appointmentId === selectedAppt.id);
      if (linkedInv) {
        await updateDoc(doc(firestore, 'invoices', linkedInv.id), {
          totalAmount: editPrice,
          items: [{ description: editService.trim(), amount: editPrice }]
        });
      }

      setIsEditing(false);
      setSelectedAppt(null); // Close modal on success
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const mergePatients = async (primaryId: string) => {
    if (!firestore || !primaryId) return;
    const targets = selectedClients.filter(id => id !== primaryId);
    if (targets.length === 0) return;
    if (!confirm(`Voulez-vous fusionner ces ${targets.length} comptes vers le profil principal ? Cette action est irréversible.`)) return;

    try {
      // Migrate appointments
      const apptPromises = appointments
        .filter(a => targets.includes(a.clientId))
        .map(a => updateDoc(doc(firestore, 'appointments', a.id), { clientId: primaryId }));
      
      await Promise.all(apptPromises);

      // Delete target clients
      const clientPromises = targets.map(tid => deleteDoc(doc(firestore, 'clients', tid)));
      await Promise.all(clientPromises);

      setSelectedClients([]);
      setMerging(false);
      alert("Fusion réussie !");
    } catch (err) {
      console.error(err);
      alert("Erreur de fusion");
    }
  };
  const resendEmail = async () => {
    if (!selectedAppt) return;
    setIsSending(true);
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          clientName: selectedAppt.clientNameSnapshot || selectedAppt.title,
          clientEmail: selectedAppt.clientEmail,
          clientPhone: selectedAppt.phone,
          serviceName: selectedAppt.serviceName,
          startTime: selectedAppt.startTime,
          magicToken: selectedAppt.magicToken,
          clientId: selectedAppt.clientId
        })
      });
      if (resp.ok) {
        alert("Confirmation renvoyée avec succès !");
      } else {
        alert("Erreur lors de l'envoi de l'email.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    } finally {
      setIsSending(false);
    }
  };

  const addSlot = () => {
    if (!newTime) return;
    setConfigSlots(p => {
      const a = p[cfgDay] || [];
      if (a.includes(newTime)) return p;
      return { ...p, [cfgDay]: [...a, newTime] };
    });
    setNewTime('');
  };

  const removeSlot = (t: string) =>
    setConfigSlots(p => ({ ...p, [cfgDay]: (p[cfgDay] || []).filter(s => s !== t) }));

  const addSlotD = (dayIdx: number, timeStr: string) => {
    if (!timeStr) return;
    setConfigSlots(p => {
      const a = p[dayIdx] || [];
      if (a.includes(timeStr)) return p;
      return { ...p, [dayIdx]: [...a, timeStr].sort() };
    });
  };

  const removeSlotD = (dayIdx: number, timeStr: string) =>
    setConfigSlots(p => ({ ...p, [dayIdx]: (p[dayIdx] || []).filter(s => s !== timeStr) }));

  const applyToWeek = () => {
    const src = [...(configSlots[cfgDay] || [])];
    const n: Record<number, string[]> = {};
    for (let i = 0; i < 7; i++) n[i] = [...src];
    setConfigSlots(n);
  };

  const saveConfig = async () => {
    if (!firestore) return;
    setSavingCfg(true);
    await setDoc(doc(firestore, 'config', 'slots'), configSlots);
    setSavingCfg(false);
    setCfgOpen(false);
  };

  const saveClient = async () => {
    if (!firestore || !clForm.firstName || !clForm.lastName) return;
    setClScaling(true);
    await addDoc(collection(firestore, 'clients'), {
      ...clForm,
      createdAt: serverTimestamp(),
    });
    setClModal(false);
    setClForm({ firstName: '', lastName: '', email: '', phone: '', phonePrefix: '+41', street: '', zip: '', city: '', canton: '', insurance: '' });
    setClScaling(false);
  };

  const openClientFolder = (c: any) => {
    setSelectedClient(c);
    setClEditForm(c);
    setIsEditingClient(false);
    setTab('client-detail');
  };

  const saveClientEdit = async () => {
    if (!firestore || !selectedClient) return;
    setClScaling(true);
    await updateDoc(doc(firestore, 'clients', selectedClient.id), {
      ...clEditForm,
      fullPhone: `${clEditForm.phonePrefix}${clEditForm.phone}`
    });
    setSelectedClient({ ...selectedClient, ...clEditForm, fullPhone: `${clEditForm.phonePrefix}${clEditForm.phone}` });
    setIsEditingClient(false);
    setClScaling(false);
  };

  // ── KPI calculations ─────────────────────────────────────────────────────
  const openDates = availability.filter(s => s.type === 'day_opened').map(s => s.date);
  const totalSlots = openDates.reduce((acc, ds) => acc + (configSlots[isoDay(new Date(ds))] || []).length, 0);
  const bookedCount = appointments.filter(e => openDates.includes(e.date)).length;

  const mKey = cur.toISOString().slice(0, 7);
  const monthRevenue = appointments.filter(e => (e.date || '').startsWith(mKey)).length * PRICE;

  const ws0   = wkStart(new Date());
  const wkDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(ws0); d.setDate(ws0.getDate() + i); return fmt(d); });
  const weekAppts = appointments.filter(e => wkDates.includes(e.date)).length;

  const upcoming = appointments
    .filter(e => e.date && new Date(e.date) >= startOfDay(new Date()))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 4);

  // Mini-calendar cells
  const mY = cur.getFullYear(), mM = cur.getMonth();
  const miniStart = startOfWeek(startOfMonth(cur), { weekStartsOn: 1 });
  const miniEnd   = endOfWeek(endOfMonth(cur), { weekStartsOn: 1 });
  const miniDays  = eachDayOfInterval({ start: miniStart, end: miniEnd });

  // Navigation header label
  let hdr = '';
  if (view === 'month') hdr = `${MONTHS_FR[cur.getMonth()]} ${cur.getFullYear()}`;
  else if (view === 'week') {
    const s = wkStart(new Date(cur)), e = new Date(s);
    e.setDate(s.getDate() + 6);
    hdr = `${s.getDate()} – ${e.getDate()} ${MONTHS_FR[e.getMonth()]} ${e.getFullYear()}`;
  } else hdr = fmtFR(cur);

  if (!isClient) return null;

  // ── VIEWS ─────────────────────────────────────────────────────────────────
  const MonthView = () => {
    const start = startOfWeek(startOfMonth(cur), { weekStartsOn: 1 });
    const end   = endOfWeek(endOfMonth(cur), { weekStartsOn: 1 });
    const days  = eachDayOfInterval({ start, end });

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 bg-white/50 border-b border-slate-100 shrink-0">
          {DAYS_S.map(l => <div key={l} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-[0.2em]">{l}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ gridAutoRows: 'minmax(105px, 1fr)' }}>
          {days.map((day, i) => {
            const dStr    = fmt(day);
            const isOpen  = isDayOpen(dStr);
            const isToday = isSameDay(new Date(), day);
            const inMonth = isSameMonth(day, cur);
            const daySlots = configSlots[isoDay(day)] || [];
            const booked   = appointments.filter(e => e.date === dStr).length;
            const free     = daySlots.length - booked;

            return (
              <div key={i}
                className={`day-cell-m p-5 border-r border-b border-slate-100 flex flex-col items-end gap-1 transition-all duration-300 relative cursor-pointer
                  ${!inMonth ? 'bg-slate-50/50 opacity-20 cursor-default' : 'hover:bg-blue-50/30'}
                  ${inMonth && isToday ? 'bg-blue-50/50' : ''}
                  ${inMonth && !isOpen ? 'day-closed-stripes !bg-slate-200/50' : ''}
                `}
                onMouseDown={e => {
                  if (!inMonth) return;
                  if (blockMode) {
                    setIsDrag(true);
                    setDragAct(isOpen ? 'close' : 'open');
                    toggleDay(dStr);
                    e.preventDefault();
                  }
                }}
                onMouseEnter={() => { if (isDrag && inMonth) toggleDay(dStr); }}
                onClick={() => { if (!blockMode && inMonth) { setCur(day); setView('week'); } }}
              >
                <span className={`text-[12px] font-black tracking-tighter ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-lg' : inMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                  {day.getDate()}
                </span>
                
                {inMonth && (
                  <div className="mt-auto w-full flex flex-col gap-1.5">
                    {isOpen ? (
                      <div className="flex items-center justify-between w-full">
                         <div className="flex flex-wrap gap-1">
                            {Array.from({ length: Math.min(booked, 3) }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"/>
                            ))}
                         </div>
                      </div>
                    ) : (
                      <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] text-right italic opacity-50">Fermé</div>
                    )}
                  </div>
                 )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const s    = wkStart(new Date(cur));
    const days = Array.from({ length: 7 }, (_, i) => addDays(s, i));
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        <div className="grid grid-cols-7 border-b border-slate-100 shrink-0 bg-white">
          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            const dStr    = fmt(d);
            const isOpen  = isDayOpen(dStr);
            return (
              <div key={i} 
                className={`py-6 text-center border-r border-slate-50 relative group transition-all cursor-pointer hover:bg-slate-50
                  ${!isOpen ? 'bg-slate-50' : 'bg-white'}
                `}
                onMouseDown={e => {
                  if (blockMode) {
                    setIsDrag(true);
                    setDragAct(isOpen ? 'close' : 'open');
                    toggleDay(dStr);
                    e.preventDefault();
                  }
                }}
                onMouseEnter={() => { if (isDrag) toggleDay(dStr); }}
              >
                {!isOpen && <div className="absolute inset-0 day-closed-stripes opacity-30 pointer-events-none"/>}
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{DAYS_S[i]}</p>
                <div className="flex flex-col items-center mt-2 relative z-10">
                   <p className={`text-2xl leading-none ${isToday ? 'text-blue-600' : '!text-slate-900 opacity-80'}`}>{d.getDate()}</p>
                   {isToday && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shadow-lg shadow-blue-200"/>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto bg-slate-50/30">
          {days.map((d, i) => {
            const dStr    = fmt(d);
            const isOpen  = isDayOpen(dStr);
            const slots   = [...(configSlots[isoDay(d)] || [])].sort();
            return (
              <div key={i}
                className={`border-r border-slate-100 p-4 flex flex-col gap-3 min-h-[600px] transition-all relative
                  ${!isOpen ? 'day-closed-stripes !bg-slate-200/50' : ''}
                `}
                onMouseDown={e => {
                  if (blockMode && e.target === e.currentTarget) {
                    setIsDrag(true);
                    setDragAct(isOpen ? 'close' : 'open');
                    toggleDay(dStr);
                    e.preventDefault();
                  }
                }}
                onMouseEnter={() => { if (isDrag) toggleDay(dStr); }}
              >
                {!isOpen && <div className="absolute inset-0 bg-slate-50/40 pointer-events-none"/>}
                {isOpen ? slots.map(t => {
                  const ev       = appointments.find(e => e.date === dStr && e.time === t);
                  const blocked  = isSlotBlocked(dStr, t);
                  const isAct    = actionSlot?.date === dStr && actionSlot?.time === t;
                  return (
                    <div key={t}
                      onClick={(e) => {
                        if (blockMode) {
                          if (!ev) toggleSlot(dStr, t);
                          return;
                        }
                        if (ev) setSelectedAppt(ev);
                        else if (blocked) toggleSlot(dStr, t);
                        else setActionSlot(isAct ? null : { date: dStr, time: t });
                      }}
                      className={`week-slot p-4 rounded-2xl text-[11px] font-black transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-center min-h-[60px]
                        ${ev ? 'bg-blue-600 border-transparent text-white shadow-blue-200/50 shadow-sm'
                          : blocked ? 'bg-slate-900 border-transparent text-white shadow-sm'
                            : isAct ? 'bg-transparent border-transparent shadow-none'
                              : 'bg-white border border-slate-100 text-slate-900 hover:border-blue-400 hover:text-blue-600 shadow-sm'}`}
                    >
                      {isAct ? (
                        <div className="flex items-center gap-1.5 justify-center w-full animate-in zoom-in-95 fade-in duration-500">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModal(dStr, t); setActionSlot(null); }}
                            className="w-8 h-8 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                            title="Réserver"
                          >
                            <Plus size={14}/>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleSlot(dStr, t); setActionSlot(null); }}
                            className="w-8 h-8 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white"
                            title="Bloquer"
                          >
                            <Ban size={14}/>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActionSlot(null); }}
                            className="w-8 h-8 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all flex items-center justify-center bg-stone-50 text-stone-400 hover:bg-stone-200"
                            title="Annuler"
                          >
                            <X size={14}/>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="opacity-80 tracking-tight shrink-0">{t}</span>
                            {ev && <span className="text-[9px] font-black uppercase tracking-tight truncate opacity-90">— {ev.clientNameSnapshot || ev.title}</span>}
                            <div className="ml-auto flex items-center gap-1 shrink-0">
                               {ev && <CheckCircle2 size={10}/>}
                               {blocked && <Lock size={10}/>}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }) : (
                  <div className="flex-1 flex items-center justify-center opacity-10">
                    <Lock size={40} className="text-slate-900"/>
                  </div>
                )}
                {isOpen && (
                  <div className="pt-2">
                    {addingSlotDay === isoDay(d) ? (
                      <input 
                        type="time" 
                        autoFocus
                        onBlur={() => setAddingSlotDay(null)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { addSlotD(isoDay(d), e.currentTarget.value); setAddingSlotDay(null); }
                          if (e.key === 'Escape') setAddingSlotDay(null);
                        }} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-900 outline-none transition-all shadow-sm" 
                      />
                    ) : (
                      <button 
                        onClick={() => setAddingSlotDay(isoDay(d))}
                        className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:text-emerald-600 transition-all border-t border-slate-50 mt-2"
                      >
                        <Plus size={12}/> AJOUTER UN CRÉNEAU
                      </button>
                    )}
                  </div>
                )}
              </div>

            );
          })}
        </div>
      </div>
    );
  };



  
  const ConfigView = () => {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        <div className="grid grid-cols-7 border-b border-slate-100 shrink-0 bg-white">
          {DAYS_S.map((label, i) => (
            <div key={i} className="py-6 text-center border-r border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto bg-slate-50/30">
          {DAYS_S.map((_, i) => {
            const slots = [...(configSlots[i] || [])].sort();
            return (
              <div key={i} className="border-r border-slate-100 p-4 flex flex-col gap-3 min-h-[600px] transition-all relative">
                <div className="flex-1 space-y-3">
                  {slots.map(t => (
                    <div key={t} className="week-slot p-4 rounded-2xl text-[11px] font-black border transition-all shadow-sm bg-white border-blue-100 text-blue-600 flex justify-between items-center group">
                      <span>{t}</span>
                      <button onClick={() => removeSlotD(i, t)} className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                    </div>
                  ))}
                  {slots.length === 0 && <p className="text-center text-[9px] font-bold text-slate-300 italic py-4">Aucun créneau</p>}
                </div>

                <div className="pt-4 border-t border-slate-50 mt-auto">
                  {addingSlotDay === i ? (
                    <input 
                      type="time" autoFocus
                      onBlur={() => setAddingSlotDay(null)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { addSlotD(i, e.currentTarget.value); setAddingSlotDay(null); }
                        if (e.key === "Escape") setAddingSlotDay(null);
                      }} 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-900 outline-none transition-all shadow-sm" 
                    />
                  ) : (
                    <button 
                      onClick={() => setAddingSlotDay(i)}
                      className="w-full py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:text-emerald-600 transition-all"
                    >
                      <Plus size={12}/> AJOUTER UN CRÉNEAU
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayAppts = appointments.filter(a => a.date === todayStr).sort((a,b) => (a.time || '').localeCompare(b.time || ''));
    const pendingPaymentsCount = appointments.filter(a => !a.paid).length;

    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-10 lg:p-14">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">


            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium tracking-tight">Timeline du Jour</h3>
                <button onClick={() => { setTab('scheduler'); setView('week'); }} className="text-[9px] font-black text-[#5F27CD] uppercase tracking-[0.3em] hover:opacity-70 transition">Accéder au planning complet</button>
              </div>

              <div className="space-y-3">
                {todayAppts.length > 0 ? todayAppts.map((appt) => (
                  <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="group bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-900 text-xs shadow-inner">
                        {appt.time}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-[#222F3E] text-sm uppercase tracking-tight">{appt.clientNameSnapshot || appt.title}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{appt.serviceName || 'Soin Signature'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${appt.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                         {appt.paid ? 'Payé' : 'À régler'}
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#5F27CD] group-hover:text-white transition-all">
                         <ChevronRight size={16}/>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-24 bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-100/50 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm"><Clock size={32} strokeWidth={1.5}/></div>
                    <p className="text-slate-400 font-bold italic tracking-tight text-sm">Aucune activité programmée pour aujourd'hui.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="premium-card p-10 rounded-[3rem] bg-gradient-to-br from-[#0984E3] to-[#74B9FF] text-white shadow-2xl shadow-blue-900/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"/>
               <div className="relative flex justify-between items-start">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Météo Cointrin</h3>
                    <p className="text-3xl font-medium tracking-tighter">14°C</p>
                    <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest">Partiellement Couvert</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                     <Cloud size={32} className="text-white"/>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 gap-4 mt-10 relative">
                  {[
                    { h: '19:00', t: '12°', i: <Cloud size={14}/> },
                    { h: '20:00', t: '11°', i: <Moon size={14}/> },
                    { h: '21:00', t: '9°', i: <Moon size={14}/> },
                  ].map((w,i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <p className="text-[8px] font-black opacity-60 mb-1">{w.h}</p>
                      <div className="flex justify-center my-1">{w.i}</div>
                      <p className="text-xs font-extrabold">{w.t}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="premium-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/20">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner"><Target size={20}/></div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Objectif du mois</h3>
                      {editingGoal ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input 
                            type="number" 
                            value={tempGoal} 
                            onChange={e => setTempGoal(e.target.value)}
                            onBlur={updateGoal}
                            onKeyDown={e => e.key === 'Enter' && updateGoal()}
                            autoFocus
                            className="w-20 bg-slate-50 border-none text-[10px] font-black text-[#5F27CD] outline-none rounded-lg px-2 h-6"
                          />
                          <span className="text-[10px] font-bold text-slate-400">CHF</span>
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          {(appointments.filter(a => a.paid && a.date.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s, a) => s + (a.price || 150), 0) / 1000).toFixed(1)}k / {(monthlyGoal / 1000).toFixed(0)}k CHF
                          <button onClick={() => { setTempGoal(monthlyGoal.toString()); setEditingGoal(true); }} className="hover:text-indigo-600 transition-colors"><Edit3 size={12}/></button>
                        </p>
                      )}
                    </div>
                  </div>
               </div>
               <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg shadow-indigo-200 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (appointments.filter(a => a.paid && a.date.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s, a) => s + (a.price || 150), 0) / monthlyGoal) * 100)}%` }}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AccountingView = () => {
    const [sortKey, setSortKey] = useState<'date' | 'title' | 'price' | 'status' | 'invoice' | 'service'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [displayCount, setDisplayCount] = useState(20);
    const [payingId, setPayingId] = useState<string | null>(null);

    const handleSort = (key: typeof sortKey) => {
      if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setSortKey(key); setSortDir('asc'); }
    };

    const SortIcon = ({ col }: { col: typeof sortKey }) => (
      <span className={`ml-1 transition-opacity ${sortKey === col ? 'opacity-100' : 'opacity-20'}`}>
        {sortKey === col && sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );

    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(acctSearch.toLowerCase());
      const isOverdue = !a.paid && a.date < format(new Date(), 'yyyy-MM-dd');
      const isPending = !a.paid && a.date >= format(new Date(), 'yyyy-MM-dd');
      const matchStatus = 
        acctFilter === 'all' || 
        (acctFilter === 'paid' && a.paid) ||
        (acctFilter === 'overdue' && isOverdue) ||
        (acctFilter === 'pending' && isPending);
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      let va: string | number = '', vb: string | number = '';
      if (sortKey === 'date') { va = a.date || ''; vb = b.date || ''; }
      else if (sortKey === 'title') { va = a.title || ''; vb = b.title || ''; }
      else if (sortKey === 'price') { va = a.price || 150; vb = b.price || 150; }
      else if (sortKey === 'status') { va = a.paid ? 1 : 0; vb = b.paid ? 1 : 0; }
      else if (sortKey === 'service') { va = (a.serviceName || '').toLowerCase(); vb = (b.serviceName || '').toLowerCase(); }
      else if (sortKey === 'invoice') {
        const ia = invoices.find(i => i.appointmentId === a.id);
        const ib = invoices.find(i => i.appointmentId === b.id);
        va = ia?.invoiceNumber || ''; vb = ib?.invoiceNumber || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const visibleAppts = filteredAppts.slice(0, displayCount);
    const hasMore = displayCount < filteredAppts.length;

    const totalRevenue = filteredAppts.reduce((sum, a) => sum + (a.price || 150), 0);
    const paidRevenue = filteredAppts.filter(a => a.paid).reduce((sum, a) => sum + (a.price || 150), 0);

    const togglePayment = async (id: string, current: boolean, method?: string) => {
      try {
        const updateData: any = { paid: !current };
        if (!current) updateData.paymentMethod = method || 'Inconnu';
        else updateData.paymentMethod = deleteField();
        await updateDoc(doc(firestore, 'appointments', id), updateData);
        setPayingId(null);
      } catch (e) { console.error('Error updating payment', e); }
    };

    const ThCol = ({ col, label, right }: { col: typeof sortKey; label: string; right?: boolean }) => (
      <th className={`px-5 pb-2 cursor-pointer select-none hover:text-slate-700 transition-colors ${right ? 'text-right' : ''}`} onClick={() => handleSort(col)}>
        {label}<SortIcon col={col}/>
      </th>
    );

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* ── table ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto px-8 py-2 pb-10">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead>
                <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  <th className="px-5 pb-3 w-10">
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 cursor-pointer"
                      checked={selectedInvoices.length === filteredAppts.length && filteredAppts.length > 0}
                      onChange={e => setSelectedInvoices(e.target.checked ? filteredAppts.map(a => a.id) : [])}
                    />
                  </th>
                  <ThCol col="title" label="Patient"/>
                  <ThCol col="invoice" label="N° Facture"/>
                  <ThCol col="date" label="Date & Heure"/>
                  <ThCol col="service" label="Soin"/>
                  <ThCol col="price" label="Montant" right/>
                  <ThCol col="status" label="Statut"/>
                  <th className="px-5 pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleAppts.map(a => {
                  const inv = invoices.find(inv => inv.appointmentId === a.id);
                  const isSel = selectedInvoices.includes(a.id);
                  return (
                    <tr key={a.id}
                      className={`group cursor-pointer transition-all ${isSel ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
                      onClick={() => { if (inv) window.open('/therapist/invoice/' + inv.id, '_blank'); else setSelectedAppt(a); }}
                    >
                      <td className="p-4 bg-white border-y border-l border-neutral-100 rounded-l-2xl shadow-sm w-10" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-4 h-4 rounded border-neutral-200 cursor-pointer"
                          checked={isSel}
                          onChange={() => { if (isSel) setSelectedInvoices(p => p.filter(x => x !== a.id)); else setSelectedInvoices(p => [...p, a.id]); }}
                        />
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        <div className="font-extrabold text-sm text-neutral-900 tracking-tight uppercase">{a.title}</div>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        {inv ? (
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">#{inv.invoiceNumber}</span>
                        ) : (
                          <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest italic">N/A</span>
                        )}
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500">
                        {a.date} <span className="text-[10px] opacity-40 ml-2">{a.time}</span>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{a.serviceName || 'Soin Signature'}</div>
                      </td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-right font-black text-neutral-900">{a.price || 150} CHF</td>
                      <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                        {a.paid ? (
                          <div className="relative group/btn">
                            <button onClick={e => { e.stopPropagation(); togglePayment(a.id, true); }}
                              className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600 transition-all">
                              Réglé via {a.paymentMethod || 'Inconnu'}
                            </button>
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Cliquer pour annuler</span>
                          </div>
                        ) : payingId === a.id ? (
                          <div className="flex items-center gap-1 animate-in zoom-in-95 duration-200">
                            {(['Twint', 'Card', 'Cash'] as const).map(m => (
                              <button key={m} onClick={e => { e.stopPropagation(); togglePayment(a.id, false, m); }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all ${m === 'Twint' ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : m === 'Card' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                title={m}>
                                {m === 'Twint' ? <Smartphone size={14}/> : m === 'Card' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                              </button>
                            ))}
                            <button onClick={e => { e.stopPropagation(); setPayingId(null); }} className="w-8 h-8 rounded-full bg-neutral-50 text-neutral-400 flex items-center justify-center hover:bg-neutral-100"><X size={14}/></button>
                          </div>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); setPayingId(a.id); }}
                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              a.date < format(new Date(), 'yyyy-MM-dd') 
                                ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-500 hover:text-white'
                            }`}>
                            {a.date < format(new Date(), 'yyyy-MM-dd') ? 'En retard' : 'En attente'}
                          </button>
                        )}
                      </td>
                      <td className="p-4 bg-white border-y border-r border-neutral-100 rounded-r-2xl shadow-sm text-right">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 group-hover:bg-indigo-600 group-hover:text-white text-neutral-400 transition-all flex items-center justify-center mx-auto shadow-sm">
                          <FileText size={16}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* infinite load */}
          {hasMore && (
            <div className="flex justify-center pt-6 pb-2">
              <button onClick={() => setDisplayCount(c => c + 20)}
                className="px-8 py-3.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-100 hover:border-indigo-600 flex items-center gap-3">
                <ChevronRight size={14} className="rotate-90"/> Charger plus ({filteredAppts.length - displayCount} restants)
              </button>
            </div>
          )}

          {filteredAppts.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-neutral-200"><CreditCard size={32}/></div>
              <p className="text-neutral-400 font-bold italic">Aucune donnée correspondant aux critères.</p>
            </div>
          )}
        </div>
      </div>
    );
  };


  const PatientsView = () => {
    const [clSort, setClSort] = useState<{ key: string, dir: 'asc' | 'desc' }>({ key: 'firstName', dir: 'asc' });

    const filtered = clients.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(clSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(clSearch.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      let va = '', vb = '';
      if (clSort.key === 'firstName') { va = a.firstName; vb = b.firstName; }
      else if (clSort.key === 'lastName') { va = a.lastName; vb = b.lastName; }
      else if (clSort.key === 'email') { va = a.email || ''; vb = b.email || ''; }
      else if (clSort.key === 'phone') { va = a.phone || ''; vb = b.phone || ''; }
      else if (clSort.key === 'insurance') { va = a.insurance || ''; vb = b.insurance || ''; }
      else if (clSort.key === 'sessions') {
        const sA = appointments.filter(apt => apt.clientId === a.id || apt.title === `${a.firstName} ${a.lastName}`).length;
        const sB = appointments.filter(apt => apt.clientId === b.id || apt.title === `${b.firstName} ${b.lastName}`).length;
        return clSort.dir === 'asc' ? sA - sB : sB - sA;
      }
      const res = va.localeCompare(vb);
      return clSort.dir === 'asc' ? res : -res;
    });

    const SortIcon = ({ k }: { k: string }) => (
      <button onClick={() => setClSort(prev => ({ key: k, dir: prev.key === k && prev.dir === 'asc' ? 'desc' : 'asc' }))} className={`ml-1 transition-all ${clSort.key === k ? 'text-indigo-600' : 'text-neutral-300 hover:text-neutral-500'}`}>
        <ArrowUpDown size={10}/>
      </button>
    );

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-auto px-8 py-2 pb-20">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] select-none">
                  <th className="px-5 pb-2 w-10"></th>
                  {visibleCols.firstName && <th className="px-5 pb-2 cursor-pointer hover:text-neutral-600 transition-colors" onClick={() => setClSort(prev => ({ key: 'firstName', dir: prev.key === 'firstName' && prev.dir === 'asc' ? 'desc' : 'asc' }))}>Prénom <SortIcon k="firstName"/></th>}
                  {visibleCols.lastName && <th className="px-5 pb-2 cursor-pointer hover:text-neutral-600 transition-colors" onClick={() => setClSort(prev => ({ key: 'lastName', dir: prev.key === 'lastName' && prev.dir === 'asc' ? 'desc' : 'asc' }))}>Nom <SortIcon k="lastName"/></th>}
                  {visibleCols.email && <th className="px-5 pb-2 cursor-pointer hover:text-neutral-600 transition-colors" onClick={() => setClSort(prev => ({ key: 'email', dir: prev.key === 'email' && prev.dir === 'asc' ? 'desc' : 'asc' }))}>Email <SortIcon k="email"/></th>}
                  {visibleCols.phone && <th className="px-5 pb-2 cursor-pointer hover:text-neutral-600 transition-colors" onClick={() => setClSort(prev => ({ key: 'phone', dir: prev.key === 'phone' && prev.dir === 'asc' ? 'desc' : 'asc' }))}>Tél <SortIcon k="phone"/></th>}
                  {visibleCols.street && <th className="px-5 pb-2">Rue</th>}
                  {visibleCols.zip && <th className="px-5 pb-2 text-center">NPA</th>}
                  {visibleCols.city && <th className="px-5 pb-2">Ville</th>}
                  {visibleCols.canton && <th className="px-5 pb-2">Canton</th>}
                  {visibleCols.insurance && <th className="px-5 pb-2 cursor-pointer hover:text-neutral-600 transition-colors" onClick={() => setClSort(prev => ({ key: 'insurance', dir: prev.key === 'insurance' && prev.dir === 'asc' ? 'desc' : 'asc' }))}>Assurance <SortIcon k="insurance"/></th>}
                  {visibleCols.sessions && <th className="px-5 pb-2 text-center cursor-pointer hover:text-neutral-600 transition-colors" onClick={() => setClSort(prev => ({ key: 'sessions', dir: prev.key === 'sessions' && prev.dir === 'asc' ? 'desc' : 'asc' }))}>Séances <SortIcon k="sessions"/></th>}
                  <th className="px-5 pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => {
                  const sessions = appointments.filter(a => a.clientId === c.id || a.title === `${c.firstName} ${c.lastName}`).length;
                  const isSel = selectedClients.includes(c.id);
                  return (
                    <tr 
                      key={c.id} 
                      className="group transition-transform hover:scale-[1.01] cursor-pointer"
                      onClick={() => openClientFolder(c)}
                    >
                      <td className="p-4 bg-white border-y border-l border-neutral-100 rounded-l-[2rem] shadow-sm w-10" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-4 h-4 rounded border-neutral-200 cursor-pointer"
                          checked={isSel}
                          onChange={() => { if (isSel) setSelectedClients(p => p.filter(x => x !== c.id)); else setSelectedClients(p => [...p, c.id]); }}
                        />
                      </td>
                      {visibleCols.firstName && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                           <div className="font-extrabold text-sm text-neutral-900 tracking-tight uppercase">{c.firstName}</div>
                        </td>
                      )}
                      {visibleCols.lastName && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500 uppercase">
                          {c.lastName}
                        </td>
                      )}
                      {visibleCols.email && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500">
                          {c.email}
                        </td>
                      )}
                      {visibleCols.phone && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-xs font-bold text-neutral-500">
                          {c.phone}
                        </td>
                      )}
                      {visibleCols.street && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-[10px] font-bold text-neutral-400">
                          {c.street || '—'}
                        </td>
                      )}
                      {visibleCols.zip && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-center text-[10px] font-black text-neutral-900">
                          {c.zip || '—'}
                        </td>
                      )}
                      {visibleCols.city && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-[10px] font-bold text-neutral-400">
                          {c.city || '—'}
                        </td>
                      )}
                      {visibleCols.canton && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-[10px] font-bold text-neutral-400 italic">
                          {c.canton || '—'}
                        </td>
                      )}
                      {visibleCols.insurance && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm">
                          <span className="px-3 py-1 bg-neutral-50 text-neutral-400 rounded-lg text-[10px] font-black border border-neutral-100 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                            {c.insurance || '—'}
                          </span>
                        </td>
                      )}
                      {visibleCols.sessions && (
                        <td className="p-4 bg-white border-y border-neutral-100 shadow-sm text-center font-black text-neutral-900">
                          {sessions}
                        </td>
                      )}
                      <td className="p-4 bg-white border-y border-r border-neutral-100 rounded-r-[2rem] shadow-sm text-right">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 group-hover:bg-indigo-600 group-hover:text-white text-neutral-400 transition-all flex items-center justify-center mx-auto shadow-sm">
                          <ChevronRight size={16}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-neutral-200">
                <Users size={32}/>
              </div>
              <p className="text-neutral-400 font-bold italic">Aucun patient trouvé.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hydration guard & Loading state
  const ClientFolderView = () => {
    if (!selectedClient) return null;
    return (
      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Info Column */}
           <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-[#222F3E] tracking-tighter uppercase font-black tracking-widest text-[10px]">Informations</h3>
                </div>
                
                {!isEditingClient ? (
                  <div className="space-y-1">
                    {[
                      { key: 'email', label: 'Email', val: selectedClient.email, icon: <Mail size={16}/>, color: 'text-[#54A0FF]' },
                      { key: 'phone', label: 'Téléphone', val: selectedClient.fullPhone || `${selectedClient.phonePrefix || ''} ${selectedClient.phone || ''}`, icon: <Activity size={16}/>, color: 'text-[#1DD1A1]' },
                      { key: 'address', label: 'Adresse', val: `${selectedClient.street || ''} ${selectedClient.zip || ''} ${selectedClient.city || ''} ${selectedClient.canton || ''}`, icon: <Target size={16}/>, color: 'text-[#FF9F43]' },
                      { key: 'insurance', label: 'Assurance', val: selectedClient.insurance, icon: <CheckCircle2 size={16}/>, color: 'text-[#5F27CD]' },
                    ].map((it, i) => (
                      <div 
                        key={i} 
                        onClick={() => { setClEditForm(selectedClient); setIsEditingClient(true); }}
                        className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
                      >
                         <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${it.color} group-hover:bg-white transition-colors`}>
                            {it.icon}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{it.label}</div>
                            <p className="text-sm font-bold text-slate-900 truncate">{it.val || '—'}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <input value={clEditForm.firstName} onChange={e => setClEditForm({...clEditForm, firstName: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Prénom"/>
                    <input value={clEditForm.lastName} onChange={e => setClEditForm({...clEditForm, lastName: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Nom"/>
                    <input value={clEditForm.email} onChange={e => setClEditForm({...clEditForm, email: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Email"/>
                    <div className="grid grid-cols-3 gap-2">
                       <select value={clEditForm.phonePrefix} onChange={e => setClEditForm({...clEditForm, phonePrefix: e.target.value})} className="px-3 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-[#5F27CD]/20 h-[50px]">
                         <option value="+41">🇨🇭 +41</option>
                         <option value="+33">🇫🇷 +33</option>
                         <option value="+49">🇩🇪 +49</option>
                         <option value="+39">🇮🇹 +39</option>
                         <option value="+43">🇦🇹 +43</option>
                         <option value="+423">🇱🇮 +423</option>
                       </select>
                       <input value={clEditForm.phone} onChange={e => setClEditForm({...clEditForm, phone: e.target.value})} className="col-span-2 px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="79 000 00 00"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <input value={clEditForm.street} onChange={e => setClEditForm({...clEditForm, street: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Rue et numéro"/>
                       <input value={clEditForm.zip} onChange={e => setClEditForm({...clEditForm, zip: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="NPA (Code Postal)"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <input value={clEditForm.city} onChange={e => setClEditForm({...clEditForm, city: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Ville"/>
                       <input value={clEditForm.canton} onChange={e => setClEditForm({...clEditForm, canton: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Canton"/>
                    </div>
                    <input value={clEditForm.insurance} onChange={e => setClEditForm({...clEditForm, insurance: e.target.value})} className="w-full px-5 py-3 bg-[#5F27CD]/5 border border-[#5F27CD]/20 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5F27CD]/20" placeholder="Assurance"/>
                    <div className="flex gap-4">
                      <button onClick={() => setIsEditingClient(false)} className="flex-1 py-4 bg-neutral-100 text-neutral-400 rounded-xl font-bold text-xs uppercase">Annuler</button>
                      <button onClick={saveClientEdit} disabled={clScaling} className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-100/50 hover:scale-[1.02] active:scale-95 transition-all">
                        {clScaling ? '...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <button onClick={() => alert('Confirmation envoyée')} className="h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-3">
                  <Mail size={16}/> CONFIRMER
                </button>
                <button onClick={() => alert('Facture générée')} className="h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  <FileText size={16}/> FACTURES
                </button>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between border-b border-[#5F27CD]/5 pb-4">
                 <h3 className="text-xl font-medium text-[#222F3E] tracking-tighter flex items-center gap-3"><Clock size={20} className="text-[#5F27CD]"/> Parcours Patient</h3>
                 <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">Chronologie des séances</p>
              </div>
              <div className="divide-y divide-slate-100">
                {appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` || a.clientId === selectedClient.id).length > 0 ? (
                  appointments.filter(a => a.title === `${selectedClient.firstName} ${selectedClient.lastName}` || a.clientId === selectedClient.id)
                    .sort((a,b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
                    .map(a => {
                      const isFut = new Date(a.date) >= startOfDay(new Date());
                      return (
                        <div 
                          key={a.id}
                          className="group flex items-center gap-6 py-5 px-2 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
                          onClick={() => { setSelectedAppt(a); setIsEditing(false); }}
                        >
                          {/* timeline dot */}
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isFut ? 'bg-indigo-500' : 'bg-slate-300'}`}/>
                          {/* hour bubble */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isFut ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                            {a.time?.split(':')[0]}h
                          </div>
                          {/* info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{a.date}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{a.serviceName || 'Soin Signature'}</p>
                          </div>
                          {/* badges */}
                          <div className="flex items-center gap-3 shrink-0">
                            {a.paid && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Payé</span>}
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isFut ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {isFut ? 'À Venir' : 'Honoré'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-xs text-slate-300 font-black uppercase tracking-widest">Aucune activité enregistrée</p>
                  </div>
                )}
              </div>

           </div>
        </div>
      </div>
    );
  };

  if (!isClient || isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neutral-300/30 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen overflow-hidden text-[#222F3E]" style={{ background: '#F8F9FA', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        
        .premium-card { 
          background: white; 
          border: 1px solid rgba(0,0,0,0.03); 
          box-shadow: 0 10px 40px rgba(0,0,0,0.02); 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08); }
        
        .sidebar-r { 
          background: linear-gradient(165deg, #448AFF, #2979FF, #1565C0); 
          box-shadow: -20px 0 80px rgba(68,138,255,0.1); 
        }
        
        .glass-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .glass-btn:hover { background: rgba(255,255,255,0.25); }
        
        .nav-pill { 
          border-radius: 1.25rem; 
          padding: 12px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 6px; 
          transition: all 0.3s; 
          width: 72px; 
          color: #94A3B8;
        }
        .nav-pill.active { background: #F1F5F9; color: #2563EB; }
        .nav-pill.active svg { color: #2563EB !important; }
        
        .kpi-accent-1 { background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); color: #0369A1; }
        .kpi-accent-2 { background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); color: #15803D; }
        .kpi-accent-3 { background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); color: #B91C1C; }
        .kpi-accent-4 { background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%); color: #7E22CE; }

        .mini-d { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin: auto; }
        .mini-d:hover:not(.today) { background: rgba(255,255,255,0.15); }
        .mini-d.today { background: white; color: #2563EB !important; font-weight: 900; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .view-btn { padding: 8px 20px; border-radius: 14px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s; color: #64748B; background: transparent; }
        .view-btn.active { background: white; color: #2563EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .day-closed-stripes {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 12px,
            rgba(203,213,225,0.6) 12px,
            rgba(203,213,225,0.6) 24px
          );
          background-color: #F1F5F9;
        }
        .day-closed-stripes-light {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 12px,
            rgba(203,213,225,0.08) 12px,
            rgba(203,213,225,0.08) 24px
          );
        }
      `}</style>

      <aside className={`bg-white border-r border-slate-100 flex flex-col items-center py-10 gap-2 shrink-0 z-20 shadow-[20px_0_60px_rgba(0,0,0,0.02)] transition-all duration-300 ${sidebarExpanded ? 'w-24' : 'w-20'}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-[#341F97] to-[#5F27CD] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#5F27CD]/20 mb-8">
          <Leaf size={24} strokeWidth={2.5}/>
        </div>
        
        {([
          { id: 'dashboard',  Icon: LayoutDashboard, label: 'HOME' },
          { id: 'scheduler',  Icon: CalendarRange,   label: 'Agenda' },
          { id: 'clients',    Icon: Users,           label: 'Patients' },
          { id: 'accounting', Icon: CreditCard,      label: 'Compta' },
        ] as const).map(n => (
          <button key={n.id} onClick={() => setTab(n.id as any)} className={`
            nav-pill rounded-2xl flex flex-col items-center justify-center transition-all duration-300
            ${sidebarExpanded ? 'w-16 h-16 gap-1' : 'w-12 h-12'}
            ${tab === n.id ? 'bg-[#5F27CD]/5 text-[#5F27CD] shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
          `}>
             <n.Icon size={sidebarExpanded ? 22 : 20} strokeWidth={tab === n.id ? 2.5 : 2}/>
             {sidebarExpanded && <span className="text-[8px] font-black uppercase tracking-widest">{n.label}</span>}
          </button>
        ))}

        <div className="mt-auto space-y-4 flex flex-col items-center">
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
            {sidebarExpanded ? <ChevronLeft size={22}/> : <ChevronRight size={22}/>}
          </button>
          
          <button onClick={() => auth?.signOut()} className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition shadow-sm"><Power size={20}/></button>
        </div>
      </aside>

      {/* ══ CONTENT & SIDE PANEL ══════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${selectedAppt ? 'mr-[450px]' : ''}`}>
           <nav className="h-24 border-b border-slate-100 px-10 flex items-center justify-between bg-white shrink-0 relative shadow-sm gap-8">
             {/* Left Column: Context & Title */}
             <div className="flex items-center gap-6 min-w-[280px]">
               {(tab === 'client-detail' || selectedAppt) && (
                 <button onClick={() => { 
                   if (selectedAppt) setSelectedAppt(null);
                   else setTab('clients'); 
                 }} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#5F27CD] hover:text-white transition-all flex items-center justify-center shadow-sm shrink-0">
                   <ChevronRight size={20} className="rotate-180"/>
                 </button>
               )}
               <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase shrink-0">
                 {selectedAppt ? "DÉTAIL RENDEZ-VOUS" : tab === "config-slots" ? "CRÉNEAUX" : (tab === "scheduler" && view === "month") ? "VOTRE AGENDA" : (tab === "scheduler" ? format(cur, "MMMM yyyy", { locale: fr }) : tab === "clients" ? "PATIENTS" : tab === "accounting" ? "COMPTABILITÉ" : tab === "client-detail" ? `${selectedClient?.firstName} ${selectedClient?.lastName}` : "HOME")}
               </h1>

               {/* Left Badges */}
               <div className="flex items-center gap-2">
                 {(tab === 'scheduler' || tab === 'config-slots') && !selectedAppt && (
                   <div className="flex h-12 bg-slate-100 p-1 rounded-2xl gap-1 shrink-0">
                     {(['month', 'week'] as const).map(v => (
                       <button key={v} onClick={() => { setView(v); setTab('scheduler'); }} className={`h-full px-5 flex items-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v && tab !== 'config-slots' ? 'bg-white text-slate-900 shadow-sm shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                         {v === 'month' ? 'Mois' : 'Semaine'}
                       </button>
                     ))}
                   </div>
                 )}
                 {tab === 'accounting' && (
                   <div className="flex items-center gap-2 shrink-0">
                     <button
                       onClick={() => setAcctFilter(f => f === 'overdue' ? 'all' : 'overdue')}
                       className={`flex items-center gap-2 h-12 px-5 rounded-2xl border transition-all cursor-pointer ${acctFilter === 'overdue' ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100' : 'bg-rose-50 border-rose-100 hover:border-rose-300 text-rose-600'}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${acctFilter === 'overdue' ? 'bg-white' : 'bg-rose-500 animate-pulse'}`} />
                       <span className="text-[10px] font-black uppercase tracking-wider">{appointments.filter(a => !a.paid && a.date < format(new Date(), 'yyyy-MM-dd')).length} Retard</span>
                     </button>
                   </div>
                 )}
                 {tab === 'dashboard' && (
                   <div className="flex items-center gap-2 shrink-0">
                     <div className="flex items-center gap-2 h-12 px-5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                        <CalendarRange size={14}/> {appointments.filter(a => a.date === format(new Date(), 'yyyy-MM-dd')).length}
                     </div>
                     <div className="flex items-center gap-2 h-12 px-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-black text-[10px] uppercase tracking-wider">
                        <Target size={14}/> {appointments.filter(a => !a.paid).length}
                     </div>
                   </div>
                 )}
               </div>
             </div>

             {/* Center Column: Search Bars */}
             <div className="flex-1 flex justify-center px-4">
               {tab === 'clients' && !selectedAppt && (
                 <div className="w-full max-w-lg animate-in slide-in-from-top-2 duration-500">
                   <div className="bg-neutral-50 rounded-2xl px-5 h-12 border border-neutral-100 flex items-center gap-4 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all shadow-inner">
                     <Search size={16} className="text-neutral-300"/>
                     <input 
                       type="text" value={clSearch} onChange={e => setClSearch(e.target.value)}
                       placeholder="RECHERCHER UN PATIENT..." 
                       className="bg-transparent border-none text-[10px] font-black w-full outline-none text-neutral-600 placeholder:text-neutral-300 tracking-widest"
                     />
                   </div>
                 </div>
               )}
               {tab === 'accounting' && !selectedAppt && (
                 <div className="w-full max-w-lg animate-in slide-in-from-top-2 duration-500">
                   <div className="bg-neutral-50 rounded-2xl px-5 h-12 border border-neutral-100 flex items-center gap-4 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all shadow-inner">
                     <Search size={16} className="text-neutral-300"/>
                     <input 
                       type="text" value={acctSearch} onChange={e => setAcctSearch(e.target.value)}
                       placeholder="RECHERCHER DANS LA COMPTABILITÉ..." 
                       className="bg-transparent border-none text-[10px] font-black w-full outline-none text-neutral-600 placeholder:text-neutral-300 tracking-widest"
                     />
                   </div>
                 </div>
               )}
               {(tab === 'scheduler' || tab === 'config-slots') && !selectedAppt && (
                 <div className="flex items-center gap-1 mx-auto">
                   <button onClick={() => period(-1)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 border border-transparent hover:border-slate-100 transition-all"><ChevronLeft size={20}/></button>
                   <button onClick={() => setCur(new Date())} className="h-12 px-5 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all tracking-widest mx-1 flex items-center">Aujourd'hui</button>
                   <button onClick={() => period(1)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 border border-transparent hover:border-slate-100 transition-all"><ChevronRight size={20}/></button>
                 </div>
               )}
             </div>

             {/* Right Column: Actions */}
             <div className="flex items-center gap-3 min-w-[280px] justify-end">
                {tab === 'clients' && !selectedAppt && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                    {selectedClients.length >= 2 && (
                      <button 
                        onClick={() => setMerging(true)} 
                        className="bg-rose-500 text-white px-8 h-12 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(244,63,94,0.4)] hover:scale-[1.05] active:scale-95 transition-all border border-rose-400 animate-in zoom-in-90 duration-300"
                      >
                         Fusionner ({selectedClients.length})
                      </button>
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowColPicker(!showColPicker)}
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${showColPicker ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-600 shadow-sm shadow-slate-100'}`}
                      >
                        <Columns size={18}/>
                      </button>
                      {showColPicker && (
                        <>
                          <div className="fixed inset-0 z-[40]" onClick={() => setShowColPicker(false)} />
                          <div className="absolute right-0 top-16 z-[50] w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Colonnes visibles</p>
                            <div className="space-y-3">
                              {[
                                { k: 'firstName', label: 'Prénom' },
                                { k: 'lastName', label: 'Nom' },
                                { k: 'email', label: 'Email' },
                                { k: 'phone', label: 'Téléphone' },
                                { k: 'street', label: 'Rue' },
                                { k: 'zip', label: 'NPA' },
                                { k: 'city', label: 'Ville' },
                                { k: 'canton', label: 'Canton' },
                                { k: 'insurance', label: 'Assurance' },
                                { k: 'sessions', label: 'Séances' }
                              ].map(it => (
                                <label key={it.k} className="flex items-center gap-4 cursor-pointer group">
                                  <div className="relative flex items-center">
                                    <input 
                                      type="checkbox" checked={visibleCols[it.k]} 
                                      onChange={() => setVisibleCols((p: any) => ({ ...p, [it.k]: !p[it.k] }))}
                                      className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer accent-indigo-600"
                                    />
                                  </div>
                                  <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${visibleCols[it.k] ? 'text-slate-900' : 'text-slate-300'}`}>{it.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <button 
                      onClick={() => setClModal(true)} 
                      className="h-12 px-8 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-600 shadow-sm shadow-slate-100 hover:scale-[1.02] active:scale-95 shrink-0"
                    >
                      <Plus size={16}/> Nouveau Patient
                    </button>
                  </div>
                )}

               {tab === 'accounting' && (
                 <div className="flex items-center gap-2 shrink-0">
                   {showExportPanel && (
                     <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 animate-in slide-in-from-right duration-300 h-12">
                       <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} className="bg-white rounded-xl h-full px-2 text-[10px] font-bold text-slate-500 border-none outline-none"/>
                       <span className="text-slate-300">→</span>
                       <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} className="bg-white rounded-xl h-full px-2 text-[10px] font-bold text-slate-500 border-none outline-none"/>
                       <button onClick={exportToCSV} className="h-full px-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-1">
                         <Download size={14}/> CSV
                       </button>
                     </div>
                   )}
                   <button onClick={() => setShowExportPanel(p => !p)}
                     className={`h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border shrink-0 ${showExportPanel ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                     <Download size={14}/>
                     {selectedInvoices.length > 0 ? `Exporter (${selectedInvoices.length})` : 'Exporter'}
                   </button>
                 </div>
               )}
                {tab === "scheduler" && !selectedAppt && (
                  <div className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-right-4">
                    <button onClick={() => setBlockMode(!blockMode)}
                      className={`h-12 px-6 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.15em] transition-all border shadow-sm shrink-0 ${blockMode ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-600"}`}
                    >
                      {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                      {blockMode ? "Valider" : "Éditer"}
                    </button>
                    <button onClick={() => setTab("config-slots")} className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex gap-2 items-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-600 shrink-0 shadow-sm shadow-slate-100">
                      <Settings size={14}/> Créneaux
                    </button>
                  </div>
                )}
                {tab === "config-slots" && !selectedAppt && (
                  <div className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-right-4">
                    <button onClick={() => setTab("scheduler")} className="h-12 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 hover:scale-[1.05] active:scale-95 transition-all">
                      <CalendarRange size={14}/> Retour Agenda
                    </button>
                  </div>
                )}
             </div>
           </nav>

           <div className="flex-1 overflow-hidden flex flex-col">
             {selectedAppt ? <AppointmentDetailView appt={selectedAppt} onClose={() => setSelectedAppt(null)}/> : 
              tab === 'scheduler' ? (view === 'month' ? <MonthView/> : <WeekView/>) : 
              tab === 'clients' ? <PatientsView/> : 
              tab === 'accounting' ? <AccountingView/> : 
              tab === 'client-detail' ? <ClientFolderView /> : 
              tab === 'config-slots' ? <ConfigView/> :
              <Dashboard/>}
           </div>
        </main>
      </div>

      {/* ══ EVENT MODAL ══════════════════════════════════════════════════════ */}
      {evModal && (
        <div className="fixed inset-0 bg-[#222F3E]/40 overflow-y-auto flex items-center justify-center z-[90] p-6 backdrop-blur-xl transition-all duration-500" onClick={() => setEvModal(null)}>
          <div className="bg-white/95 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-full max-w-xl p-14 relative overflow-hidden border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-medium text-slate-900 tracking-tighter">Gestion Créneau</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">{fmtFR(new Date(evModal.date))} à {evModal.time}</p>
              </div>
              <button onClick={() => setEvModal(null)} className="bg-slate-50 p-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-sm"><X size={24}/></button>
            </div>
            {evStep === 'choice' ? (
              <div className="grid grid-cols-2 gap-8">
                <button onClick={() => setEvStep('book')} className="premium-card p-10 rounded-[2.5rem] flex flex-col items-center gap-6 group">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.75rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner shadow-blue-100/50"><Users size={32}/></div>
                  <div className="text-center">
                    <div className="font-black text-sm uppercase tracking-[0.1em] text-slate-900 group-hover:text-blue-600 transition-colors">Réserver Client</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Nouveau ou existant</div>
                  </div>
                </button>
                <button onClick={saveBlock} className="premium-card p-10 rounded-[2.5rem] flex flex-col items-center gap-6 group">
                  <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-[1.75rem] flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner shadow-slate-200/50"><Lock size={32}/></div>
                  <div className="text-center">
                    <div className="font-black text-sm uppercase tracking-[0.1em] text-slate-900 group-hover:text-slate-900 transition-colors">Bloquer</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Temps personnel</div>
                  </div>
                </button>
              </div>
            ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Nom du client</label>
                    <input
                      autoFocus value={evName}
                      onChange={e => setEvName(e.target.value)}
                      className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all placeholder:text-[#576574]/40"
                      placeholder="Nom Complet"
                    />
                    {evName && clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-neutral-100 rounded-2xl bg-white shadow-sm mt-2 p-1">
                        {clients.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(evName.toLowerCase())).map(c => (
                          <button key={c.id} onClick={() => { setEvName(`${c.firstName} ${c.lastName}`); setEvEmail(c.email || ''); setEvPhone(c.phone || ''); }} className="w-full p-3 text-left hover:bg-[#54A0FF]/10 rounded-xl flex items-center justify-between group transition-colors">
                            <div>
                              <p className="text-[11px] font-black text-[#222F3E]">{c.firstName} {c.lastName}</p>
                              <p className="text-[9px] font-bold text-[#576574] uppercase tracking-[0.2em]">{c.phone || c.email}</p>
                            </div>
                            <ChevronRight size={14} className="text-[#54A0FF] opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all"/>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Email (Optionnel)</label>
                      <input
                        value={evEmail}
                        onChange={e => setEvEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Tél (Optionnel)</label>
                      <input
                        value={evPhone}
                        onChange={e => setEvPhone(e.target.value)}
                        className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Prestation</label>
                    <select
                      value={evService}
                      onChange={e => setEvService(e.target.value)}
                      className="w-full px-5 py-4 bg-[#54A0FF]/5 border border-[#54A0FF]/20 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#54A0FF]/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Choisir une prestation</option>
                      {SERVICES.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name.split(' - ')[0]} — {s.price} CHF
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Date</label>
                    <div className="px-4 py-3 bg-[#54A0FF]/5 rounded-xl text-xs font-bold text-[#54A0FF]">{evModal.date}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-[#576574] uppercase tracking-[0.2em]">Heure</label>
                    <div className="px-4 py-3 bg-[#54A0FF]/5 rounded-xl text-xs font-bold text-[#54A0FF]">{evModal.time}</div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setEvStep('choice')} className="flex-1 py-4 text-xs font-black text-[#576574] uppercase tracking-[0.2em] hover:text-[#222F3E] transition-colors">Retour</button>
                  <button onClick={saveBook} className="flex-1 py-4 bg-gradient-to-r from-[#54A0FF] to-[#5F27CD] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#54A0FF]/25 hover:scale-[1.02] active:scale-95 transition-all">Confirmer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ══ CONFIG MODAL ═════════════════════════════════════════════════════ */}
      
      {/* ══ ADD CLIENT MODAL ═════════════════════════════════════════════════ */}
      {/* ══ MERGE MODAL ══════════════════════════════════════════════════════ */}
      {merging && (
        <div className="fixed inset-0 bg-[#222F3E]/60 overflow-y-auto flex items-center justify-center z-[100] p-6 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setMerging(false)}>
          <div className="bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-full max-w-2xl p-12 relative overflow-hidden border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Fusionner les Profils</h3>
                <p className="text-sm font-medium text-slate-400 mt-2">Choisissez le profil principal à conserver.</p>
              </div>
              <button onClick={() => setMerging(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"><X size={24}/></button>
            </div>

            <div className="space-y-3 mb-10">
              {selectedClients.map(id => {
                const c = clients.find(x => x.id === id);
                if (!c) return null;
                return (
                  <button key={id} onClick={() => mergePatients(id)} className="w-full p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-[#5F27CD] hover:border-[#5F27CD] transition-all text-left">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-transparent transition-all">
                         <User size={20} className="text-slate-400 group-hover:text-[#5F27CD]"/>
                       </div>
                       <div>
                         <p className="font-extrabold text-slate-900 uppercase text-sm group-hover:text-white transition-all">{c.firstName} {c.lastName}</p>
                         <p className="text-xs font-bold text-slate-400 group-hover:text-white/70 transition-all">{c.email || 'Pas d\'email'}</p>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#5F27CD] opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                      <ChevronRight size={18}/>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
               <div className="flex gap-3 text-rose-500">
                 <Lock size={18} className="shrink-0 mt-0.5"/>
                 <p className="text-xs font-bold leading-relaxed">Attention : Toutes les séances des autres profils seront transférées vers le profil choisi. Les profils secondaires seront définitivement supprimés.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {clModal && (
        <div className="fixed inset-0 bg-[#222F3E]/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md" onClick={() => setClModal(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-12 relative overflow-hidden border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-medium text-[#222F3E] tracking-tighter">Nouveau Patient</h2>
                <p className="text-[10px] font-bold text-[#576574] uppercase tracking-[0.2em] mt-2">Création d'une fiche signalétique</p>
              </div>
              <button onClick={() => setClModal(false)} className="bg-neutral-50 p-4 rounded-2xl text-neutral-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Prénom</label>
                <input value={clForm.firstName} onChange={e => setClForm({...clForm, firstName: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Prénom"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Nom</label>
                <input value={clForm.lastName} onChange={e => setClForm({...clForm, lastName: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Nom"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Email</label>
                <input value={clForm.email} onChange={e => setClForm({...clForm, email: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="email@exemple.com"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Téléphone</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={clForm.phonePrefix} onChange={e => setClForm({...clForm, phonePrefix: e.target.value})} className="px-3 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-50 transition-all h-[54px]">
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+43">🇦🇹 +43</option>
                    <option value="+423">🇱🇮 +423</option>
                  </select>
                  <input value={clForm.phone} onChange={e => setClForm({...clForm, phone: e.target.value})} className="col-span-2 px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="79 000 00 00"/>
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Rue et numéro</label>
                <input value={clForm.street} onChange={e => setClForm({...clForm, street: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Ex: Rue de la Gare 12"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Code Postal (NPA)</label>
                <input value={clForm.zip} onChange={e => setClForm({...clForm, zip: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="1217"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Ville</label>
                <input value={clForm.city} onChange={e => setClForm({...clForm, city: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Meyrin"/>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Canton</label>
                <input value={clForm.canton} onChange={e => setClForm({...clForm, canton: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Genève"/>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-[#576574] uppercase tracking-[0.2em] ml-1">Assurance / Groupe</label>
                <input value={clForm.insurance} onChange={e => setClForm({...clForm, insurance: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Ex: Groupe Mutuel, Helsana..."/>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setClModal(false)} className="flex-1 py-4 text-xs font-black text-[#576574] uppercase tracking-[0.2em] hover:text-[#222F3E] transition-colors">Annuler</button>
              <button onClick={saveClient} disabled={clScaling} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100/50 hover:scale-[1.02] active:scale-95 transition-all">
                {clScaling ? 'Création...' : 'Créer le Dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
