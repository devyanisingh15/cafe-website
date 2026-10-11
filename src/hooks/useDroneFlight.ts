import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * loading  → poster on screen, film downloading
 * blocked  → the browser refused to autoplay (e.g. iOS Low Power Mode)
 * playing  → in flight (also while paused off-screen)
 * arrived  → the film has ended (or was skipped); the camera is settled
 */
export type FlightPhase = 'loading' | 'blocked' | 'playing' | 'arrived'

interface Options {
  videoRef: RefObject<HTMLVideoElement | null>
  /** Element whose visibility decides whether the film keeps playing. */
  stageRef: RefObject<HTMLElement | null>
  /** False for reduced motion / data saver: no film, straight to arrival. */
  enabled: boolean
  /** Called every animation frame while flying, with the film's time. */
  onTime?: (t: number, duration: number) => void
}

/**
 * Plays the drone film once, on its own, as soon as the hero loads.
 *
 * The whole file (1.6 MB on phones) is fetched before playback starts, so the
 * flight never stalls mid-air on a slow connection; the poster — the film's
 * first frame — holds the screen meanwhile. Playback pauses while the hero is
 * off-screen or the tab is hidden and resumes where it left off, so the guest
 * always sees the landing.
 */
// Coming back to "/" within the app (e.g. from the menu) lands straight away;
// a fresh load or refresh flies again.
let flownThisPageLoad = false

const isBlocked = (e: unknown) => e instanceof DOMException && e.name === 'NotAllowedError'

export function useDroneFlight({ videoRef, stageRef, enabled, onTime }: Options) {
  const [phase, setPhase] = useState<FlightPhase>(enabled && !flownThisPageLoad ? 'loading' : 'arrived')
  const fly = phase !== 'arrived'
  const phaseRef = useRef(phase)
  const visibleRef = useRef(true)
  phaseRef.current = phase
  const onTimeRef = useRef(onTime)
  onTimeRef.current = onTime

  const tryPlay = useCallback(() => {
    const video = videoRef.current
    if (!video || phaseRef.current === 'arrived') return
    const toPlaying = () => setPhase((p) => (p === 'arrived' ? p : 'playing'))
    // Off-screen (e.g. restored scroll position): wait; the observer resumes.
    if (!visibleRef.current || document.hidden) return toPlaying()
    video.play().then(toPlaying, (e) => {
      if (isBlocked(e)) setPhase((p) => (p === 'arrived' ? p : 'blocked'))
    })
  }, [videoRef])

  useEffect(() => {
    if (phase === 'arrived') flownThisPageLoad = true
  }, [phase])

  // Load the film, then take off.
  useEffect(() => {
    const video = videoRef.current
    if (!fly || !video) return
    const abort = new AbortController()
    let blobUrl: string | null = null

    // Same choice the browser makes: first <source> whose media and type fit.
    const source = [...video.querySelectorAll('source')].find(
      (s) => (!s.media || window.matchMedia(s.media).matches) && video.canPlayType(s.type) !== '',
    )
    const src = source?.getAttribute('src')
    if (!src) {
      setPhase('arrived')
      return
    }

    const start = () => {
      if (abort.signal.aborted) return
      if (video.readyState >= 3) tryPlay()
      else video.addEventListener('canplay', tryPlay, { once: true })
    }

    fetch(src, { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.blob()
      })
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob)
        video.src = blobUrl
        start()
      })
      .catch(() => {
        if (abort.signal.aborted) return
        // Fall back to streaming straight from the network.
        video.src = src
        start()
      })

    return () => {
      abort.abort()
      video.removeEventListener('canplay', tryPlay)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // Mount-only (`fly` is deliberately left out): landing must not tear down
    // the film that is still on screen as its last frame.
  }, [videoRef, tryPlay])

  // Land when the film ends — or if it can't play at all, so the guest is
  // never left on a poster with no way to the menu.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const land = () => setPhase('arrived')
    video.addEventListener('ended', land)
    video.addEventListener('error', land)
    return () => {
      video.removeEventListener('ended', land)
      video.removeEventListener('error', land)
    }
  }, [videoRef])

  // Drive overlays from the film's clock, only while it is actually playing.
  useEffect(() => {
    const video = videoRef.current
    if (phase !== 'playing' || !video) return
    let raf = 0
    const tick = () => {
      if (!video.paused) onTimeRef.current?.(video.currentTime, video.duration || 1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, videoRef])

  // Pause off-screen / in a background tab; resume on return.
  useEffect(() => {
    const video = videoRef.current
    const stage = stageRef.current
    if (!video || !stage) return
    const sync = () => {
      if (phaseRef.current !== 'playing') return
      if (visibleRef.current && !document.hidden) {
        if (video.paused && !video.ended && video.readyState >= 2)
          video.play().catch((e) => isBlocked(e) && setPhase('blocked'))
      } else if (!video.paused) {
        video.pause()
      }
    }
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting
        sync()
      },
      { threshold: 0.35 },
    )
    io.observe(stage)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [videoRef, stageRef, phase])

  /** Jump to the landing: last frame, menu revealed. */
  const skip = useCallback(() => {
    const video = videoRef.current
    if (video) video.pause()
    setPhase('arrived')
  }, [videoRef])

  return { phase, skip, play: tryPlay }
}
