<template>
  <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          Service Charge Statement
          <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            Flat {{ flatNumber }}
          </span>
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Official statement for {{ month }} {{ year }}
        </p>
      </div>

      <PaymentStatusBadge :status="status" />
    </div>

    <!-- Rejection Note if status is Rejected -->
    <div
      v-if="status === 'Rejected' && (rejectionComment || comment)"
      class="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5 shadow-2xs"
    >
      <svg class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span class="font-bold text-rose-800">Rejection Reason:</span> {{ rejectionComment || comment }}
      </div>
    </div>

    <!-- Exemption Note if status is Exempt (Not Moved In) -->
    <div
      v-if="status === 'Exempt (Not Moved In)'"
      class="mx-5 mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5 shadow-2xs"
    >
      <svg class="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span class="font-bold text-indigo-950">Service Charge Exemption:</span>
        Flat {{ flatNumber }} is recorded as <b>Not Moved In</b> for this billing month. You are exempt from monthly service charges and no payment is required.
      </div>
    </div>

    <!-- Charges Breakdown List -->
    <div class="p-5">
      <!-- If breakdown components exist from database, show them -->
      <div v-if="hasBreakdownData && breakdownItems.length > 0" class="space-y-3">
        <div
          v-for="item in breakdownItems"
          :key="item.key"
          class="flex items-center justify-between py-2 border-b border-slate-100 text-sm"
        >
          <div class="flex items-center gap-2 text-slate-700">
            <span class="w-2 h-2 rounded-full" :class="item.dotColor"></span>
            {{ item.label }}
          </div>
          <span class="font-semibold text-slate-800">{{ formatCurrency(item.amount) }}</span>
        </div>
      </div>

      <!-- Transparent Empty State when breakdown is not stored in database -->
      <div
        v-else
        class="py-6 px-4 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl text-center"
      >
        <div class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-400 mb-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-700">Breakdown Unavailable</p>
        <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Itemized service charge breakdown has not been configured in the database for this billing cycle.
        </p>
      </div>

      <!-- Financial Totals Block -->
      <div class="mt-6 pt-4 border-t-2 border-slate-200 bg-slate-50/80 p-4 rounded-xl space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Total Monthly Charge:</span>
          <span class="font-bold text-slate-900 text-base">{{ formatCurrency(totalCharge) }}</span>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Previously Paid:</span>
          <span class="font-bold text-emerald-600">{{ formatCurrency(paidAmount) }}</span>
        </div>

        <div class="flex items-center justify-between text-base pt-2 border-t border-slate-200 font-bold">
          <span class="text-slate-800">Net Outstanding:</span>
          <span :class="outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'">
            {{ formatCurrency(outstandingAmount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../../utils/currency.js'
import PaymentStatusBadge from '../dashboard/PaymentStatusBadge.vue'

const props = defineProps({
  flatNumber: String,
  month: String,
  year: [String, Number],
  breakdown: {
    type: Object,
    default: null
  },
  totalCharge: {
    type: Number,
    default: 2500
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  outstandingAmount: {
    type: Number,
    default: 2500
  },
  status: {
    type: String,
    default: 'Not Paid'
  },
  rejectionComment: String,
  comment: String
})

const hasBreakdownData = computed(() => {
  if (!props.breakdown || typeof props.breakdown !== 'object') return false
  return (
    props.breakdown.water != null ||
    props.breakdown.caretaker != null ||
    props.breakdown.waste != null ||
    props.breakdown.lift != null ||
    props.breakdown.electricity != null ||
    props.breakdown.other != null
  )
})

const breakdownItems = computed(() => {
  if (!hasBreakdownData.value) return []
  const b = props.breakdown
  const list = []
  if (b.water != null) {
    list.push({ key: 'water', label: 'Water Bills', dotColor: 'bg-blue-500', amount: Number(b.water) })
  }
  if (b.caretaker != null) {
    list.push({ key: 'caretaker', label: 'Caretaker Fee', dotColor: 'bg-emerald-500', amount: Number(b.caretaker) })
  }
  if (b.waste != null) {
    list.push({ key: 'waste', label: 'Waste Bills', dotColor: 'bg-amber-500', amount: Number(b.waste) })
  }
  if (b.lift != null) {
    list.push({ key: 'lift', label: 'Lift Maintenance', dotColor: 'bg-purple-500', amount: Number(b.lift) })
  }
  if (b.electricity != null) {
    list.push({ key: 'electricity', label: 'Electricity & Generator (Common)', dotColor: 'bg-cyan-500', amount: Number(b.electricity) })
  }
  if (b.other != null) {
    list.push({ key: 'other', label: 'Others', dotColor: 'bg-slate-400', amount: Number(b.other) })
  }
  return list
})
</script>
