import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './currency.js'
import { formatDate } from './date.js'
import { normalizeStatus } from './paymentStatus.js'

/**
 * Cache for high-resolution Bangladeshi Taka (৳) canvas stamps.
 * Generates crisp 300+ DPI glyph graphics matching exact color.
 */
const takaIconCache = new Map()

export function getTakaIconDataUrl(color = '#1e293b') {
  if (takaIconCache.has(color)) {
    return takaIconCache.get(color)
  }
  try {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 128, 128)
    ctx.fillStyle = color
    ctx.font = 'bold 96px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Render authentic Bangladeshi Taka symbol '৳' (\u09F3)
    ctx.fillText('\u09F3', 64, 68)
    const dataUrl = canvas.toDataURL('image/png')
    takaIconCache.set(color, dataUrl)
    return dataUrl
  } catch (e) {
    console.warn('Could not generate Taka canvas icon:', e)
    return null
  }
}

/**
 * Draws the official Bangladeshi Taka symbol (৳) followed by formatted currency
 * e.g., ৳ 1,500.00 with perfect alignment and zero character corruption.
 */
export function drawFormattedCurrency(doc, amount, x, y, options = {}) {
  const {
    fontSize = 8.5,
    fontStyle = 'normal',
    color = '#1e293b',
    align = 'left'
  } = options

  const num = Number(amount || 0)
  const numStr = num.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  doc.setFontSize(fontSize)
  doc.setFont('helvetica', fontStyle)

  if (Array.isArray(color)) {
    doc.setTextColor(color[0], color[1], color[2])
  } else if (typeof color === 'string') {
    doc.setTextColor(color)
  }

  const numWidth = doc.getTextWidth(numStr)
  const iconH = fontSize * 0.38
  const iconW = iconH * 0.9
  const gap = 0.8
  const totalWidth = iconW + gap + numWidth

  let startX = x
  if (align === 'right') {
    startX = x - totalWidth
  } else if (align === 'center') {
    startX = x - (totalWidth / 2)
  }

  const hexColor = Array.isArray(color)
    ? '#' + color.map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')
    : color

  const iconUrl = getTakaIconDataUrl(hexColor)
  if (iconUrl) {
    doc.addImage(iconUrl, 'PNG', startX, y - (iconH * 0.85), iconW, iconH)
    doc.text(numStr, startX + iconW + gap, y)
  } else {
    doc.text(`৳ ${numStr}`, startX, y)
  }

  return totalWidth
}

/**
 * Generate Admin Consolidated Monthly Report for all 36 flats
 * Formatted with professional accounting standards, correct field names, and ৳ currency
 */
export function generateAdminMonthlyPdf({ month, year, flats = [], summary = {} }) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Top branding header banner
  doc.setFillColor(15, 23, 42) // Slate 900
  doc.rect(0, 0, pageWidth, 24, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIQUE CASTLE - APARTMENT RESIDENTIAL MANAGEMENT', 14, 11)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(203, 213, 225) // Slate 300
  doc.text(`Consolidated Monthly Service Charge & Payment Audit Report  |  Billing Period: ${month} ${year}`, 14, 18)

  const genDate = new Date().toLocaleString('en-GB')
  doc.text(`Generated: ${genDate}`, pageWidth - 14, 18, { align: 'right' })

  // Summary Metrics Bar
  const totalFlats = summary.totalFlats || flats.length || 36
  const paidCount = summary.paidFlats ?? flats.filter(f => normalizeStatus(f.status) === 'Paid').length
  const pendingCount = summary.pendingFlats ?? flats.filter(f => normalizeStatus(f.status) === 'Pending Verification').length
  const unpaidCount = summary.notPaidFlats ?? Math.max(0, totalFlats - paidCount - pendingCount)

  const totalBilled = summary.totalBilled ?? flats.reduce((acc, f) => acc + Number(f.totalCharge || 0), 0)
  const totalCollected = summary.totalCollected ?? flats
    .filter(f => normalizeStatus(f.status) === 'Paid')
    .reduce((acc, f) => acc + Number(f.paidAmount || f.totalCharge || 0), 0)
  const totalPending = summary.totalPending ?? flats
    .filter(f => normalizeStatus(f.status) === 'Pending Verification')
    .reduce((acc, f) => acc + Number(f.totalCharge || 0), 0)
  const totalOutstanding = summary.totalOutstanding ?? Math.max(0, totalBilled - totalCollected)

  // Top 8 KPI Cards
  const kpis = [
    { label: 'Total Units', value: `${totalFlats} Flats`, color: '#0f172a' },
    { label: 'Verified Paid', value: `${paidCount} Flats`, color: '#059669' },
    { label: 'Pending Review', value: `${pendingCount} Flats`, color: '#d97706' },
    { label: 'Unpaid Dues', value: `${unpaidCount} Flats`, color: '#e11d48' },
    { label: 'Total Billed', amount: totalBilled, color: '#1e293b' },
    { label: 'Total Collected', amount: totalCollected, color: '#059669' },
    { label: 'Total Pending', amount: totalPending, color: '#d97706' },
    { label: 'Net Outstanding', amount: totalOutstanding, color: '#e11d48' }
  ]

  const cardWidth = (pageWidth - 28 - (kpis.length - 1) * 2.5) / kpis.length
  let curX = 14
  const cardY = 27
  const cardH = 14

  kpis.forEach(kpi => {
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(curX, cardY, cardWidth, cardH, 1.5, 1.5, 'FD')

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(kpi.label, curX + 3, cardY + 4.5)

    if (kpi.amount !== undefined) {
      drawFormattedCurrency(doc, kpi.amount, curX + 3, cardY + 10.5, {
        fontSize: 7.5,
        fontStyle: 'bold',
        color: kpi.color,
        align: 'left'
      })
    } else {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(kpi.color)
      doc.text(kpi.value, curX + 3, cardY + 10.5)
    }

    curX += cardWidth + 2.5
  })

  // Table Columns with full descriptive titles and (৳) symbol
  const tableHeaders = [
    [
      '#',
      'Flat Unit',
      'Resident / Owner Name',
      'Water (৳)',
      'Caretaker (৳)',
      'Waste (৳)',
      'Lift (৳)',
      'Power (৳)',
      'Other (৳)',
      'Total Billed (৳)',
      'Amount Paid (৳)',
      'Due Balance (৳)',
      'Sender / TrxID',
      'Verification Status'
    ]
  ]

  // Accumulate column sums for grand total footer row
  // Accumulate column sums for grand total footer row
  let sumWater = 0
  let hasWater = false
  let sumCaretaker = 0
  let hasCaretaker = false
  let sumWaste = 0
  let hasWaste = false
  let sumLift = 0
  let hasLift = false
  let sumPower = 0
  let hasPower = false
  let sumOther = 0
  let hasOther = false
  let sumBilled = 0
  let sumPaid = 0
  let sumDue = 0

  const tableRows = flats.map((flat, idx) => {
    const status = normalizeStatus(flat.status)
    const breakdown = flat.breakdown ?? null

    const water = breakdown?.water != null ? Number(breakdown.water) : null
    const caretaker = breakdown?.caretaker != null ? Number(breakdown.caretaker) : null
    const waste = breakdown?.waste != null ? Number(breakdown.waste) : null
    const lift = breakdown?.lift != null ? Number(breakdown.lift) : null
    const power = breakdown?.electricity != null ? Number(breakdown.electricity) : null
    const other = breakdown?.other != null ? Number(breakdown.other) : null

    const total = Number(flat.totalCharge || 0)
    const paid = status === 'Paid' ? Number(flat.paidAmount || total) : 0
    const due = Math.max(0, total - paid)

    if (water != null) { sumWater += water; hasWater = true; }
    if (caretaker != null) { sumCaretaker += caretaker; hasCaretaker = true; }
    if (waste != null) { sumWaste += waste; hasWaste = true; }
    if (lift != null) { sumLift += lift; hasLift = true; }
    if (power != null) { sumPower += power; hasPower = true; }
    if (other != null) { sumOther += other; hasOther = true; }
    sumBilled += total
    sumPaid += paid
    sumDue += due

    const trxInfo = flat.transactionId
      ? `${flat.transactionId}\n${flat.phoneNumber || ''}`
      : (flat.phoneNumber || '—')

    return [
      idx + 1,
      flat.flatNumber || '—',
      flat.ownerName || '—',
      water != null ? formatCurrency(water, false) : '—',
      caretaker != null ? formatCurrency(caretaker, false) : '—',
      waste != null ? formatCurrency(waste, false) : '—',
      lift != null ? formatCurrency(lift, false) : '—',
      power != null ? formatCurrency(power, false) : '—',
      other != null ? formatCurrency(other, false) : '—',
      formatCurrency(total, false),
      formatCurrency(paid, false),
      formatCurrency(due, false),
      trxInfo,
      status
    ]
  })

  // Grand total summary footer row
  const tableFoot = [
    [
      'Totals',
      '36 Flats',
      'Consolidated Totals',
      hasWater ? formatCurrency(sumWater, false) : '—',
      hasCaretaker ? formatCurrency(sumCaretaker, false) : '—',
      hasWaste ? formatCurrency(sumWaste, false) : '—',
      hasLift ? formatCurrency(sumLift, false) : '—',
      hasPower ? formatCurrency(sumPower, false) : '—',
      hasOther ? formatCurrency(sumOther, false) : '—',
      formatCurrency(sumBilled, false),
      formatCurrency(sumPaid, false),
      formatCurrency(sumDue, false),
      '—',
      `${paidCount} Paid • ${pendingCount} Pend.`
    ]
  ]

  autoTable(doc, {
    head: tableHeaders,
    body: tableRows,
    foot: tableFoot,
    startY: 44,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      font: 'helvetica',
      valign: 'middle',
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    footStyles: {
      fillColor: [241, 245, 249], // Slate 100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'right'
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
      2: { cellWidth: 32 },
      3: { cellWidth: 14, halign: 'right' },
      4: { cellWidth: 15, halign: 'right' },
      5: { cellWidth: 14, halign: 'right' },
      6: { cellWidth: 14, halign: 'right' },
      7: { cellWidth: 14, halign: 'right' },
      8: { cellWidth: 14, halign: 'right' },
      9: { cellWidth: 19, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 19, halign: 'right' },
      11: { cellWidth: 19, halign: 'right' },
      12: { cellWidth: 28, halign: 'center', fontSize: 6.5 },
      13: { cellWidth: 26, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        if (data.column.index === 10) {
          const val = Number(data.row.raw[10].replace(/,/g, ''))
          if (val > 0) data.cell.styles.textColor = [5, 150, 105] // Emerald
        }
        if (data.column.index === 11) {
          const val = Number(data.row.raw[11].replace(/,/g, ''))
          if (val > 0) data.cell.styles.textColor = [225, 29, 72] // Rose
        }
        if (data.column.index === 13) {
          const val = data.cell.raw
          if (val === 'Paid') {
            data.cell.styles.textColor = [5, 150, 105] // Emerald
          } else if (val === 'Pending Verification') {
            data.cell.styles.textColor = [217, 119, 6] // Amber
          } else {
            data.cell.styles.textColor = [225, 29, 72] // Rose
          }
        }
      }
      if (data.section === 'foot') {
        if (data.column.index === 0 || data.column.index === 1) {
          data.cell.styles.halign = 'center'
        } else if (data.column.index === 2) {
          data.cell.styles.halign = 'left'
        } else if (data.column.index === 10) {
          data.cell.styles.textColor = [5, 150, 105]
        } else if (data.column.index === 11) {
          data.cell.styles.textColor = [225, 29, 72]
        } else if (data.column.index === 13) {
          data.cell.styles.halign = 'center'
        }
      }
    },
    didDrawPage: function(data) {
      const totalPages = doc.internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Unique Castle Apartment Management • Page ${data.pageNumber} of ${totalPages} • All monetary values in Bangladeshi Taka (৳)`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      )
    }
  })

  // Final Financial Reconciliation Summary block
  const finalY = (doc).lastAutoTable.finalY + 6
  if (finalY + 28 < pageHeight) {
    // Summary box
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(pageWidth - 120, finalY, 106, 25, 2, 2, 'FD')

    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'bold')
    doc.text('FINANCIAL RECONCILIATION AUDIT SUMMARY', pageWidth - 116, finalY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105)
    doc.text('Total Monthly Service Charge Billed:', pageWidth - 116, finalY + 10)
    drawFormattedCurrency(doc, sumBilled, pageWidth - 18, finalY + 10, {
      fontSize: 7.5,
      fontStyle: 'bold',
      color: '#0f172a',
      align: 'right'
    })

    doc.text('Total Amount Collected (Verified):', pageWidth - 116, finalY + 15)
    drawFormattedCurrency(doc, sumPaid, pageWidth - 18, finalY + 15, {
      fontSize: 7.5,
      fontStyle: 'bold',
      color: '#059669',
      align: 'right'
    })

    doc.text('Total Pending Verification (Unconfirmed):', pageWidth - 116, finalY + 20)
    drawFormattedCurrency(doc, totalPending, pageWidth - 18, finalY + 20, {
      fontSize: 7.5,
      fontStyle: 'bold',
      color: '#d97706',
      align: 'right'
    })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(225, 29, 72)
    doc.text('Total Net Outstanding Due Balance:', pageWidth - 116, finalY + 24.5)
    drawFormattedCurrency(doc, sumDue, pageWidth - 18, finalY + 24.5, {
      fontSize: 8,
      fontStyle: 'bold',
      color: '#e11d48',
      align: 'right'
    })

    // Certification signature placeholder on bottom left
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text('Audit Prepared By: Unique Castle Management Committee', 14, finalY + 10)
    doc.text('Verification Authority: Super Admin Official Records', 14, finalY + 15)
    doc.setDrawColor(203, 213, 225)
    doc.line(14, finalY + 23, 80, finalY + 23)
    doc.text('Authorized Signature & Official Stamp', 14, finalY + 26)
  }

  doc.save(`Unique_Castle_Monthly_Report_${month}_${year}.pdf`)
}

/**
 * Generate Owner Individual Monthly Service Charge Receipt / Statement
 * Formatted with clear itemized breakdown, authentic ৳ symbol, and payment status
 */
export function generateOwnerMonthlyPdf({ owner, flatNumber, month, year, bill = {}, payment = {} }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Top header banner
  doc.setFillColor(15, 23, 42) // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIQUE CASTLE APARTMENTS', 14, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(203, 213, 225)
  doc.text('Apartment Service Charge & Utility Management Portal', 14, 18)
  doc.text(`Official Monthly Service Charge Statement  |  Billing Period: ${month} ${year}`, 14, 24)

  const genDate = new Date().toLocaleString('en-GB')
  doc.text(`Printed: ${genDate}`, pageWidth - 14, 24, { align: 'right' })

  // Owner & Flat Details Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, 34, pageWidth - 28, 28, 2, 2, 'FD')

  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)

  doc.setFont('helvetica', 'bold')
  doc.text('RESIDENT & APARTMENT DETAILS', 20, 41)
  doc.setFont('helvetica', 'normal')
  doc.text(`Resident / Owner Name: ${owner?.name || owner?.username || 'Resident Owner'}`, 20, 47)
  doc.text(`Apartment Flat Unit: Flat ${flatNumber || owner?.flatNumber || '—'}`, 20, 53)
  doc.text(`Registered Contact Mobile: ${owner?.phone || owner?.phoneNumber || '—'}`, 20, 59)

  doc.setFont('helvetica', 'bold')
  doc.text('STATEMENT & PAYMENT STATUS', 115, 41)
  doc.setFont('helvetica', 'normal')
  doc.text(`Billing Cycle: ${month} ${year}`, 115, 47)
  const status = normalizeStatus(payment?.status || bill?.status)
  doc.text(`Verification Status: ${status}`, 115, 53)
  doc.text(`bKash Transaction ID: ${payment?.transactionId || bill?.transactionId || 'None submitted'}`, 115, 59)

  // Service Charge Breakdown Table
  const breakdown = bill.breakdown ?? null
  const hasBreakdown = Boolean(
    breakdown && (
      breakdown.water != null || breakdown.caretaker != null || breakdown.waste != null ||
      breakdown.lift != null || breakdown.electricity != null || breakdown.other != null
    )
  )

  const totalCharge = Number(bill.totalCharge || 0)
  const paidAmount = status === 'Paid'
    ? Number(payment.paidAmount ?? bill.paidAmount ?? totalCharge)
    : 0
  const outstanding = Math.max(0, totalCharge - paidAmount)

  // Use only actual values from database; never substitute fabricated amounts
  const items = (hasBreakdown ? [
    ...(breakdown.water != null ? [{ name: 'Water Bills', amount: Number(breakdown.water) }] : []),
    ...(breakdown.caretaker != null ? [{ name: 'Caretaker Fee', amount: Number(breakdown.caretaker) }] : []),
    ...(breakdown.waste != null ? [{ name: 'Waste Bills', amount: Number(breakdown.waste) }] : []),
    ...(breakdown.lift != null ? [{ name: 'Lift Maintenance', amount: Number(breakdown.lift) }] : []),
    ...(breakdown.electricity != null ? [{ name: 'Electricity & Generator (Common)', amount: Number(breakdown.electricity) }] : []),
    ...(breakdown.other != null ? [{ name: 'Others', amount: Number(breakdown.other) }] : [])
  ] : [])

  if (items.length === 0) {
    items.push({ name: 'Monthly Service Charge (Itemized breakdown unavailable in database)', amount: totalCharge })
  }

  const rows = items.map((item, idx) => [
    idx + 1,
    item.name,
    formatCurrency(item.amount, false)
  ])

  autoTable(doc, {
    head: [['#', 'Service Charge Component & Description', 'Monthly Rate']],
    body: rows,
    startY: 68,
    theme: 'striped',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 130 },
      2: { cellWidth: 42, halign: 'right', fontStyle: 'bold' }
    },
    didDrawCell: function(data) {
      if (data.section === 'body' && data.column.index === 2) {
        // Draw the ৳ symbol icon next to the number
        const amt = items[data.row.index]?.amount || 0
        const cellX = data.cell.x + data.cell.width - 4
        const cellY = data.cell.y + (data.cell.height / 2) + 1.2
        // AutoTable already drawn text, we clear or overlay with formatted currency
        doc.setFillColor(data.row.index % 2 === 0 ? 255 : 248, data.row.index % 2 === 0 ? 255 : 250, data.row.index % 2 === 0 ? 255 : 252)
        doc.rect(data.cell.x + 2, data.cell.y + 1, data.cell.width - 4, data.cell.height - 2, 'F')
        drawFormattedCurrency(doc, amt, cellX, cellY, {
          fontSize: 8.5,
          fontStyle: 'bold',
          color: '#1e293b',
          align: 'right'
        })
      }
    }
  })

  // Summary Cards below table
  const finalY = (doc).lastAutoTable.finalY + 6

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(pageWidth - 100, finalY, 86, 32, 2, 2, 'FD')

  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)

  doc.text('Total Monthly Bill:', pageWidth - 94, finalY + 8)
  drawFormattedCurrency(doc, totalCharge, pageWidth - 18, finalY + 8, {
    fontSize: 8.5,
    fontStyle: 'bold',
    color: '#0f172a',
    align: 'right'
  })

  doc.text('Total Amount Paid:', pageWidth - 94, finalY + 16)
  drawFormattedCurrency(doc, paidAmount, pageWidth - 18, finalY + 16, {
    fontSize: 8.5,
    fontStyle: 'bold',
    color: paidAmount > 0 ? '#059669' : '#94a3b8',
    align: 'right'
  })

  doc.setFont('helvetica', 'bold')
  doc.text('Outstanding Due Balance:', pageWidth - 94, finalY + 24)
  drawFormattedCurrency(doc, outstanding, pageWidth - 18, finalY + 24, {
    fontSize: 9,
    fontStyle: 'bold',
    color: outstanding > 0 ? '#e11d48' : '#059669',
    align: 'right'
  })

  // Payment Verification note box
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(14, finalY + 38, pageWidth - 28, 26, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(51, 65, 85)
  doc.text('OFFICIAL PAYMENT VERIFICATION & AUDIT RECORD', 20, finalY + 44)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`bKash Sender Mobile: ${payment.phoneNumber || bill.phoneNumber || '—'}`, 20, finalY + 50)
  doc.text(`Transaction Reference (TrxID): ${payment.transactionId || bill.transactionId || 'None submitted'}`, 20, finalY + 56)
  doc.text(`Verification Timestamp: ${formatDate(payment.verifiedAt || payment.updatedAt || bill.updatedAt, true)}`, 20, finalY + 62)

  // Footer
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text(
    'This is an authentic, computer-generated monthly statement issued by Unique Castle Apartment Management.',
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  )

  doc.save(`Unique_Castle_Statement_${flatNumber || 'Flat'}_${month}_${year}.pdf`)
}
