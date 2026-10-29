<template>
  <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <!-- Search Input -->
      <div v-if="showSearch" class="lg:col-span-2">
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">
          Search Flats / Owners
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search flat number, owner, or Trx ID..."
            class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
          />
        </div>
      </div>

      <!-- Month Selector -->
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">
          Billing Month
        </label>
        <select
          v-model="selectedMonth"
          class="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
        >
          <option v-for="m in MONTH_NAMES" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <!-- Year Selector -->
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">
          Billing Year
        </label>
        <select
          v-model="selectedYear"
          class="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
        >
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- Payment Status Filter -->
      <div v-if="showStatusFilter">
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">
          Payment Status
        </label>
        <select
          v-model="statusFilter"
          class="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
        >
          <option value="ALL">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Not Paid">Not Paid</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Exempt (Not Moved In)">Exempt (Not Moved In)</option>
        </select>
      </div>

      <!-- Reset Filter Button -->
      <div class="flex items-center">
        <button
          type="button"
          @click="resetFilters"
          class="w-full py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MONTH_NAMES, getAvailableYears, getCurrentMonth, getCurrentYear } from '../../utils/date.js'

const props = defineProps({
  month: {
    type: String,
    default: () => getCurrentMonth()
  },
  year: {
    type: [String, Number],
    default: () => getCurrentYear()
  },
  search: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'ALL'
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showStatusFilter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:month',
  'update:year',
  'update:search',
  'update:status',
  'filterChange',
  'reset'
])

const availableYears = getAvailableYears(3)

const selectedMonth = computed({
  get: () => props.month,
  set: (val) => {
    emit('update:month', val)
    emit('filterChange')
  }
})

const selectedYear = computed({
  get: () => props.year,
  set: (val) => {
    emit('update:year', val)
    emit('filterChange')
  }
})

const searchQuery = computed({
  get: () => props.search,
  set: (val) => {
    emit('update:search', val)
    emit('filterChange')
  }
})

const statusFilter = computed({
  get: () => props.status,
  set: (val) => {
    emit('update:status', val)
    emit('filterChange')
  }
})

function resetFilters() {
  emit('update:month', getCurrentMonth())
  emit('update:year', getCurrentYear())
  emit('update:search', '')
  emit('update:status', 'ALL')
  emit('reset')
  emit('filterChange')
}
</script>

