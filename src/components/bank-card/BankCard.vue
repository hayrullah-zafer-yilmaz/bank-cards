<script setup lang="ts">
import { computed } from 'vue'
import { useCardTilt } from '@/composables/useCardTilt'
import { useI18n } from '@/i18n'
import type { BankCardFace, CardPose, CardSide, CardSize } from '@/types/card'
import { getCardAccessibleLabel, getCardBackLabel } from '@/utils/card'
import CardBack from './CardBack.vue'
import CardFront from './CardFront.vue'
import {
  CARD_POSE_CLASSES,
  CARD_SIZE_CLASSES,
  CARD_SURFACE_STATUS_CLASSES,
  CARD_THEME_CLASSES,
} from './cardStyles'

interface Props {
  card: BankCardFace
  size?: CardSize
  pose?: CardPose
  side?: CardSide
  tilt?: boolean
  selectable?: boolean
  selected?: boolean
  logoSrc?: string
}

const {
  card,
  size = 'md',
  pose = 'flat',
  side = 'front',
  tilt = true,
  selectable = false,
  selected = false,
  logoSrc,
} = defineProps<Props>()

const emit = defineEmits<{ select: [id: string] }>()

const { t } = useI18n()
const { onPointerMove, onPointerLeave } = useCardTilt(() => tilt)

const shadowClass = computed(() => {
  if (size === 'sm') return selected ? 'shadow-card-sm-selected' : 'shadow-card-sm'
  return selected ? 'shadow-card-selected' : 'shadow-card'
})

const accessibleLabel = computed(() =>
  side === 'back' ? getCardBackLabel(card, t.value) : getCardAccessibleLabel(card, t.value),
)

function handleClick() {
  if (selectable) emit('select', card.id)
}
</script>

<template>
  <component
    :is="selectable ? 'button' : 'article'"
    class="group @container block w-full text-left"
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
      class="card-tilt relative block aspect-card rounded-[3.7cqw] text-card-ink group-focus-visible:outline-[0.125rem] group-focus-visible:outline-offset-[0.1875rem] group-focus-visible:outline-accent"
      :class="[shadowClass, CARD_THEME_CLASSES[card.theme]]"
    >
      <span
        class="card-surface absolute inset-0 rounded-[inherit]"
        :class="[CARD_SURFACE_STATUS_CLASSES[card.status], side === 'back' && 'card-surface-muted']"
      />
      <span
        class="card-glare pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-250 group-data-tilting:opacity-100"
      />

      <CardBack v-if="side === 'back'" :card="card" />
      <CardFront v-else :card="card">
        <template #logo>
          <slot name="logo">
            <img v-if="logoSrc" class="block h-[6.4cqw] w-auto" :src="logoSrc" alt="" />
            <template v-else>{{ card.bankName }}</template>
          </slot>
        </template>
      </CardFront>
    </span>
  </component>
</template>
