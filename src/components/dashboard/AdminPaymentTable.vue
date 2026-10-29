<template>
  <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
    <!-- Header with Table Title and Page size / Quick stats -->
    <div class="px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
      <div>
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          Flat Members Directory & Payment Roster
          <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            {{ flats.length }} Flats Total
          </span>
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Real-time payment logs, bKash verification status, and monthly charges for all 36 apartment units.
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-500 font-medium">Show:</span>
        <select
          v-model="pageSize"
          class="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:ring-1 focus:ring-indigo-500"
        >
          <option :value="10">10 / page</option>
          <option :value="18">18 / page</option>
          <option :value="36">All 36</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100/75 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th class="py-3 px-3 cursor-pointer hover:text-slate-900 select-none text-center" @click="sortBy('flatNumber')">
              <div class="flex items-center justify-center gap-1">
                Flat Unit
                <span class="text-[10px] text-slate-400" v-if="sortKey === 'flatNumber'">{{ sortAsc ? '▲' : '▼' }}</span>
              </div>
            </th>
            <th class="py-3 px-4 cursor-pointer hover:text-slate-900 select-none" @click="sortBy('ownerName')">
              <div class="flex items-center gap-1">
                Resident / Owner Name
                <span class="text-[10px] text-slate-400" v-if="sortKey === 'ownerName'">{{ sortAsc ? '▲' : '▼' }}</span>
              </div>
            </th>
            <th class="py-3 px-4 text-right">Total Billed (৳)</th>
            <th class="py-3 px-4 text-right">Amount Paid (৳)</th>
            <th class="py-3 px-4 text-right">Outstanding Due (৳)</th>
            <th class="py-3 px-4 text-center cursor-pointer hover:text-slate-900 select-none" @click="sortBy('status')">
              <div class="flex items-center justify-center gap-1">
                Verification Status
                <span class="text-[10px] text-slate-400" v-if="sortKey === 'status'">{{ sortAsc ? '▲' : '▼' }}</span>
              </div>
            </th>
            <th class="py-3 px-4">Transaction ID (TrxID)</th>
            <th class="py-3 px-4">Sender Mobile</th>
            <th class="py-3 px-4">Payment Date</th>
            <th class="py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="flat in paginatedFlats"
            :key="flat.flatNumber"
            class="hover:bg-slate-50/80 transition-colors"
          >
            <!-- Flat Number -->
            <td class="py-3 px-3 font-bold text-slate-900 text-center">
              <span class="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold">
                {{ flat.flatNumber }}
              </span>
            </td>

            <!-- Owner Name & Contact -->
            <td class="py-3 px-4">
              <div class="font-semibold text-slate-800">{{ flat.ownerName }}</div>
              <div class="text-[11px] text-slate-400">{{ flat.email || 'No email' }}</div>
            </td>

            <!-- Total Billed -->
            <td class="py-3 px-4 text-right font-bold text-slate-800">
              {{ formatCurrency(flat.totalCharge) }}
            </td>

            <!-- Paid Amount -->
            <td class="py-3 px-4 text-right font-bold" :class="Number(flat.paidAmount) > 0 ? 'text-emerald-600' : 'text-slate-400'">
              {{ formatCurrency(flat.paidAmount) }}
            </td>

            <!-- Outstanding Due -->
            <td class="py-3 px-4 text-right font-bold" :class="getDueAmount(flat) > 0 ? 'text-rose-600' : 'text-emerald-600'">
              {{ formatCurrency(getDueAmount(flat)) }}
            </td>

            <!-- Status -->
            <td class="py-3 px-4 text-center">
              <div class="flex flex-col items-center gap-1">
                <PaymentStatusBadge :status="flat.status" />
                <span
                  v-if="normalizeStatus(flat.status) === 'Rejected' && (flat.rejectionComment || flat.comment || flat.reason)"
                  class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200/60 max-w-[150px] truncate"
                  :title="flat.rejectionComment || flat.comment || flat.reason"
                >
                  {{ flat.rejectionComment || flat.comment || flat.reason }}
                </span>
              </div>
            </td>

            <!-- Trx ID -->
            <td class="py-3 px-4">
              <span v-if="flat.transactionId" class="font-mono text-[11px] font-semibold bg-indigo-50/70 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                {{ flat.transactionId }}
              </span>
              <span v-else class="text-slate-400 text-[11px]">None</span>
            </td>

            <!-- Phone Number -->
            <td class="py-3 px-4 text-slate-600">
              {{ flat.phoneNumber || '—' }}
            </td>

            <!-- Payment Date -->
            <td class="py-3 px-4 text-slate-500 whitespace-nowrap">
              {{ formatDate(flat.paymentDate, true) }}
            </td>

            <!-- Actions -->
            <td class="py-3 px-4 text-center whitespace-nowrap">
              <!-- Pending Verification Actions -->
              <div v-if="normalizeStatus(flat.status) === 'Pending Verification'" class="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  @click="openVerifyModal(flat)"
                  class="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                  title="Review & Verify bKash Payment"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Verify
                </button>
                <button
                  type="button"
                  @click="handleQuickReject(flat)"
                  class="px-2 py-1 text-xs font-semibold rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                  title="Reject Invalid Payment"
                >
                  Reject
                </button>
              </div>

              <!-- View Details / Receipt Button for Paid & Other -->
              <div v-else class="flex items-center justify-center gap-1">
                <button
                  type="button"
                  @click="openDetailsModal(flat)"
                  class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Details
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="paginatedFlats.length === 0">
            <td colspan="10" class="py-10 text-center text-slate-400">
              <div class="max-w-xs mx-auto text-center">
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="font-medium text-slate-600 text-sm">No flats match your filter</p>
                <p class="text-xs text-slate-400 mt-1">Try resetting the search keywords or payment status filter.</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Financial Summary Totals Footer -->
        <tfoot v-if="props.flats.length > 0" class="bg-slate-100/90 text-slate-800 font-bold border-t-2 border-slate-300 text-xs">
          <tr>
            <td class="py-3.5 px-3 text-center text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Total</td>
            <td class="py-3.5 px-4 font-bold text-slate-700">{{ props.flats.length }} Flats Total</td>
            <td class="py-3.5 px-4 text-right text-slate-900 font-black">{{ formatCurrency(totalBilledSum) }}</td>
            <td class="py-3.5 px-4 text-right text-emerald-700 font-black">{{ formatCurrency(totalPaidSum) }}</td>
            <td class="py-3.5 px-4 text-right text-rose-700 font-black">{{ formatCurrency(totalDueSum) }}</td>
            <td colspan="5" class="py-3.5 px-4 text-slate-500 font-medium text-right">
              Audit Breakdown: <span class="font-bold text-emerald-700">{{ paidFlatsCount }} Paid</span> • <span class="font-bold text-amber-600">{{ pendingFlatsCount }} Pending</span> • <span class="font-bold text-rose-600">{{ unpaidFlatsCount }} Due</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="totalPages > 1" class="px-5 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
      <div>
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, sortedFlats.length) }} of {{ sortedFlats.length }} flats
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Previous
        </button>
        <span class="px-2 font-medium text-slate-700">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          type="button"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import { formatCurrency } from '../../utils/currency.js'
import { formatDate } from '../../utils/date.js'
import { normalizeStatus } from '../../utils/paymentStatus.js'
import PaymentStatusBadge from './PaymentStatusBadge.vue'

const props = defineProps({
  flats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['openVerification', 'openDetails', 'rejectPayment'])

const pageSize = ref(18)
const currentPage = ref(1)
const sortKey = ref('flatNumber')
const sortAsc = ref(true)

function sortBy(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function getDueAmount(flat) {
  const isPaid = normalizeStatus(flat.status) === 'Paid'
  if (isPaid) return 0
  return Math.max(0, Number(flat.totalCharge || 0) - Number(flat.paidAmount || 0))
}

const totalBilledSum = computed(() => {
  return props.flats.reduce((sum, f) => sum + Number(f.totalCharge || 0), 0)
})

const totalPaidSum = computed(() => {
  return props.flats
    .filter(f => normalizeStatus(f.status) === 'Paid')
    .reduce((sum, f) => sum + Number(f.paidAmount || f.totalCharge || 0), 0)
})

const totalDueSum = computed(() => {
  return Math.max(0, totalBilledSum.value - totalPaidSum.value)
})

const paidFlatsCount = computed(() => {
  return props.flats.filter(f => normalizeStatus(f.status) === 'Paid').length
})

const pendingFlatsCount = computed(() => {
  return props.flats.filter(f => normalizeStatus(f.status) === 'Pending Verification').length
})

const unpaidFlatsCount = computed(() => {
  return Math.max(0, props.flats.length - paidFlatsCount.value - pendingFlatsCount.value)
})

const sortedFlats = computed(() => {
  const list = [...props.flats]
  list.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (sortKey.value === 'flatNumber') {
      // Sort numerically by floor then letter (e.g. 1A, 1B, 2A...)
      return sortAsc.value ? String(valA).localeCompare(String(valB), undefined, { numeric: true }) : String(valB).localeCompare(String(valA), undefined, { numeric: true })
    }

    if (typeof valA === 'string') {
      return sortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortAsc.value ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
  })
  return list
})

const totalPages = computed(() => Math.ceil(sortedFlats.value.length / pageSize.value) || 1)

const paginatedFlats = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedFlats.value.slice(start, start + pageSize.value)
})

function openVerifyModal(flat) {
  emit('openVerification', flat)
}

function openDetailsModal(flat) {
  emit('openDetails', flat)
}

function handleQuickReject(flat) {
  emit('rejectPayment', flat)
}
</script>
