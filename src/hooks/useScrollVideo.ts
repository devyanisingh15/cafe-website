import { useEffect, useRef, useState, type RefObject } from 'react'

interface Options {
  /** The tall scroll section; its scroll range drives the camera. */
  sectionRef: RefObject<HTMLElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  /** [progress, seconds] pairs, ascending. */
  keyframes: ReadonlyArray<readonly [number, number]>
  /** Plays 0 → idleEnd once by itself when the page is at rest at the top. */
  idleEnd?: number
  /** False for reduced motion / data saver: no video is downloaded. */
  enabled: boolean
  /** Called every frame the progress or video time moves. Write styles here. */
  onFrame?: (progress: number) => void
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

export function mapProgress(p: number, kf: Options['keyframes']) {
  for (let i = 1; i < kf.length; i++) {
    const [p1, t1] = kf[i]
    if (p <= p1) {
      const [p0, t0] = kf[i - 1]
      return t0 + ((p - p0) / (p1 - p0 || 1)) * (t1 - t0)
    }
  }
  return kf[kf.length - 1][1]
}

/**
 * Scroll-scrubbed video, the "camera" of the journey.
 *
 * Loading: the <video> starts with preload="metadata" and a poster. The full
 * file is fetched (as a blob, so seeking never stalls on the network) only
 * once the page has loaded and gone idle, or on the first scroll/touch.
 *
 * Scrubbing: scroll progress → target time via keyframes; the shown time
 * eases toward the target (frame-rate independent), and a new seek is only
 * issued once the previous one has finished, so slow phones never queue up.
 */
export function useScrollVideo({ sectionRef, videoRef, keyframes, idleEnd = 0, enabled, onFrame }: Options) {
  const [ready, setReady] = useState(false)
  const progressRef = useRef(0)
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame

  // --- Progressive load --------------------------------------------------
  useEffect(() => {
    const video = videoRef.current
    if (!enabled || !video) return
    let cancelled = false
    let blobUrl: string | null = null

    const markReady = () => {
      if (cancelled) return
      setReady(true)
    }

    const start = async () => {
      detach()
      // Same choice the browser makes: first <source> whose media and type fit.
      const pick = [...video.querySelectorAll('source')].find(
        (s) => (!s.media || window.matchMedia(s.media).matches) && video.canPlayType(s.type) !== '',
      )
      const src = video.currentSrc || pick?.getAttribute('src')
      if (!src) return
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error(String(res.status))
        const blob = await res.blob()
        if (cancelled) return
        blobUrl = URL.createObjectURL(blob)
        const t = video.currentTime
        video.src = blobUrl
        video.currentTime = t
      } catch {
        // Fall back to normal progressive download.
        video.preload = 'auto'
        video.load()
      }
      if (video.readyState >= 2) markReady()
      else video.addEventListener('loadeddata', markReady, { once: true })
    }

    let idleId: number | undefined
    const kick = () => void start()
    const onLoad = () => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
      idleId = ric(kick, { timeout: 1500 }) as number
    }
    const detach = () => {
      window.removeEventListener('load', onLoad)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('touchstart', kick)
      if (idleId !== undefined) (window.cancelIdleCallback ?? window.clearTimeout)(idleId)
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
    window.addEventListener('scroll', kick, { once: true, passive: true })
    window.addEventListener('touchstart', kick, { once: true, passive: true })

    return () => {
      cancelled = true
      detach()
      video.removeEventListener('loadeddata', markReady)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [enabled, videoRef])

  // --- Scroll → progress → video time -----------------------------------
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const video = videoRef.current

    let raf = 0
    let running = false
    let last = performance.now()
    let shown = mapProgress(0, keyframes)
    let lastP = -1
    let idleDone = false

    const measure = () => {
      const rect = section.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      return range > 0 ? clamp01(-rect.top / range) : 0
    }

    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const p = measure()
      progressRef.current = p

      if (enabled && ready && video) {
        const atRest = p < 0.002
        if (atRest && !idleDone) {
          // Let the clouds drift: play the opening shot once, slowly.
          if (video.paused) {
            video.playbackRate = 0.5
            video.play().catch(() => {
              idleDone = true
            })
          }
          if (video.currentTime >= idleEnd - 0.05) {
            video.pause()
            idleDone = true
          }
          shown = Math.max(video.currentTime, 0)
        } else {
          if (!video.paused) video.pause()
          idleDone = true
          const target = mapProgress(p, keyframes)
          // ~90 ms time constant: smooth, but tracks a flick of the thumb.
          shown += (target - shown) * (1 - Math.exp(-dt / 90))
          if (Math.abs(target - shown) < 0.004) shown = target
          if (!video.seeking && Math.abs(video.currentTime - shown) > 1 / 60) {
            video.currentTime = shown
          }
        }
      }

      if (p !== lastP) {
        lastP = p
        onFrameRef.current?.(p)
      }
      if (running) raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stopLoop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    // Only animate while the journey is on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? startLoop() : stopLoop()))
    io.observe(section)
    onFrameRef.current?.(measure())

    return () => {
      io.disconnect()
      stopLoop()
    }
  }, [sectionRef, videoRef, keyframes, idleEnd, enabled, ready])

  return { ready, progressRef }
}
