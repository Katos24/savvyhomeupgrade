import { PDFDocument, rgb, degrees, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';


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
  taxRate?: number;
  notes?: string;
  paymentLinkUrl?: string;
  paymentLinkType?: string;
amountPaid?: number;
  /** What the pay link actually charges when a deposit is due. The PDF still
   *  shows the full contract — the customer needs to see what they're
   *  agreeing to — but the amount-due figures reflect what's owed now. */
  depositAmount?: number;
  /** Individual payments actually collected (deposit, balance, etc). When
   *  there's more than one, shown itemized with dates instead of a single
   *  lump "Amount Paid" — so the PDF reflects how the job was actually
   *  paid, not just the end total. */
  paymentBreakdown?: { label: string; amount: number; date?: string }[];
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

function darkenForHeader(hex: string) {
  if (!isValidHex(hex)) return rgb(0.10, 0.13, 0.18);
  let [h, s, l] = hexToHsl(hex);
  if (l < 5) return rgb(0.10, 0.13, 0.18);
  if (l > 85) return rgb(0.10, 0.13, 0.18);
  l = Math.max(20, Math.min(32, l));
  if (s > 80) s = s * 0.75;
  return hslToRgbColor(h, s, l);
}

function accentForWhite(hex: string) {
  if (!isValidHex(hex)) return rgb(0.02, 0.59, 0.43);
  const [h, s, l] = hexToHsl(hex);
  if (l > 70) return hslToRgbColor(h, s, 45);
  if (l < 5) return rgb(0.10, 0.13, 0.18);
  return hexToRgb(hex);
}

/** Truncate by measured width — a proportional font makes 49 narrow chars and
 *  49 wide ones very different widths. */
function fitText(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && font.widthOfTextAtSize(out + '...', size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return out.trimEnd() + '...';
}

/** Right-align by measuring rather than estimating characters × 5.5px. */
function drawRightAligned(
  page: PDFPage,
  text: string,
  rightEdge: number,
  y: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>
) {
  page.drawText(text, {
    x: rightEdge - font.widthOfTextAtSize(text, size),
    y,
    size,
    font,
    color,
  });
}

export async function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Uint8Array> {

  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold);

  const width = 612;
  const height = 792;
  const pages: PDFPage[] = [];
  let page: PDFPage = doc.addPage([width, height]);
  pages.push(page);

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
  const isPaidInFull = !!(data.amountPaid && data.total > 0 && data.amountPaid >= data.total);
  const hasPartialPayment = !isPaidInFull
    && !!(data.amountPaid && data.amountPaid > 0 && data.amountPaid < data.total);
  // Deposit only applies before anything is collected — once a payment lands,
  // the partial-payment path takes over and shows the real balance.
  const hasDepositDue = !isPaidInFull && !hasPartialPayment
    && !!(data.depositAmount && data.depositAmount > 0 && data.depositAmount < data.total);
  const depositDue = data.depositAmount ?? 0;
  const balanceDue = hasPartialPayment ? data.total - (data.amountPaid ?? 0) : data.total;
  // What the customer is actually being asked to pay right now. Previously
  // there was no paid-in-full case, so a fully paid invoice still rendered
  // "TOTAL DUE" for the full amount — actively misleading on a document
  // meant to prove the job's settled.
  const amountDueNow = isPaidInFull ? 0 : hasDepositDue ? depositDue : balanceDue;

  let y = height;

  const FOOTER_H = 36;
  const BOTTOM_LIMIT = FOOTER_H + 28; // nothing draws below this

  const colDesc = margin + 8;
  const colQty  = margin + contentW * 0.56;
  const colUnit = margin + contentW * 0.70;
  const colAmt  = margin + contentW - 8;
  const descMaxW = colQty - colDesc - 10;

  function drawTableHeader() {
    page.drawRectangle({ x: margin, y: y - 6, width: contentW, height: 28, color: rgb(0.93, 0.94, 0.96) });
    page.drawRectangle({ x: margin, y: y - 6, width: 3, height: 28, color: accentColor });
    page.drawText('DESCRIPTION', { x: colDesc, y, size: 8.5, font: fontBold, color: darkGray });
    page.drawText('QTY',         { x: colQty,  y, size: 8.5, font: fontBold, color: darkGray });
    page.drawText('UNIT PRICE',  { x: colUnit, y, size: 8.5, font: fontBold, color: darkGray });
    page.drawText('AMOUNT',      { x: colAmt - 38, y, size: 8.5, font: fontBold, color: darkGray });
    y -= 24;
  }

  /** Continuation page: slim band, no bill-to, table header repeated. */
  function addContinuationPage() {
    page = doc.addPage([width, height]);
    pages.push(page);

    page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: accent2Color });
    const bandH = 44;
    page.drawRectangle({ x: 0, y: height - 4 - bandH, width, height: bandH, color: headerColor });

    page.drawText(data.companyName.toUpperCase(), {
      x: margin, y: height - 4 - 28, size: 11, font: fontBold, color: white,
    });
    drawRightAligned(
      page,
      `INVOICE ${data.invoiceNumber} — continued`,
      width - margin,
      height - 4 - 28,
      9,
      fontRegular,
      rgb(0.75, 0.78, 0.83)
    );

    y = height - 4 - bandH - 40;
    drawTableHeader();
  }

  /** Break to a new page if `needed` px of room isn't left. */
  function ensureSpace(needed: number) {
    if (y - needed < BOTTOM_LIMIT) addContinuationPage();
  }

  // ── THIN ACCENT TOP BAR ──
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: accent2Color });

  // ── HEADER ──
  const headerH = 120;
  page.drawRectangle({ x: 0, y: height - 4 - headerH, width, height: headerH, color: headerColor });

  // ── LOGO ──
  let logoEndX = margin;
  if (data.companyLogoUrl) {
    try {
      const res = await fetch(data.companyLogoUrl);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || '';
      const logoImage = contentType.includes('png')
        ? await doc.embedPng(arrayBuffer)
        : await doc.embedJpg(arrayBuffer);
      const logoDims = logoImage.scaleToFit(72, 72);
      page.drawImage(logoImage, {
        x: margin,
        y: height - 4 - 24 - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
      logoEndX = margin + logoDims.width + 14;
    } catch { /* silent */ }
  }

  // ── COMPANY NAME + CONTACT ──
  page.drawText(data.companyName.toUpperCase(), {
    x: logoEndX, y: height - 4 - 34, size: 16, font: fontBold, color: white,
  });
  let contactY = height - 4 - 56;
  if (data.companyPhone) {
    page.drawText(formatPhone(data.companyPhone), {
      x: logoEndX, y: contactY, size: 9, font: fontRegular, color: rgb(0.75, 0.78, 0.83),
    });
    contactY -= 13;
  }
  if (data.companyEmail) {
    page.drawText(data.companyEmail, {
      x: logoEndX, y: contactY, size: 9, font: fontRegular, color: rgb(0.75, 0.78, 0.83),
    });
  }

  // ── INVOICE LABEL ──
  page.drawText('INVOICE', {
    x: width - margin - 110, y: height - 4 - 40, size: 34, font: fontBold, color: white,
  });

  // ── META ROWS ──
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

  y = height - 4 - headerH - 30;

  // ── BILL TO + AMOUNT BAND ──
  const bandH = 105;

  page.drawRectangle({ x: margin, y: y - bandH, width: contentW * 0.50, height: bandH, color: lightGray });
  page.drawRectangle({ x: margin, y: y - bandH, width: 3, height: bandH, color: accentColor });

  let billY = y - 16;
  page.drawText('BILL TO', { x: margin + 10, y: billY, size: 7, font: fontBold, color: accentColor });
  billY -= 14;
  page.drawText(data.customerName, { x: margin + 10, y: billY, size: 13, font: fontBold, color: black });
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

  // ── AMOUNT DUE BOX ──
  const boxX = margin + contentW * 0.55;
  const boxW = contentW * 0.45;

  page.drawRectangle({ x: boxX, y: y - bandH, width: boxW, height: bandH, color: offWhite });
  page.drawRectangle({ x: boxX, y: y - 1, width: boxW, height: 3, color: accentColor });

    let boxY = y - 18;
  if (isPaidInFull) {
    page.drawText('PAID IN FULL', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: accent2Color });
    boxY -= 24;
    page.drawText(fmt(data.total), { x: boxX + 14, y: boxY, size: 28, font: fontBold, color: accent2Color });
    boxY -= 18;
    page.drawText('Balance: $0.00', { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
  } else if (hasPartialPayment) {
    page.drawText('BALANCE DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: gray });
    boxY -= 24;
    page.drawText(fmt(balanceDue), { x: boxX + 14, y: boxY, size: 28, font: fontBold, color: accentColor });
    boxY -= 18;
    page.drawText(`of ${fmt(data.total)} total`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
    boxY -= 12;
    page.drawText(`Paid: ${fmt(data.amountPaid ?? 0)}`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
  } else if (hasDepositDue) {
    page.drawText('DEPOSIT DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: gray });
    boxY -= 24;
    page.drawText(fmt(depositDue), { x: boxX + 14, y: boxY, size: 28, font: fontBold, color: accentColor });
    boxY -= 18;
    page.drawText(`of ${fmt(data.total)} total`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
    boxY -= 12;
    page.drawText(`Balance on completion: ${fmt(data.total - depositDue)}`, {
      x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray,
    });
  } else {
    page.drawText('AMOUNT DUE', { x: boxX + 14, y: boxY, size: 7.5, font: fontBold, color: gray });
    boxY -= 26;
    page.drawText(fmt(data.total), { x: boxX + 14, y: boxY, size: 28, font: fontBold, color: accentColor });
    boxY -= 18;
    if (data.dueDate) {
      page.drawText(`Due ${data.dueDate}`, { x: boxX + 14, y: boxY, size: 7.5, font: fontRegular, color: gray });
    }
  }

  y = y - bandH - 18;

 drawTableHeader();

  // ── LINE ITEMS (paginated) ──
  for (let i = 0; i < data.lineItems.length; i++) {
    // Break before drawing, so a row is never half-painted at the page edge.
    ensureSpace(19);

    const item = data.lineItems[i];
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 5, width: contentW, height: 17, color: lightGray });
    }
    page.drawRectangle({ x: margin, y: y - 7, width: contentW, height: 0.5, color: mutedGray });

    page.drawText(fitText(item.description || '', fontRegular, 10, descMaxW), {
      x: colDesc, y, size: 10, font: fontRegular, color: black,
    });
    page.drawText(String(item.quantity ?? 1), { x: colQty, y, size: 10, font: fontRegular, color: gray });
    page.drawText(item.unitPrice ? fmt(item.unitPrice) : '-', { x: colUnit, y, size: 10, font: fontRegular, color: gray });
    drawRightAligned(page, fmt(item.amount), colAmt, y, 10, fontBold, darkGray);

    y -= 19;
  }

y -= 6;
  page.drawRectangle({ x: margin, y, width: contentW, height: 0.5, color: mutedGray });
  y -= 20;

  // The QR block below lives in the left column (x = margin); everything
  // from here through the totals box only occupies the right column
  // (x = totalsX rightward). Gating the QR's page-fit check on the shared
  // `y` cursor treated right-column-only content as if it filled the left
  // column too, forcing an unnecessary second page while the left column
  // sat empty. Track the left column's real remaining space separately.
  let leftColumnY = y;

// ── TOTALS ──
  // Reserve the whole block so it can't straddle a page break.
  const breakdownExtra =
    data.paymentBreakdown && data.paymentBreakdown.length > 1 ? (data.paymentBreakdown.length - 1) * 14 : 0;
  ensureSpace((isPaidInFull || hasPartialPayment || hasDepositDue ? 150 : 120) + breakdownExtra);
  
  const totalsX = margin + contentW * 0.55;
  const totalsW = contentW * 0.45;
  const totalsRight = totalsX + totalsW - 10;
  const taxRate = data.taxRate ?? 0;
  // Line item amounts are pre-tax, so their sum is the true subtotal —
  // data.total (quote_total) already has tax baked in from when it was saved.
  const subtotal = data.lineItems.reduce((s, i) => s + (i.amount || 0), 0);
  const taxAmount = subtotal * (taxRate / 100);

  page.drawText('Subtotal', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
  drawRightAligned(page, fmt(subtotal), totalsRight, y, 9, fontRegular, gray);
  y -= 14;

  if (taxRate > 0) {
    page.drawText(`Tax (${taxRate}%)`, { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
    drawRightAligned(page, fmt(taxAmount), totalsRight, y, 9, fontRegular, gray);
    y -= 14;
  }

    if (isPaidInFull || hasPartialPayment) {
    if (data.paymentBreakdown && data.paymentBreakdown.length > 0) {
      for (const payment of data.paymentBreakdown) {
        const label = payment.date ? `${payment.label} — ${payment.date}` : payment.label;
        page.drawText(label, { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
        drawRightAligned(page, `- ${fmt(payment.amount)}`, totalsRight, y, 9, fontRegular, gray);
        y -= 14;
      }
    } else {
      page.drawText('Amount Paid', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
      drawRightAligned(page, `- ${fmt(data.amountPaid ?? 0)}`, totalsRight, y, 9, fontRegular, gray);
      y -= 14;
    }
  }

  if (hasDepositDue) {
    page.drawText('Project Total', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
    drawRightAligned(page, fmt(data.total), totalsRight, y, 9, fontRegular, gray);
    y -= 14;
    page.drawText('Balance on Completion', { x: totalsX + 10, y, size: 9, font: fontRegular, color: gray });
    drawRightAligned(page, fmt(data.total - depositDue), totalsRight, y, 9, fontRegular, gray);
    y -= 14;
  }

  y -= 6;
  page.drawRectangle({ x: totalsX, y, width: totalsW, height: 0.5, color: mutedGray });
  y -= 56;

  page.drawRectangle({ x: totalsX, y: y - 10, width: totalsW, height: 48, color: offWhite });
  page.drawRectangle({ x: totalsX, y: y + 38, width: totalsW, height: 3, color: accentColor });
 page.drawText(
    isPaidInFull ? 'PAID IN FULL' : hasPartialPayment ? 'BALANCE DUE' : hasDepositDue ? 'DEPOSIT DUE NOW' : 'TOTAL DUE',
    { x: totalsX + 10, y: y + 18, size: 8, font: fontBold, color: isPaidInFull ? accent2Color : gray }
  );
  drawRightAligned(page, fmt(amountDueNow), totalsRight, y + 6, 18, fontBold, isPaidInFull ? accent2Color : darkGray);
  y -= 24;

  // ── NOTES ──
  if (data.notes) {
    const yBeforeNotes = y;
    y -= 10;
    page.drawRectangle({ x: margin, y: y - 65, width: contentW, height: 70, color: lightGray });
    page.drawRectangle({ x: margin, y: y + 4, width: contentW, height: 3, color: accentColor });
    y -= 18;
    page.drawText('NOTES', { x: margin + 10, y, size: 7.5, font: fontBold, color: gray });
    y -= 13;
    const words = data.notes.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (fontRegular.widthOfTextAtSize(test, 9) > contentW - 20) {
        page.drawText(line, { x: margin + 10, y, size: 9, font: fontRegular, color: black });
        y -= 13;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) page.drawText(line, { x: margin + 10, y, size: 9, font: fontRegular, color: black });
    // Unlike totals, notes span the full page width — they really do
    // consume left-column space, so mirror the drop onto leftColumnY too.
    leftColumnY -= (yBeforeNotes - y);
  }

  // ── QR CODE ──
  if (data.paymentLinkUrl && !isPaidInFull) {
        try {
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(data.paymentLinkUrl, {
        width: 80, margin: 1, errorCorrectionLevel: 'M',
      });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBytes  = Buffer.from(qrBase64, 'base64');
      const qrImage  = await doc.embedPng(qrBytes);
      const qrSize   = 60;
      // If content ran near the bottom, give the QR its own page rather than
      // painting it over the totals.
      if (leftColumnY < BOTTOM_LIMIT + qrSize + 40) addContinuationPage();
            const qrX      = margin;
      const qrY      = BOTTOM_LIMIT + 12;

      page.drawRectangle({ x: qrX - 8, y: qrY - 8, width: qrSize + 140, height: qrSize + 24, color: lightGray });
      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      page.drawText('Scan QR to Pay', {
        x: qrX + qrSize + 10, y: qrY + 48, size: 10, font: fontBold, color: black,
      });
      page.drawText(fmt(amountDueNow), {
        x: qrX + qrSize + 10, y: qrY + 32, size: 14, font: fontBold, color: accentColor,
      });
      
    } catch { /* silent */ }
  }

 // ── FOOTER on every page, with page numbers when there's more than one ──
  const footerParts = [
    'Thank you for your business',
    ...(data.companyPhone ? [`Questions? ${formatPhone(data.companyPhone)}`] : []),
    ...(data.companyEmail ? [data.companyEmail] : []),
  ];
  const footerText = footerParts.join('  •  ');

    pages.forEach((p, i) => {
    // PAID watermark — large, rotated, low-opacity, centered on every page.
    if (isPaidInFull) {
      const watermarkText = 'PAID';
      const watermarkSize = 110;
      const angle = Math.PI / 4;
      const textW = fontBold.widthOfTextAtSize(watermarkText, watermarkSize);
      const cx = width / 2;
      const cy = height / 2;
      const anchorX = cx - (textW / 2) * Math.cos(angle);
      const anchorY = cy - (textW / 2) * Math.sin(angle) - watermarkSize * 0.35;
      p.drawText(watermarkText, {
        x: anchorX,
        y: anchorY,
        size: watermarkSize,
        font: fontBold,
        color: accent2Color,
        opacity: 0.16,
        rotate: degrees(45),
      });
    }

    p.drawRectangle({ x: 0, y: 0, width, height: FOOTER_H, color: headerColor });
    p.drawText(footerText, {
      x: margin, y: 13, size: 8, font: fontRegular, color: rgb(0.6, 0.65, 0.72),
    });
    if (pages.length > 1) {
      drawRightAligned(p, `Page ${i + 1} of ${pages.length}`, width - margin, 13, 8, fontRegular, rgb(0.6, 0.65, 0.72));
    }
  });

  return await doc.save();
}