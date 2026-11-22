import { onBeforeUnmount, ref } from 'vue'

export function usePrefersReducedMotion() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  const prefersReducedMotion = ref(query.matches)

  function handleChange(event: MediaQueryListEvent) {
    prefersReducedMotion.value = event.matches
  }

  query.addEventListener('change', handleChange)
  onBeforeUnmount(() => query.removeEventListener('change', handleChange))

  return prefersReducedMotion
}
