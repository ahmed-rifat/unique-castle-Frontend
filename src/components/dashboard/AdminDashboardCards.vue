<template>
  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    <!-- Total Flats -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Apartments</span>
        <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
      <div class="text-2xl font-bold text-slate-800">{{ summary.totalFlats || 36 }}</div>
      <div class="text-[11px] text-slate-400 mt-1 font-medium">9 Floors • 4 Units/Fl.</div>
    </div>

    <!-- Paid Flats -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Paid</span>
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="text-2xl font-bold text-emerald-600">{{ summary.paidFlats ?? 0 }}</div>
      <div class="text-[11px] text-emerald-600 mt-1 font-medium">Verified collections</div>
    </div>

    <!-- Pending Verification -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
        <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="text-2xl font-bold text-amber-600">{{ summary.pendingFlats ?? 0 }}</div>
      <div class="text-[11px] text-amber-600 mt-1 font-medium">{{ summary.totalPending ? formatCurrency(summary.totalPending) + ' submitted' : 'Needs admin review' }}</div>
    </div>

    <!-- Not Paid Flats -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-rose-200 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Dues</span>
        <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
      <div class="text-2xl font-bold text-rose-600">{{ summary.notPaidFlats ?? 0 }}</div>
      <div class="text-[11px] text-rose-600 mt-1 font-medium">Awaiting payment</div>
    </div>

    <!-- Total Monthly Charge -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed</span>
        <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div class="text-xl font-bold text-slate-800">{{ formatCurrency(summary.totalBilled) }}</div>
      <div class="text-[11px] text-slate-400 mt-1 font-medium">Across all 36 apartments</div>
    </div>

    <!-- Total Collected -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collected</span>
        <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <div class="text-xl font-bold text-emerald-700">{{ formatCurrency(summary.totalCollected) }}</div>
      <div class="text-[11px] text-rose-600 mt-1 font-semibold">Due: {{ formatCurrency(summary.totalOutstanding) }}</div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '../../utils/currency.js'

defineProps({
  summary: {
    type: Object,
    default: () => ({
      totalFlats: 36,
      paidFlats: 0,
      pendingFlats: 0,
      notPaidFlats: 0,
      totalBilled: 0,
      totalCollected: 0,
      totalOutstanding: 0
    })
  }
})
</script>
