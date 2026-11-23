import type { NavItemId } from '@/constants/navigation'
import type { CardKind, CardStatus, TransactionType } from '@/types/card'
import type { PromoId } from '@/types/promo'

export type Locale = 'tr' | 'en'

export interface Messages {
  page: {
    title: string
    subtitle: string
    empty: string
  }
  nav: {
    label: string
    account: string
    collapse: string
    expand: string
    items: Record<NavItemId, string>
  }
  panels: {
    transactions: string
  }
  actions: {
    newCard: string
    viewAll: string
    freeze: string
    unfreeze: string
    limitSettings: string
  }
  spending: {
    title: string
    empty: string
  }
  controls: {
    language: string
    currency: string
    cardList: string
    selectedCard: string
    showDetails: string
    showFront: string
  }
  card: {
    virtual: string
    holder: string
    expiry: string
    details: string
    number: string
    cvv: string
    kinds: Record<CardKind, string>
    statuses: Record<CardStatus, string>
    lastFour: (digits: string) => string
    expires: (date: string) => string
    backLabel: (name: string, cvv: string) => string
  }
  balance: {
    amount: Record<CardKind, string>
    converted: string
    used: string
    limit: string
  }
  transactions: Record<TransactionType, { title: string; category: string }>
  carousel: {
    label: string
    roleDescription: string
    slideRoleDescription: string
    previous: string
    next: string
    pause: string
    play: string
    details: string
    goTo: (position: number, title: string) => string
    position: (position: number, total: number) => string
  }
  promos: Record<PromoId, { title: string; text: string; metric: string; caption: string }>
}
