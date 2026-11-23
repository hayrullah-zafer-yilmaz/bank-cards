import { computed, onBeforeUnmount, ref, watch, type ShallowRef } from 'vue'

export function useElementVisibility(element: Readonly<ShallowRef<HTMLElement | null>>) {
  const isPageVisible = ref(!document.hidden)
  const isInViewport = ref(false)

  function syncPageVisibility() {
    isPageVisible.value = !document.hidden
  }

  const observer = new IntersectionObserver((entries) => {
    isInViewport.value = entries.at(-1)?.isIntersecting ?? false
  })

  watch(element, (current, previous) => {
    if (previous) observer.unobserve(previous)
    if (current) observer.observe(current)
  })

  document.addEventListener('visibilitychange', syncPageVisibility)

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', syncPageVisibility)
    observer.disconnect()
  })

  return computed(() => isPageVisible.value && isInViewport.value)
}
