<script setup lang="ts">
import { useId } from 'vue'

const id = useId()
</script>

<template>
  <svg
    class="pointer-events-none block h-auto"
    viewBox="0 0 720 260"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`${id}-wall`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#060a12" />
        <stop offset="0.5" stop-color="#1b3250" />
        <stop offset="1" stop-color="#060a12" />
      </linearGradient>
      <linearGradient :id="`${id}-deck`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0a111d" />
        <stop offset="0.5" stop-color="#17294a" />
        <stop offset="1" stop-color="#0a111d" />
      </linearGradient>
      <radialGradient :id="`${id}-core`">
        <stop offset="0" stop-color="#7dd3fc" stop-opacity="0.95" />
        <stop offset="0.55" stop-color="#2563eb" stop-opacity="0.6" />
        <stop offset="1" stop-color="#0b1a30" stop-opacity="0" />
      </radialGradient>
      <radialGradient :id="`${id}-floor`">
        <stop offset="0" stop-color="#2563eb" stop-opacity="0.34" />
        <stop offset="1" stop-color="#2563eb" stop-opacity="0" />
      </radialGradient>
      <filter :id="`${id}-blur`" x="-20%" y="-80%" width="140%" height="260%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>

    <ellipse cx="360" cy="206" rx="352" ry="52" :fill="`url(#${id}-floor)`" />

    <path d="M40 150a320 62 0 0 0 640 0v34a320 62 0 0 1-640 0z" :fill="`url(#${id}-wall)`" />
    <ellipse cx="360" cy="150" rx="320" ry="62" :fill="`url(#${id}-deck)`" />
    <path
      d="M40 167a320 62 0 0 0 640 0"
      stroke="#38bdf8"
      stroke-width="5"
      :filter="`url(#${id}-blur)`"
    />
    <path d="M40 167a320 62 0 0 0 640 0" stroke="#7dd3fc" stroke-width="1.5" />

    <path d="M90 118a270 50 0 0 0 540 0v26a270 50 0 0 1-540 0z" :fill="`url(#${id}-wall)`" />
    <path
      d="M90 131a270 50 0 0 0 540 0"
      stroke="#070d18"
      stroke-width="22"
      stroke-dasharray="2 14"
    />
    <ellipse cx="360" cy="118" rx="270" ry="50" :fill="`url(#${id}-deck)`" />

    <path d="M140 92a220 40 0 0 0 440 0v18a220 40 0 0 1-440 0z" :fill="`url(#${id}-wall)`" />
    <ellipse cx="360" cy="92" rx="220" ry="40" :fill="`url(#${id}-deck)`" />
    <ellipse cx="360" cy="92" rx="200" ry="35" :fill="`url(#${id}-core)`" />
    <ellipse
      cx="360"
      cy="92"
      rx="168"
      ry="27"
      stroke="#38bdf8"
      stroke-width="6"
      :filter="`url(#${id}-blur)`"
    />
    <ellipse cx="360" cy="92" rx="168" ry="27" stroke="#bae6fd" stroke-width="1.5" />
    <ellipse cx="360" cy="92" rx="128" ry="19" fill="#061224" fill-opacity="0.62" />
  </svg>
</template>
