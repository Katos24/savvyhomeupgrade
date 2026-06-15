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

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  );
}

export async function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0.07, 0.07, 0.07);
  const gray = rgb(0.42, 0.45, 0.50);
  const lightGray = rgb(0.95, 0.96, 0.97);
  const white = rgb(1, 1, 1);
  const green = rgb(0.02, 0.59, 0.43);

const margin = 52;
  const contentW = width - margin * 2;
  let y = height - margin;

  // ── LOGO ─────────────────────────────────────────────────
  if (data.companyLogoUrl) {
    try {
      const res = await fetch(data.companyLogoUrl);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || '';
      let logoImage;
      if (contentType.includes('png')) {
        logoImage = await doc.embedPng(arrayBuffer);
      } else {
        logoImage = await doc.embedJpg(arrayBuffer);
      }
      const logoDims = logoImage.scaleToFit(80, 30);
      page.drawImage(logoImage, {
        x: margin,
        y: height - 55,
        width: logoDims.width,
        height: logoDims.height,
      });
    } catch {
      // logo failed silently
    }
  }

// ── HEADER BACKGROUND ────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width,
    height: 90,
    color: rgb(0.05, 0.09, 0.16),
  });

  // ── COMPANY NAME ─────────────────────────────────────────
  page.drawText(data.companyName.toUpperCase(), {
    x: margin,
    y: height - 38,
    size: 13,
    font: fontBold,
    color: white,
  });

  if (data.companyPhone) {
    const digits = data.companyPhone.replace(/\D/g, '');
    const formattedPhone = digits.length === 10
      ? `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
      : data.companyPhone;
    page.drawText(formattedPhone, {
      x: margin,
      y: height - 56,
      size: 9,
      font: fontRegular,
      color: rgb(0.6, 0.65, 0.72),
    });
  }

  if (data.companyEmail) {
    page.drawText(data.companyEmail, {
      x: margin,
      y: height - 68,
      size: 9,
      font: fontRegular,
      color: rgb(0.6, 0.65, 0.72),
    });
  }

  // ── INVOICE LABEL ─────────────────────────────────────────
  page.drawText('INVOICE', {
    x: width - margin - 80,
    y: height - 38,
    size: 22,
    font: fontBold,
    color: white,
  });

  // ── META (right side) ─────────────────────────────────────
  const metaRows = [
    { label: 'Invoice #', value: data.invoiceNumber },
    { label: 'Date', value: data.invoiceDate },
    ...(data.dueDate ? [{ label: 'Due Date', value: data.dueDate }] : []),
  ];

  let metaY = height - 56;
  for (const row of metaRows) {
    page.drawText(row.label, {
      x: width - margin - 160,
      y: metaY,
      size: 8,
      font: fontBold,
      color: rgb(0.6, 0.65, 0.72),
    });
    page.drawText(row.value, {
      x: width - margin - 60,
      y: metaY,
      size: 8,
      font: fontRegular,
      color: white,
    });
    metaY -= 14;
  }

  y = height - 110;

  // ── BILL TO ───────────────────────────────────────────────
  page.drawText('BILL TO', {
    x: margin,
    y,
    size: 8,
    font: fontBold,
    color: gray,
  });
  y -= 14;

  page.drawText(data.customerName, {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: black,
  });
  y -= 13;

  if (data.customerEmail) {
    page.drawText(data.customerEmail, { x: margin, y, size: 9, font: fontRegular, color: gray });
    y -= 12;
  }
  if (data.customerPhone) {
const customerDigits = data.customerPhone.replace(/\D/g, '');
const formattedCustomerPhone = customerDigits.length === 10
  ? `(${customerDigits.slice(0,3)}) ${customerDigits.slice(3,6)}-${customerDigits.slice(6)}`
  : data.customerPhone;
page.drawText(formattedCustomerPhone, { x: margin, y, size: 9, font: fontRegular, color: gray });
    y -= 12;
  }
  if (data.customerAddress) {
    page.drawText(data.customerAddress, { x: margin, y, size: 9, font: fontRegular, color: gray });
    y -= 12;
  }

  y -= 16;

  // ── DIVIDER ───────────────────────────────────────────────
  page.drawRectangle({ x: margin, y, width: contentW, height: 0.5, color: rgb(0.88, 0.9, 0.92) });
  y -= 16;

  // ── TABLE HEADER ──────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 22, color: lightGray });

  const colDesc = margin + 6;
  const colQty = margin + contentW * 0.58;
  const colUnit = margin + contentW * 0.72;
  const colAmt = margin + contentW - 6;

  page.drawText('DESCRIPTION', { x: colDesc, y, size: 7.5, font: fontBold, color: gray });
  page.drawText('QTY', { x: colQty, y, size: 7.5, font: fontBold, color: gray });
  page.drawText('UNIT PRICE', { x: colUnit, y, size: 7.5, font: fontBold, color: gray });
  page.drawText('AMOUNT', { x: colAmt - 30, y, size: 7.5, font: fontBold, color: gray });

  y -= 20;

  // ── LINE ITEMS ────────────────────────────────────────────
  for (let i = 0; i < data.lineItems.length; i++) {
    const item = data.lineItems[i];

    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 5, width: contentW, height: 18, color: rgb(0.98, 0.99, 1) });
    }

    // Truncate long descriptions
    const desc = item.description.length > 55
      ? item.description.substring(0, 52) + '...'
      : item.description;

    page.drawText(desc, { x: colDesc, y, size: 9, font: fontRegular, color: black });
    page.drawText(String(item.quantity ?? 1), { x: colQty, y, size: 9, font: fontRegular, color: gray });
    page.drawText(item.unitPrice ? fmt(item.unitPrice) : '—', { x: colUnit, y, size: 9, font: fontRegular, color: gray });
    page.drawText(fmt(item.amount), { x: colAmt - 40, y, size: 9, font: fontBold, color: black });

    y -= 18;
  }

  y -= 8;

  // ── DIVIDER ───────────────────────────────────────────────
  page.drawRectangle({ x: margin, y, width: contentW, height: 0.5, color: rgb(0.88, 0.9, 0.92) });
  y -= 20;

  // ── TOTAL BOX ─────────────────────────────────────────────
  const totalBoxW = 160;
  const totalBoxX = margin + contentW - totalBoxW;
  page.drawRectangle({ x: totalBoxX, y: y - 8, width: totalBoxW, height: 28, color: rgb(0.05, 0.09, 0.16) });

  page.drawText('TOTAL DUE', {
    x: totalBoxX + 10,
    y: y + 3,
    size: 8,
    font: fontBold,
    color: rgb(0.6, 0.65, 0.72),
  });

  page.drawText(fmt(data.total), {
    x: totalBoxX + totalBoxW - 10 - (fmt(data.total).length * 6.5),
    y: y + 3,
    size: 11,
    font: fontBold,
    color: white,
  });

  y -= 30;

  // ── NOTES ─────────────────────────────────────────────────
  if (data.notes) {
    y -= 10;
    page.drawText('NOTES', { x: margin, y, size: 8, font: fontBold, color: gray });
    y -= 14;

    // Word wrap notes
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

      const qrSize = 70;
      const qrX = margin;
      const qrY = 45;

      page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
      });

      const paymentLabels: Record<string, string> = {
        venmo: 'Scan to pay with Venmo',
        zelle: 'Scan to pay with Zelle',
        cashapp: 'Scan to pay with Cash App',
        paypal: 'Scan to pay with PayPal',
        other: 'Scan to pay',
      };

      const label = paymentLabels[data.paymentLinkType || ''] || 'Scan to pay';

      page.drawText(label, {
        x: qrX + qrSize + 10,
        y: qrY + 35,
        size: 9,
        font: fontBold,
        color: black,
      });

      page.drawText(fmt(data.total) + ' due', {
        x: qrX + qrSize + 10,
        y: qrY + 20,
        size: 9,
        font: fontRegular,
        color: gray,
      });
      // Show URL as text too
      const shortUrl = data.paymentLinkUrl.replace('https://', '').replace('http://', '');
      page.drawText(shortUrl.length > 35 ? shortUrl.substring(0, 32) + '...' : shortUrl, {
        x: qrX + qrSize + 10,
        y: qrY + 5,
        size: 8,
        font: fontRegular,
        color: green,
      });
    } catch {
      // QR generation failed silently
    }
  }

  // ── FOOTER ────────────────────────────────────────────────
  page.drawText('Thank you for your business.', {
    x: width / 2 - 70,
    y: 28,
    size: 9,
    font: fontRegular,
    color: gray,
  });

  const pdfBytes = await doc.save();
  return pdfBytes;
}