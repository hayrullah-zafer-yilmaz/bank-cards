<script setup lang="ts">
import { computed } from 'vue'
import { CARD_THEME_CLASSES } from '@/components/bank-card/cardStyles'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useI18n } from '@/i18n'
import type { Promo } from '@/types/promo'

const { promo } = defineProps<{ promo: Promo }>()

const { t } = useI18n()
const content = computed(() => t.value.promos[promo.id])
</script>

<template>
  <div
    class="card-surface @container size-full overflow-hidden rounded-lg text-card-ink"
    :class="CARD_THEME_CLASSES[promo.theme]"
  >
    <div
      class="grid h-full min-h-[8.5rem] items-center gap-x-8 px-12 pt-3.5 pb-9 @[32rem]:grid-cols-[minmax(0,1fr)_auto] @[48rem]:px-16"
    >
      <div class="min-w-0">
        <h2 class="text-lg leading-tight font-semibold tracking-tight @[48rem]:text-xl">
          {{ content.title }}
        </h2>
        <p class="mt-1 max-w-[38rem] text-label leading-snug text-card-ink/78">
          {{ content.text }}
        </p>
        <span
          class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-(--card-accent)"
        >
          {{ t.carousel.details }}
          <AppIcon class="size-3.5" name="arrowRight" />
        </span>
      </div>
      <div class="hidden text-right @[32rem]:block">
        <p
          class="text-[length:clamp(2rem,6cqw,3.25rem)] leading-none font-bold tracking-tight whitespace-nowrap text-(--card-accent)"
        >
          {{ content.metric }}
        </p>
        <p class="mt-1 text-xs whitespace-nowrap text-card-ink/78">{{ content.caption }}</p>
      </div>
    </div>
  </div>
</template>
