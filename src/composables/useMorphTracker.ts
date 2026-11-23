import { computed, ref, watch, type WatchSource } from 'vue'

export function useMorphTracker(source: WatchSource) {
  const flights = ref(0)
  const isMorphing = computed(() => flights.value > 0)

  watch(source, () => {
    flights.value += 1
  })

  function handleComplete() {
    flights.value = Math.max(flights.value - 1, 0)
  }

  return { isMorphing, handleComplete }
}
