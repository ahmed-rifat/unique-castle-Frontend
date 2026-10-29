<template>
  <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
    <!-- Official bKash Header with Copyable Number -->
    <div class="p-5 bg-gradient-to-r from-pink-600 via-pink-700 to-rose-700 text-white">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Official bKash Payment Gateway
          </div>
          <h4 class="text-lg font-bold">bKash Service Charge Deposit</h4>
          <p class="text-xs text-pink-100 mt-0.5">
            Send money to our official bKash number and submit the transaction receipt.
          </p>
        </div>

        <!-- Copy Number Pill -->
        <div class="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl flex items-center gap-3">
          <div>
            <div class="text-[10px] text-pink-200 uppercase font-semibold">bKash Account</div>
            <div class="text-lg font-mono font-bold tracking-wider">{{ bkashNumber }}</div>
          </div>
          <button
            type="button"
            @click="copyBkashNumber"
            class="px-3 py-1.5 rounded-lg bg-white text-pink-700 font-bold text-xs hover:bg-pink-50 transition shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <!-- Quick Steps -->
      <div class="mt-4 pt-3 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-pink-50">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">1</span>
          <span>Send exact amount via bKash</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">2</span>
          <span>Add Flat # as reference</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">3</span>
          <span>Enter TrxID below to verify</span>
        </div>
      </div>
    </div>

    <!-- Payment Status Warning Banner if Already Paid or Pending -->
    <div v-if="currentStatus === 'Paid'" class="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3 text-emerald-800 text-xs">
      <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span class="font-bold">Payment Verified:</span> This flat has already cleared the service charge for {{ month }} {{ year }}. No further payment is required.
      </div>
    </div>

    <div v-else-if="currentStatus === 'Pending Verification'" class="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3 text-amber-800 text-xs">
      <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span class="font-bold">Verification Pending:</span> A payment transaction has already been submitted for Flat {{ flatNumber }} and is awaiting Super Admin verification.
      </div>
    </div>

    <div v-else-if="currentStatus === 'Exempt (Not Moved In)'" class="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3 text-indigo-900 text-xs">
      <svg class="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span class="font-bold">Service Charge Exemption:</span> Flat {{ flatNumber }} is recorded as <b>Not Moved In</b> for {{ month }} {{ year }}. You are exempt from monthly service charges for this period and no payment is required.
      </div>
    </div>

    <!-- Form Body -->
    <form @submit.prevent="handleSubmit" class="p-5">
      <!-- Resident & Unit Identification Banner -->
      <div class="mb-5 p-3.5 bg-indigo-50/70 border border-indigo-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {{ (ownerName || 'R').charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="font-bold text-slate-900 leading-tight">
              {{ ownerName || 'Resident Owner' }}
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">
              Assigned Apartment Unit: <span class="font-bold text-indigo-700">Flat {{ form.flatNumber || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="text-right">
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-slate-700 border border-indigo-100 shadow-2xs">
            {{ form.phoneNumber || userPhoneNumber || 'bKash Account' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Flat Number -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Flat Number <span class="text-rose-500">*</span>
          </label>
          <!-- Multiple flats dropdown if owner owns > 1 flat -->
          <select
            v-if="availableFlats && availableFlats.length > 1"
            v-model="form.flatNumber"
            @change="handleFlatSelectChange"
            class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option v-for="f in availableFlats" :key="f.flatId || f.flatNumber" :value="f.flatNumber">
              Flat {{ f.flatNumber }}
            </option>
          </select>
          <input
            v-else
            type="text"
            v-model="form.flatNumber"
            :disabled="!isAdmin"
            class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-75 disabled:bg-slate-100"
            placeholder="Flat number"
          />
          <span v-if="errors.flatNumber" class="text-rose-500 text-[11px] mt-0.5 block">{{ errors.flatNumber }}</span>
        </div>

        <!-- Billing Period -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Billing Period
          </label>
          <input
            type="text"
            :value="`${month} ${year}`"
            disabled
            class="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
          />
        </div>

        <!-- Payment Amount -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Payment Amount (BDT) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-bold">৳</span>
            <input
              type="number"
              v-model.number="form.amount"
              :disabled="!isAdmin"
              class="w-full ml-2 px-3 py-2 text-sm font-bold bg-slate-100 border border-slate-400 rounded-lg text-slate-600 cursor-not-allowed"
            />
          </div>
          <span v-if="errors.amount" class="text-rose-500 text-[11px] mt-0.5 block">{{ errors.amount }}</span>
        </div>

        <!-- bKash Sender Phone Number -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            bKash Account Phone Number <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.phoneNumber"
            maxlength="11"
            class="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            placeholder="01XXXXXXXXX (11 digits)"
          />
          <span v-if="errors.phoneNumber" class="text-rose-500 text-[11px] mt-0.5 block">{{ errors.phoneNumber }}</span>
        </div>

        <!-- Transaction ID -->
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            bKash Transaction ID (TrxID) <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.transactionId"
            class="w-full px-3 py-2 text-sm uppercase font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            placeholder="e.g. BK9X84H21 or 9J8K7L6M5"
          />
          <span class="text-[11px] text-slate-400 mt-1 block">
            Obtained in the SMS confirmation from bKash after completing the transfer.
          </span>
          <span v-if="errors.transactionId" class="text-rose-500 text-[11px] mt-0.5 block">{{ errors.transactionId }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div class="text-[11px] text-slate-500 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Submissions enter pending state until verified by the building Super Admin.
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || currentStatus === 'Paid' || currentStatus === 'Exempt (Not Moved In)'"
          class="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{ isSubmitting ? 'Submitting Details...' : 'Submit Payment for Verification' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  flatId: {
    type: [Number, String],
    default: null
  },
  serviceFeeId: {
    type: [Number, String],
    default: null
  },
  flatNumber: {
    type: String,
    default: ''
  },
  ownerName: {
    type: String,
    default: ''
  },
  userPhoneNumber: {
    type: String,
    default: ''
  },
  availableFlats: {
    type: Array,
    default: () => []
  },
  month: {
    type: String,
    default: 'October'
  },
  year: {
    type: [String, Number],
    default: 2026
  },
  defaultAmount: {
    type: Number,
    default: 2500
  },
  currentStatus: {
    type: String,
    default: 'Not Paid'
  },
  bkashNumber: {
    type: String,
    default: '01712345678'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submitPayment', 'changeFlat'])

const copied = ref(false)

const form = reactive({
  flatNumber: props.flatNumber,
  amount: props.defaultAmount,
  phoneNumber: props.userPhoneNumber || '',
  transactionId: ''
})

const errors = reactive({
  flatNumber: '',
  amount: '',
  phoneNumber: '',
  transactionId: ''
})

watch(() => props.flatNumber, (newVal) => {
  if (newVal) form.flatNumber = newVal
}, { immediate: true })

watch(() => props.userPhoneNumber, (newVal) => {
  if (newVal) {
    form.phoneNumber = newVal
  }
}, { immediate: true })

watch(() => props.defaultAmount, (newVal) => {
  if (newVal) form.amount = newVal
}, { immediate: true })

function handleFlatSelectChange(e) {
  emit('changeFlat', e.target.value)
}

function copyBkashNumber() {
  navigator.clipboard.writeText(props.bkashNumber)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2500)
}

function validateForm() {
  let isValid = true
  errors.flatNumber = ''
  errors.amount = ''
  errors.phoneNumber = ''
  errors.transactionId = ''

  if (!form.flatNumber || !form.flatNumber.trim()) {
    errors.flatNumber = 'Flat number is required'
    isValid = false
  }

  if (!form.amount || Number(form.amount) <= 0) {
    errors.amount = 'Please enter a valid amount'
    isValid = false
  }

  // BD phone number check: starts with 01 and has 11 digits
  const bdPhoneRegex = /^01[3-9]\d{8}$/
  if (!form.phoneNumber) {
    errors.phoneNumber = 'bKash phone number is required'
    isValid = false
  } else if (!bdPhoneRegex.test(form.phoneNumber.trim())) {
    errors.phoneNumber = 'Enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)'
    isValid = false
  }

  if (!form.transactionId || !form.transactionId.trim()) {
    errors.transactionId = 'Transaction ID is required'
    isValid = false
  } else if (form.transactionId.trim().length < 6) {
    errors.transactionId = 'Transaction ID is too short'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validateForm()) return

  if (props.currentStatus === 'Pending Verification') {
    Swal.fire({
      icon: 'warning',
      title: 'Payment Pending',
      text: 'A payment has already been submitted for this flat and is awaiting Super Admin verification. Do you want to submit another transaction?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit Again',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5'
    }).then((result) => {
      if (result.isConfirmed) {
        emitSubmit()
      }
    })
    return
  }

  emitSubmit()
}

function emitSubmit() {
  emit('submitPayment', {
    flatId: props.flatId,
    serviceFeeId: props.serviceFeeId,
    flatNumber: form.flatNumber.trim().toUpperCase(),
    month: props.month,
    year: props.year,
    amount: form.amount,
    phoneNumber: form.phoneNumber.trim(),
    transactionId: form.transactionId.trim().toUpperCase()
  })
}
</script>
