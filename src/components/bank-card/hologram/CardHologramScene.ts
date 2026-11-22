import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  FrontSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import type { BankCardFace } from '@/types/card'
import { CARD_FACE_ASPECT, CARD_FACE_RADIUS, drawCardFace, getCardFaceKey } from './drawCardFace'
import { fractureCard } from './fractureCard'
import {
  beamFragmentShader,
  cardFragmentShader,
  debrisVertexShader,
  dustFragmentShader,
  mistFragmentShader,
  moteFragmentShader,
  moteVertexShader,
  shardFragmentShader,
  shardVertexShader,
  uvVertexShader,
} from './shaders'

export interface HologramLayout {
  width: number
  height: number
  cardCenterX: number
  cardCenterY: number
  cardWidth: number
  discCenterX: number
  discCenterY: number
  discWidth: number
  compact: boolean
}

interface FaceAsset {
  key: string
  texture: CanvasTexture
}

interface MorphState {
  progress: number
  from: FaceAsset
  to: FaceAsset
}

const FIELD_OF_VIEW = 30
const MORPH_SECONDS = 2.6
const QUEUED_SPEED = 2.2
const MAX_TILT = 9
const MOTE_COUNT = 150
const MIST_COUNT = 110
const DUST_PER_SHARD = 10
const HERO_POSE = { x: -16, y: -12, z: 14 }
const COMPACT_POSE = { x: -12, y: -9, z: 10 }

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

function smoothstep(start: number, end: number, value: number) {
  const x = clamp01((value - start) / (end - start))
  return x * x * (3 - 2 * x)
}

function createSeeds(count: number) {
  const seeds = new Float32Array(count * 4)
  for (let index = 0; index < seeds.length; index += 1) seeds[index] = Math.random()
  return seeds
}

function createPointGeometry(count: number) {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aSeed', new BufferAttribute(createSeeds(count), 4))
  return geometry
}

function setUniform(uniforms: ShaderMaterial['uniforms'], name: string, value: unknown) {
  const uniform = uniforms[name]
  if (uniform) uniform.value = value
}

export class CardHologramScene {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 1, 10000)
  private readonly cardGroup = new Group()
  private readonly faces = new Map<string, FaceAsset>()
  private readonly planeGeometry: PlaneGeometry
  private readonly planeMaterial: ShaderMaterial
  private readonly shardGeometry: BufferGeometry
  private readonly shardMaterial: ShaderMaterial
  private readonly shards: Mesh<BufferGeometry, ShaderMaterial>
  private readonly dustGeometry: BufferGeometry
  private readonly dustMaterial: ShaderMaterial
  private readonly dust: Points<BufferGeometry, ShaderMaterial>
  private readonly mistGeometry: BufferGeometry
  private readonly mistMaterial: ShaderMaterial
  private readonly mist: Points<BufferGeometry, ShaderMaterial>
  private readonly beamGeometry: PlaneGeometry
  private readonly beamMaterial: ShaderMaterial
  private readonly beam: Mesh<PlaneGeometry, ShaderMaterial>
  private readonly moteGeometry: BufferGeometry
  private readonly moteMaterial: ShaderMaterial
  private readonly motes: Points<BufferGeometry, ShaderMaterial>
  private readonly onMorphChange: (isMorphing: boolean) => void
  private readonly beamUniforms = {
    uTime: { value: 0 },
    uFlash: { value: 0 },
    uBottom: { value: 0.5 },
    uTop: { value: 1 },
  }
  private readonly faceUniforms = {
    uTime: { value: 0 },
    uAspect: { value: CARD_FACE_ASPECT },
    uRadius: { value: CARD_FACE_RADIUS },
  }
  private readonly debrisUniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uIntensity: { value: 0 },
    uCardHeight: { value: 1 / CARD_FACE_ASPECT },
    uCameraDistance: { value: 1000 },
  }

  private layout: HologramLayout | null = null
  private current: FaceAsset
  private morph: MorphState | null = null
  private queuedCard: BankCardFace | null = null
  private frameId = 0
  private lastFrame = 0
  private time = 0
  private hover = 0
  private hoverTarget = 0
  private tiltX = 0
  private tiltY = 0
  private tiltTargetX = 0
  private tiltTargetY = 0

  constructor(
    canvas: HTMLCanvasElement,
    card: BankCardFace,
    shardCount: number,
    onMorphChange: (isMorphing: boolean) => void,
  ) {
    this.onMorphChange = onMorphChange
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.current = this.getFace(card)

    this.beamGeometry = new PlaneGeometry(1, 1)
    this.beamGeometry.translate(0, 0.5, 0)
    this.beamMaterial = this.createGlowMaterial(
      uvVertexShader,
      beamFragmentShader,
      this.beamUniforms,
    )
    this.beam = new Mesh(this.beamGeometry, this.beamMaterial)
    this.beam.renderOrder = 0
    this.beam.frustumCulled = false
    this.scene.add(this.beam)

    this.moteGeometry = createPointGeometry(MOTE_COUNT)
    this.moteMaterial = this.createGlowMaterial(moteVertexShader, moteFragmentShader, {
      ...this.beamUniforms,
      uMoteSize: { value: 3 },
    })
    this.motes = new Points(this.moteGeometry, this.moteMaterial)
    this.motes.renderOrder = 1
    this.motes.frustumCulled = false
    this.scene.add(this.motes)

    this.planeGeometry = new PlaneGeometry(1, 1 / CARD_FACE_ASPECT)
    this.planeMaterial = new ShaderMaterial({
      vertexShader: uvVertexShader,
      fragmentShader: cardFragmentShader,
      uniforms: {
        ...this.faceUniforms,
        uMap: { value: this.current.texture },
        uOpacity: { value: 1 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
    })
    const plane = new Mesh(this.planeGeometry, this.planeMaterial)
    plane.renderOrder = 2
    plane.frustumCulled = false
    this.cardGroup.add(plane)

    this.mistGeometry = createPointGeometry(MIST_COUNT)
    this.mistMaterial = this.createGlowMaterial(debrisVertexShader, mistFragmentShader, {
      ...this.debrisUniforms,
      uSpread: { value: 0.2 },
      uPointScale: { value: 120 },
    })
    this.mist = new Points(this.mistGeometry, this.mistMaterial)
    this.mist.renderOrder = 3
    this.mist.frustumCulled = false
    this.mist.visible = false
    this.cardGroup.add(this.mist)

    const buffers = fractureCard(shardCount, CARD_FACE_ASPECT, CARD_FACE_RADIUS)
    this.shardGeometry = new BufferGeometry()
    this.shardGeometry.setAttribute('position', new BufferAttribute(buffers.positions, 3))
    this.shardGeometry.setAttribute('normal', new BufferAttribute(buffers.normals, 3))
    this.shardGeometry.setAttribute('uv', new BufferAttribute(buffers.uvs, 2))
    this.shardGeometry.setAttribute('aCenter', new BufferAttribute(buffers.centers, 3))
    this.shardGeometry.setAttribute('aSeed', new BufferAttribute(buffers.seeds, 4))
    this.shardGeometry.setAttribute('aRim', new BufferAttribute(buffers.rims, 1))
    this.shardGeometry.setAttribute('aSide', new BufferAttribute(buffers.sides, 1))
    this.shardMaterial = new ShaderMaterial({
      vertexShader: shardVertexShader,
      fragmentShader: shardFragmentShader,
      uniforms: {
        ...this.faceUniforms,
        uMorph: this.debrisUniforms.uMorph,
        uFrom: { value: this.current.texture },
        uTo: { value: this.current.texture },
        uCrack: { value: 0 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthTest: true,
      depthWrite: true,
      side: FrontSide,
    })
    this.shards = new Mesh(this.shardGeometry, this.shardMaterial)
    this.shards.renderOrder = 4
    this.shards.frustumCulled = false
    this.shards.visible = false
    this.cardGroup.add(this.shards)

    this.dustGeometry = createPointGeometry(shardCount * DUST_PER_SHARD)
    this.dustMaterial = this.createGlowMaterial(debrisVertexShader, dustFragmentShader, {
      ...this.debrisUniforms,
      uSpread: { value: 0.18 },
      uPointScale: { value: 2 },
    })
    this.dust = new Points(this.dustGeometry, this.dustMaterial)
    this.dust.renderOrder = 5
    this.dust.frustumCulled = false
    this.dust.visible = false
    this.cardGroup.add(this.dust)

    this.scene.add(this.cardGroup)
  }

  setLayout(layout: HologramLayout) {
    if (layout.width < 1 || layout.height < 1 || layout.cardWidth < 1) return
    this.layout = layout

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(layout.width, layout.height, false)

    const distance = layout.height / 2 / Math.tan(toRadians(FIELD_OF_VIEW / 2))
    this.camera.aspect = layout.width / layout.height
    this.camera.position.set(0, 0, distance)
    this.camera.near = distance * 0.05
    this.camera.far = distance * 4
    this.camera.updateProjectionMatrix()

    this.cardGroup.scale.setScalar(layout.cardWidth)

    const discX = layout.discCenterX - layout.width / 2
    const discY = layout.height / 2 - layout.discCenterY
    const cardY = layout.height / 2 - layout.cardCenterY
    const beamWidth = Math.max(layout.discWidth, layout.cardWidth * 1.05)
    const beamHeight = Math.max(cardY - discY, 1)
    this.beamUniforms.uBottom.value = layout.discWidth / beamWidth
    this.beamUniforms.uTop.value = (layout.cardWidth * 1.05) / beamWidth

    this.beam.position.set(discX, discY, -2)
    this.beam.scale.set(beamWidth, beamHeight, 1)
    this.motes.position.set(discX, discY, -1)
    this.motes.scale.set(beamWidth, beamHeight, 1)

    this.debrisUniforms.uCameraDistance.value = distance
    setUniform(this.moteMaterial.uniforms, 'uMoteSize', 2.6 * pixelRatio)
    setUniform(
      this.dustMaterial.uniforms,
      'uPointScale',
      Math.max(layout.cardWidth * 0.0044, 1.5) * pixelRatio,
    )
    setUniform(this.mistMaterial.uniforms, 'uPointScale', layout.cardWidth * 0.36 * pixelRatio)
  }

  setCard(card: BankCardFace) {
    const key = getCardFaceKey(card)
    if (this.morph) {
      this.queuedCard = key === this.morph.to.key ? null : card
      return
    }
    if (key !== this.current.key) this.beginMorph(card)
  }

  setPointer(x: number, y: number) {
    if (!this.layout) return
    const { cardCenterX, cardCenterY, cardWidth } = this.layout
    const cardHeight = cardWidth / CARD_FACE_ASPECT
    const offsetX = (x - cardCenterX) / cardWidth
    const offsetY = (y - cardCenterY) / cardHeight

    if (Math.abs(offsetX) > 0.62 || Math.abs(offsetY) > 0.72) {
      this.clearPointer()
      return
    }
    this.hoverTarget = 1
    this.tiltTargetX = Math.max(Math.min(offsetY * 2, 1), -1) * MAX_TILT
    this.tiltTargetY = Math.max(Math.min(offsetX * 2, 1), -1) * MAX_TILT
  }

  clearPointer() {
    this.hoverTarget = 0
    this.tiltTargetX = 0
    this.tiltTargetY = 0
  }

  start() {
    if (this.frameId) return
    this.lastFrame = performance.now()
    this.frameId = requestAnimationFrame(this.tick)
  }

  stop() {
    cancelAnimationFrame(this.frameId)
    this.frameId = 0
  }

  dispose() {
    this.stop()
    this.faces.forEach((face) => face.texture.dispose())
    this.faces.clear()
    this.planeGeometry.dispose()
    this.planeMaterial.dispose()
    this.shardGeometry.dispose()
    this.shardMaterial.dispose()
    this.dustGeometry.dispose()
    this.dustMaterial.dispose()
    this.mistGeometry.dispose()
    this.mistMaterial.dispose()
    this.beamGeometry.dispose()
    this.beamMaterial.dispose()
    this.moteGeometry.dispose()
    this.moteMaterial.dispose()
    this.renderer.dispose()
  }

  private createGlowMaterial(
    vertexShader: string,
    fragmentShader: string,
    uniforms: ShaderMaterial['uniforms'],
  ) {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  }

  private getFace(card: BankCardFace): FaceAsset {
    const key = getCardFaceKey(card)
    const cached = this.faces.get(key)
    if (cached) return cached

    const texture = new CanvasTexture(drawCardFace(card))
    texture.generateMipmaps = true
    texture.minFilter = LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const face = { key, texture }
    this.faces.set(key, face)
    return face
  }

  private setDebrisVisible(isVisible: boolean) {
    this.shards.visible = isVisible
    this.dust.visible = isVisible
    this.mist.visible = isVisible
  }

  private beginMorph(card: BankCardFace) {
    const to = this.getFace(card)
    setUniform(this.shardMaterial.uniforms, 'uFrom', this.current.texture)
    setUniform(this.shardMaterial.uniforms, 'uTo', to.texture)
    this.morph = { progress: 0, from: this.current, to }
    this.setDebrisVisible(true)
    this.onMorphChange(true)
  }

  private finishMorph(to: FaceAsset) {
    this.current = to
    this.morph = null
    this.setDebrisVisible(false)
    this.debrisUniforms.uMorph.value = 0
    this.debrisUniforms.uIntensity.value = 0
    setUniform(this.shardMaterial.uniforms, 'uOpacity', 0)
    setUniform(this.shardMaterial.uniforms, 'uCrack', 0)
    setUniform(this.planeMaterial.uniforms, 'uMap', to.texture)
    setUniform(this.planeMaterial.uniforms, 'uOpacity', 1)
    this.beamUniforms.uFlash.value = 0

    const queued = this.queuedCard
    this.queuedCard = null
    if (queued) this.setCard(queued)
    if (!this.morph) this.onMorphChange(false)
  }

  private updateMorph(deltaSeconds: number) {
    if (!this.morph) return
    const speed = this.queuedCard ? QUEUED_SPEED : 1
    this.morph.progress = clamp01(this.morph.progress + (deltaSeconds * speed) / MORPH_SECONDS)
    const { progress, from, to } = this.morph

    if (progress >= 1) {
      this.finishMorph(to)
      return
    }

    const planeOpacity = 1 - smoothstep(0, 0.035, progress) + smoothstep(0.965, 1, progress)
    setUniform(this.planeMaterial.uniforms, 'uMap', progress < 0.5 ? from.texture : to.texture)
    setUniform(this.planeMaterial.uniforms, 'uOpacity', planeOpacity)

    const shardUniforms = this.shardMaterial.uniforms
    setUniform(
      shardUniforms,
      'uOpacity',
      smoothstep(0, 0.03, progress) * (1 - smoothstep(0.97, 1, progress)),
    )
    setUniform(
      shardUniforms,
      'uCrack',
      smoothstep(0, 0.05, progress) * (1 - smoothstep(0.8, 0.97, progress)),
    )

    const wave = Math.sin(Math.PI * progress)
    this.debrisUniforms.uMorph.value = clamp01((progress - 0.02) / 0.96)
    this.debrisUniforms.uIntensity.value = Math.sqrt(wave)
    this.beamUniforms.uFlash.value = wave
  }

  private updateCardTransform(deltaSeconds: number) {
    if (!this.layout) return
    const easing = 1 - Math.exp(-deltaSeconds * 8)
    this.hover += (this.hoverTarget - this.hover) * easing
    this.tiltX += (this.tiltTargetX - this.tiltX) * easing
    this.tiltY += (this.tiltTargetY - this.tiltY) * easing

    const { width, height, cardCenterX, cardCenterY, cardWidth, compact } = this.layout
    const pose = compact ? COMPACT_POSE : HERO_POSE
    const rest = 1 - this.hover * 0.88
    this.cardGroup.rotation.set(
      toRadians(pose.x * rest + this.tiltX * this.hover),
      toRadians(pose.y * rest + this.tiltY * this.hover),
      toRadians(pose.z * rest),
    )
    this.cardGroup.position.set(
      cardCenterX - width / 2,
      height / 2 - cardCenterY + Math.sin(this.time * 1.14) * cardWidth * 0.02,
      0,
    )
  }

  private readonly tick = (now: number) => {
    this.frameId = requestAnimationFrame(this.tick)
    const deltaSeconds = Math.min((now - this.lastFrame) / 1000, 0.1)
    this.lastFrame = now
    this.time += deltaSeconds

    this.updateMorph(deltaSeconds)
    this.updateCardTransform(deltaSeconds)
    this.beamUniforms.uTime.value = this.time
    this.faceUniforms.uTime.value = this.time
    this.debrisUniforms.uTime.value = this.time
    this.renderer.render(this.scene, this.camera)
  }
}
