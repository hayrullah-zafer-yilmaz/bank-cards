<script setup lang="ts">
import { computed } from 'vue'
import { Shatter } from 'shatter-morph/vue'
import { BALANCE_SHATTER } from '@/constants/shatter'
import { useI18n } from '@/i18n'
import type { BankCardData, CurrencyCode } from '@/types/card'
import { formatConverted, getSpendableMinor } from '@/utils/card'
import { CARD_STATUS_TEXT_CLASSES } from './cardStyles'

const { card, currency } = defineProps<{
  card: BankCardData
  currency: CurrencyCode
}>()

const { locale, t } = useI18n()

function inCurrency(amountMinor: number) {
  return formatConverted(amountMinor, card.currency, currency, locale.value)
}

const amountText = computed(() => inCurrency(getSpendableMinor(card)))

const creditUsage = computed(() => {
  if (card.kind !== 'credit') return null
  const usedMinor = card.limitMinor - card.availableMinor
  return {
    percent: card.limitMinor > 0 ? Math.round((usedMinor / card.limitMinor) * 100) : 0,
    used: inCurrency(usedMinor),
    limit: inCurrency(card.limitMinor),
  }
})
</script>

<template>
  <Shatter :value="currency" :options="BALANCE_SHATTER">
    <div class="@container flex flex-col" aria-live="polite">
      <p
        class="text-[length:clamp(1.5rem,11.5cqw,2.625rem)] leading-tight font-bold tracking-tight whitespace-nowrap tabular-nums"
      >
        {{ amountText }}
      </p>

      <div class="mt-3 min-h-14">
        <template v-if="creditUsage">
          <div
            class="h-1.5 overflow-hidden rounded-pill bg-white/10 [contain:size_layout]"
            role="progressbar"
            :aria-label="t.balance.used"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="creditUsage.percent"
          >
            <div
              class="h-full rounded-pill bg-accent transition-[width] duration-300"
              :style="{ width: `${creditUsage.percent}%` }"
            />
          </div>
          <dl class="mt-2 flex justify-between gap-3 text-xs tabular-nums">
            <div>
              <dt class="text-muted">{{ t.balance.used }}</dt>
              <dd class="mt-0.5 font-medium whitespace-nowrap">{{ creditUsage.used }}</dd>
            </div>
            <div class="text-right">
              <dt class="text-muted">{{ t.balance.limit }}</dt>
              <dd class="mt-0.5 font-medium whitespace-nowrap">{{ creditUsage.limit }}</dd>
            </div>
          </dl>
        </template>
        <p v-else class="text-label text-muted">
          {{ card.productName }} ·
          <span class="font-medium" :class="CARD_STATUS_TEXT_CLASSES[card.status]">
            {{ t.card.statuses[card.status] }}
          </span>
        </p>
      </div>

      <p class="mt-1 text-xs text-muted" :class="{ invisible: currency === card.currency }">
        {{ t.balance.converted }}
      </p>
    </div>
  </Shatter>
</template>
