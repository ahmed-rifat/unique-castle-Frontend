<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page Header -->
    <div class="pb-2 border-b border-slate-200/80">
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
        My Profile & Account Settings
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">
        Manage your personal contact information, view your apartment occupancy record, and securely update your password.
      </p>
    </div>

    <!-- Profile Overview Banner Card -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Profile Header Banner -->
      <div class="h-28 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-6 flex items-end justify-between relative">
        <div class="absolute -bottom-8 left-6">
          <div class="w-18 h-18 rounded-2xl bg-white p-1 shadow-lg">
            <div class="w-full h-full rounded-xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center">
              {{ initials }}
            </div>
          </div>
        </div>

        <div class="ml-28 text-white hidden sm:block">
          <h3 class="font-bold text-lg leading-tight">{{ user?.name || user?.username }}</h3>
          <p class="text-xs text-indigo-200">
            {{ isSuperAdmin ? 'Chief Building Administrator' : `Apartment Flat ${user?.flatNumber || 'Resident'}` }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs"
            :class="isSuperAdmin ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'"
          >
            {{ isSuperAdmin ? 'Super Admin' : 'Resident Owner' }}
          </span>
        </div>
      </div>

      <!-- Quick Status Badges Row -->
      <div class="pt-12 px-6 sm:px-8 pb-4 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-1.5 text-xs text-slate-600">
          <span class="font-bold">Apartment:</span>
          <span class="px-2 py-0.5 rounded-md font-mono font-bold bg-white border border-slate-200 text-slate-800">
            Flat {{ user?.flatNumber || (isSuperAdmin ? 'Management Office' : 'Not assigned') }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 text-xs text-slate-600">
          <span class="font-bold">Occupancy:</span>
          <span
            class="px-2 py-0.5 rounded-md text-[11px] font-bold border"
            :class="currentMember?.occupancyStatus === 'Not Moved In' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
          >
            {{ currentMember?.occupancyStatus || 'Moved In' }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 text-xs text-slate-600">
          <span class="font-bold">Service Charge:</span>
          <span
            class="px-2 py-0.5 rounded-md text-[11px] font-bold border"
            :class="currentMember?.billingEligibility === 'Ineligible' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'"
          >
            {{ currentMember?.billingEligibility === 'Ineligible' ? 'Exempt (Not Moved In)' : 'Eligible' }}
          </span>
        </div>
      </div>
    </div>

    <!-- CARD 1: PROFILE & CONTACT INFORMATION (Editable by member) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
      <div class="mb-5 pb-3 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personal & Contact Information
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          You can update your personal name, contact phone number, and email address.
        </p>
      </div>

      <form @submit.prevent="handleSaveProfile" class="space-y-5" novalidate>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Full Name (Editable) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              v-model="profileForm.name"
              placeholder="e.g. John Doe"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <!-- Username / Login ID (Editable) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Username / Login ID <span class="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              v-model="profileForm.username"
              required
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <!-- Phone Number (Editable) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span class="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              v-model="profileForm.phoneNumber"
              required
              placeholder="01XXXXXXXXX"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <!-- Email Address (Editable) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              v-model="profileForm.email"
              placeholder="name@example.com"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <!-- Assigned Flat (Strictly Readonly for Member) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Assigned Flat Number</span>
              <span class="text-[10px] text-slate-400 font-normal">ðŸ”’ Admin Managed</span>
            </label>
            <input
              type="text"
              :value="user?.flatNumber || (isSuperAdmin ? 'Management Office' : 'Not assigned')"
              disabled
              class="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold cursor-not-allowed"
            />
          </div>

          <!-- Apartment Complex (Strictly Readonly) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Building / Property</span>
              <span class="text-[10px] text-slate-400 font-normal">ðŸ”’ Fixed</span>
            </label>
            <input
              type="text"
              value="Unique Castle Apartments"
              disabled
              class="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-not-allowed"
            />
          </div>
        </div>

        <div class="flex items-center justify-end pt-3">
          <button
            type="submit"
            :disabled="isSavingProfile"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg v-if="isSavingProfile" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSavingProfile ? 'Saving Details...' : 'Save Profile Information' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- CARD 2: CHANGE PASSWORD (Requirement 9: Dedicated Password Change) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
      <div class="mb-5 pb-3 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Change Account Password
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Enter your current password followed by your new password to securely update your credentials.
        </p>
      </div>

      <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-xl" novalidate>
        <!-- Current Password -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Current Password <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <input
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="pwdForm.currentPassword"
              required
              placeholder="Enter your current password"
              class="w-full pl-3.5 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {{ showCurrentPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸' }}
            </button>
          </div>
        </div>

        <!-- New Password & Confirm Password -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              New Password <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="pwdForm.newPassword"
                required
                minlength="6"
                placeholder="At least 6 characters"
                class="w-full pl-3.5 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {{ showNewPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm New Password <span class="text-rose-500">*</span>
            </label>
            <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="pwdForm.confirmPassword"
              required
              minlength="6"
              placeholder="Re-type new password"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
            />
          </div>
        </div>

        <!-- Password mismatch error warning -->
        <p
          v-if="pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword"
          class="text-xs text-rose-600 font-semibold"
        >
          New password and confirmation password do not match.
        </p>

        <div class="flex items-center justify-end pt-3">
          <button
            type="submit"
            :disabled="isChangingPassword || (pwdForm.newPassword !== pwdForm.confirmPassword)"
            class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg v-if="isChangingPassword" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isChangingPassword ? 'Updating Password...' : 'Change Password' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { userService } from '../services/userService.js'
import { memberService } from '../services/memberService.js'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const isSavingProfile = ref(false)
const isChangingPassword = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const currentMember = ref(null)

const profileForm = reactive({
  name: user.value?.name || '',
  username: user.value?.username || '',
  phoneNumber: user.value?.phoneNumber || '',
  email: user.value?.email || ''
})

const pwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Keep form synced if user store updates
watch(
  user,
  (newUser) => {
    if (newUser) {
      if (!profileForm.username && newUser.username) profileForm.username = newUser.username
      if (!profileForm.phoneNumber && newUser.phoneNumber) profileForm.phoneNumber = newUser.phoneNumber
      if (!profileForm.name && newUser.name) profileForm.name = newUser.name
      if (!profileForm.email && newUser.email) profileForm.email = newUser.email
    }
  },
  { immediate: true }
)

const initials = computed(() => {
  const name = user.value?.name || user.value?.username || 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

onMounted(async () => {
  try {
    const all = await memberService.getAllMembers()
    const found = all.find(m =>
      (user.value?.flatNumber && m.flatNumber?.toUpperCase() === user.value.flatNumber.toUpperCase()) ||
      (user.value?.phoneNumber && m.phoneNumber === user.value.phoneNumber) ||
      (user.value?.username && m.username?.toLowerCase() === user.value.username.toLowerCase())
    )
    if (found) currentMember.value = found
  } catch (e) {
    // ignore
  }
})

// Handler 1: Update Profile Details
async function handleSaveProfile() {
  if (!profileForm.phoneNumber || !profileForm.phoneNumber.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Phone Number',
      text: 'Phone number is required.',
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  isSavingProfile.value = true
  try {
    const payload = {
      username: profileForm.username.trim(),
      phoneNumber: profileForm.phoneNumber.trim(),
      name: profileForm.name?.trim() || '',
      email: profileForm.email?.trim() || '',
      flatNumber: user.value?.flatNumber || ''
    }

    const updated = await userService.updateProfile(payload)
    authStore.updateUser(updated)

    // Also sync to member registry
    if (currentMember.value) {
      await memberService.updateMember(currentMember.value.id, {
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        email: payload.email
      })
    }

    Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      text: 'Your personal and contact information was successfully saved.',
      confirmButtonColor: '#059669'
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: err.response?.data?.message || err.message || 'Could not update profile information.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isSavingProfile.value = false
  }
}

// Handler 2: Change Password (Requirement 9)
async function handleChangePassword() {
  if (!pwdForm.currentPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Current Password Required',
      text: 'Please enter your current password to authorize this change.',
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid New Password',
      text: 'New password must be at least 6 characters long.',
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Password Mismatch',
      text: 'New password and confirmation do not match.',
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  isChangingPassword.value = true
  try {
    // Send password update to backend with current password verification
    await userService.changePassword({
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword,
      confirmPassword: pwdForm.confirmPassword
    })

    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''

    Swal.fire({
      icon: 'success',
      title: 'Password Changed!',
      text: 'Your account password has been securely updated.',
      confirmButtonColor: '#059669'
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Password Change Failed',
      text: err.response?.data?.message || err.message || 'Could not change password.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isChangingPassword.value = false
  }
}
</script>

