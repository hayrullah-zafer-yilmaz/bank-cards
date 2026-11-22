import { onBeforeUnmount } from 'vue'

const MAX_ROTATION_DEG = 9

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCardTilt(isEnabled: () => boolean) {
  let frame = 0
  let element: HTMLElement | null = null
  let clientX = 0
  let clientY = 0

  function paint() {
    frame = 0
    if (!element) return

    const { left, top, width, height } = element.getBoundingClientRect()
    const x = Math.min(Math.max((clientX - left) / width, 0), 1)
    const y = Math.min(Math.max((clientY - top) / height, 0), 1)

    element.style.setProperty('--tilt-x', `${((0.5 - y) * 2 * MAX_ROTATION_DEG).toFixed(2)}deg`)
    element.style.setProperty('--tilt-y', `${((x - 0.5) * 2 * MAX_ROTATION_DEG).toFixed(2)}deg`)
    element.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`)
    element.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`)
    element.dataset.tilting = ''
  }

  function onPointerMove(event: PointerEvent) {
    if (!isEnabled() || event.pointerType === 'touch' || prefersReducedMotion()) return

    element = event.currentTarget as HTMLElement
    clientX = event.clientX
    clientY = event.clientY
    if (!frame) frame = requestAnimationFrame(paint)
  }

  function onPointerLeave(event: PointerEvent) {
    cancelAnimationFrame(frame)
    frame = 0
    element = null
    delete (event.currentTarget as HTMLElement).dataset.tilting
  }

  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return { onPointerMove, onPointerLeave }
}
