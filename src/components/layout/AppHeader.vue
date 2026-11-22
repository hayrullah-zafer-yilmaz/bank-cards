<script setup lang="ts">
import { computed } from 'vue'
import { getInitials } from '@/utils/card'

const { bankName, customerName } = defineProps<{
  bankName: string
  customerName: string
}>()

const initials = computed(() => getInitials(customerName))
</script>

<template>
  <header class="border-b-[0.0625rem] border-line bg-page/70 backdrop-blur-[0.75rem]">
    <div
      class="mx-auto flex h-14 w-full max-w-360 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <div class="flex min-w-0 items-center gap-2.5">
        <span
          class="grid size-8 flex-none place-items-center rounded-sm bg-accent/15 text-accent"
          aria-hidden="true"
        >
          <svg
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <rect x="3" y="5.5" width="18" height="13" rx="2" />
            <path d="M3 10h18M7 15h3" />
          </svg>
        </span>
        <span class="truncate font-semibold tracking-tight">{{ bankName }}</span>
      </div>

      <div class="flex flex-none items-center gap-2.5">
        <span class="hidden text-sm text-muted sm:block">{{ customerName }}</span>
        <span
          class="grid size-8 place-items-center rounded-[100rem] bg-line text-xs font-semibold"
          role="img"
          :aria-label="customerName"
        >
          {{ initials }}
        </span>
      </div>
    </div>
  </header>
</template>
