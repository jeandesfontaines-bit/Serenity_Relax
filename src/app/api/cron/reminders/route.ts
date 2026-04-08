import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { format, addDays } from 'date-fns';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Simple auth check via header
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const threeDaysFromNow = addDays(new Date(), 3);
    const dateStr = format(threeDaysFromNow, 'yyyy-MM-dd');

    // Query appointments starting exactly 3 days from now
    const q = query(
      collection(db, 'appointments'),
      where('startTime', '>=', `${dateStr}T00:00:00`),
      where('startTime', '<=', `${dateStr}T23:59:59`),
      where('status', '==', 'confirmed')
    );

    const snapshot = await getDocs(q);
    const results = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.clientEmail) {
        const dateFormatted = new Date(data.startTime).toLocaleDateString('fr-CH');
        const timeFormatted = new Date(data.startTime).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });

        await resend.emails.send({
          from: 'Serenity Relax <booking@serenity-relax.com>',
          to: [data.clientEmail],
          subject: `Rappel : Votre soin Serenity dans 3 jours`,
          html: `
            <div style="font-family: sans-serif; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
              <h1 style="font-family: serif; font-size: 24px;">Bonjour ${data.clientNameSnapshot},</h1>
              <p>Ceci est un petit rappel pour votre prochain soin <strong>${data.serviceName}</strong>.</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>📅 Date :</strong> ${dateFormatted}</p>
                <p style="margin: 0 0 10px 0;"><strong>⏰ Heure :</strong> ${timeFormatted}</p>
                <p style="margin: 0;"><strong>📍 Lieu :</strong> Avenue de Mategnin 4, 1217 Meyrin</p>
              </div>

              <p style="font-size: 14px; line-height: 1.6;">Nous avons hâte de vous accueillir pour ce moment de détente privilégié.</p>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 14px;"><strong>Joao Manuel Castro Ramos - Serenity Relax</strong></p>
            </div>
          `,
        });
        results.push({ id: doc.id, email: data.clientEmail });
      }
    }

    return NextResponse.json({ success: true, count: snapshot.size, sent: results });
  } catch (error: any) {
    console.error('Reminder Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
