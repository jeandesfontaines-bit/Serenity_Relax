import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  date: string;
  serviceName: string;
  amount: number;
}

/**
 * Generates a PDF invoice for Serenity Relax Therapy by João
 */
export function buildInvoicePdf(invoice: InvoiceData) {
  try {
    const safeAmount = Number.isFinite(invoice.amount) ? invoice.amount : 0;
    const safeReference = String(invoice.invoiceNumber || 'INV');
    const safeClient = String(invoice.clientName || 'Client');
    const safeDate = String(invoice.date || new Date().toISOString().slice(0, 10));
    const safeService = String(invoice.serviceName || 'Soin thérapeutique');
    const doc = new jsPDF();
    
    // --- Header / Branding ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(67, 85, 68); // Brand Primary
    doc.text('SERENITY RELAX THERAPY', 20, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(116, 120, 114); // Muted
    doc.text('by João • Genève', 20, 38);
    doc.text('Document de facturation thérapeute', 20, 44);

    // --- Invoice Info ---
    doc.setFontSize(12);
    doc.setTextColor(26, 28, 27); // Foreground
    doc.text(`Référence : ${safeReference}`, 140, 30);

    // --- Divider ---
    doc.setDrawColor(233, 232, 230); // Border
    doc.line(20, 55, 190, 55);

    // --- Client Details ---
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT / CLIENT', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(safeClient, 20, 78);
    doc.text(`Date de session : ${safeDate}`, 20, 84);

    // --- Table Background ---
    doc.setFillColor(244, 243, 241); // Muted Background
    doc.rect(20, 100, 170, 40, 'F');

    // --- Table Header ---
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION DU SOIN', 30, 112);
    doc.text('MONTANT (CHF)', 145, 112);

    // --- Table Content ---
    doc.setFont('helvetica', 'normal');
    doc.text(safeService, 30, 125);
    doc.text(`${safeAmount.toFixed(2)}`, 155, 125);

    // --- Footer / Total ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 85, 68);
    doc.text(`TOTAL RÉGLÉ : ${safeAmount.toFixed(2)} CHF`, 20, 170);

    doc.setFontSize(10);
    doc.setTextColor(116, 120, 114);
    doc.text('Merci de votre confiance et à bientôt pour votre prochain soin.', 20, 185);
    doc.text('Document généré numériquement le ' + new Date().toLocaleDateString('fr-FR'), 20, 191);

    // --- Save ---
    doc.save(`Serenity-Relax-Therapy-Facture-${safeReference}.pdf`);
  } catch (err) {
    console.error("PDF Generation Fail:", err);
  }
}
