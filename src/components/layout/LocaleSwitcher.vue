<script setup lang="ts">
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import { LOCALE_NAMES, LOCALES, useI18n } from '@/i18n'

const { locale, t } = useI18n()
</script>

<template>
  <SegmentedControl
    v-model="locale"
    :options="LOCALES"
    :option-labels="LOCALE_NAMES"
    :label="t.controls.language"
  />
</template>
