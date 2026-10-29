<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
      @click="$emit('closeSidebar')"
    ></div>

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand Header in Sidebar -->
      <div class="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span class="text-sm font-extrabold tracking-wide text-white">UNIQUE CASTLE</span>
            <span class="block text-[10px] text-indigo-400 font-medium">Apartment Management Portal</span>
          </div>
        </div>

        <!-- Close button on mobile -->
        <button
          type="button"
          @click="$emit('closeSidebar')"
          class="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- User Role Card in Sidebar -->
      <div class="p-4 mx-3 my-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            {{ isSuperAdmin ? 'SA' : (user?.flatNumber || 'FL') }}
          </div>
          <div class="overflow-hidden">
            <div class="text-xs font-bold text-white truncate">{{ user?.name || user?.username }}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span
                class="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase"
                :class="isSuperAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'"
              >
                {{ isSuperAdmin ? 'SUPER ADMIN' : `FLAT ${user?.flatNumber || 'OWNER'}` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Menu: Exactly Two Primary Menu Items -->
      <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Navigation
        </div>

        <!-- 1. Dashboard -->
        <router-link
          to="/dashboard"
          @click="$emit('closeSidebar')"
          v-slot="{ isActive }"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group"
          :class="route.name === 'Dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <svg class="w-5 h-5 transition" :class="route.name === 'Dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="flex-1">Dashboard</span>
        </router-link>

        <!-- 2. Verify Payments (for Super Admin) / Pay Bills (for Owner) -->
        <router-link
          to="/pay-bills"
          @click="$emit('closeSidebar')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group"
          :class="route.name === 'PayBills' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <!-- Shield Check icon for Admin / Wallet icon for Owner -->
          <svg v-if="isSuperAdmin" class="w-5 h-5 transition" :class="route.name === 'PayBills' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <svg v-else class="w-5 h-5 transition" :class="route.name === 'PayBills' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span class="flex-1">{{ isSuperAdmin ? 'Verify' : 'Pay Bills' }}</span>
          <template v-if="isSuperAdmin">
            <!-- Dynamic Notification Badge for Super Admin beside Verify menu -->
            <span
              v-if="pendingCount > 0"
              class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400/40"
              title="Pending payment verifications awaiting review"
            >
              {{ pendingCount }}
            </span>
            <span
              v-else
              class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/60"
              title="No pending verifications"
            >
              0
            </span>
          </template>
          <span v-else class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-600/30 text-pink-300 border border-pink-500/30">
            bKash
          </span>
        </router-link>

        <!-- 3. Flat Member Management (Super Admin Only) -->
        <router-link
          v-if="isSuperAdmin"
          to="/flat-members"
          @click="$emit('closeSidebar')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group"
          :class="route.name === 'FlatMemberManagement' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <svg class="w-5 h-5 transition" :class="route.name === 'FlatMemberManagement' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span class="flex-1">Flat Member Management</span>
        </router-link>

        <!-- 4. Monthly Service Charges (Admin View Only) -->
        <router-link
          v-if="isSuperAdmin"
          to="/monthly-service-charges"
          @click="$emit('closeSidebar')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group"
          :class="route.name === 'MonthlyServiceCharges' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <svg class="w-5 h-5 transition" :class="route.name === 'MonthlyServiceCharges' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="flex-1">Monthly Service Charges</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            3 Mo
          </span>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
        <div>Unique Castle Apartments</div>
        <div class="text-slate-600 mt-0.5">Residential Portal • Unique Castle v1.0</div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'
import { useVerificationStore } from '../../stores/verificationStore.js'

defineProps({
  isOpen: Boolean
})

defineEmits(['closeSidebar'])

const route = useRoute()
const authStore = useAuthStore()
const verificationStore = useVerificationStore()

const user = computed(() => authStore.user)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const pendingCount = computed(() => verificationStore.pendingCount)

onMounted(() => {
  if (isSuperAdmin.value) {
    verificationStore.fetchPendingCount()
  }
})
</script>

