import { CARD_STATUS_LABELS } from '@/constants/card'
import type { BankCardFace, CardNetwork, CardStatus, CardTheme } from '@/types/card'
import { formatExpiry, maskCardNumber } from '@/utils/card'

export const CARD_FACE_WIDTH = 1280
export const CARD_FACE_HEIGHT = Math.round((CARD_FACE_WIDTH * 53.98) / 85.6)
export const CARD_FACE_ASPECT = CARD_FACE_WIDTH / CARD_FACE_HEIGHT
export const CARD_FACE_RADIUS = 0.052

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const INK = '#f1f8ff'
const MUTED_INK = 'rgba(226, 240, 255, 0.76)'
const UNIT = CARD_FACE_WIDTH / 100
const GRADIENT_STOPS = [0, 0.36, 0.5, 0.64, 1]
const CHIP_PATH =
  'M0 10h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H0M40 10H28a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h12M15 0v8M25 0v8M15 22v8M25 22v8M15 8h10M15 22h10'
const CONTACTLESS_PATH = 'M6.5 8.5a6 6 0 0 1 0 7M10.5 6a11 11 0 0 1 0 12M14.5 3.5a16 16 0 0 1 0 17'

interface FaceTheme {
  stops: string[]
  glow: string
  highlight: string
}

const FACE_THEMES: Record<CardTheme, FaceTheme> = {
  midnight: {
    stops: ['#05070c', '#0c1524', '#123a68', '#0a1422', '#04060a'],
    glow: 'rgba(59, 130, 246, 0.42)',
    highlight: 'rgba(147, 197, 253, 0.5)',
  },
  ocean: {
    stops: ['#06182f', '#0b3263', '#1658a8', '#0b2f5c', '#051428'],
    glow: 'rgba(56, 189, 248, 0.4)',
    highlight: 'rgba(186, 230, 253, 0.48)',
  },
  graphite: {
    stops: ['#0b0d11', '#1c2028', '#363c47', '#1a1d24', '#090a0d'],
    glow: 'rgba(148, 163, 184, 0.28)',
    highlight: 'rgba(226, 232, 240, 0.34)',
  },
  steel: {
    stops: ['#18222f', '#2c3b4e', '#4a5f79', '#2a3849', '#141c27'],
    glow: 'rgba(165, 180, 200, 0.28)',
    highlight: 'rgba(226, 232, 240, 0.32)',
  },
}

const STATUS_COLORS: Record<CardStatus, string> = {
  active: '#4ade80',
  frozen: '#fbbf24',
  expired: '#f87171',
}

function createAngledGradient(context: CanvasRenderingContext2D, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  const directionX = Math.sin(radians)
  const directionY = -Math.cos(radians)
  const length = Math.abs(CARD_FACE_WIDTH * directionX) + Math.abs(CARD_FACE_HEIGHT * directionY)
  const centerX = CARD_FACE_WIDTH / 2
  const centerY = CARD_FACE_HEIGHT / 2
  return context.createLinearGradient(
    centerX - (directionX * length) / 2,
    centerY - (directionY * length) / 2,
    centerX + (directionX * length) / 2,
    centerY + (directionY * length) / 2,
  )
}

function paintSurface(context: CanvasRenderingContext2D, card: BankCardFace) {
  const theme = FACE_THEMES[card.theme]

  const base = createAngledGradient(context, 112)
  theme.stops.forEach((color, index) => base.addColorStop(GRADIENT_STOPS[index] ?? 1, color))
  context.fillStyle = base
  context.fillRect(0, 0, CARD_FACE_WIDTH, CARD_FACE_HEIGHT)

  const sheen = createAngledGradient(context, 112)
  sheen.addColorStop(0.3, 'rgba(0, 0, 0, 0)')
  sheen.addColorStop(0.45, theme.glow)
  sheen.addColorStop(0.5, theme.highlight)
  sheen.addColorStop(0.55, theme.glow)
  sheen.addColorStop(0.7, 'rgba(0, 0, 0, 0)')
  context.fillStyle = sheen
  context.fillRect(0, 0, CARD_FACE_WIDTH, CARD_FACE_HEIGHT)

  if (card.status === 'active') return

  context.globalCompositeOperation = 'saturation'
  context.fillStyle = `hsla(0, 0%, 50%, ${card.status === 'frozen' ? 0.55 : 1})`
  context.fillRect(0, 0, CARD_FACE_WIDTH, CARD_FACE_HEIGHT)
  context.globalCompositeOperation = 'source-over'
  context.fillStyle = `rgba(0, 0, 0, ${card.status === 'frozen' ? 0.2 : 0.36})`
  context.fillRect(0, 0, CARD_FACE_WIDTH, CARD_FACE_HEIGHT)
}

function paintChip(context: CanvasRenderingContext2D, x: number, y: number, width: number) {
  const height = width * 0.75
  const gradient = context.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, '#f8fafc')
  gradient.addColorStop(0.42, '#cbd5e1')
  gradient.addColorStop(0.62, '#f1f5f9')
  gradient.addColorStop(1, '#94a3b8')
  context.fillStyle = gradient
  context.beginPath()
  context.roundRect(x, y, width, height, width * 0.14)
  context.fill()

  context.save()
  context.translate(x, y)
  context.scale(width / 40, height / 30)
  context.strokeStyle = 'rgba(30, 41, 59, 0.55)'
  context.lineWidth = 0.9
  context.stroke(new Path2D(CHIP_PATH))
  context.restore()
}

function paintContactless(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save()
  context.translate(x, y)
  context.scale(size / 24, size / 24)
  context.strokeStyle = INK
  context.lineWidth = 2
  context.lineCap = 'round'
  context.stroke(new Path2D(CONTACTLESS_PATH))
  context.restore()
}

function paintStatus(context: CanvasRenderingContext2D, status: CardStatus, y: number) {
  const label = CARD_STATUS_LABELS[status]
  const right = CARD_FACE_WIDTH - 6.4 * UNIT
  context.font = `600 ${3.1 * UNIT}px ${SANS}`
  const width = context.measureText(label).width + 4.4 * UNIT
  const height = 6 * UNIT
  context.fillStyle = 'rgba(7, 13, 24, 0.86)'
  context.strokeStyle = STATUS_COLORS[status]
  context.lineWidth = 0.28 * UNIT
  context.beginPath()
  context.roundRect(right - width, y - height / 2, width, height, UNIT)
  context.fill()
  context.stroke()
  context.fillStyle = STATUS_COLORS[status]
  context.textAlign = 'center'
  context.fillText(label, right - width / 2, y)
}

function paintNetwork(context: CanvasRenderingContext2D, network: CardNetwork, y: number) {
  const right = CARD_FACE_WIDTH - 6.4 * UNIT
  context.fillStyle = INK
  context.textAlign = 'right'

  if (network === 'mastercard') {
    const radius = 3.95 * UNIT
    context.globalAlpha = 0.92
    context.beginPath()
    context.arc(right - radius * 2.58, y, radius, 0, Math.PI * 2)
    context.fill()
    context.globalAlpha = 0.52
    context.beginPath()
    context.arc(right - radius, y, radius, 0, Math.PI * 2)
    context.fill()
    context.globalAlpha = 1
    return
  }

  context.font =
    network === 'visa' ? `italic 800 ${6.4 * UNIT}px ${SANS}` : `800 ${5.2 * UNIT}px ${SANS}`
  context.fillText(network === 'visa' ? 'VISA' : 'TROY', right, y)
}

function paintContent(context: CanvasRenderingContext2D, card: BankCardFace) {
  const left = 6.4 * UNIT
  const right = CARD_FACE_WIDTH - left
  context.textBaseline = 'middle'

  context.fillStyle = INK
  context.textAlign = 'left'
  context.font = `700 ${4.8 * UNIT}px ${SANS}`
  context.fillText(card.bankName, left, 9 * UNIT, 58 * UNIT)

  context.fillStyle = MUTED_INK
  context.textAlign = 'right'
  context.font = `500 ${3.5 * UNIT}px ${SANS}`
  context.fillText(card.productName, right, 9 * UNIT)

  const chipWidth = 11.5 * UNIT
  const chipY = 18.4 * UNIT
  paintChip(context, left, chipY, chipWidth)
  if (card.contactless) {
    paintContactless(context, left + chipWidth + 2.6 * UNIT, chipY + 1.2 * UNIT, 6.2 * UNIT)
  }
  if (card.status !== 'active') paintStatus(context, card.status, chipY + 4.3 * UNIT)

  context.fillStyle = INK
  context.textAlign = 'left'
  context.font = `500 ${5.5 * UNIT}px ${MONO}`
  context.fillText(maskCardNumber(card.last4), left, 37.4 * UNIT)

  context.fillStyle = MUTED_INK
  context.font = `400 ${2.6 * UNIT}px ${SANS}`
  context.fillText('Kart sahibi', left, 49.6 * UNIT)
  context.fillText('SKT', 61 * UNIT, 49.6 * UNIT)

  context.fillStyle = INK
  context.font = `600 ${3.6 * UNIT}px ${SANS}`
  context.fillText(card.holderName.toLocaleUpperCase('tr'), left, 54 * UNIT, 50 * UNIT)
  context.font = `600 ${3.6 * UNIT}px ${MONO}`
  context.fillText(formatExpiry(card.expiry), 61 * UNIT, 54 * UNIT)

  paintNetwork(context, card.network, 52 * UNIT)
}

export function getCardFaceKey(card: BankCardFace): string {
  return JSON.stringify([
    card.id,
    card.bankName,
    card.productName,
    card.holderName,
    card.last4,
    card.expiry.month,
    card.expiry.year,
    card.network,
    card.status,
    card.theme,
    card.contactless,
  ])
}

export function drawCardFace(card: BankCardFace): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_FACE_WIDTH
  canvas.height = CARD_FACE_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is unavailable')

  context.save()
  context.beginPath()
  context.roundRect(0, 0, CARD_FACE_WIDTH, CARD_FACE_HEIGHT, CARD_FACE_RADIUS * CARD_FACE_HEIGHT)
  context.clip()
  paintSurface(context, card)
  context.restore()
  paintContent(context, card)

  return canvas
}
