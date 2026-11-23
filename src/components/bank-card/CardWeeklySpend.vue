<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { BankCardData, CurrencyCode } from '@/types/card'
import { convertMinor, formatMoney, formatWeekday, getAxisScale } from '@/utils/card'

const { card, currency } = defineProps<{
  card: BankCardData
  currency: CurrencyCode
}>()

const { locale, t } = useI18n()

const amounts = computed(() =>
  card.weeklySpendMinor.map((amount) => convertMinor(amount, card.currency, currency)),
)

const scale = computed(() => getAxisScale(Math.max(...amounts.value)))

const tickLabels = computed(() =>
  scale.value.ticks.map((tick) =>
    formatMoney(tick, currency, locale.value, { fractionDigits: scale.value.fractionDigits }),
  ),
)

const days = computed(() =>
  amounts.value.map((amount, index) => ({
    short: formatWeekday(index, locale.value, 'short'),
    long: formatWeekday(index, locale.value, 'long'),
    value: formatMoney(amount, currency, locale.value),
    height: `${(amount / scale.value.top) * 100}%`,
    tooltipClass: index < 2 ? 'left-0' : index > 4 ? 'right-0' : 'left-1/2 -translate-x-1/2',
  })),
)
</script>

<template>
  <p v-if="!tickLabels.length" class="grid min-h-32 flex-1 place-items-center text-sm text-muted">
    {{ t.spending.empty }}
  </p>
  <div
    v-else
    class="grid min-h-36 flex-1 grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-1.5 pt-1.5"
  >
    <div
      class="flex flex-col-reverse justify-between text-right text-2xs text-muted tabular-nums"
      aria-hidden="true"
    >
      <span
        v-for="label in tickLabels"
        :key="label"
        class="flex h-0 items-center justify-end whitespace-nowrap"
      >
        {{ label }}
      </span>
    </div>

    <div class="relative min-h-0">
      <div class="absolute inset-0 flex flex-col-reverse justify-between" aria-hidden="true">
        <span v-for="label in tickLabels" :key="label" class="h-[0.0625rem] bg-line" />
      </div>
      <ol
        class="relative grid h-full grid-cols-7 gap-1 [contain:size_layout]"
        :aria-label="t.spending.title"
      >
        <li
          v-for="day in days"
          :key="day.long"
          class="group relative flex h-full items-end justify-center rounded-sm focus-visible:outline-offset-[0.125rem]"
          tabindex="0"
          :aria-label="`${day.long}: ${day.value}`"
        >
          <span
            class="w-full max-w-6 rounded-t-sm bg-accent/80 transition-[height,background-color] duration-300 group-hover:bg-accent group-focus:bg-accent"
            :style="{ height: day.height }"
          />
          <span
            class="pointer-events-none absolute z-10 rounded-md bg-raised px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-[0_0.25rem_0.75rem_rgb(0_0_0/0.5)] transition-opacity duration-100 group-hover:opacity-100 group-focus:opacity-100"
            :class="day.tooltipClass"
            :style="{ bottom: `calc(${day.height} + 0.25rem)` }"
            aria-hidden="true"
          >
            <span class="font-semibold tabular-nums">{{ day.value }}</span>
            <span class="ml-1.5 text-muted">{{ day.short }}</span>
          </span>
        </li>
      </ol>
    </div>

    <div
      class="col-start-2 grid grid-cols-7 gap-1 text-2xs text-muted *:flex *:justify-center *:whitespace-nowrap"
      aria-hidden="true"
    >
      <span v-for="day in days" :key="day.long">{{ day.short }}</span>
    </div>
  </div>
</template>
