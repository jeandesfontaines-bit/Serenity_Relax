import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The therapist's email who should receive the whatsapp notifications
const THERAPIST_EMAIL = 'jean.desfontaines@gmail.com'; 

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { appointmentId, clientName, clientEmail, clientPhone, serviceName, startTime, duration, magicToken, clientId } = data;

    if (!appointmentId || !clientEmail || !clientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dateStr = new Date(startTime).toLocaleDateString('fr-CH');
    const timeStr = new Date(startTime).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    
    const waPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
    const whatsappLink = waPhone ? `https://wa.me/${waPhone}?text=Bonjour%20${encodeURIComponent(clientName)},%20je%20vous%20contacte%20concernant%20votre%20soin%20du%20${dateStr}%20à%20${timeStr}.` : '';
    
    // Magic link for the client to access their account
    const magicLink = `https://serenity-relax--serenity-relax-joao.us-central1.hosted.app/client/login?token=${magicToken}&email=${encodeURIComponent(clientEmail)}`;

    // If Resend is not configured, just log it (useful for development)
    if (!resend) {
      console.log('--- RESEND NOT CONFIGURED ---');
      console.log(`Would send Client Email to: ${clientEmail} for ${serviceName}`);
      console.log(`Magic Link: ${magicLink}`);
      console.log(`Would send Admin Email to: ${THERAPIST_EMAIL} with WA Link: ${whatsappLink}`);
      return NextResponse.json({ success: true, warning: 'RESEND_API_KEY is not set. Emails logged to console instead.' });
    }

    // 1. Send Email to the Client (Confirmation + Magic Link)
    const clientEmailPromise = resend.emails.send({
      from: 'Serenity Relax <booking@serenity-relax.com>', // MUST BE VERIFIED IN RESEND
      to: [clientEmail],
      subject: `Confirmation de votre soin : ${serviceName}`,
      html: `
        <div style="font-family: sans-serif; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h1 style="font-family: serif; font-size: 24px;">Bonjour ${clientName},</h1>
          <p>Votre réservation pour <strong>${serviceName}</strong> est confirmée.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date :</strong> ${dateStr}</p>
            <p style="margin: 0 0 10px 0;"><strong>⏰ Heure :</strong> ${timeStr}</p>
            <p style="margin: 0;"><strong>📍 Lieu :</strong> Avenue de Mategnin 4, 1217 Meyrin</p>
          </div>

          <div style="margin: 30px 0; text-align: center;">
            <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Accédez à votre espace client pour voir vos réservations et vos factures :</p>
            <a href="${magicLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px;">
              ACCÉDER À MON COMPTE
            </a>
          </div>

          <p style="font-size: 13px; color: #888;">En cas d'empêchement, merci de nous avertir au minimum 24h à l'avance.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 14px;"><strong>Joao Manuel Castro Ramos - Serenity Relax</strong></p>
        </div>
      `,
    });

    // 2. Send Notification Email to the Therapist (with WhatsApp Link)
    const adminEmailPromise = resend.emails.send({
      from: 'Serenity Relax CRM <bot@serenity-relax.com>', // MUST BE VERIFIED IN RESEND
      to: [THERAPIST_EMAIL],
      subject: `NOUVEAU RITUEL : ${clientName}`,
      html: `
        <div style="font-family: sans-serif; color: #171717; padding: 20px;">
          <h2 style="font-family: serif;">Nouvelle Réservation Confirmée 🚀</h2>
          <p><strong>Client :</strong> ${clientName}</p>
          <p><strong>Email :</strong> ${clientEmail}</p>
          <p><strong>Tel :</strong> ${clientPhone || 'Non renseigné'}</p>
          <p><strong>Soin :</strong> ${serviceName}</p>
          <p><strong>RDV :</strong> ${dateStr} à ${timeStr}</p>
          <br/>
          <div style="margin-top: 20px;">
            ${whatsappLink ? `
              <a href="${whatsappLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">
                CONTACTER SUR WHATSAPP
              </a>
            ` : ''}
          </div>
        </div>
      `,
    });

    await Promise.allSettled([clientEmailPromise, adminEmailPromise]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API Send Email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
