<script setup lang="ts">
import { ICON_PATHS, type IconName } from '@/constants/icons'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="path in ICON_PATHS[name]" :key="path" :d="path" />
  </svg>
</template>
