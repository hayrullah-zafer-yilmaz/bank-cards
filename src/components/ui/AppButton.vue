<script setup lang="ts">
import type { IconName } from '@/constants/icons'
import AppIcon from './AppIcon.vue'

const {
  icon,
  variant = 'action',
  decorative = false,
} = defineProps<{
  icon: IconName
  variant?: 'primary' | 'action'
  decorative?: boolean
}>()

const VARIANT_CLASSES = {
  primary: 'h-9 gap-2 bg-accent px-3.5 text-label font-semibold text-page',
  action:
    'min-h-9 flex-col gap-1 px-1 py-1.5 text-xs font-medium text-ink shadow-hairline @[24rem]:flex-row @[24rem]:gap-2 @[24rem]:text-label',
}
</script>

<template>
  <button
    type="button"
    class="inline-flex min-w-0 items-center justify-center rounded-md whitespace-nowrap transition-colors duration-150 focus-visible:outline-offset-[0.125rem]"
    :class="[
      VARIANT_CLASSES[variant],
      decorative
        ? 'cursor-default'
        : 'cursor-pointer hover:bg-white/6 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent',
    ]"
    :aria-disabled="decorative || undefined"
    :tabindex="decorative ? -1 : undefined"
  >
    <AppIcon class="size-4 flex-none" :name="icon" />
    <slot />
  </button>
</template>
