<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="app-panel flex min-w-0 flex-col p-4" :aria-label="title">
    <div v-if="title" class="mb-3 flex min-h-7 flex-wrap items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-muted">{{ title }}</h2>
      <slot name="actions" />
    </div>
    <slot />
  </section>
</template>
