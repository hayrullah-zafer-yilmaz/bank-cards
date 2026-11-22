export type CardNetwork = 'visa' | 'mastercard' | 'troy'
export type CardKind = 'credit' | 'debit' | 'prepaid'
export type CardStatus = 'active' | 'frozen' | 'expired'
export type CardTheme = 'midnight' | 'ocean' | 'graphite' | 'steel'
export type CurrencyCode = 'TRY' | 'USD' | 'EUR'

export interface CardExpiry {
  month: number
  year: number
}

interface BankCardBase {
  id: string
  bankName: string
  productName: string
  holderName: string
  last4: string
  expiry: CardExpiry
  network: CardNetwork
  status: CardStatus
  theme: CardTheme
  contactless: boolean
  currency: CurrencyCode
}

export interface CreditCardData extends BankCardBase {
  kind: 'credit'
  limitMinor: number
  availableMinor: number
}

export interface DebitCardData extends BankCardBase {
  kind: 'debit'
  balanceMinor: number
}

export interface PrepaidCardData extends BankCardBase {
  kind: 'prepaid'
  balanceMinor: number
}

export type BankCardData = CreditCardData | DebitCardData | PrepaidCardData

export type BankCardFace = Pick<
  BankCardData,
  | 'id'
  | 'bankName'
  | 'productName'
  | 'holderName'
  | 'last4'
  | 'expiry'
  | 'kind'
  | 'network'
  | 'status'
  | 'theme'
  | 'contactless'
>

export type CardSize = 'sm' | 'md' | 'lg' | 'fluid'
export type CardPose = 'flat' | 'angled' | 'hero'
