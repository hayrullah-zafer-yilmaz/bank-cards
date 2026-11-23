<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { TRANSACTION_ICONS } from '@/constants/card'
import { useI18n } from '@/i18n'
import type { BankCardData, CurrencyCode } from '@/types/card'
import { formatConverted, formatDay } from '@/utils/card'

const { card, currency } = defineProps<{
  card: BankCardData
  currency: CurrencyCode
}>()

const { locale, t } = useI18n()

function amountText(amountMinor: number) {
  return formatConverted(amountMinor, card.currency, currency, locale.value, {
    signDisplay: 'exceptZero',
  })
}
</script>

<template>
  <ul class="flex flex-1 flex-col divide-y-[0.0625rem] divide-line">
    <li
      v-for="transaction in card.transactions"
      :key="transaction.id"
      class="grid max-h-[4.25rem] flex-1 grid-cols-[minmax(0,1fr)_auto] content-center items-center gap-x-2.5 py-1.5 min-[22.5rem]:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <span
        class="row-span-2 hidden size-7 place-items-center rounded-md bg-white/6 min-[22.5rem]:grid"
        :class="transaction.amountMinor > 0 ? 'text-success' : 'text-muted'"
        aria-hidden="true"
      >
        <AppIcon class="size-4" :name="TRANSACTION_ICONS[transaction.type]" />
      </span>
      <span class="truncate text-label leading-tight font-medium">
        {{ t.transactions[transaction.type].title }}
      </span>
      <span
        class="text-label leading-tight font-semibold tabular-nums"
        :class="transaction.amountMinor > 0 ? 'text-success' : 'text-ink'"
      >
        {{ amountText(transaction.amountMinor) }}
      </span>
      <span class="col-span-2 mt-0.5 truncate text-xs leading-tight text-muted">
        {{ t.transactions[transaction.type].category }} ·
        {{ formatDay(transaction.date, locale) }}
      </span>
    </li>
  </ul>
</template>
