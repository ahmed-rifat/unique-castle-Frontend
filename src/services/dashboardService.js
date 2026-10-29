import apiClient from './api.js'
import { serviceFeeService } from './serviceFeeService.js'
import { memberService } from './memberService.js'
import { normalizeStatus, STATUS_TYPES } from '../utils/paymentStatus.js'
import { getMonthIndex, getCurrentMonth, getCurrentYear, MONTH_NAMES } from '../utils/date.js'

export const ALL_36_FLATS = [
  '1A', '1B', '1C', '1D',
  '2A', '2B', '2C', '2D',
  '3A', '3B', '3C', '3D',
  '4A', '4B', '4C', '4D',
  '5A', '5B', '5C', '5D',
  '6A', '6B', '6C', '6D',
  '7A', '7B', '7C', '7D',
  '8A', '8B', '8C', '8D',
  '9A', '9B', '9C', '9D'
]

/**
 * Normalizes backend FlatResponseData to the frontend's unified model
 */
function mapFlatResponse(item, billingMonth, billingYear) {
  // Support nested payment objects if backend embeds ServiceFeePayment
  const paymentObj = item.serviceFeePayment || item.payment || item.serviceFeePaymentResponseData || {}

  const rawPaid = item.paid ?? item.status ?? item.paymentStatus ?? item.paidStatus ?? paymentObj.paid ?? paymentObj.status
  let status = normalizeStatus(rawPaid)

  const transactionId = item.transactionId || paymentObj.transactionId || item.trxId || item.txId || null
  const phoneNumber = item.phoneNumber || item.contact || paymentObj.phoneNumber || item.phone || null
  const paymentDate = item.paidDate || item.paymentDate || paymentObj.paidDate || paymentObj.paymentDate || null
  const paymentMethod = item.paymentMethod || paymentObj.paymentMethod || 'bKash'

  // If a transactionId is present and the status is not Paid or Rejected,
  // it is awaiting Super Admin verification
  if (
    status !== STATUS_TYPES.PAID &&
    status !== STATUS_TYPES.REJECTED &&
    transactionId &&
    String(transactionId).trim().length > 0
  ) {
    status = STATUS_TYPES.PENDING_VERIFICATION
  }

  const totalCharge = item.totalAmount != null
    ? Number(item.totalAmount)
    : (item.totalCharge != null
      ? Number(item.totalCharge)
      : (item.amount != null
        ? Number(item.amount)
        : (item.serviceFee?.totalAmount != null
          ? Number(item.serviceFee.totalAmount)
          : (item.serviceFee?.amount != null
            ? Number(item.serviceFee.amount)
            : (item.serviceCharge != null
              ? Number(item.serviceCharge)
              : (item.serviceFeeAmount != null ? Number(item.serviceFeeAmount) : 2500))))))

  const isPaid = status === STATUS_TYPES.PAID
  const isPending = status === STATUS_TYPES.PENDING_VERIFICATION
  // Only verified Paid records contribute to paidAmount; pending verification is awaiting admin review
  const paidAmount = item.paidAmount != null
    ? Number(item.paidAmount)
    : (isPaid ? totalCharge : 0)

  const flatNumber = item.flatNumber || item.flat_number || item.flatNo || item.flat || item.unitNumber || paymentObj.flatNumber || '—'

  const feeObj = item.serviceFee || {}
  const hasFeeComponents = (
    item.waterFee != null || feeObj.waterFee != null ||
    item.caretakerFee != null || feeObj.caretakerFee != null ||
    item.wasteFee != null || feeObj.wasteFee != null ||
    item.liftFee != null || feeObj.liftFee != null ||
    item.electricityFee != null || feeObj.electricityFee != null ||
    item.otherFee != null || feeObj.otherFee != null
  )

  const breakdown = item.breakdown || feeObj.breakdown || (hasFeeComponents ? {
    water: item.waterFee != null ? Number(item.waterFee) : (feeObj.waterFee != null ? Number(feeObj.waterFee) : null),
    caretaker: item.caretakerFee != null ? Number(item.caretakerFee) : (feeObj.caretakerFee != null ? Number(feeObj.caretakerFee) : null),
    waste: item.wasteFee != null ? Number(item.wasteFee) : (feeObj.wasteFee != null ? Number(feeObj.wasteFee) : null),
    lift: item.liftFee != null ? Number(item.liftFee) : (feeObj.liftFee != null ? Number(feeObj.liftFee) : null),
    electricity: item.electricityFee != null ? Number(item.electricityFee) : (feeObj.electricityFee != null ? Number(feeObj.electricityFee) : null),
    other: item.otherFee != null ? Number(item.otherFee) : (feeObj.otherFee != null ? Number(feeObj.otherFee) : null)
  } : null)

  return {
    flatId: item.flatId || item.id,
    serviceFeeId: item.serviceFeeId || paymentObj.serviceFeeId,
    flatNumber: String(flatNumber).trim(),
    ownerId: item.ownerId || item.userId,
    ownerName: item.ownerName || `Resident of Flat ${flatNumber}`,
    contact: item.contact || phoneNumber,
    phoneNumber: phoneNumber || item.contact,
    residents: item.residents || '1',
    serviceFeeMonth: item.serviceFeeMonth || item.month || billingMonth,
    billingMonth: item.billingMonth || item.serviceFeeMonth || billingMonth || getCurrentMonth(),
    billingYear: item.billingYear || item.year || billingYear || getCurrentYear(),
    totalCharge,
    totalServiceCharge: totalCharge,
    paidAmount,
    status,
    paymentStatus: status,
    rawPaid,
    rejectionComment: item.rejectionComment || item.comment || item.reason || paymentObj.rejectionComment || paymentObj.comment || paymentObj.reason || null,
    comment: item.rejectionComment || item.comment || item.reason || paymentObj.rejectionComment || paymentObj.comment || paymentObj.reason || null,
    transactionId,
    paymentMethod,
    paymentDate,
    breakdown
  }
}


export const dashboardService = {
  /**
   * Super Admin: Fetch all 36 flat members with payment info & filters
   * Calls Spring Boot /get-flats-by-month?year=...&month=... or /get-flats
   * Deduplicates records to ensure accurate financial aggregations
   */
  async getAllFlatsPayments(params = {}) {
    const year = Number(params.year) || getCurrentYear()
    let monthNum
    let monthName

    if (typeof params.month === 'number') {
      monthNum = params.month
      monthName = MONTH_NAMES[monthNum - 1] || getCurrentMonth()
    } else if (params.month && !isNaN(Number(params.month)) && Number(params.month) >= 1 && Number(params.month) <= 12) {
      monthNum = Number(params.month)
      monthName = MONTH_NAMES[monthNum - 1] || getCurrentMonth()
    } else {
      monthName = params.month || getCurrentMonth()
      monthNum = getMonthIndex(monthName) + 1
    }

    // Retrieve active published service charge rate for this specific billing month and year
    let publishedFee = null
    try {
      const fees = await serviceFeeService.getAllServiceFees()
      publishedFee = fees.find(f => f.monthName === monthName && Number(f.year) === Number(year))
    } catch (e) {
      // Non-blocking fallback
    }

    const defaultCharge = publishedFee?.totalFee || 2500

    let rawList = []
    try {
      const response = await apiClient.get('/get-flats-by-month', {
        params: {
          year,
          month: monthNum
        }
      })
      const resData = response.data
      if (Array.isArray(resData)) rawList = resData
      else if (Array.isArray(resData?.data)) rawList = resData.data
      else if (Array.isArray(resData?.data?.content)) rawList = resData.data.content
      else if (Array.isArray(resData?.content)) rawList = resData.content
      else if (Array.isArray(resData?.data?.flats)) rawList = resData.data.flats
      else if (Array.isArray(resData?.flats)) rawList = resData.flats
    } catch (e) {
      console.warn('Could not fetch flats by month:', e)
    }

    // Fallback to /get-flats if by-month returned empty
    if (rawList.length === 0) {
      try {
        const fallbackRes = await apiClient.get('/get-flats')
        const fallbackData = fallbackRes.data
        if (Array.isArray(fallbackData)) rawList = fallbackData
        else if (Array.isArray(fallbackData?.data)) rawList = fallbackData.data
        else if (Array.isArray(fallbackData?.data?.content)) rawList = fallbackData.data.content
        else if (Array.isArray(fallbackData?.flats)) rawList = fallbackData.flats
      } catch (fbErr) {
        console.warn('Fallback /get-flats request failed:', fbErr)
      }
    }

    // Deduplicate incoming flats by flatNumber (case-insensitive) to prevent duplicates from inflating totals
    const flatMap = new Map()
    rawList.forEach(item => {
      const mapped = mapFlatResponse(item, monthName, year)
      const key = mapped.flatNumber.toUpperCase()
      if (!flatMap.has(key)) {
        flatMap.set(key, mapped)
      } else {
        const existing = flatMap.get(key)
        // Prefer record with payment verification or transaction info
        if (mapped.status === STATUS_TYPES.PAID || (mapped.status === STATUS_TYPES.PENDING_VERIFICATION && existing.status !== STATUS_TYPES.PAID)) {
          flatMap.set(key, { ...existing, ...mapped })
        } else if (!existing.transactionId && mapped.transactionId) {
          flatMap.set(key, { ...existing, ...mapped })
        }
      }
    })

    // Only return real flats that actually exist in the database (no dummy or auto-generated flats)
    let flats = Array.from(flatMap.values())

    // Apply database service fee rates and breakdown
    if (publishedFee) {
      const pubBreakdown = (publishedFee.waterFee != null || publishedFee.caretakerFee != null || publishedFee.wasteFee != null || publishedFee.liftFee != null || publishedFee.electricityFee != null || publishedFee.otherFee != null)
        ? {
            water: publishedFee.waterFee != null ? Number(publishedFee.waterFee) : null,
            caretaker: publishedFee.caretakerFee != null ? Number(publishedFee.caretakerFee) : null,
            waste: publishedFee.wasteFee != null ? Number(publishedFee.wasteFee) : null,
            lift: publishedFee.liftFee != null ? Number(publishedFee.liftFee) : null,
            electricity: publishedFee.electricityFee != null ? Number(publishedFee.electricityFee) : null,
            other: publishedFee.otherFee != null ? Number(publishedFee.otherFee) : null
          }
        : null

      flats.forEach(f => {
        if (!f.totalCharge || f.totalCharge === 2500) {
          f.totalCharge = publishedFee.totalFee || 2500
          f.totalServiceCharge = f.totalCharge
        }
        f.serviceFeeId = f.serviceFeeId || publishedFee.serviceFeeId
        if (!f.breakdown && pubBreakdown) {
          f.breakdown = { ...pubBreakdown }
        } else if (f.breakdown && pubBreakdown) {
          f.breakdown = {
            water: f.breakdown.water ?? pubBreakdown.water,
            caretaker: f.breakdown.caretaker ?? pubBreakdown.caretaker,
            waste: f.breakdown.waste ?? pubBreakdown.waste,
            lift: f.breakdown.lift ?? pubBreakdown.lift,
            electricity: f.breakdown.electricity ?? pubBreakdown.electricity,
            other: f.breakdown.other ?? pubBreakdown.other
          }
        }
        if (normalizeStatus(f.status) === STATUS_TYPES.PAID) {
          f.paidAmount = f.paidAmount || f.totalCharge
        } else {
          f.paidAmount = 0
        }
      })
    }

    // Enrich with exact payment IDs and transaction details matching this specific billing cycle
    try {
      const paymentsRes = await apiClient.get('/get-service-fee-payments')
      const paymentsList = Array.isArray(paymentsRes.data?.data) ? paymentsRes.data.data : (Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
      if (paymentsList.length > 0) {
        flats.forEach(flat => {
          const matched = paymentsList.find(p => {
            const sameFeeId = (flat.serviceFeeId && p.serviceFeeId && Number(p.serviceFeeId) === Number(flat.serviceFeeId)) ||
                             (publishedFee?.serviceFeeId && p.serviceFeeId && Number(p.serviceFeeId) === Number(publishedFee.serviceFeeId))
            const sameDate = p.paidDate && (
              new Date(p.paidDate).getMonth() + 1 === monthNum &&
              new Date(p.paidDate).getFullYear() === year
            )
            const samePeriod = sameFeeId || sameDate

            const matchTrx = p.transactionId && flat.transactionId && String(p.transactionId).trim().toUpperCase() === String(flat.transactionId).trim().toUpperCase()
            const matchFlat = p.flatId && flat.flatId && Number(p.flatId) === Number(flat.flatId) && samePeriod

            return matchTrx || matchFlat
          })

          if (matched) {
            if (matched.serviceFeePaymentId) flat.serviceFeePaymentId = matched.serviceFeePaymentId
            if (matched.phoneNumber) flat.phoneNumber = matched.phoneNumber
            if (matched.transactionId && !flat.transactionId) flat.transactionId = matched.transactionId
            if (matched.rejectionComment) { flat.rejectionComment = matched.rejectionComment; flat.comment = matched.rejectionComment; }
            if (matched.paid) {
              flat.status = normalizeStatus(matched.paid)
              flat.paymentStatus = flat.status
              if (flat.status === STATUS_TYPES.PAID) {
                flat.paidAmount = Number(matched.amount || flat.totalCharge)
              } else {
                flat.paidAmount = 0
              }
            }
          }
        })
      }
    } catch (paymentFetchErr) {
      // Non-blocking fallback
    }

    // Check member occupancy, service charge eligibility, and enrich member names
    try {
      const allMembers = await memberService.getAllMembers()
      const memberMap = new Map()
      if (Array.isArray(allMembers)) {
        allMembers.forEach(m => {
          if (m.flatNumber) memberMap.set(String(m.flatNumber).trim().toUpperCase(), m)
        })
      }

      flats.forEach(flat => {
        const cleanFlat = String(flat.flatNumber || '').trim().toUpperCase()
        const member = memberMap.get(cleanFlat)

        if (member) {
          // If backend returns "owner1" or generic placeholders for all flats, enrich with actual registered member name
          if (
            member.name &&
            (!flat.ownerName ||
             flat.ownerName === 'owner1' ||
             flat.ownerName === 'Unassigned' ||
             flat.ownerName.toLowerCase().startsWith('resident of flat'))
          ) {
            flat.ownerName = member.name
          }
          if (member.phoneNumber && (!flat.phoneNumber || flat.phoneNumber === '—')) {
            flat.phoneNumber = member.phoneNumber
          }
        }

        const isEligible = memberService.isFlatBillingEligible(flat.flatNumber, monthName, year)
        flat.isBillingEligible = isEligible
        if (!isEligible) {
          flat.totalCharge = 0
          flat.totalServiceCharge = 0
          if (normalizeStatus(flat.status) !== STATUS_TYPES.PAID) {
            flat.paidAmount = 0
            flat.status = STATUS_TYPES.EXEMPT
            flat.paymentStatus = STATUS_TYPES.EXEMPT
          }
        }
      })
    } catch (memberEnrichErr) {
      // Fallback: evaluate eligibility without member map
      flats.forEach(flat => {
        const isEligible = memberService.isFlatBillingEligible(flat.flatNumber, monthName, year)
        flat.isBillingEligible = isEligible
        if (!isEligible) {
          flat.totalCharge = 0
          flat.totalServiceCharge = 0
          if (normalizeStatus(flat.status) !== STATUS_TYPES.PAID) {
            flat.paidAmount = 0
            flat.status = STATUS_TYPES.EXEMPT
            flat.paymentStatus = STATUS_TYPES.EXEMPT
          }
        }
      })
    }

    // Apply client-side filters if requested
    const { search, status } = params
    if (search) {
      const q = search.toLowerCase().trim()
      flats = flats.filter(f =>
        f.flatNumber?.toLowerCase().includes(q) ||
        f.ownerName?.toLowerCase().includes(q) ||
        (f.phoneNumber && f.phoneNumber.includes(q)) ||
        (f.transactionId && f.transactionId.toLowerCase().includes(q))
      )
    }

    if (status && status !== 'ALL') {
      flats = flats.filter(f => normalizeStatus(f.status) === normalizeStatus(status))
    }

    return flats
  },

  /**
   * Super Admin: Fetch summary cards metrics for specified month/year
   * Computed accurately from the flats list returned by the backend
   */
  async getAdminDashboardSummary(params = {}) {
    const flats = await this.getAllFlatsPayments({
      month: params.month,
      year: params.year
    })

    const totalFlats = flats.length
    const paidFlats = flats.filter(f => normalizeStatus(f.status) === STATUS_TYPES.PAID).length
    const pendingFlats = flats.filter(f => normalizeStatus(f.status) === STATUS_TYPES.PENDING_VERIFICATION).length
    const exemptFlats = flats.filter(f => normalizeStatus(f.status) === STATUS_TYPES.EXEMPT).length
    const notPaidFlats = Math.max(0, totalFlats - paidFlats - pendingFlats - exemptFlats)
    const totalBilled = flats.reduce((acc, f) => acc + Number(f.totalCharge || 0), 0)
    const totalCollected = flats
      .filter(f => normalizeStatus(f.status) === STATUS_TYPES.PAID)
      .reduce((acc, f) => acc + Number(f.paidAmount || f.totalCharge || 0), 0)
    const totalPending = flats
      .filter(f => normalizeStatus(f.status) === STATUS_TYPES.PENDING_VERIFICATION)
      .reduce((acc, f) => acc + Number(f.totalCharge || 0), 0)
    const totalOutstanding = Math.max(0, totalBilled - totalCollected)

    return {
      totalFlats,
      paidFlats,
      pendingFlats,
      notPaidFlats,
      totalBilled,
      totalCollected,
      totalPending,
      totalOutstanding
    }
  },

  /**
   * Owner: Fetch only the flats belonging to the currently authenticated user
   * Calls /get-flats which is security-filtered on backend by user token
   */
  async getOwnerFlats(params = {}) {
    const year = Number(params.year) || getCurrentYear()
    const monthName = params.month || getCurrentMonth()
    const monthNum = getMonthIndex(monthName) + 1

    try {
      const response = await apiClient.get('/get-flats', {
        params: {
          year,
          month: monthNum
        }
      })
      const resData = response.data
      let rawList = []

      if (Array.isArray(resData)) {
        rawList = resData
      } else if (Array.isArray(resData?.data)) {
        rawList = resData.data
      } else if (Array.isArray(resData?.content)) {
        rawList = resData.content
      } else if (Array.isArray(resData?.data?.content)) {
        rawList = resData.data.content
      } else if (Array.isArray(resData?.flats)) {
        rawList = resData.flats
      } else if (Array.isArray(resData?.data?.flats)) {
        rawList = resData.data.flats
      } else if (resData && typeof resData === 'object' && resData.flatNumber) {
        rawList = [resData]
      }

      return rawList.map(item => mapFlatResponse(item, monthName, year))
    } catch (err) {
      console.warn('Failed to fetch authenticated owner flats:', err)
      return []
    }
  },

  /**
   * Owner: Fetch single flat dashboard data for given billing period
   * Calls /get-flats or /get-flats-by-ownerId
   */
  async getOwnerDashboard(params = {}) {
    const year = Number(params.year) || getCurrentYear()
    const monthName = params.month || getCurrentMonth()
    const targetFlatNumber = (params.flatNumber || '').trim().toUpperCase()

    // In FlatServiceImpl.java, /get-flats for an OWNER returns only the owner's flats
    const response = await apiClient.get('/get-flats')
    const resData = response.data
    let rawList = []

    if (Array.isArray(resData)) {
      rawList = resData
    } else if (Array.isArray(resData?.data)) {
      rawList = resData.data
    } else if (Array.isArray(resData?.content)) {
      rawList = resData.content
    } else if (Array.isArray(resData?.data?.content)) {
      rawList = resData.data.content
    } else if (Array.isArray(resData?.flats)) {
      rawList = resData.flats
    } else if (Array.isArray(resData?.data?.flats)) {
      rawList = resData.data.flats
    } else if (resData && typeof resData === 'object' && resData.flatNumber) {
      rawList = [resData]
    }

    let flats = rawList.map(item => mapFlatResponse(item, monthName, year))

    // Match flat: if targetFlatNumber provided match it; otherwise use owner's primary flat
    let flat = (targetFlatNumber ? flats.find(f => f.flatNumber?.toUpperCase() === targetFlatNumber) : null) || flats[0]

    if (flat) {
      const isPaid = normalizeStatus(flat.status) === 'Paid'
      const paidAmount = isPaid ? Number(flat.paidAmount || flat.totalCharge) : 0
      const outstandingAmount = Math.max(0, flat.totalCharge - paidAmount)

      return {
        ...flat,
        flats: flats.length > 0 ? flats : [flat],
        flatId: flat.flatId,
        serviceFeeId: flat.serviceFeeId,
        flatNumber: flat.flatNumber,
        ownerName: flat.ownerName,
        billingMonth: monthName,
        billingYear: year,
        totalServiceCharge: flat.totalCharge,
        totalCharge: flat.totalCharge,
        paidAmount,
        outstandingAmount,
        paymentStatus: flat.status,
        status: flat.status,
        rejectionComment: flat.rejectionComment || null,
        comment: flat.rejectionComment || null,
        transactionId: flat.transactionId,
        phoneNumber: flat.phoneNumber,
        paymentDate: flat.paymentDate,
        breakdown: flat.breakdown
      }
    }

    return {
      flatId: null,
      flatNumber: targetFlatNumber,
      flats: [],
      ownerName: `Resident of Flat ${targetFlatNumber}`,
      billingMonth: monthName,
      billingYear: year,
      totalCharge: 2500,
      totalServiceCharge: 2500,
      paidAmount: 0,
      outstandingAmount: 2500,
      status: 'Not Paid',
      paymentStatus: 'Not Paid',
      transactionId: null,
      phoneNumber: null,
      paymentDate: null,
      breakdown: null
    }
  },


  /**
   * Owner: Fetch payment history from Spring Boot /get-service-fee-payments-by-flatId
   */
  async getOwnerPaymentHistory(params = {}) {
    let flatId = params.flatId

    if (!flatId) {
      try {
        const flatsRes = await apiClient.get('/get-flats')
        const flats = flatsRes.data?.data || flatsRes.data || []
        const matched = flats.find(f => f.flatNumber?.toUpperCase() === String(params.flatNumber || '').toUpperCase())
        if (matched) flatId = matched.flatId
      } catch (e) {
        console.warn('Could not auto-resolve flatId for history:', e)
      }
    }

    if (flatId) {
      const response = await apiClient.get('/get-service-fee-payments-by-flatId', {
        params: { flatId }
      })

      const resData = response.data
      const list = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : [])
      if (list.length > 0) {
        return list.map(p => ({
          id: p.serviceFeePaymentId,
          flatId: p.flatId,
          serviceFeeId: p.serviceFeeId,
          status: normalizeStatus(p.paid),
          paidAmount: normalizeStatus(p.paid) === 'Paid' ? 2500 : 0,
          totalServiceCharge: 2500,
          transactionId: p.transactionId,
          paymentMethod: p.paymentMethod || 'bKash',
          paymentDate: p.paidDate,
          month: p.paidDate ? new Date(p.paidDate).toLocaleString('default', { month: 'long' }) : getCurrentMonth(),
          year: p.paidDate ? new Date(p.paidDate).getFullYear() : getCurrentYear(),
          breakdown: null
        }))
      }
    }

    return []
  }
}

export default dashboardService

