<script setup lang="ts">
import { CARD_NETWORK_LABELS } from '@/constants/card'
import type { CardNetwork } from '@/types/card'
import { CARD_NETWORK_CLASSES } from './cardStyles'

defineProps<{ network: CardNetwork }>()
</script>

<template>
  <span
    class="block min-w-[12.5cqw] flex-none text-right leading-none font-extrabold whitespace-nowrap"
    :class="CARD_NETWORK_CLASSES[network]"
    aria-hidden="true"
  >
    <svg
      v-if="network === 'mastercard'"
      class="ml-auto block h-auto w-[12.5cqw]"
      viewBox="0 0 38 24"
    >
      <circle cx="13" cy="12" r="12" fill="currentColor" fill-opacity="0.92" />
      <circle cx="25" cy="12" r="12" fill="currentColor" fill-opacity="0.52" />
    </svg>
    <template v-else>{{ CARD_NETWORK_LABELS[network].toUpperCase() }}</template>
  </span>
</template>
