import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Download, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { Appointment, Invoice } from '../types';
import { format, isBefore, startOfToday, parseISO } from 'date-fns';

interface ComptaPageProps {
  appointments: Appointment[];
  clients: any[];
  invoices: Invoice[];
  reminderTemplate: string;
  initialFilter?: 'all' | 'unpaid' | 'late';
  onUpdateReminder?: (val: string) => void;
  onTogglePayment: (id: string, current: boolean) => void;
  onSelectAppt: (appt: Appointment) => void;
}

export default function ComptaPage({ 
  appointments, 
  initialFilter = 'all', 
  onTogglePayment, 
  onSelectAppt 
}: ComptaPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'late'>(initialFilter);
  const today = startOfToday();

  // Sync with initial filter from dashboard
  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  const bills = useMemo(() => {
    return appointments
      .filter(a => a.price && a.date && a.status !== 'cancelled')
      .map((a) => {
        const apptDate = parseISO(a.date || '');
        const isLate = !a.paid && isBefore(apptDate, today);
        return {
          id: `FAC-${format(apptDate, 'yyyy')}-${a.id.slice(-3).toUpperCase()}`,
          clientName: a.clientNameSnapshot || 'Client inconnu',
          emission: a.date || '',
          montant: a.price || 0,
          status: a.paid ? 'Payée' : (isLate ? 'En retard' : 'En attente'),
          rawStatus: isLate ? 'late' : (a.paid ? 'paid' : 'unpaid'),
          appt: a
        };
      })
      .filter(b => {
        if (filter === 'unpaid') return b.appt.paid === false;
        if (filter === 'late') return b.status === 'En retard';
        return true;
      })
      .sort((a, b) => b.emission.localeCompare(a.emission));
  }, [appointments, filter, today]);

  const filtered = useMemo(() => 
    bills.filter(b => 
      b.clientName.toLowerCase().includes(search.toLowerCase()) || 
      b.id.toLowerCase().includes(search.toLowerCase())
    ),
    [bills, search]
  );

  const generatePDF = (e: React.MouseEvent, bill: any) => {
    e.stopPropagation();
    try {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(21, 32, 35); 
        doc.text('CABINET THERAPEUTIQUE', 20, 30);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Excellence Thérapeutique', 20, 38);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(20, 45, 190, 45);
        
        doc.setTextColor(34, 47, 62);
        doc.setFontSize(12);
        doc.text(`Facture N° : ${bill.id}`, 20, 55);
        doc.text(`Date d'Émission : ${bill.emission}`, 20, 62);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('DESTINATAIRE', 20, 80);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(bill.clientName, 20, 88);
        
        doc.setFillColor(248, 245, 240);
        doc.rect(20, 100, 170, 40, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.text('DÉSIGNATION', 30, 112);
        doc.text('MONTANT (CHF)', 140, 112);
        
        doc.setFont("helvetica", "normal");
        doc.text(bill.appt.serviceName || 'Séance de Soin Thérapeutique', 30, 125);
        doc.text(`${bill.montant}.00`, 154, 125);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(21, 32, 35);
        doc.text(`TOTAL À RÉGLER : ${bill.montant} CHF`, 20, 170);
        
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Merci pour votre confiance. Agrément ASCA/RME.', 20, 280);
        
        doc.save(`${bill.id}.pdf`);
    } catch (err) {
        console.error("PDF Fail:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-10 animate-in fade-in duration-500">
      
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[42px] font-semibold tracking-tight text-onyx leading-none">Facturation</h1>
          <span className="px-4 py-1.5 bg-border/40 text-earth/60 rounded-full text-[13px] font-bold mt-2">
            {filtered.length} docs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-border/50 rounded-full p-1 flex items-center shadow-sm font-bold text-onyx">
             {[
               { id: 'all', label: 'Tout' },
               { id: 'unpaid', label: 'Impayés' },
               { id: 'late', label: 'Retards' }
             ].map(v => (
               <button 
                 key={v.id} 
                 onClick={() => setFilter(v.id as any)}
                 className={`px-6 py-2 rounded-full text-[13px] transition-all ${filter === v.id ? 'bg-onyx text-white' : 'hover:bg-bg-soft text-earth/60'}`}
               >
                  {v.label}
               </button>
             ))}
          </div>
          <div className="relative w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher..."
              className="w-full h-12 bg-white border border-transparent rounded-full pl-12 pr-5 text-[14px] font-medium text-onyx shadow-sm focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-border/10 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_80px] px-10 h-16 items-center border-b border-border/10 bg-white/50">
          <span className="text-[11px] font-semibold text-earth/40 uppercase tracking-[0.2em]">N° Facture</span>
          <span className="text-[11px] font-semibold text-earth/40 uppercase tracking-[0.2em]">Client</span>
          <span className="text-[11px] font-semibold text-earth/40 uppercase tracking-[0.2em]">Date</span>
          <span className="text-[11px] font-semibold text-earth/40 uppercase tracking-[0.2em]">Montant</span>
          <span className="text-[11px] font-semibold text-earth/40 uppercase tracking-[0.2em]">Statut</span>
          <span />
        </div>

        <div className="divide-y divide-border/5">
          {filtered.map(bill => (
            <div 
              key={bill.id}
              onClick={() => onSelectAppt(bill.appt)}
              className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_80px] px-10 h-20 items-center hover:bg-bg-soft/50 cursor-pointer transition-all group"
            >
               <span className="text-[14px] font-semibold text-onyx tracking-tighter">{bill.id}</span>
               
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-border/20 flex items-center justify-center font-semibold text-[10px] text-earth">
                    {bill.clientName.charAt(0)}
                  </div>
                  <span className="text-[14px] font-semibold text-onyx uppercase truncate pr-4">{bill.clientName}</span>
               </div>

               <span className="text-[13px] font-bold text-earth/60 tabular-nums">{bill.emission}</span>
               
               <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-semibold text-onyx">{bill.montant}.00</span>
                  <span className="text-[11px] font-bold text-earth/40 uppercase">CHF</span>
               </div>

               <div className="flex items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest
                    ${bill.status === 'Payée' ? 'bg-[#E1FBB8] text-forest/70' : ''}
                    ${bill.status === 'En attente' ? 'bg-ochre/10 text-ochre' : ''}
                    ${bill.status === 'En retard' ? 'bg-[#FF6B61]/10 text-[#FF6B61]' : ''}
                  `}>
                    {bill.status}
                  </span>
                  {!bill.appt.paid && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onTogglePayment(bill.appt.id, false); }}
                      className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-forest hover:text-white"
                      title="Marquer comme payé"
                    >
                       <CheckCircle2 size={16} />
                    </button>
                  )}
               </div>

               <div className="flex items-center gap-2 justify-end">
                  <button 
                    onClick={(e) => generatePDF(e, bill)}
                    className="w-8 h-8 flex items-center justify-center text-earth/30 hover:text-onyx opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Download size={18} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-earth/30 hover:text-onyx transition-all">
                    <MoreHorizontal size={18} />
                  </button>
               </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="py-20 text-center text-earth/20 font-semibold uppercase tracking-widest">
               Aucun document trouvé
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
