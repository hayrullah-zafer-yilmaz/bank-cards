import { computed, ref } from 'vue'
import { prefersReducedMotion } from '@/utils/motion'
import { useMorphTracker } from './useMorphTracker'

type CarouselDirection = 'next' | 'previous'

export function useCarousel(getCount: () => number, canAdvance: () => boolean) {
  const index = ref(0)
  const direction = ref<CarouselDirection>('next')
  const isPlaying = ref(!prefersReducedMotion())
  const isHovered = ref(false)
  const isFocused = ref(false)
  const { isMorphing, handleComplete: handleMorphComplete } = useMorphTracker(index)

  const isRunning = computed(
    () =>
      isPlaying.value && !isHovered.value && !isFocused.value && !isMorphing.value && canAdvance(),
  )

  function moveTo(target: number, nextDirection: CarouselDirection) {
    if (isMorphing.value || target === index.value) return
    direction.value = nextDirection
    index.value = target
  }

  function next() {
    moveTo((index.value + 1) % getCount(), 'next')
  }

  function previous() {
    const count = getCount()
    moveTo((index.value - 1 + count) % count, 'previous')
  }

  function goTo(target: number) {
    moveTo(target, target > index.value ? 'next' : 'previous')
  }

  function togglePlaying() {
    isPlaying.value = !isPlaying.value
  }

  return {
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
  }
}
