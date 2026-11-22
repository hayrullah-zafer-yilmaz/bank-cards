import type { CardNetwork, CardPose, CardSize, CardStatus, CardTheme } from '@/types/card'

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
  hero: '[--pose-x:12deg] [--pose-y:-9deg] [--pose-z:-10deg] md:[--pose-x:16deg] md:[--pose-y:-12deg] md:[--pose-z:-14deg]',
}

export const CARD_THEME_CLASSES: Record<CardTheme, string> = {
  midnight: 'card-midnight',
  ocean: 'card-ocean',
  graphite: 'card-graphite',
  steel: 'card-steel',
}

export const CARD_SURFACE_STATUS_CLASSES: Record<CardStatus, string> = {
  active: '',
  frozen: 'saturate-45 brightness-80',
  expired: 'grayscale brightness-[0.62]',
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
