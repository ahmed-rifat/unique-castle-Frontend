<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-colors"
    :class="badgeConfig.bgClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="badgeConfig.dotClass"></span>
    {{ badgeConfig.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusBadgeConfig } from '../../utils/paymentStatus.js'

const props = defineProps({
  status: {
    type: String,
    default: 'Not Paid'
  }
})

const badgeConfig = computed(() => getStatusBadgeConfig(props.status))
</script>
