import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, orderBy, where } from 'firebase/firestore';
import { firebaseConfig } from './src/firebase/config.ts';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const apptQ = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(10));
const apptSnap = await getDocs(apptQ);
for (const d of apptSnap.docs) {
  const data = d.data();
  const invQ = query(collection(db, 'invoices'), where('appointmentId', '==', d.id), limit(1));
  const invSnap = await getDocs(invQ);
  const inv = invSnap.docs[0];
  console.log(JSON.stringify({
    appointmentId: d.id,
    client: data.clientNameSnapshot,
    service: data.serviceName,
    date: data.date,
    invoiceId: inv?.id || null,
    invoiceNumber: inv?.data()?.invoiceNumber || null,
  }));
}
