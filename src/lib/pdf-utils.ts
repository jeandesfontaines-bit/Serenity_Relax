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
    doc.text(`Référence : ${invoice.invoiceNumber}`, 140, 30);

    // --- Divider ---
    doc.setDrawColor(233, 232, 230); // Border
    doc.line(20, 55, 190, 55);

    // --- Client Details ---
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT / CLIENT', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 78);
    doc.text(`Date de session : ${invoice.date}`, 20, 84);

    // --- Table Background ---
    doc.setFillColor(244, 243, 241); // Muted Background
    doc.rect(20, 100, 170, 40, 'F');

    // --- Table Header ---
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION DU SOIN', 30, 112);
    doc.text('MONTANT (CHF)', 145, 112);

    // --- Table Content ---
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.serviceName, 30, 125);
    doc.text(`${invoice.amount.toFixed(2)}`, 155, 125);

    // --- Footer / Total ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 85, 68);
    doc.text(`TOTAL RÉGLÉ : ${invoice.amount.toFixed(2)} CHF`, 20, 170);

    doc.setFontSize(10);
    doc.setTextColor(116, 120, 114);
    doc.text('Merci de votre confiance et à bientôt pour votre prochain soin.', 20, 185);
    doc.text('Document généré numériquement le ' + new Date().toLocaleDateString('fr-FR'), 20, 191);

    // --- Save ---
    doc.save(`Serenity-Relax-Therapy-Facture-${invoice.invoiceNumber}.pdf`);
  } catch (err) {
    console.error("PDF Generation Fail:", err);
  }
}
