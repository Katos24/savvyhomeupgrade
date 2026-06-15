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
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : phone;
}

export async function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // ── COLORS ────────────────────────────────────────────────
  const navy       = rgb(0.05, 0.09, 0.16);
  const green      = rgb(0.02, 0.59, 0.43);
  const black      = rgb(0.07, 0.07, 0.07);
  const gray       = rgb(0.42, 0.45, 0.50);
  const lightGray  = rgb(0.95, 0.96, 0.97);
  const mutedGray  = rgb(0.88, 0.90, 0.92);
  const white      = rgb(1, 1, 1);
  const greenLight = rgb(0.92, 0.99, 0.96);

  const margin   = 52;
  const contentW = width - margin * 2;
  let y          = height;

  // ── GREEN ACCENT BAR (top) ────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: green });

  // ── DARK HEADER BAND ─────────────────────────────────────
  const headerH = 88;
  page.drawRectangle({ x: 0, y: height - 4 - headerH, width, height: headerH, color: navy });

  // ── LOGO ─────────────────────────────────────────────────
  if (data.companyLogoUrl) {
    try {
      const res = await fetch(data.companyLogoUrl);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || '';
      const logoImage = contentType.includes('png')
        ? await doc.embedPng(arrayBuffer)
        : await doc.embedJpg(arrayBuffer);
      const logoDims = logoImage.scaleToFit(40, 36);
page.drawImage(logoImage, {
  x: width - margin - 145,
  y: height - 4 - 52,
  width: logoDims.width,
  height: logoDims.height,
});
    } catch {
      // logo failed silently
    }
  }

  // ── COMPANY NAME + CONTACT (left of header) ───────────────
  const companyNameY = height - 4 - 26;
  page.drawText(data.companyName.toUpperCase(), {
    x: margin,
    y: companyNameY,
    size: 11,
    font: fontBold,
    color: white,
  });

  let contactY = companyNameY - 15;
  if (data.companyPhone) {
    page.drawText(formatPhone(data.companyPhone), {
      x: margin, y: contactY, size: 8, font: fontRegular, color: rgb(0.6, 0.65, 0.72),
    });
    contactY -= 12;
  }
  if (data.companyEmail) {
    page.drawText(data.companyEmail, {
      x: margin, y: contactY, size: 8, font: fontRegular, color: rgb(0.6, 0.65, 0.72),
    });
  }

  // ── INVOICE LABEL (right of header) ──────────────────────
  page.drawText('INVOICE', {
    x: width - margin - 90,
    y: height - 4 - 32,
    size: 24,
    font: fontBold,
    color: white,
  });

  // ── META ROWS (right, below INVOICE) ─────────────────────
  const metaRows = [
    { label: 'Invoice #', value: data.invoiceNumber },
    { label: 'Date',      value: data.invoiceDate },
    ...(data.dueDate ? [{ label: 'Due Date', value: data.dueDate }] : []),
  ];
  let metaY = height - 4 - 50;
  for (const row of metaRows) {
    page.drawText(row.label, {
      x: width - margin - 155, y: metaY, size: 7.5, font: fontBold, color: rgb(0.5, 0.55, 0.65),
    });
    page.drawText(row.value, {
      x: width - margin - 65, y: metaY, size: 7.5, font: fontRegular, color: white,
    });
    metaY -= 13;
  }

  // ── BILL TO / INVOICE INFO TWO-COLUMN BAND ────────────────
  y = height - 4 - headerH - 16;

  // Left: Bill To box
  const billToBoxH = 80;
  page.drawRectangle({
    x: margin, y: y - billToBoxH, width: contentW * 0.52, height: billToBoxH,
    color: lightGray,
  });
  // Green left border accent
  page.drawRectangle({
    x: margin, y: y - billToBoxH, width: 3, height: billToBoxH, color: green,
  });

  let billY = y - 14;
  page.drawText('BILL TO', {
    x: margin + 10, y: billY, size: 7, font: fontBold, color: green,
  });
  billY -= 13;
  page.drawText(data.customerName, {
    x: margin + 10, y: billY, size: 10, font: fontBold, color: black,
  });
  billY -= 12;
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

  // Right: Summary box (invoice # + total at a glance)
  const summaryX = margin + contentW * 0.57;
  const summaryW = contentW * 0.43;
  page.drawRectangle({
    x: summaryX, y: y - billToBoxH, width: summaryW, height: billToBoxH, color: navy,
  });

  let sumY = y - 16;
  page.drawText('AMOUNT DUE', {
    x: summaryX + 12, y: sumY, size: 7, font: fontBold, color: rgb(0.5, 0.55, 0.65),
  });
  sumY -= 18;
  page.drawText(fmt(data.total), {
    x: summaryX + 12, y: sumY, size: 18, font: fontBold, color: white,
  });
  sumY -= 16;
  if (data.dueDate) {
    page.drawText(`Due ${data.dueDate}`, {
      x: summaryX + 12, y: sumY, size: 7.5, font: fontRegular, color: rgb(0.5, 0.55, 0.65),
    });
    sumY -= 12;
  }
  page.drawText(data.invoiceNumber, {
    x: summaryX + 12, y: sumY, size: 7.5, font: fontBold, color: green,
  });

  y = y - billToBoxH - 20;

  // ── TABLE HEADER ──────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 22, color: navy });

  const colDesc = margin + 8;
  const colQty  = margin + contentW * 0.58;
  const colUnit = margin + contentW * 0.72;
  const colAmt  = margin + contentW - 8;

  page.drawText('DESCRIPTION', { x: colDesc, y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
  page.drawText('QTY',         { x: colQty,  y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
  page.drawText('UNIT PRICE',  { x: colUnit, y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });
  page.drawText('AMOUNT',      { x: colAmt - 35, y, size: 7.5, font: fontBold, color: rgb(0.6, 0.65, 0.72) });

  y -= 20;

  // ── LINE ITEMS ────────────────────────────────────────────
  for (let i = 0; i < data.lineItems.length; i++) {
    const item = data.lineItems[i];

    // Alternating row background
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 5, width: contentW, height: 19, color: lightGray });
    }

    // Bottom border on each row
    page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 0.5, color: mutedGray });

    const desc = item.description.length > 55
      ? item.description.substring(0, 52) + '...'
      : item.description;

    page.drawText(desc, { x: colDesc, y, size: 9, font: fontRegular, color: black });
    page.drawText(String(item.quantity ?? 1), { x: colQty, y, size: 9, font: fontRegular, color: gray });
    page.drawText(item.unitPrice ? fmt(item.unitPrice) : '—', { x: colUnit, y, size: 9, font: fontRegular, color: gray });
    page.drawText(fmt(item.amount), { x: colAmt - 40, y, size: 9, font: fontBold, color: green });

    y -= 20;
  }

  y -= 4;

// ── SUBTOTAL ROW ──────────────────────────────────────────
  page.drawRectangle({ x: margin, y, width: contentW, height: 0.5, color: mutedGray });
  y -= 22;

  page.drawText('Subtotal', {
    x: colUnit - 10, y, size: 8.5, font: fontRegular, color: gray,
  });
  page.drawText(fmt(data.total), {
    x: colAmt - 40, y, size: 8.5, font: fontRegular, color: gray,
  });
  y -= 16;

  // ── TOTAL BOX ─────────────────────────────────────────────
  const totalBoxW = 200;
  const totalBoxX = margin + contentW - totalBoxW;
  const totalBoxH = 36;
  page.drawRectangle({ x: totalBoxX, y: y - totalBoxH + 10, width: totalBoxW, height: totalBoxH, color: greenLight });
  page.drawRectangle({ x: totalBoxX, y: y - totalBoxH + 10, width: 3, height: totalBoxH, color: green });

  page.drawText('TOTAL DUE', {
    x: totalBoxX + 12, y: y - 2, size: 8, font: fontBold, color: green,
  });
  page.drawText(fmt(data.total), {
    x: totalBoxX + totalBoxW - 12 - (fmt(data.total).length * 7),
    y: y - 2,
    size: 13,
    font: fontBold,
    color: navy,
  });

  y -= totalBoxH + 20;

  // ── NOTES ─────────────────────────────────────────────────
  if (data.notes) {
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
      y -= 13;
    }
  }

  // ── PAYMENT QR CODE ───────────────────────────────────────
  if (data.paymentLinkUrl) {
    try {
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(data.paymentLinkUrl, {
        width: 80,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBytes = Buffer.from(qrBase64, 'base64');
      const qrImage = await doc.embedPng(qrBytes);

      const qrSize = 64;
      const qrX = margin;
      const qrY = 52;

      // QR background box
      page.drawRectangle({
        x: qrX - 6, y: qrY - 6, width: qrSize + 100 + 24, height: qrSize + 12, color: lightGray,
      });

      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      const paymentLabels: Record<string, string> = {
        venmo:   'Scan to pay with Venmo',
        zelle:   'Scan to pay with Zelle',
        cashapp: 'Scan to pay with Cash App',
        paypal:  'Scan to pay with PayPal',
        other:   'Scan to pay',
      };
      const label = paymentLabels[data.paymentLinkType || ''] || 'Scan to pay';

      page.drawText(label, {
        x: qrX + qrSize + 10, y: qrY + 38, size: 8.5, font: fontBold, color: black,
      });
      page.drawText(`${fmt(data.total)} due`, {
        x: qrX + qrSize + 10, y: qrY + 24, size: 8, font: fontRegular, color: gray,
      });

      const shortUrl = data.paymentLinkUrl.replace('https://', '').replace('http://', '');
      page.drawText(
        shortUrl.length > 35 ? shortUrl.substring(0, 32) + '...' : shortUrl,
        { x: qrX + qrSize + 10, y: qrY + 10, size: 7.5, font: fontRegular, color: green }
      );
    } catch {
      // QR generation failed silently
    }
  }

  // ── FOOTER BAR ────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 32, color: navy });
  page.drawText('Thank you for your business.', {
    x: width / 2 - 68,
    y: 11,
    size: 8.5,
    font: fontBold,
    color: rgb(0.6, 0.65, 0.72),
  });

  const pdfBytes = await doc.save();
  return pdfBytes;
}