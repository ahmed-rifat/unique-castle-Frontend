import apiClient from './api.js'
import { dashboardService } from './dashboardService.js'
import { normalizeStatus, STATUS_TYPES } from '../utils/paymentStatus.js'

export const reportService = {
  /**
   * Fetch full 36 flats dataset for the selected month/year for PDF report
   */
  async getAdminMonthlyReportData(params = {}) {
    try {
      const response = await apiClient.get('/reports/admin/monthly', { params })
      if (response.data) return response.data
    } catch (e) {
      // Backend does not have a dedicated PDF endpoint; aggregate from live flats API
      const flats = await dashboardService.getAllFlatsPayments(params)
      const totalBilled = flats.reduce((acc, f) => acc + Number(f.totalCharge || 0), 0)
      const totalCollected = flats
        .filter(f => normalizeStatus(f.status) === STATUS_TYPES.PAID)
        .reduce((acc, f) => acc + Number(f.paidAmount || f.totalCharge || 0), 0)
      const paidFlats = flats.filter(f => normalizeStatus(f.status) === STATUS_TYPES.PAID).length
      const pendingFlats = flats.filter(f => normalizeStatus(f.status) === STATUS_TYPES.PENDING_VERIFICATION).length
      const exemptFlats = flats.filter(f => normalizeStatus(f.status) === STATUS_TYPES.EXEMPT).length
      const notPaidFlats = Math.max(0, flats.length - paidFlats - pendingFlats - exemptFlats)
      const totalPending = flats
        .filter(f => normalizeStatus(f.status) === STATUS_TYPES.PENDING_VERIFICATION)
        .reduce((acc, f) => acc + Number(f.totalCharge || 0), 0)
      const totalOutstanding = Math.max(0, totalBilled - totalCollected)

      return {
        month: params.month || 'October',
        year: params.year || 2026,
        flats,
        summary: {
          totalFlats: flats.length,
          paidFlats,
          pendingFlats,
          exemptFlats,
          notPaidFlats,
          totalBilled,
          totalCollected,
          totalPending,
          totalOutstanding
        }
      }
    }
  },

  /**
   * Fetch owner monthly report data
   */
  async getOwnerMonthlyReportData(params = {}) {
    try {
      const response = await apiClient.get('/reports/owner/monthly', { params })
      if (response.data) return response.data
    } catch (e) {
      // Backend does not have a dedicated PDF endpoint; aggregate from live owner dashboard API
      const flat = await dashboardService.getOwnerDashboard(params)
      const isPaid = normalizeStatus(flat.status || flat.paymentStatus) === 'Paid'
      const totalCharge = Number(flat.totalCharge || flat.totalServiceCharge || 2500)
      const paidAmount = isPaid ? Number(flat.paidAmount || totalCharge) : 0
      const outstanding = Math.max(0, totalCharge - paidAmount)

      return {
        month: params.month || flat.billingMonth,
        year: params.year || flat.billingYear,
        flatNumber: flat.flatNumber,
        owner: {
          name: flat.ownerName,
          phone: flat.phoneNumber,
          flatNumber: flat.flatNumber
        },
        bill: {
          totalCharge,
          paidAmount,
          outstanding,
          status: flat.paymentStatus,
          breakdown: flat.breakdown
        },
        payment: {
          phoneNumber: flat.phoneNumber,
          transactionId: flat.transactionId,
          paidAmount,
          status: flat.paymentStatus,
          verifiedAt: flat.paymentDate
        }
      }
    }
  }
}

export default reportService

