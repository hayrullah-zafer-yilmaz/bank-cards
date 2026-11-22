<script setup lang="ts">
import type { BankCardFace } from '@/types/card'
import { CARD_SURFACE_STATUS_CLASSES, CARD_THEME_CLASSES } from './cardStyles'

defineProps<{ card: BankCardFace }>()
</script>

<template>
  <span
    class="card-sheen relative block aspect-[85.6/53.98] w-14 flex-none xl:w-16 overflow-hidden rounded-xs shadow-[inset_0_0_0_0.0625rem_rgb(255_255_255/0.16)]"
    :class="[CARD_THEME_CLASSES[card.theme], CARD_SURFACE_STATUS_CLASSES[card.status]]"
    aria-hidden="true"
  >
    <span class="absolute top-2 left-1.5 block h-2 w-2.5 rounded-[0.125rem] bg-slate-200/90" />
    <span class="absolute right-1.5 bottom-1.5 block h-0.5 w-4 rounded-[100rem] bg-white/70" />
  </span>
</template>
