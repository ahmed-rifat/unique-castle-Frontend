<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer select-none border border-transparent hover:border-slate-200"
    >
      <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
        {{ initials }}
      </div>
      <div class="text-left hidden sm:block">
        <div class="text-xs font-bold text-slate-800 leading-tight">
          {{ user?.name || user?.username || 'User' }}
        </div>
        <div class="text-[10px] text-slate-500 font-medium">
          {{ isSuperAdmin ? 'Super Admin' : `Flat ${user?.flatNumber || 'Owner'}` }}
        </div>
      </div>
      <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
    >
      <!-- User info header -->
      <div class="px-4 py-3 border-b border-slate-100">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
        <p class="text-sm font-bold text-slate-800 truncate mt-0.5">
          {{ user?.name || user?.username }}
        </p>
        <p class="text-xs text-slate-500 truncate">{{ user?.email || user?.phoneNumber || 'No email registered' }}</p>

        <div class="mt-2 flex items-center gap-1.5">
          <span
            class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border"
            :class="isSuperAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'"
          >
            {{ isSuperAdmin ? 'SUPER ADMIN' : 'FLAT OWNER' }}
          </span>
          <span v-if="user?.flatNumber && !isSuperAdmin" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Flat {{ user.flatNumber }}
          </span>
        </div>
      </div>

      <!-- Links -->
      <div class="py-1">
        <router-link
          v-if="isSuperAdmin"
          to="/flat-members"
          @click="isOpen = false"
          class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Flat Member Management
        </router-link>

        <router-link
          to="/profile"
          @click="isOpen = false"
          class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile & Flat Details
        </router-link>
      </div>

      <!-- Logout -->
      <div class="border-t border-slate-100 pt-1">
        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
        >
          <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const router = useRouter()
const isOpen = ref(false)
const dropdownRef = ref(null)

const user = computed(() => authStore.user)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const initials = computed(() => {
  const name = user.value?.name || user.value?.username || 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleLogout() {
  isOpen.value = false
  Swal.fire({
    title: 'Log out of Unique Castle?',
    text: 'You will need to sign in again to view flat records and manage payments.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Log Out',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#64748b'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await authStore.logout()
      router.push('/login')
    }
  })
}
</script>
