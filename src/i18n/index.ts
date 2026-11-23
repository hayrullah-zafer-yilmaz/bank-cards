import { computed, ref, watch, watchEffect } from 'vue'
import { readStorage, writeStorage } from '@/utils/storage'
import { en } from './en'
import { tr } from './tr'
import type { Locale, Messages } from './types'

export type { Locale, Messages }

const DEFAULT_LOCALE: Locale = 'tr'
const STORAGE_KEY = 'bank-cards-locale'
const MESSAGES: Record<Locale, Messages> = { tr, en }

export const LOCALES = Object.keys(MESSAGES) as Locale[]

export const LOCALE_NAMES: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
}

function readStoredLocale(): Locale {
  const stored = readStorage(STORAGE_KEY)
  return LOCALES.find((option) => option === stored) ?? DEFAULT_LOCALE
}

const locale = ref(readStoredLocale())
const t = computed(() => MESSAGES[locale.value])

watch(locale, (next) => writeStorage(STORAGE_KEY, next))

watchEffect(() => {
  document.documentElement.lang = locale.value
})

export function useI18n() {
  return { locale, t }
}
