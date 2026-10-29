<template>
  <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
    <!-- Section Header -->
    <div class="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
            Monthly Service Charge Management
          </h3>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Admin View
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1 max-w-2xl">
          Set, update, and publish service charges for upcoming months. Charges can vary month-to-month. Draft charges remain hidden from residents until published.
        </p>
      </div>

      <!-- Action: Set Charge Button -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openSetChargeModal()"
          class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Set Upcoming Month Charge</span>
        </button>
      </div>
    </div>

    <!-- Quick Status Cards (Current Month vs Upcoming Month) -->
    <div class="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200/80 bg-white">
      <!-- Card 1: Current Month Charge -->
      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <div>
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Current Month Rate</span>
          <div class="text-lg font-black text-slate-800 mt-1">
            {{ currentMonthFee ? formatCurrency(currentMonthFee.totalFee) : '৳ 2,500' }}
          </div>
          <div class="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
            <span>{{ currentMonthFee ? currentMonthFee.monthYearLabel : `${currentMonth} ${currentYear}` }}</span>
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span class="text-emerald-700 font-semibold text-[11px]">Published</span>
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Card 2: Upcoming Month Rate -->
      <div class="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
        <div>
          <span class="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Upcoming Month ({{ nextMonthLabel }})</span>
          <div class="text-lg font-black text-indigo-900 mt-1">
            {{ upcomingMonthFee ? formatCurrency(upcomingMonthFee.totalFee) : 'Not Configured' }}
          </div>
          <div class="text-xs mt-0.5 font-medium flex items-center gap-1.5">
            <template v-if="upcomingMonthFee">
              <span
                class="px-2 py-0.5 rounded text-[11px] font-bold"
                :class="upcomingMonthFee.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ upcomingMonthFee.isPublished ? 'Published & Active' : 'Draft (Unpublished)' }}
              </span>
            </template>
            <template v-else>
              <span class="text-slate-400 text-xs">Ready to set</span>
            </template>
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <!-- Card 3: Total Configured Months -->
      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <div>
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Historical Billing Periods</span>
          <div class="text-lg font-black text-slate-800 mt-1">
            {{ serviceFees.length }} Months
          </div>
          <div class="text-xs text-slate-500 mt-0.5 font-medium">
            {{ publishedCount }} Published • {{ draftCount }} Draft
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Monthly Charge History Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100/75 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th class="py-3.5 px-5">Applicable Month</th>
            <th class="py-3.5 px-5 text-right">Service Charge Amount</th>
            <th class="py-3.5 px-5">Fee Component Breakdown</th>
            <th class="py-3.5 px-5">Payment Due Date</th>
            <th class="py-3.5 px-5 text-center">Publication Status</th>
            <th class="py-3.5 px-5">Published Date</th>
            <th class="py-3.5 px-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="fee in serviceFees"
            :key="fee.serviceFeeId || fee.month"
            class="hover:bg-slate-50/80 transition-colors"
          >
            <!-- 1. Applicable Month -->
            <td class="py-4 px-5 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-slate-900 text-sm">
                  {{ fee.monthYearLabel }}
                </span>
                <span
                  v-if="isUpcoming(fee)"
                  class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200"
                >
                  Upcoming
                </span>
                <span
                  v-else-if="isCurrent(fee)"
                  class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  Current
                </span>
              </div>
            </td>

            <!-- 2. Service Charge Amount -->
            <td class="py-4 px-5 text-right whitespace-nowrap">
              <span class="text-base font-black text-slate-900">
                {{ formatCurrency(fee.totalFee) }}
              </span>
            </td>

            <!-- 3. Fee Breakdown -->
            <td class="py-4 px-5 whitespace-nowrap">
              <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Caretaker: {{ fee.caretakerFee != null ? formatCurrency(fee.caretakerFee) : '—' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Lift: {{ fee.liftFee != null ? formatCurrency(fee.liftFee) : '—' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Waste: {{ fee.wasteFee != null ? formatCurrency(fee.wasteFee) : '—' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Water: {{ fee.waterFee != null ? formatCurrency(fee.waterFee) : '—' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Electricity: {{ fee.electricityFee != null ? formatCurrency(fee.electricityFee) : '—' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Other: {{ fee.otherFee != null ? formatCurrency(fee.otherFee) : '—' }}
                </span>
              </div>
            </td>

            <!-- 4. Due Date -->
            <td class="py-4 px-5 whitespace-nowrap text-slate-700 font-medium">
              {{ formatFeeDueDate(fee.dueDate, fee.month) }}
            </td>

            <!-- 5. Publication Status -->
            <td class="py-4 px-5 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                :class="fee.isPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="fee.isPublished ? 'bg-emerald-500' : 'bg-amber-500'"
                ></span>
                {{ fee.isPublished ? 'Published' : 'Draft' }}
              </span>
            </td>

            <!-- 6. Published Date -->
            <td class="py-4 px-5 whitespace-nowrap text-slate-500">
              <span v-if="fee.isPublished && fee.publishedDate">
                {{ formatDate(fee.publishedDate, false) }}
              </span>
              <span v-else class="text-slate-400 italic">
                Not Published
              </span>
            </td>

            <!-- 7. Actions -->
            <td class="py-4 px-5 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1.5">
                <!-- If Draft: Offer Publish Button and Edit Button -->
                <template v-if="!fee.isPublished">
                  <button
                    type="button"
                    @click="openPublishReview(fee)"
                    class="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer flex items-center gap-1"
                    title="Review and Publish Service Charge"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Publish Service Charge</span>
                  </button>

                  <button
                    type="button"
                    @click="openSetChargeModal(fee)"
                    class="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                </template>

                <!-- If Published: Check if payments exist -->
                <template v-else>
                  <div v-if="fee.hasPayments" class="flex items-center gap-1.5">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
                      title="This charge is locked because payments are already linked to it."
                    >
                      <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Locked (Payments Linked)</span>
                    </span>

                    <button
                      type="button"
                      @click="viewFeeDetails(fee)"
                      class="px-2 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                    >
                      Details
                    </button>
                  </div>

                  <div v-else class="flex items-center gap-1.5">
                    <button
                      type="button"
                      @click="openSetChargeModal(fee)"
                      class="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 transition cursor-pointer flex items-center gap-1"
                      title="Update published service charge"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Update</span>
                    </button>
                  </div>
                </template>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="serviceFees.length === 0 && !isLoading">
            <td colspan="7" class="py-10 text-center text-slate-400">
              <div class="max-w-xs mx-auto">
                <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="font-bold text-slate-700 text-xs">No service charges configured yet</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Click "Set Upcoming Month Charge" above to create your first monthly service rate.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL 1: Set / Update Monthly Service Charge Form -->
    <div
      v-if="isSetModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-base">
                {{ editingFeeId ? 'Update Monthly Service Charge' : 'Set Monthly Service Charge' }}
              </h4>
              <p class="text-xs text-slate-500">
                Configure rate and breakdown for the selected billing month.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="isSetModalOpen = false"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmitForm" class="p-6 space-y-4">
          <!-- Month & Year Selector -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Applicable Month <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="formData.monthName"
                :disabled="Boolean(editingFeeId)"
                @change="handleMonthChange"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option v-for="m in MONTH_NAMES" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Applicable Year <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="formData.year"
                :disabled="Boolean(editingFeeId)"
                @change="handleMonthChange"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option v-for="y in [2026, 2027, 2028]" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <!-- Quick Helper: Next Upcoming Month Shortcut -->
          <div v-if="!editingFeeId" class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] text-slate-400">Quick set:</span>
            <button
              type="button"
              @click="setTargetMonth('November', 2026, 3000)"
              class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
            >
              November 2026 (৳3,000)
            </button>
            <button
              type="button"
              @click="setTargetMonth('December', 2026, 2800)"
              class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
            >
              December 2026 (৳2,800)
            </button>
          </div>

          <!-- Total Service Charge Amount -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Total Monthly Service Charge (৳) <span class="text-rose-500">*</span>
            </label>
            <div class="relative rounded-lg shadow-2xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                ৳
              </div>
              <input
                type="number"
                v-model.number="formData.totalFee"
                @input="autoBalanceBreakdown"
                min="500"
                step="50"
                placeholder="e.g. 3000"
                class="w-full pl-8 pr-4 py-2.5 text-base font-black bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                required
              />
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              This is the exact monthly service fee that apartment residents will pay for {{ formData.monthName }} {{ formData.year }}.
            </p>
          </div>

          <!-- Component Fee Breakdown -->
          <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700">Service Fee Components Breakdown</span>
              <span class="text-[11px] text-slate-500">
                Sum: <b :class="breakdownSum === formData.totalFee ? 'text-emerald-600' : 'text-rose-600'">৳{{ breakdownSum.toLocaleString() }}</b> / ৳{{ Number(formData.totalFee || 0).toLocaleString() }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Caretaker Fee (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.caretakerFee"
                  @input="handleComponentChange"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Lift Maintenance (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.liftFee"
                  @input="handleComponentChange"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Waste Disposal (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.wasteFee"
                  @input="handleComponentChange"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Water Bill (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.waterFee"
                  @input="handleComponentChange"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Common Electricity Bill (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.electricityFee"
                  @input="handleComponentChange"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Other (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.otherFee"
                  @input="handleComponentChange"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <!-- Due Date Picker -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              v-model="formData.dueDate"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
            <p class="text-[11px] text-slate-400 mt-1">Default is 10th of the applicable month.</p>
          </div>

          <!-- Duplicate Month Warning if applicable -->
          <div v-if="duplicateWarning" class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ duplicateWarning }}</span>
          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              @click="isSetModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <!-- Save as Draft Button -->
              <button
                type="button"
                :disabled="isSaving || breakdownSum !== formData.totalFee"
                @click="saveAsDraft"
                class="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Save as Draft</span>
              </button>

              <!-- Review & Publish Button -->
              <button
                type="button"
                :disabled="isSaving || breakdownSum !== formData.totalFee"
                @click="openPublishReviewFromForm"
                class="w-full sm:w-auto px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Publish Service Charge</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: Pre-Publication Review Modal ("Publish Service Charge") -->
    <div
      v-if="isReviewModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        <!-- Review Header -->
        <div class="p-5 border-b border-slate-200 bg-emerald-50/70 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-black text-slate-900 text-base">
              Publish Monthly Service Charge
            </h4>
            <p class="text-xs text-emerald-800">
              Confirm before making visible to all 36 apartments.
            </p>
          </div>
        </div>

        <!-- Review Body -->
        <div class="p-6 space-y-4">
          <p class="text-xs text-slate-600">
            Please review the details below. Once published, this charge will be immediately visible to all apartment owners and residents for billing and payment:
          </p>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Applicable Month:</span>
              <span class="font-extrabold text-slate-900 text-sm">
                {{ targetReviewFee?.monthYearLabel || `${formData.monthName} ${formData.year}` }}
              </span>
            </div>

            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Total Service Charge:</span>
              <span class="font-black text-emerald-700 text-base">
                {{ formatCurrency(targetReviewFee?.totalFee || formData.totalFee) }}
              </span>
            </div>

            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Payment Due Date:</span>
              <span class="font-bold text-slate-800">
                {{ formatFeeDueDate(targetReviewFee?.dueDate || formData.dueDate) }}
              </span>
            </div>

            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Publication Date:</span>
              <span class="font-bold text-slate-800">
                {{ todayFormatted }} (Today)
              </span>
            </div>

            <div class="flex justify-between items-center py-1">
              <span class="text-slate-500 font-medium">Scope:</span>
              <span class="font-bold text-indigo-700">
                All 36 Apartment Units (Floors 1-9)
              </span>
            </div>
          </div>

          <!-- Component Breakdown in Review -->
          <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900">
            <div class="font-bold text-indigo-800 mb-1">Charge Component Breakdown:</div>
            <div class="grid grid-cols-2 gap-1 text-slate-700">
              <div>• Caretaker: <b>৳{{ targetReviewFee?.caretakerFee ?? formData.caretakerFee }}</b></div>
              <div>• Lift Maintenance: <b>৳{{ targetReviewFee?.liftFee ?? formData.liftFee }}</b></div>
              <div>• Waste Disposal: <b>৳{{ targetReviewFee?.wasteFee ?? formData.wasteFee }}</b></div>
              <div>• Water Bill: <b>৳{{ targetReviewFee?.waterFee ?? formData.waterFee }}</b></div>
              <div>• Common Electricity: <b>৳{{ targetReviewFee?.electricityFee ?? formData.electricityFee }}</b></div>
              <div>• Other: <b>৳{{ targetReviewFee?.otherFee ?? formData.otherFee }}</b></div>
            </div>
          </div>

          <div class="text-[11px] text-slate-500 leading-relaxed">
            <b>Note:</b> Residents will see this amount in their dashboard under "Upcoming Month Service Charge" and when paying their bill via bKash.
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="isReviewModalOpen = false"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Back / Cancel
            </button>

            <button
              type="button"
              :disabled="isPublishing"
              @click="executePublish"
              class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <svg v-if="isPublishing" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ isPublishing ? 'Publishing...' : 'Confirm & Publish Now' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { serviceFeeService } from '../../services/serviceFeeService.js'
import { formatCurrency } from '../../utils/currency.js'
import { getCurrentMonth, getCurrentYear, MONTH_NAMES, formatDate } from '../../utils/date.js'

const emit = defineEmits(['feeUpdated'])

const serviceFees = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const isPublishing = ref(false)

const isSetModalOpen = ref(false)
const isReviewModalOpen = ref(false)
const editingFeeId = ref(null)
const targetReviewFee = ref(null)

const currentMonth = getCurrentMonth()
const currentYear = getCurrentYear()

// Next upcoming month label calculation
const nextMonthLabel = computed(() => {
  const curIdx = MONTH_NAMES.indexOf(currentMonth)
  const nextMonth = MONTH_NAMES[(curIdx + 1) % 12]
  const nextYear = curIdx === 11 ? currentYear + 1 : currentYear
  return `${nextMonth} ${nextYear}`
})

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
})

// Form data for creating or editing a service fee
const formData = reactive({
  monthName: 'November',
  year: 2026,
  totalFee: 3000,
  caretakerFee: 800,
  liftFee: 500,
  wasteFee: 200,
  waterFee: 500,
  electricityFee: 300,
  otherFee: 700,
  dueDate: '2026-11-10',
  status: 'PUBLISHED'
})

const breakdownSum = computed(() => {
  return Number(formData.caretakerFee || 0) +
    Number(formData.liftFee || 0) +
    Number(formData.wasteFee || 0) +
    Number(formData.waterFee || 0) +
    Number(formData.electricityFee || 0) +
    Number(formData.otherFee || 0)
})

// Summary metrics
const currentMonthFee = computed(() => {
  return serviceFees.value.find(f => f.monthName === currentMonth && f.year === currentYear)
})

const upcomingMonthFee = computed(() => {
  const curIdx = MONTH_NAMES.indexOf(currentMonth)
  const nextMonth = MONTH_NAMES[(curIdx + 1) % 12]
  const nextYear = curIdx === 11 ? currentYear + 1 : currentYear
  return serviceFees.value.find(f => f.monthName === nextMonth && f.year === nextYear)
})

const publishedCount = computed(() => serviceFees.value.filter(f => f.isPublished).length)
const draftCount = computed(() => serviceFees.value.filter(f => !f.isPublished).length)

// Duplicate warning check
const duplicateWarning = computed(() => {
  if (editingFeeId.value) return null
  const existing = serviceFees.value.find(f => f.monthName === formData.monthName && f.year === formData.year)
  if (existing) {
    if (existing.hasPayments) {
      return `A service charge for ${formData.monthName} ${formData.year} is already published and has ${existing.paymentCount} payments recorded. It cannot be altered.`
    }
    return `A record for ${formData.monthName} ${formData.year} already exists (${existing.status}). Submitting will update this existing record.`
  }
  return null
})

onMounted(async () => {
  await loadFees()
})

async function loadFees() {
  isLoading.value = true
  try {
    serviceFees.value = await serviceFeeService.getAllServiceFees()
  } catch (err) {
    console.error('Failed to load service charges:', err)
  } finally {
    isLoading.value = false
  }
}

function isUpcoming(fee) {
  const curIdx = MONTH_NAMES.indexOf(currentMonth)
  const feeIdx = MONTH_NAMES.indexOf(fee.monthName)
  if (fee.year > currentYear) return true
  if (fee.year === currentYear && feeIdx > curIdx) return true
  return false
}

function isCurrent(fee) {
  return fee.monthName === currentMonth && fee.year === currentYear
}

function formatFeeDueDate(dueDate, monthStr) {
  if (dueDate) {
    try {
      const d = new Date(dueDate)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    } catch (_) {}
  }
  return '10th of Month'
}

function setTargetMonth(mName, yNum, feeAmount) {
  formData.monthName = mName
  formData.year = yNum
  formData.totalFee = feeAmount
  autoBalanceBreakdown()
  handleMonthChange()
}

function handleMonthChange() {
  const monthIdx = MONTH_NAMES.indexOf(formData.monthName) + 1
  const monthPadded = String(monthIdx).padStart(2, '0')
  formData.dueDate = `${formData.year}-${monthPadded}-10`

  // Look up existing fee for this month/year to pre-populate or update
  const existing = serviceFees.value.find(f => f.monthName === formData.monthName && Number(f.year) === Number(formData.year))
  if (existing) {
    editingFeeId.value = existing.serviceFeeId
    formData.totalFee = existing.totalFee
    formData.caretakerFee = existing.caretakerFee
    formData.liftFee = existing.liftFee
    formData.wasteFee = existing.wasteFee
    formData.waterFee = existing.waterFee != null ? existing.waterFee : 0
    formData.electricityFee = existing.electricityFee != null ? existing.electricityFee : 0
    formData.otherFee = existing.otherFee
    formData.status = existing.status
  } else {
    editingFeeId.value = null
  }
}

function autoBalanceBreakdown() {
  const base = Number(formData.totalFee || 0)
  const fixed = Number(formData.caretakerFee || 0) +
    Number(formData.liftFee || 0) +
    Number(formData.wasteFee || 0) +
    Number(formData.waterFee || 0) +
    Number(formData.electricityFee || 0)
  formData.otherFee = Math.max(0, base - fixed)
}

function handleComponentChange() {
  // If user explicitly adjusts a component, allow fine-grained custom values
}

function openSetChargeModal(fee = null) {
  if (fee) {
    editingFeeId.value = fee.serviceFeeId
    formData.monthName = fee.monthName
    formData.year = fee.year
    formData.totalFee = fee.totalFee
    formData.caretakerFee = fee.caretakerFee
    formData.liftFee = fee.liftFee
    formData.wasteFee = fee.wasteFee
    formData.waterFee = fee.waterFee != null ? fee.waterFee : 0
    formData.electricityFee = fee.electricityFee != null ? fee.electricityFee : 0
    formData.otherFee = fee.otherFee
    formData.dueDate = fee.dueDate ? String(fee.dueDate).split('T')[0] : `${fee.year}-${String(MONTH_NAMES.indexOf(fee.monthName) + 1).padStart(2, '0')}-10`
    formData.status = fee.status
  } else {
    const curIdx = MONTH_NAMES.indexOf(currentMonth)
    const mName = MONTH_NAMES[(curIdx + 1) % 12]
    const yNum = curIdx === 11 ? currentYear + 1 : currentYear
    const existing = serviceFees.value.find(f => f.monthName === mName && Number(f.year) === Number(yNum))
    if (existing) {
      editingFeeId.value = existing.serviceFeeId
      formData.monthName = existing.monthName
      formData.year = existing.year
      formData.totalFee = existing.totalFee
      formData.caretakerFee = existing.caretakerFee
      formData.liftFee = existing.liftFee
      formData.wasteFee = existing.wasteFee
      formData.waterFee = existing.waterFee != null ? existing.waterFee : 0
      formData.electricityFee = existing.electricityFee != null ? existing.electricityFee : 0
      formData.otherFee = existing.otherFee
      formData.dueDate = existing.dueDate ? String(existing.dueDate).split('T')[0] : `${existing.year}-${String(MONTH_NAMES.indexOf(existing.monthName) + 1).padStart(2, '0')}-10`
      formData.status = existing.status
    } else {
      editingFeeId.value = null
      formData.monthName = mName
      formData.year = yNum
      formData.totalFee = 3000
      formData.caretakerFee = 800
      formData.liftFee = 500
      formData.wasteFee = 200
      formData.waterFee = 500
      formData.electricityFee = 300
      formData.otherFee = 700
      handleMonthChange()
      formData.status = 'PUBLISHED'
    }
  }
  isSetModalOpen.value = true
}

function openPublishReview(fee) {
  targetReviewFee.value = fee
  isReviewModalOpen.value = true
}

function openPublishReviewFromForm() {
  if (breakdownSum.value !== formData.totalFee) {
    Swal.fire({
      icon: 'warning',
      title: 'Component Sum Mismatch',
      text: `Component breakdown sum (৳${breakdownSum.value.toLocaleString()}) must match total service fee (৳${Number(formData.totalFee || 0).toLocaleString()}).`,
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  targetReviewFee.value = {
    serviceFeeId: editingFeeId.value || null,
    monthName: formData.monthName,
    year: formData.year,
    monthYearLabel: `${formData.monthName} ${formData.year}`,
    totalFee: formData.totalFee,
    caretakerFee: formData.caretakerFee,
    liftFee: formData.liftFee,
    wasteFee: formData.wasteFee,
    waterFee: formData.waterFee,
    electricityFee: formData.electricityFee,
    otherFee: formData.otherFee,
    dueDate: formData.dueDate,
    isFromForm: true
  }
  isSetModalOpen.value = false
  isReviewModalOpen.value = true
}

async function saveAsDraft() {
  if (breakdownSum.value !== formData.totalFee) {
    Swal.fire({
      icon: 'warning',
      title: 'Component Sum Mismatch',
      text: `Component breakdown sum (৳${breakdownSum.value.toLocaleString()}) must match total service fee (৳${Number(formData.totalFee || 0).toLocaleString()}).`,
      confirmButtonColor: '#4f46e5'
    })
    return
  }

  const monthIdx = MONTH_NAMES.indexOf(formData.monthName) + 1
  const monthStr = `${formData.year}-${String(monthIdx).padStart(2, '0')}-01`

  isSaving.value = true
  try {
    await serviceFeeService.saveServiceFee({
      serviceFeeId: editingFeeId.value || null,
      month: monthStr,
      billingMonth: formData.monthName,
      billingYear: formData.year,
      year: formData.year,
      dueDate: formData.dueDate,
      caretakerFee: formData.caretakerFee,
      liftFee: formData.liftFee,
      wasteFee: formData.wasteFee,
      waterFee: formData.waterFee,
      electricityFee: formData.electricityFee,
      otherFee: formData.otherFee,
      totalFee: formData.totalFee,
      status: 'DRAFT'
    })

    isSetModalOpen.value = false
    Swal.fire({
      icon: 'success',
      title: 'Saved as Draft',
      text: `Service charge for ${formData.monthName} ${formData.year} has been saved as a draft. It will not be visible to residents until published.`,
      confirmButtonColor: '#4f46e5'
    })
    await loadFees()
    emit('feeUpdated')
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Failed to Save Draft',
      text: err.response?.data?.message || err.message || 'Error occurred while saving.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isSaving.value = false
  }
}

async function executePublish() {
  isPublishing.value = true
  try {
    const target = targetReviewFee.value
    if (target.isFromForm) {
      const monthIdx = MONTH_NAMES.indexOf(formData.monthName) + 1
      const monthStr = `${formData.year}-${String(monthIdx).padStart(2, '0')}-01`
      await serviceFeeService.saveServiceFee({
        serviceFeeId: target.serviceFeeId || editingFeeId.value || null,
        month: monthStr,
        billingMonth: formData.monthName,
        billingYear: formData.year,
        year: formData.year,
        dueDate: formData.dueDate,
        caretakerFee: formData.caretakerFee,
        liftFee: formData.liftFee,
        wasteFee: formData.wasteFee,
        waterFee: formData.waterFee,
        electricityFee: formData.electricityFee,
        otherFee: formData.otherFee,
        totalFee: formData.totalFee,
        status: 'PUBLISHED'
      })
    } else if (target.serviceFeeId) {
      await serviceFeeService.publishServiceFee(target.serviceFeeId)
    }

    isReviewModalOpen.value = false
    Swal.fire({
      icon: 'success',
      title: 'Service Charge Published!',
      html: `
        <div class="text-left text-xs bg-emerald-50 p-3 rounded-lg border border-emerald-200 mt-2 space-y-1">
          <div><b>Month:</b> ${target.monthYearLabel || `${formData.monthName} ${formData.year}`}</div>
          <div><b>Service Charge:</b> ৳ ${target.totalFee}</div>
          <div><b>Status:</b> Published (Active)</div>
        </div>
        <p class="text-xs text-slate-600 mt-3">The published rate is now visible to all apartment owners and residents.</p>
      `,
      confirmButtonColor: '#059669'
    })
    await loadFees()
    emit('feeUpdated')
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Failed to Publish',
      text: err.response?.data?.message || err.message || 'Error publishing service fee.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isPublishing.value = false
  }
}

function viewFeeDetails(fee) {
  Swal.fire({
    title: `${fee.monthYearLabel} Service Charge Details`,
    html: `
      <div class="text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-2">
        <div class="flex justify-between"><b>Total Service Charge:</b> <span class="font-bold text-slate-900">${formatCurrency(fee.totalFee)}</span></div>
        <div class="flex justify-between"><b>Caretaker Fee:</b> <span>${fee.caretakerFee != null ? formatCurrency(fee.caretakerFee) : '—'}</span></div>
        <div class="flex justify-between"><b>Lift Maintenance:</b> <span>${fee.liftFee != null ? formatCurrency(fee.liftFee) : '—'}</span></div>
        <div class="flex justify-between"><b>Waste Disposal:</b> <span>${fee.wasteFee != null ? formatCurrency(fee.wasteFee) : '—'}</span></div>
        <div class="flex justify-between"><b>Water Bill:</b> <span>${fee.waterFee != null ? formatCurrency(fee.waterFee) : '—'}</span></div>
        <div class="flex justify-between"><b>Common Electricity Bill:</b> <span>${fee.electricityFee != null ? formatCurrency(fee.electricityFee) : '—'}</span></div>
        <div class="flex justify-between"><b>Other:</b> <span>${fee.otherFee != null ? formatCurrency(fee.otherFee) : '—'}</span></div>
        <div class="flex justify-between border-t border-slate-200 pt-2"><b>Publication Status:</b> <span class="text-emerald-700 font-bold">Published</span></div>
        <div class="flex justify-between"><b>Payments Recorded:</b> <span>${fee.paymentCount || 0} apartment payments</span></div>
        <div class="flex justify-between"><b>Due Date:</b> <span>${formatFeeDueDate(fee.dueDate)}</span></div>
      </div>
    `,
    confirmButtonColor: '#4f46e5'
  })
}
</script>
