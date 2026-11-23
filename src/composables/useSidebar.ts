import { ref, watch } from 'vue'
import { readStorage, writeStorage } from '@/utils/storage'

const STORAGE_KEY = 'bank-cards-sidebar-collapsed'

export function useSidebar() {
  const isCollapsed = ref(readStorage(STORAGE_KEY) === 'true')

  watch(isCollapsed, (collapsed) => writeStorage(STORAGE_KEY, String(collapsed)))

  function toggle() {
    isCollapsed.value = !isCollapsed.value
  }

  return { isCollapsed, toggle }
}
