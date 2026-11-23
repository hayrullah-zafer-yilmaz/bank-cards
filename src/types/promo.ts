import type { CardTheme } from './card'

export type PromoId = 'cashback' | 'installments' | 'abroad' | 'virtualCard'

export interface Promo {
  id: PromoId
  theme: CardTheme
}
