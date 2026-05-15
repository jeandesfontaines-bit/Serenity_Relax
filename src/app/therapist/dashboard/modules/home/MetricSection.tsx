import React from 'react';
import { CreditCard, CheckCircle2, Users, AlertCircle } from 'lucide-react';
import { MetricCard } from './HomeComponents';

interface MetricSectionProps {
  paidThisMonth: number;
  completedSessions: number;
  pendingInvoices: number;
}

export function MetricSection({
  paidThisMonth,
  completedSessions,
  pendingInvoices,
}: MetricSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard 
        icon={<CreditCard size={18} strokeWidth={1.5} />} 
        label="Revenus du mois" 
        value={`${paidThisMonth.toLocaleString('fr-CH')} CHF`} 
        variant="blue" 
      />
      <MetricCard 
        icon={<CheckCircle2 size={18} strokeWidth={1.5} />} 
        label="Soins effectués" 
        value={completedSessions.toString()} 
        variant="teal" 
      />
      <MetricCard 
        icon={<Users size={18} strokeWidth={1.5} />} 
        label="Patients actifs" 
        value="124" 
        variant="orange" 
      />
      <MetricCard 
        icon={<AlertCircle size={18} strokeWidth={1.5} />} 
        label="Factures en attente" 
        value={pendingInvoices.toString()} 
        variant="pink" 
      />
    </section>
  );
}
