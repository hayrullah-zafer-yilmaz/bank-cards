<script setup lang="ts">
import { computed } from 'vue'
import { useCardTilt } from '@/composables/useCardTilt'
import { CARD_STATUS_LABELS } from '@/constants/card'
import type { BankCardFace, CardPose, CardSize } from '@/types/card'
import { formatExpiry, getCardAccessibleLabel, maskCardNumber } from '@/utils/card'
import CardChip from './CardChip.vue'
import CardContactlessIcon from './CardContactlessIcon.vue'
import CardNetworkMark from './CardNetworkMark.vue'
import {
  CARD_POSE_CLASSES,
  CARD_SIZE_CLASSES,
  CARD_STATUS_TEXT_CLASSES,
  CARD_SURFACE_STATUS_CLASSES,
  CARD_THEME_CLASSES,
} from './cardStyles'

interface Props {
  card: BankCardFace
  size?: CardSize
  pose?: CardPose
  tilt?: boolean
  selectable?: boolean
  selected?: boolean
  logoSrc?: string
}

const {
  card,
  size = 'md',
  pose = 'flat',
  tilt = true,
  selectable = false,
  selected = false,
  logoSrc,
} = defineProps<Props>()

const emit = defineEmits<{ select: [id: string] }>()

const { onPointerMove, onPointerLeave } = useCardTilt(() => tilt)

const expiryText = computed(() => formatExpiry(card.expiry))

const shadowClass = computed(() => {
  if (size === 'sm') return selected ? 'shadow-card-sm-selected' : 'shadow-card-sm'
  return selected ? 'shadow-card-selected' : 'shadow-card'
})

const accessibleLabel = computed(() => getCardAccessibleLabel(card))

function handleClick() {
  if (selectable) emit('select', card.id)
}
</script>

<template>
  <component
    :is="selectable ? 'button' : 'article'"
    class="group @container block w-full text-left text-card-ink"
    :class="[
      CARD_SIZE_CLASSES[size],
      CARD_POSE_CLASSES[pose],
      selectable && 'cursor-pointer focus-visible:outline-none',
    ]"
    :type="selectable ? 'button' : undefined"
    :role="selectable ? undefined : 'img'"
    :aria-label="accessibleLabel"
    :aria-pressed="selectable ? selected : undefined"
    @click="handleClick"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <span
      class="card-tilt relative block aspect-[85.6/53.98] rounded-lg group-focus-visible:outline-[0.125rem] group-focus-visible:outline-offset-[0.1875rem] group-focus-visible:outline-white"
      :class="shadowClass"
    >
      <span
        class="card-sheen absolute inset-0 overflow-hidden rounded-[inherit] shadow-[inset_0_0_0_0.0625rem_rgb(255_255_255/0.13)]"
        :class="[CARD_THEME_CLASSES[card.theme], CARD_SURFACE_STATUS_CLASSES[card.status]]"
      />
      <span
        class="card-glare pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-250 group-data-tilting:opacity-100 motion-reduce:transition-none"
      />

      <span
        class="relative flex h-full flex-col justify-between px-[6.4cqw] py-[5.6cqw] [text-shadow:0_0.0625rem_0.125rem_rgb(0_0_0/0.55)]"
      >
        <span class="flex items-center justify-between gap-[3.6cqw]">
          <span class="min-w-0 truncate text-[length:4.8cqw] font-bold tracking-[-0.01em]">
            <slot name="logo">
              <img v-if="logoSrc" class="block h-[6.4cqw] w-auto" :src="logoSrc" alt="" />
              <template v-else>{{ card.bankName }}</template>
            </slot>
          </span>
          <span class="flex-none text-[length:max(0.5625rem,3.5cqw)] font-medium text-card-ink/78">
            {{ card.productName }}
          </span>
        </span>

        <span class="flex items-center justify-between gap-[3.6cqw]">
          <span class="flex items-center gap-[2.6cqw]">
            <CardChip class="w-[11.5cqw]" />
            <CardContactlessIcon v-if="card.contactless" class="size-[6.2cqw] text-card-ink/86" />
          </span>
          <span
            v-if="card.status !== 'active'"
            class="flex-none rounded-xs border-[0.0625rem] border-current bg-page/82 px-[2.2cqw] py-[0.7cqw] text-[length:max(0.625rem,3cqw)] leading-[1.3] font-semibold [text-shadow:none]"
            :class="CARD_STATUS_TEXT_CLASSES[card.status]"
          >
            {{ CARD_STATUS_LABELS[card.status] }}
          </span>
        </span>

        <span
          class="font-mono text-[length:5.5cqw] font-medium tracking-[0.04em] whitespace-nowrap tabular-nums"
        >
          {{ maskCardNumber(card.last4) }}
        </span>

        <span class="flex items-end justify-between gap-[3.6cqw]">
          <span class="flex min-w-0 flex-1 flex-col gap-[0.4cqw]">
            <span class="text-[length:max(0.5625rem,2.6cqw)] leading-[1.2] text-card-ink/72">
              Kart sahibi
            </span>
            <span
              class="truncate text-[length:max(0.5625rem,3.6cqw)] leading-[1.25] font-semibold tracking-[0.04em] uppercase"
            >
              {{ card.holderName }}
            </span>
          </span>
          <span class="flex flex-none flex-col gap-[0.4cqw]">
            <span class="text-[length:max(0.5625rem,2.6cqw)] leading-[1.2] text-card-ink/72">
              SKT
            </span>
            <span
              class="font-mono text-[length:max(0.5625rem,3.6cqw)] leading-[1.25] font-semibold tabular-nums"
            >
              {{ expiryText }}
            </span>
          </span>
          <CardNetworkMark class="min-w-[12.5cqw] flex-none text-right" :network="card.network" />
        </span>
      </span>
    </span>
  </component>
</template>
