'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import ComptaPage from '../dashboard/modules/ComptaPage';
import { Appointment, Invoice } from '../dashboard/types';

export default function AccountingRoutePage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  useEffect(() => {
    if (!firestore || !user) return;
    
    const qAppt = query(collection(firestore, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubAppt = onSnapshot(qAppt, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    const qInv = query(collection(firestore, 'invoices'), orderBy('createdAt', 'desc'));
    const unsubInv = onSnapshot(qInv, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
    });

    return () => {
      unsubAppt();
      unsubInv();
    };
  }, [firestore, user]);

  const handleTogglePayment = async (id: string, current: boolean, method?: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'appointments', id), {
        paid: !current,
        ...( !current && method ? { paymentMethod: method } : {})
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAppt = (appt: Appointment) => {
    console.log("Selected Appt", appt);
  };

  return (
    <div className="pt-2">
      <ComptaPage 
        appointments={appointments} 
        invoices={invoices} 
        onTogglePayment={handleTogglePayment} 
        onSelectAppt={handleSelectAppt} 
      />
    </div>
  );
}
