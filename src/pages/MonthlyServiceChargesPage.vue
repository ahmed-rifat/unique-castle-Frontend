<template>
  <div class="space-y-6">
    <!-- Top Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Monthly Service Charges
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            Super Admin View
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Create, edit, and publish monthly service charges for the rolling 3-month window (Previous, Current, and Next month). Older records remain safely stored in the database.
        </p>
      </div>

      <!-- Action Button -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="openSetModal()"
          class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Set / Update Service Charge</span>
        </button>
      </div>
    </div>

    <!-- Active 3-Month Window Indicator -->
    <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-indigo-950">
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
        <span class="font-bold">Rolling 3-Month Active Window:</span>
        <span class="font-semibold text-indigo-800">
          {{ rollingWindowSummary }}
        </span>
      </div>
      <div class="text-[11px] text-slate-500">
        Automatically synchronized with current calendar date • Older records archived
      </div>
    </div>

    <!-- 3-Month Cards Summary (Previous, Current, Next) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="item in threeMonthSummaries"
        :key="item.type"
        class="bg-white p-5 rounded-xl border shadow-xs transition-all flex flex-col justify-between"
        :class="getCardBorderClass(item.type)"
      >
        <div>
          <!-- Header Tag -->
          <div class="flex items-center justify-between mb-3">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
              :class="getBadgeClass(item.type)"
            >
              {{ item.label }}
            </span>

            <span
              v-if="item.feeRecord"
              class="inline-flex items-center gap-1 text-[11px] font-bold"
              :class="item.feeRecord.isPublished ? 'text-emerald-700' : 'text-amber-700'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="item.feeRecord.isPublished ? 'bg-emerald-500' : 'bg-amber-500'"></span>
              {{ item.feeRecord.isPublished ? 'Published' : 'Draft' }}
            </span>
            <span v-else class="text-[11px] text-slate-400 font-medium">
              Not Configured
            </span>
          </div>

          <!-- Month Title -->
          <div class="text-base font-extrabold text-slate-900">
            {{ item.monthYearLabel }}
          </div>

          <!-- Total Amount -->
          <div class="text-2xl font-black mt-1" :class="item.feeRecord ? 'text-slate-900' : 'text-slate-400'">
            {{ item.feeRecord ? formatCurrency(item.feeRecord.totalFee) : '—' }}
          </div>

          <!-- Due Date or Components Info -->
          <div class="text-xs text-slate-500 mt-2 space-y-0.5">
            <div v-if="item.feeRecord?.dueDate">
              Due Date: <b class="text-slate-700">{{ formatDueDate(item.feeRecord.dueDate) }}</b>
            </div>
            <div v-if="item.feeRecord">
              Breakdown: Caretaker ৳{{ item.feeRecord.caretakerFee }}, Lift ৳{{ item.feeRecord.liftFee }}, Waste ৳{{ item.feeRecord.wasteFee }}
            </div>
            <div v-else class="text-slate-400 italic">
              No charge set for this month yet.
            </div>
          </div>
        </div>

        <!-- Quick Card Action -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div class="text-[11px] text-slate-400">
            <span v-if="item.feeRecord?.hasPayments">
              {{ item.feeRecord.paymentCount }} payments linked
            </span>
            <span v-else-if="item.feeRecord?.isPublished">
              Visible to residents
            </span>
            <span v-else-if="item.feeRecord">
              Hidden from residents
            </span>
            <span v-else>
              Ready to configure
            </span>
          </div>

          <button
            type="button"
            @click="handleCardAction(item)"
            class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
            :class="item.feeRecord ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'"
          >
            <span>{{ item.feeRecord ? (item.feeRecord.isPublished ? 'View / Edit' : 'Review & Publish') : '+ Set Rate' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtered Service Charge List Table (Exactly 3 Months) -->
    <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 class="font-extrabold text-slate-800 text-base flex items-center gap-2">
            Active 3-Month Service Charge Schedule
            <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Only 3 Months
            </span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Strictly displays records for the previous, current, and upcoming calendar months.
          </p>
        </div>

        <button
          type="button"
          @click="loadData"
          class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition cursor-pointer flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin text-indigo-600' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center gap-2">
        <svg class="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span class="text-xs text-slate-500 font-medium">Loading 3-month service charges...</span>
      </div>

      <!-- Table Body -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-100/75 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-5">Billing Month</th>
              <th class="py-3.5 px-5">Due Date</th>
              <th class="py-3.5 px-5">Individual Fee Breakdown</th>
              <th class="py-3.5 px-5 text-right">Total Fee</th>
              <th class="py-3.5 px-5 text-center">Publication Status</th>
              <th class="py-3.5 px-5">Published Date</th>
              <th class="py-3.5 px-5 text-center">Available Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="item in threeMonthRows"
              :key="item.type + item.monthKey"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- 1. Month with Period Tag -->
              <td class="py-4 px-5 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-slate-900 text-sm">
                    {{ item.monthYearLabel }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-extrabold border"
                    :class="getBadgeClass(item.type)"
                  >
                    {{ item.label }}
                  </span>
                </div>
              </td>

              <!-- 2. Due Date -->
              <td class="py-4 px-5 whitespace-nowrap text-slate-700 font-medium">
                <span v-if="item.feeRecord?.dueDate">
                  {{ formatDueDate(item.feeRecord.dueDate) }}
                </span>
                <span v-else class="text-slate-400 italic">
                  Default: 10th
                </span>
              </td>

              <!-- 3. Individual Fee Breakdown (all components) -->
              <td class="py-4 px-5 whitespace-nowrap">
                <div v-if="item.feeRecord" class="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Caretaker: {{ item.feeRecord.caretakerFee != null ? formatCurrency(item.feeRecord.caretakerFee) : '—' }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Lift: {{ item.feeRecord.liftFee != null ? formatCurrency(item.feeRecord.liftFee) : '—' }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Waste: {{ item.feeRecord.wasteFee != null ? formatCurrency(item.feeRecord.wasteFee) : '—' }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Water: {{ item.feeRecord.waterFee != null ? formatCurrency(item.feeRecord.waterFee) : '—' }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Electricity: {{ item.feeRecord.electricityFee != null ? formatCurrency(item.feeRecord.electricityFee) : '—' }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Other: {{ item.feeRecord.otherFee != null ? formatCurrency(item.feeRecord.otherFee) : '—' }}
                  </span>
                </div>
                <div v-else class="text-slate-400 italic text-[11px]">
                  Not configured yet
                </div>
              </td>

              <!-- 4. Total Monthly Fee -->
              <td class="py-4 px-5 text-right whitespace-nowrap">
                <span v-if="item.feeRecord" class="text-base font-black text-slate-900">
                  {{ formatCurrency(item.feeRecord.totalFee) }}
                </span>
                <span v-else class="text-slate-400 font-bold">
                  —
                </span>
              </td>

              <!-- 5. Publication Status -->
              <td class="py-4 px-5 text-center whitespace-nowrap">
                <template v-if="item.feeRecord">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                    :class="item.feeRecord.isPublished
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="item.feeRecord.isPublished ? 'bg-emerald-500' : 'bg-amber-500'"
                    ></span>
                    {{ item.feeRecord.isPublished ? 'Published' : 'Draft' }}
                  </span>
                </template>
                <template v-else>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                    Not Set
                  </span>
                </template>
              </td>

              <!-- 6. Published Date -->
              <td class="py-4 px-5 whitespace-nowrap text-slate-500">
                <span v-if="item.feeRecord?.isPublished && item.feeRecord?.publishedDate">
                  {{ formatDate(item.feeRecord.publishedDate, false) }}
                </span>
                <span v-else-if="item.feeRecord" class="text-slate-400 italic">
                  Not Published
                </span>
                <span v-else class="text-slate-300">
                  —
                </span>
              </td>

              <!-- 7. Available Actions -->
              <td class="py-4 px-5 text-center whitespace-nowrap">
                <!-- If Fee Record Exists -->
                <div v-if="item.feeRecord" class="flex items-center justify-center gap-1.5">
                  <!-- If Draft: Offer Publish and Edit -->
                  <template v-if="!item.feeRecord.isPublished">
                    <button
                      type="button"
                      @click="openPublishReview(item.feeRecord)"
                      class="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Publish</span>
                    </button>

                    <button
                      type="button"
                      @click="openSetModal(item.feeRecord)"
                      class="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      Edit
                    </button>
                  </template>

                  <!-- If Published: Check for Payments -->
                  <template v-else>
                    <div v-if="item.feeRecord.hasPayments" class="flex items-center gap-1.5">
                      <span
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
                        title="Payments are already recorded against this rate."
                      >
                        <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Locked ({{ item.feeRecord.paymentCount }} Payments)</span>
                      </span>

                      <button
                        type="button"
                        @click="viewFeeDetails(item.feeRecord)"
                        class="px-2 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                      >
                        Details
                      </button>
                    </div>

                    <div v-else class="flex items-center gap-1.5">
                      <button
                        type="button"
                        @click="openSetModal(item.feeRecord)"
                        class="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                      >
                        Update
                      </button>
                    </div>
                  </template>
                </div>

                <!-- If Fee Record Does Not Exist Yet -->
                <div v-else class="flex items-center justify-center">
                  <button
                    type="button"
                    @click="initNewChargeForMonth(item)"
                    class="px-3 py-1 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition cursor-pointer flex items-center gap-1"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Set Rate</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: Set / Update Service Charge -->
    <div
      v-if="isSetModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-base">
                {{ editingFeeId ? 'Update Service Charge' : 'Set Monthly Service Charge' }}
              </h4>
              <p class="text-xs text-slate-500">
                Applicable for the selected 3-month billing window.
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
          <!-- Month Selection restricted to / focused on the 3 Rolling Months -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              Select Applicable Month (3-Month Window) <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="m in rollingMonths"
                :key="m.monthKey"
                type="button"
                :disabled="Boolean(editingFeeId)"
                @click="chooseMonth(m)"
                class="p-2.5 rounded-xl border text-center transition cursor-pointer disabled:cursor-not-allowed"
                :class="formData.monthName === m.monthName && formData.year === m.year
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20 font-extrabold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'"
              >
                <div class="text-[10px] uppercase font-bold text-slate-400">{{ m.label }}</div>
                <div class="text-xs font-bold mt-0.5">{{ m.monthName }} {{ m.year }}</div>
              </button>
            </div>
          </div>

          <!-- Total Fee Input -->
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
              Service fee amount charged to apartment residents for {{ formData.monthName }} {{ formData.year }}.
            </p>
          </div>

          <!-- Component Breakdown (6 components) -->
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
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Lift Maintenance (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.liftFee"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Waste Disposal (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.wasteFee"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Water Bill (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.waterFee"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Common Electricity Bill (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.electricityFee"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">Other (৳)</label>
                <input
                  type="number"
                  v-model.number="formData.otherFee"
                  class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <!-- Payment Due Date -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              v-model="formData.dueDate"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <!-- Duplicate Check Notice -->
          <div v-if="duplicateWarning" class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ duplicateWarning }}</span>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              @click="isSetModalOpen = false"
              class="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <!-- Save as Draft -->
              <button
                type="button"
                :disabled="isSaving || breakdownSum !== formData.totalFee"
                @click="saveAsDraft"
                class="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 disabled:opacity-50 transition cursor-pointer"
              >
                <span>Save as Draft</span>
              </button>

              <!-- Publish -->
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

    <!-- MODAL: Pre-Publication Review -->
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
              Review details before activating for all residents.
            </p>
          </div>
        </div>

        <!-- Review Body -->
        <div class="p-6 space-y-4 text-xs">
          <p class="text-slate-600">
            Confirming will publish this rate and make it immediately visible to all apartment owners:
          </p>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Billing Month:</span>
              <span class="font-extrabold text-slate-900 text-sm">
                {{ targetReviewFee?.monthYearLabel || `${formData.monthName} ${formData.year}` }}
              </span>
            </div>

            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Total Charge:</span>
              <span class="font-black text-emerald-700 text-base">
                {{ formatCurrency(targetReviewFee?.totalFee || formData.totalFee) }}
              </span>
            </div>

            <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Payment Due Date:</span>
              <span class="font-bold text-slate-800">
                {{ formatDueDate(targetReviewFee?.dueDate || formData.dueDate) }}
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
                All 36 Apartment Units
              </span>
            </div>
          </div>

          <!-- Component Breakdown in Review -->
          <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900">
            <div class="font-bold text-indigo-800 mb-1">Fee Components Breakdown:</div>
            <div class="grid grid-cols-2 gap-1 text-slate-700">
              <div>• Caretaker: <b>৳{{ targetReviewFee?.caretakerFee ?? formData.caretakerFee }}</b></div>
              <div>• Lift Maintenance: <b>৳{{ targetReviewFee?.liftFee ?? formData.liftFee }}</b></div>
              <div>• Waste Disposal: <b>৳{{ targetReviewFee?.wasteFee ?? formData.wasteFee }}</b></div>
              <div>• Water Bill: <b>৳{{ targetReviewFee?.waterFee ?? formData.waterFee }}</b></div>
              <div>• Common Electricity: <b>৳{{ targetReviewFee?.electricityFee ?? formData.electricityFee }}</b></div>
              <div>• Other: <b>৳{{ targetReviewFee?.otherFee ?? formData.otherFee }}</b></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="isReviewModalOpen = false"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              :disabled="isPublishing"
              @click="executePublish"
              class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
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
import { serviceFeeService } from '../services/serviceFeeService.js'
import { formatCurrency } from '../utils/currency.js'
import { getThreeRollingMonths, formatDate } from '../utils/date.js'

// 3 Rolling Months dynamically calculated from current calendar date
const rollingMonths = computed(() => getThreeRollingMonths())

const rollingWindowSummary = computed(() => {
  const list = rollingMonths.value
  return `${list[0]?.monthYearLabel} — ${list[1]?.monthYearLabel} — ${list[2]?.monthYearLabel}`
})

const allServiceFees = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const isPublishing = ref(false)

const isSetModalOpen = ref(false)
const isReviewModalOpen = ref(false)
const editingFeeId = ref(null)
const targetReviewFee = ref(null)

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
})

// Match each of the 3 rolling months with its fee record from API
const threeMonthSummaries = computed(() => {
  return rollingMonths.value.map(item => {
    const feeRecord = allServiceFees.value.find(f =>
      f.monthName === item.monthName && Number(f.year) === Number(item.year)
    )
    return {
      ...item,
      feeRecord: feeRecord || null
    }
  })
})

// The table displays strictly only the 3 months
const threeMonthRows = computed(() => {
  return threeMonthSummaries.value
})

// Form Data for Set / Update Modal
const formData = reactive({
  monthName: '',
  year: 2026,
  totalFee: 3000,
  caretakerFee: 800,
  liftFee: 500,
  wasteFee: 200,
  waterFee: 500,
  electricityFee: 300,
  otherFee: 700,
  dueDate: '',
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

const duplicateWarning = computed(() => {
  if (editingFeeId.value) return null
  const existing = allServiceFees.value.find(f => f.monthName === formData.monthName && Number(f.year) === Number(formData.year))
  if (existing) {
    if (existing.hasPayments) {
      return `A service charge for ${formData.monthName} ${formData.year} is already published and has ${existing.paymentCount} payments recorded. It cannot be altered.`
    }
    return `A record for ${formData.monthName} ${formData.year} already exists (${existing.status}). Submitting will update this existing record.`
  }
  return null
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    allServiceFees.value = await serviceFeeService.getAllServiceFees()
  } catch (err) {
    console.error('Failed to load service charges:', err)
  } finally {
    isLoading.value = false
  }
}

function getCardBorderClass(type) {
  if (type === 'CURRENT') return 'border-emerald-200 bg-emerald-50/20 ring-1 ring-emerald-500/20'
  if (type === 'NEXT') return 'border-indigo-200 bg-indigo-50/20 ring-1 ring-indigo-500/20'
  return 'border-slate-200 bg-white'
}

function getBadgeClass(type) {
  if (type === 'PREVIOUS') return 'bg-slate-100 text-slate-700 border-slate-200'
  if (type === 'CURRENT') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (type === 'NEXT') return 'bg-indigo-100 text-indigo-800 border-indigo-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

function formatDueDate(dueDate) {
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

function chooseMonth(item) {
  formData.monthName = item.monthName
  formData.year = item.year
  const paddedMonth = String(item.monthIndex).padStart(2, '0')
  formData.dueDate = `${item.year}-${paddedMonth}-10`

  // Check if fee already exists for this month to pre-populate and update
  const existing = allServiceFees.value.find(f => f.monthName === item.monthName && Number(f.year) === Number(item.year))
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

function openSetModal(fee = null) {
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
    formData.dueDate = fee.dueDate ? String(fee.dueDate).split('T')[0] : `${fee.year}-10-10`
    formData.status = fee.status
  } else {
    editingFeeId.value = null
    // Default to Next Month (Upcoming)
    const nextItem = rollingMonths.value[2] || rollingMonths.value[1]
    chooseMonth(nextItem)
    formData.totalFee = 3000
    formData.caretakerFee = 800
    formData.liftFee = 500
    formData.wasteFee = 200
    formData.waterFee = 500
    formData.electricityFee = 300
    formData.otherFee = 700
    formData.status = 'PUBLISHED'
  }
  isSetModalOpen.value = true
}

function initNewChargeForMonth(item) {
  chooseMonth(item)
  if (!editingFeeId.value) {
    formData.totalFee = item.type === 'NEXT' ? 3000 : 2500
    formData.caretakerFee = 800
    formData.liftFee = 500
    formData.wasteFee = 200
    formData.waterFee = 500
    formData.electricityFee = 300
    autoBalanceBreakdown()
    formData.status = 'PUBLISHED'
  }
  isSetModalOpen.value = true
}

function handleCardAction(item) {
  if (!item.feeRecord) {
    initNewChargeForMonth(item)
  } else if (!item.feeRecord.isPublished) {
    openPublishReview(item.feeRecord)
  } else {
    openSetModal(item.feeRecord)
  }
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

  const selectedRolling = rollingMonths.value.find(m => m.monthName === formData.monthName && m.year === formData.year)
  const monthIdx = selectedRolling ? selectedRolling.monthIndex : (MONTH_NAMES.indexOf(formData.monthName) + 1)
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
      text: `Service charge for ${formData.monthName} ${formData.year} has been saved as draft. It is not visible to residents until published.`,
      confirmButtonColor: '#4f46e5'
    })
    await loadData()
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
      const selectedRolling = rollingMonths.value.find(m => m.monthName === formData.monthName && m.year === formData.year)
      const monthIdx = selectedRolling ? selectedRolling.monthIndex : (MONTH_NAMES.indexOf(formData.monthName) + 1)
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
        <p class="text-xs text-slate-600 mt-3">The published rate is now active and visible to all residents.</p>
      `,
      confirmButtonColor: '#059669'
    })
    await loadData()
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
        <div class="flex justify-between"><b>Due Date:</b> <span>${formatDueDate(fee.dueDate)}</span></div>
      </div>
    `,
    confirmButtonColor: '#4f46e5'
  })
}
</script>
