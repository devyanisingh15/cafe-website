import type { Still } from '../data/cafe'

export function stillSrc(still: Still, w: 400 | 800 | 1200 = 800) {
  return `/media/${still}-${w}.webp`
}

export function stillSrcSet(still: Still) {
  return `/media/${still}-400.webp 400w, /media/${still}-800.webp 800w, /media/${still}-1200.webp 1200w`
}

export const journeySources = {
  mobile: '/media/journey-mobile.mp4',
  desktop: '/media/journey-desktop.mp4',
  mobileWebm: '/media/journey-mobile.webm',
  desktopWebm: '/media/journey-desktop.webm',
  poster: '/media/journey-poster.webp',
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** True on Data Saver / 2G — skip the journey video entirely. */
export function prefersLightData() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''))
}
