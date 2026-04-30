import { NextResponse } from 'next/server';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: applicationDefault(),
      projectId: 'serenity-relax-joao',
    });
  }

  return getFirestore();
}

function createMagicToken() {
  return `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const db = getAdminDb();
    let clientSnap = await db.collection('clients').where('email', '==', normalizedEmail).limit(1).get();

    if (clientSnap.empty && email) {
      clientSnap = await db.collection('clients').where('email', '==', String(email).trim()).limit(1).get();
    }

    if (clientSnap.empty) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const clientDoc = clientSnap.docs[0];
    const client = clientDoc.data();
    const magicToken = createMagicToken();
    const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';

    await clientDoc.ref.update({
      email: normalizedEmail,
      magicToken,
      magicTokenUpdatedAt: new Date().toISOString(),
    });

    const origin = new URL(req.url).origin;
    const notifyResponse = await fetch(`${origin}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'MAGIC_LINK',
        clientEmail: normalizedEmail,
        clientName,
        magicToken,
        clientId: clientDoc.id,
      }),
    });

    if (!notifyResponse.ok) {
      const details = await notifyResponse.text();
      return NextResponse.json({ error: 'Notification failed', details }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Magic link API error:', error);
    return NextResponse.json({ error: error.message || 'Magic link failed' }, { status: 500 });
  }
}
