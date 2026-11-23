<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { BankCardData } from '@/types/card'
import CardThumb from './CardThumb.vue'
import { CARD_STATUS_TEXT_CLASSES } from './cardStyles'

defineProps<{ cards: BankCardData[] }>()

const selectedId = defineModel<string>({ required: true })
const { t } = useI18n()
</script>

<template>
  <ul class="grid grid-cols-2 gap-2 @[32rem]:grid-cols-4" :aria-label="t.controls.cardList">
    <li v-for="card in cards" :key="card.id" class="@container">
      <button
        type="button"
        class="group flex size-full cursor-pointer items-center gap-2 rounded-md p-1.5 text-left shadow-hairline transition-colors duration-150 @[9rem]:gap-2.5 @[9rem]:p-2 hover:bg-white/5 focus-visible:outline-offset-[0.0625rem] aria-pressed:bg-white/8 aria-pressed:shadow-hairline-accent"
        :aria-pressed="card.id === selectedId"
        @click="selectedId = card.id"
      >
        <CardThumb class="w-8 @[9rem]:w-11" :card="card" />
        <span class="min-w-0 flex-1">
          <span
            class="block truncate text-label leading-snug font-semibold group-aria-pressed:text-accent"
          >
            {{ card.productName }}
          </span>
          <span class="flex items-center gap-1 text-xs leading-snug text-muted">
            <span class="truncate">•••• {{ card.last4 }}</span>
            <span
              class="size-1.5 flex-none rounded-pill bg-current"
              :class="CARD_STATUS_TEXT_CLASSES[card.status]"
              :title="t.card.statuses[card.status]"
            />
            <span class="sr-only">{{ t.card.statuses[card.status] }}</span>
          </span>
        </span>
      </button>
    </li>
  </ul>
</template>
