<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useSidebar } from '@/composables/useSidebar'
import { ACTIVE_NAV_ITEM, NAV_ITEMS } from '@/constants/navigation'
import { useI18n } from '@/i18n'
import { getInitials } from '@/utils/card'

const { bankName, customerName } = defineProps<{
  bankName: string
  customerName: string
}>()

const AVATAR_CLASSES =
  'grid flex-none place-items-center rounded-pill bg-accent text-xs font-semibold text-page'

const { t } = useI18n()
const { isCollapsed, toggle } = useSidebar()

const initials = computed(() => getInitials(customerName))
const toggleLabel = computed(() => (isCollapsed.value ? t.value.nav.expand : t.value.nav.collapse))
const fadeClasses = computed(() => [
  'transition-opacity duration-150',
  isCollapsed.value && 'lg:opacity-0',
])
</script>

<template>
  <aside
    class="flex flex-none flex-col border-b-[0.0625rem] border-line bg-black/20 transition-[width] duration-200 ease-out lg:sticky lg:top-0 lg:h-svh lg:overflow-hidden lg:border-r-[0.0625rem] lg:border-b-0"
    :class="isCollapsed ? 'lg:w-[4.1875rem]' : 'lg:w-56'"
  >
    <div
      class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-[1.0625rem] lg:py-5"
    >
      <div class="flex min-w-0 items-center gap-2.5">
        <span
          class="grid size-8 flex-none place-items-center rounded-md bg-accent text-sm font-bold text-page"
          aria-hidden="true"
        >
          {{ bankName.charAt(0) }}
        </span>
        <span class="truncate font-semibold tracking-tight" :class="fadeClasses">
          {{ bankName }}
        </span>
      </div>
      <span class="size-8 lg:hidden" :class="AVATAR_CLASSES" role="img" :aria-label="customerName">
        {{ initials }}
      </span>
    </div>

    <nav class="px-2 pb-2 sm:px-5 lg:flex-1 lg:px-3 lg:pt-1 lg:pb-0" :aria-label="t.nav.label">
      <ul class="grid grid-cols-4 gap-1 lg:grid-cols-1 lg:gap-1.5">
        <li v-for="item in NAV_ITEMS" :key="item.id">
          <span
            class="flex cursor-default flex-col items-center gap-1 rounded-md px-1 py-1.5 text-2xs font-medium text-muted aria-[current=page]:bg-accent/12 aria-[current=page]:text-ink aria-[current=page]:shadow-hairline-accent sm:text-xs lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm"
            :aria-current="item.id === ACTIVE_NAV_ITEM ? 'page' : undefined"
            :title="isCollapsed ? t.nav.items[item.id] : undefined"
          >
            <AppIcon class="size-4 flex-none lg:size-[1.125rem]" :name="item.icon" />
            <span class="truncate" :class="fadeClasses">{{ t.nav.items[item.id] }}</span>
          </span>
        </li>
      </ul>
    </nav>

    <div class="hidden px-3 pb-2 lg:block">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-white/6 hover:text-ink focus-visible:-outline-offset-[0.125rem]"
        :aria-expanded="!isCollapsed"
        :aria-label="toggleLabel"
        :title="isCollapsed ? toggleLabel : undefined"
        @click="toggle"
      >
        <AppIcon
          class="size-[1.125rem] flex-none"
          :name="isCollapsed ? 'panelOpen' : 'panelClose'"
        />
        <span class="whitespace-nowrap" :class="fadeClasses">{{ toggleLabel }}</span>
      </button>
    </div>

    <div
      class="mx-3 mb-3 hidden items-center gap-2.5 border-t-[0.0625rem] border-line px-[0.1875rem] pt-3 lg:flex"
      :title="isCollapsed ? customerName : undefined"
    >
      <span class="size-9" :class="AVATAR_CLASSES" aria-hidden="true">{{ initials }}</span>
      <span class="w-[7.625rem] flex-none" :class="fadeClasses">
        <span class="block text-label leading-tight font-semibold">{{ customerName }}</span>
        <span class="mt-0.5 block text-xs text-muted">{{ t.nav.account }}</span>
      </span>
      <AppIcon class="size-4 flex-none text-muted" :class="fadeClasses" name="chevronDown" />
    </div>
  </aside>
</template>
