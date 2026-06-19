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

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  );
}

// Convert hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  let r = parseInt(h.substring(0, 2), 16) / 255;
  let g = parseInt(h.substring(2, 4), 16) / 255;
  let b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const lit = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = lit > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return [hue * 360, sat * 100, lit * 100];
}

// Convert HSL back to pdf-lib rgb
function hslToRgbColor(h: number, s: number, l: number) {
  const hN = h / 360, sN = s / 100, lN = l / 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = lN;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    r = hue2rgb(p, q, hN + 1/3);
    g = hue2rgb(p, q, hN);
    b = hue2rgb(p, q, hN - 1/3);
  }
  return rgb(r, g, b);
}

// Darken any color to be safe for large header fills
// Clamps lightness to 20-32%, reduces saturation slightly
// Pure black (#000000) gets nudged to a dark slate so it has character
function darkenForHeader(hex: string) {
  if (!isValidHex(hex)) return rgb(0.10, 0.13, 0.18); // default dark slate

  let [h, s, l] = hexToHsl(hex);

  // Pure black or near-black — nudge to dark slate with slight hue
  if (l < 5) return rgb(0.10, 0.13, 0.18);

  // Very light colors — fall back to dark slate
  if (l > 85) return rgb(0.10, 0.13, 0.18);

  // Clamp lightness to 20-32% range — always dark enough for white text
  l = Math.max(20, Math.min(32, l));

  // Reduce saturation slightly for very vivid colors so they don't scream
  if (s > 80) s = s * 0.75;

  return hslToRgbColor(h, s, l);
}

// Make accent color safe for small use on white (ensure it's dark enough to see)
function accentForWhite(hex: string) {
  if (!isValidHex(hex)) return rgb(0.02, 0.59, 0.43);
  const [h, s, l] = hexToHsl(hex);
  // If too light to see on white, darken it
  if (l > 70) return hslToRgbColor(h, s, 45);
  // If pure black, use a visible dark slate
  if (l < 5) return rgb(0.10, 0.13, 0.18);
  return hexToRgb(hex);
}

export async function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold);

  // ── COLORS ───────────────────────────────────────────────
  const headerColor  = darkenForHeader(data.brandColor1 || '#1e293b');
  const accentColor  = accentForWhite(data.brandColor1 || '#1e293b');
  const accent2Color = accentForWhite(data.brandColor2 || '#10b981');

  const black     = rgb(0.07, 0.07, 0.07);
  const darkGray  = rgb(0.20, 0.22, 0.25);
  const gray      = rgb(0.45, 0.48, 0.53);
  const lightGray = rgb(0.96, 0.97, 0.98);
  const mutedGray = rgb(0.88, 0.90, 0.92);
  const white     = rgb(1, 1, 1);
  const offWhite  = rgb(0.98, 0.98, 0.99);

  const margin   = 48;
  const contentW = width - margin * 2;
  const hasPartialPayment = !!(data.amountPaid && data.amountPaid > 0 && data.amountPaid < data.total);
  const balanceDue = hasPartialPayment ? data.total - (data.amountPaid ?? 0) : data.total;

  let y = height;

  // ── THIN ACCENT TOP BAR ───────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: accent2Color });

  // ── HEADER — darkened brand color, always safe for white text ──
  const headerH = 100;
  page.drawRectangle({ x: 0, y: height - 4 - headerH, width, height: headerH, color: headerColor });

  // ── LOGO ─────────────────────────────────────────────────
  let logoEndX = margin;
  if (data.companyLogoUrl) {
    try {
      const res = await fetch(data.companyLogoUrl);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || '';
      const logoImage = contentType.includes('png')
        ? await doc.embedPng(arrayBuffer)
        : await doc.embedJpg(arrayBuffer);
      const logoDims = logoImage.scaleToFit(55, 55);
      page.drawImage(logoImage, {
        x: margin,
        y: height - 4 - 20 - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
      logoEndX = margin + logoDims.width + 14;
    } catch { /* silent */ }
  }

  // ── COMPANY NAME + CONTACT (white on dark header) ─────────
  page.drawText(data.companyName.toUpperCase(), {
    x: logoEndX, y: height - 4 - 28, size: 12, font: fontBold, color: white,
  });
  let contactY = height - 4 - 44;
  if (data.companyPhone) {
    page.drawText(formatPhone(data.companyPhone), {
      x: logoEndX, y: contactY, size: 8, font: fontRegular, color: rgb(0.75, 0.78, 0.83),
    });
    contactY -= 12;
  }
  if (data.companyEmail) {
    page.drawText(data.companyEmail, {
      x: logoEndX, y: contactY, size: 8, font: fontRegular, color: rgb(0.75, 0.78, 0.83),
    });
  }

  // ── INVOICE LABEL ─────────────────────────────────────────
  page.drawText('INVOICE', {
    x: width - margin - 110, y: height - 4 - 40, size: 28, font: fontBold, color: white,
  });

  // ── META ROWS ─────────────────────────────────────────────
  const metaRows = [
    { label: 'Invoice #', value: data.invoiceNumber },
    { label: 'Date',      value: data.invoiceDate   },
    ...(data.dueDate ? [{ label: 'Due', value: data.dueDate }] : []),
  ];
  let metaY = height - 4 - 58;
  for (const row of metaRows) {
    page.drawText(row.label, {
      x: width - margin - 110, y: metaY, size: 7.5, font: fontBold, color: rgb(0.55, 0.60, 0.68),
    });
    page.drawText(row.value, {
      x: width - margin - 50, y: metaY, size: 7.5, font: fontRegular, color: white,
    });
    metaY -= 13;
  }

  y = height - 4 - headerH - 20;

  // ── BILL TO + AMOUNT BAND ─────────────────────────────────
  const bandH = 90;

  // Bill To — light background, accent left border
  page.drawRectangle({ x: margin, y: y - bandH, width: contentW * 0.50, height: bandH, color: lightGray });
  page.drawRectangle({ x: margin, y: y - bandH, width: 3, height: bandH, color: accentColor });

  let billY = y - 16;
  page.drawText('BILL TO', { x: margin + 10, y: billY, size: 7, font: fontBold, color: accentColor });
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

  // Amount Due box — off white with accent top bar
  const boxX = margin + contentW * 0.55;
  const boxW = contentW * 0.45;

  page.drawRectangle({ x: boxX, y: y - bandH, width: boxW, height: bandH, color: offWhite });
  page.drawRectangle({ x: boxX, y: y - 1, width: boxW, height: 3, color: accentColor });

  let boxY = y - 18;
  if (hasPartialPayment) {
    page.drawText('BALANCE DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: gray });
    boxY -= 22;
    page.drawText(fmt(balanceDue), { x: boxX + 14, y: boxY, size: 20, font: fontBold, color: accentColor });
    boxY -= 16;
    page.drawText(`of ${fmt(data.total)} total`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
    boxY -= 12;
    page.drawText(`Paid: ${fmt(data.amountPaid ?? 0)}`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: accent2Color });
  } else {
    page.drawText('AMOUNT DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: gray });
    boxY -= 24;
    page.drawText(fmt(data.total), { x: boxX + 14, y: boxY, size: 22, font: fontBold, color: darkGray });
    boxY -= 16;
    if (data.dueDate) {
      page.drawText(`Due ${data.dueDate}`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
    }
  }

  y = y - bandH - 18;

  // ── TABLE HEADER ──────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 24, color: lightGray });
  page.drawRectangle({ x: margin, y: y - 6, width: 3, height: 24, color: accentColor });

  const colDesc = margin + 8;
  const colQty  = margin + contentW * 0.56;
  const colUnit = margin + contentW * 0.70;
  const colAmt  = margin + contentW - 8;

  page.drawText('DESCRIPTION', { x: colDesc, y, size: 7.5, font: fontBold, color: darkGray });
  page.drawText('QTY',         { x: colQty,  y, size: 7.5, font: fontBold, color: darkGray });
  page.drawText('UNIT PRICE',  { x: colUnit, y, size: 7.5, font: fontBold, color: darkGray });
  page.drawText('AMOUNT',      { x: colAmt - 38, y, size: 7.5, font: fontBold, color: darkGray });

  y -= 22;

  // ── LINE ITEMS ────────────────────────────────────────────
  for (let i = 0; i < data.lineItems.length; i++) {
    const item = data.lineItems[i];
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 20, color: lightGray });
    }
    page.drawRectangle({ x: margin, y: y - 7, width: contentW, height: 0.5, color: mutedGray });

    const desc = item.description.length > 52
      ? item.description.substring(0, 49) + '...'
      : item.description;

    page.drawText(desc,                          { x: colDesc,     y, size: 9, font: fontRegular, color: black       });
    page.drawText(String(item.quantity ?? 1),    { x: colQty,      y, size: 9, font: fontRegular, color: gray        });
    page.drawText(item.unitPrice ? fmt(item.unitPrice) : '-', { x: colUnit, y, size: 9, font: fontRegular, color: gray });
    page.drawText(fmt(item.amount),              { x: colAmt - 42, y, size: 9, font: fontBold,    color: accent2Color });
    y -= 21;
  }

  y -= 6;
  page.drawRectangle({ x: margin, y, width: contentW, height: 0.5, color: mutedGray });
  y -= 20;

  // ── TOTALS ────────────────────────────────────────────────
  const totalsX = margin + contentW * 0.55;
  const totalsW = contentW * 0.45;

  page.drawText('Subtotal', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
  page.drawText(fmt(data.total), {
    x: totalsX + totalsW - 10 - (fmt(data.total).length * 5.5),
    y, size: 9, font: fontRegular, color: gray,
  });
  y -= 14;

  if (hasPartialPayment) {
    page.drawText('Amount Paid', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
    page.drawText(`- ${fmt(data.amountPaid ?? 0)}`, {
      x: totalsX + totalsW - 10 - (fmt(data.amountPaid ?? 0).length * 5.5 + 16),
      y, size: 9, font: fontRegular, color: accent2Color,
    });
    y -= 14;
    page.drawRectangle({ x: totalsX, y, width: totalsW, height: 0.5, color: mutedGray });
    y -= 16;

    page.drawRectangle({ x: totalsX, y: y - 10, width: totalsW, height: 36, color: offWhite });
    page.drawRectangle({ x: totalsX, y: y + 26, width: totalsW, height: 3, color: accentColor });
    page.drawText('BALANCE DUE', { x: totalsX + 10, y: y + 6, size: 8, font: fontBold, color: gray });
    page.drawText(fmt(balanceDue), {
      x: totalsX + totalsW - 10 - (fmt(balanceDue).length * 7.2),
      y: y + 6, size: 14, font: fontBold, color: accentColor,
    });
    y -= 46;
  } else {
    page.drawRectangle({ x: totalsX, y: y - 10, width: totalsW, height: 36, color: offWhite });
    page.drawRectangle({ x: totalsX, y: y + 26, width: totalsW, height: 3, color: accentColor });
    page.drawText('TOTAL DUE', { x: totalsX + 10, y: y + 6, size: 8, font: fontBold, color: gray });
    page.drawText(fmt(data.total), {
      x: totalsX + totalsW - 10 - (fmt(data.total).length * 7.2),
      y: y + 6, size: 14, font: fontBold, color: darkGray,
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
    if (line) page.drawText(line, { x: margin, y, size: 9, font: fontRegular, color: black });
  }

  // ── QR CODE ───────────────────────────────────────────────
  if (data.paymentLinkUrl) {
    try {
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(data.paymentLinkUrl, {
        width: 80, margin: 1, errorCorrectionLevel: 'M',
      });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBytes  = Buffer.from(qrBase64, 'base64');
      const qrImage  = await doc.embedPng(qrBytes);
      const qrSize   = 60;
      const qrX      = margin;
      const qrY      = 48;

      page.drawRectangle({ x: qrX - 8, y: qrY - 8, width: qrSize + 130, height: qrSize + 16, color: lightGray });
      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      const paymentLabels: Record<string, string> = {
        venmo: 'Scan to pay with Venmo', zelle: 'Scan to pay with Zelle',
        cashapp: 'Scan to pay with Cash App', paypal: 'Scan to pay with PayPal', other: 'Scan to pay',
      };
      page.drawText(paymentLabels[data.paymentLinkType || ''] || 'Scan to pay', {
        x: qrX + qrSize + 10, y: qrY + 36, size: 8.5, font: fontBold, color: black,
      });
      page.drawText(hasPartialPayment ? `${fmt(balanceDue)} due` : `${fmt(data.total)} due`, {
        x: qrX + qrSize + 10, y: qrY + 22, size: 8, font: fontRegular, color: gray,
      });
      const shortUrl = data.paymentLinkUrl.replace('https://', '').replace('http://', '');
      page.drawText(shortUrl.length > 35 ? shortUrl.substring(0, 32) + '...' : shortUrl, {
        x: qrX + qrSize + 10, y: qrY + 8, size: 7.5, font: fontRegular, color: accent2Color,
      });
    } catch { /* silent */ }
  }

  // ── FOOTER ────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 36, color: headerColor });
  page.drawText('Thank you for your business.', {
    x: width / 2 - 72, y: 13, size: 9, font: fontBold, color: rgb(0.6, 0.65, 0.72),
  });

  return await doc.save();
}