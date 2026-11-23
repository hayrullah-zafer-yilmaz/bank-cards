import { solidShards } from 'shatter-morph/solid'
import type { ShatterOptions } from 'shatter-morph/vue'

const SOLID_SHARDS: ShatterOptions = {
  renderer: solidShards,
  cracks: false,
  edgeColor: 'var(--color-accent)',
}

export const CARD_AREA_PER_SHARD = 620
export const CARD_MAX_SHARDS = 210

export const CARD_SHATTER: ShatterOptions = {
  ...SOLID_SHARDS,
  motion: 'vortex',
  duration: 2800,
  spread: 0.9,
}

export const BALANCE_SHATTER: ShatterOptions = {
  ...SOLID_SHARDS,
  motion: 'flip',
  origin: 'left',
  duration: 900,
  shards: 24,
}

export const PROMO_SHATTER: ShatterOptions = {
  ...SOLID_SHARDS,
  motion: 'flip',
  duration: 1800,
  shards: 48,
  edgeColor: '#7d6a49',
}
