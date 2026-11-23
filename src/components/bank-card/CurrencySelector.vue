<script setup lang="ts">
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import { DISPLAY_CURRENCIES } from '@/constants/card'
import { useI18n } from '@/i18n'
import type { CurrencyCode } from '@/types/card'

const selected = defineModel<CurrencyCode>({ required: true })
const { t } = useI18n()
</script>

<template>
  <SegmentedControl v-model="selected" :options="DISPLAY_CURRENCIES" :label="t.controls.currency" />
</template>
