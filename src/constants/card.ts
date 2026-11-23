import type { CardNetwork, CurrencyCode, TransactionType } from '@/types/card'
import type { IconName } from './icons'

export const DISPLAY_CURRENCIES: CurrencyCode[] = ['TRY', 'USD', 'EUR', 'BTC']

export const SAMPLE_TRY_RATES: Record<CurrencyCode, number> = {
  TRY: 1,
  USD: 42,
  EUR: 49,
  BTC: 3_900_000,
}

export const CARD_NETWORK_LABELS: Record<CardNetwork, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  troy: 'Troy',
}

export const TRANSACTION_ICONS: Record<TransactionType, IconName> = {
  cafe: 'coffee',
  restaurant: 'utensils',
  groceries: 'cart',
  onlineShopping: 'cart',
  fuel: 'fuel',
  transit: 'bus',
  flight: 'plane',
  pharmacy: 'pill',
  bill: 'receipt',
  subscription: 'repeat',
  music: 'music',
  gameStore: 'gamepad',
  cardPayment: 'card',
  refund: 'refund',
  transfer: 'transfer',
  topUp: 'topUp',
}
