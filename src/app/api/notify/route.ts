import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The therapist's email who should receive the whatsapp notifications
const THERAPIST_EMAIL = 'jean.desfontaines@gmail.com'; 

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      type,
      appointmentId, 
      clientName, 
      clientEmail: rawClientEmail,
      email,
      clientPhone,
      clientAddress,
      clientNotes,
      serviceName, 
      startTime, 
      duration, 
      magicToken, 
      clientId 
    } = data;

    const clientEmail = rawClientEmail || email;

    if (!clientEmail || !clientName || !magicToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const magicLink = `${origin}/client/login?token=${magicToken}&email=${encodeURIComponent(clientEmail)}`;

    // 1. Handle MAGIC_LINK only request (from Login Page)
    if (type === 'MAGIC_LINK') {
      if (!resend) {
        console.log('--- MAGIC LINK LOG ---');
        console.log(`To: ${clientEmail}, Link: ${magicLink}`);
        return NextResponse.json({ success: true, warning: 'RESEND_API_KEY is not set. Logged to console.' });
      }

      await resend.emails.send({
        from: 'Serenity Relax <login@serenity-relax.com>',
        to: [clientEmail],
        subject: `Lien de connexion : Votre Sanctuaire Serenity`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #171717; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; font-size: 14px; margin-bottom: 8px; color: #888;">Serenity Relax</h2>
              <div style="height: 1px; width: 40px; background-color: #e0e0e0; margin: 0 auto;"></div>
            </div>
            
            <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 24px; color: #111;">Bonjour ${clientName},</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 32px;">Cliquez sur le bouton ci-dessous pour accéder à votre espace client Serenity Relax. Ce lien est valable pour une session unique.</p>
            
            <div style="text-align: center; margin: 48px 0;">
              <a href="${magicLink}" style="display: inline-block; background-color: #111111; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;">
                ACCÉDER À MON ESPACE
              </a>
            </div>

            <p style="font-size: 13px; color: #999; text-align: center; margin-top: 48px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
            
            <div style="margin-top: 64px; padding-top: 32px; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="font-size: 14px; color: #111; margin-bottom: 4px;"><strong>Joao Manuel Castro Ramos</strong></p>
              <p style="font-size: 12px; color: #888; letter-spacing: 0.05em;">Serenity Relax Therapy</p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // 2. Default behavior (Appointment Confirmation)
    if (!appointmentId) {
       return NextResponse.json({ error: 'Missing appointmentId for confirmation' }, { status: 400 });
    }

    const dateStr = new Date(startTime).toLocaleDateString('fr-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
      from: 'Serenity Relax <booking@serenity-relax.com>',
      to: [clientEmail],
      subject: `Confirmation : Votre rituel ${serviceName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #171717; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; font-size: 14px; margin-bottom: 8px; color: #888;">Serenity Relax</h2>
            <div style="height: 1px; width: 40px; background-color: #e0e0e0; margin: 0 auto;"></div>
          </div>
          
          <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 24px; color: #111; text-align: center;">Confirmation</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 32px; text-align: center;">Bonjour ${clientName},<br/>Votre rendez-vous pour <strong>${serviceName}</strong> a été validé.</p>
          
          <div style="background-color: #fafafa; padding: 32px; border-radius: 8px; margin: 40px 0; border: 1px solid #f0f0f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Date</td>
                <td style="padding-bottom: 16px; font-size: 15px; color: #111; font-weight: 500; text-align: right;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Heure</td>
                <td style="padding-bottom: 16px; font-size: 15px; color: #111; font-weight: 500; text-align: right;">${timeStr}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Lieu</td>
                <td style="padding-bottom: 16px; font-size: 15px; color: #111; font-weight: 500; text-align: right;">À votre domicile</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Durée</td>
                <td style="font-size: 15px; color: #111; font-weight: 500; text-align: right;">${duration}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 48px 0;">
            <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Gérez vos rendez-vous et retrouvez vos factures :</p>
            <a href="${magicLink}" style="display: inline-block; background-color: #111111; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;">
              ACCÉDER À MON COMPTE
            </a>
          </div>

          <p style="font-size: 13px; color: #999; text-align: center; margin-top: 48px; line-height: 1.6;">En cas d'empêchement, merci de nous avertir au minimum 24h à l'avance.</p>
          
          <div style="margin-top: 64px; padding-top: 32px; border-top: 1px solid #f0f0f0; text-align: center;">
            <p style="font-size: 14px; color: #111; margin-bottom: 4px;"><strong>Joao Manuel Castro Ramos</strong></p>
            <p style="font-size: 12px; color: #888; letter-spacing: 0.05em;">Serenity Relax Therapy</p>
          </div>
        </div>
      `,
    });

    // B. Send Notification Email to the Therapist (with WhatsApp Link)
    const adminEmailPromise = resend.emails.send({
      from: 'Serenity Relax CRM <bot@serenity-relax.com>',
      to: [THERAPIST_EMAIL],
      subject: `✨ Nouveau Soin : ${clientName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #171717; padding: 40px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="font-weight: 500; color: #111; margin-bottom: 32px; border-bottom: 1px solid #eee; padding-bottom: 16px;">Nouvelle Réservation ✨</h2>
            
            <div style="margin-bottom: 24px;">
              <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Client</p>
              <p style="font-size: 18px; color: #111; font-weight: 500;">${clientName}</p>
            </div>
            
            <div style="display: flex; gap: 40px; margin-bottom: 24px;">
              <div style="flex: 1;">
                <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Soin</p>
                <p style="font-size: 16px; color: #111;">${serviceName}</p>
              </div>
              <div style="flex: 1;">
                <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">RDV</p>
                <p style="font-size: 16px; color: #111;">${dateStr} à ${timeStr}</p>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Coordonnées</p>
              <p style="font-size: 15px; color: #111; margin-bottom: 4px;">📧 ${clientEmail}</p>
              <p style="font-size: 15px; color: #111;">📞 ${clientPhone || 'Non renseigné'}</p>
            </div>

            <div style="margin-bottom: 24px; padding: 20px; background-color: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 8px;">
              <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Adresse de consultation</p>
              <p style="font-size: 15px; color: #111; line-height: 1.5;">📍 ${clientAddress || 'À Meyrin (Avenue de Mategnin 4)'}</p>
              ${clientNotes ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #eee;">
                  <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Notes du client</p>
                  <p style="font-size: 14px; color: #555; font-style: italic;">"${clientNotes}"</p>
                </div>
              ` : ''}
            </div>

            <div style="margin-top: 40px; text-align: center;">
              ${whatsappLink ? `
                <a href="${whatsappLink}" style="display: inline-block; background-color: #25D366; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.02em;">
                  CONTACTER SUR WHATSAPP
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `,
    });

    const results = await Promise.allSettled([clientEmailPromise, adminEmailPromise]);
    
    // Log individual email delivery failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Email delivery failed for ${index === 0 ? 'Client' : 'Admin'}:`, result.reason);
        // We could also log this to a 'system_logs' Firestore collection here to surface in the dashboard
      }
    });

    return NextResponse.json({ success: true, emailResults: results.map(r => r.status) });
  } catch (error: any) {
    console.error('Erreur globale API Send Email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
