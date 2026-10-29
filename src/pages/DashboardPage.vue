<template>
  <div class="space-y-6">
    <!-- Top Page Header & Report Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ isSuperAdmin ? 'Super Admin Management Dashboard' : 'My Apartment Dashboard' }}
          </h2>
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border tracking-wider"
            :class="isSuperAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
          >
            {{ isSuperAdmin ? 'Super Admin' : 'Resident Owner' }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          {{ isSuperAdmin
            ? 'Monitor service charge collections, verify pending bKash transactions, and print audit reports for all 36 apartments.'
            : 'Current apartment billing details and payment verification status.'
          }}
        </p>
      </div>

      <!-- Action Buttons: PDF Reports -->
      <div class="flex items-center gap-2 shrink-0">
        <AdminMonthlyReport
          v-if="isSuperAdmin"
          :month="selectedMonth"
          :year="selectedYear"
        />
        <OwnerMonthlyReport
          v-else
          :flatNumber="ownerDashboard?.flatNumber || flatNumber"
          :month="currentMonth"
          :year="currentYear"
        />
      </div>
    </div>

    <!-- Filter Bar (Super Admin only) -->
    <PaymentFilter
      v-if="isSuperAdmin"
      :month="selectedMonth"
      :year="selectedYear"
      :search="searchQuery"
      :status="statusFilter"
      :showSearch="isSuperAdmin"
      :showStatusFilter="isSuperAdmin"
      @update:month="selectedMonth = $event"
      @update:year="selectedYear = $event"
      @update:search="searchQuery = $event"
      @update:status="statusFilter = $event"
      @filterChange="loadData"
      @reset="handleResetFilters"
    />

    <!-- Global API Error State -->
    <div v-if="error" class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-xs sm:text-sm font-medium">{{ error }}</span>
      </div>
      <button
        type="button"
        @click="loadData"
        class="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
      >
        Retry
      </button>
    </div>

    <!-- Loading Spinner State -->
    <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center gap-3">
      <svg class="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span class="text-xs text-slate-500 font-medium">Fetching apartment records from API...</span>
    </div>

    <!-- Main Content (when not loading) -->
    <template v-else>
      <!-- SUPER ADMIN DASHBOARD VIEW -->
      <div v-if="isSuperAdmin" class="space-y-6">
        <!-- Summary Cards -->
        <AdminDashboardCards :summary="adminSummary" />

        <!-- 36 Flats Table -->
        <AdminPaymentTable
          :flats="adminFlats"
          @openVerification="handleOpenVerification"
          @openDetails="handleOpenDetails"
          @rejectPayment="handleQuickReject"
        />

        <!-- Payment Verification Modal -->
        <PaymentVerificationModal
          :isOpen="isVerificationModalOpen"
          :flat="selectedFlatForReview"
          :isProcessing="isActionProcessing"
          @close="isVerificationModalOpen = false"
          @verify="executeVerifyPayment"
          @reject="executeRejectPayment"
        />
      </div>

      <!-- OWNER / RESIDENT DASHBOARD VIEW -->
      <div v-else class="space-y-6">
        <!-- Current Month Service Charge Banner -->
        <div class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-bold text-slate-800">
              Billing Period: <span class="text-indigo-600 font-extrabold">{{ currentMonth }} {{ currentYear }}</span>
            </span>
          </div>
          <div class="text-xs text-slate-500">
            Current Month Cycle
          </div>
        </div>

        <!-- Owner Cards: Exactly 3 Items (Flat, Current Month Service Charge, Status) -->
        <OwnerDashboardCards
          :flatNumber="ownerDashboard?.flatNumber || flatNumber"
          :month="currentMonth"
          :year="currentYear"
          :totalServiceCharge="currentSelectedCharge"
          :status="ownerCurrentStatus"
        />

        <!-- My Apartment Monthly Service Charge History Table: Exactly 3 Columns from getflats API -->
        <OwnerPaymentTable
          :flats="ownerFlats"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/authStore.js'
import { useVerificationStore } from '../stores/verificationStore.js'
import { dashboardService } from '../services/dashboardService.js'
import { paymentService } from '../services/paymentService.js'
import { serviceFeeService } from '../services/serviceFeeService.js'
import PaymentFilter from '../components/dashboard/PaymentFilter.vue'
import AdminDashboardCards from '../components/dashboard/AdminDashboardCards.vue'
import AdminPaymentTable from '../components/dashboard/AdminPaymentTable.vue'
import OwnerDashboardCards from '../components/dashboard/OwnerDashboardCards.vue'
import OwnerPaymentTable from '../components/dashboard/OwnerPaymentTable.vue'
import PaymentVerificationModal from '../components/payments/PaymentVerificationModal.vue'
import AdminMonthlyReport from '../components/reports/AdminMonthlyReport.vue'
import OwnerMonthlyReport from '../components/reports/OwnerMonthlyReport.vue'
import { normalizeStatus } from '../utils/paymentStatus.js'
import { getCurrentMonth, getCurrentYear, MONTH_NAMES } from '../utils/date.js'
import { formatCurrency } from '../utils/currency.js'

const authStore = useAuthStore()
const verificationStore = useVerificationStore()

const user = computed(() => authStore.user)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const flatNumber = computed(() => authStore.flatNumber || ownerDashboard.value?.flatNumber || '')

// Filters (local state)
const selectedMonth = ref(getCurrentMonth())
const selectedYear = ref(getCurrentYear())
const searchQuery = ref('')
const statusFilter = ref('ALL')

// Data & Status (local state)
const isLoading = ref(false)
const error = ref(null)

// Super Admin local data
const adminSummary = ref({
  totalFlats: 0,
  paidFlats: 0,
  pendingFlats: 0,
  notPaidFlats: 0,
  totalBilled: 0,
  totalCollected: 0,
  totalOutstanding: 0
})
const adminFlats = ref([])

// Owner local data
const ownerDashboard = ref(null)
const ownerFlats = ref([])
const publishedFees = ref([])

const currentMonth = getCurrentMonth()
const currentYear = getCurrentYear()

// Find upcoming month fee if published by admin
const upcomingPublishedFee = computed(() => {
  const curIdx = MONTH_NAMES.indexOf(currentMonth)
  const nextMonth = MONTH_NAMES[(curIdx + 1) % 12]
  const nextYear = curIdx === 11 ? currentYear + 1 : currentYear

  return publishedFees.value.find(f =>
    f.isPublished &&
    (
      (f.year === nextYear && f.monthName === nextMonth) ||
      (f.year > currentYear) ||
      (f.year === currentYear && MONTH_NAMES.indexOf(f.monthName) > curIdx)
    )
  )
})

const selectedFeeRecord = computed(() => {
  return publishedFees.value.find(f =>
    f.monthName === currentMonth &&
    Number(f.year) === Number(currentYear)
  )
})

const currentSelectedCharge = computed(() => {
  if (selectedFeeRecord.value && selectedFeeRecord.value.totalFee != null) {
    return selectedFeeRecord.value.totalFee
  }
  return ownerDashboard.value?.totalServiceCharge || 2500
})

// Modals & Action processing
const isVerificationModalOpen = ref(false)
const selectedFlatForReview = ref(null)
const isActionProcessing = ref(false)

const ownerCurrentStatus = computed(() => {
  return normalizeStatus(ownerDashboard.value?.paymentStatus || ownerDashboard.value?.status)
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  error.value = null
  try {
    // Load published fee schedules
    try {
      publishedFees.value = await serviceFeeService.getAllServiceFees()
    } catch (feeErr) {
      console.warn('Could not load service fee schedule:', feeErr)
    }

    if (isSuperAdmin.value) {
      const [summary, flats] = await Promise.all([
        dashboardService.getAdminDashboardSummary({
          month: selectedMonth.value,
          year: selectedYear.value
        }),
        dashboardService.getAllFlatsPayments({
          month: selectedMonth.value,
          year: selectedYear.value,
          search: searchQuery.value,
          status: statusFilter.value
        })
      ])
      adminSummary.value = summary
      adminFlats.value = flats

      // Synchronize pending verification badge count
      const pendingList = flats.filter(f => normalizeStatus(f.status) === 'Pending Verification' || f.rawPaid === 'P')
      if (statusFilter.value === 'ALL' && !searchQuery.value) {
        verificationStore.setPendingCount(pendingList.length, pendingList)
      } else if (summary && summary.pendingFlats != null) {
        verificationStore.setPendingCount(summary.pendingFlats)
      }
    } else {
      const dash = await dashboardService.getOwnerDashboard({
        flatNumber: authStore.flatNumber || '',
        month: currentMonth,
        year: currentYear
      })
      ownerDashboard.value = dash
      ownerFlats.value = Array.isArray(dash.flats) && dash.flats.length > 0 ? dash.flats : (dash.flatId || dash.flatNumber ? [dash] : [])
      if (dash?.flatNumber && dash.flatNumber !== '—') {
        authStore.updateUser({
          flatNumber: dash.flatNumber,
          flatId: dash.flatId,
          name: authStore.user?.name || dash.ownerName
        })
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load dashboard data from API.'
  } finally {
    isLoading.value = false
  }
}

function handleResetFilters() {
  selectedMonth.value = getCurrentMonth()
  selectedYear.value = getCurrentYear()
  searchQuery.value = ''
  statusFilter.value = 'ALL'
  loadData()
}

function handleOpenVerification(flat) {
  selectedFlatForReview.value = flat
  isVerificationModalOpen.value = true
}

function handleOpenDetails(flat) {
  selectedFlatForReview.value = flat
  isVerificationModalOpen.value = true
}

async function executeVerifyPayment(target) {
  const flatNum = typeof target === 'object' && target?.flatNumber ? target.flatNumber : target
  const payload = typeof target === 'object' ? target : {}
  isActionProcessing.value = true
  try {
    await paymentService.verifyPayment(flatNum, payload)
    verificationStore.decrementPending(flatNum)
    isVerificationModalOpen.value = false
    Swal.fire({
      icon: 'success',
      title: 'Payment Verified!',
      text: `Flat ${flatNum} service charge has been confirmed as Paid.`,
      confirmButtonColor: '#059669'
    })
    await loadData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Verification Failed',
      text: err.response?.data?.message || err.message || 'Error occurred while verifying payment.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isActionProcessing.value = false
  }
}

async function executeRejectPayment(target) {
  const fNum = typeof target === 'object' && target?.flatNumber ? target.flatNumber : target
  const reason = typeof target === 'object' && target?.reason ? target.reason : 'Payment rejected by administrator'
  const payload = typeof target === 'object' ? target : (selectedFlatForReview.value || {})
  isActionProcessing.value = true
  try {
    await paymentService.rejectPayment(fNum, reason, payload)
    verificationStore.decrementPending(fNum)
    isVerificationModalOpen.value = false
    Swal.fire({
      icon: 'info',
      title: 'Payment Rejected',
      text: `Payment for Flat ${fNum} has been rejected. Status updated.`,
      confirmButtonColor: '#4f46e5'
    })
    await loadData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Rejection Failed',
      text: err.response?.data?.message || err.message || 'Error rejecting payment.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isActionProcessing.value = false
  }
}

function handleQuickReject(flat) {
  selectedFlatForReview.value = flat
  Swal.fire({
    title: `Reject Payment for Flat ${flat.flatNumber}?`,
    text: 'Please specify the rejection reason:',
    input: 'text',
    inputPlaceholder: 'Reason for rejection...',
    showCancelButton: true,
    confirmButtonText: 'Confirm Reject',
    confirmButtonColor: '#e11d48'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await executeRejectPayment({
        flatNumber: flat.flatNumber,
        reason: result.value || 'Verification rejected by administrator'
      })
    }
  })
}
</script>
