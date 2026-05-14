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
    <section className="grid grid-cols-1 gap-8 sm:grid-cols-4">
      <MetricCard 
        icon={<CreditCard size={16} strokeWidth={1.5} />} 
        label="REVENUS" 
        value={`${paidThisMonth.toLocaleString('fr-CH')} CHF`} 
        variant="blue" 
      />
      <MetricCard 
        icon={<CheckCircle2 size={16} strokeWidth={1.5} />} 
        label="SOINS" 
        value={completedSessions.toString()} 
        variant="teal" 
      />
      <MetricCard 
        icon={<Users size={16} strokeWidth={1.5} />} 
        label="PATIENTS" 
        value="124" 
        variant="orange" 
      />
      <MetricCard 
        icon={<AlertCircle size={16} strokeWidth={1.5} />} 
        label="IMPAYÉS" 
        value={pendingInvoices.toString()} 
        variant="pink" 
      />
    </section>
  );
}
