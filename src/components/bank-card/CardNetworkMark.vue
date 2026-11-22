<script setup lang="ts">
import type { CardNetwork } from '@/types/card'
import { CARD_NETWORK_CLASSES } from './cardStyles'

defineProps<{ network: CardNetwork }>()
</script>

<template>
  <span
    class="block leading-none font-extrabold whitespace-nowrap"
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
    <template v-else-if="network === 'visa'">VISA</template>
    <template v-else>TROY</template>
  </span>
</template>
