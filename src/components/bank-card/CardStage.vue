<script setup lang="ts">
import { computed, defineAsyncComponent, ref, useTemplateRef, watch } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import type { BankCardFace } from '@/types/card'
import BankCard from './BankCard.vue'
import CardPodium from './CardPodium.vue'

const CardHologram = defineAsyncComponent(() => import('./CardHologram.vue'))

defineProps<{
  card: BankCardFace
  title?: string
}>()

const anchor = useTemplateRef<HTMLElement>('anchor')
const podium = useTemplateRef<InstanceType<typeof CardPodium>>('podium')
const prefersReducedMotion = usePrefersReducedMotion()
const isHologramReady = ref(false)
const isHologramUnavailable = ref(false)

const podiumElement = computed(() => (podium.value?.$el as SVGSVGElement | undefined) ?? null)
const showHologram = computed(() => !prefersReducedMotion.value && !isHologramUnavailable.value)

function handleUnavailable() {
  isHologramUnavailable.value = true
  isHologramReady.value = false
}

watch(showHologram, (isVisible) => {
  if (!isVisible) isHologramReady.value = false
})
</script>

<template>
  <section
    class="relative isolate h-[clamp(18rem,50svh,25rem)] overflow-hidden rounded-lg border-[0.0625rem] border-line bg-surface/60 bg-[radial-gradient(ellipse_70%_60%_at_50%_72%,rgb(37_99_235/0.24),transparent_72%)] [container-type:size] md:h-[27rem] lg:h-full lg:min-h-[32rem]"
    aria-label="Seçili kart"
  >
    <div
      class="absolute inset-0 [--stage-card:min(76cqw,74cqh,38rem)] [--stage-podium:min(94cqw,128cqh,50rem)]"
    >
      <p
        v-if="title"
        class="absolute inset-x-0 top-[3cqh] overflow-hidden bg-linear-to-b from-white from-18% via-[#bcd2f5] via-58% to-[#5b86d6] bg-clip-text text-center text-[length:min(13cqw,17cqh)] leading-[1.1] font-bold tracking-[-0.03em] whitespace-nowrap text-transparent"
        aria-hidden="true"
      >
        {{ title }}
      </p>
      <CardPodium
        ref="podium"
        class="absolute bottom-[3cqh] left-1/2 w-(--stage-podium) -translate-x-1/2"
      />
      <div
        ref="anchor"
        class="absolute bottom-[calc(3cqh+var(--stage-podium)*0.233+var(--stage-card)*0.08)] left-1/2 ml-[calc(var(--stage-card)/-2)] aspect-[85.6/53.98] w-(--stage-card)"
        :class="!isHologramReady && 'animate-card-float motion-reduce:animate-none'"
      >
        <Transition
          mode="out-in"
          enter-active-class="transition duration-280 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
          enter-from-class="-translate-y-4 scale-96 opacity-0"
          leave-active-class="transition duration-140 ease-in motion-reduce:transition-none"
          leave-to-class="translate-y-2 scale-98 opacity-0"
        >
          <BankCard v-if="!isHologramReady" :key="card.id" :card="card" size="fluid" pose="hero" />
        </Transition>
      </div>
      <CardHologram
        v-if="showHologram && anchor && podiumElement"
        class="absolute inset-0"
        :card="card"
        :anchor="anchor"
        :podium="podiumElement"
        @ready="isHologramReady = true"
        @unavailable="handleUnavailable"
      />
    </div>
  </section>
</template>
