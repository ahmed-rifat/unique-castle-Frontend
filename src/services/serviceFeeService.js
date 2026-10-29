import apiClient from './api.js'
import { memberService } from './memberService.js'

export const serviceFeeService = {
  /**
   * Fetch all service fee billing periods (sorted descending)
   * Calls Spring Boot /get-all-serviceFees
   */
  async getAllServiceFees() {
    const response = await apiClient.get('/get-all-serviceFees')
    const list = response.data?.data || response.data || []
    if (!Array.isArray(list)) return []

    return list.map(fee => {
      const monthStr = fee.month ? String(fee.month).substring(0, 7) : ''
      const parts = monthStr.split('-')
      const year = parts[0] || '2026'
      const monthNum = parts[1] ? Number(parts[1]) : 10
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      const monthName = monthNames[monthNum - 1] || 'October'

      const totalFee = fee.totalFee != null ? Number(fee.totalFee) : (
        (Number(fee.caretakerFee || 0) + Number(fee.wasteFee || 0) + Number(fee.liftFee || 0) + Number(fee.otherFee || 0)) || 2500
      )

      return {
        serviceFeeId: fee.serviceFeeId,
        month: fee.month,
        monthName,
        year: Number(year),
        monthYearLabel: `${monthName} ${year}`,
        dueDate: fee.dueDate,
        totalFee,
        caretakerFee: fee.caretakerFee != null ? Number(fee.caretakerFee) : null,
        liftFee: fee.liftFee != null ? Number(fee.liftFee) : null,
        wasteFee: fee.wasteFee != null ? Number(fee.wasteFee) : null,
        waterFee: fee.waterFee != null ? Number(fee.waterFee) : null,
        electricityFee: fee.electricityFee != null ? Number(fee.electricityFee) : null,
        otherFee: fee.otherFee != null ? Number(fee.otherFee) : null,
        status: (fee.status || 'PUBLISHED').toUpperCase(),
        isPublished: (fee.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED',
        publishedDate: fee.publishedDate || fee.month,
        hasPayments: Boolean(fee.hasPayments || (fee.paymentCount && fee.paymentCount > 0)),
        paymentCount: Number(fee.paymentCount || 0)
      }
    })
  },

  /**
   * Admin: Create or update monthly service charge
   * Calls Spring Boot POST /save-update-serviceFee
   */
  async saveServiceFee(data) {
    const payload = {
      serviceFeeId: data.serviceFeeId || null,
      month: data.month, // "YYYY-MM-01"
      billingMonth: data.billingMonth || null,
      billingYear: data.billingYear || null,
      year: data.year || null,
      dueDate: data.dueDate || null,
      caretakerFee: Number(data.caretakerFee || 0),
      wasteFee: Number(data.wasteFee || 0),
      liftFee: Number(data.liftFee || 0),
      waterFee: Number(data.waterFee || 0),
      electricityFee: Number(data.electricityFee || 0),
      otherFee: Number(data.otherFee || 0),
      totalFee: Number(data.totalFee || 0),
      status: (data.status || 'PUBLISHED').toUpperCase()
    }

    const response = await apiClient.post('/save-update-serviceFee', payload)
    const resData = response.data

    if (resData.status === 'error' || resData.status === 'false') {
      throw new Error(resData.message || 'Failed to save service fee')
    }

    return {
      success: true,
      message: resData.message || 'Service fee saved successfully',
      data: resData
    }
  },

  /**
   * Admin: Publish a draft monthly service charge
   * Calls Spring Boot POST /service-fees/publish/{serviceFeeId}
   */
  async publishServiceFee(serviceFeeId) {
    const response = await apiClient.post(`/service-fees/publish/${serviceFeeId}`)
    const resData = response.data

    if (resData.status === 'error' || resData.status === 'false') {
      throw new Error(resData.message || 'Failed to publish service fee')
    }

    return {
      success: true,
      message: resData.message || 'Service charge published successfully! Now visible to all residents.',
      data: resData
    }
  },

  /**
   * Fetch service charge breakdown and config for a specific flat & billing period
   * Calls Spring Boot /service-fees/breakdown
   */
  async getServiceChargeBreakdown(params = {}) {
    const flatNumber = params.flatNumber ? String(params.flatNumber).trim() : ''
    const month = params.month || 'October'
    const year = params.year || 2026

    // Exclude members who have not moved in or are ineligible from monthly service fees
    if (flatNumber && !memberService.isFlatBillingEligible(flatNumber, month, year)) {
      return {
        serviceFeeId: null,
        flatNumber,
        billingMonth: month,
        billingYear: year,
        dueDate: null,
        totalCharge: 0,
        paidAmount: 0,
        outstandingAmount: 0,
        status: 'Exempt (Not Moved In)',
        rejectionComment: null,
        comment: null,
        isPublished: true,
        breakdown: null,
        notes: 'Resident has not moved into apartment yet. Exempt from service charge for this billing month.',
        bkashNumber: import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678'
      }
    }

    if (flatNumber) {
      try {
        const response = await apiClient.get('/service-fees/breakdown', {
          params: {
            flatNumber,
            month,
            year
          }
        })
        const data = response.data

        if (data) {
          return {
            serviceFeeId: data.serviceFeeId,
            flatNumber: data.flatNumber || flatNumber,
            billingMonth: data.billingMonth || month,
            billingYear: data.billingYear || year,
            dueDate: data.dueDate,
            totalCharge: Number(data.totalCharge || 0),
            paidAmount: Number(data.paidAmount || 0),
            outstandingAmount: Number(data.outstandingAmount || 0),
            status: data.status || 'Not Paid',
            rejectionComment: data.rejectionComment || data.comment || null,
            comment: data.rejectionComment || data.comment || null,
            isPublished: data.isPublished !== false,
            publishedDate: data.publishedDate,
            breakdown: data.breakdown || (
              (data.waterFee != null || data.caretakerFee != null || data.wasteFee != null || data.liftFee != null || data.electricityFee != null || data.otherFee != null)
                ? {
                    water: data.waterFee != null ? Number(data.waterFee) : null,
                    caretaker: data.caretakerFee != null ? Number(data.caretakerFee) : null,
                    waste: data.wasteFee != null ? Number(data.wasteFee) : null,
                    lift: data.liftFee != null ? Number(data.liftFee) : null,
                    electricity: data.electricityFee != null ? Number(data.electricityFee) : null,
                    other: data.otherFee != null ? Number(data.otherFee) : null
                  }
                : null
            ),
            bkashNumber: data.bkashNumber || import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678'
          }
        }
      } catch (apiErr) {
        console.warn('Backend /service-fees/breakdown endpoint fallback:', apiErr)
      }
    }

    // Fallback via /get-flats (which is scoped to current authenticated owner)
    let flat = null
    try {
      const flatsRes = await apiClient.get('/get-flats', { params: { month, year } })
      const flats = Array.isArray(flatsRes.data?.data)
        ? flatsRes.data.data
        : (Array.isArray(flatsRes.data) ? flatsRes.data : [])

      if (flatNumber) {
        flat = flats.find(f => f.flatNumber?.toUpperCase() === flatNumber.toUpperCase())
      } else if (flats.length === 1) {
        flat = flats[0]
      }
    } catch (fbErr) {
      console.warn('Fallback /get-flats failed in serviceFeeService:', fbErr)
    }

    if (flat) {
      const totalAmount = flat.totalAmount != null ? Number(flat.totalAmount) : (flat.totalCharge != null ? Number(flat.totalCharge) : 2500)
      const isPaid = flat.paid === 'Y' || flat.paid === 'PAID'
      const isPending = flat.paid === 'P' || flat.paid === 'PENDING'
      const paidAmount = isPaid || isPending ? totalAmount : 0

      const sf = flat.serviceFee || {}
      const hasSfComponents = (
        flat.waterFee != null || sf.waterFee != null ||
        flat.caretakerFee != null || sf.caretakerFee != null ||
        flat.wasteFee != null || sf.wasteFee != null ||
        flat.liftFee != null || sf.liftFee != null ||
        flat.electricityFee != null || sf.electricityFee != null ||
        flat.otherFee != null || sf.otherFee != null
      )

      return {
        flatId: flat.flatId,
        serviceFeeId: flat.serviceFeeId,
        flatNumber: flat.flatNumber || flatNumber,
        ownerName: flat.ownerName || null,
        billingMonth: month,
        billingYear: year,
        totalCharge: totalAmount,
        paidAmount,
        outstandingAmount: Math.max(0, totalAmount - paidAmount),
        status: isPaid ? 'Paid' : (isPending ? 'Pending Verification' : (flat.paid === 'R' ? 'Rejected' : 'Not Paid')),
        rejectionComment: flat.rejectionComment || flat.comment || null,
        comment: flat.rejectionComment || flat.comment || null,
        isPublished: true,
        breakdown: flat.breakdown || (hasSfComponents ? {
          water: flat.waterFee != null ? Number(flat.waterFee) : (sf.waterFee != null ? Number(sf.waterFee) : null),
          caretaker: flat.caretakerFee != null ? Number(flat.caretakerFee) : (sf.caretakerFee != null ? Number(sf.caretakerFee) : null),
          waste: flat.wasteFee != null ? Number(flat.wasteFee) : (sf.wasteFee != null ? Number(sf.wasteFee) : null),
          lift: flat.liftFee != null ? Number(flat.liftFee) : (sf.liftFee != null ? Number(sf.liftFee) : null),
          electricity: flat.electricityFee != null ? Number(flat.electricityFee) : (sf.electricityFee != null ? Number(sf.electricityFee) : null),
          other: flat.otherFee != null ? Number(flat.otherFee) : (sf.otherFee != null ? Number(sf.otherFee) : null)
        } : null),
        bkashNumber: import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678'
      }
    }

    return {
      flatNumber,
      billingMonth: month,
      billingYear: year,
      totalCharge: 2500,
      paidAmount: 0,
      outstandingAmount: 2500,
      status: 'Not Paid',
      isPublished: true,
      breakdown: null,
      bkashNumber: import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678'
    }
  },

  /**
   * Fetch current bKash configuration with dynamic charge amount
   */
  async getBkashConfig(amount = 2500) {
    const formattedAmount = `৳ ${Number(amount).toLocaleString()}`
    return {
      number: import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678',
      accountType: 'Merchant / Personal',
      instructions: [
        'Open your bKash app or dial *247#',
        'Choose "Send Money" or "Make Payment" to our official number',
        `Enter the exact monthly service charge amount (${formattedAmount})`,
        'Enter your Flat Number as the Reference (e.g., 4B)',
        'Confirm with your bKash PIN and copy the Transaction ID (TrxID)',
        'Fill out the form below with your bKash number and Transaction ID'
      ]
    }
  }
}

export default serviceFeeService
