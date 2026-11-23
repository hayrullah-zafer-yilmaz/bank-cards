<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const TICK_INTERVAL = 80

const { duration, running } = defineProps<{
  duration: number
  running: boolean
}>()

const emit = defineEmits<{ complete: [] }>()

const progress = ref(0)
let timer = 0
let lastTick = 0

function stop() {
  window.clearInterval(timer)
}

function tick() {
  const now = performance.now()
  progress.value = Math.min(progress.value + (now - lastTick) / duration, 1)
  lastTick = now
  if (progress.value < 1) return
  stop()
  emit('complete')
}

watch(
  () => running,
  (isRunning) => {
    stop()
    if (!isRunning) return
    lastTick = performance.now()
    timer = window.setInterval(tick, TICK_INTERVAL)
  },
  { immediate: true },
)

onBeforeUnmount(stop)
</script>

<template>
  <svg
    class="size-full -rotate-90"
    viewBox="0 0 24 24"
    fill="none"
    stroke-width="2"
    aria-hidden="true"
  >
    <circle class="stroke-white/25" cx="12" cy="12" r="10.5" />
    <circle
      class="stroke-accent"
      cx="12"
      cy="12"
      r="10.5"
      pathLength="1"
      stroke-dasharray="1"
      :stroke-dashoffset="1 - progress"
    />
  </svg>
</template>
