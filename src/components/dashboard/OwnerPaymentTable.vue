<template>
  <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
      <div>
        <h3 class="font-bold text-slate-800 text-base">
          My Apartment Monthly Service Charge History
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Current apartment billing details, payment verification status, and printable receipts.
        </p>
      </div>
      <span v-if="displayFlats.length > 0" class="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
        {{ displayFlats.length }} {{ displayFlats.length === 1 ? 'Apartment' : 'Apartments' }}
      </span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100/75 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th class="py-3.5 px-6">Apartment Flat Unit</th>
            <th class="py-3.5 px-6">Monthly Service Charge (৳)</th>
            <th class="py-3.5 px-6 text-center">Verification Status</th>
            <th class="py-3.5 px-6 text-center">Official Statement (PDF)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(row, idx) in displayFlats"
            :key="row.flatId || row.id || row.flatNumber || idx"
            class="hover:bg-slate-50/80 transition-colors"
          >
            <!-- 1. Flat / Apartment -->
            <td class="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                  APT
                </div>
                <span class="text-sm font-bold text-slate-900">
                  {{ formatFlatName(row) }}
                </span>
              </div>
            </td>

            <!-- 2. Current Month Service Charge -->
            <td class="py-4 px-6 text-slate-800 whitespace-nowrap">
              <span class="text-xs text-slate-500 font-medium">
                {{ formatBillingPeriod(row) }}:
              </span>
              <span class="text-sm font-extrabold text-slate-900 ml-1.5">
                {{ formatCurrency(getServiceChargeAmount(row)) }}
              </span>
            </td>

            <!-- 3. Payment Status -->
            <td class="py-4 px-6 text-center whitespace-nowrap">
              <div class="flex flex-col items-center gap-1">
                <PaymentStatusBadge :status="getPaymentStatus(row)" />
                <span
                  v-if="normalizeStatus(getPaymentStatus(row)) === 'Rejected' && (row.rejectionComment || row.comment || row.reason)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70 max-w-[220px] truncate"
                  :title="row.rejectionComment || row.comment || row.reason"
                >
                  <span class="font-bold text-rose-800">Reason:</span> {{ row.rejectionComment || row.comment || row.reason }}
                </span>
              </div>
            </td>

            <!-- 4. Print Statement Action -->
            <td class="py-4 px-6 text-center whitespace-nowrap">
              <button
                type="button"
                @click="handlePrintReceipt(row)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs shadow-2xs transition cursor-pointer"
                title="Download Official Service Charge Statement (PDF)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Statement (PDF)</span>
              </button>
            </td>
          </tr>

          <!-- Graceful Empty State -->
          <tr v-if="displayFlats.length === 0">
            <td colspan="4" class="py-10 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center">
                <svg class="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="font-medium text-slate-600 text-sm">No apartment records found from API.</p>
                <p class="text-xs text-slate-400 mt-1">Please ensure your flat is registered in the system.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Swal from 'sweetalert2'
import { formatCurrency } from '../../utils/currency.js'
import { getCurrentMonth, getCurrentYear, MONTH_NAMES } from '../../utils/date.js'
import { normalizeStatus } from '../../utils/paymentStatus.js'
import { generateOwnerMonthlyPdf } from '../../utils/pdfGenerator.js'
import { reportService } from '../../services/reportService.js'
import PaymentStatusBadge from './PaymentStatusBadge.vue'

const props = defineProps({
  flats: {
    type: Array,
    default: () => []
  },
  history: {
    type: Array,
    default: () => []
  }
})

const currentMonth = getCurrentMonth()
const currentYear = getCurrentYear()

const displayFlats = computed(() => {
  if (props.flats && Array.isArray(props.flats) && props.flats.length > 0) {
    return props.flats
  }
  if (props.history && Array.isArray(props.history) && props.history.length > 0) {
    return props.history
  }
  return []
})

function formatFlatName(row) {
  const flatNo = row.flatNumber || row.flat_number || row.flatNo || row.flat || row.unitNumber || (row.serviceFeePayment && row.serviceFeePayment.flatNumber) || ''
  if (!flatNo) return 'Flat —'
  const str = String(flatNo).trim()
  return str.toLowerCase().startsWith('flat') ? str : `Flat ${str}`
}

function formatBillingPeriod(row) {
  let month = row.billingMonth || row.serviceFeeMonth || row.month
  if (typeof month === 'number') {
    month = MONTH_NAMES[month - 1] || currentMonth
  } else if (month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12) {
    month = MONTH_NAMES[Number(month) - 1] || currentMonth
  } else if (!month) {
    month = currentMonth
  }

  const year = row.billingYear || row.year || currentYear
  return `${month} ${year}`
}

function getServiceChargeAmount(row) {
  if (row.totalCharge != null) return Number(row.totalCharge)
  if (row.totalAmount != null) return Number(row.totalAmount)
  if (row.totalServiceCharge != null) return Number(row.totalServiceCharge)
  if (row.amount != null) return Number(row.amount)
  if (row.serviceFee && row.serviceFee.totalAmount != null) return Number(row.serviceFee.totalAmount)
  if (row.serviceFee && row.serviceFee.amount != null) return Number(row.serviceFee.amount)
  if (row.serviceCharge != null) return Number(row.serviceCharge)
  return 2500
}

function getPaymentStatus(row) {
  return row.status || row.paymentStatus || row.paid || (row.serviceFeePayment && row.serviceFeePayment.paid) || 'Not Paid'
}

async function handlePrintReceipt(row) {
  try {
    const rawStatus = getPaymentStatus(row)
    const status = normalizeStatus(rawStatus)
    const totalAmount = getServiceChargeAmount(row)
    const paidAmount = status === 'Paid' ? totalAmount : (row.paidAmount != null ? Number(row.paidAmount) : 0)
    const flatNo = formatFlatName(row).replace(/^Flat\s*/i, '')
    const month = row.billingMonth || row.serviceFeeMonth || row.month || currentMonth
    const year = row.billingYear || row.year || currentYear

    let breakdown = row.breakdown ?? null
    // If not provided directly on row, check row.serviceFee or fetch authoritative breakdown from reportService
    if (!breakdown && row.serviceFee) {
      const sf = row.serviceFee
      const hasSfComponents = (
        sf.waterFee != null || sf.caretakerFee != null || sf.wasteFee != null ||
        sf.liftFee != null || sf.electricityFee != null || sf.otherFee != null
      )
      if (hasSfComponents) {
        breakdown = {
          water: sf.waterFee != null ? Number(sf.waterFee) : null,
          caretaker: sf.caretakerFee != null ? Number(sf.caretakerFee) : null,
          waste: sf.wasteFee != null ? Number(sf.wasteFee) : null,
          lift: sf.liftFee != null ? Number(sf.liftFee) : null,
          electricity: sf.electricityFee != null ? Number(sf.electricityFee) : null,
          other: sf.otherFee != null ? Number(sf.otherFee) : null
        }
      }
    }

    if (!breakdown) {
      try {
        const reportData = await reportService.getOwnerMonthlyReportData({
          flatNumber: flatNo,
          month,
          year
        })
        if (reportData?.bill?.breakdown) {
          breakdown = reportData.bill.breakdown
        }
      } catch (e) {
        console.warn('Could not fetch authoritative breakdown for PDF:', e)
      }
    }

    generateOwnerMonthlyPdf({
      owner: {
        name: row.ownerName || 'Resident Owner',
        phoneNumber: row.phoneNumber || row.contact || '—',
        flatNumber: flatNo
      },
      flatNumber: flatNo,
      month,
      year,
      bill: {
        totalCharge: totalAmount,
        paidAmount,
        status,
        breakdown: breakdown ?? null
      },
      payment: {
        phoneNumber: row.phoneNumber || row.contact || '—',
        transactionId: row.transactionId || '—',
        paidAmount,
        status,
        verifiedAt: row.paymentDate || new Date().toISOString()
      }
    })

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Receipt for Flat ${flatNo} generated`,
      showConfirmButton: false,
      timer: 2000
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Could Not Print Receipt',
      text: err.message || 'Error generating receipt PDF.',
      confirmButtonColor: '#4f46e5'
    })
  }
}
</script>
