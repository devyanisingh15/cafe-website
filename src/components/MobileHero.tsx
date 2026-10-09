import { useCallback, useEffect, useRef, useState } from 'react'
import { cafe, journeyIdleEnd, journeyKeyframes } from '../data/cafe'
import { useScrollVideo } from '../hooks/useScrollVideo'
import { prefersLightData, prefersReducedMotion, stillSrc, stillSrcSet } from '../lib/media'
import { CinematicTransition, JourneyStills, type CinematicHandle } from './CinematicTransition'
import { HeroVideo } from './HeroVideo'

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

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
 * The opening: a tall section whose scroll range flies the camera from the
 * clouds to a seat inside the café. The stage is sticky; normal browser
 * scrolling drives everything — no gesture hijacking.
 */
export function MobileHero() {
  const [still] = useState(() => prefersReducedMotion() || prefersLightData())
  return still ? <StaticHero /> : <JourneyHero />
}

function JourneyHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLButtonElement>(null)
  const cineRef = useRef<CinematicHandle>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onFrame = useCallback((p: number) => {
    const o = clamp01(1 - (p - 0.004) / 0.05)
    const copy = copyRef.current
    if (copy) {
      copy.style.opacity = String(o)
      copy.style.transform = `translate3d(0, ${(-Math.min(p, 0.1) * 900).toFixed(1)}px, 0)`
      copy.style.filter = o > 0.98 ? 'none' : `blur(${((1 - o) * 6).toFixed(1)}px)`
      copy.style.visibility = o > 0 ? 'visible' : 'hidden'
    }
    if (cueRef.current) {
      const c = clamp01(1 - p / 0.015)
      cueRef.current.style.opacity = String(c)
      cueRef.current.style.pointerEvents = c > 0.5 ? 'auto' : 'none'
    }
    // A slow push-in on top of the footage: the camera keeps moving forward.
    stageRef.current?.style.setProperty('--push', (1 + p * 0.06).toFixed(4))
    cineRef.current?.update(p)
  }, [])

  const { ready } = useScrollVideo({
    sectionRef,
    videoRef,
    keyframes: journeyKeyframes,
    idleEnd: journeyIdleEnd,
    enabled: true,
    onFrame,
  })

  // Desktop only: an ambient wash sampled from the current frame, and a
  // whisper of mouse parallax. Neither exists on touch devices.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    const video = videoRef.current
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!mq.matches || !video || !canvas || !stage) return
    const ctx = canvas.getContext('2d')
    const draw = () => ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
    video.addEventListener('seeked', draw)
    video.addEventListener('timeupdate', draw)
    video.addEventListener('loadeddata', draw)

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
      video.removeEventListener('seeked', draw)
      video.removeEventListener('timeupdate', draw)
      video.removeEventListener('loadeddata', draw)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const explore = () => {
    window.scrollBy({ top: window.innerHeight * 1.1, behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} className="journey" aria-label="Arriving at the café">
      <div className="journey__stage" ref={stageRef}>
        <canvas className="journey__ambient" ref={canvasRef} width={36} height={44} aria-hidden="true" />
        <div className="journey__frame">
          <HeroVideo ref={videoRef} ready={ready} />
        </div>
        <div className="journey__shade" aria-hidden="true" />
        <div className="hero-copy" ref={copyRef}>
          <HeroCopy />
        </div>
        <CinematicTransition ref={cineRef} />
        <button type="button" className="explore-cue" ref={cueRef} onClick={explore}>
          <span className="explore-cue__arrow" aria-hidden="true" />
          Explore
        </button>
      </div>
    </section>
  )
}

function StaticHero() {
  return (
    <>
      <section className="static-hero" aria-label="Welcome">
        <img
          className="static-hero__img"
          src={stillSrc('clouds')}
          srcSet={stillSrcSet('clouds')}
          sizes="100vw"
          alt="Clouds pouring over a mountain ridge above the valley"
          fetchPriority="high"
          width={504}
          height={624}
        />
        <div className="journey__shade" aria-hidden="true" />
        <div className="hero-copy">
          <HeroCopy />
        </div>
        <a className="explore-cue" href="#arrive">
          <span className="explore-cue__arrow" aria-hidden="true" />
          Explore
        </a>
      </section>
      <JourneyStills />
    </>
  )
}
