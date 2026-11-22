const hologramChunk = `
uniform float uTime;
uniform float uAspect;
uniform float uRadius;

float roundedBox(vec2 point, vec2 size, float radius) {
  vec2 q = abs(point) - size + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float edgeDistance(vec2 uv) {
  return roundedBox((uv - 0.5) * vec2(uAspect, 1.0), vec2(uAspect * 0.5, 0.5), uRadius);
}

vec3 hologramColor(vec3 face, vec2 uv, float distanceToEdge) {
  float scan = 0.94 + 0.06 * sin(uv.y * 520.0 - uTime * 5.0);
  float band = smoothstep(0.07, 0.0, abs(fract(uv.y - uTime * 0.16) - 0.5));
  float flicker = 0.98 + 0.02 * sin(uTime * 37.0) * sin(uTime * 13.0);
  float rim = smoothstep(-0.03, 0.0, distanceToEdge);
  vec3 tinted = mix(face, face * vec3(0.66, 0.98, 1.24) + vec3(0.012, 0.05, 0.09), 0.5);
  vec3 color = tinted * scan * flicker;
  color += vec3(0.25, 0.62, 0.98) * band * 0.1;
  color += vec3(0.36, 0.82, 1.0) * rim * 0.72;
  return color;
}

float hologramAlpha(vec3 face, float distanceToEdge) {
  float brightness = dot(face, vec3(0.299, 0.587, 0.114));
  float rim = smoothstep(-0.03, 0.0, distanceToEdge);
  return max(mix(0.74, 1.0, smoothstep(0.1, 0.55, brightness)), rim * 0.95);
}
`

const vortexChunk = `
const float PI = 3.14159265;
const float TAU = 6.2831853;

float launchDelay(float x, float seed) {
  return (0.5 - x) * 0.42 + seed * 0.12;
}

float flightProgress(float morph, float delay) {
  float time = clamp((morph - delay) / 0.46, 0.0, 1.0);
  return time * time * (3.0 - 2.0 * time);
}

float flightWeight(float progress) {
  return smoothstep(0.0, 0.2, progress) * (1.0 - smoothstep(0.8, 1.0, progress));
}

vec3 vortexCurve(float progress) {
  float angle = progress * TAU * 1.08 - 0.62;
  float radius = 0.5 + 0.11 * sin(PI * progress);
  return vec3(cos(angle) * radius * 1.04, sin(angle) * radius * 0.86, sin(angle + 0.9) * radius * 0.6);
}

vec3 turbulence(float progress, vec4 seed) {
  return vec3(
    sin(progress * 9.0 + seed.x * 6.28),
    sin(progress * 7.0 + seed.y * 6.28),
    sin(progress * 8.0 + seed.z * 6.28)
  );
}
`

export const uvVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const cardFragmentShader = `
${hologramChunk}
uniform sampler2D uMap;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  float distanceToEdge = edgeDistance(vUv);
  float shape = smoothstep(0.004, -0.004, distanceToEdge);
  if (shape <= 0.0) discard;

  vec3 face = texture2D(uMap, vUv).rgb;
  vec3 color = hologramColor(face, vUv, distanceToEdge);
  gl_FragColor = vec4(color, hologramAlpha(face, distanceToEdge) * shape * uOpacity);
}
`

export const shardVertexShader = `
${vortexChunk}
uniform float uMorph;
attribute vec3 aCenter;
attribute vec4 aSeed;
attribute float aRim;
attribute float aSide;
varying vec2 vUv;
varying vec3 vNormal;
varying float vRim;
varying float vSide;
varying float vFlight;
varying float vTarget;

mat3 rotationMatrix(vec3 axis, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  float t = 1.0 - c;
  return mat3(
    t * axis.x * axis.x + c, t * axis.x * axis.y + s * axis.z, t * axis.x * axis.z - s * axis.y,
    t * axis.x * axis.y - s * axis.z, t * axis.y * axis.y + c, t * axis.y * axis.z + s * axis.x,
    t * axis.x * axis.z + s * axis.y, t * axis.y * axis.z - s * axis.x, t * axis.z * axis.z + c
  );
}

void main() {
  float delay = launchDelay(aCenter.x, aSeed.x);
  float progress = flightProgress(uMorph, delay);
  float flight = flightWeight(progress);
  float arc = sin(PI * progress);

  vec3 tube = (aSeed.yzw - 0.5) * vec3(0.11, 0.11, 0.16) * (0.35 + arc);
  vec3 path = vortexCurve(progress) + tube + turbulence(progress, aSeed) * 0.028;
  vec3 center = mix(aCenter, path, flight);

  vec3 axis = normalize(aSeed.zxy - 0.5 + vec3(0.001, 0.002, 0.003));
  mat3 tumble = rotationMatrix(axis, flight * PI * (2.0 + aSeed.y * 4.0));
  float scale = mix(1.0, 0.56 + aSeed.w * 0.4, flight);
  vec3 moved = center + tumble * ((position - aCenter) * scale);

  vUv = uv;
  vNormal = normalize(normalMatrix * (tumble * normal));
  vRim = aRim;
  vSide = aSide;
  vFlight = flight;
  vTarget = step(0.5, progress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(moved, 1.0);
}
`

export const shardFragmentShader = `
${hologramChunk}
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uCrack;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vNormal;
varying float vRim;
varying float vSide;
varying float vFlight;
varying float vTarget;

void main() {
  vec3 face = vTarget > 0.5 ? texture2D(uTo, vUv).rgb : texture2D(uFrom, vUv).rgb;
  float distanceToEdge = edgeDistance(vUv);
  vec3 holo = hologramColor(face, vUv, distanceToEdge);

  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(vec3(-0.42, 0.68, 0.6));
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float glint = pow(diffuse, 18.0);
  float fresnel = pow(1.0 - abs(normal.z), 2.0);

  vec3 solid = mix(face, vec3(0.74, 0.87, 0.98), 0.46) * (0.42 + diffuse * 1.05);
  solid += vec3(0.5, 0.84, 1.0) * (glint * 0.6 + fresnel * 0.32);
  if (vSide > 0.5) solid = vec3(0.68, 0.88, 1.0) * (0.34 + diffuse * 0.95);
  solid += vec3(0.36, 0.8, 1.0) * smoothstep(0.74, 1.0, vRim) * 0.34;

  vec3 color = mix(holo, solid, vFlight);
  color += vec3(0.55, 0.92, 1.0) * smoothstep(0.88, 1.0, vRim) * uCrack * (1.0 - vFlight) * 0.85;

  float alpha = mix(hologramAlpha(face, distanceToEdge), 1.0, vFlight);
  gl_FragColor = vec4(color, alpha * uOpacity);
}
`

export const debrisVertexShader = `
${vortexChunk}
uniform float uMorph;
uniform float uCardHeight;
uniform float uSpread;
uniform float uPointScale;
uniform float uCameraDistance;
attribute vec4 aSeed;
varying float vAlpha;
varying float vSeed;

void main() {
  vec3 home = vec3(aSeed.x - 0.5, (aSeed.y - 0.5) * uCardHeight, 0.0);
  float delay = launchDelay(home.x, aSeed.z);
  float progress = flightProgress(uMorph, delay);
  float flight = flightWeight(progress);
  float arc = sin(PI * progress);

  vec3 tube = (aSeed.yzw - 0.5) * uSpread * (0.4 + arc);
  vec3 path = vortexCurve(progress) + tube + turbulence(progress, aSeed) * 0.05;
  vec4 viewPosition = modelViewMatrix * vec4(mix(home, path, flight), 1.0);

  vAlpha = flight;
  vSeed = aSeed.w;
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = uPointScale * (0.5 + aSeed.w) * (uCameraDistance / max(-viewPosition.z, 1.0));
}
`

export const dustFragmentShader = `
uniform float uIntensity;
varying float vAlpha;

void main() {
  float disc = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
  if (disc <= 0.0) discard;
  gl_FragColor = vec4(0.62, 0.9, 1.0, disc * vAlpha * uIntensity * 0.8);
}
`

export const mistFragmentShader = `
uniform float uTime;
uniform float uIntensity;
varying float vAlpha;
varying float vSeed;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float body = smoothstep(0.5, 0.04, length(point));
  if (body <= 0.0) discard;
  float wisps = 0.66 + 0.34 * sin((point.x + vSeed) * 9.0 + uTime) * sin((point.y - vSeed) * 7.0 - uTime * 0.7);
  gl_FragColor = vec4(0.12, 0.46, 0.92, body * wisps * vAlpha * uIntensity * 0.28);
}
`

export const beamFragmentShader = `
uniform float uTime;
uniform float uFlash;
uniform float uBottom;
uniform float uTop;
varying vec2 vUv;

void main() {
  float halfWidth = mix(uBottom, uTop, vUv.y) * 0.5;
  float offset = abs(vUv.x - 0.5);
  float body = smoothstep(halfWidth, halfWidth * 0.35, offset);
  float fade = pow(1.0 - vUv.y, 1.35) * smoothstep(0.0, 0.05, vUv.y);
  float streaks = 0.72 + 0.28 * sin(vUv.x * 92.0 + uTime * 0.8) * sin(vUv.x * 37.0 - uTime * 0.5);
  gl_FragColor = vec4(vec3(0.2, 0.62, 1.0), body * fade * streaks * (0.34 + uFlash * 0.4));
}
`

export const moteVertexShader = `
uniform float uTime;
uniform float uBottom;
uniform float uTop;
uniform float uMoteSize;
attribute vec4 aSeed;
varying float vAlpha;

void main() {
  float height = fract(aSeed.y + uTime * (0.05 + aSeed.z * 0.09));
  float width = mix(uBottom, uTop, height);
  float x = (aSeed.x - 0.5) * width * 0.9 + sin(uTime * 0.7 + aSeed.w * 6.28) * 0.012;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(x, height, 0.0, 1.0);
  gl_PointSize = uMoteSize * (0.6 + aSeed.w);
  vAlpha = sin(3.14159 * height) * (0.25 + aSeed.z * 0.55);
}
`

export const moteFragmentShader = `
varying float vAlpha;

void main() {
  float disc = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
  if (disc <= 0.0) discard;
  gl_FragColor = vec4(0.55, 0.88, 1.0, disc * vAlpha);
}
`
