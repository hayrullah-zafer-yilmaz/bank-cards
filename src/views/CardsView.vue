<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import {
  CardPicker,
  CardStage,
  CardSummary,
  CardTransactions,
  CardWeeklySpend,
  CurrencySelector,
} from '@/components/bank-card'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import LocaleSwitcher from '@/components/layout/LocaleSwitcher.vue'
import PromoCarousel from '@/components/promo/PromoCarousel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import { bankName, customerCards, holderName } from '@/data/cards'
import { promos } from '@/data/promos'
import { useI18n } from '@/i18n'
import type { CurrencyCode } from '@/types/card'
import { formatConverted, getWeeklyTotalMinor } from '@/utils/card'

const { locale, t } = useI18n()
const selectedCardId = ref(customerCards[0]?.id ?? '')
const displayCurrency = ref<CurrencyCode>('TRY')

const selectedCard = computed(() => customerCards.find((card) => card.id === selectedCardId.value))

const weeklyTotal = computed(() => {
  const card = selectedCard.value
  if (!card) return ''
  const totalMinor = getWeeklyTotalMinor(card)
  return formatConverted(totalMinor, card.currency, displayCurrency.value, locale.value)
})

watchEffect(() => {
  document.title = t.value.page.title
})
</script>

<template>
  <div class="flex min-h-svh flex-col lg:flex-row">
    <AppSidebar :bank-name="bankName" :customer-name="holderName" />

    <main class="@container flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:py-5">
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl leading-tight font-semibold tracking-tight">{{ t.page.title }}</h1>
          <p class="mt-0.5 text-sm text-muted">{{ t.page.subtitle }}</p>
        </div>
        <div class="flex flex-none items-center gap-2.5">
          <LocaleSwitcher />
          <AppButton icon="plus" variant="primary" decorative>{{ t.actions.newCard }}</AppButton>
        </div>
      </header>

      <div
        v-if="selectedCard"
        class="grid flex-1 grid-cols-1 content-start gap-4 md:grid-cols-2 xl:max-h-[max(36rem,45cqw)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.05fr)] xl:content-stretch min-[90rem]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]"
      >
        <AppPanel class="md:col-span-2 xl:col-span-1 xl:[--card-max-height:calc(100svh-24rem)]">
          <CardStage :card="selectedCard">
            <CardPicker v-model="selectedCardId" :cards="customerCards" />
          </CardStage>
        </AppPanel>

        <div class="flex min-w-0 flex-col gap-4">
          <AppPanel :title="t.balance.amount[selectedCard.kind]">
            <template #actions>
              <CurrencySelector v-model="displayCurrency" />
            </template>
            <CardSummary :card="selectedCard" :currency="displayCurrency" />
          </AppPanel>
          <AppPanel class="flex-1" :title="t.spending.title">
            <template #actions>
              <span class="text-sm font-semibold whitespace-nowrap tabular-nums">
                {{ weeklyTotal }}
              </span>
            </template>
            <CardWeeklySpend :card="selectedCard" :currency="displayCurrency" />
          </AppPanel>
        </div>

        <AppPanel :title="t.panels.transactions">
          <template #actions>
            <span class="inline-flex items-center gap-1 text-xs font-medium text-accent">
              {{ t.actions.viewAll }}
              <AppIcon class="size-3.5" name="arrowRight" />
            </span>
          </template>
          <CardTransactions :card="selectedCard" :currency="displayCurrency" />
        </AppPanel>
      </div>
      <p v-else class="app-panel p-8 text-center text-muted">{{ t.page.empty }}</p>

      <PromoCarousel class="mt-4" :promos="promos" />
    </main>
  </div>
</template>
