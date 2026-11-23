<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { REPOSITORY_URL } from '@/constants/navigation'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <a
    class="inline-flex h-8 flex-none items-center justify-center gap-1.5 rounded-md bg-white/6 px-2 text-xs font-semibold text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-offset-[0.125rem]"
    :href="REPOSITORY_URL"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="t.nav.openRepository"
    :title="t.nav.openRepository"
  >
    <AppIcon class="size-4 flex-none" name="github" />
    <span class="hidden sm:inline">{{ t.nav.repository }}</span>
  </a>
</template>
