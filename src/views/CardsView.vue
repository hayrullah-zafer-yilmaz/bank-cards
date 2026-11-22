<script setup lang="ts">
import { computed, ref } from 'vue'
import { CardPicker, CardStage, CardSummary } from '@/components/bank-card'
import AppHeader from '@/components/layout/AppHeader.vue'
import { bankName, customerCards, holderName } from '@/data/cards'

const selectedCardId = ref(customerCards[0]?.id ?? '')

const selectedCard = computed(() => customerCards.find((card) => card.id === selectedCardId.value))
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader :bank-name="bankName" :customer-name="holderName" />

    <main class="mx-auto flex w-full max-w-360 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <header class="mb-4 flex items-end justify-between gap-4 lg:mb-5">
        <div class="min-w-0">
          <h1 class="text-2xl leading-tight font-semibold tracking-tight">Kartlarım</h1>
          <p class="mt-1 text-sm text-muted">
            Hesabınıza tanımlı kartları buradan görüntüleyebilirsiniz.
          </p>
        </div>
        <span class="hidden flex-none text-sm text-muted sm:block">
          {{ customerCards.length }} kart
        </span>
      </header>

      <div
        v-if="selectedCard"
        class="grid flex-1 grid-cols-1 content-start gap-4 md:grid-cols-2 lg:max-h-[56rem] lg:grid-cols-[minmax(0,1.45fr)_minmax(23rem,1fr)] lg:grid-rows-[minmax(min-content,1fr)_minmax(min-content,1fr)] lg:content-stretch lg:gap-5"
      >
        <CardStage
          class="md:col-span-2 lg:col-span-1 lg:row-span-2"
          :card="selectedCard"
          :title="selectedCard.bankName"
        />
        <CardSummary :card="selectedCard" />
        <section
          class="flex min-w-0 flex-col rounded-lg border-[0.0625rem] border-line bg-surface p-2"
          aria-labelledby="all-cards-title"
        >
          <h2 id="all-cards-title" class="px-2.5 pt-1.5 pb-2 text-sm font-semibold text-muted">
            Tüm kartlar
          </h2>
          <CardPicker v-model="selectedCardId" class="flex-1" :cards="customerCards" />
        </section>
      </div>
      <p
        v-else
        class="rounded-lg border-[0.0625rem] border-line bg-surface p-8 text-center text-muted"
      >
        Hesabınıza tanımlı kart bulunmuyor.
      </p>
    </main>
  </div>
</template>
