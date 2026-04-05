import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The therapist's email who should receive the whatsapp notifications
const THERAPIST_EMAIL = 'jean.desfontaines@gmail.com'; 

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { appointmentId, clientName, clientEmail, clientPhone, serviceName, startTime, duration } = data;

    if (!appointmentId || !clientEmail || !clientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dateStr = new Date(startTime).toLocaleDateString('fr-CH');
    const timeStr = new Date(startTime).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    
    const waPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
    const whatsappLink = waPhone ? `https://wa.me/${waPhone}?text=Bonjour%20${encodeURIComponent(clientName)},%20je%20vous%20contacte%20concernant%20votre%20soin%20du%20${dateStr}%20à%20${timeStr}.` : '';

    // If Resend is not configured, just log it (useful for development)
    if (!resend) {
      console.log('--- RESEND NOT CONFIGURED ---');
      console.log(`Would send Client Email to: ${clientEmail} for ${serviceName}`);
      console.log(`Would send Admin Email to: ${THERAPIST_EMAIL} with WA Link: ${whatsappLink}`);
      return NextResponse.json({ success: true, warning: 'RESEND_API_KEY is not set. Emails logged to console instead.' });
    }

    // 1. Send Email to the Client (Confirmation)
    const clientEmailPromise = resend.emails.send({
      from: 'Serenity Relax <booking@serenity-relax.com>', // MUST BE VERIFIED IN RESEND
      to: [clientEmail],
      subject: `Confirmation de votre soin : ${serviceName}`,
      html: `
        <div style="font-family: sans-serif; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-family: serif; font-size: 24px;">Bonjour ${clientName},</h1>
          <p>Nous vous confirmons votre réservation pour le soin : <strong>${serviceName}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${dateStr}</p>
            <p style="margin: 0 0 10px 0;"><strong>Heure :</strong> ${timeStr}</p>
            <p style="margin: 0;"><strong>Avenue de Mategnin 4, 1217 Meyrin</strong></p>
          </div>
          <p>En cas d'empêchement, merci de nous avertir au minimum 24h à l'avance.</p>
          <br/>
          <p>Au plaisir de vous accueillir,</p>
          <p><strong>Joao Manuel Castro Ramos - Serenity Relax</strong></p>
        </div>
      `,
    });

    // 2. Send Notification Email to the Therapist (with WhatsApp Link)
    const adminEmailPromise = resend.emails.send({
      from: 'Serenity Relax Bot <bot@serenity-relax.com>', // MUST BE VERIFIED IN RESEND
      to: [THERAPIST_EMAIL],
      subject: `Nouveau Rendez-vous : ${clientName} - ${dateStr}`,
      html: `
        <div style="font-family: sans-serif; color: #171717;">
          <h2 style="font-family: serif;">Nouvelle Réservation</h2>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Téléphone:</strong> ${clientPhone || 'Non renseigné'}</p>
          <p><strong>Soin:</strong> ${serviceName}</p>
          <p><strong>Date:</strong> ${dateStr} à ${timeStr}</p>
          <br/>
          ${whatsappLink ? `
            <a href="${whatsappLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Contacter sur WhatsApp
            </a>
          ` : '<p><i>Pas de téléphone fourni pour un contact WhatsApp.</i></p>'}
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
