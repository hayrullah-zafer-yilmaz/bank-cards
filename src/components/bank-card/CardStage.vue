<script setup lang="ts">
import { onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'
import { Shatter } from 'shatter-morph/vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useCardFlip } from '@/composables/useCardFlip'
import { useMorphTracker } from '@/composables/useMorphTracker'
import { CARD_AREA_PER_SHARD, CARD_MAX_SHARDS, CARD_SHATTER } from '@/constants/shatter'
import { useI18n } from '@/i18n'
import type { BankCardFace } from '@/types/card'
import BankCard from './BankCard.vue'

const { card } = defineProps<{ card: BankCardFace }>()
const emit = defineEmits<{ morphing: [isMorphing: boolean] }>()

const getCardId = () => card.id

const { t } = useI18n()
const { isMorphing, handleComplete } = useMorphTracker(getCardId)
const flipHost = useTemplateRef<HTMLElement>('flipHost')
const { isBackVisible, isFlipping, toggleSide } = useCardFlip(getCardId, flipHost)
const shatterOptions = shallowRef(CARD_SHATTER)

watch(getCardId, () => {
  if (!flipHost.value) return
  const { offsetWidth, offsetHeight } = flipHost.value
  const shards = Math.round((offsetWidth * offsetHeight) / CARD_AREA_PER_SHARD)
  shatterOptions.value = { ...CARD_SHATTER, shards: Math.min(shards, CARD_MAX_SHARDS) }
})

watch(isMorphing, (morphing) => emit('morphing', morphing))
onBeforeUnmount(() => emit('morphing', false))

function flipCard() {
  if (!isMorphing.value) void toggleSide()
}
</script>

<template>
  <section
    class="@container flex min-h-0 flex-1 flex-col gap-3"
    :aria-label="t.controls.selectedCard"
  >
    <div class="flex min-h-0 flex-1 items-center justify-center py-1">
      <div
        ref="flipHost"
        class="w-full max-w-[26rem] cursor-pointer xl:w-[min(100%,calc(var(--card-max-height,100svh)*var(--aspect-card)))] xl:max-w-[44rem]"
        :data-flipping="isFlipping ? '' : undefined"
        @click="flipCard"
      >
        <Shatter :value="card.id" :options="shatterOptions" @complete="handleComplete">
          <BankCard
            :card="card"
            size="fluid"
            :side="isBackVisible ? 'back' : 'front'"
            :tilt="!isMorphing"
          />
        </Shatter>
      </div>
    </div>

    <slot />

    <div class="grid grid-cols-3 gap-2">
      <AppButton icon="eye" :disabled="isMorphing" @click="flipCard">
        {{ isBackVisible ? t.controls.showFront : t.controls.showDetails }}
      </AppButton>
      <AppButton icon="snowflake" decorative>
        {{ card.status === 'frozen' ? t.actions.unfreeze : t.actions.freeze }}
      </AppButton>
      <AppButton icon="sliders" decorative>{{ t.actions.limitSettings }}</AppButton>
    </div>
  </section>
</template>
