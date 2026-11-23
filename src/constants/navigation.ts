import type { IconName } from './icons'

export type NavItemId = 'overview' | 'cards' | 'activity' | 'settings'

export const ACTIVE_NAV_ITEM: NavItemId = 'cards'

export const NAV_ITEMS: readonly { id: NavItemId; icon: IconName }[] = [
  { id: 'overview', icon: 'home' },
  { id: 'cards', icon: 'card' },
  { id: 'activity', icon: 'transfer' },
  { id: 'settings', icon: 'settings' },
]
