/**
 * Payment status normalization and UI helper
 * Normalizes backend values (e.g., 'PAID', 'Y', 'COMPLETED', 'NOT_PAID', 'N', 'UNPAID', 'PENDING', 'P', 'PENDING_VERIFICATION', 'REJECTED')
 */

export const STATUS_TYPES = {
  PAID: 'Paid',
  NOT_PAID: 'Not Paid',
  PENDING_VERIFICATION: 'Pending Verification',
  REJECTED: 'Rejected',
  EXEMPT: 'Exempt (Not Moved In)'
}

export function normalizeStatus(rawStatus) {
  if (rawStatus === null || rawStatus === undefined || rawStatus === '') {
    return STATUS_TYPES.NOT_PAID
  }

  const s = String(rawStatus).trim().toUpperCase()
  const clean = s.replace(/[\s_-]+/g, '_')

  if (
    clean.includes('EXEMPT') ||
    clean.includes('NOT_MOVED_IN') ||
    clean.includes('INELIGIBLE')
  ) {
    return STATUS_TYPES.EXEMPT
  }

  if (
    clean === 'PAID' ||
    clean === 'Y' ||
    clean === 'YES' ||
    clean === 'TRUE' ||
    clean === '1' ||
    clean === 'VERIFIED' ||
    clean === 'SUCCESS' ||
    clean === 'COMPLETED'
  ) {
    return STATUS_TYPES.PAID
  }

  if (
    clean === 'PENDING' ||
    clean === 'P' ||
    clean === 'PENDING_VERIFICATION' ||
    clean === 'AWAITING_VERIFICATION' ||
    clean === 'SUBMITTED' ||
    clean === 'IN_REVIEW' ||
    clean === 'UNDER_REVIEW' ||
    clean === 'UNVERIFIED' ||
    clean.includes('PENDING')
  ) {
    return STATUS_TYPES.PENDING_VERIFICATION
  }

  if (
    clean === 'REJECTED' ||
    clean === 'REJECT' ||
    clean === 'R' ||
    clean === 'FAILED' ||
    clean === 'DECLINED' ||
    clean === 'CANCELLED' ||
    clean === 'CANCELED'
  ) {
    return STATUS_TYPES.REJECTED
  }

  return STATUS_TYPES.NOT_PAID
}

export function getStatusBadgeConfig(status) {
  const normalized = normalizeStatus(status)

  switch (normalized) {
    case STATUS_TYPES.EXEMPT:
      return {
        label: 'Exempt (Not Moved In)',
        normalized,
        bgClass: 'bg-indigo-50/80 text-indigo-700 border-indigo-200 ring-indigo-500/20',
        dotClass: 'bg-indigo-400',
        icon: 'clock'
      }
    case STATUS_TYPES.PAID:
      return {
        label: 'Paid',
        normalized,
        bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
        dotClass: 'bg-emerald-500',
        icon: 'check-circle'
      }
    case STATUS_TYPES.PENDING_VERIFICATION:
      return {
        label: 'Pending Verification',
        normalized,
        bgClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        dotClass: 'bg-amber-500',
        icon: 'clock'
      }
    case STATUS_TYPES.REJECTED:
      return {
        label: 'Rejected',
        normalized,
        bgClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
        dotClass: 'bg-rose-500',
        icon: 'x-circle'
      }
    case STATUS_TYPES.NOT_PAID:
    default:
      return {
        label: 'Not Paid',
        normalized: STATUS_TYPES.NOT_PAID,
        bgClass: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-400/20',
        dotClass: 'bg-slate-400',
        icon: 'alert-circle'
      }
  }
}
