<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { BankCardFace } from '@/types/card'
import { getCardAccessibleLabel } from '@/utils/card'
import { CardHologramScene } from './hologram/CardHologramScene'
import { getCardFaceKey } from './hologram/drawCardFace'

const { card, anchor, podium } = defineProps<{
  card: BankCardFace
  anchor: HTMLElement
  podium: SVGSVGElement
}>()

const emit = defineEmits<{ ready: []; unavailable: [] }>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const isMorphing = ref(false)
const accessibleLabel = computed(() => getCardAccessibleLabel(card))

let scene: CardHologramScene | null = null
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

const isCompact = () => window.matchMedia('(max-width: 48rem)').matches

function getShardCount() {
  const base = isCompact() ? 220 : 420
  return (navigator.hardwareConcurrency ?? 8) <= 4 ? Math.round(base * 0.7) : base
}

function measure() {
  const element = canvas.value
  if (!element || !scene) return
  const canvasRect = element.getBoundingClientRect()
  const podiumRect = podium.getBoundingClientRect()
  scene.setLayout({
    width: canvasRect.width,
    height: canvasRect.height,
    cardCenterX: anchor.offsetLeft + anchor.offsetWidth / 2,
    cardCenterY: anchor.offsetTop + anchor.offsetHeight / 2,
    cardWidth: anchor.offsetWidth,
    discCenterX: podiumRect.left - canvasRect.left + podiumRect.width / 2,
    discCenterY: podiumRect.top - canvasRect.top + (podiumRect.height * 92) / 260,
    discWidth: (podiumRect.width * 336) / 720,
    compact: isCompact(),
  })
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch' || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  scene?.setPointer(event.clientX - rect.left, event.clientY - rect.top)
}

function handlePointerLeave() {
  scene?.clearPointer()
}

function handleContextLost(event: Event) {
  event.preventDefault()
  emit('unavailable')
}

onMounted(() => {
  const element = canvas.value
  if (!element) return

  try {
    scene = new CardHologramScene(element, card, getShardCount(), (morphing) => {
      isMorphing.value = morphing
    })
  } catch {
    emit('unavailable')
    return
  }

  element.addEventListener('webglcontextlost', handleContextLost)
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(element)
  intersectionObserver = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) scene?.start()
    else scene?.stop()
  })
  intersectionObserver.observe(element)
  scene.start()
  emit('ready')
})

watch(
  () => getCardFaceKey(card),
  () => scene?.setCard(card),
)

onBeforeUnmount(() => {
  canvas.value?.removeEventListener('webglcontextlost', handleContextLost)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  scene?.dispose()
  scene = null
})
</script>

<template>
  <canvas
    ref="canvas"
    class="block size-full touch-pan-y"
    role="img"
    :aria-label="accessibleLabel"
    :data-morphing="isMorphing ? '' : undefined"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  />
</template>
