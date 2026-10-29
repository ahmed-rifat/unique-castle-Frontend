<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Sidebar -->
    <AppSidebar :isOpen="isSidebarOpen" @closeSidebar="isSidebarOpen = false" />

    <!-- Main Content Area -->
    <div class="lg:pl-64 flex flex-col flex-1">
      <!-- Navbar -->
      <AppNavbar @toggleSidebar="isSidebarOpen = !isSidebarOpen" />

      <!-- Page View Area -->
      <main class="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <router-view />
      </main>

      <!-- App Footer -->
      <footer class="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        Unique Castle &copy; {{ new Date().getFullYear() }}. Apartment Service Charge Management. All rights reserved.
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppNavbar from '../components/layout/AppNavbar.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useVerificationStore } from '../stores/verificationStore.js'

const isSidebarOpen = ref(false)
const route = useRoute()
const authStore = useAuthStore()
const verificationStore = useVerificationStore()

function handleWindowFocus() {
  if (authStore.isSuperAdmin) {
    verificationStore.fetchPendingCount()
  }
}

onMounted(() => {
  if (authStore.isSuperAdmin) {
    verificationStore.startPolling(25000)
    window.addEventListener('focus', handleWindowFocus)
  }
})

onUnmounted(() => {
  verificationStore.stopPolling()
  window.removeEventListener('focus', handleWindowFocus)
})

// Refresh count automatically when admin navigates routes
watch(
  () => route.path,
  () => {
    if (authStore.isSuperAdmin) {
      verificationStore.fetchPendingCount()
    }
  }
)

// React to admin auth state changes
watch(
  () => authStore.isSuperAdmin,
  (isAdmin) => {
    if (isAdmin) {
      verificationStore.startPolling(25000)
      window.addEventListener('focus', handleWindowFocus)
    } else {
      verificationStore.stopPolling()
      window.removeEventListener('focus', handleWindowFocus)
    }
  }
)
</script>
