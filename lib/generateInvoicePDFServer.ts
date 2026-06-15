import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type LineItem = {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
};

type InvoicePDFData = {
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
  paymentLinkUrl?: string;
  paymentLinkType?: string;
  amountPaid?: number;
  brandColor1?: string;
  brandColor2?: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : phone;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  );
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export async function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // ── BRAND COLORS ─────────────────────────────────────────
  const accent  = (data.brandColor1 && isValidHex(data.brandColor1)) ? hexToRgb(data.brandColor1) : rgb(0.05, 0.09, 0.16);
  const accent2 = (data.brandColor2 && isValidHex(data.brandColor2)) ? hexToRgb(data.brandColor2) : rgb(0.02, 0.59, 0.43);

  // ── STATIC COLORS ─────────────────────────────────────────
  const black     = rgb(0.07, 0.07, 0.07);
  const gray      = rgb(0.45, 0.48, 0.53);
  const lightGray = rgb(0.96, 0.97, 0.98);
  const mutedGray = rgb(0.88, 0.90, 0.92);
  const white     = rgb(1, 1, 1);

  const margin   = 48;
  const contentW = width - margin * 2;
  const hasPartialPayment = !!(data.amountPaid && data.amountPaid > 0 && data.amountPaid < data.total);
  const balanceDue = hasPartialPayment ? data.total - (data.amountPaid ?? 0) : data.total;

  let y = height;

  // ── ACCENT TOP BAR ────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 5, width, height: 5, color: accent2 });

  // ── HEADER ────────────────────────────────────────────────
  const headerH = 100;
  page.drawRectangle({ x: 0, y: height - 5 - headerH, width, height: headerH, color: accent });

  // ── LOGO (top left, big) ──────────────────────────────────
  let logoEndX = margin;
  if (data.companyLogoUrl) {
    try {
      const res = await fetch(data.companyLogoUrl);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || '';
      const logoImage = contentType.includes('png')
        ? await doc.embedPng(arrayBuffer)
        : await doc.embedJpg(arrayBuffer);
      const logoDims = logoImage.scaleToFit(60, 60);
      page.drawImage(logoImage, {
        x: margin,
        y: height - 5 - 20 - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
      logoEndX = margin + logoDims.width + 12;
    } catch {
      // silent
    }
  }

  // ── COMPANY NAME + CONTACT (next to logo) ─────────────────
  page.drawText(data.companyName.toUpperCase(), {
    x: logoEndX, y: height - 5 - 30, size: 12, font: fontBold, color: white,
  });
  let contactY = height - 5 - 46;
  if (data.companyPhone) {
    page.drawText(formatPhone(data.companyPhone), { x: logoEndX, y: contactY, size: 8, font: fontRegular, color: rgb(0.7, 0.73, 0.78) });
    contactY -= 12;
  }
  if (data.companyEmail) {
    page.drawText(data.companyEmail, { x: logoEndX, y: contactY, size: 8, font: fontRegular, color: rgb(0.7, 0.73, 0.78) });
  }

  // ── INVOICE LABEL (far right) ─────────────────────────────
  page.drawText('INVOICE', { x: width - margin - 100, y: height - 5 - 38, size: 28, font: fontBold, color: white });

  // ── META (below INVOICE) ──────────────────────────────────
  const metaRows = [
    { label: 'Invoice #', value: data.invoiceNumber },
    { label: 'Date', value: data.invoiceDate },
    ...(data.dueDate ? [{ label: 'Due', value: data.dueDate }] : []),
  ];
  let metaY = height - 5 - 58;
  for (const row of metaRows) {
    page.drawText(row.label, { x: width - margin - 100, y: metaY, size: 7.5, font: fontBold, color: rgb(0.55, 0.60, 0.68) });
    page.drawText(row.value, { x: width - margin - 40, y: metaY, size: 7.5, font: fontRegular, color: white });
    metaY -= 13;
  }

  y = height - 5 - headerH - 20;

  // ── BILL TO + BALANCE BAND ────────────────────────────────
  const bandH = 90;

  // Bill To (left)
  page.drawRectangle({ x: margin, y: y - bandH, width: contentW * 0.50, height: bandH, color: lightGray });
  page.drawRectangle({ x: margin, y: y - bandH, width: 3, height: bandH, color: accent2 });

  let billY = y - 16;
  page.drawText('BILL TO', { x: margin + 10, y: billY, size: 7, font: fontBold, color: accent2 });
  billY -= 14;
  page.drawText(data.customerName, { x: margin + 10, y: billY, size: 11, font: fontBold, color: black });
  billY -= 13;
  if (data.customerEmail) {
    page.drawText(data.customerEmail, { x: margin + 10, y: billY, size: 8, font: fontRegular, color: gray });
    billY -= 11;
  }
  if (data.customerPhone) {
    page.drawText(formatPhone(data.customerPhone), { x: margin + 10, y: billY, size: 8, font: fontRegular, color: gray });
    billY -= 11;
  }
  if (data.customerAddress) {
    page.drawText(data.customerAddress, { x: margin + 10, y: billY, size: 8, font: fontRegular, color: gray });
  }

  // Balance/Total box (right) — prominent if partial
  const boxX = margin + contentW * 0.55;
  const boxW = contentW * 0.45;
  page.drawRectangle({ x: boxX, y: y - bandH, width: boxW, height: bandH, color: accent });

  let boxY = y - 18;
  if (hasPartialPayment) {
    page.drawText('BALANCE DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: rgb(0.55, 0.60, 0.68) });
    boxY -= 22;
    page.drawText(fmt(balanceDue), { x: boxX + 14, y: boxY, size: 20, font: fontBold, color: accent2 });
    boxY -= 16;
    page.drawText(`of ${fmt(data.total)} total`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: rgb(0.55, 0.60, 0.68) });
    boxY -= 12;
    page.drawText(`Paid: ${fmt(data.amountPaid ?? 0)}`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: rgb(0.55, 0.60, 0.68) });
  } else {
    page.drawText('AMOUNT DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: rgb(0.55, 0.60, 0.68) });
    boxY -= 24;
    page.drawText(fmt(data.total), { x: boxX + 14, y: boxY, size: 22, font: fontBold, color: white });
    boxY -= 16;
    if (data.dueDate) {
      page.drawText(`Due ${data.dueDate}`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: rgb(0.55, 0.60, 0.68) });
    }
  }

  y = y - bandH - 18;

  // ── TABLE HEADER ──────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 24, color: accent });

  const colDesc = margin + 8;
  const colQty  = margin + contentW * 0.56;
  const colUnit = margin + contentW * 0.70;
  const colAmt  = margin + contentW - 8;

  page.drawText('DESCRIPTION', { x: colDesc, y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
  page.drawText('QTY',         { x: colQty,  y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
  page.drawText('UNIT PRICE',  { x: colUnit, y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
  page.drawText('AMOUNT',      { x: colAmt - 38, y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });

  y -= 22;

  // ── LINE ITEMS ────────────────────────────────────────────
  for (let i = 0; i < data.lineItems.length; i++) {
    const item = data.lineItems[i];
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 20, color: lightGray });
    }
    page.drawRectangle({ x: margin, y: y - 7, width: contentW, height: 0.5, color: mutedGray });

    const desc = item.description.length > 52 ? item.description.substring(0, 49) + '...' : item.description;
    page.drawText(desc, { x: colDesc, y, size: 9, font: fontRegular, color: black });
    page.drawText(String(item.quantity ?? 1), { x: colQty, y, size: 9, font: fontRegular, color: gray });
    page.drawText(item.unitPrice ? fmt(item.unitPrice) : '-', { x: colUnit, y, size: 9, font: fontRegular, color: gray });
    page.drawText(fmt(item.amount), { x: colAmt - 42, y, size: 9, font: fontBold, color: accent2 });
    y -= 21;
  }

  y -= 6;
  page.drawRectangle({ x: margin, y, width: contentW, height: 0.5, color: mutedGray });
  y -= 20;

  // ── TOTALS SECTION ────────────────────────────────────────
  const totalsX = margin + contentW * 0.55;
  const totalsW = contentW * 0.45;

  // Subtotal row
  page.drawText('Subtotal', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
  page.drawText(fmt(data.total), { x: totalsX + totalsW - 10 - (fmt(data.total).length * 5.5), y, size: 9, font: fontRegular, color: gray });
  y -= 14;

  // If partial — show amount paid row
  if (hasPartialPayment) {
    page.drawText('Amount Paid', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
    page.drawText(`- ${fmt(data.amountPaid ?? 0)}`, { x: totalsX + totalsW - 10 - (fmt(data.amountPaid ?? 0).length * 5.5 + 16), y, size: 9, font: fontRegular, color: accent2 });
    y -= 14;
    page.drawRectangle({ x: totalsX, y, width: totalsW, height: 0.5, color: mutedGray });
    y -= 16;

    // Balance Due box — BIG and prominent
    page.drawRectangle({ x: totalsX, y: y - 10, width: totalsW, height: 36, color: accent2 });
    page.drawText('BALANCE DUE', { x: totalsX + 10, y: y + 6, size: 8, font: fontBold, color: white });
    page.drawText(fmt(balanceDue), {
      x: totalsX + totalsW - 10 - (fmt(balanceDue).length * 7.2),
      y: y + 6, size: 14, font: fontBold, color: white,
    });
    y -= 46;
  } else {
    // Total Due box
    page.drawRectangle({ x: totalsX, y: y - 10, width: totalsW, height: 36, color: accent });
    page.drawText('TOTAL DUE', { x: totalsX + 10, y: y + 6, size: 8, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
    page.drawText(fmt(data.total), {
      x: totalsX + totalsW - 10 - (fmt(data.total).length * 7.2),
      y: y + 6, size: 14, font: fontBold, color: white,
    });
    y -= 46;
  }

  // ── NOTES ─────────────────────────────────────────────────
  if (data.notes) {
    y -= 10;
    page.drawRectangle({ x: margin, y: y - 4, width: contentW, height: 0.5, color: mutedGray });
    y -= 18;
    page.drawText('NOTES', { x: margin, y, size: 7.5, font: fontBold, color: gray });
    y -= 13;
    const words = data.notes.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (fontRegular.widthOfTextAtSize(test, 9) > contentW) {
        page.drawText(line, { x: margin, y, size: 9, font: fontRegular, color: black });
        y -= 13;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x: margin, y, size: 9, font: fontRegular, color: black });
    }
  }

  // ── QR CODE ───────────────────────────────────────────────
  if (data.paymentLinkUrl) {
    try {
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(data.paymentLinkUrl, { width: 80, margin: 1, errorCorrectionLevel: 'M' });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBytes = Buffer.from(qrBase64, 'base64');
      const qrImage = await doc.embedPng(qrBytes);
      const qrSize = 60;
      const qrX = margin;
      const qrY = 48;

      page.drawRectangle({ x: qrX - 8, y: qrY - 8, width: qrSize + 130, height: qrSize + 16, color: lightGray });
      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      const paymentLabels: Record<string, string> = {
        venmo: 'Scan to pay with Venmo', zelle: 'Scan to pay with Zelle',
        cashapp: 'Scan to pay with Cash App', paypal: 'Scan to pay with PayPal', other: 'Scan to pay',
      };
      page.drawText(paymentLabels[data.paymentLinkType || ''] || 'Scan to pay', { x: qrX + qrSize + 10, y: qrY + 36, size: 8.5, font: fontBold, color: black });
      page.drawText(hasPartialPayment ? `${fmt(balanceDue)} due` : `${fmt(data.total)} due`, { x: qrX + qrSize + 10, y: qrY + 22, size: 8, font: fontRegular, color: gray });
      const shortUrl = data.paymentLinkUrl.replace('https://', '').replace('http://', '');
      page.drawText(shortUrl.length > 35 ? shortUrl.substring(0, 32) + '...' : shortUrl, { x: qrX + qrSize + 10, y: qrY + 8, size: 7.5, font: fontRegular, color: accent2 });
    } catch {
      // silent
    }
  }

  // ── FOOTER ────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 36, color: accent });
  page.drawText('Thank you for your business.', { x: width / 2 - 72, y: 13, size: 9, font: fontBold, color: rgb(0.6, 0.65, 0.72) });

  return await doc.save();
}