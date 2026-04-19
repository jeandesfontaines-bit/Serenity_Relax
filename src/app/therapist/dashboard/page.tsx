'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc } from 'firebase/firestore';
import HomePage from './modules/HomePage';
import { Appointment, Invoice } from './types';

export default function TherapistDashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(12000);

  useEffect(() => {
    if (!firestore) return;

    const unsubInvoices = onSnapshot(collection(firestore, 'invoices'), (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubAppts = onSnapshot(collection(firestore, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubMeta = onSnapshot(doc(firestore, 'config', 'metadata'), (doc) => {
      if (doc.exists()) {
        const d = doc.data();
        if (d.monthlyGoal) setMonthlyGoal(d.monthlyGoal);
      }
    });

    return () => { unsubAppts(); unsubInvoices(); unsubMeta(); };
  }, [firestore]);

  return (
    <div className="py-6 px-4">
      <HomePage 
        appointments={appointments} 
        monthlyGoal={monthlyGoal}
        onNavigate={() => {}} 
        onEditGoal={() => {}}
        onSelectAppt={() => {}} 
      />
    </div>
  );
}
