<template>
  <div class="space-y-6">
    <!-- SUPER ADMIN VIEW: Payment Verification & Audit Center -->
    <div v-if="isSuperAdmin" class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Payment Verification & Audit Center
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Super Admin
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Verify submitted resident payments using Flat Number, bKash Phone Number, and Transaction ID (TrxID).
          </p>
        </div>

        <!-- Month & Year Selector -->
        <div class="flex items-center gap-2">
          <select
            v-model="selectedMonth"
            @change="loadAdminData"
            class="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 shadow-xs focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="m in MONTH_NAMES" :key="m" :value="m">{{ m }}</option>
          </select>

          <select
            v-model="selectedYear"
            @change="loadAdminData"
            class="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 shadow-xs focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Quick Verify Form Card: Flat Number + Phone Number + Transaction ID -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-base">Direct bKash Payment Verification</h3>
              <p class="text-xs text-slate-300 mt-0.5">
                Verify a flat's service charge payment by matching their Flat Number, Sender Phone Number, and bKash TrxID.
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleDirectVerify" class="p-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 1. Flat Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Flat Number <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="verifyForm.flatNumber"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              >
                <option value="" disabled>Select Flat Unit...</option>
                <option v-for="flat in all36FlatsList" :key="flat" :value="flat">
                  Flat {{ flat }}
                </option>
              </select>
              <span v-if="verifyErrors.flatNumber" class="text-rose-500 text-[11px] mt-0.5 block">{{ verifyErrors.flatNumber }}</span>
            </div>

            <!-- 2. bKash Phone Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                bKash Phone Number <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="verifyForm.phoneNumber"
                maxlength="11"
                placeholder="01XXXXXXXXX"
                class="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
              <span v-if="verifyErrors.phoneNumber" class="text-rose-500 text-[11px] mt-0.5 block">{{ verifyErrors.phoneNumber }}</span>
            </div>

            <!-- 3. Transaction ID -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Transaction ID (TrxID) <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="verifyForm.transactionId"
                placeholder="e.g. BK9X84H21"
                class="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
              <span v-if="verifyErrors.transactionId" class="text-rose-500 text-[11px] mt-0.5 block">{{ verifyErrors.transactionId }}</span>
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="text-xs text-slate-500 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Super Admin approval marks the flat as Paid and confirms full service charge clearance for {{ selectedMonth }} {{ selectedYear }}.
            </div>

            <button
              type="submit"
              :disabled="isVerifying"
              class="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg v-if="isVerifying" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ isVerifying ? 'Verifying...' : 'Verify & Confirm Payment' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Pending Verification Review Queue -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              Pending Payments Awaiting Verification
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {{ pendingFlatsList.length }} Pending
              </span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Click "Verify" on any transaction to inspect details or auto-fill for instant approval.
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100/75 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Flat #</th>
                <th class="py-3 px-4">Owner Name</th>
                <th class="py-3 px-4">bKash Phone Number</th>
                <th class="py-3 px-4">Transaction ID (TrxID)</th>
                <th class="py-3 px-4 text-right">Amount</th>
                <th class="py-3 px-4">Submission Date</th>
                <th class="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="flat in pendingFlatsList"
                :key="flat.flatNumber"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="py-3.5 px-4 font-bold text-slate-900">
                  <span class="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                    Flat {{ flat.flatNumber }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-800">
                  {{ flat.ownerName }}
                </td>
                <td class="py-3.5 px-4 font-mono font-semibold text-slate-700">
                  {{ flat.phoneNumber || '—' }}
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {{ flat.transactionId }}
                    </span>
                    <button
                      type="button"
                      @click="copyTrx(flat.transactionId)"
                      class="text-slate-400 hover:text-slate-600 p-0.5 transition cursor-pointer"
                      title="Copy TrxID"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-right font-bold text-emerald-600">
                  {{ formatCurrency(flat.paidAmount || flat.totalCharge) }}
                </td>
                <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                  {{ formatDate(flat.paymentDate, true) }}
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      @click="autoFillAndVerify(flat)"
                      class="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Verify
                    </button>
                    <button
                      type="button"
                      @click="rejectPending(flat)"
                      class="px-2 py-1 text-xs font-semibold rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="pendingFlatsList.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400">
                  <div class="max-w-xs mx-auto">
                    <svg class="w-8 h-8 text-emerald-500 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="font-bold text-slate-700 text-xs">All pending submissions cleared</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">No transactions currently awaiting review for this billing month.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- RESIDENT OWNER VIEW: Bill Breakdown & bKash Payment Submission Form -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Monthly Service Charge Payment
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">
              bKash Gateway
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Review your flat's service charges and submit your bKash payment transaction details for Super Admin verification.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="selectedMonth"
            @change="loadOwnerBreakdownData"
            class="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 shadow-xs focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="m in selectableMonths" :key="m" :value="m">
              {{ m }} {{ getMonthPublishedTag(m) }}
            </option>
          </select>

          <select
            v-model="selectedYear"
            @change="loadOwnerBreakdownData"
            class="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 shadow-xs focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Published vs Unpublished Status Banner for Billing Month -->
      <div
        v-if="selectedMonthFee && !selectedMonthFee.isPublished"
        class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3 shadow-2xs"
      >
        <div class="flex items-center gap-2.5">
          <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <b>Unpublished Service Charge:</b> The service charge for {{ selectedMonth }} {{ selectedYear }} is currently in draft and has not been published yet by the building administration.
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider shrink-0">
          Draft Only
        </span>
      </div>

      <div
        v-else-if="selectedMonthFee && selectedMonthFee.isPublished"
        class="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-2xs"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <b>Published Monthly Service Charge:</b> {{ selectedMonth }} {{ selectedYear }} rate is active at <b>{{ formatCurrency(selectedMonthFee.totalFee) }}</b>.
          </span>
        </div>
        <span class="text-[11px] text-emerald-700 font-medium shrink-0">
          Published: {{ formatDate(selectedMonthFee.publishedDate, false) }}
        </span>
      </div>

      <!-- Main 2-Column: Breakdown on Left, Payment Form on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Breakdown Card -->
        <div class="lg:col-span-5 space-y-6">
          <ServiceChargeBreakdown
            :flatNumber="flatNumber"
            :month="selectedMonth"
            :year="selectedYear"
            :breakdown="ownerBreakdown?.breakdown"
            :totalCharge="ownerBreakdown?.totalCharge || 0"
            :paidAmount="ownerBreakdown?.paidAmount || 0"
            :outstandingAmount="ownerBreakdown?.outstandingAmount || 0"
            :status="ownerBreakdown?.status || 'Not Paid'"
            :rejectionComment="ownerBreakdown?.rejectionComment || ownerBreakdown?.comment"
          />

          <!-- Verification Policy Note -->
          <div class="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 space-y-2">
            <div class="font-bold flex items-center gap-1.5 text-indigo-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Unique Castle Verification Policy
            </div>
            <p class="text-indigo-800/80 leading-relaxed">
              Once you submit your bKash phone number and Transaction ID, your payment enters <b>Pending Verification</b>. The building Super Admin will cross-check the transaction and mark your bill as <b>Paid</b>.
            </p>
          </div>
        </div>

        <!-- Right: Resident bKash Payment Form -->
        <div class="lg:col-span-7">
          <BkashPaymentForm
            :flatId="activeFlat?.flatId || ownerBreakdown?.flatId || authStore.flatId"
            :serviceFeeId="activeFlat?.serviceFeeId || ownerBreakdown?.serviceFeeId || selectedMonthFee?.serviceFeeId"
            :flatNumber="flatNumber"
            :ownerName="authStore.user?.name || authStore.user?.username || activeFlat?.ownerName || 'Resident Owner'"
            :userPhoneNumber="authStore.user?.phoneNumber || activeFlat?.phoneNumber || activeFlat?.contact || ''"
            :availableFlats="ownerFlats"
            :month="selectedMonth"
            :year="selectedYear"
            :defaultAmount="ownerBreakdown?.outstandingAmount || ownerBreakdown?.totalCharge || 2500"
            :currentStatus="ownerBreakdown?.status || 'Not Paid'"
            :bkashNumber="bkashPaymentNumber"
            :isAdmin="false"
            :isSubmitting="isSubmitting"
            @submitPayment="handleResidentPaymentSubmit"
            @changeFlat="handleFlatChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/authStore.js'
import { useVerificationStore } from '../stores/verificationStore.js'
import { serviceFeeService } from '../services/serviceFeeService.js'
import { paymentService } from '../services/paymentService.js'
import { dashboardService } from '../services/dashboardService.js'
import ServiceChargeBreakdown from '../components/payments/ServiceChargeBreakdown.vue'
import BkashPaymentForm from '../components/payments/BkashPaymentForm.vue'
import { MONTH_NAMES, getCurrentMonth, getCurrentYear, getAvailableYears, formatDate } from '../utils/date.js'
import { formatCurrency } from '../utils/currency.js'
import { normalizeStatus } from '../utils/paymentStatus.js'

const authStore = useAuthStore()
const verificationStore = useVerificationStore()

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const user = computed(() => authStore.user)

// Resident Owner flats resolution
const ownerFlats = ref([])
const selectedFlatNumber = ref('')
const activeFlat = computed(() => {
  if (selectedFlatNumber.value) {
    const matched = ownerFlats.value.find(f => f.flatNumber?.toUpperCase() === selectedFlatNumber.value.toUpperCase())
    if (matched) return matched
  }
  if (ownerFlats.value.length > 0) return ownerFlats.value[0]
  return null
})
const flatNumber = computed(() => activeFlat.value?.flatNumber || selectedFlatNumber.value || authStore.flatNumber || '')

// Local filters and state
const selectedMonth = ref(getCurrentMonth())
const selectedYear = ref(getCurrentYear())

const availableYears = computed(() => {
  if (isSuperAdmin.value) return getAvailableYears(3)
  const current = getCurrentYear()
  const years = []
  for (let i = current - 3; i <= current; i++) {
    years.push(i)
  }
  return years
})

const selectableMonths = computed(() => {
  if (isSuperAdmin.value) return MONTH_NAMES
  const curIdx = MONTH_NAMES.indexOf(getCurrentMonth())
  const curYear = getCurrentYear()
  const selYear = Number(selectedYear.value)
  if (selYear < curYear) {
    return MONTH_NAMES
  } else if (selYear === curYear) {
    return MONTH_NAMES.filter((_, idx) => idx <= curIdx)
  } else {
    return []
  }
})

const isLoading = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

const bkashPaymentNumber = computed(() => {
  return import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678'
})

// Generate list of all 36 flat numbers (1A to 9D)
const all36FlatsList = computed(() => {
  const flats = []
  for (let f = 1; f <= 9; f++) {
    for (const u of ['A', 'B', 'C', 'D']) {
      flats.push(`${f}${u}`)
    }
  }
  return flats
})

// --- Super Admin Direct Verification State (local) ---
const adminFlats = ref([])
const isVerifying = ref(false)
const verifyForm = reactive({
  flatNumber: '',
  phoneNumber: '',
  transactionId: ''
})

const verifyErrors = reactive({
  flatNumber: '',
  phoneNumber: '',
  transactionId: ''
})

const pendingFlatsList = computed(() => {
  return adminFlats.value.filter(f =>
    normalizeStatus(f.status) === 'Pending Verification' ||
    f.rawPaid === 'P' ||
    normalizeStatus(f.rawPaid) === 'Pending Verification'
  )
})

// --- Resident Owner State (local) ---
const ownerBreakdown = ref(null)
const availableServiceFees = ref([])
const bkashConfig = ref({
  number: import.meta.env.VITE_BKASH_PAYMENT_NUMBER || '01712345678',
  accountType: 'Personal / Merchant',
  instructions: []
})

const selectedMonthFee = computed(() => {
  return availableServiceFees.value.find(f =>
    f.monthName === selectedMonth.value &&
    Number(f.year) === Number(selectedYear.value)
  )
})

function getMonthPublishedTag(monthName) {
  const fee = availableServiceFees.value.find(f =>
    f.monthName === monthName &&
    Number(f.year) === Number(selectedYear.value)
  )
  if (!fee) return ''
  return fee.isPublished ? `(Published: ৳${fee.totalFee})` : '(Draft)'
}

onMounted(async () => {
  if (isSuperAdmin.value) {
    await loadAdminData()
  } else {
    await loadOwnerBreakdownData()
  }
})

async function loadAdminData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    adminFlats.value = await dashboardService.getAllFlatsPayments({
      month: selectedMonth.value,
      year: selectedYear.value
    })
    verificationStore.setPendingCount(pendingFlatsList.value.length, pendingFlatsList.value)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to load flat records.'
  } finally {
    isLoading.value = false
  }
}

async function loadOwnerBreakdownData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    // For resident owners, restrict to current month and earlier
    if (!isSuperAdmin.value) {
      const curIdx = MONTH_NAMES.indexOf(getCurrentMonth())
      const curYear = getCurrentYear()
      const selYear = Number(selectedYear.value)
      if (selYear > curYear) {
        selectedYear.value = curYear
        selectedMonth.value = getCurrentMonth()
      } else if (selYear === curYear && MONTH_NAMES.indexOf(selectedMonth.value) > curIdx) {
        selectedMonth.value = getCurrentMonth()
      }
    }

    // 1. Fetch only the authenticated user's assigned flats from /get-flats
    let flatsList = []
    try {
      flatsList = await dashboardService.getOwnerFlats({
        month: selectedMonth.value,
        year: selectedYear.value
      })
    } catch (flatErr) {
      console.warn('Could not load owner flats from API:', flatErr)
    }

    // Fall back to flats already stored in authStore during login if API returned empty
    if (flatsList.length === 0 && authStore.ownerFlats && authStore.ownerFlats.length > 0) {
      flatsList = authStore.ownerFlats
    }

    // If still empty but the user has a flatNumber in authStore, use that
    if (flatsList.length === 0 && authStore.flatNumber) {
      flatsList = [{
        flatId: authStore.flatId,
        flatNumber: authStore.flatNumber,
        ownerName: authStore.user?.name || authStore.user?.username
      }]
    }

    ownerFlats.value = flatsList

    // Initialize selected flat number to the logged-in user's flat
    if (!selectedFlatNumber.value) {
      selectedFlatNumber.value = authStore.flatNumber || (flatsList.length > 0 ? flatsList[0].flatNumber : '')
    }

    const currentFlat = activeFlat.value
    const currentFlatNum = currentFlat?.flatNumber || selectedFlatNumber.value || authStore.flatNumber || ''

    // DO NOT overwrite the authenticated user's identity or name!
    // Maintain consistent user profile across Dashboard, Pay Bills, and Profile.
    if (currentFlat && (!authStore.flatNumber || !authStore.flatId)) {
      authStore.updateUser({
        flatNumber: authStore.flatNumber || currentFlat.flatNumber,
        flatId: authStore.flatId || currentFlat.flatId
      })
    }

    const [breakdown, config, allFees] = await Promise.all([
      currentFlatNum
        ? serviceFeeService.getServiceChargeBreakdown({
            flatNumber: currentFlatNum,
            month: selectedMonth.value,
            year: selectedYear.value
          })
        : Promise.resolve(null),
      serviceFeeService.getBkashConfig(),
      serviceFeeService.getAllServiceFees().catch(() => [])
    ])

    availableServiceFees.value = allFees || []

    const feeForMonth = availableServiceFees.value.find(f =>
      f.monthName === selectedMonth.value &&
      Number(f.year) === Number(selectedYear.value)
    )

    const resolvedFlatId = currentFlat?.flatId || breakdown?.flatId || authStore.flatId
    const resolvedServiceFeeId = currentFlat?.serviceFeeId || breakdown?.serviceFeeId || feeForMonth?.serviceFeeId
    const resolvedOwnerName = authStore.user?.name || authStore.user?.username || currentFlat?.ownerName || 'Resident Owner'

    if (feeForMonth && feeForMonth.isPublished) {
      const charge = feeForMonth.totalFee
      const isPaid = breakdown?.status === 'Paid' || currentFlat?.status === 'Paid'
      const isPending = breakdown?.status === 'Pending Verification' || currentFlat?.status === 'Pending Verification'
      // Only verified payments contribute to paid amount; pending is awaiting approval
      const paidAmt = isPaid ? charge : 0

      ownerBreakdown.value = {
        ...breakdown,
        flatId: resolvedFlatId,
        serviceFeeId: resolvedServiceFeeId,
        flatNumber: currentFlatNum,
        ownerName: resolvedOwnerName,
        totalCharge: charge,
        paidAmount: paidAmt,
        outstandingAmount: Math.max(0, charge - paidAmt),
        status: isPaid ? 'Paid' : (isPending ? 'Pending Verification' : (breakdown?.status || 'Not Paid')),
        isPublished: true,
        publishedDate: feeForMonth.publishedDate,
        breakdown: breakdown?.breakdown || ((
          feeForMonth.waterFee != null || feeForMonth.caretakerFee != null ||
          feeForMonth.wasteFee != null || feeForMonth.liftFee != null ||
          feeForMonth.electricityFee != null || feeForMonth.otherFee != null
        ) ? {
          water: feeForMonth.waterFee != null ? Number(feeForMonth.waterFee) : null,
          caretaker: feeForMonth.caretakerFee != null ? Number(feeForMonth.caretakerFee) : null,
          waste: feeForMonth.wasteFee != null ? Number(feeForMonth.wasteFee) : null,
          lift: feeForMonth.liftFee != null ? Number(feeForMonth.liftFee) : null,
          electricity: feeForMonth.electricityFee != null ? Number(feeForMonth.electricityFee) : null,
          other: feeForMonth.otherFee != null ? Number(feeForMonth.otherFee) : null
        } : null)
      }

      // Refresh bKash instructions with dynamic amount
      const dynamicConfig = await serviceFeeService.getBkashConfig(charge)
      if (dynamicConfig) bkashConfig.value = dynamicConfig
    } else {
      ownerBreakdown.value = {
        ...breakdown,
        flatId: resolvedFlatId,
        serviceFeeId: resolvedServiceFeeId,
        flatNumber: currentFlatNum,
        ownerName: resolvedOwnerName,
        isPublished: feeForMonth ? feeForMonth.isPublished : false
      }
      if (config) bkashConfig.value = config
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to load service charges.'
  } finally {
    isLoading.value = false
  }
}

async function handleFlatChange(newFlatNumber) {
  selectedFlatNumber.value = newFlatNumber
  await loadOwnerBreakdownData()
}

// Super Admin Direct Verification Handler
function validateDirectVerify() {
  let valid = true
  verifyErrors.flatNumber = ''
  verifyErrors.phoneNumber = ''
  verifyErrors.transactionId = ''

  if (!verifyForm.flatNumber) {
    verifyErrors.flatNumber = 'Please select a flat number'
    valid = false
  }

  const bdPhoneRegex = /^01[3-9]\d{8}$/
  if (!verifyForm.phoneNumber) {
    verifyErrors.phoneNumber = 'Phone number is required'
    valid = false
  } else if (!bdPhoneRegex.test(verifyForm.phoneNumber.trim())) {
    verifyErrors.phoneNumber = 'Enter a valid 11-digit Bangladeshi number'
    valid = false
  }

  if (!verifyForm.transactionId || !verifyForm.transactionId.trim()) {
    verifyErrors.transactionId = 'Transaction ID is required'
    valid = false
  }

  return valid
}

async function handleDirectVerify() {
  if (!validateDirectVerify()) return

  Swal.fire({
    title: `Verify Payment for Flat ${verifyForm.flatNumber}?`,
    html: `
      <div class="text-left text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 space-y-1">
        <div><b>Flat:</b> Flat ${verifyForm.flatNumber}</div>
        <div><b>Phone:</b> ${verifyForm.phoneNumber}</div>
        <div><b>TrxID:</b> <span class="font-mono font-bold">${verifyForm.transactionId.toUpperCase()}</span></div>
        <div><b>Billing Period:</b> ${selectedMonth.value} ${selectedYear.value}</div>
      </div>
      <p class="text-xs text-slate-500 mt-3">Confirming will mark this apartment's service charge as Paid.</p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Verify & Confirm',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b'
  }).then(async (result) => {
    if (result.isConfirmed) {
      isVerifying.value = true
      try {
        await paymentService.verifyPayment(verifyForm.flatNumber, {
          phoneNumber: verifyForm.phoneNumber.trim(),
          transactionId: verifyForm.transactionId.trim().toUpperCase()
        })
        verificationStore.decrementPending(verifyForm.flatNumber)

        Swal.fire({
          icon: 'success',
          title: 'Payment Verified!',
          text: `Flat ${verifyForm.flatNumber} service charge has been confirmed as Paid.`,
          confirmButtonColor: '#059669'
        })

        // Reset form
        verifyForm.flatNumber = ''
        verifyForm.phoneNumber = ''
        verifyForm.transactionId = ''

        await loadAdminData()
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: err.response?.data?.message || err.message || 'Error occurred while verifying payment.',
          confirmButtonColor: '#4f46e5'
        })
      } finally {
        isVerifying.value = false
      }
    }
  })
}

function autoFillAndVerify(flat) {
  verifyForm.flatNumber = flat.flatNumber
  verifyForm.phoneNumber = flat.phoneNumber || ''
  verifyForm.transactionId = flat.transactionId || ''

  // Scroll to form smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function rejectPending(flat) {
  Swal.fire({
    title: `Reject Payment for Flat ${flat.flatNumber}?`,
    text: 'Enter rejection reason (e.g., Mismatched bKash statement, invalid TrxID):',
    input: 'text',
    inputPlaceholder: 'Reason...',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Reject Payment',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    preConfirm: (reason) => {
      if (!reason || !reason.trim()) {
        Swal.showValidationMessage('Please provide a reason')
      }
      return reason
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await paymentService.rejectPayment(flat.flatNumber, result.value, {
          transactionId: flat.transactionId,
          serviceFeePaymentId: flat.serviceFeePaymentId
        })
        verificationStore.decrementPending(flat.flatNumber)
        Swal.fire({
          icon: 'info',
          title: 'Payment Rejected',
          text: `Payment for Flat ${flat.flatNumber} was rejected.`,
          confirmButtonColor: '#4f46e5'
        })
        await loadAdminData()
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Rejection Failed',
          text: err.message || 'Error rejecting payment.',
          confirmButtonColor: '#4f46e5'
        })
      }
    }
  })
}

function copyTrx(trx) {
  if (trx) {
    navigator.clipboard.writeText(trx)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Copied TrxID',
      showConfirmButton: false,
      timer: 1500
    })
  }
}

// Resident Payment Submission Handler
async function handleResidentPaymentSubmit(formData) {
  isSubmitting.value = true
  try {
    const finalFlatId = formData.flatId || activeFlat.value?.flatId || ownerBreakdown.value?.flatId || authStore.flatId
    const finalServiceFeeId = formData.serviceFeeId || activeFlat.value?.serviceFeeId || ownerBreakdown.value?.serviceFeeId || selectedMonthFee.value?.serviceFeeId
    const finalFlatNum = formData.flatNumber || activeFlat.value?.flatNumber || flatNumber.value

    await paymentService.submitPayment({
      ...formData,
      flatId: finalFlatId,
      serviceFeeId: finalServiceFeeId,
      flatNumber: finalFlatNum,
      phoneNumber: formData.phoneNumber || authStore.user?.phoneNumber || ''
    })
    Swal.fire({
      icon: 'success',
      title: 'Payment Submitted!',
      html: `Your payment of <b>৳ ${formData.amount}</b> for <b>Flat ${finalFlatNum}</b> has been received.<br/><span class="text-sm text-slate-500 mt-2 block">Status: Pending Verification by Super Admin</span>`,
      confirmButtonColor: '#4f46e5'
    })
    await loadOwnerBreakdownData()
    await verificationStore.fetchPendingCount()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: err.response?.data?.message || err.message || 'Could not submit payment. Please verify your details.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

