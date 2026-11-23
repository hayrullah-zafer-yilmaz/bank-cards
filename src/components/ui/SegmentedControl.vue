<script setup lang="ts" generic="T extends string">
defineProps<{
  options: readonly T[]
  label: string
  optionLabels?: Record<T, string>
}>()

const selected = defineModel<T>({ required: true })
</script>

<template>
  <div
    class="inline-flex flex-none gap-0.5 rounded-md bg-white/6 p-0.5"
    role="group"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option"
      type="button"
      class="h-7 cursor-pointer rounded-sm px-1.5 text-xs font-semibold text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-offset-[0.0625rem] aria-pressed:bg-accent aria-pressed:text-page"
      :aria-label="optionLabels?.[option]"
      :aria-pressed="option === selected"
      @click="selected = option"
    >
      {{ option.toUpperCase() }}
    </button>
  </div>
</template>
