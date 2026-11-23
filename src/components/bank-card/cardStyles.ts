import type { CardNetwork, CardPose, CardSize, CardStatus, CardTheme } from '@/types/card'

export const CARD_FACE_CLASSES = 'relative flex h-full flex-col px-[6.4cqw] py-[5.6cqw]'

export const CARD_LABEL_CLASSES =
  'text-[length:max(0.5625rem,2.5cqw)] leading-[1.2] text-card-ink/72'

export const CARD_NUMBER_CLASSES =
  'text-[length:5.3cqw] leading-[1.2] font-medium tracking-[0.09em] whitespace-nowrap tabular-nums'

export const CARD_SIZE_CLASSES: Record<CardSize, string> = {
  sm: 'max-w-70',
  md: 'max-w-90',
  lg: 'max-w-110',
  fluid: 'max-w-none',
}

export const CARD_POSE_CLASSES: Record<CardPose, string> = {
  flat: '',
  angled:
    '[--pose-x:6deg] [--pose-y:-8deg] [--pose-z:-3deg] md:[--pose-x:10deg] md:[--pose-y:-14deg] md:[--pose-z:-5deg]',
  hero: '[--pose-x:5deg] [--pose-y:-6deg] [--pose-z:-2deg] md:[--pose-x:7deg] md:[--pose-y:-9deg] md:[--pose-z:-3deg]',
}

export const CARD_THEME_CLASSES: Record<CardTheme, string> = {
  obsidian: 'card-obsidian',
  platinum: 'card-platinum',
  emerald: 'card-emerald',
  burgundy: 'card-burgundy',
}

export const CARD_SURFACE_STATUS_CLASSES: Record<CardStatus, string> = {
  active: '',
  frozen: 'saturate-[0.7] brightness-95',
  expired: 'saturate-[0.4] brightness-90',
}

export const CARD_STATUS_TEXT_CLASSES: Record<CardStatus, string> = {
  active: 'text-success',
  frozen: 'text-warning',
  expired: 'text-danger',
}

export const CARD_NETWORK_CLASSES: Record<CardNetwork, string> = {
  visa: 'text-[length:6.4cqw] italic tracking-[-0.02em]',
  mastercard: '',
  troy: 'text-[length:5.2cqw] tracking-[0.08em]',
}
