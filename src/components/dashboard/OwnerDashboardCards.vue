<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- 1. Flat -->
    <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flat</span>
        <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
          APT
        </div>
      </div>
      <div class="text-2xl font-bold text-slate-800">
        {{ formattedFlat }}
      </div>
    </div>

    <!-- 2. Current Month Service Charge -->
    <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Month Service Charge</span>
        <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div class="text-lg sm:text-xl font-bold text-slate-800">
        {{ month || currentMonth }} {{ year || currentYear }}: {{ formatCurrency(totalServiceCharge != null ? totalServiceCharge : 2500) }}
      </div>
    </div>

    <!-- 3. Status -->
    <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition flex flex-col justify-between">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div>
        <PaymentStatusBadge :status="status" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../../utils/currency.js'
import { getCurrentMonth, getCurrentYear } from '../../utils/date.js'
import PaymentStatusBadge from './PaymentStatusBadge.vue'

const props = defineProps({
  flatNumber: {
    type: String,
    default: ''
  },
  month: {
    type: String,
    default: ''
  },
  year: {
    type: [String, Number],
    default: ''
  },
  totalServiceCharge: {
    type: [Number, String],
    default: 2500
  },
  status: {
    type: String,
    default: 'Not Paid'
  }
})

const currentMonth = getCurrentMonth()
const currentYear = getCurrentYear()

const formattedFlat = computed(() => {
  if (!props.flatNumber) return '—'
  const val = String(props.flatNumber).trim()
  return val.toLowerCase().startsWith('flat') ? val : `Flat ${val}`
})
</script>
