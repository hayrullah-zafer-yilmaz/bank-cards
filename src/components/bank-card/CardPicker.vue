<script setup lang="ts">
import { CARD_KIND_LABELS, CARD_STATUS_LABELS } from '@/constants/card'
import type { BankCardData } from '@/types/card'
import { formatMoney, getSpendableMinor } from '@/utils/card'
import CardThumb from './CardThumb.vue'
import { CARD_STATUS_TEXT_CLASSES } from './cardStyles'

defineProps<{ cards: BankCardData[] }>()

const selectedId = defineModel<string>({ required: true })
</script>

<template>
  <ul class="grid grid-cols-1 auto-rows-fr gap-1" aria-label="Kart seçimi">
    <li v-for="card in cards" :key="card.id">
      <button
        type="button"
        class="flex h-full w-full cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2 text-left transition-colors duration-150 hover:bg-white/5 focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.0625rem] focus-visible:outline-accent aria-pressed:bg-accent/12 aria-pressed:shadow-[inset_0_0_0_0.0625rem_rgb(96_165_250/0.55)] motion-reduce:transition-none"
        :aria-pressed="card.id === selectedId"
        @click="selectedId = card.id"
      >
        <CardThumb :card="card" />
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold">{{ card.productName }}</span>
          <span class="block truncate text-xs text-muted">
            <span class="hidden sm:inline">{{ CARD_KIND_LABELS[card.kind] }} · </span>••••
            {{ card.last4 }}
          </span>
        </span>
        <span class="flex-none text-right">
          <span class="block text-sm font-semibold tabular-nums">
            {{ formatMoney(getSpendableMinor(card), card.currency) }}
          </span>
          <span class="block text-xs" :class="CARD_STATUS_TEXT_CLASSES[card.status]">
            {{ CARD_STATUS_LABELS[card.status] }}
          </span>
        </span>
      </button>
    </li>
  </ul>
</template>
