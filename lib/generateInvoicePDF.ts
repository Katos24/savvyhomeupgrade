import jsPDF from 'jspdf';

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  companyName: string;
  companyPhone?: string;
  companyEmail?: string;
  companyLogoUrl?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  lineItems: LineItem[];
  total: number;
  notes?: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const pageW = 215.9;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── COLORS ───────────────────────────────────────────────
  const black = '#111111';
  const gray = '#6B7280';
  const lightGray = '#F3F4F6';
  const borderGray = '#E5E7EB';
  const green = '#059669';

  // ── LOGO ─────────────────────────────────────────────────
  if (data.companyLogoUrl) {
    const base64 = await loadImageAsBase64(data.companyLogoUrl);
    if (base64) {
      try {
        doc.addImage(base64, 'JPEG', margin, y, 32, 16, undefined, 'FAST');
      } catch {
        // logo failed silently
      }
    }
  }

  // ── INVOICE LABEL (top right) ─────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(black);
  doc.text('INVOICE', pageW - margin, y + 10, { align: 'right' });

  y += 24;

  // ── COMPANY INFO (left) ───────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(black);
  doc.text(data.companyName, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(gray);
  let companyY = y + 5;
  if (data.companyPhone) {
    doc.text(data.companyPhone, margin, companyY);
    companyY += 4.5;
  }
  if (data.companyEmail) {
    doc.text(data.companyEmail, margin, companyY);
    companyY += 4.5;
  }

  // ── INVOICE META (right) ──────────────────────────────────
  const metaX = pageW - margin;
  doc.setFontSize(9);

  const metaRows = [
    { label: 'Invoice #', value: data.invoiceNumber },
    { label: 'Date', value: data.invoiceDate },
    ...(data.dueDate ? [{ label: 'Due Date', value: data.dueDate }] : []),
  ];

  let metaY = y;
  for (const row of metaRows) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray);
    doc.text(row.label, metaX - 40, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(black);
    doc.text(row.value, metaX, metaY, { align: 'right' });
    metaY += 5.5;
  }

  y = Math.max(companyY, metaY) + 10;

  // ── DIVIDER ───────────────────────────────────────────────
  doc.setDrawColor(borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // ── BILL TO ───────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gray);
  doc.text('BILL TO', margin, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(black);
  doc.text(data.customerName, margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(gray);
  if (data.customerEmail) { doc.text(data.customerEmail, margin, y); y += 4.5; }
  if (data.customerPhone) { doc.text(data.customerPhone, margin, y); y += 4.5; }
  if (data.customerAddress) { doc.text(data.customerAddress, margin, y); y += 4.5; }

  y += 8;

  // ── LINE ITEMS TABLE ──────────────────────────────────────
  const colDesc = margin;
  const colQty = margin + contentW * 0.55;
  const colUnit = margin + contentW * 0.72;
  const colAmt = pageW - margin;

  // Table header background
  doc.setFillColor(lightGray);
  doc.roundedRect(margin, y, contentW, 8, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gray);
  doc.text('DESCRIPTION', colDesc + 2, y + 5.2);
  doc.text('QTY', colQty, y + 5.2);
  doc.text('UNIT PRICE', colUnit, y + 5.2);
  doc.text('AMOUNT', colAmt, y + 5.2, { align: 'right' });

  y += 12;

  // Line items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  for (let i = 0; i < data.lineItems.length; i++) {
    const item = data.lineItems[i];

    // Alternate row shading
    if (i % 2 === 1) {
      doc.setFillColor('#FAFAFA');
      doc.rect(margin, y - 3.5, contentW, 8, 'F');
    }

    doc.setTextColor(black);
    doc.text(item.description || '', colDesc + 2, y + 1);
    doc.setTextColor(gray);
    doc.text(String(item.quantity ?? 1), colQty, y + 1);
    doc.text(fmt(item.unitPrice ?? 0), colUnit, y + 1);
    doc.setTextColor(black);
    doc.text(fmt(item.amount ?? 0), colAmt, y + 1, { align: 'right' });

    y += 8;
  }

  y += 4;

  // ── DIVIDER ───────────────────────────────────────────────
  doc.setDrawColor(borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── TOTAL ─────────────────────────────────────────────────
  const totalBoxX = pageW - margin - 70;
  doc.setFillColor(black);
  doc.roundedRect(totalBoxX, y, 70, 12, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#FFFFFF');
  doc.text('TOTAL DUE', totalBoxX + 4, y + 7.5);
  doc.setFontSize(11);
  doc.text(fmt(data.total), pageW - margin - 3, y + 7.5, { align: 'right' });

  y += 20;

  // ── NOTES ─────────────────────────────────────────────────
  if (data.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray);
    doc.text('NOTES', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(black);
    const noteLines = doc.splitTextToSize(data.notes, contentW);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4.5 + 6;
  }

  // ── THANK YOU FOOTER ──────────────────────────────────────
  const pageH = 279.4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray);
  doc.text('Thank you for your business.', pageW / 2, pageH - 12, { align: 'center' });

  // ── SAVE ──────────────────────────────────────────────────
  doc.save(`Invoice-${data.invoiceNumber}.pdf`);
}