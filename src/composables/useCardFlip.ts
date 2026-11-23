import { nextTick, onBeforeUnmount, ref, watch, type ShallowRef } from 'vue'
import { prefersReducedMotion } from '@/utils/motion'

const TURN_IN_MS = 170
const TURN_OUT_MS = 320
const TURN_OUT_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

export function useCardFlip(
  getCardId: () => string,
  flipHost: Readonly<ShallowRef<HTMLElement | null>>,
) {
  const isBackVisible = ref(false)
  const isFlipping = ref(false)
  let animation: Animation | null = null

  function turn(host: HTMLElement, from: number, to: number, options: KeyframeAnimationOptions) {
    const previous = animation
    animation = host.animate({ '--flip': [`${from}deg`, `${to}deg`] }, options)
    previous?.cancel()
    return animation.finished
  }

  async function toggleSide() {
    const host = flipHost.value
    if (!host || isFlipping.value) return

    if (prefersReducedMotion()) {
      isBackVisible.value = !isBackVisible.value
      return
    }

    isFlipping.value = true
    try {
      await turn(host, 0, 90, { duration: TURN_IN_MS, easing: 'ease-in', fill: 'forwards' })
      isBackVisible.value = !isBackVisible.value
      await nextTick()
      await turn(host, -90, 0, { duration: TURN_OUT_MS, easing: TURN_OUT_EASING })
    } catch {
      return
    } finally {
      isFlipping.value = false
    }
  }

  watch(getCardId, () => {
    animation?.cancel()
    animation = null
    isBackVisible.value = false
  })

  onBeforeUnmount(() => animation?.cancel())

  return { isBackVisible, isFlipping, toggleSide }
}
