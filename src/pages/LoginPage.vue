<template>
  <div class="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Decorative background glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <!-- Logo & Branding -->
      <div class="flex justify-center">
        <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
      <h2 class="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
        Unique Castle Management
      </h2>
      <p class="mt-1 text-center text-xs text-indigo-300 font-medium">
        Apartment Service Charge & Utility Management Portal
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
      <div class="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
        
        <!-- Auth Mode Switcher -->
        <div class="flex border-b border-slate-200 mb-6">
          <button
            type="button"
            @click="switchAuthMode('login')"
            :class="[
              'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition cursor-pointer',
              authMode === 'login'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            ]"
          >
            Sign In
          </button>
          <button
            type="button"
            @click="switchAuthMode('register')"
            :class="[
              'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition cursor-pointer',
              authMode === 'register'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            ]"
          >
            Register Account
          </button>
        </div>

        <!-- ==================== SIGN IN VIEW ==================== -->
        <div v-if="authMode === 'login'">
          <div class="mb-5">
            <h3 class="text-lg font-bold text-slate-800">Sign In to Your Account</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Enter your apartment credentials to access service charges and payments.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin" novalidate>
            <!-- Phone Number / Account ID -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number or Username <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="loginUsername"
                  @input="loginErrors.username = ''"
                  autocomplete="username"
                  placeholder="e.g. 01712345678 or admin"
                  :class="[
                    'w-full pl-9 pr-3 py-2 text-sm rounded-lg transition focus:outline-none focus:ring-2',
                    loginErrors.username
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white'
                  ]"
                />
              </div>
              <p v-if="loginErrors.username" class="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ loginErrors.username }}</span>
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Password <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  :type="showLoginPassword ? 'text' : 'password'"
                  v-model="loginPassword"
                  @input="loginErrors.password = ''"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  :class="[
                    'w-full pl-9 pr-10 py-2 text-sm rounded-lg transition focus:outline-none focus:ring-2',
                    loginErrors.password
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white'
                  ]"
                />
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg v-if="!showLoginPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                </button>
              </div>
              <p v-if="loginErrors.password" class="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ loginErrors.password }}</span>
              </p>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ isLoading ? 'Signing In...' : 'Sign In to Dashboard' }}</span>
              </button>
            </div>
          </form>

          <!-- Quick Demo Accounts Helper -->
          <div class="mt-6 pt-5 border-t border-slate-100">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Demo Credentials (1-Click Fill)
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                @click="fillDemo('01711000001', 'password123')"
                class="p-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left transition cursor-pointer"
              >
                <div class="font-bold text-purple-900">Super Admin</div>
                <div class="text-[10px] text-purple-700 font-mono mt-0.5">01711000001 / password123</div>
              </button>

              <button
                type="button"
                @click="fillDemo('01712345678', 'password123')"
                class="p-2 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-left transition cursor-pointer"
              >
                <div class="font-bold text-indigo-900">Flat Owner (4B)</div>
                <div class="text-[10px] text-indigo-700 font-mono mt-0.5">01712345678 / password123</div>
              </button>

              <button
                type="button"
                @click="fillDemo('01799999992', 'password123')"
                class="p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition cursor-pointer"
              >
                <div class="font-bold text-emerald-900">Flat Owner (1C)</div>
                <div class="text-[10px] text-emerald-700 font-mono mt-0.5">01799999992 / password123</div>
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== REGISTRATION VIEW ==================== -->
        <div v-else>
          <div class="mb-5">
            <h3 class="text-lg font-bold text-slate-800">Register Resident Account</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Create a new resident account for Unique Castle service charges.
            </p>
          </div>

          <!-- General Alert if returned by API -->
          <div
            v-if="regErrors._general"
            class="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2"
          >
            <svg class="w-4 h-4 shrink-0 mt-0.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>{{ regErrors._general }}</div>
          </div>

          <form class="space-y-3.5" @submit.prevent="handleRegister" novalidate>
            <!-- Username (Required) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Username / Login ID <span class="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                v-model="regForm.username"
                @input="clearRegError('username')"
                placeholder="e.g. john_doe"
                autocomplete="username"
                :class="[
                  'w-full px-3 py-2 text-sm rounded-lg font-mono transition focus:outline-none focus:ring-2',
                  regErrors.username
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white'
                ]"
              />
              <p v-if="regErrors.username" class="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ regErrors.username }}</span>
              </p>
            </div>

            <!-- Phone Number (Required) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span class="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                v-model="regForm.phoneNumber"
                @input="clearRegError('phoneNumber')"
                placeholder="01XXXXXXXXX"
                autocomplete="tel"
                :class="[
                  'w-full px-3 py-2 text-sm rounded-lg font-mono transition focus:outline-none focus:ring-2',
                  regErrors.phoneNumber
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white'
                ]"
              />
              <p v-if="regErrors.phoneNumber" class="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ regErrors.phoneNumber }}</span>
              </p>
            </div>

            <!-- Password & Confirm Password (Grid) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Password (Required) -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative">
                  <input
                    :type="showRegPassword ? 'text' : 'password'"
                    v-model="regForm.password"
                    @input="clearRegError('password')"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    :class="[
                      'w-full pl-3 pr-9 py-2 text-sm rounded-lg transition focus:outline-none focus:ring-2',
                      regErrors.password
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white'
                    ]"
                  />
                  <button
                    type="button"
                    @click="showRegPassword = !showRegPassword"
                    class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <svg v-if="!showRegPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  </button>
                </div>
                <p v-if="regErrors.password" class="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ regErrors.password }}</span>
                </p>
              </div>

              <!-- Confirm Password (Required) -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative">
                  <input
                    :type="showRegConfirmPassword ? 'text' : 'password'"
                    v-model="regForm.confirmPassword"
                    @input="clearRegError('confirmPassword')"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    :class="[
                      'w-full pl-3 pr-9 py-2 text-sm rounded-lg transition focus:outline-none focus:ring-2',
                      regErrors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white'
                    ]"
                  />
                  <button
                    type="button"
                    @click="showRegConfirmPassword = !showRegConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <svg v-if="!showRegConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  </button>
                </div>
                <p v-if="regErrors.confirmPassword" class="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ regErrors.confirmPassword }}</span>
                </p>
              </div>
            </div>

            <!-- Full Name (Optional) & Flat Number (Optional) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  v-model="regForm.name"
                  @input="clearRegError('name')"
                  placeholder="e.g. John Doe"
                  class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Flat Number
                </label>
                <input
                  type="text"
                  v-model="regForm.flatNumber"
                  @input="clearRegError('flatNumber')"
                  placeholder="e.g. 4B"
                  class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <!-- Email (Optional) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                v-model="regForm.email"
                @input="clearRegError('email')"
                placeholder="name@example.com"
                autocomplete="email"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ isLoading ? 'Registering Account...' : 'Create Account' }}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- Footer Note -->
      <p class="mt-4 text-center text-xs text-slate-500">
        Backend Endpoint Configured: <span class="font-mono text-slate-400">{{ apiBaseUrl }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/authService.js'
import { useAuthStore } from '../stores/authStore.js'
import { parseBackendValidationErrors } from '../utils/formValidation.js'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const authMode = ref('login') // 'login' | 'register'
const isLoading = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// Login state
const loginUsername = ref('01711000001')
const loginPassword = ref('password123')
const showLoginPassword = ref(false)
const loginErrors = reactive({
  username: '',
  password: ''
})

// Registration state
const showRegPassword = ref(false)
const showRegConfirmPassword = ref(false)
const regForm = reactive({
  username: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  flatNumber: ''
})

const regErrors = reactive({
  username: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  flatNumber: '',
  _general: ''
})

function switchAuthMode(mode) {
  authMode.value = mode
  // Clear any existing errors when switching modes
  loginErrors.username = ''
  loginErrors.password = ''
  clearAllRegErrors()
}

function clearAllRegErrors() {
  regErrors.username = ''
  regErrors.phoneNumber = ''
  regErrors.password = ''
  regErrors.confirmPassword = ''
  regErrors.name = ''
  regErrors.email = ''
  regErrors.flatNumber = ''
  regErrors._general = ''
}

function clearRegError(field) {
  regErrors[field] = ''
  regErrors._general = ''

  if (field === 'password' || field === 'confirmPassword') {
    if (regForm.password && regForm.confirmPassword && regForm.password === regForm.confirmPassword) {
      if (regErrors.confirmPassword === 'Passwords do not match') {
        regErrors.confirmPassword = ''
      }
    }
  }
}

function fillDemo(u, p) {
  loginUsername.value = u
  loginPassword.value = p
  loginErrors.username = ''
  loginErrors.password = ''
}

// ---------------- Login Submission ----------------
async function handleLogin() {
  loginErrors.username = ''
  loginErrors.password = ''

  let hasError = false
  if (!loginUsername.value.trim()) {
    loginErrors.username = 'Please enter your phone number or username'
    hasError = true
  }
  if (!loginPassword.value) {
    loginErrors.password = 'Please enter your password'
    hasError = true
  }

  if (hasError) return

  isLoading.value = true
  try {
    const res = await authService.login({
      phoneNumber: loginUsername.value.trim(),
      password: loginPassword.value
    })

    authStore.setAuth(res)

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Welcome back, ${res.user?.name || res.user?.username}!`,
      showConfirmButton: false,
      timer: 1800
    })

    const redirectPath = route.query.redirect || '/dashboard'
    router.push(redirectPath)
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Failed',
      text: err.response?.data?.message || err.message || 'Invalid credentials. Please verify your phone number and password.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isLoading.value = false
  }
}

// ---------------- Registration Submission ----------------
function validateRegistrationForm() {
  clearAllRegErrors()
  let isValid = true

  if (!regForm.username || !regForm.username.trim()) {
    regErrors.username = 'Username cannot be empty'
    isValid = false
  }

  if (!regForm.phoneNumber || !regForm.phoneNumber.trim()) {
    regErrors.phoneNumber = 'Phone number cannot be empty'
    isValid = false
  }

  if (!regForm.password) {
    regErrors.password = 'Password cannot be empty'
    isValid = false
  }

  if (!regForm.confirmPassword) {
    regErrors.confirmPassword = 'Confirm password cannot be empty'
    isValid = false
  } else if (regForm.password && regForm.password !== regForm.confirmPassword) {
    regErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

async function handleRegister() {
  if (!validateRegistrationForm()) {
    return
  }

  isLoading.value = true
  try {
    const payload = {
      username: regForm.username.trim(),
      phoneNumber: regForm.phoneNumber.trim(),
      password: regForm.password,
      confirmPassword: regForm.confirmPassword,
      name: regForm.name?.trim() || '',
      email: regForm.email?.trim() || '',
      flatNumber: regForm.flatNumber?.trim() || ''
    }

    const res = await authService.register(payload)

    Swal.fire({
      icon: 'success',
      title: 'Registration Successful',
      text: res?.message || 'Your account has been created. You can now sign in with your credentials.',
      confirmButtonColor: '#4f46e5'
    })

    // Prepopulate login credentials for convenience
    loginUsername.value = payload.phoneNumber || payload.username
    loginPassword.value = payload.password
    authMode.value = 'login'

    // Reset regForm
    regForm.username = ''
    regForm.phoneNumber = ''
    regForm.password = ''
    regForm.confirmPassword = ''
    regForm.name = ''
    regForm.email = ''
    regForm.flatNumber = ''
  } catch (err) {
    // Preserve existing form inputs!
    const backendMessage = err.response?.data?.message || err.message || 'Registration failed'
    const backendFieldErrors = parseBackendValidationErrors(err)

    if (Object.keys(backendFieldErrors).length > 0) {
      Object.assign(regErrors, backendFieldErrors)
    }

    Swal.fire({
      icon: 'error',
      title: 'Registration Error',
      text: backendMessage,
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isLoading.value = false
  }
}
</script>
