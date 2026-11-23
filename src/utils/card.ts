import { CARD_NETWORK_LABELS, SAMPLE_TRY_RATES } from '@/constants/card'
import type { Locale, Messages } from '@/i18n'
import type { BankCardData, BankCardFace, CardExpiry, CurrencyCode } from '@/types/card'

interface MoneyFormat {
  signDisplay?: 'auto' | 'exceptZero'
  fractionDigits?: number
}

const AXIS_INTERVALS = 3

const DATE_FORMATS = {
  day: { day: 'numeric', month: 'long' },
  short: { weekday: 'short' },
  long: { weekday: 'long' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>

const numberFormats = new Map<string, Intl.NumberFormat>()
const dateFormats = new Map<string, Intl.DateTimeFormat>()

function getCached<T>(cache: Map<string, T>, key: string, create: () => T): T {
  const cached = cache.get(key)
  if (cached) return cached
  const created = create()
  cache.set(key, created)
  return created
}

function getDateFormat(locale: Locale, format: keyof typeof DATE_FORMATS) {
  return getCached(
    dateFormats,
    `${locale}:${format}`,
    () => new Intl.DateTimeFormat(locale, { ...DATE_FORMATS[format], timeZone: 'UTC' }),
  )
}

export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`
}

export function formatExpiry({ month, year }: CardExpiry): string {
  const mm = String(month).padStart(2, '0')
  const yy = String(year % 100).padStart(2, '0')
  return `${mm}/${yy}`
}

export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode,
  locale: Locale,
  { signDisplay = 'auto', fractionDigits = currency === 'BTC' ? 6 : 2 }: MoneyFormat = {},
): string {
  const key = `${locale}:${currency}:${signDisplay}:${fractionDigits}`
  const formatter = getCached(numberFormats, key, () => {
    const currencyStyle: Intl.NumberFormatOptions =
      currency === 'TRY' ? {} : { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }
    return new Intl.NumberFormat(locale, {
      ...currencyStyle,
      signDisplay,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  })
  const amount = formatter.format(amountMinor / 100)
  return (currency === 'TRY' ? `${amount} TL` : amount).replace('-', '−')
}

export function formatConverted(
  amountMinor: number,
  from: CurrencyCode,
  to: CurrencyCode,
  locale: Locale,
  format?: MoneyFormat,
): string {
  return formatMoney(convertMinor(amountMinor, from, to), to, locale, format)
}

export function formatDay(isoDate: string, locale: Locale): string {
  return getDateFormat(locale, 'day').format(new Date(isoDate))
}

export function formatWeekday(
  mondayOffset: number,
  locale: Locale,
  weekday: 'short' | 'long',
): string {
  return getDateFormat(locale, weekday).format(Date.UTC(2024, 0, 1 + mondayOffset))
}

export function convertMinor(amountMinor: number, from: CurrencyCode, to: CurrencyCode): number {
  return (amountMinor * SAMPLE_TRY_RATES[from]) / SAMPLE_TRY_RATES[to]
}

export function getSpendableMinor(card: BankCardData): number {
  return card.kind === 'credit' ? card.availableMinor : card.balanceMinor
}

export function getWeeklyTotalMinor(card: BankCardData): number {
  return card.weeklySpendMinor.reduce((total, amount) => total + amount, 0)
}

export function getAxisScale(maxMinor: number) {
  if (maxMinor <= 0) return { top: 1, ticks: [] as number[], fractionDigits: 0 }
  const maxMajor = maxMinor / 100
  const roughStep = maxMajor / AXIS_INTERVALS
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const multiplier = [1, 2, 5, 10].find((option) => option * magnitude >= roughStep) ?? 10
  const step = multiplier * magnitude
  const intervals = Math.ceil(maxMajor / step - 1e-9)
  return {
    top: intervals * step * 100,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => index * step * 100),
    fractionDigits: Math.max(0, -Math.floor(Math.log10(step))),
  }
}

export function getCardAccessibleLabel(card: BankCardFace, t: Messages): string {
  return [
    `${card.bankName} ${card.productName} ${t.card.kinds[card.kind]}`,
    CARD_NETWORK_LABELS[card.network],
    t.card.lastFour(card.last4),
    t.card.expires(formatExpiry(card.expiry)),
    t.card.statuses[card.status],
  ].join(', ')
}

export function getCardBackLabel(card: BankCardFace, t: Messages): string {
  return t.card.backLabel(`${card.bankName} ${card.productName}`, card.cvv)
}

export function getInitials(name: string): string {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1) ?? ''
  return `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase('tr')
}
