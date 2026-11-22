import type { CardKind, CardNetwork, CardStatus } from '@/types/card'

export const CARD_NETWORK_LABELS: Record<CardNetwork, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  troy: 'Troy',
}

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  credit: 'Kredi Kartı',
  debit: 'Banka Kartı',
  prepaid: 'Ön Ödemeli Kart',
}

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  active: 'Aktif',
  frozen: 'Donduruldu',
  expired: 'Süresi doldu',
}

export const CARD_AMOUNT_LABELS: Record<CardKind, string> = {
  credit: 'Kullanılabilir limit',
  debit: 'Bakiye',
  prepaid: 'Bakiye',
}
