export type CardNetwork = 'visa' | 'mastercard' | 'troy'
export type CardKind = 'credit' | 'debit' | 'prepaid'
export type CardStatus = 'active' | 'frozen' | 'expired'
export type CardTheme = 'obsidian' | 'platinum' | 'emerald' | 'burgundy'
export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'BTC'
export type CardSize = 'sm' | 'md' | 'lg' | 'fluid'
export type CardPose = 'flat' | 'angled' | 'hero'
export type CardSide = 'front' | 'back'
export type TransactionType =
  | 'cafe'
  | 'restaurant'
  | 'groceries'
  | 'onlineShopping'
  | 'fuel'
  | 'transit'
  | 'flight'
  | 'pharmacy'
  | 'bill'
  | 'subscription'
  | 'music'
  | 'gameStore'
  | 'cardPayment'
  | 'refund'
  | 'transfer'
  | 'topUp'

type WeeklySpend = readonly [number, number, number, number, number, number, number]

export interface CardExpiry {
  month: number
  year: number
}

interface CardTransaction {
  id: string
  type: TransactionType
  date: string
  amountMinor: number
}

export interface BankCardFace {
  id: string
  bankName: string
  productName: string
  holderName: string
  last4: string
  cvv: string
  expiry: CardExpiry
  kind: CardKind
  network: CardNetwork
  status: CardStatus
  theme: CardTheme
  contactless: boolean
}

interface BankAccountCard extends BankCardFace {
  currency: CurrencyCode
  transactions: CardTransaction[]
  weeklySpendMinor: WeeklySpend
}

interface CreditCardData extends BankAccountCard {
  kind: 'credit'
  limitMinor: number
  availableMinor: number
}

interface BalanceCardData extends BankAccountCard {
  kind: 'debit' | 'prepaid'
  balanceMinor: number
}

export type BankCardData = CreditCardData | BalanceCardData
