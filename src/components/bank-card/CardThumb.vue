<script setup lang="ts">
import type { BankCardFace } from '@/types/card'
import { CARD_SURFACE_STATUS_CLASSES, CARD_THEME_CLASSES } from './cardStyles'

defineProps<{ card: BankCardFace }>()
</script>

<template>
  <span
    class="card-surface relative block aspect-card flex-none rounded-sm"
    :class="[CARD_THEME_CLASSES[card.theme], CARD_SURFACE_STATUS_CLASSES[card.status]]"
    aria-hidden="true"
  >
    <span class="absolute top-[30%] left-[12%] block h-[26%] w-[22%] rounded-[15%] bg-(--chip-a)" />
  </span>
</template>
