export interface ShardBuffers {
  positions: Float32Array
  normals: Float32Array
  uvs: Float32Array
  centers: Float32Array
  seeds: Float32Array
  rims: Float32Array
  sides: Float32Array
}

interface Point {
  x: number
  y: number
}

const THICKNESS = 0.012
const CORNER_STEPS = 6
const MIN_SHARD_AREA = 0.00001

function createRoundedRect(halfWidth: number, halfHeight: number, radius: number): Point[] {
  const corners = [
    { x: halfWidth - radius, y: -halfHeight + radius, start: -Math.PI / 2 },
    { x: halfWidth - radius, y: halfHeight - radius, start: 0 },
    { x: -halfWidth + radius, y: halfHeight - radius, start: Math.PI / 2 },
    { x: -halfWidth + radius, y: -halfHeight + radius, start: Math.PI },
  ]
  const polygon: Point[] = []
  for (const corner of corners) {
    for (let step = 0; step <= CORNER_STEPS; step += 1) {
      const angle = corner.start + (Math.PI / 2) * (step / CORNER_STEPS)
      polygon.push({
        x: corner.x + Math.cos(angle) * radius,
        y: corner.y + Math.sin(angle) * radius,
      })
    }
  }
  return polygon
}

function createSites(count: number, width: number, height: number): Point[] {
  const columns = Math.max(Math.round(Math.sqrt((count * width) / height)), 2)
  const rows = Math.max(Math.round(count / columns), 2)
  const cellWidth = width / columns
  const cellHeight = height / rows
  const sites: Point[] = []

  const addSite = (column: number, row: number) => {
    sites.push({
      x: -width / 2 + (column + 0.04 + Math.random() * 0.92) * cellWidth,
      y: -height / 2 + (row + 0.04 + Math.random() * 0.92) * cellHeight,
    })
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (Math.random() < 0.84) addSite(column, row)
      if (Math.random() < 0.24) addSite(column, row)
    }
  }
  return sites
}

function clipPolygon(polygon: Point[], mid: Point, normal: Point): Point[] {
  const clipped: Point[] = []
  polygon.forEach((current, index) => {
    const next = polygon[(index + 1) % polygon.length] ?? current
    const currentSide = (current.x - mid.x) * normal.x + (current.y - mid.y) * normal.y
    const nextSide = (next.x - mid.x) * normal.x + (next.y - mid.y) * normal.y
    if (currentSide <= 0) clipped.push(current)
    if ((currentSide < 0 && nextSide > 0) || (currentSide > 0 && nextSide < 0)) {
      const amount = currentSide / (currentSide - nextSide)
      clipped.push({
        x: current.x + (next.x - current.x) * amount,
        y: current.y + (next.y - current.y) * amount,
      })
    }
  })
  return clipped
}

function getReach(polygon: Point[], site: Point): number {
  let reach = 0
  for (const point of polygon) {
    reach = Math.max(reach, Math.hypot(point.x - site.x, point.y - site.y))
  }
  return reach
}

function createCell(outline: Point[], site: Point, sites: Point[]): Point[] {
  let polygon = outline
  let reach = getReach(polygon, site)

  for (const other of sites) {
    if (other === site) continue
    const normal = { x: other.x - site.x, y: other.y - site.y }
    if (Math.hypot(normal.x, normal.y) / 2 > reach) continue
    const mid = { x: (site.x + other.x) / 2, y: (site.y + other.y) / 2 }
    polygon = clipPolygon(polygon, mid, normal)
    if (polygon.length < 3) return []
    reach = getReach(polygon, site)
  }
  return polygon
}

function getCentroid(polygon: Point[]) {
  let doubledArea = 0
  let x = 0
  let y = 0
  polygon.forEach((current, index) => {
    const next = polygon[(index + 1) % polygon.length] ?? current
    const cross = current.x * next.y - next.x * current.y
    doubledArea += cross
    x += (current.x + next.x) * cross
    y += (current.y + next.y) * cross
  })
  if (doubledArea === 0) return { x: 0, y: 0, area: 0 }
  return { x: x / (3 * doubledArea), y: y / (3 * doubledArea), area: Math.abs(doubledArea) / 2 }
}

export function fractureCard(
  shardCount: number,
  aspect: number,
  radiusInHeights: number,
): ShardBuffers {
  const width = 1
  const height = 1 / aspect
  const outline = createRoundedRect(width / 2, height / 2, radiusInHeights * height)
  const sites = createSites(shardCount, width, height)
  const halfThickness = THICKNESS / 2

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const centers: number[] = []
  const seeds: number[] = []
  const rims: number[] = []
  const sides: number[] = []

  for (const site of sites) {
    const polygon = createCell(outline, site, sites)
    if (polygon.length < 3) continue
    const centroid = getCentroid(polygon)
    if (centroid.area < MIN_SHARD_AREA) continue

    const seed = [Math.random(), Math.random(), Math.random(), Math.random()]
    const addVertex = (
      point: Point,
      z: number,
      normal: [number, number, number],
      rim: number,
      side: number,
    ) => {
      positions.push(point.x, point.y, z)
      normals.push(...normal)
      uvs.push(point.x / width + 0.5, point.y / height + 0.5)
      centers.push(centroid.x, centroid.y, 0)
      seeds.push(...seed)
      rims.push(rim)
      sides.push(side)
    }

    polygon.forEach((current, index) => {
      const next = polygon[(index + 1) % polygon.length] ?? current

      addVertex(centroid, halfThickness, [0, 0, 1], 0, 0)
      addVertex(current, halfThickness, [0, 0, 1], 1, 0)
      addVertex(next, halfThickness, [0, 0, 1], 1, 0)

      addVertex(centroid, -halfThickness, [0, 0, -1], 0, 0)
      addVertex(next, -halfThickness, [0, 0, -1], 1, 0)
      addVertex(current, -halfThickness, [0, 0, -1], 1, 0)

      const edgeX = next.x - current.x
      const edgeY = next.y - current.y
      const edgeLength = Math.hypot(edgeX, edgeY) || 1
      const outward: [number, number, number] = [edgeY / edgeLength, -edgeX / edgeLength, 0]

      addVertex(current, halfThickness, outward, 1, 1)
      addVertex(current, -halfThickness, outward, 1, 1)
      addVertex(next, -halfThickness, outward, 1, 1)
      addVertex(current, halfThickness, outward, 1, 1)
      addVertex(next, -halfThickness, outward, 1, 1)
      addVertex(next, halfThickness, outward, 1, 1)
    })
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    centers: new Float32Array(centers),
    seeds: new Float32Array(seeds),
    rims: new Float32Array(rims),
    sides: new Float32Array(sides),
  }
}
