import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/api.js'
import { normalizeStatus, STATUS_TYPES } from '../utils/paymentStatus.js'
import { getCurrentMonth, getCurrentYear } from '../utils/date.js'
import { dashboardService } from '../services/dashboardService.js'

export const useVerificationStore = defineStore('verification', () => {
  const pendingCount = ref(0)
  const pendingFlats = ref([])
  const isLoading = ref(false)
  const lastFetched = ref(null)
  let pollIntervalId = null

  /**
   * Synchronize the pending count and list directly (e.g. from PayBillsPage or DashboardPage)
   */
  function setPendingCount(count, flats = []) {
    pendingCount.value = Math.max(0, Number(count) || 0)
    if (flats && Array.isArray(flats)) {
      pendingFlats.value = flats
    }
  }

  /**
   * Decrement pending count (e.g. after approval or rejection)
   */
  function decrementPending(flatNumber = null) {
    if (pendingCount.value > 0) {
      pendingCount.value--
    }
    if (flatNumber && pendingFlats.value.length > 0) {
      pendingFlats.value = pendingFlats.value.filter(
        f => String(f.flatNumber).trim().toUpperCase() !== String(flatNumber).trim().toUpperCase()
      )
    }
  }

  /**
   * Increment pending count (e.g. after a resident submits a payment)
   */
  function incrementPending(flat = null) {
    pendingCount.value++
    if (flat) {
      pendingFlats.value.push(flat)
    }
  }

  /**
   * Fetch the authentic pending verification count directly from backend payment records.
   * Deduplicates multiple/historical submissions for the same flat so that only
   * genuine unverified submissions are counted.
   */
  async function fetchPendingCount(params = {}) {
    isLoading.value = true
    try {
      // 1. Query /get-service-fee-payments to get all submissions
      const response = await apiClient.get('/get-service-fee-payments')
      const rawList = Array.isArray(response.data?.data)
        ? response.data.data
        : (Array.isArray(response.data) ? response.data : [])

      if (rawList.length > 0) {
        // Group by flatId and serviceFeeId to find the latest submission per billing cycle.
        // Prevent duplicate records or historical rejected submissions from inflating count.
        const latestByFlat = new Map()

        rawList.forEach(p => {
          const key = p.flatId
            ? `${p.flatId}_${p.serviceFeeId || ''}`
            : (p.flatNumber ? `${p.flatNumber}_${p.serviceFeeId || ''}` : `${p.serviceFeePaymentId}`)
          if (!latestByFlat.has(key)) {
            latestByFlat.set(key, p)
          } else {
            const existing = latestByFlat.get(key)
            const pId = Number(p.serviceFeePaymentId || 0)
            const eId = Number(existing.serviceFeePaymentId || 0)
            if (pId > eId || (p.paidDate && existing.paidDate && new Date(p.paidDate) > new Date(existing.paidDate))) {
              latestByFlat.set(key, p)
            }
          }
        })

        // Filter for those genuinely in Pending Verification status
        const pendingList = Array.from(latestByFlat.values()).filter(p =>
          normalizeStatus(p.paid || p.status || p.paymentStatus) === STATUS_TYPES.PENDING_VERIFICATION
        )

        pendingCount.value = pendingList.length
        pendingFlats.value = pendingList
        lastFetched.value = new Date()
        return pendingCount.value
      }
    } catch (err) {
      // Fallback below
    }

    // Fallback: Query live flat dataset for the active billing cycle
    try {
      const month = params.month || getCurrentMonth()
      const year = params.year || getCurrentYear()
      const flats = await dashboardService.getAllFlatsPayments({ month, year })
      const pending = flats.filter(f =>
        normalizeStatus(f.status) === STATUS_TYPES.PENDING_VERIFICATION ||
        f.rawPaid === 'P' ||
        normalizeStatus(f.rawPaid) === STATUS_TYPES.PENDING_VERIFICATION
      )
      pendingCount.value = pending.length
      pendingFlats.value = pending
      lastFetched.value = new Date()
      return pendingCount.value
    } catch (fbErr) {
      console.warn('Could not fetch pending verifications count:', fbErr)
    } finally {
      isLoading.value = false
    }

    return pendingCount.value
  }

  /**
   * Start polling for new pending verifications (e.g. while Super Admin is active)
   */
  function startPolling(intervalMs = 25000) {
    stopPolling()
    fetchPendingCount()
    pollIntervalId = setInterval(() => {
      fetchPendingCount()
    }, intervalMs)
  }

  /**
   * Stop polling
   */
  function stopPolling() {
    if (pollIntervalId) {
      clearInterval(pollIntervalId)
      pollIntervalId = null
    }
  }

  return {
    pendingCount,
    pendingFlats,
    isLoading,
    lastFetched,
    setPendingCount,
    decrementPending,
    incrementPending,
    fetchPendingCount,
    startPolling,
    stopPolling
  }
})

export default useVerificationStore
