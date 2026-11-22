<script setup lang="ts">
import { computed } from 'vue'
import {
  CARD_AMOUNT_LABELS,
  CARD_KIND_LABELS,
  CARD_NETWORK_LABELS,
  CARD_STATUS_LABELS,
} from '@/constants/card'
import type { BankCardData } from '@/types/card'
import { formatExpiry, formatMoney, getSpendableMinor } from '@/utils/card'
import { CARD_STATUS_TEXT_CLASSES } from './cardStyles'

const { card } = defineProps<{ card: BankCardData }>()

const amountText = computed(() => formatMoney(getSpendableMinor(card), card.currency))

const creditUsage = computed(() => {
  if (card.kind !== 'credit') return null
  const usedMinor = card.limitMinor - card.availableMinor
  return {
    percent: card.limitMinor > 0 ? Math.round((usedMinor / card.limitMinor) * 100) : 0,
    used: formatMoney(usedMinor, card.currency),
    limit: formatMoney(card.limitMinor, card.currency),
  }
})
</script>

<template>
  <section
    class="@container flex min-w-0 flex-col rounded-lg border-[0.0625rem] border-line bg-surface p-4 sm:p-5"
    aria-label="Kart özeti"
    aria-live="polite"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="truncate text-lg leading-snug font-semibold">{{ card.productName }}</h2>
        <p class="mt-0.5 text-sm text-muted">
          {{ CARD_KIND_LABELS[card.kind] }} · {{ CARD_NETWORK_LABELS[card.network] }} · ••••
          {{ card.last4 }}
        </p>
      </div>
      <span
        class="flex-none rounded-xs border-[0.0625rem] border-current px-2 py-0.5 text-xs font-semibold"
        :class="CARD_STATUS_TEXT_CLASSES[card.status]"
      >
        {{ CARD_STATUS_LABELS[card.status] }}
      </span>
    </div>

    <div class="flex flex-1 flex-col justify-center py-3">
      <p class="text-[0.8125rem] text-muted">{{ CARD_AMOUNT_LABELS[card.kind] }}</p>
      <p
        class="mt-0.5 text-[length:clamp(1.375rem,11cqw,2rem)] leading-tight font-semibold tracking-tight tabular-nums"
      >
        {{ amountText }}
      </p>

      <div class="mt-3 min-h-10">
        <template v-if="creditUsage">
          <div
            class="h-1.5 overflow-hidden rounded-[100rem] bg-line"
            role="progressbar"
            aria-label="Kullanılan limit"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="creditUsage.percent"
          >
            <div
              class="h-full rounded-[100rem] bg-accent transition-[width] duration-300 motion-reduce:transition-none"
              :style="{ width: `${creditUsage.percent}%` }"
            />
          </div>
          <div
            class="mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-muted tabular-nums"
          >
            <span>Kullanılan {{ creditUsage.used }}</span>
            <span>Limit {{ creditUsage.limit }}</span>
          </div>
        </template>
        <p v-else class="text-xs text-muted">Para birimi {{ card.currency }}</p>
      </div>
    </div>

    <dl class="grid grid-cols-2 gap-3 border-t-[0.0625rem] border-line pt-3">
      <div>
        <dt class="text-xs text-muted">Son kullanma</dt>
        <dd class="mt-0.5 text-sm font-semibold tabular-nums">{{ formatExpiry(card.expiry) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Temassız ödeme</dt>
        <dd class="mt-0.5 text-sm font-semibold">{{ card.contactless ? 'Açık' : 'Kapalı' }}</dd>
      </div>
    </dl>
  </section>
</template>
