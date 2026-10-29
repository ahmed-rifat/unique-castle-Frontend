<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Super Admin Review
          </span>
          <h3 class="text-lg font-bold text-slate-800 mt-1">
            Payment Audit & Verification
          </h3>
        </div>
        <button
          type="button"
          @click="close"
          class="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Payment Details Body -->
      <div class="p-6 space-y-4">
        <!-- Status & Amount Banner -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 font-medium">Submitted Amount</div>
            <div class="text-2xl font-black text-slate-900 mt-0.5">{{ formatCurrency(flat?.paidAmount || flat?.totalCharge) }}</div>
          </div>
          <PaymentStatusBadge :status="flat?.status" />
        </div>

        <!-- Detail Grid -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span class="text-slate-400 block font-medium">Flat Unit</span>
            <span class="text-slate-800 font-bold text-sm">Flat {{ flat?.flatNumber }}</span>
          </div>

          <div class="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span class="text-slate-400 block font-medium">Owner Name</span>
            <span class="text-slate-800 font-bold text-sm">{{ flat?.ownerName }}</span>
          </div>

          <div class="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span class="text-slate-400 block font-medium">Billing Period</span>
            <span class="text-slate-800 font-semibold">{{ flat?.billingMonth || 'October' }} {{ flat?.billingYear || 2026 }}</span>
          </div>

          <div class="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span class="text-slate-400 block font-medium">Submission Date</span>
            <span class="text-slate-800 font-semibold">{{ formatDate(flat?.paymentDate, true) }}</span>
          </div>

          <div class="col-span-2 p-3 rounded-lg border border-indigo-100 bg-indigo-50/40">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-indigo-500 block font-medium text-[11px]">bKash Transaction ID (TrxID)</span>
                <span class="text-indigo-900 font-mono font-bold text-sm">{{ flat?.transactionId || 'None Provided' }}</span>
              </div>
              <button
                v-if="flat?.transactionId"
                type="button"
                @click="copyTrxId"
                class="px-2 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 rounded text-[11px] font-semibold text-indigo-700 transition cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          <div class="col-span-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span class="text-slate-400 block font-medium">Sender bKash Phone</span>
            <span class="text-slate-800 font-bold font-mono">{{ flat?.phoneNumber || '—' }}</span>
          </div>
        </div>

        <!-- Verification Checklist hint -->
        <div class="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2">
          <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            Confirm the TrxID matches the official bKash merchant statement before approving. Once verified, the flat status will be cleared as Paid.
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <button
          type="button"
          @click="handleReject"
          :disabled="isProcessing"
          class="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition cursor-pointer"
        >
          Reject Payment
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="close"
            class="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleVerify"
            :disabled="isProcessing"
            class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ isProcessing ? 'Verifying...' : 'Verify & Confirm Payment' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import { formatCurrency } from '../../utils/currency.js'
import { formatDate } from '../../utils/date.js'
import PaymentStatusBadge from '../dashboard/PaymentStatusBadge.vue'

const props = defineProps({
  isOpen: Boolean,
  flat: Object,
  isProcessing: Boolean
})

const emit = defineEmits(['close', 'verify', 'reject'])

function close() {
  emit('close')
}

function copyTrxId() {
  if (props.flat?.transactionId) {
    navigator.clipboard.writeText(props.flat.transactionId)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'TrxID copied to clipboard',
      showConfirmButton: false,
      timer: 1800
    })
  }
}

function handleVerify() {
  Swal.fire({
    title: `Verify Payment for Flat ${props.flat?.flatNumber}?`,
    html: `Are you sure you want to approve bKash TrxID: <b>${props.flat?.transactionId || 'N/A'}</b>?<br/><span class="text-xs text-slate-500 mt-2 block">This will mark Flat ${props.flat?.flatNumber} as Paid for the selected billing period.</span>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Verify Payment',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b'
  }).then((result) => {
    if (result.isConfirmed) {
      emit('verify', {
        flatNumber: props.flat?.flatNumber,
        phoneNumber: props.flat?.phoneNumber,
        transactionId: props.flat?.transactionId,
        serviceFeePaymentId: props.flat?.serviceFeePaymentId,
        flatId: props.flat?.flatId
      })
    }
  })
}

function handleReject() {
  Swal.fire({
    title: `Reject Payment for Flat ${props.flat?.flatNumber}?`,
    text: 'Please provide a reason for rejecting this transaction (e.g., Invalid TrxID, mismatched amount):',
    input: 'text',
    inputPlaceholder: 'Reason for rejection...',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Reject Payment',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    preConfirm: (reason) => {
      if (!reason || !reason.trim()) {
        Swal.showValidationMessage('Please enter a rejection reason')
      }
      return reason
    }
  }).then((result) => {
    if (result.isConfirmed) {
      emit('reject', {
        flatNumber: props.flat?.flatNumber,
        reason: result.value
      })
    }
  })
}
</script>
