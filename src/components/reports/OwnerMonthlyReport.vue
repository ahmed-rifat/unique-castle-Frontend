<template>
  <button
    type="button"
    @click="downloadStatement"
    :disabled="isGenerating"
    class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
  >
    <svg v-if="!isGenerating" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <svg v-else class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span>{{ isGenerating ? 'Preparing Statement...' : 'Print My Monthly Statement (PDF)' }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import { reportService } from '../../services/reportService.js'
import { generateOwnerMonthlyPdf } from '../../utils/pdfGenerator.js'

const props = defineProps({
  flatNumber: String,
  month: {
    type: String,
    default: 'October'
  },
  year: {
    type: [String, Number],
    default: 2026
  }
})

const isGenerating = ref(false)

async function downloadStatement() {
  isGenerating.value = true
  try {
    const data = await reportService.getOwnerMonthlyReportData({
      flatNumber: props.flatNumber,
      month: props.month,
      year: props.year
    })

    generateOwnerMonthlyPdf({
      owner: data.owner,
      flatNumber: props.flatNumber || data.flatNumber,
      month: props.month,
      year: props.year,
      bill: data.bill,
      payment: data.payment
    })

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Statement downloaded successfully',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Could Not Generate Statement',
      text: err.message || 'Error compiling statement PDF.',
      confirmButtonColor: '#4f46e5'
    })
  } finally {
    isGenerating.value = false
  }
}
</script>
