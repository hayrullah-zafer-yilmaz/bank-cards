<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { BankCardFace } from '@/types/card'
import { formatExpiry, maskCardNumber } from '@/utils/card'
import CardNetworkMark from './CardNetworkMark.vue'
import { CARD_FACE_CLASSES, CARD_LABEL_CLASSES, CARD_NUMBER_CLASSES } from './cardStyles'

defineProps<{ card: BankCardFace }>()

const { t } = useI18n()
</script>

<template>
  <span :class="CARD_FACE_CLASSES">
    <span class="flex items-center justify-between gap-[3cqw]">
      <span class="text-[length:max(0.6875rem,3.5cqw)] leading-[1.2] font-semibold">
        {{ t.card.details }}
      </span>
      <span
        class="truncate text-[length:4.6cqw] leading-[1.1] font-semibold tracking-[-0.01em] text-(--card-accent)"
      >
        {{ card.bankName }}
      </span>
    </span>

    <span class="mt-auto flex flex-col gap-[0.6cqw]">
      <span :class="CARD_LABEL_CLASSES">{{ t.card.number }}</span>
      <span :class="CARD_NUMBER_CLASSES">{{ maskCardNumber(card.last4) }}</span>
    </span>

    <span class="mt-[3cqw] flex items-end gap-[5cqw]">
      <span class="flex flex-col gap-[0.6cqw]">
        <span :class="CARD_LABEL_CLASSES">{{ t.card.expiry }}</span>
        <span
          class="flex h-[6.8cqw] items-center text-[length:max(0.6875rem,3.6cqw)] font-semibold tabular-nums"
        >
          {{ formatExpiry(card.expiry) }}
        </span>
      </span>
      <span class="flex flex-col gap-[0.6cqw]">
        <span :class="CARD_LABEL_CLASSES">{{ t.card.cvv }}</span>
        <span
          class="flex h-[6.8cqw] min-h-5 items-center justify-center rounded-[0.8cqw] bg-white px-[2.2cqw] text-[length:max(0.75rem,3.8cqw)] font-bold tracking-[0.1em] text-page tabular-nums"
        >
          {{ card.cvv }}
        </span>
      </span>
      <CardNetworkMark class="ml-auto" :network="card.network" />
    </span>
  </span>
</template>
