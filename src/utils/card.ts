import { CARD_KIND_LABELS, CARD_NETWORK_LABELS, CARD_STATUS_LABELS } from '@/constants/card'
import type { BankCardData, BankCardFace, CardExpiry, CurrencyCode } from '@/types/card'

export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`
}

export function formatExpiry({ month, year }: CardExpiry): string {
  const mm = String(month).padStart(2, '0')
  const yy = String(year % 100).padStart(2, '0')
  return `${mm}/${yy}`
}

export function formatMoney(amountMinor: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amountMinor / 100)
}

export function getSpendableMinor(card: BankCardData): number {
  return card.kind === 'credit' ? card.availableMinor : card.balanceMinor
}

export function getCardAccessibleLabel(card: BankCardFace): string {
  return [
    `${card.bankName} ${card.productName} ${CARD_KIND_LABELS[card.kind]}`,
    CARD_NETWORK_LABELS[card.network],
    `son dört hane ${card.last4}`,
    `son kullanma ${formatExpiry(card.expiry)}`,
    CARD_STATUS_LABELS[card.status],
  ].join(', ')
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr'))
    .join('')
}
