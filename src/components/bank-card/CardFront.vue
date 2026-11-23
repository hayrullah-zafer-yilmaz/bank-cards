<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useI18n } from '@/i18n'
import type { BankCardFace } from '@/types/card'
import { formatExpiry, maskCardNumber } from '@/utils/card'
import CardChip from './CardChip.vue'
import CardNetworkMark from './CardNetworkMark.vue'
import {
  CARD_FACE_CLASSES,
  CARD_LABEL_CLASSES,
  CARD_NUMBER_CLASSES,
  CARD_STATUS_TEXT_CLASSES,
} from './cardStyles'

defineProps<{ card: BankCardFace }>()

const { t } = useI18n()
</script>

<template>
  <span class="justify-between" :class="CARD_FACE_CLASSES">
    <span class="flex items-start justify-between gap-[3cqw]">
      <span class="flex min-w-0 flex-col gap-[0.7cqw]">
        <span
          class="truncate text-[length:5.4cqw] leading-[1.1] font-semibold tracking-[-0.01em] text-(--card-accent)"
        >
          <slot name="logo" />
        </span>
        <span class="flex items-center gap-[1.8cqw]">
          <span
            class="text-[length:max(0.5625rem,2.4cqw)] leading-[1.3] font-semibold tracking-[0.14em] text-card-ink/72 uppercase"
            lang="en"
          >
            {{ card.productName }}
          </span>
          <span
            v-if="card.status !== 'active'"
            class="flex-none rounded-xs bg-page/85 px-[1.6cqw] py-[0.4cqw] text-[length:max(0.5625rem,2.4cqw)] leading-[1.3] font-semibold"
            :class="CARD_STATUS_TEXT_CLASSES[card.status]"
          >
            {{ t.card.statuses[card.status] }}
          </span>
        </span>
      </span>
      <span
        class="flex-none pt-[0.6cqw] text-[length:max(0.5rem,2.2cqw)] leading-[1.2] font-semibold tracking-[0.16em] text-card-ink/72 uppercase"
      >
        {{ t.card.virtual }}
      </span>
    </span>

    <span class="flex items-center gap-[2.4cqw]">
      <CardChip class="w-[10.5cqw]" />
      <AppIcon
        v-if="card.contactless"
        class="size-[5.4cqw] flex-none text-card-ink/80"
        name="contactless"
        stroke-width="2"
      />
    </span>

    <span :class="CARD_NUMBER_CLASSES">{{ maskCardNumber(card.last4) }}</span>

    <span class="flex items-end justify-between gap-[2.6cqw]">
      <span class="flex min-w-0 flex-1 flex-col gap-[0.4cqw]">
        <span :class="CARD_LABEL_CLASSES">{{ t.card.holder }}</span>
        <span
          class="line-clamp-2 text-[length:max(0.625rem,3.6cqw)] leading-[1.25] font-semibold"
          lang="tr"
        >
          {{ card.holderName }}
        </span>
      </span>
      <span class="flex flex-none flex-col gap-[0.4cqw]">
        <span :class="CARD_LABEL_CLASSES">{{ t.card.expiry }}</span>
        <span class="text-[length:max(0.5625rem,3.3cqw)] leading-[1.25] font-semibold tabular-nums">
          {{ formatExpiry(card.expiry) }}
        </span>
      </span>
      <CardNetworkMark :network="card.network" />
    </span>
  </span>
</template>
