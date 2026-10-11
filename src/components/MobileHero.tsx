import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cafe, flightTitleOut } from '../data/cafe'
import { useDroneFlight } from '../hooks/useDroneFlight'
import { prefersLightData, prefersReducedMotion } from '../lib/media'
import { CinematicTransition, type CinematicHandle } from './CinematicTransition'
import { HeroMenu } from './HeroMenu'
import { HeroVideo } from './HeroVideo'

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

/** Lets the page's "Skip the intro" link land the flight from outside. */
export const SKIP_FLIGHT_EVENT = 'havana:skip-flight'

function HeroCopy() {
  return (
    <>
      <p className="kicker hero-copy__kicker reveal-line" style={{ '--i': 0 } as React.CSSProperties}>
        {cafe.place} · {cafe.altitude}
      </p>
      <h1 className="hero-copy__title">
        <span className="reveal-line" style={{ '--i': 1 } as React.CSSProperties}>
          {cafe.name}
        </span>
      </h1>
      <p className="hero-copy__tagline">
        {cafe.tagline.map((l, i) => (
          <span key={l} className="reveal-line" style={{ '--i': i + 2 } as React.CSSProperties}>
            {l}
          </span>
        ))}
      </p>
    </>
  )
}

/**
 * The opening: one continuous drone flight that plays by itself — over the
 * mountains, down to the village, at the café's glass front, through the
 * door, and a slow tilt down to the window wall where the camera settles.
 * Only then does the menu rise into the frame.
 *
 * Reduced motion / Data Saver: no film; the hero opens already landed, on
 * the settled interior frame, with the menu in place.
 */
export function MobileHero() {
  const [enabled] = useState(() => !(prefersReducedMotion() || prefersLightData()))

  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const cineRef = useRef<CinematicHandle>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const skipped = useRef(false)
  const lastAmbient = useRef(0)

  const onTime = useCallback((t: number, duration: number) => {
    // The opening title holds over the mountains, then lifts away as the camera dives.
    const o = clamp01((flightTitleOut - t) / 0.7)
    const copy = copyRef.current
    if (copy) {
      copy.style.opacity = String(o)
      copy.style.transform = `translate3d(0, ${(-(1 - o) * 40).toFixed(1)}px, 0)`
      copy.style.filter = o > 0.98 ? 'none' : `blur(${((1 - o) * 6).toFixed(1)}px)`
      // Opacity only (never visibility): the <h1> stays in the accessibility tree.
    }
    cineRef.current?.update(t, duration)

    // Desktop ambient wash: sample the frame a few times a second.
    const canvas = canvasRef.current
    const now = performance.now()
    if (canvas && canvas.offsetParent && now - lastAmbient.current > 150 && videoRef.current) {
      lastAmbient.current = now
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    }
  }, [])

  const { phase, skip, play } = useDroneFlight({ videoRef, stageRef, enabled, onTime })
  const arrived = phase === 'arrived'

  const skipToMenu = useCallback(() => {
    skipped.current = true
    skip()
  }, [skip])

  // A deliberate skip moves focus to the menu; a natural landing doesn't
  // steal it from wherever the guest is.
  useEffect(() => {
    if (arrived && skipped.current) headingRef.current?.focus({ preventScroll: true })
  }, [arrived])

  useEffect(() => {
    window.addEventListener(SKIP_FLIGHT_EVENT, skipToMenu)
    return () => window.removeEventListener(SKIP_FLIGHT_EVENT, skipToMenu)
  }, [skipToMenu])

  // Let the rest of the page (e.g. the nav's Order button) know where we
  // are — before first paint, so nothing flashes.
  useLayoutEffect(() => {
    document.documentElement.dataset.flight = phase
    return () => {
      delete document.documentElement.dataset.flight
    }
  }, [phase])

  // Desktop only: a whisper of mouse parallax on the framed film.
  useEffect(() => {
    const stage = stageRef.current
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    if (!stage || !mq.matches || !enabled) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        stage.style.setProperty('--mx', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3))
        stage.style.setProperty('--my', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  return (
    <section className="flight" data-phase={phase} data-film={enabled || undefined} aria-label="Flying in to the café">
      <div className="flight__stage" ref={stageRef}>
        <canvas className="flight__ambient" ref={canvasRef} width={36} height={44} aria-hidden="true" />
        <div className="flight__frame">
          {enabled && <HeroVideo ref={videoRef} visible={phase === 'playing' || arrived} />}
          {/* The settled frame. Identical to the film's last frame, so the hand-off is invisible. */}
          <img
            className="flight__end"
            src="/media/journey-end-800.webp"
            srcSet="/media/journey-end-400.webp 400w, /media/journey-end-800.webp 800w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Inside the café: blue booths and wooden chairs facing a wall of windows and snow peaks"
            width={756}
            height={936}
            decoding="async"
            loading={enabled ? 'lazy' : 'eager'}
            fetchPriority={enabled ? 'low' : 'high'}
          />
        </div>
        <div className="flight__shade" aria-hidden="true" />
        <div className="flight__veil" aria-hidden="true" />

        <div className="hero-copy" ref={copyRef}>
          <HeroCopy />
        </div>

        {enabled && <CinematicTransition ref={cineRef} />}

        {!arrived && (
          <div className="flight__controls">
            {phase === 'blocked' && (
              <button type="button" className="btn btn--light flight__begin" onClick={play}>
                <span className="flight__play" aria-hidden="true" />
                Begin the flight
              </button>
            )}
            <button type="button" className="flight__skip" onClick={skipToMenu}>
              Skip intro
            </button>
          </div>
        )}

        <HeroMenu open={arrived} headingRef={headingRef} />
      </div>
    </section>
  )
}
