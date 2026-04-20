import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The therapist's email who should receive the whatsapp notifications
const THERAPIST_EMAIL = 'serenityrelaxtherapy@gmail.com'; 

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      type,
      appointmentId, 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceName, 
      startTime, 
      duration, 
      magicToken, 
      clientId 
    } = data;

    if (!clientEmail || !clientName || !magicToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const magicLink = `https://serenity-relax--serenity-relax-joao.us-central1.hosted.app/client/login?token=${magicToken}&email=${encodeURIComponent(clientEmail)}`;

    // 1. Handle MAGIC_LINK only request (from Login Page)
    if (type === 'MAGIC_LINK') {
      if (!resend) {
        console.log('--- MAGIC LINK LOG ---');
        console.log(`To: ${clientEmail}, Link: ${magicLink}`);
        return NextResponse.json({ success: true, warning: 'RESEND_API_KEY is not set. Logged to console.' });
      }

      await resend.emails.send({
        from: 'Serenity Relax Therapy <login@serenity-relax.com>',
        to: [clientEmail],
        subject: `Lien de connexion : Votre Sanctuaire Serenity`,
        html: `
          <div style="font-family: sans-serif; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
            <h1 style="font-family: serif; font-size: 24px;">Bonjour ${clientName},</h1>
            <p>Cliquez sur le bouton ci-dessous pour accéder à votre espace client Serenity Relax. Ce lien est valable pour une session unique.</p>
            
            <div style="margin: 40px 0; text-align: center;">
              <a href="${magicLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; letter-spacing: 0.1em;">
                ACCÉDER À MON ESPACE
              </a>
            </div>

            <p style="font-size: 13px; color: #888;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 14px;"><strong>Joao Manuel Castro Ramos - Serenity Relax Therapy</strong></p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // 2. Default behavior (Appointment Confirmation)
    if (!appointmentId) {
       return NextResponse.json({ error: 'Missing appointmentId for confirmation' }, { status: 400 });
    }

    const dateStr = new Date(startTime).toLocaleDateString('fr-CH');
    const timeStr = new Date(startTime).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    
    const waPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
    const whatsappLink = waPhone ? `https://wa.me/${waPhone}?text=Bonjour%20${encodeURIComponent(clientName)},%20je%20vous%20contacte%20concernant%20votre%20soin%20du%20${dateStr}%20à%20${timeStr}.` : '';
    
    // If Resend is not configured, just log it (useful for development)
    if (!resend) {
      console.log('--- RESEND NOT CONFIGURED ---');
      console.log(`Would send Client Email to: ${clientEmail} for ${serviceName}`);
      console.log(`Magic Link: ${magicLink}`);
      console.log(`Would send Admin Email to: ${THERAPIST_EMAIL} with WA Link: ${whatsappLink}`);
      return NextResponse.json({ success: true, warning: 'RESEND_API_KEY is not set. Emails logged to console instead.' });
    }

    // A. Send Email to the Client (Confirmation + Magic Link)
    const clientEmailPromise = resend.emails.send({
      from: 'Serenity Relax Therapy <booking@serenity-relax.com>',
      to: [clientEmail],
      subject: `Confirmation de votre soin : ${serviceName}`,
      html: `
        <div style="background-color: #FAF9F6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 40px; padding: 60px; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-family: Georgia, serif; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #171717; margin-bottom: 20px;">Serenity Relax</h2>
              <div style="width: 40px; h-px: 1px; background-color: #E5E5E5; margin: 0 auto;"></div>
            </div>

            <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: normal; color: #171717; text-align: center; margin-bottom: 10px; letter-spacing: -0.02em;">Votre rituel est confirmé.</h1>
            <p style="color: #666; text-align: center; font-size: 16px; margin-bottom: 40px; font-style: italic;">Bonjour ${clientName}, votre sanctuaire vous attend.</p>

            <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 24px; padding: 32px; margin-bottom: 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #A3A3A3; margin: 0 0 8px 0;">Soin choisi</p>
                    <p style="font-size: 18px; font-weight: bold; color: #171717; margin: 0;">${serviceName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #A3A3A3; margin: 0 0 8px 0;">Date & Heure</p>
                    <p style="font-size: 16px; font-weight: medium; color: #171717; margin: 0;">${dateStr} à ${timeStr}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #A3A3A3; margin: 0 0 8px 0;">Lieu</p>
                    <p style="font-size: 14px; font-weight: medium; color: #171717; margin: 0;">Alfa Business Center, Joinville 26, Cointrin</p>
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 40px;">
              <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Accédez à votre espace pour gérer votre séance :</p>
              <a href="${magicLink}" style="display: inline-block; background-color: #171717; color: #ffffff; padding: 18px 36px; border-radius: 100px; text-decoration: none; font-size: 12px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">
                Ouvrir mon compte
              </a>
            </div>

            <div style="border-top: 1px solid #F0F0F0; padding-top: 40px; text-align: center;">
              <p style="font-size: 12px; color: #A3A3A3; margin-bottom: 10px;">En cas d'empêchement, merci de nous avertir 24h à l'avance.</p>
              <p style="font-size: 14px; font-weight: bold; color: #171717; margin: 0;">Joao Manuel Castro Ramos</p>
              <p style="font-size: 12px; color: #A3A3A3; margin-top: 4px;">Serenity Relax</p>
            </div>
          </div>
        </div>
      `,
    });

    // B. Send Notification Email to the Therapist (with WhatsApp Link)
    const adminEmailPromise = resend.emails.send({
      from: 'Serenity Relax CRM <bot@serenity-relax.com>',
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
