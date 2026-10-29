<template>
  <div class="space-y-6">
    <!-- Top Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Flat Member Management
              </h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                Super Admin
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage resident accounts, flat assignments, occupancy move-in dates, service charge eligibility, and security credentials.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          @click="isAuditModalOpen = true"
          class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Audit Log</span>
        </button>

        <button
          type="button"
          @click="openAddModal()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Flat Member</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Members
          </p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {{ membersList.length }}
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">Registered Units</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-[11px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Active Accounts
          </p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {{ activeAccountsCount }}
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ inactiveAccountsCount }} Inactive</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-[11px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Moved In (Occupied)
          </p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {{ movedInCount }}
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ notMovedInCount }} Not Moved In</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-[11px] sm:text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Charge Exempt
          </p>
          <h3 class="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {{ ineligibleCount }}
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">Not charged until move-in</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Explanatory Business Rule Alert Banner -->
    <div class="p-4 bg-gradient-to-r from-amber-50 via-amber-50/70 to-indigo-50/50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
      <div class="w-7 h-7 rounded-lg bg-amber-500 text-white shrink-0 flex items-center justify-center text-xs font-black mt-0.5">
        i
      </div>
      <div class="text-xs text-amber-950 space-y-1">
        <p class="font-bold text-amber-900">
          Service Charge Move-In & Billing Eligibility Rule
        </p>
        <p class="text-slate-600 leading-relaxed">
          Flat members whose occupancy status is marked as <b class="text-amber-800">"Not Moved In"</b> or whose billing eligibility is set to <b class="text-amber-800">"Ineligible"</b> are strictly <b>exempt from monthly service charges</b>. When a resident moves in, updating their status automatically starts billing charges for their effective move-in month.
        </p>
      </div>
    </div>

    <!-- Database Connection Error Banner -->
    <div v-if="loadError" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs shadow-xs">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold">
          !
        </div>
        <div>
          <p class="font-bold text-rose-900">Database Synchronization Error</p>
          <p class="text-rose-700 mt-0.5">{{ loadError }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="loadMembers"
        class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer shadow-xs shrink-0"
      >
        Retry
      </button>
    </div>

    <!-- Search & Filters Bar Card -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Search -->
        <div class="lg:col-span-2 relative">
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Search Members
          </label>
          <div class="relative">
            <input
              type="text"
              v-model="filters.search"
              placeholder="Search by Name, Flat (e.g. 4B), Phone, or Username..."
              class="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Account Status Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Account Status
          </label>
          <select
            v-model="filters.accountStatus"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
          </select>
        </div>

        <!-- Occupancy Status Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Occupancy Status
          </label>
          <select
            v-model="filters.occupancyStatus"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">All Occupancy</option>
            <option value="Moved In">Moved In (Occupied)</option>
            <option value="Not Moved In">Not Moved In</option>
            <option value="Vacated">Vacated</option>
          </select>
        </div>

        <!-- Billing Eligibility Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Billing Eligibility
          </label>
          <select
            v-model="filters.billingEligibility"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">All Eligibility</option>
            <option value="Eligible">Eligible (Chargeable)</option>
            <option value="Ineligible">Ineligible (Exempt)</option>
          </select>
        </div>
      </div>

      <!-- Filter Meta & Reset -->
      <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <span class="text-slate-500 font-medium">
          Showing <b class="text-slate-800">{{ filteredMembers.length }}</b> of {{ membersList.length }} flat members
        </span>

        <button
          v-if="isFiltered"
          type="button"
          @click="resetFilters"
          class="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Reset All Filters</span>
        </button>
      </div>
    </div>

    <!-- Members Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-16 flex flex-col items-center justify-center gap-2">
        <svg class="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-xs text-slate-500 font-medium">Loading flat members from database...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMembers.length === 0" class="py-16 text-center">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h4 class="text-sm font-bold text-slate-800">No flat members match the criteria</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try adjusting your search terms or filters, or add a new flat member.
        </p>
        <button
          type="button"
          @click="resetFilters"
          class="mt-4 px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-100/75 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4 font-bold">Flat & Building</th>
              <th class="py-3.5 px-4 font-bold">Member / Resident</th>
              <th class="py-3.5 px-4 font-bold">Contact Info</th>
              <th class="py-3.5 px-3 font-bold text-center">Occupancy Status</th>
              <th class="py-3.5 px-3 font-bold text-center">Account Status</th>
              <th class="py-3.5 px-3 font-bold text-center">Billing Eligibility</th>
              <th class="py-3.5 px-4 font-bold">Move-In Date</th>
              <th class="py-3.5 px-4 font-bold text-right">Available Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="member in paginatedMembers"
              :key="member.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- 1. Flat & Building -->
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-black flex items-center justify-center text-xs border border-slate-200 shadow-2xs">
                    {{ member.flatNumber}}
                  </span>
                  <div>
                    <div class="font-extrabold text-slate-900">
                      Flat {{ member.flatNumber }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                      {{ member.buildingName || 'Unique Castle' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 2. Member & Username -->
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    {{ getInitials(member.name || member.username) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{{ member.name }}</span>
                      <span
                        v-if="member.role === 'SUPER_ADMIN'"
                        class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200"
                      >
                        Admin
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-500 font-mono">
                      @{{ member.username }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 3. Contact Info -->
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="space-y-0.5">
                  <div class="font-mono text-slate-800 font-semibold flex items-center gap-1">
                    <span>{{ member.phoneNumber }}</span>
                    <button
                      type="button"
                      @click="copyText(member.phoneNumber, 'Phone Number')"
                      class="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Copy phone"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate max-w-[170px]" :title="member.email">
                    {{ member.email || '—' }}
                  </div>
                </div>
              </td>

              <!-- 4. Occupancy Status -->
              <td class="py-3 px-3 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                  :class="getOccupancyBadgeClass(member.occupancyStatus)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getOccupancyDotClass(member.occupancyStatus)"></span>
                  {{ member.occupancyStatus }}
                </span>
              </td>

              <!-- 5. Account Status -->
              <td class="py-3 px-3 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                  :class="member.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="member.accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  {{ member.accountStatus }}
                </span>
              </td>

              <!-- 6. Billing Eligibility -->
              <td class="py-3 px-3 whitespace-nowrap text-center">
                <span
                  v-if="member.billingEligibility === 'Eligible'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  title="Receives monthly service charges"
                >
                  <svg class="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Eligible
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                  title="Exempt from monthly charges until resident moves in"
                >
                  <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                  </svg>
                  Ineligible (Exempt)
                </span>
              </td>

              <!-- 7. Move-In Date -->
              <td class="py-3 px-4 whitespace-nowrap text-slate-600 font-medium text-[11px]">
                {{ member.moveInDate || member.createdAt || '—' }}
              </td>

              <!-- 8. Available Actions -->
              <td class="py-3 px-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- View Details Button -->
                  <button
                    type="button"
                    @click="openViewModal(member)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                    title="View Member Details"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <!-- Edit Button -->
                  <button
                    type="button"
                    @click="openEditModal(member)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Edit Member Information"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Activate / Deactivate Action -->
                  <button
                    type="button"
                    @click="handleToggleStatus(member)"
                    class="p-1.5 rounded-lg transition cursor-pointer"
                    :class="member.accountStatus === 'Active' ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'"
                    :title="member.accountStatus === 'Active' ? 'Deactivate Account' : 'Activate Account'"
                  >
                    <svg v-if="member.accountStatus === 'Active'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <!-- Set/Reset Password Button -->
                  <button
                    type="button"
                    @click="openResetPasswordModal(member)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                    title="Set / Reset Password"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>

                  <!-- Delete / Archive Button -->
                  <button
                    type="button"
                    @click="handleDeleteMember(member)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete or Archive Member"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Proper Empty State: Displayed when no flats exist in the database -->
            <tr v-if="paginatedMembers.length === 0">
              <td colspan="8" class="py-14 text-center">
                <div class="max-w-xs mx-auto flex flex-col items-center justify-center gap-2">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p class="font-bold text-slate-700 text-sm">No flats found.</p>
                  <p class="text-xs text-slate-400">There are no flat member records in the database. Use "+ Add Flat Member" above to register new units.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="px-5 py-3.5 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs">
        <span class="text-slate-500">
          Page <b>{{ currentPage }}</b> of <b>{{ totalPages }}</b>
        </span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- MODAL 1: ADD NEW FLAT MEMBER                                    -->
    <!-- =============================================================== -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 class="font-extrabold text-sm sm:text-base">Register New Flat Member</h3>
              <p class="text-[11px] text-indigo-200">Assign flat, setup initial credentials, and configure move-in status.</p>
            </div>
          </div>
          <button
            type="button"
            @click="isAddModalOpen = false"
            class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitAddMember" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- Full Name -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="addForm.name"
                required
                placeholder="e.g. Md. Shahidul Islam"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Flat Number Assignment -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Flat Assignment <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="addForm.flatNumber"
                required
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="" disabled>Select Flat (1A to 9D)</option>
                <option v-for="num in ALL_36_FLAT_NUMBERS" :key="num" :value="num">
                  Flat {{ num }}
                </option>
              </select>
            </div>

            <!-- Building Name -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Building / Project
              </label>
              <input
                type="text"
                v-model="addForm.buildingName"
                disabled
                class="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <!-- Phone Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="addForm.phoneNumber"
                required
                placeholder="01XXXXXXXXX"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Email Address -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                v-model="addForm.email"
                placeholder="resident@example.com"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Username / Login ID -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Username / Login ID <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="addForm.username"
                required
                placeholder="e.g. resident_4b"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Effective Move-in Date -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Effective Move-In Date
              </label>
              <input
                type="date"
                v-model="addForm.moveInDate"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              />
            </div>

            <!-- Occupancy Status -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Occupancy Status
              </label>
              <select
                v-model="addForm.occupancyStatus"
                @change="handleOccupancyChange('add')"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="Moved In">Moved In (Occupied)</option>
                <option value="Not Moved In">Not Moved In (Yet)</option>
                <option value="Vacated">Vacated</option>
              </select>
            </div>

            <!-- Billing Eligibility -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Service Charge Eligibility
              </label>
              <select
                v-model="addForm.billingEligibility"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="Eligible">Eligible (Chargeable)</option>
                <option value="Ineligible">Ineligible (Exempt from charges)</option>
              </select>
            </div>

            <!-- Initial Password -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Initial Password <span class="text-rose-500">*</span>
              </label>
              <input
                type="password"
                v-model="addForm.password"
                required
                placeholder="Min 6 characters"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Confirm Initial Password -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span class="text-rose-500">*</span>
              </label>
              <input
                type="password"
                v-model="addForm.confirmPassword"
                required
                placeholder="Re-type password"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Administrative Notes (Optional)
            </label>
            <textarea
              v-model="addForm.notes"
              rows="2"
              placeholder="e.g. Move-in scheduled for mid next month, interior decoration in progress."
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isAddModalOpen = false"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ isSubmitting ? 'Registering...' : 'Register Member Account' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- MODAL 2: EDIT FLAT MEMBER                                       -->
    <!-- =============================================================== -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
              ✎
            </div>
            <div>
              <h3 class="font-extrabold text-sm sm:text-base">Edit Flat Member</h3>
              <p class="text-[11px] text-slate-400">Update resident profile, occupancy move-in status, and billing eligibility.</p>
            </div>
          </div>
          <button
            type="button"
            @click="isEditModalOpen = false"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitEditMember" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- Full Name -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="editForm.name"
                required
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Flat Number Assignment -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Flat Assignment
              </label>
              <select
                v-model="ALL_36_FLAT_NUMBERS"
                required
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option v-for="num in ALL_36_FLAT_NUMBERS" :key="num" :value="num">
                  Flat {{ num }}
                </option>
              </select>
            </div>

            <!-- Phone Number -->
            <div>``
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="editForm.phoneNumber"
                required
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Email Address -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                v-model="editForm.email"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            <!-- Move-In Date -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Effective Move-In Date
              </label>
              <input
                type="date"
                v-model="editForm.moveInDate"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              />
            </div>

            <!-- Occupancy Status -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Occupancy Status
              </label>
              <select
                v-model="editForm.occupancyStatus"
                @change="handleOccupancyChange('edit')"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="Moved In">Moved In (Occupied)</option>
                <option value="Not Moved In">Not Moved In</option>
                <option value="Vacated">Vacated</option>
              </select>
            </div>

            <!-- Billing Eligibility -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Service Charge Eligibility
              </label>
              <select
                v-model="editForm.billingEligibility"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="Eligible">Eligible (Chargeable)</option>
                <option value="Ineligible">Ineligible (Exempt from charges)</option>
              </select>
            </div>

            <!-- Account Status -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                v-model="editForm.accountStatus"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              v-model="editForm.notes"
              rows="2"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isEditModalOpen = false"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ isSubmitting ? 'Saving...' : 'Save Member Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- MODAL 3: VIEW MEMBER DETAILS                                    -->
    <!-- =============================================================== -->
    <div
      v-if="isViewModalOpen && viewingMember"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <!-- Banner Header -->
        <div class="h-24 bg-gradient-to-r from-indigo-700 to-indigo-900 p-6 flex items-end justify-between relative text-white">
          <div class="absolute -bottom-6 left-6">
            <div class="w-14 h-14 rounded-2xl bg-white p-1 shadow-md">
              <div class="w-full h-full rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                {{ getInitials(viewingMember.name) }}
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="isViewModalOpen = false"
            class="text-white/80 hover:text-white absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="pt-9 p-6 space-y-4">
          <div>
            <h3 class="font-black text-lg text-slate-900 flex items-center gap-2">
              <span>{{ viewingMember.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Flat {{ viewingMember.flatNumber }}
              </span>
            </h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">@{{ viewingMember.username }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
              <span class="font-mono font-bold text-slate-800">{{ viewingMember.phoneNumber }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
              <span class="text-slate-800 truncate block">{{ viewingMember.email || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Occupancy Status</span>
              <span class="font-bold" :class="viewingMember.occupancyStatus === 'Moved In' ? 'text-emerald-700' : 'text-amber-700'">
                {{ viewingMember.occupancyStatus }}
              </span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
              <span class="font-bold" :class="viewingMember.accountStatus === 'Active' ? 'text-emerald-700' : 'text-rose-700'">
                {{ viewingMember.accountStatus }}
              </span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Eligibility</span>
              <span class="font-bold" :class="viewingMember.billingEligibility === 'Eligible' ? 'text-indigo-700' : 'text-amber-800'">
                {{ viewingMember.billingEligibility }}
              </span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Move-In Date</span>
              <span class="text-slate-800 font-medium">{{ viewingMember.moveInDate || '—' }}</span>
            </div>
          </div>

          <div v-if="viewingMember.notes" class="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900">
            <span class="font-bold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">Admin Note</span>
            {{ viewingMember.notes }}
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="isViewModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              @click="isViewModalOpen = false; openEditModal(viewingMember)"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Edit Member
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- MODAL 4: SET / RESET PASSWORD                                   -->
    <!-- =============================================================== -->
    <div
      v-if="isResetPasswordModalOpen && passwordMember"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              🔑
            </div>
            <div>
              <h3 class="font-extrabold text-sm sm:text-base">Set / Reset Password</h3>
              <p class="text-[11px] text-purple-200">{{ passwordMember.name }} (Flat {{ passwordMember.flatNumber }})</p>
            </div>
          </div>
          <button
            type="button"
            @click="isResetPasswordModalOpen = false"
            class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitResetPassword" class="p-6 space-y-4">
          <p class="text-xs text-slate-500">
            Enter a new password for <b class="text-slate-800">{{ passwordMember.name }}</b> (@{{ passwordMember.username }}). Passwords are securely hashed and never stored in plaintext.
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              New Password <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="passwordForm.newPassword"
                required
                minlength="6"
                placeholder="At least 6 characters"
                class="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Confirm New Password <span class="text-rose-500">*</span>
            </label>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordForm.confirmPassword"
              required
              minlength="6"
              placeholder="Re-type new password"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
            />
          </div>

          <!-- Password mismatch warning -->
          <p
            v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword"
            class="text-[11px] text-rose-600 font-semibold"
          >
            Passwords do not match
          </p>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isResetPasswordModalOpen = false"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || (passwordForm.newPassword !== passwordForm.confirmPassword)"
              class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ isSubmitting ? 'Updating...' : 'Apply Password Reset' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- MODAL 5: AUDIT LOG                                              -->
    <!-- =============================================================== -->
    <div
      v-if="isAuditModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
              📜
            </div>
            <div>
              <h3 class="font-extrabold text-sm sm:text-base">Administrative Operations Audit Log</h3>
              <p class="text-[11px] text-slate-400">Security record of member management actions.</p>
            </div>
          </div>
          <button
            type="button"
            @click="isAuditModalOpen = false"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <div v-if="auditLogs.length === 0" class="py-8 text-center text-xs text-slate-400">
            No audit log entries recorded yet.
          </div>
          <div
            v-for="log in auditLogs"
            :key="log.id"
            class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 font-mono text-[11px]">
                {{ log.action }}
              </span>
              <span class="text-[10px] text-slate-400">
                {{ formatDateTime(log.timestamp) }}
              </span>
            </div>
            <p class="text-slate-600 text-[11px]">
              <span class="font-semibold text-slate-700">Details:</span> {{ JSON.stringify(log.details) }}
            </p>
            <div class="text-[10px] text-slate-400">
              Performed by: <b>{{ log.performedBy }}</b>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            @click="isAuditModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import {
  memberService,
  OCCUPANCY_STATUSES,
  ACCOUNT_STATUSES,
  BILLING_ELIGIBILITIES
} from '../services/memberService.js'

const isLoading = ref(false)
const isSubmitting = ref(false)
const membersList = ref([])

// Filters
const filters = reactive({
  search: '',
  accountStatus: 'ALL',
  occupancyStatus: 'ALL',
  billingEligibility: 'ALL'
})

const isFiltered = computed(() => {
  return (
    filters.search.trim() !== '' ||
    filters.accountStatus !== 'ALL' ||
    filters.occupancyStatus !== 'ALL' ||
    filters.billingEligibility !== 'ALL'
  )
})

function resetFilters() {
  filters.search = ''
  filters.accountStatus = 'ALL'
  filters.occupancyStatus = 'ALL'
  filters.billingEligibility = 'ALL'
  currentPage.value = 1
}

// Pagination
const currentPage = ref(1)
const pageSize = 12

const filteredMembers = computed(() => {
  let list = membersList.value

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.flatNumber?.toLowerCase().includes(q) || 
      m.phoneNumber?.includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q)
    )
  }

  if (filters.accountStatus && filters.accountStatus !== 'ALL') {
    list = list.filter(m => m.accountStatus === filters.accountStatus)
  }

  if (filters.occupancyStatus && filters.occupancyStatus !== 'ALL') {
    list = list.filter(m => m.occupancyStatus === filters.occupancyStatus)
  }

  if (filters.billingEligibility && filters.billingEligibility !== 'ALL') {
    list = list.filter(m => m.billingEligibility === filters.billingEligibility)
  }

  return list
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / pageSize) || 1)

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMembers.value.slice(start, start + pageSize)
})

// Metrics
const activeAccountsCount = computed(() => membersList.value.filter(m => m.accountStatus === 'Active').length)
const inactiveAccountsCount = computed(() => membersList.value.filter(m => m.accountStatus === 'Inactive').length)
const movedInCount = computed(() => membersList.value.filter(m => m.occupancyStatus === 'Moved In').length)
const notMovedInCount = computed(() => membersList.value.filter(m => m.occupancyStatus === 'Not Moved In').length)
const ineligibleCount = computed(() => membersList.value.filter(m => m.billingEligibility === 'Ineligible').length)

// Modal states
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isResetPasswordModalOpen = ref(false)
const isAuditModalOpen = ref(false)

const viewingMember = ref(null)
const passwordMember = ref(null)
const showPassword = ref(false)

// Forms
const addForm = reactive({
  name: '',
  flatNumber: '',
  buildingName: 'Unique Castle',
  phoneNumber: '',
  email: '',
  username: '',
  occupancyStatus: 'Moved In',
  accountStatus: 'Active',
  billingEligibility: 'Eligible',
  moveInDate: new Date().toISOString().substring(0, 10),
  password: '',
  confirmPassword: '',
  notes: ''
})

const ALL_36_FLAT_NUMBERS = Array.from(
  { length: 36 },
  (_, i) => `${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`
);

console.log('ALL_36_FLAT_NUMBERS:', ALL_36_FLAT_NUMBERS);

const editForm = reactive({
  id: null,
  name: '',
  flatNumber: '',
  phoneNumber: '',
  email: '',
  occupancyStatus: 'Moved In',
  accountStatus: 'Active',
  billingEligibility: 'Eligible',
  moveInDate: '',
  notes: ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const auditLogs = computed(() => memberService.getAuditLogs())

// Helper functions
function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getOccupancyBadgeClass(status) {
  switch (status) {
    case 'Moved In':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Not Moved In':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Vacated':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

function getOccupancyDotClass(status) {
  switch (status) {
    case 'Moved In':
      return 'bg-emerald-500'
    case 'Not Moved In':
      return 'bg-amber-500'
    case 'Vacated':
    default:
      return 'bg-slate-400'
  }
}

function copyText(text, label) {
  if (text) {
    navigator.clipboard.writeText(text)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Copied ${label}`,
      showConfirmButton: false,
      timer: 1500
    })
  }
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Auto-sync helper: If admin selects "Not Moved In",
 * automatically default billing eligibility to "Ineligible"
 */
function handleOccupancyChange(mode) {
  if (mode === 'add') {
    if (addForm.occupancyStatus === 'Not Moved In') {
      addForm.billingEligibility = 'Ineligible'
    } else if (addForm.occupancyStatus === 'Moved In') {
      addForm.billingEligibility = 'Eligible'
    }
  } else if (mode === 'edit') {
    if (editForm.occupancyStatus === 'Not Moved In') {
      editForm.billingEligibility = 'Ineligible'
    } else if (editForm.occupancyStatus === 'Moved In') {
      editForm.billingEligibility = 'Eligible'
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadMembers()
})

const loadError = ref(null)

async function loadMembers() {
  isLoading.value = true
  loadError.value = null
  try {
    membersList.value = await memberService.getAllMembers()
  } catch (err) {
    console.error('Failed to load members:', err)
    loadError.value = err.message || 'Unable to connect to database. Please check your backend connection.'
  } finally {
    isLoading.value = false
  }
}

// Actions & Modal Handlers
function openAddModal() {
  addForm.name = ''
  addForm.flatNumber = ''
  addForm.phoneNumber = ''
  addForm.email = ''
  addForm.username = ''
  addForm.occupancyStatus = 'Moved In'
  addForm.accountStatus = 'Active'
  addForm.billingEligibility = 'Eligible'
  addForm.moveInDate = new Date().toISOString().substring(0, 10)
  addForm.password = ''
  addForm.confirmPassword = ''
  addForm.notes = ''
  isAddModalOpen.value = true
}

async function submitAddMember() {
  if (addForm.password !== addForm.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Password Mismatch',
      text: 'The password and confirm password fields do not match.',
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  isSubmitting.value = true
  try {
    await memberService.createMember({ ...addForm })
    isAddModalOpen.value = false
    Swal.fire({
      icon: 'success',
      title: 'Flat Member Registered!',
      text: `Account for ${addForm.name} (Flat ${addForm.flatNumber}) created successfully.`,
      confirmButtonColor: '#059669'
    })
    await loadMembers()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: err.message || 'Could not register member account.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isSubmitting.value = false
  }
}

function openEditModal(member) {
  editForm.id = member.id
  editForm.name = member.name
  editForm.flatNumber = member.flatNumber
  editForm.phoneNumber = member.phoneNumber
  editForm.email = member.email || ''
  editForm.occupancyStatus = member.occupancyStatus
  editForm.accountStatus = member.accountStatus
  editForm.billingEligibility = member.billingEligibility
  editForm.moveInDate = member.moveInDate || ''
  editForm.notes = member.notes || ''
  isEditModalOpen.value = true
}

async function submitEditMember() {
  isSubmitting.value = true
  try {
    await memberService.updateMember(editForm.id, { ...editForm })
    isEditModalOpen.value = false
    Swal.fire({
      icon: 'success',
      title: 'Member Updated!',
      text: `Information for Flat ${editForm.flatNumber} has been updated.`,
      confirmButtonColor: '#059669'
    })
    await loadMembers()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: err.message || 'Could not update flat member.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isSubmitting.value = false
  }
}

function openViewModal(member) {
  viewingMember.value = member
  isViewModalOpen.value = true
}

async function handleToggleStatus(member) {
  const isActivating = member.accountStatus !== 'Active'
  const newStatus = isActivating ? 'Active' : 'Inactive'

  const result = await Swal.fire({
    title: `${isActivating ? 'Activate' : 'Deactivate'} Member Account?`,
    text: isActivating
      ? `Activate login and portal access for ${member.name} (Flat ${member.flatNumber})?`
      : `Deactivating will block ${member.name} from logging into their resident account. Their bills and financial history will remain safely preserved.`,
    icon: isActivating ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonText: isActivating ? 'Yes, Activate' : 'Yes, Deactivate',
    confirmButtonColor: isActivating ? '#059669' : '#e11d48',
    cancelButtonColor: '#64748b'
  })

  if (result.isConfirmed) {
    try {
      await memberService.toggleAccountStatus(member, newStatus)
      // Update specifically this member in local state
      member.accountStatus = newStatus
      Swal.fire({
        icon: 'success',
        title: `Account ${newStatus}!`,
        text: `Flat ${member.flatNumber} (${member.name}) account is now ${newStatus}.`,
        confirmButtonColor: '#059669'
      })
      await loadMembers()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.message,
        confirmButtonColor: '#4f46e5'
      })
    }
  }
}

function openResetPasswordModal(member) {
  passwordMember.value = member
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showPassword.value = false
  isResetPasswordModalOpen.value = true
}

async function submitResetPassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Mismatch',
      text: 'New password and confirmation do not match.',
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  isSubmitting.value = true
  try {
    const res = await memberService.resetPassword(passwordMember.value.id, passwordForm.newPassword)
    isResetPasswordModalOpen.value = false
    Swal.fire({
      icon: 'success',
      title: 'Password Reset Successful!',
      text: res.message,
      confirmButtonColor: '#059669'
    })
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Reset Failed',
      text: err.message,
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteMember(member) {
  const result = await Swal.fire({
    title: `Delete or Archive Member?`,
    html: `Are you sure you want to remove <b>${member.name}</b> (Flat ${member.flatNumber})?<br/><br/><span class="text-xs text-slate-500">If this member has existing bills or payments, the system will automatically Archive and Deactivate the account to preserve financial audit integrity.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Proceed',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b'
  })

  if (result.isConfirmed) {
    try {
      const res = await memberService.deleteMember(member.id)
      Swal.fire({
        icon: res.action === 'ARCHIVED' ? 'info' : 'success',
        title: res.action === 'ARCHIVED' ? 'Account Archived' : 'Member Deleted',
        text: res.message,
        confirmButtonColor: '#4f46e5'
      })
      await loadMembers()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.message,
        confirmButtonColor: '#4f46e5'
      })
    }
  }
}
</script>
