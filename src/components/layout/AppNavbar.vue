<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 flex items-center justify-between">
    <!-- Left: Mobile Menu Toggle & Title -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="$emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer relative"
        aria-label="Toggle Navigation Sidebar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <!-- Mobile notification pip when pending > 0 -->
        <span
          v-if="isSuperAdmin && pendingCount > 0"
          class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center ring-2 ring-white"
          title="Pending payment verifications"
        >
          {{ pendingCount }}
        </span>
      </button>

      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">
            Unique Castle
          </h1>
          <p class="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">
            Apartment Service Charge & Utility Management
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Current Period Pill, Verify Alert & Profile Dropdown -->
    <div class="flex items-center gap-3">
      <!-- Quick Pending Verifications Alert Badge for Admin -->
      <router-link
        v-if="isSuperAdmin && pendingCount > 0"
        to="/pay-bills"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-2xs group"
        title="Payment verifications awaiting review"
      >
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Verify</span>
        <span class="inline-flex items-center justify-center min-w-[17px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
          {{ pendingCount }}
        </span>
      </router-link>

      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
        <span>Active Billing: {{ currentMonth }} {{ currentYear }}</span>
      </div>

      <!-- Profile Dropdown Component -->
      <ProfileDropdown />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import ProfileDropdown from './ProfileDropdown.vue'
import { getCurrentMonth, getCurrentYear } from '../../utils/date.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useVerificationStore } from '../../stores/verificationStore.js'

defineEmits(['toggleSidebar'])

const currentMonth = getCurrentMonth()
const currentYear = getCurrentYear()

const authStore = useAuthStore()
const verificationStore = useVerificationStore()

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const pendingCount = computed(() => verificationStore.pendingCount)
</script>
