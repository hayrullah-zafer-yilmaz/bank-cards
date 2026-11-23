<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { Shatter, type ShatterOptions } from 'shatter-morph/vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProgressRing from '@/components/ui/ProgressRing.vue'
import { useCarousel } from '@/composables/useCarousel'
import { useElementVisibility } from '@/composables/useElementVisibility'
import { PROMO_SHATTER } from '@/constants/shatter'
import { useI18n } from '@/i18n'
import type { Promo } from '@/types/promo'
import PromoSlide from './PromoSlide.vue'

const { promos } = defineProps<{ promos: Promo[] }>()

const SLIDE_DURATION = 7000
const SWIPE_DISTANCE = 40
const ARROW_CLASSES =
  'absolute top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md bg-black/40 text-white transition-colors duration-150 hover:bg-black/65 focus-visible:outline-offset-[0.125rem]'

const { t } = useI18n()
const root = useTemplateRef<HTMLElement>('root')
const isVisible = useElementVisibility(root)
const {
  index,
  direction,
  isPlaying,
  isRunning,
  isMorphing,
  isHovered,
  isFocused,
  next,
  previous,
  goTo,
  togglePlaying,
  handleMorphComplete,
} = useCarousel(
  () => promos.length,
  () => isVisible.value,
)

const activePromo = computed(() => promos[index.value])
const shatterOptions = computed<ShatterOptions>(() => ({
  ...PROMO_SHATTER,
  origin: direction.value === 'next' ? 'right' : 'left',
}))
const controlsClass = computed(() =>
  isMorphing.value
    ? 'opacity-0 *:pointer-events-none'
    : 'transition-opacity duration-200 *:pointer-events-auto',
)

let swipeStart: number | null = null

function handlePointerDown(event: PointerEvent) {
  swipeStart = event.pointerType === 'mouse' ? null : event.clientX
}

function handlePointerUp(event: PointerEvent) {
  if (swipeStart === null) return
  const distance = event.clientX - swipeStart
  swipeStart = null
  if (Math.abs(distance) < SWIPE_DISTANCE) return
  if (distance < 0) next()
  else previous()
}

function handleFocusIn(event: FocusEvent) {
  isFocused.value = (event.target as HTMLElement).matches(':focus-visible')
}
</script>

<template>
  <section
    v-if="activePromo"
    ref="root"
    class="relative isolate flex-none touch-pan-y rounded-lg bg-white/4"
    :aria-roledescription="t.carousel.roleDescription"
    :aria-label="t.carousel.label"
    @pointerenter="isHovered = true"
    @pointerleave="isHovered = false"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @focusin="handleFocusIn"
    @focusout="isFocused = false"
    @keydown.left.prevent="previous"
    @keydown.right.prevent="next"
  >
    <div class="grid" :aria-live="isPlaying ? 'off' : 'polite'">
      <div
        v-for="promo in promos"
        :key="promo.id"
        class="invisible col-start-1 row-start-1"
        aria-hidden="true"
      >
        <PromoSlide :promo="promo" />
      </div>
      <Shatter
        class="col-start-1 row-start-1"
        :value="activePromo.id"
        :options="shatterOptions"
        role="group"
        :aria-roledescription="t.carousel.slideRoleDescription"
        :aria-label="t.carousel.position(index + 1, promos.length)"
        @complete="handleMorphComplete"
      >
        <PromoSlide :promo="activePromo" />
      </Shatter>
    </div>

    <div class="pointer-events-none absolute inset-0 z-10" :class="controlsClass">
      <button
        type="button"
        class="left-2"
        :class="ARROW_CLASSES"
        :aria-label="t.carousel.previous"
        @click="previous"
      >
        <AppIcon class="size-4" name="chevronLeft" />
      </button>
      <button
        type="button"
        class="right-2"
        :class="ARROW_CLASSES"
        :aria-label="t.carousel.next"
        @click="next"
      >
        <AppIcon class="size-4" name="chevronRight" />
      </button>

      <div
        class="absolute bottom-1.5 left-1/2 flex h-7 -translate-x-1/2 items-center rounded-md bg-black/40 px-1 text-white"
      >
        <button
          v-for="(promo, promoIndex) in promos"
          :key="promo.id"
          type="button"
          class="grid h-6 w-5 cursor-pointer place-items-center rounded-sm"
          :aria-label="t.carousel.goTo(promoIndex + 1, t.promos[promo.id].title)"
          :aria-current="promoIndex === index ? 'true' : undefined"
          @click="goTo(promoIndex)"
        >
          <span
            class="block h-1 rounded-pill transition-[width,background-color] duration-200"
            :class="promoIndex === index ? 'w-3.5 bg-white' : 'w-1 bg-white/50'"
          />
        </button>
        <button
          type="button"
          class="relative ml-0.5 grid size-6 cursor-pointer place-items-center rounded-pill focus-visible:outline-offset-[0.0625rem]"
          :aria-label="isPlaying ? t.carousel.pause : t.carousel.play"
          @click="togglePlaying"
        >
          <ProgressRing
            :key="index"
            class="absolute inset-0"
            :duration="SLIDE_DURATION"
            :running="isRunning"
            @complete="next"
          />
          <AppIcon class="size-2.5" :name="isPlaying ? 'pause' : 'play'" />
        </button>
      </div>
    </div>
  </section>
</template>
